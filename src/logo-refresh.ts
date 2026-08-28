import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 40 32" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="20" cy="12.2" r="10.2"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M20 1.4v3"/>
        <path d="M10 5.5 12.1 7.6"/>
        <path d="M30 5.5 27.9 7.6"/>
      </g>
      <path class="litlab-bulb-glass" d="M13.9 12.8c0-3.8 2.7-6.9 6.1-6.9s6.1 3.1 6.1 6.9c0 2.65-1.2 4.35-3.15 6.1-.86.8-1.34 1.66-1.44 2.7h-3.02c-.1-1.04-.58-1.9-1.44-2.7-1.95-1.75-3.15-3.45-3.15-6.1Z"/>
      <path class="litlab-bulb-filament" d="m17.9 14 2.1 2.1 2.1-2.1M20 16.1v5.4"/>
      <path class="litlab-bulb-socket" d="M17.6 24.3h4.8M18.5 27h3M20 27v3.7"/>
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
