import './contributor-status-notifications.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SEEN_PREFIX='litlabContributorStatusSeen:';
const REQUEST_TIMEOUT_MS=12_000;
const STATUS_POLL_MS=30_000;

type StoredSession={access_token?:string};
type ApplicationStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Application={id:string;created_at:string;status:ApplicationStatus;status_updated_at?:string|null;contribution_type:string;full_name:string};

let latest:Application|null=null;
let loading=false;
let lastLoad=0;
let pollTimer=0;

function session():StoredSession|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function token(){return session()?.access_token||''}
function signedIn(){return Boolean(token())}
function statusLabel(status:ApplicationStatus){return ({new:'Pending',reviewing:'Needs review',accepted:'Approved contributor',declined:'Not approved',completed:'Completed contributor'} as const)[status]}
function statusCopy(status:ApplicationStatus){
  if(status==='new')return 'Your application has been received and is waiting for the LitLab team to review it.';
  if(status==='reviewing')return 'The LitLab team marked your application as needing review. We may contact you using the email saved with your application.';
  if(status==='accepted')return 'Your LitLab contributor application has been accepted. Your approved contribution remains saved to your account.';
  if(status==='declined')return 'Your LitLab contributor application was not accepted this time. You can still use LitLab normally and may apply again later.';
  return 'Your contribution has been marked completed. Your contributor history and recognition remain saved to your account.';
}
function revision(app:Application){return `${app.status}|${app.status_updated_at||app.created_at}`}
function seen(app:Application){try{return localStorage.getItem(`${SEEN_PREFIX}${app.id}`)===revision(app)}catch{return false}}
function markSeen(app:Application){try{localStorage.setItem(`${SEEN_PREFIX}${app.id}`,revision(app))}catch{}}
function changedAt(app:Application){const t=Date.parse(app.status_updated_at||app.created_at);return Number.isFinite(t)?t:0}

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
  if(mark&&latest)markSeen(latest);
  if(!notice)return;
  notice.classList.remove('is-visible');
  notice.classList.add('is-closing');
  window.setTimeout(()=>notice.remove(),320);
}

function showNotice(app:Application){
  latest=app;
  document.getElementById('ll-contributor-status-notice')?.remove();
  const notice=document.createElement('aside');
  notice.id='ll-contributor-status-notice';
  notice.className=`ll-contributor-status-notice status-${app.status}`;
  notice.setAttribute('role','status');
  notice.setAttribute('aria-live','polite');
  notice.innerHTML=`<button type="button" class="ll-contributor-status-close" aria-label="Dismiss contributor status update">×</button><span class="ll-contributor-status-kicker">CONTRIBUTOR APPLICATION</span><div class="ll-contributor-status-row"><span class="ll-contributor-status-icon">${app.status==='accepted'||app.status==='completed'?'✓':app.status==='declined'?'×':app.status==='reviewing'?'!':'•'}</span><div><b>${statusLabel(app.status)}</b><p>${statusCopy(app.status)}</p></div></div><button type="button" class="ll-contributor-status-open">Open contributor page →</button>`;
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-close')?.addEventListener('click',()=>closeNotice(true));
  notice.querySelector<HTMLButtonElement>('.ll-contributor-status-open')?.addEventListener('click',()=>{markSeen(app);closeNotice(false);location.hash='contribute'});
  document.body.appendChild(notice);
  requestAnimationFrame(()=>requestAnimationFrame(()=>notice.classList.add('is-visible')));
}

function removeAccountStatus(){document.querySelector('[data-contributor-account-status]')?.remove()}
function injectAccountStatus(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu){return}
  if(!latest){removeAccountStatus();return}
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
  const title=latest.status==='accepted'||latest.status==='completed'?'LitLab contributor':'Contributor application';
  button.classList.toggle('is-approved',latest.status==='accepted'||latest.status==='completed');
  button.innerHTML=`<span>${latest.status==='accepted'||latest.status==='completed'?'✓':'✦'}</span><div><b>${title}</b><small>${statusLabel(latest.status)}</small></div><i>›</i>`;
}

async function loadStatus(force=false){
  if(!signedIn()){latest=null;lastLoad=0;removeAccountStatus();return}
  if(loading)return;
  if(!force&&Date.now()-lastLoad<15_000){injectAccountStatus();return}
  loading=true;
  try{
    const apps=await rpc<Application[]>('get_my_litlab_contributor_applications')||[];
    const rows=Array.isArray(apps)?apps:[];
    latest=rows.slice().sort((a,b)=>changedAt(b)-changedAt(a))[0]||null;
    lastLoad=Date.now();
    if(latest&&!seen(latest))showNotice(latest);
    injectAccountStatus();
  }catch(error){
    console.debug('Contributor status unavailable',error);
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
  if(target?.closest('.litlab-account-trigger'))window.setTimeout(()=>{void loadStatus(true);injectAccountStatus()},40);
},true);
window.addEventListener('hashchange',()=>void loadStatus(true));
window.addEventListener('focus',()=>{void loadStatus(true);schedulePoll()});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearPoll();return}
  void loadStatus(true);schedulePoll();
});
window.addEventListener('online',()=>void loadStatus(true));
window.addEventListener('litlab:contributor-submitted',()=>setTimeout(()=>void loadStatus(true),400) as unknown as void);
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){latest=null;lastLoad=0;void loadStatus(true)}});

function start(){window.setTimeout(()=>void loadStatus(true),900);schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
