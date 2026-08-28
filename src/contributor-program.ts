import './contributor-program.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SUBMIT_COOLDOWN_KEY='litlabContributorLastSentAt';
const COOLDOWN_MS=30_000;

type StoredSession={access_token?:string};
type ApplicantType='student'|'teacher';

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));

function accessToken(){
  try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}
}

function headers(){
  const result:Record<string,string>={'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Prefer:'return=minimal'};
  const token=accessToken();
  if(token)result.Authorization=`Bearer ${token}`;
  return result;
}

function pageMarkup(){
  return `<main class="ll-contrib-page">
    <header class="ll-contrib-topbar">
      <button type="button" class="ll-contrib-brand" data-contrib-home aria-label="Back to LitLab home"><span class="ll-contrib-mark">LL</span><b>Lit<span>Lab</span></b></button>
      <button type="button" class="ll-contrib-back" data-contrib-home>← Back to LitLab</button>
    </header>

    <section class="ll-contrib-hero">
      <div class="ll-contrib-hero-copy">
        <span class="ll-contrib-kicker">LitLab Contributor Program</span>
        <h1>Help other DP students.<br/><em>Build something that matters.</em></h1>
        <p>LitLab welcomes DP students who want to contribute high-quality English resources and teachers who want to review or mentor content. Student contributions can also be structured as a meaningful CAS experience when approved by the student’s school.</p>
        <div class="ll-contrib-actions"><a href="#contribute-apply" class="ll-contrib-primary">Apply to contribute</a><a href="#contribute-cas" class="ll-contrib-secondary">See the CAS pathway</a></div>
        <p class="ll-contrib-disclaimer"><b>Important:</b> LitLab cannot approve CAS on behalf of a school. Students should discuss the experience with their CAS coordinator before relying on it for CAS.</p>
      </div>
      <div class="ll-contrib-hero-card">
        <span>What contributors can work on</span>
        <div><b>Content</b><small>Explanations, guides, revision resources and book-related material.</small></div>
        <div><b>Research</b><small>Reliable source-based notes that help LitLab develop accurate content.</small></div>
        <div><b>Review</b><small>Proofreading, clarity checks and academic accuracy review.</small></div>
        <p>Website coding, UI and visual design remain managed by the LitLab development team.</p>
      </div>
    </section>

    <section class="ll-contrib-section">
      <div class="ll-contrib-section-head"><span>Two ways to help</span><h2>Choose the role that fits you.</h2></div>
      <div class="ll-contrib-role-grid">
        <article><span class="ll-contrib-role-icon">✦</span><h3>DP Student Contributor</h3><p>Create or improve educational content for other DP English students. You can focus on writing, research or reviewing existing material.</p><ul><li>DP1 or DP2 students</li><li>Content, research or review</li><li>Optional CAS-focused contribution plan</li><li>Contributor certificate after approved work</li></ul><a href="#contribute-apply" data-select-role="student">Apply as a student</a></article>
        <article><span class="ll-contrib-role-icon">✓</span><h3>Teacher Reviewer / Mentor</h3><p>Teachers can support the project by reviewing academic content, flagging unclear explanations, suggesting improvements or mentoring contributors.</p><ul><li>English teachers and educators</li><li>Academic review and feedback</li><li>No website-development responsibility</li><li>Optional public acknowledgement</li></ul><a href="#contribute-apply" data-select-role="teacher">Apply as a teacher</a></article>
      </div>
    </section>

    <section class="ll-contrib-section ll-contrib-cas" id="contribute-cas">
      <div class="ll-contrib-section-head"><span>For DP students</span><h2>A clearer CAS pathway.</h2><p>LitLab gives students a structured way to plan, document and reflect on a real contribution instead of simply asking for “CAS hours.”</p></div>
      <div class="ll-contrib-steps">
        <article><b>01</b><h3>Discuss it first</h3><p>Share the idea with your CAS coordinator and confirm how your school wants the experience documented.</p></article>
        <article><b>02</b><h3>Set a real goal</h3><p>Define what you want to create, who it will help and what success should look like.</p></article>
        <article><b>03</b><h3>Contribute</h3><p>Research, write, revise and respond to LitLab feedback until the contribution is ready to publish.</p></article>
        <article><b>04</b><h3>Keep evidence</h3><p>Save drafts, source notes, feedback, dates and approved final work. Log only time you genuinely worked.</p></article>
        <article><b>05</b><h3>Reflect</h3><p>Record what you learned, challenges you faced, decisions you made and how your work supported others.</p></article>
        <article><b>06</b><h3>Get recognised</h3><p>After approved work is completed, LitLab can issue a contributor certificate describing the verified contribution.</p></article>
      </div>
      <div class="ll-contrib-cas-kit">
        <div><span>CAS evidence checklist</span><h3>What we recommend you keep</h3></div>
        <ul><li>Your original goal and contribution plan</li><li>Research notes and reliable sources used</li><li>Drafts showing development over time</li><li>Feedback and revisions</li><li>Your published or approved final contribution</li><li>Personal reflection entries</li><li>A truthful record of dates/time spent</li><li>LitLab contributor certificate after completion</li></ul>
      </div>
      <p class="ll-contrib-cas-note">CAS requirements vary by school. A LitLab certificate confirms a contribution to LitLab; it is not an IB certificate and does not guarantee CAS approval.</p>
    </section>

    <section class="ll-contrib-section ll-contrib-certificate">
      <div><span class="ll-contrib-kicker">Contributor recognition</span><h2>Complete approved work and receive a certificate.</h2><p>The certificate can include the contributor’s name, role, contribution title/topic, completion date and a description of the work verified by LitLab. Verified time may only be included when LitLab can reasonably confirm it.</p></div>
      <div class="ll-contrib-cert-preview"><span>LITLAB</span><small>Certificate of Contribution</small><h3>Student Name</h3><p>Recognised for contributing educational content to LitLab and supporting DP English learners.</p><b>Verified contribution • Date</b></div>
    </section>

    <section class="ll-contrib-section ll-contrib-apply" id="contribute-apply">
      <div class="ll-contrib-section-head"><span>Apply</span><h2>Tell us how you want to contribute.</h2><p>Applications are reviewed by the LitLab team. Applying does not automatically mean a contribution will be accepted or published.</p></div>
      <form id="ll-contributor-form" class="ll-contributor-form">
        <fieldset class="ll-contrib-role-choice"><legend>I am applying as</legend><label><input type="radio" name="applicant_type" value="student" checked/><span><b>DP student</b><small>I want to create, research or review content.</small></span></label><label><input type="radio" name="applicant_type" value="teacher"/><span><b>Teacher</b><small>I want to review or mentor academic content.</small></span></label></fieldset>

        <div class="ll-contrib-grid two"><label><span>Full name</span><input name="full_name" required maxlength="120" autocomplete="name"/></label><label><span>Email</span><input type="email" name="email" required maxlength="254" autocomplete="email"/></label></div>
        <div class="ll-contrib-grid two"><label><span>School <small>(optional)</small></span><input name="school" maxlength="160" autocomplete="organization"/></label><label><span>Country <small>(optional)</small></span><input name="country" maxlength="100" autocomplete="country-name"/></label></div>

        <div data-student-fields>
          <div class="ll-contrib-grid two"><label><span>DP year</span><select name="dp_year"><option value="dp1">DP1</option><option value="dp2">DP2</option><option value="other">Other / preparing for DP</option></select></label><label><span>Are you considering this for CAS?</span><select name="cas_intent"><option value="yes">Yes</option><option value="maybe">Maybe / I need to ask my coordinator</option><option value="no">No</option></select></label></div>
        </div>

        <div data-teacher-fields hidden><label><span>Subject / role you teach</span><input name="subject_taught" maxlength="160" placeholder="e.g. DP English A: Language & Literature"/></label></div>

        <label><span>How would you like to contribute?</span><select name="contribution_type" required><option value="content">Write or improve content</option><option value="research">Research and source a topic</option><option value="review">Review / proofread content</option></select></label>
        <label><span>Topics you are interested in</span><textarea name="topics" required maxlength="1200" rows="3" placeholder="Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…"></textarea></label>
        <label><span>What would you like to contribute?</span><textarea name="contribution_idea" required minlength="10" maxlength="3000" rows="4" placeholder="Describe the resource, topic, review or improvement you have in mind."></textarea></label>
        <label><span>Why do you want to contribute?</span><textarea name="motivation" required minlength="10" maxlength="2500" rows="4"></textarea></label>
        <div class="ll-contrib-grid two"><label><span>Relevant strengths / experience <small>(optional)</small></span><textarea name="experience" maxlength="2000" rows="3"></textarea></label><label><span>Availability <small>(optional)</small></span><textarea name="availability" maxlength="500" rows="3" placeholder="For example: around 1–2 hours per week for a month"></textarea></label></div>

        <div class="ll-contrib-cas-fields" data-cas-fields>
          <span class="ll-contrib-form-kicker">CAS planning prompts</span>
          <p>These prompts help you start with a purposeful experience. You can refine them later with your CAS coordinator.</p>
          <label><span>What is your goal?</span><textarea name="cas_goal" maxlength="1800" rows="3" placeholder="What do you want to create or improve, and what do you want to learn?"></textarea></label>
          <label><span>Who could benefit from your contribution?</span><textarea name="cas_impact" maxlength="1800" rows="3" placeholder="Describe the students or community your work is intended to support."></textarea></label>
          <label><span>How will you know the contribution was successful?</span><textarea name="cas_success" maxlength="1800" rows="3" placeholder="For example: accurate final resource, revision after feedback, publication on LitLab, useful student response…"></textarea></label>
        </div>

        <fieldset class="ll-contrib-credit"><legend>If your work is published, how would you like to be credited?</legend><label><input type="radio" name="credit_preference" value="name" checked/>Use my name</label><label><input type="radio" name="credit_preference" value="anonymous"/>Keep my contribution anonymous</label></fieldset>

        <label class="ll-contrib-check"><input type="checkbox" required/><span>I understand that LitLab may review, edit, request revisions, reject or decline to publish submitted work.</span></label>
        <label class="ll-contrib-check"><input type="checkbox" required/><span>I understand that CAS approval is decided by my school/CAS coordinator, not by LitLab.</span></label>
        <label class="ll-contrib-honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"/></label>
        <p class="ll-contrib-privacy">Only submit information needed for the application. Do not include passwords, student IDs, home addresses, phone numbers or other sensitive personal information.</p>
        <div class="ll-contrib-submit-row"><p id="ll-contributor-status" role="status" aria-live="polite"></p><button type="submit">Submit application</button></div>
      </form>
    </section>
  </main>`;
}

function syncRole(form:HTMLFormElement){
  const role=(new FormData(form).get('applicant_type')||'student') as ApplicantType;
  const student=form.querySelector<HTMLElement>('[data-student-fields]');
  const teacher=form.querySelector<HTMLElement>('[data-teacher-fields]');
  const cas=form.querySelector<HTMLElement>('[data-cas-fields]');
  if(student)student.hidden=role!=='student';
  if(teacher)teacher.hidden=role!=='teacher';
  if(cas)cas.hidden=role!=='student';
  const type=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]');
  if(type){
    if(role==='teacher'){
      type.innerHTML='<option value="teacher-review">Teacher review / mentoring</option>';
    }else{
      type.innerHTML='<option value="content">Write or improve content</option><option value="research">Research and source a topic</option><option value="review">Review / proofread content</option>';
    }
  }
}

async function submitApplication(form:HTMLFormElement){
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const data=new FormData(form);
  if(String(data.get('website')||'').trim())return;
  const last=Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY)||0);
  if(Date.now()-last<COOLDOWN_MS){if(status){status.textContent='Your application was already sent. Thank you!';status.dataset.state='success'}return}
  const clean=(key:string)=>String(data.get(key)||'').trim()||null;
  const applicantType=String(data.get('applicant_type')||'student') as ApplicantType;
  const payload={
    applicant_type:applicantType,
    full_name:String(data.get('full_name')||'').trim(),
    email:String(data.get('email')||'').trim(),
    school:clean('school'),country:clean('country'),
    dp_year:applicantType==='student'?clean('dp_year'):null,
    subject_taught:applicantType==='teacher'?clean('subject_taught'):null,
    cas_intent:applicantType==='student'?clean('cas_intent'):null,
    contribution_type:String(data.get('contribution_type')||'content'),
    topics:String(data.get('topics')||'').trim(),
    contribution_idea:String(data.get('contribution_idea')||'').trim(),
    motivation:String(data.get('motivation')||'').trim(),
    experience:clean('experience'),availability:clean('availability'),
    cas_goal:applicantType==='student'?clean('cas_goal'):null,
    cas_impact:applicantType==='student'?clean('cas_impact'):null,
    cas_success:applicantType==='student'?clean('cas_success'):null,
    credit_preference:String(data.get('credit_preference')||'name'),
    source_page:`${location.pathname}${location.hash}`.slice(0,220),
    user_id:null
  };
  if(payload.full_name.length<2||!payload.email||payload.topics.length<2||payload.contribution_idea.length<10||payload.motivation.length<10){if(status){status.textContent='Please complete the required fields with a little more detail.';status.dataset.state='error'}return}
  if(button){button.disabled=true;button.textContent='Submitting…'}
  if(status){status.textContent='';status.dataset.state=''}
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/litlab_contributor_applications`,{method:'POST',headers:headers(),body:JSON.stringify(payload)});
    if(!response.ok)throw new Error(`Contributor application failed (${response.status})`);
    localStorage.setItem(SUBMIT_COOLDOWN_KEY,String(Date.now()));
    form.innerHTML=`<div class="ll-contrib-thanks"><span>✓</span><h3>Application received.</h3><p>Thanks, ${esc(payload.full_name)}. The LitLab team will review your application and the contribution you proposed. If it looks like a good fit, we can contact you using the email you provided.</p><p class="ll-contrib-thanks-note">If you plan to use this as CAS, speak with your CAS coordinator before beginning and keep your own evidence and reflections as you work.</p><button type="button" data-contrib-home>Back to LitLab</button></div>`;
    form.querySelector('[data-contrib-home]')?.addEventListener('click',goHome);
  }catch(error){
    console.error(error);
    if(status){status.textContent='We could not submit your application right now. Please try again.';status.dataset.state='error'}
    if(button){button.disabled=false;button.textContent='Submit application'}
  }
}

function goHome(){location.hash='home'}

function wirePage(root:HTMLElement){
  root.querySelectorAll('[data-contrib-home]').forEach(element=>element.addEventListener('click',goHome));
  root.querySelectorAll<HTMLElement>('[data-select-role]').forEach(element=>element.addEventListener('click',()=>{
    const role=element.dataset.selectRole as ApplicantType;
    requestAnimationFrame(()=>{
      const form=root.querySelector<HTMLFormElement>('#ll-contributor-form');
      const input=form?.querySelector<HTMLInputElement>(`input[name="applicant_type"][value="${role}"]`);
      if(input){input.checked=true;syncRole(form!)}
    });
  }));
  const form=root.querySelector<HTMLFormElement>('#ll-contributor-form');
  if(form){
    form.addEventListener('change',event=>{if(event.target instanceof HTMLInputElement&&event.target.name==='applicant_type')syncRole(form)});
    form.addEventListener('submit',event=>{event.preventDefault();void submitApplication(form)});
    syncRole(form);
  }
}

function renderContributorPage(){
  let root=document.getElementById('ll-contributor-root');
  const active=location.hash.replace(/^#/,'').split('#')[0]==='contribute';
  const app=document.getElementById('root');
  if(!active){
    root?.remove();
    if(app)app.style.display='';
    return;
  }
  if(app)app.style.display='none';
  if(!root){root=document.createElement('div');root.id='ll-contributor-root';document.body.appendChild(root)}
  root.innerHTML=pageMarkup();
  wirePage(root);
  if(location.hash.includes('contribute-apply'))requestAnimationFrame(()=>root?.querySelector('#contribute-apply')?.scrollIntoView({block:'start'}));
  else if(location.hash.includes('contribute-cas'))requestAnimationFrame(()=>root?.querySelector('#contribute-cas')?.scrollIntoView({block:'start'}));
  else scrollTo({top:0,behavior:'instant' as ScrollBehavior});
}

function addEntryPoints(){
  document.querySelectorAll('footer').forEach(footer=>{
    if(footer.querySelector('[data-contributor-entry]'))return;
    const button=document.createElement('button');
    button.type='button';button.dataset.contributorEntry='true';button.className='ll-contributor-entry';button.textContent='Become a Contributor';
    button.addEventListener('click',()=>{location.hash='contribute'});
    const projectHeading=Array.from(footer.querySelectorAll('b')).find(el=>el.textContent?.trim()==='Project');
    projectHeading?.parentElement?.appendChild(button);
  });
}

function start(){renderContributorPage();addEntryPoints();new MutationObserver(()=>addEntryPoints()).observe(document.body,{childList:true,subtree:true})}
window.addEventListener('hashchange',renderContributorPage);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
