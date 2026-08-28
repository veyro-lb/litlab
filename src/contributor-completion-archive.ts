import './contributor-completion-archive.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const CACHE_MS=10_000;

type StoredSession={access_token?:string};
type Brief={project_title?:string;goal?:string;audience?:string;deliverable?:string;quality_requirements?:string;source_guidance?:string;due_at?:string|null};
type Task={id:string;title:string;instructions?:string;status:string;due_at?:string|null;updated_at?:string|null};
type Revision={id:string;title:string;details?:string;checklist?:unknown;status:string;contributor_response?:string|null;created_at:string};
type DocumentRow={id:string;storage_path:string;original_name:string;file_size:number;version_label:string;note?:string|null;created_at:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:string;summary:string;created_at:string;reviewer_name?:string|null};
type Activity={id:string;activity_date:string;minutes:number;description:string;created_at:string};
type Workspace={
  id:string;created_at:string;status:string;status_updated_at?:string|null;applicant_type:string;contribution_type:string;
  full_name?:string|null;school?:string|null;country?:string|null;dp_year?:string|null;topics?:string|null;contribution_idea?:string|null;
  motivation?:string|null;experience?:string|null;availability?:string|null;cas_intent?:string|null;cas_goal?:string|null;cas_impact?:string|null;
  cas_success?:string|null;student_supervision?:string|null;mentor_email?:string|null;credit_preference?:string|null;brief?:Brief|null;
  tasks:Task[];revisions:Revision[];documents:DocumentRow[];reviewer?:{name?:string|null;assigned_at?:string|null}|null;reviews:Review[];activities:Activity[];
};

let cache:Workspace[]=[];
let cacheAt=0;
let loading:Promise<Workspace[]>|null=null;
let observedRoot:HTMLElement|null=null;
let observer:MutationObserver|null=null;
let scanTimer=0;
let scanAttempts=0;
let syncQueued=false;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return 'Not recorded';const d=new Date(value);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}
function fmtTime(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function routeRoot(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function checklistItems(value:unknown){return Array.isArray(value)?value.map(String).filter(Boolean):[]}
function yesNo(value?:string|null){if(!value)return 'Not recorded';if(value==='yes')return 'Yes';if(value==='no')return 'No';if(value==='maybe')return 'Maybe / planned to confirm';return label(value)}
function hours(minutes:number){const value=minutes/60;return Number.isInteger(value)?`${value} hr${value===1?'':'s'}`:`${value.toFixed(1)} hrs`}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

async function workspaces(force=false){
  if(!force&&Date.now()-cacheAt<CACHE_MS&&cache.length)return cache;
  if(loading)return loading;
  loading=rpc<Workspace[]>('get_my_litlab_contributor_workspace').then(rows=>{
    cache=Array.isArray(rows)?rows:[];cacheAt=Date.now();return cache;
  }).finally(()=>{loading=null});
  return loading;
}

function currentApplicationId(root:HTMLElement){
  const chat=root.querySelector<HTMLElement>('.ll-workspace-status [data-application-id]');
  if(chat?.dataset.applicationId)return chat.dataset.applicationId;
  return root.querySelector<HTMLElement>('[data-workspace-select].active')?.dataset.workspaceSelect||'';
}

function fieldRow(name:string,value:unknown){
  const text=String(value??'').trim();if(!text)return '';
  return `<div class="ll-evidence-row"><dt>${esc(name)}</dt><dd>${esc(text)}</dd></div>`;
}

function casPlan(app:Workspace){
  const rows=[
    fieldRow('DP stage',app.dp_year?label(app.dp_year):''),
    fieldRow('CAS intention',app.cas_intent?yesNo(app.cas_intent):''),
    fieldRow('Original CAS goal',app.cas_goal),
    fieldRow('Who the contribution was intended to help',app.cas_impact),
    fieldRow('Original success measure',app.cas_success),
    fieldRow('School / supervision plan',app.student_supervision?yesNo(app.student_supervision):''),
    fieldRow('Mentor / supervisor email provided',app.mentor_email)
  ].filter(Boolean).join('');
  return `<section class="ll-completion-card ll-cas-plan"><div class="ll-completion-card-head"><div><span>ORIGINAL CAS PLAN</span><h3>What you planned before the contribution</h3></div><em>Saved from your application</em></div>${rows?`<dl class="ll-evidence-list">${rows}</dl>`:'<p class="ll-completion-muted">No CAS planning answers were saved with this application.</p>'}</section>`;
}

function proposal(app:Workspace){
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>APPLICATION RECORD</span><h3>Your original contribution proposal</h3></div></div><dl class="ll-evidence-list">${fieldRow('Contribution type',label(app.contribution_type))}${fieldRow('Topics / focus',app.topics)}${fieldRow('What you proposed',app.contribution_idea)}${fieldRow('Why you wanted to contribute',app.motivation)}${fieldRow('Relevant strengths / experience',app.experience)}${fieldRow('Availability you originally stated',app.availability)}${fieldRow('Credit preference',app.credit_preference?label(app.credit_preference):'')}</dl></section>`;
}

function brief(app:Workspace){
  const b=app.brief;if(!b)return '';
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>FINAL PROJECT SCOPE</span><h3>${esc(b.project_title||app.topics||'LitLab contribution')}</h3></div><em>${b.due_at?`Due ${esc(fmtDate(b.due_at))}`:''}</em></div><dl class="ll-evidence-list">${fieldRow('Goal',b.goal)}${fieldRow('Audience',b.audience)}${fieldRow('Deliverable',b.deliverable)}${fieldRow('Quality requirements',b.quality_requirements)}${fieldRow('Sources & originality guidance',b.source_guidance)}</dl></section>`;
}

function tasks(app:Workspace){
  if(!app.tasks?.length)return '';
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>WORK RECORD</span><h3>Tasks and progress</h3></div><em>${app.tasks.filter(task=>task.status==='approved').length}/${app.tasks.length} approved</em></div><div class="ll-completion-task-list">${app.tasks.map(task=>`<article><i>${task.status==='approved'?'✓':'•'}</i><div><b>${esc(task.title)}</b>${task.instructions?`<p>${esc(task.instructions)}</p>`:''}<small>${esc(label(task.status))}${task.due_at?` • Due ${esc(fmtDate(task.due_at))}`:''}</small></div></article>`).join('')}</div></section>`;
}

function documents(app:Workspace){
  if(!app.documents?.length)return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>SUBMISSION EVIDENCE</span><h3>Word-document record</h3></div></div><p class="ll-completion-muted">No DOCX versions are attached to this contribution record.</p></section>`;
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>SUBMISSION EVIDENCE</span><h3>Word-document versions</h3></div><em>${app.documents.length} saved</em></div><div class="ll-completion-docs">${app.documents.map(doc=>`<article><span>W</span><div><b>${esc(doc.version_label)} — ${esc(doc.original_name)}</b><small>${esc(bytes(Number(doc.file_size)||0))} • ${esc(fmtTime(doc.created_at))}</small>${doc.note?`<p>${esc(doc.note)}</p>`:''}</div><button type="button" data-download-doc="${esc(doc.storage_path)}">Open securely</button></article>`).join('')}</div></section>`;
}

function revisions(app:Workspace){
  if(!app.revisions?.length)return '';
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>REVISION EVIDENCE</span><h3>Feedback and changes made</h3></div><em>${app.revisions.length} record${app.revisions.length===1?'':'s'}</em></div><div class="ll-completion-revisions">${app.revisions.map(item=>{const list=checklistItems(item.checklist);return `<article><header><b>${esc(item.title)}</b><small>${esc(label(item.status))} • ${esc(fmtDate(item.created_at))}</small></header>${item.details?`<p>${esc(item.details)}</p>`:''}${list.length?`<ul>${list.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}${item.contributor_response?`<blockquote><b>Your response / change record</b><p>${esc(item.contributor_response)}</p></blockquote>`:''}</article>`}).join('')}</div></section>`;
}

function teacherReviews(app:Workspace){
  if(!app.reviews?.length&&!app.reviewer)return '';
  return `<section class="ll-completion-card"><div class="ll-completion-card-head"><div><span>REVIEW EVIDENCE</span><h3>Teacher / academic review</h3></div>${app.reviewer?.name?`<em>Reviewer: ${esc(app.reviewer.name)}</em>`:''}</div>${app.reviews?.length?`<div class="ll-completion-reviews">${app.reviews.map(review=>`<article><header><b>${review.recommendation==='approve'?'Academically approved':'Changes requested'}</b><small>${esc(review.reviewer_name||app.reviewer?.name||'Teacher reviewer')} • ${esc(fmtDate(review.created_at))}</small></header><div class="ll-review-score-row"><span>Accuracy ${review.accuracy}/5</span><span>Clarity ${review.clarity}/5</span><span>DP relevance ${review.dp_relevance}/5</span><span>Originality ${review.originality}/5</span><span>Sources ${review.sources}/5</span></div><p>${esc(review.summary)}</p></article>`).join('')}</div>`:'<p class="ll-completion-muted">A reviewer was assigned, but no teacher-review record is attached.</p>'}</section>`;
}

function activities(app:Workspace){
  const rows=app.activities||[];const total=rows.reduce((sum,row)=>sum+Number(row.minutes||0),0);
  return `<section class="ll-completion-card ll-activity-evidence"><div class="ll-completion-card-head"><div><span>ACTIVITY EVIDENCE</span><h3>Your recorded contribution activity</h3></div><em>${total?`${esc(hours(total))} self-recorded`:'No time recorded'}</em></div>${rows.length?`<div class="ll-completion-activity-list">${rows.map(row=>`<article><time>${esc(fmtDate(row.activity_date))}</time><div><b>${row.minutes} min</b><p>${esc(row.description)}</p></div></article>`).join('')}</div>`:'<p class="ll-completion-muted">You did not add activity-log entries for this contribution.</p>'}<p class="ll-completion-evidence-note"><b>Evidence note:</b> Activity time is the contributor's own record unless LitLab separately verified it. Your school/CAS coordinator decides what evidence is acceptable and whether this experience counts toward CAS.</p></section>`;
}

function archiveMarkup(app:Workspace){
  const totalMinutes=(app.activities||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);
  const title=app.brief?.project_title||app.topics||label(app.contribution_type);
  return `<section class="ll-contributor-completion-archive" data-contributor-completion-archive data-application-id="${esc(app.id)}">
    <header class="ll-completion-hero">
      <div class="ll-completion-icon">✓</div>
      <div class="ll-completion-copy"><span>CONTRIBUTION COMPLETED</span><h2>Your work is submitted and this contribution is now closed.</h2><p>LitLab has marked <strong>${esc(title)}</strong> as completed. Active editing and new Word uploads are closed for this contribution, but your evidence, documents, feedback and chat remain saved in your account.</p></div>
      <div class="ll-completion-actions"><button type="button" data-completion-print>Print / save CAS evidence</button><button type="button" class="secondary" data-chat-open data-chat-mode="user" data-application-id="${esc(app.id)}" data-chat-title="${esc(title)}">Live chat with LitLab</button></div>
    </header>

    <section class="ll-certificate-pending">
      <div><span>CERTIFICATE</span><h3>Certificate pending</h3><p>Your contribution record is complete. LitLab can now verify the final record and prepare your <strong>LitLab Contributor Certificate</strong>. Keep an eye on your LitLab notifications/live chat for any certificate update.</p></div>
      <aside><b>${esc(fmtDate(app.status_updated_at))}</b><small>Completed by LitLab</small></aside>
    </section>

    <div class="ll-completion-summary">
      <article><span>Submitted</span><b>${esc(fmtDate(app.created_at))}</b></article>
      <article><span>Completed</span><b>${esc(fmtDate(app.status_updated_at))}</b></article>
      <article><span>Word versions</span><b>${app.documents?.length||0}</b></article>
      <article><span>Activity record</span><b>${totalMinutes?esc(hours(totalMinutes)):'None added'}</b></article>
    </div>

    <div class="ll-completion-intro"><span>CAS / CONTRIBUTION EVIDENCE ARCHIVE</span><h2>Everything useful from this contribution, kept together.</h2><p>This is a personal evidence record generated from information already saved in your LitLab contributor workspace. It can help you organize evidence for reflection or a CAS conversation, but it does not itself approve CAS.</p></div>

    <div class="ll-completion-grid">${casPlan(app)}${proposal(app)}${brief(app)}${tasks(app)}${documents(app)}${revisions(app)}${teacherReviews(app)}${activities(app)}</div>

    <footer class="ll-completion-footer"><b>Keep this record for your files.</b><p>A LitLab Contributor Certificate confirms your contribution to LitLab. It is not an IB certificate, and LitLab cannot decide whether your school accepts the experience for CAS.</p></footer>
  </section>`;
}

function clearCompletion(root:HTMLElement){
  root.classList.remove('ll-completion-mode');root.querySelector('[data-contributor-completion-archive]')?.remove();
}

async function sync(force=false){
  syncQueued=false;
  if(route()!=='contribute'||!token())return;
  const root=routeRoot();if(!root)return;
  const id=currentApplicationId(root);
  if(!id){clearCompletion(root);return}
  try{
    const rows=await workspaces(force);const app=rows.find(row=>row.id===id);
    if(!app||app.status!=='completed'||app.applicant_type!=='student'){clearCompletion(root);return}
    root.classList.add('ll-completion-mode');
    const old=root.querySelector<HTMLElement>('[data-contributor-completion-archive]');
    const key=[app.id,app.status_updated_at,app.documents?.length,app.tasks?.map(t=>`${t.id}:${t.status}`).join('|'),app.revisions?.map(r=>`${r.id}:${r.status}:${r.contributor_response||''}`).join('|'),app.activities?.map(a=>`${a.id}:${a.minutes}`).join('|'),app.reviews?.length].join('::');
    if(old?.dataset.renderKey===key)return;
    old?.remove();
    const host=document.createElement('div');host.innerHTML=archiveMarkup(app);const archive=host.firstElementChild as HTMLElement|null;if(!archive)return;
    archive.dataset.renderKey=key;
    const tabs=root.querySelector('.ll-workspace-tabs');
    if(tabs)tabs.insertAdjacentElement('afterend',archive);else root.prepend(archive);
  }catch(error){console.debug('Completion archive unavailable',error)}
}

function queueSync(force=false){
  if(syncQueued&&!force)return;syncQueued=true;
  window.setTimeout(()=>void sync(force),force?0:40);
}

function observe(root:HTMLElement){
  if(observedRoot===root)return;
  observer?.disconnect();observedRoot=root;
  observer=new MutationObserver(()=>queueSync(false));observer.observe(root,{childList:true,subtree:true});
  queueSync(true);
}

function scan(){
  window.clearTimeout(scanTimer);
  if(route()!=='contribute'){observer?.disconnect();observer=null;observedRoot=null;return}
  const root=routeRoot();if(root){scanAttempts=0;observe(root);return}
  if(scanAttempts++<30)scanTimer=window.setTimeout(scan,120);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-completion-print]')){window.print();return}
  if(target.closest('[data-workspace-select]'))window.setTimeout(()=>queueSync(false),0);
},true);

window.addEventListener('hashchange',()=>{cache=[];cacheAt=0;scanAttempts=0;window.setTimeout(scan,80)});
window.addEventListener('focus',()=>{if(route()==='contribute'){cacheAt=0;queueSync(true)}});
window.addEventListener('online',()=>{if(route()==='contribute'){cacheAt=0;queueSync(true)}});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){cache=[];cacheAt=0;queueSync(true)}});
window.addEventListener('litlab:contributor-workspace-updated',()=>{cacheAt=0;window.setTimeout(()=>queueSync(true),220)});
window.addEventListener('litlab:contributor-admin-updated',()=>{cacheAt=0;window.setTimeout(()=>queueSync(true),220)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
