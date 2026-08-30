import './contributor-account-workflow.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';
const SUBMIT_COOLDOWN_KEY='litlabContributorLastSentAt';
const COOLDOWN_MS=30_000;
const REQUEST_TIMEOUT_MS=12_000;

type ApplicantType='student'|'teacher';
type StoredSession={access_token?:string};
type JwtPayload={sub?:string;email?:string;user_metadata?:{full_name?:string;name?:string}};
type RoleState={role?:ApplicantType|null;is_admin?:boolean;needs_choice?:boolean;has_conflict?:boolean};
type ApiError={message?:string;details?:string;hint?:string;code?:string};

let scanTimer=0;
let scanAttempts=0;
let submitting=false;

function session():StoredSession|null{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function accessToken(){return session()?.access_token||''}
function decodePayload():JwtPayload|null{
  try{
    const part=accessToken().split('.')[1];
    if(!part)return null;
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return JSON.parse(atob(normalized)) as JwtPayload;
  }catch{return null}
}
function userId(){return decodePayload()?.sub||''}
function accountEmail(){return decodePayload()?.email||''}
function accountName(){const meta=decodePayload()?.user_metadata;return meta?.full_name||meta?.name||''}
function signedIn(){return Boolean(accessToken()&&userId())}
function esc(value:string){return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=accessToken();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
      body:JSON.stringify(body),signal:controller.signal
    });
    if(!response.ok){
      let detail='';try{const data=await response.json() as ApiError;detail=data.message||data.details||data.hint||''}catch{}
      throw new Error(detail||`${name} failed (${response.status})`);
    }
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function signInToApply(){
  sessionStorage.setItem(RETURN_KEY,'#contribute');
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','google');
  authorize.searchParams.set('redirect_to',`${location.origin}${location.pathname}`);
  location.href=authorize.toString();
}

function accountGate(){
  const gate=document.createElement('div');
  gate.className='ll-contrib-account-gate';
  gate.dataset.contributorAccountGate='true';
  gate.innerHTML=`<span>ACCOUNT REQUIRED</span><h3>Sign in before you apply.</h3><p>Your contributor application, review status, private live chat and future updates are saved to your LitLab account. This lets LitLab notify you about review decisions and new messages when you sign in.</p><button type="button">Sign in with Google to apply</button><small>Your Google password is never shared with LitLab.</small>`;
  gate.querySelector('button')?.addEventListener('click',signInToApply);
  return gate;
}

function addRelationshipFields(form:HTMLFormElement){
  const student=form.querySelector<HTMLElement>('[data-student-fields]');
  if(student&&!student.querySelector('[data-student-supervision]')){
    const block=document.createElement('div');
    block.dataset.studentSupervision='true';
    block.className='ll-contrib-supervision-block';
    block.innerHTML=`<label><span>Will a teacher, CAS coordinator or mentor oversee your contribution?</span><select name="student_supervision" required><option value="">Select one</option><option value="yes">Yes — I already have someone overseeing it</option><option value="not_yet">Not yet — I plan to arrange someone</option><option value="no">No — not currently</option></select></label><label data-mentor-email hidden><span>Mentor / coordinator email</span><input type="email" name="mentor_email" maxlength="254" placeholder="mentor@school.edu"/><small>Use the email of the teacher, CAS coordinator or mentor overseeing this contribution.</small></label>`;
    student.appendChild(block);
  }

  const teacher=form.querySelector<HTMLElement>('[data-teacher-fields]');
  if(teacher&&!teacher.querySelector('[data-mentee-email]')){
    const label=document.createElement('label');
    label.dataset.menteeEmail='true';
    label.innerHTML='<span>Student you are mentoring — email</span><input type="email" name="mentee_email" maxlength="254" placeholder="student@example.com"/><small>Enter the email address of the student whose LitLab contribution you are mentoring or reviewing.</small>';
    teacher.appendChild(label);
  }
}

function setRequired<T extends HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(field:T|null,required:boolean){if(field)field.required=required}
function forceFormRole(form:HTMLFormElement,role:ApplicantType){
  const input=form.querySelector<HTMLInputElement>(`input[name="applicant_type"][value="${role}"]`);
  if(input&&!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
  form.dataset.accountContributorRole=role;
}
function applyRoleRequirements(form:HTMLFormElement,role:ApplicantType){
  addRelationshipFields(form);
  forceFormRole(form,role);
  const student=form.querySelector<HTMLElement>('[data-student-fields]');
  const teacher=form.querySelector<HTMLElement>('[data-teacher-fields]');
  const cas=form.querySelector<HTMLElement>('[data-cas-fields]');
  if(student)student.hidden=role!=='student';
  if(teacher)teacher.hidden=role!=='teacher';
  if(cas)cas.hidden=role!=='student';

  const contributionType=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]');
  if(contributionType){
    if(role==='teacher'){
      if(!contributionType.querySelector('option[value="teacher-review"]'))contributionType.innerHTML='<option value="teacher-review">Teacher review / mentoring</option>';
      contributionType.value='teacher-review';
    }else if(contributionType.value==='teacher-review'){
      contributionType.innerHTML='<option value="content">Write or improve content</option><option value="research">Research and source a topic</option><option value="review">Review / proofread content</option>';
      contributionType.value='content';
    }
  }

  const supervision=form.querySelector<HTMLSelectElement>('select[name="student_supervision"]');
  const supervisionValue=supervision?.value||'';
  const mentorWrap=form.querySelector<HTMLElement>('[data-mentor-email]');
  const mentor=form.querySelector<HTMLInputElement>('input[name="mentor_email"]');
  const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');
  const casIntent=form.querySelector<HTMLSelectElement>('select[name="cas_intent"]');
  const casIntentValue=casIntent?.value||'maybe';

  setRequired(form.querySelector<HTMLSelectElement>('select[name="dp_year"]'),role==='student');
  setRequired(casIntent,role==='student');
  setRequired(form.querySelector<HTMLInputElement>('input[name="subject_taught"]'),role==='teacher');
  setRequired(supervision,role==='student');
  if(mentorWrap)mentorWrap.hidden=role!=='student'||supervisionValue==='no'||!supervisionValue;
  setRequired(mentor,role==='student'&&supervisionValue==='yes');
  setRequired(mentee,role==='teacher');

  const requireCas=role==='student'&&casIntentValue==='yes';
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_goal"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_impact"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_success"]'),requireCas);

  const casCheck=Array.from(form.querySelectorAll<HTMLLabelElement>('.ll-contrib-check')).find(label=>label.textContent?.includes('CAS approval'));
  const casCheckbox=casCheck?.querySelector<HTMLInputElement>('input[type="checkbox"]')||null;
  if(casCheck)casCheck.hidden=role==='teacher';
  if(casCheckbox)casCheckbox.required=role==='student';
}
function syncRelationshipRules(form:HTMLFormElement){
  const role=(form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student') as ApplicantType;
  applyRoleRequirements(form,role);
}

async function resolveAccountRole(form:HTMLFormElement,status:HTMLElement|null):Promise<ApplicantType|null>{
  try{
    const state=await rpc<RoleState>('get_my_litlab_contributor_account_role');
    if(state?.is_admin){if(status){status.textContent='Admin accounts do not submit contributor applications.';status.dataset.state='error'}return null}
    if(state?.has_conflict){if(status){status.textContent='This account has a contributor-role conflict. LitLab admin must resolve it before you can apply.';status.dataset.state='error'}return null}
    if(state?.role==='student'||state?.role==='teacher'){
      applyRoleRequirements(form,state.role);
      const root=document.getElementById('ll-contributor-root');if(root)root.dataset.contributorAccountRole=state.role;
      return state.role;
    }
    if(status){status.textContent='Choose Student contributor or Teacher / mentor for this account before submitting.';status.dataset.state='error'}
    window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:state||{role:null,needs_choice:true}}));
    return null;
  }catch(error){
    console.error('Contributor role check failed',error);
    if(status){status.textContent='We could not confirm your contributor account role. Check your connection and try again.';status.dataset.state='error'}
    return null;
  }
}

function addSignedInBanner(form:HTMLFormElement){
  if(form.previousElementSibling?.matches('[data-contributor-account-state]'))return;
  const state=document.createElement('div');
  state.dataset.contributorAccountState='true';
  state.className='ll-contrib-account-state';
  const email=accountEmail();
  state.innerHTML=`<span>✓</span><div><b>Signed in${email?` as ${esc(email)}`:''}</b><small>Your application, review result and private contributor chat will stay saved to this LitLab account.</small></div>`;
  form.before(state);
}

function prefillAccount(form:HTMLFormElement){
  const email=form.querySelector<HTMLInputElement>('input[name="email"]');
  const name=form.querySelector<HTMLInputElement>('input[name="full_name"]');
  if(email&&accountEmail()){
    email.value=accountEmail();
    email.readOnly=true;
    email.title='Contributor applications use the email on your signed-in LitLab account.';
  }
  if(name&&!name.value&&accountName())name.value=accountName();
}

function clean(data:FormData,key:string){return String(data.get(key)||'').trim()||null}
function invalidFieldName(form:HTMLFormElement){
  const field=Array.from(form.elements).find(control=>(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement||control instanceof HTMLSelectElement)&&!control.checkValidity());
  if(!(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement))return '';
  const label=field.closest('label')?.querySelector<HTMLElement>(':scope > span')?.textContent?.replace(/\s+/g,' ').trim();
  return label||field.name.replace(/_/g,' ');
}

async function submitAccountApplication(form:HTMLFormElement){
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(submitting||button?.dataset.submitting==='true')return;
  if(!signedIn()){
    if(status){status.textContent='Sign in to LitLab before submitting your contributor application.';status.dataset.state='error'}
    signInToApply();
    return;
  }

  submitting=true;
  if(button){button.disabled=true;button.dataset.submitting='true';button.textContent='Checking…'}
  if(status){status.textContent='Checking your contributor account…';status.dataset.state='ready'}

  const applicantType=await resolveAccountRole(form,status);
  if(!applicantType){
    submitting=false;
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
    return;
  }

  applyRoleRequirements(form,applicantType);
  if(!form.checkValidity()){
    const fieldName=invalidFieldName(form);
    form.reportValidity();
    if(status){status.textContent=fieldName?`Please complete the required field: ${fieldName}.`:'Please complete every required field before submitting.';status.dataset.state='error'}
    submitting=false;
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
    return;
  }

  const last=Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY)||0);
  if(Date.now()-last<COOLDOWN_MS){
    if(status){status.textContent='Your application was already submitted. It is pending review.';status.dataset.state='success'}
    submitting=false;
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
    return;
  }

  const data=new FormData(form);
  if(String(data.get('website')||'').trim()){
    submitting=false;
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
    return;
  }
  const payload={
    applicant_type:applicantType,
    full_name:String(data.get('full_name')||'').trim(),
    email:accountEmail()||String(data.get('email')||'').trim(),
    school:clean(data,'school'),country:clean(data,'country'),
    dp_year:applicantType==='student'?clean(data,'dp_year'):null,
    subject_taught:applicantType==='teacher'?clean(data,'subject_taught'):null,
    cas_intent:applicantType==='student'?clean(data,'cas_intent'):null,
    student_supervision:applicantType==='student'?clean(data,'student_supervision'):null,
    mentor_email:applicantType==='student'?clean(data,'mentor_email'):null,
    mentee_email:applicantType==='teacher'?clean(data,'mentee_email'):null,
    contribution_type:applicantType==='teacher'?'teacher-review':String(data.get('contribution_type')||'content'),
    topics:String(data.get('topics')||'').trim(),
    contribution_idea:String(data.get('contribution_idea')||'').trim(),
    motivation:String(data.get('motivation')||'').trim(),
    experience:clean(data,'experience'),availability:clean(data,'availability'),
    cas_goal:applicantType==='student'?clean(data,'cas_goal'):null,
    cas_impact:applicantType==='student'?clean(data,'cas_impact'):null,
    cas_success:applicantType==='student'?clean(data,'cas_success'):null,
    credit_preference:String(data.get('credit_preference')||'name'),
    source_page:`${location.pathname}${location.hash}`.slice(0,220),
    user_id:userId()
  };

  if(button)button.textContent='Submitting…';
  if(status){status.textContent='Saving your application to your LitLab account…';status.dataset.state='ready'}
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${accessToken()}`,Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!response.ok){
      let apiMessage='';try{const data=await response.json() as ApiError;apiMessage=data.message||data.details||data.hint||''}catch{}
      throw new Error(apiMessage||`Contributor application failed (${response.status})`);
    }
    localStorage.setItem(SUBMIT_COOLDOWN_KEY,String(Date.now()));
    form.innerHTML=`<div class="ll-contrib-thanks ll-contrib-pending"><span>✓</span><div class="ll-contrib-pending-badge">PENDING REVIEW</div><h3>Your application has been submitted.</h3><p>LitLab will review your application before anything is approved. Your application is now saved to your signed-in account.</p><p class="ll-contrib-thanks-note"><b>What happens next:</b> if LitLab needs more information, requests revisions, accepts your application or has next-step instructions, those details can be discussed in your private <b>Live chat with LitLab</b>. If the LitLab team sends you a new message, you’ll receive an in-site notification while signed in, including when you sign back in later.</p><button type="button" data-contrib-home>Back to LitLab</button></div>`;
    form.querySelector<HTMLButtonElement>('[data-contrib-home]')?.addEventListener('click',()=>{location.hash='home'});
    window.dispatchEvent(new CustomEvent('litlab:contributor-submitted'));
  }catch(error){
    console.error(error);
    const message=error instanceof Error?error.message:'';
    if(status){status.textContent=message&&message.length<240?`We could not submit your application: ${message}`:'We could not submit your application. Make sure you are signed in and try again.';status.dataset.state='error'}
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
  }finally{submitting=false}
}

function wireForm(form:HTMLFormElement){
  const state=signedIn()?'signed-in':'signed-out';
  addRelationshipFields(form);
  syncRelationshipRules(form);

  if(form.dataset.accountListeners!=='true'){
    form.dataset.accountListeners='true';
    form.addEventListener('change',()=>syncRelationshipRules(form));
  }

  if(form.dataset.accountState===state)return;
  form.dataset.accountState=state;

  if(!signedIn()){
    form.hidden=true;
    document.querySelector('[data-contributor-account-state]')?.remove();
    if(!form.previousElementSibling?.matches('[data-contributor-account-gate]'))form.before(accountGate());
    return;
  }

  form.hidden=false;
  document.querySelector('[data-contributor-account-gate]')?.remove();
  addSignedInBanner(form);
  prefillAccount(form);
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(button&&button.dataset.submitting!=='true')button.disabled=false;
}

function clearScanTimer(){window.clearTimeout(scanTimer);scanTimer=0}
function scan(){
  clearScanTimer();
  if(route()!=='contribute')return;
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');
  if(form){scanAttempts=0;wireForm(form);return}
  if(scanAttempts>=20)return;
  scanAttempts+=1;
  scanTimer=window.setTimeout(scan,100);
}

// The visible Submit application button owns the action directly. This prevents another capture
// listener, native constraint-validation timing, or a stale role cache from swallowing the click
// before the signed-in submission flow gets a chance to run.
document.addEventListener('click',event=>{
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('#ll-contributor-form button[type="submit"]'):null;
  if(!button||button.dataset.submitting==='true')return;
  const form=button.form;if(!form||form.id!=='ll-contributor-form')return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  void submitAccountApplication(form);
},true);

// Keep keyboard/assistive submit working too. Stop the legacy anonymous handler before it can run.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form')return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  void submitAccountApplication(form);
},true);

window.addEventListener('hashchange',()=>{scanAttempts=0;requestAnimationFrame(scan)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){scanAttempts=0;requestAnimationFrame(scan)}});
window.addEventListener('focus',()=>{if(route()==='contribute'){scanAttempts=0;requestAnimationFrame(scan)}});

function start(){scanAttempts=0;scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
