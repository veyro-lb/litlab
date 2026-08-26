import './essays-hub.css';

let chromeScheduled=false;
let observerScheduled=false;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function go(route:string){
  if(currentRoute()===route){renderEssayRoute();return}
  location.hash=route;
}

function reactMain(){
  return document.querySelector<HTMLElement>('#root main#main');
}

function essayHubMarkup(){
  return `<section class="essays-hub-page" data-essays-page="essays" data-essay-shell="true">
    <div class="essays-hub-hero">
      <span class="essays-kicker">LITLAB • ESSAYS</span>
      <h1>Which essay are you working on?</h1>
      <p>Keep the two essay pathways separate and easy to find. Choose the section you need, then LitLab takes you straight to the right guide.</p>
    </div>

    <div class="essays-choice-grid" aria-label="Choose an essay guide">
      <button type="button" class="essays-choice essays-choice-ee" data-essay-route="ee">
        <div class="essays-choice-visual research" aria-hidden="true">
          <span class="research-core">RQ</span>
          <i class="research-orbit one"></i><i class="research-orbit two"></i><i class="research-dot d1"></i><i class="research-dot d2"></i><i class="research-dot d3"></i>
        </div>
        <div class="essays-choice-copy">
          <span class="essays-choice-number">01</span>
          <span class="essays-status ready">Guide available</span>
          <h2>Extended Essay</h2>
          <p>Open the full LitLab EE guide for research questions, planning, sources, argument, analysis, reflection and the final checklist.</p>
          <b>Explore Extended Essay <span aria-hidden="true">→</span></b>
        </div>
      </button>

      <button type="button" class="essays-choice essays-choice-hl" data-essay-route="hl-essay">
        <div class="essays-choice-visual manuscript" aria-hidden="true">
          <span class="manuscript-page back"></span><span class="manuscript-page front"><i></i><i></i><i></i><i></i><b>HL</b></span>
        </div>
        <div class="essays-choice-copy">
          <span class="essays-choice-number">02</span>
          <span class="essays-status ready hl-guide-ready">Guide available</span>
          <h2>HL Essay</h2>
          <p>Open the full LitLab HL Essay guide for choosing a work, developing a line of inquiry, analysis, structure, criteria, common mistakes and a final checklist.</p>
          <b>Explore HL Essay <span aria-hidden="true">→</span></b>
        </div>
      </button>
    </div>

    <div class="essays-hub-note">
      <span aria-hidden="true">◎</span>
      <div><b>Two pathways, one clear home.</b><p>Extended Essay and HL Essay stay in separate guides so their requirements and strategies do not get mixed together.</p></div>
    </div>
  </section>`;
}

function hlSeedMarkup(){
  return `<section class="hl-essay-page" data-hl-essay-seed="true" data-essay-shell="true" aria-live="polite">
    <nav class="essays-breadcrumb" aria-label="Breadcrumb"><button type="button" data-essay-route="essays">Essays</button><span aria-hidden="true">›</span><b>HL Essay</b></nav>
    <div class="hl-essay-hero">
      <div><span class="essays-kicker">LITLAB • HL ESSAY</span><h1>Opening the HL Essay guide…</h1><p>Loading the full guide inside the normal LitLab page shell.</p></div>
      <div class="hl-essay-art" aria-hidden="true"><div class="hl-sheet sheet-back"></div><div class="hl-sheet sheet-main"><span>HL ESSAY</span><i></i><i></i><i></i><i></i><i></i></div><div class="hl-pencil">✦</div></div>
    </div>
  </section>`;
}

// Essays and HL Essay now render INSIDE React's existing main element. There is no second
// <main>, no hidden route host, and no page layer outside the shared LitLab header. React may
// briefly render its fallback page for these enhancement routes; the root observer below
// immediately restores the correct route content in the same main element.
function renderEssayRoute(){
  const route=currentRoute();
  const main=reactMain();
  if(!main)return;

  if(route==='essays'){
    if(!main.querySelector('[data-essays-page="essays"]'))main.innerHTML=essayHubMarkup();
    main.dataset.litlabEssayRoute='essays';
    return;
  }

  if(route==='hl-essay'){
    // Never overwrite the full HL guide once its own module has mounted it.
    if(!main.querySelector('[data-hl-guide="true"]')&&!main.querySelector('[data-hl-essay-seed="true"]'))main.innerHTML=hlSeedMarkup();
    main.dataset.litlabEssayRoute='hl-essay';
    return;
  }

  delete main.dataset.litlabEssayRoute;
}

function settleEssayRoute(){
  renderEssayRoute();
  // React's hash listener is registered before this module. Re-run after its batched commit,
  // without relying on a manual refresh or on whichever tab the student visited previously.
  queueMicrotask(renderEssayRoute);
  requestAnimationFrame(renderEssayRoute);
}

function renameEssayNavButton(button:HTMLButtonElement){
  const label=button.textContent?.trim();
  if(label!=='Extended Essay'&&label!=='Essays')return;
  if(label==='Extended Essay'){
    if(button.closest('.mobile-menu')){
      const textNode=Array.from(button.childNodes).find(node=>node.nodeType===Node.TEXT_NODE);
      if(textNode)textNode.textContent='Essays';
      else button.prepend(document.createTextNode('Essays'));
    }else button.textContent='Essays';
  }
  button.dataset.essaysEntry='true';
}

function patchEntryPoints(){
  chromeScheduled=false;
  const route=currentRoute();

  document.querySelectorAll<HTMLButtonElement>('.topbar nav button,.mobile-menu button').forEach(renameEssayNavButton);

  document.querySelectorAll<HTMLElement>('.feature-card h3').forEach(title=>{
    const label=title.textContent?.trim();
    if(label!=='Extended Essay'&&label!=='Essays')return;
    const card=title.closest<HTMLButtonElement>('.feature-card');
    if(label==='Extended Essay')title.textContent='Essays';
    if(card){
      card.dataset.essaysEntry='true';
      const description=card.querySelector<HTMLParagraphElement>('p');
      const copy='Choose Extended Essay or HL Essay, then open the guide that matches the work you are preparing.';
      if(description&&description.textContent!==copy)description.textContent=copy;
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.compass-node').forEach(node=>{
    const label=node.querySelector<HTMLElement>('b');
    const text=label?.textContent?.trim();
    if(text!=='EE'&&text!=='ESSAYS')return;
    if(label&&text==='EE')label.textContent='ESSAYS';
    const sub=node.querySelector<HTMLElement>('span');
    if(sub&&sub.textContent!=='EE + HL Essay')sub.textContent='EE + HL Essay';
    node.dataset.essaysEntry='true';
  });

  const floating=document.querySelector<HTMLElement>('.floating-tag.t3');
  if(floating?.textContent?.trim()==='EE')floating.textContent='ESSAYS';

  document.querySelectorAll<HTMLElement>('.progress-row b').forEach(label=>{
    if(label.textContent?.trim()==='EE')label.textContent='Essays';
  });

  document.querySelectorAll<HTMLElement>('.section-head h2').forEach(title=>{
    if(title.textContent?.trim()==='Five places. One clear map.')title.textContent='Six places. One clear map.';
  });

  const essayNav=document.querySelector<HTMLButtonElement>('.topbar nav button[data-essays-entry]');
  if(essayNav){
    if(route==='essays'||route==='ee'||route==='hl-essay'){
      document.querySelectorAll('.topbar nav button.active').forEach(button=>button.classList.remove('active'));
      essayNav.classList.add('active');
    }else essayNav.classList.remove('active');
  }
}

function scheduleChrome(){
  if(chromeScheduled)return;
  chromeScheduled=true;
  requestAnimationFrame(patchEntryPoints);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const routeButton=target?.closest<HTMLElement>('[data-essay-route]');
  if(routeButton){
    event.preventDefault();
    event.stopPropagation();
    go(routeButton.dataset.essayRoute||'essays');
    return;
  }

  const entry=target?.closest<HTMLElement>('[data-essays-entry]');
  if(entry){
    event.preventDefault();
    event.stopPropagation();
    go('essays');
  }
},true);

window.addEventListener('hashchange',()=>{
  settleEssayRoute();
  patchEntryPoints();
});
window.addEventListener('pageshow',settleEssayRoute);

const root=document.querySelector('#root');
if(root)new MutationObserver(()=>{
  if(observerScheduled)return;
  observerScheduled=true;
  queueMicrotask(()=>{
    observerScheduled=false;
    const route=currentRoute();
    if(route==='essays'||route==='hl-essay')renderEssayRoute();
    scheduleChrome();
  });
}).observe(root,{childList:true,subtree:true});

settleEssayRoute();
patchEntryPoints();
