type Row=Record<string,any>;

let selectedId='';
let workspaces:Row[]=[];
let pending=false;
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
function promotionOpen(){return ['accepted','reviewing','completed'].includes(String(current()?.status||''))}

function removeLegacyEvidence(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  if(!root||!isPromotion())return;
  // Promotion v2 replaces the generic Evidence Vault completely. Removing it prevents the
  // legacy Promotion adapters from continuously unhiding/relabeling it and fighting v2.
  root.querySelectorAll<HTMLElement>('[data-v3-evidence]').forEach(card=>card.remove());
}

function stabilizeGuide(){
  if(route()!=='contribute'||!isPromotion())return;
  const page=promotionPage();
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(!page||!guide)return;

  const submission=guide.querySelector<HTMLButtonElement>('[data-section-key="submission"]');
  if(submission){
    submission.removeAttribute('data-promotion-submission-jump');
    submission.dataset.promotionV2Jump='true';
    if(promotionOpen()){
      submission.classList.remove('locked');
      submission.removeAttribute('aria-disabled');
      submission.removeAttribute('data-contributor-locked');
      submission.dataset.contributorSectionJump=page.id;
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
  pending=false;
  if(route()!=='contribute'||!isPromotion())return;
  removeLegacyEvidence();
  stabilizeGuide();
}
function schedule(){
  if(pending)return;
  pending=true;
  queueMicrotask(stabilize);
}

// Own Promotion navigation at window-capture level. The legacy window handler becomes a
// no-op once the generic Evidence Vault is removed; this handler then owns the real hand-in.
window.addEventListener('click',event=>{
  if(route()!=='contribute'||!isPromotion())return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-section-key="submission"],[data-promotion-v2-jump],[data-promotion-jump-evidence]');
  if(!button)return;
  const page=promotionPage();if(!page||!promotionOpen())return;
  stabilizeGuide();
  event.preventDefault();event.stopImmediatePropagation();
  page.scrollIntoView({behavior:smooth(),block:'start'});
  window.setTimeout(()=>page.querySelector<HTMLElement>('form[data-promotion-submission-form] input:not([type="radio"]),form[data-promotion-submission-form] select,form[data-promotion-submission-form] textarea,button')?.focus({preventScroll:true}),220);
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<Row>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
// The state guide emits this immediately after rebuilding itself. Patch synchronously in a
// microtask so the generic locked Submission state does not visibly paint first.
window.addEventListener('litlab:contributor-guide-rendered',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('hashchange',schedule);
window.addEventListener('focus',schedule);

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
    if(relevant)schedule();
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-disabled']});
  schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
