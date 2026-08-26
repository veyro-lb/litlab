import './essays-hub.css';

let scheduled=false;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function go(route:string){
  if(currentRoute()===route){
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  location.hash=route;
}

function setText(element:Element|null,text:string){
  if(element&&element.textContent?.trim()!==text)element.textContent=text;
}

function setButtonLabel(button:HTMLButtonElement,text:string){
  const textNode=[...button.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent?.trim());
  if(textNode){
    if(textNode.textContent?.trim()!==text)textNode.textContent=`${text} `;
    return;
  }
  const label=button.querySelector<HTMLElement>('span,b,strong');
  if(label&&label.textContent?.trim()!==text)label.textContent=text;
}

function patchEntryPoints(){
  document.querySelectorAll<HTMLButtonElement>('.topbar nav button,.mobile-menu button,footer button').forEach(button=>{
    const label=button.textContent?.trim();
    if(label==='Extended Essay'||label==='Essays'){
      setButtonLabel(button,'Essays');
      button.dataset.essaysEntry='true';
      button.setAttribute('aria-label','Open Essays');
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.feature-card').forEach(card=>{
    const title=card.querySelector('h3');
    if(!title)return;
    const label=title.textContent?.trim();
    if(label!=='Extended Essay'&&label!=='Essays')return;
    setText(title,'Essays');
    setText(card.querySelector('p'),'Choose Extended Essay or HL Essay, then open the guide you need.');
    card.dataset.essaysEntry='true';
    card.setAttribute('aria-label','Open Essays: Extended Essay or HL Essay');
  });

  document.querySelectorAll<HTMLButtonElement>('.compass-node').forEach(node=>{
    const label=node.querySelector('b');
    if(!label)return;
    const text=label.textContent?.trim();
    if(text!=='EE'&&text!=='ESSAYS')return;
    setText(label,'ESSAYS');
    setText(node.querySelector('span'),'Extended Essay + HL Essay');
    node.dataset.essaysEntry='true';
    node.setAttribute('aria-label','Open Essays');
  });

  document.querySelectorAll<HTMLButtonElement>('.quick-strip button').forEach(button=>{
    const text=button.textContent?.replace(/\s+/g,' ').trim()||'';
    if(text.startsWith('What is an EE?')||text.startsWith('EE or HL Essay?')){
      const svg=button.querySelector('svg');
      button.childNodes.forEach(node=>{
        if(node.nodeType===Node.TEXT_NODE&&node.textContent?.trim())node.textContent='EE or HL Essay? ';
      });
      if(!svg&&button.textContent?.trim()!=='EE or HL Essay?')button.textContent='EE or HL Essay?';
      button.dataset.essaysEntry='true';
    }
  });

  document.querySelectorAll<HTMLElement>('.progress-panel .progress-row b').forEach(label=>{
    if(label.textContent?.trim()==='EE')label.textContent='Essays';
  });
}

function markEssaysActive(){
  const route=currentRoute();
  if(route!=='essays'&&route!=='hl-essay')return;
  document.querySelectorAll('.topbar nav button').forEach(button=>button.classList.remove('active'));
  const essays=[...document.querySelectorAll<HTMLButtonElement>('.topbar nav button')].find(button=>button.dataset.essaysEntry==='true');
  essays?.classList.add('active');
}

function hubMarkup(){
  return `
    <section class="page essays-page" data-essay-route="essays">
      <div class="essays-hero">
        <span class="eyebrow">Essays</span>
        <h1>Which essay are you working on?</h1>
        <p>One clear place for the two essay paths. Choose the task you need and LitLab will take you straight to the right guide.</p>
      </div>

      <div class="essay-choice-grid" aria-label="Choose an essay guide">
        <button class="essay-choice essay-choice-ee" type="button" data-essay-go="ee">
          <div class="essay-visual essay-visual-ee" aria-hidden="true">
            <span class="essay-visual-label">EE</span>
            <i></i><i></i><i></i>
            <span class="essay-visual-orbit"></span>
          </div>
          <span class="essay-number">01</span>
          <h2>Extended Essay</h2>
          <p>Open the full LitLab EE guide for research questions, planning, sources, argument, analysis, reflection and the final checklist.</p>
          <b>Explore Extended Essay <span aria-hidden="true">→</span></b>
        </button>

        <button class="essay-choice essay-choice-hl" type="button" data-essay-go="hl-essay">
          <div class="essay-visual essay-visual-hl" aria-hidden="true">
            <span class="essay-visual-label">HL</span>
            <span class="essay-page-mini one"></span>
            <span class="essay-page-mini two"></span>
            <span class="essay-pen-line"></span>
          </div>
          <span class="essay-number">02</span>
          <h2>HL Essay</h2>
          <p>A dedicated HL Essay guide is now part of LitLab. The page structure is ready for the reviewed information and examples you send next.</p>
          <b>Open HL Essay <span aria-hidden="true">→</span></b>
        </button>
      </div>

      <div class="essays-note">
        <strong>Different tasks, separate guides.</strong>
        <span>Keeping them apart makes it easier to find the right advice without mixing requirements or strategies.</span>
      </div>
    </section>`;
}

function hlMarkup(){
  return `
    <section class="page essays-page hl-essay-page" data-essay-route="hl-essay">
      <div class="essay-breadcrumb">
        <button type="button" data-essay-go="essays">Essays</button>
        <span aria-hidden="true">›</span>
        <span>HL Essay</span>
      </div>

      <div class="essays-hero hl-essay-hero">
        <span class="eyebrow">HL Essay</span>
        <h1>Your HL Essay guide has a home.</h1>
        <p>The section is set up and ready. Detailed requirements, guidance, examples and practice will be added from the information you send, rather than guessing or mixing it with the Extended Essay.</p>
      </div>

      <div class="hl-ready-card">
        <div class="hl-ready-mark" aria-hidden="true">HL</div>
        <div>
          <span class="hl-ready-kicker">READY FOR CONTENT</span>
          <h2>Send the HL Essay material when you’re ready.</h2>
          <p>We’ll turn it into a clear LitLab guide with the same level of structure, readability and mobile support as the other assessment sections.</p>
        </div>
      </div>

      <div class="hl-placeholder-grid" aria-label="HL Essay section status">
        <article><span>01</span><h3>Guide</h3><p>Detailed content will be built from your reviewed material.</p></article>
        <article><span>02</span><h3>Examples</h3><p>Examples and explanations will be added only when the source material supports them.</p></article>
        <article><span>03</span><h3>Practice</h3><p>Interactive practice can be added once the guide content is finalized.</p></article>
      </div>

      <div class="hl-actions">
        <button class="btn secondary" type="button" data-essay-go="essays">← Back to Essays</button>
        <button class="btn primary" type="button" data-essay-go="ee">View Extended Essay <span aria-hidden="true">→</span></button>
      </div>
    </section>`;
}

function renderEssayRoute(){
  const route=currentRoute();
  if(route!=='essays'&&route!=='hl-essay')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main)return;
  if(main.querySelector(`[data-essay-route="${route}"]`)){
    markEssaysActive();
    return;
  }
  main.innerHTML=route==='essays'?hubMarkup():hlMarkup();
  markEssaysActive();
  window.scrollTo({top:0,behavior:'auto'});
}

function patch(){
  scheduled=false;
  patchEntryPoints();
  renderEssayRoute();
  markEssaysActive();
}

function schedulePatch(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(patch);
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const customGo=target?.closest<HTMLElement>('[data-essay-go]');
  if(customGo){
    event.preventDefault();
    event.stopPropagation();
    go(customGo.dataset.essayGo||'essays');
    return;
  }

  const entry=target?.closest<HTMLElement>('[data-essays-entry]');
  if(entry){
    event.preventDefault();
    event.stopPropagation();
    go('essays');
  }
},true);

window.addEventListener('hashchange',schedulePatch);

const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    if(mutation.addedNodes.length||mutation.removedNodes.length){schedulePatch();return}
  }
});
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedulePatch,{once:true});
else schedulePatch();
