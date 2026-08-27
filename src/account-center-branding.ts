import './account-center-branding.css';
import {createLitLabMark} from './brand-mark';

function replaceLoadingMark(){
  const loading=document.querySelector<HTMLElement>('.litlab-account-center-loading');
  if(!loading||loading.querySelector('.litlab-account-center-loading-logo'))return;
  const legacy=loading.querySelector<HTMLElement>(':scope > span');
  if(!legacy)return;
  legacy.replaceWith(createLitLabMark('litlab-account-center-loading-logo',true));
}

function replaceFallbackAvatar(){
  document.querySelectorAll<HTMLElement>('.litlab-account-center-avatar').forEach(avatar=>{
    if(avatar.querySelector('.litlab-account-center-avatar-logo'))return;
    if((avatar.textContent||'').trim()!=='LL')return;
    avatar.replaceChildren(createLitLabMark('litlab-account-center-avatar-logo'));
  });
}

function refreshAccountBranding(){
  replaceLoadingMark();
  replaceFallbackAvatar();
}

const observer=new MutationObserver(refreshAccountBranding);
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshAccountBranding,{once:true});
else refreshAccountBranding();
