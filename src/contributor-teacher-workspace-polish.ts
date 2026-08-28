let timer=0;
let attempts=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function isTeacherView(host:HTMLElement){
  const starter=Array.from(host.querySelectorAll<HTMLElement>('.ll-workspace-card .ll-card-title em')).find(el=>el.textContent?.trim().toLowerCase()==='teacher review');
  return Boolean(starter);
}
function statusName(host:HTMLElement){return host.querySelector<HTMLElement>('.ll-workspace-status > div > span')?.textContent?.trim().toLowerCase()||''}
function hideCardByKicker(host:HTMLElement,kicker:string){
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{
    const text=card.querySelector<HTMLElement>('.ll-card-title span, :scope > span')?.textContent?.trim().toUpperCase()||'';
    if(text===kicker)card.hidden=true;
  });
}
function apply(){
  const host=root();if(!host)return;
  const teacher=isTeacherView(host);
  host.classList.toggle('ll-teacher-reviewer-mode',teacher);
  host.querySelectorAll<HTMLElement>('[data-teacher-reviewer-role-card]').forEach(el=>el.remove());
  if(!teacher)return;

  host.querySelectorAll<HTMLElement>('.ll-workspace-docs,.ll-workspace-brief').forEach(el=>el.hidden=true);
  hideCardByKicker(host,'STARTER STRUCTURE');

  const title=host.querySelector<HTMLElement>(':scope > .ll-workspace-head h2');
  if(title)title.textContent='Your teacher reviewer workspace.';
  const intro=host.querySelector<HTMLElement>(':scope > .ll-workspace-head p');
  if(intro)intro.textContent='Your application status, LitLab messages and assigned student reviews stay in one place. Teachers review assigned student DOCX files; they do not submit student-contributor documents themselves.';

  const timeline=host.querySelectorAll<HTMLElement>('.ll-workspace-timeline span');
  if(timeline[2])timeline[2].textContent='Approved';
  if(timeline[3])timeline[3].textContent='Review work';
  if(timeline[4])timeline[4].textContent='Completed';

  const status=statusName(host);
  const copy=host.querySelector<HTMLElement>('.ll-workspace-status p');
  if(copy){
    if(status.includes('pending'))copy.textContent='LitLab is reviewing your teacher reviewer / mentor application. You will be notified if more information is needed.';
    else if(status.includes('needs'))copy.textContent='LitLab needs more information about your teacher reviewer application. Check revision requests and live chat for the specific questions.';
    else if(status.includes('accepted'))copy.textContent='You are approved as a LitLab teacher reviewer / mentor. When LitLab assigns student work, the private DOCX and review rubric will appear below automatically.';
    else if(status.includes('not accepted'))copy.textContent='This teacher reviewer application was not accepted. Any LitLab feedback remains available in your account and live chat.';
    else if(status.includes('completed'))copy.textContent='Your teacher reviewer record is marked completed. Previous assigned reviews remain part of LitLab’s internal review history.';
  }

  const grid=host.querySelector<HTMLElement>('.ll-workspace-grid');
  if(grid){
    const card=document.createElement('article');
    card.className='ll-workspace-card ll-teacher-role-card';
    card.dataset.teacherReviewerRoleCard='true';
    const hasAssignments=Boolean(host.querySelector('.ll-teacher-zone .ll-teacher-assignment'));
    card.innerHTML=`<div class="ll-card-title"><div><span>TEACHER REVIEWER ROLE</span><h3>${hasAssignments?'Review assigned student work':'Ready for an assignment'}</h3></div><em>Private academic review</em></div><div class="ll-teacher-role-steps"><div><i>1</i><p><b>Open only assigned DOCX files</b><span>Teacher access is limited to student contributions LitLab explicitly assigns to your account.</span></p></div><div><i>2</i><p><b>Review with the LitLab rubric</b><span>Check accuracy, clarity, DP relevance, originality and source quality.</span></p></div><div><i>3</i><p><b>Give specific, constructive feedback</b><span>Recommend approval or request changes and explain exactly why.</span></p></div><div><i>4</i><p><b>LitLab makes the final workflow decision</b><span>Your academic review supports LitLab; it does not directly publish, accept or reject a student contribution.</span></p></div></div>${hasAssignments?'':'<p class="ll-teacher-waiting">No student contribution is assigned right now. You do not need to upload anything. LitLab will notify you when a review is assigned.</p>'}`;
    grid.prepend(card);
  }
}

function scan(){
  clearTimeout(timer);
  if(route()!=='contribute')return;
  const host=root();
  if(host){attempts=0;apply();return}
  if(attempts++<25)timer=window.setTimeout(scan,120);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('[data-workspace-select]'))setTimeout(apply,0);
},true);
window.addEventListener('hashchange',()=>{attempts=0;setTimeout(scan,100)});
window.addEventListener('litlab:contributor-workspace-updated',()=>setTimeout(apply,120));
window.addEventListener('focus',()=>{if(route()==='contribute')setTimeout(apply,120)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
