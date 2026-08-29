import './contributor-journey-coherence.css';

type Role='student'|'teacher'|'';
type Row=Record<string,any>;
type Workspace=Row&{id:string;status?:string;applicant_type?:string;documents?:Row[];reviews?:Row[];revisions?:Row[];brief?:Row|null;v3?:Row|null};
type Assignment=Row&{application_id:string;status?:string;documents?:Row[];reviews?:Row[]};
type WorkspaceEvent={selectedId?:string;workspaces?:Workspace[];assignments?:Assignment[]};
type Milestone={label:string;detail:string;done:boolean};
type NextAction={tone:'waiting'|'action'|'revision'|'complete'|'progress'|'closed';title:string;copy:string;section?:string};

const HANDBOOK_VERSION=1;
let workspaces:Workspace[]=[];
let assignments:Assignment[]=[];
let selectedId='';
let scheduled=false;
let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function role():Role{const value=root()?.dataset.contributorAccountRole||'';return value==='student'||value==='teacher'?value:''}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function time(value:unknown){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}
function orientationDone(app:Workspace|null){return Number(app?.v3?.onboarding?.handbook_version||0)>=HANDBOOK_VERSION}
function openRevision(app:Workspace|null){return Boolean(app?.revisions?.some(item=>['open','responded'].includes(String(item?.status||'').toLowerCase())))}
function reviewRecorded(app:Workspace|null){return Boolean((app?.reviews?.length||0)||(app?.revisions?.length||0))}
function applicationApproved(app:Workspace|null){return ['accepted','reviewing','completed'].includes(String(app?.status||'').toLowerCase())}
function contributionComplete(app:Workspace|null){return String(app?.status||'').toLowerCase()==='completed'}
function contributionClosed(app:Workspace|null){return String(app?.status||'').toLowerCase()==='declined'}
function studentDocuments(app:Workspace|null){return Array.isArray(app?.documents)?app!.documents!:[]}
function activeStudentContribution(){return workspaces.find(row=>row.applicant_type==='student'&&!['completed','declined'].includes(String(row.status||'').toLowerCase()))||null}
function workspaceHasActiveStudentStatus(){
  if(role()!=='student')return false;
  if(activeStudentContribution())return true;
  const status=document.querySelector<HTMLElement>('[data-contributor-workspace] .ll-workspace-status');
  return Boolean(status&&['new','reviewing','accepted'].some(name=>status.classList.contains(name)));
}

function assignmentState(item:Assignment){
  const status=String(item.status||'').toLowerCase();
  if(status==='completed')return 'complete';
  const docs=Array.isArray(item.documents)?item.documents:[];
  const reviews=Array.isArray(item.reviews)?item.reviews:[];
  const latestDoc=docs.slice().sort((a,b)=>time(b.created_at)-time(a.created_at))[0];
  const latestReview=reviews.slice().sort((a,b)=>time(b.created_at)-time(a.created_at))[0];
  if(!latestDoc)return 'waiting-doc';
  if(!latestReview||time(latestDoc.created_at)>time(latestReview.created_at))return 'needs-review';
  if(String(latestReview.recommendation||'')==='request_changes')return 'waiting-revision';
  if(String(latestReview.recommendation||'')==='approve')return 'sent-admin';
  return 'reviewed';
}
function teacherReviews(){return assignments.reduce((sum,item)=>sum+(Array.isArray(item.reviews)?item.reviews.length:0),0)}
function teacherNeedsReview(){return assignments.some(item=>assignmentState(item)==='needs-review')}
function teacherQueueClear(){return assignments.length>0&&!teacherNeedsReview()}

function studentMilestones(app:Workspace|null):Milestone[]{
  const docs=studentDocuments(app);
  return [
    {label:'Application',detail:'Submitted',done:Boolean(app)},
    {label:'Approval',detail:'Accepted',done:applicationApproved(app)},
    {label:'Orientation',detail:'Completed',done:orientationDone(app)},
    {label:'Project',detail:'Brief ready',done:Boolean(app?.brief)&&applicationApproved(app)},
    {label:'Submission',detail:'DOCX sent',done:docs.length>0},
    {label:'Review',detail:'Feedback / handoff',done:reviewRecorded(app)||contributionComplete(app)},
    {label:'Completion',detail:'Finished',done:contributionComplete(app)}
  ];
}
function teacherMilestones(app:Workspace|null):Milestone[]{
  return [
    {label:'Application',detail:'Submitted',done:Boolean(app)},
    {label:'Approval',detail:'Reviewer accepted',done:applicationApproved(app)},
    {label:'Orientation',detail:'Completed',done:orientationDone(app)},
    {label:'Students',detail:'Assigned',done:assignments.length>0},
    {label:'Review',detail:'Review submitted',done:teacherReviews()>0},
    {label:'Queue',detail:'Current work clear',done:teacherQueueClear()}
  ];
}

function studentNext(app:Workspace|null):NextAction{
  if(!app)return {tone:'action',title:'Submit your Student application',copy:'Open the application, describe one focused contribution, and submit it for LitLab review.',section:'application'};
  if(contributionClosed(app))return {tone:'closed',title:'This application is closed',copy:'This application is no longer active. You can review the saved record or start a fresh application.',section:'application'};
  if(contributionComplete(app))return {tone:'complete',title:'Contribution complete',copy:'Your record is saved. You may now start a new Student contribution when you are ready.',section:'application'};
  if(!orientationDone(app))return {tone:'action',title:'Complete contributor orientation',copy:'Read the short quality, originality and privacy standard before active contribution work.',section:'orientation'};
  const status=String(app.status||'').toLowerCase();
  if(status==='new')return {tone:'waiting',title:'Application under review',copy:'Your application is with LitLab. Keep this contribution focused here; you cannot start another until this one is completed.',section:'status'};
  if(openRevision(app))return {tone:'revision',title:'A revision needs your attention',copy:'Read the current revision request, make the requested changes, and respond from the same contribution workspace.',section:'revisions'};
  if(app.brief&&!app.v3?.brief_agreement?.is_current)return {tone:'action',title:'Confirm the current project brief',copy:'Read the latest brief and accept the current version before continuing.',section:'project'};
  if(studentDocuments(app).length===0)return {tone:'action',title:'Prepare your first DOCX',copy:'Follow the project brief and submit the current Word document when it is ready.',section:'submission'};
  const lifecycle=(document.querySelector<HTMLElement>('[data-review-lifecycle-path]')?.textContent||'').toLowerCase();
  if(lifecycle.includes('teacher')&&!lifecycle.includes('approved'))return {tone:'waiting',title:'Wait for teacher review',copy:'Your current DOCX is with the assigned teacher. The next step will unlock when the teacher responds.',section:'status'};
  if(lifecycle.includes('litlab admin')||lifecycle.includes('final review'))return {tone:'waiting',title:'Final LitLab review',copy:'Teacher review is complete and LitLab owns the next decision. No new contribution can start yet.',section:'status'};
  return {tone:'progress',title:'Continue the current contribution',copy:'Use the guide above as your source of truth for tasks, revisions, feedback and the next unlocked step.',section:'tasks'};
}
function teacherNext(app:Workspace|null):NextAction{
  if(!app)return {tone:'action',title:'Submit your Teacher reviewer application',copy:'Apply once. After approval, the same Teacher account can mentor multiple assigned students.',section:'application'};
  if(contributionClosed(app))return {tone:'closed',title:'Teacher application closed',copy:'This reviewer application is closed. Your saved messages remain available.',section:'messages'};
  if(!orientationDone(app))return {tone:'action',title:'Complete Teacher orientation',copy:'Review the short academic, privacy and student-ownership standard before reviewing student work.',section:'orientation'};
  const status=String(app.status||'').toLowerCase();
  if(status==='new')return {tone:'waiting',title:'Teacher application under review',copy:'LitLab is reviewing your reviewer application. You do not need to apply again.',section:'status'};
  if(!assignments.length)return {tone:'waiting',title:'Ready for a student assignment',copy:'Your Teacher account is approved. LitLab will place assigned students in this workspace when review work is available.'};
  if(teacherNeedsReview())return {tone:'action',title:'A student DOCX needs review',copy:'Open the selected student, review the current DOCX, complete the rubric and send one clear decision.',section:'review-student'};
  const waitingRevision=assignments.some(item=>assignmentState(item)==='waiting-revision');
  if(waitingRevision)return {tone:'waiting',title:'Waiting for a student revision',copy:'You already sent feedback. Wait for the student to upload a revised DOCX before reviewing again.',section:'assigned-students'};
  const sentAdmin=assignments.some(item=>assignmentState(item)==='sent-admin');
  if(sentAdmin)return {tone:'waiting',title:'Your approved review is with LitLab',copy:'LitLab admin owns the next decision. You can review your saved history or switch to another assigned student.',section:'review-history'};
  return {tone:'progress',title:'Your current review queue is clear',copy:'Use Assigned students to check each student state. New review controls will appear only when a current DOCX needs you.',section:'assigned-students'};
}

function milestoneMarkup(items:Milestone[]){
  let foundCurrent=false;
  return items.map((item,index)=>{
    const current=!item.done&&!foundCurrent;
    if(current)foundCurrent=true;
    const cls=item.done?'is-done':current?'is-current':'';
    return `<div class="${cls}"><i>${item.done?'✓':String(index+1).padStart(2,'0')}</i><section><b>${esc(item.label)}</b><span>${esc(item.detail)}</span></section>${index<items.length-1?'<em></em>':''}</div>`;
  }).join('');
}
function renderJourney(host:HTMLElement){
  const accountRole=role();if(!accountRole)return;
  const app=current();
  const items=accountRole==='teacher'?teacherMilestones(app):studentMilestones(app);
  const next=accountRole==='teacher'?teacherNext(app):studentNext(app);
  const count=items.filter(item=>item.done).length;
  host.dataset.journeyRole=accountRole;
  host.dataset.journeyManaged='true';
  host.id='ll-v3-journey';
  const title=accountRole==='teacher'?'One clear Teacher review path.':'One clear path from application to completion.';
  const copy=accountRole==='teacher'
    ?'Student assignments, review actions and waiting states stay separate so you always know whether LitLab, the student or you own the next step.'
    :'Finish one contribution before opening another. The guide above and this journey always reflect the same active Student workflow.';
  host.innerHTML=`<div class="ll-v3-journey-head"><div><span>${accountRole==='teacher'?'TEACHER REVIEW JOURNEY':'CONTRIBUTOR JOURNEY'}</span><h2>${esc(title)}</h2><p>${esc(copy)}</p></div><strong>${count}/${items.length}<small>milestones</small></strong></div><div class="ll-v3-next is-${next.tone}"><div><span>NEXT ACTION</span><h3>${esc(next.title)}</h3><p>${esc(next.copy)}</p></div>${next.section?`<button type="button" data-contributor-journey-jump="${esc(next.section)}">Go there ↓</button>`:''}</div><div class="ll-v3-milestones">${milestoneMarkup(items)}</div><p class="ll-v3-milestone-note">${accountRole==='teacher'?'A Teacher account stays active across assigned students; do not submit a new reviewer application for each student.':'A new Student contribution unlocks only after the current active contribution is completed. Completed work remains saved in your account.'}</p>`;
}
function enhance(){
  scheduled=false;if(route()!=='contribute')return;
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace] [data-v3-journey]');
  if(!host)return;
  const signature=JSON.stringify({role:role(),selectedId,workspaces:workspaces.map(row=>({id:row.id,status:row.status,type:row.applicant_type,docs:row.documents?.length||0,reviews:row.reviews?.length||0,revisions:row.revisions?.map(item=>item.status),brief:Boolean(row.brief),onboarding:row.v3?.onboarding?.handbook_version,briefCurrent:row.v3?.brief_agreement?.is_current})),assignments:assignments.map(item=>({id:item.application_id,status:item.status,state:assignmentState(item),reviews:item.reviews?.length||0}))});
  if(host.dataset.journeySignature===signature&&host.dataset.journeyManaged==='true')return;
  renderJourney(host);host.dataset.journeySignature=signature;
}
function schedule(){if(scheduled)return;scheduled=true;clearTimeout(timer);timer=window.setTimeout(enhance,110)}

function clickGuideSection(key:string){
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');
  const button=guide?.querySelector<HTMLButtonElement>(`[data-section-key="${CSS.escape(key)}"]`);
  if(button){button.click();return true}
  return false;
}
function fallbackTarget(key:string){
  const selectors:Record<string,string>={
    application:'[data-contributor-application-launcher],#contribute-apply',status:'[data-review-lifecycle-path],.ll-workspace-status',orientation:'[data-v3-standard]',project:'.ll-workspace-brief,.ll-workspace-wait',tasks:'.ll-task-list',revisions:'.ll-revision-list',submission:'.ll-workspace-docs','teacher-feedback':'[data-student-teacher-feedback]','assigned-students':'[data-teacher-student-roster],[data-teacher-student-browser]','review-student':'form[data-teacher-review]:not([hidden]),form.ll-review-form:not([hidden])','review-history':'.ll-review-history',messages:'[data-contributor-chat-hub]',history:'[data-v3-history],[data-my-contributions]',completion:'[data-lifecycle-complete-card],[data-contributor-completion-archive]'
  };
  return document.querySelector<HTMLElement>(selectors[key]||'');
}
function goTo(key:string){
  if(clickGuideSection(key))return;
  const target=fallbackTarget(key);if(!target)return;
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  window.setTimeout(()=>target.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')?.focus({preventScroll:true}),280);
}

function legacyJumpKey(value:string){return ({standard:'orientation',brief:'project',revisions:'revisions',documents:'submission',impact:'impact',journey:'journey',history:'history'} as Record<string,string>)[value]||value}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target||route()!=='contribute')return;
  const next=target.closest<HTMLButtonElement>('[data-contributor-journey-jump]');
  if(next){event.preventDefault();goTo(next.dataset.contributorJourneyJump||'');return}
  const legacy=target.closest<HTMLButtonElement>('[data-v3-jump]');
  if(legacy)window.setTimeout(()=>goTo(legacyJumpKey(legacy.dataset.v3Jump||'')),0);
},true);

// Final UI guard: even if another script accidentally exposes the form, a Student
// with an active contribution cannot submit a second application from the browser.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form'||role()!=='student'||!workspaceHasActiveStudentStatus())return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  if(status){status.textContent='You already have an active Student contribution. Complete it before starting a new one.';status.dataset.state='error'}
  document.querySelector('[data-contributor-application-launcher]')?.scrollIntoView({behavior:'smooth',block:'center'});
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);window.addEventListener('focus',schedule);
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('[data-workspace-select],[data-teacher-student-select]'))window.setTimeout(schedule,30)},true);
const observer=new MutationObserver(records=>{if(route()!=='contribute')return;const external=records.some(record=>{const target=record.target instanceof Element?record.target:record.target.parentElement;return !target?.closest('[data-v3-journey]')});if(external)schedule()});
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
