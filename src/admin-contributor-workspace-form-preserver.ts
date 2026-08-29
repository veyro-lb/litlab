type SavedControl={value:string;checked?:boolean};
type SavedForm={values:Record<string,SavedControl>;focusedName:string;selectionStart:number|null;selectionEnd:number|null};
const drafts=new Map<string,SavedForm>();
let modalObserver:MutationObserver|null=null;
let observedModal:HTMLElement|null=null;
let attachQueued=false;

function formKey(form:HTMLFormElement){
  if(!form.closest('#ll-admin-contributor-workspace'))return '';
  if(form.matches('[data-admin-brief]'))return 'brief';
  if(form.matches('[data-admin-add-task]'))return 'task';
  if(form.matches('[data-admin-add-revision]'))return 'revision';
  if(form.matches('[data-admin-assign-teacher]'))return 'teacher';
  if(form.matches('[data-admin-v3-publication-form]'))return 'publication';
  return '';
}

function modal(){return document.getElementById('ll-admin-contributor-workspace')}
function controls(form:HTMLFormElement){return Array.from(form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('[name]'))}
function syncDirtyState(){const host=modal();if(host)host.dataset.formDirty=drafts.size?'true':'false'}

function snapshot(form:HTMLFormElement){
  const key=formKey(form);if(!key)return;
  const values:Record<string,SavedControl>={};
  controls(form).forEach(control=>{
    values[control.name]={value:control.value,...(control instanceof HTMLInputElement&&(control.type==='checkbox'||control.type==='radio')?{checked:control.checked}:{})};
  });
  const active=document.activeElement;
  const focused=active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement?active:null;
  drafts.set(key,{values,focusedName:focused?.closest('form')===form?focused.name:'',selectionStart:focused?.selectionStart??null,selectionEnd:focused?.selectionEnd??null});
  syncDirtyState();
}

function restore(form:HTMLFormElement){
  const key=formKey(form);if(!key)return;
  const saved=drafts.get(key);if(!saved)return;
  controls(form).forEach(control=>{
    const value=saved.values[control.name];if(!value)return;
    control.value=value.value;
    if(control instanceof HTMLInputElement&&(control.type==='checkbox'||control.type==='radio')&&typeof value.checked==='boolean')control.checked=value.checked;
  });
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
  const host=modal();if(!host)return;
  host.querySelectorAll<HTMLFormElement>('form[data-admin-brief],form[data-admin-add-task],form[data-admin-add-revision],form[data-admin-assign-teacher],form[data-admin-v3-publication-form]').forEach(restore);
  syncDirtyState();
}

function clearDraft(key:string){if(!key)return;drafts.delete(key);syncDirtyState()}
function clearAll(){drafts.clear();syncDirtyState()}

function attach(){
  attachQueued=false;
  const host=modal();
  if(!host){modalObserver?.disconnect();modalObserver=null;observedModal=null;clearAll();return}
  if(observedModal===host){restoreAll();return}
  modalObserver?.disconnect();clearAll();observedModal=host;
  modalObserver=new MutationObserver(()=>restoreAll());
  modalObserver.observe(host,{childList:true,subtree:true});
}
function queueAttach(){if(attachQueued)return;attachQueued=true;requestAnimationFrame(attach)}

// Keep unsaved admin input stable across any workspace redraw. Drafts live only in memory
// for the currently-open contributor and are cleared after a confirmed successful save.
document.addEventListener('input',event=>{const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-admin-contributor-workspace form');if(form)snapshot(form)},true);
document.addEventListener('change',event=>{const form=(event.target as Element|null)?.closest<HTMLFormElement>('#ll-admin-contributor-workspace form');if(form)snapshot(form)},true);
window.addEventListener('litlab:admin-contributor-form-saved',event=>{const detail=(event as CustomEvent<{formKey?:string}>).detail||{};clearDraft(String(detail.formKey||''))});
window.addEventListener('litlab:admin-contributor-workspace-opened',()=>queueAttach());

const bodyObserver=new MutationObserver(mutations=>{
  if(mutations.some(mutation=>Array.from(mutation.addedNodes).some(node=>node instanceof HTMLElement&&(node.id==='ll-admin-contributor-workspace'||Boolean(node.querySelector('#ll-admin-contributor-workspace'))))))queueAttach();
  if(observedModal&&!observedModal.isConnected)queueAttach();
});
bodyObserver.observe(document.body,{childList:true});
window.addEventListener('hashchange',()=>{if(location.hash.replace(/^#/,'').split('?')[0].split('#')[0]!=='admin-contributors'){clearAll();modalObserver?.disconnect();modalObserver=null;observedModal=null}else queueAttach()});

queueAttach();
export {};
