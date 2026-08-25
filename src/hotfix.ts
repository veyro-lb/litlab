import { animate } from 'motion';
import './hotfix.css';

const START_SECTIONS=[
  'overview','analysis','choices','ladder','thesis','paragraph','vocabulary','tips','mistakes','notes','setup'
] as const;
const START_SECTION_SET=new Set<string>(START_SECTIONS);
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const springOpen={type:'spring' as const,stiffness:340,damping:34,mass:.9};
const springCard={type:'spring' as const,stiffness:280,damping:28,mass:.9};

function currentRoute(){
  return location.hash.slice(1).split('#')[0]||'home';
}

function scrollStartSection(id:string){
  const target=document.getElementById(id);
  if(!target)return;
  target.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
  setActiveGuideItem(id,true);
}

// Start Here section navigation never changes the URL. That keeps the app's
// hash router completely separate from in-page scrolling.
document.addEventListener('click',event=>{
  const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('.toc a'):null;
  if(!link)return;
  const href=link.getAttribute('href')||'';
  if(!href.startsWith('#'))return;
  const id=href.slice(1);
  if(!START_SECTION_SET.has(id))return;

  event.preventDefault();
  event.stopPropagation();
  link.blur();
  scrollStartSection(id);
},true);

// Recover old bookmarked/broken hashes once, then remove the anchor from the
// URL so browser scroll anchoring never fights the user again.
function recoverLegacyStartHash(){
  const raw=location.hash.slice(1);
  if(!START_SECTION_SET.has(raw))return;
  const section=raw;
  location.hash='start';
  setTimeout(()=>scrollStartSection(section),140);
}

/* --------------------------------------------------------------------------
   Start Here scrollspy
   -------------------------------------------------------------------------- */
let activeGuideId='';
let scrollSpyFrame=0;

function setActiveGuideItem(id:string,center=false){
  if(currentRoute()!=='start')return;
  const toc=document.querySelector<HTMLElement>('.toc');
  if(!toc)return;

  const links=Array.from(toc.querySelectorAll<HTMLAnchorElement>('a'));
  links.forEach(link=>{
    const target=(link.getAttribute('href')||'').replace(/^#/,'');
    const selected=target===id;
    link.classList.toggle('current',selected);
    if(selected)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });

  if(activeGuideId===id&&!center)return;
  activeGuideId=id;
  const active=links.find(link=>(link.getAttribute('href')||'')===`#${id}`);
  if(!active)return;

  // Only scroll the guide horizontally. Never touch the page's vertical scroll.
  const desired=active.offsetLeft-(toc.clientWidth-active.clientWidth)/2;
  toc.scrollTo({left:Math.max(0,desired),behavior:reduceMotion()?'auto':'smooth'});
}

function updateStartScrollSpy(){
  scrollSpyFrame=0;
  if(currentRoute()!=='start')return;
  const toc=document.querySelector('.toc');
  if(!toc)return;

  const marker=Math.min(235,Math.max(165,window.innerHeight*.24));
  let active=START_SECTIONS[0];

  for(const id of START_SECTIONS){
    const section=document.getElementById(id);
    if(!section)continue;
    const rect=section.getBoundingClientRect();
    if(rect.top<=marker)active=id;
    else break;
  }

  const nearBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-80;
  if(nearBottom)active=START_SECTIONS[START_SECTIONS.length-1];
  setActiveGuideItem(active);
}

function requestScrollSpy(){
  if(scrollSpyFrame)return;
  scrollSpyFrame=requestAnimationFrame(updateStartScrollSpy);
}

window.addEventListener('scroll',requestScrollSpy,{passive:true});
window.addEventListener('resize',requestScrollSpy,{passive:true});

/* --------------------------------------------------------------------------
   Motion-style FAQ accordion
   Uses the same spring idea as the supplied MotionAccordion while preserving
   the existing React FAQ content/state.
   -------------------------------------------------------------------------- */
const faqBypass=new WeakSet<HTMLButtonElement>();
let faqBusy=false;

async function animateFaqClose(faq:HTMLElement){
  const answer=faq.querySelector<HTMLElement>('.faq-answer');
  if(!answer||reduceMotion())return;
  const height=answer.getBoundingClientRect().height;
  answer.style.height=`${height}px`;
  answer.style.overflow='hidden';

  const text=answer.querySelector<HTMLElement>('p');
  if(text)void animate(text,{opacity:[1,.35],transform:['translateY(0px)','translateY(-8px)']},{duration:.16,ease:'easeOut'});
  void animate(faq,{transform:['scale(1)','scale(.985)']},springCard);
  await animate(answer,{height:[height,0],opacity:[1,0]},springOpen);
}

function animateFaqOpen(faq:HTMLElement){
  const answer=faq.querySelector<HTMLElement>('.faq-answer');
  if(!answer||reduceMotion())return;
  const fullHeight=answer.scrollHeight;
  answer.style.height='0px';
  answer.style.opacity='0';
  answer.style.overflow='hidden';

  const text=answer.querySelector<HTMLElement>('p');
  if(text){
    text.style.opacity='0';
    text.style.transform='translateY(-8px)';
    void animate(text,{opacity:[0,1],transform:['translateY(-8px)','translateY(0px)']},{type:'spring',stiffness:360,damping:30,mass:.8});
  }

  void animate(faq,{transform:['scale(.985)','scale(1)']},springCard);
  void animate(answer,{height:[0,fullHeight],opacity:[0,1]},springOpen).then(()=>{
    answer.style.height='auto';
    answer.style.opacity='';
    answer.style.overflow='';
    if(text){text.style.opacity='';text.style.transform='';}
  });
}

async function handleFaqToggle(button:HTMLButtonElement,faq:HTMLElement){
  if(faqBusy)return;
  faqBusy=true;
  const current=document.querySelector<HTMLElement>('.faq-list .faq.open');
  if(current)await animateFaqClose(current);

  faqBypass.add(button);
  button.click();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(faq.classList.contains('open'))animateFaqOpen(faq);
    faqBusy=false;
  }));
}

document.addEventListener('click',event=>{
  const button=event.target instanceof Element?event.target.closest<HTMLButtonElement>('.faq-list .faq > button'):null;
  if(!button)return;
  if(faqBypass.has(button)){
    faqBypass.delete(button);
    return;
  }
  const faq=button.closest<HTMLElement>('.faq');
  if(!faq)return;
  event.preventDefault();
  event.stopPropagation();
  void handleFaqToggle(button,faq);
},true);

/* --------------------------------------------------------------------------
   Motion-style vocabulary / glossary details
   Applies to both the Start Here mini glossary and the full glossary page.
   -------------------------------------------------------------------------- */
function detailContent(details:HTMLDetailsElement){
  return Array.from(details.children).slice(1) as HTMLElement[];
}

async function closeMotionDetail(details:HTMLDetailsElement){
  if(!details.open)return;
  if(reduceMotion()){details.open=false;return;}
  const summary=details.querySelector<HTMLElement>(':scope > summary');
  if(!summary)return;

  details.dataset.motionBusy='true';
  const from=details.getBoundingClientRect().height;
  const to=summary.getBoundingClientRect().height;
  const children=detailContent(details);
  children.forEach(child=>void animate(child,{opacity:[1,0],transform:['translateY(0px)','translateY(-8px)']},{duration:.16,ease:'easeOut'}));
  details.style.height=`${from}px`;
  details.style.overflow='hidden';
  await animate(details,{height:[from,to]},springOpen);
  details.open=false;
  details.style.height='';
  details.style.overflow='';
  children.forEach(child=>{child.style.opacity='';child.style.transform='';});
  delete details.dataset.motionBusy;
}

async function openMotionDetail(details:HTMLDetailsElement){
  if(details.open||details.dataset.motionBusy)return;
  const group=details.parentElement;
  const siblings=group?Array.from(group.querySelectorAll<HTMLDetailsElement>('details[open]')).filter(item=>item!==details):[];
  await Promise.all(siblings.map(item=>closeMotionDetail(item)));

  if(reduceMotion()){details.open=true;return;}
  const summary=details.querySelector<HTMLElement>(':scope > summary');
  if(!summary)return;

  details.dataset.motionBusy='true';
  details.open=true;
  const start=summary.getBoundingClientRect().height;
  details.style.height=`${start}px`;
  details.style.overflow='hidden';
  const full=details.scrollHeight;
  const children=detailContent(details);
  children.forEach(child=>{
    child.style.opacity='0';
    child.style.transform='translateY(-8px)';
    void animate(child,{opacity:[0,1],transform:['translateY(-8px)','translateY(0px)']},{type:'spring',stiffness:360,damping:30,mass:.8});
  });
  await animate(details,{height:[start,full]},springOpen);
  details.style.height='';
  details.style.overflow='';
  children.forEach(child=>{child.style.opacity='';child.style.transform='';});
  delete details.dataset.motionBusy;
}

document.addEventListener('click',event=>{
  const summary=event.target instanceof Element?event.target.closest<HTMLElement>('.mini-glossary details > summary, .glossary-grid details > summary'):null;
  if(!summary)return;
  const details=summary.parentElement as HTMLDetailsElement|null;
  if(!details)return;
  event.preventDefault();
  event.stopPropagation();
  if(details.dataset.motionBusy)return;
  if(details.open)void closeMotionDetail(details);
  else void openMotionDetail(details);
},true);

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
  setTimeout(()=>{
    enhanceThesis();
    updateStartScrollSpy();
  },90);
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

window.addEventListener('hashchange',()=>{
  activeGuideId='';
  refreshPageEnhancements();
});
