import './account-progress-sync.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RESTORE_MARKER='litlabCloudRestoreDone';
const SYNC_DEBOUNCE_MS=900;
const CHANGE_CHECK_MS=2200;
const MENU_CHECK_MS=900;

type StoredSession={access_token:string;refresh_token:string;expires_at:number;token_type?:string};
type AuthUser={id:string;email?:string;user_metadata?:{full_name?:string;name?:string;avatar_url?:string;picture?:string}};
type CloudData={version:number;updated_at:string;items:Record<string,string>};
type ProgressRow={user_id:string;data?:CloudData;updated_at?:string};

let currentUser:AuthUser|null=null;
let syncTimer=0;
let syncing=false;
let lastSyncAt=0;
let lastSnapshot='';
let applyingRemote=false;
let syncState:'idle'|'syncing'|'synced'|'error'='idle';

function readSession():StoredSession|null{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return value&&typeof value.access_token==='string'&&typeof value.refresh_token==='string'?value:null;
  }catch{return null}
}

function saveSession(session:StoredSession){localStorage.setItem(SESSION_KEY,JSON.stringify(session))}

async function validSession():Promise<StoredSession|null>{
  const session=readSession();
  if(!session)return null;
  if((session.expires_at||0)-Math.floor(Date.now()/1000)>90)return session;
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},
      body:JSON.stringify({refresh_token:session.refresh_token})
    });
    if(!response.ok)return null;
    const data=await response.json() as {access_token?:string;refresh_token?:string;expires_in?:number;token_type?:string};
    if(!data.access_token||!data.refresh_token)return null;
    const next={
      access_token:data.access_token,
      refresh_token:data.refresh_token,
      expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600),
      token_type:data.token_type||'bearer'
    };
    saveSession(next);
    return next;
  }catch{return null}
}

function isSyncableKey(key:string){
  if(!key.startsWith('litlab'))return false;
  const blocked=[SESSION_KEY,'litlabOpenClinic','litlabLastSkill','litlabAuthError','litlabAuthReturnHash','litlabCloudRestoreDone'];
  if(blocked.includes(key))return false;
  if(/auth|supabase/i.test(key))return false;
  if(/tutor/i.test(key))return false;
  return true;
}

function captureItems(){
  const keys:string[]=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&isSyncableKey(key))keys.push(key);
  }
  keys.sort();
  const items:Record<string,string>={};
  keys.forEach(key=>{
    const value=localStorage.getItem(key);
    if(value!==null&&value.length<250000)items[key]=value;
  });
  return items;
}

function snapshotOf(items:Record<string,string>=captureItems()){return JSON.stringify(items)}

function cloudHeaders(session:StoredSession,extra:Record<string,string>={}){
  return {apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,...extra};
}

async function loadUser(session:StoredSession){
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:cloudHeaders(session)});
    if(!response.ok)return null;
    return await response.json() as AuthUser;
  }catch{return null}
}

async function fetchRemote(session:StoredSession,userId:string):Promise<ProgressRow|null>{
  try{
    const url=`${SUPABASE_URL}/rest/v1/litlab_progress?user_id=eq.${encodeURIComponent(userId)}&select=user_id,data,updated_at`;
    const response=await fetch(url,{headers:cloudHeaders(session,{Accept:'application/json'})});
    if(!response.ok)return null;
    const rows=await response.json() as ProgressRow[];
    return rows[0]||null;
  }catch{return null}
}

async function uploadSnapshot(session:StoredSession,user:AuthUser){
  const items=captureItems();
  const payload:CloudData={version:1,updated_at:new Date().toISOString(),items};
  const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_progress?on_conflict=user_id`,{
    method:'POST',
    headers:cloudHeaders(session,{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),
    body:JSON.stringify({user_id:user.id,data:payload})
  });
  if(!response.ok)throw new Error(`Progress sync failed (${response.status})`);
  lastSnapshot=snapshotOf(items);
  lastSyncAt=Date.now();
}

async function touchProfile(session:StoredSession,user:AuthUser){
  const metadata=user.user_metadata||{};
  const body={
    user_id:user.id,
    display_name:metadata.full_name||metadata.name||user.email?.split('@')[0]||'Student',
    avatar_url:metadata.avatar_url||metadata.picture||null,
    last_seen_at:new Date().toISOString()
  };
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/litlab_profiles?on_conflict=user_id`,{
      method:'POST',
      headers:cloudHeaders(session,{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),
      body:JSON.stringify(body)
    });
  }catch{}
}

function applyRemote(remote:CloudData){
  if(!remote||typeof remote!=='object'||!remote.items||typeof remote.items!=='object')return false;
  const local=captureItems();
  const localHasProgress=Object.keys(local).length>0;
  const merged=localHasProgress?{...remote.items,...local}:{...remote.items};
  let changed=false;
  applyingRemote=true;
  try{
    Object.entries(merged).forEach(([key,value])=>{
      if(!isSyncableKey(key)||typeof value!=='string')return;
      if(localStorage.getItem(key)!==value){localStorage.setItem(key,value);changed=true}
    });
  }finally{applyingRemote=false}
  lastSnapshot=snapshotOf(captureItems());
  return changed;
}

function setTextIfChanged(element:HTMLElement|null,text:string){
  if(element&&element.textContent!==text)element.textContent=text;
}

function updateVisibleSyncLabels(){
  if(!currentUser)return;
  setTextIfChanged(
    document.querySelector<HTMLElement>('.my-litlab-local'),
    syncState==='error'?'Cloud sync needs attention':'Cloud sync active • Google account'
  );
  setTextIfChanged(
    document.querySelector<HTMLElement>('.litlab-account-status small'),
    syncState==='error'?'Signed in • cloud sync will retry':'Progress sync active across devices.'
  );
}

function scheduleSync(){
  if(!currentUser||applyingRemote)return;
  clearTimeout(syncTimer);
  syncTimer=window.setTimeout(()=>void syncNow(),SYNC_DEBOUNCE_MS);
}

async function syncNow(){
  if(syncing)return;
  const session=await validSession();
  if(!session){currentUser=null;return}
  const user=currentUser||await loadUser(session);
  if(!user)return;
  currentUser=user;
  syncing=true;
  syncState='syncing';
  updateVisibleSyncLabels();
  updateAccountModal();
  try{
    await uploadSnapshot(session,user);
    await touchProfile(session,user);
    syncState='synced';
  }catch{
    syncState='error';
  }finally{
    syncing=false;
    updateVisibleSyncLabels();
    updateAccountModal();
  }
}

async function bootstrapCloud(){
  const session=await validSession();
  if(!session)return;
  const user=await loadUser(session);
  if(!user)return;
  currentUser=user;
  await touchProfile(session,user);
  const remote=await fetchRemote(session,user.id);
  let changed=false;
  if(remote?.data)changed=applyRemote(remote.data);
  try{
    await uploadSnapshot(session,user);
    syncState='synced';
  }catch{
    syncState='error';
  }
  updateVisibleSyncLabels();
  enhanceAccountMenu();
  if(changed&&sessionStorage.getItem(RESTORE_MARKER)!==user.id){
    sessionStorage.setItem(RESTORE_MARKER,user.id);
    location.reload();
  }
}

function parseJSON<T>(key:string,fallback:T):T{
  try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}
}

function dashboardStats(){
  const done=parseJSON<string[]>('litlabDone',[]);
  const books=parseJSON<string[]>('litlabBookProfilesReviewed',[]);
  const ee=parseJSON<number[]>('litlabEEChecklist',[]);
  const skills=parseJSON<{completed?:string[]}>('litlabSkillProgress',{});
  return {
    guides:Array.isArray(done)?done.length:0,
    books:Array.isArray(books)?books.length:0,
    ee:Array.isArray(ee)?ee.length:0,
    skills:Array.isArray(skills.completed)?skills.completed.length:0
  };
}

function nameFor(user:AuthUser){return user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Student'}
function escapeHTML(value:string){return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch))}
function closeAccountModal(){document.querySelector('[data-litlab-cloud-account]')?.remove()}

function modalMarkup(){
  if(!currentUser)return '';
  const stats=dashboardStats();
  const avatar=currentUser.user_metadata?.avatar_url||currentUser.user_metadata?.picture;
  const synced=lastSyncAt?`Last synced ${new Date(lastSyncAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'Cloud sync is initializing';
  return `<section class="litlab-cloud-card" role="dialog" aria-modal="true" aria-label="My LitLab">
    <button type="button" class="litlab-cloud-close" aria-label="Close">×</button>
    <header class="litlab-cloud-head">
      ${avatar?`<img src="${escapeHTML(avatar)}" alt="" referrerpolicy="no-referrer">`:'<span class="litlab-cloud-avatar">LL</span>'}
      <div><span>MY LITLAB</span><h2>${escapeHTML(nameFor(currentUser))}</h2><p>${escapeHTML(currentUser.email||'Google account')}</p></div>
      <i class="litlab-cloud-state ${syncState}">${syncState==='error'?'Sync issue':syncState==='syncing'?'Syncing…':'Cloud synced'}</i>
    </header>
    <div class="litlab-cloud-summary">
      <article><b>${stats.guides}</b><span>guides reviewed</span></article>
      <article><b>${stats.books}</b><span>books reviewed</span></article>
      <article><b>${stats.skills}</b><span>skills completed</span></article>
      <article><b>${stats.ee}</b><span>EE checks done</span></article>
    </div>
    <div class="litlab-cloud-info"><span>☁</span><div><b>Your progress follows your Google account.</b><p>Supported LitLab progress is stored in your private account row and can be restored on another device.</p></div></div>
    <footer><small>${synced}</small><button type="button" data-cloud-sync-now>${syncing?'Syncing…':'Sync now'}</button></footer>
  </section>`;
}

function wireAccountModal(overlay:HTMLElement){
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)closeAccountModal()});
  overlay.querySelector('.litlab-cloud-close')?.addEventListener('click',closeAccountModal);
  overlay.querySelector<HTMLButtonElement>('[data-cloud-sync-now]')?.addEventListener('click',()=>void syncNow());
}

function openAccountModal(){
  if(!currentUser||document.querySelector('[data-litlab-cloud-account]'))return;
  const overlay=document.createElement('div');
  overlay.className='litlab-cloud-modal';
  overlay.dataset.litlabCloudAccount='true';
  overlay.innerHTML=modalMarkup();
  wireAccountModal(overlay);
  document.body.append(overlay);
}

function updateAccountModal(){
  const overlay=document.querySelector<HTMLElement>('[data-litlab-cloud-account]');
  if(!overlay||!currentUser)return;
  overlay.innerHTML=modalMarkup();
  wireAccountModal(overlay);
}

function enhanceAccountMenu(){
  if(!currentUser)return;
  updateVisibleSyncLabels();
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu||menu.querySelector('[data-my-litlab-cloud]'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-my-cloud';
  button.dataset.myLitlabCloud='true';
  button.innerHTML='<span>☁</span><div><b>My LitLab</b><small>Synced progress & account</small></div><i>›</i>';
  const signout=menu.querySelector('.litlab-signout');
  if(signout)menu.insertBefore(button,signout);else menu.append(button);
  button.addEventListener('click',event=>{event.stopPropagation();openAccountModal()});
}

function checkForProgressChanges(){
  if(!currentUser||syncing||applyingRemote||document.visibilityState==='hidden')return;
  const next=snapshotOf();
  if(!lastSnapshot){lastSnapshot=next;return}
  if(next!==lastSnapshot)scheduleSync();
}

window.addEventListener('storage',event=>{if(event.key&&isSyncableKey(event.key))scheduleSync()});
window.addEventListener('pagehide',()=>{if(currentUser&&Date.now()-lastSyncAt>1500)void syncNow()});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'&&currentUser)void syncNow();
  else if(document.visibilityState==='visible')enhanceAccountMenu();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAccountModal()});

window.setInterval(checkForProgressChanges,CHANGE_CHECK_MS);
window.setInterval(enhanceAccountMenu,MENU_CHECK_MS);

void bootstrapCloud();
