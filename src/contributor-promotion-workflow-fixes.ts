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
    if(k==='WORD DOCUMENTS'||k==='TEACHER REVIEWS'||k==='SUPERVISOR REVIEWS'||k==='PUBLICATION & IMPACT')card.hidden=true;
    if(k==='PROJECT BRIEF'||card.querySelector('form[data-admin-brief]')){
      card.id='ll-admin-section-brief';
      const label=card.querySelector<HTMLElement>('.ll-admin-workspace-title span');if(label)label.textContent='PROMOTION BRIEF';
      const title=card.querySelector<HTMLElement>('.ll-admin-workspace-title h3');if(title)title.textContent='Define the campaign and the evidence expected.';
      const form=card.querySelector<HTMLFormElement>('form[data-admin-brief]');
      const deliverable=form?.querySelector<HTMLInputElement>('input[name="deliverable"]');
      if(deliverable&&(!deliverable.value||/word|docx/i.test(deliverable.value)))deliverable.value='Completed promotion actions with clear campaign evidence, results/context, reflection and supervisor review when required.';
      const deliverableLabel=deliverable?.closest('label')?.querySelector<HTMLElement>(':scope > span');
      if(deliverableLabel)deliverableLabel.textContent='Evidence needed for completion';
    }
    if(k==='TASKS'||card.querySelector('form[data-admin-add-task]')){
      card.id='ll-admin-section-tasks';
      const title=card.querySelector<HTMLInputElement>('form[data-admin-add-task] input[name="title"]');if(title)title.placeholder='Carry out the first promotion action / add evidence';
      const instructions=card.querySelector<HTMLTextAreaElement>('form[data-admin-add-task] textarea[name="instructions"]');if(instructions)instructions.placeholder='State the channel, audience, anti-spam or permission expectations, evidence to save and any result to record.';
    }
    if(k==='REVISION REQUESTS'||card.querySelector('form[data-admin-add-revision]')){
      card.id='ll-admin-section-revisions';
      const label=card.querySelector<HTMLElement>('.ll-admin-workspace-title span');if(label)label.textContent='FEEDBACK / CHANGES';
      const title=card.querySelector<HTMLElement>('.ll-admin-workspace-title h3');if(title)title.textContent='Campaign feedback and evidence requests';
      const form=card.querySelector<HTMLFormElement>('form[data-admin-add-revision]');
      const request=form?.querySelector<HTMLInputElement>('input[name="title"]');if(request)request.placeholder='Add clearer proof of the Discord post';
      const details=form?.querySelector<HTMLTextAreaElement>('textarea[name="details"]');if(details)details.placeholder='Explain what should change, be clarified or be added to the campaign evidence.';
      const checklist=form?.querySelector<HTMLTextAreaElement>('textarea[name="checklist"]');if(checklist)checklist.placeholder='Add the post link or screenshot\nExplain when and where it was shared\nRecord reactions, reach or useful feedback';
    }
    if(k==='TEACHER REVIEWER'||k==='CAS SUPERVISOR'||card.querySelector('form[data-admin-assign-teacher]')){
      card.id='ll-admin-section-reviewer';
      const label=card.querySelector<HTMLElement>('.ll-admin-workspace-title span');if(label)label.textContent='CAS SUPERVISOR';
      const title=card.querySelector<HTMLElement>('.ll-admin-workspace-title h3');if(title)title.textContent='Assign the student’s accepted CAS supervisor / coordinator';
    }
  });
  const review=modal.querySelector<HTMLElement>('[data-admin-promotion-final],[data-admin-promotion-context-state]');
  if(review)review.id='ll-admin-section-promotion-review';
  const nav=modal.querySelector<HTMLElement>('[data-admin-v3-workspace-nav]');
  nav?.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
    const target=button.dataset.adminV3JumpSection||'';
    if(['ll-admin-section-documents','ll-admin-section-reviews','ll-admin-section-publication'].includes(target))button.hidden=true;
  });
  const navButtons=nav?.querySelector<HTMLElement>(':scope > div:last-child');
  if(navButtons){
    const entries=[['ll-admin-section-readiness','Overview'],['ll-admin-section-brief','Campaign brief'],['ll-admin-section-tasks','Tasks'],['ll-admin-section-revisions','Feedback'],['ll-admin-section-reviewer','Supervisor'],['ll-admin-section-activity','Activity'],['ll-admin-section-promotion-review','Campaign review']];
    entries.forEach(([target,label])=>{
      if(!modal.querySelector(`#${target}`))return;
      let button=navButtons.querySelector<HTMLButtonElement>(`[data-admin-v3-jump-section="${target}"]`);
      if(!button){button=document.createElement('button');button.type='button';button.dataset.adminV3JumpSection=target;navButtons.appendChild(button)}
      button.hidden=false;button.textContent=label;navButtons.appendChild(button);
    });
  }
}

function apply(){
  fixPromotionEvidenceButton();
  if(route()==='contribute')fixReviewerScope();
  if(route()==='admin-contributors')fixAdminPromotionCards();
}
// Keep Promotion labels authoritative even while the generic admin workspace rebuilds
// its cards and navigation.
function schedule(delay=100){if(timer)return;timer=window.setTimeout(()=>{timer=0;apply()},delay)}

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
