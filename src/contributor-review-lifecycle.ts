import './contributor-review-lifecycle.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const POLL_MS=15_000;
const SEEN_PREFIX='litlabReviewLifecycleSeen:';

type StoredSession={access_token?:string};
type Workspace={id:string;applicant_type:'student'|'teacher';status:string;topics?:string;reviews?:unknown[]};
type AssignmentRow={application_id:string;student_name?:string;status?:string};
type ReviewEvent={id:string;application_id:string;event_type:string;detail?:Record<string,unknown>|null;created_at:string;audience?:'student'|'teacher';student_name?:string|null;teacher_name?:string|null;topics?:string|null};
type TeacherLink={teacher_application_id?:string;teacher_name?:string|null;teacher_email?:string|null;teacher_subject?:string|null;teacher_status?:string|null;assigned_at?:string|null};
type Pipeline={application_id:string;application_status?:string;applicant_type?:string;student_name?:string|null;student_email?:string|null;stage:string;mentor_required?:boolean;mentor_email?:string|null;assignment?:TeacherLink|null;latest_document?:{id?:string;original_name?:string;version_label?:string;is_final_submission?:boolean;created_at?:string;mentor_review_status?:string}|null};
type WorkspaceEvent={selectedId?:string;workspaces?:Workspace[];assignments?:AssignmentRow[]};

type Mode='admin'|'user'|'none';
let mode:Mode='none';
let roleToken='';
let selectedId='';
let workspaces:Workspace[]=[];
let assignments:AssignmentRow[]=[];
let scanTimer=0;
let pollTimer=0;
let loadingNotices=false;
const pipelineCache=new Map<string,{at:number;data:Pipeline}>();
const inFlight=new Set<string>();

function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function userId(){try{const p=token().split('.')[1];if(!p)return '';const n=p.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(p.length/4)*4,'=');return String(JSON.parse(atob(n))?.sub||'')}catch{return ''}}
function fmt(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function selectedWorkspace(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function stageTone(stage:string){if(stage==='admin_review'||stage==='complete')return 'success';if(stage==='mentor_review')return 'teacher';if(stage==='student_revision')return 'revision';if(stage==='mentor_link')return 'waiting';return 'neutral'}
function stageLabel(stage:string){return ({student_work:'With you',mentor_link:'Waiting for teacher link',mentor_review:'With your teacher',student_revision:'Back with you for revision',admin_review:'With LitLab admin',complete:'Completed'} as Record<string,string>)[stage]||'Review in progress'}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const data=await response.json() as {message?:string};if(data.message)message=data.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

async function resolveMode(){
  const access=token();if(!access){mode='none';roleToken='';return mode}
  if(roleToken===access&&mode!=='none')return mode;
  roleToken=access;
  try{mode=Boolean(await rpc<boolean>('is_litlab_admin'))?'admin':'user'}catch{mode='user'}
  return mode;
}

async function getPipeline(id:string,admin=false,force=false){
  const key=`${admin?'admin':'user'}:${id}`;const cached=pipelineCache.get(key);
  if(!force&&cached&&Date.now()-cached.at<7000)return cached.data;
  if(inFlight.has(key))return cached?.data||null;
  inFlight.add(key);
  try{const data=await rpc<Pipeline>(admin?'admin_get_litlab_contributor_pipeline':'get_my_litlab_contributor_pipeline',{p_application_id:id});pipelineCache.set(key,{at:Date.now(),data});return data}finally{inFlight.delete(key)}
}

function reviewPathMarkup(data:Pipeline){
  const teacher=data.assignment?.teacher_name||'your teacher';
  const studentDone=['mentor_review','admin_review','complete'].includes(data.stage);
  const teacherActive=data.stage==='mentor_review';
  const teacherDone=['admin_review','complete'].includes(data.stage);
  const adminActive=data.stage==='admin_review';
  const adminDone=data.stage==='complete';
  const studentLabel=data.stage==='student_revision'?'Revise and resubmit':data.latest_document?'Submitted':'Prepare DOCX';
  return `<div class="ll-student-review-path"><div class="${data.stage==='student_work'||data.stage==='student_revision'||data.stage==='mentor_link'?'active':studentDone?'done':''}"><i>${studentDone?'✓':'1'}</i><span><b>You</b><small>${esc(studentLabel)}</small></span></div><strong>→</strong>${data.mentor_required?`<div class="${teacherActive?'active':teacherDone?'done':'waiting'}"><i>${teacherDone?'✓':'2'}</i><span><b>${esc(teacher)}</b><small>${teacherActive?'Reviewing now':data.stage==='student_revision'?'Requested changes':teacherDone?'Approved / finished':'Teacher review'}</small></span></div><strong>→</strong>`:''}<div class="${adminActive?'active':adminDone?'done':'waiting'}"><i>${adminDone?'✓':data.mentor_required?'3':'2'}</i><span><b>LitLab admin</b><small>${adminActive?'Final review':adminDone?'Completed':'Waiting for handoff'}</small></span></div></div>`;
}

function studentLocationCopy(data:Pipeline){
  const teacher=data.assignment?.teacher_name||'your teacher / mentor';
  if(data.stage==='student_work')return data.mentor_required?`Your next DOCX goes to <strong>${esc(teacher)}</strong> first. The teacher can either request changes or approve it and hand it to LitLab admin.`:'Your next DOCX goes directly to <strong>LitLab admin</strong>. No teacher review is required for this contribution.';
  if(data.stage==='mentor_link')return `Your DOCX is uploaded, but the teacher account is not linked yet. <strong>Do not upload the same file again.</strong> LitLab will connect the teacher or assign one before the review starts.`;
  if(data.stage==='mentor_review')return `Your DOCX is currently with <strong>${esc(teacher)}</strong>. Wait for the teacher response: it will either come back to you with revision notes or move forward to LitLab admin after teacher approval.`;
  if(data.stage==='student_revision')return `The document is <strong>back with you</strong>. Read the teacher’s notes and scores, make the requested changes, then upload a revised DOCX. It returns to ${esc(teacher)} automatically.`;
  if(data.stage==='admin_review')return data.mentor_required?`<strong>${esc(teacher)}</strong> approved the current version. Your DOCX is now with <strong>LitLab admin</strong> for the final decision.`:'Your DOCX is now with <strong>LitLab admin</strong> for review.';
  return `This contribution is closed. Your documents, teacher notes, evidence and history stay saved. Use <strong>Make a new contribution</strong> whenever you want to start another one.`;
}

function decorateSubmissionHistory(data:Pipeline){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  root.querySelectorAll<HTMLElement>('.ll-doc-list>div').forEach(row=>{
    const title=row.querySelector('section b')?.textContent||'';
    const final=/^final submission\s*[—-]/i.test(title);
    row.classList.toggle('ll-final-doc-row',final);
    let badge=row.querySelector<HTMLElement>('[data-final-doc-badge]');
    if(final&&!badge){badge=document.createElement('em');badge.dataset.finalDocBadge='true';badge.className='ll-final-doc-badge';badge.textContent='FINAL FOR REVIEW';row.querySelector('section')?.appendChild(badge)}
    if(!final)badge?.remove();
  });
  const latest=data.latest_document;if(!latest)return;
  root.querySelectorAll<HTMLElement>('.ll-doc-list>div').forEach(row=>{
    const title=row.querySelector('section b')?.textContent||'';
    row.classList.toggle('ll-current-doc-row',Boolean(latest.original_name&&title.includes(latest.original_name)));
  });
}

function configureUploadForm(data:Pipeline){
  const form=document.querySelector<HTMLFormElement>(`.ll-docx-form[data-docx-upload="${CSS.escape(data.application_id)}"]`);if(!form)return;
  const select=form.querySelector<HTMLSelectElement>('select[name="version"]');
  const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(!select||!submit)return;
  const finalOption=Array.from(select.options).find(option=>option.value==='Final submission'||option.textContent?.trim().startsWith('Final submission'));
  if(finalOption){finalOption.value='Final submission';finalOption.textContent='Final submission — this is the version admin should judge'}
  let help=form.querySelector<HTMLElement>('[data-final-submission-help]');
  if(!help){help=document.createElement('div');help.dataset.finalSubmissionHelp='true';help.className='ll-final-submission-help';help.innerHTML='<b>When should I choose Final submission?</b><span>Choose it only when this is the finished version you want LitLab to judge as final. If you have a teacher, “Final submission” still goes to the teacher first; after teacher approval it moves to LitLab admin.</span>';const fields=form.querySelector('.ll-docx-fields');fields?.after(help)}
  const locked=['mentor_link','mentor_review','admin_review','complete'].includes(data.stage);
  const finalSelected=select.value==='Final submission';
  const teacher=data.assignment?.teacher_name||'teacher';
  let buttonText='Submit Word document';
  if(locked){
    if(data.stage==='mentor_review')buttonText=`Waiting for ${teacher}’s response`;
    else if(data.stage==='mentor_link')buttonText='Waiting for teacher link';
    else if(data.stage==='admin_review')buttonText='Pending LitLab admin review';
    else buttonText='Contribution completed';
  }else if(data.mentor_required)buttonText=finalSelected?'Submit FINAL version to teacher':'Submit for teacher review';
  else buttonText=finalSelected?'Submit FINAL version to LitLab admin':'Submit version to LitLab admin';
  submit.textContent=buttonText;submit.classList.toggle('is-final-submit',finalSelected&&!locked);
  Array.from(form.elements).forEach(control=>{if(control instanceof HTMLInputElement||control instanceof HTMLSelectElement||control instanceof HTMLTextAreaElement||control instanceof HTMLButtonElement)control.disabled=locked});
  form.classList.toggle('is-review-waiting',locked);
  if(!select.dataset.lifecycleBound){select.dataset.lifecycleBound='true';select.addEventListener('change',()=>{pipelineCache.delete(`user:${data.application_id}`);void refreshSelectedStudent(true)})}
}

function applyStudentLifecycle(data:Pipeline){
  const workspace=selectedWorkspace();if(!workspace||workspace.applicant_type!=='student')return;
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  let panel=root.querySelector<HTMLElement>('[data-document-review-lifecycle]');
  if(!panel){panel=document.createElement('section');panel.dataset.documentReviewLifecycle='true';panel.className='ll-document-review-lifecycle';const timeline=root.querySelector('.ll-workspace-timeline');const grid=root.querySelector('.ll-workspace-grid');if(timeline)timeline.after(panel);else if(grid)grid.before(panel);else root.appendChild(panel)}
  const teacherName=data.assignment?.teacher_name;
  const final=Boolean(data.latest_document?.is_final_submission||data.latest_document?.version_label==='Final submission');
  const pathKind=data.mentor_required?teacherName?`Teacher review · ${teacherName}`:'Teacher review required':'Direct LitLab review';
  const doc=data.latest_document?`<div class="ll-current-doc-location"><span>CURRENT DOCUMENT</span><b>${esc(data.latest_document.version_label||'DOCX')} · ${esc(data.latest_document.original_name||'Word document')}</b><small>${final?'Marked FINAL submission':data.latest_document.created_at?`Uploaded ${esc(fmt(data.latest_document.created_at))}`:'Current version'}</small></div>`:'';
  panel.dataset.stage=stageTone(data.stage);
  panel.innerHTML=`<header><div><span>DOCUMENT REVIEW PATH</span><h3>Know exactly where your DOCX is.</h3></div><strong>${esc(pathKind)}</strong></header>${reviewPathMarkup(data)}<div class="ll-document-location"><div><span>RIGHT NOW</span><b>${esc(stageLabel(data.stage))}</b><p>${studentLocationCopy(data)}</p></div>${doc}</div>`;
  root.classList.toggle('ll-student-lifecycle-complete',data.stage==='complete');
  configureUploadForm(data);decorateSubmissionHistory(data);
}

async function refreshSelectedStudent(force=false){
  if(route()!=='contribute'||!token())return;
  const workspace=selectedWorkspace();if(!workspace||workspace.applicant_type!=='student')return;
  try{const data=await getPipeline(workspace.id,false,force);if(data)applyStudentLifecycle(data)}catch(error){console.debug('Student review lifecycle unavailable',error)}
}

function teacherCompletionCard(){
  const workspace=selectedWorkspace();const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const completed=workspace?.applicant_type==='teacher'&&workspace.status==='completed';
  root.classList.toggle('ll-teacher-lifecycle-complete',Boolean(completed));
  let card=root.querySelector<HTMLElement>('[data-teacher-mentoring-complete]');
  if(!completed){card?.remove();return}
  if(!card){card=document.createElement('section');card.dataset.teacherMentoringComplete='true';card.className='ll-teacher-mentoring-complete';const zone=root.querySelector('.ll-teacher-zone');if(zone)zone.before(card);else root.appendChild(card)}
  card.innerHTML='<div class="ll-teacher-thanks-icon">✓</div><div><span>MENTORING COMPLETE</span><h2>Thank you for helping make LitLab better.</h2><p>The student contribution connected to this mentoring record is complete. Your academic review and testimony remain saved with the student’s evidence and can be referenced in the student’s LitLab certificate record. Teachers do not need a separate contributor certificate.</p><small>This teacher-review application is now closed. Your previous review remains visible as a saved mentoring record.</small></div>';
}

function applyTeacherDashboardLifecycle(){
  if(route()!=='contribute')return;teacherCompletionCard();
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const workspace=selectedWorkspace();root.classList.toggle('ll-lifecycle-teacher-view',workspace?.applicant_type==='teacher');
  if(workspace?.applicant_type!=='teacher')return;
  const head=root.querySelector<HTMLElement>(':scope>.ll-workspace-head');if(head){const h=head.querySelector('h2');const p=head.querySelector('p');if(h)h.textContent=workspace.status==='completed'?'Your saved teacher mentoring record.':'Your teacher review dashboard.';if(p)p.textContent=workspace.status==='completed'?'This review is closed. Your testimony remains attached to the student contribution.':'Only assigned student DOCX reviews appear here. Open the current file, score it, write notes, and choose one decision. LitLab admin handles the final student outcome.'}
}

function adminDocSummary(data:Pipeline){
  const doc=data.latest_document;const teacher=data.assignment;
  if(!doc)return '<b>No DOCX submitted yet.</b><span>The review path starts when the student uploads a Word document.</span>';
  const final=Boolean(doc.is_final_submission||doc.version_label==='Final submission');
  const owner=data.stage==='mentor_review'?teacher?.teacher_name||'Teacher reviewer':data.stage==='student_revision'?'Student':data.stage==='admin_review'?'LitLab admin':data.stage==='complete'?'Completed record':'Student';
  return `<b>${final?'FINAL submission':'Current submission'} · ${esc(doc.version_label||'DOCX')}</b><span>${esc(doc.original_name||'Word document')} · Currently with <strong>${esc(owner)}</strong>.</span>${data.stage==='admin_review'&&!final?'<em>This version is ready for admin review but is not marked “Final submission”. Confirm with the student before treating it as the final deliverable.</em>':''}`;
}

function applyAdminLifecycle(data:Pipeline){
  if(data.applicant_type!=='student')return;
  const card=document.querySelector<HTMLElement>(`.admin-contrib-card[data-app-id="${CSS.escape(data.application_id)}"]`);
  if(card){
    let row=card.querySelector<HTMLElement>('[data-admin-doc-lifecycle]');
    if(!row){row=document.createElement('div');row.dataset.adminDocLifecycle='true';row.className='ll-admin-doc-lifecycle';const owner=card.querySelector('[data-admin-student-review-owner]');if(owner)owner.appendChild(row);else card.querySelector('.admin-contrib-status-row')?.after(row)}
    row.dataset.stage=stageTone(data.stage);row.innerHTML=adminDocSummary(data);
    const manage=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');if(manage)manage.textContent='Open student review center';
  }
  const modal=document.getElementById('ll-admin-contributor-workspace');if(!modal)return;
  const center=modal.querySelector<HTMLElement>('[data-admin-review-decision-center]');if(!center)return;
  const modalTitle=modal.querySelector('header h2')?.textContent||'';
  if(data.student_name&&modalTitle&&!modalTitle.toLowerCase().includes(data.student_name.toLowerCase()))return;
  let finalCheck=center.querySelector<HTMLElement>('[data-admin-final-submission-check]');
  if(!finalCheck){finalCheck=document.createElement('div');finalCheck.dataset.adminFinalSubmissionCheck='true';finalCheck.className='ll-admin-final-submission-check';center.querySelector('.ll-admin-review-path')?.after(finalCheck)}
  const doc=data.latest_document;const final=Boolean(doc?.is_final_submission||doc?.version_label==='Final submission');
  const teacher=data.assignment;
  finalCheck.className=`ll-admin-final-submission-check ${final?'is-final':''} ${data.stage==='admin_review'&&!final?'needs-confirmation':''}`;
  finalCheck.innerHTML=`<div><span>FINAL SUBMISSION CHECK</span><b>${doc?final?'Student marked this as FINAL submission':'Student has not marked this version as final':'No submission yet'}</b><p>${doc?data.mentor_required?`Responsible teacher: <strong>${esc(teacher?.teacher_name||'not linked yet')}</strong>${teacher?.teacher_subject?` · ${esc(teacher.teacher_subject)}`:''}. ${data.stage==='admin_review'?'Teacher gate is complete; this is now your review stage.':'The current owner is shown in the path above.'}`:'No Word document has been submitted.':data.mentor_required?'The teacher relationship must be ready before the supervised review path can begin.':'The student can submit directly to LitLab admin.'}</p></div>${doc?`<strong>${esc(doc.version_label||'DOCX')}</strong>`:''}`;
}

async function refreshAdminLifecycle(force=false){
  if(route()!=='admin-contributors'||!token())return;
  const cards=Array.from(document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]'));
  await Promise.all(cards.map(async card=>{const role=card.querySelector<HTMLElement>('.admin-contrib-summary-meta>span')?.textContent?.toLowerCase()||'';if(role.includes('teacher'))return;const id=card.dataset.appId||'';if(!id)return;try{const data=await getPipeline(id,true,force);if(data&&card.isConnected)applyAdminLifecycle(data)}catch(error){console.debug('Admin lifecycle unavailable',error)}}));
}

function seenKey(){return `${SEEN_PREFIX}${userId()||'account'}:${mode}`}
function readSeen(){try{const raw=JSON.parse(localStorage.getItem(seenKey())||'null');return new Set(Array.isArray(raw)?raw.map(String):[])}catch{return new Set<string>()}}
function writeSeen(set:Set<string>){try{localStorage.setItem(seenKey(),JSON.stringify([...set].slice(-300)))}catch{}}
function eventKey(event:ReviewEvent){return `${event.audience||mode}:${event.id}`}
function eventDetail(event:ReviewEvent,key:string){const value=event.detail?.[key];return typeof value==='string'?value:''}

function noticeCopy(event:ReviewEvent){
  const teacher=event.teacher_name||eventDetail(event,'teacher_name')||'your teacher';
  const student=event.student_name||eventDetail(event,'student_name')||'the student';
  const final=event.detail?.is_final_submission===true||eventDetail(event,'version_label')==='Final submission';
  if(mode==='admin'){
    if(event.event_type==='mentor_approved_document')return {tone:'success',kicker:'TEACHER REVIEW COMPLETE',title:`${student} is ready for LitLab admin`,body:`${teacher} approved the student’s current DOCX. Open the student review center to read the teacher testimony, check the final-submission label, and make the LitLab decision.`,button:'Open contributor dashboard',hash:'admin-contributors'};
    if(event.event_type==='document_submitted_for_admin_review')return {tone:'admin',kicker:'NEW DOCX FOR ADMIN',title:`${student} submitted ${final?'a FINAL version':'a Word document'}`,body:'No teacher gate is required. The document is now with LitLab admin for review.',button:'Open contributor dashboard',hash:'admin-contributors'};
    if(event.event_type==='document_submitted_for_mentor_review')return {tone:'teacher',kicker:'STUDENT DOCX UPDATE',title:`${student} submitted ${final?'a FINAL version':'a Word document'}`,body:`The document is now with ${teacher}. LitLab admin can monitor the teacher decision from the student review center.`,button:'Open contributor dashboard',hash:'admin-contributors'};
    if(event.event_type==='mentor_requested_changes')return {tone:'revision',kicker:'TEACHER REQUESTED CHANGES',title:`${student} is revising`,body:`${teacher} sent the document back with teacher notes. The next revised DOCX will return to the teacher before admin review.`,button:'Open contributor dashboard',hash:'admin-contributors'};
    return null;
  }
  if(event.audience==='teacher'){
    if(event.event_type==='teacher_mentoring_completed'||event.event_type==='admin_completed_contribution')return {tone:'success',kicker:'MENTORING COMPLETE',title:'Thank you for helping make LitLab better',body:`${student}’s contribution is complete. Your academic review/testimony remains saved with the student record and can support the student’s certificate evidence. Teachers do not need a separate contributor certificate.`,button:'Open teacher record',hash:'contribute'};
    if(event.event_type==='teacher_assigned_by_admin')return {tone:'teacher',kicker:'NEW TEACHER ASSIGNMENT',title:`You are responsible for ${student}`,body:'The student now appears in your teacher review dashboard. When a DOCX is ready, review only the current version and submit one academic decision.',button:'Open teacher dashboard',hash:'contribute'};
    if(event.event_type==='document_submitted_for_mentor_review')return {tone:'teacher',kicker:'DOCX READY FOR TEACHER REVIEW',title:`${student} submitted ${final?'a FINAL version':'a new Word document'}`,body:'Open your teacher dashboard, review the current DOCX, score all five criteria, write notes, then Approve academically or Request changes.',button:'Review student DOCX',hash:'contribute'};
    return null;
  }
  if(event.event_type==='document_submitted_for_mentor_review')return {tone:'teacher',kicker:'DOCX SUBMITTED',title:`Your document is now with ${teacher}`,body:`Wait for the teacher response. ${teacher} can request changes and send the DOCX back to you, or approve it so it moves to LitLab admin.${final?' You marked this version as FINAL submission.':''}`,button:'See document status',hash:'contribute'};
  if(event.event_type==='document_submitted_for_admin_review')return {tone:'admin',kicker:'DOCX SUBMITTED',title:'Your document is now with LitLab admin',body:`No teacher review is required for this contribution.${final?' You marked this version as FINAL submission for LitLab’s review.':''}`,button:'See document status',hash:'contribute'};
  if(event.event_type==='mentor_linked'||event.event_type==='teacher_assigned_by_admin')return {tone:'teacher',kicker:'TEACHER CONNECTED',title:`${teacher} is now your responsible teacher`,body:'When you submit a DOCX, it goes to this teacher first. Teacher approval is required before that version can move to LitLab admin.',button:'See review path',hash:'contribute'};
  if(event.event_type==='mentor_requested_changes')return {tone:'revision',kicker:'TEACHER FEEDBACK',title:`${teacher} requested changes`,body:'Your DOCX is back with you. Open the teacher notes and rubric scores, revise the document, then upload a new version. The revision returns to the teacher automatically.',button:'Open teacher feedback',hash:'contribute'};
  if(event.event_type==='mentor_approved_document')return {tone:'success',kicker:'TEACHER APPROVED',title:`${teacher} approved your DOCX`,body:'Your document has moved forward to LitLab admin for the final review. You do not need to upload it again unless LitLab asks for another revision.',button:'See review status',hash:'contribute'};
  if(event.event_type==='admin_completed_contribution')return {tone:'success',kicker:'CONTRIBUTION COMPLETE',title:'LitLab marked your contribution complete',body:'The active workflow is closed and all of your evidence remains saved. Your contributor page/site will update to the completed record shortly; you can start a new contribution whenever you want.',button:'Open completed record',hash:'contribute'};
  return null;
}

function showNotice(copy:{tone:string;kicker:string;title:string;body:string;button:string;hash:string}){
  document.getElementById('ll-review-lifecycle-notice')?.remove();
  const notice=document.createElement('aside');notice.id='ll-review-lifecycle-notice';notice.className=`ll-review-lifecycle-notice is-${copy.tone}`;notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
  notice.innerHTML=`<button type="button" data-review-notice-close aria-label="Dismiss">×</button><span>${esc(copy.kicker)}</span><div><i>●</i><section><b>${esc(copy.title)}</b><p>${esc(copy.body)}</p></section></div><button type="button" data-review-notice-open>${esc(copy.button)} →</button>`;
  const dismiss=()=>{notice.classList.add('is-closing');window.setTimeout(()=>notice.remove(),220)};
  notice.querySelector('[data-review-notice-close]')?.addEventListener('click',dismiss);
  notice.querySelector('[data-review-notice-open]')?.addEventListener('click',()=>{dismiss();location.hash=copy.hash});
  document.body.appendChild(notice);requestAnimationFrame(()=>notice.classList.add('is-visible'));
}

async function pollReviewNotices(force=false){
  if(loadingNotices||!token()||document.hidden&&!force)return;
  loadingNotices=true;
  try{
    await resolveMode();if(mode==='none')return;
    const rows=mode==='admin'?await rpc<ReviewEvent[]>('admin_get_litlab_contributor_review_updates'):await rpc<ReviewEvent[]>('get_my_litlab_contributor_review_updates');
    const events=Array.isArray(rows)?rows:[];const key=seenKey();let existed=false;try{existed=localStorage.getItem(key)!==null}catch{}
    const seen=readSeen();
    const actionable=events.filter(event=>Boolean(noticeCopy(event)));
    const unseen=actionable.filter(event=>!seen.has(eventKey(event)));
    if(!unseen.length){events.forEach(event=>seen.add(eventKey(event)));writeSeen(seen);return}
    let chosen=unseen[0];
    if(!existed){const recent=unseen.find(event=>Date.now()-(Date.parse(event.created_at)||0)<7*24*60*60*1000);chosen=recent||unseen[0]}
    events.forEach(event=>seen.add(eventKey(event)));writeSeen(seen);
    const copy=noticeCopy(chosen);if(copy)showNotice(copy);
  }catch(error){console.debug('Review notification feed unavailable',error)}finally{loadingNotices=false}
}

async function bootstrapContributorState(force=false){
  if(route()!=='contribute'||!token())return;
  try{
    const [rows,teacherRows]=await Promise.all([rpc<Workspace[]>('get_my_litlab_contributor_workspace'),rpc<AssignmentRow[]>('get_my_litlab_teacher_assignments')]);
    workspaces=Array.isArray(rows)?rows:[];assignments=Array.isArray(teacherRows)?teacherRows:[];
    const active=document.querySelector<HTMLElement>('[data-workspace-select].active')?.dataset.workspaceSelect||'';selectedId=active||selectedId||workspaces[0]?.id||'';
    applyTeacherDashboardLifecycle();await refreshSelectedStudent(force);
  }catch(error){console.debug('Contributor lifecycle state unavailable',error)}
}

function scan(force=false){
  window.clearTimeout(scanTimer);scanTimer=window.setTimeout(()=>{
    if(route()==='contribute'){applyTeacherDashboardLifecycle();void refreshSelectedStudent(force)}
    else if(route()==='admin-contributors')void refreshAdminLifecycle(force);
  },80);
}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  if(detail.selectedId)selectedId=detail.selectedId;
  applyTeacherDashboardLifecycle();scan(true);
});
window.addEventListener('litlab:contributor-workspace-updated',()=>{pipelineCache.clear();window.setTimeout(()=>{void bootstrapContributorState(true);void pollReviewNotices(true)},450)});
window.addEventListener('litlab:contributor-admin-updated',()=>{pipelineCache.clear();window.setTimeout(()=>{scan(true);void pollReviewNotices(true)},350)});
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>{pipelineCache.clear();window.setTimeout(()=>void refreshAdminLifecycle(true),120)});
window.addEventListener('litlab:contributor-submitted',()=>window.setTimeout(()=>void pollReviewNotices(true),500));
window.addEventListener('hashchange',()=>{pipelineCache.clear();selectedId='';scan(true);window.setTimeout(()=>{void bootstrapContributorState(true);void pollReviewNotices(true)},180)});
window.addEventListener('focus',()=>{void pollReviewNotices(true);scan(true)});
window.addEventListener('online',()=>{void pollReviewNotices(true);scan(true)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){mode='none';roleToken='';pipelineCache.clear();void pollReviewNotices(true);void bootstrapContributorState(true)}});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-workspace-select]'))window.setTimeout(()=>void bootstrapContributorState(true),80);
},true);

const observer=new MutationObserver(()=>scan(false));
function schedulePoll(){window.clearTimeout(pollTimer);pollTimer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine){await pollReviewNotices();scan(false)}schedulePoll()},POLL_MS)}
function start(){observer.observe(document.body,{childList:true,subtree:true});void resolveMode().then(()=>pollReviewNotices(true));void bootstrapContributorState(true);scan(true);schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
