import './contributor-chat.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type ChatMode='user'|'admin';
type Message={id:string;sender_role:'contributor'|'admin';body:string;created_at:string};
type Application={id:string;topics:string;contribution_type:string;status:'new'|'reviewing'|'accepted'|'declined'|'completed';created_at:string};

type ActiveChat={applicationId:string;mode:ChatMode;title:string};

let activeChat:ActiveChat|null=null;
let chatTimer=0;
let chatLoading=false;
let chatSending=false;
let lastSignature='';
let hubLoading=false;
let hubLoadedAt=0;
let hubApps:Application[]=[];
let hubRetry=0;

function token(){
  try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}
}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:string){return value.replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function statusLabel(status:Application['status']){return ({new:'Pending',reviewing:'Needs review',accepted:'Approved',declined:'Not approved',completed:'Completed'} as const)[status]}
function fmtTime(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}

function authHeaders(){
  const access=token();
  return {'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,...(access?{Authorization:`Bearer ${access}`}:{})};
}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:authHeaders(),body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

function closeChat(){
  activeChat=null;
  lastSignature='';
  window.clearInterval(chatTimer);
  chatTimer=0;
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
      <div class="ll-contributor-chat-head-actions"><span class="ll-chat-live"><i></i>Live</span><button type="button" data-chat-close aria-label="Close chat">×</button></div>
    </header>
    <p class="ll-contributor-chat-private">${chat.mode==='admin'?'Private thread with this contributor.':'Private thread between you and the LitLab team.'} Messages stay attached to this contribution.</p>
    <div class="ll-contributor-chat-messages" data-chat-messages><div class="ll-chat-loading"><span></span>Loading conversation…</div></div>
    <form class="ll-contributor-chat-compose" data-chat-form>
      <textarea name="message" maxlength="4000" rows="3" placeholder="Write a message…" aria-label="Chat message"></textarea>
      <div><small>Ctrl/⌘ + Enter to send</small><button type="submit">Send message</button></div>
    </form>
    <p class="ll-contributor-chat-error" data-chat-error role="status" aria-live="polite"></p>
  </section>`;
  document.body.appendChild(overlay);
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

function renderMessages(messages:Message[]){
  const container=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-messages]');
  if(!container||!activeChat)return;
  const signature=messages.map(message=>`${message.id}:${message.created_at}:${message.body}`).join('|');
  if(signature===lastSignature)return;
  const wasNearBottom=container.scrollHeight-container.scrollTop-container.clientHeight<90||!lastSignature;
  lastSignature=signature;
  const myRole=activeChat.mode==='admin'?'admin':'contributor';
  container.innerHTML=messages.length?messages.map(message=>{
    const mine=message.sender_role===myRole;
    return `<article class="ll-chat-bubble ${mine?'mine':'theirs'}"><span>${esc(mine?'You':message.sender_role==='admin'?'LitLab':'Contributor')}</span><p>${esc(message.body)}</p><time>${esc(fmtTime(message.created_at))}</time></article>`;
  }).join(''):`<div class="ll-chat-empty"><span>✦</span><h3>No messages yet.</h3><p>Start the conversation here. Replies will appear automatically while this chat is open.</p></div>`;
  if(wasNearBottom)requestAnimationFrame(()=>{container.scrollTop=container.scrollHeight});
}

async function loadMessages(force=false){
  if(!activeChat||chatLoading||!token())return;
  chatLoading=true;
  const error=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-error]');
  if(force&&error)error.textContent='';
  try{
    const name=activeChat.mode==='admin'?'admin_get_litlab_contributor_messages':'get_my_litlab_contributor_messages';
    const rows=await rpc<Message[]>(name,{p_application_id:activeChat.applicationId});
    renderMessages(Array.isArray(rows)?rows:[]);
  }catch(err){
    console.error(err);
    if(error)error.textContent='Could not refresh this chat. Check your connection and try again.';
  }finally{chatLoading=false}
}

async function sendMessage(){
  if(!activeChat||chatSending)return;
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-chat-modal [data-chat-form]');
  const textarea=form?.querySelector<HTMLTextAreaElement>('textarea');
  const button=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const error=document.querySelector<HTMLElement>('#ll-contributor-chat-modal [data-chat-error]');
  const body=textarea?.value.trim()||'';
  if(!body){textarea?.focus();return}
  chatSending=true;
  if(button){button.disabled=true;button.textContent='Sending…'}
  if(error)error.textContent='';
  try{
    const name=activeChat.mode==='admin'?'admin_send_litlab_contributor_message':'send_my_litlab_contributor_message';
    await rpc<Message>(name,{p_application_id:activeChat.applicationId,p_body:body});
    if(textarea)textarea.value='';
    lastSignature='';
    await loadMessages(true);
    textarea?.focus();
  }catch(err){
    console.error(err);
    if(error)error.textContent='Message could not be sent. Please try again.';
  }finally{
    chatSending=false;
    if(button){button.disabled=false;button.textContent='Send message'}
  }
}

function openChat(applicationId:string,mode:ChatMode,title:string){
  if(!token())return;
  activeChat={applicationId,mode,title:title||'Contributor conversation'};
  lastSignature='';
  chatShell(activeChat);
  void loadMessages(true);
  window.clearInterval(chatTimer);
  chatTimer=window.setInterval(()=>{if(!document.hidden)void loadMessages()},3500);
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

function renderUserHub(){
  const hub=mountUserHub();
  if(!hub)return;
  if(!token()){
    hub.innerHTML='<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2><p>Sign in to use contributor chat. Conversations are saved to your LitLab account.</p></div><div class="ll-chat-hub-empty">Sign in to view your contributor conversations.</div>';
    return;
  }
  hub.innerHTML=`<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2><p>Ask questions, receive feedback and discuss revisions with the LitLab team. Chats stay attached to each contribution.</p></div>
    ${hubApps.length?`<div class="ll-chat-thread-list">${hubApps.map(app=>`<button type="button" class="ll-chat-thread" data-chat-open data-chat-mode="user" data-application-id="${esc(app.id)}" data-chat-title="${esc(app.topics||'Contributor conversation')}"><div><span>${esc(label(app.contribution_type))}</span><b>${esc(app.topics||'Untitled contribution')}</b><small>${esc(statusLabel(app.status))}</small></div><i>Chat with LitLab →</i></button>`).join('')}</div>`:'<div class="ll-chat-hub-empty">Your contributor conversations will appear here after you submit an application.</div>'}`;
}

async function loadUserHub(force=false){
  if(route()!=='contribute')return;
  if(!mountUserHub()){
    window.clearTimeout(hubRetry);
    hubRetry=window.setTimeout(()=>void loadUserHub(force),140);
    return;
  }
  if(!token()){hubApps=[];renderUserHub();return}
  if(hubLoading)return;
  if(!force&&hubLoadedAt&&Date.now()-hubLoadedAt<12000){renderUserHub();return}
  hubLoading=true;
  try{
    const rows=await rpc<Application[]>('get_my_litlab_contributor_applications');
    hubApps=Array.isArray(rows)?rows:[];
    hubLoadedAt=Date.now();
    renderUserHub();
  }catch(err){
    console.error(err);
    const hub=mountUserHub();
    if(hub)hub.innerHTML='<div class="ll-contrib-section-head"><span>Private messages</span><h2>Live chat with LitLab</h2></div><div class="ll-chat-hub-empty">Chat could not load right now. Reload the page and try again.</div>';
  }finally{hubLoading=false}
}

function scanAdminOpeners(){
  if(route()!=='admin-contributors')return;
  document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach(card=>{
    if(card.querySelector('[data-admin-contrib-chat-open]'))return;
    const id=card.dataset.appId||'';
    if(!id)return;
    const name=card.querySelector<HTMLElement>('.admin-contrib-person b')?.textContent?.trim()||'Contributor';
    const topic=card.querySelectorAll<HTMLElement>('.admin-contrib-detail.wide p')[0]?.textContent?.trim()||name;
    const strip=document.createElement('div');
    strip.className='admin-contrib-chat-strip';
    strip.innerHTML=`<div><span>PRIVATE CHAT</span><p>Message ${esc(name)} about feedback, revisions or next steps.</p></div><button type="button" data-admin-contrib-chat-open data-chat-open data-chat-mode="admin" data-application-id="${esc(id)}" data-chat-title="${esc(`${name} — ${topic}`)}">Open live chat</button>`;
    const grid=card.querySelector('.admin-contrib-detail-grid');
    grid?.before(strip);
  });
}

function scheduleRouteWork(){
  window.clearTimeout(hubRetry);
  if(route()==='contribute'){
    hubLoadedAt=0;
    window.setTimeout(()=>void loadUserHub(true),80);
  }
  if(route()==='admin-contributors'){
    [100,350,800,1500].forEach(delay=>window.setTimeout(scanAdminOpeners,delay));
  }
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest<HTMLElement>('[data-chat-open]'):null;
  if(target){
    event.preventDefault();
    event.stopPropagation();
    const applicationId=target.dataset.applicationId||'';
    const mode=(target.dataset.chatMode==='admin'?'admin':'user') as ChatMode;
    if(applicationId)openChat(applicationId,mode,target.dataset.chatTitle||'Contributor conversation');
    return;
  }
  const refresh=event.target instanceof Element?event.target.closest('[data-contrib-refresh]'):null;
  if(refresh)window.setTimeout(scanAdminOpeners,500);
},true);

document.addEventListener('input',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.matches('[data-contrib-search]'))window.setTimeout(scanAdminOpeners,30);
},true);
document.addEventListener('change',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.matches('[data-contrib-role-filter],[data-contrib-status-filter]'))window.setTimeout(scanAdminOpeners,30);
},true);

window.addEventListener('hashchange',()=>{closeChat();scheduleRouteWork()});
window.addEventListener('focus',()=>{if(activeChat)void loadMessages(true);if(route()==='contribute')void loadUserHub(true)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&activeChat)void loadMessages(true)});
window.addEventListener('litlab:contributor-submitted',()=>{hubLoadedAt=0;setTimeout(()=>void loadUserHub(true),450)});

window.setInterval(()=>{if(route()==='admin-contributors')scanAdminOpeners()},1800);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRouteWork,{once:true});else scheduleRouteWork();
