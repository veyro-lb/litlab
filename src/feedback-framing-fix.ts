import './feedback-framing-fix.css';

function feedbackRoot(){
  return document.getElementById('ll-feedback-root');
}

function syncFeedbackViewport(){
  const root=feedbackRoot();
  if(!root||!root.classList.contains('open'))return;
  const viewport=window.visualViewport;
  const height=Math.max(240,Math.floor(viewport?.height||window.innerHeight));
  root.style.setProperty('--ll-feedback-visible-height',`${height}px`);
}

function queueSync(){
  requestAnimationFrame(()=>{
    syncFeedbackViewport();
    requestAnimationFrame(syncFeedbackViewport);
  });
}

window.addEventListener('resize',queueSync,{passive:true});
window.addEventListener('orientationchange',queueSync,{passive:true});
window.visualViewport?.addEventListener('resize',queueSync,{passive:true});
window.visualViewport?.addEventListener('scroll',queueSync,{passive:true});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('#ll-feedback-trigger,[data-feedback-mode]'))setTimeout(queueSync,0);
},true);

document.addEventListener('focusin',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('#ll-feedback-root'))setTimeout(queueSync,30);
});

const observer=new MutationObserver(records=>{
  if(records.some(record=>
    Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.id==='ll-feedback-root'||Boolean(node.querySelector?.('#ll-feedback-root'))))
  ))queueSync();
  const root=feedbackRoot();
  if(root?.classList.contains('open'))queueSync();
});
observer.observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});

queueSync();
