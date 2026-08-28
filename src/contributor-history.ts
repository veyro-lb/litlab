export {};
import './contributor-history.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';

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
  if(status==='accepted')return 'This contribution has been approved by LitLab.';
  if(status==='declined')return 'This contribution was not approved for publication in its current form.';
  return 'This contribution has been approved and marked as completed.';
}

async function loadMine(force=false){
  if(route()!=='contribute'||!signedIn()||loading)return;
  if(!force&&cached.length&&Date.now()-lastLoaded<15_000){render();return}
  loading=true;
  renderLoading();
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},
      body:'{}'
    });
    if(!response.ok)throw new Error(`Contributor history failed (${response.status})`);
    const rows=await response.json() as Contribution[];
    cached=Array.isArray(rows)?rows:[];
    lastLoaded=Date.now();
    render();
  }catch(error){
    console.error(error);
    renderError();
  }finally{loading=false}
}

function signIn(){
  sessionStorage.setItem(RETURN_KEY,'#contribute');
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',`${location.origin}${location.pathname}`);
  location.href=authorize.toString();
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

function renderSignedOut(){
  const root=mount();
  if(!root)return;
  root.innerHTML=`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Sign in to see the contributions connected to your LitLab account and whether each one has been approved.</p></div><div class="ll-my-contrib-gate"><div><span>ACCOUNT HISTORY</span><h3>Your contribution history stays with your account.</h3><p>Once signed in, this page shows every contribution you submitted, its review status and whether LitLab approved it.</p></div><button type="button" data-my-contrib-signin>Sign in to view contributions</button></div>`;
  root.querySelector<HTMLButtonElement>('[data-my-contrib-signin]')?.addEventListener('click',signIn);
}

function renderLoading(){
  const root=mount();
  if(!root)return;
  root.innerHTML=`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Track what you have submitted and whether LitLab has approved it.</p></div><div class="ll-my-contrib-loading"><span></span><p>Loading your contributions…</p></div>`;
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
  root.innerHTML=`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Everything below is tied to your signed-in account. Status changes made by LitLab appear here automatically when you return.</p></div>
    <div class="ll-my-contrib-summary"><div><strong>${cached.length}</strong><span>Total submitted</span></div><div><strong>${approved}</strong><span>Approved</span></div><button type="button" data-my-contrib-refresh>Refresh status</button></div>
    ${cached.length?`<div class="ll-my-contrib-list">${cached.map(card).join('')}</div>`:'<div class="ll-my-contrib-empty"><span>✦</span><h3>No contributions yet.</h3><p>When you submit your first contributor application, it will appear here with its review and approval status.</p></div>'}`;
  root.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]')?.addEventListener('click',()=>void loadMine(true));
}

function renderError(){
  const root=mount();
  if(!root)return;
  root.innerHTML=`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2></div><div class="ll-my-contrib-error"><h3>Could not load your contribution history.</h3><p>Your submissions are still saved. Try refreshing the list.</p><button type="button" data-my-contrib-retry>Try again</button></div>`;
  root.querySelector<HTMLButtonElement>('[data-my-contrib-retry]')?.addEventListener('click',()=>void loadMine(true));
}

function scan(){
  scanQueued=false;
  if(route()!=='contribute')return;
  if(!mount())return;
  if(!signedIn()){renderSignedOut();return}
  void loadMine();
}
function scheduleScan(){
  if(scanQueued)return;
  scanQueued=true;
  requestAnimationFrame(scan);
}

const root=document.getElementById('root');
if(root)new MutationObserver(scheduleScan).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{cached=[];lastLoaded=0;scheduleScan()});
window.addEventListener('litlab:contributor-submitted',()=>{cached=[];lastLoaded=0;setTimeout(()=>void loadMine(true),350)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleScan,{once:true});else scheduleScan();
