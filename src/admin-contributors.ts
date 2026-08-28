import './admin-contributors.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type ContributorStatus='new'|'reviewing'|'accepted'|'declined'|'completed';
type Application={
  id:string;created_at:string;applicant_type:'student'|'teacher';full_name:string;email:string;school:string|null;country:string|null;
  dp_year:string|null;subject_taught:string|null;cas_intent:string|null;contribution_type:string;topics:string;contribution_idea:string;
  motivation:string;experience:string|null;availability:string|null;cas_goal:string|null;cas_impact:string|null;cas_success:string|null;
  credit_preference:string;source_page:string|null;status:ContributorStatus;
};

let applications:Application[]=[];
let loading=false;

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function headers(){const token=session()?.access_token||'';return {'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,...(token?{Authorization:`Bearer ${token}`}:{})}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function fmtDate(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}
function label(value:string|null|undefined){if(!value)return '—';return value.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:headers(),body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

function stat(labelText:string,value:number,note:string){return `<article><span>${esc(labelText)}</span><strong>${value}</strong><small>${esc(note)}</small></article>`}
function detail(labelText:string,value:unknown,wide=false){const text=String(value??'').trim();if(!text)return '';return `<div class="admin-contrib-detail${wide?' wide':''}"><span>${esc(labelText)}</span><p>${esc(text)}</p></div>`}

function applicationCard(app:Application){
  const role=app.applicant_type==='teacher'?'Teacher':'DP student';
  const cas=app.applicant_type==='student'?label(app.cas_intent):'Not applicable';
  return `<details class="admin-contrib-card" data-app-id="${esc(app.id)}">
    <summary>
      <div class="admin-contrib-person"><span class="admin-contrib-avatar">${esc((app.full_name||'?').trim().charAt(0).toUpperCase())}</span><div><b>${esc(app.full_name)}</b><small>${esc(app.email)}</small></div></div>
      <div class="admin-contrib-summary-meta"><span>${esc(role)}</span><span>${esc(label(app.contribution_type))}</span><span class="status ${esc(app.status)}">${esc(label(app.status))}</span><time>${esc(fmtDate(app.created_at))}</time></div>
      <span class="admin-contrib-chevron">⌄</span>
    </summary>
    <div class="admin-contrib-body">
      <div class="admin-contrib-status-row"><div><span>Application status</span><small>Keep your review workflow organised.</small></div><select data-contributor-status data-id="${esc(app.id)}" aria-label="Application status for ${esc(app.full_name)}">
        ${(['new','reviewing','accepted','declined','completed'] as ContributorStatus[]).map(s=>`<option value="${s}"${app.status===s?' selected':''}>${esc(label(s))}</option>`).join('')}
      </select><span class="admin-contrib-save-state" role="status"></span></div>
      <div class="admin-contrib-detail-grid">
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

function filtered(){
  const root=document.getElementById('admin-contributors-section');
  const q=(root?.querySelector<HTMLInputElement>('[data-contrib-search]')?.value||'').trim().toLowerCase();
  const roleValue=root?.querySelector<HTMLSelectElement>('[data-contrib-role-filter]')?.value||'all';
  const statusValue=root?.querySelector<HTMLSelectElement>('[data-contrib-status-filter]')?.value||'all';
  return applications.filter(app=>{
    const hay=[app.full_name,app.email,app.school,app.country,app.topics,app.contribution_idea,app.motivation,app.subject_taught,app.dp_year,app.cas_intent].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(roleValue==='all'||app.applicant_type===roleValue)&&(statusValue==='all'||app.status===statusValue);
  });
}

function renderList(){
  const root=document.getElementById('admin-contributors-section');
  const list=root?.querySelector<HTMLElement>('[data-contrib-list]');
  if(!list)return;
  const rows=filtered();
  list.innerHTML=rows.length?rows.map(applicationCard).join(''):'<div class="admin-contrib-empty">No contributor applications match these filters.</div>';
  root?.querySelector<HTMLElement>('[data-contrib-result-count]')?.replaceChildren(document.createTextNode(`${rows.length} shown`));
  list.querySelectorAll<HTMLSelectElement>('[data-contributor-status]').forEach(select=>select.addEventListener('change',()=>void updateStatus(select)));
}

function renderSection(host:HTMLElement){
  const total=applications.length;
  const students=applications.filter(a=>a.applicant_type==='student').length;
  const teachers=applications.filter(a=>a.applicant_type==='teacher').length;
  const cas=applications.filter(a=>a.applicant_type==='student'&&(a.cas_intent==='yes'||a.cas_intent==='maybe')).length;
  const fresh=applications.filter(a=>a.status==='new').length;
  const section=document.createElement('section');
  section.id='admin-contributors-section';
  section.className='admin-contributors-section';
  section.innerHTML=`<header class="admin-contrib-head"><div><span>CONTRIBUTOR PROGRAM</span><h2>Contributor applications</h2><p>Review DP student and teacher applications, CAS planning information, proposed contributions and contact details.</p></div><button type="button" data-contrib-refresh>Refresh applications</button></header>
    <div class="admin-contrib-stats">${stat('Total applications',total,'All submitted applications')}${stat('New',fresh,'Waiting for first review')}${stat('DP students',students,'Student contributor applicants')}${stat('Teachers',teachers,'Teacher reviewers / mentors')}${stat('CAS interest',cas,'Yes or maybe')}</div>
    <div class="admin-contrib-toolbar"><label><span>Search</span><input data-contrib-search type="search" placeholder="Name, email, school, topic…"/></label><label><span>Role</span><select data-contrib-role-filter><option value="all">All roles</option><option value="student">DP students</option><option value="teacher">Teachers</option></select></label><label><span>Status</span><select data-contrib-status-filter><option value="all">All statuses</option><option value="new">New</option><option value="reviewing">Reviewing</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="completed">Completed</option></select></label><small data-contrib-result-count>${total} shown</small></div>
    <div class="admin-contrib-list" data-contrib-list></div>`;
  host.appendChild(section);
  section.querySelector<HTMLButtonElement>('[data-contrib-refresh]')?.addEventListener('click',()=>void loadApplications(true));
  section.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-contrib-search],[data-contrib-role-filter],[data-contrib-status-filter]').forEach(control=>control.addEventListener(control instanceof HTMLInputElement?'input':'change',renderList));
  renderList();
}

async function updateStatus(select:HTMLSelectElement){
  const id=select.dataset.id||'';
  const status=select.value as ContributorStatus;
  const state=select.parentElement?.querySelector<HTMLElement>('.admin-contrib-save-state');
  select.disabled=true;if(state)state.textContent='Saving…';
  try{
    const updated=await rpc<Application>('set_litlab_contributor_application_status',{p_id:id,p_status:status});
    applications=applications.map(app=>app.id===id?updated:app);
    if(state){state.textContent='Saved';state.dataset.state='ok'}
    window.setTimeout(()=>{if(state)state.textContent=''},1600);
  }catch(error){
    console.error(error);
    if(state){state.textContent='Could not save';state.dataset.state='error'}
  }finally{select.disabled=false}
}

async function loadApplications(force=false){
  if(route()!=='admin'||loading)return;
  const dashboard=document.querySelector<HTMLElement>('.admin-page[data-litlab-admin-page]');
  if(!dashboard)return;
  if(!force&&document.getElementById('admin-contributors-section'))return;
  loading=true;
  document.getElementById('admin-contributors-section')?.remove();
  const loadingSection=document.createElement('section');
  loadingSection.id='admin-contributors-section';loadingSection.className='admin-contributors-section admin-contrib-loading';
  loadingSection.innerHTML='<span>CONTRIBUTOR PROGRAM</span><h2>Loading contributor applications…</h2>';
  dashboard.appendChild(loadingSection);
  try{
    applications=await rpc<Application[]>('get_litlab_contributor_applications')||[];
    loadingSection.remove();
    const latest=document.querySelector<HTMLElement>('.admin-page[data-litlab-admin-page]');
    if(latest)renderSection(latest);
  }catch(error){
    console.error(error);
    loadingSection.innerHTML='<span>CONTRIBUTOR PROGRAM</span><h2>Contributor applications could not load.</h2><p>This section is available only to approved LitLab developers.</p>';
  }finally{loading=false}
}

function schedule(){if(route()!=='admin')return;window.setTimeout(()=>void loadApplications(),120)}
const main=document.querySelector('main#main');
if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
schedule();
