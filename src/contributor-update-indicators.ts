import './contributor-update-indicators.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=20_000;
const USER_OPENED_PREFIX='litlabContributorStatusOpened:';
const USER_OPENED_INIT_PREFIX='litlabContributorStatusOpenedInit:';
const LEGACY_SEEN_PREFIX='litlabContributorStatusSeen:';
const ADMIN_SEEN_PREFIX='litlabAdminContributorSeenApps:';
const ADMIN_NOTICE_PREFIX='litlabAdminContributorNotice:';

type StoredSession={access_token?:string};
type Status='new'|'reviewing'|'accepted'|'declined'|'completed';
type App={id:string;created_at:string;status:Status;status_updated_at?:string|null;full_name?:string;topics?:string};
type UserUnread={message_id:string;application_id:string;created_at?:string};
type AdminUnread={message_id:string;application_id:string;body:string;created_at:string;full_name:string;topics:string;status:Status};

type Mode='user'|'admin'|'none';
let mode:Mode='none';
let loading=false;
let timer=0;
let userApps:App[]=[];
let userUnread:UserUnread[]=[];
let adminApps:App[]=[];
let adminUnread:AdminUnread[]=[];
let adminNewApps:App[]=[];

function session():StoredSession|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function token(){return session()?.access_token||''}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function userId(){
  try{const part=token().split('.')[1];if(!part)return '';const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');return String(JSON.parse(atob(normalized))?.sub||'')}catch{return ''}
}
function revision(app:App){return `${app.status}|${app.status_updated_at||app.created_at}`}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function setAccountDot(active:boolean){
  document.documentElement.toggleAttribute('data-litlab-contributor-update',active);
  document.querySelectorAll<HTMLElement>('.litlab-account-trigger').forEach(el=>el.classList.toggle('has-litlab-update',active));
}

function ensureUserStatusBaseline(app:App){
  try{
    const initKey=`${USER_OPENED_INIT_PREFIX}${app.id}`;
    if(localStorage.getItem(initKey)==='1')return;
    const rev=revision(app);
    if(app.status==='new'||localStorage.getItem(`${LEGACY_SEEN_PREFIX}${app.id}`)===rev)localStorage.setItem(`${USER_OPENED_PREFIX}${app.id}`,rev);
    localStorage.setItem(initKey,'1');
  }catch{}
}
function userStatusUnopened(app:App){
  ensureUserStatusBaseline(app);
  if(app.status==='new')return false;
  try{return localStorage.getItem(`${USER_OPENED_PREFIX}${app.id}`)!==revision(app)}catch{return true}
}
function markUserStatusesOpened(){
  try{userApps.forEach(app=>localStorage.setItem(`${USER_OPENED_PREFIX}${app.id}`,revision(app)))}catch{}
  applyUserUi();
}

function applyUserUi(){
  if(mode!=='user')return;
  const unseenStatus=userApps.some(userStatusUnopened);
  const hasMessage=userUnread.length>0;
  const active=unseenStatus||hasMessage;
  setAccountDot(active);
  document.documentElement.toggleAttribute('data-litlab-user-contributor-update',active);
  document.documentElement.toggleAttribute('data-litlab-user-contributor-message',hasMessage);
  document.documentElement.toggleAttribute('data-litlab-user-contributor-status',unseenStatus);
  document.querySelectorAll<HTMLElement>('[data-contributor-account-status]').forEach(el=>el.classList.toggle('has-global-update',active));
}

function adminSeenKey(){return `${ADMIN_SEEN_PREFIX}${userId()||'developer'}`}
function readAdminSeen():Set<string>{
  try{const raw=JSON.parse(localStorage.getItem(adminSeenKey())||'null');return new Set(Array.isArray(raw)?raw.map(String):[])}catch{return new Set()}
}
function saveAdminSeen(set:Set<string>){try{localStorage.setItem(adminSeenKey(),JSON.stringify([...set]))}catch{}}
function computeAdminNewApps(){
  let storageExists=false;
  try{storageExists=localStorage.getItem(adminSeenKey())!==null}catch{}
  const seen=readAdminSeen();
  if(!storageExists){adminApps.forEach(app=>seen.add(app.id));saveAdminSeen(seen);adminNewApps=[];return}
  adminNewApps=adminApps.filter(app=>!seen.has(app.id));
}
function markAdminAppOpened(id:string){const seen=readAdminSeen();seen.add(id);saveAdminSeen(seen);adminNewApps=adminNewApps.filter(app=>app.id!==id);applyAdminUi()}

function latestAdminEvent(){
  const events:[number,'message'|'application',AdminUnread|App][]=[];
  adminUnread.forEach(item=>events.push([Date.parse(item.created_at)||0,'message',item]));
  adminNewApps.forEach(item=>events.push([Date.parse(item.created_at)||0,'application',item]));
  return events.sort((a,b)=>b[0]-a[0])[0]||null;
}

function adminLabel(){
  const event=latestAdminEvent();
  if(!event)return '';
  const [,kind,item]=event;
  const name=String(item.full_name||'Contributor').trim()||'Contributor';
  return kind==='message'?`New message from ${name}`:`New application from ${name}`;
}

function applyAdminPageMarkers(){
  if(mode!=='admin')return;
  const unreadApps=new Set(adminUnread.map(item=>item.application_id));
  const newApps=new Set(adminNewApps.map(item=>item.id));
  document.querySelectorAll<HTMLDetailsElement>('.admin-contrib-card[data-app-id]').forEach(card=>{
    const id=card.dataset.appId||'';
    const hasMessage=unreadApps.has(id);
    const isNew=newApps.has(id);
    const active=hasMessage||isNew;
    card.classList.toggle('has-admin-contributor-update',active);
    let badge=card.querySelector<HTMLElement>('[data-admin-contributor-update-badge]');
    if(active&&!badge){badge=document.createElement('span');badge.dataset.adminContributorUpdateBadge='true';badge.className='admin-contributor-update-badge';card.querySelector('summary')?.appendChild(badge)}
    if(badge){if(active)badge.textContent=hasMessage?'New message':isNew?'New application':'';else badge.remove()}
    const chat=card.querySelector<HTMLButtonElement>('[data-chat-mode="admin"]');
    if(chat)chat.classList.toggle('has-admin-unread-message',hasMessage);
  });
}

function showAdminNotice(){
  const event=latestAdminEvent();
  if(!event)return;
  const [,kind,item]=event;
  const eventKey=kind==='message'?`m:${(item as AdminUnread).message_id}`:`a:${(item as App).id}`;
  const key=`${ADMIN_NOTICE_PREFIX}${userId()||'developer'}`;
  try{if(sessionStorage.getItem(key)===eventKey)return}catch{}
  document.getElementById('ll-admin-contributor-update-notice')?.remove();
  const name=String(item.full_name||'Contributor').trim()||'Contributor';
  const notice=document.createElement('aside');
  notice.id='ll-admin-contributor-update-notice';
  notice.className='ll-admin-contributor-update-notice';
  notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
  notice.innerHTML=`<button type="button" data-admin-update-close aria-label="Dismiss">×</button><span>LITLAB • CONTRIBUTOR UPDATE</span><div><i>●</i><section><b>${kind==='message'?'New contributor message':'New contributor application'}</b><p>${esc(name)}${kind==='message'&&item.topics?` • ${esc(item.topics)}`:''}</p></section></div><button type="button" data-admin-update-open>Open contributor dashboard →</button>`;
  const dismiss=()=>{try{sessionStorage.setItem(key,eventKey)}catch{}notice.classList.add('is-closing');setTimeout(()=>notice.remove(),220)};
  notice.querySelector('[data-admin-update-close]')?.addEventListener('click',dismiss);
  notice.querySelector('[data-admin-update-open]')?.addEventListener('click',()=>{dismiss();location.hash='admin-contributors'});
  document.body.appendChild(notice);requestAnimationFrame(()=>notice.classList.add('is-visible'));
}

function applyAdminUi(){
  if(mode!=='admin')return;
  const active=adminUnread.length>0||adminNewApps.length>0;
  setAccountDot(active);
  document.documentElement.toggleAttribute('data-litlab-admin-contributor-update',active);
  const label=adminLabel();
  const menu=document.querySelector<HTMLElement>('[data-open-admin-contributors]');
  if(menu){
    menu.classList.toggle('has-admin-contributor-update',active);
    const small=menu.querySelector('small');if(small)small.textContent=active?label:'Applications, CAS & reviewers';
  }
  const analytics=document.querySelector<HTMLButtonElement>('[data-open-contributors-from-analytics]');
  if(analytics){analytics.classList.toggle('has-admin-contributor-update',active);analytics.textContent=active?'● New contributor update':'Contributor dashboard'}
  applyAdminPageMarkers();
  if(active)showAdminNotice();
}

function clearUi(){
  setAccountDot(false);
  document.documentElement.removeAttribute('data-litlab-user-contributor-update');
  document.documentElement.removeAttribute('data-litlab-user-contributor-message');
  document.documentElement.removeAttribute('data-litlab-user-contributor-status');
  document.documentElement.removeAttribute('data-litlab-admin-contributor-update');
}

async function load(force=false){
  if(!token()){mode='none';userApps=[];userUnread=[];adminApps=[];adminUnread=[];adminNewApps=[];clearUi();return}
  if(loading)return;
  loading=true;
  try{
    const isAdmin=Boolean(await rpc<boolean>('is_litlab_admin'));
    mode=isAdmin?'admin':'user';
    if(isAdmin){
      const [apps,unread]=await Promise.all([rpc<App[]>('get_litlab_contributor_applications'),rpc<AdminUnread[]>('admin_get_litlab_contributor_unread_messages')]);
      adminApps=Array.isArray(apps)?apps:[];adminUnread=Array.isArray(unread)?unread:[];computeAdminNewApps();applyAdminUi();
    }else{
      const [apps,unread]=await Promise.all([rpc<App[]>('get_my_litlab_contributor_applications'),rpc<UserUnread[]>('get_my_litlab_contributor_unread_messages')]);
      userApps=Array.isArray(apps)?apps:[];userUnread=Array.isArray(unread)?unread:[];
      if(route()==='contribute')markUserStatusesOpened();else applyUserUi();
    }
  }catch(error){console.debug('Contributor update indicator unavailable',error)}finally{loading=false}
}

function schedule(){clearTimeout(timer);timer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load();schedule()},POLL_MS)}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('.litlab-account-trigger'))setTimeout(()=>{if(mode==='admin')applyAdminUi();else if(mode==='user')applyUserUi()},180);
  if(mode==='user'&&target.closest('[data-contributor-shortcut],[data-contributor-account-status]'))markUserStatusesOpened();
  if(mode==='user'&&target.closest('[data-chat-open][data-chat-mode="user"]'))setTimeout(()=>void load(true),800);
  if(mode==='admin'&&target.closest('[data-chat-open][data-chat-mode="admin"]'))setTimeout(()=>void load(true),800);
  if(mode==='admin'){
    const summary=target.closest('.admin-contrib-card > summary');
    if(summary){const card=summary.parentElement as HTMLDetailsElement|null;setTimeout(()=>{if(card?.open&&card.dataset.appId)markAdminAppOpened(card.dataset.appId)},0)}
  }
},true);
window.addEventListener('hashchange',()=>{if(mode==='user'&&route()==='contribute')markUserStatusesOpened();setTimeout(()=>void load(true),120)});
window.addEventListener('focus',()=>{void load(true);schedule()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);return}void load(true);schedule()});
window.addEventListener('online',()=>void load(true));
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){mode='none';clearUi();void load(true)}});
window.addEventListener('litlab:contributor-submitted',()=>setTimeout(()=>void load(true),350));

setTimeout(()=>void load(true),850);schedule();
