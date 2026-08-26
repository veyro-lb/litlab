import './special-route-host.css';

// Essays, HL Essay and Developer Analytics are legacy enhancement pages. They render in a
// completely separate surface so no script ever rewrites React's own <main>. Keeping React's
// DOM untouched is critical: replacing its children makes later route changes render blank
// until a full reload rebuilds the virtual DOM.
const SPECIAL_ROUTES=new Set(['essays','hl-essay','admin']);
let lastRoute='';
let restoreFrame=0;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function restoreSurface(){
  restoreFrame=0;
  document.querySelector<HTMLElement>('main[data-litlab-special-route-host]')?.remove();
  document.body.classList.remove('litlab-special-route-active');
  lastRoute='';
}

function scheduleRestore(){
  if(restoreFrame)return;
  restoreFrame=requestAnimationFrame(()=>{
    if(!SPECIAL_ROUTES.has(currentRoute()))restoreSurface();
    else restoreFrame=0;
  });
}

function ensureSpecialSurface(){
  const route=currentRoute();
  if(!SPECIAL_ROUTES.has(route)){
    if(document.body.classList.contains('litlab-special-route-active'))scheduleRestore();
    return null;
  }

  if(restoreFrame){cancelAnimationFrame(restoreFrame);restoreFrame=0}
  const root=document.getElementById('root');
  if(!root)return null;

  document.body.classList.add('litlab-special-route-active');
  let host=document.querySelector<HTMLElement>('main[data-litlab-special-route-host]');
  if(!host){
    host=document.createElement('main');
    // The legacy guide modules query main#main. Put this host before #root so those lookups
    // resolve here while React's own #main remains completely untouched behind it.
    host.id='main';
    host.dataset.litlabSpecialRouteHost='true';
    host.setAttribute('tabindex','-1');
    root.before(host);
  }else if(host.nextElementSibling!==root){
    root.before(host);
  }

  const changed=lastRoute!==route||host.dataset.route!==route;
  host.dataset.route=route;
  host.hidden=false;
  if(changed){host.replaceChildren();lastRoute=route}
  return host;
}

// Create the visible surface synchronously on navigation, before any guide renderer runs.
window.addEventListener('hashchange',ensureSpecialSurface);
window.addEventListener('pageshow',ensureSpecialSurface);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureSpecialSurface,{once:true});
else ensureSpecialSurface();
