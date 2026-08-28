import './contributor-review-flow-polish.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:'approve'|'request_changes';summary:string;created_at:string;reviewer_name?:string};
type UserWorkspace={id:string;applicant_type:string;reviews?:Review[];reviewer?:{name?:string|null}|null};
type Pipeline={
  application_id:string;
  applicant_type?:string;
  stage:string;
  mentor_required?:boolean;
  mentor_email?:string|null;
  assignment?:{teacher_name?:string|null}|null;
  latest_document?:{original_name?:string;version_label?:string;mentor_review_status?:string}|null;
};
type WorkspaceEvent={selectedId?:string;assignments?:Array<{application_id:string}>;workspaces?:UserWorkspace[]};

let selectedUserId='';
let selectedWorkspace:UserWorkspace|null=null;
let teacherIds:string[]=[];
let scanTimer=0;
let adminRefreshVersion=0;
const inFlight=new Set<string>();
const cache=new Map<string,{at:number;data:Pipeline}>();

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmt(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}

async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const data=await response.json() as {message?:string};if(data.message)message=data.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function stageLabel(stage:string){
  return ({student_work:'Preparing submission',mentor_link:'Waiting for teacher link',mentor_review:'Under teacher review',student_revision:'Teacher requested changes',admin_review:'Pending LitLab admin',complete:'Completed',teacher_account:'Teacher reviewer account'} as Record<string,string>)[stage]||'Review in progress';
}
function stageTone(stage:string){
  if(stage==='admin_review'||stage==='complete')return 'success';
  if(stage==='mentor_review')return 'teacher';
  if(stage==='student_revision')return 'revision';
  if(stage==='mentor_link')return 'waiting';
  return 'neutral';
}
function studentSummary(data:Pipeline){
  const teacher=data.assignment?.teacher_name||'your teacher / mentor';
  if(data.stage==='mentor_review')return `<b>Your document is with ${esc(teacher)}.</b><span>You do not need to submit it again. If the teacher approves this version, it automatically moves to LitLab admin.</span>`;
  if(data.stage==='student_revision')return '<b>Your teacher requested changes.</b><span>Read the teacher feedback below, revise the DOCX, then upload a new version. The revised version automatically returns to the teacher before admin review.</span>';
  if(data.stage==='admin_review')return '<b>Teacher approval is complete.</b><span>Your latest DOCX is now pending LitLab admin’s final review. You can read the teacher’s scores and notes below; no new upload is needed unless LitLab requests a revision.</span>';
  if(data.stage==='mentor_link')return `<b>Your DOCX is saved.</b><span>LitLab is waiting to link the teacher account. The teacher must use <strong>${esc(data.mentor_email||'the mentor email you entered')}</strong> and have your exact LitLab email on their teacher application.</span>`;
  if(data.stage==='complete')return '<b>Review complete.</b><span>The teacher and LitLab admin review path is finished and the contribution remains in your account record.</span>';
  if(data.mentor_required)return '<b>Teacher-first pathway enabled.</b><span>When you submit your DOCX, it goes to your linked teacher first. Only an approved teacher version moves to LitLab admin.</span>';
  return '<b>Direct LitLab pathway.</b><span>No teacher review is required for this contribution. Your submitted DOCX goes directly to LitLab admin.</span>';
}

function scoreAverage(review:Review){return ((review.accuracy+review.clarity+review.dp_relevance+review.originality+review.sources)/5).toFixed(1)}
function scoreRow(review:Review){
  return `<div class="ll-teacher-feedback-scores"><span><b>${review.accuracy}/5</b>Accuracy</span><span><b>${review.clarity}/5</b>Clarity</span><span><b>${review.dp_relevance}/5</b>DP relevance</span><span><b>${review.originality}/5</b>Originality</span><span><b>${review.sources}/5</b>Sources</span></div>`;
}
function nextStepForReview(review:Review,data:Pipeline){
  if(review.recommendation==='request_changes'||data.stage==='student_revision')return '<strong>Your next step:</strong> use these notes to revise the document, then upload a new DOCX version. The new version goes back to the teacher automatically.';
  if(data.stage==='admin_review')return '<strong>Your next step:</strong> nothing right now. The teacher approved this version and LitLab admin is completing the final review.';
  if(data.stage==='complete')return '<strong>Finished:</strong> the teacher review and LitLab final review are complete.';
  return '<strong>Teacher decision recorded.</strong> Follow the review path status above for the current next step.';
}
function studentFeedbackMarkup(data:Pipeline,reviews:Review[]){
  const teacher=data.assignment?.teacher_name||selectedWorkspace?.reviewer?.name||'Teacher reviewer';
  if(!reviews.length){
    const copy=data.stage==='mentor_review'?`<b>${esc(teacher)} is reviewing your latest DOCX.</b><p>The teacher’s rubric scores, recommendation, and written notes will appear here as soon as the review is submitted.</p>`:data.stage==='mentor_link'?'<b>No teacher feedback yet.</b><p>Your teacher account still needs to be linked before a review can be submitted.</p>':'<b>No teacher review has been submitted yet.</b><p>When a teacher review is required, the full rubric and written notes will stay visible here in your account.</p>';
    return `<div class="ll-card-title"><div><span>TEACHER FEEDBACK</span><h3>Academic review & notes</h3></div><em>Not submitted yet</em></div><div class="ll-teacher-feedback-empty">${copy}</div>`;
  }
  const latest=reviews[0];const older=reviews.slice(1);
  return `<div class="ll-card-title"><div><span>TEACHER FEEDBACK</span><h3>Academic review & notes</h3></div><em class="${latest.recommendation==='approve'?'approved':'changes'}">${latest.recommendation==='approve'?'Approved academically':'Changes requested'}</em></div><div class="ll-teacher-feedback-lead"><div><b>${esc(latest.reviewer_name||teacher)}</b><span>${esc(fmt(latest.created_at))}</span></div><strong>${scoreAverage(latest)}/5 <small>rubric average</small></strong></div>${scoreRow(latest)}<div class="ll-teacher-feedback-note"><span>TEACHER NOTES</span><p>${esc(latest.summary)}</p></div><p class="ll-teacher-feedback-disclaimer">These are LitLab teacher-review rubric scores, not an IB grade or school grade.</p><div class="ll-teacher-feedback-next ${latest.recommendation==='approve'?'approved':'changes'}">${nextStepForReview(latest,data)}</div>${older.length?`<details class="ll-teacher-feedback-history"><summary>Earlier teacher reviews (${older.length})</summary>${older.map(review=>`<article><header><b>${esc(review.reviewer_name||teacher)}</b><span>${review.recommendation==='approve'?'Approved':'Changes requested'} · ${esc(scoreAverage(review))}/5</span></header>${scoreRow(review)}<p>${esc(review.summary)}</p><small>${esc(fmt(review.created_at))}</small></article>`).join('')}</details>`:''}`;
}
function renderStudentFeedback(data:Pipeline){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  let panel=root.querySelector<HTMLElement>('[data-student-teacher-feedback]');
  if(selectedWorkspace?.applicant_type!=='student'||(!data.mentor_required&&!(selectedWorkspace?.reviews||[]).length)){panel?.remove();return}
  if(!panel){panel=document.createElement('article');panel.dataset.studentTeacherFeedback='true';panel.className='ll-workspace-card ll-teacher-feedback-panel';const grid=root.querySelector<HTMLElement>('.ll-workspace-grid');if(grid)grid.prepend(panel);else root.appendChild(panel)}
  const reviews=Array.isArray(selectedWorkspace?.reviews)?selectedWorkspace!.reviews!:[];
  panel.innerHTML=studentFeedbackMarkup(data,reviews);
}
function applyStudentSubmissionState(data:Pipeline){
  const form=document.querySelector<HTMLFormElement>(`.ll-docx-form[data-docx-upload="${CSS.escape(data.application_id)}"]`);if(!form)return;
  let note=form.querySelector<HTMLElement>('[data-review-upload-note]');
  const locked=['mentor_link','mentor_review','admin_review','complete'].includes(data.stage);
  if(!note){note=document.createElement('div');note.dataset.reviewUploadNote='true';note.className='ll-review-upload-note';form.prepend(note)}
  if(!locked){note.remove();return}
  const copy=data.stage==='mentor_review'?'Your latest DOCX is already under teacher review. Wait for the teacher decision before submitting another version.':data.stage==='mentor_link'?'Your latest DOCX is saved and waiting for the teacher account to link.':data.stage==='admin_review'?'Your teacher-approved DOCX is now with LitLab admin. Upload a new version only if LitLab requests a revision.':'This contribution is complete; the submitted document remains in your record.';
  note.textContent=copy;note.dataset.stage=stageTone(data.stage);
}
function applyStudentPipeline(data:Pipeline){
  const panel=document.querySelector<HTMLElement>('[data-mentor-pipeline]');
  if(panel){
    const pill=panel.querySelector<HTMLElement>('.ll-mentor-pill');
    if(pill){pill.textContent=stageLabel(data.stage);pill.dataset.reviewStage=stageTone(data.stage)}
    let summary=panel.querySelector<HTMLElement>('[data-clear-review-status]');
    if(!summary){summary=document.createElement('div');summary.dataset.clearReviewStatus='true';summary.className='ll-clear-review-status';const steps=panel.querySelector('.ll-mentor-steps');if(steps)steps.after(summary);else panel.appendChild(summary)}
    summary.dataset.stage=stageTone(data.stage);summary.innerHTML=studentSummary(data);
  }
  renderStudentFeedback(data);applyStudentSubmissionState(data);
}

async function refreshStudent(force=false){
  const id=selectedUserId;if(!id||!token()||route()!=='contribute'||selectedWorkspace?.applicant_type==='teacher')return;
  const key=`user:${id}`;if(inFlight.has(key))return;
  const cached=cache.get(key);if(!force&&cached&&Date.now()-cached.at<8000){applyStudentPipeline(cached.data);return}
  inFlight.add(key);
  try{const data=await rpc<Pipeline>('get_my_litlab_contributor_pipeline',{p_application_id:id});cache.set(key,{at:Date.now(),data});applyStudentPipeline(data)}catch(error){console.debug('Review stage unavailable',error)}finally{inFlight.delete(key)}
}

function teacherGuideMarkup(data:Pipeline){
  const doc=data.latest_document;const status=doc?.mentor_review_status||'';
  if(!doc)return '<b>Waiting for the student’s DOCX</b><span>There is nothing to approve yet. The review controls appear when the student submits a document.</span>';
  if(status==='pending')return `<b>Action required · Under teacher review</b><span>Open and review <strong>${esc(doc.version_label||'latest version')} — ${esc(doc.original_name||'DOCX')}</strong>. Score the five rubric areas, write specific notes, then choose one decision: <strong>Approve academically</strong> sends this exact version to LitLab admin; <strong>Request changes</strong> sends the student back to revision.</span>`;
  if(status==='changes_requested')return '<b>Changes requested · Waiting for student</b><span>This version is locked. Your scores and notes are visible to the student. When they upload a revised DOCX, the teacher review step opens again automatically.</span>';
  if(status==='approved')return '<b>Teacher approved ✓ · Pending LitLab admin</b><span>Your rubric scores and written notes are visible to the student and recorded for this version. LitLab admin now owns the final review step.</span>';
  return `<b>${esc(stageLabel(data.stage))}</b><span>The latest document is not currently awaiting a teacher decision.</span>`;
}

function applyTeacherPipeline(id:string,data:Pipeline){
  const form=document.querySelector<HTMLFormElement>(`.ll-review-form[data-teacher-review="${CSS.escape(id)}"]`);
  const card=form?.closest<HTMLElement>('.ll-teacher-assignment')||document.querySelector<HTMLElement>(`.ll-teacher-assignment [data-teacher-review="${CSS.escape(id)}"]`)?.closest('.ll-teacher-assignment');
  if(!card)return;
  let guide=card.querySelector<HTMLElement>('[data-teacher-decision-guide]');
  if(!guide){guide=document.createElement('div');guide.dataset.teacherDecisionGuide='true';guide.className='ll-teacher-decision-guide';const title=card.querySelector('.ll-card-title');if(title)title.after(guide);else card.prepend(guide)}
  const status=data.latest_document?.mentor_review_status||'';guide.dataset.stage=stageTone(data.stage);guide.innerHTML=teacherGuideMarkup(data);
  if(!form)return;
  const shouldLock=status!=='pending';
  if(shouldLock){
    form.dataset.reviewFlowLocked='true';
    Array.from(form.elements).forEach(control=>{if(control instanceof HTMLInputElement||control instanceof HTMLSelectElement||control instanceof HTMLTextAreaElement||control instanceof HTMLButtonElement)control.disabled=true});
    const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(button)button.textContent=status==='approved'?'Approved — pending LitLab admin':status==='changes_requested'?'Waiting for revised DOCX':'Review unavailable';
    form.classList.add('is-review-locked');
  }else if(form.dataset.reviewFlowLocked==='true'){
    Array.from(form.elements).forEach(control=>{if(control instanceof HTMLInputElement||control instanceof HTMLSelectElement||control instanceof HTMLTextAreaElement||control instanceof HTMLButtonElement)control.disabled=false});
    const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(button)button.textContent='Submit teacher review';
    delete form.dataset.reviewFlowLocked;form.classList.remove('is-review-locked');
  }
}

async function refreshTeacher(id:string,force=false){
  if(!id||!token()||route()!=='contribute')return;
  const key=`teacher:${id}`;if(inFlight.has(key))return;
  const cached=cache.get(key);if(!force&&cached&&Date.now()-cached.at<8000){applyTeacherPipeline(id,cached.data);return}
  inFlight.add(key);
  try{const data=await rpc<Pipeline>('get_my_litlab_teacher_pipeline',{p_application_id:id});cache.set(key,{at:Date.now(),data});applyTeacherPipeline(id,data)}catch(error){console.debug('Teacher review stage unavailable',error)}finally{inFlight.delete(key)}
}

function ensureTeacherFlowGuide(){
  const zone=document.querySelector<HTMLElement>('.ll-teacher-zone');if(!zone)return;
  const head=zone.querySelector<HTMLElement>('.ll-workspace-head');if(!head||zone.querySelector('[data-teacher-flow-guide]'))return;
  const guide=document.createElement('div');guide.dataset.teacherFlowGuide='true';guide.className='ll-teacher-flow-guide';
  guide.innerHTML='<div><span>TEACHER DECISION PATH</span><b>Your job is review—not project management</b></div><div class="ll-teacher-flow-chips"><i>Open assigned DOCX</i><strong>→</strong><i>Score + write notes</i><strong>→</strong><i>Approve: LitLab admin</i><strong>or</strong><i>Changes: student revises</i></div>';
  head.after(guide);
}

function adminBadge(card:HTMLElement){
  let badge=card.querySelector<HTMLElement>('[data-admin-review-stage]');if(badge)return badge;
  const meta=card.querySelector<HTMLElement>('.admin-contrib-summary-meta');if(!meta)return null;
  badge=document.createElement('span');badge.dataset.adminReviewStage='true';badge.className='ll-admin-review-stage is-loading';badge.textContent='Review stage…';
  const appStatus=meta.querySelector('.status');if(appStatus)appStatus.before(badge);else meta.appendChild(badge);return badge;
}
function applyAdminRoleGuidance(card:HTMLElement){
  const role=card.querySelector<HTMLElement>('.admin-contrib-summary-meta > span')?.textContent?.trim().toLowerCase()||'';
  const teacher=role.includes('teacher');card.classList.toggle('ll-admin-teacher-application',teacher);
  let note=card.querySelector<HTMLElement>('[data-admin-teacher-guidance]');
  if(!teacher){note?.remove();return 'student'}
  card.querySelector<HTMLElement>('[data-admin-review-stage]')?.remove();
  if(!note){note=document.createElement('div');note.dataset.adminTeacherGuidance='true';note.className='ll-admin-teacher-guidance';const body=card.querySelector<HTMLElement>('.admin-contrib-body');const status=body?.querySelector('.admin-contrib-status-row');if(status)status.after(note);else body?.prepend(note)}
  if(note)note.innerHTML='<b>Teacher reviewer account</b><span>No project brief, student tasks, DOCX upload, activity log, or contributor workspace is needed for this account.</span><small><strong>Admin path:</strong> review the teacher application → accept the teacher → LitLab matches/assigns a supervised student → teacher reviews the student DOCX → LitLab admin makes the final student decision.</small>';
  return 'teacher';
}

function applyAdminPipeline(card:HTMLElement,data:Pipeline){
  const badge=adminBadge(card);if(!badge)return;
  if(data.applicant_type!=='student'){badge.remove();return}
  badge.className=`ll-admin-review-stage is-${stageTone(data.stage)}`;badge.textContent=stageLabel(data.stage);badge.title=data.stage==='admin_review'?'Teacher gate passed. This contribution is ready for LitLab admin review.':data.stage==='mentor_review'?'The document is currently with the linked teacher / mentor.':data.stage==='student_revision'?'Teacher requested changes; waiting for a revised student DOCX.':'Current document review stage';
}

async function refreshAdminCard(card:HTMLElement,force=false){
  const id=card.dataset.appId||'';if(!id||!token()||route()!=='admin-contributors')return;
  if(applyAdminRoleGuidance(card)==='teacher')return;
  const key=`admin:${id}`;if(inFlight.has(key))return;
  const cached=cache.get(key);if(!force&&cached&&Date.now()-cached.at<12000){applyAdminPipeline(card,cached.data);return}
  adminBadge(card);inFlight.add(key);
  try{const data=await rpc<Pipeline>('admin_get_litlab_contributor_pipeline',{p_application_id:id});cache.set(key,{at:Date.now(),data});if(card.isConnected)applyAdminPipeline(card,data)}catch(error){console.debug('Admin review stage unavailable',error);card.querySelector<HTMLElement>('[data-admin-review-stage]')?.remove()}finally{inFlight.delete(key)}
}

function refreshAdminCards(force=false){
  if(route()!=='admin-contributors')return;
  const version=++adminRefreshVersion;
  document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach((card,index)=>{
    applyAdminRoleGuidance(card);
    window.setTimeout(()=>{if(version===adminRefreshVersion)void refreshAdminCard(card,force)},Math.min(index*35,500));
  });
}

function applyTeacherAccountCleanup(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const isTeacher=selectedWorkspace?.applicant_type==='teacher';root.classList.toggle('ll-role-clarity-teacher',isTeacher);
  if(isTeacher){root.querySelector('[data-student-teacher-feedback]')?.remove();root.querySelector('[data-clear-review-status]')?.remove()}
}
function scan(force=false){
  if(route()==='contribute'){
    applyTeacherAccountCleanup();ensureTeacherFlowGuide();
    if(selectedUserId)void refreshStudent(force);
    teacherIds.forEach(id=>void refreshTeacher(id,force));
  }else if(route()==='admin-contributors')refreshAdminCards(force);
}
function scheduleScan(force=false){window.clearTimeout(scanTimer);scanTimer=window.setTimeout(()=>scan(force),80)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};selectedUserId=detail.selectedId||'';teacherIds=(detail.assignments||[]).map(item=>item.application_id).filter(Boolean);const rows=detail.workspaces||[];selectedWorkspace=rows.find(item=>item.id===selectedUserId)||rows[0]||null;scheduleScan(true);
});
window.addEventListener('litlab:contributor-workspace-updated',()=>scheduleScan(true));
window.addEventListener('litlab:contributor-admin-updated',()=>scheduleScan(true));
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>scheduleScan(true));
window.addEventListener('hashchange',()=>{selectedUserId='';selectedWorkspace=null;teacherIds=[];cache.clear();scheduleScan(true)});
window.addEventListener('focus',()=>scheduleScan(true));

document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;const id=form?.dataset.teacherReview;if(!id)return;
  window.setTimeout(()=>{cache.delete(`teacher:${id}`);if(selectedUserId)cache.delete(`user:${selectedUserId}`);void refreshTeacher(id,true);void refreshStudent(true)},700);
},true);

const observer=new MutationObserver(()=>scheduleScan(false));
function start(){observer.observe(document.body,{childList:true,subtree:true});scheduleScan(true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
