import './contributor-notification-open-guard';
import './contributor-live-sync';

export {};

function closeEvidenceModal(){
  document.querySelector<HTMLElement>('[data-evidence-modal]')?.remove();
}

function syncTransientUI(){
  // Evidence Bank is tied to the Books context. Never leave its body-level overlay covering a
  // different route after navigation.
  if(location.hash.replace(/^#/,'').split('?')[0].split('#')[0]!=='books')closeEvidenceModal();

  // A hidden workspace should never retain focus after auth state or route changes.
  const active=document.activeElement;
  if(active instanceof HTMLElement){
    const hidden=active.closest<HTMLElement>('[hidden],[aria-hidden="true"]');
    if(hidden)active.blur();
  }
}

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const evidence=document.querySelector<HTMLElement>('[data-evidence-modal]');
  if(evidence){
    event.preventDefault();
    evidence.remove();
  }
});

window.addEventListener('hashchange',()=>requestAnimationFrame(syncTransientUI));
window.addEventListener('pageshow',syncTransientUI);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncTransientUI,{once:true});
else syncTransientUI();
