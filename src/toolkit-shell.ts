import './toolkit-shell.css';

const TOOLKIT_ROUTE='glossary';
let scheduled=false;

const route=()=>location.hash.slice(1).split('#')[0]||'home';
const goToolkit=()=>{location.hash=TOOLKIT_ROUTE};

function iconArrow(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function iconToolkit(){
  return '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10v16H6.5A2.5 2.5 0 0 0 4 22V6.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M20 6.5A2.5 2.5 0 0 0 17.5 4H14v16h3.5A2.5 2.5 0 0 1 20 22V6.5Z" stroke="currentColor" stroke-width="1.8"/><path d="m12 6 .7 2.2L15 9l-2.3.8L12 12l-.7-2.2L9 9l2.3-.8L12 6Z" fill="currentColor"/></svg>';
}

function ensureDesktopNav(){
  const nav=document.querySelector<HTMLElement>('.topbar nav');
  if(!nav)return;
  let button=nav.querySelector<HTMLButtonElement>('button[data-toolkit-nav]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.dataset.toolkitNav='true';
    button.textContent='Toolkit';
    button.addEventListener('click',goToolkit);
    nav.append(button);
  }
  const active=route()===TOOLKIT_ROUTE;
  button.classList.toggle('active',active);
  if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
}

function ensureMobileNav(){
  const menu=document.querySelector<HTMLElement>('.mobile-menu');
  if(!menu)return;
  let button=menu.querySelector<HTMLButtonElement>('button[data-toolkit-nav]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.dataset.toolkitNav='true';
    button.innerHTML=`<span>Toolkit</span>${iconArrow()}`;
    button.addEventListener('click',goToolkit);
    const searchButton=Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).find(btn=>(btn.textContent||'').trim().startsWith('Search'));
    if(searchButton)menu.insertBefore(button,searchButton);else menu.append(button);
  }
  button.classList.toggle('ux-active',route()===TOOLKIT_ROUTE);
}

function renameFooterReference(){
  document.querySelectorAll<HTMLButtonElement>('footer button').forEach(button=>{
    if((button.textContent||'').trim()==='Glossary')button.textContent='Toolkit';
  });
}

function ensureHomeToolkitCard(){
  if(route()!=='home')return;
  const grid=document.querySelector<HTMLElement>('.feature-grid');
  if(!grid)return;
  let card=grid.querySelector<HTMLButtonElement>('[data-toolkit-card]');
  if(!card){
    card=document.createElement('button');
    card.type='button';
    card.className='feature-card tilt toolkit-home-card';
    card.dataset.toolkitCard='true';
    card.innerHTML=`<span class="feature-no">07</span><span class="feature-icon">${iconToolkit()}</span><h3>Toolkit</h3><p>Quickly check definitions, stronger analytical vocabulary and the command terms behind DP English questions.</p><span class="card-link">Explore ${iconArrow()}</span>`;
    card.addEventListener('click',goToolkit);
    grid.append(card);
  }

  const section=grid.closest<HTMLElement>('.section');
  const heading=section?.querySelector<HTMLElement>('.section-head h2');
  const copy=section?.querySelector<HTMLElement>('.section-head p');
  if(heading)heading.textContent='Seven spaces. One clear system.';
  if(copy)copy.textContent='Learn the ideas, practise the skills, then use Toolkit whenever you need a fast reference.';

  const quick=document.querySelector<HTMLElement>('.quick-strip');
  if(quick&&!quick.querySelector('[data-toolkit-quick]')){
    const button=document.createElement('button');
    button.type='button';
    button.dataset.toolkitQuick='true';
    button.innerHTML=`Open Toolkit ${iconArrow()}`;
    button.addEventListener('click',goToolkit);
    quick.append(button);
  }
}

function chooserCard(mode:string,kicker:string,title:string,text:string,icon:string){
  const button=document.createElement('button');
  button.type='button';
  button.className='toolkit-choice';
  button.dataset.toolkitMode=mode;
  button.innerHTML=`<span class="toolkit-choice-icon" aria-hidden="true">${icon}</span><span class="toolkit-choice-copy"><small>${kicker}</small><b>${title}</b><em>${text}</em></span>${iconArrow()}`;
  button.addEventListener('click',()=>{
    const tab=document.querySelector<HTMLButtonElement>(`.keyword-mode-tabs button[data-mode="${mode}"]`);
    tab?.click();
    setTimeout(syncChooserState,30);
  });
  return button;
}

function ensureToolkitChooser(){
  if(route()!==TOOLKIT_ROUTE)return;
  const page=Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(el=>el.querySelector('.glossary-tools')&&el.querySelector('.glossary-grid'));
  if(!page)return;

  const hero=page.querySelector<HTMLElement>('.page-hero');
  const title=hero?.querySelector<HTMLElement>('h1');
  const text=hero?.querySelector<HTMLElement>('p');
  if(title)title.textContent='LitLab Toolkit';
  if(text)text.textContent='One place for definitions, stronger analytical language, and the task words behind DP English questions.';

  let chooser=page.querySelector<HTMLElement>(':scope > .toolkit-chooser');
  if(!chooser){
    chooser=document.createElement('section');
    chooser.className='toolkit-chooser';
    chooser.innerHTML='<div class="toolkit-chooser-head"><span>REFERENCE TOOLKIT</span><h2>What do you need right now?</h2><p>Choose a reference mode. You can switch between them at any time.</p></div><div class="toolkit-choice-grid"></div>';
    const grid=chooser.querySelector<HTMLElement>('.toolkit-choice-grid')!;
    grid.append(
      chooserCard('glossary','UNDERSTAND A TERM','Glossary','Plain-language definitions for literary, writing and course terminology.','Aa'),
      chooserCard('keywords','IMPROVE MY WRITING','Keywords','Authorial choices, analytical verbs, evaluation language, transitions and precise vocabulary.','✦'),
      chooserCard('commands','DECODE THE QUESTION','Command Terms','Understand what words such as Analyze, Compare and Evaluate are asking you to do.','?')
    );
    const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
    if(tabs)page.insertBefore(chooser,tabs);else hero?.insertAdjacentElement('afterend',chooser);
  }

  const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  if(tabs&&chooser.nextElementSibling!==tabs)page.insertBefore(chooser,tabs);
  syncChooserState();
}

function syncChooserState(){
  if(route()!==TOOLKIT_ROUTE)return;
  const active=document.querySelector<HTMLButtonElement>('.keyword-mode-tabs button.active')?.dataset.mode||'glossary';
  document.querySelectorAll<HTMLButtonElement>('.toolkit-choice').forEach(button=>{
    const selected=button.dataset.toolkitMode===active;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
}

function syncRouteChrome(){
  ensureDesktopNav();
  ensureMobileNav();
  renameFooterReference();
  if(route()===TOOLKIT_ROUTE){
    document.querySelectorAll<HTMLElement>('.litlab-route-dock strong').forEach(el=>el.textContent='Toolkit');
    document.title='LitLab — Toolkit';
  }
}

function enhance(){
  syncRouteChrome();
  ensureHomeToolkitCard();
  ensureToolkitChooser();
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    enhance();
  });
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,90));
document.addEventListener('click',event=>{
  const target=event.target as Element|null;
  if(target?.closest('.keyword-mode-tabs'))setTimeout(syncChooserState,20);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
