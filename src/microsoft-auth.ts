import './microsoft-auth.css';

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
  window.location.href=authorize.toString();
}

function replaceExactText(selector:string,from:string,to:string){
  document.querySelectorAll<HTMLElement>(selector).forEach(element=>{
    if(element.textContent?.trim()===from)element.textContent=to;
  });
}

function makeProviderCopyNeutral(){
  const dialog=document.querySelector<HTMLElement>('.litlab-auth-dialog');
  if(dialog){
    const intro=dialog.querySelector<HTMLElement>(':scope > p');
    if(intro&&intro.textContent?.includes('Use your Google account')){
      intro.textContent='Use Google or Microsoft to create or access your LitLab account. LitLab only requests your basic profile and email for sign-in.';
    }
    const note=dialog.querySelector<HTMLElement>(':scope > small');
    if(note&&note.textContent?.includes('Google password'))note.textContent='Your Google or Microsoft password is never shared with LitLab.';
  }

  replaceExactText('.litlab-account-status b','Google account connected','Account connected');
  replaceExactText('.litlab-account-center-head i','Google connected','Account connected');
  replaceExactText('.admin-user-table th','Last Google sign-in','Last provider sign-in');

  document.querySelectorAll<HTMLElement>('.admin-provider').forEach(element=>{
    if(element.textContent?.trim().toLowerCase()==='azure')element.textContent='Microsoft';
  });
  document.querySelectorAll<HTMLElement>('.admin-provider-list span').forEach(element=>{
    if(element.textContent?.trim().toLowerCase()==='azure')element.textContent='MICROSOFT';
  });

  document.querySelectorAll<HTMLElement>('.admin-metric small,.admin-gate-card p,.admin-privacy p').forEach(element=>{
    if(!element.textContent)return;
    element.textContent=element.textContent
      .replace('Google-authenticated LitLab accounts','Authenticated LitLab accounts')
      .replace('recent Google sign-in','recent provider sign-in')
      .replace('approved LitLab developer Google account','approved LitLab developer account')
      .replace('No Google passwords, Gmail messages, Drive files','No provider passwords, Gmail or Outlook messages, Drive files');
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
  makeProviderCopyNeutral();
  addMicrosoftButton();
}

function schedulePatch(){
  if(patchScheduled)return;
  patchScheduled=true;
  requestAnimationFrame(patchAuthUI);
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

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('.litlab-account-trigger'))setTimeout(schedulePatch,0);
},true);

const observer=new MutationObserver(schedulePatch);
observer.observe(document.body,{childList:true,subtree:true});

void detectMicrosoftProvider();
schedulePatch();
