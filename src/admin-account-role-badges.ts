import './admin-account-role-badges.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type AccountRole='student'|'teacher'|'admin'|null;
type RecentUser={account_role?:AccountRole};
type Analytics={recent_users?:RecentUser[]};

let scheduled=false;
let activeTable:HTMLElement|null=null;
let requestId=0;

function token(){
  try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}
}

async function rpc<T>(name:string):Promise<T>{
  const auth=token();
  if(!auth)throw new Error('Sign in required');
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
    body:'{}'
  });
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  return await response.json() as T;
}

function roleMeta(role:AccountRole|undefined){
  if(role==='teacher')return {label:'Teacher / mentor',className:'teacher'};
  if(role==='student')return {label:'Student',className:'student'};
  if(role==='admin')return {label:'Admin',className:'admin'};
  return {label:'Role not selected',className:'unselected'};
}

function addRoleBadges(table:HTMLElement,users:RecentUser[]){
  const heading=table.querySelector<HTMLElement>('thead th:nth-child(2)');
  if(heading)heading.textContent='Provider · account type';

  const rows=Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  rows.forEach((row,index)=>{
    const providerCell=row.children.item(1) as HTMLElement|null;
    if(!providerCell)return;
    providerCell.querySelector('[data-admin-account-role]')?.remove();
    const meta=roleMeta(users[index]?.account_role);
    const badge=document.createElement('span');
    badge.className=`admin-account-role ${meta.className}`;
    badge.dataset.adminAccountRole=meta.className;
    badge.textContent=meta.label;
    badge.title=`LitLab account type: ${meta.label}`;
    providerCell.append(badge);
  });
  table.dataset.accountRolesReady='true';
}

async function decorate(table:HTMLElement){
  const id=++requestId;
  try{
    const data=await rpc<Analytics>('get_litlab_admin_analytics');
    if(id!==requestId||!document.body.contains(table))return;
    addRoleBadges(table,Array.isArray(data.recent_users)?data.recent_users:[]);
  }catch(error){
    console.error('LitLab admin account roles unavailable',error);
  }
}

function scan(){
  scheduled=false;
  if(location.hash.replace(/^#/,'').split('#')[0].split('?')[0]!=='admin'){activeTable=null;return}
  const table=document.querySelector<HTMLElement>('.admin-user-table');
  if(!table||table===activeTable)return;
  activeTable=table;
  void decorate(table);
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(scan);
}

const observer=new MutationObserver(schedule);
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{activeTable=null;schedule()});
window.addEventListener('litlab:contributor-account-role',()=>{activeTable=null;schedule()});

schedule();

export {};
