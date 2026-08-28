import './admin-analytics.css';
import './admin-contributors.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const AUTO_REFRESH_MS=25_000;

type StoredSession={access_token?:string};
type ContributorStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Application={
  id:string;created_at:string;status_updated_at?:string|null;applicant_type:'student'|'teacher';full_name:string;email:string;school:string|null;country:string|null;
  dp_year:string|null;subject_taught:string|null;cas_intent:string|null;student_supervision:string|null;mentor_email:string|null;mentee_email:string|null;
  contribution_type:string;topics:string;contribution_idea:string;motivation:string;experience:string|null;availability:string|null;
  cas_goal:string|null;cas_impact:string|null;cas_success:string|null;credit_preference:string;source_page:string|null;status:ContributorStatus;
};

let applications:Application[]=[];
let loading=false;
let refreshing=false;
let adminAccess:boolean|null=null;
let renderScheduled=false;
let refreshTimer=0;
let dataSignature='';

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function headers(){const token=session()?.access_token||'';return {'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,...(token?{Authorization:`Bearer ${token}`}:{})}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function fmtDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}
function label(value:string|null|undefined){if(!value)return '—';return value.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}
function statusLabel(value:ContributorStatus){return ({new:'Pending',reviewing:'Needs review',accepted:'Accepted',declined:'Rejected',completed:'Completed'} as const)[value]}
function supervisionLabel(value:string|null){return value==='yes'?'Yes — mentor/coordinator assigned':value==='not_yet'?'Not yet — plans to arrange one':value==='no'?'No — not currently':'—'}
function signature(rows:Application[]){return rows.map(app=>`${app.id}:${app.status}:${app.status_updated_at||app.created_at}:${app.full_name}:${app.topics}`).join('|')}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  if(!navigator.onLine)throw new Error('offline');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:headers(),body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();
    return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

async function checkAdmin(force=false){
  if(!session()?.access_token){adminAccess=false;return false}
  if(adminAccess!==null&&!force)return adminAccess;
  try{adminAccess=Boolean(await rpc<boolean>('is_litlab_admin'));return adminAccess}catch{adminAccess=false;return false}
}

function stat(labelText:string,value:number,note:string,key:string){return `<article data-contrib-stat="${esc(key)}"><span>${esc(labelText)}</span><strong>${value}</strong><small>${esc(note)}</small></article>`}
function detail(labelText:string,value:unknown,wide=false){const text=String(value??'').trim();if(!text)return '';return `<div class="admin-contrib-detail${wide?' wide':''}"><span>${esc(labelText)}</span><p>${esc(text)}</p></div>`}

function applicationCard(app:Application){
  const role=app.applicant_type==='teacher'?'Teacher':'DP student';
  const cas=app.applicant_type==='student'?label(app.cas_intent):'Not applicable';
  const relationship=app.applicant_type==='student'
    ?`${detail('Mentor / coordinator oversight',supervisionLabel(app.student_supervision))}${app.mentor_email?detail('Mentor / coordinator email',app.mentor_email):''}`
    :app.mentee_email?detail('Student being mentored — email',app.mentee_email):'';
  const chatTitle=`${app.full_name} — ${app.topics||'Contributor conversation'}`;

  return `<details class="admin-contrib-card" data-app-id="${esc(app.id)}">
    <summary>
      <div class="admin-contrib-person"><span class="admin-contrib-avatar">${esc((app.full_name||'?').trim().charAt(0).toUpperCase())}</span><div><b>${esc(app.full_name)}</b><small>${esc(app.email)}</small></div></div>
      <div class="admin-contrib-summary-meta"><span>${esc(role)}</span><span>${esc(label(app.contribution_type))}</span><span class="status ${esc(app.status)}">${esc(statusLabel(app.status))}</span><time>${esc(fmtDate(app.created_at))}</time></div>
      <span class="admin-contrib-chevron">⌄</span>
    </summary>
    <div class="admin-contrib-body">
      <div class="admin-contrib-status-row"><div><span>Application status</span><small>Update the application as you review and work with the contributor.</small></div><select data-contributor-status data-id="${esc(app.id)}" aria-label="Application status for ${esc(app.full_name)}">
        ${(['new','reviewing','accepted','declined','completed'] as ContributorStatus[]).map(s=>`<option value="${s}"${app.status===s?' selected':''}>${esc(statusLabel(s))}</option>`).join('')}
      </select><span class="admin-contrib-save-state" role="status"></span></div>
      <small class="admin-contrib-notify-note">Status changes are saved to the applicant’s LitLab account and can appear as an in-site notification while they are signed in.</small>
      <div class="admin-contrib-chat-strip"><div><span>PRIVATE CHAT</span><p>Message ${esc(app.full_name)} about feedback, revisions or next steps.</p></div><button type="button" data-admin-contrib-chat-open data-chat-open data-chat-mode="admin" data-application-id="${esc(app.id)}" data-chat-title="${esc(chatTitle)}">Open live chat</button></div>
      <div class="admin-contrib-detail-grid">
        ${relationship}
        ${detail('Applicant type',role)}${detail('Email',app.email)}${detail('School',app.school)}${detail('Country',app.country)}
        ${app.applicant_type==='student'?detail('DP year',label(app.dp_year)):detail('Subject / teaching role',app.subject_taught)}
        ${detail('CAS intent',cas)}${detail('Contribution type',label(app.contribution_type))}${detail('Credit preference',label(app.credit_preference))}
        ${detail('Topics / areas',app.topics,true)}${detail('What they want to contribute',app.contribution_idea,true)}${detail('Motivation',app.motivation,true)}
        ${detail('Strengths / experience',app.experience,true)}${detail('Availability',app.availability,true)}
        ${app.applicant_type==='student'?`${detail('CAS goal',app.cas_goal,true)}${detail('Who could benefit / impact',app.cas_impact,true)}${detail('Success criteria',app.cas_success,true)}`:''}
        ${detail('Source page',app.source_page,true)}
      </div>
    </div>
  </details>`;
}

function filtered(root:HTMLElement){
  const q=(root.querySelector<HTMLInputElement>('[data-contrib-search]')?.value||'').trim().toLowerCase();
  const roleValue=root.querySelector<HTMLSelectElement>('[data-contrib-role-filter]')?.value||'all';
  const statusValue=root.querySelector<HTMLSelectElement>('[data-contrib-status-filter]')?.value||'all';
  return applications.filter(app=>{
    const hay=[app.full_name,app.email,app.school,app.country,app.topics,app.contribution_idea,app.motivation,app.subject_taught,app.dp_year,app.cas_intent,app.contribution_type,app.mentor_email,app.mentee_email].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(roleValue==='all'||app.applicant_type===roleValue)&&(statusValue==='all'||app.status===statusValue);
  });
}

function renderList(root:HTMLElement){
  const list=root.querySelector<HTMLElement>('[data-contrib-list]');
  if(!list)return;
  const openIds=new Set(Array.from(list.querySelectorAll<HTMLDetailsElement>('details[open][data-app-id]')).map(card=>card.dataset.appId||''));
  const rows=filtered(root);
  const next=rows.length?rows.map(applicationCard).join(''):'<div class="admin-contrib-empty">No contributor applications match these filters.</div>';
  if(list.dataset.renderKey!==next){list.dataset.renderKey=next;list.innerHTML=next}
  list.querySelectorAll<HTMLDetailsElement>('details[data-app-id]').forEach(card=>{if(openIds.has(card.dataset.appId||''))card.open=true});
  root.querySelector<HTMLElement>('[data-contrib-result-count]')?.replaceChildren(document.createTextNode(`${rows.length} shown`));
}

function stats(){
  return {
    total:applications.length,
    fresh:applications.filter(a=>a.status==='new').length,
    students:applications.filter(a=>a.applicant_type==='student').length,
    teachers:applications.filter(a=>a.applicant_type==='teacher').length,
    cas:applications.filter(a=>a.applicant_type==='student'&&(a.cas_intent==='yes'||a.cas_intent==='maybe')).length
  };
}

function updateStats(root:HTMLElement){
  const values=stats();
  (Object.keys(values) as Array<keyof typeof values>).forEach(key=>{
    const strong=root.querySelector<HTMLElement>(`[data-contrib-stat="${key}"] strong`);
    if(strong)strong.textContent=String(values[key]);
  });
}

function renderAccessState(main:HTMLElement,kind:'loading'|'signin'|'denied'|'error'){
  const copy=kind==='loading'
    ?'<h1>Opening contributor dashboard…</h1><p>Checking developer access and loading applications.</p>'
    :kind==='signin'
      ?'<h1>Developer sign-in required.</h1><p>Sign in with an approved LitLab developer account to review contributor applications.</p>'
      :kind==='denied'
        ?'<h1>Developer access only.</h1><p>This account can use LitLab normally, but it cannot access contributor applications.</p>'
        :'<h1>Contributor dashboard could not load.</h1><p>Your developer session may need to be refreshed. Try again or return to Developer Analytics.</p>';
  main.innerHTML=`<section class="admin-gate" data-litlab-admin-contributors-page><div class="admin-gate-card"><span class="admin-kicker">LITLAB • CONTRIBUTORS</span>${copy}<div class="admin-contrib-gate-actions"><button type="button" data-admin-contrib-retry>${kind==='error'?'Try again':'Back to LitLab'}</button>${kind==='error'?'<button type="button" class="quiet" data-admin-contrib-analytics>Developer analytics</button>':''}</div></div></section>`;
  main.querySelector<HTMLButtonElement>('[data-admin-contrib-retry]')?.addEventListener('click',()=>{if(kind==='error')void loadPage(true);else location.hash='home'});
  main.querySelector<HTMLButtonElement>('[data-admin-contrib-analytics]')?.addEventListener('click',()=>{location.hash='admin'});
}

function renderPage(main:HTMLElement){
  const values=stats();
  main.innerHTML=`<section class="admin-page admin-contributors-page" data-litlab-admin-contributors-page>
    <header class="admin-hero admin-contrib-page-hero">
      <div><span class="admin-kicker">LITLAB • CONTRIBUTOR DASHBOARD</span><h1>Manage the people helping LitLab grow.</h1><p>Developer-only workspace for reviewing DP student contributors and teacher reviewers, including CAS planning details and proposed academic contributions.</p></div>
      <div class="admin-hero-actions"><button type="button" data-contrib-refresh>Refresh applications</button><button type="button" class="quiet" data-contrib-analytics>Developer analytics</button><button type="button" class="quiet" data-contrib-home>Back to site</button></div>
    </header>
    <section class="admin-contrib-stats">${stat('Total applications',values.total,'All submitted applications','total')}${stat('Pending',values.fresh,'Waiting for first review','fresh')}${stat('DP students',values.students,'Student contributor applicants','students')}${stat('Teachers',values.teachers,'Teacher reviewers / mentors','teachers')}${stat('CAS interest',values.cas,'Yes or maybe','cas')}</section>
    <section class="admin-panel admin-contrib-workspace">
      <header class="admin-contrib-head"><div><span>APPLICATIONS</span><h2>Contributor applications</h2><p>Search applications, inspect every submitted answer and move each person through your review workflow.</p></div><small data-contrib-result-count>${values.total} shown</small></header>
      <div class="admin-contrib-toolbar"><label><span>Search</span><input data-contrib-search type="search" placeholder="Name, email, school, topic…"/></label><label><span>Role</span><select data-contrib-role-filter><option value="all">All roles</option><option value="student">DP students</option><option value="teacher">Teachers</option></select></label><label><span>Status</span><select data-contrib-status-filter><option value="all">All statuses</option><option value="new">Pending</option><option value="reviewing">Needs review</option><option value="accepted">Accepted</option><option value="declined">Rejected</option><option value="completed">Completed</option></select></label></div>
      <div class="admin-contrib-list" data-contrib-list></div>
    </section>
  </section>`;
  const page=main.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]')!;
  main.querySelector<HTMLButtonElement>('[data-contrib-refresh]')?.addEventListener('click',()=>void refreshApplications(true));
  main.querySelector<HTMLButtonElement>('[data-contrib-analytics]')?.addEventListener('click',()=>{location.hash='admin'});
  main.querySelector<HTMLButtonElement>('[data-contrib-home]')?.addEventListener('click',()=>{location.hash='home'});
  page.addEventListener('input',event=>{if((event.target as Element|null)?.matches?.('[data-contrib-search]'))renderList(page)});
  page.addEventListener('change',event=>{
    const target=event.target;
    if(!(target instanceof HTMLSelectElement))return;
    if(target.matches('[data-contrib-role-filter],[data-contrib-status-filter]'))renderList(page);
    else if(target.matches('[data-contributor-status]'))void updateStatus(target);
  });
  renderList(page);
}

async function updateStatus(select:HTMLSelectElement){
  const id=select.dataset.id||'';
  const status=select.value as ContributorStatus;
  const state=select.parentElement?.querySelector<HTMLElement>('.admin-contrib-save-state');
  select.disabled=true;if(state){state.textContent='Saving…';state.dataset.state=''}
  try{
    const updated=await rpc<Application>('set_litlab_contributor_application_status',{p_id:id,p_status:status});
    applications=applications.map(app=>app.id===id?updated:app);
    dataSignature=signature(applications);
    const card=select.closest<HTMLElement>('.admin-contrib-card');
    const badge=card?.querySelector<HTMLElement>('.admin-contrib-summary-meta .status');
    if(badge){badge.className=`status ${updated.status}`;badge.textContent=statusLabel(updated.status)}
    const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');
    if(page)updateStats(page);
    if(state){state.textContent='Saved';state.dataset.state='ok'}
    window.dispatchEvent(new CustomEvent('litlab:contributor-admin-updated',{detail:{id,status:updated.status}}));
    window.setTimeout(()=>{if(state?.isConnected)state.textContent=''},1600);
  }catch(error){
    console.error(error);
    const current=applications.find(app=>app.id===id)?.status;
    if(current)select.value=current;
    if(state){state.textContent=navigator.onLine?'Could not save':'Offline — not saved';state.dataset.state='error'}
  }finally{select.disabled=false}
}

async function refreshApplications(manual=false){
  if(route()!=='admin-contributors'||refreshing||!session()?.access_token)return;
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');
  if(!page)return;
  refreshing=true;
  const button=page.querySelector<HTMLButtonElement>('[data-contrib-refresh]');
  const original=button?.textContent||'Refresh applications';
  if(manual&&button){button.disabled=true;button.textContent='Refreshing…'}
  try{
    const rows=await rpc<Application[]>('get_litlab_contributor_applications');
    if(route()!=='admin-contributors')return;
    const next=Array.isArray(rows)?rows:[];
    const nextSignature=signature(next);
    if(nextSignature!==dataSignature){
      applications=next;
      dataSignature=nextSignature;
      updateStats(page);
      renderList(page);
    }
    if(manual&&button?.isConnected)button.textContent='Up to date';
  }catch(error){
    console.error(error);
    if(manual&&button?.isConnected)button.textContent=navigator.onLine?'Refresh failed':'Offline';
  }finally{
    refreshing=false;
    if(manual&&button?.isConnected)window.setTimeout(()=>{if(button.isConnected){button.disabled=false;button.textContent=original}},1200);
  }
}

async function loadPage(forceAccess=false){
  if(route()!=='admin-contributors'||loading)return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main)return;
  loading=true;
  renderAccessState(main,'loading');
  try{
    if(!session()?.access_token){renderAccessState(main,'signin');return}
    if(!(await checkAdmin(forceAccess))){renderAccessState(main,'denied');return}
    const rows=await rpc<Application[]>('get_litlab_contributor_applications');
    applications=Array.isArray(rows)?rows:[];
    dataSignature=signature(applications);
    if(route()==='admin-contributors')renderPage(main);
  }catch(error){
    console.error(error);
    if(route()==='admin-contributors')renderAccessState(main,'error');
  }finally{loading=false}
}

async function injectMenuEntry(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu||menu.querySelector('[data-open-admin-contributors]'))return;
  if(!(await checkAdmin()))return;
  if(!document.body.contains(menu))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-admin-menu-entry';
  button.dataset.openAdminContributors='true';
  button.innerHTML='<span>✦</span><div><b>Contributor dashboard</b><small>Applications, CAS & reviewers</small></div><i>›</i>';
  button.addEventListener('click',event=>{event.stopPropagation();location.hash='admin-contributors'});
  const analytics=menu.querySelector('[data-open-admin-analytics]');
  const signout=menu.querySelector('.litlab-signout');
  if(analytics?.nextSibling)menu.insertBefore(button,analytics.nextSibling);
  else if(signout)menu.insertBefore(button,signout);
  else menu.append(button);
}

function injectAnalyticsLink(){
  if(route()!=='admin')return;
  const actions=document.querySelector<HTMLElement>('.admin-page[data-litlab-admin-page] .admin-hero-actions');
  if(!actions||actions.querySelector('[data-open-contributors-from-analytics]'))return;
  const button=document.createElement('button');
  button.type='button';button.className='quiet';button.dataset.openContributorsFromAnalytics='true';button.textContent='Contributor dashboard';
  button.addEventListener('click',()=>{location.hash='admin-contributors'});
  actions.insertBefore(button,actions.lastElementChild);
}

function clearRefreshTimer(){window.clearTimeout(refreshTimer);refreshTimer=0}
function scheduleAutoRefresh(delay=AUTO_REFRESH_MS){
  clearRefreshTimer();
  if(route()!=='admin-contributors')return;
  refreshTimer=window.setTimeout(async()=>{
    if(route()==='admin-contributors'&&!document.hidden&&navigator.onLine)await refreshApplications(false);
    if(route()==='admin-contributors')scheduleAutoRefresh();
  },delay);
}

function schedule(){
  if(renderScheduled)return;
  renderScheduled=true;
  window.setTimeout(()=>{
    renderScheduled=false;
    if(route()==='admin-contributors'){
      if(!document.querySelector('[data-litlab-admin-contributors-page]'))void loadPage();
      scheduleAutoRefresh();
    }else clearRefreshTimer();
    injectAnalyticsLink();
  },80);
}

document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('.litlab-account-trigger'))setTimeout(()=>void injectMenuEntry(),40)},true);
window.addEventListener('hashchange',schedule);
window.addEventListener('focus',()=>{if(route()==='admin-contributors'){void refreshApplications(false);scheduleAutoRefresh()}void injectMenuEntry()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearRefreshTimer();return}if(route()==='admin-contributors'){void refreshApplications(false);scheduleAutoRefresh()}});
window.addEventListener('online',()=>{if(route()==='admin-contributors')void refreshApplications(false)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){adminAccess=null;schedule()}});
setTimeout(()=>void injectMenuEntry(),700);
schedule();
