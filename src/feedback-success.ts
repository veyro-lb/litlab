import './feedback-success.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const COOLDOWN_KEY='litlabFeedbackLastSentAt';
const COOLDOWN_MS=30_000;

type StoredSession={access_token?:string};

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

function showThankYou(alreadyReceived=false){
  const root=document.getElementById('ll-feedback-root');
  const modal=root?.querySelector<HTMLElement>('.ll-feedback-modal');
  if(!root||!modal)return;

  modal.classList.add('ll-feedback-modal-thanks');
  modal.scrollTop=0;
  modal.innerHTML=`
    <button class="ll-feedback-close" type="button" aria-label="Close feedback confirmation" data-feedback-thanks-close>×</button>
    <div class="ll-feedback-thanks" role="status" aria-live="polite">
      <div class="ll-feedback-thanks-mark" aria-hidden="true"><span>✓</span></div>
      <span class="ll-feedback-kicker">${alreadyReceived?'Feedback already received':'Feedback received'}</span>
      <h2>${alreadyReceived?'Thank you again.':'Thank you for helping shape LitLab.'}</h2>
      <p>${alreadyReceived
        ?'Your feedback was already submitted successfully. It is with the LitLab team and will be taken into consideration as we continue improving the platform.'
        :'We’ve received your feedback. We’ll review it carefully and take it into consideration as we continue improving LitLab for current and future IB students.'}</p>
      <div class="ll-feedback-thanks-note">
        <span aria-hidden="true">✦</span>
        <div><b>Your voice matters.</b><small>Feedback helps us decide what to improve, clarify, and build next.</small></div>
      </div>
      <button class="ll-feedback-thanks-done" type="button" data-feedback-thanks-close>Back to LitLab</button>
    </div>`;

  modal.querySelectorAll<HTMLElement>('[data-feedback-thanks-close]').forEach(element=>element.addEventListener('click',closeFeedback));
  requestAnimationFrame(()=>modal.querySelector<HTMLButtonElement>('.ll-feedback-thanks-done')?.focus({preventScroll:true}));
}

async function handleSubmit(event:Event){
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-feedback-form')return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const status=form.querySelector<HTMLElement>('#ll-feedback-status');
  const submit=form.querySelector<HTMLButtonElement>('.ll-feedback-submit');
  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;

  const lastSent=Number(localStorage.getItem(COOLDOWN_KEY)||0);
  if(Date.now()-lastSent<COOLDOWN_MS){
    showThankYou(true);
    return;
  }

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
    source_page:`${location.pathname}${location.hash}`.slice(0,180)
  };

  if(!payload.useful&&!payload.improve&&!payload.unclear&&!payload.feature_request){
    if(status){status.textContent='Please add at least one written comment so we know what to act on.';status.dataset.state='error'}
    return;
  }

  if(submit){submit.disabled=true;submit.textContent='Sending…'}
  if(status){status.textContent='';status.dataset.state=''}

  try{
    const token=getAccessToken();
    const headers:Record<string,string>={
      'Content-Type':'application/json',
      apikey:SUPABASE_PUBLISHABLE_KEY,
      Prefer:'return=minimal'
    };
    if(token)headers.Authorization=`Bearer ${token}`;
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_feedback`,{
      method:'POST',
      headers,
      body:JSON.stringify(payload)
    });
    if(!response.ok)throw new Error(`Feedback request failed (${response.status})`);
    localStorage.setItem(COOLDOWN_KEY,String(Date.now()));
    showThankYou(false);
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not send your feedback right now. Please try again.';status.dataset.state='error'}
    if(submit){submit.disabled=false;submit.textContent='Send feedback'}
  }
}

document.addEventListener('submit',event=>void handleSubmit(event),true);
