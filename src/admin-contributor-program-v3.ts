import './admin-contributor-program-v3.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type AdminState={applicant_type:'student'|'teacher';status:string;onboarding?:{role:string;handbook_version:number;completed_at:string}|null;brief_agreement?:{version:number;accepted_version?:number|null;accepted_at?:string|null;is_current:boolean;updated_at?:string}|null;reflection_count:number;evidence_count:number;publication?:{id:string;title:string;public_url:string;published_at:string;active:boolean}|null;impact?:{unique_viewers:number;showcase_opens:number;helpful_yes:number;helpful_no:number}};

let activeAppId='';
let state:AdminState|null=null;
let observer:MutationObserver|null=null;
let loadTimer=0;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const parsed=await response.json() as {message?:string};if(parsed.message)message=parsed.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{clearTimeout(timeout)}
}

function modal(){return document.getElementById('ll-admin-contributor-workspace')}
function readinessMarkup(s:AdminState){
  const student=s.applicant_type==='student';const accepted=Boolean(s.brief_agreement?.is_current);
  const checks=student?[
    ['Orientation',Boolean(s.onboarding),'Contributor standard completed'],
    ['Brief agreement',accepted,accepted?`Current v${s.brief_agreement?.version||1} accepted`:`Latest v${s.brief_agreement?.version||1} not yet accepted`],
    ['Reflections',Number(s.reflection_count||0)>0,`${Number(s.reflection_count||0)} meaningful reflection ${Number(s.reflection_count||0)===1?'entry':'entries'}`],
    ['Evidence',Number(s.evidence_count||0)>0,`${Number(s.evidence_count||0)} supplementary evidence ${Number(s.evidence_count||0)===1?'item':'items'}`]
  ]:[['Teacher orientation',Boolean(s.onboarding),'Reviewer standard completed']];
  return `<section class="ll-admin-workspace-card wide ll-admin-v3-readiness" data-admin-v3-readiness><div class="ll-admin-workspace-title"><div><span>PROGRAM READINESS</span><h3>${student?'Contributor journey health':'Teacher reviewer readiness'}</h3></div><em>${s.status==='completed'?'Final approved':'Live status'}</em></div><div class="ll-admin-v3-checks">${checks.map(([name,ok,detail])=>`<div class="${ok?'ok':'pending'}"><i>${ok?'✓':'•'}</i><section><b>${esc(name)}</b><span>${esc(detail)}</span></section></div>`).join('')}</div>${student?'<p class="muted">Reflection and supplementary evidence are quality signals, not hard quotas. Final approval should still be based on the actual contribution, revisions, source quality and reviewer feedback.</p>':'<p class="muted">Teachers should not be asked to maintain a student-style CAS evidence ledger. Their job is private academic review, actionable feedback and a clear recommendation.</p>'}</section>`;
}

function publicationMarkup(s:AdminState){
  if(s.applicant_type!=='student')return '';
  const p=s.publication;const impact=s.impact||{unique_viewers:0,showcase_opens:0,helpful_yes:0,helpful_no:0};const canActivate=s.status==='completed';
  return `<section class="ll-admin-workspace-card wide ll-admin-v3-publication" data-admin-v3-publication><div class="ll-admin-workspace-title"><div><span>PUBLICATION & IMPACT</span><h3>Link the final-approved contribution</h3></div><em>${p?.active?'Published':p?'Saved / hidden':'Not linked'}</em></div><p class="muted">Use this only after a student resource is genuinely final-approved. The public showcase respects the contributor’s saved credit preference. Showcase opens are LitLab interaction counts, not total readership claims.</p><form data-admin-v3-publication-form="${esc(activeAppId)}"><div class="ll-admin-v3-grid two"><label><span>Public title</span><input name="title" required minlength="2" maxlength="240" value="${esc(p?.title||'')}" placeholder="Paper 1 Visual Analysis Guide"/></label><label><span>Published date</span><input type="date" name="published_at" value="${esc((p?.published_at||new Date().toISOString()).slice(0,10))}"/></label></div><label><span>Public URL</span><input type="url" name="public_url" required maxlength="2000" value="${esc(p?.public_url||'')}" placeholder="https://…"/></label><label class="ll-admin-v3-toggle"><input type="checkbox" name="active" ${p?.active?'checked':''} ${canActivate?'':'disabled'}/><span><b>Show in Contributor Showcase</b><small>${canActivate?'Makes the linked resource public in LitLab’s showcase.':'Available only after the contribution is marked Completed / final approved.'}</small></span></label><div class="ll-admin-v3-actions"><button type="submit">${p?'Save publication':'Link publication'}</button><small data-admin-v3-state role="status"></small></div></form>${p?`<div class="ll-admin-v3-impact"><div><strong>${Number(impact.showcase_opens||0)}</strong><span>Showcase opens</span></div><div><strong>${Number(impact.unique_viewers||0)}</strong><span>Unique showcase visitors</span></div><div><strong>${Number(impact.helpful_yes||0)}</strong><span>Useful</span></div><div><strong>${Number(impact.helpful_no||0)}</strong><span>Needs improvement</span></div></div>`:''}</section>`;
}

function apply(){const body=modal()?.querySelector<HTMLElement>('[data-admin-workspace-body]');if(!body||!state||!activeAppId)return;body.querySelectorAll('[data-admin-v3-readiness],[data-admin-v3-publication]').forEach(el=>el.remove());const grid=body.querySelector<HTMLElement>('.ll-admin-workspace-grid');if(!grid)return;grid.insertAdjacentHTML('afterbegin',readinessMarkup(state));grid.insertAdjacentHTML('beforeend',publicationMarkup(state))}
async function load(){if(!activeAppId||!modal())return;try{state=await rpc<AdminState>('admin_get_litlab_contributor_program_v3_state',{p_application_id:activeAppId});apply()}catch(error){console.debug('Contributor v3 admin state unavailable',error)}}
function scheduleLoad(delay=160){clearTimeout(loadTimer);loadTimer=window.setTimeout(()=>void load(),delay)}
function observeModal(){observer?.disconnect();const host=modal();if(!host)return;observer=new MutationObserver(()=>{if(state)apply();else scheduleLoad(80)});observer.observe(host,{childList:true,subtree:true})}

async function savePublication(form:HTMLFormElement,appId:string){
  if(!form.checkValidity()){form.reportValidity();return}
  const stateEl=form.querySelector<HTMLElement>('[data-admin-v3-state]');const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');const data=new FormData(form);if(button){button.disabled=true;button.textContent='Saving…'}
  try{
    const date=String(data.get('published_at')||'').trim();
    await rpc('admin_upsert_litlab_contributor_publication',{p_application_id:appId,p_title:String(data.get('title')||''),p_public_url:String(data.get('public_url')||''),p_published_at:date?new Date(`${date}T12:00:00`).toISOString():new Date().toISOString(),p_active:data.get('active')==='on'});
    if(stateEl){stateEl.textContent='Publication settings saved.';stateEl.dataset.state='success'}
    await load();window.dispatchEvent(new CustomEvent('litlab:admin-contributor-workspace-updated',{detail:{applicationId:appId,publication:true}}));
  }catch(error){if(stateEl){stateEl.textContent=error instanceof Error?error.message:'Could not save publication.';stateEl.dataset.state='error'}}finally{if(button?.isConnected){button.disabled=false;button.textContent='Save publication'}}
}

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const manage=target.closest<HTMLElement>('[data-admin-manage-workspace]');if(manage){activeAppId=manage.closest<HTMLElement>('.admin-contrib-card')?.dataset.appId||'';state=null;setTimeout(()=>{observeModal();scheduleLoad()},80)}if(target.closest('[data-admin-workspace-close]')){activeAppId='';state=null;observer?.disconnect();observer=null}},true);
document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;const appId=form?.dataset.adminV3PublicationForm;if(appId){event.preventDefault();event.stopPropagation();void savePublication(form,appId)}},true);
window.addEventListener('hashchange',()=>{if(route()!=='admin-contributors'){activeAppId='';state=null;observer?.disconnect();observer=null}});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{const detail=(event as CustomEvent<{applicationId?:string}>).detail||{};if(detail.applicationId)activeAppId=detail.applicationId;observeModal();scheduleLoad(80)});
window.addEventListener('litlab:admin-contributor-workspace-updated',()=>scheduleLoad(120));

export {};
