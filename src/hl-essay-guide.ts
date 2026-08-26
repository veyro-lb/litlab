import './hl-essay-guide.css';
import {searchItems} from './content';
import {hlChecklist,hlConcepts,hlCriteria,hlGoodFits,hlMistakes,hlNarrowingExamples,hlPoorFits,hlPractice} from './hl-essay-data';

const CHECK_KEY='litlabHLChecklist';
let scheduled=false;

function currentRoute(){return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home'}
function go(route:string){location.hash=route}
function storedChecks():number[]{try{const parsed=JSON.parse(localStorage.getItem(CHECK_KEY)||'[]');return Array.isArray(parsed)?parsed.filter(Number.isInteger):[]}catch{return[]}}
function saveChecks(values:number[]){localStorage.setItem(CHECK_KEY,JSON.stringify(values))}
function checkedSet(){return new Set(storedChecks())}

function addSearchEntries(){
  const additions=[
    {title:'Essays',preview:'Choose between the Extended Essay and HL Essay guides.',to:'essays',category:'Guide'},
    {title:'HL Essay',preview:'HL-only 1,200–1,500 word essay guide: line of inquiry, close analysis, structure, criteria, mistakes and checklist.',to:'hl-essay',category:'Essays'},
    {title:'HL Essay line of inquiry',preview:'Narrow a broad topic into a focused analytical line of inquiry connected to one studied work or body of work.',to:'hl-essay',category:'HL Essay'},
    {title:'HL Essay checklist',preview:'Interactive pre-submission checklist for focus, analysis, quotations, register, citations and conclusion.',to:'hl-essay',category:'HL Essay'}
  ];
  additions.forEach(item=>{if(!searchItems.some(existing=>existing.title===item.title))searchItems.push(item)});
}

function patchHub(){
  const card=document.querySelector<HTMLElement>('.essays-choice-hl');
  if(!card)return;
  const status=card.querySelector<HTMLElement>('.essays-status');
  if(status){status.textContent='Guide available';status.classList.remove('preparing');status.classList.add('ready','hl-guide-ready')}
  const description=card.querySelector<HTMLParagraphElement>('.essays-choice-copy p');
  if(description)description.textContent='Open the full LitLab HL Essay guide for choosing a work, developing a line of inquiry, analysis, structure, criteria, common mistakes and a final checklist.';
}

function sectionHead(n:string,title:string,text:string){return `<div class="hl-guide-section-head"><span class="hl-guide-section-no">${n}</span><div><h2>${title}</h2><p>${text}</p></div></div>`}
function cards(items:{title:string;text:string}[],three=false){return `<div class="hl-guide-grid${three?' three':''}">${items.map(item=>`<article class="hl-guide-card"><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div>`}
function bulletList(items:string[]){return `<ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul>`}

function guideMarkup(){
  const checks=checkedSet();
  const checkedCount=checks.size;
  const checkPct=Math.round(checkedCount/hlChecklist.length*100);
  const nav=[['overview','Overview'],['work','Choose a work'],['inquiry','Line of inquiry'],['focus','What to tackle'],['research','Research'],['structure','Structure'],['analysis','Analysis'],['sustain','Sustain inquiry'],['language','Language'],['referencing','Referencing'],['teacher','Teacher role'],['criteria','Criteria'],['mistakes','Mistakes'],['checklist','Checklist'],['practice','Practice'],['sources','Confirm details']];
  return `<section class="hl-guide-page" data-essays-page="hl-essay" data-hl-guide="true">
    <nav class="hl-guide-breadcrumb" aria-label="Breadcrumb"><button type="button" data-hl-go="essays">Essays</button><span aria-hidden="true">›</span><b>HL Essay</b></nav>

    <header class="hl-guide-hero">
      <span class="hl-guide-kicker">LITLAB • HL ESSAY</span>
      <h1>Build one focused inquiry.<br><em>Sustain it with analysis.</em></h1>
      <p>The HL Essay is an additional written coursework component for HL students. Your starting point is a line of inquiry you develop around one studied work or body of work, then explore through close, sustained analysis.</p>
      <div class="hl-guide-facts"><span>HL students only</span><span>1,200–1,500 words</span><span>20 marks</span><span>4 criteria × 5</span><span>One work / body of work</span><span>No fixed prompt</span></div>
    </header>

    <div class="hl-guide-caution"><span>!</span><div><strong>Use this as a LitLab working guide.</strong><p>The supplied pack asks students to confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with their teacher/current official course guide.</p></div></div>

    <nav class="hl-guide-nav" aria-label="HL Essay guide sections">${nav.map(([id,label],index)=>`<button type="button" data-hl-nav="${id}">${String(index+1).padStart(2,'0')} ${label}</button>`).join('')}</nav>

    <section id="hl-overview" class="hl-guide-section">${sectionHead('01','HL Essay overview','Understand the job before you choose the topic.')}
      ${cards([
        {title:'What it is',text:'A formal 1,200–1,500 word essay for HL students, built around a line of inquiry connected to one work or body of work studied during the course.'},
        {title:'Why it exists',text:'It gives you space to work more independently as a critical and creative reader, thinker, and writer. You define the analytical focus rather than responding to a fixed exam question.'}
      ])}
      <div class="hl-guide-stat-grid"><div class="hl-guide-stat"><b>1,200–1,500</b><span>word range in the supplied pack</span></div><div class="hl-guide-stat"><b>20</b><span>total marks</span></div><div class="hl-guide-stat"><b>4 × 5</b><span>assessment criteria</span></div><div class="hl-guide-stat"><b>1</b><span>work or body of work</span></div></div>
      <div class="hl-guide-card" style="margin-top:14px"><h3>What “line of inquiry” means</h3><p>A focused analytical question or angle connected to a studied work. It is similar in spirit to a research question, but the pack frames it as narrower than the EE and grounded mainly in close reading rather than wider research.</p></div>
    </section>

    <section id="hl-work" class="hl-guide-section">${sectionHead('02','Choosing a work or body of work','Choose the text that can sustain the strongest analysis — not automatically your favorite.')}
      <div class="hl-guide-grid">
        <article class="hl-guide-card"><h3>Eligibility</h3>${bulletList([
          'The pack says the HL Essay must be based on one work or body of work already studied in class.',
          'For Language and Literature, the pack notes that the choice can be literary or non-literary if it was genuinely studied in class.',
          'A body of work can be useful for material such as a poet’s collected poems, as long as the inquiry remains focused enough for the word limit.'
        ])}</article>
        <article class="hl-guide-card"><h3>Choose for depth</h3>${bulletList([
          'Favor a work where you can already generate several distinct, developed analytical points.',
          'Test whether the work contains enough patterns, tensions, choices, or moments to avoid repetition.',
          'The supplied pack flags reuse of a work already used for the Individual Oral as a restriction; confirm the current rule with your teacher/course guide before finalizing your choice.'
        ])}</article>
      </div>
    </section>

    <section id="hl-inquiry" class="hl-guide-section">${sectionHead('03','Developing a line of inquiry','Move from a broad area to a precise analytical question that naturally leads to authorial choices.')}
      <p style="color:var(--muted);margin:0 0 15px">The pack suggests the course’s seven key concepts as useful starting points when you are not sure where to begin:</p>
      <div class="hl-concepts">${hlConcepts.map(item=>`<span>${item}</span>`).join('')}</div>
      <div class="hl-narrowing-grid">${hlNarrowingExamples.map(example=>`<article class="hl-narrow-card"><span>${example.concept}</span><h3>${example.work}</h3><div class="hl-narrow-step"><b>1</b><div><strong>Too broad</strong><p>${example.broad}</p></div></div><div class="hl-narrow-step"><b>2</b><div><strong>Narrower</strong><p>${example.narrower}</p></div></div><div class="hl-narrow-step"><b>3</b><div><strong>Focused inquiry</strong><p>${example.focused}</p></div></div></article>`).join('')}</div>
      <div class="hl-analysis-test" style="margin-top:14px"><h3>Usability test</h3><p>Your inquiry does not have to name a technique explicitly, but it should naturally push you toward analyzing <b>how the work is constructed</b>, not only what the work is about.</p></div>
    </section>

    <section id="hl-focus" class="hl-guide-section">${sectionHead('04','What should be tackled?','A narrow question with real analytical tension is stronger than a broad theme label.')}
      <div class="hl-fit-grid"><article class="hl-fit-card good"><h3>✓ Good fits</h3>${bulletList(hlGoodFits)}</article><article class="hl-fit-card poor"><h3>× Poor fits</h3>${bulletList(hlPoorFits)}</article></div>
    </section>

    <section id="hl-research" class="hl-guide-section">${sectionHead('05','Research & preparation','The primary work remains the main event.')}
      ${cards([
        {title:'Reread with the inquiry in mind',text:'Close, repeated reading of the chosen work is the foundation. Track moments and quotations that directly speak to the inquiry and build an evidence bank before drafting.'},
        {title:'Secondary sources are optional',text:'The pack says limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.'},
        {title:'Build an evidence bank',text:'Record the exact detail, where it appears, the authorial choice, the effect or meaning you see, and how it advances the line of inquiry.'}
      ],true)}
    </section>

    <section id="hl-structure" class="hl-guide-section">${sectionHead('06','Structure & organization','At this length, every paragraph has to earn its place.')}
      <div class="hl-structure"><article><span>01</span><h3>Introduction</h3><p>State the line of inquiry clearly and establish the direction of the essay efficiently.</p></article><article><span>02</span><h3>Body</h3><p>Each paragraph develops one clear sub-point, grounded in specific textual evidence and sustained analysis.</p></article><article><span>03</span><h3>Conclusion</h3><p>Synthesize what the analysis has shown about the line of inquiry instead of simply repeating the introduction.</p></article></div>
      <div class="hl-guide-card" style="margin-top:14px"><h3>Organization matters more, not less</h3><p>With only 1,200–1,500 words, there is very little room for a paragraph that does not clearly advance the inquiry. Think of the essay as a developing chain of sub-arguments rather than a list of observations.</p></div>
    </section>

    <section id="hl-analysis" class="hl-guide-section">${sectionHead('07','Analysis vs. description','Summary uses word count. Analysis builds the argument.')}
      <div class="hl-analysis-test"><h3>Quick paragraph test</h3><p>Does the paragraph explain an authorial choice’s <b>effect and meaning</b> in relation to the line of inquiry, or does it mostly report what happens? If it mostly reports, cut or rework it.</p><div class="hl-analysis-chain"><span>Evidence</span><i>→</i><span>Choice</span><i>→</i><span>Effect</span><i>→</i><span>Meaning</span><i>→</i><span>Line of inquiry</span></div></div>
    </section>

    <section id="hl-sustain" class="hl-guide-section">${sectionHead('08','Sustaining the line of inquiry','Keep the essay visibly connected to one developing question from beginning to end.')}
      ${cards([
        {title:'Return to it',text:'Do not state the line of inquiry in the introduction and then drift away. Make the connection visible at key points throughout the essay.'},
        {title:'Develop, do not repeat',text:'Each paragraph should move the argument forward. A new paragraph should add a new layer, tension, implication, or stage of reasoning.'},
        {title:'Depth over coverage',text:'A tightly focused inquiry explored in depth is stronger than trying to cover too much material thinly.'}
      ],true)}
    </section>

    <section id="hl-language" class="hl-guide-section">${sectionHead('09','Register & language','Criterion D rewards language that is clear, accurate, and appropriately formal.')}
      ${cards([
        {title:'Academic register',text:'Use a consistently formal register and avoid casual phrasing that weakens precision.'},
        {title:'Precision over inflation',text:'Specific vocabulary is more useful than complicated wording that makes the argument harder to follow.'},
        {title:'Proofread deliberately',text:'Check clarity, grammar, tone, and sentence control. In a short essay, repeated language problems become especially noticeable.'}
      ],true)}
    </section>

    <section id="hl-referencing" class="hl-guide-section">${sectionHead('10','Referencing','Be consistent and purposeful with both primary and secondary material.')}
      <div class="hl-guide-grid"><article class="hl-guide-card"><h3>Citation style</h3><p>The pack says to cite the primary work and any secondary sources consistently using the citation style required by your school. It notes that the IB does not mandate one universal style for this purpose.</p></article><article class="hl-guide-card"><h3>Quotation discipline</h3><p>Keep quotations short and purposeful. Use the precise words or phrases that matter instead of spending scarce word count on long block quotations.</p></article></div>
    </section>

    <section id="hl-teacher" class="hl-guide-section">${sectionHead('11','The teacher’s role','Use guidance as a checkpoint while keeping the thinking and writing genuinely yours.')}
      <div class="hl-guide-card"><h3>Adviser, not co-writer</h3>${bulletList([
        'The pack describes the teacher as an adviser who can guide the line of inquiry and general direction.',
        'The HL Essay is intended to demonstrate a significant degree of student independence.',
        'The pack distinguishes this from the Extended Essay: it says there is no equivalent formal multi-session reflection process or reflection form.',
        'Use check-ins early to test whether the inquiry is focused enough and whether the draft is staying on track.'
      ])}</div>
    </section>

    <section id="hl-criteria" class="hl-guide-section">${sectionHead('12','Assessment criteria','The supplied pack summarizes four criteria worth 5 marks each, for 20 marks total.')}
      <div class="hl-criteria-wrap"><table class="hl-criteria-table"><thead><tr><th>Criterion</th><th>Marks</th><th>What it assesses</th></tr></thead><tbody>${hlCriteria.map(item=>`<tr><td>${item.name}</td><td>${item.marks}</td><td>${item.focus}</td></tr>`).join('')}</tbody></table></div>
      <div class="hl-guide-caution"><span>!</span><div><strong>Criteria wording check</strong><p>The content pack specifically says the exact current descriptor wording should be confirmed against your school’s copy of the official subject guide.</p></div></div>
    </section>

    <section id="hl-mistakes" class="hl-guide-section">${sectionHead('13','Common mistakes','Use these as diagnostic checks while planning, drafting, and editing.')}
      <div class="hl-mistakes">${hlMistakes.map((item,index)=>`<details class="hl-mistake"><summary><span>${String(index+1).padStart(2,'0')}</span><b>${item.title}</b><span>+</span></summary><div class="hl-mistake-body"><p><b>Why it hurts:</b> ${item.why}</p><p><b>Fix:</b> ${item.fix}</p><p><b>Example:</b> ${item.example}</p></div></details>`).join('')}</div>
    </section>

    <section id="hl-checklist" class="hl-guide-section">${sectionHead('14','Pre-submission checklist','A quick interactive check before you treat the essay as ready.')}
      <div class="hl-checklist"><div class="hl-check-progress"><b>${checkedCount} / ${hlChecklist.length} checked</b><span>${checkPct}%</span><div class="hl-check-bar"><i style="width:${checkPct}%"></i></div></div><div class="hl-check-items">${hlChecklist.map((item,index)=>`<button type="button" class="hl-check-item${checks.has(index)?' checked':''}" data-hl-check="${index}"><span>${checks.has(index)?'✓':''}</span><b>${item}</b></button>`).join('')}</div></div>
    </section>

    <section id="hl-practice" class="hl-guide-section">${sectionHead('15','Line of inquiry practice','Use the pack’s practice bank to see how a focused inquiry connects a work, an authorial choice, and a course concept.')}
      <div class="hl-practice-grid">${hlPractice.map(item=>`<article class="hl-practice-card"><span>${item.concept}</span><h3>${item.work}</h3><p>${item.inquiry}</p></article>`).join('')}</div>
      <div class="hl-analysis-test" style="margin-top:14px"><h3>Skills Lab direction</h3><p>The source pack suggests turning the narrowing examples and practice bank into a future Line of Inquiry Lab, plus a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.</p></div>
    </section>

    <section id="hl-sources" class="hl-guide-section">${sectionHead('16','Sources, uncertainties & teacher advice','Know which details are firm in the pack and which ones still need school-level confirmation.')}
      <div class="hl-guide-grid"><article class="hl-source-box"><h3>Source basis</h3><p>The pack says the 1,200–1,500 word range, one-work/body-of-work format, four 5-mark criteria, line-of-inquiry framing, and seven concepts were cross-checked against the official IB subject brief and several current teacher/tutoring guides.</p><a href="https://ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-language-and-literature/" target="_blank" rel="noopener noreferrer">Open IB Language A: Language & Literature ↗</a></article><article class="hl-source-box"><h3>Teacher advice</h3><p>The supplied document does not currently attribute any specific HL Essay advice to your teacher. Add school-specific guidance only after your teacher confirms it.</p><p>That includes internal deadlines, draft/check-in procedures, and any preferred way of shaping the line of inquiry.</p></article></div>
      <div class="hl-source-box" style="margin-top:14px"><h3>Still to confirm</h3><div class="hl-unsure"><div>Exact current wording of the four criteria descriptors beyond their names and 5-mark totals.</div><div>Exact current weighting of the HL Essay in the final HL grade; the pack says published figures vary and asks for teacher confirmation.</div><div>Any school-specific draft, deadline, or check-in process beyond the general IB requirements.</div><div>The current assessment-reuse rule for works used across the IO, HL Essay, and Paper 2 should be checked against your teacher/current guide before students make final choices.</div></div></div>
    </section>

    <div class="hl-finish"><div><h2>HL Essay guide added.</h2><p>Use the checklist, then revisit the line of inquiry whenever the essay starts drifting.</p></div><button class="btn secondary" type="button" data-hl-go="essays">← Back to Essays</button></div>
  </section>`;
}

function updateChecklistUI(){
  const page=document.querySelector<HTMLElement>('[data-hl-guide="true"]');
  if(!page)return;
  const checks=checkedSet();
  page.querySelectorAll<HTMLButtonElement>('[data-hl-check]').forEach(button=>{
    const index=Number(button.dataset.hlCheck);
    const on=checks.has(index);
    button.classList.toggle('checked',on);
    const mark=button.querySelector('span');
    if(mark)mark.textContent=on?'✓':'';
  });
  const count=checks.size,pct=Math.round(count/hlChecklist.length*100);
  const heading=page.querySelector<HTMLElement>('.hl-check-progress b');
  const percent=page.querySelector<HTMLElement>('.hl-check-progress>span');
  const bar=page.querySelector<HTMLElement>('.hl-check-bar i');
  if(heading)heading.textContent=`${count} / ${hlChecklist.length} checked`;
  if(percent)percent.textContent=`${pct}%`;
  if(bar)bar.style.width=`${pct}%`;
}

function renderGuide(){
  scheduled=false;
  patchHub();
  if(currentRoute()!=='hl-essay')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main||main.querySelector('[data-hl-guide="true"]'))return;
  main.innerHTML=guideMarkup();
  window.scrollTo({top:0,behavior:'auto'});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(renderGuide)}

addSearchEntries();

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const nav=target?.closest<HTMLElement>('[data-hl-nav]');
  if(nav){document.getElementById(`hl-${nav.dataset.hlNav}`)?.scrollIntoView({behavior:'smooth',block:'start'});return}
  const route=target?.closest<HTMLElement>('[data-hl-go]');
  if(route){event.preventDefault();go(route.dataset.hlGo||'essays');return}
  const check=target?.closest<HTMLButtonElement>('[data-hl-check]');
  if(check){
    const index=Number(check.dataset.hlCheck),values=checkedSet();
    if(values.has(index))values.delete(index);else values.add(index);
    saveChecks([...values].sort((a,b)=>a-b));
    updateChecklistUI();
  }
});

window.addEventListener('hashchange',schedule);
const root=document.querySelector('#root');
if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
