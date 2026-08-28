import './auth-logo-refresh.css';
import {createLitLabMark} from './brand-mark';

function refreshAuthBranding(){
  document.querySelectorAll<HTMLElement>('.litlab-auth-mark').forEach(mark=>{
    if(mark.dataset.litlabBrandMark==='8')return;
    mark.dataset.litlabBrandMark='8';
    mark.replaceChildren(createLitLabMark('litlab-auth-brand-image'));
  });

  document.querySelectorAll<HTMLElement>('.litlab-auth-signin').forEach(button=>{
    if(button.dataset.litlabBrandMark==='8')return;
    const existing=button.querySelector('.litlab-auth-mini-brand');
    if(existing){
      existing.replaceWith(createLitLabMark('litlab-auth-mini-brand'));
      button.dataset.litlabBrandMark='8';
      return;
    }
    const googleBadge=button.querySelector('.litlab-google-g.small');
    if(!googleBadge)return;
    googleBadge.replaceWith(createLitLabMark('litlab-auth-mini-brand'));
    button.dataset.litlabBrandMark='8';
  });
}

function start(){
  refreshAuthBranding();
  new MutationObserver(refreshAuthBranding).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
