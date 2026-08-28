import './contributor-new-application-toggle.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type Application={id:string;status?:string;applicant_type?:string};
type JwtPayload={email?:string;user_metadata?:{full_name?:string;name?:string}};

let loading=false;
let expanded=false;
let scanTimer=0;
let scanAttempts=0;
let lastCheck=0;
let hasExisting=false;
let freshFormHTML='';

function token(){
  try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}
}
function payload():JwtPayload|null{
  try{
    const part=token().split('.')[1];if(!part)return null;
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return JSON.parse(atob(normalized)) as JwtPayload;
  }catch{return null}
}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();
  if(!auth||!navigator.onLine)throw new Error('unavailable');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
      body:JSON.stringify(body),
      signal:controller.signal
    });
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function applySection(){return document.querySelector<HTMLElement>('#contribute-apply')}
function applicationForm(){return document.querySelector<HTMLFormElement>('#ll-contributor-form')}
function control(){return document.querySelector<HTMLElement>('[data-new-contribution-control]')}
function removeControl(){control()?.remove()}

function captureFreshForm(){
  const form=applicationForm();
  if(!form||form.querySelector('.ll-contrib-thanks')||freshFormHTML)return;
  freshFormHTML=form.innerHTML;
}
function restoreFreshFormIfNeeded(){
  const form=applicationForm();
  if(!form||!form.querySelector('.ll-contrib-thanks')||!freshFormHTML)return;
  form.innerHTML=freshFormHTML;
  const account=payload();
  const email=form.querySelector<HTMLInputElement>('input[name="email"]');
  const name=form.querySelector<HTMLInputElement>('input[name="full_name"]');
  if(email&&account?.email){email.value=account.email;email.readOnly=true}
  const fullName=account?.user_metadata?.full_name||account?.user_metadata?.name||'';
  if(name&&fullName)name.value=fullName;
  form.dataset.accountState='signed-in';
  form.dispatchEvent(new Event('change',{bubbles:true}));
}

function setApplyVisible(visible:boolean,scroll=false){
  const apply=applySection();
  if(!apply)return;
  if(visible)restoreFreshFormIfNeeded();
  expanded=visible;
  apply.hidden=!visible;
  apply.setAttribute('aria-hidden',visible?'false':'true');
  document.documentElement.toggleAttribute('data-litlab-new-contribution-open',visible&&hasExisting);
  const button=control()?.querySelector<HTMLButtonElement>('[data-new-contribution-toggle]');
  if(button){
    button.setAttribute('aria-expanded',visible?'true':'false');
    button.innerHTML=visible?'<span>×</span><div><b>Close new contribution form</b><small>Your existing contributions stay saved.</small></div>':'<span>＋</span><div><b>Make a new contribution</b><small>Start another student contribution or teacher reviewer application.</small></div><i>Open form →</i>';
  }
  if(visible&&scroll)window.setTimeout(()=>apply.scrollIntoView({behavior:'smooth',block:'start'}),60);
}

function ensureControl(){
  const apply=applySection();
  if(!apply||!hasExisting)return null;
  let box=control();
  if(!box){
    box=document.createElement('aside');
    box.className='ll-new-contribution-control';
    box.dataset.newContributionControl='true';
    box.innerHTML='<button type="button" data-new-contribution-toggle aria-expanded="false"><span>＋</span><div><b>Make a new contribution</b><small>Start another student contribution or teacher reviewer application.</small></div><i>Open form →</i></button>';
    const workspace=document.querySelector<HTMLElement>('[data-contributor-workspace]');
    const history=document.querySelector<HTMLElement>('[data-my-contributions]');
    if(workspace)workspace.before(box);
    else if(history?.parentElement)history.insertAdjacentElement('afterend',box);
    else apply.before(box);
    box.querySelector('[data-new-contribution-toggle]')?.addEventListener('click',()=>setApplyVisible(!expanded,!expanded));
  }
  return box;
}

function applyState(){
  if(route()!=='contribute')return;
  const apply=applySection();
  if(!apply)return;
  if(!token()||!hasExisting){
    removeControl();
    expanded=false;
    apply.hidden=false;
    apply.setAttribute('aria-hidden','false');
    document.documentElement.removeAttribute('data-litlab-new-contribution-open');
    return;
  }
  ensureControl();
  setApplyVisible(expanded,false);
}

async function refresh(force=false){
  if(route()!=='contribute')return;
  captureFreshForm();
  if(!token()){hasExisting=false;applyState();return}
  if(loading)return;
  if(!force&&Date.now()-lastCheck<15_000){applyState();return}
  loading=true;
  try{
    const isAdmin=Boolean(await rpc<boolean>('is_litlab_admin'));
    if(isAdmin){hasExisting=false;expanded=false;removeControl();applyState();return}
    const apps=await rpc<Application[]>('get_my_litlab_contributor_applications');
    hasExisting=Array.isArray(apps)&&apps.length>0;
    lastCheck=Date.now();
    if(!hasExisting)expanded=true;
    else if(!control())expanded=false;
    applyState();
  }catch(error){
    console.debug('New contribution toggle unavailable',error);
    // Fail open: never hide the application form if account state cannot be verified.
    hasExisting=false;
    applyState();
  }finally{loading=false}
}

function scan(){
  window.clearTimeout(scanTimer);
  if(route()!=='contribute')return;
  if(applySection()){
    scanAttempts=0;
    window.setTimeout(()=>{captureFreshForm();void refresh(true)},180);
    return;
  }
  if(scanAttempts++<25)scanTimer=window.setTimeout(scan,120);
}

window.addEventListener('hashchange',()=>{
  expanded=false;
  lastCheck=0;
  freshFormHTML='';
  removeControl();
  scanAttempts=0;
  window.setTimeout(scan,100);
});
window.addEventListener('focus',()=>{if(route()==='contribute')void refresh(false)});
window.addEventListener('online',()=>{if(route()==='contribute')void refresh(true)});
window.addEventListener('storage',event=>{
  if(event.key!==SESSION_KEY)return;
  expanded=false;hasExisting=false;lastCheck=0;freshFormHTML='';removeControl();
  window.setTimeout(scan,80);
});
window.addEventListener('litlab:contributor-submitted',()=>{
  hasExisting=true;
  expanded=false;
  lastCheck=0;
  window.setTimeout(()=>{applyState();void refresh(true)},350);
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-workspace-go-apply]')&&hasExisting){
    event.preventDefault();
    event.stopPropagation();
    setApplyVisible(true,true);
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
