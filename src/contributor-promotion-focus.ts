import './contributor-promotion-focus.css';

const FORM_ID='ll-contributor-form';
const PLAN_MARKER='--- PROMOTION PLAN ---';
let enhanceTimer=0;

function applicantRole(form:HTMLFormElement){return form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student'}
function contributionType(form:HTMLFormElement){return form.querySelector<HTMLSelectElement>('select[name="contribution_type"]')?.value||''}
function promotionActive(form:HTMLFormElement){return applicantRole(form)==='student'&&contributionType(form)==='promotion'}
function fieldLabel(control:Element|null,text:string){const span=control?.closest('label')?.querySelector<HTMLElement>(':scope > span');if(span&&span.textContent!==text)span.textContent=text}

function promotionBriefMarkup(){
  return `<fieldset class="ll-promotion-brief" data-promotion-brief hidden>
    <legend>Promotion plan</legend>
    <p class="ll-promotion-brief-intro">Give us enough detail to judge whether the idea is realistic, useful and measurable. You can refine the campaign later if the contribution is accepted.</p>

    <div class="ll-promotion-question">
      <span class="ll-promotion-question-title">Where would you promote LitLab? <b>Choose all that apply.</b></span>
      <div class="ll-promotion-channels" data-promotion-channels>
        <label><input type="checkbox" name="promotion_channel" value="Instagram"/><span>Instagram</span></label>
        <label><input type="checkbox" name="promotion_channel" value="TikTok"/><span>TikTok</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Facebook"/><span>Facebook</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Poster / flyer"/><span>Poster / flyer</span></label>
        <label><input type="checkbox" name="promotion_channel" value="School / community outreach"/><span>School / community</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Other"/><span>Other</span></label>
      </div>
      <small data-channel-error role="status"></small>
    </div>

    <div class="ll-contrib-grid two ll-promotion-grid">
      <label><span>What would you create?</span><select name="promotion_format" data-promotion-required>
        <option value="">Choose a format</option><option>Social post / carousel</option><option>Short video / Reel / TikTok</option><option>Story series</option><option>Awareness poster / flyer</option><option>Campaign series</option><option>Presentation / outreach material</option><option>Other</option>
      </select></label>
      <label><span>Who are you trying to reach?</span><select name="promotion_audience" data-promotion-required>
        <option value="">Choose an audience</option><option>DP English students</option><option>DP students generally</option><option>Pre-DP / MYP students</option><option>Teachers / schools</option><option>Wider student community</option><option>Other</option>
      </select></label>
    </div>

    <div class="ll-contrib-grid two ll-promotion-grid">
      <label><span>Where would it be published or displayed?</span><select name="promotion_distribution" data-promotion-required>
        <option value="">Choose one</option><option>My own social account</option><option>School / club social account</option><option>School physical space</option><option>Student group / community channel</option><option>A mix of online and physical promotion</option><option>Not decided yet</option><option>Other</option>
      </select></label>
      <label><span>What action should someone take after seeing it?</span><select name="promotion_action" data-promotion-required>
        <option value="">Choose the main action</option><option>Visit LitLab</option><option>Use a specific LitLab resource</option><option>Share LitLab with another student</option><option>Follow LitLab updates</option><option>Give feedback / respond</option><option>Other</option>
      </select></label>
    </div>

    <label><span>What is the main message or angle?</span><textarea name="promotion_message" data-promotion-required minlength="15" maxlength="320" rows="3" placeholder="What would you actually say or show? Explain the problem for students, why LitLab helps, and the idea you want the audience to remember."></textarea></label>
    <label><span>How would you carry it out?</span><textarea name="promotion_execution" data-promotion-required minlength="15" maxlength="380" rows="3" placeholder="Be practical: how many posts/posters, roughly when, where they would appear, and whether you already have access or permission to publish there."></textarea></label>
    <label><span>What evidence will you keep?</span><textarea name="promotion_evidence" data-promotion-required minlength="10" maxlength="320" rows="3" placeholder="For example: final files, screenshots, live links, poster photos, post dates, reach/engagement screenshots, QR scans or feedback received."></textarea></label>
    <label><span>How would you judge whether it worked?</span><textarea name="promotion_success" data-promotion-required minlength="10" maxlength="320" rows="3" placeholder="Choose realistic signs of impact: views/reach, saves/shares, clicks, QR scans, website visits, student feedback, or another measurable result."></textarea></label>
  </fieldset>`;
}

function ensureBrief(form:HTMLFormElement){
  let brief=form.querySelector<HTMLElement>('[data-promotion-brief]');
  if(!brief){
    const type=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]');
    const host=type?.closest('label');
    if(!host)return null;
    host.insertAdjacentHTML('afterend',promotionBriefMarkup());
    brief=form.querySelector<HTMLElement>('[data-promotion-brief]');
  }
  return brief||null;
}

function syncGeneralQuestions(form:HTMLFormElement,active:boolean){
  const topics=form.querySelector<HTMLTextAreaElement>('textarea[name="topics"]');
  const idea=form.querySelector<HTMLTextAreaElement>('textarea[name="contribution_idea"]');
  const motivation=form.querySelector<HTMLTextAreaElement>('textarea[name="motivation"]');
  if(applicantRole(form)==='teacher')return;
  if(active){
    fieldLabel(topics,'What part of LitLab would you promote?');
    fieldLabel(idea,'Describe the promotion concept you have in mind');
    fieldLabel(motivation,'Why do you think this approach could reach students?');
    if(topics&&topics.placeholder!=='For example: the overall site, Paper 1 resources, IO help, study tools, contributor program…')topics.placeholder='For example: the overall site, Paper 1 resources, IO help, study tools, contributor program…';
    if(idea){if(idea.placeholder!=='Describe the campaign idea, creative direction or awareness concept in your own words.')idea.placeholder='Describe the campaign idea, creative direction or awareness concept in your own words.';if(idea.maxLength!==900)idea.maxLength=900}
    if(motivation&&motivation.placeholder!=='Explain why the chosen channel and approach fit the students you want to reach.')motivation.placeholder='Explain why the chosen channel and approach fit the students you want to reach.';
  }else{
    fieldLabel(topics,'Topics you are interested in');
    fieldLabel(idea,'What would you like to contribute?');
    fieldLabel(motivation,'Why do you want to contribute?');
    if(topics&&topics.placeholder!=='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…')topics.placeholder='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…';
    if(idea){if(idea.placeholder!=='Describe the resource, topic, review or improvement you have in mind.')idea.placeholder='Describe the resource, topic, review or improvement you have in mind.';if(idea.maxLength!==3000)idea.maxLength=3000}
    if(motivation&&motivation.placeholder)motivation.placeholder='';
  }
}

function syncPromotionForm(form:HTMLFormElement){
  const brief=ensureBrief(form);if(!brief)return;
  const active=promotionActive(form);
  if(brief.hidden===active)brief.hidden=!active;
  brief.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[data-promotion-required]').forEach(control=>{if(control.required!==active)control.required=active;if(control.disabled===active)control.disabled=!active});
  brief.querySelectorAll<HTMLInputElement>('input[name="promotion_channel"]').forEach(control=>{if(control.disabled===active)control.disabled=!active});
  syncGeneralQuestions(form,active);
}

function checkedChannels(form:HTMLFormElement){return Array.from(form.querySelectorAll<HTMLInputElement>('input[name="promotion_channel"]:checked')).map(input=>input.value)}
function clean(value:string){return value.trim().replace(/\s+/g,' ')}

function buildPromotionPlan(form:HTMLFormElement){
  const get=(name:string)=>clean((form.elements.namedItem(name) as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|null)?.value||'');
  return [
    PLAN_MARKER,
    `Channels: ${checkedChannels(form).join(', ')}`,
    `Format: ${get('promotion_format')}`,
    `Target audience: ${get('promotion_audience')}`,
    `Distribution: ${get('promotion_distribution')}`,
    `Call to action: ${get('promotion_action')}`,
    `Main message / angle: ${get('promotion_message')}`,
    `Execution plan: ${get('promotion_execution')}`,
    `Evidence plan: ${get('promotion_evidence')}`,
    `Success measure: ${get('promotion_success')}`
  ].join('\n');
}

function validateAndAttachPlan(event:SubmitEvent,form:HTMLFormElement){
  if(!promotionActive(form))return true;
  syncPromotionForm(form);
  const channelError=form.querySelector<HTMLElement>('[data-channel-error]');
  const channels=checkedChannels(form);
  if(!channels.length){
    event.preventDefault();event.stopImmediatePropagation();
    if(channelError){channelError.textContent='Choose at least one promotion channel.';channelError.dataset.state='error'}
    form.querySelector<HTMLElement>('[data-promotion-channels]')?.scrollIntoView({behavior:'smooth',block:'center'});
    return false;
  }
  if(channelError){channelError.textContent='';channelError.dataset.state=''}
  if(!form.checkValidity()){
    event.preventDefault();event.stopImmediatePropagation();form.reportValidity();return false;
  }
  const idea=form.querySelector<HTMLTextAreaElement>('textarea[name="contribution_idea"]');if(!idea)return true;
  const original=idea.value.split(`\n\n${PLAN_MARKER}`)[0].trim();
  const combined=`${original}\n\n${buildPromotionPlan(form)}`.trim();
  if(combined.length>3000){
    event.preventDefault();event.stopImmediatePropagation();
    const status=form.querySelector<HTMLElement>('#ll-contributor-status');if(status){status.textContent='Your promotion plan is detailed, but the full proposal is too long. Shorten the campaign description slightly and submit again.';status.dataset.state='error'}
    idea.focus();return false;
  }
  idea.value=combined;
  return true;
}

function enhance(){
  if(location.hash.replace(/^#/,'').split('#')[0]!=='contribute')return;
  const form=document.getElementById(FORM_ID) as HTMLFormElement|null;if(!form)return;
  syncPromotionForm(form);
}

function scheduleEnhance(delay=80){
  window.clearTimeout(enhanceTimer);
  enhanceTimer=window.setTimeout(enhance,delay);
}

document.addEventListener('change',event=>{
  const form=(event.target as Element|null)?.closest<HTMLFormElement>(`#${FORM_ID}`);if(!form)return;
  scheduleEnhance(20);
},true);

document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!==FORM_ID)return;
  validateAndAttachPlan(event as SubmitEvent,form);
},true);

window.addEventListener('hashchange',()=>scheduleEnhance(120));
window.addEventListener('focus',()=>scheduleEnhance(60));
window.addEventListener('litlab:contributor-workspace-data',()=>scheduleEnhance(40));
window.addEventListener('litlab:open-contributor-application',()=>scheduleEnhance(40));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleEnhance(0),{once:true});else scheduleEnhance(0);

export {};
