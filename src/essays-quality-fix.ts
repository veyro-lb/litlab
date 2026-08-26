let scheduled=false;

function currentRoute(){
  return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
}

function hubMarkup(){
  return `<section class="essays-hub-page" data-essays-page="essays" data-essays-stable="true">
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

function ensureEssaysHub(){
  if(currentRoute()!=='essays')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main)return;
  const existing=main.querySelector<HTMLElement>('[data-essays-page="essays"]');
  if(existing){existing.dataset.essaysStable='true';return}
  main.innerHTML=hubMarkup();
  main.dataset.essaysGuestStable='true';
}

function setText(element:HTMLElement|null,text:string){
  if(element&&element.textContent!==text)element.textContent=text;
}

function polishHub(){
  const card=document.querySelector<HTMLElement>('.essays-choice-hl');
  if(!card)return;
  const status=card.querySelector<HTMLElement>('.essays-status');
  if(status){
    setText(status,'Guide available');
    status.classList.remove('preparing');
    status.classList.add('ready','hl-guide-ready');
  }
  setText(card.querySelector<HTMLElement>('.essays-choice-copy p'),'Open the full LitLab HL Essay guide for choosing a work, developing a line of inquiry, analysis, structure, criteria, common mistakes and a final checklist.');
  const link=card.querySelector<HTMLElement>('.essays-choice-copy b');
  if(link&&link.textContent?.includes('Open HL Essay')){
    const arrow=link.querySelector('span');
    link.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE&&node.textContent?.trim())node.textContent='Explore HL Essay '});
    if(!arrow)link.append(document.createTextNode(' →'));
  }
}

const replacements:[string,string][]=[
  ['The supplied pack asks students to confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with their teacher/current official course guide.','Confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with your teacher or current official course guide.'],
  ['word range in the supplied pack','word range'],
  ['but the pack frames it as narrower than the EE and grounded mainly in close reading rather than wider research.','It is narrower than the EE and grounded mainly in close reading rather than wider research.'],
  ['The pack says the HL Essay must be based on one work or body of work already studied in class.','The HL Essay must be based on one work or body of work already studied in class.'],
  ['For Language and Literature, the pack notes that the choice can be literary or non-literary if it was genuinely studied in class.','For Language and Literature, the choice can be literary or non-literary if it was genuinely studied in class.'],
  ['The supplied pack flags reuse of a work already used for the Individual Oral as a restriction; confirm the current rule with your teacher/course guide before finalizing your choice.','A work already used for the Individual Oral should not be reused for the HL Essay; confirm the current assessment-reuse rule with your teacher or current course guide before finalizing your choice.'],
  ['The pack suggests the course’s seven key concepts as useful starting points when you are not sure where to begin:','The course’s seven key concepts are useful starting points when you are not sure where to begin:'],
  ['The pack says limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.','Limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.'],
  ['The pack says to cite the primary work and any secondary sources consistently using the citation style required by your school. It notes that the IB does not mandate one universal style for this purpose.','Cite the primary work and any secondary sources consistently using the citation style required by your school. The IB does not mandate one universal citation style for this purpose.'],
  ['The pack describes the teacher as an adviser who can guide the line of inquiry and general direction.','The teacher acts as an adviser who can guide the line of inquiry and general direction.'],
  ['The pack distinguishes this from the Extended Essay: it says there is no equivalent formal multi-session reflection process or reflection form.','Unlike the Extended Essay, there is no equivalent formal multi-session reflection process or reflection form.'],
  ['The supplied pack summarizes four criteria worth 5 marks each, for 20 marks total.','The HL Essay is assessed through four criteria worth 5 marks each, for 20 marks total.'],
  ['The content pack specifically says the exact current descriptor wording should be confirmed against your school’s copy of the official subject guide.','Confirm the exact current descriptor wording against your school’s copy of the official subject guide.'],
  ['Use the pack’s practice bank to see how a focused inquiry connects a work, an authorial choice, and a course concept.','Use these examples to see how a focused inquiry connects a work, an authorial choice, and a course concept.'],
  ['The source pack suggests turning the narrowing examples and practice bank into a future Line of Inquiry Lab, plus a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.','The narrowing examples and practice bank can also support a future Line of Inquiry Lab and a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.'],
  ['Know which details are firm in the pack and which ones still need school-level confirmation.','Know which details are established and which ones still need school-level confirmation.'],
  ['The pack says the 1,200–1,500 word range, one-work/body-of-work format, four 5-mark criteria, line-of-inquiry framing, and seven concepts were cross-checked against the official IB subject brief and several current teacher/tutoring guides.','Core format: 1,200–1,500 words, one work or body of work, four 5-mark criteria, a student-developed line of inquiry, and the seven course concepts as useful starting points.'],
  ['The supplied document does not currently attribute any specific HL Essay advice to your teacher. Add school-specific guidance only after your teacher confirms it.','No school-specific HL Essay advice is included yet. Add school-specific guidance only after your teacher confirms it.'],
  ['Exact current weighting of the HL Essay in the final HL grade; the pack says published figures vary and asks for teacher confirmation.','Exact current weighting of the HL Essay in the final HL grade; confirm the current figure with your teacher or official course guide.']
];

function polishHLCopy(){
  const root=document.querySelector<HTMLElement>('.hl-guide-page');
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node=walker.nextNode();
  while(node){
    let next=node.nodeValue||'';
    for(const [from,to] of replacements){if(next.includes(from))next=next.replace(from,to)}
    if(next!==node.nodeValue)node.nodeValue=next;
    node=walker.nextNode();
  }
}

function run(){
  scheduled=false;
  ensureEssaysHub();
  polishHub();
  polishHLCopy();
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(run);
}

function stabilize(){
  schedule();
  [60,160,360,760,1200].forEach(delay=>setTimeout(schedule,delay));
}

window.addEventListener('hashchange',stabilize);
window.addEventListener('pageshow',stabilize);

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('[data-auth-close]'))setTimeout(stabilize,0);
},true);

const observer=new MutationObserver(mutations=>{
  const route=currentRoute();
  if(route!=='essays'&&route!=='hl-essay')return;
  for(const mutation of mutations){
    if(mutation.addedNodes.length||mutation.removedNodes.length){schedule();return}
  }
});
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stabilize,{once:true});
else stabilize();
