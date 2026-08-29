import './contributor-teacher-application-launcher.css';

type WorkspaceRow={id?:string;applicant_type?:string;status?:string};
type WorkspaceEvent={workspaces?:WorkspaceRow[]};

let open=false;
let hasTeacherApplication=false;
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function role(){return document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||''}
function teacherAccount(){return route()==='contribute'&&role()==='teacher'}
function page(){return document.querySelector<HTMLElement>('.ll-contrib-page')}
function applySection(){return document.getElementById('contribute-apply') as HTMLElement|null}
function launcher(){return document.querySelector<HTMLElement>('[data-teacher-application-launcher]')}

function removeGenericTeacherControl(){
  if(!teacherAccount())return;
  const generic=document.querySelector('[data-new-contribution-control]');
  if(generic){hasTeacherApplication=true;generic.remove()}
}

function ensureAtEnd(){
  const p=page();const apply=applySection();if(!p||!apply)return;
  let box=launcher();
  if(!box){
    box=document.createElement('section');
    box.className='ll-contrib-section ll-teacher-application-launcher';
    box.dataset.teacherApplicationLauncher='true';
    box.id='teacher-reviewer-apply';
    box.innerHTML='<div data-teacher-launcher-copy></div><button type="button" data-teacher-application-toggle aria-expanded="false"></button>';
    box.querySelector<HTMLButtonElement>('[data-teacher-application-toggle]')?.addEventListener('click',()=>setOpen(!open,true));
  }
  if(box.parentElement!==p||box.nextElementSibling!==apply)p.insertBefore(box,apply);
  if(apply.parentElement===p&&apply!==p.lastElementChild)p.appendChild(apply);
}

function updateLauncher(){
  const box=launcher();if(!box)return;
  const state=hasTeacherApplication?'submitted':open?'open':'closed';
  if(box.dataset.launcherState===state)return;
  box.dataset.launcherState=state;
  const copy=box.querySelector<HTMLElement>('[data-teacher-launcher-copy]');
  const button=box.querySelector<HTMLButtonElement>('[data-teacher-application-toggle]');
  box.classList.toggle('is-submitted',hasTeacherApplication);
  if(hasTeacherApplication){
    if(copy)copy.innerHTML='<span>TEACHER REVIEWER ACCOUNT</span><h2>Your teacher application is already on this account.</h2><p>You do not need to apply again for each student. Assigned students appear in your Teacher dashboard, and one accepted teacher account can mentor multiple students.</p>';
    if(button)button.hidden=true;
    return;
  }
  if(copy)copy.innerHTML='<span>TEACHER REVIEWER APPLICATION</span><h2>Want to review or mentor LitLab students?</h2><p>Keep the page clean until you are ready. Open the application below, complete it once, then use the same Teacher account for every student assigned to you.</p>';
  if(button){
    button.hidden=false;
    button.setAttribute('aria-expanded',open?'true':'false');
    button.innerHTML=open?'<span>×</span><b>Close teacher application</b><small>Hide form</small>':'<span>＋</span><b>Apply as a Teacher Reviewer</b><small>Open full application</small>';
  }
}

function setOpen(next:boolean,scroll=false){
  const apply=applySection();if(!apply||hasTeacherApplication)return;
  open=next;
  if(apply.hidden===open)apply.hidden=!open;
  apply.setAttribute('aria-hidden',open?'false':'true');
  apply.dataset.teacherApplicationOpen=open?'true':'false';
  document.documentElement.toggleAttribute('data-litlab-teacher-application-open',open);
  updateLauncher();
  if(open&&scroll)window.setTimeout(()=>apply.scrollIntoView({behavior:'smooth',block:'start'}),70);
}

function apply(){
  scheduled=false;
  if(!teacherAccount()){
    launcher()?.remove();
    document.documentElement.removeAttribute('data-litlab-teacher-application-open');
    return;
  }
  removeGenericTeacherControl();
  ensureAtEnd();
  if(hasTeacherApplication){
    open=false;
    const section=applySection();
    if(section){section.hidden=true;section.setAttribute('aria-hidden','true');delete section.dataset.teacherApplicationOpen}
    document.documentElement.removeAttribute('data-litlab-teacher-application-open');
  }else setOpen(open,false);
  updateLauncher();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const rows=(event as CustomEvent<WorkspaceEvent>).detail?.workspaces;
  if(Array.isArray(rows))hasTeacherApplication=rows.some(row=>row.applicant_type==='teacher');
  schedule();
});
window.addEventListener('litlab:contributor-account-role',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('litlab:contributor-submitted',()=>{if(teacherAccount()){hasTeacherApplication=true;open=false;schedule()}});
window.addEventListener('hashchange',()=>{open=false;hasTeacherApplication=false;schedule()});
window.addEventListener('focus',schedule);

document.addEventListener('click',event=>{
  if(!teacherAccount()||hasTeacherApplication)return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const applyLink=target.closest<HTMLElement>('a[href="#contribute-apply"],[data-workspace-go-apply]');
  if(!applyLink)return;
  event.preventDefault();
  ensureAtEnd();
  setOpen(false,false);
  launcher()?.scrollIntoView({behavior:'smooth',block:'center'});
},true);

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
