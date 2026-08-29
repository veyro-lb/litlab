type Role=''|'student'|'teacher';

let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function strip(){return guide()?.querySelector<HTMLElement>('.ll-contributor-toc-links')||null}
function role():Role{const value=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';return value==='student'||value==='teacher'?value:''}
function key(button:HTMLButtonElement){if(button.matches('[data-revision-submit-guide]'))return 'submit-revision';return button.dataset.sectionKey||''}
function buttons(){return Array.from(strip()?.querySelectorAll<HTMLButtonElement>(':scope > button')||[])}
function isUsable(button:HTMLButtonElement){return !button.matches('[data-contributor-locked],[aria-disabled="true"]')}

function orderForStudent(flow:string){
  if(flow==='not-applied')return ['overview','cas','application'];
  if(flow==='pending')return ['status','journey','orientation','messages'];
  if(flow==='closed')return ['status','history','messages'];
  if(flow==='revision')return ['status','journey','project','tasks','revisions','submit-revision','submission','teacher-feedback','evidence','messages'];
  if(flow==='working')return ['status','journey','orientation','project','tasks','submission','teacher-feedback','evidence','messages'];
  if(flow==='submitted'||flow==='waiting-teacher')return ['status','journey','teacher-feedback','messages'];
  if(flow==='waiting-admin')return ['status','journey','teacher-feedback','messages'];
  if(flow==='completed')return ['status','journey','submission','teacher-feedback','completion','history','impact','messages'];
  return ['status','journey','project','tasks','revisions','submit-revision','submission','teacher-feedback','evidence','completion','history','messages'];
}
function orderForTeacher(flow:string){
  if(flow==='not-applied')return ['overview','application'];
  if(flow==='pending')return ['status','journey','orientation','messages'];
  if(flow==='closed')return ['status','messages'];
  if(flow==='application-update')return ['status','journey','application-update','messages'];
  if(flow==='review-needed')return ['status','journey','assigned-students','review-student','review-history','messages'];
  if(flow==='waiting-student'||flow==='caught-up'||flow==='ready')return ['status','journey','assigned-students','review-history','messages'];
  return ['status','journey','assigned-students','review-student','review-history','saved-record','messages'];
}

function shouldShow(button:HTMLButtonElement,allowed:Set<string>,flow:string){
  const buttonKey=key(button);if(!buttonKey||!allowed.has(buttonKey))return false;
  if(buttonKey==='submit-revision')return true;
  if(buttonKey==='teacher-feedback'&&!isUsable(button))return false;
  if(buttonKey==='review-history'&&!isUsable(button))return false;
  if(buttonKey==='history'&&!isUsable(button))return false;
  if(buttonKey==='evidence'&&!isUsable(button))return false;
  if(buttonKey==='orientation'&&!isUsable(button))return false;
  if(buttonKey==='project'&&!isUsable(button))return false;
  if(buttonKey==='tasks'&&!isUsable(button))return false;
  if(buttonKey==='completion'&&!isUsable(button))return false;
  if(buttonKey==='submission'&&!isUsable(button)&&!['revision','completed'].includes(flow))return false;
  return true;
}

function apply(){
  scheduled=false;if(route()!=='contribute')return;
  const bar=guide();const links=strip();if(!bar||!links)return;
  const activeRole=role();const flow=bar.dataset.flow||'';
  const desired=activeRole==='teacher'?orderForTeacher(flow):orderForStudent(flow);
  const allowed=new Set(desired);
  const all=buttons();

  all.forEach(button=>{
    const show=shouldShow(button,allowed,flow);
    button.hidden=!show;
    button.setAttribute('aria-hidden',show?'false':'true');
    if(show)button.removeAttribute('tabindex');else button.tabIndex=-1;
  });

  const targetOrder=desired.filter(name=>all.some(item=>key(item)===name&&!item.hidden));
  const currentOrder=all.filter(item=>!item.hidden).map(key);
  if(currentOrder.join('|')!==targetOrder.join('|')){
    targetOrder.forEach(name=>{
      const button=all.find(item=>key(item)===name&&!item.hidden);
      if(button)links.append(button);
    });
  }

  const revision=all.find(button=>key(button)==='submit-revision'&&!button.hidden);
  if(revision){
    revision.classList.add('ll-guide-priority-action');
    revision.setAttribute('aria-label','Submit revised DOCX');
  }

  bar.dataset.guideStageOrdered='true';
  bar.dataset.guideVisibleCount=String(all.filter(button=>!button.hidden).length);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

const observer=new MutationObserver(records=>{
  if(route()!=='contribute')return;
  if(records.some(record=>{
    const target=record.target instanceof Element?record.target:record.target.parentElement;
    return Boolean(target?.closest('[data-contributor-state-guide]'));
  }))schedule();
});

for(const name of ['litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-admin-updated','litlab:contributor-submitted','litlab:contributor-account-role'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);window.addEventListener('focus',schedule);
function start(){observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-flow','aria-disabled','class']});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
