import './account-center-branding.css';
import './unassigned-role-guard';
import {createLitLabMark} from './brand-mark';

function replaceLoadingMark(root:ParentNode){
  const loading=root instanceof HTMLElement&&root.matches('.litlab-account-center-loading')?root:root.querySelector<HTMLElement>('.litlab-account-center-loading');
  if(!loading||loading.querySelector('.litlab-account-center-loading-logo'))return;
  const legacy=loading.querySelector<HTMLElement>(':scope > span');
  if(!legacy)return;
  legacy.replaceWith(createLitLabMark('litlab-account-center-loading-logo',true));
}

function replaceFallbackAvatars(root:ParentNode){
  const avatars:HTMLElement[]=[];
  if(root instanceof HTMLElement&&root.matches('.litlab-account-center-avatar'))avatars.push(root);
  avatars.push(...Array.from(root.querySelectorAll<HTMLElement>('.litlab-account-center-avatar')));
  avatars.forEach(avatar=>{
    if(avatar.querySelector('.litlab-account-center-avatar-logo'))return;
    if((avatar.textContent||'').trim()!=='LL')return;
    avatar.replaceChildren(createLitLabMark('litlab-account-center-avatar-logo'));
  });
}

function refreshWithin(root:ParentNode){replaceLoadingMark(root);replaceFallbackAvatars(root)}

function start(){
  refreshWithin(document);
  new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of Array.from(mutation.addedNodes)){
        if(node instanceof HTMLElement)refreshWithin(node);
      }
    }
  }).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
