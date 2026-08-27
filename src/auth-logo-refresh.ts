import './auth-logo-refresh.css';

const LOGO_URL='./favicon.svg?v=6';

function makeLogo(className:string,size:number){
  const img=document.createElement('img');
  img.src=LOGO_URL;
  img.alt='';
  img.width=size;
  img.height=size;
  img.className=className;
  img.setAttribute('aria-hidden','true');
  return img;
}

function refreshAuthBranding(){
  document.querySelectorAll<HTMLElement>('.litlab-auth-mark').forEach(mark=>{
    if(mark.dataset.litlabBrandMark==='6')return;
    mark.dataset.litlabBrandMark='6';
    mark.replaceChildren(makeLogo('litlab-auth-brand-image',58));
  });

  document.querySelectorAll<HTMLElement>('.litlab-auth-signin').forEach(button=>{
    if(button.dataset.litlabBrandMark==='6')return;
    const googleBadge=button.querySelector('.litlab-google-g.small');
    const existing=button.querySelector('.litlab-auth-mini-brand');
    if(existing){
      (existing as HTMLImageElement).src=LOGO_URL;
      button.dataset.litlabBrandMark='6';
      return;
    }
    if(!googleBadge)return;
    googleBadge.replaceWith(makeLogo('litlab-auth-mini-brand',21));
    button.dataset.litlabBrandMark='6';
  });
}

function start(){
  refreshAuthBranding();
  new MutationObserver(refreshAuthBranding).observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
