export {};
import './contributor-history.css';
import {saveCertificatePdf,saveEvidencePdf,type CertificatePdfData,type EvidenceSection} from './litlab-pdf-export';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';
const FOCUS_KEY='litlabContributorFocusApplication';
const REQUEST_TIMEOUT_MS=12_000;
const HISTORY_POLL_MS=20_000;

type StoredSession={access_token?:string};
type ContributionStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Contribution={id:string;created_at:string;status_updated_at?:string|null;applicant_type:'student'|'teacher';contribution_type:string;topics:string;contribution_idea:string;status:ContributionStatus};
type CertificateSummary={application_id:string;certificate_code:string;issued_at:string;updated_at:string;is_unread:boolean};
type CertificateRecord={id:string;application_id:string;certificate_code:string;contributor_name:string;contributor_role:string;contribution_title:string;contribution_type:string;contribution_description:string;completed_at:string;issued_at:string;verified_minutes?:number|null;issuer_name:string;issuer_title:string;updated_at:string;is_unread?:boolean};
type Brief={project_title?:string;goal?:string;audience?:string;deliverable?:string;quality_requirements?:string;source_guidance?:string;due_at?:string|null};
type Task={title:string;instructions?:string;status:string;due_at?:string|null};
type Revision={title:string;details?:string;checklist?:unknown;status:string;contributor_response?:string|null;created_at:string};
type Doc={original_name:string;file_size:number;version_label:string;note?:string|null;created_at:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:string;summary:string;created_at:string;reviewer_name?:string|null};
type Activity={activity_date:string;minutes:number;description:string};
type Workspace={id:string;created_at:string;status:string;status_updated_at?:string|null;applicant_type:'student'|'teacher';full_name?:string|null;dp_year?:string|null;contribution_type:string;topics?:string|null;contribution_idea?:string|null;motivation?:string|null;experience?:string|null;availability?:string|null;cas_intent?:string|null;cas_goal?:string|null;cas_impact?:string|null;cas_success?:string|null;student_supervision?:string|null;mentor_email?:string|null;credit_preference?:string|null;brief?:Brief|null;tasks?:Task[];revisions?:Revision[];documents?:Doc[];reviewer?:{name?:string|null}|null;reviews?:Review[];activities?:Activity[]};

let loading=false;
let lastLoaded=0;
let cached:Contribution[]=[];
let certificates=new Map<string,CertificateSummary>();
let workspaceCache=new Map<string,Workspace>();
let workspaceLoading:Promise<void>|null=null;
let scanQueued=false;
let retryTimer=0;
let mountAttempts=0;
let pollTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function signedIn(){return Boolean(token())}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return 'Not recorded';const date=new Date(value);return Number.isNaN(date.getTime())?'Not recorded':date.toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function duration(minutes:number){const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function checklist(value:unknown){return Array.isArray(value)?value.map(String).filter(Boolean):[]}
function statusLabel(status:ContributionStatus){return ({new:'Pending review',reviewing:'Needs review',accepted:'Approved / active',declined:'Not approved',completed:'Completed'} as const)[status]}
function approvalLabel(status:ContributionStatus){if(status==='accepted'||status==='completed')return 'Approved';if(status==='declined')return 'Not approved';return 'Not decided yet'}
function statusCopy(status:ContributionStatus){if(status==='new')return 'LitLab has received this contribution and has not reviewed it yet.';if(status==='reviewing')return 'LitLab is reviewing this contribution and may contact you for changes or clarification.';if(status==='accepted')return 'This contribution is approved and remains active in your contributor workspace.';if(status==='declined')return 'This contribution was not approved in its current form, but its saved history remains in your account.';return 'This contribution is final approved and closed. Its evidence, files and certificate record remain available here.'}
function changedAt(item:Contribution){return Date.parse(item.created_at)||0}
function certFor(id:string){return certificates.get(id)||null}
function section(){return document.querySelector<HTMLElement>('[data-my-contributions]')}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:controller.signal});if(!response.ok)throw new Error(`${name} failed (${response.status})`);const text=await response.text();return (text?JSON.parse(text):null) as T}finally{window.clearTimeout(timeout)}
}

function mount(){
  if(route()!=='contribute')return null;
  const page=document.querySelector<HTMLElement>('.ll-contrib-page');const apply=page?.querySelector<HTMLElement>('#contribute-apply');if(!page||!apply)return null;
  let root=section();if(root)return root;
  root=document.createElement('section');root.className='ll-contrib-section ll-my-contributions';root.dataset.myContributions='true';apply.before(root);return root;
}
function setMarkup(root:HTMLElement,key:string,markup:string){if(root.dataset.renderKey===key)return;root.dataset.renderKey=key;root.innerHTML=markup}

async function fetchMine(){
  const [appsResult,certResult]=await Promise.all([rpc<Contribution[]>('get_my_litlab_contributor_applications'),rpc<CertificateSummary[]>('get_my_litlab_contributor_certificate_summaries')]);
  return {apps:Array.isArray(appsResult)?appsResult:[],certs:Array.isArray(certResult)?certResult:[]};
}
async function loadMine(force=false,quiet=false){
  if(route()!=='contribute'||!signedIn()||loading)return;
  if(!force&&lastLoaded&&Date.now()-lastLoaded<15_000){render();return}
  loading=true;if(!quiet&&!lastLoaded)renderLoading();
  try{const result=await fetchMine();if(route()!=='contribute')return;cached=result.apps.slice().sort((a,b)=>changedAt(b)-changedAt(a));certificates=new Map(result.certs.map(cert=>[cert.application_id,cert]));lastLoaded=Date.now();render()}catch(error){console.error(error);if(!cached.length&&!lastLoaded)renderError()}finally{loading=false}
}

function signIn(){sessionStorage.setItem(RETURN_KEY,'#contribute');const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);authorize.searchParams.set('provider','google');authorize.searchParams.set('redirect_to',`${location.origin}${location.pathname}`);location.href=authorize.toString()}
function renderSignedOut(){const root=mount();if(!root)return;setMarkup(root,'signed-out',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Sign in to see every contribution connected to your account.</p></div><div class="ll-my-contrib-gate"><div><span>ACCOUNT HISTORY</span><h3>Your contribution record stays with you.</h3><p>Past and current contributions, evidence and issued certificates remain attached to the account that submitted them.</p></div><button type="button" data-my-contrib-signin>Sign in to view contributions</button></div>`);root.querySelector<HTMLButtonElement>('[data-my-contrib-signin]')?.addEventListener('click',signIn)}
function renderLoading(){const root=mount();if(!root)return;setMarkup(root,'loading',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Your newest contribution appears first. Older contribution records stay below it.</p></div><div class="ll-my-contrib-loading"><span></span><p>Loading your contribution history…</p></div>`)}

function card(item:Contribution,index:number){
  const cert=certFor(item.id);const recent=index===0;const certBadge=cert?`<span class="ll-history-cert-badge ${cert.is_unread?'is-new':''}">${cert.is_unread?'NEW • ':''}Certificate ready</span>`:'';
  return `<details class="ll-my-contrib-card status-${esc(item.status)} ${recent?'is-most-recent':''} ${cert?.is_unread?'has-unread-certificate':''}" data-history-contribution="${esc(item.id)}" data-application-id="${esc(item.id)}">
    <summary>
      <div class="ll-history-summary-main"><div class="ll-history-kickers"><span>${esc(item.applicant_type==='teacher'?'Teacher contribution':'Student contribution')}</span>${recent?'<b>MOST RECENT</b>':''}${certBadge}</div><h3>${esc(item.topics||label(item.contribution_type)||'Untitled contribution')}</h3><div class="ll-my-contrib-meta"><span>${esc(label(item.contribution_type))}</span><span>Submitted ${esc(fmtDate(item.created_at))}</span><span class="approval">Approval: <b>${esc(approvalLabel(item.status))}</b></span></div></div>
      <div class="ll-history-summary-side"><span class="ll-my-contrib-status">${esc(statusLabel(item.status))}</span><span class="ll-history-more">More details <i>⌄</i></span></div>
    </summary>
    <div class="ll-history-detail-shell"><p class="ll-my-contrib-status-copy">${esc(statusCopy(item.status))}</p><div data-history-detail-body><div class="ll-history-detail-loading"><span></span>Open details to load this contribution’s permanent work record.</div></div></div>
  </details>`;
}

function render(){
  const root=mount();if(!root)return;
  const approved=cached.filter(item=>item.status==='accepted'||item.status==='completed').length;const activeApproved=cached.filter(item=>item.status==='accepted').length;const completed=cached.filter(item=>item.status==='completed').length;const unreadCerts=[...certificates.values()].filter(cert=>cert.is_unread).length;
  const signature=cached.map(item=>`${item.id}:${item.status}:${item.status_updated_at||item.created_at}:${certFor(item.id)?.updated_at||''}:${certFor(item.id)?.is_unread?'u':'r'}`).join('|');
  const contributorBanner=approved?`<div class="ll-my-contributor-badge"><span>✓</span><div><b>Approved LitLab Contributor</b><p>${activeApproved?`${activeApproved} approved contribution${activeApproved===1?' is':'s are'} active.`:''}${activeApproved&&completed?' ':''}${completed?`${completed} completed contribution${completed===1?' is':'s are'} permanently saved.`:''}</p></div></div>`:'';
  setMarkup(root,`history:${signature}`,`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2><p>Your most recent contribution is always first. Every older contribution stays here with its own details, evidence and certificate record.</p></div>${contributorBanner}<div class="ll-my-contrib-summary"><div><strong>${cached.length}</strong><span>Total submitted</span></div><div><strong>${completed}</strong><span>Completed</span></div>${unreadCerts?`<div class="has-new"><strong>${unreadCerts}</strong><span>New certificate${unreadCerts===1?'':'s'}</span></div>`:''}<button type="button" data-my-contrib-refresh>Refresh history</button></div>${cached.length?`<div class="ll-my-contrib-list">${cached.map(card).join('')}</div>`:'<div class="ll-my-contrib-empty"><span>✦</span><h3>No contributions yet.</h3><p>When you submit your first contributor application, it will appear here and remain tied to your account.</p></div>'}`);
  root.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]')?.addEventListener('click',()=>void loadMine(true));
  root.querySelectorAll<HTMLDetailsElement>('[data-history-contribution]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open){const id=details.dataset.historyContribution||'';void hydrateDetails(id);if(certFor(id)?.is_unread)void markCertificateRead(id)}}));
  focusRequestedContribution();
}

async function ensureWorkspaces(force=false){
  if(workspaceLoading){await workspaceLoading;return}
  if(workspaceCache.size&&!force)return;
  workspaceLoading=(async()=>{const rows=await rpc<Workspace[]>('get_my_litlab_contributor_workspace');workspaceCache=new Map((Array.isArray(rows)?rows:[]).map(row=>[row.id,row]))})().finally(()=>{workspaceLoading=null});
  await workspaceLoading;
}
function recordFacts(app:Workspace){const tasks=app.tasks||[],docs=app.documents||[],revisions=app.revisions||[],reviews=app.reviews||[],activities=app.activities||[];const total=activities.reduce((sum,row)=>sum+Number(row.minutes||0),0);return {tasks,docs,revisions,reviews,activities,total}}
function workspaceDetails(app:Workspace,item:Contribution,cert:CertificateSummary|null){
  const {tasks,docs,revisions,reviews,activities,total}=recordFacts(app);const completed=item.status==='completed';const evidenceLabel=app.applicant_type==='teacher'?'Save contribution evidence PDF':'Save CAS evidence PDF';
  const brief=app.brief?`<section class="ll-history-record-block"><span>PROJECT BRIEF</span><h4>${esc(app.brief.project_title||item.topics||label(item.contribution_type))}</h4><dl><div><dt>Goal</dt><dd>${esc(app.brief.goal||'Not recorded')}</dd></div><div><dt>Deliverable</dt><dd>${esc(app.brief.deliverable||'Not recorded')}</dd></div><div><dt>Audience</dt><dd>${esc(app.brief.audience||'Not recorded')}</dd></div></dl></section>`:'';
  const cas=app.applicant_type==='student'&&(app.cas_intent||app.cas_goal||app.cas_impact||app.cas_success)?`<section class="ll-history-record-block"><span>CAS PLANNING SAVED</span><dl><div><dt>CAS intention</dt><dd>${esc(app.cas_intent?label(app.cas_intent):'Not recorded')}</dd></div><div><dt>Goal</dt><dd>${esc(app.cas_goal||'Not recorded')}</dd></div><div><dt>Intended impact</dt><dd>${esc(app.cas_impact||'Not recorded')}</dd></div><div><dt>Success measure</dt><dd>${esc(app.cas_success||'Not recorded')}</dd></div></dl></section>`:'';
  const evidence=`<section class="ll-history-record-block"><span>WORK & EVIDENCE RECORD</span><div class="ll-history-fact-grid"><div><b>${tasks.length}</b><small>Tasks</small></div><div><b>${docs.length}</b><small>Word submissions</small></div><div><b>${revisions.length}</b><small>Revision records</small></div><div><b>${reviews.length}</b><small>Teacher reviews</small></div><div><b>${total?esc(duration(total)):'—'}</b><small>Self-recorded activity</small></div></div>${docs.length?`<div class="ll-history-file-list"><b>Saved Word versions</b>${docs.map(doc=>`<p><span>${esc(doc.version_label)}</span>${esc(doc.original_name)} <small>${esc(fmtDate(doc.created_at))} • ${esc(bytes(Number(doc.file_size)||0))}</small></p>`).join('')}</div>`:''}${activities.length?`<div class="ll-history-activity-list"><b>Activity evidence</b>${activities.slice(0,8).map(row=>`<p><span>${esc(fmtDate(row.activity_date))} • ${row.minutes} min</span>${esc(row.description)}</p>`).join('')}${activities.length>8?`<small>+ ${activities.length-8} more activity entries are included in the evidence PDF.</small>`:''}</div>`:''}</section>`;
  return `<div class="ll-history-proposal"><span>ORIGINAL SUBMISSION</span><p>${esc(item.contribution_idea||'No original contribution description recorded.')}</p></div>${brief}${cas}${evidence}<div class="ll-history-actions"><button type="button" class="secondary" data-history-open-workspace data-workspace-select="${esc(item.id)}">${completed?'Open completed record':'Open this workspace'}</button>${completed?`<button type="button" data-history-save-evidence="${esc(item.id)}">${esc(evidenceLabel)}</button>`:''}${cert?`<button type="button" class="certificate" data-history-download-certificate="${esc(item.id)}">Download certificate PDF</button>`:completed?'<span class="ll-history-certificate-pending">Certificate pending from LitLab</span>':''}</div>${cert?`<p class="ll-history-cert-meta">Certificate ${esc(cert.certificate_code)} • Issued ${esc(fmtDate(cert.issued_at))}</p>`:''}`;
}
async function hydrateDetails(id:string){
  const details=document.querySelector<HTMLDetailsElement>(`[data-history-contribution="${CSS.escape(id)}"]`);const body=details?.querySelector<HTMLElement>('[data-history-detail-body]');if(!details||!body)return;
  if(body.dataset.loaded==='true')return;body.innerHTML='<div class="ll-history-detail-loading"><span></span>Loading saved work, evidence and certificate details…</div>';
  try{await ensureWorkspaces();const app=workspaceCache.get(id);const item=cached.find(row=>row.id===id);if(!app||!item)throw new Error('Saved contribution record was not found.');body.innerHTML=workspaceDetails(app,item,certFor(id));body.dataset.loaded='true'}catch(error){console.error(error);body.innerHTML='<div class="ll-history-detail-error"><b>Could not load the full work record.</b><p>Your contribution is still saved. Try refreshing this section.</p></div>'}
}
async function markCertificateRead(id:string){
  const summary=certFor(id);if(!summary?.is_unread)return;
  try{await rpc<boolean>('mark_my_litlab_contributor_certificate_read',{p_application_id:id});summary.is_unread=false;certificates.set(id,summary);const details=document.querySelector<HTMLDetailsElement>(`[data-history-contribution="${CSS.escape(id)}"]`);details?.classList.remove('has-unread-certificate');const badge=details?.querySelector<HTMLElement>('.ll-history-cert-badge');if(badge){badge.classList.remove('is-new');badge.textContent='Certificate ready'}window.dispatchEvent(new CustomEvent('litlab:certificate-read',{detail:{applicationId:id}}))}catch(error){console.debug('Could not mark certificate read',error)}
}
function certificatePdfData(cert:CertificateRecord):CertificatePdfData{return {certificateCode:cert.certificate_code,contributorName:cert.contributor_name,contributorRole:cert.contributor_role,contributionTitle:cert.contribution_title,contributionType:label(cert.contribution_type),contributionDescription:cert.contribution_description,completedAt:cert.completed_at,issuedAt:cert.issued_at,verifiedMinutes:cert.verified_minutes,issuerName:cert.issuer_name,issuerTitle:cert.issuer_title}}
function evidenceSections(app:Workspace):EvidenceSection[]{
  const sections:EvidenceSection[]=[];
  if(app.applicant_type==='student')sections.push({title:'Original CAS plan',subtitle:'What was planned before the contribution',rows:[{label:'DP stage',value:app.dp_year?label(app.dp_year):'Not recorded'},{label:'CAS intention',value:app.cas_intent?label(app.cas_intent):'Not recorded'},{label:'Original CAS goal',value:app.cas_goal||'Not recorded'},{label:'Intended impact',value:app.cas_impact||'Not recorded'},{label:'Original success measure',value:app.cas_success||'Not recorded'},{label:'Supervision plan',value:app.student_supervision?label(app.student_supervision):'Not recorded'},{label:'Mentor / supervisor email',value:app.mentor_email||'Not recorded'}]});
  sections.push({title:'Application record',subtitle:'Original contribution proposal',rows:[{label:'Contribution type',value:label(app.contribution_type)},{label:'Topics / focus',value:app.topics||'Not recorded'},{label:'What was proposed',value:app.contribution_idea||'Not recorded'},{label:'Motivation',value:app.motivation||'Not recorded'},{label:'Strengths / experience',value:app.experience||'Not recorded'},{label:'Availability stated',value:app.availability||'Not recorded'}]});
  if(app.brief)sections.push({title:'Final project scope',subtitle:app.brief.project_title||app.topics||'LitLab contribution',rows:[{label:'Goal',value:app.brief.goal||'Not recorded'},{label:'Audience',value:app.brief.audience||'Not recorded'},{label:'Deliverable',value:app.brief.deliverable||'Not recorded'},{label:'Quality requirements',value:app.brief.quality_requirements||'Not recorded'},{label:'Source / originality guidance',value:app.brief.source_guidance||'Not recorded'}]});
  if(app.tasks?.length)sections.push({title:'Work record',subtitle:'Tasks and progress',items:app.tasks.map(task=>`${task.title} — ${label(task.status)}${task.instructions?`. ${task.instructions}`:''}${task.due_at?` (Due ${fmtDate(task.due_at)})`:''}`)});
  sections.push({title:'Submission evidence',subtitle:'Microsoft Word document versions',items:app.documents?.length?app.documents.map(doc=>`${doc.version_label}: ${doc.original_name} — ${bytes(Number(doc.file_size)||0)}, submitted ${fmtDate(doc.created_at)}${doc.note?`. Note: ${doc.note}`:''}`):['No DOCX versions were attached to this contribution.']});
  if(app.revisions?.length)sections.push({title:'Revision evidence',subtitle:'Feedback and changes made',items:app.revisions.map(revision=>`${revision.title} — ${label(revision.status)}. ${revision.details||''}${checklist(revision.checklist).length?` Requested: ${checklist(revision.checklist).join('; ')}.`:''}${revision.contributor_response?` Contributor response: ${revision.contributor_response}`:''}`)});
  if(app.reviews?.length||app.reviewer)sections.push({title:'Review evidence',subtitle:'Teacher / academic review',items:app.reviews?.length?app.reviews.map(review=>`${review.reviewer_name||app.reviewer?.name||'Teacher reviewer'} — ${review.recommendation==='approve'?'Academically approved':'Changes requested'} on ${fmtDate(review.created_at)}. Accuracy ${review.accuracy}/5, clarity ${review.clarity}/5, DP relevance ${review.dp_relevance}/5, originality ${review.originality}/5, sources ${review.sources}/5. ${review.summary}`):[`Reviewer assigned: ${app.reviewer?.name||'Teacher reviewer'}. No submitted review record.`]});
  const total=(app.activities||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);sections.push({title:'Activity evidence',subtitle:total?`${duration(total)} self-recorded`:'No time recorded',items:app.activities?.length?app.activities.map(row=>`${fmtDate(row.activity_date)} — ${row.minutes} min — ${row.description}`):['No activity-log entries were added.'],paragraphs:['Activity time is the contributor’s own record unless LitLab separately verified it. The student’s school or CAS coordinator decides what evidence is acceptable and whether the experience counts toward CAS.']});return sections;
}
async function saveHistoryEvidence(id:string,button:HTMLButtonElement){const original=button.textContent||'Save evidence PDF';button.disabled=true;button.textContent='Creating PDF…';try{await ensureWorkspaces(true);const app=workspaceCache.get(id);if(!app)throw new Error('Contribution evidence is unavailable.');const total=(app.activities||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);await saveEvidencePdf({contributorName:app.full_name||'LitLab Contributor',contributionTitle:app.brief?.project_title||app.topics||label(app.contribution_type),contributionType:label(app.contribution_type),submittedAt:app.created_at,completedAt:app.status_updated_at,wordVersions:app.documents?.length||0,selfRecordedMinutes:total,studentCas:app.applicant_type==='student',sections:evidenceSections(app)})}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}}
async function saveHistoryCertificate(id:string,button:HTMLButtonElement){const original=button.textContent||'Download certificate PDF';button.disabled=true;button.textContent='Creating PDF…';try{const cert=await rpc<CertificateRecord|null>('get_my_litlab_contributor_certificate',{p_application_id:id});if(!cert)throw new Error('Certificate is not available yet.');await saveCertificatePdf(certificatePdfData(cert));await markCertificateRead(id)}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}}

function focusContribution(id:string){
  const details=document.querySelector<HTMLDetailsElement>(`[data-history-contribution="${CSS.escape(id)}"]`);if(!details)return false;details.open=true;void hydrateDetails(id);if(certFor(id)?.is_unread)void markCertificateRead(id);details.scrollIntoView({behavior:'smooth',block:'center'});return true;
}
function focusRequestedContribution(){let id='';try{id=sessionStorage.getItem(FOCUS_KEY)||''}catch{}if(!id)return;try{sessionStorage.removeItem(FOCUS_KEY)}catch{}window.setTimeout(()=>focusContribution(id),120)}

function renderError(){const root=mount();if(!root)return;setMarkup(root,'error',`<div class="ll-contrib-section-head"><span>Your LitLab account</span><h2>My contributions</h2></div><div class="ll-my-contrib-error"><h3>Could not load your contribution history.</h3><p>${navigator.onLine?'Your records are still saved. Try again in a moment.':'You are offline. Your saved history will return when you reconnect.'}</p><button type="button" data-my-contrib-retry>Try again</button></div>`);root.querySelector<HTMLButtonElement>('[data-my-contrib-retry]')?.addEventListener('click',()=>void loadMine(true))}
function retryMount(){if(route()!=='contribute'||section()||mountAttempts>=20)return;mountAttempts+=1;window.clearTimeout(retryTimer);retryTimer=window.setTimeout(scheduleScan,100)}
function scan(){scanQueued=false;if(route()!=='contribute')return;if(!mount()){retryMount();return}mountAttempts=0;if(!signedIn()){cached=[];certificates.clear();workspaceCache.clear();lastLoaded=0;renderSignedOut();return}void loadMine()}
function scheduleScan(){if(scanQueued)return;scanQueued=true;requestAnimationFrame(scan)}
function clearPoll(){window.clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(delay=HISTORY_POLL_MS){clearPoll();if(route()!=='contribute')return;pollTimer=window.setTimeout(async()=>{if(route()==='contribute'&&signedIn()&&!document.hidden&&navigator.onLine)await loadMine(true,true);if(route()==='contribute')schedulePoll()},delay)}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const evidence=target.closest<HTMLButtonElement>('[data-history-save-evidence]');if(evidence){event.preventDefault();event.stopPropagation();void saveHistoryEvidence(evidence.dataset.historySaveEvidence||'',evidence).catch(error=>{console.error(error);window.alert('The evidence PDF could not be created right now.')});return}
  const certificate=target.closest<HTMLButtonElement>('[data-history-download-certificate]');if(certificate){event.preventDefault();event.stopPropagation();void saveHistoryCertificate(certificate.dataset.historyDownloadCertificate||'',certificate).catch(error=>{console.error(error);window.alert('The certificate PDF could not be created right now.')});return}
  const openWorkspace=target.closest<HTMLButtonElement>('[data-history-open-workspace]');if(openWorkspace){window.setTimeout(()=>document.querySelector<HTMLElement>('[data-contributor-workspace]')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
},true);
window.addEventListener('litlab:open-contribution-detail',event=>{const id=String((event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'');if(id){if(!focusContribution(id)){try{sessionStorage.setItem(FOCUS_KEY,id)}catch{}setTimeout(()=>void loadMine(true),120)}}});
window.addEventListener('litlab:certificate-read',event=>{const id=String((event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'');const summary=certFor(id);if(summary){summary.is_unread=false;certificates.set(id,summary)}});
window.addEventListener('hashchange',()=>{cached=[];certificates.clear();workspaceCache.clear();lastLoaded=0;mountAttempts=0;window.clearTimeout(retryTimer);clearPoll();scheduleScan();if(route()==='contribute')schedulePoll()});
window.addEventListener('litlab:contributor-submitted',()=>{cached=[];certificates.clear();workspaceCache.clear();lastLoaded=0;setTimeout(()=>void loadMine(true),300)});
window.addEventListener('focus',()=>{if(route()==='contribute'&&signedIn()){void loadMine(true,true);schedulePoll()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPoll();return}if(route()==='contribute'&&signedIn()){void loadMine(true,true);schedulePoll()}});
window.addEventListener('online',()=>{if(route()==='contribute'&&signedIn())void loadMine(true,true)});
function start(){scheduleScan();if(route()==='contribute')schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
