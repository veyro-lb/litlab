import './special-route-host.css';

const SPECIAL_ROUTES=new Set(['essays','hl-essay','ee']);
let scheduled=false;
let lastRoute='';

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function getReactMain(){
  const root=document.getElementById('root');
  if(!root)return null;
  return root.querySelector<HTMLElement>('main[data-litlab-react-main],main#main');
}

function restoreReactSurface(){
  const root=document.getElementById('root');
  const reactMain=root?.querySelector<HTMLElement>('main[data-litlab-react-main],main#litlab-react-main');
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
  document.querySelector<HTMLElement>('[data-litlab-special-route-host]')?.remove();
  document.body.classList.remove('litlab-special-route-active');
  lastRoute='';
}

function seedFor(route:string){
  if(route==='ee'){
    return '<section class="page litlab-special-route-seed" data-litlab-ee-seed><div class="hero"><h1>Research Question Lab</h1></div></section>';
  }
  return '';
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
    if(route==='ee'){
      reactMain.querySelectorAll<HTMLElement>('.page').forEach(page=>{
        page.dataset.litlabSuppressedPage='true';
        page.classList.remove('page');
      });
    }
  }

  root.querySelector<HTMLElement>('footer')?.classList.add('litlab-special-route-hidden');
  document.body.classList.add('litlab-special-route-active');

  let host=document.querySelector<HTMLElement>('[data-litlab-special-route-host]');
  if(!host){
    host=document.createElement('main');
    host.id='main';
    host.dataset.litlabSpecialRouteHost='true';
    host.setAttribute('tabindex','-1');
    root.after(host);
  }

  const changed=lastRoute!==route||host.dataset.route!==route;
  host.dataset.route=route;
  host.hidden=false;
  if(changed){
    host.innerHTML=seedFor(route);
    lastRoute=route;
  }
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(ensureSpecialSurface);
}

window.addEventListener('hashchange',schedule);
window.addEventListener('pageshow',schedule);

const root=document.getElementById('root');
if(root)new MutationObserver(()=>{
  if(SPECIAL_ROUTES.has(currentRoute()))schedule();
}).observe(root,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
