import './account-role-auth.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const TOKEN_WATCH_MS=750;

type ContributorRole='student'|'teacher';
type StoredSession={access_token?:string};
type RoleState={role:ContributorRole|null;is_admin?:boolean;needs_choice?:boolean;has_conflict?:boolean;existing_roles?:string[];changed?:boolean};

let roleState:RoleState|null=null;
let loading=false;
let lastToken='';
let tokenWatch=0;

function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function roleName(state:RoleState|null){if(state?.is_admin)return 'Admin';if(state?.role==='teacher')return 'Teacher / mentor';if(state?.role==='student')return 'Student';return 'Not selected'}
function roleDescription(state:RoleState|null){if(state?.is_admin)return 'ibdplabs admin account';if(state?.role==='teacher')return 'Teacher review and mentoring account';if(state?.role==='student')return 'Student learning and contributor account';return 'Choose a role for contributor tools'}

function decorateAccountMenu(){
  document.querySelectorAll<HTMLElement>('.litlab-account-menu').forEach(menu=>{
    let row=menu.querySelector<HTMLElement>('[data-account-type-row]');
    if(!row){row=document.createElement('div');row.className='ll-account-type-row';row.dataset.accountTypeRow='true';const divider=menu.querySelector('.litlab-account-divider');if(divider)divider.before(row);else menu.appendChild(row)}
    const name=roleName(roleState);const detail=roleDescription(roleState);const unselected=!roleState?.is_admin&&!roleState?.role;const icon=roleState?.is_admin?'A':roleState?.role==='teacher'?'✓':'✦';
    const signature=`${icon}|${name}|${detail}|${unselected?'choose':'fixed'}`;
    if(row.dataset.accountTypeSignature===signature)return;
    row.dataset.accountTypeSignature=signature;
    row.innerHTML=`<div class="ll-account-type-icon">${icon}</div><div><small>ACCOUNT TYPE</small><b>${name}</b><span>${detail}</span></div>${unselected?'<button type="button" data-open-account-role aria-label="Choose Student or Teacher account type">Choose</button>':''}`;
    row.querySelector<HTMLButtonElement>('[data-open-account-role]')?.addEventListener('click',()=>openRoleChooser(roleState||{role:null,needs_choice:true}));
  });
}

function closeRoleChooser(){document.querySelector('[data-auth-role-setup]')?.remove();document.documentElement.classList.remove('ll-auth-role-open')}

function chooserMarkup(state:RoleState){
  if(state.has_conflict)return `<div class="ll-auth-role-overlay" data-auth-role-setup role="dialog" aria-modal="true" aria-labelledby="ll-auth-role-title"><section class="ll-auth-role-dialog is-conflict"><div class="ll-auth-role-mark">LL</div><span>ACCOUNT TYPE</span><h2 id="ll-auth-role-title">This account needs ibdplabs review.</h2><p>Older contributor records on this account include both Student and Teacher activity. The ibdplabs team will review which account type applies.</p><div class="ll-auth-role-warning">Contributor tools stay locked until LitLab admin resolves the account type. You can keep studying in LitLab and BioLab.</div><button type="button" class="ll-auth-role-secondary" data-close-role-setup>Continue to ibdplabs</button></section></div>`;
  return `<div class="ll-auth-role-overlay" data-auth-role-setup role="dialog" aria-modal="true" aria-labelledby="ll-auth-role-title"><section class="ll-auth-role-dialog"><div class="ll-auth-role-mark">LL</div><span>ONE-TIME ACCOUNT SETUP</span><h2 id="ll-auth-role-title">Are you a Student or a Teacher?</h2><p class="ll-auth-role-lead">Choose the account type that matches how you use LitLab. This keeps student contribution work and teacher review work completely separate.</p><div class="ll-auth-role-choice-grid"><button type="button" data-auth-choose-role="student" aria-label="Choose Student account"><i>✦</i><div><strong>Student account</strong><p>I use LitLab as a student and submit my own contributor work.</p><small>Student application • DOCX submissions • revisions • feedback • evidence • student recognition</small></div><b>Choose Student →</b></button><button type="button" data-auth-choose-role="teacher" aria-label="Choose Teacher or mentor account"><i>✓</i><div><strong>Teacher / mentor account</strong><p>I use LitLab as an educator and review or mentor assigned student work.</p><small>Teacher application • assigned students • academic rubric • notes • testimony • mentoring history</small></div><b>Choose Teacher →</b></button></div><div class="ll-auth-role-note"><b>One account, one type.</b><span>This choice is saved to your ibdplabs account. It is not a switch you change between projects. If you choose incorrectly, contact ibdplabs.</span></div><button type="button" class="ll-auth-role-secondary" data-close-role-setup>Continue studying</button><p class="ll-auth-role-status" data-auth-role-status role="status" aria-live="polite"></p></section></div>`;
}

function openRoleChooser(state:RoleState){
  if(state.is_admin||state.role){closeRoleChooser();return}
  if(document.querySelector('[data-auth-role-setup]'))return;
  document.body.insertAdjacentHTML('beforeend',chooserMarkup(state));document.documentElement.classList.add('ll-auth-role-open');
  const overlay=document.querySelector<HTMLElement>('[data-auth-role-setup]');
  overlay?.querySelector<HTMLButtonElement>('[data-close-role-setup]')?.addEventListener('click',closeRoleChooser);
  overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(button=>button.addEventListener('click',()=>void chooseRole(button.dataset.authChooseRole as ContributorRole,button)));
  requestAnimationFrame(()=>overlay?.querySelector<HTMLButtonElement>('[data-auth-choose-role]')?.focus());
}

async function chooseRole(role:ContributorRole,button:HTMLButtonElement){
  const overlay=document.querySelector<HTMLElement>('[data-auth-role-setup]');const status=overlay?.querySelector<HTMLElement>('[data-auth-role-status]');
  overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(item=>item.disabled=true);overlay?.setAttribute('aria-busy','true');button.dataset.loading='true';if(status)status.textContent=`Saving ${role==='teacher'?'Teacher / mentor':'Student'} as your account type…`;
  try{
    const next=await rpc<RoleState>('set_my_litlab_contributor_account_role',{p_role:role});
    if(!next?.is_admin&&next?.role!==role)throw new Error('LitLab could not confirm the selected account type. Please try again.');
    roleState=next;closeRoleChooser();decorateAccountMenu();window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:next}));
  }catch(error){
    const message=error instanceof Error?error.message:'Could not save your account type.';if(status)status.textContent=message;overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(item=>item.disabled=false);overlay?.removeAttribute('aria-busy');delete button.dataset.loading;
  }
}

function applyRoleState(state:RoleState){roleState=state;decorateAccountMenu();if(state.is_admin||state.role)closeRoleChooser()}

async function refreshRoleState(force=false){
  const current=token();
  if(!current){lastToken='';roleState=null;closeRoleChooser();decorateAccountMenu();return}
  if(loading)return;
  if(!force&&roleState&&lastToken===current){decorateAccountMenu();return}
  loading=true;lastToken=current;
  try{
    const state=await rpc<RoleState>('get_my_litlab_contributor_account_role');
    if(token()!==current)return;
    applyRoleState(state);window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:state}));
  }catch(error){console.error('ibdplabs account type unavailable',error)}finally{loading=false}
}

function syncAuthUi(){
  decorateAccountMenu();
  const current=token();
  if(current!==lastToken&&!loading)void refreshRoleState(true);
}

const uiObserver=new MutationObserver(()=>syncAuthUi());
function start(){
  syncAuthUi();uiObserver.observe(document.body,{childList:true,subtree:true});
  window.clearInterval(tokenWatch);tokenWatch=window.setInterval(()=>{const current=token();if(current!==lastToken&&!loading)void refreshRoleState(true)},TOKEN_WATCH_MS);
  void refreshRoleState(true);
}

window.addEventListener('storage',event=>{if(event.key===SESSION_KEY)void refreshRoleState(true)});
window.addEventListener('focus',()=>void refreshRoleState(false));
window.addEventListener('litlab:contributor-account-role',event=>{const next=(event as CustomEvent<RoleState>).detail;if(next&&typeof next==='object')applyRoleState(next)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
