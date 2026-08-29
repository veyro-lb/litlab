import './contributor-system-audit.css';

let scheduled=false;
let scanTimer=0;
let scanAttempts=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function workspace(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function accountRole(){return root()?.dataset.contributorAccountRole||''}

function cleanTeacherUi(host:HTMLElement){
  if(accountRole()!=='teacher'&&!host.classList.contains('ll-teacher-focused-view')&&!host.querySelector('[data-teacher-student-browser],.ll-teacher-zone'))return;
  document.querySelectorAll<HTMLElement>('[data-new-contribution-control]').forEach(el=>el.remove());

  if(host.querySelector('[data-teacher-student-browser]')){
    host.querySelectorAll<HTMLElement>('[data-teacher-student-center],[data-teacher-hard-review-center]').forEach(el=>el.remove());
  }

  host.querySelectorAll<HTMLElement>('.ll-evidence-ledger,[data-evidence-form],[data-evidence-list],[data-activity-form],[data-activity-list],[data-cas-evidence],.ll-workspace-cas,.ll-activity-evidence,.ll-mentor-evidence,[data-mentor-evidence-form]').forEach(el=>el.remove());

  const complete=host.querySelector<HTMLElement>('[data-lifecycle-complete-card]');
  const small=complete?.querySelector<HTMLElement>('small');
  if(small){
    const copy='Your Teacher reviewer account stays active for other assigned students. You do not need a new application for each student.';
    if(small.textContent!==copy)small.textContent=copy;
  }
}

function syncCompletedPath(host:HTMLElement){
  const path=host.querySelector<HTMLElement>('[data-review-lifecycle-path].ll-review-path-minimized');
  if(!path)return;
  const open=path.classList.contains('is-expanded');
  const button=path.querySelector<HTMLButtonElement>('[data-toggle-completed-review-path],[data-hard-completed-path-toggle]');
  if(!button)return;
  button.textContent=open?'Minimize path':'Show path';
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Minimize completed review path':'Show completed review path');
}

function syncInteractiveStates(){
  document.querySelectorAll<HTMLButtonElement>('.ll-contrib-page button').forEach(button=>{
    if(button.disabled)button.setAttribute('aria-disabled','true');
    else button.removeAttribute('aria-disabled');
  });
  document.querySelectorAll<HTMLElement>('[data-form-state],[data-admin-state],[data-upload-state],[data-evidence-state],.admin-contrib-save-state').forEach(state=>{
    state.setAttribute('role','status');
    state.setAttribute('aria-live','polite');
  });
}

function apply(){
  scheduled=false;
  if(route()!=='contribute')return;
  const host=workspace();
  if(!host)return;
  cleanTeacherUi(host);
  syncCompletedPath(host);
  syncInteractiveStates();
  document.documentElement.classList.add('ll-contributor-audited');
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(apply);
}

function scan(){
  window.clearTimeout(scanTimer);
  if(route()!=='contribute')return;
  if(root()&&workspace()){
    scanAttempts=0;
    schedule();
    return;
  }
  if(scanAttempts++<35)scanTimer=window.setTimeout(scan,120);
}

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||route()!=='contribute')return;
  const modal=document.getElementById('ll-contributor-chat-modal');
  if(!modal)return;
  const close=modal.querySelector<HTMLButtonElement>('[data-chat-close]');
  if(close){event.preventDefault();close.click()}
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target||route()!=='contribute')return;
  if(target.closest('[data-toggle-completed-review-path],[data-hard-completed-path-toggle],[data-teacher-roster-student],[data-teacher-roster-mobile]'))window.setTimeout(schedule,0);
},true);

for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated']){
  window.addEventListener(name,schedule);
}
window.addEventListener('focus',schedule);
window.addEventListener('resize',schedule);
window.addEventListener('hashchange',()=>{document.documentElement.classList.remove('ll-contributor-audited');scanAttempts=0;window.setTimeout(scan,60)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
