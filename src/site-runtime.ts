import './site-foundation.css';
import './instagram-refresh';
import './logo-refresh';
import './enhancements';
import './hotfix';
import './motion-styles';
import './special-route-host';
import './toolkit-shell';
import './litlab-tutor';
import './tutor-smart-layer';
import './tutor-topbar-trigger';
import './google-auth';
import './account-role-auth';
import './admin-menu-launcher';
import './contributor-status-notifications';
import './auth-logo-refresh';
import './microsoft-auth';
import './auth-navigation-prompt';
import './account-center';
import './account-center-branding';
import './contributor-update-indicators';
import './learning-profile';
import './learning-dashboard-home-only';
import './score-ring-polish';
import './ui-quality-pass';
import './runtime-integrity';
import './interaction-health';
import './feedback';
import './feedback-success';
import './floating-controls';
import './mobile-framing';
import './feedback-framing-fix';
import './dark-mode-audit';
import './special-route-framing-fix';
import './topbar-layout-stability.css';

type Feature='assessments'|'books'|'essays'|'toolkit'|'contributor';

const featureLoads=new Map<Feature,Promise<unknown>>();
const currentRoute=()=>location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';

function featureForRoute(route:string):Feature|null{
  if(route==='paper-1'||route==='paper-2'||route==='papers'||route==='io')return 'assessments';
  if(route==='books'||route.startsWith('book-'))return 'books';
  if(route==='ee'||route==='essays'||route==='hl-essay'||route.includes('essay'))return 'essays';
  if(route==='glossary'||route==='skills'||route==='skills-lab'||route==='analysis-lab')return 'toolkit';
  if(route==='contribute'||route.startsWith('admin')||route.startsWith('contribut'))return 'contributor';
  return null;
}

function loadFeature(feature:Feature){
  const existing=featureLoads.get(feature);if(existing)return existing;
  const promise=feature==='assessments'?import('./runtime/assessments')
    :feature==='books'?import('./runtime/books')
    :feature==='essays'?import('./runtime/essays')
    :feature==='toolkit'?import('./runtime/toolkit')
    :import('./runtime/contributor');
  featureLoads.set(feature,promise);
  return promise;
}

async function loadCurrentFeature(){
  const route=currentRoute();
  const feature=featureForRoute(route);
  if(!feature)return;
  document.documentElement.dataset.litlabFeatureLoading=feature;
  try{
    await loadFeature(feature);
    if(currentRoute()===route){
      document.documentElement.dataset.litlabFeatureReady=feature;
      window.dispatchEvent(new CustomEvent('litlab:feature-ready',{detail:{feature,route}}));
    }
  }catch(error){
    console.error(`LitLab failed to load the ${feature} feature bundle.`,error);
  }finally{
    if(document.documentElement.dataset.litlabFeatureLoading===feature)delete document.documentElement.dataset.litlabFeatureLoading;
  }
}

function syncThemeColor(){
  const meta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if(meta)meta.content=document.documentElement.dataset.theme==='dark'?'#0A0F1F':'#F7F7FB';
}

function syncCurrentNavigation(){
  document.querySelectorAll<HTMLButtonElement>('.topbar nav button').forEach(button=>{
    if(button.classList.contains('active'))button.setAttribute('aria-current','page');
    else if(!button.matches('[data-toolkit-nav]'))button.removeAttribute('aria-current');
  });
}

let searchOpener:HTMLElement|null=null;
let searchDialog:HTMLElement|null=null;
let previousBodyOverflow='';

function searchOverlay(){return document.querySelector<HTMLElement>('.modal[role="dialog"][aria-label="Search LitLab"]')}
function focusable(root:HTMLElement){return Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hidden&&el.getAttribute('aria-hidden')!=='true')}

function lockSearchDialog(overlay:HTMLElement){
  if(searchDialog===overlay)return;
  searchDialog=overlay;
  previousBodyOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  document.body.dataset.siteScrollLock='true';
}

function unlockSearchDialog(){
  if(!searchDialog)return;
  searchDialog=null;
  delete document.body.dataset.siteScrollLock;
  document.body.style.overflow=previousBodyOverflow;
  previousBodyOverflow='';
  const target=searchOpener;
  searchOpener=null;
  if(target?.isConnected)requestAnimationFrame(()=>target.focus({preventScroll:true}));
}

function syncSearchDialog(){
  const overlay=searchOverlay();
  if(overlay)lockSearchDialog(overlay);else unlockSearchDialog();
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest<HTMLElement>('.search-trigger'):null;
  if(target)searchOpener=target;
},true);

document.addEventListener('keydown',event=>{
  if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'&&document.activeElement instanceof HTMLElement)searchOpener=document.activeElement;
  if(event.key!=='Tab'||!searchDialog)return;
  const items=focusable(searchDialog);if(!items.length)return;
  const first=items[0],last=items[items.length-1],active=document.activeElement;
  if(event.shiftKey&&active===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&active===last){event.preventDefault();first.focus()}
},true);

const shellObserver=new MutationObserver(()=>{
  syncSearchDialog();
  syncCurrentNavigation();
});
shellObserver.observe(document.body,{childList:true,subtree:true});
new MutationObserver(syncThemeColor).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

syncThemeColor();
syncCurrentNavigation();
syncSearchDialog();
void loadCurrentFeature();

window.addEventListener('hashchange',()=>{
  requestAnimationFrame(syncCurrentNavigation);
  void loadCurrentFeature();
});
