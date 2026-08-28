import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 40 32" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="20" cy="12.5" r="10.5"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M20 1.5v3"/>
        <path d="M9.8 5.6 12 7.8"/>
        <path d="M30.2 5.6 28 7.8"/>
      </g>
      <path class="litlab-bulb-glass" d="M13.7 13c0-4 2.8-7.2 6.3-7.2s6.3 3.2 6.3 7.2c0 2.8-1.3 4.6-3.3 6.4-.9.8-1.4 1.7-1.5 2.8h-3c-.1-1.1-.6-2-1.5-2.8-2-1.8-3.3-3.6-3.3-6.4Z"/>
      <path class="litlab-bulb-filament" d="m17.8 14.1 2.2 2.2 2.2-2.2M20 16.3v5.8"/>
      <g class="litlab-bulb-base">
        <path d="M17.4 24.9h5.2"/>
        <path d="M18.3 27.8h3.4"/>
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
