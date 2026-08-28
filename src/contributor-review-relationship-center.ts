import './contributor-review-relationship-center.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type Testimony={reviewer_name?:string|null;recommendation?:'approve'|'request_changes'|string;summary?:string|null;accuracy?:number;clarity?:number;dp_relevance?:number;originality?:number;sources?:number;created_at?:string|null};
type TeacherLink={teacher_application_id?:string;teacher_name?:string|null;teacher_email?:string|null;teacher_mentee_email?:string|null;assigned_at?:string|null};
type MatchingTeacher={id?:string;full_name?:string|null;email?:string|null;mentee_email?:string|null;status?:string|null};
type Pipeline={
  application_id:string;
  applicant_type?:string;
  student_name?:string|null;
  student_email?:string|null;
  topics?:string|null;
  contribution_type?:string|null;
  mentor_required?:boolean;
  mentor_email?:string|null;
  stage:string;
  assignment?:TeacherLink|null;
  matching_teacher?:MatchingTeacher|null;
  teacher_testimony?:Testimony|null;
  latest_document?:{id?:string;original_name?:string;version_label?:string;created_at?:string;mentor_review_status?:string;mentor_reviewed_at?:string|null}|null;
};
type WorkspaceEvent={assignments?:Array<{application_id:string}>};

type Cached={at:number;data:Pipeline};
const cache=new Map<string,Cached>();
const teacherPipelines=new Map<string,Pipeline>();
const inFlight=new Set<string>();
let teacherIds:string[]=[];
let scanTimer=0;
let adminScanVersion=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmt(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function initial(value?:string|null){return String(value||'?').trim().charAt(0).toUpperCase()||'?'}
function stageLabel(stage:string){return ({student_work:'Waiting for student DOCX',mentor_link:'Teacher link needed',mentor_review:'Under teacher review',student_revision:'Teacher requested changes',admin_review:'Ready for LitLab admin',complete:'Completed'} as Record<string,string>)[stage]||'Review in progress'}
function stageTone(stage:string){if(stage==='admin_review'||stage==='complete')return 'success';if(stage==='mentor_review')return 'teacher';if(stage==='student_revision')return 'revision';if(stage==='mentor_link')return 'waiting';return 'neutral'}
function average(review?:Testimony|null){if(!review)return '';const values=[review.accuracy,review.clarity,review.dp_relevance,review.originality,review.sources].map(Number).filter(value=>Number.isFinite(value));return values.length===5?(values.reduce((a,b)=>a+b,0)/5).toFixed(1):''}

async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

async function pipeline(key:string,rpcName:string,id:string,force=false){
  const cached=cache.get(key);if(!force&&cached&&Date.now()-cached.at<10_000)return cached.data;
  if(inFlight.has(key))return cached?.data||null;
  inFlight.add(key);
  try{const data=await rpc<Pipeline>(rpcName,{p_application_id:id});cache.set(key,{at:Date.now(),data});return data}finally{inFlight.delete(key)}
}

function teacherAction(data:Pipeline){
  if(data.stage==='mentor_review')return {title:'Your action: review this DOCX',body:'Open the current DOCX, score all five rubric areas, write useful notes, then choose Approve academically or Request changes.'};
  if(data.stage==='student_revision')return {title:'Waiting for the student',body:'You already requested changes on this version. Your decision is locked until the student uploads a revised DOCX.'};
  if(data.stage==='admin_review')return {title:'Your part is complete',body:'You approved the current version. LitLab admin now owns the final decision; no teacher action is needed unless a new version is sent back.'};
  if(data.stage==='complete')return {title:'Review path complete',body:'The student contribution has completed the teacher and LitLab admin review path.'};
  return {title:'Waiting for the student’s DOCX',body:'There is nothing to review yet. This card will become actionable automatically when the student submits a document.'};
}

function markTeacherDocuments(card:HTMLElement,data:Pipeline){
  const docs=Array.from(card.querySelectorAll<HTMLElement>('.ll-assigned-docs button[data-download-doc]'));
  docs.forEach((button,index)=>{
    button.classList.toggle('ll-current-review-doc',index===0);
    button.classList.toggle('ll-previous-review-doc',index>0);
    let tag=button.querySelector<HTMLElement>('[data-review-doc-tag]');
    if(!tag){tag=document.createElement('span');tag.dataset.reviewDocTag='true';tag.className='ll-review-doc-tag';button.appendChild(tag)}
    const text=index===0?(data.stage==='mentor_review'?'CURRENT DOCX · REVIEW THIS':data.stage==='student_revision'?'CURRENT DOCX · CHANGES REQUESTED':data.stage==='admin_review'?'CURRENT DOCX · APPROVED':'CURRENT DOCX'):'Previous version';
    if(tag.textContent!==text)tag.textContent=text;
  });
}

function applyTeacherCard(card:HTMLElement,data:Pipeline){
  card.dataset.reviewStage=stageTone(data.stage);
  let summary=card.querySelector<HTMLElement>('[data-teacher-action-summary]');
  if(!summary){summary=document.createElement('div');summary.dataset.teacherActionSummary='true';summary.className='ll-teacher-action-summary';const guide=card.querySelector('[data-teacher-decision-guide]');const title=card.querySelector('.ll-card-title');(guide||title)?.after(summary)}
  const renderKey=`${data.stage}:${data.latest_document?.id||''}`;
  if(summary.dataset.renderKey!==renderKey){const action=teacherAction(data);summary.dataset.stage=stageTone(data.stage);summary.dataset.renderKey=renderKey;summary.innerHTML=`<div><span>NEXT ACTION</span><b>${esc(action.title)}</b><p>${esc(action.body)}</p></div><strong>${esc(stageLabel(data.stage))}</strong>`}
  markTeacherDocuments(card,data);
}

function renderTeacherQueue(){
  const zone=document.querySelector<HTMLElement>('.ll-teacher-zone');if(!zone)return;
  let panel=zone.querySelector<HTMLElement>('[data-teacher-queue-summary]');
  const rows=teacherIds.map(id=>teacherPipelines.get(id)).filter((value):value is Pipeline=>Boolean(value));
  if(!rows.length){panel?.remove();return}
  if(!panel){panel=document.createElement('section');panel.dataset.teacherQueueSummary='true';panel.className='ll-teacher-queue-summary';const flow=zone.querySelector('[data-teacher-flow-guide]');const head=zone.querySelector('.ll-workspace-head');(flow||head)?.after(panel)}
  const action=rows.filter(r=>r.stage==='mentor_review').length;
  const student=rows.filter(r=>r.stage==='student_revision'||r.stage==='student_work').length;
  const admin=rows.filter(r=>r.stage==='admin_review').length;
  const done=rows.filter(r=>r.stage==='complete').length;
  const renderKey=`${action}:${student}:${admin}:${done}`;if(panel.dataset.renderKey===renderKey)return;panel.dataset.renderKey=renderKey;
  panel.innerHTML=`<div><span>YOUR REVIEW QUEUE</span><b>${action?`${action} student${action===1?'':'s'} need your review`:'No teacher action is waiting'}</b><p>Only cards marked <strong>Under teacher review</strong> need a decision. Everything else is waiting on the student or LitLab admin.</p></div><div class="ll-teacher-queue-counts"><i><b>${action}</b>Needs review</i><i><b>${student}</b>Waiting student</i><i><b>${admin}</b>With admin</i><i><b>${done}</b>Complete</i></div>`;
}

async function refreshTeacherDashboard(force=false){
  if(route()!=='contribute'||!token()||!teacherIds.length)return;
  const cards=Array.from(document.querySelectorAll<HTMLElement>('.ll-teacher-assignment'));
  await Promise.all(teacherIds.map(async(id,index)=>{try{const data=await pipeline(`teacher-center:${id}`,'get_my_litlab_teacher_pipeline',id,force);if(!data)return;teacherPipelines.set(id,data);const card=cards[index];if(card)applyTeacherCard(card,data)}catch(error){console.debug('Teacher queue clarity unavailable',error)}}));
  renderTeacherQueue();
}

function adminAction(data:Pipeline){
  if(data.stage==='mentor_link')return {title:'Teacher setup needed first',body:'This supervised student cannot enter teacher review until the correct teacher account is linked and assigned.'};
  if(data.stage==='mentor_review')return {title:'Wait for the teacher decision',body:'The current DOCX is with the responsible teacher. Do not mark the contribution complete yet.'};
  if(data.stage==='student_revision')return {title:'Waiting for the student revision',body:'The teacher requested changes. The next student DOCX automatically returns to the same teacher for a new decision.'};
  if(data.stage==='admin_review'&&data.mentor_required)return {title:'Your turn: final LitLab review',body:'The teacher gate has passed. Review the DOCX together with the teacher notes, then make the final LitLab decision.'};
  if(data.stage==='admin_review')return {title:'Your turn: direct LitLab review',body:'This contribution does not require a teacher gate. Review the latest DOCX and make the final LitLab decision.'};
  if(data.stage==='complete')return {title:'Contribution complete',body:'The required review path is finished and the contribution is recorded as complete.'};
  return {title:'Waiting for the student submission',body:'The application may be accepted, but there is no DOCX ready for academic review yet.'};
}

function relationshipMarkup(data:Pipeline,compact=false){
  const assigned=data.assignment;const match=data.matching_teacher;const testimony=data.teacher_testimony;const action=adminAction(data);const avg=average(testimony);
  let teacher='';
  if(assigned?.teacher_name){teacher=`<div class="ll-review-owner-person"><span class="ll-review-owner-avatar">${esc(initial(assigned.teacher_name))}</span><div><small>RESPONSIBLE TEACHER</small><b>${esc(assigned.teacher_name)}</b>${assigned.teacher_email?`<span>${esc(assigned.teacher_email)}</span>`:''}${assigned.assigned_at?`<em>Assigned ${esc(fmt(assigned.assigned_at))}</em>`:''}</div></div>`}
  else if(data.mentor_required&&match?.full_name){teacher=`<div class="ll-review-owner-person is-match"><span class="ll-review-owner-avatar">${esc(initial(match.full_name))}</span><div><small>TEACHER MATCH FOUND · NOT ASSIGNED YET</small><b>${esc(match.full_name)}</b>${match.email?`<span>${esc(match.email)}</span>`:''}<em>Open the review center to assign this teacher.</em></div></div>`}
  else if(data.mentor_required){teacher=`<div class="ll-review-owner-person is-missing"><span class="ll-review-owner-avatar">!</span><div><small>TEACHER REQUIRED</small><b>No teacher is linked yet</b><span>${data.mentor_email?`Expected teacher email: ${esc(data.mentor_email)}`:'The student selected teacher supervision, but no matching teacher account is available yet.'}</span></div></div>`}
  else teacher='<div class="ll-review-owner-person is-direct"><span class="ll-review-owner-avatar">L</span><div><small>REVIEW OWNER</small><b>LitLab admin · direct review</b><span>This student does not require a teacher reviewer.</span></div></div>';
  const review=testimony?`<div class="ll-review-owner-decision"><small>LATEST TEACHER DECISION</small><b class="${testimony.recommendation==='approve'?'approved':'changes'}">${testimony.recommendation==='approve'?'Approved academically':'Changes requested'}${avg?` · ${esc(avg)}/5`:''}</b>${testimony.summary?`<p>${esc(testimony.summary)}</p>`:''}${testimony.created_at?`<span>${esc(testimony.reviewer_name||assigned?.teacher_name||'Teacher reviewer')} · ${esc(fmt(testimony.created_at))}</span>`:''}</div>`:'';
  return `<div class="ll-review-owner-head"><div><span>REVIEW OWNERSHIP</span><b>${esc(action.title)}</b></div><strong class="is-${stageTone(data.stage)}">${esc(stageLabel(data.stage))}</strong></div><div class="ll-review-owner-main">${teacher}${review}</div>${compact?'':`<div class="ll-review-owner-admin-action"><b>Admin next step</b><span>${esc(action.body)}</span></div>`}`;
}

function applyAdminCard(card:HTMLElement,data:Pipeline){
  if(data.applicant_type!=='student')return;
  card.classList.add('ll-admin-student-linked-view');
  const manage=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');if(manage&&manage.textContent!=='Open review center')manage.textContent='Open review center';
  let panel=card.querySelector<HTMLElement>('[data-admin-student-review-owner]');
  if(!panel){panel=document.createElement('section');panel.dataset.adminStudentReviewOwner='true';panel.className='ll-admin-student-review-owner';const status=card.querySelector('.admin-contrib-status-row');const chat=card.querySelector('.admin-contrib-chat-strip');if(status)status.after(panel);else if(chat)chat.before(panel);else card.querySelector('.admin-contrib-body')?.prepend(panel)}
  const renderKey=[data.stage,data.assignment?.teacher_application_id||'',data.assignment?.teacher_name||'',data.matching_teacher?.id||'',data.teacher_testimony?.recommendation||'',data.teacher_testimony?.created_at||'',data.teacher_testimony?.summary||''].join('|');
  if(panel.dataset.renderKey===renderKey)return;panel.dataset.renderKey=renderKey;
  panel.innerHTML=`${relationshipMarkup(data,true)}<div class="ll-review-owner-card-foot"><span>${esc(adminAction(data).body)}</span><button type="button" data-open-review-center-proxy>Open review center</button></div>`;
}

async function refreshAdminCards(force=false){
  if(route()!=='admin-contributors'||!token())return;
  const version=++adminScanVersion;
  const cards=Array.from(document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]'));
  await Promise.all(cards.map(async card=>{
    const role=card.querySelector<HTMLElement>('.admin-contrib-summary-meta > span')?.textContent?.trim().toLowerCase()||'';if(role.includes('teacher'))return;
    const id=card.dataset.appId||'';if(!id)return;
    try{const data=await pipeline(`admin-center:${id}`,'admin_get_litlab_contributor_pipeline',id,force);if(version===adminScanVersion&&data&&card.isConnected)applyAdminCard(card,data)}catch(error){console.debug('Admin teacher relationship unavailable',error)}
  }));
}

function reviewScores(review:Testimony){return `<div class="ll-admin-center-scores"><i><b>${Number(review.accuracy)||0}/5</b>Accuracy</i><i><b>${Number(review.clarity)||0}/5</b>Clarity</i><i><b>${Number(review.dp_relevance)||0}/5</b>DP relevance</i><i><b>${Number(review.originality)||0}/5</b>Originality</i><i><b>${Number(review.sources)||0}/5</b>Sources</i></div>`}
function pathMarkup(data:Pipeline){
  const teacherDone=['admin_review','complete'].includes(data.stage);const teacherActive=data.stage==='mentor_review';const studentActive=['student_work','mentor_link','student_revision'].includes(data.stage);const adminActive=data.stage==='admin_review';
  return `<div class="ll-admin-review-path"><div class="${studentActive?'active':'done'}"><i>${studentActive?'1':'✓'}</i><span><b>Student</b><small>${data.stage==='student_revision'?'Revise + resubmit':'Submit DOCX'}</small></span></div><strong>→</strong>${data.mentor_required?`<div class="${teacherActive?'active':teacherDone?'done':'waiting'}"><i>${teacherDone?'✓':'2'}</i><span><b>Teacher</b><small>${teacherActive?'Review now':teacherDone?'Approved / decided':'Teacher gate'}</small></span></div><strong>→</strong>`:''}<div class="${adminActive?'active':data.stage==='complete'?'done':'waiting'}"><i>${data.stage==='complete'?'✓':data.mentor_required?'3':'2'}</i><span><b>LitLab admin</b><small>${adminActive?'Final review now':data.stage==='complete'?'Complete':'Wait for handoff'}</small></span></div></div>`;
}

function decorateAdminModal(data:Pipeline){
  if(data.applicant_type!=='student')return;
  const modal=document.getElementById('ll-admin-contributor-workspace');const body=modal?.querySelector<HTMLElement>('[data-admin-workspace-body]');const grid=body?.querySelector<HTMLElement>('.ll-admin-workspace-grid');if(!body||!grid)return;
  body.querySelector('[data-admin-review-decision-center]')?.remove();
  const cards=Array.from(grid.querySelectorAll<HTMLElement>('.ll-admin-workspace-card'));
  const teacherCard=cards.find(card=>card.querySelector('.ll-admin-workspace-title span')?.textContent?.trim()==='TEACHER REVIEWER');
  const reviewsCard=cards.find(card=>card.querySelector('.ll-admin-workspace-title span')?.textContent?.trim()==='TEACHER REVIEWS');
  const assignmentForm=teacherCard?.querySelector<HTMLFormElement>('form[data-admin-assign-teacher]')||null;
  const reviewList=reviewsCard?.querySelector<HTMLElement>('.ll-admin-review-list')||null;
  const testimony=data.teacher_testimony;const action=adminAction(data);const center=document.createElement('section');center.dataset.adminReviewDecisionCenter='true';center.className='ll-admin-review-decision-center';
  center.innerHTML=`<header><div><span>STUDENT REVIEW DECISION CENTER</span><h3>Teacher responsibility and final handoff</h3><p>Application acceptance and document completion are separate. The teacher gives the academic recommendation; LitLab admin still makes the final contribution decision.</p></div><strong class="is-${stageTone(data.stage)}">${esc(stageLabel(data.stage))}</strong></header>${pathMarkup(data)}<div class="ll-admin-review-center-grid"><section class="ll-admin-center-owner">${relationshipMarkup(data,false)}<div data-center-assignment-form></div></section><section class="ll-admin-center-decision"><div class="ll-admin-center-title"><span>TEACHER EVIDENCE</span><b>${testimony?'Latest academic review':'No teacher decision yet'}</b></div>${testimony?`<div class="ll-admin-center-decision-head"><strong class="${testimony.recommendation==='approve'?'approved':'changes'}">${testimony.recommendation==='approve'?'Approved academically':'Changes requested'}</strong><span>${esc(testimony.reviewer_name||data.assignment?.teacher_name||'Teacher reviewer')}${testimony.created_at?` · ${esc(fmt(testimony.created_at))}`:''}</span></div>${reviewScores(testimony)}${testimony.summary?`<blockquote>${esc(testimony.summary)}</blockquote>`:''}`:`<p class="ll-admin-center-empty">${data.mentor_required?'The teacher’s scores and notes will appear here after they submit a decision on the latest DOCX.':'No teacher review is required for this student.'}</p>`}<div class="ll-admin-final-action is-${stageTone(data.stage)}"><span>ADMIN NEXT ACTION</span><b>${esc(action.title)}</b><p>${esc(action.body)}</p></div><div data-center-review-history></div></section></div>`;
  grid.before(center);
  const assignmentSlot=center.querySelector<HTMLElement>('[data-center-assignment-form]');if(assignmentForm&&assignmentSlot){const title=document.createElement('div');title.className='ll-admin-assignment-control-title';title.innerHTML=`<b>${data.assignment?'Change responsible teacher':'Assign responsible teacher'}</b><span>${data.mentor_required?'Only an accepted teacher matched to this supervised student should be assigned.':'Teacher review is optional for this student.'}</span>`;assignmentSlot.append(title,assignmentForm);teacherCard?.classList.add('ll-admin-card-consolidated')}
  const historySlot=center.querySelector<HTMLElement>('[data-center-review-history]');if(reviewList&&historySlot){const details=document.createElement('details');details.className='ll-admin-center-history';details.innerHTML='<summary>View full teacher review history</summary>';details.appendChild(reviewList);historySlot.appendChild(details);reviewsCard?.classList.add('ll-admin-card-consolidated')}else if(reviewsCard)reviewsCard.classList.add('ll-admin-card-consolidated');
}

async function refreshAdminModal(applicationId:string,force=true){
  if(!applicationId||route()!=='admin-contributors'||!token())return;
  try{const data=await pipeline(`admin-center:${applicationId}`,'admin_get_litlab_contributor_pipeline',applicationId,force);if(data)decorateAdminModal(data)}catch(error){console.debug('Admin review center unavailable',error)}
}

function scheduleScan(force=false){window.clearTimeout(scanTimer);scanTimer=window.setTimeout(()=>{if(route()==='contribute')void refreshTeacherDashboard(force);else if(route()==='admin-contributors')void refreshAdminCards(force)},100)}

window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};teacherIds=(detail.assignments||[]).map(row=>row.application_id).filter(Boolean);scheduleScan(true)});
window.addEventListener('litlab:contributor-workspace-updated',()=>scheduleScan(true));
window.addEventListener('litlab:contributor-admin-updated',()=>{cache.clear();scheduleScan(true)});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{const id=String((event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'');if(id)void refreshAdminModal(id,true)});
window.addEventListener('hashchange',()=>{cache.clear();teacherPipelines.clear();teacherIds=[];scheduleScan(true)});
window.addEventListener('focus',()=>scheduleScan(true));

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const proxy=target.closest('[data-open-review-center-proxy]');if(proxy){event.preventDefault();event.stopPropagation();const card=proxy.closest<HTMLElement>('.admin-contrib-card');card?.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]')?.click()}},true);

const observer=new MutationObserver(()=>scheduleScan(false));
function start(){observer.observe(document.body,{childList:true,subtree:true});scheduleScan(true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
