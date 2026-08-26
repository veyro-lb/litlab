import './special-route-host.css';

// Large enhancement-driven guides render in a separate surface so their renderers never replace
// React's own page children. This prevents one guide's DOM from leaking into the next route.
const SPECIAL_ROUTES=new Set(['books','essays','ee','hl-essay','admin']);
let lastRoute='';
let restoreFrame=0;
let isolateFrame=0;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function reactMain(){
  const root=document.getElementById('root');
  return root?.querySelector<HTMLElement>('main#main,main[data-litlab-react-main]')||null;
}

function isolateReactMain(){
  if(!SPECIAL_ROUTES.has(currentRoute()))return;
  const main=reactMain();
  if(!main)return;
  if(main.id==='main')main.removeAttribute('id');
  main.dataset.litlabReactMain='true';
}

function scheduleIsolation(){
  if(isolateFrame||!SPECIAL_ROUTES.has(currentRoute()))return;
  isolateFrame=requestAnimationFrame(()=>{
    isolateFrame=0;
    isolateReactMain();
  });
}

function restoreReactMain(){
  const main=document.querySelector<HTMLElement>('#root main[data-litlab-react-main]');
  if(!main)return;
  main.id='main';
  delete main.dataset.litlabReactMain;
}

function seedEnhancementRoute(host:HTMLElement,route:string){
  if(route!=='books'&&route!=='ee')return;
  if(host.querySelector(':scope > .page'))return;

  const page=document.createElement('div');
  page.className='page';
  page.dataset.litlabIsolatedRouteSeed=route;

  // The existing EE renderer identifies its React placeholder by this phrase before replacing
  // the page. Keep the marker hidden so the isolated host can reuse that renderer unchanged.
  if(route==='ee'){
    const marker=document.createElement('span');
    marker.hidden=true;
    marker.textContent='Research Question Lab';
    page.append(marker);
  }

  host.append(page);
}

function restoreSurface(){
  restoreFrame=0;
  if(isolateFrame){cancelAnimationFrame(isolateFrame);isolateFrame=0}
  document.querySelector<HTMLElement>('main[data-litlab-special-route-host]')?.remove();
  restoreReactMain();
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

  // Only one element in the document may own id="main". Legacy guide modules still target
  // main#main, so temporarily move that id from React's hidden main to the visible route host.
  isolateReactMain();
  document.body.classList.add('litlab-special-route-active');
  let host=document.querySelector<HTMLElement>('main[data-litlab-special-route-host]');
  if(!host){
    host=document.createElement('main');
    host.id='main';
    host.dataset.litlabSpecialRouteHost='true';
    host.setAttribute('tabindex','-1');
    root.before(host);
  }else{
    host.id='main';
    if(host.nextElementSibling!==root)root.before(host);
  }

  const changed=lastRoute!==route||host.dataset.route!==route;
  host.dataset.route=route;
  host.hidden=false;
  if(changed){
    host.replaceChildren();
    lastRoute=route;
  }
  seedEnhancementRoute(host,route);
  return host;
}

// React can remount its <main> while an isolated route is open. Re-apply the id isolation without
// touching React's children so skip links and main#main lookups always resolve to one surface.
const root=document.getElementById('root');
if(root)new MutationObserver(scheduleIsolation).observe(root,{childList:true,subtree:true});

window.addEventListener('hashchange',ensureSpecialSurface);
window.addEventListener('pageshow',ensureSpecialSurface);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureSpecialSurface,{once:true});
else ensureSpecialSurface();
