import './hotfix.css';

const START_SECTIONS=new Set([
  'overview','analysis','choices','ladder','thesis','paragraph','vocabulary','tips','mistakes','notes','setup'
]);

const compassPositions:Record<string,[number,number]>={
  START:[50,13],
  PAPERS:[74,31],
  IO:[74,69],
  EE:[26,69],
  BOOKS:[26,31],
  ANALYSIS:[50,87]
};

function currentRoute(){
  return location.hash.slice(1).split('#')[0]||'home';
}

function recoverStartRoute(){
  const raw=location.hash.slice(1);
  if(!START_SECTIONS.has(raw))return;
  history.replaceState(null,'',`#start#${raw}`);
  setTimeout(()=>window.dispatchEvent(new HashChangeEvent('hashchange')),60);
}

function scrollStartSection(id:string){
  const target=document.getElementById(id);
  if(!target)return;
  history.replaceState(null,'',`#start#${id}`);
  target.scrollIntoView({behavior:'smooth',block:'start'});
}

// Capture Start Here section navigation before the browser can turn #analysis,
// #thesis, etc. into a new top-level application route.
document.addEventListener('click',event=>{
  const element=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('.toc a'):null;
  if(!element)return;
  const href=element.getAttribute('href')||'';
  if(!href.startsWith('#'))return;
  const id=href.slice(1);
  if(!START_SECTIONS.has(id))return;
  event.preventDefault();
  event.stopPropagation();
  if(currentRoute()!=='start'){
    location.hash=`start#${id}`;
    setTimeout(()=>scrollStartSection(id),100);
  }else{
    scrollStartSection(id);
  }
},true);

function fixStartHere(){
  document.querySelectorAll<HTMLAnchorElement>('.toc a').forEach(link=>{
    const href=link.getAttribute('href')||'';
    const id=href.startsWith('#')?href.slice(1):'';
    if(!START_SECTIONS.has(id))return;
    link.dataset.sectionTarget=id;
    link.setAttribute('aria-label',`Jump to ${link.textContent?.trim()||id} within Start Here`);
  });

  if(currentRoute()==='start'){
    const anchor=location.hash.split('#')[2];
    if(anchor&&START_SECTIONS.has(anchor)){
      requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({behavior:'smooth',block:'start'}));
    }
  }
}

function fixCompass(){
  const wrap=document.querySelector<HTMLElement>('.compass-wrap');
  if(!wrap)return;

  wrap.dataset.orbitReady='true';
  const nodes=Array.from(wrap.querySelectorAll<HTMLElement>('.compass-node'));
  const lines=Array.from(wrap.querySelectorAll<SVGLineElement>('.compass-lines line'));

  nodes.forEach((node,index)=>{
    const label=(node.querySelector('b')?.textContent||'').trim().toUpperCase();
    const position=compassPositions[label];
    if(!position)return;

    node.style.setProperty('--node-x',`${position[0]}%`);
    node.style.setProperty('--node-y',`${position[1]}%`);
    node.style.setProperty('--orbit-index',String(index));
    node.dataset.compassName=label;
    node.style.removeProperty('display');
    node.style.removeProperty('visibility');
    node.style.removeProperty('opacity');

    const line=lines[index];
    if(line){
      line.setAttribute('x2',String(position[0]));
      line.setAttribute('y2',String(position[1]));
      line.style.setProperty('--line-index',String(index));
    }
  });

  const ee=nodes.find(node=>node.dataset.compassName==='EE');
  if(ee){
    ee.style.display='flex';
    ee.style.visibility='visible';
    ee.style.opacity='1';
  }
}

function enhanceThesis(){
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

let queued=false;
function applyFixes(){
  queued=false;
  recoverStartRoute();
  fixStartHere();
  fixCompass();
  enhanceThesis();
}

function scheduleFixes(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(applyFixes);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',scheduleFixes,{once:true});
}else{
  scheduleFixes();
}

window.addEventListener('hashchange',()=>setTimeout(scheduleFixes,40));

const observer=new MutationObserver(scheduleFixes);
const startObserver=()=>{
  const root=document.querySelector('.app-shell');
  if(root)observer.observe(root,{childList:true,subtree:true});
  else setTimeout(startObserver,50);
};
startObserver();