import './contributor-notification-open-guard';
import './contributor-live-sync';
import './contributor-activity-live-sync';
import './admin-contributor-workspace-form-preserver';
import './contributor-secure-document-download';

export {};

function closeEvidenceModal(){
  document.querySelector<HTMLElement>('[data-evidence-modal]')?.remove();
}

function legacyContributorTarget(){
  const hash=location.hash.toLowerCase();
  return hash==='#contribute-apply'?'contribute-apply':hash==='#contribute-cas'?'contribute-cas':'';
}
function recoverLegacyContributorLink(){
  const target=legacyContributorTarget();if(!target)return false;
  try{sessionStorage.setItem('litlabContributorLegacyAnchor',target)}catch{}
  location.hash='contribute';
  return true;
}
function scrollRecoveredContributorLink(){
  let target='';try{target=sessionStorage.getItem('litlabContributorLegacyAnchor')||'';if(target)sessionStorage.removeItem('litlabContributorLegacyAnchor')}catch{}
  if(!target)return;
  let attempts=0;
  const find=()=>{
    const section=document.getElementById(target);
    if(section){section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}
    if(attempts++<30)window.setTimeout(find,100);
  };
  window.setTimeout(find,80);
}

function syncTransientUI(){
  if(location.hash.replace(/^#/,'').split('?')[0].split('#')[0]!=='books')closeEvidenceModal();
  const active=document.activeElement;
  if(active instanceof HTMLElement){
    const hidden=active.closest<HTMLElement>('[hidden],[aria-hidden="true"]');
    if(hidden)active.blur();
  }
}

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const evidence=document.querySelector<HTMLElement>('[data-evidence-modal]');
  if(evidence){event.preventDefault();evidence.remove();return}
  const chat=document.querySelector<HTMLButtonElement>('#ll-contributor-chat-modal [data-chat-close]');
  if(chat){event.preventDefault();chat.click();return}
  const certificate=document.querySelector<HTMLButtonElement>('#ll-admin-certificate-modal [data-certificate-close]');
  if(certificate){event.preventDefault();certificate.click()}
});

window.addEventListener('hashchange',()=>{
  if(recoverLegacyContributorLink())return;
  requestAnimationFrame(syncTransientUI);
  if(location.hash.replace(/^#/,'').split('?')[0].split('#')[0]==='contribute')scrollRecoveredContributorLink();
});
window.addEventListener('pageshow',()=>{if(!recoverLegacyContributorLink()){syncTransientUI();scrollRecoveredContributorLink()}});
function start(){if(!recoverLegacyContributorLink()){syncTransientUI();scrollRecoveredContributorLink()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
