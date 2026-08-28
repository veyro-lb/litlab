export {};
import './contributor-history.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';
const REQUEST_TIMEOUT_MS=12_000;
const HISTORY_POLL_MS=20_000;

type StoredSession={access_token?:string};
type ContributionStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Contribution={
  id:string;
  created_at:string;
  status_updated_at?:string|null;
  applicant_type:'student'|'teacher';
  contribution_type:string;
  topics:string;
  contribution_idea:string;
  status:ContributionStatus;
};

let loading=false;
let lastLoaded=0;
let cached:Contribution[]=[];
let scanQueued=false;
let retryTimer=0;
let mountAttempts=0;
let pollTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function signedIn(){return Boolean(token())}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:string){return value.replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?'—':date.toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'})}

function statusLabel(status:ContributionStatus){
  return ({new:'Pending review',reviewing:'Needs review',accepted:'Approved',declined:'Not approved',completed:'Completed'} as const)[status];
}
function approvalLabel(status:ContributionStatus){
  if(status==='accepted'||status==='completed')return 'Approved';
  if(status==='declined')return 'Not approved';
  return 'Not decided yet';
}
function statusCopy(status:ContributionStatus){
  if(status==='new')return 'LitLab has received this contribution and has not reviewed it yet.';
  if(status==='reviewing')return 'LitLab is reviewing this contribution and may contact you for changes or clarification.';
  if(status==='accepted')return 'This contribution has been approved by LitLab. It remains saved to your account while you work on or complete it.';
  if(status==='declined')return 'This contribution was not approved for publication in its current form.';
  return 'This contribution has been approved and marked as completed.';
}

function section(){return document.querySelector<HTMLElement>('[data-my-contributions]')}
function mount(){
  if(route()!=='contribute')return null;
  const page=document.querySelector<HTMLElement>('.ll-contrib-page');
  const apply=page?.querySelector<HTMLElement>('#contribute-apply');
  if(!page||!apply)return null;
  let root=section();
  if(root)return root;
  root=document.createElement('section');
  root.className='ll-contrib-section ll-my-contributions';
  root.dataset.myContributions='true';
  apply.before(root);
  return root;
}

function setMarkup(root:HTMLElement,key:string,markup:string){
  if(root.dataset.renderKey===key)return;
  root.dataset.renderKey=key;
  root.innerHTML=markup;
}

async function fetchMine(){
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},
      body:'{}',
      signal:controller.signal
    });
    if(!response.ok)throw new Error(`Contributor history failed (${response.status})`);
    const rows=await response.json() as Contribution[];
    return Array.isArray(rows)?rows:[];
  }finally{
    window.clearTimeout(timeout);
  }
}

async function loadMine(force=false,quiet=false){
  if(route()!=='contribute'||!signedIn()||loading)return;
  if(!force&&lastLoaded&&Date.now()-lastLoaded<15_000){render();return}
  loading=true;
  if(!quiet&&!lastLoaded)renderLoading();
  try{
    const rows=await fetchMine();
    if(route()!=='contribute')return;
    cached=rows;
    lastLoaded=Date.now();
    render();
  }catch(error){
    console.error(error);
    if(!cached.length&&!lastLoaded)renderError();
  }finally{loading=false}
}

function signIn(){
  sessionStorage.setItem(RETURN_KEY,'#contribute');
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',`${location.origin}${location.pathname}`);
  location.href=authorize.toString();
}

function renderSignedOut(){
  const root=mount();
  if(!root)return;
  setMarkup(root,'signed-out',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Sign in to see the contributions connected to your LitLab account and whether each one has been approved.</p></div><div class="ll-my-contrib-gate"><div><span>ACCOUNT HISTORY</span><h3>Your contribution history stays with your account.</h3><p>Once signed in, this page shows every contribution you submitted, its review status and whether LitLab approved it.</p></div><button type="button" data-my-contrib-signin>Sign in to view contributions</button></div>`);
  root.querySelector<HTMLButtonElement>('[data-my-contrib-signin]')?.addEventListener('click',signIn);
}

function renderLoading(){
  const root=mount();
  if(!root)return;
  setMarkup(root,'loading',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Track what you have submitted and whether LitLab has approved it.</p></div><div class="ll-my-contrib-loading"><span></span><p>Loading your contributions…</p></div>`);
}

function card(item:Contribution){
  return `<article class="ll-my-contrib-card status-${esc(item.status)}">
    <header><div><span>${esc(item.applicant_type==='teacher'?'Teacher contribution':'Student contribution')}</span><h3>${esc(item.topics||'Untitled contribution')}</h3></div><span class="ll-my-contrib-status">${esc(statusLabel(item.status))}</span></header>
    <div class="ll-my-contrib-meta"><span>${esc(label(item.contribution_type))}</span><span>Submitted ${esc(fmtDate(item.created_at))}</span><span class="approval">Approval: <b>${esc(approvalLabel(item.status))}</b></span></div>
    <p class="ll-my-contrib-idea">${esc(item.contribution_idea||'No contribution description provided.')}</p>
    <p class="ll-my-contrib-status-copy">${esc(statusCopy(item.status))}</p>
  </article>`;
}

function render(){
  const root=mount();
  if(!root)return;
  const approved=cached.filter(item=>item.status==='accepted'||item.status==='completed').length;
  const activeApproved=cached.filter(item=>item.status==='accepted').length;
  const completed=cached.filter(item=>item.status==='completed').length;
  const signature=cached.map(item=>`${item.id}:${item.status}:${item.status_updated_at||item.created_at}`).join('|');
  const contributorBanner=approved?`<div class="ll-my-contributor-badge"><span>✓</span><div><b>Approved LitLab Contributor</b><p>${activeApproved?`${activeApproved} approved contribution${activeApproved===1?' is':'s are'} currently active.`:''}${activeApproved&&completed?' ':''}${completed?`${completed} contribution${completed===1?' has':'s have'} been completed.`:''}</p></div></div>`:'';
  setMarkup(root,`history:${signature}`,`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Everything below is tied to your signed-in account. Approved contributions stay visible here and status changes made by LitLab remain saved to your account.</p></div>
    ${contributorBanner}
    <div class="ll-my-contrib-summary"><div><strong>${cached.length}</strong><span>Total submitted</span></div><div><strong>${approved}</strong><span>Approved</span></div><button type="button" data-my-contrib-refresh>Refresh status</button></div>
    ${cached.length?`<div class="ll-my-contrib-list">${cached.map(card).join('')}</div>`:'<div class="ll-my-contrib-empty"><span>✦</span><h3>No contributions yet.</h3><p>When you submit your first contributor application, it will appear here with its review and approval status.</p></div>'}`);
  root.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]')?.addEventListener('click',()=>void loadMine(true));
}

function renderError(){
  const root=mount();
  if(!root)return;
  setMarkup(root,'error',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2></div><div class="ll-my-contrib-error"><h3>Could not load your contribution history.</h3><p>${navigator.onLine?'Your submissions are still saved. Try again in a moment.':'You are offline. Your saved contribution history will return when you reconnect.'}</p><button type="button" data-my-contrib-retry>Try again</button></div>`);
  root.querySelector<HTMLButtonElement>('[data-my-contrib-retry]')?.addEventListener('click',()=>void loadMine(true));
}

function retryMount(){
  if(route()!=='contribute'||section()||mountAttempts>=20)return;
  mountAttempts+=1;
  window.clearTimeout(retryTimer);
  retryTimer=window.setTimeout(scheduleScan,100);
}

function scan(){
  scanQueued=false;
  if(route()!=='contribute')return;
  if(!mount()){retryMount();return}
  mountAttempts=0;
  if(!signedIn()){cached=[];lastLoaded=0;renderSignedOut();return}
  void loadMine();
}
function scheduleScan(){
  if(scanQueued)return;
  scanQueued=true;
  requestAnimationFrame(scan);
}

function clearPoll(){window.clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(delay=HISTORY_POLL_MS){
  clearPoll();
  if(route()!=='contribute')return;
  pollTimer=window.setTimeout(async()=>{
    if(route()==='contribute'&&signedIn()&&!document.hidden&&navigator.onLine)await loadMine(true,true);
    if(route()==='contribute')schedulePoll();
  },delay);
}

window.addEventListener('hashchange',()=>{
  cached=[];lastLoaded=0;mountAttempts=0;
  window.clearTimeout(retryTimer);
  clearPoll();
  scheduleScan();
  if(route()==='contribute')schedulePoll();
});
window.addEventListener('litlab:contributor-submitted',()=>{cached=[];lastLoaded=0;setTimeout(()=>void loadMine(true),300)});
window.addEventListener('focus',()=>{if(route()==='contribute'&&signedIn()){void loadMine(true,true);schedulePoll()}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearPoll();return}
  if(route()==='contribute'&&signedIn()){void loadMine(true,true);schedulePoll()}
});
window.addEventListener('online',()=>{if(route()==='contribute'&&signedIn())void loadMine(true,true)});

function start(){scheduleScan();if(route()==='contribute')schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
