import './admin-feedback.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token:string};
type FeedbackItem={
  id:string;
  created_at:string;
  respondent_role:string;
  school:string|null;
  section:string;
  rating:number;
  useful:string|null;
  improve:string|null;
  unclear:string|null;
  feature_request:string|null;
  recommend:string|null;
  source_page:string|null;
};
type FeedbackData={
  generated_at:string;
  total:number;
  new_7d:number;
  average_rating:number;
  recommend:{yes:number;maybe:number;no:number};
  items:FeedbackItem[];
};

let renderTimer=0;

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
    method:'POST',
    headers:authHeaders({'Content-Type':'application/json',Accept:'application/json'}),
    body:JSON.stringify(body)
  });
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

async function loadFeedback():Promise<FeedbackData>{
  return await rpc<FeedbackData>('get_litlab_admin_feedback');
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
  const labels:Record<string,string>={
    student:'Student',teacher:'Teacher','ib-coordinator':'IB Coordinator','cas-coordinator':'CAS Coordinator',parent:'Parent',other:'Other'
  };
  return labels[value]||value;
}

function recommendLabel(value:string|null){
  if(value==='yes')return 'Would recommend';
  if(value==='maybe')return 'Maybe recommend';
  if(value==='no')return 'Would not recommend';
  return 'No recommendation response';
}

function commentBlock(label:string,value:string|null){
  if(!value)return '';
  return `<div class="admin-feedback-comment"><span>${escapeHTML(label)}</span><p>${escapeHTML(value)}</p></div>`;
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

function renderFeedback(container:HTMLElement,data:FeedbackData){
  const sections=Array.from(new Set((data.items||[]).map(item=>item.section).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  container.innerHTML=`
    <section class="admin-feedback-shell">
      <header class="admin-feedback-head">
        <div><span>STUDENT & TEACHER VOICE</span><h2>LitLab feedback</h2><p>Private submissions from the public feedback form. Only approved LitLab developer accounts can load or delete this data.</p></div>
        <button type="button" data-feedback-refresh>Refresh feedback</button>
      </header>
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
      <div class="admin-feedback-list" data-feedback-list>
        ${(data.items||[]).length?(data.items||[]).map(feedbackCard).join(''):'<div class="admin-feedback-empty"><b>No feedback yet.</b><span>New submissions from the LitLab feedback button will appear here.</span></div>'}
      </div>
    </section>`;

  container.querySelector<HTMLButtonElement>('[data-feedback-refresh]')?.addEventListener('click',()=>void refreshFeedback(container));
  container.querySelector<HTMLInputElement>('[data-feedback-search]')?.addEventListener('input',()=>filterFeedback(container));
  container.querySelector<HTMLSelectElement>('[data-feedback-section]')?.addEventListener('change',()=>filterFeedback(container));
  container.querySelector<HTMLSelectElement>('[data-feedback-rating]')?.addEventListener('change',()=>filterFeedback(container));
  container.querySelectorAll<HTMLButtonElement>('[data-feedback-delete]').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    void deleteFeedback(container,button);
  }));
}

function filterFeedback(container:HTMLElement){
  const query=(container.querySelector<HTMLInputElement>('[data-feedback-search]')?.value||'').trim().toLowerCase();
  const section=container.querySelector<HTMLSelectElement>('[data-feedback-section]')?.value||'';
  const rating=container.querySelector<HTMLSelectElement>('[data-feedback-rating]')?.value||'';
  let visible=0;
  container.querySelectorAll<HTMLElement>('[data-feedback-item]').forEach(item=>{
    const matchesQuery=!query||(item.dataset.search||'').includes(query);
    const matchesSection=!section||item.dataset.section===section;
    const matchesRating=!rating||item.dataset.rating===rating;
    const show=matchesQuery&&matchesSection&&matchesRating;
    item.hidden=!show;
    if(show)visible++;
  });
  const count=container.querySelector<HTMLElement>('[data-feedback-count]');
  if(count)count.textContent=`${visible} response${visible===1?'':'s'} shown`;
}

async function deleteFeedback(container:HTMLElement,button:HTMLButtonElement){
  const id=button.dataset.feedbackDelete||'';
  if(!id)return;
  const item=button.closest<HTMLElement>('[data-feedback-item]');
  const school=item?.querySelector<HTMLElement>('.admin-feedback-who b')?.textContent||'this response';
  if(!confirm(`Delete feedback from ${school}? This cannot be undone.`))return;

  const oldText=button.textContent||'Delete feedback';
  button.disabled=true;
  button.textContent='Deleting…';
  try{
    const deleted=await rpc<boolean>('delete_litlab_admin_feedback',{p_feedback_id:id});
    if(!deleted)throw new Error('Feedback was not found');
    await refreshFeedback(container);
  }catch(error){
    console.error(error);
    button.disabled=false;
    button.textContent=oldText;
    const body=button.closest('.admin-feedback-body');
    if(body&&!body.querySelector('.admin-feedback-delete-error')){
      body.insertAdjacentHTML('beforeend','<div class="admin-feedback-delete-error">Could not delete this feedback. Refresh the dashboard and try again.</div>');
    }
  }
}

async function refreshFeedback(container:HTMLElement){
  const button=container.querySelector<HTMLButtonElement>('[data-feedback-refresh]');
  if(button){button.disabled=true;button.textContent='Refreshing…'}
  try{
    const data=await loadFeedback();
    renderFeedback(container,data);
  }catch{
    if(button){button.disabled=false;button.textContent='Refresh feedback'}
    const existing=container.querySelector('.admin-feedback-error');
    if(!existing){
      const head=container.querySelector('.admin-feedback-head');
      head?.insertAdjacentHTML('afterend','<div class="admin-feedback-error">Feedback could not be refreshed. Your session may have expired; sign in again and retry.</div>');
    }
  }
}

async function mountFeedback(){
  if(location.hash.replace(/^#/,'').split('?')[0]!=='admin')return;
  const dashboard=document.querySelector<HTMLElement>('.admin-page[data-litlab-admin-page]');
  if(!dashboard||dashboard.querySelector('#litlab-admin-feedback'))return;
  const container=document.createElement('div');
  container.id='litlab-admin-feedback';
  container.innerHTML='<section class="admin-feedback-shell admin-feedback-loading"><span>FEEDBACK</span><h2>Loading LitLab feedback…</h2></section>';
  dashboard.appendChild(container);
  try{
    const data=await loadFeedback();
    if(document.body.contains(container))renderFeedback(container,data);
  }catch{
    if(document.body.contains(container))container.innerHTML='<section class="admin-feedback-shell"><div class="admin-feedback-empty"><b>Feedback could not load.</b><span>This section is available only to approved developer accounts with an active LitLab sign-in.</span><button type="button" data-feedback-retry>Try again</button></div></section>';
    container.querySelector<HTMLButtonElement>('[data-feedback-retry]')?.addEventListener('click',()=>void refreshFeedback(container));
  }
}

function scheduleMount(){
  clearTimeout(renderTimer);
  renderTimer=window.setTimeout(()=>void mountFeedback(),100);
}

const main=document.querySelector('main#main');
if(main)new MutationObserver(scheduleMount).observe(main,{childList:true,subtree:true});
window.addEventListener('hashchange',scheduleMount);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleMount,{once:true});else scheduleMount();
