import './admin-contributor-program-v3.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type AdminState={applicant_type:'student'|'teacher';status:string;onboarding?:{role:string;handbook_version:number;completed_at:string}|null;brief_agreement?:{version:number;accepted_version?:number|null;accepted_at?:string|null;is_current:boolean;updated_at?:string}|null;reflection_count:number;evidence_count:number;publication?:{id:string;title:string;public_url:string;published_at:string;active:boolean}|null;impact?:{unique_viewers:number;showcase_opens:number;helpful_yes:number;helpful_no:number}};

type WorkspaceSection={id:string;label:string};

let activeAppId='';
let state:AdminState|null=null;
let loadTimer=0;
let pageTimer=0;
let requestVersion=0;
let loadingAppId='';

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Developer sign-in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const parsed=await response.json() as {message?:string};if(parsed.message)message=parsed.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
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
  return `<section class="ll-admin-workspace-card wide ll-admin-v3-readiness" data-admin-v3-readiness><div class="ll-admin-workspace-title"><div><span>PROGRAM READINESS</span><h3>${student?'Contributor journey health':'Teacher reviewer readiness'}</h3></div><em>${s.status==='completed'?'Final approved':'Live status'}</em></div><div class="ll-admin-v3-checks">${checks.map(([name,ok,detail])=>`<div class="${ok?'ok':'pending'}"><i>${ok?'✓':'•'}</i><section><b>${esc(name)}</b><span>${esc(detail)}</span></section></div>`).join('')}</div>${student?'<p class="muted">These are quality signals, not quotas. Final approval should be based on the contribution itself, revisions, source quality and reviewer feedback.</p>':'<p class="muted">Teacher reviewers focus on academic accuracy, actionable feedback, privacy and a clear recommendation. They do not need a student-style CAS evidence ledger.</p>'}</section>`;
}

function publicationMarkup(s:AdminState){
  if(s.applicant_type!=='student')return '';
  const p=s.publication;const impact=s.impact||{unique_viewers:0,showcase_opens:0,helpful_yes:0,helpful_no:0};const canActivate=s.status==='completed';
  return `<section class="ll-admin-workspace-card wide ll-admin-v3-publication" data-admin-v3-publication><div class="ll-admin-workspace-title"><div><span>PUBLICATION & IMPACT</span><h3>Publish only the final-approved resource.</h3></div><em>${p?.active?'Published':p?'Saved / hidden':'Not linked'}</em></div><p class="muted">Link the finished resource after final approval. Public credit follows the contributor’s saved preference, and the figures below are LitLab showcase interactions only.</p><form data-admin-v3-publication-form="${esc(activeAppId)}"><div class="ll-admin-v3-grid two"><label><span>Public title</span><input name="title" required minlength="2" maxlength="240" value="${esc(p?.title||'')}" placeholder="Paper 1 Visual Analysis Guide"/></label><label><span>Published date</span><input type="date" name="published_at" value="${esc((p?.published_at||new Date().toISOString()).slice(0,10))}"/></label></div><label><span>Public URL</span><input type="url" name="public_url" required maxlength="2000" value="${esc(p?.public_url||'')}" placeholder="https://…"/></label><label class="ll-admin-v3-toggle"><input type="checkbox" name="active" ${p?.active?'checked':''} ${canActivate?'':'disabled'}/><span><b>Show in Contributor Showcase</b><small>${canActivate?'Makes this final-approved resource visible in the public showcase.':'Available after the contribution is Completed / final approved.'}</small></span></label><div class="ll-admin-v3-actions"><button type="submit">${p?'Save publication':'Link publication'}</button><small data-admin-v3-state role="status"></small></div></form>${p?`<div class="ll-admin-v3-impact"><div><strong>${Number(impact.showcase_opens||0)}</strong><span>Showcase opens</span></div><div><strong>${Number(impact.unique_viewers||0)}</strong><span>Unique visitors</span></div><div><strong>${Number(impact.helpful_yes||0)}</strong><span>Useful</span></div><div><strong>${Number(impact.helpful_no||0)}</strong><span>Needs improvement</span></div></div>`:''}</section>`;
}

function sectionId(card:HTMLElement){
  const kicker=card.querySelector<HTMLElement>('.ll-admin-workspace-title span')?.textContent?.trim().toUpperCase()||'';
  const map:Record<string,WorkspaceSection>={
    'PROGRAM READINESS':{id:'ll-admin-section-readiness',label:'Overview'},
    'PROJECT BRIEF':{id:'ll-admin-section-brief',label:'Brief'},
    'PROMOTION BRIEF':{id:'ll-admin-section-brief',label:'Campaign brief'},
    'TASKS':{id:'ll-admin-section-tasks',label:'Tasks'},
    'REVISION REQUESTS':{id:'ll-admin-section-revisions',label:'Revisions'},
    'WORD DOCUMENTS':{id:'ll-admin-section-documents',label:'Documents'},
    'TEACHER REVIEWER':{id:'ll-admin-section-reviewer',label:'Reviewer'},
    'TEACHER REVIEWS':{id:'ll-admin-section-reviews',label:'Reviews'},
    'STUDENT ACTIVITY':{id:'ll-admin-section-activity',label:'Activity'},
    'PUBLICATION & IMPACT':{id:'ll-admin-section-publication',label:'Publication'}
  };
  return map[kicker]||null;
}

function enhanceWorkspaceNavigation(){
  const body=modal()?.querySelector<HTMLElement>('[data-admin-workspace-body]');if(!body)return;
  const grid=body.querySelector<HTMLElement>('.ll-admin-workspace-grid');if(!grid)return;
  const sections:WorkspaceSection[]=[];
  grid.querySelectorAll<HTMLElement>(':scope > .ll-admin-workspace-card').forEach(card=>{const entry=sectionId(card);if(!entry)return;card.id=entry.id;card.classList.add('ll-admin-v3-section');sections.push(entry)});
  body.querySelector('[data-admin-v3-workspace-nav]')?.remove();
  if(!sections.length)return;
  const primary=['Overview','Brief','Documents','Revisions','Reviews','Publication'];
  const ordered=sections.slice().sort((a,b)=>{const ai=primary.indexOf(a.label),bi=primary.indexOf(b.label);return (ai<0?99:ai)-(bi<0?99:bi)});
  const nav=document.createElement('nav');nav.className='ll-admin-v3-workspace-nav';nav.dataset.adminV3WorkspaceNav='true';nav.setAttribute('aria-label','Contributor workspace sections');
  nav.innerHTML=`<div><span>WORKSPACE</span><b>Jump to</b></div><div>${ordered.map(item=>`<button type="button" data-admin-v3-jump-section="${esc(item.id)}">${esc(item.label)}</button>`).join('')}</div>`;
  grid.before(nav);
}

function apply(){
  const body=modal()?.querySelector<HTMLElement>('[data-admin-workspace-body]');if(!body||!state||!activeAppId)return;
  const grid=body.querySelector<HTMLElement>('.ll-admin-workspace-grid');if(!grid)return;
  body.querySelectorAll('[data-admin-v3-readiness],[data-admin-v3-publication]').forEach(el=>el.remove());
  grid.insertAdjacentHTML('afterbegin',readinessMarkup(state));
  const isPromotion=modal()?.dataset.contributionType==='promotion';
  const publication=isPromotion?'':publicationMarkup(state);if(publication)grid.insertAdjacentHTML('beforeend',publication);
  enhanceWorkspaceNavigation();
}

async function load(){
  const appId=activeAppId;if(!appId||!modal())return;
  const version=++requestVersion;loadingAppId=appId;
  try{
    const next=await rpc<AdminState>('admin_get_litlab_contributor_program_v3_state',{p_application_id:appId});
    if(version!==requestVersion||activeAppId!==appId||!modal())return;
    state=next;apply();
  }catch(error){if(activeAppId===appId)console.debug('Contributor admin overview unavailable',error)}
  finally{if(loadingAppId===appId)loadingAppId=''}
}
function scheduleLoad(delay=100){window.clearTimeout(loadTimer);loadTimer=window.setTimeout(()=>void load(),delay)}

function filterButtons(){return [
  ['all','All'],['new','Pending'],['reviewing','Needs review'],['accepted','Active'],['completed','Completed'],['teacher','Teachers']
] as const}

function syncQuickFilters(){
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');if(!page)return;
  const role=page.querySelector<HTMLSelectElement>('[data-contrib-role-filter]')?.value||'all';
  const status=page.querySelector<HTMLSelectElement>('[data-contrib-status-filter]')?.value||'all';
  const key=role==='teacher'&&status==='all'?'teacher':role==='all'?status:'all';
  page.querySelectorAll<HTMLButtonElement>('[data-admin-v3-filter]').forEach(button=>button.classList.toggle('is-active',button.dataset.adminV3Filter===key));
}

function enhanceAdminPage(){
  if(route()!=='admin-contributors')return;
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');if(!page)return;
  const workspace=page.querySelector<HTMLElement>('.admin-contrib-workspace');const head=workspace?.querySelector<HTMLElement>('.admin-contrib-head');if(!workspace||!head)return;
  let queue=workspace.querySelector<HTMLElement>('[data-admin-v3-queue]');
  if(!queue){
    queue=document.createElement('section');queue.className='admin-v3-queue';queue.dataset.adminV3Queue='true';
    queue.innerHTML=`<div class="admin-v3-queue-copy"><span>WORKFLOW QUEUE</span><b>Show what needs your attention.</b><small>Application → workspace → review → final approval → certificate / publication</small></div><div class="admin-v3-queue-buttons">${filterButtons().map(([key,text])=>`<button type="button" data-admin-v3-filter="${key}">${text}</button>`).join('')}</div>`;
    head.insertAdjacentElement('afterend',queue);
  }
  syncQuickFilters();
}
function scheduleAdminPage(delay=80){window.clearTimeout(pageTimer);pageTimer=window.setTimeout(enhanceAdminPage,delay)}

function applyQuickFilter(key:string){
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');if(!page)return;
  const role=page.querySelector<HTMLSelectElement>('[data-contrib-role-filter]');const status=page.querySelector<HTMLSelectElement>('[data-contrib-status-filter]');if(!role||!status)return;
  role.value=key==='teacher'?'teacher':'all';status.value=['new','reviewing','accepted','completed'].includes(key)?key:'all';
  status.dispatchEvent(new Event('change',{bubbles:true}));
  window.setTimeout(syncQuickFilters,0);
}

async function savePublication(form:HTMLFormElement,appId:string){
  if(!form.checkValidity()){form.reportValidity();return}
  const stateEl=form.querySelector<HTMLElement>('[data-admin-v3-state]');const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');const data=new FormData(form);const original=button?.textContent||'Save publication';if(button){button.disabled=true;button.textContent='Saving…'}
  try{
    const date=String(data.get('published_at')||'').trim();
    await rpc('admin_upsert_litlab_contributor_publication',{p_application_id:appId,p_title:String(data.get('title')||''),p_public_url:String(data.get('public_url')||''),p_published_at:date?new Date(`${date}T12:00:00`).toISOString():new Date().toISOString(),p_active:data.get('active')==='on'});
    if(stateEl){stateEl.textContent='Publication settings saved.';stateEl.dataset.state='success'}
    await load();window.dispatchEvent(new CustomEvent('litlab:admin-contributor-workspace-updated',{detail:{applicationId:appId,publication:true}}));
  }catch(error){if(stateEl){stateEl.textContent=error instanceof Error?error.message:'Could not save publication.';stateEl.dataset.state='error'}}finally{if(button?.isConnected){button.disabled=false;button.textContent=original}}
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const filter=target.closest<HTMLButtonElement>('[data-admin-v3-filter]');if(filter){applyQuickFilter(filter.dataset.adminV3Filter||'all');return}
  const jump=target.closest<HTMLButtonElement>('[data-admin-v3-jump-section]');if(jump){const section=document.getElementById(jump.dataset.adminV3JumpSection||'');section?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(target.closest('[data-admin-workspace-close]')){activeAppId='';state=null;loadingAppId='';requestVersion++;window.clearTimeout(loadTimer)}
},true);

document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;const appId=form?.dataset.adminV3PublicationForm;if(appId){event.preventDefault();event.stopPropagation();void savePublication(form,appId)}},true);
document.addEventListener('change',event=>{const target=event.target instanceof Element?event.target:null;if(target?.matches('[data-contrib-role-filter],[data-contrib-status-filter]'))window.setTimeout(syncQuickFilters,0)},true);

window.addEventListener('hashchange',()=>{
  if(route()!=='admin-contributors'){activeAppId='';state=null;loadingAppId='';requestVersion++;window.clearTimeout(loadTimer)}
  scheduleAdminPage(120);
});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{
  const detail=(event as CustomEvent<{applicationId?:string}>).detail||{};const nextId=String(detail.applicationId||'');if(!nextId)return;
  if(activeAppId!==nextId){activeAppId=nextId;state=null;requestVersion++}else if(state)apply();
  scheduleLoad(70);
});
window.addEventListener('litlab:admin-contributor-workspace-updated',()=>scheduleLoad(80));
window.addEventListener('litlab:contributor-admin-updated',()=>scheduleAdminPage(80));
window.addEventListener('focus',()=>{if(route()==='admin-contributors'){scheduleAdminPage(40);if(activeAppId&&state)apply()}});

function start(){scheduleAdminPage(180)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
