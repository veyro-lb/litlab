import './skills-lab-review-polish.css';

const route=()=>location.hash.slice(1).split('#')[0]||'home';

function clearStaleChoiceLayout(){
  if(route()!=='skills')return;
  const page=document.querySelector<HTMLElement>('.skills-lab-page');
  const body=page?.querySelector<HTMLElement>('.skills-workspace-body');
  if(!page||!body)return;

  const title=page.querySelector<HTMLElement>('.skills-current-title')?.textContent?.trim()||'';
  const hasChoiceStage=!!body.querySelector(':scope > .choice-bank-stage');
  if(title!=='Authorial Choice Check'||!hasChoiceStage){
    delete body.dataset.choiceBankRoot;
  }
}

/* Clear the Choice Check grid before another lab renders into the shared workspace. */
document.addEventListener('click',event=>{
  const target=event.target as HTMLElement;
  const card=target.closest<HTMLButtonElement>('.skills-lab-page .skills-tool-card');
  if(!card||card.dataset.tool==='choices')return;
  const body=document.querySelector<HTMLElement>('.skills-lab-page .skills-workspace-body');
  if(body)delete body.dataset.choiceBankRoot;
},true);

let queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;clearStaleChoiceLayout()});
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,60));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
