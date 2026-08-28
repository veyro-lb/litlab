import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 40 40" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="20" cy="14" r="11.5"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M20 1.8v3.2"/>
        <path d="M9.8 5.8l2.2 2.2"/>
        <path d="M30.2 5.8 28 8"/>
      </g>
      <path class="litlab-bulb-glass" d="M13.8 14.5c0-3.9 2.8-7 6.2-7s6.2 3.1 6.2 7c0 2.7-1.2 4.3-3.2 6.2-.9.9-1.4 1.8-1.5 2.8h-3c-.1-1-.6-1.9-1.5-2.8-2-1.9-3.2-3.5-3.2-6.2Z"/>
      <path class="litlab-bulb-filament" d="m17.9 15.7 2.1 2.1 2.1-2.1M20 17.8v5.6"/>
      <g class="litlab-bulb-base">
        <path d="M17.8 26.1h4.4"/>
        <circle cx="20" cy="31.5" r="2.55"/>
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
