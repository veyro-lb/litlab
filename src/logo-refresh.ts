import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

function createFullLogoDecorations(){
  const decorations=document.createElement('span');
  decorations.className='litlab-logo-decorations';
  decorations.setAttribute('aria-hidden','true');
  decorations.innerHTML=`
    <svg class="litlab-bulb-overlay" viewBox="0 0 48 56" aria-hidden="true">
      <circle class="litlab-bulb-halo" cx="24" cy="21" r="17"/>
      <g class="litlab-bulb-rays" fill="none" stroke-linecap="round">
        <path d="M24 1.8v5.4"/>
        <path d="M8.6 7.8l3.8 3.8"/>
        <path d="M39.4 7.8l-3.8 3.8"/>
      </g>
      <path class="litlab-bulb-glass" d="M14.7 21.2c0-5.8 4.2-10.4 9.3-10.4s9.3 4.6 9.3 10.4c0 4-1.8 6.6-4.8 9.4-1.3 1.2-2 2.5-2.1 4H21.6c-.1-1.5-.8-2.8-2.1-4-3-2.8-4.8-5.4-4.8-9.4Z"/>
      <path class="litlab-bulb-filament" d="M20.7 22.7 24 26l3.3-3.3M24 26v8.5"/>
      <g class="litlab-bulb-base">
        <path d="M19.8 38h8.4"/>
        <path d="M20.8 41.5h6.4"/>
        <circle cx="24" cy="45.3" r="2.7"/>
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
