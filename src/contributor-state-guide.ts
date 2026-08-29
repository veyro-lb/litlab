import './contributor-state-guide.css';

type ContributorRole=''|'student'|'teacher';
type WorkspaceRow={id:string;status?:string;applicant_type?:string;documents?:Array<{id?:string}>;reviews?:unknown[];revisions?:Array<{status?:string}>;tasks?:Array<{status?:string}>};
type Assignment={application_id?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:Assignment[]};
type GuideAction={label:string;target?:HTMLElement|null;click?:HTMLButtonElement|null;primary?:boolean};
type GuideModel={eyebrow:string;title:string;copy:string;status:string;tone:'neutral'|'action'|'waiting'|'success'|'closed';actions:GuideAction[]};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let assignments:Assignment[]=[];
let scheduled=false;
let timer=0;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function root(){return document.getElementById('ll-contributor-root')}
function host(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function role():ContributorRole{const value=root()?.dataset.contributorAccountRole||'';return value==='student'||value==='teacher'?value:''}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function text(el:Element|null|undefined){return (el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function ensureId(el:HTMLElement,prefix:string){if(!el.id)el.id=`${prefix}-${Math.random().toString(36).slice(2,9)}`;return el.id}
function firstVisible<T extends HTMLElement>(selector:string,scope:ParentNode=document){return Array.from(scope.querySelectorAll<T>(selector)).find(el=>el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none')||null}
function chatButton(app:WorkspaceRow|null){const exact=app?.id?document.querySelector<HTMLButtonElement>(`[data-chat-open][data-chat-mode="user"][data-application-id="${CSS.escape(app.id)}"]`):null;return exact||firstVisible<HTMLButtonElement>('[data-chat-open][data-chat-mode="user"]')}
function statusTarget(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('.ll-workspace-status')||workspace.querySelector<HTMLElement>('.ll-workspace-timeline')||workspace.querySelector<HTMLElement>('.ll-workspace-head')}
function applyTarget(){return document.querySelector<HTMLElement>('#ll-contributor-form')||document.querySelector<HTMLElement>('#contribute-apply')}
function activeUpload(workspace:HTMLElement){return firstVisible<HTMLElement>('.ll-docx-form:not(.is-lifecycle-locked)',workspace)}
function docSection(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('.ll-workspace-docs')}
function openRevision(workspace:HTMLElement){return firstVisible<HTMLElement>('.ll-revision.open',workspace)}
function teacherFeedback(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('[data-student-teacher-feedback]')}
function evidence(workspace:HTMLElement){return document.querySelector<HTMLElement>('[data-clarity-evidence-primary]')}
function reviewPath(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('[data-review-lifecycle-path]')}
function completion(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('[data-lifecycle-complete-card],[data-contributor-completion-archive]')}
function taskSection(workspace:HTMLElement){return workspace.querySelector<HTMLElement>('.ll-task-list')?.closest<HTMLElement>('.ll-workspace-card')||null}
function hasDocuments(workspace:HTMLElement,app:WorkspaceRow|null){return Boolean((app?.documents||[]).length||workspace.querySelector('.ll-doc-list [data-download-doc]'))}

function studentModel(workspace:HTMLElement,app:WorkspaceRow|null):GuideModel{
  const baseActions:GuideAction[]=[];
  if(!app){
    const apply=applyTarget();if(apply)baseActions.push({label:'Apply as a student',target:apply,primary:true});
    return {eyebrow:'STUDENT GUIDE',title:'Start with your contributor application',copy:'You have not submitted a student contribution application yet. Apply first; your project workspace appears after LitLab receives it.',status:'Not applied yet',tone:'neutral',actions:baseActions};
  }

  const status=String(app.status||'').toLowerCase();
  const statusEl=statusTarget(workspace);const chat=chatButton(app);const revision=openRevision(workspace);const feedback=teacherFeedback(workspace);const upload=activeUpload(workspace);const docs=docSection(workspace);const path=reviewPath(workspace);const evidenceEl=evidence(workspace);const complete=completion(workspace);const tasks=taskSection(workspace);
  const pathText=text(path);const lockedText=text(workspace.querySelector('[data-lifecycle-lock]'));
  const addCommon=(actions:GuideAction[])=>{if(chat)actions.push({label:'Message LitLab',click:chat});};

  if(status==='completed'||complete){
    const actions:GuideAction[]=[];if(complete)actions.push({label:'View completed record',target:complete,primary:true});if(feedback)actions.push({label:'Teacher feedback',target:feedback});if(docs)actions.push({label:'Submission history',target:docs});if(evidenceEl)actions.push({label:'Evidence & activity',target:evidenceEl});
    return {eyebrow:'STUDENT GUIDE',title:'This contribution is complete',copy:'No more submission action is required. Your files, teacher feedback, evidence and review record stay available for reference.',status:'Completed',tone:'success',actions};
  }
  if(status==='declined'){
    const actions:GuideAction[]=[{label:'View application status',target:statusEl,primary:true}];addCommon(actions);
    return {eyebrow:'STUDENT GUIDE',title:'This application is closed',copy:'There is no active contribution work for this application. Review the saved status or message LitLab if you need clarification.',status:'Application closed',tone:'closed',actions};
  }
  if(status==='new'){
    const actions:GuideAction[]=[{label:'Application status',target:statusEl,primary:true}];addCommon(actions);
    return {eyebrow:'STUDENT GUIDE',title:'Application submitted — LitLab is reviewing it',copy:'You do not need to submit contribution work yet. Check the status here; LitLab will update this workspace when there is a next step.',status:'Waiting for LitLab',tone:'waiting',actions};
  }
  if(revision){
    const actions:GuideAction[]=[{label:'Read requested changes',target:revision,primary:true}];if(feedback)actions.push({label:'Teacher feedback & grades',target:feedback});if(upload)actions.push({label:'Upload revised DOCX',target:upload});if(evidenceEl)actions.push({label:'Evidence & activity',target:evidenceEl});
    return {eyebrow:'STUDENT GUIDE',title:'Your turn: revise the contribution',copy:'Start with the requested changes and teacher notes, make the revision, then upload the new DOCX when it is ready.',status:'Revision required',tone:'action',actions};
  }
  if(pathText.includes('waiting for teacher response')||lockedText.includes('with your teacher')||lockedText.includes('with ')&&lockedText.includes('teacher')){
    const actions:GuideAction[]=[];if(path)actions.push({label:'Teacher review status',target:path,primary:true});if(feedback)actions.push({label:'Teacher feedback & grades',target:feedback});if(docs)actions.push({label:'Submitted DOCX',target:docs});addCommon(actions);
    return {eyebrow:'STUDENT GUIDE',title:'Your DOCX is with your teacher',copy:'No new upload is needed while the teacher is reviewing this version. When the teacher responds, this bar will switch to revision or LitLab-admin next steps.',status:'Waiting for teacher',tone:'waiting',actions};
  }
  if(pathText.includes('with litlab admin')||pathText.includes('final review now')||lockedText.includes('with litlab admin')){
    const actions:GuideAction[]=[];if(path)actions.push({label:'Final review status',target:path,primary:true});if(feedback)actions.push({label:'Teacher feedback & grades',target:feedback});if(docs)actions.push({label:'Reviewed submission',target:docs});addCommon(actions);
    return {eyebrow:'STUDENT GUIDE',title:'Teacher review is done — LitLab has the contribution',copy:'No new version is needed unless LitLab asks for one. You can still open your teacher feedback and submitted DOCX while final review is in progress.',status:'With LitLab admin',tone:'waiting',actions};
  }
  if(status==='reviewing'){
    const actions:GuideAction[]=[];if(upload)actions.push({label:hasDocuments(workspace,app)?'Submit updated DOCX':'Submit requested DOCX',target:upload,primary:true});else actions.push({label:'Review current status',target:statusEl,primary:true});if(tasks)actions.push({label:'Current tasks',target:tasks});if(feedback)actions.push({label:'Teacher feedback & grades',target:feedback});addCommon(actions);
    return {eyebrow:'STUDENT GUIDE',title:upload?'Your contribution needs an update':'LitLab is reviewing what you submitted',copy:upload?'Use the current task or feedback instructions, then submit the updated DOCX.':'There is no upload action right now. Check the current status and wait for the next review update.',status:upload?'Action needed':'Under review',tone:upload?'action':'waiting',actions};
  }
  if(status==='accepted'){
    const actions:GuideAction[]=[];
    if(upload)actions.push({label:hasDocuments(workspace,app)?'Submit next DOCX version':'Submit first DOCX',target:upload,primary:true});
    else if(path)actions.push({label:'Review path status',target:path,primary:true});
    else actions.push({label:'Project status',target:statusEl,primary:true});
    if(tasks)actions.push({label:'Current tasks',target:tasks});if(feedback)actions.push({label:'Teacher feedback & grades',target:feedback});if(evidenceEl)actions.push({label:'Evidence & activity',target:evidenceEl});
    return {eyebrow:'STUDENT GUIDE',title:upload?(hasDocuments(workspace,app)?'Your turn: prepare the next version':'Your turn: submit your contribution'):'Follow the current review step',copy:upload?'Only the active submission action is highlighted. Previous versions and finished items stay minimized below.':'Your document is already in the review path. Use the status button to see who has it now.',status:upload?'Ready for your work':'Review in progress',tone:upload?'action':'waiting',actions};
  }
  const actions:GuideAction[]=[{label:'Workspace status',target:statusEl,primary:true}];addCommon(actions);
  return {eyebrow:'STUDENT GUIDE',title:'Check your contributor status',copy:'Use the current status before taking another action.',status:'In progress',tone:'neutral',actions};
}

function teacherAssignments(workspace:HTMLElement){return Array.from(workspace.querySelectorAll<HTMLElement>('.ll-teacher-assignment'))}
function pendingTeacherReview(card:HTMLElement){const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');if(!form||form.hidden)return false;const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]');return Boolean(submit&&!submit.disabled)}
function teacherModel(workspace:HTMLElement,app:WorkspaceRow|null):GuideModel{
  if(!app){const apply=applyTarget();return {eyebrow:'TEACHER GUIDE',title:'Start with your teacher reviewer application',copy:'You have not applied as a LitLab teacher reviewer yet. Apply once; after approval, assigned student reviews appear in this workspace.',status:'Not applied yet',tone:'neutral',actions:apply?[{label:'Apply as a teacher reviewer',target:apply,primary:true}]:[]};}
  const status=String(app.status||'').toLowerCase();const statusEl=statusTarget(workspace);const chat=chatButton(app);const revision=openRevision(workspace);const cards=teacherAssignments(workspace);const pending=cards.filter(pendingTeacherReview);const zone=workspace.querySelector<HTMLElement>('.ll-teacher-zone,[data-teacher-student-browser],[data-teacher-mentor-dashboard]');const complete=completion(workspace);
  const common=(actions:GuideAction[])=>{if(chat)actions.push({label:'Message LitLab',click:chat});};

  if(status==='declined'){
    const actions:GuideAction[]=[{label:'Application status',target:statusEl,primary:true}];common(actions);return {eyebrow:'TEACHER GUIDE',title:'This reviewer application is closed',copy:'There is no active teacher-review work under this application. Open the status or message LitLab if you need clarification.',status:'Application closed',tone:'closed',actions};
  }
  if(status==='new'){
    const actions:GuideAction[]=[{label:'Application status',target:statusEl,primary:true}];common(actions);return {eyebrow:'TEACHER GUIDE',title:'Reviewer application submitted',copy:'LitLab is reviewing your teacher application. Student review controls will appear only after approval and assignment.',status:'Waiting for LitLab',tone:'waiting',actions};
  }
  if(status==='reviewing'&&revision){
    const actions:GuideAction[]=[{label:'Read LitLab request',target:revision,primary:true},{label:'Application status',target:statusEl}];common(actions);return {eyebrow:'TEACHER GUIDE',title:'LitLab needs information from you',copy:'Read the open request and respond there. Student academic review actions remain separate from application updates.',status:'Action needed',tone:'action',actions};
  }
  if(pending.length){
    const next=pending[0];const actions:GuideAction[]=[{label:pending.length===1?'Review student now':`Review next student (${pending.length})`,target:next,primary:true}];if(zone)actions.push({label:'Assigned students',target:zone});common(actions);
    return {eyebrow:'TEACHER GUIDE',title:`${pending.length} student review${pending.length===1?' needs':'s need'} your input`,copy:'Open the current student DOCX, score the rubric, write actionable notes, then approve academically or request changes.',status:'Teacher action required',tone:'action',actions};
  }
  if(cards.length||assignments.length){
    const waitingForDoc=cards.some(card=>!card.querySelector('[data-download-doc]'));const actions:GuideAction[]=[];if(zone)actions.push({label:'Assigned students',target:zone,primary:true});if(complete)actions.push({label:'Saved review record',target:complete});common(actions);
    return {eyebrow:'TEACHER GUIDE',title:waitingForDoc?'Waiting for a student submission':'You are caught up on assigned reviews',copy:waitingForDoc?'No review button is shown until the student uploads a DOCX. The assigned student area will update automatically.':'Your submitted review is saved. Wait for a revised DOCX, a new assignment, or LitLab’s next handoff.',status:waitingForDoc?'Waiting for student':'No teacher action now',tone:'waiting',actions};
  }
  if(status==='accepted'||status==='completed'){
    const actions:GuideAction[]=[{label:'Reviewer status',target:statusEl,primary:true}];if(complete)actions.push({label:'Saved mentoring record',target:complete});common(actions);
    return {eyebrow:'TEACHER GUIDE',title:status==='completed'?'Your saved reviewer record is complete':'You are approved as a teacher reviewer',copy:'There is no student review waiting right now. Your teacher account remains ready for assigned student work; you do not need another application for each student.',status:'Ready for assignment',tone:'success',actions};
  }
  const actions:GuideAction[]=[{label:'Reviewer status',target:statusEl,primary:true}];common(actions);return {eyebrow:'TEACHER GUIDE',title:'Check your reviewer status',copy:'Use the current status before taking another action.',status:'In progress',tone:'neutral',actions};
}

function actionMarkup(action:GuideAction,index:number){
  if(action.click){const id=ensureId(action.click,'ll-state-guide-click');return `<button type="button" data-state-guide-click="${esc(id)}"${action.primary?' class="primary"':''}>${esc(action.label)}</button>`}
  if(action.target){const id=ensureId(action.target,'ll-state-guide-target');return `<button type="button" data-state-guide-jump="${esc(id)}"${action.primary?' class="primary"':''}>${esc(action.label)}</button>`}
  return `<button type="button" disabled>${esc(action.label||`Action ${index+1}`)}</button>`;
}
function ensureGuide(workspace:HTMLElement,activeRole:ContributorRole){
  if(!activeRole)return;const app=current();const model=activeRole==='teacher'?teacherModel(workspace,app):studentModel(workspace,app);
  let guide=workspace.querySelector<HTMLElement>('[data-contributor-state-guide]');if(!guide){guide=document.createElement('section');guide.dataset.contributorStateGuide='true';guide.className='ll-contributor-state-guide';const head=workspace.querySelector(':scope > .ll-workspace-head')||workspace.querySelector('.ll-workspace-head');head?.after(guide);if(!guide.isConnected)workspace.prepend(guide)}
  const signature=[activeRole,model.title,model.copy,model.status,model.tone,...model.actions.map(a=>`${a.label}:${a.target?.id||''}:${a.click?.id||''}:${a.primary?'1':'0'}`)].join('|');if(guide.dataset.signature===signature)return;guide.dataset.signature=signature;guide.dataset.tone=model.tone;guide.innerHTML=`<div class="ll-state-guide-copy"><span>${esc(model.eyebrow)}</span><b>${esc(model.title)}</b><small>${esc(model.copy)}</small></div><div class="ll-state-guide-side"><strong>${esc(model.status)}</strong><nav aria-label="${activeRole==='teacher'?'Teacher reviewer':'Student contributor'} next actions">${model.actions.map(actionMarkup).join('')}</nav></div>`;
}
function removeStaleGuides(){document.querySelectorAll<HTMLElement>('[data-contributor-state-guide]').forEach(el=>el.remove())}
function apply(){scheduled=false;if(route()!=='contribute'){removeStaleGuides();return}const workspace=host();const activeRole=role()||(current()?.applicant_type==='teacher'?'teacher':current()?.applicant_type==='student'?'student':'');if(!workspace||!activeRole)return;ensureGuide(workspace,activeRole)}
function schedule(){if(scheduled)return;scheduled=true;clearTimeout(timer);timer=window.setTimeout(apply,70)}

window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};selectedId=detail.selectedId||selectedId;workspaces=Array.isArray(detail.workspaces)?detail.workspaces:workspaces;assignments=Array.isArray(detail.assignments)?detail.assignments:assignments;schedule()});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('focus',schedule);window.addEventListener('hashchange',()=>{selectedId='';workspaces=[];assignments=[];window.setTimeout(schedule,80)});
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const jump=target.closest<HTMLButtonElement>('[data-state-guide-jump]');if(jump){const destination=document.getElementById(jump.dataset.stateGuideJump||'');if(destination){destination.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});window.setTimeout(()=>destination.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary')?.focus({preventScroll:true}),320)}return}const click=target.closest<HTMLButtonElement>('[data-state-guide-click]');if(click){document.getElementById(click.dataset.stateGuideClick||'')?.click();return}if(target.closest('[data-workspace-select],[data-teacher-roster-student],[data-teacher-roster-mobile],summary'))window.setTimeout(schedule,0)},true);
function start(){observer?.disconnect();observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
