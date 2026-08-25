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

function applyFixes(){
  fixStartHereToc();
  fixCompass();
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
