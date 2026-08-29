import './contributor-review-lifecycle.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const POLL_MS=15_000;
const REQUEST_TIMEOUT_MS=12_000;
const NOTICE_PREFIX='litlabReviewLifecycleSeen:';

type StoredSession={access_token?:string};
type Pipeline={application_id:string;applicant_type?:string;stage:string;mentor_required?:boolean;mentor_email?:string|null;assignment?:{teacher_name?:string|null;teacher_email?:string|null}|null;latest_document?:{id?:string;original_name?:string;version_label?:string;mentor_review_status?:string}|null};
type WorkspaceRow={id:string;status?:string;applicant_type?:string;topics?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};
type ReviewNotice={id:string;application_id:string;event_type:string;actor_role:string;detail?:Record<string,unknown>;created_at:string;role_context?:string;applicant_type?:string;full_name?:string;topics?:string};

let selectedId='';
let selectedWorkspace:WorkspaceRow|null=null;
let currentPipeline:Pipeline|null=null;
let timer=0;
let scanTimer=0;
let noticeLoading=false;
let pipelineLoading=false;
let initializedNotices=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function userId(){try{const p=token().split('.')[1];if(!p)return '';const n=p.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(p.length/4)*4,'=');return String(JSON.parse(atob(n))?.sub||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function stageLabel(stage:string){return ({student_work:'Preparing submission',mentor_link:'Waiting for teacher link',mentor_review:'Waiting for teacher response',student_revision:'Revision requested',admin_review:'With LitLab admin',complete:'Completed'} as Record<string,string>)[stage]||'Review in progress'}
function tone(stage:string){if(stage==='mentor_review')return 'teacher';if(stage==='student_revision')return 'revision';if(stage==='admin_review'||stage==='complete')return 'success';if(stage==='mentor_link')return 'waiting';return 'neutral'}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}const text=await response.text();return (text?JSON.parse(text):null) as T}finally{clearTimeout(timeout)}}

function teacherName(data:Pipeline){return data.assignment?.teacher_name||'your teacher / mentor'}
function studentPathMarkup(data:Pipeline){
  const teacher=data.assignment?.teacher_name||'Teacher';
  if(data.mentor_required){
    return `<div class="ll-lifecycle-path-head"><div><span>YOUR REVIEW PATH</span><b>Teacher review comes before LitLab admin</b></div><strong class="is-${tone(data.stage)}">${esc(stageLabel(data.stage))}</strong></div><div class="ll-lifecycle-steps"><div class="${['student_work','student_revision','mentor_link'].includes(data.stage)?'active':'done'}"><i>${['student_work','student_revision','mentor_link'].includes(data.stage)?'1':'✓'}</i><span><b>You</b><small>${data.stage==='student_revision'?'Revise and upload a new DOCX':'Upload your DOCX'}</small></span></div><em>→</em><div class="${data.stage==='mentor_review'?'active':['admin_review','complete'].includes(data.stage)?'done':'waiting'}"><i>${['admin_review','complete'].includes(data.stage)?'✓':'2'}</i><span><b>${esc(teacher)}</b><small>${data.stage==='mentor_review'?'Reviewing now':data.stage==='student_revision'?'Requested changes':data.stage==='admin_review'||data.stage==='complete'?'Approved':'Teacher review'}</small></span></div><em>→</em><div class="${data.stage==='admin_review'?'active':data.stage==='complete'?'done':'waiting'}"><i>${data.stage==='complete'?'✓':'3'}</i><span><b>LitLab admin</b><small>${data.stage==='admin_review'?'Final review now':data.stage==='complete'?'Complete':'After teacher approval'}</small></span></div></div><p class="ll-lifecycle-explain">After you submit, <strong>${esc(teacher)}</strong> either sends the DOCX back to you for revision or approves it and hands it to LitLab admin. You will be notified at every handoff.</p>`;
  }
  return `<div class="ll-lifecycle-path-head"><div><span>YOUR REVIEW PATH</span><b>No teacher reviewer selected</b></div><strong class="is-${tone(data.stage)}">${esc(stageLabel(data.stage))}</strong></div><div class="ll-lifecycle-steps is-direct"><div class="${data.stage==='student_work'?'active':'done'}"><i>${data.stage==='student_work'?'1':'✓'}</i><span><b>You</b><small>Upload your DOCX</small></span></div><em>→</em><div class="${data.stage==='admin_review'?'active':data.stage==='complete'?'done':'waiting'}"><i>${data.stage==='complete'?'✓':'2'}</i><span><b>LitLab admin</b><small>${data.stage==='admin_review'?'Reviewing now':data.stage==='complete'?'Complete':'Direct review'}</small></span></div></div><p class="ll-lifecycle-explain">Because you did not choose a teacher reviewer, your submitted DOCX goes directly to LitLab admin.</p>`;
}

function ensureStudentPath(data:Pipeline){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root||selectedWorkspace?.applicant_type!=='student')return;
  let panel=root.querySelector<HTMLElement>('[data-review-lifecycle-path]');
  if(!panel){panel=document.createElement('section');panel.dataset.reviewLifecyclePath='true';panel.className='ll-review-lifecycle-path';const status=root.querySelector('.ll-workspace-status');const timeline=root.querySelector('.ll-workspace-timeline');(timeline||status||root.querySelector('.ll-workspace-head'))?.after(panel)}
  panel.dataset.stage=tone(data.stage);panel.innerHTML=studentPathMarkup(data);
}

function updateFinalControl(form:HTMLFormElement,data:Pipeline){
  const select=form.querySelector<HTMLSelectElement>('select[name="version"]');const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(!select||!submit)return;
  let helper=form.querySelector<HTMLElement>('[data-final-submission-helper]');
  if(!helper){helper=document.createElement('div');helper.dataset.finalSubmissionHelper='true';helper.className='ll-final-submission-helper';select.closest('label')?.after(helper);helper.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target?.closest('[data-mark-final]'))return;select.value='Final submission';select.dispatchEvent(new Event('change',{bubbles:true}));updateFinalControl(form,data)})}
  const final=select.value==='Final submission';
  helper.innerHTML=`<div><b>${final?'✓ Marked as FINAL submission':'Is this the version you want LitLab to judge as final?'}</b><span>${final?'Admin completion will use this DOCX after the required review path finishes.':'Choose Final submission only when this is the version you want carried through teacher/admin review for completion.'}</span></div>${final?'<button type="button" data-mark-final class="is-final">FINAL selected</button>':'<button type="button" data-mark-final>Mark as FINAL</button>'}`;
  if(!submit.disabled)submit.textContent=final?(data.mentor_required?'Submit FINAL DOCX to teacher':'Submit FINAL DOCX to LitLab'):(data.mentor_required?'Submit DOCX to teacher':'Submit DOCX to LitLab');
}

function decorateUpload(data:Pipeline){
  const form=document.querySelector<HTMLFormElement>(`.ll-docx-form[data-docx-upload="${CSS.escape(data.application_id)}"]`);if(!form)return;
  let routeBox=form.querySelector<HTMLElement>('[data-upload-route-box]');
  if(!routeBox){routeBox=document.createElement('div');routeBox.dataset.uploadRouteBox='true';routeBox.className='ll-upload-route-box';form.prepend(routeBox)}
  if(data.mentor_required){const name=teacherName(data);routeBox.innerHTML=`<b>Where will this DOCX go?</b><span><strong>First:</strong> ${esc(name)}. <strong>Then:</strong> either back to you for revisions, or to LitLab admin if the teacher approves it.</span>`}else routeBox.innerHTML='<b>Where will this DOCX go?</b><span>No teacher is selected, so this document goes directly to LitLab admin for review.</span>';
  updateFinalControl(form,data);
  const locked=['mentor_link','mentor_review','admin_review','complete'].includes(data.stage);
  form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLButtonElement>('input,select,textarea,button[type="submit"]').forEach(control=>{if(control.closest('[data-final-submission-helper]'))return;control.disabled=locked});
  form.classList.toggle('is-lifecycle-locked',locked);
  if(locked){let lock=form.querySelector<HTMLElement>('[data-lifecycle-lock]');if(!lock){lock=document.createElement('div');lock.dataset.lifecycleLock='true';lock.className='ll-lifecycle-lock';form.appendChild(lock)}const message=data.stage==='mentor_review'?`Your DOCX is with ${teacherName(data)}. Wait for the teacher response: it will either return to you for revision or move to LitLab admin.`:data.stage==='mentor_link'?'Your DOCX is saved. LitLab is waiting to link the teacher account before review can begin.':data.stage==='admin_review'?'The reviewed DOCX is with LitLab admin. No new upload is needed unless LitLab asks for a revision.':'This contribution is complete. The record is archived.';lock.textContent=message}else form.querySelector('[data-lifecycle-lock]')?.remove();
}

function completionCard(kind:'student'|'teacher'){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  let card=root.querySelector<HTMLElement>('[data-lifecycle-complete-card]');if(!card){card=document.createElement('section');card.dataset.lifecycleCompleteCard='true';card.className='ll-lifecycle-complete-card';root.querySelector('.ll-workspace-head')?.after(card)}
  if(kind==='teacher')card.innerHTML='<span>MENTORING COMPLETE</span><h2>Thank you for helping make LitLab better.</h2><p>Your student’s contribution is complete. Your academic testimony and review remain attached to the student’s record and can support their contributor certificate. Teachers do not need a separate LitLab certificate.</p><small>Your previous review evidence is saved. If you want to mentor another contribution later, start a new teacher reviewer application.</small>';
  else card.innerHTML='<span>CONTRIBUTION COMPLETE</span><h2>Thank you — your work is now archived.</h2><p>Your DOCX versions, evidence, teacher feedback, activity record and review history remain saved to your account. LitLab will update the site soon.</p><small>The active workspace is closed. Use “Make a new contribution” above whenever you want to start another contribution.</small>';
}

function applyCompletedState(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const complete=selectedWorkspace?.status==='completed';root.classList.toggle('ll-lifecycle-completed',complete);
  if(!complete){root.querySelector('[data-lifecycle-complete-card]')?.remove();return}
  completionCard(selectedWorkspace?.applicant_type==='teacher'?'teacher':'student');
}

function applyTeacherPolish(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root||selectedWorkspace?.applicant_type!=='teacher')return;
  root.classList.add('ll-teacher-dashboard-clean');
  const head=root.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  if(head){const h=head.querySelector('h2');const p=head.querySelector('p');if(h)h.textContent='Teacher review dashboard';if(p)p.textContent='Only assigned student reviews that need your academic input appear here. Open the current DOCX, score it, write notes, then approve it or request changes.'}
}

async function refreshPipeline(force=false){
  if(route()!=='contribute'||!selectedId||!token()||selectedWorkspace?.applicant_type!=='student'||pipelineLoading)return;
  if(!force&&currentPipeline?.application_id===selectedId){ensureStudentPath(currentPipeline);decorateUpload(currentPipeline);applyCompletedState();return}
  pipelineLoading=true;try{currentPipeline=await rpc<Pipeline>('get_my_litlab_contributor_pipeline',{p_application_id:selectedId});ensureStudentPath(currentPipeline);decorateUpload(currentPipeline);applyCompletedState()}catch(error){console.debug('Review lifecycle unavailable',error)}finally{pipelineLoading=false}
}

function noticeKey(){return `${NOTICE_PREFIX}${userId()||'user'}`}
function readSeen(){try{const value=JSON.parse(localStorage.getItem(noticeKey())||'[]');return new Set(Array.isArray(value)?value.map(String):[])}catch{return new Set<string>()}}
function saveSeen(seen:Set<string>){try{localStorage.setItem(noticeKey(),JSON.stringify([...seen].slice(-120)))}catch{}}
function noticeCopy(n:ReviewNotice){
  const d=n.detail||{};const teacher=String(d.teacher_name||'your teacher / mentor');const student=n.full_name||'the student';const context=n.role_context||'';
  if(n.event_type==='document_submitted_for_mentor_review')return context==='teacher'?{title:'New student DOCX needs review',body:`${student} submitted a Word document. Open your teacher dashboard to review the current version.`}:{title:'DOCX submitted to your teacher',body:`Your document is now with ${teacher}. Wait for the teacher response: it will either return to you for revision or move to LitLab admin.`};
  if(n.event_type==='document_submitted_for_admin_review')return context==='admin'?{title:'DOCX ready for LitLab review',body:`${student} submitted a Word document directly to admin.`}:{title:'DOCX submitted to LitLab',body:'No teacher review is required. Your document is now with LitLab admin.'};
  if(n.event_type==='mentor_linked'||n.event_type==='teacher_assigned_by_admin')return context==='teacher'?{title:'Student assigned to you',body:`You are now the responsible teacher reviewer for ${student}. You will be notified when a DOCX needs your review.`}:{title:'Teacher reviewer linked',body:`${teacher} is now linked to this contribution and will review your DOCX before LitLab admin.`};
  if(n.event_type==='mentor_requested_changes')return context==='admin'?{title:'Teacher requested student revisions',body:`The teacher sent ${student} back for changes. Wait for the revised DOCX.`}:context==='teacher'?{title:'Revision request sent',body:'Your notes and scores are now visible to the student. Wait for a revised DOCX.'}:{title:'Your teacher requested revisions',body:'Read the teacher’s notes and scores, revise the DOCX, then upload a new version. It will return to the same teacher.'};
  if(n.event_type==='mentor_approved_document')return context==='admin'?{title:'Teacher approval ready',body:`${student} has passed teacher review. The final LitLab review is now yours.`}:context==='teacher'?{title:'Teacher review submitted',body:'You approved this DOCX. It is now with LitLab admin for the final decision.'}:{title:'Teacher approved your DOCX',body:'Teacher review is complete. Your document is now with LitLab admin for final review.'};
  if(n.event_type==='admin_completed_contribution')return {title:'Contribution complete',body:'LitLab marked the contribution complete. Your evidence and review history are saved, and the site will update soon.'};
  if(n.event_type==='teacher_mentoring_completed')return {title:'Thank you for mentoring',body:String(d.message||'The student contribution is complete. Your testimony remains attached to the student record. Thank you for helping make LitLab better.')};
  return null;
}
function showNotice(n:ReviewNotice){const copy=noticeCopy(n);if(!copy)return;document.getElementById('ll-review-lifecycle-notice')?.remove();const el=document.createElement('aside');el.id='ll-review-lifecycle-notice';el.className='ll-review-lifecycle-notice';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.innerHTML=`<button type="button" data-life-notice-close aria-label="Dismiss">×</button><span>LITLAB • REVIEW UPDATE</span><div><i>●</i><section><b>${esc(copy.title)}</b><p>${esc(copy.body)}</p></section></div><button type="button" data-life-notice-open>${n.role_context==='admin'?'Open contributor dashboard':'Open review status'} →</button>`;const close=()=>{el.classList.add('is-closing');setTimeout(()=>el.remove(),220)};el.querySelector('[data-life-notice-close]')?.addEventListener('click',close);el.querySelector('[data-life-notice-open]')?.addEventListener('click',()=>{close();location.hash=n.role_context==='admin'?'admin-contributors':'contribute'});document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('is-visible'))}

async function refreshNotices(){
  if(!token()||noticeLoading)return;noticeLoading=true;
  try{const rows=await rpc<ReviewNotice[]>('get_my_litlab_contributor_review_notices');const notices=Array.isArray(rows)?rows:[];const seen=readSeen();if(!initializedNotices){notices.forEach(n=>seen.add(n.id));saveSeen(seen);initializedNotices=true;return}const unseen=notices.filter(n=>!seen.has(n.id)).sort((a,b)=>(Date.parse(a.created_at)||0)-(Date.parse(b.created_at)||0));if(!unseen.length)return;unseen.forEach(n=>seen.add(n.id));saveSeen(seen);const latest=unseen[unseen.length-1];if(latest)showNotice(latest)}catch(error){console.debug('Review notifications unavailable',error)}finally{noticeLoading=false}
}

function scan(force=false){
  if(route()!=='contribute')return;
  applyTeacherPolish();applyCompletedState();
  if(selectedWorkspace?.applicant_type==='student')void refreshPipeline(force);
}
function scheduleScan(force=false){clearTimeout(scanTimer);scanTimer=window.setTimeout(()=>scan(force),80)}
function schedulePoll(){clearTimeout(timer);timer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine){await refreshNotices();if(route()==='contribute')await refreshPipeline(true)}schedulePoll()},POLL_MS)}

window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};selectedId=detail.selectedId||'';const rows=detail.workspaces||[];selectedWorkspace=rows.find(row=>row.id===selectedId)||rows[0]||null;currentPipeline=null;scheduleScan(true)});
window.addEventListener('litlab:contributor-workspace-updated',()=>{setTimeout(()=>{void refreshNotices();scheduleScan(true)},300)});
window.addEventListener('litlab:contributor-admin-updated',()=>setTimeout(()=>void refreshNotices(),300));
window.addEventListener('hashchange',()=>{currentPipeline=null;scheduleScan(true);setTimeout(()=>void refreshNotices(),200)});
window.addEventListener('focus',()=>{void refreshNotices();scheduleScan(true);schedulePoll()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);return}void refreshNotices();scheduleScan(true);schedulePoll()});
window.addEventListener('online',()=>{void refreshNotices();scheduleScan(true)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){initializedNotices=false;currentPipeline=null;void refreshNotices();scheduleScan(true)}});
document.addEventListener('change',event=>{const target=event.target;if(target instanceof HTMLSelectElement&&target.name==='version'){const form=target.closest<HTMLFormElement>('.ll-docx-form');if(form&&currentPipeline)updateFinalControl(form,currentPipeline)}},true);

const observer=new MutationObserver(()=>scheduleScan(false));
function start(){observer.observe(document.body,{childList:true,subtree:true});void refreshNotices();scheduleScan(true);schedulePoll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
