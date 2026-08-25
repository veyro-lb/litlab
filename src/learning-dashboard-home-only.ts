import './learning-dashboard-home-only.css';

const route=()=>location.hash.slice(1).split('#')[0]||'home';
let scheduled=false;

function syncDashboard(){
  const dashboard=document.querySelector<HTMLElement>('.my-litlab-dashboard');

  if(route()!=='home'){
    dashboard?.remove();
    return;
  }

  if(!dashboard)return;

  dashboard.classList.add('my-litlab-compact');

  const makers=document.querySelector<HTMLElement>('.makers');
  if(makers&&makers.parentElement&&makers.previousElementSibling!==dashboard){
    makers.parentElement.insertBefore(dashboard,makers);
  }
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    syncDashboard();
  });
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});

window.addEventListener('hashchange',()=>{
  // Remove a dashboard left behind by the previous React route immediately.
  if(route()!=='home')document.querySelector('.my-litlab-dashboard')?.remove();
  setTimeout(schedule,80);
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
