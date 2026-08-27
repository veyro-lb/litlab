import './special-route-framing-fix.css';

function px(value:number){return `${Math.max(0,Math.ceil(value))}px`}

function syncSpecialRouteFraming(){
  if(!document.body.classList.contains('litlab-special-route-active'))return;

  const topbar=document.querySelector<HTMLElement>('#root .topbar');
  const dock=document.querySelector<HTMLElement>('#root .litlab-route-dock');
  const localNav=document.querySelector<HTMLElement>('.book-profile-toc,.essay-family-guide-nav,.hl-guide-nav,.ee-guide-nav');

  const topRect=topbar?.getBoundingClientRect();
  const dockRect=dock?.getBoundingClientRect();

  // Use the furthest visible bottom edge so wrapping/phone layouts are handled.
  const chromeBottom=Math.max(
    topRect?.bottom||0,
    dockRect?.bottom||0,
    (topRect?.height||76)+(dockRect?.height||48)
  );

  const guideHeight=Math.max(44,localNav?.getBoundingClientRect().height||56);
  document.body.style.setProperty('--litlab-special-chrome-height',px(chromeBottom));
  document.body.style.setProperty('--litlab-local-guide-height',px(guideHeight));
}

function queueSync(){
  requestAnimationFrame(()=>{
    syncSpecialRouteFraming();
    requestAnimationFrame(syncSpecialRouteFraming);
  });
}

window.addEventListener('resize',queueSync,{passive:true});
window.addEventListener('orientationchange',queueSync,{passive:true});
window.visualViewport?.addEventListener('resize',queueSync,{passive:true});
window.visualViewport?.addEventListener('scroll',queueSync,{passive:true});
window.addEventListener('hashchange',()=>setTimeout(queueSync,0));

const observer=new MutationObserver(()=>queueSync());
observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueSync,{once:true});
else queueSync();
