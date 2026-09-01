const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;
const CHECK_MS=750;

type ContributorRole='student'|'teacher';
type StoredSession={access_token?:string};
type RoleState={role:ContributorRole|null;is_admin:boolean};

let checkedToken='';
let checking=false;
let verifiedUnassigned=false;
let checkTimer=0;

function token(){
  try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}
  catch{return ''}
}

function normalizeRoleState(value:unknown):RoleState|null{
  if(Array.isArray(value)){
    if(value.length===0)return {role:null,is_admin:false};
    return normalizeRoleState(value[0]);
  }
  if(!value||typeof value!=='object')return null;
  const raw=value as {role?:unknown;is_admin?:unknown};
  const role=raw.role==='student'||raw.role==='teacher'?raw.role:null;
  return {role,is_admin:raw.is_admin===true};
}

function roleChooserOpen(){return Boolean(document.querySelector('[data-auth-role-setup]'))}

function openRoleChooser(){
  if(!verifiedUnassigned||roleChooserOpen())return;

  const choose=document.querySelector<HTMLButtonElement>('[data-open-account-role]');
  if(choose){choose.click();return}

  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  const trigger=document.querySelector<HTMLButtonElement>('.litlab-account-trigger');
  if(!menu&&trigger)trigger.click();

  requestAnimationFrame(()=>{
    if(!verifiedUnassigned||roleChooserOpen())return;
    document.querySelector<HTMLButtonElement>('[data-open-account-role]')?.click();
  });
}

function applyVerifiedState(state:RoleState,currentToken:string){
  if(token()!==currentToken)return;
  checkedToken=currentToken;
  verifiedUnassigned=!state.is_admin&&!state.role;
  if(verifiedUnassigned)openRoleChooser();
}

async function verifyRole(force=false){
  const current=token();
  if(!current){
    checkedToken='';
    verifiedUnassigned=false;
    return;
  }
  if(checking)return;
  if(!force&&checkedToken===current){
    if(verifiedUnassigned)openRoleChooser();
    return;
  }

  checking=true;
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_litlab_contributor_account_role`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${current}`},
      body:'{}',
      signal:controller.signal
    });
    if(!response.ok)return;
    const text=await response.text();
    const state=normalizeRoleState(text?JSON.parse(text):null);
    if(state)applyVerifiedState(state,current);
  }catch(error){
    if(!(error instanceof DOMException&&error.name==='AbortError'))console.error('LitLab role guard could not verify account type',error);
  }finally{
    window.clearTimeout(timeout);
    checking=false;
  }
}

window.addEventListener('litlab:contributor-account-role',event=>{
  const state=normalizeRoleState((event as CustomEvent<unknown>).detail);
  const current=token();
  if(!state||!current)return;
  applyVerifiedState(state,current);
});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY)void verifyRole(true)});
window.addEventListener('focus',()=>void verifyRole(false));

function start(){
  void verifyRole(true);
  window.clearInterval(checkTimer);
  checkTimer=window.setInterval(()=>void verifyRole(false),CHECK_MS);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();

export {};
