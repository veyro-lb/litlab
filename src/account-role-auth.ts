import './account-role-auth.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type ContributorRole='student'|'teacher';
type StoredSession={access_token?:string};
type RoleState={role:ContributorRole|null;is_admin?:boolean;needs_choice?:boolean;has_conflict?:boolean;existing_roles?:string[];changed?:boolean};

let roleState:RoleState|null=null;
let loading=false;
let lastToken='';

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
function roleDescription(state:RoleState|null){if(state?.is_admin)return 'LitLab admin account';if(state?.role==='teacher')return 'Teacher review and mentoring account';if(state?.role==='student')return 'Student learning and contributor account';return 'Choose Student or Teacher after sign-in'}

function decorateSignInModal(){
  const dialog=document.querySelector<HTMLElement>('[data-auth-modal] .litlab-auth-dialog');if(!dialog||dialog.querySelector('[data-auth-role-info]'))return;
  const authButton=dialog.querySelector<HTMLElement>('[data-auth-google]')||dialog.querySelector<HTMLElement>('button');if(!authButton)return;
  const info=document.createElement('div');info.className='ll-auth-role-info';info.dataset.authRoleInfo='true';
  info.innerHTML=`<span>ACCOUNT TYPE</span><b>Student or Teacher?</b><p>After your first sign-in, LitLab will ask you to choose one account type. Returning accounts keep the type already saved.</p><div class="ll-auth-role-mini-grid"><div><i>✦</i><strong>Student</strong><small>Study tools + your own contributor applications, DOCX work, feedback and student evidence.</small></div><div><i>✓</i><strong>Teacher / mentor</strong><small>Study access + teacher reviewer applications, assigned students, rubric feedback and testimony.</small></div></div><em>LitLab admin accounts are detected automatically and are not asked to choose.</em>`;
  authButton.before(info);
}

function decorateAccountMenu(){
  document.querySelectorAll<HTMLElement>('.litlab-account-menu').forEach(menu=>{
    let row=menu.querySelector<HTMLElement>('[data-account-type-row]');
    if(!row){row=document.createElement('div');row.className='ll-account-type-row';row.dataset.accountTypeRow='true';const divider=menu.querySelector('.litlab-account-divider');if(divider)divider.before(row);else menu.appendChild(row)}
    const name=roleName(roleState);const detail=roleDescription(roleState);const unselected=!roleState?.is_admin&&!roleState?.role;const icon=roleState?.is_admin?'A':roleState?.role==='teacher'?'✓':'✦';
    const signature=`${icon}|${name}|${detail}|${unselected?'choose':'fixed'}`;
    if(row.dataset.accountTypeSignature===signature)return;
    row.dataset.accountTypeSignature=signature;
    row.innerHTML=`<div class="ll-account-type-icon">${icon}</div><div><small>ACCOUNT TYPE</small><b>${name}</b><span>${detail}</span></div>${unselected?'<button type="button" data-open-account-role>Choose</button>':''}`;
    row.querySelector<HTMLButtonElement>('[data-open-account-role]')?.addEventListener('click',()=>openRoleChooser(roleState||{role:null,needs_choice:true}));
  });
}

function closeRoleChooser(){document.querySelector('[data-auth-role-setup]')?.remove();document.documentElement.classList.remove('ll-auth-role-open')}

function chooserMarkup(state:RoleState){
  if(state.has_conflict)return `<div class="ll-auth-role-overlay" data-auth-role-setup role="dialog" aria-modal="true" aria-labelledby="ll-auth-role-title"><section class="ll-auth-role-dialog is-conflict"><div class="ll-auth-role-mark">LL</div><span>ACCOUNT TYPE</span><h2 id="ll-auth-role-title">This account needs LitLab review.</h2><p>Older contributor records on this account include both Student and Teacher activity. LitLab will not guess which account type should own it.</p><div class="ll-auth-role-warning">Contributor tools stay locked until LitLab admin resolves the account type. Your normal LitLab study tools are still available.</div><button type="button" class="ll-auth-role-secondary" data-close-role-review>Continue to LitLab</button></section></div>`;
  return `<div class="ll-auth-role-overlay" data-auth-role-setup role="dialog" aria-modal="true" aria-labelledby="ll-auth-role-title"><section class="ll-auth-role-dialog"><div class="ll-auth-role-mark">LL</div><span>ONE-TIME ACCOUNT SETUP</span><h2 id="ll-auth-role-title">Are you a Student or a Teacher?</h2><p class="ll-auth-role-lead">Choose the account type that matches how you use LitLab. This keeps student contribution work and teacher review work completely separate.</p><div class="ll-auth-role-choice-grid"><button type="button" data-auth-choose-role="student"><i>✦</i><div><strong>Student account</strong><p>I use LitLab as a student and submit my own contributor work.</p><small>Student application • DOCX submissions • revisions • feedback • evidence • student recognition</small></div><b>Choose Student →</b></button><button type="button" data-auth-choose-role="teacher"><i>✓</i><div><strong>Teacher / mentor account</strong><p>I use LitLab as an educator and review or mentor assigned student work.</p><small>Teacher application • assigned students • academic rubric • notes • testimony • mentoring history</small></div><b>Choose Teacher →</b></button></div><div class="ll-auth-role-note"><b>One account, one type.</b><span>This choice is saved to your LitLab account. It is not a switch you change between projects. If you choose incorrectly, contact LitLab.</span></div><p class="ll-auth-role-status" data-auth-role-status role="status" aria-live="polite"></p></section></div>`;
}

function openRoleChooser(state:RoleState){
  if(state.is_admin||state.role){closeRoleChooser();return}
  if(document.querySelector('[data-auth-role-setup]'))return;
  document.body.insertAdjacentHTML('beforeend',chooserMarkup(state));document.documentElement.classList.add('ll-auth-role-open');
  const overlay=document.querySelector<HTMLElement>('[data-auth-role-setup]');
  overlay?.querySelector<HTMLButtonElement>('[data-close-role-review]')?.addEventListener('click',closeRoleChooser);
  overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(button=>button.addEventListener('click',()=>void chooseRole(button.dataset.authChooseRole as ContributorRole,button)));
  requestAnimationFrame(()=>overlay?.querySelector<HTMLButtonElement>('[data-auth-choose-role]')?.focus());
}

async function chooseRole(role:ContributorRole,button:HTMLButtonElement){
  const overlay=document.querySelector<HTMLElement>('[data-auth-role-setup]');const status=overlay?.querySelector<HTMLElement>('[data-auth-role-status]');
  overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(item=>item.disabled=true);button.dataset.loading='true';if(status)status.textContent=`Saving ${role==='teacher'?'Teacher / mentor':'Student'} as your account type…`;
  try{const next=await rpc<RoleState>('set_my_litlab_contributor_account_role',{p_role:role});roleState=next;closeRoleChooser();decorateAccountMenu();window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:next}))}
  catch(error){const message=error instanceof Error?error.message:'Could not save your account type.';if(status)status.textContent=message;overlay?.querySelectorAll<HTMLButtonElement>('[data-auth-choose-role]').forEach(item=>item.disabled=false);delete button.dataset.loading}
}

function applyRoleState(state:RoleState){roleState=state;decorateAccountMenu();if(state.is_admin||state.role){closeRoleChooser();return}if(state.needs_choice||state.has_conflict||!state.role)openRoleChooser(state)}

async function refreshRoleState(force=false){
  const current=token();if(!current){lastToken='';roleState=null;closeRoleChooser();decorateAccountMenu();return}if(loading)return;if(!force&&roleState&&lastToken===current){decorateAccountMenu();return}
  loading=true;lastToken=current;
  try{const state=await rpc<RoleState>('get_my_litlab_contributor_account_role');applyRoleState(state);window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:state}))}catch(error){console.error('LitLab account type unavailable',error)}finally{loading=false}
}

function decorateAuthUi(){decorateSignInModal();decorateAccountMenu()}
const uiObserver=new MutationObserver(()=>decorateAuthUi());
function start(){decorateAuthUi();uiObserver.observe(document.body,{childList:true,subtree:true});void refreshRoleState(true)}

window.addEventListener('storage',event=>{if(event.key===SESSION_KEY)void refreshRoleState(true)});
window.addEventListener('focus',()=>void refreshRoleState(false));
window.addEventListener('litlab:contributor-account-role',event=>{const next=(event as CustomEvent<RoleState>).detail;if(!next||typeof next!=='object')return;roleState=next;decorateAccountMenu();if(next.is_admin||next.role)closeRoleChooser()});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
