import './admin-menu-launcher.css';

type RoleState={is_admin?:boolean};

let isAdmin=false;

function ensureAdminLauncher(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');
  if(!menu)return;
  const existing=menu.querySelector<HTMLButtonElement>('[data-open-admin-analytics]');
  if(!isAdmin){
    if(existing?.dataset.globalAdminLauncher==='true')existing.remove();
    return;
  }
  if(existing)return;

  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-admin-menu-entry';
  button.dataset.openAdminAnalytics='true';
  button.dataset.globalAdminLauncher='true';
  button.innerHTML='<span>▥</span><div><b>Developer analytics</b><small>Users, activity & growth</small></div><i>›</i>';
  button.addEventListener('click',event=>{
    event.stopPropagation();
    location.hash='admin';
  });

  const signout=menu.querySelector('.litlab-signout');
  if(signout)menu.insertBefore(button,signout);else menu.append(button);
}

window.addEventListener('litlab:contributor-account-role',event=>{
  const detail=(event as CustomEvent<RoleState>).detail;
  isAdmin=Boolean(detail?.is_admin);
  ensureAdminLauncher();
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('.litlab-account-trigger'):null;
  if(target)setTimeout(ensureAdminLauncher,40);
},true);

export {};
