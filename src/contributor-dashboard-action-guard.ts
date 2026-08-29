import './contributor-dashboard-action-guard.css';

let noticeTimer=0;
let syncScheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function host(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function experience(){return host()?.querySelector<HTMLElement>('[data-dashboard-experience]')||null}
function visible<T extends HTMLElement>(el:T|null|undefined):el is T{return Boolean(el&&el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden')}
function firstVisible<T extends HTMLElement>(selector:string,scope:ParentNode=document){return Array.from(scope.querySelectorAll<T>(selector)).find(visible)||null}
function motion(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto' as const:'smooth' as const}
function text(el:Element|null|undefined){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function cardByLabel(label:string){return Array.from(experience()?.querySelectorAll<HTMLElement>('.ll-dashboard-card')||[]).find(card=>text(card.querySelector('.ll-dashboard-card-label')).toUpperCase()===label.toUpperCase())||null}

function ensureNotice(){
  const dash=experience();if(!dash)return null;
  let notice=dash.querySelector<HTMLElement>('[data-dashboard-action-notice]');
  if(notice)return notice;
  notice=document.createElement('div');notice.className='ll-dashboard-action-notice';notice.dataset.dashboardActionNotice='true';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.hidden=true;
  const strip=dash.querySelector('.ll-dashboard-command-strip');if(strip?.parentElement)strip.after(notice);else dash.prepend(notice);
  return notice;
}
function showNotice(message:string,tone:'info'|'locked'|'success'='info'){
  const notice=ensureNotice();if(!notice)return;
  clearTimeout(noticeTimer);notice.dataset.tone=tone;notice.textContent=message;notice.hidden=false;
  noticeTimer=window.setTimeout(()=>{if(notice.isConnected){notice.hidden=true;notice.textContent=''}},4200);
}
function scrollToTarget(target:HTMLElement,focus=false){
  target.scrollIntoView({behavior:motion(),block:'start'});
  target.classList.add('ll-dashboard-action-target');window.setTimeout(()=>target.classList.remove('ll-dashboard-action-target'),900);
  if(focus){const candidate=firstVisible<HTMLElement>('input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href]',target);window.setTimeout(()=>candidate?.focus({preventScroll:true}),motion()==='auto'?0:260)}
}
function guideButton(key:string){return firstVisible<HTMLButtonElement>(`[data-contributor-state-guide] [data-section-key="${CSS.escape(key)}"]`)}
function mappedGuideKey(key:string){return ({documents:'submission',feedback:'teacher-feedback',students:'assigned-students',review:'review-student'} as Record<string,string>)[key]||key}

function targetFor(key:string){
  const workspace=host();if(!workspace)return null;
  if(key==='overview')return firstVisible<HTMLElement>('[data-dashboard-overview]',workspace);
  if(key==='journey')return firstVisible<HTMLElement>('[data-v3-journey],.ll-v3-journey',workspace);
  if(key==='tasks')return firstVisible<HTMLElement>('.ll-task-list',workspace)?.closest<HTMLElement>('.ll-workspace-card')||null;
  if(key==='documents')return firstVisible<HTMLElement>('.ll-workspace-docs',workspace)||cardByLabel('CURRENT DOCUMENT');
  if(key==='feedback')return firstVisible<HTMLElement>('[data-student-teacher-feedback],.ll-teacher-feedback-panel,.ll-revision-list,.ll-review-history',workspace)?.closest<HTMLElement>('.ll-workspace-card,.ll-teacher-assignment,[data-student-teacher-feedback]')||cardByLabel('LATEST FEEDBACK');
  if(key==='history')return firstVisible<HTMLElement>('[data-v3-history],.ll-v3-history,[data-contributor-completion-archive]',workspace)||firstVisible<HTMLElement>('[data-my-contributions]')||cardByLabel('RECENT ACTIVITY');
  if(key==='students')return firstVisible<HTMLElement>('[data-teacher-student-roster],[data-teacher-student-browser],.ll-teacher-zone',workspace)||cardByLabel('REVIEW QUEUE');
  if(key==='review')return firstVisible<HTMLElement>('form[data-teacher-review]:not([hidden]),.ll-teacher-assignment:not([hidden])',workspace)||cardByLabel('REVIEW QUEUE');
  if(key==='messages')return firstVisible<HTMLElement>('[data-contributor-chat-hub]')||null;
  if(key==='application')return firstVisible<HTMLElement>('#contribute-apply,[data-contributor-application-launcher]')||null;
  return null;
}
function unavailableCopy(key:string){return ({journey:'The contribution journey is not available at this stage yet.',tasks:'Tasks are not available at this stage yet.',documents:'Document submission is not available at this stage yet.',feedback:'No detailed feedback is available yet.',messages:'Messages are not available right now.',history:'No saved contribution history is available yet.',students:'No assigned students are available yet.',review:'No student review is waiting right now.',application:'The application form is not available right now.'} as Record<string,string>)[key]||'That dashboard section is not available at the current stage.'}

function openApplication(){
  const guide=guideButton('application');
  if(guide){
    if(guide.matches('[data-contributor-locked],[aria-disabled="true"]'))showNotice(guide.dataset.contributorLocked||'A new application is locked at the current stage.','locked');
    guide.click();return;
  }
  const role=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'student';
  window.dispatchEvent(new CustomEvent('litlab:request-contributor-application',{detail:{role,source:'dashboard'}}));
  window.setTimeout(()=>{const target=targetFor('application');if(target)scrollToTarget(target,true);else showNotice(unavailableCopy('application'),'locked')},120);
}
function openMessages(){
  const section=targetFor('messages');if(section){scrollToTarget(section);return true}
  const opener=firstVisible<HTMLButtonElement>('[data-chat-open],[data-contributor-chat-open]');if(opener){opener.click();return true}
  showNotice(unavailableCopy('messages'),'locked');return false;
}
function openTeacherReview(){
  const form=firstVisible<HTMLFormElement>('form[data-teacher-review]:not([hidden])',host()||document);
  if(form){scrollToTarget(form,true);return true}
  const queueAction=Array.from(experience()?.querySelectorAll<HTMLButtonElement>('[data-dashboard-assignment]')||[]).find(button=>/review now/i.test(button.textContent||''));
  if(queueAction){queueAction.click();return true}
  return false;
}
function jump(key:string){
  if(!key)return;
  if(key==='application'){openApplication();return}
  if(key==='messages'){openMessages();return}
  if(key==='review'&&openTeacherReview())return;
  const guide=guideButton(mappedGuideKey(key));
  if(guide){
    if(guide.matches('[data-contributor-locked],[aria-disabled="true"]')){
      showNotice(guide.dataset.contributorLocked||unavailableCopy(key),'locked');guide.click();return;
    }
    guide.click();
    window.setTimeout(()=>{const target=targetFor(key);if(target)scrollToTarget(target,key==='review')},140);
    return;
  }
  const target=targetFor(key);if(target){scrollToTarget(target,key==='review');return}
  showNotice(unavailableCopy(key),'locked');
}

function openDashboardDocument(button:HTMLButtonElement){
  const path=button.dataset.dashboardOpenDoc||'';
  if(!path){showNotice('This document does not have a valid secure file path.','locked');return}
  const native=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-download-doc],[data-admin-download-doc]')).find(item=>(item.dataset.downloadDoc||item.dataset.adminDownloadDoc)===path);
  if(native){native.click();return}
  showNotice('The secure document control is still loading. Please try again in a moment.','locked');
}
function focusSelectedAssignment(id:string){
  const workspace=host();if(!workspace)return;
  const card=firstVisible<HTMLElement>(`.ll-teacher-assignment[data-teacher-student-id="${CSS.escape(id)}"]`,workspace)||Array.from(workspace.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).find(item=>visible(item)&&item.querySelector<HTMLFormElement>('[data-teacher-review]')?.dataset.teacherReview===id)||null;
  if(!card){showNotice('That student workspace is still loading. Please try again in a moment.','locked');return}
  scrollToTarget(card,true);
}
function openAssignment(button:HTMLButtonElement){
  const id=button.dataset.dashboardAssignment||'';if(!id){showNotice('This student assignment could not be identified.','locked');return}
  const roster=document.querySelector<HTMLButtonElement>(`[data-teacher-student-select="${CSS.escape(id)}"]`);
  if(roster){roster.click();window.setTimeout(()=>focusSelectedAssignment(id),90);return}
  const card=host()?.querySelector<HTMLElement>(`.ll-teacher-assignment[data-teacher-student-id="${CSS.escape(id)}"]`);
  if(card&&visible(card)){scrollToTarget(card,true);return}
  const form=Array.from(document.querySelectorAll<HTMLFormElement>('[data-teacher-review]')).find(item=>item.dataset.teacherReview===id);
  if(form){scrollToTarget(form.closest<HTMLElement>('.ll-teacher-assignment')||form,true);return}
  showNotice('That student workspace is still loading. Please try again in a moment.','locked');
}

function syncNextActionLabel(){
  const dash=experience();if(!dash)return;
  const button=dash.querySelector<HTMLButtonElement>('.ll-dashboard-next [data-dashboard-jump]');if(!button)return;
  const primary=dash.querySelector<HTMLElement>('.ll-dashboard-badges .ll-dashboard-badge');
  const next=primary?.classList.contains('is-waiting')?'View current status ↓':primary?.classList.contains('is-success')?'View saved record ↓':primary?.classList.contains('is-danger')?'View details ↓':'Go to next step ↓';
  if(button.textContent!==next)button.textContent=next;
}
function scheduleSync(){if(syncScheduled)return;syncScheduled=true;requestAnimationFrame(()=>{syncScheduled=false;syncNextActionLabel();ensureNotice()})}

window.addEventListener('click',event=>{
  if(route()!=='contribute')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const jumpButton=target.closest<HTMLButtonElement>('[data-dashboard-jump]');
  if(jumpButton){event.preventDefault();event.stopPropagation();jump(jumpButton.dataset.dashboardJump||'');return}
  const docButton=target.closest<HTMLButtonElement>('[data-dashboard-open-doc]');
  if(docButton){event.preventDefault();event.stopPropagation();openDashboardDocument(docButton);return}
  const assignment=target.closest<HTMLButtonElement>('[data-dashboard-assignment]');
  if(assignment){event.preventDefault();event.stopPropagation();openAssignment(assignment);return}
},true);

const observer=new MutationObserver(records=>{if(route()!=='contribute')return;if(records.some(record=>Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches('[data-dashboard-experience],.ll-dashboard-next,.ll-teacher-student-browser')||Boolean(node.querySelector('[data-dashboard-experience],.ll-dashboard-next,.ll-teacher-student-browser'))))))scheduleSync()});
function start(){observer.observe(document.body,{childList:true,subtree:true});scheduleSync()}
window.addEventListener('litlab:contributor-workspace-data',scheduleSync);window.addEventListener('litlab:contributor-workspace-updated',scheduleSync);window.addEventListener('hashchange',scheduleSync);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
