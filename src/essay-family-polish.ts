import './essay-family-polish.css';

type GuideKind='hl'|'ee';
let scheduled=false;
let scrollFrame=0;

function route(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function reduceMotion(){
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pageFor(kind:GuideKind){
  return document.querySelector<HTMLElement>(kind==='hl'?'.hl-guide-page[data-hl-guide="true"]':'.ee-guide-page[data-ee-guide]');
}

function navFor(kind:GuideKind,page:HTMLElement){
  return page.querySelector<HTMLElement>(kind==='hl'?'.hl-guide-nav':'.ee-guide-nav');
}

function targetId(kind:GuideKind,button:HTMLButtonElement){
  return kind==='hl'?`hl-${button.dataset.hlNav||''}`:(button.dataset.eeScroll||'');
}

function buttonsFor(kind:GuideKind,nav:HTMLElement){
  return [...nav.querySelectorAll<HTMLButtonElement>(kind==='hl'?'button[data-hl-nav]':'button[data-ee-scroll]')];
}

function sectionsFor(kind:GuideKind,page:HTMLElement){
  return [...page.querySelectorAll<HTMLElement>(kind==='hl'?'.hl-guide-section[id]':'.ee-section[id]')];
}

function ensureLabel(nav:HTMLElement){
  let label=nav.querySelector<HTMLElement>(':scope > .essay-family-nav-label');
  if(!label){
    label=document.createElement('span');
    label.className='essay-family-nav-label';
    label.textContent='ON THIS GUIDE';
    nav.prepend(label);
  }
}

function ensureBreadcrumb(kind:GuideKind,page:HTMLElement){
  if(kind==='hl'){
    page.querySelector<HTMLElement>('.hl-guide-breadcrumb')?.classList.add('essay-family-breadcrumb');
    return;
  }
  if(page.querySelector('.essay-family-breadcrumb'))return;
  const hero=page.querySelector('.ee-guide-hero');
  if(!hero)return;
  const crumb=document.createElement('nav');
  crumb.className='essay-family-breadcrumb';
  crumb.setAttribute('aria-label','Breadcrumb');
  crumb.innerHTML='<button type="button" data-essay-family-home>Essays</button><span aria-hidden="true">›</span><b>Extended Essay</b>';
  hero.before(crumb);
}

function centerActive(nav:HTMLElement,button:HTMLButtonElement){
  const target=Math.max(0,button.offsetLeft-(nav.clientWidth-button.offsetWidth)/2);
  nav.scrollTo({left:target,behavior:reduceMotion()?'auto':'smooth'});
}

function setActive(kind:GuideKind,page:HTMLElement,id:string,center=true){
  const nav=navFor(kind,page);
  if(!nav)return;
  const buttons=buttonsFor(kind,nav);
  let active:HTMLButtonElement|null=null;
  buttons.forEach(button=>{
    const selected=targetId(kind,button)===id;
    button.classList.toggle('current',selected);
    if(selected){button.setAttribute('aria-current','location');active=button}
    else button.removeAttribute('aria-current');
  });
  if(center&&active)centerActive(nav,active);
}

function updateCurrent(kind:GuideKind){
  const page=pageFor(kind);
  if(!page)return;
  const nav=navFor(kind,page);
  if(!nav)return;
  const sections=sectionsFor(kind,page);
  if(!sections.length)return;
  const threshold=Math.max(150,nav.getBoundingClientRect().bottom+22);
  let current=sections[0];
  for(const section of sections){
    if(section.getBoundingClientRect().top<=threshold)current=section;
    else break;
  }
  const selected=buttonsFor(kind,nav).find(button=>button.classList.contains('current'));
  if(!selected||targetId(kind,selected)!==current.id)setActive(kind,page,current.id,true);
}

function bindGuide(kind:GuideKind){
  const page=pageFor(kind);
  if(!page)return;
  page.classList.add('essay-family-guide-page');
  ensureBreadcrumb(kind,page);
  const nav=navFor(kind,page);
  if(!nav)return;
  nav.classList.add('essay-family-guide-nav');
  ensureLabel(nav);

  const buttons=buttonsFor(kind,nav);
  if(kind==='hl'){
    buttons.forEach(button=>{button.textContent=(button.textContent||'').replace(/^\d{2}\s+/,'')});
  }

  if(nav.dataset.essayFamilyBound!=='true'){
    nav.dataset.essayFamilyBound='true';
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const id=targetId(kind,button);
      if(id)setActive(kind,page,id,true);
    }));
  }

  sectionsFor(kind,page).forEach(section=>section.classList.add('essay-family-section'));
  if(!buttons.some(button=>button.classList.contains('current'))&&buttons[0])setActive(kind,page,targetId(kind,buttons[0]),false);
  updateCurrent(kind);
}

function polishHub(){
  const hub=document.querySelector<HTMLElement>('.essays-hub-page');
  if(!hub)return;
  hub.classList.add('essay-family-hub');
  hub.querySelector('.essays-hub-hero')?.classList.add('essay-family-hub-hero');
  hub.querySelectorAll('.essays-choice').forEach(card=>card.classList.add('essay-family-choice'));
}

function run(){
  scheduled=false;
  const current=route();
  document.body.classList.toggle('litlab-essay-family-route',current==='essays'||current==='hl-essay'||current==='ee');
  if(current==='essays')polishHub();
  if(current==='hl-essay')bindGuide('hl');
  if(current==='ee')bindGuide('ee');
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(run);
}

function scheduleScroll(){
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;
    const current=route();
    if(current==='hl-essay')updateCurrent('hl');
    if(current==='ee')updateCurrent('ee');
  });
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('[data-essay-family-home]'))location.hash='essays';
},true);
window.addEventListener('hashchange',()=>{schedule();requestAnimationFrame(scheduleScroll)});
window.addEventListener('pageshow',schedule);
window.addEventListener('scroll',scheduleScroll,{passive:true});
window.addEventListener('resize',scheduleScroll,{passive:true});

new MutationObserver(mutations=>{
  for(const mutation of mutations){
    if(mutation.addedNodes.length){schedule();return}
  }
}).observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
