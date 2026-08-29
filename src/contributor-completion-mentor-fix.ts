import './contributor-completion-mentor-fix.css';

type WorkspaceRow={id:string;status?:string;applicant_type?:string};
type AssignmentRow={application_id?:string;student_name?:string;topics?:string;documents?:unknown[];reviews?:unknown[]};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[];assignments?:AssignmentRow[]};

type StudentRow={name:string;topic:string;state:string;kind:'review'|'waiting'|'reviewed'|'assigned';index:number};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let assignments:AssignmentRow[]=[];
let timer=0;
let running=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function root(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function selected(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function upper(value:unknown){return String(value??'').trim().toUpperCase()}

function looksTeacher(host:HTMLElement){
  const current=selected();
  if(current?.applicant_type)return current.applicant_type==='teacher';
  if(host.classList.contains('ll-teacher-reviewer-mode')||host.classList.contains('ll-role-clarity-teacher'))return true;
  if(host.querySelector('.ll-teacher-zone,.ll-teacher-assignment'))return true;
  const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head')?.textContent||'';
  return /teacher\s+(review|reviewer|mentor)/i.test(head);
}

function completed(host:HTMLElement){
  const current=selected();
  if(current?.status)return current.status==='completed';
  return host.classList.contains('ll-lifecycle-completed')||host.classList.contains('ll-teacher-reviewer-completed')||/\bcompleted\b/i.test(host.querySelector('.ll-workspace-status')?.textContent||'');
}

function evidenceCard(card:HTMLElement){
  const text=upper(card.textContent);
  return Boolean(
    card.querySelector('.ll-activity-form,[data-activity-form],[data-activity-list],[data-evidence-form],[data-evidence-list],[data-cas-evidence]')||
    text.includes('CAS EVIDENCE & ACTIVITY LOG')||
    text.includes('EVIDENCE LEDGER')||
    text.includes('ACTIVITY LOG')||
    text.includes('OPTIONAL STUDENT RECORD')
  );
}

function removeTeacherEvidence(host:HTMLElement){
  host.classList.add('ll-teacher-focused-view');
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{
    if(evidenceCard(card))card.hidden=true;
  });
  host.querySelectorAll<HTMLElement>('.ll-workspace-cas,.ll-evidence-ledger,[data-cas-evidence],[data-history-save-evidence],.ll-activity-evidence').forEach(el=>el.hidden=true);

  document.querySelectorAll<HTMLElement>('.ll-my-contrib-card').forEach(card=>{
    const role=card.querySelector<HTMLElement>('.ll-history-kickers > span')?.textContent||'';
    if(!/teacher/i.test(role))return;
    const body=card.querySelector<HTMLElement>('[data-history-detail-body]');
    if(!body)return;
    body.querySelectorAll<HTMLElement>('.ll-history-record-block').forEach(block=>{
      const label=upper(block.querySelector(':scope > span')?.textContent||block.textContent);
      if(label.includes('WORK & EVIDENCE')||label.includes('ARCHIVED EVIDENCE')||label.includes('CAS EVIDENCE'))block.remove();
    });
    body.querySelectorAll<HTMLElement>('[data-history-save-evidence]').forEach(el=>el.remove());
    let note=body.querySelector<HTMLElement>('[data-teacher-useful-history]');
    if(!note&&!body.querySelector('.ll-history-detail-loading')){
      note=document.createElement('section');
      note.dataset.teacherUsefulHistory='true';
      note.className='ll-teacher-useful-history';
      note.innerHTML='<span>MENTORING RECORD</span><h4>Your teacher record follows the students you reviewed.</h4><p>Teachers do not have an evidence ledger. Use the teacher workspace to see assigned students, current DOCX review status and the next academic action.</p>';
      body.prepend(note);
    }
  });
}

function assignmentRowsFromDom(host:HTMLElement):StudentRow[]{
  return Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-zone .ll-teacher-assignment')).map((card,index)=>{
    const title=card.querySelector<HTMLElement>('.ll-card-title h3')?.textContent?.trim()||`Assigned student ${index+1}`;
    const parts=title.split(/\s+—\s+/);
    const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
    const submit=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
    const pending=Boolean(form&&submit&&!submit.disabled&&!form.hasAttribute('hidden'));
    const waiting=!card.querySelector('[data-download-doc]');
    const reviewed=Boolean(card.querySelector('.ll-review-history'));
    return {
      name:parts[0]||`Assigned student ${index+1}`,
      topic:parts.slice(1).join(' — '),
      state:pending?'Review needed':waiting?'Waiting for DOCX':reviewed?'Review submitted':'Assigned',
      kind:pending?'review':waiting?'waiting':reviewed?'reviewed':'assigned',
      index
    };
  });
}

function assignmentRowsFromData():StudentRow[]{
  return assignments.map((row,index)=>{
    const waiting=!Array.isArray(row.documents)||row.documents.length===0;
    const reviewed=Array.isArray(row.reviews)&&row.reviews.length>0;
    return {
      name:row.student_name||`Assigned student ${index+1}`,
      topic:row.topics||'',
      state:waiting?'Waiting for DOCX':reviewed?'Review submitted':'Assigned student',
      kind:waiting?'waiting':reviewed?'reviewed':'assigned',
      index
    };
  });
}

function teacherCenterMarkup(rows:StudentRow[]){
  const review=rows.filter(row=>row.kind==='review').length;
  const waiting=rows.filter(row=>row.kind==='waiting').length;
  const reviewed=rows.filter(row=>row.kind==='reviewed').length;
  const next=review>0
    ?{title:`${review} student review${review===1?'':'s'} need your attention`,body:'Open the latest DOCX, use the five-part LitLab rubric, then approve academically or request specific changes.'}
    :waiting>0
      ?{title:`Waiting for ${waiting} student${waiting===1?'':'s'} to submit work`,body:'There is nothing to review until a DOCX arrives. The student card will update automatically when the next version is submitted.'}
      :rows.length
        ?{title:'You are caught up',body:'Your current student reviews are submitted. Wait for a revision, a new DOCX or another assigned student.'}
        :{title:'No student needs a review right now',body:'This is your mentor workspace. When LitLab assigns a student, their name, DOCX and review action will appear here.'};
  const list=rows.length?`<div class="ll-teacher-student-list">${rows.map(row=>`<article><div><b>${esc(row.name)}</b>${row.topic?`<span>${esc(row.topic)}</span>`:''}</div><em class="is-${row.kind}">${esc(row.state)}</em><button type="button" data-jump-teacher-student="${row.index}">${row.kind==='review'?'Review student':'Open student'} ↓</button></article>`).join('')}</div>`:'<div class="ll-teacher-student-empty"><b>No assigned student cards yet.</b><span>LitLab will place the student and their latest DOCX here when your review is needed.</span></div>';
  return `<div class="ll-teacher-student-center-head"><div><span>TEACHER • STUDENTS & REVIEWS</span><h2>Your mentoring center</h2><p>No evidence ledger is used for teacher accounts. This area is only for the students assigned to you, their current review status and what you need to do next.</p></div><strong>${review>0?'ACTION NEEDED':'MENTOR VIEW'}</strong></div><div class="ll-teacher-student-stats"><article><b>${rows.length}</b><span>Assigned students</span></article><article class="${review>0?'is-action':''}"><b>${review}</b><span>Reviews needing you</span></article><article><b>${reviewed}</b><span>Reviews submitted</span></article></div><section class="ll-teacher-next-step"><span>NEXT ACTION</span><h3>${esc(next.title)}</h3><p>${esc(next.body)}</p></section><div class="ll-teacher-center-grid"><section><span>YOUR STUDENTS</span>${list}</section><aside><span>QUICK REVIEW FOCUS</span><h3>What helps the student most</h3><ul><li><b>Accuracy</b><small>Is the content factually and academically sound?</small></li><li><b>Clarity</b><small>Can a DP student understand and use it?</small></li><li><b>DP relevance</b><small>Does it support the right DP skill or assessment?</small></li><li><b>Originality & sources</b><small>Is the work original and properly supported?</small></li></ul></aside></div>`;
}

function ensureTeacherCenter(host:HTMLElement){
  if(completed(host))return;
  const domRows=assignmentRowsFromDom(host);
  const rows=domRows.length?domRows:assignmentRowsFromData();
  let panel=host.querySelector<HTMLElement>('[data-teacher-student-center]');
  if(!panel){
    panel=document.createElement('section');
    panel.dataset.teacherStudentCenter='true';
    panel.className='ll-teacher-student-center';
    const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');
    if(head)head.after(panel);else host.prepend(panel);
  }
  const signature=rows.map(row=>`${row.name}:${row.topic}:${row.kind}`).join('|');
  if(panel.dataset.signature!==signature){panel.dataset.signature=signature;panel.innerHTML=teacherCenterMarkup(rows)}
}

function minimizeCompletedReviewPath(host:HTMLElement){
  const path=host.querySelector<HTMLElement>('[data-review-lifecycle-path]');
  if(!path)return;
  path.classList.add('ll-review-path-minimized');
  const kicker=path.querySelector<HTMLElement>('.ll-lifecycle-path-head span');
  const title=path.querySelector<HTMLElement>('.ll-lifecycle-path-head b');
  if(kicker)kicker.textContent='REVIEW PATH COMPLETE';
  if(title)title.textContent='Completed review path';
  let button=path.querySelector<HTMLButtonElement>('[data-toggle-completed-review-path]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.dataset.toggleCompletedReviewPath='true';
    button.className='ll-completed-review-toggle';
    button.setAttribute('aria-expanded','false');
    button.textContent='Show path';
    path.querySelector('.ll-lifecycle-path-head')?.after(button);
  }
}

function transformCompletionArchive(host:HTMLElement){
  const archive=host.querySelector<HTMLElement>('[data-contributor-completion-archive]');
  if(!archive)return;
  archive.classList.add('ll-completed-record-closed');
  archive.querySelectorAll<HTMLElement>('[data-completion-print],.ll-cas-plan,.ll-activity-evidence').forEach(el=>el.hidden=true);
  const hero=archive.querySelector<HTMLElement>('.ll-completion-copy p');
  if(hero)hero.innerHTML='This contribution is complete. <strong>The student evidence ledger is closed</strong>: no new activity or evidence can be added. Your submitted DOCX versions, teacher feedback and completion record remain saved.';
  const intro=archive.querySelector<HTMLElement>('.ll-completion-intro');
  if(intro){
    const span=intro.querySelector('span');const h2=intro.querySelector('h2');const p=intro.querySelector('p');
    if(span)span.textContent='COMPLETED CONTRIBUTION RECORD';
    if(h2)h2.textContent='Closed record — documents and reviews only';
    if(p)p.textContent='The active evidence ledger is closed. This section keeps the final submission and review history available without reopening student evidence tracking.';
  }
  archive.querySelectorAll<HTMLElement>('.ll-completion-card-head span').forEach(span=>{
    const text=upper(span.textContent);
    if(text==='SUBMISSION EVIDENCE')span.textContent='SUBMISSION RECORD';
    else if(text==='REVISION EVIDENCE')span.textContent='REVISION RECORD';
    else if(text==='REVIEW EVIDENCE')span.textContent='TEACHER REVIEW RECORD';
  });
  archive.querySelectorAll<HTMLElement>('.ll-completion-summary article').forEach(article=>{
    const label=upper(article.querySelector('span')?.textContent);
    if(label==='ACTIVITY RECORD'){
      const name=article.querySelector('span');const value=article.querySelector('b');
      if(name)name.textContent='Evidence ledger';if(value)value.textContent='Closed';
    }
  });
}

function closeCompletedStudentHistory(){
  document.querySelectorAll<HTMLElement>('.ll-my-contrib-card.status-completed').forEach(card=>{
    const role=card.querySelector<HTMLElement>('.ll-history-kickers > span')?.textContent||'';
    if(!/student/i.test(role))return;
    const body=card.querySelector<HTMLElement>('[data-history-detail-body]');if(!body)return;
    body.querySelectorAll<HTMLElement>('.ll-history-record-block').forEach(block=>{
      const label=upper(block.querySelector(':scope > span')?.textContent||'');
      if(label.includes('WORK & EVIDENCE')||label.includes('ARCHIVED EVIDENCE'))block.hidden=true;
    });
    body.querySelectorAll<HTMLElement>('[data-history-save-evidence]').forEach(el=>el.hidden=true);
    if(!body.querySelector('[data-student-evidence-closed-note]')&&!body.querySelector('.ll-history-detail-loading')){
      const note=document.createElement('section');
      note.dataset.studentEvidenceClosedNote='true';
      note.className='ll-student-evidence-closed-note';
      note.innerHTML='<span>COMPLETED • CLOSED</span><h4>Student evidence ledger closed</h4><p>No new evidence or activity can be added to this completed contribution. Your final Word submission and review record remain saved.</p>';
      body.prepend(note);
    }
  });
}

function closeCompletedStudent(host:HTMLElement){
  host.classList.add('ll-completed-student-final-ui');
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{if(evidenceCard(card))card.hidden=true});
  host.querySelectorAll<HTMLElement>('[data-activity-form],[data-activity-list],[data-load-activity],.ll-evidence-ledger,[data-cas-evidence]').forEach(el=>el.hidden=true);
  minimizeCompletedReviewPath(host);
  transformCompletionArchive(host);
  let note=host.querySelector<HTMLElement>('[data-completed-student-ledger-closed]');
  if(!note){
    note=document.createElement('section');
    note.dataset.completedStudentLedgerClosed='true';
    note.className='ll-completed-student-ledger-closed';
    note.innerHTML='<span>STUDENT EVIDENCE CLOSED</span><div><h3>Evidence ledger is closed for this completed contribution.</h3><p>No new activity or evidence can be added. The final DOCX and review history remain available in the completed record.</p></div>';
    const complete=host.querySelector<HTMLElement>('[data-lifecycle-complete-card]');
    if(complete)complete.after(note);else host.querySelector<HTMLElement>(':scope > .ll-workspace-head')?.after(note);
  }
  closeCompletedStudentHistory();
}

function clearState(host:HTMLElement){
  host.classList.remove('ll-teacher-focused-view','ll-completed-student-final-ui');
  host.querySelector('[data-teacher-student-center]')?.remove();
  host.querySelector('[data-completed-student-ledger-closed]')?.remove();
}

function apply(){
  if(running)return;
  running=true;
  try{
    if(route()!=='contribute')return;
    const host=root();if(!host)return;
    const teacher=looksTeacher(host);
    const isComplete=completed(host);
    if(teacher){
      host.classList.remove('ll-completed-student-final-ui');
      host.querySelector('[data-completed-student-ledger-closed]')?.remove();
      removeTeacherEvidence(host);
      ensureTeacherCenter(host);
    }else if(isComplete){
      host.classList.remove('ll-teacher-focused-view');
      host.querySelector('[data-teacher-student-center]')?.remove();
      closeCompletedStudent(host);
    }else clearState(host);
  }finally{running=false}
}

function schedule(){clearTimeout(timer);timer=window.setTimeout(apply,50)}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const toggle=target.closest<HTMLButtonElement>('[data-toggle-completed-review-path]');
  if(toggle){
    const path=toggle.closest<HTMLElement>('[data-review-lifecycle-path]');if(!path)return;
    const open=!path.classList.contains('is-expanded');path.classList.toggle('is-expanded',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Hide path':'Show path';return;
  }
  const jump=target.closest<HTMLButtonElement>('[data-jump-teacher-student]');
  if(jump){
    const host=root();if(!host)return;
    const cards=Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-zone .ll-teacher-assignment'));
    const card=cards[Number(jump.dataset.jumpTeacherStudent||0)];
    card?.scrollIntoView({behavior:'smooth',block:'start'});
    window.setTimeout(()=>card?.querySelector<HTMLElement>('[data-download-doc],form[data-teacher-review] select,form.ll-review-form select')?.focus({preventScroll:true}),420);
  }
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  selectedId=detail.selectedId||selectedId;
  schedule();
});
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('hashchange',()=>{selectedId='';workspaces=[];assignments=[];schedule()});
window.addEventListener('focus',schedule);

const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
