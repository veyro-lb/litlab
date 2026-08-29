type WorkspaceDetail={selectedId?:string;workspaces?:unknown[];assignments?:unknown[];source?:string};
type FieldState={value?:string;checked?:boolean;selected?:string[]};
type Draft={fields:Record<string,FieldState>;focusName?:string;selectionStart?:number|null;selectionEnd?:number|null;savedAt:number};

let workspaceSignature='';
let adminApplicationId='';
const drafts=new Map<string,Draft>();

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function stable(value:unknown){try{return JSON.stringify(value)}catch{return String(value??'')}}

/* Contributor workspace data is broadcast after every poll, even when nothing changed.
   Stop exact duplicate broadcasts before downstream modules rebuild UI unnecessarily. */
window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceDetail>).detail||{};
  const signature=stable([detail.selectedId||'',detail.workspaces||[],detail.assignments||[]]);
  if(signature&&signature===workspaceSignature){event.stopImmediatePropagation();return}
  workspaceSignature=signature;
},{capture:true});

window.addEventListener('hashchange',()=>{workspaceSignature='';if(route()!=='admin-contributors')adminApplicationId=''});
window.addEventListener('litlab:admin-contributor-workspace-opened',event=>{adminApplicationId=String((event as CustomEvent<{applicationId?:string}>).detail?.applicationId||adminApplicationId)});

function formIdentity(form:HTMLFormElement){
  const attrs=Array.from(form.attributes)
    .filter(attr=>attr.name.startsWith('data-')&&attr.name!=='data-render-key'&&attr.name!=='data-signature')
    .map(attr=>`${attr.name}=${attr.value}`)
    .sort()
    .join('&');
  const admin=form.closest('#ll-admin-contributor-workspace')?`admin:${adminApplicationId||'unknown'}`:'';
  const workspace=form.closest<HTMLElement>('[data-contributor-workspace]')?.querySelector<HTMLElement>('[data-workspace-select].active')?.dataset.workspaceSelect||'';
  return `${route()}|${admin}|${workspace}|${attrs}|${form.id||''}|${form.className}`;
}

function capture(form:HTMLFormElement){
  const fields:Record<string,FieldState>={};
  Array.from(form.elements).forEach((control,index)=>{
    if(!(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement||control instanceof HTMLSelectElement))return;
    if(control instanceof HTMLInputElement&&control.type==='file')return;
    const name=control.name||`__index_${index}`;
    if(control instanceof HTMLInputElement&&(control.type==='checkbox'||control.type==='radio'))fields[name]={checked:control.checked,value:control.value};
    else if(control instanceof HTMLSelectElement&&control.multiple)fields[name]={selected:Array.from(control.selectedOptions).map(option=>option.value)};
    else fields[name]={value:control.value};
  });
  const active=document.activeElement;
  let focusName:string|undefined,selectionStart:number|null|undefined,selectionEnd:number|null|undefined;
  if(active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement){
    if(form.contains(active)){focusName=active.name;selectionStart=active.selectionStart;selectionEnd=active.selectionEnd}
  }else if(active instanceof HTMLSelectElement&&form.contains(active))focusName=active.name;
  drafts.set(formIdentity(form),{fields,focusName,selectionStart,selectionEnd,savedAt:Date.now()});
}

function restore(form:HTMLFormElement){
  const key=formIdentity(form);const draft=drafts.get(key);if(!draft||Date.now()-draft.savedAt>30*60*1000)return;
  Array.from(form.elements).forEach((control,index)=>{
    if(!(control instanceof HTMLInputElement||control instanceof HTMLTextAreaElement||control instanceof HTMLSelectElement))return;
    if(control instanceof HTMLInputElement&&control.type==='file')return;
    const name=control.name||`__index_${index}`;const state=draft.fields[name];if(!state)return;
    if(control instanceof HTMLInputElement&&(control.type==='checkbox'||control.type==='radio')){if(typeof state.checked==='boolean')control.checked=state.checked}
    else if(control instanceof HTMLSelectElement&&control.multiple&&state.selected){Array.from(control.options).forEach(option=>{option.selected=state.selected!.includes(option.value)})}
    else if(typeof state.value==='string')control.value=state.value;
  });
  if(draft.focusName){
    const active=form.elements.namedItem(draft.focusName);
    if(active instanceof HTMLElement){active.focus({preventScroll:true});if((active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement)&&draft.selectionStart!=null&&draft.selectionEnd!=null){try{active.setSelectionRange(draft.selectionStart,draft.selectionEnd)}catch{}}}
  }
}

function relevantForm(target:EventTarget|null){
  const el=target instanceof Element?target:null;
  const form=el?.closest<HTMLFormElement>('form');
  if(!form)return null;
  return form.closest('[data-contributor-workspace],#ll-admin-contributor-workspace')?form:null;
}

document.addEventListener('input',event=>{const form=relevantForm(event.target);if(form)capture(form)},true);
document.addEventListener('change',event=>{const form=relevantForm(event.target);if(form)capture(form)},true);
document.addEventListener('reset',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(form)drafts.delete(formIdentity(form))},true);
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-admin-workspace-close]')){for(const key of Array.from(drafts.keys()))if(key.includes(`admin:${adminApplicationId||'unknown'}`))drafts.delete(key)}
},true);

const observer=new MutationObserver(mutations=>{
  const forms=new Set<HTMLFormElement>();
  mutations.forEach(mutation=>Array.from(mutation.addedNodes).forEach(node=>{
    if(!(node instanceof Element))return;
    if(node instanceof HTMLFormElement&&node.closest('[data-contributor-workspace],#ll-admin-contributor-workspace'))forms.add(node);
    node.querySelectorAll<HTMLFormElement>('form').forEach(form=>{if(form.closest('[data-contributor-workspace],#ll-admin-contributor-workspace'))forms.add(form)});
  }));
  if(forms.size)requestAnimationFrame(()=>forms.forEach(restore));
});

function start(){observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
