const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type Pipeline={application_id:string;applicant_type?:string;latest_document?:{id?:string;is_final_submission?:boolean}|null};
type OpenEvent={applicationId?:string};

let activeApplicationId='';
let currentPipeline:Pipeline|null=null;
let observer:MutationObserver|null=null;
let normalizeTimer=0;
let loading=false;

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
  if(row.classList.contains('ll-admin-final-doc-row'))row.classList.remove('ll-admin-final-doc-row');
  row.querySelectorAll('[data-admin-final-row-badge]').forEach(badge=>badge.remove());
  delete row.dataset.finalDocumentId;
}

function normalize(){
  const modal=document.getElementById('ll-admin-contributor-workspace');
  const rows=Array.from(modal?.querySelectorAll<HTMLElement>('.ll-admin-doc-list > div')||[]);
  if(!rows.length)return;

  const doc=currentPipeline?.latest_document;
  const shouldHighlight=Boolean(currentPipeline?.applicant_type==='student'&&doc?.id&&doc.is_final_submission===true);
  const finalRow=shouldHighlight?rows[0]:null;

  rows.forEach(row=>{
    if(row!==finalRow){clearRow(row);return}
    row.classList.add('ll-admin-final-doc-row');
    row.dataset.finalDocumentId=String(doc?.id||'');
    const section=row.querySelector<HTMLElement>('section');
    if(!section)return;
    let badge=section.querySelector<HTMLElement>('[data-admin-final-row-badge]');
    section.querySelectorAll<HTMLElement>('[data-admin-final-row-badge]').forEach((item,index)=>{if(index>0)item.remove()});
    if(!badge){badge=document.createElement('strong');badge.dataset.adminFinalRowBadge='true';badge.className='ll-admin-final-row-badge';section.appendChild(badge)}
    badge.textContent='FINAL DOC • REVIEW THIS';
  });
}

function scheduleNormalize(){window.clearTimeout(normalizeTimer);normalizeTimer=window.setTimeout(normalize,0)}

function watchModal(){
  observer?.disconnect();observer=null;
  if(route()!=='admin-contributors')return;
  observer=new MutationObserver(()=>scheduleNormalize());
  observer.observe(document.body,{childList:true,subtree:true});
}

async function refresh(applicationId:string){
  if(!applicationId||loading||!token())return;
  loading=true;
  try{
    const data=await rpc<Pipeline>('admin_get_litlab_contributor_pipeline',{p_application_id:applicationId});
    if(applicationId!==activeApplicationId)return;
    currentPipeline=data;
    scheduleNormalize();
  }catch(error){console.debug('Final document highlight guard unavailable',error)}finally{loading=false}
}

window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{
  const detail=(event as CustomEvent<OpenEvent>).detail||{};
  activeApplicationId=String(detail.applicationId||'');
  currentPipeline=null;
  watchModal();
  void refresh(activeApplicationId);
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const openFinal=target?.closest<HTMLButtonElement>('[data-open-final-admin-doc]');
  if(!openFinal)return;
  const finalButton=document.querySelector<HTMLButtonElement>('#ll-admin-contributor-workspace .ll-admin-doc-list > div.ll-admin-final-doc-row [data-admin-download-doc]');
  if(!finalButton)return;
  event.preventDefault();event.stopImmediatePropagation();finalButton.click();
},true);

window.addEventListener('hashchange',()=>{
  activeApplicationId='';currentPipeline=null;observer?.disconnect();observer=null;window.clearTimeout(normalizeTimer);
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchModal,{once:true});else watchModal();

export {};
