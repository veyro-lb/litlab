import './contributor-page-experience.css';

type ContributorRole=''|'student'|'teacher'|'admin';
type WorkItem={icon:string;title:string;copy:string;tag:string};

let scheduled=false;
let revealObserver:IntersectionObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function accountRole():ContributorRole{
  const value=root()?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'||value==='admin'?value:'';
}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

const icons={
  create:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.75h9.5L19 9.2v10.05H5z"/><path d="M14.5 4.75V9.2H19M8 13h8M8 16h6"/></svg>',
  research:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m14.6 14.6 4.4 4.4M8.5 10.5h4M10.5 8.5v4"/></svg>',
  practice:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 6.5h6.25a2.75 2.75 0 0 1 2.75 2.75V19a3.25 3.25 0 0 0-3.25-3.25H4.5z"/><path d="M19.5 6.5h-6a2.75 2.75 0 0 0-2.75 2.75M16.5 10h-2.5M16.5 13h-2.5"/></svg>',
  promote:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 9-5v8l-9-3Z"/><path d="M14 10.25h2.5a2.5 2.5 0 0 1 0 5H14M6.5 13.5l1.25 4"/></svg>',
  review:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.75h9l3 3v11.5H6z"/><path d="m9 13 2 2 4-5M15 4.75v3h3"/></svg>',
  feedback:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H10l-4 3v-3H5z"/><path d="M8.5 9h7M8.5 12h5"/></svg>',
  rubric:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h12v15H6z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
  mentor:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M4.5 18c.7-3 2.3-4.5 4.5-4.5s3.8 1.5 4.5 4.5M14 18c.4-1.9 1.4-3 3-3 1.4 0 2.4.9 2.9 2.5"/></svg>'
};

function workItems(role:ContributorRole):{eyebrow:string;title:string;copy:string;items:WorkItem[];foot:string}{
  if(role==='teacher')return {
    eyebrow:'TEACHER REVIEW WORK',
    title:'What you can do for students',
    copy:'A focused reviewer workspace — no evidence ledger and no website-management work.',
    items:[
      {icon:icons.review,title:'Review DOCX work',copy:'Open the current student submission and check academic quality.',tag:'Student work'},
      {icon:icons.feedback,title:'Give useful feedback',copy:'Point out strengths and give exact, actionable revision requests.',tag:'Clear next steps'},
      {icon:icons.rubric,title:'Score & decide',copy:'Use the LitLab rubric, then approve or request changes for that version.',tag:'Rubric'},
      {icon:icons.mentor,title:'Mentor multiple students',copy:'Move between assigned students from one clean roster and review only what needs you.',tag:'One account'}
    ],
    foot:'LitLab handles publishing, website code and final admin decisions.'
  };
  if(role==='student')return {
    eyebrow:'STUDENT CONTRIBUTIONS',
    title:'What you can work on',
    copy:'Choose one useful outcome and keep the contribution focused enough to finish well.',
    items:[
      {icon:icons.create,title:'Create resources',copy:'Explanations, revision guides, book resources and helpful study material.',tag:'Content'},
      {icon:icons.research,title:'Research accurately',copy:'Reliable source notes, examples and fact-checking that improve LitLab content.',tag:'Research'},
      {icon:icons.practice,title:'Build original practice',copy:'DP-style questions, mock prompts, practice tasks and sample responses.',tag:'Practice'},
      {icon:icons.promote,title:'Promote LitLab',copy:'Awareness materials or outreach that help more students discover useful resources.',tag:'Promotion'}
    ],
    foot:'Do not copy official IB papers, mark schemes or copyrighted study guides. Website code and UI stay with the LitLab development team.'
  };
  return {
    eyebrow:'WAYS TO CONTRIBUTE',
    title:'What contributors can work on',
    copy:'Pick a focused way to help. Student accounts create; Teacher accounts review and mentor.',
    items:[
      {icon:icons.create,title:'Create',copy:'Guides, explanations, book resources and original learning material.',tag:'Students'},
      {icon:icons.research,title:'Research',copy:'Source-based notes, examples, fact-checking and original practice material.',tag:'Students'},
      {icon:icons.review,title:'Review',copy:'Clarity, academic accuracy, DP relevance and constructive feedback.',tag:'Students + teachers'},
      {icon:icons.mentor,title:'Mentor',copy:'Teachers review assigned student DOCXs, give feedback and guide revisions.',tag:'Teachers'}
    ],
    foot:'Website coding, UI and publishing controls remain with the LitLab development team.'
  };
}

function enhanceWorkOptions(host:HTMLElement){
  const card=host.querySelector<HTMLElement>('.ll-contrib-hero-card');if(!card)return;
  const role=accountRole();const signature=role||'guest';if(card.dataset.experienceSignature===signature)return;
  const model=workItems(role);card.dataset.experienceSignature=signature;card.classList.add('ll-work-options');
  card.innerHTML=`<div class="ll-work-options-head"><span>${esc(model.eyebrow)}</span><h2>${esc(model.title)}</h2><p>${esc(model.copy)}</p></div><div class="ll-work-options-grid">${model.items.map((item,index)=>`<article style="--ll-work-index:${index}"><i>${item.icon}</i><div><b>${esc(item.title)}</b><p>${esc(item.copy)}</p></div><em>${esc(item.tag)}</em></article>`).join('')}</div><div class="ll-work-options-foot"><span>✓</span><p>${esc(model.foot)}</p></div>`;
  prepareReveal(card);
}

function enhanceRoleCards(host:HTMLElement){
  const cards=Array.from(host.querySelectorAll<HTMLElement>('.ll-contrib-role-grid article'));
  const student=cards.find(card=>/DP Student/i.test(card.querySelector('h3')?.textContent||''));
  const teacher=cards.find(card=>/Teacher Reviewer/i.test(card.querySelector('h3')?.textContent||''));
  if(student&&student.dataset.experienceCopy!=='true'){
    student.dataset.experienceCopy='true';
    const p=student.querySelector('p');const ul=student.querySelector('ul');
    if(p)p.textContent='Create a useful resource or improve an existing one for other DP English students.';
    if(ul)ul.innerHTML='<li>Content, research, practice or review</li><li>Optional CAS planning for student accounts</li><li>Certificate after approved completed work</li>';
  }
  if(teacher&&teacher.dataset.experienceCopy!=='true'){
    teacher.dataset.experienceCopy='true';
    const p=teacher.querySelector('p');const ul=teacher.querySelector('ul');
    if(p)p.textContent='Review assigned student work, give academic feedback and mentor revisions in one Teacher workspace.';
    if(ul)ul.innerHTML='<li>Review current student DOCX versions</li><li>Rubric scores, feedback and testimony</li><li>One accepted account can mentor multiple students</li>';
  }
  cards.forEach(prepareReveal);
}

function compactCasKit(host:HTMLElement){
  const kit=host.querySelector<HTMLElement>('.ll-contrib-cas-kit');if(!kit||kit.querySelector('[data-compact-cas-kit]'))return;
  const items=Array.from(kit.querySelectorAll('li')).map(li=>li.textContent?.trim()).filter(Boolean) as string[];
  if(!items.length)return;
  kit.classList.add('ll-cas-kit-compact');
  kit.innerHTML=`<details data-compact-cas-kit><summary><div><span>CAS EVIDENCE CHECKLIST</span><b>What to keep as you work</b><small>${items.length} useful evidence types • open when needed</small></div><i aria-hidden="true">+</i></summary><div class="ll-cas-kit-body"><ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div></details>`;
}

function groupLabel(text:string,copy:string){const el=document.createElement('div');el.className='ll-contrib-form-group-label';el.innerHTML=`<span>${esc(text)}</span><p>${esc(copy)}</p>`;return el}
function enhanceForm(host:HTMLElement){
  const form=host.querySelector<HTMLFormElement>('#ll-contributor-form');if(!form)return;
  const role=accountRole();
  let guide=form.querySelector<HTMLElement>('[data-contrib-form-guide]');
  if(!guide){guide=document.createElement('div');guide.dataset.contribFormGuide='true';guide.className='ll-contrib-form-guide';form.prepend(guide)}
  const guideSignature=role||'guest';
  if(guide.dataset.signature!==guideSignature){
    guide.dataset.signature=guideSignature;
    const roleCopy=role==='teacher'?'Teacher reviewer application':role==='student'?'Student contributor application':'Contributor application';
    guide.innerHTML=`<div><span>${esc(roleCopy.toUpperCase())}</span><b>Short, focused and reviewed by LitLab.</b><small>Complete the required fields, keep the idea specific, then submit once.</small></div><ol><li><i>1</i>About you</li><li><i>2</i>Your contribution</li><li><i>3</i>Review & submit</li></ol>`;
  }
  if(!form.querySelector('[data-form-group="about"]')){
    const firstGrid=form.querySelector<HTMLElement>('.ll-contrib-grid.two');
    if(firstGrid){const label=groupLabel('ABOUT YOU','Only include information LitLab needs for this application.');label.dataset.formGroup='about';firstGrid.before(label)}
  }
  if(!form.querySelector('[data-form-group="idea"]')){
    const type=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]')?.closest('label');
    if(type){const label=groupLabel(role==='teacher'?'REVIEW FOCUS':'YOUR CONTRIBUTION',role==='teacher'?'Tell LitLab what you can review and how you can help students.':'Keep the scope specific enough that you can finish and revise it well.');label.dataset.formGroup='idea';type.before(label)}
  }
  if(!form.querySelector('[data-form-group="confirm"]')){
    const credit=form.querySelector<HTMLElement>('.ll-contrib-credit');
    if(credit){const label=groupLabel('REVIEW & SUBMIT','Check the final preferences and confirmations before sending.');label.dataset.formGroup='confirm';credit.before(label)}
  }
}

function compactCertificate(host:HTMLElement){
  const section=host.querySelector<HTMLElement>('.ll-contrib-certificate');if(!section||section.dataset.experienceCopy==='true')return;
  section.dataset.experienceCopy='true';
  const h2=section.querySelector<HTMLElement>('h2');const p=section.querySelector<HTMLElement>(':scope > div:first-child > p');
  if(h2)h2.textContent='Approved work, clear recognition.';
  if(p)p.textContent='Completed student contributions keep their submission and review record and can receive a LitLab contributor certificate. Verified time is included only when LitLab can reasonably confirm it.';
  prepareReveal(section);
}

function fixTeacherCompletion(host:HTMLElement){
  const workspace=host.querySelector<HTMLElement>('[data-contributor-workspace]');if(!workspace)return;
  const teacher=accountRole()==='teacher'||workspace.classList.contains('ll-teacher-focused-view')||Boolean(workspace.querySelector('[data-teacher-student-center],.ll-teacher-zone'));
  if(!teacher)return;
  const card=workspace.querySelector<HTMLElement>('[data-lifecycle-complete-card]');const small=card?.querySelector<HTMLElement>('small');
  if(small){const copy='Your Teacher reviewer account stays active for other assigned students. You do not need a new application for each student.';if(small.textContent!==copy)small.textContent=copy}
}

function prepareReveal(el:Element){
  const node=el as HTMLElement;if(node.dataset.experienceReveal==='true')return;node.dataset.experienceReveal='true';
  if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){node.classList.add('ll-exp-visible');return}
  node.classList.add('ll-exp-reveal');revealObserver?.observe(node);
}
function prepareReveals(host:HTMLElement){
  host.querySelectorAll('.ll-contrib-steps article,.ll-teacher-application-launcher').forEach(prepareReveal);
}

function apply(){
  scheduled=false;if(route()!=='contribute')return;
  const host=root();if(!host)return;
  enhanceWorkOptions(host);enhanceRoleCards(host);compactCasKit(host);enhanceForm(host);compactCertificate(host);fixTeacherCompletion(host);prepareReveals(host);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

if('IntersectionObserver' in window){
  revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;(entry.target as HTMLElement).classList.add('ll-exp-visible');revealObserver?.unobserve(entry.target)})},{threshold:.12,rootMargin:'0px 0px -7%'});
}

window.addEventListener('hashchange',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('litlab:contributor-account-role',schedule);
window.addEventListener('litlab:contributor-workspace-data',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('litlab:contributor-submitted',schedule);
document.addEventListener('change',event=>{const target=event.target;if(target instanceof HTMLInputElement&&target.name==='applicant_type')schedule()});

const observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
