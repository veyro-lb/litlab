import './contributor-account-workflow.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';
const SUBMIT_COOLDOWN_KEY='litlabContributorLastSentAt';
const COOLDOWN_MS=30_000;

type ApplicantType='student'|'teacher';
type StoredSession={access_token?:string};
type JwtPayload={sub?:string;email?:string;user_metadata?:{full_name?:string;name?:string}};

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
  gate.innerHTML=`<span>ACCOUNT REQUIRED</span><h3>Sign in before you apply.</h3><p>Your contributor application, review status and future updates are saved to your LitLab account. This lets LitLab show you when your application is pending, needs review, is accepted or is rejected.</p><button type="button">Sign in with Google to apply</button><small>Your Google password is never shared with LitLab.</small>`;
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

function syncRelationshipRules(form:HTMLFormElement){
  const role=(form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student') as ApplicantType;
  const supervision=form.querySelector<HTMLSelectElement>('select[name="student_supervision"]');
  const mentorWrap=form.querySelector<HTMLElement>('[data-mentor-email]');
  const mentor=form.querySelector<HTMLInputElement>('input[name="mentor_email"]');
  const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');
  const supervisionValue=supervision?.value||'';

  if(supervision)supervision.required=role==='student';
  if(mentorWrap)mentorWrap.hidden=role!=='student'||supervisionValue==='no'||!supervisionValue;
  if(mentor)mentor.required=role==='student'&&supervisionValue==='yes';
  if(mentee)mentee.required=role==='teacher';
}

function addSignedInBanner(form:HTMLFormElement){
  if(form.previousElementSibling?.matches('[data-contributor-account-state]'))return;
  const state=document.createElement('div');
  state.dataset.contributorAccountState='true';
  state.className='ll-contrib-account-state';
  const email=accountEmail();
  state.innerHTML=`<span>✓</span><div><b>Signed in${email?` as ${esc(email)}`:''}</b><small>Your application and its review result will be saved to this LitLab account.</small></div>`;
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

async function submitAccountApplication(form:HTMLFormElement){
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(!signedIn()){
    if(status){status.textContent='Sign in to LitLab before submitting your contributor application.';status.dataset.state='error'}
    signInToApply();
    return;
  }
  syncRelationshipRules(form);
  if(!form.checkValidity()){
    form.reportValidity();
    if(status){status.textContent='Please complete every required field before submitting.';status.dataset.state='error'}
    return;
  }

  const last=Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY)||0);
  if(Date.now()-last<COOLDOWN_MS){if(status){status.textContent='Your application was already submitted. It is pending review.';status.dataset.state='success'}return}

  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;
  const applicantType=String(data.get('applicant_type')||'student') as ApplicantType;
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
    contribution_type:String(data.get('contribution_type')||'content'),
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

  if(button){button.disabled=true;button.dataset.submitting='true';button.textContent='Submitting…'}
  if(status){status.textContent='Saving your application to your LitLab account…';status.dataset.state='ready'}
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${accessToken()}`,Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!response.ok)throw new Error(`Contributor application failed (${response.status})`);
    localStorage.setItem(SUBMIT_COOLDOWN_KEY,String(Date.now()));
    form.innerHTML=`<div class="ll-contrib-thanks ll-contrib-pending"><span>✓</span><div class="ll-contrib-pending-badge">PENDING REVIEW</div><h3>Your application has been submitted.</h3><p>LitLab will review your application before anything is approved. Your application is now saved to your signed-in account.</p><p class="ll-contrib-thanks-note">When the LitLab team marks it as <b>Needs review</b>, <b>Accepted</b> or <b>Rejected</b>, you’ll see an update on LitLab while signed in.</p><button type="button" data-contrib-home>Back to LitLab</button></div>`;
    form.querySelector<HTMLButtonElement>('[data-contrib-home]')?.addEventListener('click',()=>{location.hash='home'});
    window.dispatchEvent(new CustomEvent('litlab:contributor-submitted'));
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not submit your application. Make sure you are signed in and try again.';status.dataset.state='error'}
    if(button){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
  }
}

function wireForm(form:HTMLFormElement){
  if(form.dataset.accountWorkflow==='true')return;
  form.dataset.accountWorkflow='true';
  addRelationshipFields(form);
  syncRelationshipRules(form);

  if(!signedIn()){
    form.hidden=true;
    if(!form.previousElementSibling?.matches('[data-contributor-account-gate]'))form.before(accountGate());
    return;
  }

  form.hidden=false;
  document.querySelector('[data-contributor-account-gate]')?.remove();
  addSignedInBanner(form);
  prefillAccount(form);
  form.addEventListener('change',()=>syncRelationshipRules(form));
}

function scan(){document.querySelectorAll<HTMLFormElement>('#ll-contributor-form').forEach(wireForm)}

// Own contributor submission flow. Stop the legacy anonymous handler before it can run.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form')return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  void submitAccountApplication(form);
},true);

new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(scan));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
