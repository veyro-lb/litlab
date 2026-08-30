import './contributor-revision-submit-guide.css';

type Row=Record<string,any>;
type Workspace=Row&{id:string;applicant_type?:string;documents?:Row[];reviews?:Row[];revisions?:Row[]};
type WorkspaceEvent={selectedId?:string;workspaces?:Workspace[]};

let workspaces:Workspace[]=[];
let selectedId='';
let scheduled=false;
let toastTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function current(){return workspaces.find(item=>item.id===selectedId)||workspaces[0]||null}
function stamp(value:unknown){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}
function latest<T extends Row>(rows:T[]){return rows.slice().sort((a,b)=>stamp(b.created_at)-stamp(a.created_at))[0]||null}
function docs(app:Workspace|null){return Array.isArray(app?.documents)?app!.documents!:[]}
function reviews(app:Workspace|null){return Array.isArray(app?.reviews)?app!.reviews!:[]}
function revisions(app:Workspace|null){return Array.isArray(app?.revisions)?app!.revisions!:[]}
function role(){return document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||current()?.applicant_type||''}
function visible<T extends HTMLElement>(el:T|null|undefined):el is T{return Boolean(el&&el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden')}
function motion(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto' as const:'smooth' as const}

function revisionSource(app:Workspace|null){
  if(!app||role()!=='student')return '' as const;
  const latestDoc=latest(docs(app));
  const docTime=stamp(latestDoc?.created_at);
  const admin=revisions(app).some(item=>String(item.status||'').toLowerCase()!=='resolved'&&stamp(item.created_at)>docTime);
  if(admin)return 'admin' as const;
  const teacher=reviews(app).some(item=>String(item.recommendation||'').toLowerCase()==='request_changes'&&stamp(item.created_at)>docTime);
  if(teacher)return 'teacher' as const;
  return '' as const;
}

function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function nativeSubmissionButton(){return guide()?.querySelector<HTMLButtonElement>('[data-section-key="submission"]')||null}
function activeUpload(){
  const host=document.querySelector<HTMLElement>('[data-contributor-workspace]');if(!host)return null;
  return Array.from(host.querySelectorAll<HTMLFormElement>('.ll-docx-form,form[data-docx-upload]')).find(form=>visible(form)&&!form.classList.contains('is-lifecycle-locked')&&!Array.from(form.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement|HTMLTextAreaElement>('input,button,select,textarea')).every(control=>control.disabled))||null;
}
function submissionCard(){return document.querySelector<HTMLElement>('[data-contributor-workspace] .ll-workspace-docs')}
function legacyRevisionButton(){return guide()?.querySelector<HTMLButtonElement>('.ll-revision-submit-guide:not([data-section-key="submission"])')||null}
function nativeLocked(button:HTMLButtonElement){return button.classList.contains('locked')||button.hasAttribute('data-contributor-locked')||button.getAttribute('aria-disabled')==='true'}

function rememberNative(button:HTMLButtonElement){
  if(button.dataset.revisionSubmissionOwned==='true')return;
  button.dataset.revisionSubmissionOwned='true';
  button.dataset.revisionSubmissionLabel=button.textContent||'Submission';
  button.dataset.revisionSubmissionAria=button.getAttribute('aria-label')||'';
  button.dataset.revisionSubmissionTitle=button.getAttribute('title')||'';
}
function restoreNative(button:HTMLButtonElement|null){
  if(!button||button.dataset.revisionSubmissionOwned!=='true')return;
  button.textContent=button.dataset.revisionSubmissionLabel||'Submission';
  const aria=button.dataset.revisionSubmissionAria||'';
  const title=button.dataset.revisionSubmissionTitle||'';
  if(aria)button.setAttribute('aria-label',aria);else button.removeAttribute('aria-label');
  if(title)button.setAttribute('title',title);else button.removeAttribute('title');
  button.classList.remove('ll-revision-native-submission');
  button.removeAttribute('data-revision-submit-guide');
  button.removeAttribute('data-revision-source');
  delete button.dataset.revisionSubmissionOwned;
  delete button.dataset.revisionSubmissionLabel;
  delete button.dataset.revisionSubmissionAria;
  delete button.dataset.revisionSubmissionTitle;
}
function showToast(message:string){
  const bar=guide();if(!bar)return;
  let toast=bar.querySelector<HTMLElement>('[data-revision-submit-toast]');
  if(!toast){toast=document.createElement('div');toast.dataset.revisionSubmitToast='true';toast.className='ll-revision-submit-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');bar.append(toast)}
  clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
  toastTimer=window.setTimeout(()=>{if(toast?.isConnected){toast.hidden=true;toast.textContent=''}},4200);
}
function focusUpload(form:HTMLFormElement){
  form.scrollIntoView({behavior:motion(),block:'start'});
  form.classList.add('ll-revision-upload-focus');
  window.setTimeout(()=>form.classList.remove('ll-revision-upload-focus'),1100);
  const file=form.querySelector<HTMLInputElement>('input[type="file"]:not([disabled])');
  const fallback=form.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])');
  window.setTimeout(()=>{(file||fallback)?.focus({preventScroll:true})},motion()==='auto'?0:260);
}
function openRevisionSubmission(){
  const form=activeUpload();if(form){focusUpload(form);return}
  window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{source:'revision-guide'}}));
  window.setTimeout(()=>{
    const retry=activeUpload();if(retry){focusUpload(retry);return}
    const card=submissionCard();
    if(card&&visible(card)){
      card.scrollIntoView({behavior:motion(),block:'start'});
      showToast('Your revision area is here. The upload control is still syncing; it will open when the revision turn is ready.');
      return;
    }
    showToast('The revision upload area is still loading. Please try again in a moment.');
  },140);
}

function render(){
  scheduled=false;
  legacyRevisionButton()?.remove();
  const bar=guide();const app=current();const source=revisionSource(app);const native=nativeSubmissionButton();
  if(route()!=='contribute'||!bar||!source){restoreNative(native);return}
  if(!native||nativeLocked(native)){restoreNative(native);return}

  rememberNative(native);
  native.dataset.revisionSubmitGuide='true';
  native.dataset.revisionSource=source;
  native.classList.add('ll-revision-native-submission');
  native.textContent='Submit revision';
  native.setAttribute('aria-label',source==='teacher'?'Submit revision requested by your teacher':'Submit revision requested by LitLab');
  native.title=source==='teacher'?'Your teacher requested changes. Open the reopened DOCX upload.':'LitLab requested changes. Open the reopened DOCX upload.';
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(render)}

window.addEventListener('click',event=>{
  if(route()!=='contribute')return;
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest<HTMLButtonElement>('[data-section-key="submission"][data-revision-submit-guide="true"]');
  if(!button||nativeLocked(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  openRevisionSubmission();
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  if(typeof detail.selectedId==='string')selectedId=detail.selectedId;
  schedule();
});
for(const name of ['litlab:contributor-workspace-updated','litlab:contributor-admin-updated','litlab:contributor-submitted','litlab:contributor-account-role'])window.addEventListener(name,schedule);
window.addEventListener('hashchange',schedule);window.addEventListener('focus',schedule);

const observer=new MutationObserver(records=>{if(route()!=='contribute')return;if(records.some(record=>Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches('[data-contributor-state-guide],.ll-docx-form,.ll-workspace-docs')||Boolean(node.querySelector('[data-contributor-state-guide],.ll-docx-form,.ll-workspace-docs'))))))schedule()});
function start(){observer.observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
