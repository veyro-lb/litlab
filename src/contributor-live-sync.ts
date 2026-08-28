const USER_REFRESH_DELAY=180;
const FORM_REFRESH_DELAY=900;
let userTimer=0;
let adminTimer=0;
const historyFingerprints=new Map<string,string>();

type Doc={original_name?:string;file_size?:number;version_label?:string;created_at?:string};
type Activity={activity_date?:string;minutes?:number;description?:string};
type Brief={project_title?:string;goal?:string;audience?:string;deliverable?:string};
type Workspace={id?:string;topics?:string;contribution_type?:string;brief?:Brief|null;tasks?:unknown[];documents?:Doc[];revisions?:unknown[];reviews?:unknown[];activities?:Activity[]};

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmtDate(value?:string){if(!value)return 'Not recorded';const date=new Date(value);return Number.isNaN(date.getTime())?'Not recorded':date.toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function duration(minutes:number){const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fingerprint(app:Workspace){try{return JSON.stringify([app.brief,app.tasks,app.documents,app.revisions,app.reviews,app.activities])}catch{return `${app.documents?.length||0}:${app.revisions?.length||0}:${app.reviews?.length||0}:${app.activities?.length||0}`}}

function scheduleUserRefresh(delay=USER_REFRESH_DELAY){
  window.clearTimeout(userTimer);
  userTimer=window.setTimeout(()=>{
    if(route()!=='contribute'||document.hidden)return;
    const button=document.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]');
    if(button&&!button.disabled)button.click();
  },delay);
}

function scheduleAdminRefresh(delay=USER_REFRESH_DELAY){
  window.clearTimeout(adminTimer);
  adminTimer=window.setTimeout(()=>{
    if(route()!=='admin-contributors'||document.hidden)return;
    const button=document.querySelector<HTMLButtonElement>('[data-contrib-refresh]');
    if(button&&!button.disabled)button.click();
  },delay);
}

function makeBrief(app:Workspace){
  if(!app.brief)return '';
  return `<section class="ll-history-record-block"><span>PROJECT BRIEF</span><h4>${esc(app.brief.project_title||app.topics||label(app.contribution_type))}</h4><dl><div><dt>Goal</dt><dd>${esc(app.brief.goal||'Not recorded')}</dd></div><div><dt>Deliverable</dt><dd>${esc(app.brief.deliverable||'Not recorded')}</dd></div><div><dt>Audience</dt><dd>${esc(app.brief.audience||'Not recorded')}</dd></div></dl></section>`;
}

function makeEvidence(app:Workspace){
  const tasks=Array.isArray(app.tasks)?app.tasks:[];
  const docs=Array.isArray(app.documents)?app.documents:[];
  const revisions=Array.isArray(app.revisions)?app.revisions:[];
  const reviews=Array.isArray(app.reviews)?app.reviews:[];
  const activities=Array.isArray(app.activities)?app.activities:[];
  const total=activities.reduce((sum,row)=>sum+Number(row.minutes||0),0);
  const files=docs.length?`<div class="ll-history-file-list"><b>Saved Word versions</b>${docs.map(doc=>`<p><span>${esc(doc.version_label||'Document')}</span>${esc(doc.original_name||'Word document')} <small>${esc(fmtDate(doc.created_at))} • ${esc(bytes(Number(doc.file_size)||0))}</small></p>`).join('')}</div>`:'';
  const activity=activities.length?`<div class="ll-history-activity-list"><b>Activity evidence</b>${activities.slice(0,8).map(row=>`<p><span>${esc(fmtDate(row.activity_date))} • ${Number(row.minutes)||0} min</span>${esc(row.description||'Activity recorded')}</p>`).join('')}${activities.length>8?`<small>+ ${activities.length-8} more activity entries are included in the evidence PDF.</small>`:''}</div>`:'';
  return `<section class="ll-history-record-block"><span>WORK &amp; EVIDENCE RECORD</span><div class="ll-history-fact-grid"><div><b>${tasks.length}</b><small>Tasks</small></div><div><b>${docs.length}</b><small>Word submissions</small></div><div><b>${revisions.length}</b><small>Revision records</small></div><div><b>${reviews.length}</b><small>Teacher reviews</small></div><div><b>${total?esc(duration(total)):'—'}</b><small>Self-recorded activity</small></div></div>${files}${activity}</section>`;
}

function replaceRecordBlock(body:HTMLElement,title:string,markup:string){
  const existing=Array.from(body.querySelectorAll<HTMLElement>('.ll-history-record-block')).find(block=>(block.querySelector(':scope > span')?.textContent||'').trim().toUpperCase()===title);
  if(!markup){existing?.remove();return}
  const holder=document.createElement('div');holder.innerHTML=markup;const next=holder.firstElementChild;
  if(!next)return;
  if(existing)existing.replaceWith(next);
  else{
    const actions=body.querySelector('.ll-history-actions');
    if(actions)actions.before(next);else body.append(next);
  }
}

function syncLoadedHistory(rows:Workspace[]){
  if(route()!=='contribute'||!rows.length)return;
  const byId=new Map(rows.map(row=>[String(row.id||''),row]));
  document.querySelectorAll<HTMLDetailsElement>('[data-history-contribution]').forEach(details=>{
    const id=details.dataset.historyContribution||details.dataset.applicationId||'';
    const app=byId.get(id);if(!app)return;
    const body=details.querySelector<HTMLElement>('[data-history-detail-body]');
    if(!body||body.dataset.loaded!=='true')return;
    const nextFingerprint=fingerprint(app);
    if(historyFingerprints.get(id)===nextFingerprint)return;
    historyFingerprints.set(id,nextFingerprint);
    replaceRecordBlock(body,'PROJECT BRIEF',makeBrief(app));
    replaceRecordBlock(body,'WORK & EVIDENCE RECORD',makeEvidence(app));
  });
}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const rows=event instanceof CustomEvent&&Array.isArray(event.detail?.workspaces)?event.detail.workspaces as Workspace[]:[];
  syncLoadedHistory(rows);
});

window.addEventListener('litlab:contributor-submitted',()=>scheduleUserRefresh(120));
window.addEventListener('litlab:contributor-workspace-updated',()=>scheduleUserRefresh());
window.addEventListener('litlab:contributor-admin-updated',()=>scheduleAdminRefresh());
window.addEventListener('litlab:certificate-read',()=>scheduleUserRefresh(100));
window.addEventListener('hashchange',()=>historyFingerprints.clear());

// These forms save asynchronously. Refresh the account summary after the mutation and rely on
// contributor-workspace-data for the already-open detailed record. This removes the need for a
// browser refresh while keeping the normal backend poll as a safety net.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form)return;
  if(form.matches('[data-revision-response],[data-activity-form],[data-teacher-review]'))scheduleUserRefresh(FORM_REFRESH_DELAY);
},false);

// When the admin notification layer discovers a new application/message, keep an open
// contributor dashboard aligned with it instead of waiting for the dashboard's next poll.
const attrObserver=new MutationObserver(records=>{
  if(route()!=='admin-contributors')return;
  if(records.some(record=>record.attributeName==='data-litlab-admin-contributor-update'))scheduleAdminRefresh(120);
});
attrObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-litlab-admin-contributor-update']});

export {};
