const route=()=>location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home';
let timer=0;
let attempts=0;

function setLabel(control:Element|null,text:string){const label=control?.closest('label');const span=label?.querySelector<HTMLElement>(':scope > span');if(span)span.textContent=text}
function role(form:HTMLFormElement){return form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student'}
function sync(form:HTMLFormElement){
  const teacher=role(form)==='teacher';
  const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');
  if(mentee){
    mentee.required=false;
    const label=mentee.closest('label');
    const span=label?.querySelector<HTMLElement>(':scope > span');
    const small=label?.querySelector<HTMLElement>('small');
    if(span)span.textContent='Student email (optional)';
    if(small)small.textContent='Only add this if you already mentor or review a specific LitLab student. General teacher reviewers can leave it blank.';
  }
  const topics=form.querySelector('textarea[name="topics"]');
  const idea=form.querySelector('textarea[name="contribution_idea"]');
  const motivation=form.querySelector('textarea[name="motivation"]');
  const experience=form.querySelector('textarea[name="experience"]');
  const availability=form.querySelector('textarea[name="availability"]');
  if(teacher){
    setLabel(topics,'DP areas, books or skills you can review');
    setLabel(idea,'How would you like to support LitLab contributors?');
    setLabel(motivation,'Why do you want to review or mentor for LitLab?');
    setLabel(experience,'Teaching / reviewing experience (optional)');
    setLabel(availability,'Review availability (optional)');
    if(topics instanceof HTMLTextAreaElement)topics.placeholder='Paper 1, Paper 2, IO, EE, specific literary works, language analysis, academic writing…';
    if(idea instanceof HTMLTextAreaElement)idea.placeholder='For example: review student DOCX drafts for DP accuracy, mentor Paper 1 resources, or check literary analysis.';
    if(experience instanceof HTMLTextAreaElement)experience.placeholder='Years teaching, courses taught, examining/review experience, curriculum strengths…';
    if(availability instanceof HTMLTextAreaElement)availability.placeholder='For example: one review per week, weekends, or occasional mentoring.';
  }else{
    setLabel(topics,'Topics you are interested in');
    setLabel(idea,'What would you like to contribute?');
    setLabel(motivation,'Why do you want to contribute?');
    setLabel(experience,'Relevant strengths / experience (optional)');
    setLabel(availability,'Availability (optional)');
    if(topics instanceof HTMLTextAreaElement)topics.placeholder='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, glossary terms…';
    if(idea instanceof HTMLTextAreaElement)idea.placeholder='Describe the resource, topic, review or improvement you have in mind.';
    if(experience instanceof HTMLTextAreaElement)experience.placeholder='';
    if(availability instanceof HTMLTextAreaElement)availability.placeholder='For example: around 1–2 hours per week for a month';
  }
}

function scan(){clearTimeout(timer);if(route()!=='contribute')return;const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');if(form){attempts=0;sync(form);return}if(attempts++<20)timer=window.setTimeout(scan,100)}

document.addEventListener('change',event=>{const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-contributor-form');if(form)setTimeout(()=>sync(form),0)},true);

// The existing account workflow validates the form in capture phase. For a
// general teacher reviewer with no named student, temporarily disable the
// blank optional mentee field so HTML validity correctly treats it as optional.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form||form.id!=='ll-contributor-form'||role(form)!=='teacher')return;
  const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');
  if(mentee&&!mentee.value.trim()){
    mentee.disabled=true;
    setTimeout(()=>{if(mentee.isConnected){mentee.disabled=false;mentee.required=false}},0);
  }
},true);

window.addEventListener('hashchange',()=>{attempts=0;setTimeout(scan,80)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
