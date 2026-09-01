type Row=Record<string,any>;

let selectedId='';
let workspaces:Row[]=[];
let timer=0;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function current(){return workspaces.find(x=>x.id===selectedId)||workspaces[0]||null}
function isPromotion(){
  const row=current();
  if(String(row?.contribution_type||'').trim().toLowerCase()==='promotion')return true;
  return Boolean(document.querySelector('[data-contributor-workspace].ll-promotion-workspace-mode'));
}
function promotionPage(){return document.querySelector<HTMLElement>('[data-contributor-workspace] [data-promotion-submission-page]')}
function smooth(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}

function removeLegacyEvidence(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  if(!root||!isPromotion())return;
  root.querySelectorAll<HTMLElement>('[data-v3-evidence]').forEach(card=>card.remove());
}

function stabilizeGuide(){
  if(route()!=='contribute'||!isPromotion())return;
  const page=promotionPage();
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(!page||!guide)return;

  const submission=guide.querySelector<HTMLButtonElement>('[data-section-key="submission"]');
  if(submission){
    // The old Promotion adapter used this attribute and intercepted the click before the
    // dedicated submission page could handle it. Remove it permanently for Promotion v2.
    submission.removeAttribute('data-promotion-submission-jump');
    submission.dataset.promotionV2Jump='true';
    if(!submission.classList.contains('locked')){
      submission.dataset.contributorSectionJump=page.id;
      submission.removeAttribute('aria-disabled');
      submission.removeAttribute('data-contributor-locked');
    }
    const label=current()?.status==='completed'?'Promotion evidence':'Submit evidence';
    if(submission.textContent!==label)submission.textContent=label;
  }

  const duplicate=guide.querySelector<HTMLButtonElement>('[data-section-key="evidence"]');
  if(duplicate&&!duplicate.hidden)duplicate.hidden=true;
  const feedback=guide.querySelector<HTMLButtonElement>('[data-section-key="teacher-feedback"]');
  if(feedback&&feedback.textContent!=='Supervisor feedback')feedback.textContent='Supervisor feedback';
}

function stabilize(){
  timer=0;
  if(route()!=='contribute'||!isPromotion())return;
  removeLegacyEvidence();
  stabilizeGuide();
}
function schedule(delay=0){
  if(timer)return;
  timer=window.setTimeout(stabilize,delay);
}

// Own Promotion navigation at window-capture level. The legacy window handler runs first,
// but becomes a no-op because the legacy Evidence Vault has been removed. We then handle
// the dedicated page before the older document-level handler can intercept the event.
window.addEventListener('click',event=>{
  if(route()!=='contribute'||!isPromotion())return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-section-key="submission"],[data-promotion-v2-jump],[data-promotion-jump-evidence]');
  if(!button)return;
  const page=promotionPage();if(!page)return;
  if(button.classList.contains('locked')||button.getAttribute('aria-disabled')==='true')return;
  event.preventDefault();event.stopImmediatePropagation();
  page.scrollIntoView({behavior:smooth(),block:'start'});
  window.setTimeout(()=>page.querySelector<HTMLElement>('form[data-promotion-submission-form] input:not([type="radio"]),form[data-promotion-submission-form] select,form[data-promotion-submission-form] textarea,button')?.focus({preventScroll:true}),260);
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<Row>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule(0);
});
window.addEventListener('litlab:contributor-guide-rendered',()=>schedule(0));
window.addEventListener('litlab:contributor-workspace-updated',()=>schedule(30));
window.addEventListener('hashchange',()=>schedule(0));
window.addEventListener('focus',()=>schedule(20));

function start(){
  observer?.disconnect();
  observer=new MutationObserver(records=>{
    if(route()!=='contribute'||!isPromotion())return;
    const relevant=records.some(record=>{
      const target=record.target instanceof Element?record.target:record.target.parentElement;
      if(!target)return true;
      if(target.closest('[data-promotion-submission-page]'))return false;
      return true;
    });
    if(relevant)schedule(0);
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-disabled']});
  schedule(0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
