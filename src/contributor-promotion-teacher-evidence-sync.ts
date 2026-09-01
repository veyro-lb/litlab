import {litlabNativeFetch} from './contributor-native-fetch';

const U='https://qdqseajcukfdbfikjptu.supabase.co';
const K='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const S='litlabSupabaseSession';
const nativeFetch=litlabNativeFetch();
const REQUEST_TIMEOUT_MS=12_000;

type Row=Record<string,any>;
type Assignment=Row&{
  application_id:string;
  contribution_type?:string;
  promotion_evidence_count?:number;
  promotion_evidence_file_count?:number;
  promotion_latest_evidence_at?:string|null;
};
type WorkspaceEvent={assignments?:Assignment[]};

let assignments:Assignment[]=[];
const contexts=new Map<string,Row>();
const loading=new Set<string>();
let observer:MutationObserver|null=null;
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function tok(){try{return String(JSON.parse(localStorage.getItem(S)||'null')?.access_token||'')}catch{return ''}}
function esc(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
function label(v:unknown){return String(v??'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function fmt(v?:string|null){if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}
function isPromotion(a:Assignment|null|undefined){return String(a?.contribution_type||'').trim().toLowerCase()==='promotion'}
function expectedEvidence(a:Assignment){return Math.max(0,Number(a.promotion_evidence_count||0))}
function expectedFiles(a:Assignment){return Math.max(0,Number(a.promotion_evidence_file_count||0))}
function cardFor(id:string){return Array.from(document.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).find(card=>card.dataset.promotionApplicationId===id||card.dataset.teacherStudentId===id)||null}
function panelFor(id:string){return cardFor(id)?.querySelector<HTMLElement>('[data-promotion-supervisor-panel]')||null}
function renderedEvidence(panel:HTMLElement|null){return panel?.querySelectorAll('.ll-promotion-evidence-list > article').length||0}
function renderedFiles(panel:HTMLElement|null){return panel?.querySelectorAll('[data-promotion-open-file]').length||0}
function stale(a:Assignment){const panel=panelFor(a.application_id);if(expectedEvidence(a)<=0)return false;if(!panel)return true;return renderedEvidence(panel)<expectedEvidence(a)||renderedFiles(panel)<expectedFiles(a)||Boolean(panel.querySelector('.ll-promotion-loading'))||/waiting for (student )?evidence|nothing to approve yet|no promotion evidence yet/i.test(panel.textContent||'')}

async function loadContext(id:string){
  if(!id||loading.has(id)||!tok())return null;
  loading.add(id);
  const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const r=await nativeFetch(`${U}/rest/v1/rpc/get_litlab_promotion_review_context`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:K,Authorization:`Bearer ${tok()}`},body:JSON.stringify({p_application_id:id}),signal:controller.signal,cache:'no-store'});
    if(!r.ok)throw new Error(`Promotion evidence refresh failed (${r.status})`);
    const text=await r.text();const ctx=(text?JSON.parse(text):null) as Row|null;
    if(ctx)contexts.set(id,ctx);
    return ctx;
  }catch(error){console.debug('Promotion teacher evidence refresh unavailable',error);return null}
  finally{window.clearTimeout(timer);loading.delete(id)}
}

function evidenceMarkup(rows:Row[]){
  if(!rows.length)return '<div class="ll-promotion-empty"><b>No promotion evidence yet.</b><span>The student has not submitted evidence for supervisor review.</span></div>';
  return `<div class="ll-promotion-evidence-list">${rows.map(x=>`<article><div><span>${esc(x.promotion_channel||label(x.evidence_type||'Promotion evidence'))}</span><b>${esc(x.title||'Promotion evidence')}</b><small>${esc(fmt(x.activity_date||x.created_at))}</small></div><div class="ll-promo-review-meta">${x.promotion_medium?`<span>${esc(x.promotion_medium)}</span>`:''}${x.promotion_mode?`<span>${esc(label(x.promotion_mode))}</span>`:''}${x.audience?`<span>Audience: ${esc(x.audience)}</span>`:''}</div>${x.note?`<p>${esc(x.note)}</p>`:''}${x.results?`<p class="ll-promo-review-result"><strong>Results / response:</strong> ${esc(x.results)}</p>`:''}<div class="ll-promo-review-files">${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Open promotion link ↗</a>`:''}${(Array.isArray(x.files)?x.files:[]).map((f:Row)=>`<button type="button" data-promotion-open-file="${esc(f.storage_path)}" data-promotion-file-name="${esc(f.original_name)}">📎 ${esc(f.original_name)}</button>`).join('')}</div></article>`).join('')}</div>`;
}
function reflectionMarkup(rows:Row[]){if(!rows.length)return '<p class="ll-promotion-muted">No reflection has been submitted yet.</p>';return `<div class="ll-promotion-reflection-list">${rows.slice(0,6).map(x=>`<article><span>${esc(label(x.stage||'Reflection'))} • ${esc(x.reflection_date||'')}</span><b>${esc(x.worked_on||'Reflection')}</b>${x.learned?`<p><strong>Learning:</strong> ${esc(x.learned)}</p>`:''}${x.next_step?`<p><strong>Next:</strong> ${esc(x.next_step)}</p>`:''}</article>`).join('')}</div>`}
function supervisorForm(id:string){return `<form class="ll-promotion-supervisor-form" data-promotion-supervisor-review="${esc(id)}"><div class="ll-promotion-review-intro"><span>CAS SUPERVISOR DECISION</span><h4>Review the current promotion evidence.</h4><p>Check that the student carried out the activity, that the evidence supports the claim, and that the reflection/process is credible.</p></div><div class="ll-promotion-rubric">${[['student_ownership','Student ownership'],['evidence_quality','Evidence quality'],['cas_relevance','CAS process / relevance'],['initiative_reflection','Initiative & reflection'],['evidence_integrity','Evidence integrity']].map(([k,l])=>`<label><span>${l}</span><select name="${k}" required><option value="">Score 1–5</option><option value="5">5 — Strong</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1 — Major issue</option></select></label>`).join('')}</div><div class="ll-promotion-feedback-grid"><label><span>What is strong?</span><textarea name="strengths" maxlength="3000" rows="3"></textarea></label><label><span>What should improve?</span><textarea name="improvements" maxlength="3000" rows="3"></textarea></label></div><label><span>Specific next steps</span><textarea name="next_steps" maxlength="3000" rows="3"></textarea></label><label><span>Overall supervisor summary</span><textarea name="summary" minlength="10" maxlength="5000" rows="4" required></textarea></label><label><span>Decision</span><select name="recommendation" required><option value="">Choose</option><option value="request_changes">Request changes — return to student</option><option value="approve">Approve current evidence — send to LitLab admin</option></select></label><div class="ll-promotion-review-actions"><button type="submit">Submit supervisor decision</button><small data-promotion-review-state role="status"></small></div></form>`}
function reviewSummary(r:Row|null|undefined){if(!r)return '';return `<article class="ll-promotion-review-summary ${r.recommendation==='approve'?'approved':'changes'}"><header><div><span>CAS SUPERVISOR REVIEW</span><b>${esc(r.reviewer_name||'CAS supervisor')}</b></div><em>${r.recommendation==='approve'?'Approved':'Changes requested'}</em></header><p>${esc(r.summary||'')}</p><small>${esc(fmt(r.created_at))}</small></article>`}
function stateLabel(stage:string){return stage==='waiting_evidence'?'Waiting for evidence':stage==='waiting_supervisor'?'Review setup pending':stage==='student_revision'?'Waiting for revised evidence':stage==='admin_review'?'Sent to LitLab':stage==='complete'?'Complete':'Ready for supervisor review'}

function renderContext(a:Assignment,ctx:Row){
  const card=cardFor(a.application_id);if(!card)return;
  let panel=panelFor(a.application_id);
  if(!panel){panel=document.createElement('section');panel.dataset.promotionSupervisorPanel='true';panel.className='ll-promotion-supervisor-panel';card.appendChild(panel)}
  const rows=Array.isArray(ctx.evidence)?ctx.evidence:[];const reflections=Array.isArray(ctx.reflections)?ctx.reflections:[];const stage=String(ctx.stage||'supervisor_review');
  const channel=rows[0]?.promotion_channel||'Promotion';const audience=rows[0]?.audience||'See submitted evidence';const files=Number(ctx.evidence_file_count||0);
  const action=stage==='supervisor_review'&&Boolean(ctx.review_ready);
  const waiting=stage==='waiting_evidence'?'<div class="ll-promotion-next-note"><b>Waiting for evidence.</b><span>The student has not submitted evidence yet.</span></div>':stage==='student_revision'?'<div class="ll-promotion-next-note"><b>Waiting for revised evidence.</b><span>Your requested changes are still current.</span></div>':stage==='admin_review'?'<div class="ll-promotion-next-note"><b>Supervisor review complete.</b><span>The current evidence is now with LitLab admin for final review.</span></div>':'';
  const signature=JSON.stringify([ctx.latest_evidence_at,ctx.evidence_count,ctx.evidence_file_count,ctx.latest_supervisor_review?.id,ctx.stage]);
  if(panel.dataset.livePromotionSignature===signature&&renderedEvidence(panel)>=Number(ctx.evidence_count||0)&&renderedFiles(panel)>=files)return;
  panel.dataset.livePromotionSignature=signature;
  panel.innerHTML=`<div class="ll-promotion-supervisor-head"><div><span>PROMOTION EVIDENCE REVIEW</span><h4>${esc(ctx.student_name||a.student_name||'Student')}</h4><p>Review the evidence package the student submitted for this Promotion contribution.</p></div><em class="stage-${esc(stage)}">${esc(stateLabel(stage))}</em></div><div class="ll-promotion-context-grid"><article><span>CHANNEL</span><b>${esc(channel)}</b></article><article><span>AUDIENCE</span><b>${esc(audience)}</b></article><article><span>EVIDENCE ITEMS</span><b>${Number(ctx.evidence_count||0)}</b></article><article><span>ATTACHMENTS</span><b>${files}</b></article></div><section class="ll-promotion-review-section"><div class="ll-promotion-section-head"><span>STUDENT SUBMISSION</span><b>${Number(ctx.evidence_count||0)} evidence item${Number(ctx.evidence_count||0)===1?'':'s'}</b></div>${evidenceMarkup(rows)}</section><section class="ll-promotion-review-section"><div class="ll-promotion-section-head"><span>REFLECTION</span><b>${Number(ctx.reflection_count||0)} entr${Number(ctx.reflection_count||0)===1?'y':'ies'}</b></div>${reflectionMarkup(reflections)}</section>${reviewSummary(ctx.latest_supervisor_review)}${action?supervisorForm(a.application_id):waiting}`;
}

async function refresh(a:Assignment){
  if(route()!=='contribute'||!isPromotion(a)||expectedEvidence(a)<=0)return;
  const cached=contexts.get(a.application_id);
  const cacheMatches=cached&&Number(cached.evidence_count||0)===expectedEvidence(a)&&Number(cached.evidence_file_count||0)===expectedFiles(a)&&String(cached.latest_evidence_at||'')===String(a.promotion_latest_evidence_at||'');
  if(cacheMatches){renderContext(a,cached);return}
  const ctx=await loadContext(a.application_id);if(ctx)renderContext(a,ctx);
}
function apply(){scheduled=false;if(route()!=='contribute')return;assignments.filter(isPromotion).forEach(a=>{if(expectedEvidence(a)>0&&stale(a))void refresh(a);else{const ctx=contexts.get(a.application_id);if(ctx)renderContext(a,ctx)}})}
function schedule(delay=50){if(scheduled)return;scheduled=true;window.setTimeout(apply,delay)}
function startObserver(){observer?.disconnect();observer=new MutationObserver(records=>{if(records.some(record=>{const target=record.target instanceof Element?record.target:record.target.parentElement;return Boolean(target?.closest('.ll-promotion-supervisor-card,[data-promotion-supervisor-panel]'))}))schedule(40)});observer.observe(document.body,{childList:true,subtree:true})}

window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};if(Array.isArray(detail.assignments))assignments=detail.assignments;schedule(20)});
window.addEventListener('focus',()=>schedule(10));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(10)});
window.addEventListener('hashchange',()=>{if(route()!=='contribute'){assignments=[];contexts.clear()}schedule(30)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{startObserver();schedule(0)},{once:true});else{startObserver();schedule(0)}

export {};
