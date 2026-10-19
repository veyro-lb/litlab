import './logo-refresh.css';
import {createLitLabLogo,createLitLabMark} from './brand-mark';

// The bulb uses the same flicker timing as the original LitLab i-dot animation.
// Its position is tied to the uploaded image's natural 320 x 116 proportions.
function createFlickeringBulb(){
  const bulb=document.createElementNS('http://www.w3.org/2000/svg','svg');
  bulb.setAttribute('class','ibdplabs-bulb');
  bulb.setAttribute('viewBox','0 0 48 64');
  bulb.setAttribute('aria-hidden','true');
  bulb.setAttribute('focusable','false');
  bulb.innerHTML=`
    <circle class="ibdplabs-bulb-glow" cx="24" cy="25" r="29" fill="#ffd250" opacity=".62"/>
    <g class="ibdplabs-bulb-rays" fill="none" stroke="#f6bd29" stroke-width="3.8" stroke-linecap="round">
      <path d="M24 0v5M7 9l4 4M41 9l-4 4M1 25h5M42 25h5"/>
    </g>
    <path class="ibdplabs-bulb-glass" d="M24 8C13 8 7 16 7 25c0 7 3 12 9 16 2 1 3 3 3 6h10c0-3 1-5 3-6 6-4 9-9 9-16 0-9-6-17-17-17Z" fill="#fff7bd" stroke="#eab72b" stroke-width="3"/>
    <path class="ibdplabs-bulb-filament" d="m17 25 7 8 7-8M24 33v9" stroke="#b47a06" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M18 47h12v7H18z" fill="#596477"/>
    <path d="M20 54h8l-2 4h-4Z" fill="#303b52"/>
  `;
  return bulb;
}

function refreshLogo(logo:HTMLElement){
  const compact=Boolean(logo.closest('.compass-center,.maker-core'));
  const variant=compact?'icon-v10':'full-v11';
  if(logo.dataset.litlabLogoVariant===variant)return;
  logo.dataset.litlabLogoVariant=variant;

  if(compact){
    logo.replaceChildren(createLitLabMark('litlab-brand-icon'));
    logo.setAttribute('aria-label','LitLab');
    return;
  }

  logo.replaceChildren(createLitLabLogo('litlab-brand-horizontal',true),createFlickeringBulb());
  logo.removeAttribute('aria-label');
}

function refreshContributorMark(mark:HTMLElement){
  if(mark.dataset.litlabLogoVariant==='contributor-mark-v1')return;
  mark.dataset.litlabLogoVariant='contributor-mark-v1';
  mark.replaceChildren(createLitLabMark('litlab-contributor-brand-icon'));
}

function refreshChatMark(brand:HTMLElement){
  if(brand.dataset.litlabChatBrand==='icon-v1')return;
  const legacy=brand.querySelector<HTMLElement>(':scope > span');
  if(!legacy||(legacy.textContent||'').trim()!=='LL')return;
  const image=createLitLabMark('litlab-contributor-chat-brand-icon');
  image.style.width='38px';
  image.style.height='38px';
  image.style.objectFit='contain';
  image.style.flex='0 0 auto';
  legacy.replaceWith(image);
  brand.dataset.litlabChatBrand='icon-v1';
}

function refreshWithin(root:ParentNode){
  if(root instanceof HTMLElement){
    if(root.matches('.logo'))refreshLogo(root);
    if(root.matches('.ll-contrib-mark'))refreshContributorMark(root);
    if(root.matches('.ll-contributor-chat-brand'))refreshChatMark(root);
  }
  root.querySelectorAll<HTMLElement>('.logo').forEach(refreshLogo);
  root.querySelectorAll<HTMLElement>('.ll-contrib-mark').forEach(refreshContributorMark);
  root.querySelectorAll<HTMLElement>('.ll-contributor-chat-brand').forEach(refreshChatMark);
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
