import './contributor-entry-prompt.css';

const PROMPT_SESSION_KEY='litlabContributorPromptDismissed';
const PROMPT_PREF_KEY='litlabContributorPromptPreference';
const PROMPT_DELAY_MS=3800;
const REMIND_LATER_MS=24*60*60*1000;
let promptTimer:number|undefined;

type PromptPreference={mode:'later';remindAfter:number}|{mode:'never'};

function contributorRoute(){
  return location.hash.replace(/^#/,'').split('#')[0]==='contribute';
}

function sessionDismissed(){
  try{return sessionStorage.getItem(PROMPT_SESSION_KEY)==='1'}catch{return false}
}

function markSessionDismissed(){
  try{sessionStorage.setItem(PROMPT_SESSION_KEY,'1')}catch{}
}

function readPreference():PromptPreference|null{
  try{
    const value=JSON.parse(localStorage.getItem(PROMPT_PREF_KEY)||'null') as PromptPreference|null;
    if(value?.mode==='never')return value;
    if(value?.mode==='later'&&Number.isFinite(value.remindAfter))return value;
  }catch{}
  return null;
}

function setPreference(value:PromptPreference|null){
  try{
    if(value)localStorage.setItem(PROMPT_PREF_KEY,JSON.stringify(value));
    else localStorage.removeItem(PROMPT_PREF_KEY);
  }catch{}
}

function promptBlocked(){
  const preference=readPreference();
  if(preference?.mode==='never')return true;
  if(preference?.mode==='later'){
    if(Date.now()<preference.remindAfter)return true;
    setPreference(null);
  }
  return sessionDismissed();
}

function removePrompt(immediate=false){
  if(promptTimer!==undefined){window.clearTimeout(promptTimer);promptTimer=undefined}
  const prompt=document.getElementById('ll-contributor-invite');
  if(!prompt)return;
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){prompt.remove();return}
  prompt.classList.remove('is-visible');
  prompt.classList.add('is-closing');
  window.setTimeout(()=>prompt.remove(),390);
}

function closeForSession(){
  markSessionDismissed();
  removePrompt();
}

function remindLater(){
  setPreference({mode:'later',remindAfter:Date.now()+REMIND_LATER_MS});
  try{sessionStorage.removeItem(PROMPT_SESSION_KEY)}catch{}
  removePrompt();
}

function neverNotify(){
  setPreference({mode:'never'});
  try{sessionStorage.removeItem(PROMPT_SESSION_KEY)}catch{}
  removePrompt();
}

function openContributorPage(){
  markSessionDismissed();
  removePrompt();
  if(contributorRoute()){
    scrollTo({top:0,behavior:'smooth'});
    return;
  }
  location.hash='contribute';
}

function buildPrompt(){
  if(document.getElementById('ll-contributor-invite')||contributorRoute()||promptBlocked())return;
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
        <p>DP students can contribute content and original practice material with CAS evidence support. Teachers can review or mentor academic work.</p>
        <span class="ll-contributor-invite-cta">Explore the contributor program <span aria-hidden="true">→</span></span>
      </span>
    </button>
    <div class="ll-contributor-invite-actions" aria-label="Contributor invitation options">
      <button type="button" class="primary" data-contributor-open>Contribute</button>
      <button type="button" data-contributor-later>Remind me later</button>
      <button type="button" class="quiet" data-contributor-never>Don’t notify me again</button>
    </div>
  </div>`;
  prompt.querySelector<HTMLButtonElement>('.ll-contributor-invite-close')?.addEventListener('click',closeForSession);
  prompt.querySelector<HTMLButtonElement>('.ll-contributor-invite-open')?.addEventListener('click',openContributorPage);
  prompt.querySelector<HTMLButtonElement>('[data-contributor-open]')?.addEventListener('click',openContributorPage);
  prompt.querySelector<HTMLButtonElement>('[data-contributor-later]')?.addEventListener('click',remindLater);
  prompt.querySelector<HTMLButtonElement>('[data-contributor-never]')?.addEventListener('click',neverNotify);
  document.body.appendChild(prompt);
  requestAnimationFrame(()=>requestAnimationFrame(()=>prompt.classList.add('is-visible')));
}

function schedulePrompt(){
  if(contributorRoute()){
    markSessionDismissed();
    removePrompt(true);
    return;
  }
  if(promptBlocked()||document.getElementById('ll-contributor-invite'))return;
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
    markSessionDismissed();
    removePrompt(true);
  }else{
    schedulePrompt();
  }
}

document.addEventListener('click',fixContributorInternalLinks,true);
window.addEventListener('hashchange',handleRouteChange);
window.addEventListener('popstate',handleRouteChange);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedulePrompt,{once:true});
else schedulePrompt();
