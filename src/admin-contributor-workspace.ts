import './admin-contributor-workspace.css';
import {encodeStoragePath,signedDocumentUrl} from './contributor-file-names';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const REFRESH_MS=25_000;

type StoredSession={access_token?:string};
type Task={id:string;title:string;instructions:string;status:'pending'|'in_progress'|'submitted'|'needs_revision'|'approved';due_at?:string|null};
type Revision={id:string;title:string;details:string;checklist:unknown;status:'open'|'responded'|'resolved';contributor_response?:string|null;created_at:string};
type Doc={id:string;storage_path:string;original_name:string;file_size:number;version_label:string;note?:string|null;created_at:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:'approve'|'request_changes';summary:string;created_at:string;reviewer_name?:string};
type Activity={activity_date:string;minutes:number;description:string};
type Brief={project_title:string;goal:string;audience:string;deliverable:string;quality_requirements?:string;source_guidance?:string;due_at?:string|null};
type Assignment={teacher_application_id:string;teacher_name:string;assigned_at:string}|null;
type Workspace={brief?:Brief|null;tasks:Task[];revisions:Revision[];documents:Doc[];assignment?:Assignment;reviews:Review[];activity:Activity[]};
type Teacher={id:string;full_name:string;email:string;subject_taught?:string|null;status:string};

let activeAppId='';
let activeTitle='Contributor workspace';
let activeContributionType='';
let workspace:Workspace|null=null;
let teachers:Teacher[]=[];
let loading=false;
let pendingReload=false;
let pollTimer=0;
let listObserver:MutationObserver|null=null;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:string){return value.replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}
function fmtTime(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function checklist(value:unknown){return Array.isArray(value)?value.map(String).filter(Boolean):[]}
function promotion(){return activeContributionType==='promotion'}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:controller.signal});if(!response.ok)throw new Error(`${name} failed (${response.status})`);const text=await response.text();return (text?JSON.parse(text):null) as T}finally{clearTimeout(timeout)}
}

function ensureButton(card:HTMLElement){
  if(card.querySelector('[data-admin-manage-workspace]'))return;
  const strip=card.querySelector<HTMLElement>('.admin-contrib-chat-strip');if(!strip)return;
  const button=document.createElement('button');button.type='button';button.dataset.adminManageWorkspace='true';button.className='admin-manage-workspace';button.textContent='Manage workspace';strip.appendChild(button);
}
function ensureButtons(){if(route()!=='admin-contributors')return;document.querySelectorAll<HTMLElement>('.admin-contrib-card').forEach(ensureButton)}
function observeList(){
  listObserver?.disconnect();listObserver=null;
  if(route()!=='admin-contributors')return;
  const list=document.querySelector<HTMLElement>('[data-contrib-list]');
  if(!list){setTimeout(observeList,180);return}
  ensureButtons();listObserver=new MutationObserver(()=>ensureButtons());listObserver.observe(list,{childList:true,subtree:true});
}

function modal(){return document.getElementById('ll-admin-contributor-workspace')}
function close(){activeAppId='';activeContributionType='';workspace=null;pendingReload=false;clearTimeout(pollTimer);modal()?.remove()}
function shell(){
  modal()?.remove();
  const overlay=document.createElement('div');overlay.id='ll-admin-contributor-workspace';overlay.className='ll-admin-workspace-overlay';
  overlay.dataset.contributionType=activeContributionType;
  if(promotion())overlay.classList.add('ll-admin-promotion-mode');
  overlay.innerHTML=`<section class="ll-admin-workspace" role="dialog" aria-modal="true" aria-label="Manage contributor workspace"><header><div><span>LITLAB • CONTRIBUTOR WORKSPACE</span><h2>${esc(activeTitle)}</h2></div><button type="button" data-admin-workspace-close aria-label="Close">×</button></header><div class="ll-admin-workspace-body" data-admin-workspace-body><div class="ll-admin-workspace-loading"><i></i>Loading private workspace…</div></div></section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)close()});overlay.querySelector('[data-admin-workspace-close]')?.addEventListener('click',close);document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('is-open'));
}

function briefForm(){const b=workspace?.brief;const isPromotion=promotion();const deliverable=b?.deliverable&&!/word|docx/i.test(b.deliverable)?b.deliverable:isPromotion?'Completed promotion actions with clear campaign evidence, results/context, reflection and supervisor review when required.':b?.deliverable||'A polished Microsoft Word (.docx) contribution ready for LitLab review.';return `<section class="ll-admin-workspace-card wide"><div class="ll-admin-workspace-title"><div><span>${isPromotion?'PROMOTION BRIEF':'PROJECT BRIEF'}</span><h3>${isPromotion?'Define the campaign and the evidence expected.':'Tell the contributor exactly what to make.'}</h3></div><em>Visible to contributor</em></div><form data-admin-brief><div class="ll-admin-form-grid two"><label><span>Project title</span><input name="project_title" maxlength="240" value="${esc(b?.project_title||'')}" placeholder="${isPromotion?'LitLab Discord promotion':'Paper 1 visual-text analysis guide'}"/></label><label><span>Deadline <small>(optional)</small></span><input type="date" name="due_at" value="${esc(b?.due_at?String(b.due_at).slice(0,10):'')}"/></label></div><label><span>Goal</span><textarea name="goal" maxlength="3000" rows="3" placeholder="${isPromotion?'What should this campaign achieve, and what would responsible outreach look like?':'What should this contribution achieve?'}">${esc(b?.goal||'')}</textarea></label><div class="ll-admin-form-grid two"><label><span>Audience</span><input name="audience" maxlength="800" value="${esc(b?.audience||'DP English students')}"/></label><label><span>${isPromotion?'Evidence needed for completion':'Deliverable'}</span><input name="deliverable" maxlength="1200" value="${esc(deliverable)}"/></label></div><button type="submit">Save ${isPromotion?'promotion':'project'} brief</button><small data-admin-state></small></form></section>`}
function tasks(){const rows=workspace?.tasks||[];const isPromotion=promotion();return `<section class="ll-admin-workspace-card"><div class="ll-admin-workspace-title"><div><span>TASKS</span><h3>Current work</h3></div><em>${rows.length} task${rows.length===1?'':'s'}</em></div><div class="ll-admin-task-list">${rows.length?rows.map(t=>`<div><section><b>${esc(t.title)}</b>${t.instructions?`<p>${esc(t.instructions)}</p>`:''}<small>${t.due_at?`Due ${esc(fmtDate(t.due_at))}`:'No deadline'}</small></section><select data-admin-task-status="${esc(t.id)}"><option value="pending"${t.status==='pending'?' selected':''}>To do</option><option value="in_progress"${t.status==='in_progress'?' selected':''}>In progress</option><option value="submitted"${t.status==='submitted'?' selected':''}>Submitted</option><option value="needs_revision"${t.status==='needs_revision'?' selected':''}>Revision needed</option><option value="approved"${t.status==='approved'?' selected':''}>Approved</option></select></div>`).join(''):'<p class="muted">No tasks yet.</p>'}</div><form data-admin-add-task><label><span>New task</span><input name="title" maxlength="180" required placeholder="${isPromotion?'Carry out the first promotion action / add evidence':'Submit first DOCX draft'}"/></label><label><span>Instructions</span><textarea name="instructions" maxlength="4000" rows="2" placeholder="${isPromotion?'State the channel, audience, permission or anti-spam expectations, evidence to save and any result to record.':'What exactly should they do?'}"></textarea></label><label><span>Deadline <small>(optional)</small></span><input type="date" name="due_at"/></label><button type="submit">Add task</button><small data-admin-state></small></form></section>`}
function revisions(){const rows=workspace?.revisions||[];return `<section class="ll-admin-workspace-card"><div class="ll-admin-workspace-title"><div><span>REVISION REQUESTS</span><h3>Specific feedback</h3></div><em>${rows.filter(r=>r.status!=='resolved').length} open</em></div><div class="ll-admin-revision-list">${rows.map(r=>`<article class="${esc(r.status)}"><header><b>${esc(r.title)}</b><span>${esc(label(r.status))}</span></header>${r.details?`<p>${esc(r.details)}</p>`:''}${checklist(r.checklist).length?`<ul>${checklist(r.checklist).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:''}${r.contributor_response?`<blockquote><b>Contributor response</b><p>${esc(r.contributor_response)}</p></blockquote>`:''}${r.status!=='resolved'?`<button type="button" data-admin-resolve-revision="${esc(r.id)}">Mark resolved</button>`:''}</article>`).join('')||'<p class="muted">No revision requests yet.</p>'}</div><form data-admin-add-revision><label><span>Revision title</span><input name="title" maxlength="180" required placeholder="Strengthen the examples"/></label><label><span>What needs changing?</span><textarea name="details" maxlength="5000" rows="3" placeholder="Explain the issue clearly and constructively."></textarea></label><label><span>Checklist <small>one item per line</small></span><textarea name="checklist" rows="4" placeholder="Add two original examples&#10;Correct DP terminology&#10;List research sources"></textarea></label><button type="submit">Send revision request</button><small data-admin-state></small></form></section>`}
function documents(){if(promotion())return '';const rows=workspace?.documents||[];return `<section class="ll-admin-workspace-card wide"><div class="ll-admin-workspace-title"><div><span>WORD DOCUMENTS</span><h3>Submitted DOCX versions</h3></div><em>${rows.length} file${rows.length===1?'':'s'}</em></div>${rows.length?`<div class="ll-admin-doc-list">${rows.map(d=>`<div><span>W</span><section><b>${esc(d.version_label)} — ${esc(d.original_name)}</b><small>${esc(bytes(Number(d.file_size)||0))} • ${esc(fmtTime(d.created_at))}</small>${d.note?`<p>${esc(d.note)}</p>`:''}</section><button type="button" data-admin-download-doc="${esc(d.storage_path)}">Open securely</button></div>`).join('')}</div>`:'<p class="muted">No Word documents submitted yet. Contributors can upload .docx files after acceptance or when a revision is requested.</p>'}</section>`}
function teacherAssignment(){const assigned=workspace?.assignment;const isPromotion=promotion();return `<section class="ll-admin-workspace-card"><div class="ll-admin-workspace-title"><div><span>${isPromotion?'CAS SUPERVISOR':'TEACHER REVIEWER'}</span><h3>${isPromotion?'Assign the student’s accepted CAS supervisor / coordinator':'Assign an accepted teacher'}</h3></div><em>${assigned?esc(assigned.teacher_name):'Not assigned'}</em></div><p class="muted">${isPromotion?'The assigned CAS supervisor verifies the student’s current campaign evidence and reflection before LitLab final review.':'Assigned teachers can securely open this student’s DOCX and submit an academic review. They cannot access other contributor applications.'}</p><form data-admin-assign-teacher><select name="teacher"><option value="">Select an accepted ${isPromotion?'CAS supervisor':'teacher'}</option>${teachers.map(t=>`<option value="${esc(t.id)}"${assigned?.teacher_application_id===t.id?' selected':''}>${esc(t.full_name)} — ${esc(t.subject_taught||t.email)}</option>`).join('')}</select><button type="submit">Assign ${isPromotion?'supervisor':'reviewer'}</button><small data-admin-state></small></form></section>`}
function reviews(){if(promotion())return '';const rows=workspace?.reviews||[];return `<section class="ll-admin-workspace-card"><div class="ll-admin-workspace-title"><div><span>TEACHER REVIEWS</span><h3>Academic review history</h3></div><em>${rows.length} review${rows.length===1?'':'s'}</em></div>${rows.length?`<div class="ll-admin-review-list">${rows.map(r=>`<article><header><b>${esc(r.reviewer_name||'Teacher reviewer')}</b><span>${r.recommendation==='approve'?'Approve':'Request changes'}</span></header><div><i>Accuracy ${r.accuracy}/5</i><i>Clarity ${r.clarity}/5</i><i>DP relevance ${r.dp_relevance}/5</i><i>Originality ${r.originality}/5</i><i>Sources ${r.sources}/5</i></div><p>${esc(r.summary)}</p><small>${esc(fmtTime(r.created_at))}</small></article>`).join('')}</div>`:'<p class="muted">No teacher reviews submitted yet.</p>'}</section>`}
function activity(){const rows=workspace?.activity||[];const total=rows.reduce((sum,row)=>sum+Number(row.minutes||0),0);return `<section class="ll-admin-workspace-card wide"><div class="ll-admin-workspace-title"><div><span>STUDENT ACTIVITY</span><h3>Self-recorded contribution activity</h3></div><em>${(total/60).toFixed(1)} hours logged</em></div><p class="muted">This is student-recorded evidence, not automatically verified time. Use drafts, timestamps, feedback and completed work when deciding what LitLab can verify.</p>${rows.length?`<div class="ll-admin-activity-list">${rows.map(a=>`<div><b>${esc(fmtDate(a.activity_date))} • ${a.minutes} min</b><p>${esc(a.description)}</p></div>`).join('')}</div>`:''}</section>`}

function render(){const body=document.querySelector<HTMLElement>('#ll-admin-contributor-workspace [data-admin-workspace-body]');if(!body||!workspace)return;body.innerHTML=`<div class="ll-admin-workspace-grid">${briefForm()}${tasks()}${revisions()}${documents()}${teacherAssignment()}${reviews()}${activity()}</div>`}

async function load(force=false){
  const appId=activeAppId;if(!appId)return;
  if(loading){if(force)pendingReload=true;return}
  loading=true;
  try{
    const [w,t]=await Promise.all([rpc<Workspace>('admin_get_litlab_contributor_workspace',{p_application_id:appId}),rpc<Teacher[]>('admin_get_litlab_accepted_teachers')]);
    if(appId!==activeAppId||!modal())return;
    workspace=w;teachers=Array.isArray(t)?t:[];render();window.dispatchEvent(new CustomEvent('litlab:admin-contributor-workspace-opened',{detail:{applicationId:appId}}));
  }catch(error){
    if(appId!==activeAppId)return;
    console.error(error);const body=document.querySelector<HTMLElement>('#ll-admin-contributor-workspace [data-admin-workspace-body]');if(body)body.innerHTML='<div class="ll-admin-workspace-error"><b>Workspace could not load.</b><p>Your current data is safe. Check the connection and try again.</p><button type="button" data-admin-workspace-retry>Try again</button></div>';
  }finally{
    loading=false;
    if(pendingReload&&activeAppId){pendingReload=false;window.setTimeout(()=>void load(false),0)}
  }
}

function schedulePoll(){clearTimeout(pollTimer);if(!activeAppId)return;pollTimer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine)await load(false);schedulePoll()},REFRESH_MS)}
function openWorkspace(card:HTMLElement){activeAppId=card.dataset.appId||'';const name=card.querySelector('.admin-contrib-person b')?.textContent||'Contributor';const topic=card.querySelector('.admin-contrib-summary-meta span:nth-child(2)')?.textContent||'';activeContributionType=topic.trim().toLowerCase();activeTitle=`${name}${topic?` — ${topic}`:''}`;if(!activeAppId)return;shell();void load(true);schedulePoll()}

function adminDocumentName(path:string){return workspace?.documents?.find(doc=>doc.storage_path===path)?.original_name||'LitLab-contribution.docx'}
async function download(path:string){try{const response=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/contributor-documents/${encodeStoragePath(path)}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify({expiresIn:300})});if(!response.ok)throw new Error('sign failed');const data=await response.json() as {signedURL?:string;signedUrl?:string};const url=data.signedURL||data.signedUrl;if(!url)throw new Error('missing signed url');window.open(signedDocumentUrl(SUPABASE_URL,url,adminDocumentName(path)),'_blank','noopener,noreferrer')}catch(error){console.error(error);window.alert('This DOCX could not be opened securely right now.')}}

function state(form:HTMLFormElement,text:string,kind=''){const el=form.querySelector<HTMLElement>('[data-admin-state]');if(el){el.textContent=text;el.dataset.state=kind}}
function due(value:FormDataEntryValue|null){const text=String(value||'').trim();return text?`${text}T23:59:00`:null}

async function saveBrief(form:HTMLFormElement){const d=new FormData(form);state(form,'Saving…');try{await rpc('admin_upsert_litlab_contributor_brief',{p_application_id:activeAppId,p_project_title:String(d.get('project_title')||''),p_goal:String(d.get('goal')||''),p_audience:String(d.get('audience')||''),p_deliverable:String(d.get('deliverable')||''),p_due_at:due(d.get('due_at'))});state(form,'Brief saved.','success');await load(true)}catch(error){console.error(error);state(form,'Could not save the brief.','error')}}
async function addTask(form:HTMLFormElement){const d=new FormData(form);state(form,'Adding…');try{await rpc('admin_add_litlab_contributor_task',{p_application_id:activeAppId,p_title:String(d.get('title')||''),p_instructions:String(d.get('instructions')||''),p_due_at:due(d.get('due_at'))});form.reset();await load(true)}catch(error){console.error(error);state(form,'Could not add task.','error')}}
async function setTask(id:string,status:string){try{await rpc('admin_set_litlab_contributor_task_status',{p_task_id:id,p_status:status});await load(true)}catch(error){console.error(error);window.alert('Task status could not be updated.')}}
async function addRevision(form:HTMLFormElement){const d=new FormData(form);const items=String(d.get('checklist')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,20);state(form,'Sending…');try{await rpc('admin_add_litlab_contributor_revision',{p_application_id:activeAppId,p_title:String(d.get('title')||''),p_details:String(d.get('details')||''),p_checklist:items});form.reset();await load(true)}catch(error){console.error(error);state(form,'Could not send revision request.','error')}}
async function resolveRevision(id:string){try{await rpc('admin_resolve_litlab_contributor_revision',{p_revision_id:id});await load(true)}catch(error){console.error(error);window.alert('Revision could not be resolved.')}}
async function assignTeacher(form:HTMLFormElement){const id=String(new FormData(form).get('teacher')||'');if(!id)return;state(form,'Assigning…');try{await rpc('admin_assign_litlab_contributor_teacher',{p_application_id:activeAppId,p_teacher_application_id:id});state(form,'Teacher assigned.','success');await load(true)}catch(error){console.error(error);state(form,'Could not assign this teacher.','error')}}

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const card=target.closest<HTMLElement>('.admin-contrib-card');if(card)ensureButton(card);if(target.closest('[data-admin-manage-workspace]')&&card){event.preventDefault();event.stopPropagation();openWorkspace(card);return}if(target.closest('[data-admin-workspace-close]')){close();return}if(target.closest('[data-admin-workspace-retry]')){void load(true);return}const doc=target.closest<HTMLElement>('[data-admin-download-doc]');if(doc){void download(doc.dataset.adminDownloadDoc||'');return}const resolve=target.closest<HTMLElement>('[data-admin-resolve-revision]');if(resolve){void resolveRevision(resolve.dataset.adminResolveRevision||'')}},true);
document.addEventListener('change',event=>{const target=event.target;if(target instanceof HTMLSelectElement&&target.dataset.adminTaskStatus)void setTask(target.dataset.adminTaskStatus,target.value)},true);
document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(!form||!form.closest('#ll-admin-contributor-workspace'))return;event.preventDefault();if(form.matches('[data-admin-brief]'))void saveBrief(form);else if(form.matches('[data-admin-add-task]'))void addTask(form);else if(form.matches('[data-admin-add-revision]'))void addRevision(form);else if(form.matches('[data-admin-assign-teacher]'))void assignTeacher(form)},true);

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&activeAppId)close()});
window.addEventListener('hashchange',()=>{if(route()!=='admin-contributors')close();setTimeout(observeList,100)});
window.addEventListener('focus',()=>{if(activeAppId){void load(false);schedulePoll()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(pollTimer);return}if(activeAppId){void load(false);schedulePoll()}});
window.addEventListener('online',()=>{if(activeAppId)void load(false)});

setTimeout(observeList,500);
