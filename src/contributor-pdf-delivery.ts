import './contributor-pdf-delivery.css';
import {saveCertificatePdf,saveEvidencePdf,safeFilePart,type CertificatePdfData,type EvidenceSection} from './litlab-pdf-export';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const REFRESH_MS=20_000;

type StoredSession={access_token?:string};
type Brief={project_title?:string;goal?:string;audience?:string;deliverable?:string;quality_requirements?:string;source_guidance?:string;due_at?:string|null};
type Task={title:string;instructions?:string;status:string;due_at?:string|null};
type Revision={title:string;details?:string;checklist?:unknown;status:string;contributor_response?:string|null;created_at:string};
type Doc={storage_path:string;original_name:string;file_size:number;version_label:string;note?:string|null;created_at:string};
type Review={accuracy:number;clarity:number;dp_relevance:number;originality:number;sources:number;recommendation:string;summary:string;created_at:string;reviewer_name?:string|null};
type Activity={activity_date:string;minutes:number;description:string};
type Workspace={id:string;created_at:string;status:string;status_updated_at?:string|null;applicant_type:string;full_name?:string|null;dp_year?:string|null;contribution_type:string;topics?:string|null;contribution_idea?:string|null;motivation?:string|null;experience?:string|null;availability?:string|null;cas_intent?:string|null;cas_goal?:string|null;cas_impact?:string|null;cas_success?:string|null;student_supervision?:string|null;mentor_email?:string|null;credit_preference?:string|null;brief?:Brief|null;tasks:Task[];revisions:Revision[];documents:Doc[];reviewer?:{name?:string|null}|null;reviews:Review[];activities:Activity[]};
type CertificateRecord={id:string;application_id:string;certificate_code:string;contributor_name:string;contributor_role:string;contribution_title:string;contribution_type:string;contribution_description:string;completed_at:string;issued_at:string;verified_minutes?:number|null;issuer_name:string;issuer_title:string;updated_at:string};

let apps=new Map<string,Workspace>();
let certs=new Map<string,CertificateRecord|null>();
let loading=new Map<string,Promise<void>>();
let scanTimer=0;
let scanAttempts=0;
let pollTimer=0;
let rootObserver:MutationObserver|null=null;
let observedRoot:HTMLElement|null=null;
let syncQueued=false;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return 'Not recorded';const d=new Date(value);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'})}
function bytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${Math.round(value/1024)} KB`;return `${(value/1024/1024).toFixed(1)} MB`}
function duration(minutes:number){const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function checklist(value:unknown){return Array.isArray(value)?value.map(String).filter(Boolean):[]}
function toPdf(cert:CertificateRecord):CertificatePdfData{return {certificateCode:cert.certificate_code,contributorName:cert.contributor_name,contributorRole:cert.contributor_role,contributionTitle:cert.contribution_title,contributionType:label(cert.contribution_type),contributionDescription:cert.contribution_description,completedAt:cert.completed_at,issuedAt:cert.issued_at,verifiedMinutes:cert.verified_minutes,issuerName:cert.issuer_name,issuerTitle:cert.issuer_title}}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});if(!response.ok)throw new Error(`${name} failed (${response.status})`);const text=await response.text();return (text?JSON.parse(text):null) as T}finally{window.clearTimeout(timeout)}
}

async function load(applicationId:string,forceCertificate=false){
  if(!applicationId||!token())return;
  const needWorkspace=!apps.has(applicationId);
  const needCertificate=forceCertificate||!certs.has(applicationId);
  if(!needWorkspace&&!needCertificate)return;
  if(loading.has(applicationId)){await loading.get(applicationId);return}
  const promise=(async()=>{
    const workspacePromise=needWorkspace?rpc<Workspace[]>('get_my_litlab_contributor_workspace'):Promise.resolve<Workspace[]>([]);
    const certificatePromise=needCertificate?rpc<CertificateRecord|null>('get_my_litlab_contributor_certificate',{p_application_id:applicationId}):Promise.resolve<CertificateRecord|null>(certs.get(applicationId)||null);
    const [rows,cert]=await Promise.all([workspacePromise,certificatePromise]);
    if(needWorkspace){const app=(Array.isArray(rows)?rows:[]).find(item=>item.id===applicationId);if(app)apps.set(applicationId,app)}
    if(needCertificate)certs.set(applicationId,cert||null);
  })().catch(error=>console.debug('Contributor PDF delivery unavailable',error)).finally(()=>loading.delete(applicationId));
  loading.set(applicationId,promise);await promise;
}

function certificateMarkup(cert:CertificateRecord){
  const verified=cert.verified_minutes==null?'No verified time stated':`${duration(Number(cert.verified_minutes))} verified`;
  return `<div class="ll-issued-certificate" data-issued-certificate="${esc(cert.certificate_code)}"><div class="ll-issued-certificate-mark"><img src="./favicon.svg" alt="" aria-hidden="true"/></div><div><span>CERTIFICATE READY</span><h3>Your LitLab Contributor Certificate is ready.</h3><p>Issued ${esc(fmtDate(cert.issued_at))} for <strong>${esc(cert.contribution_title)}</strong>. ${esc(verified)}.</p><small>Certificate ID: ${esc(cert.certificate_code)} • This is a LitLab contribution certificate, not an IB or CAS certificate.</small></div><button type="button" data-download-contributor-certificate>Download certificate PDF</button></div>`;
}
function updateArchive(archive:HTMLElement){
  const applicationId=archive.dataset.applicationId||'';if(!applicationId)return;
  const app=apps.get(applicationId);const cert=certs.get(applicationId);
  const pdfButton=archive.querySelector<HTMLButtonElement>('[data-completion-print]');
  if(pdfButton){const type=archive.dataset.applicantType||app?.applicant_type;const next=type==='teacher'?'Save contribution evidence as PDF':'Save CAS evidence as PDF';if(pdfButton.textContent!==next)pdfButton.textContent=next;if(pdfButton.dataset.saveEvidencePdf!=='true')pdfButton.dataset.saveEvidencePdf='true';if(pdfButton.getAttribute('aria-label')!==next)pdfButton.setAttribute('aria-label',next)}
  const certificateArea=archive.querySelector<HTMLElement>('.ll-certificate-pending');
  if(cert&&certificateArea){const fingerprint=`${cert.certificate_code}:${cert.updated_at||cert.issued_at}`;if(certificateArea.dataset.certificateFingerprint!==fingerprint){certificateArea.dataset.certificateFingerprint=fingerprint;certificateArea.innerHTML=certificateMarkup(cert)}}
}
async function syncArchive(archive:HTMLElement,forceCertificate=false){const id=archive.dataset.applicationId||'';if(!id)return;updateArchive(archive);await load(id,forceCertificate);if(archive.isConnected)updateArchive(archive)}
function syncVisible(forceCertificate=false){document.querySelectorAll<HTMLElement>('[data-contributor-completion-archive]').forEach(archive=>void syncArchive(archive,forceCertificate))}
function queueSync(){if(syncQueued)return;syncQueued=true;requestAnimationFrame(()=>{syncQueued=false;syncVisible(false)})}
function attachRootObserver(){
  if(route()!=='contribute'){rootObserver?.disconnect();rootObserver=null;observedRoot=null;return}
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  if(observedRoot===root)return;
  rootObserver?.disconnect();observedRoot=root;rootObserver=new MutationObserver(queueSync);rootObserver.observe(root,{childList:true});
}
function scan(){
  window.clearTimeout(scanTimer);if(route()!=='contribute')return;attachRootObserver();
  const archives=document.querySelectorAll<HTMLElement>('[data-contributor-completion-archive]');
  if(archives.length){scanAttempts=0;syncVisible(false);return}
  if(scanAttempts++<40)scanTimer=window.setTimeout(scan,120);
}

function evidenceSections(app:Workspace):EvidenceSection[]{
  const sections:EvidenceSection[]=[];
  if(app.applicant_type==='student')sections.push({title:'Original CAS plan',subtitle:'What was planned before the contribution',rows:[['DP stage',app.dp_year?label(app.dp_year):'Not recorded'],['CAS intention',app.cas_intent?label(app.cas_intent):'Not recorded'],['Original CAS goal',app.cas_goal||'Not recorded'],['Intended impact',app.cas_impact||'Not recorded'],['Original success measure',app.cas_success||'Not recorded'],['School / supervision plan',app.student_supervision?label(app.student_supervision):'Not recorded'],['Mentor / supervisor email',app.mentor_email||'Not recorded']].map(([labelText,value])=>({label:labelText,value:String(value)}))});
  sections.push({title:'Application record',subtitle:'Original contribution proposal',rows:[{label:'Contribution type',value:label(app.contribution_type)},{label:'Topics / focus',value:app.topics||'Not recorded'},{label:'What was proposed',value:app.contribution_idea||'Not recorded'},{label:'Motivation',value:app.motivation||'Not recorded'},{label:'Strengths / experience',value:app.experience||'Not recorded'},{label:'Availability stated',value:app.availability||'Not recorded'},{label:'Credit preference',value:app.credit_preference?label(app.credit_preference):'Not recorded'}]});
  if(app.brief)sections.push({title:'Final project scope',subtitle:app.brief.project_title||app.topics||'LitLab contribution',rows:[{label:'Goal',value:app.brief.goal||'Not recorded'},{label:'Audience',value:app.brief.audience||'Not recorded'},{label:'Deliverable',value:app.brief.deliverable||'Not recorded'},{label:'Quality requirements',value:app.brief.quality_requirements||'Not recorded'},{label:'Source / originality guidance',value:app.brief.source_guidance||'Not recorded'}]});
  if(app.tasks?.length)sections.push({title:'Work record',subtitle:'Tasks and progress',items:app.tasks.map(task=>`${task.title} — ${label(task.status)}${task.instructions?`. ${task.instructions}`:''}${task.due_at?` (Due ${fmtDate(task.due_at)})`:''}`)});
  sections.push({title:'Submission evidence',subtitle:'Microsoft Word document versions',items:app.documents?.length?app.documents.map(doc=>`${doc.version_label}: ${doc.original_name} — ${bytes(Number(doc.file_size)||0)}, submitted ${fmtDate(doc.created_at)}${doc.note?`. Note: ${doc.note}`:''}`):['No DOCX versions were attached to this contribution.']});
  if(app.revisions?.length)sections.push({title:'Revision evidence',subtitle:'Feedback and changes made',items:app.revisions.map(item=>`${item.title} — ${label(item.status)}. ${item.details||''}${checklist(item.checklist).length?` Requested: ${checklist(item.checklist).join('; ')}.`:''}${item.contributor_response?` Contributor response: ${item.contributor_response}`:''}`)});
  if(app.reviews?.length||app.reviewer)sections.push({title:'Review evidence',subtitle:'Teacher / academic review',items:app.reviews?.length?app.reviews.map(review=>`${review.reviewer_name||app.reviewer?.name||'Teacher reviewer'} — ${review.recommendation==='approve'?'Academically approved':'Changes requested'} on ${fmtDate(review.created_at)}. Accuracy ${review.accuracy}/5, clarity ${review.clarity}/5, DP relevance ${review.dp_relevance}/5, originality ${review.originality}/5, sources ${review.sources}/5. ${review.summary}`):[`Reviewer assigned: ${app.reviewer?.name||'Teacher reviewer'}. No submitted review record.`]});
  const total=(app.activities||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);
  sections.push({title:'Activity evidence',subtitle:total?`${duration(total)} self-recorded`:'No time recorded',items:app.activities?.length?app.activities.map(row=>`${fmtDate(row.activity_date)} — ${row.minutes} min — ${row.description}`):['No activity-log entries were added.'],paragraphs:['Activity time is the contributor’s own record unless LitLab separately verified it. The student’s school or CAS coordinator decides what evidence is acceptable and whether the experience counts toward CAS.']});
  return sections;
}
async function saveEvidence(archive:HTMLElement,button:HTMLButtonElement){
  const id=archive.dataset.applicationId||'';if(!id)return;await load(id,false);const app=apps.get(id);if(!app)throw new Error('Contribution evidence could not be loaded.');const original=button.textContent||'Save evidence as PDF';button.disabled=true;button.textContent='Creating PDF…';
  try{const total=(app.activities||[]).reduce((sum,row)=>sum+Number(row.minutes||0),0);await saveEvidencePdf({contributorName:app.full_name||'LitLab Contributor',contributionTitle:app.brief?.project_title||app.topics||label(app.contribution_type),contributionType:label(app.contribution_type),submittedAt:app.created_at,completedAt:app.status_updated_at,wordVersions:app.documents?.length||0,selfRecordedMinutes:total,studentCas:app.applicant_type==='student',sections:evidenceSections(app)})}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}
}
async function saveCertificate(archive:HTMLElement,button:HTMLButtonElement){const id=archive.dataset.applicationId||'';if(!id)return;await load(id,true);const cert=certs.get(id);if(!cert)throw new Error('Certificate is not available yet.');const original=button.textContent||'Download certificate PDF';button.disabled=true;button.textContent='Creating PDF…';try{await saveCertificatePdf(toPdf(cert))}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}}
async function namedDocDownload(archive:HTMLElement,path:string,button:HTMLButtonElement){
  const id=archive.dataset.applicationId||'';if(!id)return;await load(id,false);const app=apps.get(id);const doc=app?.documents?.find(item=>item.storage_path===path);if(!doc)return;const original=button.textContent||'Open securely';button.disabled=true;button.textContent='Downloading…';
  try{const sign=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/contributor-documents/${path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify({expiresIn:300})});if(!sign.ok)throw new Error(`Document download failed (${sign.status})`);const data=await sign.json() as {signedURL?:string;signedUrl?:string};const signed=data.signedURL||data.signedUrl;if(!signed)throw new Error('No secure document URL returned.');const response=await fetch(`${SUPABASE_URL}/storage/v1${signed}`);if(!response.ok)throw new Error(`Document download failed (${response.status})`);const blob=await response.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');const base=doc.original_name.replace(/\.docx$/i,'');a.href=url;a.download=`LitLab_${safeFilePart(doc.version_label,'Document',24)}_${safeFilePart(base,'Contribution',64)}.docx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30_000)}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const evidence=target.closest<HTMLButtonElement>('[data-completion-print]');if(evidence){const archive=evidence.closest<HTMLElement>('[data-contributor-completion-archive]');if(!archive)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();void saveEvidence(archive,evidence).catch(error=>{console.error(error);window.alert('The evidence PDF could not be created right now. Please try again.')});return}
  const certButton=target.closest<HTMLButtonElement>('[data-download-contributor-certificate]');if(certButton){const archive=certButton.closest<HTMLElement>('[data-contributor-completion-archive]');if(!archive)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();void saveCertificate(archive,certButton).catch(error=>{console.error(error);window.alert('The certificate PDF could not be created right now. Please try again.')});return}
  const docButton=target.closest<HTMLButtonElement>('[data-download-doc]');if(docButton){const archive=docButton.closest<HTMLElement>('[data-contributor-completion-archive]');if(!archive)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();void namedDocDownload(archive,docButton.dataset.downloadDoc||'',docButton).catch(error=>{console.error(error);window.alert('The Word document could not be downloaded securely right now.')});return}
  if(target.closest('[data-workspace-select]'))window.setTimeout(()=>{scanAttempts=0;scan()},220);
},true);

function clearPoll(){window.clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(){clearPoll();if(route()!=='contribute')return;pollTimer=window.setTimeout(async()=>{if(!document.hidden&&navigator.onLine){const archives=Array.from(document.querySelectorAll<HTMLElement>('[data-contributor-completion-archive]'));for(const archive of archives)await syncArchive(archive,true)}schedulePoll()},REFRESH_MS)}
function start(){if(route()!=='contribute')return;scanAttempts=0;scan();schedulePoll()}
window.addEventListener('hashchange',()=>{rootObserver?.disconnect();rootObserver=null;observedRoot=null;clearPoll();window.clearTimeout(scanTimer);if(route()==='contribute')setTimeout(start,80)});
window.addEventListener('focus',()=>{if(route()==='contribute'){scanAttempts=0;scan();syncVisible(true);schedulePoll()}});
window.addEventListener('online',()=>{if(route()==='contribute'){scanAttempts=0;scan();syncVisible(true);schedulePoll()}});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){apps.clear();certs.clear();loading.clear();if(route()==='contribute')start()}});
window.addEventListener('litlab:contributor-workspace-data',event=>{const rows=event instanceof CustomEvent&&Array.isArray(event.detail?.workspaces)?event.detail.workspaces as Workspace[]:[];if(rows.length){rows.forEach(row=>apps.set(row.id,row));if(route()==='contribute')queueSync()}});
window.addEventListener('litlab:contributor-workspace-updated',()=>{if(route()==='contribute')setTimeout(()=>{scanAttempts=0;scan()},160)});
window.addEventListener('litlab:contributor-admin-updated',()=>{if(route()==='contribute'){certs.clear();setTimeout(()=>syncVisible(true),160)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
