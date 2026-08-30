const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SUBMIT_COOLDOWN_KEY='litlabContributorLastSentAt';
const COOLDOWN_MS=30_000;
const REQUEST_TIMEOUT_MS=12_000;

type ApplicantType='student'|'teacher';
type StoredSession={access_token?:string};
type JwtPayload={sub?:string;email?:string};
type RoleState={role?:ApplicantType|null;is_admin?:boolean;needs_choice?:boolean;has_conflict?:boolean};
type ApiError={message?:string;details?:string;hint?:string};
type Field=HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement;

let submitting=false;

function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function jwt():JwtPayload|null{
  try{
    const part=token().split('.')[1];if(!part)return null;
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return JSON.parse(atob(normalized)) as JwtPayload;
  }catch{return null}
}
function userId(){return jwt()?.sub||''}
function email(){return jwt()?.email||''}
function clean(data:FormData,key:string){return String(data.get(key)||'').trim()||null}
function status(form:HTMLFormElement){return form.querySelector<HTMLElement>('#ll-contributor-status')}
function setStatus(form:HTMLFormElement,text:string,state=''){const box=status(form);if(box){box.textContent=text;box.dataset.state=state}}

async function requestWithTimeout(input:string,init:RequestInit){
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{return await fetch(input,{...init,signal:controller.signal})}
  catch(error){
    if(error instanceof DOMException&&error.name==='AbortError')throw new Error('LitLab did not receive a response in time. Please try submitting again.');
    throw error;
  }finally{window.clearTimeout(timeout)}
}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const response=await requestWithTimeout(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
    body:JSON.stringify(body)
  });
  if(!response.ok){
    let message='';try{const data=await response.json() as ApiError;message=data.message||data.details||data.hint||''}catch{}
    throw new Error(message||`${name} failed (${response.status})`);
  }
  const text=await response.text();return (text?JSON.parse(text):null) as T;
}

function selectedRole(form:HTMLFormElement):ApplicantType|null{
  const value=form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value;
  return value==='student'||value==='teacher'?value:null;
}

function forceRole(form:HTMLFormElement,role:ApplicantType){
  const input=form.querySelector<HTMLInputElement>(`input[name="applicant_type"][value="${role}"]`);
  if(input&&!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
  form.dataset.accountContributorRole=role;
  const root=document.getElementById('ll-contributor-root');if(root)root.dataset.contributorAccountRole=role;
}

async function resolveOrSetRole(form:HTMLFormElement):Promise<ApplicantType>{
  let state=await rpc<RoleState>('get_my_litlab_contributor_account_role');
  if(state?.is_admin)throw new Error('Admin accounts do not submit contributor applications.');
  if(state?.has_conflict)throw new Error('This account has a contributor-role conflict. LitLab admin must resolve it before you can apply.');

  let role=state?.role;
  if(role!=='student'&&role!=='teacher'){
    const chosen=selectedRole(form);
    if(!chosen)throw new Error('Choose Student contributor or Teacher / mentor before submitting.');
    setStatus(form,`Saving this account as ${chosen==='teacher'?'Teacher / mentor':'Student contributor'}…`,'ready');
    state=await rpc<RoleState>('set_my_litlab_contributor_account_role',{p_role:chosen});
    role=state?.role;
    if(role!=='student'&&role!=='teacher')throw new Error('LitLab could not save your contributor account type. Please try again.');
    window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:state}));
  }

  forceRole(form,role);
  return role;
}

function isActive(field:Field){return !field.disabled&&!field.closest('[hidden]')&&!field.form?.hidden}
function fieldValid(field:Field){
  if(!isActive(field))return true;
  if(field instanceof HTMLInputElement&&(field.type==='checkbox'||field.type==='radio')){
    if(!field.required)return true;
    if(field.type==='radio')return Boolean(field.form?.querySelector<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]:checked`));
    return field.checked;
  }
  const value=field.value.trim();
  if(field.required&&!value)return false;
  const min=Number(field.getAttribute('minlength')||0);
  if(field.required&&min&&value.length<min)return false;
  return field.checkValidity();
}
function activeFields(form:HTMLFormElement){
  return Array.from(form.querySelectorAll<Field>('input,textarea,select')).filter(isActive);
}
function activeInvalidFields(form:HTMLFormElement){return activeFields(form).filter(field=>!fieldValid(field))}
function invalidFieldName(field:Field|null){
  if(!field)return '';
  return field.closest('label')?.querySelector<HTMLElement>(':scope > span')?.textContent?.replace(/\s+/g,' ').trim()||field.name.replace(/_/g,' ');
}

function renderPending(form:HTMLFormElement){
  form.innerHTML='<div class="ll-contrib-thanks ll-contrib-pending"><span>✓</span><div class="ll-contrib-pending-badge">PENDING ADMIN REVIEW</div><h3>Your application has been submitted.</h3><p>Your application is saved to your LitLab account and is now waiting for LitLab admin review.</p><p class="ll-contrib-thanks-note"><b>What happens next:</b> review decisions, revision requests and next-step instructions stay attached to your LitLab account.</p><button type="button" data-contrib-home>Back to LitLab</button></div>';
  form.querySelector<HTMLButtonElement>('[data-contrib-home]')?.addEventListener('click',()=>{location.hash='home'});
  window.dispatchEvent(new CustomEvent('litlab:contributor-submitted'));
}

async function directSubmit(form:HTMLFormElement,button:HTMLButtonElement){
  if(submitting||button.dataset.submitting==='true')return;
  const auth=token();const uid=userId();
  if(!auth||!uid){setStatus(form,'Sign in to LitLab before submitting your contributor application.','error');return}

  submitting=true;
  button.disabled=true;button.dataset.submitting='true';button.textContent='Checking…';
  setStatus(form,'Checking your contributor account…','ready');
  try{
    const role=await resolveOrSetRole(form);

    // Role changes alter which controls are relevant. Match the form UI's validation semantics:
    // required controls inside hidden Student/Teacher/CAS sections must not block submission.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    const invalid=activeInvalidFields(form);
    if(invalid.length){
      const first=invalid[0];
      first.focus({preventScroll:true});
      first.scrollIntoView({behavior:'smooth',block:'center'});
      throw new Error(`Please complete the required field: ${invalidFieldName(first)}.`);
    }

    const last=Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY)||0);
    if(Date.now()-last<COOLDOWN_MS){renderPending(form);return}

    const data=new FormData(form);
    if(String(data.get('website')||'').trim())throw new Error('This application could not be submitted. Please reload the page and try again.');
    const payload={
      applicant_type:role,
      full_name:String(data.get('full_name')||'').trim(),
      email:email()||String(data.get('email')||'').trim(),
      school:clean(data,'school'),country:clean(data,'country'),
      dp_year:role==='student'?clean(data,'dp_year'):null,
      subject_taught:role==='teacher'?clean(data,'subject_taught'):null,
      cas_intent:role==='student'?clean(data,'cas_intent'):null,
      student_supervision:role==='student'?clean(data,'student_supervision'):null,
      mentor_email:role==='student'?clean(data,'mentor_email'):null,
      mentee_email:role==='teacher'?clean(data,'mentee_email'):null,
      contribution_type:role==='teacher'?'teacher-review':String(data.get('contribution_type')||'content'),
      topics:String(data.get('topics')||'').trim(),
      contribution_idea:String(data.get('contribution_idea')||'').trim(),
      motivation:String(data.get('motivation')||'').trim(),
      experience:clean(data,'experience'),availability:clean(data,'availability'),
      cas_goal:role==='student'?clean(data,'cas_goal'):null,
      cas_impact:role==='student'?clean(data,'cas_impact'):null,
      cas_success:role==='student'?clean(data,'cas_success'):null,
      credit_preference:String(data.get('credit_preference')||'name'),
      source_page:`${location.pathname}${location.hash}`.slice(0,220),
      user_id:uid
    };

    button.textContent='Submitting…';
    setStatus(form,'Saving your application to your LitLab account…','ready');
    const response=await requestWithTimeout(`${SUPABASE_URL}/rest/v1/litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`,Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!response.ok){
      let message='';try{const result=await response.json() as ApiError;message=result.message||result.details||result.hint||''}catch{}
      throw new Error(message||`Contributor application failed (${response.status})`);
    }

    localStorage.setItem(SUBMIT_COOLDOWN_KEY,String(Date.now()));
    renderPending(form);
  }catch(error){
    const message=error instanceof Error?error.message:'We could not submit your application.';
    console.error('Direct contributor submission failed',error);
    setStatus(form,message.length<240?`Could not submit: ${message}`:'We could not submit your application. Make sure you are signed in and try again.','error');
  }finally{
    submitting=false;
    if(button.isConnected){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
  }
}

document.addEventListener('click',event=>{
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('#ll-contributor-form button[type="submit"]'):null;
  if(!button)return;
  const form=button.form;if(!form||form.id!=='ll-contributor-form')return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  void directSubmit(form,button);
},true);

document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form')return;
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(!button)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  void directSubmit(form,button);
},true);

document.documentElement.dataset.contributorSubmitOwnerReady='true';

export {};
