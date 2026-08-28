import './contributor-delete.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=15_000;

type StoredSession={access_token?:string};
type DeleteDoc={storage_path:string;original_name?:string|null};
type DeleteContext={id:string;title:string;status:string;applicant_type:string;is_admin:boolean;documents:DeleteDoc[]};

let activeId='';
let activeAdmin=false;
let activeContext:DeleteContext|null=null;
let deleting=false;

function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||'')}catch{return ''}}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function encodedPath(path:string){return path.split('/').map(encodeURIComponent).join('/')}

async function rpc<T>(name:string,body:Record<string,unknown>):Promise<T>{
  const auth=token();if(!auth)throw new Error('Sign in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const data=await response.json() as {message?:string};if(data.message)message=data.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

async function removeStoredDocument(path:string){
  const response=await fetch(`${SUPABASE_URL}/storage/v1/object/contributor-documents/${encodedPath(path)}`,{method:'DELETE',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`}});
  if(!response.ok&&response.status!==404)throw new Error(`Could not remove a private Word file (${response.status}).`);
}

function modal(){return document.getElementById('ll-contributor-delete-modal')}
function close(){if(deleting)return;activeId='';activeAdmin=false;activeContext=null;modal()?.remove()}
function setState(text:string,kind=''){const state=modal()?.querySelector<HTMLElement>('[data-delete-state]');if(state){state.textContent=text;state.dataset.state=kind}}

function shell(){
  modal()?.remove();
  const overlay=document.createElement('div');overlay.id='ll-contributor-delete-modal';overlay.className='ll-contributor-delete-overlay';
  overlay.innerHTML=`<section class="ll-contributor-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="ll-delete-title"><header><div><span>PERMANENT ACTION</span><h2 id="ll-delete-title">Delete contribution?</h2></div><button type="button" data-delete-close aria-label="Close">×</button></header><div class="ll-contributor-delete-body"><div class="ll-contributor-delete-loading"><i></i><p>Checking this contribution before deletion…</p></div></div></section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
  overlay.querySelector('[data-delete-close]')?.addEventListener('click',close);
  document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('is-open'));
}

function renderContext(ctx:DeleteContext){
  const body=modal()?.querySelector<HTMLElement>('.ll-contributor-delete-body');if(!body)return;
  const completed=ctx.status==='completed';
  body.innerHTML=`<div class="ll-delete-summary"><span>${esc(ctx.applicant_type==='teacher'?'TEACHER CONTRIBUTION':'STUDENT CONTRIBUTION')}</span><h3>${esc(ctx.title||'Contribution')}</h3><p>Status: <b>${esc(label(ctx.status))}</b></p></div>
    <div class="ll-delete-warning"><b>This cannot be undone.</b><p>Deleting this contribution permanently removes the application and its contributor workspace, private chat, tasks, revisions, activity/evidence records, teacher reviews${ctx.documents.length?`, ${ctx.documents.length} private Word file${ctx.documents.length===1?'':'s'}`:''}${completed?', and its completed contribution/certificate record':''}.</p>${ctx.is_admin?'<p>It will disappear from both the contributor account and the admin dashboard.</p>':'<p>It will disappear from your LitLab account and cannot be restored by you later.</p>'}</div>
    <label class="ll-delete-confirm-label"><span>Type <b>DELETE</b> to confirm</span><input autocomplete="off" spellcheck="false" data-delete-confirm-input placeholder="DELETE"/></label>
    <div class="ll-delete-actions"><button type="button" class="secondary" data-delete-cancel>Cancel</button><button type="button" class="danger" data-delete-confirm disabled>Delete permanently</button></div>
    <p data-delete-state role="status" aria-live="polite"></p>`;
  const input=body.querySelector<HTMLInputElement>('[data-delete-confirm-input]');
  const confirm=body.querySelector<HTMLButtonElement>('[data-delete-confirm]');
  input?.addEventListener('input',()=>{if(confirm)confirm.disabled=input.value.trim()!=='DELETE'});
  input?.addEventListener('keydown',event=>{if(event.key==='Enter'&&confirm&&!confirm.disabled){event.preventDefault();confirm.click()}});
  body.querySelector('[data-delete-cancel]')?.addEventListener('click',close);
  confirm?.addEventListener('click',()=>void performDelete(confirm));
  input?.focus();
}

async function openDelete(applicationId:string,admin:boolean){
  if(!applicationId||deleting)return;
  activeId=applicationId;activeAdmin=admin;activeContext=null;shell();
  try{
    const ctx=await rpc<DeleteContext>('get_litlab_contributor_deletion_context',{p_application_id:applicationId});
    if(activeId!==applicationId||!modal())return;
    activeContext={...ctx,documents:Array.isArray(ctx.documents)?ctx.documents:[]};
    renderContext(activeContext);
  }catch(error){
    console.error(error);const body=modal()?.querySelector<HTMLElement>('.ll-contributor-delete-body');
    if(body)body.innerHTML=`<div class="ll-delete-error"><b>Deletion could not be prepared.</b><p>${esc(error instanceof Error?error.message:'Check your connection and try again.')}</p><button type="button" data-delete-cancel>Close</button></div>`;
    body?.querySelector('[data-delete-cancel]')?.addEventListener('click',close);
  }
}

function removeDeletedDom(applicationId:string){
  document.querySelectorAll<HTMLElement>(`[data-history-contribution="${CSS.escape(applicationId)}"],.admin-contrib-card[data-app-id="${CSS.escape(applicationId)}"]`).forEach(node=>node.remove());
  document.querySelectorAll<HTMLElement>(`[data-chat-open][data-application-id="${CSS.escape(applicationId)}"]`).forEach(node=>node.closest('.ll-chat-thread')?.remove());
  const workspaceModal=document.getElementById('ll-admin-contributor-workspace');
  if(activeAdmin&&workspaceModal)workspaceModal.querySelector<HTMLButtonElement>('[data-admin-workspace-close]')?.click();
}

function syncAfterDelete(applicationId:string){
  removeDeletedDom(applicationId);
  window.dispatchEvent(new CustomEvent('litlab:contributor-deleted',{detail:{applicationId,admin:activeAdmin}}));
  window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{applicationId,deleted:true}}));
  window.dispatchEvent(new CustomEvent('litlab:contributor-admin-updated',{detail:{id:applicationId,deleted:true}}));
  window.setTimeout(()=>{
    const history=document.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]');if(history&&!history.disabled)history.click();
    const admin=document.querySelector<HTMLButtonElement>('[data-contrib-refresh]');if(admin&&!admin.disabled)admin.click();
  },140);
}

async function performDelete(button:HTMLButtonElement){
  const ctx=activeContext;if(!ctx||deleting)return;
  deleting=true;
  const cancel=modal()?.querySelector<HTMLButtonElement>('[data-delete-cancel]');const closeButton=modal()?.querySelector<HTMLButtonElement>('[data-delete-close]');
  button.disabled=true;if(cancel)cancel.disabled=true;if(closeButton)closeButton.disabled=true;
  try{
    const docs=ctx.documents||[];
    for(let index=0;index<docs.length;index+=1){
      setState(`Removing private Word files… ${index+1} of ${docs.length}`);
      await removeStoredDocument(docs[index].storage_path);
    }
    setState('Deleting contribution record…');
    await rpc<boolean>('delete_litlab_contribution',{p_application_id:ctx.id});
    setState('Contribution deleted.','success');
    syncAfterDelete(ctx.id);
    deleting=false;
    window.setTimeout(()=>{activeId='';activeAdmin=false;activeContext=null;modal()?.remove()},360);
  }catch(error){
    console.error(error);deleting=false;button.disabled=false;if(cancel)cancel.disabled=false;if(closeButton)closeButton.disabled=false;
    setState(error instanceof Error?error.message:'The contribution could not be deleted.','error');
  }
}

function addButton(container:HTMLElement,applicationId:string,admin:boolean,variant:'history'|'workspace'|'admin'){
  if(!applicationId||container.querySelector(`[data-delete-contribution="${CSS.escape(applicationId)}"]`))return;
  const button=document.createElement('button');button.type='button';button.dataset.deleteContribution=applicationId;button.dataset.deleteAdmin=admin?'true':'false';button.className=`ll-delete-contribution-button is-${variant}`;button.textContent='Delete contribution';button.title='Permanently delete this contribution and its saved record';
  container.appendChild(button);
}

function enhanceWithin(root:ParentNode){
  const histories:HTMLDetailsElement[]=[];
  if(root instanceof HTMLDetailsElement&&root.matches('[data-history-contribution]'))histories.push(root);
  root.querySelectorAll<HTMLDetailsElement>('[data-history-contribution]').forEach(item=>histories.push(item));
  histories.forEach(details=>{const actions=details.querySelector<HTMLElement>('.ll-history-actions');const id=details.dataset.historyContribution||details.dataset.applicationId||'';if(actions)addButton(actions,id,false,'history')});

  const statuses:HTMLElement[]=[];
  if(root instanceof HTMLElement&&root.matches('.ll-workspace-status'))statuses.push(root);
  root.querySelectorAll<HTMLElement>('.ll-workspace-status').forEach(item=>statuses.push(item));
  statuses.forEach(status=>{const id=status.querySelector<HTMLElement>('[data-chat-open][data-application-id]')?.dataset.applicationId||'';if(id)addButton(status,id,false,'workspace')});

  const cards:HTMLElement[]=[];
  if(root instanceof HTMLElement&&root.matches('.admin-contrib-card[data-app-id]'))cards.push(root);
  root.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach(item=>cards.push(item));
  cards.forEach(card=>{const strip=card.querySelector<HTMLElement>('.admin-contrib-chat-strip');const id=card.dataset.appId||'';if(strip)addButton(strip,id,true,'admin')});
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-delete-contribution]');
  if(button){event.preventDefault();event.stopPropagation();void openDelete(button.dataset.deleteContribution||'',button.dataset.deleteAdmin==='true');return}
  if(target.closest('[data-delete-close]')&&!deleting)close();
},true);

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal()&&!deleting){event.preventDefault();close()}},true);

const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations)for(const node of Array.from(mutation.addedNodes))if(node instanceof HTMLElement)enhanceWithin(node);
});
function start(){enhanceWithin(document);observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
