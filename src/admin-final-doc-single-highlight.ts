import './contributor-role-hard-guard';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type Pipeline={application_id:string;applicant_type?:string;latest_document?:{id?:string;is_final_submission?:boolean}|null};
type OpenEvent={applicationId?:string};

let activeApplicationId='';
let currentPipeline:Pipeline|null=null;
let normalizeTimer=0;
let loading=false;
let requestVersion=0;

function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const access=token();if(!access)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${access}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(`${name} failed (${response.status})`);
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function clearRow(row:HTMLElement){
  row.classList.remove('ll-admin-final-doc-row');
  row.querySelectorAll('[data-admin-final-row-badge]').forEach(badge=>badge.remove());
  delete row.dataset.finalDocumentId;
}

function normalize(){
  if(route()!=='admin-contributors'||!activeApplicationId)return;
  const modal=document.getElementById('ll-admin-contributor-workspace');
  const rows=Array.from(modal?.querySelectorAll<HTMLElement>('.ll-admin-doc-list > div')||[]);
  if(!rows.length)return;
  const doc=currentPipeline?.latest_document;
  const shouldHighlight=Boolean(currentPipeline?.applicant_type==='student'&&doc?.id&&doc.is_final_submission===true);
  const finalRow=shouldHighlight?rows[0]:null;
  rows.forEach(row=>{
    if(row!==finalRow){if(row.classList.contains('ll-admin-final-doc-row')||row.querySelector('[data-admin-final-row-badge]'))clearRow(row);return}
    row.classList.add('ll-admin-final-doc-row');
    row.dataset.finalDocumentId=String(doc?.id||'');
    const section=row.querySelector<HTMLElement>('section');if(!section)return;
    const badges=Array.from(section.querySelectorAll<HTMLElement>('[data-admin-final-row-badge]'));
    badges.slice(1).forEach(item=>item.remove());
    let badge=badges[0];
    if(!badge){badge=document.createElement('strong');badge.dataset.adminFinalRowBadge='true';badge.className='ll-admin-final-row-badge';section.appendChild(badge)}
    if(badge.textContent!=='FINAL DOC • REVIEW THIS')badge.textContent='FINAL DOC • REVIEW THIS';
  });
}
function scheduleNormalize(delay=0){window.clearTimeout(normalizeTimer);normalizeTimer=window.setTimeout(normalize,delay)}

async function refresh(applicationId:string){
  if(!applicationId||loading||!token())return;
  const version=++requestVersion;loading=true;
  try{
    const data=await rpc<Pipeline>('admin_get_litlab_contributor_pipeline',{p_application_id:applicationId});
    if(version!==requestVersion||applicationId!==activeApplicationId)return;
    currentPipeline=data;scheduleNormalize();
  }catch(error){if(applicationId===activeApplicationId)console.debug('Final document highlight unavailable',error)}finally{loading=false}
}

window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{
  const detail=(event as CustomEvent<OpenEvent>).detail||{};const nextId=String(detail.applicationId||'');if(!nextId)return;
  const changed=nextId!==activeApplicationId;activeApplicationId=nextId;if(changed){currentPipeline=null;requestVersion++}
  if(currentPipeline)scheduleNormalize();
  void refresh(activeApplicationId);
});
window.addEventListener('litlab:admin-contributor-workspace-updated',()=>{if(activeApplicationId)void refresh(activeApplicationId)});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const openFinal=target?.closest<HTMLButtonElement>('[data-open-final-admin-doc]');if(!openFinal)return;
  const finalButton=document.querySelector<HTMLButtonElement>('#ll-admin-contributor-workspace .ll-admin-doc-list > div.ll-admin-final-doc-row [data-admin-download-doc]');if(!finalButton)return;
  event.preventDefault();event.stopImmediatePropagation();finalButton.click();
},true);

window.addEventListener('hashchange',()=>{if(route()==='admin-contributors')return;activeApplicationId='';currentPipeline=null;requestVersion++;window.clearTimeout(normalizeTimer)});
window.addEventListener('focus',()=>{if(activeApplicationId&&route()==='admin-contributors')scheduleNormalize()});

export {};
