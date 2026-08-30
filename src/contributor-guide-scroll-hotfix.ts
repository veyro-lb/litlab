type GuideEntry={button:HTMLButtonElement;target:HTMLElement};

let frame=0;
let settleTimer=0;
let refreshTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function role(){
  const value=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'?value:'';
}
function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function usable(target:HTMLElement|null):target is HTMLElement{
  return Boolean(target&&target.isConnected&&!target.hidden&&!target.closest('[hidden]')&&target.getClientRects().length);
}
function guideEntries(host:HTMLElement){
  const entries:GuideEntry[]=[];
  host.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump]').forEach(button=>{
    const id=button.dataset.contributorSectionJump||'';
    const target=id?document.getElementById(id):null;
    if(usable(target))entries.push({button,target});
  });
  const applicationButton=host.querySelector<HTMLButtonElement>('[data-contributor-action="application"]');
  const application=document.getElementById('contribute-apply');
  if(applicationButton&&usable(application))entries.push({button:applicationButton,target:application});
  return entries;
}
function reveal(button:HTMLButtonElement,host:HTMLElement){
  const strip=host.querySelector<HTMLElement>('.ll-contributor-toc-links');if(!strip)return;
  const left=button.offsetLeft;
  const right=left+button.offsetWidth;
  const min=strip.scrollLeft+8;
  const max=strip.scrollLeft+strip.clientWidth-8;
  if(left<min)strip.scrollTo({left:Math.max(0,left-8),behavior:'auto'});
  else if(right>max)strip.scrollTo({left:Math.max(0,right-strip.clientWidth+8),behavior:'auto'});
}
function setCurrent(button:HTMLButtonElement|null){
  const host=guide();if(!host)return;
  const buttons=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump],[data-contributor-action]'));
  const previous=buttons.find(item=>item.classList.contains('current'))||null;
  if(previous===button)return;
  buttons.forEach(item=>{
    const active=item===button;
    item.classList.toggle('current',active);
    if(active)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current');
  });
  if(button)reveal(button,host);
}
function chooseActive(entries:GuideEntry[],host:HTMLElement){
  const guideBottom=host.getBoundingClientRect().bottom;
  const viewportHeight=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
  const probe=Math.min(viewportHeight-72,Math.max(guideBottom+96,viewportHeight*.42));
  let active=entries[0];
  let bestDistance=Infinity;
  let bestTop=-Infinity;
  for(const entry of entries){
    const rect=entry.target.getBoundingClientRect();
    if(rect.width===0&&rect.height===0)continue;
    const distance=probe<rect.top?rect.top-probe:probe>rect.bottom?probe-rect.bottom:0;
    if(distance<bestDistance||(distance===bestDistance&&rect.top<=probe&&rect.top>bestTop)){
      bestDistance=distance;
      bestTop=rect.top;
      active=entry;
    }
  }
  return active;
}
function sync(){
  if(route()!=='contribute')return;
  const host=guide();if(!host)return;
  const entries=guideEntries(host);
  if(!entries.length){setCurrent(null);return}
  setCurrent(chooseActive(entries,host).button);
}
function scheduleSync(){
  if(frame)return;
  frame=requestAnimationFrame(()=>{
    frame=0;
    sync();
    window.clearTimeout(settleTimer);
    settleTimer=window.setTimeout(sync,0);
  });
}
function refreshSoon(){
  window.clearTimeout(refreshTimer);
  refreshTimer=window.setTimeout(scheduleSync,110);
}

// Scroll does not reliably originate on window in the contributor workspace.
// Capture descendant scroll events as well, then do one lightweight geometry pass.
document.addEventListener('scroll',scheduleSync,{capture:true,passive:true});
window.addEventListener('scroll',scheduleSync,{passive:true});
window.addEventListener('resize',scheduleSync,{passive:true});
window.addEventListener('hashchange',refreshSoon);
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,refreshSoon);

// Student guide clicks previously started a smooth-scroll animation while another
// tracker was changing the current chip. Own the jump at the window capture phase so
// the destination and highlight update in the same frame without the Orientation pin.
window.addEventListener('click',event=>{
  if(route()!=='contribute'||role()!=='student')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-contributor-state-guide] [data-contributor-section-jump]');
  if(!button)return;
  const id=button.dataset.contributorSectionJump||'';
  const destination=id?document.getElementById(id):null;
  if(!usable(destination))return;
  event.preventDefault();
  event.stopPropagation();
  setCurrent(button);
  destination.scrollIntoView({behavior:'auto',block:'start'});
  scheduleSync();
},{capture:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshSoon,{once:true});else refreshSoon();
window.setTimeout(scheduleSync,320);

export {};
