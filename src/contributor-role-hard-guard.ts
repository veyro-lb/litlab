import './contributor-role-hard-guard.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type RoleState={role?:'student'|'teacher'|null;is_admin?:boolean};
type WorkspaceRow={id:string;status?:string;applicant_type?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};

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
  host.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{if(evidenceWorkspaceCard(card))card.remove()});
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

function apply(){
  scheduled=false;
  removeTeacherHistoryEvidence();
  if(route()!=='contribute')return;
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  if(!host)return;
  if(teacherWorkspace(host))stripTeacherWorkspaceEvidence(host);
  syncPathButton(host);
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});

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
window.addEventListener('hashchange',()=>{selectedId='';workspaces=[];void loadRole().then(schedule)});
window.addEventListener('focus',()=>void loadRole().then(schedule));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void loadRole().then(schedule),{once:true});else void loadRole().then(schedule);

export {};
