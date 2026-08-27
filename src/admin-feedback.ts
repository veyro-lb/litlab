import './admin-feedback.css';
import './admin-technical-reports.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token:string};
type FeedbackItem={
  id:string;created_at:string;respondent_role:string;school:string|null;section:string;rating:number;
  useful:string|null;improve:string|null;unclear:string|null;feature_request:string|null;recommend:string|null;source_page:string|null;
};
type FeedbackData={
  generated_at:string;total:number;new_7d:number;average_rating:number;
  recommend:{yes:number;maybe:number;no:number};items:FeedbackItem[];
};
type TechnicalItem={
  id:string;created_at:string;respondent_role:string;school:string|null;category:string;severity:string;
  description:string;steps_to_reproduce:string|null;expected_behavior:string|null;source_page:string|null;
  browser:string|null;device:string|null;viewport:string|null;user_agent:string|null;
};
type TechnicalData={generated_at:string;total:number;new_7d:number;blocked:number;major:number;items:TechnicalItem[]};
type AdminSubmissionData={feedback:FeedbackData;technical:TechnicalData};

let renderTimer=0;
let refreshing=false;
let lastAutomaticRefresh=0;

function isAdminRoute(){return location.hash.replace(/^#/,'').split('?')[0]==='admin'}

function readSession():StoredSession|null{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return value&&typeof value.access_token==='string'?value:null;
  }catch{return null}
}

function authHeaders(extra:Record<string,string>={}){
  const session=readSession();
  return {
    apikey:SUPABASE_PUBLISHABLE_KEY,
    ...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}),
    ...extra
  };
}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',headers:authHeaders({'Content-Type':'application/json',Accept:'application/json'}),body:JSON.stringify(body)
  });
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

async function loadSubmissions():Promise<AdminSubmissionData>{
  const [feedback,technical]=await Promise.all([
    rpc<FeedbackData>('get_litlab_admin_feedback'),
    rpc<TechnicalData>('get_litlab_admin_technical_reports')
  ]);
  return {feedback,technical};
}

function escapeHTML(value:unknown){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function fmt(value?:string|null){
  if(!value)return '—';
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '—';
  return date.toLocaleString([],{
    month:'short',day:'numeric',year:date.getFullYear()!==new Date().getFullYear()?'numeric':undefined,
    hour:'2-digit',minute:'2-digit'
  });
}

function roleLabel(value:string){
  const labels:Record<string,string>={student:'Student',teacher:'Teacher','ib-coordinator':'IB Coordinator','cas-coordinator':'CAS Coordinator',parent:'Parent',other:'Other'};
  return labels[value]||value;
}

function categoryLabel(value:string){
  const labels:Record<string,string>={
    'page-loading':'Page loading','button-interaction':'Button / interaction','sign-in-account':'Sign in / account',tutor:'LitLab Tutor',
    'mobile-layout':'Mobile layout','progress-saving':'Progress / sync','display-visual':'Display / visual',other:'Other technical issue'
  };
  return labels[value]||value;
}

function severityLabel(value:string){
  if(value==='blocked')return 'Blocked';
  if(value==='major')return 'Major';
  return 'Minor';
}

function recommendLabel(value:string|null){
  if(value==='yes')return 'Would recommend';
  if(value==='maybe')return 'Maybe recommend';
  if(value==='no')return 'Would not recommend';
  return 'No recommendation response';
}

function commentBlock(label:string,value:string|null,tech=false){
  if(!value)return '';
  return `<div class="admin-feedback-comment${tech?' admin-tech-comment':''}"><span>${escapeHTML(label)}</span><p>${escapeHTML(value)}</p></div>`;
}

function feedbackCard(item:FeedbackItem){
  const school=item.school?.trim()||'School not provided';
  const rating=Math.max(1,Math.min(5,Number(item.rating)||1));
  const searchText=`${school} ${roleLabel(item.respondent_role)} ${item.section} ${item.useful||''} ${item.improve||''} ${item.unclear||''} ${item.feature_request||''}`.toLowerCase();
  return `<details class="admin-feedback-item" data-feedback-item data-feedback-id="${escapeHTML(item.id)}" data-section="${escapeHTML(item.section)}" data-rating="${rating}" data-search="${escapeHTML(searchText)}">
    <summary>
      <div class="admin-feedback-who"><span class="admin-feedback-role">${escapeHTML(roleLabel(item.respondent_role))}</span><div><b>${escapeHTML(school)}</b><small>${escapeHTML(item.section)} • ${escapeHTML(fmt(item.created_at))}</small></div></div>
      <div class="admin-feedback-score"><strong>${rating}/5</strong><span>${escapeHTML(recommendLabel(item.recommend))}</span></div>
    </summary>
    <div class="admin-feedback-body">
      ${commentBlock('What they found useful',item.useful)}
      ${commentBlock('What could be improved',item.improve)}
      ${commentBlock('Incorrect or unclear',item.unclear)}
      ${commentBlock('Feature request',item.feature_request)}
      <div class="admin-feedback-meta"><span><b>Recommendation:</b> ${escapeHTML(recommendLabel(item.recommend))}</span><span><b>Submitted from:</b> ${escapeHTML(item.source_page||'Unknown page')}</span></div>
      <div class="admin-feedback-admin-actions"><button type="button" class="admin-feedback-delete" data-feedback-delete="${escapeHTML(item.id)}">Delete feedback</button></div>
    </div>
  </details>`;
}

function technicalCard(item:TechnicalItem){
  const school=item.school?.trim()||'School not provided';
  const searchText=`${school} ${roleLabel(item.respondent_role)} ${categoryLabel(item.category)} ${item.severity} ${item.description||''} ${item.steps_to_reproduce||''} ${item.expected_behavior||''} ${item.source_page||''}`.toLowerCase();
  return `<details class="admin-feedback-item admin-tech-item" data-tech-item data-report-id="${escapeHTML(item.id)}" data-category="${escapeHTML(item.category)}" data-severity="${escapeHTML(item.severity)}" data-search="${escapeHTML(searchText)}">
    <summary>
      <div class="admin-feedback-who"><span class="admin-tech-severity" data-severity="${escapeHTML(item.severity)}">${escapeHTML(severityLabel(item.severity))}</span><div><b>${escapeHTML(categoryLabel(item.category))}</b><small>${escapeHTML(roleLabel(item.respondent_role))} • ${escapeHTML(school)} • ${escapeHTML(fmt(item.created_at))}</small></div></div>
      <div class="admin-tech-page">${escapeHTML(item.source_page||'Unknown page')}</div>
    </summary>
    <div class="admin-feedback-body">
      ${commentBlock('Problem reported',item.description,true)}
      ${commentBlock('Steps to reproduce',item.steps_to_reproduce,true)}
      ${commentBlock('Expected behavior',item.expected_behavior,true)}
      <div class="admin-tech-context">
        <div><span>Page</span><b>${escapeHTML(item.source_page||'Unknown')}</b></div>
        <div><span>Browser</span><b>${escapeHTML(item.browser||'Unknown')}</b></div>
        <div><span>Device</span><b>${escapeHTML(item.device||'Unknown')}</b></div>
        <div><span>Viewport</span><b>${escapeHTML(item.viewport||'Unknown')}</b></div>
      </div>
      ${item.user_agent?`<details class="admin-tech-user-agent"><summary>Full browser user agent</summary><code>${escapeHTML(item.user_agent)}</code></details>`:''}
      <div class="admin-feedback-admin-actions"><button type="button" class="admin-feedback-delete" data-tech-delete="${escapeHTML(item.id)}">Delete technical report</button></div>
    </div>
  </details>`;
}

function feedbackPanel(data:FeedbackData){
  const sections=Array.from(new Set((data.items||[]).map(item=>item.section).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  return `<div class="admin-feedback-panel" data-admin-submission-panel="feedback">
    <div class="admin-feedback-metrics">
      <article><span>Total responses</span><strong>${Number(data.total)||0}</strong><small>All submissions</small></article>
      <article><span>New • 7 days</span><strong>${Number(data.new_7d)||0}</strong><small>Recent responses</small></article>
      <article><span>Average rating</span><strong>${Number(data.average_rating||0).toFixed(1)}<i>/5</i></strong><small>Across all feedback</small></article>
      <article><span>Would recommend</span><strong>${Number(data.recommend?.yes)||0}</strong><small>${Number(data.recommend?.maybe)||0} maybe • ${Number(data.recommend?.no)||0} no</small></article>
    </div>
    <div class="admin-feedback-tools">
      <label><span>Search</span><input type="search" data-feedback-search placeholder="School, comment, role…" /></label>
      <label><span>Section</span><select data-feedback-section><option value="">All sections</option>${sections.map(section=>`<option value="${escapeHTML(section)}">${escapeHTML(section)}</option>`).join('')}</select></label>
      <label><span>Rating</span><select data-feedback-rating><option value="">All ratings</option>${[5,4,3,2,1].map(n=>`<option value="${n}">${n}/5</option>`).join('')}</select></label>
    </div>
    <div class="admin-feedback-count" data-feedback-count>${(data.items||[]).length} response${(data.items||[]).length===1?'':'s'} shown</div>
    <div class="admin-feedback-list">${(data.items||[]).length?(data.items||[]).map(feedbackCard).join(''):'<div class="admin-feedback-empty"><b>No feedback yet.</b><span>New submissions from the LitLab feedback button will appear here.</span></div>'}</div>
  </div>`;
}

function technicalPanel(data:TechnicalData){
  return `<div class="admin-feedback-panel" data-admin-submission-panel="technical" hidden>
    <div class="admin-feedback-metrics admin-tech-metrics">
      <article><span>Total reports</span><strong>${Number(data.total)||0}</strong><small>All technical reports</small></article>
      <article><span>New • 7 days</span><strong>${Number(data.new_7d)||0}</strong><small>Recently reported</small></article>
      <article><span>Blocked</span><strong>${Number(data.blocked)||0}</strong><small>User could not continue</small></article>
      <article><span>Major</span><strong>${Number(data.major)||0}</strong><small>Important functionality affected</small></article>
    </div>
    <div class="admin-feedback-tools admin-tech-tools">
      <label><span>Search reports</span><input type="search" data-tech-search placeholder="Problem, page, school, device…" /></label>
      <label><span>Area</span><select data-tech-category><option value="">All areas</option><option value="page-loading">Page loading</option><option value="button-interaction">Button / interaction</option><option value="sign-in-account">Sign in / account</option><option value="tutor">LitLab Tutor</option><option value="mobile-layout">Mobile layout</option><option value="progress-saving">Progress / sync</option><option value="display-visual">Display / visual</option><option value="other">Other</option></select></label>
      <label><span>Severity</span><select data-tech-severity-filter><option value="">All severities</option><option value="blocked">Blocked</option><option value="major">Major</option><option value="minor">Minor</option></select></label>
    </div>
    <div class="admin-feedback-count" data-tech-count>${(data.items||[]).length} report${(data.items||[]).length===1?'':'s'} shown</div>
    <div class="admin-feedback-list">${(data.items||[]).length?(data.items||[]).map(technicalCard).join(''):'<div class="admin-feedback-empty"><b>No technical reports yet.</b><span>Bug reports submitted by LitLab users will appear here with debugging context.</span></div>'}</div>
  </div>`;
}

function setAdminView(container:HTMLElement,view:'feedback'|'technical'){
  container.dataset.activeView=view;
  container.querySelectorAll<HTMLButtonElement>('[data-admin-submission-tab]').forEach(button=>{
    const active=button.dataset.adminSubmissionTab===view;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
  });
  container.querySelectorAll<HTMLElement>('[data-admin-submission-panel]').forEach(panel=>{panel.hidden=panel.dataset.adminSubmissionPanel!==view});
}

function renderSubmissions(container:HTMLElement,data:AdminSubmissionData){
  const previousView=container.dataset.activeView==='technical'?'technical':'feedback';
  const generated=data.feedback.generated_at||data.technical.generated_at;
  container.innerHTML=`<section class="admin-feedback-shell">
    <header class="admin-feedback-head">
      <div><span>STUDENT, TEACHER & TECHNICAL REPORTS</span><h2>LitLab feedback & reports</h2><p>Review feedback and technical issues submitted through LitLab. This dashboard refreshes automatically while you are using it.</p><small class="admin-feedback-updated">Last updated ${escapeHTML(fmt(generated))}</small></div>
      <button type="button" data-feedback-refresh>Refresh now</button>
    </header>
    <div class="admin-feedback-tabs" role="tablist" aria-label="Submission type">
      <button type="button" role="tab" data-admin-submission-tab="feedback"><span>Feedback</span><b>${Number(data.feedback.total)||0}</b></button>
      <button type="button" role="tab" data-admin-submission-tab="technical"><span>Technical reports</span><b>${Number(data.technical.total)||0}</b>${Number(data.technical.blocked)>0?`<i>${Number(data.technical.blocked)} blocked</i>`:''}</button>
    </div>
    ${feedbackPanel(data.feedback)}
    ${technicalPanel(data.technical)}
  </section>`;

  container.dataset.loaded='true';
  container.querySelector<HTMLButtonElement>('[data-feedback-refresh]')?.addEventListener('click',()=>void refreshSubmissions(container,true));
  container.querySelectorAll<HTMLButtonElement>('[data-admin-submission-tab]').forEach(button=>button.addEventListener('click',()=>setAdminView(container,button.dataset.adminSubmissionTab==='technical'?'technical':'feedback')));
  container.querySelector<HTMLInputElement>('[data-feedback-search]')?.addEventListener('input',()=>filterFeedback(container));
  container.querySelector<HTMLSelectElement>('[data-feedback-section]')?.addEventListener('change',()=>filterFeedback(container));
  container.querySelector<HTMLSelectElement>('[data-feedback-rating]')?.addEventListener('change',()=>filterFeedback(container));
  container.querySelector<HTMLInputElement>('[data-tech-search]')?.addEventListener('input',()=>filterTechnical(container));
  container.querySelector<HTMLSelectElement>('[data-tech-category]')?.addEventListener('change',()=>filterTechnical(container));
  container.querySelector<HTMLSelectElement>('[data-tech-severity-filter]')?.addEventListener('change',()=>filterTechnical(container));
  container.querySelectorAll<HTMLButtonElement>('[data-feedback-delete]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();void deleteFeedback(container,button)}));
  container.querySelectorAll<HTMLButtonElement>('[data-tech-delete]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();void deleteTechnical(container,button)}));
  setAdminView(container,previousView);
}

function filterFeedback(container:HTMLElement){
  const query=(container.querySelector<HTMLInputElement>('[data-feedback-search]')?.value||'').trim().toLowerCase();
  const section=container.querySelector<HTMLSelectElement>('[data-feedback-section]')?.value||'';
  const rating=container.querySelector<HTMLSelectElement>('[data-feedback-rating]')?.value||'';
  let visible=0;
  container.querySelectorAll<HTMLElement>('[data-feedback-item]').forEach(item=>{
    const show=(!query||(item.dataset.search||'').includes(query))&&(!section||item.dataset.section===section)&&(!rating||item.dataset.rating===rating);
    item.hidden=!show;if(show)visible++;
  });
  const count=container.querySelector<HTMLElement>('[data-feedback-count]');
  if(count)count.textContent=`${visible} response${visible===1?'':'s'} shown`;
}

function filterTechnical(container:HTMLElement){
  const query=(container.querySelector<HTMLInputElement>('[data-tech-search]')?.value||'').trim().toLowerCase();
  const category=container.querySelector<HTMLSelectElement>('[data-tech-category]')?.value||'';
  const severity=container.querySelector<HTMLSelectElement>('[data-tech-severity-filter]')?.value||'';
  let visible=0;
  container.querySelectorAll<HTMLElement>('[data-tech-item]').forEach(item=>{
    const show=(!query||(item.dataset.search||'').includes(query))&&(!category||item.dataset.category===category)&&(!severity||item.dataset.severity===severity);
    item.hidden=!show;if(show)visible++;
  });
  const count=container.querySelector<HTMLElement>('[data-tech-count]');
  if(count)count.textContent=`${visible} report${visible===1?'':'s'} shown`;
}

async function deleteFeedback(container:HTMLElement,button:HTMLButtonElement){
  const id=button.dataset.feedbackDelete||'';if(!id)return;
  const item=button.closest<HTMLElement>('[data-feedback-item]');
  const school=item?.querySelector<HTMLElement>('.admin-feedback-who b')?.textContent||'this response';
  if(!confirm(`Delete feedback from ${school}? This cannot be undone.`))return;
  const oldText=button.textContent||'Delete feedback';button.disabled=true;button.textContent='Deleting…';
  try{const deleted=await rpc<boolean>('delete_litlab_admin_feedback',{p_feedback_id:id});if(!deleted)throw new Error('Feedback was not found');await refreshSubmissions(container,true)}
  catch(error){console.error(error);button.disabled=false;button.textContent=oldText;showDeleteError(button,'Could not delete this feedback. Refresh the dashboard and try again.')}
}

async function deleteTechnical(container:HTMLElement,button:HTMLButtonElement){
  const id=button.dataset.techDelete||'';if(!id)return;
  const item=button.closest<HTMLElement>('[data-tech-item]');
  const category=item?.querySelector<HTMLElement>('.admin-feedback-who b')?.textContent||'this technical report';
  if(!confirm(`Delete ${category}? This cannot be undone.`))return;
  const oldText=button.textContent||'Delete technical report';button.disabled=true;button.textContent='Deleting…';
  try{const deleted=await rpc<boolean>('delete_litlab_admin_technical_report',{p_report_id:id});if(!deleted)throw new Error('Report was not found');container.dataset.activeView='technical';await refreshSubmissions(container,true)}
  catch(error){console.error(error);button.disabled=false;button.textContent=oldText;showDeleteError(button,'Could not delete this technical report. Refresh the dashboard and try again.')}
}

function showDeleteError(button:HTMLButtonElement,message:string){
  const body=button.closest('.admin-feedback-body');
  if(body&&!body.querySelector('.admin-feedback-delete-error'))body.insertAdjacentHTML('beforeend',`<div class="admin-feedback-delete-error">${escapeHTML(message)}</div>`);
}

async function refreshSubmissions(container:HTMLElement,manual=false){
  if(refreshing)return;
  refreshing=true;
  const button=container.querySelector<HTMLButtonElement>('[data-feedback-refresh]');
  if(button){button.disabled=true;button.textContent=manual?'Refreshing…':'Updating…'}
  try{
    const data=await loadSubmissions();
    lastAutomaticRefresh=Date.now();
    if(document.body.contains(container))renderSubmissions(container,data);
  }catch(error){
    console.error(error);
    if(button){button.disabled=false;button.textContent='Refresh now'}
    const existing=container.querySelector('.admin-feedback-error');
    if(!existing){
      const head=container.querySelector('.admin-feedback-head');
      head?.insertAdjacentHTML('afterend','<div class="admin-feedback-error">Feedback and technical reports could not be refreshed. Your session may have expired; sign in again and retry.</div>');
    }
  }finally{refreshing=false}
}

async function mountSubmissions(forceRefresh=false){
  if(!isAdminRoute())return;
  const dashboard=document.querySelector<HTMLElement>('.admin-page[data-litlab-admin-page]');
  if(!dashboard)return;
  let container=dashboard.querySelector<HTMLElement>('#litlab-admin-feedback');
  if(!container){
    container=document.createElement('div');
    container.id='litlab-admin-feedback';
    container.innerHTML='<section class="admin-feedback-shell admin-feedback-loading"><span>FEEDBACK & TECHNICAL REPORTS</span><h2>Loading developer submissions…</h2></section>';
    dashboard.appendChild(container);
    await refreshSubmissions(container);
    return;
  }
  if(forceRefresh||!container.dataset.loaded)await refreshSubmissions(container);
}

function scheduleMount(forceRefresh=false){
  clearTimeout(renderTimer);
  renderTimer=window.setTimeout(()=>void mountSubmissions(forceRefresh),100);
}

const main=document.querySelector('main#main');
if(main)new MutationObserver(()=>scheduleMount(false)).observe(main,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>scheduleMount(true));
window.addEventListener('focus',()=>{if(isAdminRoute()&&Date.now()-lastAutomaticRefresh>5000)scheduleMount(true)});
window.addEventListener('litlab:submission-sent',()=>{if(isAdminRoute())scheduleMount(true)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isAdminRoute()&&Date.now()-lastAutomaticRefresh>5000)scheduleMount(true)});
window.setInterval(()=>{if(document.visibilityState==='visible'&&isAdminRoute())scheduleMount(true)},30000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleMount(true),{once:true});else scheduleMount(true);
