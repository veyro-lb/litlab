type Row=Record<string,any>;
let workspaces:Row[]=[];
let assignments:Row[]=[];
let selectedId='';
let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function promotion(x:Row|null|undefined){return String(x?.contribution_type||'').trim().toLowerCase()==='promotion'}
function current(){return workspaces.find(x=>x.id===selectedId)||workspaces[0]||null}
function cardContributionType(card:HTMLElement){return card.querySelector<HTMLElement>('.admin-contrib-summary-meta span:nth-child(2)')?.textContent?.trim().toLowerCase()||''}

function protectStudent(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root||!promotion(current()))return;
  root.querySelectorAll<HTMLElement>('[data-review-lifecycle-path],[data-lifecycle-complete-card],[data-final-review-handoff-note],[data-upload-route-box],[data-lifecycle-lock],[data-contributor-completion-archive]').forEach(el=>el.hidden=true);
  root.querySelectorAll<HTMLElement>('.ll-workspace-docs,[data-admin-final-review-document]').forEach(el=>el.hidden=true);
}

function protectTeacher(){
  if(!assignments.some(promotion))return;
  document.querySelectorAll<HTMLElement>('.ll-teacher-assignment').forEach((card,index)=>{
    const a=assignments[index];if(!promotion(a))return;
    card.querySelectorAll<HTMLElement>('[data-teacher-action-summary],[data-teacher-decision-guide],[data-teacher-final-handoff-note],[data-teacher-final-doc-badge]').forEach(el=>el.hidden=true);
  });
  // These older aggregate panels infer state from DOCX presence and become inaccurate
  // as soon as a Promotion assignment is in the queue. The contribution cards below
  // remain the authoritative mixed-type workspace.
  document.querySelectorAll<HTMLElement>('[data-teacher-queue-summary],[data-teacher-student-center]').forEach(el=>el.hidden=true);
}

function restoreSupervisorForm(modal:HTMLElement,center:HTMLElement){
  const form=center.querySelector<HTMLFormElement>('form[data-admin-assign-teacher]');if(!form)return;
  const cards=Array.from(modal.querySelectorAll<HTMLElement>('.ll-admin-workspace-grid > .ll-admin-workspace-card'));
  const supervisor=cards.find(card=>{
    const k=card.querySelector<HTMLElement>('.ll-admin-workspace-title span')?.textContent?.trim().toUpperCase()||'';
    return k==='CAS SUPERVISOR'||k==='TEACHER REVIEWER';
  });
  if(!supervisor)return;
  supervisor.classList.remove('ll-admin-card-consolidated');
  if(!supervisor.contains(form))supervisor.appendChild(form);
}

function protectAdminCards(){
  document.querySelectorAll<HTMLElement>('.admin-contrib-card').forEach(card=>{
    if(cardContributionType(card)!=='promotion')return;
    card.querySelectorAll<HTMLElement>('[data-admin-student-review-owner]').forEach(el=>el.hidden=true);
    const manage=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');if(manage)manage.textContent='Open promotion review';
  });
}

function protectAdminModal(){
  const modal=document.getElementById('ll-admin-contributor-workspace');if(!modal?.classList.contains('ll-admin-promotion-mode'))return;
  const legacy=modal.querySelector<HTMLElement>('[data-admin-review-decision-center]');
  if(legacy){restoreSupervisorForm(modal,legacy);legacy.remove()}
  modal.querySelectorAll<HTMLElement>('[data-admin-final-review-document]').forEach(el=>el.hidden=true);
  const cards=Array.from(modal.querySelectorAll<HTMLElement>('.ll-admin-workspace-grid > .ll-admin-workspace-card'));
  cards.forEach(card=>{
    const k=card.querySelector<HTMLElement>('.ll-admin-workspace-title span')?.textContent?.trim().toUpperCase()||'';
    if(k==='CAS SUPERVISOR'||k==='TEACHER REVIEWER')card.classList.remove('ll-admin-card-consolidated');
    if(k==='SUPERVISOR REVIEWS'||k==='TEACHER REVIEWS'||k==='WORD DOCUMENTS')card.hidden=true;
  });
}

function apply(){
  if(route()==='contribute'){protectStudent();protectTeacher()}
  if(route()==='admin-contributors'){protectAdminCards();protectAdminModal()}
}
function schedule(delay=120){clearTimeout(timer);timer=window.setTimeout(apply,delay)}

window.addEventListener('litlab:contributor-workspace-data',event=>{const d=(event as CustomEvent<Row>).detail||{};if(Array.isArray(d.workspaces))workspaces=d.workspaces;if(Array.isArray(d.assignments))assignments=d.assignments;if(typeof d.selectedId==='string')selectedId=d.selectedId;schedule(220)});
window.addEventListener('litlab:contributor-workspace-updated',()=>schedule(260));
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>schedule(280));
window.addEventListener('litlab:admin-contributor-workspace-updated',()=>schedule(280));
window.addEventListener('litlab:contributor-admin-updated',()=>schedule(220));
window.addEventListener('hashchange',()=>schedule(160));
window.addEventListener('focus',()=>schedule(80));
const observer=new MutationObserver(()=>schedule(180));observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(0),{once:true});else schedule(0);

export {};
