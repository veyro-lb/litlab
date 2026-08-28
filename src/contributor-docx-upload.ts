import './contributor-docx-upload.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const DOCX_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_DOCX_BYTES=15*1024*1024;
const REQUEST_TIMEOUT_MS=30_000;

type StoredSession={access_token?:string};

type RpcErrorBody={message?:string;error?:string;error_description?:string;hint?:string;details?:string};

let uploading=false;
let activePortal:HTMLElement|null=null;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function userId(){
  try{
    const part=token().split('.')[1];if(!part)return '';
    const normalized=part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=');
    return String(JSON.parse(atob(normalized))?.sub||'');
  }catch{return ''}
}
function encodedPath(path:string){return path.split('/').map(encodeURIComponent).join('/')}
function randomId(){
  if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
function stateFor(form:HTMLFormElement){return form.querySelector<HTMLElement>('[data-upload-state]')}
function setState(form:HTMLFormElement,text:string,kind:''|'error'|'success'=''){
  const state=stateFor(form);if(!state)return;state.textContent=text;if(kind)state.dataset.state=kind;else delete state.dataset.state;
}
async function responseMessage(response:Response){
  const fallback=`Request failed (${response.status})`;
  try{
    const text=await response.text();if(!text)return fallback;
    try{const body=JSON.parse(text) as RpcErrorBody;return body.message||body.error_description||body.error||body.details||body.hint||fallback}catch{return text.slice(0,240)||fallback}
  }catch{return fallback}
}
async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const auth=token();if(!auth)throw new Error('Your LitLab sign-in has expired. Sign in again, then retry the upload.');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok)throw new Error(await responseMessage(response));
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw new Error('LitLab took too long to respond. Your file was not submitted; please retry.');throw error}
  finally{window.clearTimeout(timeout)}
}
async function looksLikeDocx(file:File){
  if(!file.name.toLowerCase().endsWith('.docx'))return false;
  try{const bytes=new Uint8Array(await file.slice(0,4).arrayBuffer());return bytes.length>=2&&bytes[0]===0x50&&bytes[1]===0x4b}catch{return false}
}

function endPortal(){
  activePortal?.remove();activePortal=null;
  document.documentElement.removeAttribute('data-litlab-docx-upload-session');
}
function ensurePortal(form:HTMLFormElement){
  if(activePortal?.isConnected)return;
  const card=form.closest<HTMLElement>('.ll-workspace-docs');
  const workspace=document.querySelector<HTMLElement>('[data-contributor-workspace]');
  if(!card||!workspace)return;
  const portal=document.createElement('section');
  portal.className='ll-docx-upload-session';portal.dataset.docxUploadSession='true';
  portal.innerHTML='<div class="ll-docx-upload-session-bar"><div><span>WORD DOCUMENT UPLOAD</span><b>Your selected file is protected from page refreshes.</b></div><button type="button" data-docx-session-cancel>Cancel</button></div>';
  workspace.insertAdjacentElement('afterend',portal);portal.appendChild(card);activePortal=portal;
  document.documentElement.setAttribute('data-litlab-docx-upload-session','true');
  portal.querySelector('[data-docx-session-cancel]')?.addEventListener('click',()=>{if(uploading)return;endPortal();window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated'))});
  requestAnimationFrame(()=>portal.scrollIntoView({behavior:'smooth',block:'center'}));
}

async function cleanup(path:string){
  try{await fetch(`${SUPABASE_URL}/storage/v1/object/contributor-documents/${encodedPath(path)}`,{method:'DELETE',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`}})}catch{}
}
function friendlyUploadFailure(status:number,message:string){
  const lower=message.toLowerCase();
  if(status===401)return 'Your LitLab sign-in expired. Sign in again and retry the Word document.';
  if(status===403||lower.includes('row-level security')||lower.includes('policy'))return 'LitLab blocked this upload. Word submissions are available only for your own student contribution after it is Accepted or marked Needs review.';
  if(status===413)return 'This Word document is too large. The maximum size is 15 MB.';
  if(status>=500)return 'LitLab file storage is temporarily unavailable. Your file was not lost—please retry in a moment.';
  return message||`Upload failed (${status}). Please retry.`;
}

async function submitDocx(form:HTMLFormElement,applicationId:string){
  if(uploading)return;
  const auth=token();const uid=userId();
  if(!auth||!uid){setState(form,'Your LitLab sign-in expired. Sign in again before uploading.','error');return}
  if(!navigator.onLine){setState(form,'You are offline. Reconnect before uploading the Word document.','error');return}
  if(!form.checkValidity()){
    const missingConfirmations=Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][required]')).some(box=>!box.checked);
    setState(form,missingConfirmations?'Confirm the originality and source checklist before submitting.':'Complete the required upload fields before submitting.','error');
    form.reportValidity();return;
  }
  const data=new FormData(form);const file=data.get('docx');
  if(!(file instanceof File)||!file.size){setState(form,'Choose a Microsoft Word .docx file first.','error');return}
  if(file.size>MAX_DOCX_BYTES){setState(form,'The Word document must be 15 MB or smaller.','error');return}
  if(!await looksLikeDocx(file)){setState(form,'That file is not a valid .docx Word document. Please save it as .docx and try again.','error');return}

  ensurePortal(form);
  const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');const cancel=activePortal?.querySelector<HTMLButtonElement>('[data-docx-session-cancel]');
  const path=`${applicationId}/${uid}/${randomId()}.docx`;
  uploading=true;if(button){button.disabled=true;button.textContent='Uploading Word document…'}if(cancel)cancel.disabled=true;
  setState(form,'Uploading privately to LitLab…');
  try{
    const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
    let upload:Response;
    try{
      upload=await fetch(`${SUPABASE_URL}/storage/v1/object/contributor-documents/${encodedPath(path)}`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`,'Content-Type':DOCX_MIME,'x-upsert':'false','Cache-Control':'no-store'},body:file,signal:controller.signal});
    }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw new Error('The file upload timed out. Please retry on a stable connection.');throw error}
    finally{window.clearTimeout(timeout)}
    if(!upload.ok){const message=await responseMessage(upload);throw new Error(friendlyUploadFailure(upload.status,message))}

    try{
      await rpc('register_my_litlab_contributor_document',{p_application_id:applicationId,p_storage_path:path,p_original_name:file.name,p_file_size:file.size,p_version_label:String(data.get('version')||'Draft'),p_note:String(data.get('note')||'').trim()||null});
    }catch(error){await cleanup(path);throw error}

    setState(form,'Word document submitted successfully. LitLab can now review this version.','success');
    form.reset();
    window.setTimeout(()=>{endPortal();window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated'))},650);
  }catch(error){
    console.error('LitLab DOCX upload failed',error);
    const message=error instanceof Error?error.message:'The Word document could not be uploaded. Please retry.';
    setState(form,message,'error');
  }finally{
    uploading=false;if(button?.isConnected){button.disabled=false;button.textContent='Submit Word document'}if(cancel?.isConnected)cancel.disabled=false;
  }
}

// Preserve a selected FileList outside the auto-refreshed workspace before the
// 20-second workspace refresh can replace the input element.
document.addEventListener('change',event=>{
  const input=event.target instanceof HTMLInputElement?event.target:null;
  if(!input||input.type!=='file'||input.name!=='docx'||!input.files?.length)return;
  const form=input.closest<HTMLFormElement>('form[data-docx-upload]');if(!form)return;
  ensurePortal(form);setState(form,`${input.files[0].name} selected. Complete the checklist, then submit.`);
},true);

// Registered before contributor-workspace.ts. Own DOCX submissions so generic
// browser MIME reporting cannot reject a valid Word file before Storage sees it.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  const applicationId=form?.dataset.docxUpload||'';
  if(!form||!applicationId)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  void submitDocx(form,applicationId);
},true);

window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#contribute'))endPortal()});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY&&!token())endPortal()});

export {};
