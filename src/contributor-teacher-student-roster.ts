import './contributor-teacher-student-roster.css';

type Status='new'|'reviewing'|'accepted'|'declined'|'completed';
type DocumentRow={id?:string;original_name?:string;version_label?:string;created_at?:string};
type Review={recommendation?:'approve'|'request_changes';created_at?:string;summary?:string};
type Assignment={application_id:string;student_name:string;topics?:string;contribution_type?:string;status?:Status;documents?:DocumentRow[];reviews?:Review[]};
type WorkspaceEvent={assignments?:Assignment[]};
type StudentState={key:'needs-review'|'waiting-doc'|'waiting-revision'|'sent-admin'|'complete'|'reviewed';label:string;detail:string;action:boolean};

const SELECTED_KEY='litlabTeacherSelectedStudent';
let assignments:Assignment[]=[];
let selectedStudentId='';
let scheduled=false;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function root(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function isTeacher(host:HTMLElement){return host.classList.contains('ll-teacher-reviewer-mode')||host.classList.contains('ll-hard-teacher-no-evidence')||Boolean(host.querySelector('.ll-teacher-zone,.ll-teacher-assignment'))||document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole==='teacher'}
function cards(host:HTMLElement){return Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-zone .ll-teacher-assignment'))}
function timestamp(value?:string){const time=Date.parse(value||'');return Number.isFinite(time)?time:0}
function assignmentState(a:Assignment):StudentState{
  if(a.status==='completed')return {key:'complete',label:'Complete',detail:'This student contribution is complete. Your saved review remains attached to their record.',action:false};
  const docs=a.documents||[];const reviews=a.reviews||[];const latestDoc=docs[0];const latestReview=reviews[0];
  if(!latestDoc)return {key:'waiting-doc',label:'Waiting for DOCX',detail:'The student has not submitted a DOCX yet. No teacher action is needed.',action:false};
  if(!latestReview||timestamp(latestDoc.created_at)>timestamp(latestReview.created_at))return {key:'needs-review',label:'Needs review',detail:'A current student DOCX is ready. Open it, complete the rubric and send a clear decision.',action:true};
  if(latestReview.recommendation==='request_changes')return {key:'waiting-revision',label:'Waiting for revision',detail:'You requested changes. Wait for the student to upload a revised DOCX.',action:false};
  if(latestReview.recommendation==='approve')return {key:'sent-admin',label:'Sent to LitLab',detail:'You approved the current DOCX. LitLab admin now owns the next decision.',action:false};
  return {key:'reviewed',label:'Reviewed',detail:'Your latest review has been saved.',action:false};
}
function initialSelected(){
  const stored=sessionStorage.getItem(SELECTED_KEY)||'';
  if(stored&&assignments.some(a=>a.application_id===stored))return stored;
  return assignments.find(a=>assignmentState(a).action)?.application_id||assignments[0]?.application_id||'';
}
function selectedAssignment(){return assignments.find(a=>a.application_id===selectedStudentId)||assignments[0]||null}
function stateCounts(){
  const states=assignments.map(assignmentState);
  return {action:states.filter(s=>s.action).length,waiting:states.filter(s=>s.key==='waiting-doc'||s.key==='waiting-revision').length,complete:states.filter(s=>s.key==='complete'||s.key==='sent-admin').length};
}
function rosterMarkup(){
  const counts=stateCounts();
  const search=assignments.length>4?'<label class="ll-teacher-roster-search"><span>Find student</span><input type="search" data-teacher-student-search placeholder="Search name or topic…" autocomplete="off"/></label>':'';
  return `<div class="ll-teacher-roster-head"><span>MY STUDENTS</span><h2>Choose a student to review</h2><p>You can mentor more than one student. Select a student here and LitLab will show only that student’s current work and review controls.</p></div><div class="ll-teacher-roster-counts"><span><b>${assignments.length}</b> assigned</span><span class="${counts.action?'is-action':''}"><b>${counts.action}</b> need review</span><span><b>${counts.waiting}</b> waiting</span></div>${search}<div class="ll-teacher-roster-list" role="list">${assignments.map(a=>{const state=assignmentState(a);const active=a.application_id===selectedStudentId;const topic=a.topics||a.contribution_type||'LitLab contribution';const initial=(a.student_name||'?').trim().charAt(0).toUpperCase();return `<button type="button" role="listitem" data-teacher-student-select="${esc(a.application_id)}" data-student-search="${esc(`${a.student_name} ${topic}`.toLowerCase())}" class="${active?'is-selected':''}" aria-current="${active?'true':'false'}"><i>${esc(initial)}</i><span><b>${esc(a.student_name||'Student')}</b><small>${esc(topic)}</small></span><em class="is-${state.key}">${esc(state.label)}</em></button>`}).join('')}</div><p class="ll-teacher-roster-empty" data-teacher-roster-empty hidden>No students match that search.</p>`;
}
function selectedHeaderMarkup(a:Assignment){
  const state=assignmentState(a);const topic=a.topics||a.contribution_type||'LitLab contribution';
  return `<div><span>CURRENT STUDENT</span><h2>${esc(a.student_name||'Student')}</h2><p><b>${esc(topic)}</b> · ${esc(state.detail)}</p></div><div class="ll-teacher-selected-actions"><em class="is-${state.key}">${esc(state.label)}</em><button type="button" data-teacher-show-student-list>Student list</button></div>`;
}
function decorateCard(card:HTMLElement,a:Assignment,active:boolean){
  card.dataset.teacherStudentId=a.application_id;
  card.hidden=!active;
  card.classList.toggle('is-selected-student',active);
  const state=assignmentState(a);
  const docs=card.querySelector<HTMLElement>('.ll-assigned-docs');
  docs?.querySelectorAll<HTMLElement>('button[data-download-doc]').forEach((button,index)=>{
    button.classList.toggle('is-current-docx',index===0);
    let badge=button.querySelector<HTMLElement>('[data-current-docx-badge]');
    if(index===0&&!badge){badge=document.createElement('strong');badge.dataset.currentDocxBadge='true';badge.className='ll-current-docx-badge';badge.textContent='CURRENT DOCX';button.appendChild(badge)}
    if(index>0)badge?.remove();
  });
  const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
  if(form)form.hidden=!state.action;
  let notice=card.querySelector<HTMLElement>('[data-teacher-student-state-note]');
  if(!state.action){
    if(!notice){notice=document.createElement('div');notice.dataset.teacherStudentStateNote='true';notice.className='ll-teacher-student-state-note';const anchor=form||card.querySelector('.ll-review-history');if(anchor)anchor.before(notice);else card.appendChild(notice)}
    const signature=`${state.key}|${state.detail}`;
    if(notice.dataset.signature!==signature){notice.dataset.signature=signature;notice.className=`ll-teacher-student-state-note is-${state.key}`;notice.innerHTML=`<b>${esc(state.label)}</b><span>${esc(state.detail)}</span>`}
  }else notice?.remove();
}
function ensureBrowser(host:HTMLElement){
  const zone=host.querySelector<HTMLElement>('.ll-teacher-zone');
  if(!zone||!assignments.length)return;
  const list=cards(host);if(!list.length)return;
  if(!selectedStudentId||!assignments.some(a=>a.application_id===selectedStudentId))selectedStudentId=initialSelected();
  let browser=host.querySelector<HTMLElement>('[data-teacher-student-browser]');
  let nav:HTMLElement;let detail:HTMLElement;let selectedHead:HTMLElement;
  if(!browser){
    browser=document.createElement('section');browser.dataset.teacherStudentBrowser='true';browser.className='ll-teacher-student-browser';
    nav=document.createElement('nav');nav.className='ll-teacher-student-roster';nav.dataset.teacherStudentRoster='true';nav.setAttribute('aria-label','Assigned students');
    detail=document.createElement('section');detail.className='ll-teacher-student-detail';detail.dataset.teacherStudentDetail='true';
    selectedHead=document.createElement('header');selectedHead.className='ll-teacher-selected-head';selectedHead.dataset.teacherSelectedHead='true';
    detail.append(selectedHead);zone.before(browser);browser.append(nav,detail);detail.append(zone);
  }else{
    nav=browser.querySelector<HTMLElement>('[data-teacher-student-roster]')!;
    detail=browser.querySelector<HTMLElement>('[data-teacher-student-detail]')!;
    selectedHead=browser.querySelector<HTMLElement>('[data-teacher-selected-head]')!;
    if(zone.parentElement!==detail)detail.append(zone);
  }
  const signature=assignments.map(a=>`${a.application_id}:${a.student_name}:${a.topics||''}:${assignmentState(a).key}`).join('|')+`|selected:${selectedStudentId}`;
  if(nav.dataset.signature!==signature){nav.dataset.signature=signature;nav.innerHTML=rosterMarkup()}
  const selected=selectedAssignment();if(selected){const headSignature=`${selected.application_id}|${assignmentState(selected).key}|${selected.topics||selected.contribution_type||''}`;if(selectedHead.dataset.signature!==headSignature){selectedHead.dataset.signature=headSignature;selectedHead.innerHTML=selectedHeaderMarkup(selected)}}
  list.forEach((card,index)=>{const a=assignments[index];if(a)decorateCard(card,a,a.application_id===selectedStudentId)});
  zone.classList.add('ll-teacher-zone-roster-mode');
}
function removeBrowser(host:HTMLElement){
  const browser=host.querySelector<HTMLElement>('[data-teacher-student-browser]');if(!browser)return;
  const zone=browser.querySelector<HTMLElement>('.ll-teacher-zone');if(zone)browser.before(zone);browser.remove();cards(host).forEach(card=>{card.hidden=false;delete card.dataset.teacherStudentId});
}
function apply(){
  scheduled=false;if(route()!=='contribute')return;
  const host=root();if(!host)return;
  if(!isTeacher(host)){removeBrowser(host);return}
  if(!assignments.length){removeBrowser(host);return}
  ensureBrowser(host);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
function filterRoster(input:HTMLInputElement){
  const nav=input.closest<HTMLElement>('[data-teacher-student-roster]');if(!nav)return;
  const q=input.value.trim().toLowerCase();let shown=0;
  nav.querySelectorAll<HTMLButtonElement>('[data-teacher-student-select]').forEach(button=>{const match=!q||(button.dataset.studentSearch||'').includes(q);button.hidden=!match;if(match)shown++});
  const empty=nav.querySelector<HTMLElement>('[data-teacher-roster-empty]');if(empty)empty.hidden=shown>0;
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const select=target.closest<HTMLButtonElement>('[data-teacher-student-select]');
  if(select){event.preventDefault();selectedStudentId=select.dataset.teacherStudentSelect||'';if(selectedStudentId)sessionStorage.setItem(SELECTED_KEY,selectedStudentId);schedule();return}
  if(target.closest('[data-teacher-show-student-list]')){document.querySelector('[data-teacher-student-roster]')?.scrollIntoView({behavior:'smooth',block:'start'});return}
},true);
document.addEventListener('input',event=>{const input=event.target instanceof HTMLInputElement?event.target:null;if(input?.matches('[data-teacher-student-search]'))filterRoster(input)},true);
window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};assignments=Array.isArray(detail.assignments)?detail.assignments:assignments;if(selectedStudentId&&!assignments.some(a=>a.application_id===selectedStudentId))selectedStudentId='';schedule()});
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('hashchange',()=>{if(route()!=='contribute'){assignments=[];selectedStudentId=''}schedule()});
observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
