import './contributor-workspace-updates.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=20_000;
const NOTICE_KEY='litlabContributorWorkspaceNotice';
const FOCUS_KEY='litlabContributorFocusApplication';

type StoredSession={access_token?:string};
type Update={kind:'brief'|'task'|'revision'|'teacher_assignment'|'certificate';update_id:string;application_id:string;created_at:string;topics:string;label:string};

let updates:Update[]=[];
let loading=false;
let timer=0;
let developerAccess:boolean|null=null;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]||ch))}
async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{if(!navigator.onLine)throw new Error('offline');const c=new AbortController();const t=setTimeout(()=>c.abort(),REQUEST_TIMEOUT_MS);try{const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:c.signal});if(!r.ok)throw new Error(`${name} failed (${r.status})`);const text=await r.text();return (text?JSON.parse(text):null) as T}finally{clearTimeout(t)}}
function latest(){return updates.slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}
function title(item:Update){if(item.kind==='brief')return 'LitLab updated your project brief';if(item.kind==='task')return 'You have a new task or task update';if(item.kind==='revision')return 'LitLab updated a revision request';if(item.kind==='certificate')return 'Your LitLab Contributor Certificate is ready';return 'You have a new teacher review assignment'}

function apply(){const active=updates.length>0;document.documentElement.toggleAttribute('data-litlab-user-workspace-update',active);document.querySelectorAll<HTMLElement>('[data-contributor-account-status]').forEach(el=>el.classList.toggle('has-workspace-update',active));if(active)showNotice();else document.getElementById('ll-user-workspace-update-notice')?.remove()}
function clear(){updates=[];document.documentElement.removeAttribute('data-litlab-user-workspace-update');document.querySelectorAll<HTMLElement>('[data-contributor-account-status]').forEach(el=>el.classList.remove('has-workspace-update'))}
function focusContribution(item:Update){
  try{sessionStorage.setItem(FOCUS_KEY,item.application_id)}catch{}
  const fire=()=>window.dispatchEvent(new CustomEvent('litlab:open-contribution-detail',{detail:{applicationId:item.application_id,kind:item.kind}}));
  if(route()==='contribute'){fire();return}
  location.hash='contribute';
  window.setTimeout(fire,500);
}
function showNotice(){
  const item=latest();if(!item)return;
  // Keep the unread state, but do not stack this card over the status/live-chat card.
  if(document.getElementById('ll-contributor-status-notice'))return;
  const key=`${item.kind}:${item.update_id}:${item.created_at}`;
  try{if(sessionStorage.getItem(NOTICE_KEY)===key)return}catch{}
  document.getElementById('ll-user-workspace-update-notice')?.remove();
  const n=document.createElement('aside');n.id='ll-user-workspace-update-notice';n.className='ll-user-workspace-update-notice';n.setAttribute('role','status');n.setAttribute('aria-live','polite');
  n.innerHTML=`<button type="button" data-close aria-label="Dismiss">×</button><span>${item.kind==='certificate'?'CERTIFICATE READY':'NEW CONTRIBUTOR UPDATE'}</span><div><i>${item.kind==='certificate'?'✓':'●'}</i><section><b>${esc(title(item))}</b><p>${esc(item.topics||item.label)}${item.label&&item.label!==(item.topics||'')?` • ${esc(item.label)}`:''}</p></section></div><button type="button" data-open>${item.kind==='certificate'?'View this contribution & certificate →':'Open this contribution →'}</button>`;
  const dismiss=()=>{try{sessionStorage.setItem(NOTICE_KEY,key)}catch{}n.classList.add('is-closing');setTimeout(()=>n.remove(),220)};
  n.querySelector('[data-close]')?.addEventListener('click',dismiss);
  n.querySelector('[data-open]')?.addEventListener('click',()=>{dismiss();focusContribution(item)});
  document.body.appendChild(n);requestAnimationFrame(()=>n.classList.add('is-visible'));
}

async function load(force=false){
  if(!token()){developerAccess=null;clear();return}
  if(loading&&!force)return;loading=true;
  try{
    if(developerAccess===null)developerAccess=Boolean(await rpc<boolean>('is_litlab_admin'));
    if(developerAccess){clear();return}
    const rows=await rpc<Update[]>('get_my_litlab_contributor_unread_workspace_updates');
    updates=Array.isArray(rows)?rows:[];apply();
  }catch(error){console.debug('Contributor workspace updates unavailable',error)}finally{loading=false}
}
function schedule(){clearTimeout(timer);timer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load();schedule()},POLL_MS)}
function markCertificateReadFromButton(button:Element){
  const holder=button.closest<HTMLElement>('[data-contributor-completion-archive],[data-history-contribution]');
  const applicationId=holder?.dataset.applicationId||holder?.dataset.historyContribution||'';
  if(!applicationId)return;
  void rpc<boolean>('mark_my_litlab_contributor_certificate_read',{p_application_id:applicationId}).then(()=>{window.dispatchEvent(new CustomEvent('litlab:certificate-read',{detail:{applicationId}}));return load(true)}).catch(error=>console.debug('Certificate read state unavailable',error));
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('.litlab-account-trigger'))setTimeout(apply,180);
  const certificateButton=target.closest('[data-download-contributor-certificate],[data-history-download-certificate]');if(certificateButton)window.setTimeout(()=>markCertificateReadFromButton(certificateButton),0);
},true);
window.addEventListener('hashchange',()=>setTimeout(()=>void load(true),250));
window.addEventListener('focus',()=>{void load(true);schedule()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);return}void load(true);schedule()});
window.addEventListener('online',()=>void load(true));
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){developerAccess=null;clear();void load(true)}});
window.addEventListener('litlab:contributor-workspace-updated',()=>setTimeout(()=>void load(true),250));
window.addEventListener('litlab:certificate-read',()=>setTimeout(()=>void load(true),120));

setTimeout(()=>void load(true),1100);schedule();
