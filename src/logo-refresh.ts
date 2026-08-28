import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 64 64" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="32" cy="28" r="23"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M32 3v7"/>
        <path d="M12.5 11.5l5 5"/>
        <path d="M51.5 11.5l-5 5"/>
        <path d="M6 29h7"/>
        <path d="M51 29h7"/>
      </g>
      <path class="litlab-bulb-glass" d="M19 27.5c0-7.5 5.8-13.5 13-13.5s13 6 13 13.5c0 5.3-2.6 8.6-6 11.8-1.8 1.7-2.7 3.2-2.8 5.2h-8.4c-.1-2-.9-3.5-2.8-5.2-3.4-3.2-6-6.5-6-11.8Z"/>
      <path class="litlab-bulb-filament" d="M27.5 29.5 32 34l4.5-4.5M32 34v10.5"/>
      <path class="litlab-bulb-base" d="M27 49h10M28.5 53h7"/>
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
