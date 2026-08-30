import './contributor-reviewer-specialization.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type ReviewerSpecialization='english_teacher'|'cas_supervisor'|'both';
type AccountState={
  role:'student'|'teacher'|null;
  reviewer_specialization?:ReviewerSpecialization|null;
  reviewer_needs_choice?:boolean;
  is_admin?:boolean;
  needs_choice?:boolean;
  has_conflict?:boolean;
};

type SpecCopy={name:string;kicker:string;title:string;description:string;applicationTitle:string;applicationHeading:string;applicationCopy:string;detailLabel:string;detailHelp:string;detailPlaceholder:string;subjectPrefix:string;scope:string;steps:[string,string][]};

const COPY:Record<ReviewerSpecialization,SpecCopy>={
  english_teacher:{
    name:'English / Language & Literature Teacher',
    kicker:'ENGLISH REVIEWER ACCOUNT',
    title:'Your reviewer account is set for academic DP English review.',
    description:'You review student contributions for academic accuracy, clarity, DP relevance, student ownership and responsible source use.',
    applicationTitle:'English teacher reviewer application',
    applicationHeading:'Apply as an English / Language & Literature reviewer.',
    applicationCopy:'Tell LitLab about your DP English teaching and reviewing background. Your reviewer role is already attached to this account.',
    detailLabel:'English teaching / reviewing background',
    detailHelp:'Describe the DP English course, texts, assessments or skills you are qualified to review.',
    detailPlaceholder:'e.g. DP English A: Language & Literature — Paper 1, IO, HL Essay',
    subjectPrefix:'English Teacher',
    scope:'Academic DP English review only. This role does not approve a student’s school CAS record.',
    steps:[['1. Review the latest DOCX','Check the student’s current version for academic DP English quality.'],['2. Give academic feedback','Score the academic rubric and give precise revision guidance without rewriting the student’s work.'],['3. Make the academic decision','Request changes or approve the academic review and send that version to LitLab admin.']]
  },
  cas_supervisor:{
    name:'CAS Supervisor / Coordinator',
    kicker:'CAS SUPERVISOR ACCOUNT',
    title:'Your reviewer account is set for CAS process and evidence review.',
    description:'You review student ownership, participation, initiative, reflection, evidence quality and the integrity of the CAS process—not DP English academic accuracy.',
    applicationTitle:'CAS Supervisor / Coordinator application',
    applicationHeading:'Apply as a CAS Supervisor / Coordinator reviewer.',
    applicationCopy:'Tell LitLab about your CAS coordination, advising or supervision experience. Academic DP English qualification questions are not part of this account path.',
    detailLabel:'CAS supervision background',
    detailHelp:'Describe your CAS coordinator, adviser or supervisor role and your experience reviewing student CAS evidence and reflections.',
    detailPlaceholder:'e.g. CAS Coordinator — 4 years supervising DP students',
    subjectPrefix:'CAS Supervisor',
    scope:'CAS process and evidence review only. Your approval does not certify DP English academic accuracy.',
    steps:[['1. Review the latest evidence','Open the current DOCX and the student’s relevant contribution evidence.'],['2. Review the CAS process','Check ownership, participation, initiative, reflection and evidence integrity.'],['3. Make the CAS decision','Request CAS changes or approve the CAS evidence and send the review to LitLab admin.']]
  },
  both:{
    name:'English Teacher + CAS Supervisor',
    kicker:'DUAL REVIEWER ACCOUNT',
    title:'Your reviewer account is set for both English and CAS review.',
    description:'You can review student work academically, as a CAS supervisor, or in both capacities. Each assigned review asks which perspective you are using.',
    applicationTitle:'English + CAS reviewer application',
    applicationHeading:'Apply as a dual English and CAS reviewer.',
    applicationCopy:'Tell LitLab about both your DP English teaching/review background and your CAS supervision role. Your account can use either review workspace.',
    detailLabel:'English + CAS reviewer background',
    detailHelp:'Briefly describe both your DP English teaching/review experience and your CAS supervision or coordination role.',
    detailPlaceholder:'e.g. DP English A teacher and CAS coordinator',
    subjectPrefix:'English + CAS',
    scope:'Choose Academic, CAS or Combined for each review so the evidence trail states exactly what you verified.',
    steps:[['1. Open the latest DOCX','Review the current version and identify the capacity in which you are reviewing it.'],['2. Choose the review perspective','Use Academic, CAS or Combined. The form and approval meaning change with that selection.'],['3. Decide within that scope','Approve only the perspective you actually reviewed; LitLab admin makes the final contribution decision.']]
  }
};

let state:AccountState|null=null;
let loading=false;
let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token||'')}catch{return ''}}
function root(){return document.getElementById('ll-contributor-root') as HTMLElement|null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body)});
  if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}
  const text=await response.text();return (text?JSON.parse(text):null) as T;
}

function specialization(){return state?.role==='teacher'?(state.reviewer_specialization||null):null}
function closeGate(){document.querySelector('[data-reviewer-specialization-modal]')?.remove();const host=root();if(host)host.inert=false;document.documentElement.classList.remove('ll-reviewer-specialization-required')}

function gateMarkup(){return `<div class="ll-reviewer-specialization-modal" data-reviewer-specialization-modal><section class="ll-reviewer-specialization-dialog" role="dialog" aria-modal="true" aria-labelledby="ll-reviewer-specialization-title"><span>FINISH TEACHER ACCOUNT SETUP</span><h2 id="ll-reviewer-specialization-title">What kind of LitLab reviewer are you?</h2><p>Your Teacher / Reviewer account already exists. Choose the reviewer role that matches your real responsibility. LitLab saves this choice to your account and uses it to show the correct application, dashboard, rubric and approval language.</p><div class="ll-reviewer-specialization-options"><button type="button" class="ll-reviewer-specialization-option" data-set-reviewer-specialization="english_teacher"><i>E</i><span><b>English / Language & Literature Teacher</b><small>I review academic DP English content, clarity, terminology, relevance, student ownership and source use.</small><em>Academic application • English review workspace • academic testimony</em></span></button><button type="button" class="ll-reviewer-specialization-option" data-set-reviewer-specialization="cas_supervisor"><i>C</i><span><b>CAS Supervisor / Coordinator</b><small>I review the student’s CAS process, participation, initiative, reflection, evidence and authenticity.</small><em>CAS application • CAS evidence workspace • CAS testimony</em></span></button><button type="button" class="ll-reviewer-specialization-option" data-set-reviewer-specialization="both"><i>+</i><span><b>Both English Teacher + CAS Supervisor</b><small>I genuinely hold both responsibilities and may review a student from either or both perspectives.</small><em>Dual application • perspective selector • both workspaces</em></span></button></div><div class="ll-reviewer-specialization-lock"><b>Choose the role you actually hold.</b><span>This becomes the specialization of this LitLab reviewer account. Contact LitLab if it ever needs to be corrected.</span></div><p class="ll-reviewer-specialization-status" data-reviewer-specialization-status role="status" aria-live="polite"></p></section></div>`}

function showGate(){
  if(document.querySelector('[data-reviewer-specialization-modal]'))return;
  const host=root();if(host)host.inert=true;
  document.documentElement.classList.add('ll-reviewer-specialization-required');
  document.body.insertAdjacentHTML('beforeend',gateMarkup());
  document.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(button=>button.addEventListener('click',()=>void chooseSpecialization(button.dataset.setReviewerSpecialization as ReviewerSpecialization,button)));
  document.querySelector<HTMLButtonElement>('[data-set-reviewer-specialization]')?.focus();
}

async function chooseSpecialization(value:ReviewerSpecialization,button:HTMLButtonElement){
  const status=document.querySelector<HTMLElement>('[data-reviewer-specialization-status]');
  document.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(item=>item.disabled=true);
  if(status){status.textContent=`Saving ${COPY[value].name}…`;status.dataset.state='ready'}
  try{
    state=await rpc<AccountState>('set_my_litlab_reviewer_specialization',{p_specialization:value});
    closeGate();
    applySpecialization();
    window.dispatchEvent(new CustomEvent('litlab:reviewer-specialization-changed',{detail:state}));
    window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:state}));
    document.querySelector('[data-reviewer-specialization-card]')?.scrollIntoView({block:'center',behavior:'smooth'});
  }catch(error){
    if(status){status.textContent=error instanceof Error?error.message:'Could not save reviewer role.';status.dataset.state='error'}
    document.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(item=>item.disabled=false);
    button.focus();
  }
}

function accountCard(copy:SpecCopy){
  const host=root();if(!host)return;
  const existing=host.querySelector<HTMLElement>('[data-account-role-summary]');
  if(existing){
    existing.classList.remove('is-teacher');existing.classList.add('is-teacher');
    existing.dataset.reviewerSpecialized='true';
    existing.innerHTML=`<div class="ll-account-role-icon">✓</div><div><span>${esc(copy.kicker)}</span><h2>${esc(copy.title)}</h2><p>${esc(copy.description)}</p><small>Account role: <b>Teacher / Reviewer</b> • Reviewer specialization: <b>${esc(copy.name)}</b></small></div>`;
  }
  let card=host.querySelector<HTMLElement>('[data-reviewer-specialization-card]');
  const apply=document.getElementById('contribute-apply');
  if(!card&&apply){card=document.createElement('section');card.className='ll-reviewer-specialization-card';card.dataset.reviewerSpecializationCard='true';apply.before(card)}
  if(card)card.innerHTML=`<span>REVIEWER SPECIALIZATION</span><h3>${esc(copy.name)}</h3><p>${esc(copy.scope)}</p><small>This specialization is saved to your LitLab account and determines the reviewer tools shown to you.</small>`;
}

function application(copy:SpecCopy,spec:ReviewerSpecialization){
  const host=root();if(!host)return;
  host.dataset.contributorReviewerSpecialization=spec;
  const apply=document.getElementById('contribute-apply');
  const head=apply?.querySelector<HTMLElement>('.ll-contrib-section-head');
  if(head){const span=head.querySelector('span');const h2=head.querySelector('h2');const p=head.querySelector('p');if(span)span.textContent=copy.applicationTitle;if(h2)h2.textContent=copy.applicationHeading;if(p)p.textContent=copy.applicationCopy}
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');if(!form)return;
  const teacher=form.querySelector<HTMLElement>('[data-teacher-fields]');if(!teacher)return;
  const roleSection=teacher.querySelector<HTMLElement>('[data-reviewer-role-section]');if(roleSection)roleSection.hidden=true;
  teacher.querySelectorAll<HTMLInputElement>('input[name="reviewer_role_choice"]').forEach(radio=>{radio.required=false;radio.checked=radio.value===spec});
  const detail=teacher.querySelector<HTMLInputElement>('input[name="reviewer_details"]');
  if(detail){detail.placeholder=copy.detailPlaceholder;const label=detail.closest('label');const title=label?.querySelector<HTMLElement>(':scope > span,span');if(title)title.textContent=copy.detailLabel;let help=label?.querySelector<HTMLElement>('[data-account-specialization-help]');if(!help&&label){help=document.createElement('small');help.dataset.accountSpecializationHelp='true';label.appendChild(help)}if(help)help.textContent=copy.detailHelp}
  const hidden=teacher.querySelector<HTMLInputElement>('input[name="subject_taught"]');
  if(hidden)hidden.value=`${copy.subjectPrefix} — ${detail?.value.trim()||copy.name}`;
  if(detail&&detail.dataset.specializationWired!=='true'){detail.dataset.specializationWired='true';detail.addEventListener('input',()=>{const current=COPY[specialization()||spec];const target=teacher.querySelector<HTMLInputElement>('input[name="subject_taught"]');if(target)target.value=`${current.subjectPrefix} — ${detail.value.trim()||current.name}`})}
}

function workspaceContext(form:HTMLFormElement,spec:ReviewerSpecialization){
  const current=form.querySelector<HTMLInputElement|HTMLSelectElement>('[name="review_context"]');
  if(spec==='both'){
    if(current instanceof HTMLSelectElement)return;
    const value=current?.value==='academic'||current?.value==='cas'||current?.value==='combined'?current.value:'combined';
    current?.remove();
    const criteria=form.querySelector<HTMLElement>('[data-role-criteria]');
    const label=document.createElement('label');label.dataset.accountReviewPerspective='true';label.innerHTML=`<span>Review perspective</span><select name="review_context" data-review-context><option value="academic">Academic DP English review</option><option value="cas">CAS supervision review</option><option value="combined">Combined academic + CAS review</option></select>`;
    const select=label.querySelector<HTMLSelectElement>('select')!;select.value=value==='academic'||value==='cas'||value==='combined'?value:'combined';
    if(criteria)criteria.before(label);else form.prepend(label);
    form.dataset.roleWorkspaceContext='';
    return;
  }
  const target=spec==='cas_supervisor'?'cas':'academic';
  if(current instanceof HTMLSelectElement){
    const wrapper=current.closest('label');const hidden=document.createElement('input');hidden.type='hidden';hidden.name='review_context';hidden.value=target;
    if(wrapper)wrapper.replaceWith(hidden);else current.replaceWith(hidden);
  }else if(current)current.value=target;
  else{const hidden=document.createElement('input');hidden.type='hidden';hidden.name='review_context';hidden.value=target;form.prepend(hidden)}
  form.dataset.roleWorkspaceContext='';
}

function workspace(copy:SpecCopy,spec:ReviewerSpecialization){
  const oldScope=document.querySelector<HTMLElement>('[data-role-scope-card]');if(oldScope)oldScope.hidden=true;
  const host=root();if(!host)return;
  let scope=host.querySelector<HTMLElement>('[data-account-specialization-scope]');
  const zone=host.querySelector<HTMLElement>('.ll-teacher-zone,[data-teacher-student-roster],[data-teacher-mentor-dashboard]');
  if(!scope&&zone){scope=document.createElement('article');scope.className='ll-role-scope-card';scope.dataset.accountSpecializationScope='true';zone.before(scope)}
  if(scope)scope.innerHTML=`<span>YOUR REVIEWER WORKSPACE</span><h3>${esc(copy.name)}</h3><p>${esc(copy.scope)}</p><div class="ll-role-scope-grid">${copy.steps.map(([title,text])=>`<article><b>${esc(title)}</b><small>${esc(text)}</small></article>`).join('')}</div>`;
  document.querySelectorAll<HTMLFormElement>('form[data-role-aware-review]').forEach(form=>workspaceContext(form,spec));
}

function applySpecialization(){
  const spec=specialization();if(!spec)return;
  const copy=COPY[spec];closeGate();accountCard(copy);application(copy,spec);workspace(copy,spec);
}

async function refresh(force=false){
  if(route()!=='contribute'||!token()||loading)return;
  if(state&&!force){if(state.role==='teacher'&&(state.reviewer_needs_choice||!state.reviewer_specialization))showGate();else applySpecialization();return}
  loading=true;
  try{
    state=await rpc<AccountState>('get_my_litlab_contributor_account_role');
    if(state.is_admin||state.role!=='teacher'){closeGate();return}
    if(state.reviewer_needs_choice||!state.reviewer_specialization)showGate();else applySpecialization();
  }catch(error){console.error('Reviewer specialization unavailable',error)}finally{loading=false}
}

function scan(){
  window.clearTimeout(timer);
  if(route()!=='contribute'){closeGate();return}
  if(token())void refresh();
  if(specialization())applySpecialization();
  timer=window.setTimeout(scan,300);
}

document.addEventListener('change',event=>{
  const target=event.target instanceof HTMLSelectElement?event.target:null;
  if(target?.name==='review_context'&&specialization()==='both')window.setTimeout(()=>{const form=target.closest<HTMLFormElement>('form[data-role-aware-review]');if(form)form.dataset.roleWorkspaceContext=''},0);
},true);

for(const eventName of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted'])window.addEventListener(eventName,()=>setTimeout(()=>void refresh(true),60));
window.addEventListener('hashchange',()=>{state=null;setTimeout(()=>void scan(),0)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){state=null;setTimeout(()=>void scan(),0)}});
window.addEventListener('focus',()=>void refresh(true));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void scan(),{once:true});else void scan();

export {};
