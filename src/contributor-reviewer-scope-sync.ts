const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type ReviewerRole='english_teacher'|'cas_supervisor'|'both';
type Row=Record<string,unknown>;

let persistedRole:ReviewerRole|null=null;
let loading=false;
let timer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function inferRole(subject:unknown):ReviewerRole{const text=String(subject||'').toLowerCase();if(text.includes('english')&&text.includes('cas'))return 'both';if(text.includes('cas'))return 'cas_supervisor';return 'english_teacher'}
function selectedRole():ReviewerRole|null{const value=document.querySelector<HTMLInputElement>('input[name="reviewer_role_choice"]:checked')?.value;return value==='english_teacher'||value==='cas_supervisor'||value==='both'?value:null}
function roleName(role:ReviewerRole){return role==='cas_supervisor'?'CAS Supervisor / Coordinator':role==='both'?'English Teacher + CAS Supervisor':'English / Language & Literature Teacher'}
function roleDescription(role:ReviewerRole){
  if(role==='cas_supervisor')return 'You review the student’s ownership, process, evidence and reflection from a CAS-supervision perspective. This does not certify DP English academic accuracy or replace the school’s official CAS approval.';
  if(role==='both')return 'You can review academic DP English quality, CAS process and evidence, or both. Choose the correct review perspective for each student submission so your approval clearly states what you actually verified.';
  return 'You review academic DP English quality: accuracy, clarity, DP relevance, student ownership and source use. This is an academic review and does not approve school CAS.';
}
function steps(role:ReviewerRole){
  if(role==='cas_supervisor')return [
    ['1. Open the latest DOCX','Review the student’s current version and any relevant contribution evidence. Older versions remain history.'],
    ['2. Review the CAS process','Check student ownership, evidence quality, reflection, initiative and whether the record truthfully represents the student’s work.'],
    ['3. Record your CAS decision','Request changes if the evidence or reflection needs work. Approve sends your CAS-perspective review to LitLab admin; it is not school CAS approval.']
  ];
  if(role==='both')return [
    ['1. Open the latest DOCX','Review the current version only and identify whether this submission needs academic review, CAS review, or both.'],
    ['2. Choose the review perspective','Use Academic, CAS or Combined review. The rubric and meaning of your approval change with that choice.'],
    ['3. Decide within your scope','Request changes or approve only what you actually reviewed. An approved version then moves to LitLab admin for final review.']
  ];
  return [
    ['1. Open the latest DOCX','Review the current version only. Older versions remain history.'],
    ['2. Review academic quality','Check DP English accuracy, clarity, relevance, student ownership and source use, then give specific structured feedback.'],
    ['3. Decide clearly','Request changes sends the version back to the student. Approve sends that exact academically reviewed version to LitLab admin.']
  ];
}

async function loadPersistedRole(){
  if(loading||persistedRole||!token())return;
  loading=true;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_litlab_contributor_applications`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:'{}'});
    if(!response.ok)return;
    const rows=await response.json() as Row[];
    const teacher=(Array.isArray(rows)?rows:[]).filter(row=>row.applicant_type==='teacher').sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))[0];
    if(teacher)persistedRole=inferRole(teacher.subject_taught);
  }catch(error){console.error(error)}finally{loading=false}
}

function render(){
  if(route()!=='contribute')return;
  const card=document.querySelector<HTMLElement>('[data-role-scope-card]');
  if(!card)return;
  const role=selectedRole()||persistedRole;
  if(!role)return;
  if(card.dataset.scopeSyncedRole===role)return;
  card.dataset.scopeSyncedRole=role;
  const items=steps(role);
  card.innerHTML=`<span>YOUR REVIEWER SCOPE</span><h3>${esc(roleName(role))}</h3><p>${esc(roleDescription(role))}</p><div class="ll-role-scope-grid">${items.map(([title,copy])=>`<article><b>${esc(title)}</b><small>${esc(copy)}</small></article>`).join('')}</div>`;
}

async function sync(){
  window.clearTimeout(timer);
  if(route()!=='contribute')return;
  await loadPersistedRole();
  render();
  timer=window.setTimeout(()=>void sync(),500);
}

document.addEventListener('change',event=>{
  const target=event.target instanceof HTMLInputElement?event.target:null;
  if(target?.name!=='reviewer_role_choice')return;
  const role=selectedRole();
  if(role)persistedRole=role;
  render();
},true);

for(const eventName of ['litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-account-role','litlab:contributor-submitted']){
  window.addEventListener(eventName,()=>setTimeout(()=>void sync(),80));
}
window.addEventListener('hashchange',()=>{persistedRole=null;void sync()});
window.addEventListener('focus',()=>void sync());

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void sync(),{once:true});
else void sync();

export {};
