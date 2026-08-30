import './contributor-final-review-clarity.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type WorkspaceRow={id:string;status?:string;applicant_type?:string;topics?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};
type Pipeline={
  application_id:string; applicant_type?:string; stage:string; mentor_required?:boolean;
  student_name?:string|null; topics?:string|null;
  assignment?:{teacher_name?:string|null}|null;
  latest_document?:{id?:string;original_name?:string;version_label?:string;is_final_submission?:boolean;created_at?:string;mentor_review_status?:string}|null;
};
type ReviewNotice={
  id:string;application_id:string;event_type:string;created_at:string;role_context?:string;applicant_type?:string;
  full_name?:string|null;student_name?:string|null;teacher_name?:string|null;topics?:string|null;
  document_name?:string|null;version_label?:string|null;is_final_submission?:boolean;detail?:Record<string,unknown>|null;
};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let observer:MutationObserver|null=null;
let scanTimer=0;
let noticeBusy=false;
const adminCache=new Map<string,{at:number;data:Pipeline}>();

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmt(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function selectedWorkspace(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{clearTimeout(timeout)}
}

function polishHistory(){
  document.querySelectorAll<HTMLElement>('.ll-my-contrib-card').forEach(card=>{
    const role=card.querySelector<HTMLElement>('.ll-history-kickers > span')?.textContent?.trim().toLowerCase()||'';
    const teacher=role.includes('teacher');
    const completed=card.classList.contains('status-completed');
    const body=card.querySelector<HTMLElement>('[data-history-detail-body]');
    if(!body)return;

    const evidenceBlocks=Array.from(body.querySelectorAll<HTMLElement>('.ll-history-record-block')).filter(block=>
      (block.querySelector(':scope > span')?.textContent||'').trim().toUpperCase().includes('WORK & EVIDENCE RECORD')
    );

    if(teacher){
      evidenceBlocks.forEach(block=>block.remove());
      body.querySelectorAll('[data-history-save-evidence]').forEach(el=>el.remove());
      if(!body.querySelector('[data-teacher-history-note]')&&!body.querySelector('.ll-history-detail-loading')){
        const note=document.createElement('div');note.dataset.teacherHistoryNote='true';note.className='ll-teacher-history-note';
        note.innerHTML='<b>Mentoring record only</b><span>Teacher accounts do not have an evidence ledger or CAS evidence record. This history only preserves your mentoring application and academic-review record.</span>';
        body.prepend(note);
      }
      return;
    }

    if(completed){
      evidenceBlocks.forEach(block=>{
        const kicker=block.querySelector<HTMLElement>(':scope > span');if(kicker)kicker.textContent='ARCHIVED EVIDENCE • READ ONLY';
        block.classList.add('ll-completed-evidence-archive');
        if(!block.querySelector('[data-evidence-closed-note]')){
          const note=document.createElement('p');note.dataset.evidenceClosedNote='true';note.className='ll-evidence-closed-note';note.innerHTML='<b>Closed:</b> this evidence record is preserved exactly as completed. Nothing new can be added to this contribution.';block.appendChild(note);
        }
      });
    }
  });
}

function syncCompletedReviewPath(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  const current=selectedWorkspace();
  const completed=current?.applicant_type==='student'&&current.status==='completed';
  root.classList.toggle('ll-complete-path-synced',Boolean(completed));
  if(!completed)return;
  const path=root.querySelector<HTMLElement>('[data-review-lifecycle-path]');
  const completeCard=root.querySelector<HTMLElement>('[data-lifecycle-complete-card]');
  if(path){
    path.classList.add('is-complete');
    const kicker=path.querySelector<HTMLElement>('.ll-lifecycle-path-head span');if(kicker)kicker.textContent='REVIEW PATH COMPLETE';
    const title=path.querySelector<HTMLElement>('.ll-lifecycle-path-head b');if(title)title.textContent='Student → teacher (if selected) → LitLab admin → complete';
  }
  if(path&&completeCard&&path.nextElementSibling!==completeCard)path.after(completeCard);
  root.querySelectorAll<HTMLFormElement>('form').forEach(form=>{
    if(form.closest('[data-contributor-completion-archive]'))return;
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLButtonElement>('input,select,textarea,button').forEach(control=>control.disabled=true);
  });
}

function removeTeacherEvidenceFromWorkspace(){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');const current=selectedWorkspace();
  if(!root||current?.applicant_type!=='teacher')return;
  root.querySelectorAll<HTMLElement>('.ll-workspace-card').forEach(card=>{
    const kicker=(card.querySelector('.ll-card-title span,:scope > span')?.textContent||'').trim().toUpperCase();
    if(kicker.includes('EVIDENCE')||kicker.includes('CAS')||kicker.includes('ACTIVITY'))card.hidden=true;
  });
  root.querySelectorAll<HTMLElement>('[data-history-save-evidence],.ll-activity-evidence').forEach(el=>el.hidden=true);
}

async function adminPipeline(id:string,force=false){
  const cached=adminCache.get(id);if(!force&&cached&&Date.now()-cached.at<8000)return cached.data;
  const data=await rpc<Pipeline>('admin_get_litlab_contributor_pipeline',{p_application_id:id});adminCache.set(id,{at:Date.now(),data});return data;
}

function finalDocCopy(data:Pipeline){
  const d=data.latest_document;if(!d)return {title:'No DOCX submitted yet',body:'There is no document ready for final review.',tone:'waiting'};
  const name=d.original_name||'Word document';const version=d.version_label||'Current version';const teacher=data.assignment?.teacher_name||'the assigned teacher';
  if(data.stage==='complete')return {title:`Final DOCX reviewed: ${version}`,body:`${name} is the completed, archived document for this contribution.`,tone:'done'};
  if(data.stage==='admin_review'&&d.is_final_submission){return {title:'FINAL DOCX — REVIEW THIS EXACT FILE',body:`${version} — ${name}${data.mentor_required?` • approved by ${teacher}`:''}. This is the document LitLab admin should judge for completion.`,tone:'final'}}
  if(data.stage==='admin_review'&&data.mentor_required){return {title:'TEACHER-APPROVED DOCX — FINAL ADMIN HANDOFF',body:`${version} — ${name} • approved by ${teacher}. Teacher approval makes this the document LitLab admin should judge for completion, even if the student's “Final submission” label was not set.`,tone:'final'}}
  if(data.stage==='admin_review')return {title:'Latest DOCX is NOT marked Final submission',body:`${version} — ${name}. Do not complete this contribution until the student marks the intended version as Final submission.`,tone:'warning'};
  if(d.is_final_submission&&data.stage==='mentor_review')return {title:'Final submission is with the teacher',body:`${version} — ${name} is currently being reviewed by ${teacher}. Admin should wait for the teacher decision.`,tone:'teacher'};
  return {title:`Current DOCX: ${version}`,body:`${name} is not yet at the final LitLab review stage.`,tone:'waiting'};
}

function decorateAdminCard(card:HTMLElement,data:Pipeline){
  if(data.applicant_type!=='student')return;
  let box=card.querySelector<HTMLElement>('[data-admin-final-doc-clarity]');
  if(!box){box=document.createElement('section');box.dataset.adminFinalDocClarity='true';box.className='ll-admin-final-doc-clarity';const owner=card.querySelector('[data-admin-student-review-owner]');const status=card.querySelector('.admin-contrib-status-row');(owner||status||card.querySelector('summary'))?.after(box)}
  const copy=finalDocCopy(data);box.dataset.tone=copy.tone;box.innerHTML=`<span>${copy.tone==='final'?'FINAL REVIEW DOCUMENT':'DOCUMENT STATUS'}</span><b>${esc(copy.title)}</b><p>${esc(copy.body)}</p>`;
}

function decorateAdminModal(data:Pipeline){
  const modal=document.getElementById('ll-admin-contributor-workspace');const body=modal?.querySelector<HTMLElement>('[data-admin-workspace-body]');if(!body||data.applicant_type!=='student')return;
  let banner=body.querySelector<HTMLElement>('[data-admin-final-doc-banner]');if(!banner){banner=document.createElement('section');banner.dataset.adminFinalDocBanner='true';banner.className='ll-admin-final-doc-banner';body.prepend(banner)}
  const copy=finalDocCopy(data);const doc=data.latest_document;banner.dataset.tone=copy.tone;
  banner.innerHTML=`<div><span>${copy.tone==='final'?'FINAL DOCX FOR LITLAB REVIEW':'DOCUMENT HANDOFF'}</span><h3>${esc(copy.title)}</h3><p>${esc(copy.body)}</p>${doc?.created_at?`<small>Submitted ${esc(fmt(doc.created_at))}</small>`:''}</div>${doc&&copy.tone==='final'?'<button type="button" data-open-final-admin-doc>Open final DOCX →</button>':''}`;

  const rows=Array.from(body.querySelectorAll<HTMLElement>('.ll-admin-doc-list > div'));
  rows.forEach(row=>{
    const text=row.textContent||'';const isFinal=Boolean(doc&&((doc.original_name&&text.includes(doc.original_name))||(doc.version_label&&text.includes(doc.version_label))));
    row.classList.toggle('ll-admin-final-doc-row',isFinal);
    row.querySelector('[data-admin-final-row-badge]')?.remove();
    if(isFinal){const badge=document.createElement('strong');badge.dataset.adminFinalRowBadge='true';badge.className='ll-admin-final-row-badge';badge.textContent=doc?.is_final_submission?'FINAL DOC • REVIEW THIS':data.mentor_required&&data.stage==='admin_review'?'FINAL DOC • TEACHER APPROVED':'LATEST DOC';row.querySelector('section')?.appendChild(badge)}
  });
}

async function refreshAdmin(force=false){
  if(route()!=='admin-contributors'||!token())return;
  const cards=Array.from(document.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]'));
  await Promise.all(cards.map(async card=>{
    const role=(card.querySelector('.admin-contrib-summary-meta > span')?.textContent||'').toLowerCase();if(role.includes('teacher'))return;
    const id=card.dataset.appId||'';if(!id)return;
    try{const data=await adminPipeline(id,force);if(card.isConnected)decorateAdminCard(card,data)}catch{}
  }));
  const modal=document.getElementById('ll-admin-contributor-workspace');if(modal){const openId=cards.find(card=>card.querySelector('[data-admin-manage-workspace]')?.getAttribute('aria-expanded')==='true')?.dataset.appId||'';if(openId)try{decorateAdminModal(await adminPipeline(openId,force))}catch{}}
}

function clearLifecycleNotice(el:HTMLElement){el.classList.add('is-closing');window.setTimeout(()=>el.remove(),180)}

function noticeCopy(n:ReviewNotice){
  const student=n.student_name||n.full_name||'the student';const teacher=n.teacher_name||String(n.detail?.teacher_name||'the assigned teacher');
  const file=n.document_name||String(n.detail?.file_name||'the DOCX');const version=n.version_label||String(n.detail?.version_label||'current version');const final=n.is_final_submission||version.toLowerCase()==='final submission';const role=n.role_context||'';
  if(n.event_type==='document_submitted_for_mentor_review')return role==='teacher'?{title:`${student} submitted ${final?'a FINAL DOCX':'a DOCX'} for you`,body:`Review ${version} — ${file}. You are the assigned teacher reviewer.`}:{title:`Your ${final?'FINAL ':''}DOCX is with ${teacher}`,body:`${version} — ${file} is waiting for ${teacher}. It will either return to you for revisions or move to LitLab admin.`};
  if(n.event_type==='mentor_requested_changes')return role==='teacher'?{title:`Revision request sent to ${student}`,body:`Your notes are now visible to ${student}. Wait for a revised DOCX.`}:role==='admin'?{title:`${teacher} requested revisions from ${student}`,body:`Wait for ${student} to upload a new DOCX; it will return to ${teacher}.`}:{title:`${teacher} requested changes`,body:`Read ${teacher}'s notes, revise your DOCX, and upload the next version.`};
  if(n.event_type==='mentor_approved_document')return role==='teacher'?{title:`You approved ${student}'s ${final?'final ':''}DOCX`,body:`${version} — ${file} is now with LitLab admin.`}:role==='admin'?{title:`${teacher} approved ${student}'s ${final?'FINAL ':''}DOCX`,body:`Review ${version} — ${file}. This is the current handoff to LitLab admin.`}:{title:`${teacher} approved your DOCX`,body:`${version} — ${file} is now with LitLab admin for the final decision.`};
  if(n.event_type==='document_submitted_for_admin_review')return role==='admin'?{title:`${student} submitted ${final?'a FINAL DOCX':'a DOCX'} to LitLab`,body:`Review ${version} — ${file}. No teacher review is required.`}:{title:'Your DOCX is with LitLab admin',body:`${version} — ${file} is now in LitLab's review queue.`};
  if(n.event_type==='mentor_linked'||n.event_type==='teacher_assigned_by_admin')return role==='teacher'?{title:`You are now mentoring ${student}`,body:`You are the responsible teacher reviewer. You will be notified when ${student} submits a DOCX.`}:{title:`${teacher} is your teacher reviewer`,body:`When you submit a DOCX, it goes to ${teacher} before LitLab admin.`};
  if(n.event_type==='admin_completed_contribution')return {title:`${student}'s contribution is complete`,body:role==='student'?'LitLab completed your contribution. Your review path and evidence record are now closed and archived; the site will update soon.':'The contribution is complete and the final record is archived.'};
  if(n.event_type==='teacher_mentoring_completed')return {title:`Thank you for mentoring ${student}`,body:`Your mentoring record is complete. Your academic testimony remains attached to ${student}'s contribution; your teacher dashboard is now read-only.`};
  return null;
}

async function enhanceLifecycleNotice(){
  const el=document.getElementById('ll-review-lifecycle-notice');if(!el||el.dataset.clarityEnhanced==='true'||noticeBusy||!token())return;
  noticeBusy=true;
  try{
    const rows=await rpc<ReviewNotice[]>('get_my_litlab_contributor_review_notices');const latest=(Array.isArray(rows)?rows:[]).slice().sort((a,b)=>(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0))[0];if(!latest)return;
    const copy=noticeCopy(latest);if(!copy)return;
    el.dataset.clarityEnhanced='true';el.dataset.applicationId=latest.application_id;el.dataset.noticeId=latest.id;el.dataset.roleContext=latest.role_context||'';
    const kicker=el.querySelector<HTMLElement>(':scope > span');if(kicker)kicker.textContent=latest.role_context==='admin'?'LITLAB • ADMIN REVIEW UPDATE':latest.role_context==='teacher'?'LITLAB • TEACHER REVIEW UPDATE':'LITLAB • DOCUMENT REVIEW UPDATE';
    const title=el.querySelector<HTMLElement>('section b');const body=el.querySelector<HTMLElement>('section p');if(title)title.textContent=copy.title;if(body)body.textContent=copy.body;
  }catch{}finally{noticeBusy=false}
}

function schedule(force=false){clearTimeout(scanTimer);scanTimer=window.setTimeout(()=>{polishHistory();syncCompletedReviewPath();removeTeacherEvidenceFromWorkspace();void enhanceLifecycleNotice();if(route()==='admin-contributors')void refreshAdmin(force)},70)}

window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};selectedId=detail.selectedId||selectedId;workspaces=Array.isArray(detail.workspaces)?detail.workspaces:workspaces;schedule(true)});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{const id=(event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'';if(id)void adminPipeline(id,true).then(decorateAdminModal).catch(()=>{});schedule(true)});
window.addEventListener('hashchange',()=>schedule(true));
window.addEventListener('focus',()=>schedule(true));
window.addEventListener('litlab:contributor-workspace-updated',()=>schedule(true));

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const close=target.closest<HTMLButtonElement>('#ll-review-lifecycle-notice [data-life-notice-close]');
  if(close){event.preventDefault();event.stopImmediatePropagation();const el=close.closest<HTMLElement>('#ll-review-lifecycle-notice');if(el)clearLifecycleNotice(el);return}
  const openFinal=target.closest<HTMLButtonElement>('[data-open-final-admin-doc]');
  if(openFinal){const body=openFinal.closest<HTMLElement>('[data-admin-workspace-body]');const row=body?.querySelector<HTMLElement>('.ll-admin-final-doc-row');row?.querySelector<HTMLButtonElement>('[data-admin-download-doc]')?.click();return}
},true);

observer=new MutationObserver(()=>schedule(false));observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(true),{once:true});else schedule(true);

export {};