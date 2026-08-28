import './contributor-form-validation.css';

type ApplicantType='student'|'teacher';
type Field=HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement;

function isActive(field:Field){
  return !field.disabled&&!field.closest('[hidden]')&&!field.form?.hidden;
}

function trimmedValid(field:Field){
  if(!isActive(field))return true;
  if(field instanceof HTMLInputElement&&(field.type==='checkbox'||field.type==='radio')){
    if(!field.required)return true;
    if(field.type==='radio')return !!field.form?.querySelector<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]:checked`);
    return field.checked;
  }
  if(field.required&&!field.value.trim())return false;
  const min=Number(field.getAttribute('minlength')||0);
  if(field.required&&min&&field.value.trim().length<min)return false;
  return field.checkValidity();
}

function setRequired(field:Field|null,required:boolean){
  if(field)field.required=required;
}

function applyRules(form:HTMLFormElement){
  const role=(form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student') as ApplicantType;
  const casIntent=form.querySelector<HTMLSelectElement>('select[name="cas_intent"]')?.value||'maybe';
  const supervision=form.querySelector<HTMLSelectElement>('select[name="student_supervision"]');
  const supervisionValue=supervision?.value||'';

  setRequired(form.querySelector<HTMLSelectElement>('select[name="dp_year"]'),role==='student');
  setRequired(form.querySelector<HTMLSelectElement>('select[name="cas_intent"]'),role==='student');
  setRequired(form.querySelector<HTMLInputElement>('input[name="subject_taught"]'),role==='teacher');

  setRequired(supervision,role==='student');
  setRequired(form.querySelector<HTMLInputElement>('input[name="mentor_email"]'),role==='student'&&supervisionValue==='yes');
  setRequired(form.querySelector<HTMLInputElement>('input[name="mentee_email"]'),role==='teacher');

  const requireCas=role==='student'&&casIntent==='yes';
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_goal"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_impact"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_success"]'),requireCas);

  const checks=Array.from(form.querySelectorAll<HTMLLabelElement>('.ll-contrib-check'));
  const casCheck=checks.find(label=>label.textContent?.includes('CAS approval'));
  const casCheckbox=casCheck?.querySelector<HTMLInputElement>('input[type="checkbox"]')||null;
  if(casCheck)casCheck.hidden=role==='teacher';
  if(casCheckbox)casCheckbox.required=role==='student';

  syncFieldLabels(form);
}

function hasWrittenOptional(label:HTMLLabelElement){
  return /\boptional\b/i.test(label.querySelector(':scope > span:first-of-type')?.textContent||'');
}

function syncFieldLabels(form:HTMLFormElement){
  form.querySelectorAll<HTMLLabelElement>('label').forEach(label=>{
    const field=label.querySelector<Field>(':scope > input, :scope > textarea, :scope > select');
    if(!field||field instanceof HTMLInputElement&&(field.type==='checkbox'||field.type==='radio')||!isActive(field)){
      label.classList.remove('ll-contrib-is-required','ll-contrib-is-optional');
      return;
    }
    const required=field.required;
    label.classList.toggle('ll-contrib-is-required',required);
    label.classList.toggle('ll-contrib-is-optional',!required&&!hasWrittenOptional(label));
  });
}

function formComplete(form:HTMLFormElement){
  applyRules(form);
  const fields=Array.from(form.querySelectorAll<Field>('input,textarea,select'));
  return fields.every(trimmedValid);
}

function updateSubmitState(form:HTMLFormElement){
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  if(!button)return;
  const complete=formComplete(form);

  // Never leave the submit button stuck disabled. Invalid forms are blocked
  // at click/submit time and the exact missing field is highlighted instead.
  if(button.dataset.submitting!=='true')button.disabled=false;
  button.classList.remove('ll-contrib-submit-disabled');
  button.dataset.ready=complete?'true':'false';

  if(status&&status.dataset.state!=='success'){
    status.textContent=complete?'All required fields are complete — ready to submit.':'Complete all required fields to submit.';
    status.dataset.state=complete?'ready':'incomplete';
  }
}

function invalidFields(form:HTMLFormElement){
  applyRules(form);
  return Array.from(form.querySelectorAll<Field>('input,textarea,select')).filter(field=>isActive(field)&&!trimmedValid(field));
}

function markInvalid(form:HTMLFormElement){
  const invalid=invalidFields(form);
  const all=Array.from(form.querySelectorAll<Field>('input,textarea,select'));
  all.forEach(field=>field.classList.toggle('ll-contrib-invalid',invalid.includes(field)));
  const first=invalid[0];
  if(first){
    first.focus({preventScroll:true});
    first.scrollIntoView({behavior:'smooth',block:'center'});
  }
  return invalid;
}

function showIncomplete(form:HTMLFormElement){
  const invalid=markInvalid(form);
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  if(status){
    status.textContent=invalid.length===1?'1 required field still needs attention.':`${invalid.length} required fields still need attention.`;
    status.dataset.state='incomplete';
  }
  form.reportValidity();
}

function scheduleValidation(form:HTMLFormElement){
  if(form.dataset.validationRefreshQueued==='true')return;
  form.dataset.validationRefreshQueued='true';
  requestAnimationFrame(()=>{
    delete form.dataset.validationRefreshQueued;
    if(form.isConnected)updateSubmitState(form);
  });
}

function wire(form:HTMLFormElement){
  if(form.dataset.strictValidation==='true')return;
  form.dataset.strictValidation='true';
  updateSubmitState(form);

  form.addEventListener('input',event=>{
    const target=event.target;
    if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement)target.classList.remove('ll-contrib-invalid');
    scheduleValidation(form);
  });
  form.addEventListener('change',()=>scheduleValidation(form));

  form.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button[type="submit"]'):null;
    if(!target||target.dataset.submitting==='true')return;
    applyRules(form);
    if(formComplete(form))return;
    event.preventDefault();
    showIncomplete(form);
  });

  new MutationObserver(()=>scheduleValidation(form)).observe(form,{
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['required','hidden','disabled','readonly']
  });
}

function scan(){document.querySelectorAll<HTMLFormElement>('#ll-contributor-form').forEach(wire)}

// Capture submission before the contributor-program/account handlers so incomplete forms can never be posted.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form')return;
  applyRules(form);
  if(formComplete(form))return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  showIncomplete(form);
},true);

new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
