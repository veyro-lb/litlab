import './contributor-guide-sync.css';

type ContributorRole='student'|'teacher';
type WorkspaceRow={id?:string;applicant_type?:string;status?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};

let workspaces:WorkspaceRow[]=[];
let selectedId='';
let scheduled=false;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function role():ContributorRole|null{
  const value=root()?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'?value:null;
}
function rowsForRole(accountRole:ContributorRole){return workspaces.filter(row=>row.applicant_type===accountRole)}
function terminal(status?:string){const value=String(status||'').toLowerCase();return value==='completed'||value==='declined'}
function hasActive(rows:WorkspaceRow[]){return rows.some(row=>!terminal(row.status))}
function selectedForRole(accountRole:ContributorRole,rows:WorkspaceRow[]){
  const selected=rows.find(row=>row.id===selectedId);
  return selected||rows[0]||null;
}
function domWorkspaceState(){
  const status=(document.querySelector<HTMLElement>('[data-contributor-workspace] .ll-workspace-status > div > span')?.textContent||'').trim().toLowerCase();
  if(!status)return {hasApplication:false,active:false};
  const closed=status.includes('completed')||status.includes('not accepted');
  return {hasApplication:true,active:!closed};
}
function setBooleanData(host:HTMLElement,key:string,value:boolean){
  if(value)host.dataset[key]='true';
  else delete host.dataset[key];
}

function syncGuide(){
  scheduled=false;
  if(route()!=='contribute')return;
  const host=root();const accountRole=role();if(!host||!accountRole)return;
  const rows=rowsForRole(accountRole);
  const selected=selectedForRole(accountRole,rows);
  const domState=domWorkspaceState();
  const hasApplication=rows.length>0||domState.hasApplication;
  const activeApplication=rows.length>0?hasActive(rows):domState.active;

  host.dataset.contributorGuideRole=accountRole;
  setBooleanData(host,'contributorHasApplication',hasApplication);
  setBooleanData(host,'contributorActiveApplication',accountRole==='student'&&activeApplication);
  if(selected?.status)host.dataset.contributorGuideStatus=String(selected.status).toLowerCase();
  else delete host.dataset.contributorGuideStatus;

  const guide=host.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(guide){
    guide.dataset.syncedRole=accountRole;
    guide.setAttribute('aria-label',accountRole==='teacher'?'Teacher reviewer workspace sections':'Student contributor workspace sections');
  }

  /* The teacher roster hides non-selected assignment cards. Keep the guide bar
     pointed at the same visible student immediately after the roster changes. */
  if(accountRole==='teacher'){
    const selectedStudent=host.querySelector<HTMLElement>('[data-teacher-selected-head] h2')?.textContent?.trim()||'';
    if(guide){
      if(selectedStudent)guide.dataset.selectedStudent=selectedStudent;
      else delete guide.dataset.selectedStudent;
    }
  }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(syncGuide)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',()=>{workspaces=[];selectedId='';schedule()});
window.addEventListener('focus',schedule);

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-teacher-student-select]')){
    /* contributor-state-guide predates the current roster selector. Trigger the
       standard workspace update after the selected card is swapped so its
       Review student jump and status are rebuilt from the same state. */
    window.setTimeout(()=>window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{source:'teacher-student-selection'}})),80);
  }
},true);

observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
