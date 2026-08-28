import './contributor-chat.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const CHAT_POLL_MS=3_500;
const CHAT_RETRY_MS=7_500;
const HUB_POLL_MS=15_000;

type StoredSession={access_token?:string};
type ChatMode='user'|'admin';
type Message={id:string;sender_role:'contributor'|'admin';body:string;created_at:string};
type Application={id:string;topics:string;contribution_type:string;status:'new'|'reviewing'|'accepted'|'declined'|'completed';created_at:string};
type ActiveChat={applicationId:string;mode:ChatMode;title:string};

let activeChat:ActiveChat|null=null;
let chatPollTimer=0;
let chatLoadAbort:AbortController|null=null;
let chatLoadSequence=0;
let sendingChatKey='';
let lastSignature='';

let hubLoading=false;
let hubLoadedAt=0;
let hubApps:Application[]=[];
let hubRenderKey='';
let hubMountTimer=0;
let hubMountAttempts=0;
let hubPollTimer=0;

function token(){
  try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}
}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:string){return value.replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function statusLabel(status:Application['status']){return ({new:'Pending',reviewing:'Needs review',accepted:'Approved',declined:'Not approved',completed:'Completed'} as const)[status]}
function fmtTime(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
function chatKey(chat:ActiveChat){return `${chat.mode}:${chat.applicationId}`}
function sameChat(a:ActiveChat|null,b:ActiveChat){return Boolean(a&&chatKey(a)===chatKey(b))}
function isAbort(error:unknown){return error instanceof DOMException&&error.name==='AbortError'}

function authHeaders(){
  const access=token();
  return {'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,...(access?{Authorization:`Bearer ${access}`}:{})};
}

async function rpc<T>(name:string,body:Record<string,unknown>={},externalSignal?:AbortSignal):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const abortFromExternal=()=>controller.abort();
  if(externalSignal){
    if(externalSignal.aborted)controller.abort();
    else externalSignal.addEventListener('abort',abortFromExternal,{once:true});
  }
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
      method:'POST',headers:authHeaders(),body:JSON.stringify(body),signal:controller.signal
    });
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort',abortFromExternal);
  }
}

function clearChatPoll(){window.clearTimeout(chatPollTimer);chatPollTimer=0}
function clearHubPoll(){window.clearTimeout(hubPollTimer);hubPollTimer=0}
function clearMountRetry(){window.clearTimeout(hubMountTimer);hubMountTimer=0}
function cancelChatLoad(){chatLoadSequence+=1;chatLoadAbort?.abort();chatLoadAbort=null}

function closeChat(){
  activeChat=null;
  lastSignature='';
  clearChatPoll();
  cancelChatLoad();
  const modal=document.getElementById('ll-contributor-chat-modal');
  if(!modal)return;
  modal.classList.add('is-closing');
  window.setTimeout(()=>modal.remove(),220);
}

function chatShell(chat:ActiveChat){
  document.getElementById('ll-contributor-chat-modal')?.remove();
  const overlay=document.createElement('div');
  overlay.id='ll-contributor-chat-modal';
  overlay.className='ll-contributor-chat-overlay';
  overlay.innerHTML=`<section class="ll-contributor-chat" role="dialog" aria-modal="true" aria-label="Contributor live chat">
    <header class="ll-contributor-chat-head">
      <div class="ll-contributor-chat-brand"><span>LL</span><div><small>${chat.mode==='admin'?'CONTRIBUTOR CHAT':'LITLAB CHAT'}</small><h2>${esc(chat.title)}</h2></div></div>
      <div class="ll-contributor-chat-head-actions"><span class="ll-chat-live" data-chat-live><i></i><span>Live</span></span><button type="button" data-chat-close aria-label="Close chat">×</button></div>
    </header>
    <p class="ll-contributor-chat-private">${chat.mode==='admin'?'Private thread with this contributor.':'Private thread between you and the LitLab team.'} Messages refresh automatically and stay attached to this contribution.</p>
    <div class="ll-contributor-chat-messages" data-chat-messages><div class="ll-chat-loading"><span></span>Loading conversation…</div></div>
    <form class="ll-contributor-chat-compose" data-chat-form>
      <textarea name="message" maxlength="4000" rows="3" placeholder="Write a message…" aria-label="Chat message"></textarea>
      <div><small>Ctrl/⌘ + Enter to send</small><button type="submit">Send message</button></div>
    </form>
    <p class="ll-contributor-chat-error" data-chat-error role="status" aria-live="polite"></p>
  </section>`;
  document.body.appendChild(overlay);
  updateConnectionState();
  requestAnimationFrame(()=>overlay.classList.add('is-open'));

  overlay.addEventListener('click',event=>{if(event.target===overlay)closeChat()});
  overlay.querySelector<HTMLButtonElement>('[data-chat-close]')?.addEventListener('click',closeChat);
  const form=overlay.querySelector<HTMLFormElement>('[data-chat-form]');
  form?.addEventListener('submit',event=>{event.preventDefault();void sendMessage()});
  const textarea=form?.querySelector<HTMLTextAreaElement>('textarea');
  textarea?.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){
      event.preventDefault();
      void sendMessage();
    }
  });
  textarea?.focus();
}

function updateConnectionState(){
  const live=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-live]');
  if(!live)return;
  live.classList.toggle('is-offline',!navigator.onLine);
  const text=live.querySelector('span');
  if(text)text.textContent=navigator.onLine?'Live':'Offline';
}

function renderMessages(messages:Message[],chat:ActiveChat){
  if(!sameChat(activeChat,chat))return;
  const container=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-messages]');
  if(!container)return;
  const signature=messages.map(message=>`${message.id}:${message.created_at}:${message.body}`).join('|');
  if(signature===lastSignature)return;
  const wasNearBottom=container.scrollHeight-container.scrollTop-container.clientHeight<90||!lastSignature;
  lastSignature=signature;
  const myRole=chat.mode==='admin'?'admin':'contributor';
  container.innerHTML=messages.length?messages.map(message=>{
    const mine=message.sender_role===myRole;
    return `<article class="ll-chat-bubble ${mine?'mine':'theirs'}"><span>${esc(mine?'You':message.sender_role==='admin'?'LitLab':'Contributor')}</span><p>${esc(message.body)}</p><time>${esc(fmtTime(message.created_at))}</time></article>`;
  }).join(''):`<div class="ll-chat-empty"><span>✦</span><h3>No messages yet.</h3><p>Start the conversation here. Replies will appear automatically while this chat is open.</p></div>`;
  if(wasNearBottom)requestAnimationFrame(()=>{if(container.isConnected)container.scrollTop=container.scrollHeight});
}

function scheduleChatPoll(delay=CHAT_POLL_MS){
  clearChatPoll();
  const chat=activeChat;
  if(!chat)return;
  chatPollTimer=window.setTimeout(async()=>{
    let nextDelay=CHAT_POLL_MS;
    if(activeChat&&sameChat(activeChat,chat)&&!document.hidden&&navigator.onLine){
      const ok=await loadMessages();
      if(!ok)nextDelay=CHAT_RETRY_MS;
    }
    if(activeChat&&sameChat(activeChat,chat))scheduleChatPoll(nextDelay);
  },delay);
}

async function loadMessages(force=false){
  const chat=activeChat;
  if(!chat||!token())return false;

  // A forced load (opening/switching/focus/reconnect) cancels an older refresh so
  // the newly selected conversation never waits behind a stale request.
  if(force)cancelChatLoad();
  else if(chatLoadAbort)return true;

  const sequence=++chatLoadSequence;
  const controller=new AbortController();
  chatLoadAbort=controller;
  const error=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-error]');
  if(force&&error)error.textContent='';

  try{
    const name=chat.mode==='admin'?'admin_get_litlab_contributor_messages':'get_my_litlab_contributor_messages';
    const rows=await rpc<Message[]>(name,{p_application_id:chat.applicationId},controller.signal);
    if(sequence!==chatLoadSequence||!sameChat(activeChat,chat))return true;
    renderMessages(Array.isArray(rows)?rows:[],chat);
    if(error?.isConnected)error.textContent='';
    return true;
  }catch(err){
    if(isAbort(err)||sequence!==chatLoadSequence||!sameChat(activeChat,chat))return true;
    console.error(err);
    if(error?.isConnected)error.textContent=navigator.onLine?'Could not refresh this chat. It will retry automatically.':'You are offline. Messages will refresh automatically when your connection returns.';
    return false;
  }finally{
    if(sequence===chatLoadSequence)chatLoadAbort=null;
  }
}

async function sendMessage(){
  const chat=activeChat;
  if(!chat)return;
  const key=chatKey(chat);
  if(sendingChatKey===key)return;

  const form=document.querySelector<HTMLFormElement>('#ll-contributor-chat-modal [data-chat-form]');
  const textarea=form?.querySelector<HTMLTextAreaElement>('textarea');
  const button=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const error=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-error]');
  const body=textarea?.value.trim()||'';
  if(!body){textarea?.focus();return}
  if(!navigator.onLine){if(error)error.textContent='You are offline. Reconnect before sending.';return}

  sendingChatKey=key;
  if(button){button.disabled=true;button.textContent='Sending…'}
  if(error)error.textContent='';
  try{
    const name=chat.mode==='admin'?'admin_send_litlab_contributor_message':'send_my_litlab_contributor_message';
    await rpc<Message>(name,{p_application_id:chat.applicationId,p_body:body});
    if(!sameChat(activeChat,chat))return;
    if(textarea)textarea.value='';
    lastSignature='';
    await loadMessages(true);
    textarea?.focus();
    scheduleChatPoll();
  }catch(err){
    console.error(err);
    if(error?.isConnected&&sameChat(activeChat,chat))error.textContent=navigator.onLine?'Message could not be sent. Please try again.':'You are offline. Reconnect before sending.';
  }finally{
    if(sendingChatKey===key)sendingChatKey='';
    if(button?.isConnected&&sameChat(activeChat,chat)){button.disabled=false;button.textContent='Send message'}
  }
}

function openChat(applicationId:string,mode:ChatMode,title:string){
  if(!token())return;
  clearChatPoll();
  cancelChatLoad();
  activeChat={applicationId,mode,title:title||'Contributor conversation'};
  lastSignature='';
  chatShell(activeChat);
  void loadMessages(true).finally(()=>scheduleChatPoll());
}

function userHubRoot(){return document.querySelector<HTMLElement>('[data-contributor-chat-hub]')}
function mountUserHub(){
  if(route()!=='contribute')return null;
  let hub=userHubRoot();
  if(hub)return hub;
  const page=document.querySelector<HTMLElement>('.ll-contrib-page');
  const history=document.querySelector<HTMLElement>('[data-my-contributions]');
  const apply=page?.querySelector<HTMLElement>('#contribute-apply');
  if(!page||!apply)return null;
  hub=document.createElement('section');
  hub.className='ll-contrib-section ll-contributor-chat-hub';
  hub.dataset.contributorChatHub='true';
  if(history?.nextSibling)history.parentElement?.insertBefore(hub,history.nextSibling);
  else apply.before(hub);
  return hub;
}

function setHubMarkup(key:string,markup:string){
  const hub=mountUserHub();
  if(!hub)return;
  if(hubRenderKey===key&&hub.dataset.renderKey===key)return;
  hubRenderKey=key;
  hub.dataset.renderKey=key;
  hub.innerHTML=markup;
}

function renderUserHub(){
  if(!token()){
    setHubMarkup('signed-out','<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2><p>Sign in to use contributor chat. Conversations are saved to your LitLab account.</p></div><div class="ll-chat-hub-empty">Sign in to view your contributor conversations.</div>');
    return;
  }
  const signature=hubApps.map(app=>`${app.id}:${app.status}:${app.topics}:${app.contribution_type}`).join('|');
  setHubMarkup(`apps:${signature}`,`<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2><p>Ask questions, receive feedback and discuss revisions with the LitLab team. This list and open chats refresh automatically.</p></div>
    ${hubApps.length?`<div class="ll-chat-thread-list">${hubApps.map(app=>`<button type="button" class="ll-chat-thread" data-chat-open data-chat-mode="user" data-application-id="${esc(app.id)}" data-chat-title="${esc(app.topics||'Contributor conversation')}"><div><span>${esc(label(app.contribution_type))}</span><b>${esc(app.topics||'Untitled contribution')}</b><small>${esc(statusLabel(app.status))}</small></div><i>Chat with LitLab →</i></button>`).join('')}</div>`:'<div class="ll-chat-hub-empty">Your contributor conversations will appear here after you submit an application.</div>'}`);
}

function scheduleHubMountRetry(force:boolean){
  if(route()!=='contribute'||hubMountAttempts>=20)return;
  clearMountRetry();
  hubMountAttempts+=1;
  hubMountTimer=window.setTimeout(()=>void loadUserHub(force,true),120);
}

function scheduleHubPoll(delay=HUB_POLL_MS){
  clearHubPoll();
  if(route()!=='contribute')return;
  hubPollTimer=window.setTimeout(async()=>{
    if(route()==='contribute'&&!document.hidden&&navigator.onLine)await loadUserHub(true,true);
    if(route()==='contribute')scheduleHubPoll();
  },delay);
}

async function loadUserHub(force=false,quiet=false){
  if(route()!=='contribute')return;
  if(!mountUserHub()){
    scheduleHubMountRetry(force);
    return;
  }
  hubMountAttempts=0;
  clearMountRetry();
  if(!token()){hubApps=[];hubLoadedAt=0;renderUserHub();return}
  if(hubLoading)return;
  if(!force&&hubLoadedAt&&Date.now()-hubLoadedAt<10_000){renderUserHub();return}
  hubLoading=true;
  if(!quiet&&!hubLoadedAt)setHubMarkup('loading','<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2></div><div class="ll-chat-hub-empty">Loading your contributor conversations…</div>');
  try{
    const rows=await rpc<Application[]>('get_my_litlab_contributor_applications');
    if(route()!=='contribute')return;
    hubApps=Array.isArray(rows)?rows:[];
    hubLoadedAt=Date.now();
    renderUserHub();
  }catch(err){
    console.error(err);
    if(!quiet||!hubLoadedAt)setHubMarkup('error',`<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2></div><div class="ll-chat-hub-empty">${navigator.onLine?'Chat could not load right now. It will retry automatically.':'You are offline. Chat will reconnect automatically.'}</div>`);
  }finally{
    hubLoading=false;
  }
}

function scheduleRouteWork(){
  clearMountRetry();
  clearHubPoll();
  hubMountAttempts=0;
  if(route()==='contribute'){
    hubLoadedAt=0;
    hubRenderKey='';
    window.setTimeout(()=>void loadUserHub(true),60);
    scheduleHubPoll();
  }
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest<HTMLElement>('[data-chat-open]'):null;
  if(!target)return;
  event.preventDefault();
  event.stopPropagation();
  const applicationId=target.dataset.applicationId||'';
  const mode=(target.dataset.chatMode==='admin'?'admin':'user') as ChatMode;
  if(applicationId)openChat(applicationId,mode,target.dataset.chatTitle||'Contributor conversation');
},true);

window.addEventListener('hashchange',()=>{closeChat();scheduleRouteWork()});
window.addEventListener('focus',()=>{
  if(activeChat){void loadMessages(true).finally(()=>scheduleChatPoll())}
  if(route()==='contribute'){void loadUserHub(true,true);scheduleHubPoll()}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearChatPoll();clearHubPoll();return}
  if(activeChat){void loadMessages(true).finally(()=>scheduleChatPoll())}
  if(route()==='contribute'){void loadUserHub(true,true);scheduleHubPoll()}
});
window.addEventListener('online',()=>{
  updateConnectionState();
  if(activeChat){void loadMessages(true).finally(()=>scheduleChatPoll(500))}
  if(route()==='contribute'){void loadUserHub(true,true);scheduleHubPoll()}
});
window.addEventListener('offline',()=>{
  updateConnectionState();
  clearChatPoll();
  clearHubPoll();
});
window.addEventListener('litlab:contributor-submitted',()=>{
  hubLoadedAt=0;hubRenderKey='';
  setTimeout(()=>void loadUserHub(true),300);
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRouteWork,{once:true});else scheduleRouteWork();
