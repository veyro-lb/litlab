import './feedback.css';
import './feedback-technical.css';

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[char]||char));

function currentSection(){
  const hash=(location.hash||'#home').replace(/^#/,'');
  const route=hash.split('#')[0]||'home';
  const labels:Record<string,string>={
    home:'General website',start:'Start Here',papers:'Papers','paper-1':'Paper 1','paper-2':'Paper 2',
    io:'Individual Oral',books:'Books',ee:'Essays / EE',skills:'Skills Lab',toolkit:'Toolkit',about:'About',admin:'Developer dashboard'
  };
  return labels[route]||'General website';
}

function feedbackForm(){
  const defaultSection=currentSection();
  const sections=['General website','Start Here','Paper 1','Paper 2','Individual Oral','Extended Essay','HL Essay','Skills Lab','Books','LitLab Tutor','Toolkit','Accounts / My LitLab','Other'];
  return `<form class="ll-feedback-form" id="ll-feedback-form" data-feedback-panel="feedback">
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
  </form>`;
}

function technicalForm(){
  return `<form class="ll-feedback-form ll-technical-form" id="ll-technical-form" data-feedback-panel="technical" hidden>
    <div class="ll-tech-intro"><span aria-hidden="true">⚙</span><div><b>Help us reproduce the problem.</b><small>LitLab will automatically attach the current page, browser, device type and screen size. We do not collect passwords or the contents of your account.</small></div></div>
    <div class="ll-feedback-grid two">
      <label><span>You are</span><select name="respondent_role" required>
        <option value="student">Student</option><option value="teacher">Teacher</option><option value="ib-coordinator">IB Coordinator</option><option value="cas-coordinator">CAS Coordinator</option><option value="parent">Parent</option><option value="other">Other</option>
      </select></label>
      <label><span>School <small>(optional)</small></span><input name="school" maxlength="120" autocomplete="organization" placeholder="School name" /></label>
    </div>
    <div class="ll-feedback-grid two">
      <label><span>What is affected?</span><select name="category" required>
        <option value="page-loading">Page not loading / stuck</option>
        <option value="button-interaction">Button or interaction not working</option>
        <option value="sign-in-account">Sign in / account</option>
        <option value="tutor">LitLab Tutor</option>
        <option value="mobile-layout">Mobile layout / framing</option>
        <option value="progress-saving">Progress not saving / syncing</option>
        <option value="display-visual">Display / visual problem</option>
        <option value="other">Other technical problem</option>
      </select></label>
      <fieldset class="ll-recommend ll-tech-severity"><legend>How serious is it?</legend><div>
        <label><input type="radio" name="severity" value="minor"/><span>Minor</span></label>
        <label><input type="radio" name="severity" value="major" checked/><span>Major</span></label>
        <label><input type="radio" name="severity" value="blocked"/><span>Blocked</span></label>
      </div></fieldset>
    </div>
    <label><span>Describe the technical problem</span><textarea name="description" maxlength="3000" rows="4" required placeholder="What went wrong? Include any message you saw and what you were trying to do."></textarea></label>
    <label><span>How can we reproduce it? <small>(optional)</small></span><textarea name="steps_to_reproduce" maxlength="3000" rows="3" placeholder="Example: Open Paper 1 → tap Analysis Lab → press Next → nothing happens."></textarea></label>
    <label><span>What did you expect to happen? <small>(optional)</small></span><textarea name="expected_behavior" maxlength="2000" rows="3" placeholder="Tell us what should have happened instead."></textarea></label>
    <label class="ll-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off" /></label>
    <p class="ll-feedback-privacy">Technical details are attached only to help the LitLab developers diagnose the issue. Do not include passwords, private account information, or personal student data.</p>
    <div class="ll-feedback-actions"><p id="ll-technical-status" role="status" aria-live="polite"></p><button class="ll-feedback-submit ll-technical-submit" type="submit">Send technical report</button></div>
  </form>`;
}

function modalMarkup(){
  return `<div class="ll-feedback-backdrop" data-feedback-close></div>
  <section class="ll-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="ll-feedback-title">
    <button class="ll-feedback-close" type="button" aria-label="Close feedback form" data-feedback-close>×</button>
    <div class="ll-feedback-head">
      <span class="ll-feedback-kicker">Help us improve LitLab</span>
      <h2 id="ll-feedback-title">Tell us how LitLab can be better.</h2>
      <p>Share general feedback or report a technical problem directly to the LitLab developers.</p>
    </div>
    <div class="ll-feedback-mode" role="tablist" aria-label="Feedback type">
      <button type="button" role="tab" aria-selected="true" data-feedback-mode="feedback"><span aria-hidden="true">✦</span><b>Give feedback</b><small>Ideas, clarity and content</small></button>
      <button type="button" role="tab" aria-selected="false" data-feedback-mode="technical"><span aria-hidden="true">⚙</span><b>Report a technical problem</b><small>Bugs, buttons, loading and display</small></button>
    </div>
    ${feedbackForm()}
    ${technicalForm()}
  </section>`;
}

function setMode(root:HTMLElement,mode:'feedback'|'technical'){
  root.querySelectorAll<HTMLButtonElement>('[data-feedback-mode]').forEach(button=>{
    const active=button.dataset.feedbackMode===mode;
    button.setAttribute('aria-selected',String(active));
    button.classList.toggle('active',active);
  });
  root.querySelectorAll<HTMLElement>('[data-feedback-panel]').forEach(panel=>{
    panel.hidden=panel.dataset.feedbackPanel!==mode;
  });
  const modal=root.querySelector<HTMLElement>('.ll-feedback-modal');
  if(modal)modal.scrollTop=0;
  const heading=root.querySelector<HTMLElement>('#ll-feedback-title');
  const intro=root.querySelector<HTMLElement>('.ll-feedback-head p');
  if(heading)heading.textContent=mode==='technical'?'Report a technical problem.':'Tell us how LitLab can be better.';
  if(intro)intro.textContent=mode==='technical'
    ?'Send the LitLab developers enough detail to reproduce and fix the issue.'
    :'Your feedback helps us decide what to improve, clarify and build next.';
}

function openFeedback(initialMode:'feedback'|'technical'='feedback'){
  let root=document.getElementById('ll-feedback-root');
  if(!root){root=document.createElement('div');root.id='ll-feedback-root';document.body.appendChild(root)}
  root.innerHTML=modalMarkup();
  root.classList.add('open');
  document.body.classList.add('ll-feedback-open');
  root.querySelectorAll('[data-feedback-close]').forEach(el=>el.addEventListener('click',closeFeedback));
  root.querySelectorAll<HTMLButtonElement>('[data-feedback-mode]').forEach(button=>button.addEventListener('click',()=>setMode(root!,button.dataset.feedbackMode==='technical'?'technical':'feedback')));
  setMode(root,initialMode);
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

function installFeedback(){
  if(document.getElementById('ll-feedback-trigger'))return;
  const button=document.createElement('button');
  button.id='ll-feedback-trigger';
  button.className='ll-feedback-trigger';
  button.type='button';
  button.setAttribute('aria-label','Give feedback or report a technical problem');
  button.innerHTML='<span aria-hidden="true">✦</span><b>Feedback</b>';
  button.addEventListener('click',()=>openFeedback('feedback'));
  document.body.appendChild(button);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&document.getElementById('ll-feedback-root')?.classList.contains('open'))closeFeedback();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFeedback,{once:true});
else installFeedback();
