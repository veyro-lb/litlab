let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function kicker(card:Element){return card.querySelector<HTMLElement>('.ll-card-title span,.ll-admin-workspace-title span,:scope > span')?.textContent?.trim().toUpperCase()||''}

function fixPromotionEvidenceButton(){
  document.querySelectorAll<HTMLButtonElement>('[data-promotion-jump-evidence]').forEach(button=>{
    delete button.dataset.v3Jump;
    if(button.dataset.promotionEvidenceFixed==='true')return;
    button.dataset.promotionEvidenceFixed='true';
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const evidence=document.querySelector<HTMLElement>('[data-v3-evidence]');
      evidence?.scrollIntoView({behavior:'smooth',block:'start'});
      window.setTimeout(()=>evidence?.querySelector<HTMLElement>('button,input,textarea,select,a')?.focus({preventScroll:true}),420);
    },true);
  });
}

function fixReviewerScope(){
  const promotionCards=Array.from(document.querySelectorAll<HTMLElement>('[data-promotion-application-id]'));
  if(!promotionCards.length)return;
  const scope=document.querySelector<HTMLElement>('[data-role-scope-card]');
  if(scope){
    const intro=scope.querySelector<HTMLElement>(':scope > p');
    if(intro)intro.textContent='Use the review method that matches each assigned contribution. Promotion is reviewed from the campaign evidence and reflection; academic resources continue to use the current DOCX.';
    const steps=scope.querySelectorAll<HTMLElement>('.ll-role-scope-grid article');
    if(steps[0])steps[0].innerHTML='<b>1. Open the current submission</b><small>For Promotion, review the campaign evidence and reflection. For academic resources, open the latest DOCX.</small>';
    if(steps[1])steps[1].innerHTML='<b>2. Give structured feedback</b><small>Use the rubric that matches your approved reviewer role and the contribution type.</small>';
    if(steps[2])steps[2].innerHTML='<b>3. Decide clearly</b><small>Request changes returns the work to the student. Approval sends the current evidence or document to LitLab admin.</small>';
  }

  const promotionNames=new Set(promotionCards.map(card=>{
    const title=card.querySelector<HTMLElement>('.ll-card-title h3')?.textContent?.trim()||'';
    return title.split(/\s+—\s+/)[0].trim().toLowerCase();
  }).filter(Boolean));
  document.querySelectorAll<HTMLElement>('[data-teacher-student-center] .ll-teacher-student-list article').forEach(row=>{
    const name=row.querySelector<HTMLElement>('b')?.textContent?.trim().toLowerCase()||'';
    if(!promotionNames.has(name))return;
    const state=row.querySelector<HTMLElement>('em');if(state){state.textContent='Promotion evidence review';state.className='is-review'}
    const button=row.querySelector<HTMLButtonElement>('button');if(button)button.textContent='Review promotion ↓';
  });
  const center=document.querySelector<HTMLElement>('[data-teacher-student-center]');
  if(center){
    const copy=center.querySelector<HTMLElement>('.ll-teacher-student-center-head p');
    if(copy)copy.textContent='Your assigned students appear below. Academic resources use DOCX review; Promotion uses campaign evidence, reflection and the CAS-supervision rubric.';
  }
}

function fixAdminPromotionCards(){
  const modal=document.getElementById('ll-admin-contributor-workspace');
  if(!modal?.classList.contains('ll-admin-promotion-mode'))return;
  modal.querySelectorAll<HTMLElement>('.ll-admin-workspace-grid > .ll-admin-workspace-card').forEach(card=>{
    const k=kicker(card);
    if(k==='TEACHER REVIEWS'||k==='SUPERVISOR REVIEWS')card.hidden=true;
  });
  const nav=modal.querySelector<HTMLElement>('[data-admin-v3-workspace-nav]');
  nav?.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{if(button.textContent?.trim()==='Reviews')button.hidden=true});
}

function apply(){
  fixPromotionEvidenceButton();
  if(route()==='contribute')fixReviewerScope();
  if(route()==='admin-contributors')fixAdminPromotionCards();
}
function schedule(delay=100){clearTimeout(timer);timer=window.setTimeout(apply,delay)}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest<HTMLButtonElement>('[data-promotion-jump-evidence]');
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  const evidence=document.querySelector<HTMLElement>('[data-v3-evidence]');
  evidence?.scrollIntoView({behavior:'smooth',block:'start'});
},true);
window.addEventListener('litlab:contributor-workspace-data',()=>schedule(220));
window.addEventListener('litlab:contributor-workspace-updated',()=>schedule(260));
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>schedule(260));
window.addEventListener('litlab:admin-contributor-workspace-updated',()=>schedule(260));
window.addEventListener('hashchange',()=>schedule(160));
window.addEventListener('focus',()=>schedule(80));
const observer=new MutationObserver(()=>schedule(180));observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(0),{once:true});else schedule(0);

export {};
