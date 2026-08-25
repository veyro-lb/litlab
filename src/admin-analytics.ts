import './admin-analytics.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const VISITOR_SESSION_KEY='litlabVisitorSessionId';

type StoredSession={access_token:string;refresh_token?:string;expires_at?:number;token_type?:string};
type Totals={users:number;new_users_7d:number;new_users_30d:number;users_signed_in_24h:number;online_now:number;visitors_24h:number;visitors_7d:number;views_24h:number;views_7d:number};
type RecentUser={display_name:string;email:string|null;provider:string;created_at:string;last_sign_in_at:string|null;last_seen_at:string|null};
type GrowthPoint={date:string;users:number};
type PagePoint={page:string;views:number;visitors:number};
type ProviderPoint={provider:string;users:number};
type Analytics={generated_at:string;totals:Totals;recent_users:RecentUser[];growth:GrowthPoint[];top_pages:PagePoint[];providers:ProviderPoint[]};

let adminAccess:boolean|null=null;
let adminRenderScheduled=false;

function readSession():StoredSession|null{
  try{const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return value&&typeof value.access_token==='string'?value:null}catch{return null}
}

function visitorSessionId(){
  let value=localStorage.getItem(VISITOR_SESSION_KEY);
  if(value&&value.length>=16)return value;
  value=typeof crypto?.randomUUID==='function'?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(VISITOR_SESSION_KEY,value);
  return value;
}

function currentPage(){
  const raw=location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim();
  return raw||'home';
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

async function trackView(){
  try{await rpc<void>('track_litlab_page_view',{p_session_id:visitorSessionId(),p_page:currentPage()})}catch{}
}

async function touchSession(){
  try{await rpc<void>('touch_litlab_session',{p_session_id:visitorSessionId(),p_page:currentPage()})}catch{}
}

async function checkAdmin(force=false){
  if(!readSession()){adminAccess=false;return false}
  if(adminAccess!==null&&!force)return adminAccess;
  try{adminAccess=Boolean(await rpc<boolean>('is_litlab_admin'));return adminAccess}catch{adminAccess=false;return false}
}

function escapeHTML(value:unknown){
  return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
}

function fmt(value?:string|null){
  if(!value)return '—';
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '—';
  return date.toLocaleString([], {month:'short',day:'numeric',year:date.getFullYear()!==new Date().getFullYear()?'numeric':undefined,hour:'2-digit',minute:'2-digit'});
}

function pageLabel(page:string){
  const labels:Record<string,string>={'home':'Home','start':'Start Here','papers':'Papers','paper-1':'Paper 1','paper-2':'Paper 2','io':'IO','ee':'Extended Essay','books':'Books','skills':'Skills Lab','toolkit':'Toolkit','glossary':'Glossary','about':'About'};
  return labels[page]||page.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
}

function renderAccessState(main:HTMLElement,kind:'signin'|'denied'|'loading'){
  const copy=kind==='signin'
    ?'<h1>Developer sign-in required.</h1><p>Sign in with an approved LitLab developer Google account, then return to this page.</p>'
    :kind==='denied'
      ?'<h1>Developer access only.</h1><p>This account can use LitLab normally, but it is not on the developer analytics allowlist.</p>'
      :'<h1>Opening developer analytics…</h1><p>Checking your LitLab developer access and loading current metrics.</p>';
  main.innerHTML=`<section class="admin-gate" data-litlab-admin-page><div class="admin-gate-card"><span class="admin-kicker">LITLAB • INTERNAL</span>${copy}<button type="button" data-admin-home>Back to LitLab</button></div></section>`;
  main.querySelector<HTMLButtonElement>('[data-admin-home]')?.addEventListener('click',()=>{location.hash='home'});
}

function metricCard(label:string,value:number|string,note:string){
  return `<article class="admin-metric"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong><small>${escapeHTML(note)}</small></article>`;
}

function growthChart(points:GrowthPoint[]){
  const max=Math.max(1,...points.map(point=>Number(point.users)||0));
  return `<div class="admin-growth-chart">${points.map(point=>{
    const value=Number(point.users)||0;
    const date=new Date(`${point.date}T00:00:00`);
    const label=Number.isNaN(date.getTime())?point.date:date.toLocaleDateString([],{month:'short',day:'numeric'});
    const height=value?Math.max(10,Math.round(value/max*100)):3;
    return `<div class="admin-growth-bar" title="${escapeHTML(label)}: ${value} new user${value===1?'':'s'}"><i style="height:${height}%"></i><b>${value}</b><span>${escapeHTML(label)}</span></div>`;
  }).join('')}</div>`;
}

function topPages(rows:PagePoint[]){
  if(!rows.length)return '<div class="admin-empty">Page tracking starts from this deployment onward.</div>';
  const max=Math.max(1,...rows.map(row=>Number(row.views)||0));
  return `<div class="admin-page-list">${rows.map(row=>`<article><div><b>${escapeHTML(pageLabel(row.page))}</b><span>${Number(row.visitors)||0} visitor${Number(row.visitors)===1?'':'s'}</span></div><div class="admin-page-track"><i style="width:${Math.max(4,Math.round((Number(row.views)||0)/max*100))}%"></i></div><strong>${Number(row.views)||0}</strong></article>`).join('')}</div>`;
}

function recentUsers(rows:RecentUser[]){
  if(!rows.length)return '<div class="admin-empty">No signed-up users yet.</div>';
  return `<div class="admin-user-table-wrap"><table class="admin-user-table"><thead><tr><th>User</th><th>Provider</th><th>Joined</th><th>Last Google sign-in</th><th>Last seen in LitLab</th></tr></thead><tbody>${rows.map(user=>`<tr><td><b>${escapeHTML(user.display_name||'Student')}</b><small>${escapeHTML(user.email||'No email available')}</small></td><td><span class="admin-provider">${escapeHTML(user.provider||'unknown')}</span></td><td>${escapeHTML(fmt(user.created_at))}</td><td>${escapeHTML(fmt(user.last_sign_in_at))}</td><td>${escapeHTML(fmt(user.last_seen_at))}</td></tr>`).join('')}</tbody></table></div>`;
}

function providers(rows:ProviderPoint[]){
  if(!rows.length)return '<div class="admin-empty">No auth provider data yet.</div>';
  return `<div class="admin-provider-list">${rows.map(row=>`<div><span>${escapeHTML((row.provider||'unknown').toUpperCase())}</span><b>${Number(row.users)||0} user${Number(row.users)===1?'':'s'}</b></div>`).join('')}</div>`;
}

function renderDashboard(main:HTMLElement,data:Analytics){
  const t=data.totals;
  main.innerHTML=`<section class="admin-page" data-litlab-admin-page>
    <header class="admin-hero">
      <div><span class="admin-kicker">LITLAB • DEVELOPER ANALYTICS</span><h1>What is happening inside LitLab?</h1><p>Private operational analytics for the LitLab developers. Student passwords are never available here.</p></div>
      <div class="admin-hero-actions"><button type="button" data-admin-refresh>Refresh data</button><button type="button" class="quiet" data-admin-home>Back to site</button></div>
    </header>
    <div class="admin-freshness">Updated ${escapeHTML(fmt(data.generated_at))} <span>•</span> “Online now” means active within roughly 5 minutes.</div>
    <section class="admin-metrics">
      ${metricCard('Total accounts',t.users,'Google-authenticated LitLab accounts')}
      ${metricCard('New • 7 days',t.new_users_7d,'Accounts created in the last week')}
      ${metricCard('Signed in • 24h',t.users_signed_in_24h,'Accounts with a recent Google sign-in')}
      ${metricCard('Online now',t.online_now,'Tracked sessions active in ~5 min')}
      ${metricCard('Visitors • 24h',t.visitors_24h,'Unique browser sessions seen today')}
      ${metricCard('Page views • 7d',t.views_7d,'Tracked LitLab page opens this week')}
    </section>
    <section class="admin-grid two">
      <article class="admin-panel"><header><div><span>ACCOUNT GROWTH</span><h2>New users • 14 days</h2></div><strong>${t.new_users_30d}<small> new / 30d</small></strong></header>${growthChart(data.growth||[])}</article>
      <article class="admin-panel"><header><div><span>TRAFFIC</span><h2>Most-used pages • 30 days</h2></div><strong>${t.visitors_7d}<small> visitors / 7d</small></strong></header>${topPages(data.top_pages||[])}</article>
    </section>
    <section class="admin-grid side">
      <article class="admin-panel admin-users"><header><div><span>MEMBERS</span><h2>Recent LitLab accounts</h2></div><strong>${t.users}<small> total</small></strong></header>${recentUsers(data.recent_users||[])}</article>
      <aside class="admin-panel"><header><div><span>AUTH</span><h2>Sign-in providers</h2></div></header>${providers(data.providers||[])}<div class="admin-privacy"><b>What this page does not collect</b><p>No Google passwords, Gmail messages, Drive files, precise location, or browsing outside LitLab. Visitor tracking is a random LitLab browser-session ID plus page and timestamp.</p></div></aside>
    </section>
  </section>`;
  main.querySelector<HTMLButtonElement>('[data-admin-home]')?.addEventListener('click',()=>{location.hash='home'});
  main.querySelector<HTMLButtonElement>('[data-admin-refresh]')?.addEventListener('click',()=>void loadDashboard(true));
}

async function loadDashboard(forceAccess=false){
  if(currentPage()!=='admin')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main)return;
  renderAccessState(main,'loading');
  if(!readSession()){renderAccessState(main,'signin');return}
  if(!(await checkAdmin(forceAccess))){renderAccessState(main,'denied');return}
  try{
    const data=await rpc<Analytics>('get_litlab_admin_analytics');
    renderDashboard(main,data);
  }catch{
    main.innerHTML='<section class="admin-gate" data-litlab-admin-page><div class="admin-gate-card"><span class="admin-kicker">LITLAB • INTERNAL</span><h1>Analytics could not load.</h1><p>Your developer access is valid, but the dashboard request failed. Reload LitLab and try again.</p><button type="button" data-admin-retry>Try again</button></div></section>';
    main.querySelector<HTMLButtonElement>('[data-admin-retry]')?.addEventListener('click',()=>void loadDashboard(true));
  }
}

function scheduleAdminRender(){
  if(currentPage()!=='admin'||adminRenderScheduled)return;
  adminRenderScheduled=true;
  setTimeout(()=>{adminRenderScheduled=false;if(currentPage()==='admin'&&!document.querySelector('[data-litlab-admin-page]'))void loadDashboard()},90);
}

async function injectAdminMenuEntry(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu||menu.querySelector('[data-open-admin-analytics]'))return;
  if(!(await checkAdmin()))return;
  if(!document.body.contains(menu))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-admin-menu-entry';
  button.dataset.openAdminAnalytics='true';
  button.innerHTML='<span>▥</span><div><b>Developer analytics</b><small>Users, activity & growth</small></div><i>›</i>';
  button.addEventListener('click',event=>{event.stopPropagation();location.hash='admin'});
  const signout=menu.querySelector('.litlab-signout');
  if(signout)menu.insertBefore(button,signout);else menu.append(button);
}

const main=document.querySelector('main#main');
if(main)new MutationObserver(scheduleAdminRender).observe(main,{childList:true,subtree:false});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('.litlab-account-trigger'))setTimeout(()=>void injectAdminMenuEntry(),40);
},true);

window.addEventListener('hashchange',()=>{
  void trackView();
  scheduleAdminRender();
});

void trackView();
setInterval(()=>void touchSession(),60000);
setTimeout(()=>void injectAdminMenuEntry(),700);
scheduleAdminRender();
