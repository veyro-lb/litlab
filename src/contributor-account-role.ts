import './contributor-account-role.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type ContributorRole='student'|'teacher';
type StoredSession={access_token?:string};
type RoleState={role:ContributorRole|null;is_admin?:boolean;needs_choice?:boolean;has_conflict?:boolean;existing_roles?:string[]};

let cached:RoleState|null=null;
let loading=false;
let scanTimer=0;
let scanAttempts=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function signedIn(){return Boolean(token())}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function root(){return document.getElementById('ll-contributor-root')}
function form(){return document.querySelector<HTMLFormElement>('#ll-contributor-form')}
function applySection(){return document.getElementById('contribute-apply') as HTMLElement|null}

function forceFormRole(role:ContributorRole){
  const f=form();if(!f)return;
  const input=f.querySelector<HTMLInputElement>(`input[name="applicant_type"][value="${role}"]`);
  if(input&&!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
  f.dataset.accountContributorRole=role;
  const roleChoice=f.querySelector<HTMLElement>('.ll-contrib-role-choice');if(roleChoice)roleChoice.hidden=true;
  const email=f.querySelector<HTMLInputElement>('input[name="email"]');if(email)email.title=`This ${role} contributor application stays with your signed-in LitLab account.`;
}

function roleSummary(role:ContributorRole){
  if(role==='teacher')return {kicker:'TEACHER / MENTOR ACCOUNT',title:'Your contributor account is for academic review.',body:'You can apply as a LitLab teacher reviewer, mentor assigned students, review their DOCX files, give rubric scores and testimony, and track mentoring history. Student contribution forms, CAS evidence and student certificates are kept out of this account.',badge:'Teacher reviewer',action:'Apply as a teacher reviewer'};
  return {kicker:'STUDENT CONTRIBUTOR ACCOUNT',title:'Your contributor account is for your own student work.',body:'You can apply as a student contributor, submit DOCX work, receive teacher or LitLab feedback, keep contribution evidence while active and receive recognition after approved work is completed. Teacher-reviewer applications are kept out of this account.',badge:'Student contributor',action:'Apply as a student contributor'};
}

function roleCard(role:ContributorRole){const c=roleSummary(role);return `<section class="ll-account-role-summary is-${role}" data-account-role-summary><div class="ll-account-role-icon">${role==='teacher'?'✓':'✦'}</div><div><span>${c.kicker}</span><h2>${c.title}</h2><p>${c.body}</p><small>Account role: <b>${c.badge}</b> • This role stays attached to this LitLab account. Contact LitLab if it was selected incorrectly.</small></div></section>`}
function adminCard(){return `<section class="ll-account-role-summary is-admin" data-account-role-summary><div class="ll-account-role-icon">A</div><div><span>LITLAB ADMIN ACCOUNT</span><h2>No contributor role setup needed.</h2><p>This account manages contributor applications and review workflows. It is not treated as a Student or Teacher contributor account.</p><small>Account role: <b>Admin</b></small></div></section>`}
function choiceMarkup(){return `<section class="ll-account-role-choice" data-account-role-choice><div class="ll-account-role-choice-head"><span>ACCOUNT TYPE NOT SET</span><h2>Choose Student or Teacher to continue.</h2><p>This should normally be selected immediately after sign-in. You can also finish setup here.</p></div><div class="ll-account-role-options"><button type="button" data-choose-contributor-role="student"><i>✦</i><span><b>Student contributor</b><small>I submit my own LitLab contributions, DOCX work and revisions.</small><em>Student application • evidence • feedback • certificate</em></span></button><button type="button" data-choose-contributor-role="teacher"><i>✓</i><span><b>Teacher / mentor</b><small>I review or mentor student contributions assigned to me.</small><em>Teacher application • assigned students • rubric • testimony</em></span></button></div><div class="ll-account-role-lock-note"><b>One account, one role.</b><span>Your choice keeps student work and teacher reviews from getting mixed together. Contact LitLab if you select the wrong role.</span></div><p data-account-role-status role="status" aria-live="polite"></p></section>`}
function conflictMarkup(){return `<section class="ll-account-role-choice is-conflict" data-account-role-choice><div class="ll-account-role-choice-head"><span>ACCOUNT REVIEW NEEDED</span><h2>This older account has mixed contributor history.</h2><p>LitLab found both student and teacher contributor records on this account. Admin must resolve the account role before contributor tools can be used.</p></div></section>`}

function ensureRolePanel(state:RoleState){
  const host=root();const apply=applySection();if(!host||!apply)return;
  host.querySelector('[data-account-role-choice]')?.remove();host.querySelector('[data-account-role-summary]')?.remove();
  if(state.is_admin){apply.before(document.createRange().createContextualFragment(adminCard()));return}
  if(state.has_conflict){apply.before(document.createRange().createContextualFragment(conflictMarkup()));return}
  if(state.needs_choice||!state.role){apply.before(document.createRange().createContextualFragment(choiceMarkup()));wireChoice();return}
  apply.before(document.createRange().createContextualFragment(roleCard(state.role)));
}

function personalizeAdminPage(){
  const host=root();const f=form();const apply=applySection();if(!host)return;
  host.dataset.contributorAccountRole='admin';host.classList.remove('ll-account-role-blocked');
  const roleSection=host.querySelector<HTMLElement>('.ll-contrib-role-grid')?.closest('.ll-contrib-section') as HTMLElement|null;if(roleSection)roleSection.hidden=true;
  if(apply)apply.hidden=true;if(f)f.hidden=true;
  const primary=host.querySelector<HTMLAnchorElement>('.ll-contrib-hero-copy .ll-contrib-primary');if(primary)primary.hidden=true;
}

function personalizePage(role:ContributorRole|null,blocked=false){
  const host=root();const f=form();const apply=applySection();if(!host)return;
  if(apply)apply.hidden=false;host.dataset.contributorAccountRole=role||'unselected';host.classList.toggle('ll-account-role-blocked',blocked||!role);
  const roleSection=host.querySelector<HTMLElement>('.ll-contrib-role-grid')?.closest('.ll-contrib-section') as HTMLElement|null;if(roleSection)roleSection.hidden=true;
  const cas=host.querySelector<HTMLElement>('.ll-contrib-cas');if(cas)cas.hidden=role==='teacher';
  const cert=host.querySelector<HTMLElement>('.ll-contrib-certificate');if(cert)cert.hidden=role==='teacher';
  const primary=host.querySelector<HTMLAnchorElement>('.ll-contrib-hero-copy .ll-contrib-primary');const secondary=host.querySelector<HTMLAnchorElement>('.ll-contrib-hero-copy .ll-contrib-secondary');
  if(primary){primary.hidden=false;if(role)primary.textContent=roleSummary(role).action}if(secondary)secondary.hidden=role==='teacher';
  const applyHead=apply?.querySelector<HTMLElement>('.ll-contrib-section-head');
  if(applyHead&&role){const span=applyHead.querySelector('span');const h2=applyHead.querySelector('h2');const p=applyHead.querySelector('p');if(span)span.textContent=role==='teacher'?'Teacher reviewer application':'Student contributor application';if(h2)h2.textContent=role==='teacher'?'Apply to review and mentor student work.':'Tell us what you want to contribute.';if(p)p.textContent=role==='teacher'?'This account can only submit teacher / mentor applications. LitLab reviews teacher applications before any student work is assigned.':'This account can only submit student contributor applications. LitLab reviews each proposal before the contribution workflow begins.'}
  if(f){f.hidden=blocked||!role;if(role)forceFormRole(role)}
}

function applyState(state:RoleState){ensureRolePanel(state);if(state.is_admin){personalizeAdminPage();return}personalizePage(state.role,Boolean(state.has_conflict||state.needs_choice||!state.role))}

async function chooseRole(role:ContributorRole,button:HTMLButtonElement){
  const panel=button.closest<HTMLElement>('[data-account-role-choice]');const status=panel?.querySelector<HTMLElement>('[data-account-role-status]');panel?.querySelectorAll<HTMLButtonElement>('button[data-choose-contributor-role]').forEach(b=>b.disabled=true);button.dataset.loading='true';
  if(status){status.textContent=`Setting this account as ${role==='teacher'?'Teacher / mentor':'Student contributor'}…`;status.dataset.state='ready'}
  try{const next=await rpc<RoleState>('set_my_litlab_contributor_account_role',{p_role:role});cached=next;applyState(next);window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:next}));requestAnimationFrame(()=>applySection()?.scrollIntoView({block:'start',behavior:'smooth'}))}
  catch(error){const message=error instanceof Error?error.message:'Could not save the contributor role.';if(status){status.textContent=message;status.dataset.state='error'}panel?.querySelectorAll<HTMLButtonElement>('button[data-choose-contributor-role]').forEach(b=>b.disabled=false);delete button.dataset.loading}
}

function wireChoice(){document.querySelectorAll<HTMLButtonElement>('[data-choose-contributor-role]').forEach(button=>{if(button.dataset.wired==='true')return;button.dataset.wired='true';button.addEventListener('click',()=>void chooseRole(button.dataset.chooseContributorRole as ContributorRole,button))})}

async function refresh(force=false){
  if(route()!=='contribute'||!signedIn()||loading)return;if(cached&&!force){applyState(cached);return}
  loading=true;const host=root();if(host)host.classList.add('ll-account-role-loading');
  try{cached=await rpc<RoleState>('get_my_litlab_contributor_account_role');applyState(cached)}catch(error){console.error('Contributor account role unavailable',error);personalizePage(null,true)}finally{loading=false;if(host)host.classList.remove('ll-account-role-loading')}
}

function scan(){
  window.clearTimeout(scanTimer);scanTimer=0;if(route()!=='contribute')return;
  const host=root();const f=form();if(!host||!f){if(scanAttempts++<30)scanTimer=window.setTimeout(scan,100);return}
  scanAttempts=0;if(!signedIn())return;f.hidden=true;void refresh();
}

document.addEventListener('submit',event=>{
  const f=event.target instanceof HTMLFormElement?event.target:null;if(!f||f.id!=='ll-contributor-form'||!signedIn())return;
  if(cached?.is_admin){event.preventDefault();event.stopImmediatePropagation();return}
  if(!cached?.role){event.preventDefault();event.stopImmediatePropagation();applyState(cached||{role:null,needs_choice:true});return}
  forceFormRole(cached.role);
},true);

window.addEventListener('hashchange',()=>{cached=null;scanAttempts=0;setTimeout(scan,0)});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){cached=null;scanAttempts=0;setTimeout(scan,0)}});
window.addEventListener('focus',()=>{if(route()==='contribute')void refresh(true)});
window.addEventListener('litlab:contributor-submitted',()=>void refresh(true));
window.addEventListener('litlab:contributor-account-role',event=>{const next=(event as CustomEvent<RoleState>).detail;if(!next||typeof next!=='object')return;cached=next;if(route()==='contribute')setTimeout(scan,0)});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();

export {};
