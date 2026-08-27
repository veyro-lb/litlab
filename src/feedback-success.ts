import './feedback-success.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const FEEDBACK_COOLDOWN_KEY='litlabFeedbackLastSentAt';
const TECHNICAL_COOLDOWN_KEY='litlabTechnicalLastSentAt';
const COOLDOWN_MS=30_000;

type StoredSession={access_token?:string};
type SubmissionKind='feedback'|'technical';

type FeedbackPayload={
  respondent_role:string;
  school:string|null;
  section:string;
  rating:number;
  useful:string|null;
  improve:string|null;
  unclear:string|null;
  feature_request:string|null;
  recommend:string|null;
  source_page:string;
};

type TechnicalPayload={
  respondent_role:string;
  school:string|null;
  category:string;
  severity:string;
  description:string;
  steps_to_reproduce:string|null;
  expected_behavior:string|null;
  source_page:string;
  browser:string;
  device:string;
  viewport:string;
  user_agent:string;
};

function getAccessToken(){
  try{
    const session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null;
    return session?.access_token||'';
  }catch{return ''}
}

function closeFeedback(){
  const root=document.getElementById('ll-feedback-root');
  root?.classList.remove('open');
  root?.replaceChildren();
  document.body.classList.remove('ll-feedback-open');
}

function detectBrowser(){
  const ua=navigator.userAgent;
  if(/Edg\//.test(ua))return 'Microsoft Edge';
  if(/OPR\//.test(ua))return 'Opera';
  if(/Firefox\//.test(ua))return 'Firefox';
  if(/Chrome\//.test(ua)&&!/Edg\//.test(ua))return 'Google Chrome';
  if(/Safari\//.test(ua)&&!/Chrome\//.test(ua))return 'Safari';
  return navigator.userAgentData?.brands?.map(brand=>brand.brand).join(', ')||'Unknown browser';
}

function detectDevice(){
  const ua=navigator.userAgent.toLowerCase();
  if(/ipad|tablet/.test(ua))return 'Tablet';
  if(/mobi|iphone|android/.test(ua))return 'Mobile';
  return 'Desktop / laptop';
}

function sourcePage(){
  return `${location.pathname}${location.hash}`.slice(0,220);
}

function showThankYou(kind:SubmissionKind,alreadyReceived=false){
  const root=document.getElementById('ll-feedback-root');
  const modal=root?.querySelector<HTMLElement>('.ll-feedback-modal');
  if(!root||!modal)return;

  const technical=kind==='technical';
  modal.classList.add('ll-feedback-modal-thanks');
  modal.scrollTop=0;
  modal.innerHTML=`
    <button class="ll-feedback-close" type="button" aria-label="Close confirmation" data-feedback-thanks-close>×</button>
    <div class="ll-feedback-thanks" role="status" aria-live="polite">
      <div class="ll-feedback-thanks-mark" aria-hidden="true"><span>✓</span></div>
      <span class="ll-feedback-kicker">${alreadyReceived?(technical?'Report already received':'Feedback already received'):(technical?'Technical report received':'Feedback received')}</span>
      <h2>${technical?'Thanks for helping us debug LitLab.':(alreadyReceived?'Thank you again.':'Thank you for helping shape LitLab.')}</h2>
      <p>${technical
        ?(alreadyReceived?'Your technical report was already submitted successfully. The LitLab developers have it and will use the attached technical details to investigate the issue.':'Your report has been sent to the LitLab developers. We’ll review the problem, use the attached page and device details to reproduce it, and take it into consideration as we improve the platform.')
        :(alreadyReceived?'Your feedback was already submitted successfully. It is with the LitLab team and will be taken into consideration as we continue improving the platform.':'We’ve received your feedback. We’ll review it carefully and take it into consideration as we continue improving LitLab for current and future IB students.')}</p>
      <div class="ll-feedback-thanks-note">
        <span aria-hidden="true">${technical?'⚙':'✦'}</span>
        <div><b>${technical?'Report saved for developer review.':'Your voice matters.'}</b><small>${technical?'Page, browser, device type and viewport were included to help us diagnose the problem.':'Feedback helps us decide what to improve, clarify, and build next.'}</small></div>
      </div>
      <button class="ll-feedback-thanks-done" type="button" data-feedback-thanks-close>Back to LitLab</button>
    </div>`;

  modal.querySelectorAll<HTMLElement>('[data-feedback-thanks-close]').forEach(element=>element.addEventListener('click',closeFeedback));
  requestAnimationFrame(()=>modal.querySelector<HTMLButtonElement>('.ll-feedback-thanks-done')?.focus({preventScroll:true}));
}

function headers(){
  const token=getAccessToken();
  const result:Record<string,string>={
    'Content-Type':'application/json',
    apikey:SUPABASE_PUBLISHABLE_KEY,
    Prefer:'return=minimal'
  };
  if(token)result.Authorization=`Bearer ${token}`;
  return result;
}

async function postRow(table:string,payload:Record<string,unknown>){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
    method:'POST',headers:headers(),body:JSON.stringify(payload)
  });
  if(!response.ok)throw new Error(`${table} request failed (${response.status})`);
}

async function submitGeneralFeedback(form:HTMLFormElement){
  const status=form.querySelector<HTMLElement>('#ll-feedback-status');
  const submit=form.querySelector<HTMLButtonElement>('.ll-feedback-submit');
  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;

  const lastSent=Number(localStorage.getItem(FEEDBACK_COOLDOWN_KEY)||0);
  if(Date.now()-lastSent<COOLDOWN_MS){showThankYou('feedback',true);return}

  const clean=(name:string)=>String(data.get(name)||'').trim()||null;
  const payload:FeedbackPayload={
    respondent_role:String(data.get('respondent_role')||'student'),
    school:clean('school'),
    section:String(data.get('section')||'General website'),
    rating:Number(data.get('rating')||5),
    useful:clean('useful'),
    improve:clean('improve'),
    unclear:clean('unclear'),
    feature_request:clean('feature_request'),
    recommend:clean('recommend'),
    source_page:sourcePage().slice(0,180)
  };

  if(!payload.useful&&!payload.improve&&!payload.unclear&&!payload.feature_request){
    if(status){status.textContent='Please add at least one written comment so we know what to act on.';status.dataset.state='error'}
    return;
  }

  if(submit){submit.disabled=true;submit.textContent='Sending…'}
  if(status){status.textContent='';status.dataset.state=''}

  try{
    await postRow('litlab_feedback',payload as unknown as Record<string,unknown>);
    localStorage.setItem(FEEDBACK_COOLDOWN_KEY,String(Date.now()));
    window.dispatchEvent(new CustomEvent('litlab:submission-sent',{detail:{kind:'feedback'}}));
    showThankYou('feedback',false);
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not send your feedback right now. Please try again.';status.dataset.state='error'}
    if(submit){submit.disabled=false;submit.textContent='Send feedback'}
  }
}

async function submitTechnicalReport(form:HTMLFormElement){
  const status=form.querySelector<HTMLElement>('#ll-technical-status');
  const submit=form.querySelector<HTMLButtonElement>('.ll-technical-submit');
  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;

  const lastSent=Number(localStorage.getItem(TECHNICAL_COOLDOWN_KEY)||0);
  if(Date.now()-lastSent<COOLDOWN_MS){showThankYou('technical',true);return}

  const clean=(name:string)=>String(data.get(name)||'').trim()||null;
  const description=String(data.get('description')||'').trim();
  if(description.length<3){
    if(status){status.textContent='Please describe the technical problem so we know what to investigate.';status.dataset.state='error'}
    return;
  }

  const payload:TechnicalPayload={
    respondent_role:String(data.get('respondent_role')||'student'),
    school:clean('school'),
    category:String(data.get('category')||'other'),
    severity:String(data.get('severity')||'major'),
    description,
    steps_to_reproduce:clean('steps_to_reproduce'),
    expected_behavior:clean('expected_behavior'),
    source_page:sourcePage(),
    browser:detectBrowser().slice(0,160),
    device:detectDevice(),
    viewport:`${window.innerWidth}×${window.innerHeight} @ ${window.devicePixelRatio||1}x`.slice(0,40),
    user_agent:navigator.userAgent.slice(0,500)
  };

  if(submit){submit.disabled=true;submit.textContent='Sending report…'}
  if(status){status.textContent='';status.dataset.state=''}

  try{
    await postRow('litlab_technical_reports',payload as unknown as Record<string,unknown>);
    localStorage.setItem(TECHNICAL_COOLDOWN_KEY,String(Date.now()));
    window.dispatchEvent(new CustomEvent('litlab:submission-sent',{detail:{kind:'technical'}}));
    showThankYou('technical',false);
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not send the technical report right now. Please try again.';status.dataset.state='error'}
    if(submit){submit.disabled=false;submit.textContent='Send technical report'}
  }
}

async function handleSubmit(event:Event){
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||!['ll-feedback-form','ll-technical-form'].includes(form.id))return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if(form.id==='ll-technical-form')await submitTechnicalReport(form);
  else await submitGeneralFeedback(form);
}

document.addEventListener('submit',event=>void handleSubmit(event),true);
