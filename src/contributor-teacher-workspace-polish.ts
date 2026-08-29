import './contributor-review-lifecycle';
import './contributor-teacher-workspace-polish.css';

type WorkspaceRow={id:string;status?:string;applicant_type?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:Array<{application_id?:string}>};

let timer=0;
let attempts=0;
let observer:MutationObserver|null=null;
let applyTimer=0;
let selectedId='';
let selectedWorkspace:WorkspaceRow|null=null;
let assignmentCount=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function isTeacherFallback(host:HTMLElement){
  const starter=Array.from(host.querySelectorAll<HTMLElement>('.ll-workspace-card .ll-card-title em')).find(el=>el.textContent?.trim().toLowerCase()==='teacher review');
  return Boolean(starter||host.querySelector('.ll-teacher-zone'));
}
function isTeacher(host:HTMLElement){return selectedWorkspace?.applicant_type==='teacher'||(!selectedWorkspace&&isTeacherFallback(host))}
function statusName(host:HTMLElement){return host.querySelector<HTMLElement>('.ll-workspace-status > div > span')?.textContent?.trim().toLowerCase()||''}
function isCompletedTeacher(host:HTMLElement){return isTeacher(host)&&(selectedWorkspace?.status==='completed'||statusName(host).includes('completed'))}
function setText(el:HTMLElement|undefined|null,value:string){if(el&&el.textContent!==value)el.textContent=value}

function roleCardMarkup(hasAssignments:boolean){
  return `<div class="ll-card-title"><div><span>TEACHER REVIEWER ROLE</span><h3>${hasAssignments?'Review assigned student work':'Ready for an assignment'}</h3></div><em>Private academic review</em></div><div class="ll-teacher-role-steps"><div><i>1</i><p><b>Open only the assigned student DOCX</b><span>Your access is limited to contributions LitLab assigns to this teacher account.</span></p></div><div><i>2</i><p><b>Review with the LitLab rubric</b><span>Score accuracy, clarity, DP relevance, originality and source quality.</span></p></div><div><i>3</i><p><b>Write useful academic notes</b><span>Choose Approve academically or Request changes and explain the decision clearly.</span></p></div><div><i>4</i><p><b>LitLab admin makes the final decision</b><span>Your approval hands the document to LitLab admin; a revision request sends it back to the student.</span></p></div></div>${hasAssignments?'':'<p class="ll-teacher-waiting">No student document needs your review right now. You do not need to upload or submit anything yourself. LitLab will notify you when a student DOCX is assigned.</p>'}`;
}

function completionMarkup(){
  return `<div class="ll-teacher-complete-icon">✓</div><div><span>MENTORING COMPLETE</span><h2>Thank you for mentoring and helping make LitLab better.</h2><p>The student contribution connected to this reviewer record is complete. Your academic review, notes and testimony remain saved with the student’s contribution and may be referenced in the student’s LitLab certificate record.</p><small>This teacher dashboard is now closed and read-only. You cannot change, resubmit or replace the completed review. Teachers do not need a separate contributor certificate.</small></div>`;
}

function ensureCompletion(host:HTMLElement){
  let card=host.querySelector<HTMLElement>('[data-teacher-completion-thanks]');
  if(!card){card=document.createElement('section');card.dataset.teacherCompletionThanks='true';card.className='ll-teacher-completion-thanks';const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');if(head)head.after(card);else host.prepend(card)}
  if(!card.dataset.rendered){card.dataset.rendered='true';card.innerHTML=completionMarkup()}
}
function clearCompletion(host:HTMLElement){host.querySelector('[data-teacher-completion-thanks]')?.remove()}

function apply(){
  const host=root();if(!host)return;
  const teacher=isTeacher(host);const completed=isCompletedTeacher(host);
  host.classList.toggle('ll-teacher-reviewer-mode',teacher);
  host.classList.toggle('ll-teacher-reviewer-completed',completed);

  if(!teacher){clearCompletion(host);host.querySelector('[data-teacher-reviewer-role-card]')?.remove();return}

  const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  if(completed){
    if(head){setText(head.querySelector('h2'),'Your saved mentoring record.');setText(head.querySelector('p'),'This mentoring assignment is complete. Your review is preserved with the student contribution and no further teacher action is allowed.')}
    host.querySelector('[data-teacher-reviewer-role-card]')?.remove();
    ensureCompletion(host);
    host.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLButtonElement>('input,select,textarea,button').forEach(control=>{if(control.closest('[data-teacher-completion-thanks]'))return;control.disabled=true});
    return;
  }

  clearCompletion(host);
  if(head){setText(head.querySelector('h2'),'Your teacher reviewer workspace.');setText(head.querySelector('p'),'Your job is academic review only: open assigned student DOCX files, score the rubric, write constructive notes, then approve academically or request changes. LitLab admin handles the final outcome.')}

  const timeline=host.querySelectorAll<HTMLElement>('.ll-workspace-timeline span');
  setText(timeline[2],'Approved');setText(timeline[3],'Review work');setText(timeline[4],'Completed');

  const status=statusName(host);const copy=host.querySelector<HTMLElement>('.ll-workspace-status p');
  if(status.includes('pending'))setText(copy,'LitLab is reviewing your teacher reviewer / mentor application. You will be notified if more information is needed.');
  else if(status.includes('needs'))setText(copy,'LitLab needs more information about your teacher reviewer application. Check revision requests or live chat for the specific question.');
  else if(status.includes('accepted'))setText(copy,'You are approved as a LitLab teacher reviewer / mentor. Assigned student DOCX reviews appear below automatically; you do not submit student-contributor work yourself.');
  else if(status.includes('not accepted'))setText(copy,'This teacher reviewer application was not accepted. Any saved LitLab feedback remains available in your account.');

  const grid=host.querySelector<HTMLElement>('.ll-workspace-grid');
  if(grid){
    const hasAssignments=assignmentCount>0||Boolean(host.querySelector('.ll-teacher-zone .ll-teacher-assignment'));
    let card=host.querySelector<HTMLElement>('[data-teacher-reviewer-role-card]');
    if(!card){card=document.createElement('article');card.className='ll-workspace-card ll-teacher-role-card';card.dataset.teacherReviewerRoleCard='true';grid.prepend(card)}
    const expected=hasAssignments?'Review assigned student work':'Ready for an assignment';
    if(card.querySelector('h3')?.textContent!==expected)card.innerHTML=roleCardMarkup(hasAssignments);
  }
}

function scheduleApply(){clearTimeout(applyTimer);applyTimer=window.setTimeout(apply,50)}
function attachObserver(host:HTMLElement){observer?.disconnect();observer=new MutationObserver(()=>scheduleApply());observer.observe(host,{childList:true,subtree:true})}
function scan(){
  clearTimeout(timer);
  if(route()!=='contribute'){observer?.disconnect();observer=null;return}
  const host=root();
  if(host){const ready=Boolean(host.querySelector('.ll-workspace-status,.ll-workspace-empty,.ll-teacher-zone,[data-lifecycle-complete-card]'));if(ready){attempts=0;attachObserver(host);apply();return}}
  if(attempts++<30)timer=window.setTimeout(scan,120);
}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};const rows=Array.isArray(detail.workspaces)?detail.workspaces:[];
  selectedId=detail.selectedId||selectedId;selectedWorkspace=rows.find(row=>row.id===selectedId)||rows[0]||selectedWorkspace;assignmentCount=Array.isArray(detail.assignments)?detail.assignments.length:assignmentCount;scheduleApply();
});
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('[data-workspace-select]'))setTimeout(apply,0)},true);
window.addEventListener('hashchange',()=>{selectedId='';selectedWorkspace=null;assignmentCount=0;attempts=0;observer?.disconnect();observer=null;setTimeout(scan,100)});
window.addEventListener('litlab:contributor-workspace-updated',()=>setTimeout(apply,120));
window.addEventListener('focus',()=>{if(route()==='contribute')setTimeout(apply,120)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
