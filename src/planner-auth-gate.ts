const SESSION_KEY='litlabSupabaseSession';

const selectors={
  paper2:'[data-builder-toggle]',
  io:'[data-io-planner-toggle]'
} as const;

function hasStoredSession(){
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as {access_token?:unknown;refresh_token?:unknown}|null;
    return Boolean(value&&typeof value.access_token==='string'&&value.access_token&&typeof value.refresh_token==='string'&&value.refresh_token);
  }catch{return false}
}

function openSignIn(attempt=0){
  if(hasStoredSession())return;
  if(document.querySelector('[data-auth-modal]'))return;
  const button=document.querySelector<HTMLButtonElement>('[data-auth-open]');
  if(button){button.click();return}
  if(attempt<8)setTimeout(()=>openSignIn(attempt+1),100);
}

function syncGate(){
  const signedIn=hasStoredSession();
  document.documentElement.toggleAttribute('data-planner-signin-required',!signedIn);

  const paper2=document.querySelector<HTMLButtonElement>(selectors.paper2);
  if(paper2){
    paper2.textContent=signedIn?'Build a comparison →':'Sign in to build →';
    paper2.setAttribute('aria-label',signedIn?'Open Paper 2 Comparison Builder':'Sign in to use the Paper 2 Comparison Builder');
  }

  const io=document.querySelector<HTMLButtonElement>(selectors.io);
  if(io){
    io.textContent=signedIn?'Open IO Planner →':'Sign in to open IO Planner →';
    io.setAttribute('aria-label',signedIn?'Open IO Planner':'Sign in to use the IO Planner');
  }

  if(!signedIn){
    document.querySelectorAll<HTMLElement>('[data-builder-workspace],[data-io-planner-workspace]').forEach(workspace=>{
      workspace.hidden=true;
      workspace.setAttribute('aria-hidden','true');
    });
  }else{
    document.querySelectorAll<HTMLElement>('[data-builder-workspace],[data-io-planner-workspace]').forEach(workspace=>workspace.removeAttribute('aria-hidden'));
  }
}

const style=document.createElement('style');
style.textContent=`html[data-planner-signin-required] [data-builder-workspace],html[data-planner-signin-required] [data-io-planner-workspace]{display:none!important}`;
document.head.append(style);
syncGate();

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest(`${selectors.paper2},${selectors.io}`):null;
  if(target&&!hasStoredSession()){
    event.preventDefault();
    event.stopImmediatePropagation();
    syncGate();
    openSignIn();
    return;
  }
  queueMicrotask(syncGate);
  setTimeout(syncGate,80);
},true);

window.addEventListener('hashchange',syncGate);
window.addEventListener('focus',syncGate);
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY)syncGate()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncGate()});

let scheduled=false;
const observer=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;syncGate()});
});
observer.observe(document.body,{childList:true,subtree:true});
