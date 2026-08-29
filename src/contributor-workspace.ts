import './contributor-workspace.css';
import {encodeStoragePath,normalizeDocxFileName,signedDocumentUrl} from './contributor-file-names';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=20_000;
const DOCX_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_DOCX_BYTES=15*1024*1024;

type StoredSession={access_token?:string};
type Status='new'|'reviewing'|'accepted'|'declined'|'completed';
type Brief={project_title:string;goal:string;audience:string;deliverable:string;quality_requirements:string;source_guidance:string;due_at?:string|null};
type Task={id:string;title:string;instructions:string;status:'pending'|'in_progress'|'submitted'|'needs_revision'|'approved';due_at?:string|null};
type Revision={id:string;title:string;details:string;checklist:unknown;status:'open'|'responded'|'resolved';contributor_response?:string|null;created_at:string};
type DocumentRow={id:string;storage_path:string;original_name:string;file_size:number;version_label:string;note?:string|null;created_at:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:'approve'|'request_changes';summary:string;created_at:string;reviewer_name?:string};
type Workspace={id:string;created_at:string;status:Status;status_updated_at?:string|null;applicant_type:'student'|'teacher';contribution_type:string;topics:string;contribution_idea:string;cas_intent?:string|null;brief?:Brief|null;tasks:Task[];revisions:Revision[];documents:DocumentRow[];reviewer?:{name?:string;assigned_at?:string}|null;reviews:Review[]};
type TeacherAssignment={application_id:string;assigned_at:string;student_name:string;topics:string;contribution_type:string;status:Status;brief?:Brief|null;documents:DocumentRow[];reviews:Review[]};
type Activity={id:string;activity_date:string;minutes:number;description:string;created_at:string};

let workspaces:Workspace[]=[];
let assignments:TeacherAssignment[]=[];
let selectedId='';
let renderFingerprint='';
let loading=false;
let pollTimer=0;
let mountTimer=0;
let mountAttempts=0;
let developerAccess:boolean|null=null;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:string){return value.replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return 'No deadline set';const d=new Date(value);return Number.isNaN(d.getTime())?'No deadline set':d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}
function fmtTime(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function statusLabel(status:Status){return ({new:'Pending review',reviewing:'Needs review',accepted:'Accepted',declined:'Not accepted',completed:'Completed'} as const)[status]}
function taskLabel(status:Task['status']){return ({pending:'To do',in_progress:'In progress',submitted:'Submitted',needs_revision:'Revision needed',approved:'Approved'} as const)[status]}
function userId(){try{const p=token().split('.')[1];if(!p)return '';const n=p.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(p.length/4)*4,'=');return String(JSON.parse(atob(n))?.sub||'')}catch{return ''}}
function dataFingerprint(){try{return JSON.stringify([selectedId,workspaces,assignments])}catch{return `${selectedId}:${workspaces.length}:${assignments.length}`}}
function publishWorkspaceData(){window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-data',{detail:{workspaces,assignments,selectedId,source:'workspace'}}))}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function current(){return workspaces.find(item=>item.id===selectedId)||workspaces[0]||null}
function canSubmitDocs(app:Workspace){return app.status==='accepted'||app.status==='reviewing'}
function checklistItems(value:unknown){return Array.isArray(value)?value.map(String).filter(Boolean):[]}

function timeline(app:Workspace){
  const stages=[['Submitted',true],['Review',app.status!=='new'],['Accepted / revision',app.status==='accepted'||app.status==='reviewing'||app.status==='completed'],['Contribution',app.documents.length>0||app.tasks.some(t=>t.status!=='pending')],['Completed',app.status==='completed']] as const;
  return `<div class="ll-workspace-timeline">${stages.map(([name,done],index)=>`<div class="${done?'done':''}"><i>${done?'✓':index+1}</i><span>${esc(name)}</span></div>`).join('')}</div>`;
}

function renderApplicationGuide(){
  const apply=document.querySelector<HTMLElement>('#contribute-apply');
  if(!apply||apply.querySelector('[data-contributor-application-guide]'))return;
  const form=apply.querySelector('#ll-contributor-form');
  if(!form)return;
  const guide=document.createElement('div');
  guide.dataset.contributorApplicationGuide='true';
  guide.className='ll-application-guide';
  guide.innerHTML=`<div><span>BEFORE YOU APPLY</span><h3>One application. A clear workspace after approval.</h3><p>Students apply to create or improve academic resources. Teachers apply to review or mentor. If accepted, LitLab gives you a project brief, tasks, private chat and a Word-document submission area.</p></div><div class="ll-application-guide-grid"><article><b>For students</b><p>Tell us what you want to create, the DP area you know, your goal and whether you may use the experience for CAS.</p></article><article><b>For teachers</b><p>Tell us what you teach and how you can review or mentor. Accepted teachers can be assigned student work inside a separate review workspace.</p></article><article><b>Document format</b><p>Contribution drafts are submitted as Microsoft Word <strong>.docx</strong> files only. LitLab does not accept copied official IB papers or mark schemes.</p></article></div>`;
  form.before(guide);
}

function workspaceRoot(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function mount(){
  if(route()!=='contribute'||developerAccess===true)return null;
  let root=workspaceRoot();if(root)return root;
  const page=document.querySelector<HTMLElement>('.ll-contrib-page');
  const history=document.querySelector<HTMLElement>('[data-my-contributions]');
  const chat=document.querySelector<HTMLElement>('[data-contributor-chat-hub]');
  const apply=document.querySelector<HTMLElement>('#contribute-apply');
  if(!page||!apply)return null;
  root=document.createElement('section');
  root.className='ll-contrib-section ll-contributor-workspace';
  root.dataset.contributorWorkspace='true';
  if(chat)chat.before(root);else if(history?.nextSibling)history.parentElement?.insertBefore(root,history.nextSibling);else apply.before(root);
  return root;
}

function emptyMarkup(){
  return `<div class="ll-workspace-head"><span>CONTRIBUTOR WORKSPACE</span><h2>Your work lives here after you apply.</h2><p>Submit an application first. If LitLab accepts it or asks for a revision, this area becomes your project workspace for tasks, Word documents, feedback and completion records.</p></div><div class="ll-workspace-empty"><b>No contributor project yet.</b><p>Your application and future contribution workspace will appear here automatically.</p><button type="button" data-workspace-go-apply>Go to application</button></div>`;
}

function appTabs(){if(workspaces.length<=1)return '';return `<div class="ll-workspace-tabs">${workspaces.map(app=>`<button type="button" data-workspace-select="${esc(app.id)}" class="${app.id===selectedId?'active':''}"><b>${esc(app.topics||label(app.contribution_type))}</b><small>${esc(statusLabel(app.status))}</small></button>`).join('')}</div>`}

function briefMarkup(app:Workspace){
  const b=app.brief;
  if(!b)return `<article class="ll-workspace-card ll-workspace-wait"><span>PROJECT BRIEF</span><h3>${app.status==='accepted'?'LitLab is preparing your contribution brief.':'Your brief appears after LitLab approves a contribution.'}</h3><p>Use live chat if you need clarification before starting work.</p></article>`;
  return `<article class="ll-workspace-card ll-workspace-brief"><div class="ll-card-title"><div><span>PROJECT BRIEF</span><h3>${esc(b.project_title||app.topics||'LitLab contribution')}</h3></div><em>${esc(fmtDate(b.due_at))}</em></div><dl><div><dt>Goal</dt><dd>${esc(b.goal||app.contribution_idea)}</dd></div><div><dt>Audience</dt><dd>${esc(b.audience)}</dd></div><div><dt>Deliverable</dt><dd>${esc(b.deliverable)}</dd></div><div><dt>Quality standard</dt><dd>${esc(b.quality_requirements)}</dd></div><div><dt>Sources & originality</dt><dd>${esc(b.source_guidance)}</dd></div></dl></article>`;
}

function tasksMarkup(app:Workspace){
  const tasks=app.tasks||[];
  return `<article class="ll-workspace-card"><div class="ll-card-title"><div><span>CURRENT WORK</span><h3>Tasks & progress</h3></div><em>${tasks.filter(t=>t.status==='approved').length}/${tasks.length} approved</em></div>${tasks.length?`<div class="ll-task-list">${tasks.map(task=>`<div class="ll-task ${esc(task.status)}"><i>${task.status==='approved'?'✓':'•'}</i><div><b>${esc(task.title)}</b>${task.instructions?`<p>${esc(task.instructions)}</p>`:''}<small>${esc(taskLabel(task.status))}${task.due_at?` • Due ${esc(fmtDate(task.due_at))}`:''}</small></div></div>`).join('')}</div>`:'<p class="ll-muted">No tasks have been assigned yet. LitLab will add clear next steps here instead of making you guess what to do.</p>'}</article>`;
}

function revisionsMarkup(app:Workspace){
  const revisions=app.revisions||[];
  if(!revisions.length)return `<article class="ll-workspace-card"><div class="ll-card-title"><div><span>FEEDBACK</span><h3>Revision requests</h3></div><em>None open</em></div><p class="ll-muted">Specific changes requested by LitLab will appear here and stay attached to the contribution.</p></article>`;
  return `<article class="ll-workspace-card"><div class="ll-card-title"><div><span>FEEDBACK</span><h3>Revision requests</h3></div><em>${revisions.filter(r=>r.status!=='resolved').length} open</em></div><div class="ll-revision-list">${revisions.map(r=>{const items=checklistItems(r.checklist);return `<section class="ll-revision ${esc(r.status)}"><header><b>${esc(r.title)}</b><span>${esc(label(r.status))}</span></header>${r.details?`<p>${esc(r.details)}</p>`:''}${items.length?`<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}${r.contributor_response?`<blockquote><b>Your response</b><p>${esc(r.contributor_response)}</p></blockquote>`:''}${r.status==='open'?`<form data-revision-response="${esc(r.id)}"><textarea required maxlength="5000" rows="3" placeholder="Explain what you changed or ask a focused question…"></textarea><button type="submit">Send revision response</button><small data-form-state></small></form>`:''}</section>`}).join('')}</div></article>`;
}

function qualityChecklist(){return `<div class="ll-quality-check"><b>Before uploading</b><label><input type="checkbox" required/>This Word document is my original work.</label><label><input type="checkbox" required/>I did not copy an official IB past paper, mark scheme or copyrighted study guide.</label><label><input type="checkbox" required/>I checked DP terminology, examples and factual accuracy.</label><label><input type="checkbox" required/>I listed sources where the contribution uses research or outside information.</label></div>`}

function documentsMarkup(app:Workspace){
  const allowed=canSubmitDocs(app);
  const docs=app.documents||[];
  const disabledCopy=app.status==='new'?'Word-document submission opens after LitLab accepts your application or requests more work.':app.status==='declined'?'This application is closed. Your existing records remain available.':app.status==='completed'?'This contribution is completed. Submitted files remain in your record.':'';
  return `<article class="ll-workspace-card ll-workspace-docs"><div class="ll-card-title"><div><span>DELIVERABLES</span><h3>Microsoft Word submissions</h3></div><em>.docx only • max 15 MB</em></div>${allowed?`<form class="ll-docx-form" data-docx-upload="${esc(app.id)}">${qualityChecklist()}<div class="ll-docx-fields"><label><span>Word document</span><input type="file" name="docx" accept=".docx,${DOCX_MIME}" required/></label><label><span>Version</span><select name="version"><option>Draft 1</option><option>Draft 2</option><option>Revision</option><option>Final submission</option></select></label></div><label><span>Note to LitLab <small>(optional)</small></span><textarea name="note" maxlength="1500" rows="2" placeholder="What changed, what should we focus on, or anything the reviewer should know?"></textarea></label><div class="ll-docx-submit"><p><b>Private upload.</b> Only you, LitLab developers and an assigned teacher reviewer can access the file.</p><button type="submit">Submit Word document</button></div><small data-upload-state role="status"></small></form>`:`<div class="ll-workspace-locked"><span>🔒</span><div><b>Document submission is not open right now.</b><p>${esc(disabledCopy)}</p></div></div>`}${docs.length?`<div class="ll-doc-list"><h4>Submission history</h4>${docs.map(doc=>`<div><span>W</span><section><b>${esc(doc.version_label)} — ${esc(doc.original_name)}</b><small>${esc(bytes(Number(doc.file_size)||0))} • ${esc(fmtTime(doc.created_at))}</small>${doc.note?`<p>${esc(doc.note)}</p>`:''}</section><button type="button" data-download-doc="${esc(doc.storage_path)}">Open securely</button></div>`).join('')}</div>`:''}</article>`;
}

function templatesMarkup(app:Workspace){
  const type=app.contribution_type;
  const structure=type.includes('review')?'1. Resource reviewed\n2. Accuracy concerns\n3. Clarity / structure notes\n4. DP terminology check\n5. Recommended changes\n6. Final recommendation':type.includes('research')?'1. Research question / topic\n2. Key findings\n3. Reliable sources\n4. DP relevance\n5. Suggested LitLab use\n6. Source list':'1. Title and purpose\n2. Key concept / explanation\n3. DP-focused examples\n4. Analysis / student guidance\n5. Common mistakes\n6. Sources (if used)';
  return `<article class="ll-workspace-card"><div class="ll-card-title"><div><span>STARTER STRUCTURE</span><h3>Build the DOCX clearly</h3></div><em>${esc(label(type))}</em></div><p class="ll-muted">You do not have to make the Word file visually fancy. Prioritize accurate, useful academic content. A clean structure like this is enough:</p><pre class="ll-doc-structure">${esc(structure)}</pre></article>`;
}

function casMarkup(app:Workspace){
  if(app.applicant_type!=='student')return '';
  return `<article class="ll-workspace-card"><div class="ll-card-title"><div><span>OPTIONAL STUDENT RECORD</span><h3>CAS evidence & activity log</h3></div><em>School approval required</em></div><p class="ll-muted">Use this to keep a truthful record of work, drafts, feedback and reflection. LitLab records do not approve CAS; your school or CAS coordinator decides how the experience counts.</p><form class="ll-activity-form" data-activity-form="${esc(app.id)}"><label><span>Date</span><input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"/></label><label><span>Minutes worked</span><input type="number" name="minutes" min="1" max="1440" required placeholder="45"/></label><label class="wide"><span>What did you actually work on?</span><input name="description" maxlength="1200" required placeholder="Researched examples, revised analysis after feedback…"/></label><button type="submit">Add activity</button><small data-form-state></small></form><div data-activity-list="${esc(app.id)}"><button type="button" class="ll-quiet-button" data-load-activity="${esc(app.id)}">View activity log</button></div></article>`;
}

function recognitionMarkup(app:Workspace){
  if(app.status!=='completed')return '';
  return `<article class="ll-workspace-card ll-recognition"><span>COMPLETED CONTRIBUTION</span><h3>Your work remains part of your LitLab record.</h3><p>Keep your final DOCX, feedback, review history and activity evidence here. LitLab can use this verified record when issuing a LitLab Contributor Certificate. It is not an IB or CAS certificate.</p></article>`;
}

function teacherAssignmentsMarkup(){
  if(!assignments.length)return '';
  return `<div class="ll-teacher-zone"><div class="ll-workspace-head compact"><span>TEACHER REVIEW WORKSPACE</span><h2>Assigned student contributions</h2><p>Review the latest Word document using a consistent academic rubric. Your review is shared with LitLab, not published directly.</p></div>${assignments.map(a=>`<article class="ll-workspace-card ll-teacher-assignment"><div class="ll-card-title"><div><span>ASSIGNED REVIEW</span><h3>${esc(a.student_name)} — ${esc(a.topics||label(a.contribution_type))}</h3></div><em>${esc(statusLabel(a.status))}</em></div>${a.brief?`<p><b>Goal:</b> ${esc(a.brief.goal)}</p>`:''}<div class="ll-assigned-docs">${a.documents.length?a.documents.map(doc=>`<button type="button" data-download-doc="${esc(doc.storage_path)}"><span>W</span><div><b>${esc(doc.version_label)}</b><small>${esc(doc.original_name)} • ${esc(fmtTime(doc.created_at))}</small></div><i>Open DOCX →</i></button>`).join(''):'<p class="ll-muted">The student has not submitted a Word document yet.</p>'}</div>${a.documents.length?`<form class="ll-review-form" data-teacher-review="${esc(a.application_id)}"><div class="ll-review-grid">${['accuracy','clarity','dp_relevance','originality','sources'].map(key=>`<label><span>${esc(label(key))}</span><select name="${key}" required><option value="">Score 1–5</option><option value="5">5 — Strong</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1 — Major issue</option></select></label>`).join('')}</div><label><span>Recommendation</span><select name="recommendation" required><option value="">Choose</option><option value="approve">Ready / approve academically</option><option value="request_changes">Request changes</option></select></label><label><span>Review summary</span><textarea name="summary" minlength="10" maxlength="5000" rows="4" required placeholder="Be specific, constructive and DP-focused. Explain what is accurate, what needs changing and why."></textarea></label><button type="submit">Submit teacher review</button><small data-form-state></small></form>`:''}${a.reviews.length?`<div class="ll-review-history"><b>Your previous reviews</b>${a.reviews.map(r=>`<p><strong>${r.recommendation==='approve'?'Approved':'Changes requested'}</strong> • ${esc(fmtTime(r.created_at))}<br/>${esc(r.summary)}</p>`).join('')}</div>`:''}</article>`).join('')}</div>`;
}

function appMarkup(app:Workspace){
  const callout=app.status==='new'?'LitLab is reviewing your application. Do not start a full contribution until you receive a brief or revision request.':app.status==='reviewing'?'LitLab needs more information or changes. Check revision requests and live chat before uploading a new DOCX.':app.status==='accepted'?'Your application is accepted. Follow the brief and current tasks, then submit your work as a DOCX.':app.status==='declined'?'This application was not accepted. Your application and any LitLab feedback remain in your account.':'This contribution is completed and preserved as part of your LitLab record.';
  return `${appTabs()}<div class="ll-workspace-status ${esc(app.status)}"><div><span>${esc(statusLabel(app.status))}</span><h3>${esc(app.topics||label(app.contribution_type))}</h3><p>${esc(callout)}</p></div><button type="button" data-chat-open data-chat-mode="user" data-application-id="${esc(app.id)}" data-chat-title="${esc(app.topics||'Contributor conversation')}">Live chat with LitLab</button></div>${timeline(app)}<div class="ll-workspace-grid">${briefMarkup(app)}${tasksMarkup(app)}${revisionsMarkup(app)}${documentsMarkup(app)}${templatesMarkup(app)}${casMarkup(app)}${recognitionMarkup(app)}</div>`;
}

function render(){
  renderApplicationGuide();
  const root=mount();if(!root)return;
  if(!token()){root.innerHTML='<div class="ll-workspace-head"><span>CONTRIBUTOR WORKSPACE</span><h2>Sign in to view your work.</h2><p>Your application, Word documents, tasks, feedback and teacher reviews are private to your LitLab account.</p></div>';return}
  if(!workspaces.length&&!assignments.length){root.innerHTML=emptyMarkup();return}
  const app=current();
  root.innerHTML=`<div class="ll-workspace-head"><span>MY CONTRIBUTOR WORKSPACE</span><h2>${app?'Your contribution, organized.':'Teacher review workspace'}</h2><p>Everything important stays in one place: project brief, current tasks, DOCX submissions, revision requests, live chat and completion history.</p></div>${app?appMarkup(app):''}${teacherAssignmentsMarkup()}`;
}

async function resolveDeveloper(){if(!token()){developerAccess=null;return false}if(developerAccess!==null)return developerAccess;try{developerAccess=Boolean(await rpc<boolean>('is_litlab_admin'));return developerAccess}catch{return false}}

async function load(_force=false){
  if(route()!=='contribute')return;
  renderApplicationGuide();
  if(!mount()){if(mountAttempts<20){clearTimeout(mountTimer);mountAttempts++;mountTimer=window.setTimeout(()=>void load(_force),120)}return}
  mountAttempts=0;
  if(!token()){workspaces=[];assignments=[];selectedId='';renderFingerprint='';render();return}
  if(await resolveDeveloper()){workspaceRoot()?.remove();return}
  if(loading)return;loading=true;
  try{
    const [workspaceResult,assignmentResult]=await Promise.all([rpc<Workspace[]>('get_my_litlab_contributor_workspace'),rpc<TeacherAssignment[]>('get_my_litlab_teacher_assignments')]);
    workspaces=Array.isArray(workspaceResult)?workspaceResult:[];
    assignments=Array.isArray(assignmentResult)?assignmentResult:[];
    if(!selectedId||!workspaces.some(w=>w.id===selectedId))selectedId=workspaces[0]?.id||'';
    const nextFingerprint=dataFingerprint();
    if(nextFingerprint!==renderFingerprint){renderFingerprint=nextFingerprint;render()}
    publishWorkspaceData();
  }catch(error){console.error(error);const root=mount();if(root&&!workspaces.length)root.innerHTML='<div class="ll-workspace-empty"><b>Workspace could not load right now.</b><p>It will retry automatically. Your saved contribution data is unchanged.</p></div>'}finally{loading=false}
}

function documentForPath(path:string){
  for(const app of workspaces){const doc=(app.documents||[]).find(item=>item.storage_path===path);if(doc)return doc}
  for(const assignment of assignments){const doc=(assignment.documents||[]).find(item=>item.storage_path===path);if(doc)return doc}
  return null;
}
async function downloadDocument(path:string){
  try{
    const response=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/contributor-documents/${encodeStoragePath(path)}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify({expiresIn:300})});
    if(!response.ok)throw new Error(`Download failed (${response.status})`);
    const data=await response.json() as {signedURL?:string;signedUrl?:string};
    const signed=data.signedURL||data.signedUrl;if(!signed)throw new Error('No signed URL returned');
    const name=documentForPath(path)?.original_name||'LitLab-contribution.docx';
    window.open(signedDocumentUrl(SUPABASE_URL,signed,name),'_blank','noopener,noreferrer');
  }catch(error){console.error(error);window.alert('This document could not be opened securely right now. Please try again.')}
}

async function cleanupUpload(path:string){try{await fetch(`${SUPABASE_URL}/storage/v1/object/contributor-documents/${encodeStoragePath(path)}`,{method:'DELETE',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`}})}catch{}}

async function uploadDocx(form:HTMLFormElement,appId:string){
  const state=form.querySelector<HTMLElement>('[data-upload-state]');const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(!form.checkValidity()){form.reportValidity();return}
  const data=new FormData(form);const file=data.get('docx');if(!(file instanceof File))return;
  const goodName=file.name.toLowerCase().endsWith('.docx');const goodMime=!file.type||file.type===DOCX_MIME;
  if(!goodName||!goodMime){if(state){state.textContent='Only a Microsoft Word .docx file is accepted. .doc and .docm are not allowed.';state.dataset.state='error'}return}
  if(file.size>MAX_DOCX_BYTES){if(state){state.textContent='The DOCX must be 15 MB or smaller.';state.dataset.state='error'}return}
  const id=crypto.randomUUID();const path=`${appId}/${userId()}/${id}.docx`;const originalName=normalizeDocxFileName(file.name);
  if(button){button.disabled=true;button.textContent='Uploading…'}if(state){state.textContent=`Uploading ${originalName} privately to LitLab…`;state.dataset.state=''}
  try{
    const upload=await fetch(`${SUPABASE_URL}/storage/v1/object/contributor-documents/${encodeStoragePath(path)}`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`,'Content-Type':DOCX_MIME,'x-upsert':'false'},body:file});
    if(!upload.ok)throw new Error(`Storage upload failed (${upload.status})`);
    try{await rpc('register_my_litlab_contributor_document',{p_application_id:appId,p_storage_path:path,p_original_name:originalName,p_file_size:file.size,p_version_label:String(data.get('version')||'Draft'),p_note:String(data.get('note')||'').trim()||null})}catch(error){await cleanupUpload(path);throw error}
    if(state){state.textContent=`${originalName} submitted. LitLab can now review this version.`;state.dataset.state='success'}
    form.reset();window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated'));await load(true);
  }catch(error){console.error(error);if(state){state.textContent=navigator.onLine?'Upload failed. Check that this is a .docx file and try again.':'You are offline. Reconnect before uploading.';state.dataset.state='error'}}finally{if(button?.isConnected){button.disabled=false;button.textContent='Submit Word document'}}
}

async function sendRevision(form:HTMLFormElement,id:string){const state=form.querySelector<HTMLElement>('[data-form-state]');const textarea=form.querySelector<HTMLTextAreaElement>('textarea');const body=textarea?.value.trim()||'';if(body.length<2)return;try{await rpc('respond_my_litlab_contributor_revision',{p_revision_id:id,p_response:body});if(state){state.textContent='Response sent to LitLab.';state.dataset.state='success'}await load(true)}catch(error){console.error(error);if(state){state.textContent='Could not send your response.';state.dataset.state='error'}}}

async function addActivity(form:HTMLFormElement,appId:string){const state=form.querySelector<HTMLElement>('[data-form-state]');const data=new FormData(form);try{await rpc('add_my_litlab_contributor_activity',{p_application_id:appId,p_activity_date:String(data.get('date')||''),p_minutes:Number(data.get('minutes')||0),p_description:String(data.get('description')||'')});if(state){state.textContent='Activity saved.';state.dataset.state='success'}form.reset()}catch(error){console.error(error);if(state){state.textContent='Could not save this activity.';state.dataset.state='error'}}}

async function showActivity(appId:string){const host=document.querySelector<HTMLElement>(`[data-activity-list="${CSS.escape(appId)}"]`);if(!host)return;host.innerHTML='<p class="ll-muted">Loading activity…</p>';try{const rows=await rpc<Activity[]>('get_my_litlab_contributor_activity',{p_application_id:appId});const total=(rows||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);host.innerHTML=`<div class="ll-activity-summary"><b>${(total/60).toFixed(1)} hours self-recorded</b><small>Keep only truthful work time. LitLab does not certify every self-recorded minute.</small></div>${rows.length?`<div class="ll-activity-list">${rows.map(row=>`<p><b>${esc(fmtDate(row.activity_date))} • ${row.minutes} min</b><span>${esc(row.description)}</span></p>`).join('')}</div>`:'<p class="ll-muted">No activity entries yet.</p>'}`}catch{host.innerHTML='<p class="ll-muted">Activity log could not load.</p>'}}

async function submitTeacherReview(form:HTMLFormElement,appId:string){if(!form.checkValidity()){form.reportValidity();return}const state=form.querySelector<HTMLElement>('[data-form-state]');const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');const data=new FormData(form);if(button){button.disabled=true;button.textContent='Submitting…'}try{await rpc('submit_my_litlab_teacher_review',{p_application_id:appId,p_accuracy:Number(data.get('accuracy')),p_clarity:Number(data.get('clarity')),p_dp_relevance:Number(data.get('dp_relevance')),p_originality:Number(data.get('originality')),p_sources:Number(data.get('sources')),p_recommendation:String(data.get('recommendation')||''),p_summary:String(data.get('summary')||'')});if(state){state.textContent='Teacher review submitted to LitLab.';state.dataset.state='success'}form.reset();await load(true)}catch(error){console.error(error);if(state){state.textContent='Could not submit this review.';state.dataset.state='error'}}finally{if(button?.isConnected){button.disabled=false;button.textContent='Submit teacher review'}}}

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const select=target.closest<HTMLElement>('[data-workspace-select]');if(select){selectedId=select.dataset.workspaceSelect||'';renderFingerprint=dataFingerprint();render();publishWorkspaceData();return}if(target.closest('[data-workspace-go-apply]')){document.querySelector('#contribute-apply')?.scrollIntoView({behavior:'smooth',block:'start'});return}const download=target.closest<HTMLElement>('[data-download-doc]');if(download){void downloadDocument(download.dataset.downloadDoc||'');return}const activity=target.closest<HTMLElement>('[data-load-activity]');if(activity){void showActivity(activity.dataset.loadActivity||'')}},true);

document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(!form)return;const upload=form.dataset.docxUpload;if(upload){event.preventDefault();event.stopPropagation();void uploadDocx(form,upload);return}const revision=form.dataset.revisionResponse;if(revision){event.preventDefault();void sendRevision(form,revision);return}const activity=form.dataset.activityForm;if(activity){event.preventDefault();void addActivity(form,activity);return}const review=form.dataset.teacherReview;if(review){event.preventDefault();void submitTeacherReview(form,review)}},true);

function clearPoll(){clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(){clearPoll();if(route()!=='contribute')return;pollTimer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load();schedulePoll()},POLL_MS)}
function routeWork(){clearPoll();mountAttempts=0;developerAccess=null;if(route()==='contribute'){setTimeout(()=>void load(true),80);schedulePoll()}else{renderFingerprint='';workspaceRoot()?.remove()}}
window.addEventListener('hashchange',routeWork);
window.addEventListener('focus',()=>{if(route()==='contribute'){void load(true);schedulePoll()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearPoll();return}if(route()==='contribute'){void load(true);schedulePoll()}});
window.addEventListener('online',()=>{if(route()==='contribute')void load(true)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){developerAccess=null;workspaces=[];assignments=[];selectedId='';renderFingerprint='';void load(true)}});
window.addEventListener('litlab:contributor-submitted',()=>setTimeout(()=>void load(true),400));
window.addEventListener('litlab:contributor-workspace-updated',()=>setTimeout(()=>void load(true),180));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',routeWork,{once:true});else routeWork();