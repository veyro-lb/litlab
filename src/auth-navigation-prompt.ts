import {shouldShowSignInReminder} from './google-auth';

let navigationIntent=0;

function openSignInReminder(destination:string,attempt=0){
  if(location.hash!==destination||!shouldShowSignInReminder())return;
  if(document.querySelector('[data-auth-modal]'))return;

  const signIn=document.querySelector<HTMLButtonElement>('[data-auth-open]');
  if(signIn){
    signIn.click();
  }else if(attempt<8){
    setTimeout(()=>openSignInReminder(destination,attempt+1),100);
  }
}

// A click only counts when it leads to a route change.
document.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!shouldShowSignInReminder())return;
  if(!event.composedPath().some(node=>node instanceof Element&&node.matches('button,a[href]')))return;
  navigationIntent=performance.now()+1000;
},true);

window.addEventListener('hashchange',()=>{
  if(!navigationIntent||performance.now()>navigationIntent)return;
  navigationIntent=0;
  const destination=location.hash;
  setTimeout(()=>openSignInReminder(destination),0);
});
