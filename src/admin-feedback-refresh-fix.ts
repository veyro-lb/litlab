const AUTO_REFRESH_MS=5000;

let refreshTimer=0;
let retryTimer=0;
let retryCount=0;
let lastTriggeredAt=0;

function isAdminRoute(){
  return location.hash.replace(/^#/,'').split('?')[0]==='admin';
}

function tryRefreshFeedback(){
  if(!isAdminRoute()||document.visibilityState!=='visible')return;
  const button=document.querySelector<HTMLButtonElement>('#litlab-admin-feedback [data-feedback-refresh]');
  if(button&&!button.disabled){
    const now=Date.now();
    if(now-lastTriggeredAt<1200)return;
    lastTriggeredAt=now;
    button.click();
    retryCount=0;
    return;
  }
  if(retryCount>=24)return;
  retryCount++;
  window.clearTimeout(retryTimer);
  retryTimer=window.setTimeout(tryRefreshFeedback,150);
}

function scheduleFeedbackRefresh(delay=160){
  if(!isAdminRoute()||document.visibilityState!=='visible')return;
  retryCount=0;
  window.clearTimeout(refreshTimer);
  window.clearTimeout(retryTimer);
  refreshTimer=window.setTimeout(tryRefreshFeedback,delay);
}

const main=document.querySelector<HTMLElement>('main#main');
if(main){
  new MutationObserver(records=>{
    if(!isAdminRoute())return;
    const dashboardRebuilt=records.some(record=>Array.from(record.addedNodes).some(node=>{
      if(!(node instanceof Element))return false;
      return node.matches('[data-litlab-admin-page]')||Boolean(node.querySelector('[data-litlab-admin-page]'));
    }));
    if(dashboardRebuilt)scheduleFeedbackRefresh(220);
  }).observe(main,{childList:true,subtree:false});
}

window.addEventListener('hashchange',()=>scheduleFeedbackRefresh(260));
window.addEventListener('focus',()=>scheduleFeedbackRefresh(180));
window.addEventListener('litlab:submission-sent',()=>scheduleFeedbackRefresh(40));
window.addEventListener('storage',event=>{
  if(event.key==='litlabFeedbackLastSentAt'||event.key==='litlabTechnicalLastSentAt')scheduleFeedbackRefresh(40);
});

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')scheduleFeedbackRefresh(80);
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('[data-open-admin-analytics],[data-admin-refresh]'))scheduleFeedbackRefresh(320);
},true);

window.setInterval(()=>{
  if(document.visibilityState==='visible'&&isAdminRoute())scheduleFeedbackRefresh(0);
},AUTO_REFRESH_MS);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleFeedbackRefresh(320),{once:true});
else scheduleFeedbackRefresh(320);
