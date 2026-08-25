import './hotfix.css';

const START_SECTIONS=new Set([
  'overview','analysis','choices','ladder','thesis','paragraph','vocabulary','tips','mistakes','notes','setup'
]);

function currentRoute(){
  return location.hash.slice(1).split('#')[0]||'home';
}

function scrollStartSection(id:string){
  const target=document.getElementById(id);
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
}

// Start Here uses its own in-page navigation. Keep these clicks out of the
// application's hash router so the page never turns into #analysis/#thesis.
document.addEventListener('click',event=>{
  const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('.toc a'):null;
  if(!link)return;
  const href=link.getAttribute('href')||'';
  if(!href.startsWith('#'))return;
  const id=href.slice(1);
  if(!START_SECTIONS.has(id))return;

  event.preventDefault();
  event.stopPropagation();
  link.blur();
  scrollStartSection(id);
},true);

// Recover old bookmarked/broken hashes once, but never keep an anchor in the
// URL. This prevents browser scroll anchoring from fighting normal scrolling.
function recoverLegacyStartHash(){
  const raw=location.hash.slice(1);
  if(!START_SECTIONS.has(raw))return;
  const section=raw;
  location.hash='start';
  setTimeout(()=>scrollStartSection(section),140);
}

function enhanceThesis(){
  if(currentRoute()!=='start')return;
  const section=document.getElementById('thesis');
  if(!section)return;

  const better=section.querySelector<HTMLElement>('.compare-box > div:nth-child(2)');
  if(better){
    const label=better.querySelector<HTMLElement>('span');
    const example=better.querySelector<HTMLElement>('p');
    if(label)label.textContent='BETTER + EVALUATION';
    if(example)example.textContent='“The author effectively uses juxtaposition, imagery, and symbolism to represent the central theme of power, creating a convincing portrayal of how power shapes both individuals and their relationships.”';
  }

  if(!section.querySelector('.evaluation-note')){
    const note=document.createElement('div');
    note.className='callout tip evaluation-note';
    note.innerHTML='<span aria-hidden="true">★</span><div><b>Evaluation is important</b><p>A strong thesis should do more than identify authorial choices and a theme. It should also evaluate how effectively or successfully those choices create meaning. Words such as <em>effectively</em>, <em>convincingly</em>, <em>successfully</em>, or <em>powerfully</em> can help show evaluation when they are supported by the analysis.</p></div>';
    section.querySelector('.section-body')?.append(note);
  }
}

function refreshPageEnhancements(){
  setTimeout(enhanceThesis,90);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{
    recoverLegacyStartHash();
    refreshPageEnhancements();
  },{once:true});
}else{
  recoverLegacyStartHash();
  refreshPageEnhancements();
}

window.addEventListener('hashchange',refreshPageEnhancements);
