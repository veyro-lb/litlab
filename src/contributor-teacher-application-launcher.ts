import './contributor-teacher-application-launcher.css';

type ContributorRole='student'|'teacher';
type WorkspaceRow={id?:string;applicant_type?:string;status?:string};
type WorkspaceEvent={workspaces?:WorkspaceRow[]};

let open=false;
let workspaces:WorkspaceRow[]=[];
let submittedNow=false;
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function role(){return document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||''}
function contributorRole():ContributorRole|null{const value=role();return value==='student'||value==='teacher'?value:null}
function contributorAccount(){return route()==='contribute'&&Boolean(contributorRole())}
function page(){return document.querySelector<HTMLElement>('.ll-contrib-page')}
function applySection(){return document.getElementById('contribute-apply') as HTMLElement|null}
function launcher(){return document.querySelector<HTMLElement>('[data-contributor-application-launcher]')}
function rowsForRole(accountRole:ContributorRole){return workspaces.filter(row=>row.applicant_type===accountRole)}
function hasApplication(accountRole:ContributorRole){return submittedNow||rowsForRole(accountRole).length>0}

function removeGenericControl(){
  if(!contributorAccount())return;
  document.querySelectorAll('[data-new-contribution-control]').forEach(element=>element.remove());
}

function launcherCopy(accountRole:ContributorRole){
  const existing=hasApplication(accountRole);
  if(accountRole==='teacher'){
    if(existing)return {
      state:'submitted',
      html:'<span>TEACHER REVIEWER ACCOUNT</span><h2>Your teacher application is already on this account.</h2><p>You do not need to apply again for each student. Assigned students appear in your Teacher dashboard, and one accepted Teacher account can mentor multiple students.</p>',
      closed:'',
      opened:''
    };
    return {
      state:open?'open':'closed',
      html:'<span>TEACHER REVIEWER APPLICATION</span><h2>Want to review or mentor LitLab students?</h2><p>Open the application when you are ready, complete it once, then use the same Teacher account for every student assigned to you.</p>',
      closed:'<span>＋</span><b>Apply as a Teacher Reviewer</b><small>Open full application</small>',
      opened:'<span>×</span><b>Close teacher application</b><small>Hide form</small>'
    };
  }
  return {
    state:open?'open':existing?'returning':'closed',
    html:existing
      ?'<span>STUDENT CONTRIBUTOR</span><h2>Want to make another LitLab contribution?</h2><p>Your previous work stays saved. Open a fresh Student application here whenever you have another useful contribution idea.</p>'
      :'<span>STUDENT CONTRIBUTOR APPLICATION</span><h2>Ready to contribute as a DP student?</h2><p>Open the application below and tell LitLab what you want to create, research or improve. Your application and future work stay attached to this Student account.</p>',
    closed:existing
      ?'<span>＋</span><b>Start another Student contribution</b><small>Open fresh application</small>'
      :'<span>＋</span><b>Apply as a Student Contributor</b><small>Open full application</small>',
    opened:'<span>×</span><b>Close student application</b><small>Hide form</small>'
  };
}

function ensureAtEnd(){
  const p=page();const apply=applySection();const accountRole=contributorRole();if(!p||!apply||!accountRole)return;
  let box=launcher();
  if(box&&box.dataset.launcherRole!==accountRole){box.remove();box=null}
  if(!box){
    box=document.createElement('section');
    box.className=`ll-contrib-section ll-account-application-launcher ll-${accountRole}-application-launcher`;
    box.dataset.contributorApplicationLauncher='true';
    if(accountRole==='teacher')box.dataset.teacherApplicationLauncher='true';
    else box.dataset.studentApplicationLauncher='true';
    box.dataset.launcherRole=accountRole;
    box.id=accountRole==='teacher'?'teacher-reviewer-apply':'student-contributor-apply';
    box.innerHTML='<div data-role-launcher-copy></div><button type="button" data-role-application-toggle aria-expanded="false"></button>';
    box.querySelector<HTMLButtonElement>('[data-role-application-toggle]')?.addEventListener('click',()=>setOpen(!open,true));
  }
  if(box.parentElement!==p||box.nextElementSibling!==apply)p.insertBefore(box,apply);
  if(apply.parentElement===p&&apply!==p.lastElementChild)p.appendChild(apply);
}

function updateLauncher(){
  const box=launcher();const accountRole=contributorRole();if(!box||!accountRole)return;
  const copyState=launcherCopy(accountRole);
  if(box.dataset.launcherState===copyState.state)return;
  box.dataset.launcherState=copyState.state;
  const copy=box.querySelector<HTMLElement>('[data-role-launcher-copy]');
  const button=box.querySelector<HTMLButtonElement>('[data-role-application-toggle]');
  const locked=accountRole==='teacher'&&hasApplication(accountRole);
  box.classList.toggle('is-submitted',locked);
  box.classList.toggle('is-returning',accountRole==='student'&&hasApplication(accountRole));
  if(copy)copy.innerHTML=copyState.html;
  if(button){
    button.hidden=locked;
    if(!locked){
      button.setAttribute('aria-expanded',open?'true':'false');
      button.innerHTML=open?copyState.opened:copyState.closed;
    }
  }
}

function requestFreshForm(accountRole:ContributorRole){
  window.dispatchEvent(new CustomEvent('litlab:open-contributor-application',{detail:{role:accountRole}}));
}

function setOpen(next:boolean,scroll=false){
  const apply=applySection();const accountRole=contributorRole();if(!apply||!accountRole)return;
  if(accountRole==='teacher'&&hasApplication(accountRole))return;
  open=next;
  if(open)requestFreshForm(accountRole);
  apply.hidden=!open;
  apply.setAttribute('aria-hidden',open?'false':'true');
  apply.dataset.roleApplicationOpen=open?'true':'false';
  document.documentElement.toggleAttribute('data-litlab-role-application-open',open);
  if(accountRole==='teacher')document.documentElement.toggleAttribute('data-litlab-teacher-application-open',open);
  else document.documentElement.toggleAttribute('data-litlab-student-application-open',open);
  updateLauncher();
  if(open&&scroll)window.setTimeout(()=>apply.scrollIntoView({behavior:'smooth',block:'start'}),70);
}

function hideApplication(){
  const section=applySection();
  if(section){section.hidden=true;section.setAttribute('aria-hidden','true');delete section.dataset.roleApplicationOpen}
  document.documentElement.removeAttribute('data-litlab-role-application-open');
  document.documentElement.removeAttribute('data-litlab-teacher-application-open');
  document.documentElement.removeAttribute('data-litlab-student-application-open');
}

function apply(){
  scheduled=false;
  const accountRole=contributorRole();
  if(route()!=='contribute'||!accountRole){
    launcher()?.remove();
    document.documentElement.removeAttribute('data-litlab-role-application-open');
    document.documentElement.removeAttribute('data-litlab-teacher-application-open');
    document.documentElement.removeAttribute('data-litlab-student-application-open');
    return;
  }
  removeGenericControl();
  ensureAtEnd();
  if(accountRole==='teacher'&&hasApplication(accountRole)){
    open=false;
    hideApplication();
  }else{
    const section=applySection();
    if(section){section.hidden=!open;section.setAttribute('aria-hidden',open?'false':'true')}
  }
  updateLauncher();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const rows=(event as CustomEvent<WorkspaceEvent>).detail?.workspaces;
  if(Array.isArray(rows)){workspaces=rows;submittedNow=false}
  schedule();
});
window.addEventListener('litlab:contributor-account-role',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('litlab:contributor-submitted',()=>{
  if(!contributorAccount())return;
  submittedNow=true;open=false;hideApplication();schedule();
});
window.addEventListener('hashchange',()=>{open=false;workspaces=[];submittedNow=false;schedule()});
window.addEventListener('focus',schedule);

document.addEventListener('click',event=>{
  const accountRole=contributorRole();if(!accountRole||route()!=='contribute')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const applyLink=target.closest<HTMLElement>('a[href="#contribute-apply"],[data-workspace-go-apply]');
  if(!applyLink)return;
  event.preventDefault();
  ensureAtEnd();
  if(accountRole==='teacher'&&hasApplication(accountRole)){
    setOpen(false,false);
    launcher()?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  setOpen(true,true);
},true);

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
