import './microsoft-auth.css';
import './admin-account-role-badges';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const RETURN_KEY='litlabAuthReturnHash';

let microsoftEnabled=false;
let patchScheduled=false;

function signInWithMicrosoft(){
  const returnHash=location.hash&&!location.hash.includes('access_token=')?location.hash:'#home';
  sessionStorage.setItem(RETURN_KEY,returnHash);
  const redirectTo=`${location.origin}${location.pathname}`;
  const authorize=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set('provider','azure');
  authorize.searchParams.set('redirect_to',redirectTo);
  authorize.searchParams.set('scopes','email');
  // Always ask Microsoft which account to use instead of silently reusing
  // whichever personal/work account is already signed into the browser.
  authorize.searchParams.set('prompt','select_account');
  window.location.href=authorize.toString();
}

function renameAzureLabels(){
  document.querySelectorAll<HTMLElement>('.admin-provider').forEach(element=>{
    if(element.textContent?.trim().toLowerCase()==='azure')element.textContent='Microsoft';
  });
  document.querySelectorAll<HTMLElement>('.admin-provider-list span').forEach(element=>{
    if(element.textContent?.trim().toLowerCase()==='azure')element.textContent='MICROSOFT';
  });
}

function addMicrosoftButton(){
  if(!microsoftEnabled)return;
  const dialog=document.querySelector<HTMLElement>('.litlab-auth-dialog');
  if(!dialog||dialog.querySelector('[data-auth-microsoft]'))return;
  const google=dialog.querySelector<HTMLButtonElement>('[data-auth-google]');
  if(!google)return;

  const button=document.createElement('button');
  button.type='button';
  button.className='litlab-microsoft-button';
  button.dataset.authMicrosoft='true';
  button.innerHTML='<span class="litlab-microsoft-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>Continue with Microsoft</b>';
  google.insertAdjacentElement('afterend',button);
}

function patchAuthUI(){
  patchScheduled=false;
  renameAzureLabels();
  addMicrosoftButton();
}

function schedulePatch(){
  if(patchScheduled)return;
  patchScheduled=true;
  requestAnimationFrame(patchAuthUI);
}

function nodeNeedsPatch(node:Node){
  if(!(node instanceof Element))return false;
  return node.matches('.litlab-auth-dialog,.admin-provider,.admin-provider-list')||Boolean(node.querySelector('.litlab-auth-dialog,.admin-provider,.admin-provider-list'));
}

async function detectMicrosoftProvider(){
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
    if(!response.ok)return;
    const data=await response.json() as {external?:Record<string,boolean>};
    microsoftEnabled=Boolean(data.external?.azure);
  }catch{}
  schedulePatch();
}

document.addEventListener('pointerdown',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('[data-auth-open]'))setTimeout(schedulePatch,0);
  if(target?.closest('[data-auth-microsoft]')){
    event.preventDefault();
    event.stopPropagation();
    signInWithMicrosoft();
  }
},true);

const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(nodeNeedsPatch(node)){schedulePatch();return}
    }
  }
});
observer.observe(document.body,{childList:true,subtree:true});

void detectMicrosoftProvider();
schedulePatch();
