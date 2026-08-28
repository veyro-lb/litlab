import './admin-contributor-workspace-updates.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=20_000;
const NOTICE_KEY='litlabAdminWorkspaceUpdateNotice';

type StoredSession={access_token?:string};
type Update={kind:'document'|'revision_response'|'teacher_review';update_id:string;application_id:string;created_at:string;full_name:string;topics:string;label:string};

let updates:Update[]=[];
let isAdmin:boolean|null=null;
let loading=false;
let timer=0;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{if(!navigator.onLine)throw new Error('offline');const c=new AbortController();const t=setTimeout(()=>c.abort(),REQUEST_TIMEOUT_MS);try{const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:c.signal});if(!r.ok)throw new Error(`${name} failed (${r.status})`);const text=await r.text();return (text?JSON.parse(text):null) as T}finally{clearTimeout(t)}}
function latest(){return updates.slice().sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))[0]||null}
function label(item:Update){if(item.kind==='document')return `New DOCX from ${item.full_name}`;if(item.kind==='teacher_review')return `New teacher review from ${item.full_name}`;return `Revision response from ${item.full_name}`}
function badgeLabel(item:Update){return item.kind==='document'?'New DOCX':item.kind==='teacher_review'?'Teacher review':'Revision reply'}

function applyAccountDot(){document.documentElement.toggleAttribute('data-litlab-admin-workspace-update',updates.length>0)}
function applyMenu(){const button=document.querySelector<HTMLElement>('[data-open-admin-contributors]');if(!button)return;button.classList.toggle('has-admin-workspace-update',updates.length>0);let badge=button.querySelector<HTMLElement>('[data-admin-workspace-menu-badge]');if(updates.length&&!badge){badge=document.createElement('span');badge.dataset.adminWorkspaceMenuBadge='true';badge.className='admin-workspace-menu-badge';button.appendChild(badge)}if(badge){if(updates.length)badge.textContent=String(updates.length);else badge.remove()}}
function applyCards(){if(route()!=='admin-contributors')return;const byApp=new Map<string,Update>();updates.forEach(u=>{if(!byApp.has(u.application_id))byApp.set(u.application_id,u)});document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach(card=>{const item=byApp.get(card.dataset.appId||'');card.classList.toggle('has-admin-workspace-update',Boolean(item));let badge=card.querySelector<HTMLElement>('[data-admin-workspace-update-badge]');if(item&&!badge){badge=document.createElement('span');badge.dataset.adminWorkspaceUpdateBadge='true';badge.className='admin-workspace-update-badge';card.querySelector('summary')?.appendChild(badge)}if(badge){if(item)badge.textContent=badgeLabel(item);else badge.remove()}const manage=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');if(manage)manage.classList.toggle('has-admin-workspace-update',Boolean(item))})}
function showNotice(){
  const item=latest();if(!item)return;
  // Application/chat updates use a separate card. Keep the red state while
  // waiting so the admin sees both updates without overlapping popups.
  if(document.getElementById('ll-admin-contributor-update-notice'))return;
  const key=`${item.kind}:${item.update_id}`;
  try{if(sessionStorage.getItem(NOTICE_KEY)===key)return}catch{}
  document.getElementById('ll-admin-workspace-update-notice')?.remove();
  const n=document.createElement('aside');n.id='ll-admin-workspace-update-notice';n.className='ll-admin-workspace-update-notice';n.dataset.applicationId=item.application_id;n.dataset.updateKind=item.kind;n.innerHTML=`<button type="button" data-close aria-label="Dismiss">×</button><span>NEW CONTRIBUTOR UPDATE</span><div><i>●</i><section><b>${esc(label(item))}</b><p>${esc(item.topics||item.label)}</p></section></div><button type="button" data-open>Open contributor dashboard →</button>`;
  const dismiss=()=>{try{sessionStorage.setItem(NOTICE_KEY,key)}catch{}n.classList.add('is-closing');setTimeout(()=>n.remove(),220)};
  n.querySelector('[data-close]')?.addEventListener('click',dismiss);
  n.querySelector('[data-open]')?.addEventListener('click',()=>{dismiss();location.hash='admin-contributors'});
  document.body.appendChild(n);requestAnimationFrame(()=>n.classList.add('is-visible'));
}
function apply(){applyAccountDot();applyMenu();applyCards();if(updates.length)showNotice()}
function clear(){updates=[];document.documentElement.removeAttribute('data-litlab-admin-workspace-update');document.querySelectorAll('[data-admin-workspace-menu-badge],[data-admin-workspace-update-badge]').forEach(el=>el.remove())}

async function load(force=false){if(!token()){isAdmin=null;clear();return}if(loading&&!force)return;loading=true;try{if(isAdmin===null)isAdmin=Boolean(await rpc<boolean>('is_litlab_admin'));if(!isAdmin){clear();return}const rows=await rpc<Update[]>('admin_get_litlab_contributor_unread_workspace_updates');updates=Array.isArray(rows)?rows:[];apply()}catch(error){console.debug('Admin workspace updates unavailable',error)}finally{loading=false}}
function schedule(){clearTimeout(timer);timer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load();schedule()},POLL_MS)}

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;if(target.closest('.litlab-account-trigger'))setTimeout(apply,180);if(route()==='admin-contributors'&&target.closest('.admin-contrib-card'))setTimeout(applyCards,80)},true);
window.addEventListener('hashchange',()=>setTimeout(()=>{void load(true);applyCards()},140));
window.addEventListener('focus',()=>{void load(true);schedule()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);return}void load(true);schedule()});
window.addEventListener('online',()=>void load(true));
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){isAdmin=null;clear();void load(true)}});
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>setTimeout(()=>void load(true),450));

setTimeout(()=>void load(true),1000);schedule();