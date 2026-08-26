import './special-route-host.css';

// Only routes that do not have a native React page need an isolated render surface.
// Extended Essay already has a native React page and stays inside the normal app shell.
const SPECIAL_ROUTES=new Set(['essays','hl-essay','admin']);
let scheduled=false;
let lastRoute='';

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function getReactMain(){
  const root=document.getElementById('root');
  if(!root)return null;
  return root.querySelector<HTMLElement>('main[data-litlab-react-main],main#litlab-react-main,main#main');
}

function restoreReactSurface(){
  const root=document.getElementById('root');
  const reactMain=root?.querySelector<HTMLElement>('main[data-litlab-react-main],main#litlab-react-main,main#main');
  reactMain?.querySelectorAll<HTMLElement>('[data-litlab-suppressed-page]').forEach(page=>{
    page.classList.add('page');
    delete page.dataset.litlabSuppressedPage;
  });
  if(reactMain){
    reactMain.id='main';
    delete reactMain.dataset.litlabReactMain;
    reactMain.removeAttribute('aria-hidden');
  }
  root?.querySelector<HTMLElement>('footer')?.classList.remove('litlab-special-route-hidden');
  document.querySelector<HTMLElement>('main[data-litlab-special-route-host]')?.remove();
  document.body.classList.remove('litlab-special-route-active');
  lastRoute='';
}

function ensureSpecialSurface(){
  scheduled=false;
  const route=currentRoute();
  if(!SPECIAL_ROUTES.has(route)){
    if(document.body.classList.contains('litlab-special-route-active'))restoreReactSurface();
    return;
  }

  const root=document.getElementById('root');
  if(!root){schedule();return}

  const reactMain=getReactMain();
  if(reactMain){
    reactMain.dataset.litlabReactMain='true';
    if(reactMain.id==='main')reactMain.id='litlab-react-main';
    reactMain.setAttribute('aria-hidden','true');
  }

  root.querySelector<HTMLElement>('footer')?.classList.add('litlab-special-route-hidden');
  document.body.classList.add('litlab-special-route-active');

  let host=document.querySelector<HTMLElement>('main[data-litlab-special-route-host]');
  if(!host){
    host=document.createElement('main');
    host.id='main';
    host.dataset.litlabSpecialRouteHost='true';
    host.setAttribute('tabindex','-1');
    // Keep the visible surface before React in document order. Even if React commits again
    // during this navigation, legacy main#main lookups resolve to this visible host first.
    root.before(host);
  }else if(host.nextElementSibling!==root){
    root.before(host);
  }

  const changed=lastRoute!==route||host.dataset.route!==route;
  host.dataset.route=route;
  host.hidden=false;
  if(changed){
    host.replaceChildren();
    lastRoute=route;
  }
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(ensureSpecialSurface);
}

// Route changes must be synchronous. Essays/HL enhancement modules run immediately after
// hashchange; creating the host on a later animation frame made first-click rendering depend
// on timing and could require a manual refresh.
window.addEventListener('hashchange',ensureSpecialSurface);
window.addEventListener('pageshow',ensureSpecialSurface);

const root=document.getElementById('root');
if(root)new MutationObserver(()=>{
  if(SPECIAL_ROUTES.has(currentRoute()))schedule();
}).observe(root,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureSpecialSurface,{once:true});
else ensureSpecialSurface();
