import './contributor-route-handoff.css';

type ContributorRoute='contribute'|'admin-contributors';

let observedHash=location.hash;
let kickCount=0;
let retryTimer=0;
let scheduled=false;
let handoffStartedAt=0;

function route(){return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()}
function contributorRoute():ContributorRoute|null{
  const value=route();
  return value==='contribute'||value==='admin-contributors'?value:null;
}
function surfaceReady(value:ContributorRoute){
  return value==='contribute'
    ?Boolean(document.getElementById('ll-contributor-root'))
    :Boolean(document.querySelector('[data-litlab-admin-contributors-page]'));
}
function hostReady(value:ContributorRoute){
  const featureReady=document.documentElement.dataset.litlabFeatureReady==='contributor';
  if(!featureReady)return false;
  return value==='contribute'||Boolean(document.querySelector('main[data-litlab-special-route-host]#main'));
}
function clearHandoff(){
  window.clearTimeout(retryTimer);
  retryTimer=0;
  handoffStartedAt=0;
  delete document.documentElement.dataset.litlabContributorRouteHandoff;
}
function kickRender(){
  if(kickCount>=5)return;
  kickCount+=1;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
function sync(){
  scheduled=false;
  window.clearTimeout(retryTimer);
  retryTimer=0;

  const value=contributorRoute();
  if(!value){clearHandoff();return}
  if(surfaceReady(value)){clearHandoff();return}

  if(!handoffStartedAt)handoffStartedAt=Date.now();
  document.documentElement.dataset.litlabContributorRouteHandoff=value;

  // Both contributor renderers listen to hashchange. If their first pass happened before the
  // lazy feature bundle or special-route host was ready, re-dispatch the current route once the
  // prerequisites exist. This replaces the old "refresh the browser" recovery path.
  if(hostReady(value))kickRender();

  // Do not leave the React shell hidden forever if an unrelated runtime error prevents mounting.
  if(Date.now()-handoffStartedAt>5000){clearHandoff();return}
  retryTimer=window.setTimeout(scheduleSync,120);
}
function scheduleSync(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(sync);
}
function routeChanged(){
  if(location.hash!==observedHash){
    observedHash=location.hash;
    kickCount=0;
    handoffStartedAt=0;
  }
  scheduleSync();
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest<HTMLElement>('[data-open-admin-contributors]'):null;
  if(!target)return;
  // Mark the handoff before React processes the new hash so its unknown-route About fallback
  // cannot become the visible destination while the admin dashboard bundle mounts.
  document.documentElement.dataset.litlabContributorRouteHandoff='admin-contributors';
},true);
window.addEventListener('hashchange',routeChanged);
window.addEventListener('litlab:feature-ready',scheduleSync);
window.addEventListener('pageshow',scheduleSync);
window.addEventListener('focus',scheduleSync);
new MutationObserver(scheduleSync).observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleSync,{once:true});
else scheduleSync();

export {};
