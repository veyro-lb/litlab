import {shouldShowSignInReminder} from './google-auth';

const routesBeforeClick=new WeakMap<MouseEvent,string>();

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

function remindAfterNavigation(){
  const destination=location.hash;
  setTimeout(()=>openSignInReminder(destination),0);
}

document.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!shouldShowSignInReminder())return;
  const control=event.composedPath().find(node=>node instanceof HTMLButtonElement||node instanceof HTMLAnchorElement);
  if(!control)return;
  routesBeforeClick.set(event,location.hash);

  // Native fragment links navigate after click handlers finish.
  if(!(control instanceof HTMLAnchorElement)||!control.hash||control.hasAttribute('download')||(control.target&&control.target!=='_self'))return;
  const origin=location.href;
  const destination=control.href;
  if(origin===destination||destination.split('#')[0]!==origin.split('#')[0])return;
  const onHashChange=(change:HashChangeEvent)=>{
    if(!event.defaultPrevented&&change.oldURL===origin&&change.newURL===destination)remindAfterNavigation();
  };
  window.addEventListener('hashchange',onHashChange,{once:true});
  setTimeout(()=>window.removeEventListener('hashchange',onHashChange),1000);
},true);

// App buttons can update the hash synchronously in their own click handlers.
window.addEventListener('click',event=>{
  const previous=routesBeforeClick.get(event);
  if(previous!==undefined&&location.hash!==previous)remindAfterNavigation();
});
