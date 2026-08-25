import './enhancements.css';

type RouteInfo={label:string;parent?:string;back?:string;next?:string;nextLabel?:string};

const routes:Record<string,RouteInfo>={
  home:{label:'Home',next:'start',nextLabel:'Start Here'},
  start:{label:'Start Here',back:'home',next:'papers',nextLabel:'Papers'},
  papers:{label:'Papers',back:'start',next:'paper-1',nextLabel:'Paper 1'},
  'paper-1':{label:'Paper 1',parent:'papers',back:'papers',next:'paper-2',nextLabel:'Paper 2'},
  'paper-2':{label:'Paper 2',parent:'papers',back:'paper-1',next:'io',nextLabel:'IO'},
  io:{label:'Individual Oral',back:'papers',next:'books',nextLabel:'Books'},
  books:{label:'Books',back:'io',next:'ee',nextLabel:'Extended Essay'},
  ee:{label:'Extended Essay',back:'books',next:'home',nextLabel:'Home'},
  glossary:{label:'Glossary',back:'home'},
  about:{label:'About / CAS',back:'home'}
};

const route=()=>location.hash.slice(1).split('#')[0]||'home';
const go=(to:string)=>{location.hash=to};

function replaceSpellingIn(root:Node){
  if(root.nodeType===Node.TEXT_NODE){
    const text=root.textContent||'';
    const next=text
      .replace(/\bPractising\b/g,'Practicing')
      .replace(/\bpractising\b/g,'practicing')
      .replace(/\bPractise\b/g,'Practice')
      .replace(/\bpractise\b/g,'practice');
    if(next!==text)root.textContent=next;
    return;
  }
  if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];
  let current:Node|null=walker.nextNode();
  while(current){nodes.push(current as Text);current=walker.nextNode()}
  nodes.forEach(node=>replaceSpellingIn(node));
}

function makeButton(label:string,to:string,className=''){
  const button=document.createElement('button');
  button.type='button';
  button.className=className;
  button.textContent=label;
  button.addEventListener('click',()=>go(to));
  return button;
}

function ensureRouteDock(){
  const topbar=document.querySelector<HTMLElement>('.topbar');
  if(!topbar)return null;
  let dock=document.querySelector<HTMLElement>('.litlab-route-dock');
  if(!dock){
    dock=document.createElement('div');
    dock.className='litlab-route-dock';
    dock.setAttribute('aria-label','Page navigation');
    topbar.insertAdjacentElement('afterend',dock);
  }
  return dock;
}

function syncNavigation(){
  const current=route();
  const info=routes[current]||{label:'LitLab'};
  const activeMain=(current==='paper-1'||current==='paper-2')?'papers':current;

  document.querySelectorAll<HTMLButtonElement>('.topbar nav button').forEach(button=>{
    const text=(button.textContent||'').trim().toLowerCase();
    const active=(activeMain==='start'&&text==='start here')||(activeMain==='ee'&&text==='extended essay')||text===activeMain;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });

  document.querySelectorAll<HTMLButtonElement>('.mobile-menu button').forEach(button=>{
    const text=(button.textContent||'').trim().toLowerCase();
    const active=(activeMain==='start'&&text.startsWith('start here'))||(activeMain==='ee'&&text.startsWith('extended essay'))||text.startsWith(activeMain);
    button.classList.toggle('ux-active',active);
  });

  document.title=current==='home'?'LitLab — Explore. Analyse. Understand.':`LitLab — ${info.label}`;

  const dock=ensureRouteDock();
  if(!dock)return;
  dock.replaceChildren();
  dock.classList.toggle('is-home',current==='home');
  if(current==='home')return;

  const crumbs=document.createElement('div');
  crumbs.className='route-crumbs';
  crumbs.append(makeButton('Home','home','route-home'));
  const slash=()=>{const s=document.createElement('span');s.textContent='›';s.setAttribute('aria-hidden','true');return s};
  crumbs.append(slash());
  if(info.parent){
    const parent=routes[info.parent];
    crumbs.append(makeButton(parent?.label||info.parent,info.parent));
    crumbs.append(slash());
  }
  const currentLabel=document.createElement('strong');
  currentLabel.textContent=info.label;
  crumbs.append(currentLabel);

  const actions=document.createElement('div');
  actions.className='route-actions';
  if(info.back){
    const backLabel=routes[info.back]?.label||'Back';
    actions.append(makeButton(`← ${backLabel}`,info.back,'route-back'));
  }
  if(info.next){
    actions.append(makeButton(`${info.nextLabel||routes[info.next]?.label||'Next'} →`,info.next,'route-next'));
  }
  dock.append(crumbs,actions);
}

function ensureProgress(){
  let progress=document.querySelector<HTMLElement>('.litlab-scroll-progress');
  if(!progress){
    progress=document.createElement('div');
    progress.className='litlab-scroll-progress';
    progress.setAttribute('aria-hidden','true');
    const fill=document.createElement('i');
    progress.append(fill);
    document.body.append(progress);
  }
  return progress.querySelector<HTMLElement>('i');
}

function ensureBackTop(){
  let button=document.querySelector<HTMLButtonElement>('.litlab-back-top');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='litlab-back-top';
    button.setAttribute('aria-label','Back to top');
    button.innerHTML='<span>↑</span><small>Top</small>';
    button.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    document.body.append(button);
  }
  return button;
}

function updateScrollUI(){
  const fill=ensureProgress();
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const pct=Math.min(100,Math.max(0,scrollY/max*100));
  if(fill)fill.style.width=`${pct}%`;
  const back=ensureBackTop();
  back.classList.toggle('show',scrollY>650);
}

const revealSelector=[
  '.content-section','.feature-card','.flow-step','.faq','.paper-choice','.book-card',
  '.topic-map > div','.creator-cards > div','.choice-card','.tip-card','.official-card',
  '.book-template','.rq-lab','.analysis-demo','.compare-box','.callout'
].join(',');

let revealObserver:IntersectionObserver|undefined;
function setupRevealObserver(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('ux-visible');
        revealObserver?.unobserve(entry.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  observeReveal(document);
}

function observeReveal(root:ParentNode){
  if(!revealObserver)return;
  root.querySelectorAll<HTMLElement>(revealSelector).forEach((element,index)=>{
    if(element.dataset.uxObserved)return;
    element.dataset.uxObserved='true';
    element.classList.add('ux-reveal');
    element.style.setProperty('--ux-delay',`${Math.min(index%6,5)*45}ms`);
    revealObserver?.observe(element);
  });
}

function setupPointerLight(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  const shell=document.querySelector<HTMLElement>('.app-shell');
  if(!shell)return;
  addEventListener('pointermove',event=>{
    shell.style.setProperty('--pointer-x',`${event.clientX}px`);
    shell.style.setProperty('--pointer-y',`${event.clientY}px`);
  },{passive:true});
}

let initialized=false;
function init(){
  if(initialized)return;
  const shell=document.querySelector('.app-shell');
  if(!shell){setTimeout(init,40);return}
  initialized=true;
  replaceSpellingIn(document.body);
  syncNavigation();
  setupRevealObserver();
  setupPointerLight();
  updateScrollUI();
  addEventListener('hashchange',()=>requestAnimationFrame(()=>{replaceSpellingIn(document.body);syncNavigation();observeReveal(document);updateScrollUI()}));
  addEventListener('scroll',updateScrollUI,{passive:true});
  addEventListener('resize',updateScrollUI,{passive:true});
  const observer=new MutationObserver(mutations=>{
    mutations.forEach(mutation=>mutation.addedNodes.forEach(node=>{
      replaceSpellingIn(node);
      if(node.nodeType===Node.ELEMENT_NODE)observeReveal(node as Element);
    }));
    syncNavigation();
  });
  observer.observe(shell,{childList:true,subtree:true});
}

if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>requestAnimationFrame(init),{once:true});
else requestAnimationFrame(init);
