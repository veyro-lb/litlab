import './essays-hub.css';

let renderScheduled=false;
let chromeScheduled=false;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function go(route:string){
  location.hash=route;
}

function essayHubMarkup(){
  return `<section class="essays-hub-page" data-essays-page="essays">
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
          <p>Open the existing LitLab EE guide with its research, planning, argument and reflection tools.</p>
          <b>Explore Extended Essay <span aria-hidden="true">→</span></b>
        </div>
      </button>

      <button type="button" class="essays-choice essays-choice-hl" data-essay-route="hl-essay">
        <div class="essays-choice-visual manuscript" aria-hidden="true">
          <span class="manuscript-page back"></span><span class="manuscript-page front"><i></i><i></i><i></i><i></i><b>HL</b></span>
        </div>
        <div class="essays-choice-copy">
          <span class="essays-choice-number">02</span>
          <span class="essays-status preparing">Guide being prepared</span>
          <h2>HL Essay</h2>
          <p>The HL Essay space is ready. Detailed, verified guidance will be added here from the material prepared for LitLab.</p>
          <b>Open HL Essay <span aria-hidden="true">→</span></b>
        </div>
      </button>
    </div>

    <div class="essays-hub-note">
      <span aria-hidden="true">◎</span>
      <div><b>Two pathways, one clear home.</b><p>Extended Essay content stays exactly where it is. The HL Essay gets its own separate guide so the two do not get mixed together.</p></div>
    </div>
  </section>`;
}

function hlEssayMarkup(){
  return `<section class="hl-essay-page" data-essays-page="hl-essay">
    <nav class="essays-breadcrumb" aria-label="Breadcrumb">
      <button type="button" data-essay-route="essays">Essays</button><span aria-hidden="true">›</span><b>HL Essay</b>
    </nav>

    <div class="hl-essay-hero">
      <div>
        <span class="essays-kicker">HL ESSAY</span>
        <h1>The space is ready.<br><em>The guide comes next.</em></h1>
        <p>We have set up the HL Essay as its own LitLab section. The detailed content will be added after it is reviewed, so nothing here invents requirements or guidance before the source material is provided.</p>
        <div class="hl-essay-actions"><button type="button" data-essay-route="essays">← Back to Essays</button></div>
      </div>
      <div class="hl-essay-art" aria-hidden="true">
        <div class="hl-sheet sheet-back"></div>
        <div class="hl-sheet sheet-main"><span>HL ESSAY</span><i></i><i></i><i></i><i></i><i></i></div>
        <div class="hl-pencil">✦</div>
      </div>
    </div>

    <div class="hl-ready-grid">
      <article><span>01</span><h2>Guide content</h2><p>Reserved for the verified HL Essay explanation and requirements.</p></article>
      <article><span>02</span><h2>Examples</h2><p>Ready for useful models and examples once the content is reviewed.</p></article>
      <article><span>03</span><h2>Practice</h2><p>Ready for LitLab-style activities based on the final guide.</p></article>
      <article><span>04</span><h2>Checklist</h2><p>Ready for a clear student checklist built from the supplied material.</p></article>
    </div>

    <div class="hl-coming-banner"><span>COMING NEXT</span><b>HL Essay content will be added here.</b><p>The layout is complete and mobile-ready; the academic content is intentionally waiting for review.</p></div>
  </section>`;
}

function renderRoute(){
  renderScheduled=false;
  const route=currentRoute();
  if(route!=='essays'&&route!=='hl-essay')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main||main.querySelector(`[data-essays-page="${route}"]`))return;
  main.innerHTML=route==='essays'?essayHubMarkup():hlEssayMarkup();
}

function scheduleRender(){
  if(renderScheduled)return;
  renderScheduled=true;
  requestAnimationFrame(renderRoute);
}

function renameEssayNavButton(button:HTMLButtonElement){
  const label=button.textContent?.trim();
  if(label!=='Extended Essay'&&label!=='Essays')return;
  if(label==='Extended Essay'){
    if(button.closest('.mobile-menu')){
      const textNode=Array.from(button.childNodes).find(node=>node.nodeType===Node.TEXT_NODE);
      if(textNode)textNode.textContent='Essays';
      else button.prepend(document.createTextNode('Essays'));
    }else{
      button.textContent='Essays';
    }
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
    }else{
      essayNav.classList.remove('active');
    }
  }
}

function scheduleChrome(delay=0){
  if(delay){setTimeout(()=>scheduleChrome(),delay);return}
  if(chromeScheduled)return;
  chromeScheduled=true;
  requestAnimationFrame(patchEntryPoints);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const routeButton=target?.closest<HTMLElement>('[data-essay-route]');
  if(routeButton){
    event.preventDefault();
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
  scheduleRender();
  scheduleChrome(80);
  scheduleChrome(220);
});

const root=document.querySelector('#root');
if(root)new MutationObserver(()=>{
  scheduleRender();
  scheduleChrome();
}).observe(root,{childList:true,subtree:true});

scheduleRender();
scheduleChrome();
