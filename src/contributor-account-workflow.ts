import './contributor-account-workflow.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SESSION_KEY='litlabSupabaseSession';
const RETURN_KEY='litlabAuthReturnHash';

type ApplicantType='student'|'teacher';
type StoredSession={access_token?:string};
type JwtPayload={sub?:string;email?:string;user_metadata?:{full_name?:string;name?:string}};

let scanTimer=0;
let scanAttempts=0;

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
function applyRoleRequirements(form:HTMLFormElement,role:ApplicantType){
  addRelationshipFields(form);
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

function selectedRole(form:HTMLFormElement):ApplicantType{
  return form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value==='teacher'?'teacher':'student';
}
function syncRelationshipRules(form:HTMLFormElement){applyRoleRequirements(form,selectedRole(form))}

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

function wireForm(form:HTMLFormElement){
  addRelationshipFields(form);
  syncRelationshipRules(form);

  if(form.dataset.accountListeners!=='true'){
    form.dataset.accountListeners='true';
    form.addEventListener('change',()=>syncRelationshipRules(form));
  }

  if(!signedIn()){
    form.hidden=true;
    form.dataset.accountState='signed-out';
    document.querySelector('[data-contributor-account-state]')?.remove();
    if(!form.previousElementSibling?.matches('[data-contributor-account-gate]'))form.before(accountGate());
    return;
  }

  form.dataset.accountState='signed-in';
  document.querySelector('[data-contributor-account-gate]')?.remove();
  addSignedInBanner(form);
  prefillAccount(form);

  // Do not override contributor-account-role's visibility decision. An account with no saved
  // Student/Teacher role must complete the role choice first; that module will reveal the form.
  const rootRole=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole;
  if(rootRole==='student'||rootRole==='teacher')form.hidden=false;
  else if(rootRole==='unselected'||rootRole==='conflict'||rootRole==='admin')form.hidden=true;

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

window.addEventListener('hashchange',()=>{scanAttempts=0;requestAnimationFrame(scan)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){scanAttempts=0;requestAnimationFrame(scan)}});
window.addEventListener('focus',()=>{if(route()==='contribute'){scanAttempts=0;requestAnimationFrame(scan)}});
window.addEventListener('litlab:contributor-account-role',()=>{scanAttempts=0;requestAnimationFrame(scan)});

function start(){scanAttempts=0;scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
