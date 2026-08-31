import './special-route-host.css';

// Large enhancement-driven guides render in a separate surface so their renderers never replace
// React's own page children. This prevents one guide's DOM from leaking into the next route.
const SPECIAL_ROUTES=new Set(['books','essays','ee','hl-essay','admin','admin-contributors']);
let lastRoute='';
let previousNavigationRoute='';
let isolateFrame=0;
let scrollFrame=0;
let scrollFrameTwo=0;
let restoreFrame=0;
let restoreAttempts=0;

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

function cancelRestoreWait(){
  if(restoreFrame){cancelAnimationFrame(restoreFrame);restoreFrame=0}
  restoreAttempts=0;
}

function finishSurfaceRestore(){
  cancelRestoreWait();
  document.body.classList.remove('litlab-special-route-active');
  document.querySelectorAll<HTMLElement>('.litlab-special-route-hidden').forEach(el=>el.classList.remove('litlab-special-route-hidden'));
  lastRoute='';
}

function toolkitReactPageReady(){
  if(currentRoute()!=='glossary')return false;
  const main=reactMain();
  if(!main)return false;
  // Books uses an isolated visible host, but React still keeps its own fallback Books page hidden
  // underneath. When navigating Books -> Toolkit, hashchange listeners can restore that React main
  // one frame before React has replaced the fallback. Wait for Toolkit's own stable markers before
  // revealing the normal route surface so stale Books content can never flash into Toolkit.
  return Boolean(main.querySelector('.glossary-tools')&&main.querySelector('.glossary-grid'));
}

function waitForToolkitReactPage(){
  cancelRestoreWait();
  const check=()=>{
    restoreFrame=0;
    if(currentRoute()!=='glossary'){
      finishSurfaceRestore();
      ensureSpecialSurface();
      return;
    }
    if(toolkitReactPageReady()){
      finishSurfaceRestore();
      window.dispatchEvent(new CustomEvent('litlab:route-surface-ready',{detail:{route:'glossary'}}));
      return;
    }
    restoreAttempts++;
    if(restoreAttempts>=120){
      console.warn('LitLab Toolkit route handoff timed out waiting for the React page.');
      finishSurfaceRestore();
      return;
    }
    restoreFrame=requestAnimationFrame(check);
  };
  restoreFrame=requestAnimationFrame(check);
}

function restoreSurface(){
  if(isolateFrame){cancelAnimationFrame(isolateFrame);isolateFrame=0}
  const hadSpecialSurface=Boolean(
    document.querySelector('main[data-litlab-special-route-host]')||
    document.body.classList.contains('litlab-special-route-active')||
    lastRoute
  );
  document.querySelector<HTMLElement>('main[data-litlab-special-route-host]')?.remove();
  restoreReactMain();
  lastRoute='';

  if(hadSpecialSurface&&currentRoute()==='glossary'){
    // Keep React's main hidden for the handoff frame. This avoids exposing the fallback Books DOM
    // before App's hashchange state update has produced the Toolkit page.
    document.body.classList.add('litlab-special-route-active');
    waitForToolkitReactPage();
    return;
  }
  finishSurfaceRestore();
}

function ensureSpecialSurface(){
  const route=currentRoute();
  if(!SPECIAL_ROUTES.has(route)){
    // Remove the isolated route immediately, but when the destination is Toolkit keep React's
    // normal main concealed until Toolkit has actually rendered. This closes the Books -> Toolkit
    // listener-order race without delaying navigation or leaving stale route content visible.
    restoreSurface();
    return null;
  }

  cancelRestoreWait();
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

function resetRouteScroll(route:string){
  if(scrollFrame){cancelAnimationFrame(scrollFrame);scrollFrame=0}
  if(scrollFrameTwo){cancelAnimationFrame(scrollFrameTwo);scrollFrameTwo=0}
  window.scrollTo({top:0,left:0,behavior:'auto'});
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;

  // React and the enhancement modules can finish rendering over the next two frames. Re-assert
  // the top position after layout settles, but only if the user is still on the same route.
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;
    if(currentRoute()!==route)return;
    window.scrollTo({top:0,left:0,behavior:'auto'});
    scrollFrameTwo=requestAnimationFrame(()=>{
      scrollFrameTwo=0;
      if(currentRoute()===route)window.scrollTo({top:0,left:0,behavior:'auto'});
    });
  });
}

function handleRouteChange(){
  const route=currentRoute();
  const routeChanged=route!==previousNavigationRoute;
  ensureSpecialSurface();
  if(routeChanged)resetRouteScroll(route);
  previousNavigationRoute=route;
}

// React can remount its <main> while an isolated route is open. Re-apply the id isolation without
// touching React's children so skip links and main#main lookups always resolve to one surface.
const root=document.getElementById('root');
if(root)new MutationObserver(scheduleIsolation).observe(root,{childList:true,subtree:true});

try{history.scrollRestoration='manual'}catch{}
previousNavigationRoute=currentRoute();
window.addEventListener('hashchange',handleRouteChange);
window.addEventListener('pageshow',()=>{ensureSpecialSurface();if(currentRoute()!==previousNavigationRoute){previousNavigationRoute=currentRoute();resetRouteScroll(previousNavigationRoute)}});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureSpecialSurface,{once:true});
else ensureSpecialSurface();