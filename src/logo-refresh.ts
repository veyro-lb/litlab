import './logo-refresh.css';
import {createLitLabMark} from './brand-mark';

function makeWordmark(){
  const word=document.createElement('span');
  word.className='litlab-brand-wordmark';
  const lit=document.createElement('span');
  lit.className='litlab-brand-lit';
  lit.textContent='Lit';
  const lab=document.createElement('span');
  lab.className='litlab-brand-lab';
  lab.textContent='Lab';
  word.append(lit,lab);
  return word;
}

function refreshLogos(){
  document.querySelectorAll<HTMLElement>('.logo').forEach(logo=>{
    const compact=Boolean(logo.closest('.compass-center,.maker-core'));
    const variant=compact?'icon-v8':'full-v8';
    if(logo.dataset.litlabLogoVariant===variant)return;
    logo.dataset.litlabLogoVariant=variant;
    const mark=createLitLabMark(compact?'litlab-brand-icon':'litlab-brand-mark',!compact);
    if(compact){
      logo.replaceChildren(mark);
      logo.setAttribute('aria-label','LitLab');
    }else{
      logo.replaceChildren(mark,makeWordmark());
    }
  });
}

function start(){
  refreshLogos();
  new MutationObserver(refreshLogos).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
