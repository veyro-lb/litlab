import './contributor-review-workspace-experience.css';

type ReviewContext='academic'|'cas'|'combined';

type StepKey='rubric'|'feedback'|'decision'|'confirm';

const STEP_COPY:Record<ReviewContext,{rubric:[string,string];feedback:[string,string];decision:[string,string]}>={
  cas:{
    rubric:['Score the CAS evidence','Review one criterion at a time. Use the evidence you actually saw, not the DP English academic quality.'],
    feedback:['Give useful CAS feedback','Explain what is working, what evidence or reflection is missing, and the exact next steps for the student.'],
    decision:['Make the CAS decision','Choose whether the CAS evidence needs changes or is ready to move to LitLab admin.']
  },
  academic:{
    rubric:['Score the academic review','Review one academic criterion at a time against the current DOCX version.'],
    feedback:['Give useful academic feedback','Name the strongest features, the most important revisions, and a concise overall academic judgment.'],
    decision:['Make the academic decision','Choose whether this version needs academic changes or is ready to move to LitLab admin.']
  },
  combined:{
    rubric:['Score both review perspectives','Use each criterion only where you genuinely reviewed both the academic and CAS dimensions.'],
    feedback:['Separate the two perspectives clearly','Make it obvious which comments concern academic quality and which concern the CAS process or evidence.'],
    decision:['Make the combined decision','Approve only when you completed both perspectives for this exact version.']
  }
};

let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function getContext(form:HTMLFormElement):ReviewContext{
  const value=form.querySelector<HTMLInputElement|HTMLSelectElement>('[name="review_context"]')?.value;
  return value==='cas'||value==='combined'||value==='academic'?value:'academic';
}
function esc(value:string){return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

function sectionHead(kicker:string,title:string,copy:string){
  return `<header class="ll-review-section-head"><span>${esc(kicker)}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div></header>`;
}

function ensureSectionHeads(form:HTMLFormElement,ctx:ReviewContext){
  const copy=STEP_COPY[ctx];
  const rubric=form.querySelector<HTMLElement>('.ll-role-review-grid');
  if(rubric){
    rubric.dataset.reviewStep='rubric';
    let head=rubric.querySelector<HTMLElement>(':scope > .ll-review-section-head');
    if(!head){rubric.insertAdjacentHTML('afterbegin',sectionHead('STEP 1',...copy.rubric));head=rubric.querySelector(':scope > .ll-review-section-head')}
    else head.outerHTML=sectionHead('STEP 1',...copy.rubric);
  }
  const feedback=form.querySelector<HTMLElement>('.ll-role-feedback-sections');
  if(feedback){
    feedback.dataset.reviewStep='feedback';
    let head=feedback.querySelector<HTMLElement>(':scope > .ll-review-section-head');
    if(!head){feedback.insertAdjacentHTML('afterbegin',sectionHead('STEP 2',...copy.feedback));head=feedback.querySelector(':scope > .ll-review-section-head')}
    else head.outerHTML=sectionHead('STEP 2',...copy.feedback);
  }
  const summary=form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]')?.closest<HTMLLabelElement>('label');
  if(summary){summary.classList.add('ll-review-summary-card');summary.dataset.reviewFeedbackSummary='true'}
  const decision=form.querySelector<HTMLSelectElement>('select[name="recommendation"]')?.closest<HTMLLabelElement>('label');
  if(decision){
    decision.classList.add('ll-review-decision-card');decision.dataset.reviewStep='decision';
    let head=decision.previousElementSibling as HTMLElement|null;
    if(!head?.matches('[data-review-decision-head]')){
      decision.insertAdjacentHTML('beforebegin',`<div class="ll-review-decision-head" data-review-decision-head>${sectionHead('STEP 3',...copy.decision)}</div>`);
    }else head.innerHTML=sectionHead('STEP 3',...copy.decision);
  }
  const declaration=form.querySelector<HTMLElement>('[data-role-specific-declaration]');
  if(declaration)declaration.dataset.reviewStep='confirm';
}

function navMarkup(){return `<nav class="ll-review-step-nav" data-review-step-nav aria-label="Review form steps"><button type="button" data-review-jump="rubric"><i>1</i><span><b>Rubric</b><small>Score the evidence</small></span></button><button type="button" data-review-jump="feedback"><i>2</i><span><b>Feedback</b><small>Explain your review</small></span></button><button type="button" data-review-jump="decision"><i>3</i><span><b>Decision</b><small>Choose the outcome</small></span></button><button type="button" data-review-jump="confirm"><i>4</i><span><b>Confirm</b><small>Verify & submit</small></span></button></nav>`}

function ensureNav(form:HTMLFormElement){
  if(form.querySelector('[data-review-step-nav]'))return;
  const intro=form.querySelector('.ll-role-review-intro');
  if(!intro)return;
  intro.insertAdjacentHTML('afterend',navMarkup());
  form.querySelectorAll<HTMLButtonElement>('[data-review-jump]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.reviewJump as StepKey;
    const target=form.querySelector<HTMLElement>(`[data-review-step="${key}"]`);
    target?.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(()=>target?.querySelector<HTMLElement>('select,textarea,input,button')?.focus({preventScroll:true}),380);
  }));
}

function scoreComplete(form:HTMLFormElement){return ['accuracy','clarity','dp_relevance','originality','sources'].every(name=>Boolean(form.querySelector<HTMLSelectElement>(`select[name="${name}"]`)?.value))}
function feedbackComplete(form:HTMLFormElement){return (form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]')?.value.trim().length||0)>=10}
function decisionComplete(form:HTMLFormElement){return Boolean(form.querySelector<HTMLSelectElement>('select[name="recommendation"]')?.value)}
function confirmComplete(form:HTMLFormElement){return Boolean(form.querySelector<HTMLInputElement>('input[name="role_scope_confirmation"]')?.checked)}

function updateProgress(form:HTMLFormElement){
  const complete:Record<StepKey,boolean>={rubric:scoreComplete(form),feedback:feedbackComplete(form),decision:decisionComplete(form),confirm:confirmComplete(form)};
  const order:StepKey[]=['rubric','feedback','decision','confirm'];
  const active=order.find(key=>!complete[key])||'confirm';
  order.forEach(key=>{
    const button=form.querySelector<HTMLButtonElement>(`[data-review-jump="${key}"]`);if(!button)return;
    button.classList.toggle('is-complete',complete[key]);button.classList.toggle('is-active',key===active);button.setAttribute('aria-current',key===active?'step':'false');
  });
}

function enhance(form:HTMLFormElement){
  const ctx=getContext(form);
  form.classList.add('ll-review-experience');
  form.dataset.reviewExperienceContext=ctx;
  ensureNav(form);
  ensureSectionHeads(form,ctx);
  updateProgress(form);
}
function enhanceAll(){if(route()!=='contribute')return;document.querySelectorAll<HTMLFormElement>('form[data-role-aware-review]').forEach(enhance)}
function scan(){window.clearTimeout(timer);enhanceAll();if(route()==='contribute')timer=window.setTimeout(scan,450)}

document.addEventListener('input',event=>{const form=(event.target as Element|null)?.closest?.('form[data-role-aware-review]') as HTMLFormElement|null;if(form)updateProgress(form)},true);
document.addEventListener('change',event=>{const form=(event.target as Element|null)?.closest?.('form[data-role-aware-review]') as HTMLFormElement|null;if(!form)return;window.setTimeout(()=>enhance(form),20)},true);
for(const eventName of ['litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:reviewer-specialization-changed','litlab:contributor-account-role'])window.addEventListener(eventName,()=>setTimeout(scan,80));
window.addEventListener('hashchange',()=>setTimeout(scan,0));
window.addEventListener('focus',()=>setTimeout(scan,0));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
