import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 44 40" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="22" cy="16" r="14"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M22 1.5v4"/>
        <path d="M9.3 6.3l2.9 2.9"/>
        <path d="M34.7 6.3l-2.9 2.9"/>
      </g>
      <path class="litlab-bulb-glass" d="M14.5 15.8c0-4.6 3.4-8.3 7.5-8.3s7.5 3.7 7.5 8.3c0 3.2-1.5 5.1-3.9 7.3-1.1 1-1.7 2-1.8 3.2h-3.6c-.1-1.2-.7-2.2-1.8-3.2-2.4-2.2-3.9-4.1-3.9-7.3Z"/>
      <path class="litlab-bulb-filament" d="M19.5 17.4 22 20l2.5-2.6M22 20v6.2"/>
      <g class="litlab-bulb-base">
        <path d="M18.9 29.1h6.2"/>
        <circle cx="22" cy="33.2" r="3.1"/>
      </g>
    </svg>
    <span class="litlab-floating-star"></span>
  `;
  return decorations;
}

function refreshLogos(){
  document.querySelectorAll<HTMLElement>('.logo').forEach(logo=>{
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
  });
}

function start(){
  refreshLogos();
  new MutationObserver(refreshLogos).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
