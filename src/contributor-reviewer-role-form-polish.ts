import './contributor-reviewer-role-form-polish.css';

type ReviewerRole='english_teacher'|'cas_supervisor'|'both';

let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

function resetNeutralCopy(section:HTMLElement,input:HTMLInputElement){
  const title=section.querySelector<HTMLElement>('[data-role-detail-title]');
  const copy=section.querySelector<HTMLElement>('[data-role-detail-copy]');
  if(title)title.textContent='Your reviewer background';
  if(copy)copy.textContent='Choose a reviewer role above, then briefly describe the experience that qualifies you for that role.';
  input.placeholder='Choose a role above, then describe your relevant teaching or supervision experience';
}

function selectedRole(form:HTMLFormElement){
  return (form.querySelector<HTMLInputElement>('input[name="reviewer_role_choice"]:checked')?.value||'') as ReviewerRole|'';
}

function polish(){
  if(route()!=='contribute')return;
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');
  if(!form)return;
  const teacher=form.querySelector<HTMLElement>('[data-teacher-fields]');
  const section=teacher?.querySelector<HTMLElement>('[data-reviewer-role-section]');
  const input=teacher?.querySelector<HTMLInputElement>('input[name="reviewer_details"]');
  if(!teacher||!section||!input||section.dataset.requiredPolish==='true')return;

  const fieldLabel=input.closest<HTMLLabelElement>('label');
  if(!fieldLabel)return;

  section.dataset.requiredPolish='true';
  section.setAttribute('role','group');
  const heading=section.querySelector<HTMLElement>('h3');
  if(heading){heading.id='ll-reviewer-role-heading';section.setAttribute('aria-labelledby',heading.id)}

  // Require an intentional reviewer-role choice instead of silently defaulting to English.
  const radios=Array.from(section.querySelectorAll<HTMLInputElement>('input[name="reviewer_role_choice"]'));
  radios.forEach(radio=>{radio.checked=false});
  if(radios[0])radios[0].required=true;

  // The reviewer background is part of the qualification check, so it is required too.
  input.required=true;
  input.minLength=8;
  input.maxLength=Math.min(input.maxLength||160,160);
  input.autocomplete='organization-title';

  // The original implementation placed the entire role chooser inside the old field label.
  // Move it out so role selection and written background are visually and semantically separate.
  fieldLabel.before(section);
  fieldLabel.classList.add('ll-reviewer-background-field');

  const oldLabel=Array.from(fieldLabel.children).find(child=>child.tagName==='SPAN') as HTMLElement|undefined;
  if(oldLabel){
    oldLabel.classList.add('ll-reviewer-background-label');
    oldLabel.innerHTML='<b>Reviewer background</b><small>Required</small>';
  }

  const detailCopy=section.querySelector<HTMLElement>('[data-role-detail-copy]');
  if(detailCopy){detailCopy.id='ll-reviewer-role-detail-copy';input.setAttribute('aria-describedby',detailCopy.id)}

  resetNeutralCopy(section,input);

  // After a choice, the existing role-aware module supplies the role-specific copy.
  // We only restore the neutral state if the group becomes unselected.
  form.addEventListener('change',event=>{
    const target=event.target instanceof HTMLInputElement?event.target:null;
    if(target?.name!=='reviewer_role_choice')return;
    if(!selectedRole(form))resetNeutralCopy(section,input);
  });
}

function scan(){
  window.clearTimeout(timer);
  if(route()!=='contribute')return;
  polish();
  timer=window.setTimeout(scan,350);
}

window.addEventListener('hashchange',()=>void scan());
window.addEventListener('focus',()=>void scan());
window.addEventListener('litlab:contributor-submitted',()=>setTimeout(()=>void scan(),80));
window.addEventListener('litlab:contributor-account-role',()=>setTimeout(()=>void scan(),80));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void scan(),{once:true});
else void scan();

export {};
