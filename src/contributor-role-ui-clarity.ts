import './contributor-role-ui-clarity.css';

type ContributorRole=''|'student'|'teacher'|'admin';
type Review={accuracy?:number;clarity?:number;dp_relevance?:number;originality?:number;sources?:number;recommendation?:'approve'|'request_changes'|string;summary?:string;created_at?:string;reviewer_name?:string};
type Doc={storage_path?:string;created_at?:string;original_name?:string;version_label?:string};
type Revision={id?:string;status?:string};
type Task={id?:string;status?:string};
type WorkspaceRow={id:string;applicant_type?:'student'|'teacher'|string;reviews?:Review[];documents?:Doc[];revisions?:Revision[];tasks?:Task[]};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let scheduled=false;
let applyTimer=0;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function contributorRoot(){return document.getElementById('ll-contributor-root')}
function contributorWorkspace(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function role():ContributorRole{
  const value=contributorRoot()?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'||value==='admin'?value:'';
}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmt(value?:string){if(!value)return '';const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function score(value:unknown){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(5,n)):0}
function average(review:Review){const values=[review.accuracy,review.clarity,review.dp_relevance,review.originality,review.sources].map(Number).filter(Number.isFinite);return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0}
function orderedReviews(rows:Review[]){return rows.slice().sort((a,b)=>Date.parse(b.created_at||'')-Date.parse(a.created_at||''))}
function orderedDocs(rows:Doc[]){return rows.slice().sort((a,b)=>Date.parse(b.created_at||'')-Date.parse(a.created_at||''))}

function reviewMarkup(review:Review,latest=false){
  const avg=average(review);const approved=review.recommendation==='approve';const reviewer=review.reviewer_name||'Teacher reviewer';
  return `<article class="ll-clarity-review${latest?' is-latest':''}"><header><div><span>${latest?'LATEST TEACHER REVIEW':'EARLIER TEACHER REVIEW'}</span><b>${esc(reviewer)}</b>${review.created_at?`<small>${esc(fmt(review.created_at))}</small>`:''}</div><strong class="${approved?'approved':'changes'}">${approved?'Approved academically':'Changes requested'}${avg?` · ${avg.toFixed(1)}/5`:''}</strong></header><div class="ll-clarity-score-grid"><i><b>${score(review.accuracy)}/5</b><span>Accuracy</span></i><i><b>${score(review.clarity)}/5</b><span>Clarity</span></i><i><b>${score(review.dp_relevance)}/5</b><span>DP relevance</span></i><i><b>${score(review.originality)}/5</b><span>Originality</span></i><i><b>${score(review.sources)}/5</b><span>Sources</span></i></div><div class="ll-clarity-teacher-note"><span>TEACHER NOTES</span><p>${esc(review.summary||'No written note was added for this review.')}</p></div></article>`;
}

function ensureStudentReview(host:HTMLElement,app:WorkspaceRow|null){
  const reviews=orderedReviews(app?.reviews||[]);let panel=host.querySelector<HTMLElement>('[data-student-teacher-feedback]');
  if(!reviews.length){panel?.remove();return}
  if(!panel){panel=document.createElement('section');panel.dataset.studentTeacherFeedback='true';panel.id='ll-student-teacher-feedback';panel.className='ll-student-teacher-feedback';const anchor=host.querySelector('[data-review-lifecycle-path]')||host.querySelector('.ll-workspace-timeline')||host.querySelector('.ll-workspace-status')||host.querySelector('.ll-workspace-head');anchor?.after(panel)}
  const signature=reviews.map(row=>[row.created_at,row.recommendation,row.summary,row.accuracy,row.clarity,row.dp_relevance,row.originality,row.sources].join(':')).join('|');
  if(panel.dataset.signature===signature)return;panel.dataset.signature=signature;
  const [latest,...past]=reviews;
  panel.innerHTML=`<div class="ll-clarity-section-head"><div><span>TEACHER FEEDBACK & GRADING</span><h3>Your teacher's notes and rubric scores</h3><p>This is the feedback to use for your next revision. Older reviews stay available below without crowding your workspace.</p></div><em>${past.length?`${past.length} earlier review${past.length===1?'':'s'}`:'Current review'}</em></div>${reviewMarkup(latest,true)}${past.length?`<details class="ll-clarity-details"><summary>Earlier teacher reviews <span>${past.length}</span></summary><div class="ll-clarity-details-body">${past.map(row=>reviewMarkup(row)).join('')}</div></details>`:''}`;
}

function evidencePanel(node:HTMLElement){return node.closest<HTMLElement>('.ll-workspace-card,.ll-contrib-section,section,article')||node}
function evidenceCandidates(){
  const page=document.querySelector<HTMLElement>('.ll-contrib-page');if(!page)return [] as HTMLElement[];
  const found=new Set<HTMLElement>();
  page.querySelectorAll<HTMLElement>('.ll-evidence-ledger,.ll-workspace-cas,.ll-activity-evidence,.ll-mentor-evidence,[data-cas-evidence],[data-evidence-form],[data-evidence-list],[data-activity-form],[data-activity-list],[data-mentor-evidence-form]').forEach(node=>found.add(evidencePanel(node)));
  page.querySelectorAll<HTMLElement>('.ll-workspace-card,.ll-contrib-section').forEach(panel=>{
    const heading=panel.querySelector<HTMLElement>('h2,h3,h4,.ll-card-title')?.textContent?.trim().toLowerCase()||'';
    if(/^(cas )?evidence ledger$/.test(heading)||heading==='activity log'||heading.includes('contribution evidence'))found.add(panel);
  });
  return [...found].filter(panel=>panel.isConnected);
}
function evidenceRank(panel:HTMLElement,host:HTMLElement){let rank=0;if(host.contains(panel))rank+=8;if(panel.querySelector('[data-evidence-form],[data-activity-form],form'))rank+=5;if(panel.querySelector('[data-evidence-list],[data-activity-list]'))rank+=3;return rank}
function dedupeStudentEvidence(host:HTMLElement){
  const panels=evidenceCandidates();if(!panels.length)return;
  const primary=panels.slice().sort((a,b)=>evidenceRank(b,host)-evidenceRank(a,host))[0];
  primary.dataset.clarityEvidencePrimary='true';primary.id=primary.id||'ll-student-evidence';
  panels.forEach(panel=>{if(panel===primary)return;if(panel.contains(primary)||primary.contains(panel))return;panel.remove()});
}

function detailsShell(key:string,label:string,count:number){
  const details=document.createElement('details');details.dataset.clarityGroup=key;details.className='ll-clarity-details ll-clarity-row-details';
  const summary=document.createElement('summary');summary.innerHTML=`${esc(label)} <span>${count}</span>`;
  const body=document.createElement('div');body.className='ll-clarity-details-body';body.dataset.clarityBody='true';
  details.append(summary,body);return details;
}
function moveRows(container:HTMLElement,rows:HTMLElement[],key:string,label:string){
  if(!rows.length)return;
  let details=container.querySelector<HTMLDetailsElement>(`:scope > details[data-clarity-group="${key}"]`);
  if(!details){details=detailsShell(key,label,rows.length);container.appendChild(details)}
  const body=details.querySelector<HTMLElement>('[data-clarity-body]')!;rows.forEach(row=>body.appendChild(row));
  const summary=details.querySelector<HTMLElement>('summary');if(summary)summary.innerHTML=`${esc(label)} <span>${body.children.length}</span>`;
}

function compactStudentTasks(host:HTMLElement){
  host.querySelectorAll<HTMLElement>('.ll-task-list').forEach(list=>{
    const rows=Array.from(list.querySelectorAll<HTMLElement>(':scope > .ll-task.approved,:scope > .ll-task.submitted'));
    moveRows(list,rows,'student-past-tasks','Completed / submitted tasks');
  });
}
function compactStudentRevisions(host:HTMLElement){
  host.querySelectorAll<HTMLElement>('.ll-revision-list').forEach(list=>{
    const rows=Array.from(list.querySelectorAll<HTMLElement>(':scope > .ll-revision.resolved,:scope > .ll-revision.responded'));
    moveRows(list,rows,'student-past-revisions','Past revision requests');
  });
}
function compactStudentDocs(host:HTMLElement,app:WorkspaceRow|null){
  const latest=orderedDocs(app?.documents||[])[0]?.storage_path||'';
  host.querySelectorAll<HTMLElement>('.ll-doc-list').forEach(list=>{
    const rows=Array.from(list.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.tagName==='DIV');if(rows.length<2)return;
    let current=latest?rows.find(row=>row.querySelector<HTMLButtonElement>(`button[data-download-doc="${CSS.escape(latest)}"]`)):undefined;current=current||rows[0];current.classList.add('ll-clarity-current-doc');
    moveRows(list,rows.filter(row=>row!==current),'student-past-docs','Previous submissions');
  });
}
function compactTeacherDocs(host:HTMLElement){
  host.querySelectorAll<HTMLElement>('.ll-assigned-docs').forEach(list=>{
    const previous=Array.from(list.querySelectorAll<HTMLElement>(':scope > .ll-previous-review-doc'));
    moveRows(list,previous,'teacher-past-docs','Previous student versions');
  });
}
function compactTeacherReviewHistory(host:HTMLElement){
  host.querySelectorAll<HTMLElement>('.ll-review-history').forEach(history=>{
    if(history.closest('[data-clarity-group="teacher-review-history"]'))return;
    const parent=history.parentElement;if(!parent)return;const details=detailsShell('teacher-review-history','Previous review notes',history.querySelectorAll('p').length||1);parent.insertBefore(details,history);details.querySelector('[data-clarity-body]')?.appendChild(history);
  });
}

function targetButton(label:string,target:HTMLElement,primary=false){
  if(!target.id)target.id=`ll-clarity-target-${Math.random().toString(36).slice(2,9)}`;
  return `<button type="button" data-clarity-jump="${esc(target.id)}"${primary?' class="primary"':''}>${esc(label)}</button>`;
}
function ensureStudentNav(host:HTMLElement){
  let nav=host.querySelector<HTMLElement>('[data-student-clarity-nav]');if(!nav){nav=document.createElement('section');nav.dataset.studentClarityNav='true';nav.className='ll-student-clarity-nav';const head=host.querySelector('.ll-workspace-head');head?.after(nav)}
  const revision=host.querySelector<HTMLElement>('.ll-revision.open');const feedback=host.querySelector<HTMLElement>('[data-student-teacher-feedback]');const upload=host.querySelector<HTMLElement>('.ll-docx-form:not(.is-lifecycle-locked)');const docs=host.querySelector<HTMLElement>('.ll-workspace-docs');const evidence=document.querySelector<HTMLElement>('[data-clarity-evidence-primary]');
  const buttons:string[]=[];
  if(revision)buttons.push(targetButton('Revision requested',revision,true));
  if(feedback)buttons.push(targetButton('Teacher feedback',feedback,!revision));
  if(upload)buttons.push(targetButton('Submit / revise DOCX',upload,!revision&&!feedback));else if(docs)buttons.push(targetButton('Submission status',docs,!revision&&!feedback));
  if(evidence)buttons.push(targetButton('Evidence & activity',evidence));
  const signature=buttons.join('');if(nav.dataset.signature===signature)return;nav.dataset.signature=signature;
  nav.innerHTML=`<div><span>YOUR WORKSPACE</span><b>${revision?'Start with the requested changes.':feedback?'Start with your latest feedback.':'Use the section you need.'}</b><small>Current actions stay visible. Older submissions and resolved items are minimized.</small></div><nav aria-label="Student contributor workspace sections">${buttons.join('')}</nav>`;
}

function compactAdminApplicationCards(){
  document.querySelectorAll<HTMLElement>('.admin-contrib-card .admin-contrib-detail-grid').forEach(grid=>{
    if(grid.closest('[data-clarity-group="admin-application-details"]'))return;
    const parent=grid.parentElement;if(!parent)return;const details=detailsShell('admin-application-details','Application details',grid.children.length);parent.insertBefore(details,grid);details.querySelector('[data-clarity-body]')?.appendChild(grid);
  });
}
function compactAdminWorkspace(){
  const modal=document.getElementById('ll-admin-contributor-workspace');if(!modal)return;
  modal.classList.add('ll-admin-clarity-mode');
  modal.querySelectorAll<HTMLElement>('.ll-admin-task-list').forEach(list=>{
    const rows=Array.from(list.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.tagName==='DIV');
    const secondary=rows.filter(row=>{const value=row.querySelector<HTMLSelectElement>('[data-admin-task-status]')?.value;return value==='approved'||value==='submitted'});moveRows(list,secondary,'admin-past-tasks','Completed / submitted tasks');
  });
  modal.querySelectorAll<HTMLElement>('.ll-admin-revision-list').forEach(list=>moveRows(list,Array.from(list.querySelectorAll<HTMLElement>(':scope > article.resolved')),'admin-past-revisions','Resolved revision requests'));
  modal.querySelectorAll<HTMLElement>('.ll-admin-doc-list').forEach(list=>{const rows=Array.from(list.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.tagName==='DIV');if(rows.length>1)moveRows(list,rows.slice(1),'admin-past-docs','Other submitted versions')});
  modal.querySelectorAll<HTMLElement>('.ll-admin-review-list').forEach(list=>{const rows=Array.from(list.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.tagName==='ARTICLE');if(rows.length>1)moveRows(list,rows.slice(1),'admin-past-reviews','Earlier teacher reviews')});
  modal.querySelectorAll<HTMLElement>('.ll-admin-activity-list').forEach(list=>{
    if(list.closest('[data-clarity-group="admin-activity"]'))return;const parent=list.parentElement;if(!parent)return;const details=detailsShell('admin-activity','Show activity entries',list.children.length);parent.insertBefore(details,list);details.querySelector('[data-clarity-body]')?.appendChild(list);
  });
}

function applyContributor(){
  if(route()!=='contribute')return;const host=contributorWorkspace();if(!host)return;const activeRole=role()||(current()?.applicant_type==='teacher'?'teacher':current()?.applicant_type==='student'?'student':'');
  host.classList.toggle('ll-student-clarity-mode',activeRole==='student');host.classList.toggle('ll-teacher-clarity-mode',activeRole==='teacher');
  if(activeRole==='student'){
    const app=current();ensureStudentReview(host,app);dedupeStudentEvidence(host);compactStudentTasks(host);compactStudentRevisions(host);compactStudentDocs(host,app);ensureStudentNav(host);
  }else if(activeRole==='teacher'){
    compactTeacherDocs(host);compactTeacherReviewHistory(host);
  }
}
function applyAdmin(){if(route()!=='admin-contributors')return;compactAdminApplicationCards();compactAdminWorkspace()}
function apply(){scheduled=false;applyContributor();applyAdmin()}
function schedule(){if(scheduled)return;scheduled=true;window.clearTimeout(applyTimer);applyTimer=window.setTimeout(apply,45)}

function startObserver(){observer?.disconnect();observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true})}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const jump=target.closest<HTMLButtonElement>('[data-clarity-jump]');if(jump){const id=jump.dataset.clarityJump||'';const destination=id?document.getElementById(id):null;if(destination){destination.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});window.setTimeout(()=>destination.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary')?.focus({preventScroll:true}),350)}return}
  if(target.closest('summary,[data-admin-manage-workspace],[data-workspace-select],[data-teacher-roster-student],[data-teacher-roster-mobile]'))window.setTimeout(schedule,0);
},true);
window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};selectedId=detail.selectedId||selectedId;workspaces=Array.isArray(detail.workspaces)?detail.workspaces:workspaces;schedule()});
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:admin-contributor-workspace-opened','litlab:contributor-admin-updated'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',()=>window.setTimeout(schedule,80));window.addEventListener('focus',schedule);window.addEventListener('resize',schedule);

function start(){startObserver();schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
