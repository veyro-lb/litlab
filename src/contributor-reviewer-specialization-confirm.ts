import './contributor-reviewer-specialization-confirm.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type ReviewerSpecialization='english_teacher'|'cas_supervisor'|'both';
type AccountState={role:'student'|'teacher'|null;reviewer_specialization?:ReviewerSpecialization|null;reviewer_needs_choice?:boolean;is_admin?:boolean};

const NAMES:Record<ReviewerSpecialization,string>={
  english_teacher:'English / Language & Literature Teacher',
  cas_supervisor:'CAS Supervisor / Coordinator',
  both:'English Teacher + CAS Supervisor'
};

let pending:ReviewerSpecialization|null=null;
let activeModal:HTMLElement|null=null;
let saving=false;
let timer=0;

function token(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token||'')}catch{return ''}}
function valid(value:string|undefined):value is ReviewerSpecialization{return value==='english_teacher'||value==='cas_supervisor'||value==='both'}

async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body)});
  if(!response.ok){let message=`${name} failed (${response.status})`;try{const json=await response.json() as {message?:string};if(json.message)message=json.message}catch{}throw new Error(message)}
  const text=await response.text();return (text?JSON.parse(text):null) as T;
}

function statusNode(modal:HTMLElement){return modal.querySelector<HTMLElement>('[data-reviewer-specialization-status]')}
function confirmButton(modal:HTMLElement){return modal.querySelector<HTMLButtonElement>('[data-confirm-reviewer-specialization]')}

function decorate(modal:HTMLElement){
  if(modal.dataset.confirmStepReady==='true')return;
  modal.dataset.confirmStepReady='true';
  pending=null;
  const dialog=modal.querySelector<HTMLElement>('.ll-reviewer-specialization-dialog');if(!dialog)return;
  const lock=dialog.querySelector<HTMLElement>('.ll-reviewer-specialization-lock');
  if(lock){
    lock.innerHTML='<b>Important — this choice cannot be changed after confirmation.</b><span>Select the reviewer role you actually hold. Nothing is saved when you select a card. Review your selection, then press Confirm & continue. If a confirmed role is ever wrong, you will need to contact LitLab.</span>';
  }
  const status=statusNode(modal);
  const actions=document.createElement('div');
  actions.className='ll-reviewer-specialization-confirm-actions';
  actions.dataset.reviewerSpecializationConfirmActions='true';
  actions.innerHTML='<div><b data-reviewer-selection-summary>No role selected yet</b><small>Select one option above. You can change the selection freely until you confirm.</small></div><button type="button" data-confirm-reviewer-specialization disabled>Confirm & continue</button>';
  if(status)status.before(actions);else dialog.appendChild(actions);
  modal.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(button=>{button.setAttribute('aria-pressed','false');button.removeAttribute('aria-current')});
}

function select(modal:HTMLElement,value:ReviewerSpecialization){
  if(saving)return;
  pending=value;
  modal.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(button=>{
    const selected=button.dataset.setReviewerSpecialization===value;
    button.classList.toggle('is-selected',selected);
    button.setAttribute('aria-pressed',selected?'true':'false');
    if(selected)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
  });
  const summary=modal.querySelector<HTMLElement>('[data-reviewer-selection-summary]');if(summary)summary.textContent=`Selected: ${NAMES[value]}`;
  const confirm=confirmButton(modal);if(confirm){confirm.disabled=false;confirm.textContent='Confirm & continue'}
  const status=statusNode(modal);if(status){status.textContent='Selection only — nothing has been saved yet.';status.dataset.state='ready'}
}

async function confirm(modal:HTMLElement){
  if(!pending||saving)return;
  saving=true;
  const value=pending;
  const confirm=confirmButton(modal);
  const status=statusNode(modal);
  modal.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(button=>button.disabled=true);
  if(confirm){confirm.disabled=true;confirm.textContent='Saving…'}
  if(status){status.textContent=`Saving ${NAMES[value]} as your reviewer specialization…`;status.dataset.state='ready'}
  try{
    const next=await rpc<AccountState>('set_my_litlab_reviewer_specialization',{p_specialization:value});
    modal.remove();
    const host=document.getElementById('ll-contributor-root') as HTMLElement|null;if(host)host.inert=false;
    document.documentElement.classList.remove('ll-reviewer-specialization-required');
    window.dispatchEvent(new CustomEvent('litlab:reviewer-specialization-changed',{detail:next}));
    window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:next}));
  }catch(error){
    saving=false;
    modal.querySelectorAll<HTMLButtonElement>('[data-set-reviewer-specialization]').forEach(button=>button.disabled=false);
    if(confirm){confirm.disabled=false;confirm.textContent='Confirm & continue'}
    if(status){status.textContent=error instanceof Error?error.message:'Could not save reviewer role.';status.dataset.state='error'}
  }
}

// Capture before the original specialization module's per-card click handler.
// Card clicks now only select. The permanent RPC runs only from Confirm & continue.
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const option=target.closest<HTMLButtonElement>('[data-set-reviewer-specialization]');
  if(option){
    const modal=option.closest<HTMLElement>('[data-reviewer-specialization-modal]');
    const value=option.dataset.setReviewerSpecialization;
    if(modal&&valid(value)){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      select(modal,value);
    }
    return;
  }
  const accept=target.closest<HTMLButtonElement>('[data-confirm-reviewer-specialization]');
  if(accept){
    const modal=accept.closest<HTMLElement>('[data-reviewer-specialization-modal]');
    if(modal){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();void confirm(modal)}
  }
},true);

function scan(){
  window.clearTimeout(timer);
  const modal=document.querySelector<HTMLElement>('[data-reviewer-specialization-modal]');
  if(modal!==activeModal){activeModal=modal;pending=null;saving=false}
  if(modal)decorate(modal);
  timer=window.setTimeout(scan,180);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void scan(),{once:true});else void scan();

export {};
