import './google-auth.css';

// Public browser configuration. Never place a Supabase secret/service-role key here.
const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';
const ERROR_KEY='litlabAuthError';

type StoredSession={access_token:string;refresh_token:string;expires_at:number;token_type:string};
type AuthUser={id:string;email?:string;user_metadata?:{full_name?:string;name?:string;avatar_url?:string;picture?:string}};

let currentUser:AuthUser|null=null;
let accountMenuOpen=false;
let modalOpen=false;

const readSession=():StoredSession|null=>{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return value&&typeof value.access_token==='string'&&typeof value.refresh_token==='string'?value:null;
  }catch{return null}
};

const saveSession=(session:StoredSession)=>localStorage.setItem(SESSION_KEY,JSON.stringify(session));
const clearSession=()=>{localStorage.removeItem(SESSION_KEY);currentUser=null};

function handleOAuthReturn(){
  const raw=location.hash.startsWith('#')?location.hash.slice(1):'';
  if(!raw)return;
  const params=new URLSearchParams(raw);
  const access=params.get('access_token');
  const refresh=params.get('refresh_token');
  const error=params.get('error_description')||params.get('error');
  if(!access&&!error)return;

  if(access&&refresh){
    const expiresIn=Number(params.get('expires_in')||3600);
    saveSession({
      access_token:access,
      refresh_token:refresh,
      expires_at:Math.floor(Date.now()/1000)+Math.max(60,expiresIn),
      token_type:params.get('token_type')||'bearer'
    });
  }
  if(error)sessionStorage.setItem(ERROR_KEY,error);

  const returnHash=sessionStorage.getItem(RETURN_KEY)||'#home';
  sessionStorage.removeItem(RETURN_KEY);
  history.replaceState(null,'',`${location.pathname}${location.search}${returnHash}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

handleOAuthReturn();

async function refreshSession(session:StoredSession):Promise<StoredSession|null>{
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},
      body:JSON.stringify({refresh_token:session.refresh_token})
    });
    if(!response.ok)return null;
    const data=await response.json() as {access_token?:string;refresh_token?:string;expires_in?:number;token_type?:string};
    if(!data.access_token||!data.refresh_token)return null;
    const next:StoredSession={
      access_token:data.access_token,
      refresh_token:data.refresh_token,
      expires_at:Math.floor(Date.now()/1000)+Math.max(60,Number(data.expires_in||3600)),
      token_type:data.token_type||'bearer'
    };
    saveSession(next);
    return next;
  }catch{return null}
}

async function validSession():Promise<StoredSession|null>{
  const session=readSession();
  if(!session)return null;
  if(session.expires_at-Math.floor(Date.now()/1000)>90)return session;
  const refreshed=await refreshSession(session);
  if(!refreshed)clearSession();
  return refreshed;
}

async function loadUser(){
  const session=await validSession();
  if(!session){currentUser=null;renderAuth();return}
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`}
    });
    if(response.status===401){
      const refreshed=await refreshSession(session);
      if(!refreshed){clearSession();renderAuth();return}
      return loadUser();
    }
    if(!response.ok)throw new Error('Unable to load account');
    currentUser=await response.json() as AuthUser;
  }catch{
    currentUser=null;
  }
  renderAuth();
}

function signInWithGoogle(){
  const returnHash=location.hash&& !location.hash.includes('access_token=')?location.hash:'#home';
  sessionStorage.setItem(RETURN_KEY,returnHash);
  const redirectTo=`${location.origin}${location.pathname}`;
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',redirectTo);
  location.assign(authorize.toString());
}

async function signOut(){
  const session=readSession();
  clearSession();
  accountMenuOpen=false;
  modalOpen=false;
  renderAuth();
  if(!session)return;
  try{
    await fetch(`${SUPABASE_URL}/auth/v1/logout`,{
      method:'POST',
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`}
    });
  }catch{}
}

function displayName(user:AuthUser){
  return user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Student';
}

function initials(user:AuthUser){
  const name=displayName(user).trim();
  const parts=name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0]||'S')+(parts.length>1?(parts[parts.length-1]?.[0]||''):'')).toUpperCase();
}

function closeModal(){modalOpen=false;document.querySelector('[data-auth-modal]')?.remove()}

function openModal(){
  modalOpen=true;
  document.querySelector('[data-auth-modal]')?.remove();
  const overlay=document.createElement('div');
  overlay.className='litlab-auth-modal';
  overlay.dataset.authModal='true';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Sign in to LitLab');
  overlay.innerHTML=`<div class="litlab-auth-dialog">
    <button type="button" class="litlab-auth-close" aria-label="Close">×</button>
    <div class="litlab-auth-mark">LL</div>
    <span class="litlab-auth-eyebrow">MY LITLAB</span>
    <h2>Sign in to LitLab</h2>
    <p>Use your Google account to create or access your LitLab account. LitLab only requests your basic profile and email for sign-in.</p>
    <button type="button" class="litlab-google-button"><span class="litlab-google-g">G</span><b>Continue with Google</b></button>
    <small>Your Google password is never shared with LitLab.</small>
    <div class="litlab-auth-error" data-auth-error hidden></div>
  </div>`;
  overlay.addEventListener('mousedown',event=>{if(event.target===overlay)closeModal()});
  overlay.querySelector<HTMLButtonElement>('.litlab-auth-close')?.addEventListener('click',closeModal);
  overlay.querySelector<HTMLButtonElement>('.litlab-google-button')?.addEventListener('click',signInWithGoogle);
  const error=sessionStorage.getItem(ERROR_KEY);
  if(error){
    sessionStorage.removeItem(ERROR_KEY);
    const box=overlay.querySelector<HTMLElement>('[data-auth-error]');
    if(box){box.hidden=false;box.textContent=`Sign-in error: ${error}`}
  }
  document.body.append(overlay);
  overlay.querySelector<HTMLButtonElement>('.litlab-google-button')?.focus();
}

function buildAuthRoot(){
  const root=document.createElement('div');
  root.className='litlab-auth-root';
  root.dataset.litlabAuthRoot='true';
  return root;
}

function renderAuth(){
  const topActions=document.querySelector<HTMLElement>('.topbar .top-actions');
  if(!topActions)return;
  let root=topActions.querySelector<HTMLElement>('[data-litlab-auth-root]');
  if(!root){
    root=buildAuthRoot();
    topActions.prepend(root);
  }
  root.replaceChildren();

  if(!currentUser){
    const button=document.createElement('button');
    button.type='button';
    button.className='litlab-auth-signin';
    button.innerHTML='<span class="litlab-google-g small">G</span><span class="litlab-auth-label">Sign in</span>';
    button.addEventListener('click',openModal);
    root.append(button);
    if(sessionStorage.getItem(ERROR_KEY)&&!modalOpen)openModal();
    return;
  }

  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='litlab-account-trigger';
  trigger.setAttribute('aria-expanded',String(accountMenuOpen));
  const avatar=currentUser.user_metadata?.avatar_url||currentUser.user_metadata?.picture;
  if(avatar){
    const img=document.createElement('img');img.src=avatar;img.alt='';img.referrerPolicy='no-referrer';trigger.append(img);
  }else{
    const badge=document.createElement('span');badge.className='litlab-account-initials';badge.textContent=initials(currentUser);trigger.append(badge);
  }
  const label=document.createElement('span');label.className='litlab-auth-label';label.textContent=displayName(currentUser);trigger.append(label);
  const chevron=document.createElement('span');chevron.className='litlab-account-chevron';chevron.textContent='⌄';trigger.append(chevron);
  trigger.addEventListener('click',event=>{event.stopPropagation();accountMenuOpen=!accountMenuOpen;renderAuth()});
  root.append(trigger);

  if(accountMenuOpen){
    const menu=document.createElement('div');menu.className='litlab-account-menu';
    const head=document.createElement('div');head.className='litlab-account-head';
    const name=document.createElement('b');name.textContent=displayName(currentUser);
    const email=document.createElement('span');email.textContent=currentUser.email||'';
    head.append(name,email);menu.append(head);
    const divider=document.createElement('div');divider.className='litlab-account-divider';menu.append(divider);
    const status=document.createElement('div');status.className='litlab-account-status';status.innerHTML='<span>✓</span><p><b>Google account connected</b><small>Progress sync can be added next.</small></p>';menu.append(status);
    const out=document.createElement('button');out.type='button';out.className='litlab-signout';out.textContent='Sign out';out.addEventListener('click',()=>void signOut());menu.append(out);
    root.append(menu);
  }
}

let scheduled=false;
function scheduleRender(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;renderAuth()});
}

const observer=new MutationObserver(scheduleRender);
const app=document.getElementById('root');if(app)observer.observe(app,{childList:true,subtree:true});
window.addEventListener('hashchange',scheduleRender);
document.addEventListener('click',event=>{
  if(accountMenuOpen&&!((event.target as Element|null)?.closest?.('[data-litlab-auth-root]'))){accountMenuOpen=false;renderAuth()}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){accountMenuOpen=false;if(modalOpen)closeModal();renderAuth()}});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void loadUser(),{once:true});else void loadUser();
