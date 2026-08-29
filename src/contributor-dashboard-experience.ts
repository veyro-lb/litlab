import './contributor-dashboard-experience.css';

type Role='student'|'teacher'|'';
type Row=Record<string,any>;
type Workspace=Row&{id:string;created_at?:string;status?:string;status_updated_at?:string;applicant_type?:string;contribution_type?:string;topics?:string;contribution_idea?:string;brief?:Row|null;tasks?:Row[];revisions?:Row[];documents?:Row[];reviews?:Row[]};
type Assignment=Row&{application_id:string;student_name?:string;topics?:string;contribution_type?:string;status?:string;documents?:Row[];reviews?:Row[]};
type WorkspaceEvent={selectedId?:string;workspaces?:Workspace[];assignments?:Assignment[]};
type NextAction={title:string;copy:string;target?:string;tone:'action'|'waiting'|'success'|'danger'};
type ActivityItem={at:number;title:string;copy:string};

let workspaces:Workspace[]=[];
let assignments:Assignment[]=[];
let selectedId='';
let scheduled=false;
let lastSignature='';

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function accountRoot(){return document.getElementById('ll-contributor-root')}
function workspaceHost(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function time(value:unknown){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}
function dateTime(value:unknown){const parsed=time(value);return parsed?new Date(parsed).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'Recently'}
function current(){return workspaces.find(item=>item.id===selectedId)||workspaces[0]||null}
function role():Role{
  const value=accountRoot()?.dataset.contributorAccountRole||current()?.applicant_type||'';
  return value==='student'||value==='teacher'?value:'';
}
function docs(value:Workspace|Assignment|null|undefined){return Array.isArray(value?.documents)?value!.documents!:[]}
function reviews(value:Workspace|Assignment|null|undefined){return Array.isArray(value?.reviews)?value!.reviews!:[]}
function revisions(value:Workspace|null|undefined){return Array.isArray(value?.revisions)?value!.revisions!:[]}
function tasks(value:Workspace|null|undefined){return Array.isArray(value?.tasks)?value!.tasks!:[]}
function latest<T extends Row>(items:T[],field='created_at'){return items.slice().sort((a,b)=>time(b?.[field])-time(a?.[field]))[0]||null}
function latestDoc(value:Workspace|Assignment|null|undefined){return latest(docs(value))}
function latestReview(value:Workspace|Assignment|null|undefined){return latest(reviews(value))}
function openRevisions(app:Workspace|null){return revisions(app).filter(item=>['open','responded'].includes(String(item.status||'').toLowerCase()))}
function status(app:Workspace|null){return String(app?.status||'').toLowerCase()}
function appTitle(app:Workspace|null){return app?.topics||label(app?.contribution_type)||'LitLab contribution'}

function assignmentState(item:Assignment){
  if(String(item.status||'').toLowerCase()==='completed')return 'done';
  const doc=latestDoc(item);const review=latestReview(item);
  if(!doc)return 'waiting';
  if(!review||time(doc.created_at)>time(review.created_at))return 'review';
  if(String(review.recommendation||'').toLowerCase()==='request_changes')return 'waiting';
  if(String(review.recommendation||'').toLowerCase()==='approve')return 'done';
  return 'waiting';
}
function needsTeacherReview(){return assignments.filter(item=>assignmentState(item)==='review')}
function waitingTeacherAssignments(){return assignments.filter(item=>assignmentState(item)==='waiting')}
function completedTeacherAssignments(){return assignments.filter(item=>assignmentState(item)==='done')}
function teacherReviewCount(){return assignments.reduce((sum,item)=>sum+reviews(item).length,0)}

function waitingState(accountRole:Role,app:Workspace|null){
  if(accountRole==='teacher'){
    if(needsTeacherReview().length)return {text:'Waiting on you',tone:'action' as const};
    if(waitingTeacherAssignments().length)return {text:'Waiting on student',tone:'waiting' as const};
    if(assignments.length)return {text:'Queue clear',tone:'success' as const};
    return {text:'Waiting on LitLab',tone:'waiting' as const};
  }
  if(!app)return {text:'Waiting on you',tone:'action' as const};
  if(status(app)==='completed')return {text:'Complete',tone:'success' as const};
  if(status(app)==='declined')return {text:'Application closed',tone:'danger' as const};
  if(openRevisions(app).length)return {text:'Waiting on you',tone:'action' as const};
  if(status(app)==='new')return {text:'Waiting on LitLab',tone:'waiting' as const};
  const review=latestReview(app);
  if(review&&String(review.recommendation||'').toLowerCase()==='approve')return {text:'Waiting on LitLab admin',tone:'waiting' as const};
  if(!latestDoc(app))return {text:'Waiting on you',tone:'action' as const};
  return {text:'In progress',tone:'action' as const};
}
function healthState(accountRole:Role,app:Workspace|null){
  if(accountRole==='teacher'){
    if(needsTeacherReview().length)return {text:'Needs attention',tone:'danger' as const};
    if(!assignments.length||waitingTeacherAssignments().length)return {text:'Waiting',tone:'waiting' as const};
    return {text:'On track',tone:'success' as const};
  }
  if(!app)return {text:'Ready to start',tone:'action' as const};
  if(status(app)==='completed')return {text:'Complete',tone:'success' as const};
  if(status(app)==='declined')return {text:'Closed',tone:'danger' as const};
  if(openRevisions(app).length)return {text:'Needs attention',tone:'danger' as const};
  if(status(app)==='new')return {text:'Waiting',tone:'waiting' as const};
  return {text:'On track',tone:'success' as const};
}

function studentNext(app:Workspace|null):NextAction{
  if(!app)return {title:'Start your contributor application',copy:'Describe one focused contribution. LitLab will review it and open your workspace if it is accepted.',target:'application',tone:'action'};
  const state=status(app);
  if(state==='completed')return {title:'Contribution complete',copy:'Your documents, feedback and contribution history remain saved. You can review the record or start a new contribution.',target:'history',tone:'success'};
  if(state==='declined')return {title:'Review the saved application record',copy:'This application is closed. Read any saved feedback before deciding whether to submit a new focused application.',target:'history',tone:'danger'};
  const open=openRevisions(app);
  if(open.length)return {title:'Respond to the current revision',copy:`${open.length} revision request${open.length===1?' needs':'s need'} your attention. Read the feedback, make the requested changes and respond from this workspace.`,target:'feedback',tone:'action'};
  if(state==='new')return {title:'Application is with LitLab',copy:'There is nothing you need to resubmit right now. LitLab owns the next decision.',target:'journey',tone:'waiting'};
  if(!app.brief&&['accepted','reviewing'].includes(state))return {title:'Your project brief is being prepared',copy:'Use the contribution status and messages if you need clarification. Start the full deliverable after the brief is available.',target:'messages',tone:'waiting'};
  const doc=latestDoc(app);const review=latestReview(app);
  if(!doc)return {title:'Upload your first DOCX',copy:'Follow the approved brief, complete the quality check and submit the current Word document for review.',target:'documents',tone:'action'};
  if(review&&String(review.recommendation||'').toLowerCase()==='request_changes')return {title:'Upload the revised DOCX',copy:'Your latest review requested changes. Revise the same contribution and submit the next version instead of starting a new project.',target:'documents',tone:'action'};
  if(review&&String(review.recommendation||'').toLowerCase()==='approve')return {title:'Your approved review is moving forward',copy:'The current version has been approved academically. LitLab owns the next final decision.',target:'feedback',tone:'waiting'};
  const pending=tasks(app).filter(item=>!['approved','submitted'].includes(String(item.status||'').toLowerCase()));
  if(pending.length)return {title:'Continue the current task list',copy:`${pending.length} task${pending.length===1?' remains':'s remain'} before the contribution is ready for final review.`,target:'tasks',tone:'action'};
  return {title:'Keep the current contribution moving',copy:'Your latest document is saved. Use tasks, feedback and messages to decide whether another version is needed.',target:'documents',tone:'action'};
}
function teacherNext():NextAction{
  const review=needsTeacherReview();
  if(review.length)return {title:`Review ${review[0].student_name||'the next student'}'s DOCX`,copy:`${review.length} assigned contribution${review.length===1?' needs':'s need'} a current teacher review. Open the latest DOCX, complete the rubric and send one clear decision.`,target:'review',tone:'action'};
  const waiting=waitingTeacherAssignments();
  if(waiting.length)return {title:'Waiting for student revisions',copy:'You already handled the current teacher step. New review controls become relevant when a student submits a newer DOCX.',target:'students',tone:'waiting'};
  if(assignments.length)return {title:'Your review queue is clear',copy:'All currently assigned student work has a teacher decision. You can check history or wait for another student version.',target:'history',tone:'success'};
  return {title:'Ready for a student assignment',copy:'Your Teacher workspace is ready. LitLab will place assigned students here when review work becomes available.',target:'students',tone:'waiting'};
}

function commandItems(accountRole:Role){
  return accountRole==='teacher'
    ?[['overview','Overview'],['students','Students'],['review','Review queue'],['feedback','Feedback'],['messages','Messages'],['history','History']]
    :[['overview','Overview'],['journey','Journey'],['tasks','Tasks'],['documents','Documents'],['feedback','Feedback'],['messages','Messages'],['history','History']];
}
function statMarkup(accountRole:Role,app:Workspace|null){
  if(accountRole==='teacher'){
    const values=[['Assigned',assignments.length,'Students in your workspace'],['Needs review',needsTeacherReview().length,'Current DOCX needs you'],['Waiting',waitingTeacherAssignments().length,'Student owns next step'],['Reviews',teacherReviewCount(),'Teacher reviews submitted']];
    return values.map(([name,value,copy])=>`<div class="ll-dashboard-stat"><span>${esc(name)}</span><strong>${esc(value)}</strong><small>${esc(copy)}</small></div>`).join('');
  }
  const approved=tasks(app).filter(item=>String(item.status||'').toLowerCase()==='approved').length;
  const totalTasks=tasks(app).length;
  const values=[['Status',app?label(status(app)):'Not started','Current contribution state'],['Documents',docs(app).length,'Saved DOCX versions'],['Revisions',openRevisions(app).length,'Open requests'],['Tasks',totalTasks?`${approved}/${totalTasks}`:'0','Approved task progress']];
  return values.map(([name,value,copy])=>`<div class="ll-dashboard-stat"><span>${esc(name)}</span><strong>${esc(value)}</strong><small>${esc(copy)}</small></div>`).join('');
}

function studentDocumentCard(app:Workspace|null){
  const doc=latestDoc(app);
  if(!doc)return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">CURRENT DOCUMENT</span><h3>Your latest DOCX</h3></div><em>No version yet</em></div><div class="ll-dashboard-empty">Your newest Word document will stay visible here. Older versions remain available below without taking over the dashboard.</div></article>`;
  return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">CURRENT DOCUMENT</span><h3>Your latest DOCX</h3></div><em>${esc(dateTime(doc.created_at))}</em></div><div class="ll-dashboard-current-doc"><span class="ll-dashboard-doc-icon">W</span><div><b>${esc(doc.version_label||'Current version')} — ${esc(doc.original_name||'LitLab contribution.docx')}</b><small>${doc.note?esc(doc.note):'Latest private submission saved to this contribution.'}</small></div><button type="button" data-dashboard-open-doc="${esc(doc.storage_path||'')}">Open securely</button></div></article>`;
}
function feedbackCard(app:Workspace|null){
  const review=latestReview(app);const revision=latest(revisions(app));
  const latestIsRevision=revision&&(!review||time(revision.created_at)>=time(review.created_at));
  if(latestIsRevision){
    const state=String(revision.status||'open').toLowerCase();
    return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">LATEST FEEDBACK</span><h3>Revision request</h3></div><em>${esc(dateTime(revision.created_at))}</em></div><div class="ll-dashboard-feedback"><div class="ll-dashboard-feedback-lead"><strong>${esc(revision.title||'Changes requested')}</strong><p>${esc(revision.details||'Open the feedback section for the full revision request.')}</p></div><div class="ll-dashboard-feedback-meta"><span class="${state==='resolved'?'good':'attention'}">${esc(label(state))}</span>${openRevisions(app).length?`<span class="attention">${openRevisions(app).length} open request${openRevisions(app).length===1?'':'s'}</span>`:''}</div></div></article>`;
  }
  if(review){
    const scores=['accuracy','clarity','dp_relevance','originality','sources'].map(key=>Number(review[key]||0)).filter(Boolean);
    const strong=scores.filter(score=>score>=4).length;const attention=scores.filter(score=>score<=2).length;
    const approved=String(review.recommendation||'').toLowerCase()==='approve';
    return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">LATEST FEEDBACK</span><h3>${approved?'Review approved':'Changes requested'}</h3></div><em>${esc(dateTime(review.created_at))}</em></div><div class="ll-dashboard-feedback"><div class="ll-dashboard-feedback-lead"><strong>${esc(review.reviewer_name||'Contributor review')}</strong><p>${esc(review.summary||'Open the feedback section for the complete review.')}</p></div><div class="ll-dashboard-feedback-meta">${strong?`<span class="good">${strong} strong area${strong===1?'':'s'}</span>`:''}${attention?`<span class="attention">${attention} attention area${attention===1?'':'s'}</span>`:''}<span class="${approved?'good':'attention'}">${approved?'Approved':'Revision needed'}</span></div></div></article>`;
  }
  return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">LATEST FEEDBACK</span><h3>Nothing to review yet</h3></div><em>Updates appear here</em></div><div class="ll-dashboard-empty">When a teacher or LitLab reviewer responds, the latest decision and the most important next step will be summarized here.</div></article>`;
}

function teacherQueueCard(){
  if(!assignments.length)return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">REVIEW QUEUE</span><h3>Assigned students</h3></div><em>0 assigned</em></div><div class="ll-dashboard-empty">Assigned student contributions will appear here with a clear “needs review”, “waiting on student” or “sent forward” state.</div></article>`;
  const ordered=assignments.slice().sort((a,b)=>({review:0,waiting:1,done:2}[assignmentState(a)]??3)-({review:0,waiting:1,done:2}[assignmentState(b)]??3));
  return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">REVIEW QUEUE</span><h3>Assigned students</h3></div><em>${needsTeacherReview().length} need review</em></div><div class="ll-dashboard-queue">${ordered.slice(0,6).map(item=>{const state=assignmentState(item);const copy=state==='review'?'Latest DOCX needs your review':state==='waiting'?'Waiting for a new student version':'Teacher step complete';return `<div class="ll-dashboard-queue-item is-${state}"><div><b>${esc(item.student_name||'Assigned student')} — ${esc(item.topics||label(item.contribution_type)||'Contribution')}</b><small>${esc(copy)}</small></div><button type="button" data-dashboard-assignment="${esc(item.application_id)}">${state==='review'?'Review now':'Open'}</button></div>`}).join('')}</div></article>`;
}

function activityItems(accountRole:Role,app:Workspace|null):ActivityItem[]{
  const items:ActivityItem[]=[];
  const push=(at:unknown,title:string,copy:string)=>{const stamp=time(at);if(stamp)items.push({at:stamp,title,copy})};
  if(accountRole==='teacher'){
    assignments.forEach(item=>{
      docs(item).forEach(doc=>push(doc.created_at,`${item.student_name||'Student'} uploaded ${doc.version_label||'a DOCX'}`,doc.original_name||'New private document'));
      reviews(item).forEach(review=>push(review.created_at,`You reviewed ${item.student_name||'a student contribution'}`,String(review.recommendation||'')==='approve'?'Approved academically':'Changes requested'));
    });
  }else if(app){
    push(app.created_at,'Application submitted',appTitle(app));
    push(app.status_updated_at,`Status changed to ${label(status(app))}`,appTitle(app));
    docs(app).forEach(doc=>push(doc.created_at,`${doc.version_label||'DOCX'} uploaded`,doc.original_name||'Private contribution document'));
    reviews(app).forEach(review=>push(review.created_at,'Review received',review.summary||label(review.recommendation)));
    revisions(app).forEach(revision=>push(revision.created_at,'Revision request added',revision.title||revision.details||'Changes requested'));
  }
  return items.sort((a,b)=>b.at-a.at).slice(0,5);
}
function activityCard(accountRole:Role,app:Workspace|null){
  const items=activityItems(accountRole,app);
  return `<article class="ll-dashboard-card"><div class="ll-dashboard-card-head"><div><span class="ll-dashboard-card-label">RECENT ACTIVITY</span><h3>What changed recently</h3></div><em>${items.length?'Newest first':'No updates yet'}</em></div>${items.length?`<div class="ll-dashboard-timeline">${items.map(item=>`<div class="ll-dashboard-event"><i></i><div><b>${esc(item.title)}</b><p>${esc(dateTime(item.at))} · ${esc(item.copy)}</p></div></div>`).join('')}</div>`:'<div class="ll-dashboard-empty">Uploads, status changes and review activity will appear here so you can understand what happened without searching through every section.</div>'}</article>`;
}

function experienceMarkup(accountRole:Role,app:Workspace|null){
  const waiting=waitingState(accountRole,app);const health=healthState(accountRole,app);const next=accountRole==='teacher'?teacherNext():studentNext(app);
  const title=accountRole==='teacher'?'Teacher review workspace':appTitle(app);
  const copy=accountRole==='teacher'?'See which students need you, which are revising, and what can safely wait.':'Your contribution dashboard keeps the current version, feedback and next action visible without making you search through the full workspace.';
  const statusText=accountRole==='teacher'?(assignments.length?'Active reviewer':'Reviewer workspace'):app?label(status(app)):'No active contribution';
  const commands=commandItems(accountRole).map(([key,text])=>`<button type="button" data-dashboard-jump="${key}">${esc(text)}</button>`).join('');
  const primary=accountRole==='teacher'?teacherQueueCard():studentDocumentCard(app);
  const secondary=accountRole==='teacher'?activityCard(accountRole,app):feedbackCard(app);
  const third=accountRole==='teacher'?feedbackCard(current()):activityCard(accountRole,app);
  return `<div class="ll-dashboard-experience" data-dashboard-experience><div class="ll-dashboard-hero" data-dashboard-overview><div class="ll-dashboard-summary"><span class="ll-dashboard-eyebrow">${accountRole==='teacher'?'TEACHER DASHBOARD':'CONTRIBUTOR DASHBOARD'}</span><h2>${esc(title)}</h2><p>${esc(copy)}</p><div class="ll-dashboard-badges"><span class="ll-dashboard-badge is-${waiting.tone}">${esc(waiting.text)}</span><span class="ll-dashboard-badge is-${health.tone}">${esc(health.text)}</span><span class="ll-dashboard-badge">${esc(statusText)}</span></div></div><aside class="ll-dashboard-next"><span class="ll-dashboard-card-label">NEXT ACTION</span><h3>${esc(next.title)}</h3><p>${esc(next.copy)}</p>${next.target?`<button type="button" data-dashboard-jump="${esc(next.target)}">Go to next step ↓</button>`:''}</aside></div><nav class="ll-dashboard-command-strip" aria-label="Contributor dashboard sections">${commands}</nav><div class="ll-dashboard-stats">${statMarkup(accountRole,app)}</div><div class="ll-dashboard-grid">${primary}${secondary}</div>${accountRole==='teacher'?`<div class="ll-dashboard-grid">${third}${feedbackCard(current())}</div>`:`<div class="ll-dashboard-grid">${third}${activityCard(accountRole,app)}</div>`}</div>`;
}

function dataSignature(accountRole:Role,app:Workspace|null){
  try{return JSON.stringify({role:accountRole,selectedId,app:app?{id:app.id,status:app.status,status_updated_at:app.status_updated_at,brief:Boolean(app.brief),tasks:tasks(app).map(item=>[item.id,item.status]),docs:docs(app).map(item=>[item.id,item.storage_path,item.created_at,item.version_label]),revisions:revisions(app).map(item=>[item.id,item.status,item.created_at]),reviews:reviews(app).map(item=>[item.created_at,item.recommendation,item.summary])}:null,assignments:assignments.map(item=>[item.application_id,item.status,docs(item).map(doc=>[doc.storage_path,doc.created_at]),reviews(item).map(review=>[review.created_at,review.recommendation])])})}catch{return String(Date.now())}
}

function enhanceDocumentHistory(app:Workspace|null){
  const list=workspaceHost()?.querySelector<HTMLElement>('.ll-doc-list');if(!list||list.dataset.dashboardVersioned==='true')return;
  list.dataset.dashboardVersioned='true';
  const rows=Array.from(list.children).filter(node=>node instanceof HTMLDivElement) as HTMLDivElement[];
  if(!rows.length)return;
  const currentPath=String(latestDoc(app)?.storage_path||'');
  let currentRow=rows.find(row=>row.querySelector<HTMLButtonElement>('[data-download-doc]')?.dataset.downloadDoc===currentPath)||rows[0];
  currentRow.classList.add('ll-dashboard-current-version');
  const old=rows.filter(row=>row!==currentRow);if(!old.length)return;
  const details=document.createElement('details');details.className='ll-dashboard-old-versions';
  const summary=document.createElement('summary');summary.textContent=`Previous versions (${old.length})`;
  const body=document.createElement('div');old.forEach(row=>body.append(row));details.append(summary,body);list.append(details);
}

function secondaryPreference(key:string){try{return localStorage.getItem(`litlabDashSecondary:${key}`)==='open'}catch{return false}}
function enhanceSecondaryCards(){
  workspaceHost()?.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{
    const cardLabel=(card.querySelector('.ll-card-title span')?.textContent||card.querySelector(':scope > span')?.textContent||'').trim().toUpperCase();
    if(!['STARTER STRUCTURE','OPTIONAL STUDENT RECORD'].includes(cardLabel)||card.dataset.dashboardSecondary==='true')return;
    const title=card.querySelector<HTMLElement>('.ll-card-title');if(!title)return;
    card.dataset.dashboardSecondary='true';card.classList.add('ll-dashboard-secondary');
    const key=cardLabel.toLowerCase().replace(/\s+/g,'-');const open=secondaryPreference(key);card.dataset.collapsed=open?'false':'true';
    const button=document.createElement('button');button.type='button';button.className='ll-dashboard-secondary-toggle';button.dataset.dashboardSecondaryToggle=key;button.setAttribute('aria-expanded',String(open));button.textContent=open?'Hide details':'Show details';title.append(button);
  });
}

function render(){
  scheduled=false;if(route()!=='contribute')return;
  const host=workspaceHost();if(!host)return;
  const accountRole=role();if(!accountRole)return;
  const app=current();const signature=dataSignature(accountRole,app);
  const existing=host.querySelector<HTMLElement>('[data-dashboard-experience]');
  if(existing&&signature===lastSignature){enhanceDocumentHistory(app);enhanceSecondaryCards();return}
  existing?.remove();
  const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  const wrapper=document.createElement('div');wrapper.innerHTML=experienceMarkup(accountRole,app);const experience=wrapper.firstElementChild as HTMLElement|null;if(!experience)return;
  if(head)head.after(experience);else host.prepend(experience);
  lastSignature=signature;
  enhanceDocumentHistory(app);enhanceSecondaryCards();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(render)}

function guideButton(key:string){return document.querySelector<HTMLButtonElement>(`[data-contributor-state-guide] [data-section-key="${CSS.escape(key)}"]`)}
function targetFor(key:string){
  const selectors:Record<string,string>={
    overview:'[data-dashboard-overview]',journey:'[data-v3-journey],.ll-v3-journey',tasks:'.ll-task-list,.ll-workspace-card',documents:'.ll-workspace-docs',feedback:'[data-student-teacher-feedback],.ll-teacher-feedback-panel,.ll-revision-list,.ll-review-history',messages:'[data-contributor-chat-hub]',history:'[data-my-contributions],[data-v3-history],.ll-v3-history',students:'[data-teacher-student-roster],[data-teacher-student-browser],.ll-teacher-zone',review:'form[data-teacher-review]:not([hidden]),.ll-teacher-assignment',application:'[data-contributor-application-launcher],#contribute-apply'};
  return document.querySelector<HTMLElement>(selectors[key]||'');
}
function jump(key:string){
  const mapped:Record<string,string>={documents:'submission',feedback:'teacher-feedback',students:'assigned-students',review:'review-student'};
  const guide=guideButton(mapped[key]||key);if(guide){guide.click();return}
  const target=targetFor(key);if(!target)return;
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  workspaces=Array.isArray(detail.workspaces)?detail.workspaces:[];
  assignments=Array.isArray(detail.assignments)?detail.assignments:[];
  selectedId=String(detail.selectedId||workspaces[0]?.id||'');schedule();
});
window.addEventListener('litlab:contributor-account-role',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('hashchange',()=>{lastSignature='';schedule()});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target||route()!=='contribute')return;
  const jumpButton=target.closest<HTMLButtonElement>('[data-dashboard-jump]');if(jumpButton){event.preventDefault();jump(jumpButton.dataset.dashboardJump||'');return}
  const docButton=target.closest<HTMLButtonElement>('[data-dashboard-open-doc]');if(docButton){
    const path=docButton.dataset.dashboardOpenDoc||'';
    const source=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-download-doc]')).find(button=>button.dataset.downloadDoc===path);source?.click();return;
  }
  const assignmentButton=target.closest<HTMLButtonElement>('[data-dashboard-assignment]');if(assignmentButton){
    const id=assignmentButton.dataset.dashboardAssignment||'';
    const form=Array.from(document.querySelectorAll<HTMLFormElement>('[data-teacher-review]')).find(item=>item.dataset.teacherReview===id);
    const card=form?.closest<HTMLElement>('.ll-teacher-assignment')||Array.from(document.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).find(item=>item.textContent?.includes(assignments.find(a=>a.application_id===id)?.student_name||'') );
    card?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});form?.querySelector<HTMLElement>('select,textarea,button')?.focus({preventScroll:true});return;
  }
  const toggle=target.closest<HTMLButtonElement>('[data-dashboard-secondary-toggle]');if(toggle){
    const card=toggle.closest<HTMLElement>('.ll-dashboard-secondary');if(!card)return;const collapsed=card.dataset.collapsed!=='false';const nextCollapsed=!collapsed;card.dataset.collapsed=String(nextCollapsed);toggle.setAttribute('aria-expanded',String(!nextCollapsed));toggle.textContent=nextCollapsed?'Show details':'Hide details';
    try{localStorage.setItem(`litlabDashSecondary:${toggle.dataset.dashboardSecondaryToggle}`,nextCollapsed?'closed':'open')}catch{}
  }
},true);

const observer=new MutationObserver(mutations=>{
  if(route()!=='contribute')return;
  if(mutations.some(mutation=>Array.from(mutation.addedNodes).some(node=>node instanceof Element&&(node.matches?.('[data-contributor-workspace],.ll-workspace-card,.ll-doc-list')||node.querySelector?.('[data-contributor-workspace],.ll-workspace-card,.ll-doc-list')))))schedule();
});
function start(){observer.observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
