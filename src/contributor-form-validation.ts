import './contributor-form-validation.css';

type ApplicantType='student'|'teacher';

function trimmedValid(field:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement){
  if(field.disabled||field.closest('[hidden]'))return true;
  if(!field.required)return true;
  if(field instanceof HTMLInputElement&&(field.type==='checkbox'||field.type==='radio')){
    if(field.type==='radio')return !!field.form?.querySelector<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]:checked`);
    return field.checked;
  }
  const value=field.value.trim();
  if(!value)return false;
  const min=Number(field.getAttribute('minlength')||0);
  return !min||value.length>=min;
}

function setRequired(field:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null,required:boolean){
  if(!field)return;
  field.required=required;
  const label=field.closest('label');
  label?.classList.toggle('ll-contrib-is-required',required);
}

function applyRules(form:HTMLFormElement){
  const role=(form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student') as ApplicantType;
  const casIntent=form.querySelector<HTMLSelectElement>('select[name="cas_intent"]')?.value||'maybe';

  setRequired(form.querySelector<HTMLSelectElement>('select[name="dp_year"]'),role==='student');
  setRequired(form.querySelector<HTMLSelectElement>('select[name="cas_intent"]'),role==='student');
  setRequired(form.querySelector<HTMLInputElement>('input[name="subject_taught"]'),role==='teacher');

  const requireCas=role==='student'&&casIntent==='yes';
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_goal"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_impact"]'),requireCas);
  setRequired(form.querySelector<HTMLTextAreaElement>('textarea[name="cas_success"]'),requireCas);

  const checks=Array.from(form.querySelectorAll<HTMLLabelElement>('.ll-contrib-check'));
  const casCheck=checks.find(label=>label.textContent?.includes('CAS approval'));
  const casCheckbox=casCheck?.querySelector<HTMLInputElement>('input[type="checkbox"]')||null;
  if(casCheck){casCheck.hidden=role==='teacher'}
  if(casCheckbox)casCheckbox.required=role==='student';

  updateSubmitState(form);
}

function formComplete(form:HTMLFormElement){
  const fields=Array.from(form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select'));
  return fields.every(trimmedValid)&&form.checkValidity();
}

function updateSubmitState(form:HTMLFormElement){
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  if(!button)return;
  const complete=formComplete(form);
  if(button.dataset.submitting==='true')return;
  button.disabled=!complete;
  button.classList.toggle('ll-contrib-submit-disabled',!complete);
  if(status&&status.dataset.state!=='error'&&status.dataset.state!=='success'){
    status.textContent=complete?'Ready to submit.':'Complete all required fields to submit.';
    status.dataset.state=complete?'ready':'incomplete';
  }
}

function markInvalid(form:HTMLFormElement){
  const fields=Array.from(form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select'));
  fields.forEach(field=>field.classList.toggle('ll-contrib-invalid',!trimmedValid(field)||!field.checkValidity()));
  const first=fields.find(field=>field.classList.contains('ll-contrib-invalid'));
  first?.focus({preventScroll:true});
  first?.scrollIntoView({behavior:'smooth',block:'center'});
}

function wire(form:HTMLFormElement){
  if(form.dataset.strictValidation==='true')return;
  form.dataset.strictValidation='true';
  applyRules(form);
  form.addEventListener('input',event=>{
    const target=event.target;
    if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement)target.classList.remove('ll-contrib-invalid');
    updateSubmitState(form);
  });
  form.addEventListener('change',()=>applyRules(form));
}

function scan(){document.querySelectorAll<HTMLFormElement>('#ll-contributor-form').forEach(wire)}

// Capture submission before the contributor-program handler so an incomplete form can never be posted.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form')return;
  applyRules(form);
  if(formComplete(form))return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  markInvalid(form);
  const status=form.querySelector<HTMLElement>('#ll-contributor-status');
  if(status){status.textContent='Please complete every required field before submitting.';status.dataset.state='error'}
},true);

new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
