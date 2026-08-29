let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function isTeacher(bar:HTMLElement){
  const role=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';
  if(role==='teacher')return true;
  const state=(bar.querySelector<HTMLElement>('.ll-contributor-toc-state')?.textContent||'').trim().toLowerCase();
  return state.startsWith('teacher');
}

function sanitize(){
  scheduled=false;
  if(route()!=='contribute')return;
  const bar=guide();if(!bar||!isTeacher(bar))return;
  const links=bar.querySelector<HTMLElement>('.ll-contributor-toc-links');if(!links)return;

  // Teacher guide controls should represent actions/sections the teacher can actually use.
  // Assignment itself is an admin/LitLab responsibility, so never show dead locked controls.
  links.querySelectorAll<HTMLButtonElement>(':scope > button[data-contributor-locked],:scope > button[aria-disabled="true"]').forEach(button=>button.remove());

  // When LitLab has assigned students and the real roster exists, keep the guide shortcut,
  // but label it as the teacher's roster rather than implying the teacher assigns students.
  const students=links.querySelector<HTMLButtonElement>(':scope > button[data-section-key="assigned-students"]');
  if(students){
    students.textContent='My students';
    students.setAttribute('aria-label','Go to my assigned students');
    students.title='Go to the students LitLab assigned to you.';
  }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sanitize)}

for(const name of ['litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-admin-updated','litlab:contributor-account-role'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);window.addEventListener('focus',schedule);

const observer=new MutationObserver(records=>{
  if(route()!=='contribute')return;
  if(records.some(record=>{
    const target=record.target instanceof Element?record.target:record.target.parentElement;
    return Boolean(target?.closest('[data-contributor-state-guide]')||Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches('[data-contributor-state-guide]')||Boolean(node.querySelector('[data-contributor-state-guide]')))));
  }))schedule();
});
function start(){observer.observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
