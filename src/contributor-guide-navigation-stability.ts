type ContributorRole='student'|'teacher'|'';

type GuideLock={button:HTMLButtonElement;until:number};

let scheduled=false;
let lock:GuideLock|null=null;
let lockTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function role():ContributorRole{
  const value=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'?value:'';
}
function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function strip(){return guide()?.querySelector<HTMLElement>('.ll-contributor-toc-links')||null}
function first(selector:string){return document.querySelector<HTMLElement>(selector)}
function closestSection(selector:string){
  const node=first(selector);
  return node?.closest<HTMLElement>('.ll-workspace-card,.ll-contrib-section,.ll-teacher-assignment,section,article')||node;
}
function targetFor(button:HTMLButtonElement){
  const id=button.dataset.contributorSectionJump||'';
  if(id){const direct=document.getElementById(id);if(direct)return direct as HTMLElement}
  const key=button.dataset.sectionKey||'';
  const targets:Record<string,()=>HTMLElement|null>={
    overview:()=>first('.ll-contrib-hero'),
    roles:()=>closestSection('.ll-contrib-role-grid'),
    cas:()=>first('#contribute-cas'),
    status:()=>closestSection('[data-review-lifecycle-path],.ll-workspace-status,.ll-workspace-timeline,.ll-workspace-head'),
    journey:()=>first('[data-v3-journey]'),
    orientation:()=>first('[data-v3-standard]'),
    project:()=>first('.ll-workspace-brief,.ll-workspace-wait'),
    tasks:()=>closestSection('.ll-task-list'),
    revisions:()=>closestSection('.ll-revision-list'),
    submission:()=>first('.ll-workspace-docs'),
    'teacher-feedback':()=>first('[data-student-teacher-feedback]'),
    evidence:()=>first('[data-clarity-evidence-primary],[data-v3-evidence]'),
    completion:()=>first('[data-lifecycle-complete-card],[data-contributor-completion-archive],.ll-recognition'),
    history:()=>first('[data-v3-history],[data-contributor-completion-archive],[data-my-contributions]'),
    impact:()=>first('[data-v3-impact]'),
    messages:()=>first('[data-contributor-chat-hub]'),
    workspace:()=>first('[data-contributor-workspace]'),
    'assigned-students':()=>first('[data-teacher-student-roster],[data-teacher-student-browser],.ll-teacher-zone,[data-teacher-mentor-dashboard]'),
    'review-student':()=>first('form[data-teacher-review]:not([hidden]),form.ll-review-form:not([hidden]),.ll-teacher-assignment'),
    'review-history':()=>closestSection('.ll-review-history'),
    'saved-record':()=>first('[data-lifecycle-complete-card],[data-contributor-completion-archive]'),
    application:()=>first('[data-contributor-application-launcher],#contribute-apply')
  };
  return targets[key]?.()||null;
}
function fallbackRank(key:string){
  const common=['overview','roles','cas','status','journey','orientation','project','tasks','revisions','submission','teacher-feedback','evidence','completion','history','impact','assigned-students','review-student','review-history','saved-record','workspace','messages','application'];
  const teacher=['status','journey','orientation','assigned-students','review-student','review-history','saved-record','messages','application'];
  const student=['status','journey','orientation','project','tasks','revisions','submission','teacher-feedback','evidence','completion','history','impact','messages','application'];
  const order=role()==='teacher'?teacher:role()==='student'?student:common;
  const index=order.indexOf(key);
  return index<0?order.length+20:index;
}
function compareDocumentOrder(a:HTMLElement,b:HTMLElement){
  if(a===b)return 0;
  const relation=a.compareDocumentPosition(b);
  if(relation&Node.DOCUMENT_POSITION_FOLLOWING)return -1;
  if(relation&Node.DOCUMENT_POSITION_PRECEDING)return 1;
  return 0;
}
function reorderButtons(){
  scheduled=false;
  if(route()!=='contribute'||role()==='student')return;
  const bar=strip();if(!bar)return;
  const buttons=Array.from(bar.querySelectorAll<HTMLButtonElement>(':scope > button[data-section-key]'));
  if(buttons.length<2)return;
  const sorted=buttons.map((button,index)=>({button,index,target:targetFor(button),rank:fallbackRank(button.dataset.sectionKey||'')})).sort((a,b)=>{
    if(a.target&&b.target){const order=compareDocumentOrder(a.target,b.target);if(order)return order}
    if(a.rank!==b.rank)return a.rank-b.rank;
    return a.index-b.index;
  });
  const changed=sorted.some((entry,index)=>entry.button!==buttons[index]);
  if(!changed)return;
  const active=document.activeElement instanceof HTMLElement?document.activeElement:null;
  sorted.forEach(entry=>bar.appendChild(entry.button));
  if(active?.isConnected&&active.matches('[data-contributor-state-guide] button'))active.focus({preventScroll:true});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(reorderButtons)}
function revealButton(button:HTMLButtonElement){
  const bar=strip();if(!bar)return;
  const left=button.offsetLeft;
  const right=left+button.offsetWidth;
  const min=bar.scrollLeft+6;
  const max=bar.scrollLeft+bar.clientWidth-6;
  if(left<min)bar.scrollTo({left:Math.max(0,left-6),behavior:'auto'});
  else if(right>max)bar.scrollTo({left:Math.max(0,right-bar.clientWidth+6),behavior:'auto'});
}
function markCurrent(button:HTMLButtonElement){
  const host=guide();if(!host||!button.isConnected)return;
  host.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump],[data-contributor-action]').forEach(item=>{
    const active=item===button;
    item.classList.toggle('current',active);
    if(active)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current');
  });
  revealButton(button);
}
function beginLock(button:HTMLButtonElement,duration=260){
  window.clearTimeout(lockTimer);
  lock={button,until:Date.now()+duration};
  markCurrent(button);
  lockTimer=window.setTimeout(()=>{
    if(lock?.button===button){markCurrent(button);lock=null}
  },duration+20);
}
function enforceLock(){
  if(role()==='student'){
    window.clearTimeout(lockTimer);
    lock=null;
    return;
  }
  const current=lock;if(!current)return;
  if(Date.now()>current.until||!current.button.isConnected){lock=null;return}
  requestAnimationFrame(()=>{if(lock===current)markCurrent(current.button)});
}
function instantJump(button:HTMLButtonElement,destination:HTMLElement){
  beginLock(button,220);
  destination.scrollIntoView({behavior:'auto',block:'start'});
  requestAnimationFrame(()=>markCurrent(button));
}
function openApplication(button:HTMLButtonElement){
  beginLock(button,380);
  const accountRole=role()||'student';
  window.dispatchEvent(new CustomEvent('litlab:request-contributor-application',{detail:{role:accountRole,source:'guide-stable-nav'}}));
  window.setTimeout(()=>{
    const apply=first('#contribute-apply');
    const launcher=first('[data-contributor-application-launcher]');
    const destination=apply&&!apply.hidden?apply:launcher;
    if(destination)destination.scrollIntoView({behavior:'auto',block:'start'});
    markCurrent(button);
  },90);
}

window.addEventListener('click',event=>{
  if(route()!=='contribute')return;
  // Student highlighting and scrolling are owned entirely by the Student guide controller.
  // Do not create a second click lock here or it can pin the active chip on Orientation.
  if(role()==='student')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-contributor-state-guide] button');
  if(!button||button.matches('[data-contributor-locked]'))return;
  if(button.matches('[data-contributor-action="application"]')){
    event.preventDefault();event.stopImmediatePropagation();
    openApplication(button);
    return;
  }
  if(!button.matches('[data-contributor-section-jump]'))return;
  const destination=targetFor(button);if(!destination)return;
  event.preventDefault();event.stopImmediatePropagation();
  instantJump(button,destination);
},{capture:true});
window.addEventListener('scroll',enforceLock,{passive:true});
window.addEventListener('hashchange',()=>{window.clearTimeout(lockTimer);lock=null;schedule()});
window.addEventListener('resize',schedule);
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);

const observer=new MutationObserver(records=>{
  if(route()!=='contribute')return;
  if(records.some(record=>record.type==='childList'))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
