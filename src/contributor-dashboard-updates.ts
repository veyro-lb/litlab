import './contributor-dashboard-updates.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=30_000;

type StoredSession={access_token?:string};
type ProgramNotification={
  id:string;
  application_id?:string|null;
  kind?:string|null;
  title:string;
  body:string;
  action_hash?:string|null;
  created_at:string;
  is_unread?:boolean;
};

let rows:ProgramNotification[]=[];
let selectedApplicationId='';
let loading=false;
let pollTimer=0;
let renderTimer=0;
let expanded=false;

function token(){
  try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}
}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'update').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function stamp(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function unique(input:ProgramNotification[]){
  const seen=new Set<string>();
  return input.filter(item=>{const key=item.id;if(!key||seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
}
function visibleRows(){
  const all=unique(rows);
  if(!selectedApplicationId)return all;
  const scoped=all.filter(item=>!item.application_id||item.application_id===selectedApplicationId);
  return scoped.length?scoped:all;
}

function removeStandaloneUi(){
  document.querySelectorAll('[data-v3-notifications]').forEach(el=>el.remove());
  document.querySelectorAll('.ll-v3-notification-overlay').forEach(el=>el.remove());
}

function cardMarkup(){
  const items=visibleRows();
  const unread=items.filter(item=>item.is_unread).length;
  const shown=expanded?items:items.slice(0,4);
  return `<section class="ll-dashboard-updates ${unread?'has-unread':''}" data-dashboard-updates aria-label="Contributor updates">
    <header class="ll-dashboard-updates-head">
      <div class="ll-dashboard-updates-title"><span class="ll-dashboard-updates-icon" aria-hidden="true">${unread?'●':'✓'}</span><div><small>CONTRIBUTOR DASHBOARD</small><h3>Project updates</h3><p>${unread?`${unread} unread update${unread===1?'':'s'} needs your attention.`:'Briefs, reviews, assignments and publication updates stay here.'}</p></div></div>
      <div class="ll-dashboard-updates-actions">${unread?'<button type="button" data-dashboard-mark-read>Mark visible read</button>':''}<span class="ll-dashboard-updates-count">${items.length}</span></div>
    </header>
    <div class="ll-dashboard-updates-list">
      ${shown.length?shown.map(item=>`<button type="button" class="ll-dashboard-update ${item.is_unread?'is-unread':''}" data-dashboard-update="${esc(item.id)}" data-action="${esc(item.action_hash||'#contribute')}">
        <i aria-hidden="true">${item.is_unread?'●':'✓'}</i>
        <div><div class="ll-dashboard-update-meta"><span>${esc(label(item.kind))}</span><time>${esc(stamp(item.created_at))}</time></div><b>${esc(item.title)}</b><p>${esc(item.body)}</p></div><em aria-hidden="true">›</em>
      </button>`).join(''):'<div class="ll-dashboard-updates-empty"><span>✓</span><div><b>You’re all caught up.</b><p>New contributor-program updates will appear here inside your dashboard.</p></div></div>'}
    </div>
    ${items.length>4?`<button type="button" class="ll-dashboard-updates-toggle" data-dashboard-updates-toggle>${expanded?'Show latest 4':'View all updates'} <span>${expanded?'↑':'↓'}</span></button>`:''}
  </section>`;
}

function mount(){
  removeStandaloneUi();
  if(route()!=='contribute'||!token()){document.querySelector('[data-dashboard-updates]')?.remove();return}
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const journey=root.querySelector<HTMLElement>('[data-v3-journey]');
  const existing=root.querySelector<HTMLElement>('[data-dashboard-updates]');
  if(existing)existing.outerHTML=cardMarkup();
  else if(journey)journey.insertAdjacentHTML('afterend',cardMarkup());
  else{const head=root.querySelector<HTMLElement>(':scope > .ll-workspace-head');head?head.insertAdjacentHTML('afterend',cardMarkup()):root.insertAdjacentHTML('afterbegin',cardMarkup())}
}
function schedule(delay=100){window.clearTimeout(renderTimer);renderTimer=window.setTimeout(mount,delay)}

async function load(){
  if(!token()){rows=[];schedule();return}
  if(loading)return;loading=true;
  try{const next=await rpc<ProgramNotification[]>('get_my_litlab_contributor_program_notifications',{p_limit:30});rows=Array.isArray(next)?unique(next):[]}
  catch(error){console.debug('Contributor dashboard updates unavailable',error)}
  finally{loading=false;schedule()}
}
async function markOne(id:string){
  try{await rpc('mark_my_litlab_contributor_program_notification_read',{p_notification_id:id})}catch(error){console.debug('Could not mark contributor update read',error)}
}
async function openUpdate(button:HTMLButtonElement){
  const id=button.dataset.dashboardUpdate||'';const action=button.dataset.action||'#contribute';
  if(id)await markOne(id);
  await load();
  location.hash=action.replace(/^#/,'');
}
async function markVisible(){
  const unread=visibleRows().filter(item=>item.is_unread);
  for(const item of unread)await markOne(item.id);
  await load();
}
function poll(){window.clearTimeout(pollTimer);pollTimer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load();poll()},POLL_MS)}

const observer=new MutationObserver(()=>removeStandaloneUi());
observer.observe(document.documentElement,{childList:true,subtree:true});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const update=target.closest<HTMLButtonElement>('[data-dashboard-update]');if(update){void openUpdate(update);return}
  if(target.closest('[data-dashboard-mark-read]')){void markVisible();return}
  if(target.closest('[data-dashboard-updates-toggle]')){expanded=!expanded;schedule(0)}
},true);
window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<{selectedId?:string}>).detail||{};selectedApplicationId=detail.selectedId||selectedApplicationId;expanded=false;schedule(140);void load()});
window.addEventListener('litlab:contributor-workspace-updated',()=>{schedule(180);void load()});
window.addEventListener('hashchange',()=>{expanded=false;schedule(140);if(route()==='contribute')void load()});
window.addEventListener('focus',()=>{removeStandaloneUi();if(route()==='contribute')void load()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&route()==='contribute')void load()});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){rows=[];selectedApplicationId='';void load()}});

function start(){removeStandaloneUi();schedule(220);void load();poll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
