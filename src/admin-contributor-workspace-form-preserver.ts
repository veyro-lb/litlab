type SavedForm={values:Record<string,string>;focusedName:string;selectionStart:number|null;selectionEnd:number|null};
const drafts=new Map<string,SavedForm>();
let modalObserver:MutationObserver|null=null;
let observedModal:HTMLElement|null=null;
let attachQueued=false;

function formKey(form:HTMLFormElement){
  const modal=form.closest<HTMLElement>('#ll-admin-contributor-workspace');
  if(!modal)return '';
  const card=document.querySelector<HTMLElement>('.admin-contrib-card[data-app-id] [data-admin-manage-workspace]')?.closest<HTMLElement>('.admin-contrib-card');
  const id=card?.dataset.appId||document.querySelector<HTMLElement>('#ll-admin-contributor-workspace')?.dataset.applicationId||'active';
  const kind=form.matches('[data-admin-brief]')?'brief':form.matches('[data-admin-add-task]')?'task':form.matches('[data-admin-add-revision]')?'revision':form.matches('[data-admin-assign-teacher]')?'teacher':'';
  return kind?`${id}:${kind}`:'';
}

function controls(form:HTMLFormElement){return Array.from(form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[name]'))}
function snapshot(form:HTMLFormElement){
  const key=formKey(form);if(!key)return;
  const values:Record<string,string>={};controls(form).forEach(control=>values[control.name]=control.value);
  const active=document.activeElement;
  const focused=active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement?active:null;
  drafts.set(key,{values,focusedName:focused?.closest('form')===form?focused.name:'',selectionStart:focused?.selectionStart??null,selectionEnd:focused?.selectionEnd??null});
}

function restore(form:HTMLFormElement){
  const key=formKey(form);if(!key)return;
  const saved=drafts.get(key);if(!saved)return;
  controls(form).forEach(control=>{if(Object.prototype.hasOwnProperty.call(saved.values,control.name))control.value=saved.values[control.name]});
  if(!saved.focusedName)return;
  const control=form.elements.namedItem(saved.focusedName);
  if(!(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement))return;
  requestAnimationFrame(()=>{
    if(!control.isConnected)return;
    control.focus({preventScroll:true});
    if(saved.selectionStart!=null&&saved.selectionEnd!=null){try{control.setSelectionRange(saved.selectionStart,saved.selectionEnd)}catch{}}
  });
}

function restoreAll(){
  const modal=document.getElementById('ll-admin-contributor-workspace');if(!modal)return;
  modal.querySelectorAll<HTMLFormElement>('form[data-admin-brief],form[data-admin-add-task],form[data-admin-add-revision],form[data-admin-assign-teacher]').forEach(restore);
}

function attach(){
  attachQueued=false;
  const modal=document.getElementById('ll-admin-contributor-workspace');
  if(!modal){modalObserver?.disconnect();modalObserver=null;observedModal=null;return}
  if(observedModal===modal)return;
  modalObserver?.disconnect();observedModal=modal;
  modalObserver=new MutationObserver(()=>restoreAll());
  modalObserver.observe(modal,{childList:true,subtree:true});
  restoreAll();
}
function queueAttach(){if(attachQueued)return;attachQueued=true;requestAnimationFrame(attach)}

// Save draft fields locally as the admin types. This is browser-session state only and is
// cleared as soon as a form is deliberately submitted.
document.addEventListener('input',event=>{const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-admin-contributor-workspace form');if(form)snapshot(form)},true);
document.addEventListener('change',event=>{const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-admin-contributor-workspace form');if(form)snapshot(form)},true);
document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(!form?.closest('#ll-admin-contributor-workspace'))return;const key=formKey(form);if(key)drafts.delete(key)},true);

const bodyObserver=new MutationObserver(mutations=>{
  if(mutations.some(mutation=>Array.from(mutation.addedNodes).some(node=>node instanceof HTMLElement&&(node.id==='ll-admin-contributor-workspace'||Boolean(node.querySelector?.('#ll-admin-contributor-workspace'))))))queueAttach();
  if(observedModal&&!observedModal.isConnected)queueAttach();
});
bodyObserver.observe(document.body,{childList:true});
window.addEventListener('hashchange',()=>{if(location.hash.replace(/^#/,'').split('?')[0].split('#')[0]!=='admin-contributors'){drafts.clear();modalObserver?.disconnect();modalObserver=null;observedModal=null}else queueAttach()});

queueAttach();
export {};
