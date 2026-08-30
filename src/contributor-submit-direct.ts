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

let scheduled=false;
let submitting=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
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

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
      body:JSON.stringify(body),signal:controller.signal
    });
    if(!response.ok){
      let message='';try{const data=await response.json() as ApiError;message=data.message||data.details||data.hint||''}catch{}
      throw new Error(message||`${name} failed (${response.status})`);
    }
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function forceRole(form:HTMLFormElement,role:ApplicantType){
  const input=form.querySelector<HTMLInputElement>(`input[name="applicant_type"][value="${role}"]`);
  if(input&&!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
  const root=document.getElementById('ll-contributor-root');if(root)root.dataset.contributorAccountRole=role;
}

function invalidField(form:HTMLFormElement){
  const control=Array.from(form.elements).find(item=>(item instanceof HTMLInputElement||item instanceof HTMLTextAreaElement||item instanceof HTMLSelectElement)&&!item.checkValidity());
  if(!(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement||control instanceof HTMLSelectElement))return '';
  return control.closest('label')?.querySelector<HTMLElement>(':scope > span')?.textContent?.replace(/\s+/g,' ').trim()||control.name.replace(/_/g,' ');
}

async function directSubmit(form:HTMLFormElement,button:HTMLButtonElement){
  if(submitting||button.dataset.submitting==='true')return;
  const auth=token();const uid=userId();
  if(!auth||!uid){setStatus(form,'Sign in to LitLab before submitting your contributor application.','error');return}

  submitting=true;
  button.disabled=true;button.dataset.submitting='true';button.textContent='Checking…';
  setStatus(form,'Checking your contributor account…','ready');
  try{
    const roleState=await rpc<RoleState>('get_my_litlab_contributor_account_role');
    if(roleState?.is_admin)throw new Error('Admin accounts do not submit contributor applications.');
    if(roleState?.has_conflict)throw new Error('This account has a contributor-role conflict. LitLab admin must resolve it before you can apply.');
    const role=roleState?.role;
    if(role!=='student'&&role!=='teacher')throw new Error('Choose Student contributor or Teacher / mentor for this account before submitting.');
    forceRole(form,role);

    // Let the existing role/validation modules apply their conditional fields before the final check.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    if(!form.checkValidity()){
      const field=invalidField(form);form.reportValidity();
      throw new Error(field?`Please complete the required field: ${field}.`:'Please complete every required field before submitting.');
    }

    const last=Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY)||0);
    if(Date.now()-last<COOLDOWN_MS){setStatus(form,'Your application was already submitted. It is pending review.','success');return}

    const data=new FormData(form);
    if(String(data.get('website')||'').trim())return;
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

    button.textContent='Submitting…';setStatus(form,'Saving your application to your LitLab account…','ready');
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_contributor_applications`,{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`,Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!response.ok){
      let message='';try{const result=await response.json() as ApiError;message=result.message||result.details||result.hint||''}catch{}
      throw new Error(message||`Contributor application failed (${response.status})`);
    }

    localStorage.setItem(SUBMIT_COOLDOWN_KEY,String(Date.now()));
    form.innerHTML='<div class="ll-contrib-thanks ll-contrib-pending"><span>✓</span><div class="ll-contrib-pending-badge">PENDING REVIEW</div><h3>Your application has been submitted.</h3><p>LitLab will review your application before anything is approved. Your application is now saved to your signed-in account.</p><p class="ll-contrib-thanks-note"><b>What happens next:</b> review decisions and next-step instructions stay attached to your LitLab account.</p><button type="button" data-contrib-home>Back to LitLab</button></div>';
    form.querySelector<HTMLButtonElement>('[data-contrib-home]')?.addEventListener('click',()=>{location.hash='home'});
    window.dispatchEvent(new CustomEvent('litlab:contributor-submitted'));
  }catch(error){
    const message=error instanceof Error?error.message:'We could not submit your application.';
    console.error('Direct contributor submission failed',error);
    setStatus(form,message.length<240?message:'We could not submit your application. Make sure you are signed in and try again.','error');
  }finally{
    submitting=false;
    if(button.isConnected){button.disabled=false;button.dataset.submitting='false';button.textContent='Submit application'}
  }
}

function wire(){
  scheduled=false;if(route()!=='contribute')return;
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');
  const button=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if(!form||!button||button.dataset.directSubmitWired==='true')return;
  button.dataset.directSubmitWired='true';
  button.addEventListener('click',event=>{
    if(button.dataset.submitting==='true')return;
    event.preventDefault();event.stopPropagation();
    void directSubmit(form,button);
  });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(wire)}

new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('litlab:contributor-account-role',schedule);
window.addEventListener('litlab:open-contributor-application',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
