const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const INTENT_KEY='litlabContributorDirectAction';
const REQUEST_TIMEOUT_MS=12_000;
const RETRY_MS=120;
const MAX_ATTEMPTS=65;

type StoredSession={access_token?:string};
type IntentKind='user-chat'|'user-workspace'|'user-history'|'admin-chat'|'admin-application'|'admin-workspace';
type Intent={kind:IntentKind;applicationId:string;title?:string;createdAt:number};
type UserUnread={application_id:string;topics?:string;created_at?:string};
type AdminUnread={application_id:string;full_name?:string;topics?:string;created_at:string};
type App={id:string;created_at:string;status_updated_at?:string|null;full_name?:string;topics?:string};
type WorkspaceUpdate={application_id:string;created_at:string;kind?:string;label?:string;topics?:string;full_name?:string};

let attemptTimer=0;
let attemptCount=0;
let resolving=false;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function desiredRoute(intent:Intent){return intent.kind.startsWith('admin-')?'admin-contributors':'contribute'}
function escSelector(value:string){return CSS.escape(value)}
function changedAt(app:App){const value=Date.parse(app.status_updated_at||app.created_at);return Number.isFinite(value)?value:0}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function readIntent():Intent|null{
  try{
    const parsed=JSON.parse(sessionStorage.getItem(INTENT_KEY)||'null') as Intent|null;
    if(!parsed?.applicationId||!parsed.kind)return null;
    if(Date.now()-Number(parsed.createdAt||0)>60_000){sessionStorage.removeItem(INTENT_KEY);return null}
    return parsed;
  }catch{return null}
}
function saveIntent(intent:Intent){try{sessionStorage.setItem(INTENT_KEY,JSON.stringify(intent))}catch{}}
function clearIntent(){try{sessionStorage.removeItem(INTENT_KEY)}catch{}}
function stopAttempts(){window.clearTimeout(attemptTimer);attemptTimer=0;attemptCount=0}
function scrollTo(el:Element){requestAnimationFrame(()=>el.scrollIntoView({behavior:'smooth',block:'center'}))}
function dismissNotice(button:HTMLButtonElement){
  const notice=button.closest<HTMLElement>('#ll-contributor-status-notice,#ll-user-workspace-update-notice,#ll-admin-contributor-update-notice,#ll-admin-workspace-update-notice');
  if(!notice)return;
  notice.classList.add('is-closing');
  window.setTimeout(()=>notice.remove(),220);
}
function noticeApplicationId(button:Element){return button.closest<HTMLElement>('#ll-contributor-status-notice,#ll-user-workspace-update-notice,#ll-admin-contributor-update-notice,#ll-admin-workspace-update-notice')?.dataset.applicationId||''}

function perform(intent:Intent){
  if(route()!==desiredRoute(intent))return false;
  const id=escSelector(intent.applicationId);
  if(intent.kind==='user-chat'){
    const button=document.querySelector<HTMLButtonElement>(`[data-chat-open][data-chat-mode="user"][data-application-id="${id}"]`);
    if(!button)return false;
    button.click();
    return true;
  }
  if(intent.kind==='user-history'){
    const details=document.querySelector<HTMLDetailsElement>(`[data-history-contribution="${id}"]`);
    if(!details){window.dispatchEvent(new CustomEvent('litlab:open-contribution-detail',{detail:{applicationId:intent.applicationId,source:'notification'}}));return false}
    if(!details.open)details.open=true;
    window.dispatchEvent(new CustomEvent('litlab:open-contribution-detail',{detail:{applicationId:intent.applicationId,source:'notification'}}));
    scrollTo(details);
    return true;
  }
  if(intent.kind==='user-workspace'){
    const tab=document.querySelector<HTMLButtonElement>(`[data-workspace-select="${id}"]`);
    if(tab){tab.click();const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(root)scrollTo(root);return true}
    const archive=document.querySelector<HTMLElement>(`[data-contributor-completion-archive][data-application-id="${id}"]`);
    if(archive){scrollTo(archive);return true}
    const proof=document.querySelector<HTMLElement>(`[data-chat-open][data-chat-mode="user"][data-application-id="${id}"]`);
    const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');
    if(proof&&root){scrollTo(root);return true}
    return false;
  }
  const card=document.querySelector<HTMLDetailsElement>(`.admin-contrib-card[data-app-id="${id}"]`);
  if(!card)return false;
  if(intent.kind==='admin-chat'){
    const button=card.querySelector<HTMLButtonElement>('[data-chat-open][data-chat-mode="admin"]');if(!button)return false;button.click();return true;
  }
  if(intent.kind==='admin-workspace'){
    const button=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');if(!button)return false;button.click();return true;
  }
  const summary=card.querySelector<HTMLElement>('summary');
  if(!card.open&&summary)summary.click();else card.open=true;
  scrollTo(card);
  return true;
}

function scheduleAttempt(reset=false){
  if(reset){stopAttempts();attemptCount=0}
  window.clearTimeout(attemptTimer);
  const intent=readIntent();if(!intent)return;
  if(route()!==desiredRoute(intent))return;
  if(perform(intent)){clearIntent();stopAttempts();return}
  if(attemptCount++>=MAX_ATTEMPTS){stopAttempts();return}
  attemptTimer=window.setTimeout(()=>scheduleAttempt(false),RETRY_MS);
}
function openIntent(intent:Omit<Intent,'createdAt'>){
  const full:Intent={...intent,createdAt:Date.now()};saveIntent(full);stopAttempts();
  const targetRoute=desiredRoute(full);
  if(route()!==targetRoute){location.hash=targetRoute;return}
  scheduleAttempt(true);
}

async function newestUserChat(){const rows=await rpc<UserUnread[]>('get_my_litlab_contributor_unread_messages');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Date.parse(b.created_at||'')-Date.parse(a.created_at||''))[0]||null}
async function newestUserApp(){const rows=await rpc<App[]>('get_my_litlab_contributor_applications');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>changedAt(b)-changedAt(a))[0]||null}
async function newestUserWorkspaceUpdate(){const rows=await rpc<WorkspaceUpdate[]>('get_my_litlab_contributor_unread_workspace_updates');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}
async function newestAdminChat(){const rows=await rpc<AdminUnread[]>('admin_get_litlab_contributor_unread_messages');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}
async function newestAdminApp(){const rows=await rpc<App[]>('get_litlab_contributor_applications');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}
async function newestAdminWorkspaceUpdate(){const rows=await rpc<WorkspaceUpdate[]>('admin_get_litlab_contributor_unread_workspace_updates');return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}

function setOpening(button:HTMLButtonElement){button.dataset.directOriginalText=button.textContent||'';button.disabled=true;button.textContent='Opening…'}
function restore(button:HTMLButtonElement){if(!button.isConnected)return;button.disabled=false;if(button.dataset.directOriginalText!==undefined){button.textContent=button.dataset.directOriginalText;delete button.dataset.directOriginalText}}

async function resolveClick(button:HTMLButtonElement,kind:'user-notice'|'user-entry'|'user-workspace'|'admin-notice'|'admin-workspace'){
  if(resolving)return;resolving=true;setOpening(button);
  try{
    if(kind==='user-notice'){
      const notice=button.closest<HTMLElement>('#ll-contributor-status-notice');
      const exactId=noticeApplicationId(button);
      const noticeKind=notice?.dataset.noticeKind||'';
      if(exactId){openIntent({kind:noticeKind==='chat'?'user-chat':'user-workspace',applicationId:exactId,title:notice?.dataset.title||'Contributor update'});return}
      if(notice?.classList.contains('status-chat')){
        const item=await newestUserChat();if(item){openIntent({kind:'user-chat',applicationId:item.application_id,title:item.topics||'Contributor conversation'});return}
      }
      const app=await newestUserApp();if(app){openIntent({kind:'user-workspace',applicationId:app.id,title:app.topics||'Contributor workspace'});return}
      location.hash='contribute';return;
    }
    if(kind==='user-entry'){
      const item=await newestUserChat();
      if(item){openIntent({kind:'user-chat',applicationId:item.application_id,title:item.topics||'Contributor conversation'});return}
      const app=await newestUserApp();if(app){openIntent({kind:'user-workspace',applicationId:app.id,title:app.topics||'Contributor workspace'});return}
      location.hash='contribute';return;
    }
    if(kind==='user-workspace'){
      const notice=button.closest<HTMLElement>('#ll-user-workspace-update-notice');
      const exactId=noticeApplicationId(button);
      const updateKind=notice?.dataset.updateKind||'';
      if(exactId){openIntent({kind:updateKind==='certificate'?'user-history':'user-workspace',applicationId:exactId,title:notice?.dataset.title||'Contributor update'});return}
      const item=await newestUserWorkspaceUpdate();if(item){openIntent({kind:item.kind==='certificate'?'user-history':'user-workspace',applicationId:item.application_id,title:item.topics||item.label||'Contributor workspace'});return}
      location.hash='contribute';return;
    }
    if(kind==='admin-workspace'){
      const notice=button.closest<HTMLElement>('#ll-admin-workspace-update-notice');
      const exactId=noticeApplicationId(button);
      if(exactId){openIntent({kind:'admin-workspace',applicationId:exactId,title:notice?.dataset.title||'Contributor workspace'});return}
      const item=await newestAdminWorkspaceUpdate();if(item){openIntent({kind:'admin-workspace',applicationId:item.application_id,title:item.full_name||item.topics||'Contributor workspace'});return}
      location.hash='admin-contributors';return;
    }
    const notice=button.closest<HTMLElement>('#ll-admin-contributor-update-notice');
    const exactId=noticeApplicationId(button);
    const updateKind=notice?.dataset.updateKind||'';
    if(exactId){openIntent({kind:updateKind==='message'?'admin-chat':'admin-application',applicationId:exactId,title:notice?.dataset.title||'Contributor update'});return}
    const isMessage=Boolean(notice?.textContent?.toLowerCase().includes('message'));
    if(isMessage){const item=await newestAdminChat();if(item){openIntent({kind:'admin-chat',applicationId:item.application_id,title:`${item.full_name||'Contributor'} — ${item.topics||'Contributor conversation'}`});return}}
    const app=await newestAdminApp();if(app){openIntent({kind:'admin-application',applicationId:app.id,title:app.full_name||app.topics||'Contributor application'});return}
    location.hash='admin-contributors';
  }catch(error){console.debug('Direct contributor action unavailable',error);location.hash=kind.startsWith('admin')?'admin-contributors':'contribute'}
  finally{resolving=false;restore(button)}
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const userNotice=target.closest<HTMLButtonElement>('#ll-contributor-status-notice .ll-contributor-status-open');
  if(userNotice){event.preventDefault();event.stopImmediatePropagation();dismissNotice(userNotice);void resolveClick(userNotice,'user-notice');return}
  const userWorkspace=target.closest<HTMLButtonElement>('#ll-user-workspace-update-notice [data-open]');
  if(userWorkspace){event.preventDefault();event.stopImmediatePropagation();dismissNotice(userWorkspace);void resolveClick(userWorkspace,'user-workspace');return}
  const adminNotice=target.closest<HTMLButtonElement>('#ll-admin-contributor-update-notice [data-admin-update-open]');
  if(adminNotice){event.preventDefault();event.stopImmediatePropagation();dismissNotice(adminNotice);void resolveClick(adminNotice,'admin-notice');return}
  const adminWorkspace=target.closest<HTMLButtonElement>('#ll-admin-workspace-update-notice [data-open]');
  if(adminWorkspace){event.preventDefault();event.stopImmediatePropagation();dismissNotice(adminWorkspace);void resolveClick(adminWorkspace,'admin-workspace');return}
  const accountEntry=target.closest<HTMLButtonElement>('[data-contributor-account-status]');
  if(accountEntry){event.preventDefault();event.stopImmediatePropagation();void resolveClick(accountEntry,'user-entry');return}
  const shortcut=target.closest<HTMLButtonElement>('[data-contributor-shortcut].has-unread');
  if(shortcut){event.preventDefault();event.stopImmediatePropagation();void resolveClick(shortcut,'user-entry');return}
  const adminDashboard=target.closest<HTMLButtonElement>('[data-open-admin-contributors],[data-open-contributors-from-analytics]');
  if(adminDashboard){event.preventDefault();event.stopImmediatePropagation();location.hash='admin-contributors';return}
},true);

window.addEventListener('hashchange',()=>window.setTimeout(()=>scheduleAttempt(true),40));
window.addEventListener('focus',()=>scheduleAttempt(false));
window.addEventListener('online',()=>scheduleAttempt(false));
window.addEventListener('litlab:contributor-submitted',()=>scheduleAttempt(false));
window.addEventListener('litlab:contributor-workspace-updated',()=>scheduleAttempt(false));
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>scheduleAttempt(false));
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){clearIntent();stopAttempts()}});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleAttempt(true),{once:true});else scheduleAttempt(true);

export {};
