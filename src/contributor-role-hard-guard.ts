import './contributor-role-hard-guard.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type RoleState={role?:'student'|'teacher'|null;is_admin?:boolean};
type WorkspaceRow={id:string;status?:string;applicant_type?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};

type BusyCopy={label:string;state:string};

let accountRole:''|'student'|'teacher'|'admin'='';
let roleLoadedAt=0;
let roleLoading:Promise<void>|null=null;
let selectedId='';
let workspaces:WorkspaceRow[]=[];
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function upper(value:unknown){return String(value??'').trim().toUpperCase()}
function selected(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}

async function loadRole(force=false){
  if(!token()){accountRole='';roleLoadedAt=0;return}
  if(!force&&accountRole&&Date.now()-roleLoadedAt<15000)return;
  if(roleLoading)return roleLoading;
  roleLoading=(async()=>{
    try{
      const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_litlab_contributor_account_role`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},
        body:'{}'
      });
      if(!response.ok)return;
      const data=await response.json() as RoleState;
      accountRole=data.is_admin?'admin':data.role==='teacher'?'teacher':data.role==='student'?'student':'';
      roleLoadedAt=Date.now();
    }catch{}
  })().finally(()=>{roleLoading=null});
  return roleLoading;
}

function isTeacherHistory(card:HTMLElement){
  const label=card.querySelector<HTMLElement>('.ll-history-kickers > span')?.textContent||'';
  return /teacher/i.test(label);
}

function removeTeacherHistoryEvidence(){
  document.querySelectorAll<HTMLElement>('.ll-my-contrib-card').forEach(card=>{
    if(!isTeacherHistory(card))return;
    card.classList.add('ll-history-teacher-no-evidence');
    const body=card.querySelector<HTMLElement>('[data-history-detail-body]');
    if(!body)return;
    body.querySelectorAll<HTMLElement>('.ll-history-record-block').forEach(block=>{
      const label=upper(block.querySelector(':scope > span')?.textContent||'');
      if(label.includes('WORK & EVIDENCE')||label.includes('CONTRIBUTION EVIDENCE')||label.includes('CAS EVIDENCE')||label.includes('ACTIVITY EVIDENCE'))block.remove();
    });
    body.querySelectorAll<HTMLElement>('[data-history-save-evidence]').forEach(el=>el.remove());
    body.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
      if(/evidence\s+pdf|save\s+.*evidence/i.test(button.textContent||''))button.remove();
    });
    if(!body.querySelector('[data-teacher-history-purpose]')&&!body.querySelector('.ll-history-detail-loading')){
      const panel=document.createElement('section');
      panel.dataset.teacherHistoryPurpose='true';
      panel.className='ll-teacher-history-purpose';
      panel.innerHTML='<span>MENTORING RECORD</span><h4>Teacher records are for student review work.</h4><p>No contribution evidence ledger is used for teachers. This record keeps your mentoring application, student-review decisions, notes and testimony.</p>';
      body.prepend(panel);
    }
  });
}

function teacherWorkspace(host:HTMLElement){
  if(accountRole==='teacher')return true;
  const accountRoot=document.getElementById('ll-contributor-root');
  if(accountRoot?.dataset.contributorAccountRole==='teacher')return true;
  const current=selected();
  if(current?.applicant_type)return current.applicant_type==='teacher';
  return host.classList.contains('ll-teacher-reviewer-mode')||host.classList.contains('ll-role-clarity-teacher')||Boolean(host.querySelector('.ll-teacher-zone,.ll-teacher-assignment'));
}

function evidenceWorkspaceCard(card:HTMLElement){
  if(card.querySelector('.ll-activity-form,[data-activity-form],[data-activity-list],[data-evidence-form],[data-evidence-list],[data-cas-evidence]'))return true;
  const kicker=upper(card.querySelector<HTMLElement>('.ll-card-title span,:scope > span')?.textContent||'');
  const title=upper(card.querySelector<HTMLElement>('.ll-card-title h3,:scope > h3')?.textContent||'');
  return kicker.includes('EVIDENCE')||kicker.includes('CAS')||kicker.includes('ACTIVITY')||title.includes('EVIDENCE LEDGER')||title.includes('CAS EVIDENCE')||title==='ACTIVITY LOG';
}

function studentOnlyTeacherCard(card:HTMLElement){
  if(card.closest('.ll-teacher-zone')||card.matches('[data-teacher-reviewer-role-card]'))return false;
  const kicker=upper(card.querySelector<HTMLElement>('.ll-card-title span,:scope > span')?.textContent||'');
  const title=upper(card.querySelector<HTMLElement>('.ll-card-title h3,:scope > h3')?.textContent||'');
  const text=`${kicker} ${title}`;
  return ['PROJECT BRIEF','CURRENT WORK','DELIVERABLES','STARTER STRUCTURE','OPTIONAL STUDENT RECORD','COMPLETED CONTRIBUTION'].some(key=>text.includes(key));
}

function ensureTeacherFallback(host:HTMLElement){
  if(host.querySelector('[data-teacher-student-center],[data-teacher-hard-review-center]'))return;
  const assignments=Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-zone .ll-teacher-assignment'));
  const pending=assignments.filter(card=>{
    const form=card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');
    const submit=form?.querySelector<HTMLButtonElement>('button[type="submit"]');
    return Boolean(form&&submit&&!submit.disabled&&!form.hasAttribute('hidden'));
  }).length;
  const waiting=assignments.filter(card=>!card.querySelector('[data-download-doc]')).length;
  const panel=document.createElement('section');
  panel.dataset.teacherHardReviewCenter='true';
  panel.className='ll-teacher-hard-review-center';
  panel.innerHTML=`<div><span>TEACHER REVIEW CENTER</span><h2>${pending?`${pending} student review${pending===1?'':'s'} need your attention`:'Your students and reviews'}</h2><p>Teacher accounts do not use a contribution evidence ledger. Use this space to review assigned student DOCX files, give specific academic feedback and send each student to the correct next step.</p></div><section><article><b>${assignments.length}</b><span>Assigned students</span></article><article class="${pending?'is-action':''}"><b>${pending}</b><span>Reviews needing you</span></article><article><b>${waiting}</b><span>Waiting for DOCX</span></article></section><small>${pending?'Open the assigned student section below and review the latest DOCX.':'When a student needs you, their latest DOCX and review controls will appear below.'}</small>`;
  const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  if(head)head.after(panel);else host.prepend(panel);
}

function stripTeacherWorkspaceEvidence(host:HTMLElement){
  host.classList.add('ll-hard-teacher-no-evidence');
  host.querySelectorAll<HTMLElement>('[data-mentor-pipeline],.ll-mentor-pipeline').forEach(el=>el.remove());
  host.querySelector('.ll-workspace-timeline')?.remove();
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{if(evidenceWorkspaceCard(card)||studentOnlyTeacherCard(card))card.remove()});
  host.querySelectorAll<HTMLElement>('.ll-workspace-cas,.ll-evidence-ledger,[data-cas-evidence],[data-history-save-evidence],.ll-activity-evidence,[data-evidence-form],[data-evidence-list],[data-activity-form],[data-activity-list],[data-mentor-evidence-form],.ll-mentor-evidence').forEach(el=>el.remove());
  ensureTeacherFallback(host);
}

function completedStudent(host:HTMLElement){
  const current=selected();
  if(current?.applicant_type==='student'&&current.status==='completed')return true;
  return !teacherWorkspace(host)&&host.classList.contains('ll-lifecycle-completed');
}

function syncPathButton(host:HTMLElement){
  if(!completedStudent(host))return;
  const path=host.querySelector<HTMLElement>('[data-review-lifecycle-path]');
  if(!path)return;
  path.classList.add('ll-review-path-minimized');
  let button=path.querySelector<HTMLButtonElement>('[data-toggle-completed-review-path]');
  if(button){button.textContent=path.classList.contains('is-expanded')?'Minimize path':'Show path';button.setAttribute('aria-label',path.classList.contains('is-expanded')?'Minimize completed review path':'Show completed review path');return}
  button=path.querySelector<HTMLButtonElement>('[data-hard-completed-path-toggle]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.dataset.hardCompletedPathToggle='true';
    button.className='ll-completed-review-toggle';
    path.querySelector('.ll-lifecycle-path-head')?.after(button);
  }
  const open=path.classList.contains('is-expanded');
  button.textContent=open?'Minimize path':'Show path';
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Minimize completed review path':'Show completed review path');
}

function syncTeacherReviewForms(){
  document.querySelectorAll<HTMLFormElement>('.ll-teacher-assignment form[data-teacher-review],.ll-teacher-assignment form.ll-review-form').forEach(form=>{
    let note=form.querySelector<HTMLElement>('[data-review-submit-note]');
    if(!note){
      note=document.createElement('p');
      note.dataset.reviewSubmitNote='true';
      note.className='ll-review-submit-note';
      note.textContent='Your decision applies to the current DOCX. Once submitted, this version is locked until the workflow moves forward.';
      const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if(button)button.before(note);else form.append(note);
    }
    if(form.dataset.usabilityReviewWired!=='true'){
      form.dataset.usabilityReviewWired='true';
      form.addEventListener('change',()=>syncTeacherReviewForms());
    }
    if(form.dataset.reviewFlowLocked==='true')return;
    const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if(!button||button.getAttribute('aria-busy')==='true')return;
    const recommendation=form.querySelector<HTMLSelectElement>('select[name="recommendation"]')?.value||'';
    button.textContent=recommendation==='approve'?'Approve & send to LitLab admin':recommendation==='request_changes'?'Request changes from student':'Submit teacher review';
  });
}

function cleanAdminTeacherWorkspaceButtons(){
  if(route()!=='admin-contributors')return;
  document.querySelectorAll<HTMLElement>('.admin-contrib-card').forEach(card=>{
    const role=(card.querySelector<HTMLElement>('.admin-contrib-summary-meta > span')?.textContent||'').trim().toLowerCase();
    const manage=card.querySelector<HTMLButtonElement>('[data-admin-manage-workspace]');
    if(!manage)return;
    const teacher=role.includes('teacher');
    manage.hidden=teacher;
    manage.disabled=teacher;
    if(teacher){manage.setAttribute('aria-hidden','true');manage.title='Teacher applications use status, chat and mentoring records rather than the student workspace manager.'}
    else{manage.removeAttribute('aria-hidden');manage.removeAttribute('title')}
  });
}

function syncAdminCompletionGate(){
  if(route()!=='admin-contributors')return;
  document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach(card=>{
    const role=(card.querySelector<HTMLElement>('.admin-contrib-summary-meta > span')?.textContent||'').trim().toLowerCase();
    if(role.includes('teacher'))return;
    const select=card.querySelector<HTMLSelectElement>('select[data-contributor-status]');
    const option=select?.querySelector<HTMLOptionElement>('option[value="completed"]');
    if(!select||!option)return;
    const tone=card.querySelector<HTMLElement>('[data-admin-final-doc-clarity]')?.dataset.tone||'';
    const allowed=select.value==='completed'||tone==='final'||tone==='done';
    option.disabled=!allowed;
    if(!allowed){select.title='Completion unlocks when the exact Final submission DOCX reaches LitLab admin review.'}
    else select.removeAttribute('title');
    let note=card.querySelector<HTMLElement>('[data-admin-completion-gate-note]');
    if(!allowed){
      if(!note){note=document.createElement('small');note.dataset.adminCompletionGateNote='true';note.className='ll-admin-completion-gate-note';const notify=card.querySelector('.admin-contrib-notify-note');if(notify)notify.before(note);else select.parentElement?.after(note)}
      note.textContent='Completion is locked until the intended DOCX is marked “Final submission” and reaches LitLab admin review.';
    }else note?.remove();
  });
}

function makeStatesAccessible(){
  document.querySelectorAll<HTMLElement>('[data-form-state],[data-admin-state],[data-upload-state],[data-evidence-state],.admin-contrib-save-state').forEach(state=>{
    state.setAttribute('role','status');
    state.setAttribute('aria-live','polite');
  });
  document.querySelectorAll<HTMLButtonElement>('[data-life-notice-close],[data-close],[data-admin-workspace-close]').forEach(button=>{button.type='button'});
}

function busyCopy(form:HTMLFormElement):BusyCopy|null{
  if(form.matches('[data-revision-response]'))return {label:'Sending…',state:'Sending your revision response…'};
  if(form.matches('[data-activity-form]'))return {label:'Saving…',state:'Saving activity…'};
  if(!form.closest('#ll-admin-contributor-workspace'))return null;
  if(form.matches('[data-admin-brief]'))return {label:'Saving…',state:'Saving project brief…'};
  if(form.matches('[data-admin-add-task]'))return {label:'Adding…',state:'Adding task…'};
  if(form.matches('[data-admin-add-revision]'))return {label:'Sending…',state:'Sending revision request…'};
  if(form.matches('[data-admin-assign-teacher]'))return {label:'Assigning…',state:'Assigning teacher reviewer…'};
  return null;
}

function startFormBusy(form:HTMLFormElement){
  const copy=busyCopy(form);if(!copy)return;
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(!button||button.disabled)return;
  const state=form.querySelector<HTMLElement>('[data-form-state],[data-admin-state]');
  const original=button.textContent||'';
  button.disabled=true;button.setAttribute('aria-busy','true');button.textContent=copy.label;
  if(state){state.textContent=copy.state;state.dataset.state='';state.setAttribute('role','status');state.setAttribute('aria-live','polite')}
  let released=false;
  let observer:MutationObserver|null=null;
  const release=()=>{
    if(released)return;released=true;observer?.disconnect();observer=null;
    if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');button.textContent=original}
  };
  if(state){
    observer=new MutationObserver(()=>{
      const text=(state.textContent||'').trim().toLowerCase();
      if(text&&!/(saving|sending|adding|assigning|submitting|loading)/.test(text))release();
    });
    observer.observe(state,{childList:true,subtree:true,characterData:true});
  }
  window.setTimeout(release,REQUEST_TIMEOUT_MS+3000);
}

function docPath(button:HTMLButtonElement){return button.dataset.downloadDoc||button.dataset.adminDownloadDoc||''}
function docTail(button:HTMLButtonElement){return button.querySelector<HTMLElement>('i')}
function setDocFeedback(button:HTMLButtonElement,text:string){
  const tail=docTail(button);
  if(tail){if(button.dataset.usabilityOriginalTail===undefined)button.dataset.usabilityOriginalTail=tail.textContent||'';tail.textContent=text;return}
  if(button.dataset.usabilityOriginalText===undefined)button.dataset.usabilityOriginalText=button.textContent||'';
  button.textContent=text;
}
function restoreDocFeedback(button:HTMLButtonElement){
  const tail=docTail(button);
  if(tail&&button.dataset.usabilityOriginalTail!==undefined){tail.textContent=button.dataset.usabilityOriginalTail;delete button.dataset.usabilityOriginalTail}
  if(!tail&&button.dataset.usabilityOriginalText!==undefined){button.textContent=button.dataset.usabilityOriginalText;delete button.dataset.usabilityOriginalText}
}
function clearReadyDoc(button:HTMLButtonElement){delete button.dataset.secureReadyUrl;delete button.dataset.secureReadyAt;button.removeAttribute('title')}
function placeholderWindow(){
  try{
    const popup=window.open('about:blank','_blank');
    if(popup){popup.opener=null;try{popup.document.title='Opening LitLab DOCX';popup.document.body.innerHTML='<main style="font:16px system-ui;padding:32px;color:#20242c"><b>Opening secure LitLab DOCX…</b><p>Please keep this tab open for a moment.</p></main>'}catch{}}
    return popup;
  }catch{return null}
}

async function openSecureDocument(button:HTMLButtonElement){
  const ready=button.dataset.secureReadyUrl||'';const readyAt=Number(button.dataset.secureReadyAt||0);
  if(ready&&Date.now()-readyAt<240_000){
    const popup=window.open(ready,'_blank');
    if(popup){popup.opener=null;clearReadyDoc(button);restoreDocFeedback(button);return}
    setDocFeedback(button,'Allow pop-ups, then click again');button.title='Your browser blocked the new tab. Allow pop-ups for LitLab, then click this button again.';return;
  }
  clearReadyDoc(button);
  const path=docPath(button);if(!path)return;
  const popup=placeholderWindow();
  button.disabled=true;button.setAttribute('aria-busy','true');setDocFeedback(button,'Opening…');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const encoded=path.split('/').map(encodeURIComponent).join('/');
    const response=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/contributor-documents/${encoded}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify({expiresIn:300}),signal:controller.signal});
    if(!response.ok)throw new Error(`Secure document link failed (${response.status})`);
    const data=await response.json() as {signedURL?:string;signedUrl?:string};
    const signed=data.signedURL||data.signedUrl;if(!signed)throw new Error('No secure document link returned');
    const href=/^https?:\/\//i.test(signed)?signed:`${SUPABASE_URL}/storage/v1${signed}`;
    if(popup&&!popup.closed){popup.location.replace(href);restoreDocFeedback(button)}
    else{button.dataset.secureReadyUrl=href;button.dataset.secureReadyAt=String(Date.now());setDocFeedback(button,'Ready — click again');button.title='The secure link is ready. Click again to open the DOCX.'}
  }catch(error){
    console.error(error);try{popup?.close()}catch{}
    setDocFeedback(button,navigator.onLine?'Couldn’t open — try again':'Offline — reconnect');
    window.setTimeout(()=>{if(button.isConnected&&!button.dataset.secureReadyUrl)restoreDocFeedback(button)},2400);
  }finally{
    window.clearTimeout(timeout);
    if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy')}
  }
}

function repairRetryControls(){
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  const error=host?.querySelector<HTMLElement>('.ll-workspace-empty');
  if(error&&/could not load/i.test(error.textContent||'')&&!error.querySelector('[data-workspace-retry]')){
    const button=document.createElement('button');button.type='button';button.dataset.workspaceRetry='true';button.textContent='Try loading again';error.appendChild(button);
  }
  document.querySelectorAll<HTMLElement>('[data-activity-list]').forEach(list=>{
    if(!/could not load/i.test(list.textContent||'')||list.querySelector('[data-load-activity]'))return;
    const id=list.dataset.activityList||'';if(!id)return;
    const button=document.createElement('button');button.type='button';button.className='ll-quiet-button';button.dataset.loadActivity=id;button.textContent='Try activity log again';list.appendChild(button);
  });
}

function apply(){
  scheduled=false;
  removeTeacherHistoryEvidence();
  makeStatesAccessible();
  cleanAdminTeacherWorkspaceButtons();
  syncAdminCompletionGate();
  repairRetryControls();
  syncTeacherReviewForms();
  if(route()!=='contribute')return;
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  if(!host)return;
  if(teacherWorkspace(host))stripTeacherWorkspaceEvidence(host);
  syncPathButton(host);
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});

window.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const finalButton=target.closest<HTMLButtonElement>('[data-open-final-admin-doc]');
  if(finalButton){
    event.preventDefault();event.stopImmediatePropagation();
    const body=finalButton.closest<HTMLElement>('[data-admin-workspace-body]');
    const row=body?.querySelector<HTMLElement>('.ll-admin-final-doc-row');
    const download=row?.querySelector<HTMLButtonElement>('[data-admin-download-doc]');
    if(download){download.click();return}
    const original=finalButton.textContent||'Open final DOCX →';finalButton.textContent='Final DOCX not ready — refresh';finalButton.disabled=true;window.setTimeout(()=>{if(finalButton.isConnected){finalButton.disabled=false;finalButton.textContent=original}},2200);return;
  }
  const doc=target.closest<HTMLButtonElement>('[data-download-doc],[data-admin-download-doc]');
  if(doc&&!doc.disabled){event.preventDefault();event.stopImmediatePropagation();void openSecureDocument(doc);return}
  const retry=target.closest<HTMLButtonElement>('[data-workspace-retry]');
  if(retry){event.preventDefault();retry.disabled=true;retry.textContent='Retrying…';window.dispatchEvent(new Event('online'));window.setTimeout(()=>{if(retry.isConnected){retry.disabled=false;retry.textContent='Try loading again'}},2500)}
},true);

window.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(form)startFormBusy(form)},true);

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const own=target.closest<HTMLButtonElement>('[data-hard-completed-path-toggle]');
  if(own){
    const path=own.closest<HTMLElement>('[data-review-lifecycle-path]');if(!path)return;
    const open=!path.classList.contains('is-expanded');
    path.classList.toggle('is-expanded',open);
    own.setAttribute('aria-expanded',String(open));
    own.textContent=open?'Minimize path':'Show path';
    return;
  }
  if(target.closest('[data-toggle-completed-review-path]'))queueMicrotask(schedule);
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  selectedId=detail.selectedId||selectedId;
  schedule();
});
window.addEventListener('litlab:contributor-account-role',()=>{void loadRole(true).then(schedule)});
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>schedule());
window.addEventListener('litlab:contributor-admin-updated',()=>schedule());
window.addEventListener('hashchange',()=>{selectedId='';workspaces=[];void loadRole().then(schedule)});
window.addEventListener('focus',()=>void loadRole().then(schedule));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void loadRole().then(schedule),{once:true});else void loadRole().then(schedule);

export {};
