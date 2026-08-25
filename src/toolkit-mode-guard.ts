import './toolkit-mode-guard.css';

type ToolkitMode='glossary'|'keywords'|'commands';

let mode:ToolkitMode='glossary';
let scheduled=false;
let applying=false;

const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';

function isMode(value:string|undefined):value is ToolkitMode{
  return value==='glossary'||value==='keywords'||value==='commands';
}

function directChild(page:HTMLElement,className:string){
  return Array.from(page.children).find(el=>el instanceof HTMLElement&&el.classList.contains(className)) as HTMLElement|undefined;
}

function toolkitPage(){
  if(currentRoute()!=='glossary')return null;
  return Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(page=>
    directChild(page,'glossary-tools')&&
    directChild(page,'glossary-grid')&&
    page.querySelector(':scope > .keyword-mode-tabs')
  )||null;
}

function setHidden(el:HTMLElement|undefined|null,hidden:boolean){
  if(!el)return;
  if(el.hidden!==hidden)el.hidden=hidden;
}

function applyMode(page:HTMLElement){
  if(applying)return;
  applying=true;

  page.classList.add('toolkit-reference-page');
  page.dataset.toolkitReferenceMode=mode;

  const originalTools=directChild(page,'glossary-tools');
  const originalGrid=directChild(page,'glossary-grid');
  const keywordPanel=page.querySelector<HTMLElement>(':scope > .keyword-panel:not(.command-panel)');
  const commandPanel=page.querySelector<HTMLElement>(':scope > .command-panel');

  setHidden(originalTools,mode!=='glossary');
  setHidden(originalGrid,mode!=='glossary');
  setHidden(keywordPanel,mode!=='keywords');
  setHidden(commandPanel,mode!=='commands');

  page.querySelectorAll<HTMLButtonElement>(':scope > .keyword-mode-tabs button[data-mode]').forEach(button=>{
    const selected=button.dataset.mode===mode;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-selected',String(selected));
    if(selected)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });

  page.querySelectorAll<HTMLButtonElement>('.toolkit-choice[data-toolkit-mode]').forEach(button=>{
    const selected=button.dataset.toolkitMode===mode;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });

  applying=false;
}

function scheduleApply(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    const page=toolkitPage();
    if(page)applyMode(page);
  });
}

function selectMode(next:ToolkitMode){
  mode=next;
  const page=toolkitPage();
  if(page){
    page.classList.add('toolkit-reference-page');
    page.dataset.toolkitReferenceMode=mode;
    applyMode(page);
  }else scheduleApply();
}

/*
  The older Keywords and Command Terms modules still create their content,
  search controls and cards. Mode switching itself is owned here. Capturing
  these clicks before their legacy handlers run prevents two independent
  state machines from marking different tabs active in the same frame.
*/
document.addEventListener('click',event=>{
  if(currentRoute()!=='glossary')return;
  const target=event.target as Element|null;

  const tab=target?.closest<HTMLButtonElement>('.keyword-mode-tabs button[data-mode]');
  if(tab&&isMode(tab.dataset.mode)){
    event.preventDefault();
    event.stopImmediatePropagation();
    selectMode(tab.dataset.mode);
    return;
  }

  const choice=target?.closest<HTMLButtonElement>('.toolkit-choice[data-toolkit-mode]');
  if(choice&&isMode(choice.dataset.toolkitMode)){
    event.preventDefault();
    event.stopImmediatePropagation();
    selectMode(choice.dataset.toolkitMode);
  }
},true);

window.addEventListener('hashchange',()=>{
  mode='glossary';
  setTimeout(scheduleApply,100);
});

const root=document.getElementById('root');
if(root){
  new MutationObserver(()=>{
    if(currentRoute()==='glossary')scheduleApply();
  }).observe(root,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleApply,{once:true});
else scheduleApply();
