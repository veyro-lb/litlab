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
    <p class="ll-promotion-brief-intro">Keep this practical. Your main application already explains your idea, so here we only need the details needed to understand how you would carry it out.</p>

    <div class="ll-promotion-question">
      <span class="ll-promotion-question-title">Where would you promote LitLab? <b>Required — choose at least one.</b></span>
      <div class="ll-promotion-channels" data-promotion-channels>
        <label><input type="checkbox" name="promotion_channel" value="Instagram"/><span>Instagram</span></label>
        <label><input type="checkbox" name="promotion_channel" value="TikTok"/><span>TikTok</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Facebook"/><span>Facebook</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Poster / flyer"/><span>Poster / flyer</span></label>
        <label><input type="checkbox" name="promotion_channel" value="School / community outreach"/><span>School / community</span></label>
        <label><input type="checkbox" name="promotion_channel" value="Other" data-promotion-other-toggle/><span>Other</span></label>
      </div>
      <label class="ll-promotion-other" data-promotion-other-wrap hidden>
        <span>Where else would you promote it?</span>
        <input type="text" name="promotion_channel_other" data-promotion-other minlength="2" maxlength="120" placeholder="For example: school newsletter, class group, local library…"/>
      </label>
      <small data-channel-error role="status"></small>
    </div>

    <div class="ll-contrib-grid two ll-promotion-grid">
      <label><span>What would you make?</span><select name="promotion_format" data-promotion-required>
        <option value="">Choose a format</option><option>Social post / carousel</option><option>Short video / Reel / TikTok</option><option>Story series</option><option>Awareness poster / flyer</option><option>Campaign series</option><option>Presentation / outreach material</option><option>Other</option>
      </select></label>
      <label><span>Who is it for?</span><select name="promotion_audience" data-promotion-required>
        <option value="">Choose an audience</option><option>DP English students</option><option>DP students generally</option><option>Pre-DP / MYP students</option><option>Teachers / schools</option><option>Wider student community</option><option>Other</option>
      </select></label>
    </div>

    <label><span>How would you carry it out?</span><textarea name="promotion_execution" data-promotion-required minlength="15" maxlength="420" rows="3" placeholder="Briefly explain what you would make, roughly how much, when you would post or display it, and whether you already have access or permission."></textarea></label>
    <label><span>How would you show that it happened or worked?</span><textarea name="promotion_success" data-promotion-required minlength="10" maxlength="360" rows="3" placeholder="For example: final files, links, screenshots, poster photos, views, clicks, QR scans or student feedback."></textarea></label>
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
    fieldLabel(idea,'What is your promotion idea?');
    fieldLabel(motivation,'Why would this reach the right students?');
    if(topics&&topics.placeholder!=='For example: the overall site, Paper 1 resources, IO help, study tools, contributor program…')topics.placeholder='For example: the overall site, Paper 1 resources, IO help, study tools, contributor program…';
    if(idea){if(idea.placeholder!=='Describe the campaign or awareness idea in your own words.')idea.placeholder='Describe the campaign or awareness idea in your own words.';if(idea.maxLength!==900)idea.maxLength=900}
    if(motivation&&motivation.placeholder!=='Briefly explain why this approach fits the students you want to reach.')motivation.placeholder='Briefly explain why this approach fits the students you want to reach.';
  }else{
    fieldLabel(topics,'Topics you are interested in');
    fieldLabel(idea,'What would you like to contribute?');
    fieldLabel(motivation,'Why do you want to contribute?');
    if(topics&&topics.placeholder!=='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…')topics.placeholder='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…';
    if(idea){if(idea.placeholder!=='Describe the resource, topic, review or improvement you have in mind.')idea.placeholder='Describe the resource, topic, review or improvement you have in mind.';if(idea.maxLength!==3000)idea.maxLength=3000}
    if(motivation&&motivation.placeholder)motivation.placeholder='';
  }
}

function syncOtherChannel(form:HTMLFormElement,active:boolean){
  const toggle=form.querySelector<HTMLInputElement>('[data-promotion-other-toggle]');
  const wrap=form.querySelector<HTMLElement>('[data-promotion-other-wrap]');
  const input=form.querySelector<HTMLInputElement>('[data-promotion-other]');
  const show=active&&Boolean(toggle?.checked);
  if(wrap)wrap.hidden=!show;
  if(input){input.disabled=!show;input.required=show}
}

function syncPromotionForm(form:HTMLFormElement){
  const brief=ensureBrief(form);if(!brief)return;
  const active=promotionActive(form);
  if(brief.hidden===active)brief.hidden=!active;
  brief.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[data-promotion-required]').forEach(control=>{if(control.required!==active)control.required=active;if(control.disabled===active)control.disabled=!active});
  brief.querySelectorAll<HTMLInputElement>('input[name="promotion_channel"]').forEach(control=>{if(control.disabled===active)control.disabled=!active});
  syncOtherChannel(form,active);
  syncGeneralQuestions(form,active);
}

function checkedChannels(form:HTMLFormElement){
  const other=clean(form.querySelector<HTMLInputElement>('[data-promotion-other]')?.value||'');
  return Array.from(form.querySelectorAll<HTMLInputElement>('input[name="promotion_channel"]:checked')).map(input=>input.value==='Other'&&other?`Other: ${other}`:input.value);
}
function clean(value:string){return value.trim().replace(/\s+/g,' ')}

function buildPromotionPlan(form:HTMLFormElement){
  const get=(name:string)=>clean((form.elements.namedItem(name) as HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|null)?.value||'');
  return [
    PLAN_MARKER,
    `Promotion location / channel: ${checkedChannels(form).join(', ')}`,
    `Format: ${get('promotion_format')}`,
    `Audience: ${get('promotion_audience')}`,
    `Execution: ${get('promotion_execution')}`,
    `Evidence / result: ${get('promotion_success')}`
  ].join('\n');
}

function validateAndAttachPlan(event:SubmitEvent,form:HTMLFormElement){
  if(!promotionActive(form))return true;
  syncPromotionForm(form);
  const channelError=form.querySelector<HTMLElement>('[data-channel-error]');
  const channels=checkedChannels(form);
  if(!channels.length){
    event.preventDefault();event.stopImmediatePropagation();
    if(channelError){channelError.textContent='Choose at least one place or channel where you would promote LitLab.';channelError.dataset.state='error'}
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
    const status=form.querySelector<HTMLElement>('#ll-contributor-status');if(status){status.textContent='Your promotion plan is a little too long. Shorten one of the answers slightly and submit again.';status.dataset.state='error'}
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
