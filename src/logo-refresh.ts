import './logo-refresh.css';

const FULL_LOGO='./litlab-logo.svg?v=6';
const ICON_LOGO='./favicon.svg?v=6';

function makeImage(src:string,className:string,alt:string){
  const img=document.createElement('img');
  img.src=src;
  img.className=className;
  img.alt=alt;
  img.decoding='async';
  return img;
}

function refreshLogos(){
  document.querySelectorAll<HTMLElement>('.logo').forEach(logo=>{
    const compact=Boolean(logo.closest('.compass-center,.maker-core'));
    const variant=compact?'icon':'full';
    if(logo.dataset.litlabLogoVariant===variant&&logo.querySelector('img'))return;
    logo.dataset.litlabLogoVariant=variant;
    if(compact){
      logo.replaceChildren(makeImage(ICON_LOGO,'litlab-brand-icon','LitLab'));
    }else{
      logo.replaceChildren(makeImage(FULL_LOGO,'litlab-brand-full','LitLab'));
    }
  });
}

function start(){
  refreshLogos();
  new MutationObserver(refreshLogos).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
