let scheduled=false;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function isStudentGuide(guide:HTMLElement){
  if(root()?.dataset.contributorAccountRole==='student')return true;
  return (guide.querySelector<HTMLElement>('.ll-contributor-toc-state')?.textContent||'').trim().startsWith('Student');
}
function ensureApplicationEntry(){
  scheduled=false;
  if(route()!=='contribute')return;
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(!guide||!isStudentGuide(guide))return;
  const links=guide.querySelector<HTMLElement>('.ll-contributor-toc-links');
  const application=document.getElementById('contribute-apply');
  if(!links||!application)return;
  application.dataset.contributorTocTarget='true';
  const existing=links.querySelector<HTMLButtonElement>('[data-section-key="application"],[data-contributor-section-jump="contribute-apply"]');
  if(existing){
    existing.dataset.sectionKey='application';
    existing.dataset.contributorSectionJump='contribute-apply';
    if(existing.textContent?.trim()!=='Application')existing.textContent='Application';
    return;
  }
  const button=document.createElement('button');
  button.type='button';
  button.dataset.contributorSectionJump='contribute-apply';
  button.dataset.sectionKey='application';
  button.textContent='Application';
  const status=links.querySelector<HTMLElement>('[data-section-key="status"]');
  if(status)status.after(button);else links.prepend(button);
}
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(ensureApplicationEntry);
}
function start(){
  observer?.disconnect();
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-contributor-account-role','data-flow','data-tone']});
  schedule();
}

for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);
window.addEventListener('focus',schedule);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
