const SESSION_KEY='litlabSupabaseSession';

let navigationId=0;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function hasStoredSession(){
  try{
    const session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as {access_token?:unknown;refresh_token?:unknown}|null;
    return Boolean(session&&typeof session.access_token==='string'&&typeof session.refresh_token==='string');
  }catch{return false}
}

function isHome(){
  return currentRoute()==='home';
}

function openSignInPrompt(id:number,attempt=0){
  if(id!==navigationId||isHome()||hasStoredSession())return;
  if(document.querySelector('[data-auth-modal]'))return;

  const signIn=document.querySelector<HTMLButtonElement>('[data-auth-open]');
  if(signIn){
    signIn.click();
    return;
  }

  if(attempt<8)setTimeout(()=>openSignInPrompt(id,attempt+1),100);
}

function promptForCurrentRoute(delay=120){
  const id=++navigationId;
  if(isHome()||hasStoredSession())return;
  setTimeout(()=>openSignInPrompt(id),delay);
}

window.addEventListener('hashchange',()=>promptForCurrentRoute());

// Give the auth module time to restore/refresh an existing session before prompting
// someone who opens LitLab directly on a non-Home route.
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>promptForCurrentRoute(900),{once:true});
}else{
  promptForCurrentRoute(900);
}
