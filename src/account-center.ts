import './account-center.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

const SYNCABLE_KEYS=[
  'litlabDone',
  'litlabSkillProgress',
  'litlabLearningProfile',
  'litlabBookProfilesReviewed',
  'litlabEEChecklist',
  'litlabChoiceBankProgress'
] as const;

type StoredSession={access_token:string;refresh_token:string;expires_at:number;token_type?:string};
type AuthUser={id:string;email?:string;user_metadata?:{full_name?:string;name?:string;avatar_url?:string;picture?:string}};
type CloudData={version:number;updated_at:string;items:Record<string,string>};
type ProgressRow={data?:CloudData;updated_at?:string};

let accountCenterOpen=false;

function readSession():StoredSession|null{
  try{
    const raw=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return raw&&typeof raw.access_token==='string'?raw:null;
  }catch{return null}
}

function headers(session:StoredSession,extra:Record<string,string>={}){
  return {apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,...extra};
}

function escapeHTML(value:string){
  return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
}

function parseJSON<T>(key:string,fallback:T):T{
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null');
    return value??fallback;
  }catch{return fallback}
}

function captureProgress(){
  const items:Record<string,string>={};
  SYNCABLE_KEYS.forEach(key=>{
    const value=localStorage.getItem(key);
    if(value!==null)items[key]=value;
  });
  return items;
}

function progressStats(){
  const guides=parseJSON<string[]>('litlabDone',[]);
  const books=parseJSON<string[]>('litlabBookProfilesReviewed',[]);
  const ee=parseJSON<number[]>('litlabEEChecklist',[]);
  const skills=parseJSON<{completed?:string[]}>('litlabSkillProgress',{});
  const choice=parseJSON<{stats?:Record<string,{attempts?:number}>}>('litlabChoiceBankProgress',{});
  const practiced=Object.values(choice.stats||{}).filter(item=>Number(item?.attempts||0)>0).length;
  return {
    guides:Array.isArray(guides)?guides.length:0,
    books:Array.isArray(books)?books.length:0,
    skills:Array.isArray(skills.completed)?skills.completed.length:0,
    ee:Array.isArray(ee)?ee.length:0,
    practiced
  };
}

async function loadUser(session:StoredSession):Promise<AuthUser|null>{
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(session)});
    if(!response.ok)return null;
    return await response.json() as AuthUser;
  }catch{return null}
}

async function touchProfile(session:StoredSession,user:AuthUser){
  const meta=user.user_metadata||{};
  const body={
    user_id:user.id,
    display_name:meta.full_name||meta.name||user.email?.split('@')[0]||'Student',
    avatar_url:meta.avatar_url||meta.picture||null,
    last_seen_at:new Date().toISOString()
  };
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/litlab_profiles?on_conflict=user_id`,{
      method:'POST',
      headers:headers(session,{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),
      body:JSON.stringify(body)
    });
  }catch{}
}

async function readCloud(session:StoredSession,userId:string):Promise<ProgressRow|null>{
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_progress?user_id=eq.${encodeURIComponent(userId)}&select=data,updated_at`,{
      headers:headers(session,{Accept:'application/json'})
    });
    if(!response.ok)return null;
    const rows=await response.json() as ProgressRow[];
    return rows[0]||null;
  }catch{return null}
}

async function saveCloud(session:StoredSession,user:AuthUser){
  const data:CloudData={version:2,updated_at:new Date().toISOString(),items:captureProgress()};
  const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_progress?on_conflict=user_id`,{
    method:'POST',
    headers:headers(session,{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),
    body:JSON.stringify({user_id:user.id,data})
  });
  if(!response.ok)throw new Error(`Cloud save failed (${response.status})`);
  return data.updated_at;
}

function restoreCloud(data:CloudData){
  if(!data||typeof data!=='object'||!data.items||typeof data.items!=='object')return 0;
  let restored=0;
  SYNCABLE_KEYS.forEach(key=>{
    const value=data.items[key];
    if(typeof value==='string'){
      localStorage.setItem(key,value);
      restored++;
    }
  });
  return restored;
}

function displayName(user:AuthUser){
  return user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Student';
}

function avatarFor(user:AuthUser){return user.user_metadata?.avatar_url||user.user_metadata?.picture||''}

function formatCloudTime(value?:string){
  if(!value)return 'No cloud backup yet';
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return 'Cloud backup available';
  return `Last cloud backup ${date.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`;
}

function closeAccountCenter(){
  accountCenterOpen=false;
  document.querySelector('[data-litlab-account-center]')?.remove();
}

function setMessage(card:HTMLElement,text:string,state:'normal'|'success'|'error'='normal'){
  const message=card.querySelector<HTMLElement>('[data-account-message]');
  if(!message)return;
  message.textContent=text;
  message.dataset.state=state;
}

async function openAccountCenter(){
  if(accountCenterOpen)return;
  const session=readSession();
  if(!session)return;
  accountCenterOpen=true;

  const overlay=document.createElement('div');
  overlay.className='litlab-account-center-overlay';
  overlay.dataset.litlabAccountCenter='true';
  overlay.innerHTML='<section class="litlab-account-center-card" role="dialog" aria-modal="true" aria-label="My LitLab"><div class="litlab-account-center-loading"><span>LL</span><b>Loading My LitLab…</b></div></section>';
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)closeAccountCenter()});
  document.body.append(overlay);

  const user=await loadUser(session);
  if(!user){
    const card=overlay.querySelector<HTMLElement>('.litlab-account-center-card');
    if(card)card.innerHTML='<button type="button" class="litlab-account-center-close" aria-label="Close">×</button><div class="litlab-account-center-error"><b>Could not load your LitLab account.</b><p>Close this window and try again. Your normal LitLab progress on this device is unchanged.</p></div>';
    card?.querySelector('button')?.addEventListener('click',closeAccountCenter);
    return;
  }

  void touchProfile(session,user);
  const remote=await readCloud(session,user.id);
  const stats=progressStats();
  const avatar=avatarFor(user);
  const card=overlay.querySelector<HTMLElement>('.litlab-account-center-card');
  if(!card)return;

  card.innerHTML=`
    <button type="button" class="litlab-account-center-close" aria-label="Close">×</button>
    <header class="litlab-account-center-head">
      ${avatar?`<img src="${escapeHTML(avatar)}" alt="" referrerpolicy="no-referrer">`:'<span class="litlab-account-center-avatar">LL</span>'}
      <div><span>MY LITLAB</span><h2>${escapeHTML(displayName(user))}</h2><p>${escapeHTML(user.email||'Google account')}</p></div>
      <i>Google connected</i>
    </header>
    <section class="litlab-account-center-stats" aria-label="Current device progress">
      <article><b>${stats.guides}</b><span>guides reviewed</span></article>
      <article><b>${stats.books}</b><span>books reviewed</span></article>
      <article><b>${stats.skills}</b><span>skills completed</span></article>
      <article><b>${stats.ee}</b><span>EE checks done</span></article>
    </section>
    <section class="litlab-account-center-cloud">
      <div class="litlab-account-center-cloud-head"><span>☁</span><div><b>Cloud backup</b><p data-cloud-time>${formatCloudTime(remote?.updated_at||remote?.data?.updated_at)}</p></div></div>
      <p class="litlab-account-center-explain">This is deliberately manual so account features cannot interfere with LitLab's navigation or practice tools. Save when you want this device's progress stored with your Google account, then restore it on another device.</p>
      <div class="litlab-account-center-actions">
        <button type="button" class="primary" data-account-save>Save this device to cloud</button>
        <button type="button" data-account-restore ${remote?.data?'':'disabled'}>Restore cloud progress</button>
      </div>
      <small data-account-message data-state="normal">Only LitLab learning progress is included. Your Google password and other Google data are never stored by LitLab.</small>
    </section>
    <footer><span>${stats.practiced} authorial-choice terms practiced on this device</span><b>Private to your account</b></footer>`;

  card.querySelector<HTMLButtonElement>('.litlab-account-center-close')?.addEventListener('click',closeAccountCenter);
  card.querySelector<HTMLButtonElement>('[data-account-save]')?.addEventListener('click',async event=>{
    const button=event.currentTarget;
    button.disabled=true;
    button.textContent='Saving…';
    setMessage(card,'Saving your current LitLab progress…');
    try{
      const savedAt=await saveCloud(session,user);
      const time=card.querySelector<HTMLElement>('[data-cloud-time]');
      if(time)time.textContent=formatCloudTime(savedAt);
      const restore=card.querySelector<HTMLButtonElement>('[data-account-restore]');
      if(restore)restore.disabled=false;
      setMessage(card,'Cloud backup saved successfully.','success');
    }catch{
      setMessage(card,'Could not save right now. Your progress on this device is still safe.','error');
    }finally{
      button.disabled=false;
      button.textContent='Save this device to cloud';
    }
  });

  card.querySelector<HTMLButtonElement>('[data-account-restore]')?.addEventListener('click',async event=>{
    const button=event.currentTarget;
    if(!window.confirm('Restore your saved LitLab cloud progress onto this device? Existing matching LitLab progress fields on this device will be replaced.'))return;
    button.disabled=true;
    button.textContent='Restoring…';
    setMessage(card,'Restoring the saved progress for this account…');
    const latest=await readCloud(session,user.id);
    const count=latest?.data?restoreCloud(latest.data):0;
    if(!count){
      button.disabled=false;
      button.textContent='Restore cloud progress';
      setMessage(card,'No restorable cloud progress was found.','error');
      return;
    }
    setMessage(card,'Progress restored. Reloading LitLab…','success');
    window.setTimeout(()=>location.reload(),450);
  });
}

function injectAccountCenterEntry(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu||menu.querySelector('[data-open-account-center]'))return;

  const status=menu.querySelector<HTMLElement>('.litlab-account-status small');
  if(status)status.textContent='My LitLab cloud backup is available.';

  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-account-center-entry';
  button.dataset.openAccountCenter='true';
  button.innerHTML='<span>☁</span><div><b>My LitLab</b><small>Progress & cloud backup</small></div><i>›</i>';
  button.addEventListener('click',event=>{
    event.stopPropagation();
    void openAccountCenter();
  });

  const signout=menu.querySelector('.litlab-signout');
  if(signout)menu.insertBefore(button,signout);
  else menu.append(button);
}

// The existing auth trigger stops click bubbling. Capture is used only to schedule a one-time
// account-menu enhancement after that specific trigger is clicked. This listener never prevents,
// stops, rewrites, or handles any other LitLab interaction.
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('.litlab-account-trigger'))return;
  window.setTimeout(injectAccountCenterEntry,0);
},true);

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&accountCenterOpen)closeAccountCenter()});
window.addEventListener('hashchange',()=>{if(accountCenterOpen)closeAccountCenter()});
