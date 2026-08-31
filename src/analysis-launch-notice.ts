import './analysis-launch-notice.css';

const NOTICE_ID='ll-analysis-launch-notice';
const CONTRIBUTOR_NOTICE_ID='ll-contributor-status-notice';
const SEEN_KEY='litlabAnalysisLaunchNoticeSeen:2026-08-31-v1';
const FIRST_TRY_MS=1100;
const RETRY_MS=550;
const EXPOSURE_MS=1400;
const AUTO_CLOSE_MS=15000;

let retryTimer=0;
let exposureTimer=0;
let autoCloseTimer=0;
let waitingForContributor=false;

const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const currentRoute=()=>location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';

function seen(){
  try{return localStorage.getItem(SEEN_KEY)==='1'}catch{return false}
}

function markSeen(){
  try{localStorage.setItem(SEEN_KEY,'1')}catch{}
}

function contributorNotice(){return document.getElementById(CONTRIBUTOR_NOTICE_ID)}
function launchNotice(){return document.getElementById(NOTICE_ID)}

function clearTimers(){
  window.clearTimeout(exposureTimer);exposureTimer=0;
  window.clearTimeout(autoCloseTimer);autoCloseTimer=0;
}

function removeLaunchNotice(mark=false){
  const notice=launchNotice();
  clearTimers();
  if(mark)markSeen();
  if(!notice)return;
  notice.classList.remove('is-visible');
  notice.classList.add('is-closing');
  window.setTimeout(()=>notice.remove(),reduceMotion()?0:280);
}

function activateInsightfulAnalysis(){
  const tab=document.querySelector<HTMLButtonElement>('.keyword-mode-tabs button[data-mode="insights"]');
  if(!tab)return false;
  tab.click();
  window.setTimeout(()=>{
    document.querySelector<HTMLElement>('.insight-analysis-panel')?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
  },140);
  return true;
}

function openInsightfulAnalysis(){
  markSeen();
  removeLaunchNotice(false);

  if(currentRoute()!=='glossary')location.hash='glossary';

  let attempts=0;
  const reveal=()=>{
    if(activateInsightfulAnalysis())return;
    attempts++;
    if(attempts<90)window.setTimeout(reveal,70);
  };
  window.setTimeout(reveal,currentRoute()==='glossary'?30:140);
}

function showLaunchNotice(){
  if(seen()||launchNotice())return;
  if(contributorNotice()){
    waitingForContributor=true;
    schedule(RETRY_MS);
    return;
  }

  waitingForContributor=false;
  const notice=document.createElement('aside');
  notice.id=NOTICE_ID;
  notice.className='ll-analysis-launch-notice';
  notice.setAttribute('role','status');
  notice.setAttribute('aria-live','polite');
  notice.dataset.title='Ace the criteria';
  notice.innerHTML=`
    <button type="button" class="ll-analysis-launch-close" aria-label="Dismiss Insightful Analysis announcement">×</button>
    <div class="ll-analysis-launch-topline"><span class="ll-analysis-launch-new"><i></i> NEW</span><span>TOOLKIT DROP</span></div>
    <div class="ll-analysis-launch-row">
      <span class="ll-analysis-launch-icon" aria-hidden="true">↗</span>
      <div>
        <b>ACE THE CRITERIA.</b>
        <h3>Read beneath the lines.</h3>
        <p>Turn tiny choices into reader effects, deeper implications and body-of-work arguments with the new <strong>Insightful Analysis</strong> bank.</p>
      </div>
    </div>
    <div class="ll-analysis-launch-chain" aria-label="Analysis chain"><span>CHOICE</span><i>→</i><span>EFFECT</span><i>→</i><span>IMPLICATION</span></div>
    <button type="button" class="ll-analysis-launch-open">Open Insightful Analysis <span>→</span></button>
    <div class="ll-analysis-launch-progress" aria-hidden="true"><i></i></div>`;

  notice.querySelector<HTMLButtonElement>('.ll-analysis-launch-close')?.addEventListener('click',()=>removeLaunchNotice(true));
  notice.querySelector<HTMLButtonElement>('.ll-analysis-launch-open')?.addEventListener('click',openInsightfulAnalysis);
  document.body.appendChild(notice);

  requestAnimationFrame(()=>requestAnimationFrame(()=>notice.classList.add('is-visible')));
  exposureTimer=window.setTimeout(markSeen,EXPOSURE_MS);
  autoCloseTimer=window.setTimeout(()=>removeLaunchNotice(false),AUTO_CLOSE_MS);
}

function schedule(delay=FIRST_TRY_MS){
  if(seen()||launchNotice())return;
  window.clearTimeout(retryTimer);
  retryTimer=window.setTimeout(()=>{
    retryTimer=0;
    showLaunchNotice();
  },delay);
}

const conflictObserver=new MutationObserver(()=>{
  const contributor=contributorNotice();
  const promo=launchNotice();

  if(contributor&&promo){
    waitingForContributor=true;
    removeLaunchNotice(false);
    return;
  }

  if(!contributor&&waitingForContributor&&!seen()){
    waitingForContributor=false;
    schedule(RETRY_MS);
  }
});

function start(){
  conflictObserver.observe(document.body,{childList:true,subtree:true});
  schedule();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
