import './contributor-review-lifecycle';
import './contributor-teacher-workspace-polish.css';

type WorkspaceRow={id:string;status?:string;applicant_type?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:Array<{application_id?:string}>};
type MentorStats={assigned:number;pending:number;submitted:number;waitingForDoc:number};

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
  return `<div class="ll-card-title"><div><span>TEACHER REVIEWER ROLE</span><h3>${hasAssignments?'Help assigned students move forward':'Ready for an assignment'}</h3></div><em>Private academic review</em></div><div class="ll-teacher-role-steps"><div><i>1</i><p><b>Open only the assigned student DOCX</b><span>Your access is limited to contributions LitLab assigns to this teacher account.</span></p></div><div><i>2</i><p><b>Review with the LitLab rubric</b><span>Score accuracy, clarity, DP relevance, originality and source quality.</span></p></div><div><i>3</i><p><b>Give feedback the student can use</b><span>Name the exact strength, issue and revision needed instead of giving vague comments.</span></p></div><div><i>4</i><p><b>Send the student to the correct next step</b><span>Approve academically to hand off to LitLab admin, or request changes so the student can revise.</span></p></div></div>${hasAssignments?'':'<p class="ll-teacher-waiting">No student document needs your review right now. You do not need an evidence ledger or contributor upload area. LitLab will place assigned student work here when action is needed.</p>'}`;
}

function completionMarkup(){
  return `<div class="ll-teacher-complete-icon">✓</div><div><span>MENTORING COMPLETE</span><h2>Thank you for mentoring and helping make LitLab better.</h2><p>The student contribution connected to this reviewer record is complete. Your academic review, notes and testimony remain saved with the student’s contribution and may be referenced in the student’s LitLab certificate record.</p><small>This teacher dashboard is now closed and read-only. You cannot change, resubmit or replace the completed review. Teachers do not need a separate contributor certificate.</small></div>`;
}

function assignmentCards(host:HTMLElement){return Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-zone .ll-teacher-assignment'))}
function isPendingReview(card:HTMLElement){
  const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
  if(!form)return false;
  const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  return Boolean(submit&&!submit.disabled&&!form.hasAttribute('hidden'));
}
function mentorStats(host:HTMLElement):MentorStats{
  const cards=assignmentCards(host);
  return {
    assigned:cards.length,
    pending:cards.filter(isPendingReview).length,
    submitted:cards.reduce((total,card)=>total+card.querySelectorAll('.ll-review-history p').length,0),
    waitingForDoc:cards.filter(card=>!card.querySelector('.ll-assigned-docs [data-download-doc]')).length
  };
}
function plural(value:number,one:string,many=`${one}s`){return value===1?one:many}
function nextAction(stats:MentorStats){
  if(stats.pending>0)return {title:`${stats.pending} ${plural(stats.pending,'student review')} ${stats.pending===1?'needs':'need'} you`,body:'Open the latest assigned DOCX, review the student against the rubric, then submit specific academic feedback and a clear decision.',kind:'review'};
  if(stats.waitingForDoc>0)return {title:`Waiting for ${stats.waitingForDoc} ${plural(stats.waitingForDoc,'student')} to submit work`,body:'There is nothing to review until the student uploads a DOCX or revised version. Their assignment will update here automatically.',kind:'waiting'};
  if(stats.assigned>0)return {title:'You are caught up on your assigned students',body:'Your submitted reviews stay attached to each student. Wait for a revision, a new document or another LitLab assignment.',kind:'caught-up'};
  return {title:'No students are assigned right now',body:'Your teacher account is ready. When LitLab assigns a student contribution, the student card, latest DOCX and review controls will appear below.',kind:'empty'};
}
function mentorDashboardMarkup(stats:MentorStats){
  const next=nextAction(stats);
  return `<section class="ll-teacher-mentor-dashboard" data-teacher-mentor-dashboard><div class="ll-teacher-mentor-head"><div><span>MENTOR DASHBOARD</span><h2>Support your assigned students</h2><p>This replaces student evidence tracking. Teachers only need the student work, review status and the next academic action.</p></div><em>${stats.pending>0?'Action needed':'Mentor view'}</em></div><div class="ll-teacher-mentor-stats"><div><strong>${stats.assigned}</strong><span>Assigned ${plural(stats.assigned,'student')}</span></div><div class="${stats.pending>0?'is-action':''}"><strong>${stats.pending}</strong><span>${plural(stats.pending,'review')} needing you</span></div><div><strong>${stats.submitted}</strong><span>${plural(stats.submitted,'review')} submitted</span></div></div><div class="ll-teacher-mentor-grid"><article class="ll-teacher-next-action is-${next.kind}"><span>NEXT ACTION</span><h3>${next.title}</h3><p>${next.body}</p>${stats.pending>0?'<button type="button" data-jump-next-teacher-review>Go to next student review ↓</button>':''}</article><article class="ll-teacher-student-help"><span>FEEDBACK THAT HELPS THE STUDENT</span><h3>Make every comment actionable</h3><ul><li><b>Start with one specific strength</b><span>Point to what is already working so the student knows what to keep.</span></li><li><b>Name the exact issue</b><span>Identify the claim, paragraph, source or analytical move that needs revision.</span></li><li><b>Explain why it matters</b><span>Connect the change to accuracy, clarity, DP relevance, originality or source quality.</span></li><li><b>State what “ready” looks like</b><span>Give the student a concrete target for the next version before approving academically.</span></li></ul></article></div></section>`;
}

function jumpToNextReview(host:HTMLElement){
  const next=assignmentCards(host).find(isPendingReview)||assignmentCards(host)[0];
  if(!next)return;
  next.scrollIntoView({behavior:'smooth',block:'start'});
  window.setTimeout(()=>{
    const focusTarget=next.querySelector<HTMLElement>('[data-download-doc],form[data-teacher-review] select,form.ll-review-form select,form[data-teacher-review] textarea,form.ll-review-form textarea');
    focusTarget?.focus({preventScroll:true});
  },450);
}

function ensureMentorDashboard(host:HTMLElement){
  const stats=mentorStats(host);const fallbackAssigned=Math.max(stats.assigned,assignmentCount);const shownStats={...stats,assigned:fallbackAssigned};
  let dashboard=host.querySelector<HTMLElement>('[data-teacher-mentor-dashboard]');
  if(!dashboard){dashboard=document.createElement('section');dashboard.dataset.teacherMentorDashboard='true';dashboard.className='ll-teacher-mentor-dashboard';const grid=host.querySelector<HTMLElement>('.ll-workspace-grid');if(grid)grid.after(dashboard);else host.appendChild(dashboard)}
  const signature=`${shownStats.assigned}|${shownStats.pending}|${shownStats.submitted}|${shownStats.waitingForDoc}`;
  if(dashboard.dataset.signature===signature)return;
  dashboard.dataset.signature=signature;dashboard.outerHTML=mentorDashboardMarkup(shownStats);
  const current=host.querySelector<HTMLElement>('[data-teacher-mentor-dashboard]');current?.querySelector<HTMLButtonElement>('[data-jump-next-teacher-review]')?.addEventListener('click',()=>jumpToNextReview(host));
}
function clearMentorDashboard(host:HTMLElement){host.querySelector('[data-teacher-mentor-dashboard]')?.remove()}

function stripTeacherEvidenceSurfaces(host:HTMLElement){
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{
    const evidenceControl=card.querySelector('.ll-activity-form,[data-activity-form],[data-activity-list],[data-evidence-form],[data-evidence-list]');
    const heading=card.querySelector<HTMLElement>('.ll-card-title h3')?.textContent?.trim().toLowerCase()||'';
    if(evidenceControl||heading.includes('cas evidence')||heading.includes('evidence ledger')||heading==='activity log')card.remove();
  });
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

  if(!teacher){clearCompletion(host);clearMentorDashboard(host);host.querySelector('[data-teacher-reviewer-role-card]')?.remove();return}

  stripTeacherEvidenceSurfaces(host);
  const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  if(completed){
    if(head){setText(head.querySelector('h2'),'Your saved mentoring record.');setText(head.querySelector('p'),'This mentoring assignment is complete. Your review is preserved with the student contribution and no further teacher action is allowed.')}
    host.querySelector('[data-teacher-reviewer-role-card]')?.remove();clearMentorDashboard(host);ensureCompletion(host);
    host.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLButtonElement>('input,select,textarea,button').forEach(control=>{if(control.closest('[data-teacher-completion-thanks]'))return;control.disabled=true});
    return;
  }

  clearCompletion(host);
  if(head){setText(head.querySelector('h2'),'Your teacher reviewer workspace.');setText(head.querySelector('p'),'Use this space to support assigned students: open their latest DOCX, give focused academic feedback, and send each student to the correct next step. You do not need a CAS or evidence ledger.')}

  const timeline=host.querySelectorAll<HTMLElement>('.ll-workspace-timeline span');
  setText(timeline[2],'Approved');setText(timeline[3],'Review work');setText(timeline[4],'Completed');

  const status=statusName(host);const copy=host.querySelector<HTMLElement>('.ll-workspace-status p');
  if(status.includes('pending'))setText(copy,'LitLab is reviewing your teacher reviewer / mentor application. You will be notified if more information is needed.');
  else if(status.includes('needs'))setText(copy,'LitLab needs more information about your teacher reviewer application. Check revision requests or live chat for the specific question.');
  else if(status.includes('accepted'))setText(copy,'You are approved as a LitLab teacher reviewer / mentor. Assigned student DOCX reviews appear below automatically; you do not submit student-contributor work or evidence yourself.');
  else if(status.includes('not accepted'))setText(copy,'This teacher reviewer application was not accepted. Any saved LitLab feedback remains available in your account.');

  const stats=mentorStats(host);const grid=host.querySelector<HTMLElement>('.ll-workspace-grid');
  if(grid){
    const hasAssignments=Math.max(stats.assigned,assignmentCount)>0;
    let card=host.querySelector<HTMLElement>('[data-teacher-reviewer-role-card]');
    if(!card){card=document.createElement('article');card.className='ll-workspace-card ll-teacher-role-card';card.dataset.teacherReviewerRoleCard='true';grid.prepend(card)}
    const expected=hasAssignments?'Help assigned students move forward':'Ready for an assignment';
    if(card.querySelector('h3')?.textContent!==expected)card.innerHTML=roleCardMarkup(hasAssignments);
  }
  ensureMentorDashboard(host);
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
