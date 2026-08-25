import './tutor-launcher-visibility.css';

let scheduled=false;

function sparkIcon(){
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" fill="currentColor"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" fill="currentColor"/></svg>';
}

function openTutor(){
  const launcher=document.querySelector<HTMLButtonElement>('.tutor-launcher');
  if(launcher){launcher.click();return}
  setTimeout(()=>document.querySelector<HTMLButtonElement>('.tutor-launcher')?.click(),120);
}

function ensureTrigger(){
  const actions=document.querySelector<HTMLElement>('.topbar .top-actions');
  if(!actions)return;
  let button=actions.querySelector<HTMLButtonElement>('.tutor-topbar-trigger');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='tutor-topbar-trigger';
    button.setAttribute('aria-label','Open LitLab Tutor');
    button.innerHTML=`${sparkIcon()}<span>Tutor</span>`;
    button.addEventListener('click',openTutor);
    const firstIcon=actions.querySelector('.icon-btn');
    if(firstIcon)actions.insertBefore(button,firstIcon);else actions.append(button);
  }
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;ensureTrigger()});
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('hashchange',()=>setTimeout(schedule,60));
