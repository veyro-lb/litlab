import './auth-logo-refresh.css';
import {createLitLabMark} from './brand-mark';

function refreshAuthMark(mark:HTMLElement){
  if(mark.dataset.litlabBrandMark==='10')return;
  mark.dataset.litlabBrandMark='10';
  mark.replaceChildren(createLitLabMark('litlab-auth-brand-image'));
}

function refreshSignin(button:HTMLElement){
  if(button.dataset.litlabBrandMark==='10')return;
  const existing=button.querySelector('.litlab-auth-mini-brand');
  if(existing){
    existing.replaceWith(createLitLabMark('litlab-auth-mini-brand'));
    button.dataset.litlabBrandMark='10';
    return;
  }
  const googleBadge=button.querySelector('.litlab-google-g.small');
  if(!googleBadge)return;
  googleBadge.replaceWith(createLitLabMark('litlab-auth-mini-brand'));
  button.dataset.litlabBrandMark='10';
}

function refreshWithin(root:ParentNode){
  if(root instanceof HTMLElement){
    if(root.matches('.litlab-auth-mark'))refreshAuthMark(root);
    if(root.matches('.litlab-auth-signin'))refreshSignin(root);
  }
  root.querySelectorAll<HTMLElement>('.litlab-auth-mark').forEach(refreshAuthMark);
  root.querySelectorAll<HTMLElement>('.litlab-auth-signin').forEach(refreshSignin);
}

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
