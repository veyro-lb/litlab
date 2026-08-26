import './special-route-host.css';

// Developer Analytics is the only page that still renders outside React's normal page switch.
// Essays, HL Essay, Extended Essay, Skills, Books, Papers, IO and Toolkit all stay inside the
// shared React shell so navigation never depends on a second render or a refresh.
const SPECIAL_ROUTES=new Set(['admin']);
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
    root.before(host);
  }else if(host.nextElementSibling!==root){
    root.before(host);
  }

  const changed=lastRoute!==route||host.dataset.route!==route;
  host.dataset.route=route;
  host.hidden=false;
  if(changed){host.replaceChildren();lastRoute=route}
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(ensureSpecialSurface);
}

window.addEventListener('hashchange',ensureSpecialSurface);
window.addEventListener('pageshow',ensureSpecialSurface);

const root=document.getElementById('root');
if(root)new MutationObserver(()=>{
  if(SPECIAL_ROUTES.has(currentRoute()))schedule();
}).observe(root,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureSpecialSurface,{once:true});
else ensureSpecialSurface();
