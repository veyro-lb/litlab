import './feedback.css';

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

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[char]||char));

function getAccessToken(){
  try{
    const session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null;
    return session?.access_token||'';
  }catch{return ''}
}

function currentSection(){
  const hash=(location.hash||'#home').replace(/^#/,'');
  const route=hash.split('#')[0]||'home';
  const labels:Record<string,string>={
    home:'General website',start:'Start Here',papers:'Papers','paper-1':'Paper 1','paper-2':'Paper 2',
    io:'Individual Oral',books:'Books',ee:'Essays / EE',skills:'Skills Lab',toolkit:'Toolkit',about:'About'
  };
  return labels[route]||'General website';
}

function modalMarkup(){
  const defaultSection=currentSection();
  const sections=['General website','Start Here','Paper 1','Paper 2','Individual Oral','Extended Essay','HL Essay','Skills Lab','Books','LitLab Tutor','Toolkit','Accounts / My LitLab','Other'];
  return `<div class="ll-feedback-backdrop" data-feedback-close></div>
  <section class="ll-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="ll-feedback-title">
    <button class="ll-feedback-close" type="button" aria-label="Close feedback form" data-feedback-close>×</button>
    <div class="ll-feedback-head">
      <span class="ll-feedback-kicker">Help us improve LitLab</span>
      <h2 id="ll-feedback-title">Tell us what would make LitLab better.</h2>
      <p>Your feedback helps us improve the platform for current and future IB students. You can submit anonymously.</p>
    </div>
    <form class="ll-feedback-form" id="ll-feedback-form">
      <div class="ll-feedback-grid two">
        <label><span>You are</span><select name="respondent_role" required>
          <option value="student">Student</option><option value="teacher">Teacher</option><option value="ib-coordinator">IB Coordinator</option><option value="cas-coordinator">CAS Coordinator</option><option value="parent">Parent</option><option value="other">Other</option>
        </select></label>
        <label><span>School <small>(optional)</small></span><input name="school" maxlength="120" autocomplete="organization" placeholder="School name" /></label>
      </div>
      <div class="ll-feedback-grid two">
        <label><span>Section</span><select name="section" required>${sections.map(s=>`<option value="${esc(s)}"${s===defaultSection?' selected':''}>${esc(s)}</option>`).join('')}</select></label>
        <fieldset class="ll-rating"><legend>How useful was it?</legend><div>${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rating" value="${n}"${n===5?' checked':''}/><span>${n}</span></label>`).join('')}</div></fieldset>
      </div>
      <label><span>What did you find useful?</span><textarea name="useful" maxlength="2000" rows="3" placeholder="What worked well for you?"></textarea></label>
      <label><span>What could we improve?</span><textarea name="improve" maxlength="2000" rows="3" placeholder="Tell us what could be clearer, easier or more useful."></textarea></label>
      <label><span>Did you find anything incorrect or unclear?</span><textarea name="unclear" maxlength="2000" rows="3" placeholder="If yes, tell us the page or section and what needs checking."></textarea></label>
      <label><span>What feature would you like us to add?</span><textarea name="feature_request" maxlength="2000" rows="3" placeholder="A new tool, guide, book profile or improvement you would use."></textarea></label>
      <fieldset class="ll-recommend"><legend>Would you recommend LitLab to another IB student?</legend><div>
        <label><input type="radio" name="recommend" value="yes"/><span>Yes</span></label>
        <label><input type="radio" name="recommend" value="maybe"/><span>Maybe</span></label>
        <label><input type="radio" name="recommend" value="no"/><span>No</span></label>
      </div></fieldset>
      <label class="ll-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off" /></label>
      <p class="ll-feedback-privacy">Please do not include passwords, private account information, or personal student data. Feedback is stored securely for the LitLab team to review.</p>
      <div class="ll-feedback-actions"><p id="ll-feedback-status" role="status" aria-live="polite"></p><button class="ll-feedback-submit" type="submit">Send feedback</button></div>
    </form>
  </section>`;
}

function openFeedback(){
  let root=document.getElementById('ll-feedback-root');
  if(!root){root=document.createElement('div');root.id='ll-feedback-root';document.body.appendChild(root)}
  root.innerHTML=modalMarkup();
  root.classList.add('open');
  document.body.classList.add('ll-feedback-open');
  root.querySelectorAll('[data-feedback-close]').forEach(el=>el.addEventListener('click',closeFeedback));
  const form=root.querySelector<HTMLFormElement>('#ll-feedback-form');
  form?.addEventListener('submit',submitFeedback);
  const modal=root.querySelector<HTMLElement>('.ll-feedback-modal');
  const close=root.querySelector<HTMLButtonElement>('.ll-feedback-close');
  if(modal)modal.scrollTop=0;
  requestAnimationFrame(()=>{
    if(modal)modal.scrollTop=0;
    close?.focus({preventScroll:true});
  });
}

function closeFeedback(){
  const root=document.getElementById('ll-feedback-root');
  root?.classList.remove('open');
  root?.replaceChildren();
  document.body.classList.remove('ll-feedback-open');
}

async function submitFeedback(event:SubmitEvent){
  event.preventDefault();
  const form=event.currentTarget as HTMLFormElement;
  const status=form.querySelector<HTMLElement>('#ll-feedback-status');
  const submit=form.querySelector<HTMLButtonElement>('.ll-feedback-submit');
  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;

  const lastSent=Number(localStorage.getItem(COOLDOWN_KEY)||0);
  if(Date.now()-lastSent<COOLDOWN_MS){
    if(status){status.textContent='Thank you — we already received your feedback and will take it into consideration as we continue improving LitLab.';status.dataset.state='ok'}
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
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_feedback`,{method:'POST',headers,body:JSON.stringify(payload)});
    if(!response.ok)throw new Error(`Feedback request failed (${response.status})`);
    localStorage.setItem(COOLDOWN_KEY,String(Date.now()));
    form.reset();
    if(status){status.textContent='Thank you for helping us improve LitLab! We’ve received your feedback and will take it into consideration as we continue developing the platform.';status.dataset.state='ok'}
    if(submit){submit.textContent='Sent ✓'}
    setTimeout(closeFeedback,3200);
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not send your feedback right now. Please try again.';status.dataset.state='error'}
    if(submit){submit.disabled=false;submit.textContent='Send feedback'}
  }
}

function installFeedback(){
  if(document.getElementById('ll-feedback-trigger'))return;
  const button=document.createElement('button');
  button.id='ll-feedback-trigger';
  button.className='ll-feedback-trigger';
  button.type='button';
  button.setAttribute('aria-label','Give feedback on LitLab');
  button.innerHTML='<span aria-hidden="true">✦</span><b>Feedback</b>';
  button.addEventListener('click',openFeedback);
  document.body.appendChild(button);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&document.getElementById('ll-feedback-root')?.classList.contains('open'))closeFeedback();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFeedback,{once:true});
else installFeedback();
