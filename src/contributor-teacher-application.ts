import './contributor-mentor-pipeline.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type PipelineEvidence={id:string;evidence_type:string;title:string;url?:string|null;note?:string|null;created_at:string};
type WorkflowEvent={event_type:string;actor_role:string;created_at:string;detail?:Record<string,unknown>};
type Pipeline={application_id:string;applicant_type:string;contribution_type:string;student_supervision?:string|null;mentor_email?:string|null;mentee_email?:string|null;mentor_required?:boolean;stage:string;latest_document?:{id:string;original_name:string;version_label:string;mentor_review_status:string;mentor_reviewed_at?:string|null}|null;assignment?:{teacher_name?:string;teacher_email?:string;teacher_mentee_email?:string}|null;matching_teacher?:{full_name?:string;email?:string}|null;teacher_testimony?:{reviewer_name?:string;recommendation?:string;summary?:string;created_at?:string;accuracy?:number;clarity?:number;dp_relevance?:number;originality?:number;sources?:number;is_testimony?:boolean}|null;evidence?:PipelineEvidence[];events?:WorkflowEvent[];student_name?:string;student_email?:string;topics?:string};
type WorkspaceLite={id:string;applicant_type:string;contribution_type:string;topics?:string;student_supervision?:string|null;mentor_email?:string|null};
type AssignmentLite={application_id:string;student_name:string};

let timer=0;
let attempts=0;
let lastSelectedId='';

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmt(value?:string|null){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function role(form:HTMLFormElement){return form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student'}
function setLabel(control:Element|null,text:string){const labelEl=control?.closest('label');const span=labelEl?.querySelector<HTMLElement>(':scope > span');if(span)span.textContent=text}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const data=await response.json() as {message?:string};if(data.message)message=data.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function syncTeacherForm(form:HTMLFormElement){
  const teacher=role(form)==='teacher';
  const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');
  if(mentee){
    mentee.required=teacher;
    mentee.disabled=false;
    const labelEl=mentee.closest('label');
    const span=labelEl?.querySelector<HTMLElement>(':scope > span');
    const small=labelEl?.querySelector<HTMLElement>('small');
    if(span)span.textContent='Student email (required)';
    if(small)small.textContent='Required for teacher reviewers. Use the exact email on the student’s LitLab account so the student → teacher → LitLab review path can be linked.';
  }
  const topics=form.querySelector('textarea[name="topics"]');
  const idea=form.querySelector('textarea[name="contribution_idea"]');
  const motivation=form.querySelector('textarea[name="motivation"]');
  const experience=form.querySelector('textarea[name="experience"]');
  const availability=form.querySelector('textarea[name="availability"]');
  if(teacher){
    setLabel(topics,'DP areas, books or skills you can review');setLabel(idea,'How would you like to support this LitLab student?');setLabel(motivation,'Why do you want to review or mentor for LitLab?');setLabel(experience,'Teaching / reviewing experience (optional)');setLabel(availability,'Review availability (optional)');
    if(topics instanceof HTMLTextAreaElement)topics.placeholder='Paper 1, Paper 2, IO, EE, specific literary works, language analysis, academic writing…';
    if(idea instanceof HTMLTextAreaElement)idea.placeholder='For example: review this student’s DOCX drafts for DP accuracy, provide revision feedback, and approve the final academic quality.';
  }else{
    setLabel(topics,'Topics you are interested in');setLabel(idea,'What would you like to contribute?');setLabel(motivation,'Why do you want to contribute?');setLabel(experience,'Relevant strengths / experience (optional)');setLabel(availability,'Availability (optional)');
  }
}

function addPromotionOption(form:HTMLFormElement){
  if(role(form)!=='student')return;
  const select=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]');
  if(!select||select.querySelector('option[value="promotion"]'))return;
  const option=document.createElement('option');option.value='promotion';option.textContent='Promotion / awareness';select.appendChild(option);
}

function addPromotionCard(){
  const host=document.querySelector<HTMLElement>('.ll-contrib-hero-card');if(!host||host.querySelector('[data-promotion-contribution]'))return;
  const card=document.createElement('div');card.dataset.promotionContribution='true';card.className='ll-promotion-card';card.innerHTML='<b>Promotion</b><small>Social media, awareness posters, outreach materials and campaigns that help more students discover LitLab. Keep links, drafts and results as evidence.</small>';
  host.querySelector('p')?.before(card)||host.appendChild(card);
}

function enhanceApplication(){
  if(route()!=='contribute')return;
  addPromotionCard();
  const form=document.querySelector<HTMLFormElement>('#ll-contributor-form');
  if(form){attempts=0;syncTeacherForm(form);addPromotionOption(form);return}
  if(attempts++<30){window.clearTimeout(timer);timer=window.setTimeout(enhanceApplication,100)}
}

function stepState(stage:string,key:string,mentorRequired:boolean){
  if(!mentorRequired&&key==='teacher')return 'skipped';
  const rank:Record<string,number>={student_work:0,mentor_link:1,mentor_review:1,student_revision:0,admin_review:2,complete:3};
  const keyRank:Record<string,number>={student:0,teacher:1,admin:2,complete:3};
  if(stage==='student_revision')return key==='student'?'active':key==='teacher'?'done':'';
  const current=rank[stage]??0;const target=keyRank[key];
  if(target<current)return 'done';if(target===current)return 'active';return '';
}

function pipelineSteps(data:Pipeline){
  const mentor=Boolean(data.mentor_required);
  const defs:[string,string,string][]=[['student','1','Student submission'],['teacher','2','Teacher / mentor'],['admin','3','LitLab admin'],['complete','4','Complete']];
  return `<div class="ll-mentor-steps">${defs.map(([key,n,title])=>{const state=stepState(data.stage,key,mentor);const copy=key==='student'?'Create, evidence and submit the latest work.':key==='teacher'?(mentor?'Review DOCX, request changes or approve as testimony.':'Skipped — no mentor declared.'):(key==='admin'?'Final LitLab review after required teacher approval.':'Final decision and record saved.');return `<div class="ll-mentor-step ${state}"><i>${state==='done'?'✓':n}</i><b>${esc(title)}</b><small>${esc(copy)}</small></div>`}).join('')}</div>`;
}

function stageNote(data:Pipeline){
  const doc=data.latest_document;
  if(!data.mentor_required)return `<div class="ll-mentor-note"><strong>Direct LitLab review</strong>You did not declare an existing mentor, so teacher approval is not required. Your submitted work goes directly to LitLab admin review.</div>`;
  if(!doc)return `<div class="ll-mentor-note"><strong>Mentor pathway enabled</strong>When you submit your DOCX, LitLab will match your mentor using <b>${esc(data.mentor_email||'the mentor email you provided')}</b>. The teacher must have your exact student email on their teacher application.</div>`;
  if(doc.mentor_review_status==='waiting_for_mentor')return `<div class="ll-mentor-note warning"><strong>Waiting to link your mentor</strong>Your latest document is saved, but the reciprocal teacher account has not matched yet. Your mentor must apply/sign in with <b>${esc(data.mentor_email||'the declared mentor email')}</b> and enter your exact LitLab email.</div>`;
  if(doc.mentor_review_status==='pending')return `<div class="ll-mentor-note"><strong>Teacher review in progress</strong>${data.assignment?.teacher_name?`<b>${esc(data.assignment.teacher_name)}</b> is linked to this submission. `:''}LitLab admin will not mark the supervised contribution complete until the teacher approves the latest document.</div>`;
  if(doc.mentor_review_status==='changes_requested')return `<div class="ll-mentor-note warning"><strong>Teacher requested changes</strong>Revise the work and upload a new DOCX version. The new version returns to the teacher before LitLab admin review.</div>`;
  if(doc.mentor_review_status==='approved')return `<div class="ll-mentor-note success"><strong>Teacher testimony recorded ✓</strong>${esc(data.teacher_testimony?.reviewer_name||data.assignment?.teacher_name||'Your mentor')} academically approved the latest document. It is now ready for LitLab admin’s final review, and the teacher review is preserved as evidence in your report.</div>`;
  return '';
}

function evidenceMarkup(data:Pipeline){
  const rows=data.evidence||[];const promotion=data.contribution_type==='promotion';
  return `<div class="ll-mentor-evidence"><span>EVIDENCE LEDGER</span><h4>${promotion?'Promotion evidence':'Contribution evidence'}</h4><p>${promotion?'Add proof such as a social post, awareness poster, campaign asset, publication link, analytics/result snapshot link, or reflection.':'Keep useful proof linked to this contribution: research, publication links, campaign materials, outcomes or reflections. Your DOCX and activity log remain saved separately as well.'}</p>
    <form class="ll-mentor-evidence-form" data-mentor-evidence-form="${esc(data.application_id)}">
      <label><span>Evidence type</span><select name="type" required><option value="${promotion?'social_post':'research'}">${promotion?'Social post':'Research / source work'}</option><option value="awareness_poster">Awareness poster</option><option value="campaign_asset">Campaign asset</option><option value="publication_link">Publication / live link</option><option value="analytics">Analytics / results</option><option value="reflection">Reflection</option><option value="other">Other evidence</option></select></label>
      <label><span>Title</span><input name="title" required minlength="2" maxlength="180" placeholder="e.g. Instagram awareness carousel"/></label>
      <label class="wide"><span>Evidence URL (optional)</span><input name="url" type="url" maxlength="2000" placeholder="https://…"/></label>
      <label class="wide"><span>What does this prove? (optional)</span><textarea name="note" maxlength="3000" rows="2" placeholder="Describe what you made, when it was used, your role, and any measurable result."></textarea></label>
      <div class="ll-mentor-evidence-actions"><small data-evidence-state></small><button type="submit">Save evidence</button></div>
    </form>
    ${rows.length?`<div class="ll-mentor-evidence-list">${rows.slice(0,8).map(row=>`<div class="ll-mentor-evidence-item"><b>${esc(row.title)}</b><small>${esc(label(row.evidence_type))} • ${esc(fmt(row.created_at))}${row.note?` • ${esc(row.note)}`:''}</small>${row.url?`<a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer">Open evidence ↗</a>`:''}</div>`).join('')}</div>`:'<div class="ll-mentor-note"><strong>No extra evidence added yet.</strong>Documents, teacher reviews and your activity log are still recorded automatically.</div>'}
  </div>`;
}

function activityMarkup(data:Pipeline){
  const events=(data.events||[]).slice(0,5);if(!events.length)return '';
  return `<div class="ll-mentor-evidence"><span>ACCOUNT ACTIVITY</span><h4>Recent workflow history</h4><div class="ll-mentor-evidence-list">${events.map(event=>`<div class="ll-mentor-evidence-item"><b>${esc(label(event.event_type))}</b><small>${esc(label(event.actor_role))} • ${esc(fmt(event.created_at))}</small></div>`).join('')}</div></div>`;
}

function renderUserPipeline(data:Pipeline){
  const root=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!root)return;
  root.querySelector('[data-mentor-pipeline]')?.remove();
  const head=root.querySelector('.ll-workspace-head');const panel=document.createElement('section');panel.dataset.mentorPipeline='true';panel.className='ll-mentor-pipeline';
  const status=data.stage==='complete'?'Complete':data.stage==='admin_review'?'Admin review':data.stage==='mentor_review'||data.stage==='mentor_link'?'Teacher review':data.stage==='student_revision'?'Revision needed':'Student work';
  panel.innerHTML=`<div class="ll-mentor-pipeline-head"><div><span>REVIEW PATH</span><h3>${data.mentor_required?'Student → teacher → LitLab admin':'Student → LitLab admin'}</h3><p>The latest submission controls the path. Every evidence item, review decision and workflow event stays attached to this LitLab account.</p></div><div class="ll-mentor-pill">${esc(status)}</div></div>${pipelineSteps(data)}${stageNote(data)}${evidenceMarkup(data)}${activityMarkup(data)}`;
  head?.after(panel)||root.prepend(panel);
}

async function refreshUserPipeline(id:string){if(!id||!token())return;try{const data=await rpc<Pipeline>('get_my_litlab_contributor_pipeline',{p_application_id:id});renderUserPipeline(data)}catch(error){console.debug('Mentor pipeline unavailable',error)}}

function addTeacherTestimonyCopy(){
  document.querySelectorAll<HTMLFormElement>('.ll-review-form[data-teacher-review]').forEach(form=>{
    if(form.previousElementSibling?.matches('[data-teacher-testimony-note]'))return;
    const note=document.createElement('div');note.dataset.teacherTestimonyNote='true';note.className='ll-teacher-testimony-note';note.innerHTML='<b>Your review is part of the evidence trail.</b>If you approve the latest DOCX, your rubric scores, written review, name and approval date become the teacher testimony for this version. The contribution then moves to LitLab admin for the final decision.';form.before(note);
  });
}

async function renderTeacherStage(assignment:AssignmentLite){
  try{
    const data=await rpc<Pipeline>('get_my_litlab_teacher_pipeline',{p_application_id:assignment.application_id});
    const form=document.querySelector<HTMLFormElement>(`.ll-review-form[data-teacher-review="${CSS.escape(assignment.application_id)}"]`);const card=form?.closest<HTMLElement>('.ll-teacher-assignment');if(!card)return;
    card.querySelector('[data-teacher-stage]')?.remove();const box=document.createElement('div');box.dataset.teacherStage='true';box.className='ll-teacher-stage';
    const doc=data.latest_document;let text='Waiting for the student to submit a DOCX.';
    if(doc?.mentor_review_status==='pending')text=`Review ${doc.version_label} — ${doc.original_name}. Choose Approve only when you can stand behind its academic quality.`;
    else if(doc?.mentor_review_status==='changes_requested')text='You requested changes. Wait for the student to upload a revised DOCX before approving.';
    else if(doc?.mentor_review_status==='approved')text='Your approval testimony is recorded. LitLab admin now owns the final review step.';
    box.innerHTML=`<strong>Stage: ${esc(label(data.stage))}</strong>${esc(text)}`;card.querySelector('.ll-card-title')?.after(box);
  }catch(error){console.debug('Teacher pipeline unavailable',error)}
}

function adminPanel(data:Pipeline){
  const mentor=data.mentor_required;const assigned=data.assignment;const testimony=data.teacher_testimony;const evidence=data.evidence||[];
  const gate=mentor?(data.latest_document?.mentor_review_status==='approved'?'Teacher gate passed — admin may make the final completion decision.':'Completion is blocked until the mentor approves the latest document.'):'No mentor declared — teacher approval is not required for this student.';
  return `<section class="ll-admin-mentor-pipeline" data-admin-mentor-pipeline><span>REVIEW PIPELINE</span><h3>${mentor?'Student → teacher → admin':'Student → admin'}</h3><p>${esc(gate)}</p><div class="ll-admin-mentor-meta"><div><span>CURRENT STAGE</span><b>${esc(label(data.stage))}</b></div><div><span>DECLARED MENTOR</span><b>${esc(mentor?(data.mentor_email||'Email missing'):'Not required')}</b></div><div><span>LINKED TEACHER</span><b>${esc(assigned?.teacher_name||data.matching_teacher?.full_name||(mentor?'Waiting for reciprocal email match':'Not required'))}</b></div></div>
  ${mentor&&!assigned?`<div class="ll-mentor-note warning"><strong>Reciprocal match required</strong>The teacher must sign in/apply using <b>${esc(data.mentor_email||'the mentor email')}</b> and must enter the student’s exact LitLab email <b>${esc(data.student_email||'')}</b>. A different accepted teacher cannot replace a specifically declared mentor.</div>`:''}
  ${testimony?.recommendation==='approve'?`<div class="ll-admin-testimony"><b>Teacher testimony ✓ — ${esc(testimony.reviewer_name||'Teacher reviewer')}</b><p>${esc(testimony.summary||'Academic approval recorded.')} ${testimony.accuracy?`Scores: accuracy ${testimony.accuracy}/5, clarity ${testimony.clarity}/5, DP relevance ${testimony.dp_relevance}/5, originality ${testimony.originality}/5, sources ${testimony.sources}/5.`:''}</p></div>`:''}
  ${evidence.length?`<div class="ll-admin-evidence-mini"><b>Contributor evidence (${evidence.length})</b>${evidence.slice(0,6).map(e=>`<div><strong>${esc(e.title)}</strong> · ${esc(label(e.evidence_type))}${e.url?` · <a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">open ↗</a>`:''}</div>`).join('')}</div>`:''}</section>`;
}

async function renderAdminPipeline(applicationId:string){
  if(!applicationId||!token())return;
  try{
    const data=await rpc<Pipeline>('admin_get_litlab_contributor_pipeline',{p_application_id:applicationId});const grid=document.querySelector<HTMLElement>('#ll-admin-contributor-workspace .ll-admin-workspace-grid');if(!grid)return;grid.querySelector('[data-admin-mentor-pipeline]')?.remove();grid.insertAdjacentHTML('afterbegin',adminPanel(data));
  }catch(error){console.debug('Admin mentor pipeline unavailable',error)}
}

document.addEventListener('change',event=>{
  const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-contributor-form');if(form)setTimeout(()=>{syncTeacherForm(form);addPromotionOption(form)},20);
},true);

document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;if(!form)return;
  if(form.id==='ll-contributor-form'&&role(form)==='teacher'){syncTeacherForm(form);const mentee=form.querySelector<HTMLInputElement>('input[name="mentee_email"]');if(mentee&&!mentee.value.trim()){event.preventDefault();event.stopImmediatePropagation();mentee.focus();mentee.reportValidity();return}}
  const appId=form.dataset.mentorEvidenceForm;if(!appId)return;
  event.preventDefault();event.stopPropagation();
  if(!form.checkValidity()){form.reportValidity();return}
  const state=form.querySelector<HTMLElement>('[data-evidence-state]');const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');const data=new FormData(form);
  if(button){button.disabled=true;button.textContent='Saving…'}if(state)state.textContent='Saving to your account…';
  void rpc<PipelineEvidence>('add_my_litlab_contributor_evidence',{p_application_id:appId,p_evidence_type:String(data.get('type')||'other'),p_title:String(data.get('title')||''),p_url:String(data.get('url')||'')||null,p_note:String(data.get('note')||'')}).then(()=>{form.reset();if(state)state.textContent='Evidence saved.';return refreshUserPipeline(appId)}).catch(error=>{if(state)state.textContent=error instanceof Error?error.message:'Could not save evidence.'}).finally(()=>{if(button?.isConnected){button.disabled=false;button.textContent='Save evidence'}});
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<{workspaces?:WorkspaceLite[];assignments?:AssignmentLite[];selectedId?:string}>).detail||{};const workspaces=detail.workspaces||[];const selected=detail.selectedId||workspaces[0]?.id||'';lastSelectedId=selected;
  if(selected)void refreshUserPipeline(selected);
  setTimeout(addTeacherTestimonyCopy,0);(detail.assignments||[]).forEach(a=>void renderTeacherStage(a));
});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{const id=(event as CustomEvent<{applicationId?:string}>).detail?.applicationId||'';if(id)void renderAdminPipeline(id)});
window.addEventListener('litlab:contributor-admin-updated',()=>{if(lastSelectedId)void refreshUserPipeline(lastSelectedId)});
window.addEventListener('hashchange',()=>{attempts=0;setTimeout(enhanceApplication,80)});
window.addEventListener('focus',()=>{if(route()==='contribute'){enhanceApplication();addTeacherTestimonyCopy()}});

function start(){attempts=0;enhanceApplication();setTimeout(addTeacherTestimonyCopy,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
