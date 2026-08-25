import './hotfix.css';

// Symmetrical six-point orbit: Start, Papers, IO, EE, Books, Analysis.
// Keeping these coordinates away from the edges prevents cards disappearing
// at common laptop widths while still preserving the radial Compass concept.
const compassPositions=[
  [50,15],
  [72,33],
  [72,67],
  [28,67],
  [28,33],
  [50,85]
] as const;

function fixStartHereToc(){
  document.querySelectorAll<HTMLAnchorElement>('.toc a').forEach(link=>{
    if(link.dataset.litlabFixed==='true')return;
    link.dataset.litlabFixed='true';
    link.addEventListener('click',event=>{
      const href=link.getAttribute('href')||'';
      if(!href.startsWith('#'))return;
      const id=href.slice(1);
      const target=document.getElementById(id);
      if(!target)return;
      event.preventDefault();
      history.replaceState(null,'',`#start#${id}`);
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
}

function fixCompass(){
  const wrap=document.querySelector<HTMLElement>('.compass-wrap');
  if(!wrap)return;

  wrap.dataset.orbitReady='true';
  const nodes=wrap.querySelectorAll<HTMLElement>('.compass-node');
  nodes.forEach((node,index)=>{
    node.classList.add(`n${index}`);
    node.style.removeProperty('display');
    node.style.removeProperty('visibility');
    node.style.removeProperty('opacity');
    node.style.setProperty('--orbit-index',String(index));
  });

  const lines=wrap.querySelectorAll<SVGLineElement>('.compass-lines line');
  lines.forEach((line,index)=>{
    const position=compassPositions[index];
    if(!position)return;
    line.setAttribute('x2',String(position[0]));
    line.setAttribute('y2',String(position[1]));
    line.style.setProperty('--line-index',String(index));
  });
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

function applyFixes(){
  fixStartHereToc();
  fixCompass();
  enhanceThesis();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(applyFixes),{once:true});
}else{
  requestAnimationFrame(applyFixes);
}

window.addEventListener('hashchange',()=>setTimeout(applyFixes,100));

const observer=new MutationObserver(()=>applyFixes());
const startObserver=()=>{
  const root=document.querySelector('.app-shell');
  if(root)observer.observe(root,{childList:true,subtree:true});
  else setTimeout(startObserver,50);
};
startObserver();
