import './contributor-state-guide.css';

type ContributorRole=''|'student'|'teacher';
type WorkspaceRow={id:string;status?:string;applicant_type?:string;documents?:unknown[];reviews?:unknown[];revisions?:Array<{status?:string}>;tasks?:Array<{status?:string}>};
type Assignment={application_id?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:Assignment[]};
type SectionLink={label:string;key:string;target?:HTMLElement|null;locked?:boolean;reason?:string};
type Tone='neutral'|'waiting'|'action'|'success'|'closed';
type StudentFlow='not-applied'|'pending'|'closed'|'working'|'submitted'|'revision'|'waiting-teacher'|'waiting-admin'|'completed';
type TeacherFlow='not-applied'|'pending'|'closed'|'application-update'|'review-needed'|'waiting-student'|'caught-up'|'ready';

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let assignments:Assignment[]=[];
let scheduled=false;
let timer=0;
let observer:MutationObserver|null=null;
let scrollScheduled=false;
let toastTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function page(){return document.querySelector<HTMLElement>('.ll-contrib-page')}
function root(){return document.getElementById('ll-contributor-root')}
function workspace(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function text(el:Element|null|undefined){return (el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function role():ContributorRole{
  const value=root()?.dataset.contributorAccountRole||'';
  if(value==='student'||value==='teacher')return value;
  const app=current();
  if(app?.applicant_type==='student'||app?.applicant_type==='teacher')return app.applicant_type;
  const selected=document.querySelector<HTMLInputElement>('#ll-contributor-form input[name="applicant_type"]:checked')?.value||'';
  return selected==='student'||selected==='teacher'?selected:'';
}
function visible<T extends HTMLElement>(el:T|null|undefined):el is T{return Boolean(el&&el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none')}
function first<T extends HTMLElement>(selector:string,scope:ParentNode=document){return Array.from(scope.querySelectorAll<T>(selector)).find(visible)||null}
function ensureId(el:HTMLElement,key:string){if(!el.id)el.id=`ll-contributor-section-${key}-${Math.random().toString(36).slice(2,8)}`;el.dataset.contributorTocTarget='true';return el.id}
function closestSection(el:HTMLElement|null){return el?.closest<HTMLElement>('.ll-workspace-card,.ll-contrib-section,.ll-teacher-assignment,section,article')||el}
function cardByHeading(host:HTMLElement,needle:string){return Array.from(host.querySelectorAll<HTMLElement>('.ll-workspace-card')).find(card=>text(card.querySelector('h2,h3,h4')).includes(needle))||null}
function statusSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('[data-review-lifecycle-path]')||host.querySelector<HTMLElement>('.ll-workspace-status')||host.querySelector<HTMLElement>('.ll-workspace-timeline')||host.querySelector<HTMLElement>('.ll-workspace-head'))}
function applicationSection(){return document.querySelector<HTMLElement>('#contribute-apply')}
function heroSection(){return document.querySelector<HTMLElement>('.ll-contrib-hero')}
function rolesSection(){return document.querySelector<HTMLElement>('.ll-contrib-role-grid')?.closest<HTMLElement>('.ll-contrib-section')||null}
function casSection(){return document.querySelector<HTMLElement>('#contribute-cas')}
function projectSection(host:HTMLElement){return first<HTMLElement>('.ll-workspace-brief,.ll-workspace-wait',host)}
function tasksSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('.ll-task-list'))||cardByHeading(host,'tasks & progress')}
function revisionsSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('.ll-revision-list'))||cardByHeading(host,'revision requests')}
function openRevision(host:HTMLElement){return first<HTMLElement>('.ll-revision.open',host)}
function submissionSection(host:HTMLElement){return host.querySelector<HTMLElement>('.ll-workspace-docs')}
function activeUpload(host:HTMLElement){return first<HTMLElement>('.ll-docx-form:not(.is-lifecycle-locked)',host)}
function feedbackSection(host:HTMLElement){return host.querySelector<HTMLElement>('[data-student-teacher-feedback]')}
function evidenceSection(){return document.querySelector<HTMLElement>('[data-clarity-evidence-primary]')}
function completionSection(host:HTMLElement){return host.querySelector<HTMLElement>('[data-lifecycle-complete-card],[data-contributor-completion-archive]')}
function messageSection(){return document.querySelector<HTMLElement>('[data-contributor-chat-hub]')}
function reviewPath(host:HTMLElement){return host.querySelector<HTMLElement>('[data-review-lifecycle-path]')}
function lifecycleLock(host:HTMLElement){return host.querySelector<HTMLElement>('[data-lifecycle-lock]')}
function teacherZone(host:HTMLElement){return host.querySelector<HTMLElement>('[data-teacher-student-browser],.ll-teacher-zone,[data-teacher-mentor-dashboard]')}
function teacherCards(host:HTMLElement){return Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).filter(visible)}
function activeTeacherReview(host:HTMLElement){
  return teacherCards(host).find(card=>{
    const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
    const submit=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
    return visible(form)&&Boolean(submit&&!submit.disabled);
  })||null;
}
function teacherHistory(host:HTMLElement){
  const history=first<HTMLElement>('.ll-review-history',host);
  return history?.closest<HTMLElement>('[data-clarity-group="teacher-review-history"],.ll-workspace-card,.ll-teacher-assignment')||history;
}
function hasTeacherDocument(host:HTMLElement){return teacherCards(host).some(card=>Boolean(card.querySelector('[data-download-doc]')))}
function documentCount(app:WorkspaceRow|null){return Array.isArray(app?.documents)?app!.documents!.length:0}

function addOpen(list:SectionLink[],label:string,target:HTMLElement|null|undefined,key:string){
  if(!visible(target)||list.some(item=>item.key===key||item.target===target))return;
  list.push({label,key,target});
}
function addLocked(list:SectionLink[],label:string,key:string,reason:string){
  if(list.some(item=>item.key===key))return;
  list.push({label,key,locked:true,reason});
}
function addOpenOrLocked(list:SectionLink[],label:string,target:HTMLElement|null|undefined,key:string,reason:string){
  if(visible(target))addOpen(list,label,target,key);else addLocked(list,label,key,reason);
}

function studentFlow(host:HTMLElement,app:WorkspaceRow|null):StudentFlow{
  if(!app)return 'not-applied';
  const status=String(app.status||'').toLowerCase();
  if(status==='new')return 'pending';
  if(status==='declined')return 'closed';
  if(status==='completed'||completionSection(host))return 'completed';
  if(openRevision(host))return 'revision';
  const path=text(reviewPath(host));const lock=text(lifecycleLock(host));
  if(path.includes('with litlab admin')||path.includes('final review')||lock.includes('with litlab admin'))return 'waiting-admin';
  if(path.includes('waiting for teacher')||path.includes('teacher response')||lock.includes('with your teacher')||(lock.includes('with ')&&lock.includes('teacher')))return 'waiting-teacher';
  if(documentCount(app)>0&&!activeUpload(host))return 'submitted';
  if(documentCount(app)>0&&(status==='accepted'||status==='reviewing'))return 'submitted';
  return 'working';
}
function teacherFlow(host:HTMLElement,app:WorkspaceRow|null):TeacherFlow{
  if(!app)return 'not-applied';
  const status=String(app.status||'').toLowerCase();
  if(status==='new')return 'pending';
  if(status==='declined')return 'closed';
  if(status==='reviewing'&&openRevision(host))return 'application-update';
  if(activeTeacherReview(host))return 'review-needed';
  const cards=teacherCards(host);
  if(cards.length||assignments.length){
    if(!hasTeacherDocument(host))return 'waiting-student';
    return 'caught-up';
  }
  return 'ready';
}
function flowInfo(activeRole:ContributorRole,host:HTMLElement|null,app:WorkspaceRow|null):{label:string;tone:Tone;flow:string}{
  if(!activeRole)return {label:'Contributor page',tone:'neutral',flow:'page'};
  if(!host){return {label:activeRole==='teacher'?'Teacher reviewer':'Student contributor',tone:'neutral',flow:'loading'}}
  if(activeRole==='student'){
    const flow=studentFlow(host,app);const count=documentCount(app);
    if(flow==='not-applied')return {label:'Student · not applied yet',tone:'neutral',flow};
    if(flow==='pending')return {label:'Student · waiting for application approval',tone:'waiting',flow};
    if(flow==='closed')return {label:'Student · application closed',tone:'closed',flow};
    if(flow==='working')return {label:count?'Student · contribution in progress':'Student · ready to submit first contribution',tone:'action',flow};
    if(flow==='submitted')return {label:`Student · ${count} submission${count===1?'':'s'} sent · waiting for review`,tone:'waiting',flow};
    if(flow==='revision')return {label:'Student · revision requested',tone:'action',flow};
    if(flow==='waiting-teacher')return {label:'Student · waiting for teacher review',tone:'waiting',flow};
    if(flow==='waiting-admin')return {label:'Student · teacher approved · final LitLab review',tone:'waiting',flow};
    return {label:'Student · contribution completed',tone:'success',flow};
  }
  const flow=teacherFlow(host,app);
  if(flow==='not-applied')return {label:'Teacher · not applied yet',tone:'neutral',flow};
  if(flow==='pending')return {label:'Teacher · waiting for reviewer approval',tone:'waiting',flow};
  if(flow==='closed')return {label:'Teacher · application closed',tone:'closed',flow};
  if(flow==='application-update')return {label:'Teacher · application update needed',tone:'action',flow};
  if(flow==='review-needed')return {label:'Teacher · student review needed',tone:'action',flow};
  if(flow==='waiting-student')return {label:'Teacher · waiting for student submission',tone:'waiting',flow};
  if(flow==='caught-up')return {label:'Teacher · assigned reviews are caught up',tone:'waiting',flow};
  return {label:'Teacher · approved and ready for assignment',tone:'success',flow};
}

function genericSections(){
  const links:SectionLink[]=[];
  addOpen(links,'Overview',heroSection(),'overview');
  addOpen(links,'Roles',rolesSection(),'roles');
  addOpen(links,'CAS',casSection(),'cas');
  addOpen(links,'Application',applicationSection(),'application');
  return links;
}
function studentSections(host:HTMLElement,app:WorkspaceRow|null){
  const links:SectionLink[]=[];const flow=studentFlow(host,app);
  if(flow==='not-applied'){
    addOpen(links,'Overview',heroSection(),'overview');
    addOpen(links,'CAS',casSection(),'cas');
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Workspace','workspace','Submit an application and wait for LitLab approval first.');
    addLocked(links,'Submission','submission','Submission opens after your application is approved.');
    addLocked(links,'Teacher feedback','teacher-feedback','Teacher feedback appears after you submit work and a teacher reviews it.');
    return links;
  }
  addOpenOrLocked(links,'Status',statusSection(host),'status','Your contributor status is still loading.');
  if(flow==='pending'){
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Project','project','Available after LitLab approves your application.');
    addLocked(links,'Tasks','tasks','Tasks are assigned after approval.');
    addLocked(links,'Submission','submission','Word submission is locked while your application is awaiting approval.');
    addLocked(links,'Teacher feedback','teacher-feedback','Feedback appears after approved work is submitted and reviewed.');
    addLocked(links,'Completion','completion','Completion becomes available after the contribution workflow is finished.');
    addOpen(links,'Messages',messageSection(),'messages');
    return links;
  }
  if(flow==='closed'){
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Project','project','This application is closed.');
    addLocked(links,'Tasks','tasks','This application is closed.');
    addLocked(links,'Submission','submission','This application is closed, so new submissions are disabled.');
    addLocked(links,'Completion','completion','There is no active contribution to complete.');
    addOpen(links,'Messages',messageSection(),'messages');
    return links;
  }
  addOpenOrLocked(links,'Project',projectSection(host),'project','LitLab is still preparing the project brief.');
  addOpenOrLocked(links,'Tasks',tasksSection(host),'tasks','No task section is available yet.');
  if(flow==='revision')addOpenOrLocked(links,'Revisions',revisionsSection(host),'revisions','The revision request is loading.');
  else addOpenOrLocked(links,'Revisions',revisionsSection(host),'revisions','No revision section is available yet.');

  if(flow==='waiting-teacher')addLocked(links,'Submission','submission','Your latest DOCX is with your teacher. Wait for the teacher response before uploading again.');
  else if(flow==='waiting-admin')addLocked(links,'Submission','submission','Teacher review is complete and LitLab is doing final review. Upload again only if LitLab requests changes.');
  else if(flow==='submitted')addLocked(links,'Submission','submission','A submission is already in review. Wait for feedback before sending another version.');
  else if(flow==='completed')addOpenOrLocked(links,'Submission history',submissionSection(host),'submission','No saved submission history is available.');
  else addOpenOrLocked(links,'Submission',submissionSection(host),'submission','The submission area is not available yet.');

  if(visible(feedbackSection(host)))addOpen(links,'Teacher feedback',feedbackSection(host),'teacher-feedback');
  else if(flow==='completed')addLocked(links,'Teacher feedback','teacher-feedback','No teacher feedback record is available for this contribution.');
  else addLocked(links,'Teacher feedback','teacher-feedback',flow==='waiting-teacher'?'Your teacher has not submitted feedback yet.':'Teacher notes and grades appear here after a teacher review.');

  if(visible(evidenceSection()))addOpen(links,'Evidence',evidenceSection(),'evidence');
  else if(flow!=='completed')addLocked(links,'Evidence','evidence','Evidence tools are not available at this stage.');

  if(flow==='completed')addOpenOrLocked(links,'Completion',completionSection(host),'completion','The completion record is loading.');
  else addLocked(links,'Completion','completion',flow==='waiting-admin'?'Available after LitLab finishes final review.':'Available after the contribution is fully approved and completed.');
  addOpen(links,'Messages',messageSection(),'messages');
  return links;
}
function teacherSections(host:HTMLElement,app:WorkspaceRow|null){
  const links:SectionLink[]=[];const flow=teacherFlow(host,app);
  if(flow==='not-applied'){
    addOpen(links,'Overview',heroSection(),'overview');
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Assigned students','assigned-students','Apply and receive LitLab approval before student assignments can appear.');
    addLocked(links,'Review student','review-student','Reviews unlock after approval and a student assignment.');
    addLocked(links,'Review history','review-history','Review history appears after you submit your first teacher review.');
    return links;
  }
  addOpenOrLocked(links,'Status',statusSection(host),'status','Your reviewer status is still loading.');
  if(flow==='pending'){
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Assigned students','assigned-students','Student assignments are locked while your teacher application is awaiting approval.');
    addLocked(links,'Review student','review-student','Review controls unlock after approval and assignment.');
    addLocked(links,'Review history','review-history','No review history exists yet.');
    addOpen(links,'Messages',messageSection(),'messages');
    return links;
  }
  if(flow==='closed'){
    addOpen(links,'Application',applicationSection(),'application');
    addLocked(links,'Assigned students','assigned-students','This reviewer application is closed.');
    addLocked(links,'Review student','review-student','This reviewer application is closed.');
    addOpen(links,'Messages',messageSection(),'messages');
    return links;
  }
  if(flow==='application-update')addOpenOrLocked(links,'Application update',revisionsSection(host),'application-update','LitLab requested an application update.');
  else addOpenOrLocked(links,'Application updates',revisionsSection(host),'application-updates','There are no application updates right now.');

  addOpenOrLocked(links,'Assigned students',teacherZone(host),'assigned-students',flow==='ready'?'No student has been assigned yet.':'The assigned-student area is not available yet.');
  const review=activeTeacherReview(host);
  if(review)addOpen(links,'Review student',review,'review-student');
  else addLocked(links,'Review student','review-student',flow==='waiting-student'?'Waiting for the assigned student to upload a DOCX.':flow==='caught-up'?'No student review is waiting right now.':'A review will unlock when LitLab assigns student work.');

  if(visible(teacherHistory(host)))addOpen(links,'Review history',teacherHistory(host),'review-history');
  else addLocked(links,'Review history','review-history','Review history appears after you submit a teacher review.');

  if(visible(completionSection(host)))addOpen(links,'Saved record',completionSection(host),'saved-record');
  else if(flow==='caught-up')addLocked(links,'Saved record','saved-record','A saved completion record will appear when the review workflow is complete.');
  addOpen(links,'Messages',messageSection(),'messages');
  return links;
}

function buttonMarkup(item:SectionLink){
  if(item.locked){
    const reason=item.reason||'This section is not available at the current stage.';
    return `<button type="button" class="locked" data-contributor-locked="${esc(reason)}" data-section-key="${esc(item.key)}" aria-disabled="true" title="${esc(reason)}"><span aria-hidden="true">🔒</span>${esc(item.label)}</button>`;
  }
  if(!item.target)return '';
  const id=ensureId(item.target,item.key);
  return `<button type="button" data-contributor-section-jump="${esc(id)}" data-section-key="${esc(item.key)}">${esc(item.label)}</button>`;
}
function renderGuide(){
  scheduled=false;
  if(route()!=='contribute'){document.querySelector('[data-contributor-state-guide]')?.remove();return}
  const p=page();if(!p)return;
  const host=workspace();const activeRole=role();const app=current();
  const links=activeRole&&host?(activeRole==='teacher'?teacherSections(host,app):studentSections(host,app)):genericSections();
  if(!links.length)return;
  let guide=p.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(!guide){
    guide=document.createElement('nav');guide.dataset.contributorStateGuide='true';guide.className='ll-contributor-state-guide';guide.setAttribute('aria-label','Contributor page sections');
    const hero=p.querySelector('.ll-contrib-hero');hero?.after(guide);if(!guide.isConnected)p.prepend(guide);
  }
  const info=flowInfo(activeRole,host,app);guide.dataset.tone=info.tone;guide.dataset.flow=info.flow;
  const html=`<span class="ll-contributor-toc-heading">On this ${activeRole?'workspace':'page'}</span><em class="ll-contributor-toc-state">${esc(info.label)}</em><div class="ll-contributor-toc-links">${links.map(buttonMarkup).join('')}</div><div class="ll-contributor-toc-toast" data-contributor-toc-toast role="status" aria-live="polite" hidden></div>`;
  if(guide.dataset.signature!==html){guide.dataset.signature=html;guide.innerHTML=html}
  requestAnimationFrame(syncCurrentFromScroll);
}
function schedule(){if(scheduled)return;scheduled=true;clearTimeout(timer);timer=window.setTimeout(renderGuide,50)}
function startObserver(){observer?.disconnect();observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','data-contributor-account-role']})}
function setCurrent(button:HTMLButtonElement|null){
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');if(!guide)return;
  const buttons=Array.from(guide.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump]'));
  buttons.forEach(item=>{const active=item===button;item.classList.toggle('current',active);if(active)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current')});
  if(!button)return;
  const strip=guide.querySelector<HTMLElement>('.ll-contributor-toc-links');if(!strip)return;
  const left=button.offsetLeft-strip.clientWidth/2+button.offsetWidth/2;
  strip.scrollTo({left:Math.max(0,left),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function syncCurrentFromScroll(){
  scrollScheduled=false;
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');if(!guide||route()!=='contribute')return;
  const buttons=Array.from(guide.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump]'));
  if(!buttons.length)return;
  const entries=buttons.map(button=>({button,target:document.getElementById(button.dataset.contributorSectionJump||'')})).filter((entry):entry is {button:HTMLButtonElement;target:HTMLElement}=>visible(entry.target));
  if(!entries.length)return;
  const marker=138;
  let active=entries[0];let best=-Infinity;
  entries.forEach(entry=>{const top=entry.target.getBoundingClientRect().top;if(top<=marker&&top>best){best=top;active=entry}});
  if(best===-Infinity){active=entries.slice().sort((a,b)=>Math.abs(a.target.getBoundingClientRect().top-marker)-Math.abs(b.target.getBoundingClientRect().top-marker))[0]||entries[0]}
  setCurrent(active.button);
}
function onScroll(){if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(syncCurrentFromScroll)}
function showLockedReason(reason:string){
  const toast=document.querySelector<HTMLElement>('[data-contributor-toc-toast]');if(!toast)return;
  clearTimeout(toastTimer);toast.textContent=`Locked: ${reason}`;toast.hidden=false;
  toastTimer=window.setTimeout(()=>{toast.hidden=true;toast.textContent=''},3600);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const locked=target.closest<HTMLButtonElement>('[data-contributor-locked]');if(locked){event.preventDefault();showLockedReason(locked.dataset.contributorLocked||'This section is not available yet.');return}
  const button=target.closest<HTMLButtonElement>('[data-contributor-section-jump]');if(button){
    const id=button.dataset.contributorSectionJump||'';const destination=id?document.getElementById(id):null;if(!destination)return;
    setCurrent(button);destination.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;
  }
  if(target.closest('[data-workspace-select],[data-teacher-roster-student],[data-teacher-roster-mobile],summary'))window.setTimeout(schedule,0);
},true);
document.addEventListener('change',event=>{const target=event.target instanceof HTMLInputElement?event.target:null;if(target?.name==='applicant_type')schedule()},true);
window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('hashchange',schedule);window.addEventListener('resize',()=>{schedule();onScroll()});window.addEventListener('focus',schedule);

function start(){startObserver();schedule();onScroll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
