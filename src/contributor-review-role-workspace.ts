import './contributor-review-role-workspace.css';

type ReviewContext='academic'|'cas'|'combined';

type WorkspaceCopy={
  badge:string;
  title:string;
  intro:string;
  criteria:Record<string,[string,string]>;
  strengths:[string,string];
  improvements:[string,string];
  nextSteps:[string,string];
  summary:[string,string];
  request:string;
  approve:string;
  declarationTitle:string;
  declarationCopy:string;
  declaration:string;
  fileTitle:string;
  fileCopy:string;
  submit:string;
};

const COPY:Record<ReviewContext,WorkspaceCopy>={
  cas:{
    badge:'CAS SUPERVISOR REVIEW',
    title:'CAS Supervisor / Coordinator Review',
    intro:'Review the student’s participation, ownership, process, evidence and reflection. Your approval confirms the CAS evidence you reviewed; it does not certify the academic accuracy of the DP English contribution.',
    criteria:{
      accuracy:['Student ownership','Does the evidence show that the student genuinely led, completed and understood the work?'],
      clarity:['Initiative & engagement','Did the student show active participation, commitment and appropriate initiative?'],
      dp_relevance:['CAS process & relevance','Is the contribution meaningfully connected to the student’s stated CAS purpose or experience?'],
      originality:['Reflection & learning','Does the student reflect on decisions, challenges, learning, development or impact?'],
      sources:['Evidence quality & integrity','Is the evidence sufficient, credible and consistent with the student’s own CAS activity?']
    },
    strengths:['What did the student do well in their CAS process?','Comment on ownership, initiative, participation, reflection or evidence—not DP English academic quality.'],
    improvements:['What should improve in the CAS process, evidence or reflection?','Identify missing, weak or unclear CAS evidence and what the student should strengthen.'],
    nextSteps:['Required CAS next steps','List the exact CAS evidence, reflection or process changes needed before you can approve.'],
    summary:['CAS supervisor summary','Briefly describe the student’s participation, initiative, development and the evidence you reviewed.'],
    request:'Request CAS changes — return to student',
    approve:'Approve CAS evidence — send to LitLab admin',
    declarationTitle:'CAS supervisor testimony',
    declarationCopy:'Your approval is evidence of the student’s CAS process. It is deliberately separate from LitLab’s academic/content review.',
    declaration:'I confirm that I reviewed the student’s submitted CAS evidence and that my ratings/comments reflect my own judgment of the student’s participation and process. I am not using this approval to certify DP English academic accuracy.',
    fileTitle:'Optional CAS supporting / annotated Word file',
    fileCopy:'If you added CAS-related comments, evidence notes or tracked changes, you may return the annotated .docx. LitLab stores it privately with this review.',
    submit:'Submit CAS supervisor decision'
  },
  academic:{
    badge:'ACADEMIC REVIEW',
    title:'English / Language & Literature Teacher Review',
    intro:'Review the current DOCX for DP English academic quality. Your approval confirms the academic review of this version; it does not approve the student’s school CAS record.',
    criteria:{
      accuracy:['Academic accuracy','Are claims, terminology and explanations academically sound for DP English?'],
      clarity:['Clarity & explanation','Is the contribution clear, precise, understandable and appropriately expressed?'],
      dp_relevance:['DP relevance','Is the content useful and relevant to DP English A learning, assessment or skills?'],
      originality:['Student ownership','Does the work show authentic student-created thinking rather than copied or over-produced material?'],
      sources:['Source use & integrity','Are sources, quotations and attributions appropriate, transparent and responsible?']
    },
    strengths:['Academic strengths','Identify the strongest academic/content features the student should preserve.'],
    improvements:['Academic improvements','Explain the most important academic revision targets and why they matter.'],
    nextSteps:['Specific academic corrections / next steps','List precise content checks, corrections or next actions without rewriting assessed work for the student.'],
    summary:['Academic review summary','Give a concise academic judgment that the student and LitLab admin can understand later.'],
    request:'Request academic changes — return to student',
    approve:'Approve academic review — send to LitLab admin',
    declarationTitle:'Academic reviewer declaration',
    declarationCopy:'Your approval applies to this exact DOCX version and the academic review you completed.',
    declaration:'I confirm that I reviewed the current DOCX from an academic DP English perspective and that my ratings/comments reflect my own review. I am not using this approval as school CAS approval.',
    fileTitle:'Optional annotated Word file',
    fileCopy:'If you used Word comments or tracked changes for academic feedback, you can return that annotated .docx to the student. LitLab stores it privately with this review.',
    submit:'Submit academic reviewer decision'
  },
  combined:{
    badge:'COMBINED REVIEW',
    title:'English Teacher + CAS Supervisor Review',
    intro:'You are reviewing in both capacities. Score both academic quality and the student’s CAS process only where you genuinely have authority to do so.',
    criteria:{
      accuracy:['Academic accuracy & ownership','Consider academic accuracy together with clear evidence that the student owns the work.'],
      clarity:['Clarity & evidence','Consider both communication quality and whether the supporting evidence is clear and sufficient.'],
      dp_relevance:['DP + CAS relevance','Consider relevance to DP English and to the student’s stated CAS purpose/process.'],
      originality:['Originality, initiative & reflection','Consider student-created thinking, initiative and meaningful reflection.'],
      sources:['Sources & evidence integrity','Consider academic source use and the credibility of the CAS evidence trail.']
    },
    strengths:['What is strong across both perspectives?','Separate academic strengths from CAS-process strengths where useful.'],
    improvements:['What should be improved?','Identify academic and/or CAS-process weaknesses clearly so the student knows which area needs work.'],
    nextSteps:['Required next steps','List precise academic and/or CAS evidence actions. Make the scope of each action clear.'],
    summary:['Combined review summary','Summarize what you verified academically and what you verified as a CAS supervisor.'],
    request:'Request changes — return to student',
    approve:'Approve combined review — send to LitLab admin',
    declarationTitle:'Combined reviewer declaration',
    declarationCopy:'Your approval records both capacities for this review, so only approve if you actually completed both perspectives.',
    declaration:'I confirm that I reviewed this version in both an academic DP English capacity and a CAS-supervision capacity, and that my ratings/comments accurately distinguish what I verified in each role.',
    fileTitle:'Optional annotated Word file',
    fileCopy:'You may attach an annotated .docx containing academic and/or CAS-related comments. LitLab stores it privately with this review.',
    submit:'Submit combined reviewer decision'
  }
};

let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function context(form:HTMLFormElement):ReviewContext{
  const value=form.querySelector<HTMLSelectElement|HTMLInputElement>('[name="review_context"]')?.value;
  return value==='cas'||value==='combined'||value==='academic'?value:'academic';
}
function labelNode(field:Element|null){return field?.closest('label')?.querySelector<HTMLElement>(':scope > span')||field?.closest('label')?.querySelector<HTMLElement>('span')||null}
function setHelp(field:Element|null,text:string){
  const label=field?.closest<HTMLLabelElement>('label');if(!label)return;
  let help=label.querySelector<HTMLElement>(':scope > small[data-role-field-help]');
  if(!help){help=document.createElement('small');help.dataset.roleFieldHelp='true';label.appendChild(help)}
  help.textContent=text;
}
function setCriterion(form:HTMLFormElement,name:string,title:string,help:string){
  const field=form.querySelector<HTMLSelectElement>(`select[name="${name}"]`);if(!field)return;
  const label=labelNode(field);if(label)label.textContent=title;
  setHelp(field,help);
}
function setTextArea(form:HTMLFormElement,name:string,title:string,placeholder:string){
  const field=form.querySelector<HTMLTextAreaElement>(`textarea[name="${name}"]`);if(!field)return;
  const label=labelNode(field);if(label)label.textContent=title;
  field.placeholder=placeholder;
}
function setDecision(form:HTMLFormElement,copy:WorkspaceCopy){
  const select=form.querySelector<HTMLSelectElement>('select[name="recommendation"]');if(!select)return;
  const request=Array.from(select.options).find(option=>option.value==='request_changes');
  const approve=Array.from(select.options).find(option=>option.value==='approve');
  if(request)request.textContent=copy.request;
  if(approve)approve.textContent=copy.approve;
}
function setFileCopy(form:HTMLFormElement,copy:WorkspaceCopy){
  const box=form.querySelector<HTMLElement>('.ll-role-annotated');if(!box)return;
  const title=box.querySelector<HTMLElement>('b');const paragraph=box.querySelector<HTMLElement>('p');
  if(title)title.textContent=copy.fileTitle;
  if(paragraph)paragraph.textContent=copy.fileCopy;
}
function declaration(form:HTMLFormElement,ctx:ReviewContext,copy:WorkspaceCopy){
  let box=form.querySelector<HTMLElement>('[data-role-specific-declaration]');
  if(!box){
    box=document.createElement('div');box.className='ll-role-specific-declaration';box.dataset.roleSpecificDeclaration='true';
    const anchor=form.querySelector('.ll-role-annotated,.ll-role-review-actions');
    if(anchor)anchor.before(box);else form.appendChild(box);
  }
  const checked=box.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked||false;
  box.innerHTML=`<span>${copy.declarationTitle}</span><p>${copy.declarationCopy}</p><label><input type="checkbox" name="role_scope_confirmation" required ${checked?'checked':''}/><b>${copy.declaration}</b></label>`;
  box.dataset.reviewContext=ctx;
}
function identity(form:HTMLFormElement,ctx:ReviewContext,copy:WorkspaceCopy){
  const intro=form.querySelector<HTMLElement>('.ll-role-review-intro');if(!intro)return;
  intro.dataset.reviewContext=ctx;
  const title=intro.querySelector<HTMLElement>('b');const text=intro.querySelector<HTMLElement>('[data-role-review-copy],span');
  if(title)title.textContent=copy.title;
  if(text)text.textContent=copy.intro;
  let badge=intro.querySelector<HTMLElement>('[data-role-workspace-badge]');
  if(!badge){badge=document.createElement('em');badge.dataset.roleWorkspaceBadge='true';intro.prepend(badge)}
  badge.textContent=copy.badge;
}
function renderForm(form:HTMLFormElement){
  const ctx=context(form);const copy=COPY[ctx];
  if(form.dataset.roleWorkspaceContext===ctx&&form.querySelector('[data-role-specific-declaration]'))return;
  form.dataset.roleWorkspaceContext=ctx;
  identity(form,ctx,copy);
  Object.entries(copy.criteria).forEach(([name,[title,help]])=>setCriterion(form,name,title,help));
  setTextArea(form,'strengths',...copy.strengths);
  setTextArea(form,'improvements',...copy.improvements);
  setTextArea(form,'specific_corrections',...copy.nextSteps);
  setTextArea(form,'summary',...copy.summary);
  setDecision(form,copy);
  setFileCopy(form,copy);
  declaration(form,ctx,copy);
  const button=form.querySelector<HTMLButtonElement>('.ll-role-review-actions button[type="submit"]');if(button&&!button.disabled)button.textContent=copy.submit;
}
function renderAll(){
  if(route()!=='contribute')return;
  document.querySelectorAll<HTMLFormElement>('form[data-role-aware-review]').forEach(renderForm);
}
function scan(){window.clearTimeout(timer);renderAll();if(route()==='contribute')timer=window.setTimeout(scan,350)}

document.addEventListener('change',event=>{
  const target=event.target instanceof HTMLSelectElement?event.target:null;
  if(target?.name!=='review_context')return;
  window.setTimeout(()=>{const form=target.closest<HTMLFormElement>('form[data-role-aware-review]');if(form){form.dataset.roleWorkspaceContext='';renderForm(form)}},0);
},true);
for(const eventName of ['litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-account-role'])window.addEventListener(eventName,()=>setTimeout(()=>void scan(),60));
window.addEventListener('hashchange',()=>void scan());
window.addEventListener('focus',()=>void scan());

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void scan(),{once:true});
else void scan();

export {};
