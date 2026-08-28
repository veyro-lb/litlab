import './contributor-entry-prompt.css';

const PROMPT_SESSION_KEY='litlabContributorPromptDismissed';
const PROMPT_DELAY_MS=3800;
let promptTimer:number|undefined;

function contributorRoute(){
  return location.hash.replace(/^#/,'').split('#')[0]==='contribute';
}

function promptDismissed(){
  try{return sessionStorage.getItem(PROMPT_SESSION_KEY)==='1'}catch{return false}
}

function markPromptDismissed(){
  try{sessionStorage.setItem(PROMPT_SESSION_KEY,'1')}catch{}
}

function removePrompt(dismiss=false,immediate=false){
  if(promptTimer!==undefined){window.clearTimeout(promptTimer);promptTimer=undefined}
  if(dismiss)markPromptDismissed();
  const prompt=document.getElementById('ll-contributor-invite');
  if(!prompt)return;
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){prompt.remove();return}
  prompt.classList.remove('is-visible');
  prompt.classList.add('is-closing');
  window.setTimeout(()=>prompt.remove(),390);
}

function openContributorPage(){
  markPromptDismissed();
  removePrompt(false);
  if(contributorRoute()){
    scrollTo({top:0,behavior:'smooth'});
    return;
  }
  location.hash='contribute';
}

function buildPrompt(){
  if(document.getElementById('ll-contributor-invite')||contributorRoute()||promptDismissed())return;
  const prompt=document.createElement('aside');
  prompt.id='ll-contributor-invite';
  prompt.className='ll-contributor-invite';
  prompt.setAttribute('aria-label','LitLab contributor invitation');
  prompt.innerHTML=`<div class="ll-contributor-invite-shell">
    <button type="button" class="ll-contributor-invite-close" aria-label="Close contributor invitation">×</button>
    <button type="button" class="ll-contributor-invite-open" aria-label="Open the LitLab Contributor Program">
      <span class="ll-contributor-invite-icon" aria-hidden="true">✦</span>
      <span class="ll-contributor-invite-copy">
        <span class="ll-contributor-invite-kicker">LitLab Contributor Program</span>
        <b>Want to help build LitLab?</b>
        <p>DP students can contribute content with CAS evidence support, while teachers can review or mentor academic work.</p>
        <span class="ll-contributor-invite-cta">See how you can contribute <span aria-hidden="true">→</span></span>
      </span>
    </button>
  </div>`;
  prompt.querySelector<HTMLButtonElement>('.ll-contributor-invite-close')?.addEventListener('click',event=>{
    event.stopPropagation();
    removePrompt(true);
  });
  prompt.querySelector<HTMLButtonElement>('.ll-contributor-invite-open')?.addEventListener('click',openContributorPage);
  document.body.appendChild(prompt);
  requestAnimationFrame(()=>requestAnimationFrame(()=>prompt.classList.add('is-visible')));
}

function schedulePrompt(){
  if(contributorRoute()){
    markPromptDismissed();
    removePrompt(false,true);
    return;
  }
  if(promptDismissed()||document.getElementById('ll-contributor-invite'))return;
  if(promptTimer!==undefined)window.clearTimeout(promptTimer);
  promptTimer=window.setTimeout(()=>{
    promptTimer=undefined;
    buildPrompt();
  },PROMPT_DELAY_MS);
}

function fixContributorInternalLinks(event:MouseEvent){
  const target=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('#ll-contributor-root a[href^="#contribute-"]'):null;
  if(!target)return;
  const href=target.getAttribute('href')||'';
  const id=href.slice(1);
  const section=document.getElementById(id);
  if(!section)return;
  event.preventDefault();
  requestAnimationFrame(()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
}

function handleRouteChange(){
  if(contributorRoute()){
    markPromptDismissed();
    removePrompt(false,true);
  }else{
    schedulePrompt();
  }
}

document.addEventListener('click',fixContributorInternalLinks,true);
window.addEventListener('hashchange',handleRouteChange);
window.addEventListener('popstate',handleRouteChange);

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',schedulePrompt,{once:true});
}else{
  schedulePrompt();
}
