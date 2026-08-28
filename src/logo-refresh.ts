import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML='<span class="litlab-floating-star"></span>';
  return decorations;
}

function refreshLogo(logo:HTMLElement){
  const compact=Boolean(logo.closest('.compass-center,.maker-core'));
  const variant=compact?'icon-v10':'full-v10';
  if(logo.dataset.litlabLogoVariant===variant)return;
  logo.dataset.litlabLogoVariant=variant;

  if(compact){
    logo.replaceChildren(createLitLabMark('litlab-brand-icon'));
    logo.setAttribute('aria-label','LitLab');
    return;
  }

  logo.replaceChildren(createLitLabLogo('litlab-brand-horizontal',true),createFullLogoDecorations());
  logo.removeAttribute('aria-label');
}

function refreshContributorMark(mark:HTMLElement){
  if(mark.dataset.litlabLogoVariant==='contributor-mark-v1')return;
  mark.dataset.litlabLogoVariant='contributor-mark-v1';
  mark.replaceChildren(createLitLabMark('litlab-contributor-brand-icon'));
}

function refreshWithin(root:ParentNode){
  if(root instanceof HTMLElement){
    if(root.matches('.logo'))refreshLogo(root);
    if(root.matches('.ll-contrib-mark'))refreshContributorMark(root);
  }
  root.querySelectorAll<HTMLElement>('.logo').forEach(refreshLogo);
  root.querySelectorAll<HTMLElement>('.ll-contrib-mark').forEach(refreshContributorMark);
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
