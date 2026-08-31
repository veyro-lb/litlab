import './admin-account-delete.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type AccountRole='student'|'teacher'|'admin'|null;
type RecentUser={user_id?:string;display_name?:string;email?:string|null;account_role?:AccountRole};
type Analytics={recent_users?:RecentUser[]};
type DeleteResponse={deleted?:boolean;message?:string;warning?:string|null};

let scheduled=false;
let requestId=0;
let activeTable:HTMLElement|null=null;
let modal:HTMLElement|null=null;
let opener:HTMLElement|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null}catch{return null}}
function token(){return String(session()?.access_token||'')}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

async function rpc<T>(name:string):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:'{}'});
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  return await response.json() as T;
}

function closeModal(){
  const current=modal;if(!current)return;
  modal=null;current.remove();
  document.body.classList.remove('ll-admin-delete-open');
  const target=opener;opener=null;
  if(target?.isConnected)requestAnimationFrame(()=>target.focus({preventScroll:true}));
}

async function deleteAccount(user:RecentUser,card:HTMLElement){
  const auth=token();
  const input=card.querySelector<HTMLInputElement>('[data-admin-delete-confirm]');
  const button=card.querySelector<HTMLButtonElement>('[data-admin-delete-submit]');
  const status=card.querySelector<HTMLElement>('[data-admin-delete-status]');
  const email=String(user.email||'').trim();
  if(!auth||!user.user_id||!email||!input||!button||input.value.trim().toLowerCase()!==email.toLowerCase())return;

  button.disabled=true;button.textContent='Deleting account…';input.disabled=true;
  if(status){status.textContent='Removing sign-in access, private files and LitLab account data…';status.dataset.state='working'}
  try{
    const response=await fetch(`${SUPABASE_URL}/functions/v1/admin-delete-account`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
      body:JSON.stringify({user_id:user.user_id,confirmation:input.value.trim()})
    });
    let data:DeleteResponse={};try{data=await response.json() as DeleteResponse}catch{}
    if(!response.ok||!data.deleted)throw new Error(data.message||`Deletion failed (${response.status})`);
    if(status){status.textContent=data.warning?`Account sign-in deleted. Cleanup warning: ${data.warning}`:'Account deleted permanently. Refreshing the account list…';status.dataset.state=data.warning?'warning':'success'}
    button.textContent='Account deleted';
    window.setTimeout(()=>{
      closeModal();
      const refresh=document.querySelector<HTMLButtonElement>('[data-admin-refresh]');
      if(refresh)refresh.click();else location.reload();
    },data.warning?1400:650);
  }catch(error){
    const message=error instanceof Error?error.message:'Account deletion failed';
    if(status){status.textContent=message;status.dataset.state='error'}
    input.disabled=false;button.disabled=input.value.trim().toLowerCase()!==email.toLowerCase();button.textContent='Delete account permanently';
  }
}

function openDeleteModal(user:RecentUser,source:HTMLElement){
  if(modal||user.account_role==='admin'||!user.user_id||!user.email)return;
  opener=source;
  const email=String(user.email).trim();
  const name=String(user.display_name||email.split('@')[0]||'LitLab user');
  const overlay=document.createElement('div');
  overlay.className='ll-admin-delete-overlay';overlay.dataset.adminDeleteModal='true';
  overlay.innerHTML=`<section class="ll-admin-delete-card" role="dialog" aria-modal="true" aria-labelledby="ll-admin-delete-title"><button type="button" class="ll-admin-delete-close" data-admin-delete-close aria-label="Close">×</button><span class="ll-admin-delete-kicker">PERMANENT ACCOUNT DELETION</span><h2 id="ll-admin-delete-title">Delete ${esc(name)}?</h2><p>This removes this person's LitLab sign-in account, their account-linked LitLab data and any private contributor files they own. This cannot be undone.</p><div class="ll-admin-delete-target"><b>${esc(email)}</b><small>Admin accounts and your own Admin account are protected from this control.</small></div><label><span>Type the email exactly to confirm</span><input type="email" autocomplete="off" spellcheck="false" data-admin-delete-confirm placeholder="${esc(email)}"></label><small class="ll-admin-delete-status" data-admin-delete-status data-state="normal">No deletion happens until the email matches exactly.</small><div class="ll-admin-delete-actions"><button type="button" data-admin-delete-cancel>Cancel</button><button type="button" class="danger" data-admin-delete-submit disabled>Delete account permanently</button></div></section>`;
  document.body.append(overlay);modal=overlay;document.body.classList.add('ll-admin-delete-open');
  const card=overlay.querySelector<HTMLElement>('.ll-admin-delete-card')!;
  const input=card.querySelector<HTMLInputElement>('[data-admin-delete-confirm]')!;
  const submit=card.querySelector<HTMLButtonElement>('[data-admin-delete-submit]')!;
  const cancel=()=>closeModal();
  card.querySelector('[data-admin-delete-close]')?.addEventListener('click',cancel);
  card.querySelector('[data-admin-delete-cancel]')?.addEventListener('click',cancel);
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)closeModal()});
  input.addEventListener('input',()=>{submit.disabled=input.value.trim().toLowerCase()!==email.toLowerCase()});
  submit.addEventListener('click',()=>void deleteAccount(user,card));
  requestAnimationFrame(()=>input.focus());
}

function roleLabel(role:AccountRole|undefined){return role==='admin'?'Admin account — protected':role==='teacher'?'Delete Teacher account':'Delete account'}

function decorateRows(table:HTMLElement,users:RecentUser[]){
  const head=table.querySelector('thead tr');if(!head)return;
  let actionHead=head.querySelector<HTMLElement>('[data-admin-account-delete-head]');
  if(!actionHead){actionHead=document.createElement('th');actionHead.dataset.adminAccountDeleteHead='true';actionHead.textContent='Account';head.append(actionHead)}

  const rows=Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  rows.forEach((row,index)=>{
    row.querySelector('[data-admin-account-delete-cell]')?.remove();
    const user=users[index];
    const cell=document.createElement('td');cell.dataset.adminAccountDeleteCell='true';cell.className='ll-admin-account-delete-cell';
    if(!user?.user_id||!user.email){cell.innerHTML='<span class="ll-admin-account-unavailable">Unavailable</span>';row.append(cell);return}
    const button=document.createElement('button');button.type='button';button.className='ll-admin-account-delete-button';
    if(user.account_role==='admin'){
      button.disabled=true;button.classList.add('is-protected');button.textContent='Protected';button.title='Admin accounts cannot be deleted from this control.';
    }else{
      button.textContent='Delete account';button.title=roleLabel(user.account_role);button.addEventListener('click',()=>openDeleteModal(user,button));
    }
    cell.append(button);row.append(cell);
  });
  table.dataset.adminAccountDeleteReady='true';
}

async function decorate(table:HTMLElement){
  const id=++requestId;
  try{
    const data=await rpc<Analytics>('get_litlab_admin_analytics');
    if(id!==requestId||!table.isConnected||route()!=='admin')return;
    decorateRows(table,Array.isArray(data.recent_users)?data.recent_users:[]);
  }catch(error){console.error('LitLab admin account deletion controls unavailable',error)}
}

function scan(){
  scheduled=false;
  if(route()!=='admin'){activeTable=null;closeModal();return}
  const table=document.querySelector<HTMLElement>('.admin-user-table');
  if(!table)return;
  if(table!==activeTable||table.dataset.adminAccountDeleteReady!=='true'){
    activeTable=table;void decorate(table);
  }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(scan)}

const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{activeTable=null;schedule()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal)closeModal()});

schedule();

export {};
