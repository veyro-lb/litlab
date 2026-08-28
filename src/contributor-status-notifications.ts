import './contributor-status-notifications.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SEEN_PREFIX='litlabContributorStatusSeen:';
const CHAT_SEEN_PREFIX='litlabContributorChatNoticeSeen:';
const REQUEST_TIMEOUT_MS=12_000;
const STATUS_POLL_MS=20_000;

type StoredSession={access_token?:string};
type ApplicationStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Application={id:string;created_at:string;status:ApplicationStatus;status_updated_at?:string|null;contribution_type:string;full_name:string};
type UnreadChatMessage={message_id:string;application_id:string;body:string;created_at:string;topics:string;contribution_type:string;status:ApplicationStatus};
type NoticeKind='status'|'chat'|null;

let latest:Application|null=null;
let latestUnread:UnreadChatMessage|null=null;
let unreadCount=0;
let noticeKind:NoticeKind=null;
let loading=false;
let lastLoad=0;
let pollTimer=0;
let developerAccess:boolean|null=null;

function session():StoredSession|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function token(){return session()?.access_token||''}
function signedIn(){return Boolean(token())}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function statusLabel(status:ApplicationStatus){return ({new:'Pending',reviewing:'Needs review',accepted:'Approved contributor',declined:'Not approved',completed:'Completed contributor'} as const)[status]}
function statusCopy(status:ApplicationStatus){
  if(status==='new')return 'Your application is waiting for review. If LitLab needs more information, we’ll contact you through your private contributor live chat.';
  if(status==='reviewing')return 'Your application needs review. Open your private live chat for questions, revision requests or details from the LitLab team.';
  if(status==='accepted')return 'Your contributor application has been accepted. Further instructions, feedback and next steps can be discussed in your private live chat.';
  if(status==='declined')return 'Your application was not accepted this time. If LitLab left feedback or an explanation, it remains available in your private live chat.';
  return 'Your contribution is marked completed. Your contribution history and any related live-chat discussion remain saved to your account.';
}
function revision(app:Application){return `${app.status}|${app.status_updated_at||app.created_at}`}
function seen(app:Application){try{return localStorage.getItem(`${SEEN_PREFIX}${app.id}`)===revision(app)}catch{return false}}
function markSeen(app:Application){try{localStorage.setItem(`${SEEN_PREFIX}${app.id}`,revision(app))}catch{}}
function changedAt(app:Application){const t=Date.parse(app.status_updated_at||app.created_at);return Number.isFinite(t)?t:0}
function chatSeenKey(){const access=token();return `${CHAT_SEEN_PREFIX}${access.slice(-18)}`}
function chatNoticeSeen(message:UnreadChatMessage){try{return sessionStorage.getItem(chatSeenKey())===message.message_id}catch{return false}}
function markChatNoticeSeen(message:UnreadChatMessage){try{sessionStorage.setItem(chatSeenKey(),message.message_id)}catch{}}
function preview(value:string){const text=value.trim().replace(/\s+/g,' ');return text.length>180?`${text.slice(0,177)}…`:text}

async function rpc<T>(name:string):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:'{}',signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function closeNotice(mark=true){
  const notice=document.getElementById('ll-contributor-status-notice');
  if(mark){
    if(noticeKind==='status'&&latest)markSeen(latest);
    if(noticeKind==='chat'&&latestUnread)markChatNoticeSeen(latestUnread);
  }
  noticeKind=null;
  if(!notice)return;
  notice.classList.remove('is-visible');
  notice.classList.add('is-closing');
  window.setTimeout(()=>notice.remove(),320);
}

function showStatusNotice(app:Application){
  if(developerAccess===true)return;
  latest=app;
  noticeKind='status';
  document.getElementById('ll-contributor-status-notice')?.remove();
  const notice=document.createElement('aside');
  notice.id='ll-contributor-status-notice';
  notice.className=`ll-contributor-status-notice status-${app.status}`;
  notice.dataset.applicationId=app.id;
  notice.dataset.noticeKind='status';
  notice.dataset.title='Contributor status update';
  notice.setAttribute('role','status');
  notice.setAttribute('aria-live','polite');
  notice.innerHTML=`<button type="button" class="ll-contributor-status-close" aria-label="Dismiss contributor status update">×</button><span class="ll-contributor-status-kicker">CONTRIBUTOR APPLICATION</span><div class="ll-contributor-status-row"><span class="ll-contributor-status-icon">${app.status==='accepted'||app.status==='completed'?'✓':app.status==='declined'?'×':app.status==='reviewing'?'!':'•'}</span><div><b>${statusLabel(app.status)}</b><p>${esc(statusCopy(app.status))}</p></div></div><button type="button" class="ll-contributor-status-open">Open contributor page →</button>`;
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-close')?.addEventListener('click',()=>closeNotice(true));
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-open')?.addEventListener('click',()=>{markSeen(app);closeNotice(false);location.hash='contribute'});
  document.body.appendChild(notice);
  requestAnimationFrame(()=>requestAnimationFrame(()=>notice.classList.add('is-visible')));
}

function showChatNotice(message:UnreadChatMessage){
  if(developerAccess===true)return;
  latestUnread=message;
  noticeKind='chat';
  document.getElementById('ll-contributor-status-notice')?.remove();
  const notice=document.createElement('aside');
  notice.id='ll-contributor-status-notice';
  notice.className='ll-contributor-status-notice status-chat';
  notice.dataset.applicationId=message.application_id;
  notice.dataset.noticeKind='chat';
  notice.dataset.title=message.topics?.trim()||'Contributor conversation';
  notice.setAttribute('role','status');
  notice.setAttribute('aria-live','polite');
  const topic=message.topics?.trim()||'your contribution';
  notice.innerHTML=`<button type="button" class="ll-contributor-status-close" aria-label="Dismiss contributor chat notification">×</button><span class="ll-contributor-status-kicker">NEW PRIVATE MESSAGE • LITLAB</span><div class="ll-contributor-status-row"><span class="ll-contributor-status-icon">✦</span><div><b>LitLab sent you a message</b><p><strong>${esc(topic)}</strong><br/>${esc(preview(message.body))}</p></div></div><button type="button" class="ll-contributor-status-open">Open live chat →</button>`;
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-close')?.addEventListener('click',()=>closeNotice(true));
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-open')?.addEventListener('click',()=>{
    markChatNoticeSeen(message);
    closeNotice(false);
    location.hash='contribute';
  });
  document.body.appendChild(notice);
  requestAnimationFrame(()=>requestAnimationFrame(()=>notice.classList.add('is-visible')));
}

function removeAccountStatus(){document.querySelector('[data-contributor-account-status]')?.remove()}
function injectAccountStatus(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu)return;

  if(!signedIn()||developerAccess!==false){removeAccountStatus();return}

  let button=menu.querySelector<HTMLButtonElement>('[data-contributor-account-status]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='litlab-admin-menu-entry ll-contributor-account-status';
    button.dataset.contributorAccountStatus='true';
    button.addEventListener('click',event=>{event.stopPropagation();location.hash='contribute'});
    const signout=menu.querySelector('.litlab-signout');
    if(signout)menu.insertBefore(button,signout);else menu.appendChild(button);
  }

  const approved=Boolean(latest&&(latest.status==='accepted'||latest.status==='completed'));
  const chatText=unreadCount?` • ${unreadCount} unread chat${unreadCount===1?'':'s'}`:'';
  const subtitle=latest?`${statusLabel(latest.status)}${chatText}`:`Apply, track status & live chat${chatText}`;
  button.classList.toggle('is-approved',approved);
  button.classList.toggle('has-unread-chat',unreadCount>0);
  button.innerHTML=`<span>${unreadCount?'●':approved?'✓':'✦'}</span><div><b>Contributor application</b><small>${subtitle}</small></div><i>›</i>`;
}

function clearContributorUi(){
  latest=null;
  latestUnread=null;
  unreadCount=0;
  lastLoad=0;
  noticeKind=null;
  removeAccountStatus();
  document.getElementById('ll-contributor-status-notice')?.remove();
}

async function loadStatus(force=false){
  if(!signedIn()){
    developerAccess=null;
    clearContributorUi();
    return;
  }

  if(developerAccess===true){
    clearContributorUi();
    return;
  }

  if(loading)return;
  if(!force&&developerAccess===false&&Date.now()-lastLoad<12_000){injectAccountStatus();return}
  loading=true;
  try{
    if(developerAccess===null){
      developerAccess=Boolean(await rpc<boolean>('is_litlab_admin'));
      if(developerAccess){
        clearContributorUi();
        return;
      }
      injectAccountStatus();
    }

    const [appsResult,unreadResult]=await Promise.all([
      rpc<Application[]>('get_my_litlab_contributor_applications'),
      rpc<UnreadChatMessage[]>('get_my_litlab_contributor_unread_messages')
    ]);
    const apps=Array.isArray(appsResult)?appsResult:[];
    const unread=Array.isArray(unreadResult)?unreadResult:[];
    latest=apps.slice().sort((a,b)=>changedAt(b)-changedAt(a))[0]||null;
    latestUnread=unread[0]||null;
    unreadCount=unread.length;
    lastLoad=Date.now();

    if(latestUnread&&!chatNoticeSeen(latestUnread))showChatNotice(latestUnread);
    else if(latest&&!seen(latest))showStatusNotice(latest);
    injectAccountStatus();
  }catch(error){
    console.debug('Contributor status unavailable',error);
    if(developerAccess===false)injectAccountStatus();
  }finally{loading=false}
}

function clearPoll(){window.clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(delay=STATUS_POLL_MS){
  clearPoll();
  pollTimer=window.setTimeout(async()=>{
    if(signedIn()&&!document.hidden&&navigator.onLine)await loadStatus(true);
    schedulePoll();
  },delay);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('.litlab-account-trigger'))window.setTimeout(()=>{if(developerAccess===false)injectAccountStatus();void loadStatus(true)},40);
},true);
window.addEventListener('hashchange',()=>void loadStatus(true));
window.addEventListener('focus',()=>{if(developerAccess===false)injectAccountStatus();void loadStatus(true);schedulePoll()});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearPoll();return}
  if(developerAccess===false)injectAccountStatus();
  void loadStatus(true);schedulePoll();
});
window.addEventListener('online',()=>void loadStatus(true));
window.addEventListener('litlab:contributor-submitted',()=>setTimeout(()=>void loadStatus(true),350) as unknown as void);
window.addEventListener('storage',event=>{
  if(event.key===SESSION_KEY){developerAccess=null;clearContributorUi();void loadStatus(true)}
});

function start(){window.setTimeout(()=>void loadStatus(true),500);schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
