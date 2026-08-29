import './contributor-state-guide.css';

type ContributorRole=''|'student'|'teacher';
type WorkspaceRow={id:string;status?:string;applicant_type?:string;documents?:unknown[];reviews?:unknown[];revisions?:Array<{status?:string}>;tasks?:Array<{status?:string}>};
type Assignment={application_id?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:Assignment[]};
type SectionLink={label:string;target:HTMLElement;key:string;current?:boolean};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let assignments:Assignment[]=[];
let scheduled=false;
let timer=0;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function page(){return document.querySelector<HTMLElement>('.ll-contrib-page')}
function root(){return document.getElementById('ll-contributor-root')}
function workspace(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function role():ContributorRole{
  const value=root()?.dataset.contributorAccountRole||'';
  if(value==='student'||value==='teacher')return value;
  const app=current();
  return app?.applicant_type==='student'||app?.applicant_type==='teacher'?app.applicant_type:'';
}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function visible<T extends HTMLElement>(el:T|null|undefined):el is T{return Boolean(el&&el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none')}
function first<T extends HTMLElement>(selector:string,scope:ParentNode=document){return Array.from(scope.querySelectorAll<T>(selector)).find(visible)||null}
function ensureId(el:HTMLElement,key:string){if(!el.id)el.id=`ll-contributor-section-${key}-${Math.random().toString(36).slice(2,8)}`;el.dataset.contributorTocTarget='true';return el.id}
function closestSection(el:HTMLElement|null){return el?.closest<HTMLElement>('.ll-workspace-card,.ll-contrib-section,.ll-teacher-assignment,section,article')||el}
function statusSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('[data-review-lifecycle-path]')||host.querySelector<HTMLElement>('.ll-workspace-status')||host.querySelector<HTMLElement>('.ll-workspace-timeline')||host.querySelector<HTMLElement>('.ll-workspace-head'))}
function applicationSection(){return document.querySelector<HTMLElement>('#contribute-apply')}
function heroSection(){return document.querySelector<HTMLElement>('.ll-contrib-hero')}
function rolesSection(){return document.querySelector<HTMLElement>('.ll-contrib-role-grid')?.closest<HTMLElement>('.ll-contrib-section')||null}
function casSection(){return document.querySelector<HTMLElement>('#contribute-cas')}
function projectSection(host:HTMLElement){return first<HTMLElement>('.ll-workspace-brief,.ll-workspace-wait',host)}
function tasksSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('.ll-task-list'))}
function revisionsSection(host:HTMLElement){return closestSection(host.querySelector<HTMLElement>('.ll-revision-list'))}
function openRevision(host:HTMLElement){return first<HTMLElement>('.ll-revision.open',host)}
function submissionSection(host:HTMLElement){return host.querySelector<HTMLElement>('.ll-workspace-docs')}
function feedbackSection(host:HTMLElement){return host.querySelector<HTMLElement>('[data-student-teacher-feedback]')}
function evidenceSection(){return document.querySelector<HTMLElement>('[data-clarity-evidence-primary]')}
function completionSection(host:HTMLElement){return host.querySelector<HTMLElement>('[data-lifecycle-complete-card],[data-contributor-completion-archive]')}
function messageSection(){return document.querySelector<HTMLElement>('[data-contributor-chat-hub]')}
function teacherZone(host:HTMLElement){return host.querySelector<HTMLElement>('[data-teacher-student-browser],.ll-teacher-zone,[data-teacher-mentor-dashboard]')}
function teacherCards(host:HTMLElement){return Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).filter(visible)}
function activeTeacherReview(host:HTMLElement){
  return teacherCards(host).find(card=>{
    const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
    const submit=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
    return visible(form)&&Boolean(submit&&!submit.disabled);
  })||null;
}
function teacherHistory(host:HTMLElement){
  const history=first<HTMLElement>('.ll-review-history',host);
  return history?.closest<HTMLElement>('[data-clarity-group="teacher-review-history"],.ll-workspace-card,.ll-teacher-assignment')||history;
}

function add(list:SectionLink[],label:string,target:HTMLElement|null|undefined,key:string,current=false){
  if(!visible(target)||list.some(item=>item.target===target))return;
  list.push({label,target,key,current});
}
function genericSections(){
  const links:SectionLink[]=[];
  add(links,'Overview',heroSection(),'overview',true);
  add(links,'Roles',rolesSection(),'roles');
  add(links,'CAS',casSection(),'cas');
  add(links,'Application',applicationSection(),'application');
  return links;
}
function studentSections(host:HTMLElement,app:WorkspaceRow|null){
  const links:SectionLink[]=[];
  if(!app){
    add(links,'Overview',heroSection(),'overview');
    add(links,'CAS',casSection(),'cas');
    add(links,'Application',applicationSection(),'application',true);
    return links;
  }
  const status=String(app.status||'').toLowerCase();
  const revision=openRevision(host);
  const complete=completionSection(host);
  add(links,'Status',statusSection(host),'status',status==='new'||status==='declined');
  if(status==='new'||status==='declined'){
    add(links,'Application',applicationSection(),'application');
    add(links,'Messages',messageSection(),'messages');
    return links;
  }
  add(links,'Project',projectSection(host),'project');
  add(links,'Tasks',tasksSection(host),'tasks');
  add(links,'Revisions',revisionsSection(host),'revisions',Boolean(revision));
  add(links,'Submission',submissionSection(host),'submission',!revision&&(status==='accepted'||status==='reviewing')&&!complete);
  add(links,'Teacher feedback',feedbackSection(host),'teacher-feedback');
  add(links,'Evidence',evidenceSection(),'evidence');
  add(links,'Completion',complete,'completion',Boolean(complete));
  add(links,'Messages',messageSection(),'messages');
  return links;
}
function teacherSections(host:HTMLElement,app:WorkspaceRow|null){
  const links:SectionLink[]=[];
  if(!app){
    add(links,'Overview',heroSection(),'overview');
    add(links,'Application',applicationSection(),'application',true);
    return links;
  }
  const status=String(app.status||'').toLowerCase();
  const revision=openRevision(host);
  const activeReview=activeTeacherReview(host);
  const zone=teacherZone(host);
  add(links,'Status',statusSection(host),'status',status==='new'||status==='declined');
  if(status==='new'||status==='declined'){
    add(links,'Application',applicationSection(),'application');
    add(links,'Messages',messageSection(),'messages');
    return links;
  }
  add(links,'Application updates',revisionsSection(host),'application-updates',Boolean(revision));
  add(links,'Assigned students',zone,'assigned-students',!revision&&!activeReview&&Boolean(zone));
  add(links,'Review student',activeReview,'review-student',Boolean(activeReview));
  add(links,'Review history',teacherHistory(host),'review-history');
  add(links,'Saved record',completionSection(host),'saved-record');
  add(links,'Messages',messageSection(),'messages');
  return links;
}
function stateLabel(activeRole:ContributorRole,app:WorkspaceRow|null,host:HTMLElement|null){
  if(!activeRole)return 'Contributor page';
  if(!app)return activeRole==='teacher'?'Teacher reviewer · not applied':'Student contributor · not applied';
  const status=String(app.status||'').toLowerCase();
  if(status==='new')return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · application pending`;
  if(status==='declined')return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · application closed`;
  if(status==='completed'||host&&completionSection(host))return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · completed`;
  if(host&&openRevision(host))return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · revision needed`;
  if(activeRole==='teacher'&&host&&activeTeacherReview(host))return 'Teacher reviewer · review needed';
  if(status==='accepted')return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · accepted`;
  if(status==='reviewing')return `${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} · in review`;
  return activeRole==='teacher'?'Teacher reviewer workspace':'Student contributor workspace';
}
function renderGuide(){
  scheduled=false;
  if(route()!=='contribute'){document.querySelector('[data-contributor-state-guide]')?.remove();return}
  const p=page();if(!p)return;
  const host=workspace();const activeRole=role();const app=current();
  const links=activeRole&&host?(activeRole==='teacher'?teacherSections(host,app):studentSections(host,app)):genericSections();
  if(!links.length)return;
  let guide=p.querySelector<HTMLElement>('[data-contributor-state-guide]');
  if(!guide){
    guide=document.createElement('nav');guide.dataset.contributorStateGuide='true';guide.className='ll-contributor-state-guide';guide.setAttribute('aria-label','Contributor page sections');
    const hero=p.querySelector('.ll-contrib-hero');hero?.after(guide);if(!guide.isConnected)p.prepend(guide);
  }
  const label=stateLabel(activeRole,app,host);
  const html=`<span>On this ${activeRole?'workspace':'page'}</span><em>${label}</em><div class="ll-contributor-toc-links">${links.map(item=>{const id=ensureId(item.target,item.key);return `<button type="button" data-contributor-section-jump="${id}"${item.current?' class="current" aria-current="location"':''}>${item.label}</button>`}).join('')}</div>`;
  if(guide.dataset.signature!==html){guide.dataset.signature=html;guide.innerHTML=html}
}
function schedule(){if(scheduled)return;scheduled=true;clearTimeout(timer);timer=window.setTimeout(renderGuide,50)}
function startObserver(){observer?.disconnect();observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','data-contributor-account-role']})}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-contributor-section-jump]');if(button){
    const id=button.dataset.contributorSectionJump||'';const destination=id?document.getElementById(id):null;if(!destination)return;
    destination.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    return;
  }
  if(target.closest('[data-workspace-select],[data-teacher-roster-student],[data-teacher-roster-mobile],summary'))window.setTimeout(schedule,0);
},true);
window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);window.addEventListener('resize',schedule);window.addEventListener('focus',schedule);

function start(){startObserver();schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
