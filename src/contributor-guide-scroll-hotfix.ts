type GuideEntry={button:HTMLButtonElement;target:HTMLElement};

let frame=0;
let settleTimer=0;
let refreshTimer=0;
let guideObserver:MutationObserver|null=null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function role(){
  const value=document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole||'';
  return value==='student'||value==='teacher'?value:'';
}
function guide(){return document.querySelector<HTMLElement>('[data-contributor-state-guide]')}
function usable(target:HTMLElement|null):target is HTMLElement{
  return Boolean(target&&target.isConnected&&!target.hidden&&!target.closest('[hidden]')&&target.getClientRects().length);
}
function lockButton(button:HTMLButtonElement,reason:string){
  button.dataset.contributorLocked=reason;
  button.classList.add('locked');
  button.classList.remove('current');
  button.setAttribute('aria-disabled','true');
  button.setAttribute('title',reason);
  button.removeAttribute('aria-current');
  button.removeAttribute('data-contributor-section-jump');
}
function lockEmptyCompletedButtons(host:HTMLElement){
  if(role()!=='student'||host.dataset.flow!=='completed')return;
  const rules=[
    {key:'tasks',selector:'.ll-task-list .ll-task',reason:'No task records are available for this completed contribution.'},
    {key:'revisions',selector:'.ll-revision-list .ll-revision',reason:'No revision requests were recorded for this completed contribution.'}
  ];
  for(const rule of rules){
    const button=host.querySelector<HTMLButtonElement>(`[data-section-key="${rule.key}"][data-contributor-section-jump]`);
    if(button&&!document.querySelector(rule.selector))lockButton(button,rule.reason);
  }
}
function guideEntries(host:HTMLElement){
  const entries:GuideEntry[]=[];
  host.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump]:not([data-contributor-locked])').forEach(button=>{
    const id=button.dataset.contributorSectionJump||'';
    const target=id?document.getElementById(id):null;
    if(usable(target))entries.push({button,target});
  });
  const applicationButton=host.querySelector<HTMLButtonElement>('[data-contributor-action="application"]:not([data-contributor-locked])');
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
  const buttons=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-contributor-section-jump],[data-contributor-action]')).filter(item=>!item.matches('[data-contributor-locked]'));
  const previous=buttons.find(item=>item.classList.contains('current'))||null;
  if(previous===button)return;
  host.querySelectorAll<HTMLButtonElement>('.current').forEach(item=>{item.classList.remove('current');item.removeAttribute('aria-current')});
  if(!button||button.matches('[data-contributor-locked]'))return;
  button.classList.add('current');
  button.setAttribute('aria-current','location');
  reveal(button,host);
}
function chooseActive(entries:GuideEntry[],host:HTMLElement){
  const anchor=Math.max(110,Math.round(host.getBoundingClientRect().bottom+28));
  let active:GuideEntry|null=null;
  let bestTop=-Infinity;
  let upcoming:GuideEntry|null=null;
  let upcomingTop=Infinity;
  for(const entry of entries){
    const rect=entry.target.getBoundingClientRect();
    if(rect.width===0&&rect.height===0)continue;
    const top=rect.top;
    if(top<=anchor){
      if(top>bestTop+1){bestTop=top;active=entry}
      continue;
    }
    if(top<upcomingTop-1){upcomingTop=top;upcoming=entry}
  }
  return active||upcoming||entries[0];
}
function sync(){
  if(route()!=='contribute'||role()!=='student')return;
  const host=guide();if(!host)return;
  lockEmptyCompletedButtons(host);
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
    settleTimer=window.setTimeout(sync,90);
  });
}
function observeGuide(){
  guideObserver?.disconnect();
  const host=guide();if(!host)return;
  guideObserver=new MutationObserver(()=>refreshSoon());
  guideObserver.observe(host,{childList:true,subtree:true});
}
function refreshSoon(){
  window.clearTimeout(refreshTimer);
  refreshTimer=window.setTimeout(()=>{observeGuide();scheduleSync()},70);
}

// Contributor workspaces contain nested scrolling and dynamically re-rendered sections.
// Capture every scroll source, then do one section-boundary geometry pass per frame.
document.addEventListener('scroll',scheduleSync,{capture:true,passive:true});
window.addEventListener('scroll',scheduleSync,{passive:true});
window.addEventListener('resize',refreshSoon,{passive:true});
window.addEventListener('hashchange',refreshSoon);
for(const name of ['litlab:contributor-account-role','litlab:contributor-workspace-data','litlab:contributor-workspace-updated','litlab:contributor-submitted','litlab:contributor-admin-updated'])window.addEventListener(name,refreshSoon);

// Student guide navigation has one owner. Locked chips are inert; usable chips jump
// immediately so a second smooth-scroll tracker cannot race the active highlight.
window.addEventListener('click',event=>{
  if(route()!=='contribute'||role()!=='student')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest<HTMLButtonElement>('[data-contributor-state-guide] [data-contributor-section-jump]');
  if(!button||button.matches('[data-contributor-locked]'))return;
  const id=button.dataset.contributorSectionJump||'';
  const destination=id?document.getElementById(id):null;
  if(!usable(destination))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  setCurrent(button);
  destination.scrollIntoView({behavior:'auto',block:'start'});
  requestAnimationFrame(()=>scheduleSync());
},{capture:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshSoon,{once:true});else refreshSoon();
window.setTimeout(refreshSoon,320);

export {};
