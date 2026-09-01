import './contributor-final-review-handoff.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type FinalDoc={id?:string;storage_path?:string;original_name?:string;file_size?:number;version_label?:string;created_at?:string;teacher_review_id?:string;teacher_approved_at?:string;teacher_name?:string;teacher_summary?:string;source?:'teacher_approved'|'direct_submission'|string};
type Pipeline={application_id:string;stage:string;mentor_required?:boolean;final_review_document?:FinalDoc|null};
type Assignment={application_id:string;documents?:Array<{id?:string;storage_path?:string;original_name?:string;mentor_review_status?:string}>;reviews?:Array<{id?:string;document_id?:string;recommendation?:string;is_testimony?:boolean}>;final_review_document?:FinalDoc|null};
type WorkspaceEvent={selectedId?:string;assignments?:Assignment[]};
type AdminWorkspace={documents?:FinalDoc[];assignment?:{teacher_name?:string}|null;final_review_document?:FinalDoc|null};

let selectedId='';
let assignments:Assignment[]=[];
let studentPipeline:Pipeline|null=null;
let studentLoading=false;
let adminLoadingId='';
let scheduled=false;
let observer:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function fmt(value?:string){if(!value)return '';const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function bytes(value?:number){const n=Number(value||0);if(!n)return '';if(n<1024)return `${n} B`;if(n<1024*1024)return `${Math.round(n/1024)} KB`;return `${(n/1024/1024).toFixed(1)} MB`}
function role(){const value=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';return value==='student'||value==='teacher'?value:''}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{clearTimeout(timeout)}
}

function teacherSupervisedUpload(data:Pipeline){
  if(!data.mentor_required)return;
  const form=document.querySelector<HTMLFormElement>(`.ll-docx-form[data-docx-upload="${CSS.escape(data.application_id)}"]`);if(!form)return;
  const select=form.querySelector<HTMLSelectElement>('select[name="version"]');
  if(select){
    const finalOption=Array.from(select.options).find(option=>option.value==='Final submission');
    if(finalOption)finalOption.hidden=false;
  }
  let helper=form.querySelector<HTMLElement>('[data-final-submission-helper]');
  if(!helper){helper=document.createElement('div');helper.dataset.finalSubmissionHelper='true';helper.className='ll-final-submission-helper';select?.closest('label')?.after(helper)}
  helper.dataset.teacherHandoff='true';
  const markup='<div><b>Mark the DOCX you want LitLab to accept as “Final submission”</b><span>If this is your intended final version, choose “Final submission” before sending it to your teacher. When your teacher approves it, that exact DOCX becomes the final handoff to LitLab admin.</span></div>';
  if(helper.innerHTML!==markup)helper.innerHTML=markup;
}

function studentHandoff(data:Pipeline){
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!host)return;
  const existing=host.querySelector<HTMLElement>('[data-final-review-handoff-note]');
  if(data.stage!=='admin_review'||!data.mentor_required||!data.final_review_document){existing?.remove();return}
  const doc=data.final_review_document;const path=host.querySelector<HTMLElement>('[data-review-lifecycle-path]');if(!path)return;
  const signature=`${doc.id||''}|${doc.original_name||''}`;
  let note=existing;
  if(!note){note=document.createElement('div');note.dataset.finalReviewHandoffNote='true';note.className='ll-final-review-handoff-note';path.after(note)}
  if(note.dataset.signature===signature)return;
  note.dataset.signature=signature;
  note.innerHTML=`<span>FINAL ADMIN-REVIEW VERSION</span><b>${esc(doc.original_name||doc.version_label||'Teacher-approved DOCX')}</b><p>Your teacher approved this exact DOCX. LitLab admin is reviewing this same version now; do not upload another file unless a revision is requested.</p>`;
}

async function refreshStudent(force=false){
  if(route()!=='contribute'||role()!=='student'||!selectedId||!token()||studentLoading)return;
  if(!force&&studentPipeline?.application_id===selectedId){teacherSupervisedUpload(studentPipeline);studentHandoff(studentPipeline);return}
  studentLoading=true;
  try{studentPipeline=await rpc<Pipeline>('get_my_litlab_contributor_pipeline',{p_application_id:selectedId});teacherSupervisedUpload(studentPipeline);studentHandoff(studentPipeline)}catch(error){console.debug('Final review handoff unavailable',error)}finally{studentLoading=false}
}

function teacherHandoff(){
  if(route()!=='contribute'||role()!=='teacher')return;
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!host)return;
  const cards=Array.from(host.querySelectorAll<HTMLElement>('.ll-teacher-assignment'));
  assignments.forEach((assignment,index)=>{
    const card=host.querySelector<HTMLElement>(`.ll-teacher-assignment[data-teacher-student-id="${CSS.escape(assignment.application_id)}"]`)||cards[index];if(!card)return;
    const finalDoc=assignment.final_review_document;
    card.querySelectorAll<HTMLElement>('[data-teacher-final-doc-badge]').forEach(badge=>{if(!finalDoc?.id||badge.dataset.documentId!==finalDoc.id)badge.remove()});
    const existingNote=card.querySelector<HTMLElement>('[data-teacher-final-handoff-note]');
    if(!finalDoc?.id){existingNote?.remove();return}
    const target=finalDoc.storage_path?card.querySelector<HTMLElement>(`[data-download-doc="${CSS.escape(finalDoc.storage_path)}"]`):null;
    if(target&&!target.querySelector('[data-teacher-final-doc-badge]')){
      const badge=document.createElement('strong');badge.dataset.teacherFinalDocBadge='true';badge.dataset.documentId=finalDoc.id;badge.className='ll-teacher-final-doc-badge';badge.textContent='APPROVED → ADMIN FINAL REVIEW';target.appendChild(badge);
    }
    const signature=`${finalDoc.id}|${finalDoc.original_name||''}`;
    let note=existingNote;
    if(!note){note=document.createElement('div');note.dataset.teacherFinalHandoffNote='true';note.className='ll-teacher-final-handoff-note';const anchor=card.querySelector<HTMLElement>('.ll-review-history')||card.querySelector<HTMLFormElement>('form[data-teacher-review],form.ll-review-form');if(anchor)anchor.before(note);else card.prepend(note)}
    if(note.dataset.signature!==signature){note.dataset.signature=signature;note.innerHTML=`<b>Final handoff complete</b><span>You approved <strong>${esc(finalDoc.original_name||finalDoc.version_label||'this DOCX')}</strong>. LitLab admin is reviewing that exact version now. No further teacher action is needed unless a revised DOCX returns to you.</span>`}
  });
}

function finalAdminCard(data:AdminWorkspace,applicationId:string){
  if(document.getElementById('ll-admin-contributor-workspace')?.dataset.contributionType==='promotion')return;
  const grid=document.querySelector<HTMLElement>('#ll-admin-contributor-workspace .ll-admin-workspace-grid');if(!grid)return;
  const finalDoc=data.final_review_document;
  const signature=`${applicationId}|${finalDoc?.id||''}|${data.assignment?.teacher_name||''}|${(data.documents||[])[0]?.id||''}`;
  let panel=grid.querySelector<HTMLElement>('[data-admin-final-review-document]');
  if(!panel){panel=document.createElement('section');panel.dataset.adminFinalReviewDocument='true';panel.className='ll-admin-final-review-document ll-admin-workspace-card wide';grid.prepend(panel)}
  if(panel.dataset.signature===signature)return;
  panel.dataset.signature=signature;panel.className='ll-admin-final-review-document ll-admin-workspace-card wide';
  if(finalDoc?.storage_path){
    const teacher=finalDoc.teacher_name||data.assignment?.teacher_name||'Teacher reviewer';
    panel.innerHTML=`<div class="ll-admin-final-review-head"><div><span>FINAL REVIEW DOCUMENT</span><h3>Review the exact DOCX approved by the teacher.</h3></div><em>Teacher-approved</em></div><div class="ll-admin-final-review-file"><span>W</span><div><b>${esc(finalDoc.version_label||'Approved version')} — ${esc(finalDoc.original_name||'Student contribution.docx')}</b><small>${esc(bytes(finalDoc.file_size))}${finalDoc.teacher_approved_at?` • Approved ${esc(fmt(finalDoc.teacher_approved_at))}`:''}</small><p><strong>${esc(teacher)}</strong> approved this exact document. This is the version LitLab should use for its final decision.${finalDoc.teacher_summary?` Teacher note: ${esc(finalDoc.teacher_summary)}`:''}</p></div><button type="button" data-admin-download-doc="${esc(finalDoc.storage_path)}">Open final DOCX securely</button></div>`;
  }else if(data.assignment){
    panel.classList.add('is-waiting');
    panel.innerHTML='<div class="ll-admin-final-review-head"><div><span>FINAL REVIEW DOCUMENT</span><h3>Waiting for teacher approval.</h3></div><em>Locked</em></div><p>The administrator final-review target is not available yet. The assigned teacher must approve the current student DOCX first. Once approved, that exact document will appear here automatically.</p>';
  }else{
    const direct=(data.documents||[])[0];panel.classList.add('is-direct');
    panel.innerHTML=`<div class="ll-admin-final-review-head"><div><span>DIRECT ADMIN REVIEW</span><h3>No teacher reviewer is assigned.</h3></div><em>${direct?'Student → admin':'Waiting for DOCX'}</em></div><p>${direct?'Use the student’s latest submitted DOCX for direct review. Completion still requires the student to mark the intended final submission.':'The student has not submitted a DOCX yet.'}</p>`;
  }
}

async function refreshAdmin(applicationId:string){
  if(!applicationId||adminLoadingId===applicationId||!token())return;
  adminLoadingId=applicationId;
  try{const data=await rpc<AdminWorkspace>('admin_get_litlab_contributor_workspace',{p_application_id:applicationId});if(document.querySelector('#ll-admin-contributor-workspace'))finalAdminCard(data,applicationId)}catch(error){console.debug('Admin final review document unavailable',error)}finally{if(adminLoadingId===applicationId)adminLoadingId=''}
}

function apply(){scheduled=false;if(route()==='contribute'){if(role()==='student')void refreshStudent(false);else if(role()==='teacher')teacherHandoff()}}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(typeof detail.selectedId==='string'&&detail.selectedId!==selectedId){selectedId=detail.selectedId;studentPipeline=null}
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  schedule();
});
window.addEventListener('litlab:contributor-workspace-updated',()=>{studentPipeline=null;schedule()});
window.addEventListener('litlab:contributor-submitted',()=>{studentPipeline=null;schedule()});
window.addEventListener('litlab:contributor-admin-updated',()=>{studentPipeline=null;schedule()});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{const id=String((event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'');if(id)void refreshAdmin(id)});
window.addEventListener('focus',schedule);
window.addEventListener('hashchange',()=>{studentPipeline=null;selectedId='';schedule()});

observer=new MutationObserver(()=>schedule());observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
