import './ee-guide.css';

type RQSet={label:string;stages:[string,string,string,string]};
const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));

const rqSets:RQSet[]=[
 {label:'Identity • Atwood',stages:[
  'How is identity shown in literature?',
  'How is identity shaped by displacement in dystopian fiction?',
  'How does Margaret Atwood use enforced naming to represent the erosion of identity in The Handmaid’s Tale?',
  'To what extent does Margaret Atwood use the renaming of Handmaids to construct the erosion of individual identity under institutional control in The Handmaid’s Tale?'
 ]},
 {label:'War • Satrapi',stages:[
  'How do writers show the effects of war?',
  'How is the psychological impact of political violence represented in memoir?',
  'How does Marjane Satrapi use visual style to represent the psychological impact of the Iran–Iraq War in Persepolis?',
  'To what extent does Marjane Satrapi’s black-and-white illustrative style construct the psychological toll of war on childhood in Persepolis?'
 ]},
 {label:'Language • Orwell',stages:[
  'How is language used to control people?',
  'How does invented vocabulary function as a tool of political control in dystopian fiction?',
  'How does George Orwell use Newspeak to represent the relationship between language and thought control in Nineteen Eighty-Four?',
  'To what extent does George Orwell use the invented vocabulary of Newspeak to explore the limits of independent thought under totalitarian control in Nineteen Eighty-Four?'
 ]},
 {label:'Voice • Duffy',stages:[
  'How do poets write about women’s lives?',
  'How does poetry reclaim silenced historical or mythical women’s voices?',
  'How does Carol Ann Duffy use dramatic monologue to reclaim women’s perspectives from literary and historical narratives?',
  'To what extent does Carol Ann Duffy’s use of dramatic monologue in The World’s Wife subvert traditionally male-authored narratives to reconstruct women’s interiority?'
 ]}
];

const mistakes=[
 ['Research question too broad','You cannot develop genuine depth inside 4,000 words.','Use the four-stage narrowing process before committing.'],
 ['Summary instead of analysis','Retelling consumes space without advancing the line of argument.','Replace plot recap with close analysis of how a specific choice creates meaning.'],
 ['Exceeding the word limit','Material beyond 4,000 words may not be assessed.','Track word count throughout drafting and trim background before cutting analysis.'],
 ['Ignoring supervisor feedback','You lose one of the most useful checks on scope, method, and clarity.','Bring specific questions and act on feedback while there is still time to revise.'],
 ['Poor time management','Late writing usually produces thin research and rushed argument.','Work through milestones instead of treating the EE as one final-month task.'],
 ['Inconsistent referencing','Weak citation practice damages credibility and can raise academic-honesty concerns.','Keep one citation style and a running bibliography from the start.'],
 ['Little genuine evaluation','Strong analysis is not enough if you never weigh significance, strengths, limits, or alternative readings.','Build evaluation into body paragraphs rather than saving it for the conclusion.'],
 ['Texts too thin for sustained analysis','You may run out of distinct evidence and repeat the same point.','Test whether the material can support several different sub-arguments before committing.'],
 ['Context as padding','Long biography or history sections waste words when they do not change the interpretation.','Use context only when it directly supports a specific analytical claim.'],
 ['Over-reliance on summary sites','General study sites do not replace scholarly criticism.','Use them only for orientation; build research from primary texts and credible secondary sources.'],
 ['A yes/no research question','Binary questions tend to produce thin essays.','Prefer how, in what ways, or to what extent.'],
 ['Disconnected structure','A list of separate observations does not create a sustained argument.','Make each section build on, qualify, or complicate the previous one.'],
 ['Neglecting reflection','Reflection is part of the assessed process under the new model described in this guide.','Keep a research journal so your final reflection can refer to real changes in thinking.'],
 ['Formatting non-compliance','Presentation conventions still matter even when they are not a separate criterion.','Check your school’s exact title-page, contents, numbering, spacing, and submission expectations.'],
 ['Academic honesty problems','Missing attribution can trigger serious consequences regardless of essay quality.','Cite quotations, paraphrases, and borrowed ideas consistently.']
];

const checklist=[
 'Research question is specific, analytical, and answerable within 4,000 words.',
 'Essay is within the 4,000-word limit.',
 'Every major section connects visibly back to the research question.',
 'Analysis dominates the body; summary is only used when necessary for orientation.',
 'Evaluation appears throughout, not only in the conclusion.',
 'All sources are cited consistently in the required style.',
 'Bibliography is complete and matches in-text citations.',
 'Required supervisor reflection sessions are complete.',
 'Required reflection form or statement is complete for the model that applies to my cohort.',
 'Formatting matches my school’s requirements.',
 'The final draft has been proofread for clarity and accuracy.',
 'Academic honesty has been checked and every source is properly credited.'
];

function doneIds(){try{const v=JSON.parse(localStorage.getItem('litlabDone')||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function markEE(){const ids=doneIds();if(!ids.includes('ee')){ids.push('ee');localStorage.setItem('litlabDone',JSON.stringify(ids))}}
function savedChecks(){try{const v=JSON.parse(localStorage.getItem('litlabEEChecklist')||'[]');return Array.isArray(v)?v:[]}catch{return [] as number[]}}

function guideHTML(){
 return `<article class="ee-guide-page" data-ee-guide>
  <section class="ee-guide-hero">
   <div class="ee-guide-hero-copy">
    <span class="ee-kicker">✦ EXTENDED ESSAY • ENGLISH A</span>
    <h1>Turn curiosity into a <em>researchable argument.</em></h1>
    <p>The EE is not a very long class essay. It is an independent research project built around a focused question, sustained textual analysis, credible research, and a line of argument that develops over time.</p>
    <div class="ee-hero-actions"><button type="button" data-ee-scroll="ee-rq">Build a research question <span>→</span></button><button type="button" class="secondary" data-ee-scroll="ee-checklist">Open checklist</button></div>
   </div>
   <div class="ee-hero-stats" aria-label="Extended Essay quick facts">
    <div><b>4,000</b><span>word maximum</span></div>
    <div><b>~40 h</b><span>typical project time</span></div>
    <div><b>DP Core</b><span>with TOK + CAS</span></div>
    <div><b>2</b><span>pathways in the May 2027 model</span></div>
   </div>
  </section>

  <aside class="ee-cohort-alert"><div>!</div><p><b>Confirm which EE model applies to your cohort.</b> This guide is built primarily around the May 2027 model described in the supplied material: a 30-point criteria structure, a simplified reflection process, and removal of the old Language A Category 1/2/3 requirement. Your EE coordinator should confirm that this is the model your cohort will actually use.</p></aside>

  <nav class="ee-guide-nav" aria-label="Extended Essay sections">
   ${[['ee-overview','Overview'],['ee-fit','English?'],['ee-scope','Scope'],['ee-rq','RQ Lab'],['ee-research','Research'],['ee-plan','Plan'],['ee-analysis','Analysis'],['ee-supervisor','Supervisor'],['ee-mistakes','Mistakes'],['ee-checklist','Checklist'],['ee-criteria','Criteria'],['ee-timeline','Timeline']].map(([id,label])=>`<button type="button" data-ee-scroll="${id}">${label}</button>`).join('')}
  </nav>

  <section id="ee-overview" class="ee-section">
   <header><span>01 • BIG PICTURE</span><h2>What is the Extended Essay?</h2><p>A focused independent research project inside the Diploma Programme core.</p></header>
   <div class="ee-overview-grid">
    <article><span>SUBJECT-FOCUSED</span><h3>One DP subject</h3><p>For an English-focused student, this means building the research question and method within English A.</p></article>
    <article><span>INTERDISCIPLINARY</span><h3>Two DP subjects</h3><p>The May 2027 model described in the source introduces an interdisciplinary pathway using prescribed frameworks. This replaces the older World Studies route.</p></article>
   </div>
   <div class="ee-definition-chain"><div><b>Curiosity</b><span>What keeps pulling your attention?</span></div><i>→</i><div><b>Area of interest</b><span>Broad territory</span></div><i>→</i><div><b>Topic</b><span>Specific text / material</span></div><i>→</i><div><b>Research question</b><span>Focused analytical problem</span></div><i>→</i><div><b>Argument</b><span>Your sustained answer</span></div></div>
  </section>

  <section id="ee-fit" class="ee-section">
   <header><span>02 • CHOOSING ENGLISH</span><h2>Is English right for your EE?</h2><p>Choose the subject because the kind of thinking fits you, not because it looks easier.</p></header>
   <div class="ee-fit-grid">
    <article class="good"><span>GOOD FIT</span><h3>English makes sense if…</h3><ul><li>You enjoy close, sustained analysis of how texts create meaning.</li><li>You are comfortable reading independently beyond assigned class material.</li><li>You want to build an evidence-based humanities argument.</li><li>You already have an author, text, technique, or language phenomenon you keep thinking about.</li></ul></article>
    <article class="pause"><span>PAUSE FIRST</span><h3>Reconsider if…</h3><ul><li>Your real interest is empirical or data-driven.</li><li>You are choosing English mainly because it seems easier.</li><li>You only have a general interest in “reading” but no specific textual or language question yet.</li></ul></article>
   </div>
  </section>

  <section id="ee-scope" class="ee-section">
   <header><span>03 • AREA → TOPIC</span><h2>Start broad. Then earn your precision.</h2><p>The early stages are for exploration. Do not force a polished research question before you know what material can actually sustain it.</p></header>
   <div class="ee-scope-grid">
    <article><b>AREA OF INTEREST</b><p>A recurring tension, technique, theme, or form that genuinely interests you.</p><small>Examples: unreliable narration and reader trust • how dystopian fiction represents state control of the body • how poetry gives voice to silenced figures • ethics of representing real suffering in memoir</small></article>
    <article><b>TOPIC</b><p>Narrow the territory to specific text(s), author(s), or language material.</p><small>The May 2027 model described in the source removes the formal Language A Category 1/2/3 boxes, although literary, comparative/translated-work, and language-focused approaches remain useful shapes for planning.</small></article>
    <article><b>CAPACITY TEST</b><p>Can this material sustain several genuinely different analytical sub-arguments?</p><small>If the text is too thin, you may repeat yourself for 4,000 words. Test depth before you commit.</small></article>
   </div>
  </section>

  <section id="ee-rq" class="ee-section ee-rq-section">
   <header><span>04 • RESEARCH QUESTION LAB</span><h2>Make the scope smaller and the thinking sharper.</h2><p>A strong English EE question is specific, analytical, answerable through close textual analysis, and explicit about the material and angle.</p></header>
   <div class="ee-rq-formula"><span>Useful starting shape</span><b>How / To what extent does [author / text] use [specific technique] to [construct / explore / critique] [specific idea]?</b></div>
   <div class="ee-rq-workbench">
    <div class="ee-rq-tabs">${rqSets.map((set,i)=>`<button type="button" data-rq-set="${i}" class="${i===0?'active':''}">${esc(set.label)}</button>`).join('')}</div>
    <div class="ee-rq-stage-buttons">${['TOO BROAD','NARROWER','FOCUSED','ANALYTICAL'].map((label,i)=>`<button type="button" data-rq-stage="${i}" class="${i===0?'active':''}"><span>${i+1}</span>${label}</button>`).join('')}</div>
    <article class="ee-rq-screen"><span data-rq-level>TOO BROAD</span><h3 data-rq-text>${esc(rqSets[0].stages[0])}</h3><div class="ee-rq-meter"><i data-rq-meter style="width:25%"></i></div><p data-rq-note>Start with the territory. At this stage, the question is too large to answer with depth.</p></article>
   </div>
   <aside class="ee-tip"><b>Do not submit demo questions.</b><p>Your real RQ should emerge from your reading, research, evidence, and supervisor feedback. These examples teach the narrowing process.</p></aside>
  </section>

  <section id="ee-research" class="ee-section">
   <header><span>05 • RESEARCH + SOURCES</span><h2>Build research around your analysis—not instead of it.</h2><p>Your primary text remains the center of an English EE. Secondary research should deepen, challenge, or contextualize your reading.</p></header>
   <div class="ee-research-grid">
    <article><span>PRIMARY</span><h3>The text(s) themselves</h3><p>Close, repeated reading is the foundation. Track scenes, patterns, techniques, and evidence that directly connect to your emerging argument.</p></article>
    <article><span>SECONDARY</span><h3>Scholarly criticism</h3><p>Use published literary criticism, academic articles, critical editions, and reputable contextual sources when they genuinely support the analysis.</p></article>
    <article><span>WHERE TO LOOK</span><h3>Academic discovery</h3><p>School/public-library databases, Google Scholar, published essay collections, and critical editions are stronger starting points than anonymous general web pages.</p></article>
    <article><span>RESEARCH LOG</span><h3>Source → point → your reaction</h3><p>Record the source, useful evidence or idea, and your own response. This helps both drafting and later reflection because you preserve how your thinking actually changed.</p></article>
   </div>
   <div class="ee-source-ladder"><b>Source quality ladder</b><div><span class="best">Primary text</span><span>Peer-reviewed / academic criticism</span><span>Authoritative context</span><span class="weak">General summary sites: orientation only</span></div></div>
  </section>

  <section id="ee-plan" class="ee-section">
   <header><span>06 • PLANNING</span><h2>Plan the argument before you plan the word count.</h2><p>The source offers a rough allocation as a starting guide—not a rigid formula.</p></header>
   <div class="ee-word-plan"><div class="intro"><b>~10%</b><span>Focused introduction</span></div><div class="body"><b>~75–80%</b><span>Sustained analytical body</span></div><div class="conclusion"><b>~10–15%</b><span>Synthesizing conclusion</span></div></div>
   <div class="ee-plan-grid"><article><b>Milestone 01</b><p>Explore area of interest and test possible material.</p></article><article><b>Milestone 02</b><p>Draft, narrow, and test the research question.</p></article><article><b>Milestone 03</b><p>Complete the bulk of research and build a full outline.</p></article><article><b>Milestone 04</b><p>Write a complete first draft with time left for feedback and major revision.</p></article></div>
  </section>

  <section id="ee-analysis" class="ee-section">
   <header><span>07 • ANALYSIS + ARGUMENT</span><h2>Every paragraph has to earn its place.</h2><p>The EE uses the same analysis discipline as Paper 1 and Paper 2, but across a much longer line of argument.</p></header>
   <div class="ee-analysis-test"><div><span>SUMMARY TEST</span><h3>“If I delete this paragraph, do I lose part of my argument—or only information?”</h3><p>If you lose only information the reader needed for orientation, the paragraph probably needs more analytical work.</p></div><div class="ee-argument-chain"><span>Sub-claim</span><i>→</i><span>Evidence</span><i>→</i><span>Choice / method</span><i>→</i><span>Meaning</span><i>→</i><span>Evaluation</span><i>→</i><span>RQ link</span></div></div>
   <div class="ee-argument-rules"><article><b>Use sub-claims, not topic labels.</b><p>“This section discusses imagery” names a subject. A strong topic sentence states what that imagery proves.</p></article><article><b>Build, complicate, extend.</b><p>Do not write a list of separate points. Each section should change or deepen the line of argument.</p></article><article><b>Use alternative readings when useful.</b><p>Counterarguments and limitations can strengthen discussion and evaluation when they genuinely matter.</p></article></div>
  </section>

  <section id="ee-referencing" class="ee-section">
   <header><span>08 • REFERENCING</span><h2>Consistency matters more than picking a fashionable style.</h2><p>The supplied material says the IB does not mandate one citation style. Confirm what your school requires; MLA is common for English but should not be assumed.</p></header>
   <div class="ee-reference-flow"><div><b>1</b><span>Record bibliographic details when you first find the source.</span></div><div><b>2</b><span>Cite every quotation, paraphrase, and specific borrowed idea.</span></div><div><b>3</b><span>Keep the in-text system consistent.</span></div><div><b>4</b><span>Cross-check every citation against the final bibliography.</span></div></div>
  </section>

  <section id="ee-supervisor" class="ee-section">
   <header><span>09 • SUPERVISOR + REFLECTION</span><h2>Use supervision as a working process.</h2><p>Bring specific questions, evidence, or drafts. A general check-in cannot produce useful feedback on work the supervisor cannot see.</p></header>
   <div class="ee-supervisor-grid"><article><span>BEFORE</span><h3>Bring something concrete.</h3><p>A draft RQ, outline, source problem, paragraph, or decision you need help evaluating.</p></article><article><span>DURING</span><h3>Ask precise questions.</h3><p>Focus on scope, method, argument, evidence, and what your next decision should be.</p></article><article><span>AFTER</span><h3>Record what changed.</h3><p>Note how the meeting changed your thinking. A research journal gives you specific material for genuine reflection later.</p></article></div>
   <aside class="ee-model-note"><b>May 2027 reflection model — confirm before relying on it.</b><p>The supplied guide describes a single Reflection and Progress Form with a 500-word reflective statement after the viva voce, assessed under Criterion E. The older model used three RPPF entries within a combined 500-word limit. Your coordinator should confirm which process applies to you.</p></aside>
  </section>

  <section id="ee-mistakes" class="ee-section">
   <header><span>10 • COMMON MISTAKES</span><h2>Know the failure modes before they cost you weeks.</h2><p>Open a card to see why the problem matters and the practical correction.</p></header>
   <div class="ee-mistake-grid">${mistakes.map((m,i)=>`<details><summary><span>${String(i+1).padStart(2,'0')}</span><b>${esc(m[0])}</b><i>+</i></summary><div><p><strong>Why it hurts:</strong> ${esc(m[1])}</p><p><strong>Fix:</strong> ${esc(m[2])}</p></div></details>`).join('')}</div>
  </section>

  <section id="ee-checklist" class="ee-section">
   <header><span>11 • PRE-SUBMISSION CHECK</span><h2>Turn the final review into something visible.</h2><p>Your checks save locally on this device.</p></header>
   <div class="ee-check-progress"><div><b data-ee-check-count>0 / ${checklist.length}</b><span>checked</span></div><div><i data-ee-check-bar></i></div></div>
   <div class="ee-checklist">${checklist.map((x,i)=>`<label><input type="checkbox" data-ee-check="${i}"><span class="box">✓</span><span>${esc(x)}</span></label>`).join('')}</div>
  </section>

  <section id="ee-criteria" class="ee-section">
   <header><span>12 • ASSESSMENT MODEL</span><h2>Know what the argument is being rewarded for.</h2><p>The May 2027 table below comes from the supplied material and should be treated as provisional for your cohort until the EE coordinator confirms the assessment session.</p></header>
   <div class="ee-criteria-tabs"><button type="button" class="active" data-ee-criteria="new">May 2027 model • 30 marks</button><button type="button" data-ee-criteria="old">Pre-2027 reference • 34 marks</button></div>
   <div class="ee-criteria-panel" data-ee-criteria-panel="new">
    <div class="ee-criteria-table"><div class="head"><span>Criterion</span><span>Marks</span><span>What it assesses</span></div>
     ${[['A — Framework for the essay','6','Research question, research approach / method, and structural conventions.'],['B — Knowledge and understanding','6','Subject-specific knowledge, terminology, and conceptual accuracy.'],['C — Analysis and line of argument','6','How effectively evidence is analyzed and how coherently the argument develops.'],['D — Discussion and evaluation','8','Discussion of findings plus evaluation of significance, strengths, and limitations.'],['E — Reflection','4','The reflective statement on growth as a learner and researcher.']].map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b><span>${r[2]}</span></div>`).join('')}
    </div>
    <aside class="ee-criterion-emphasis"><b>D is the highest-weighted criterion in this model.</b><p>That means evaluation should be built into the essay, not added as a final paragraph after the analysis is finished.</p></aside>
   </div>
   <div class="ee-criteria-panel" data-ee-criteria-panel="old" hidden>
    <div class="ee-criteria-table"><div class="head"><span>Criterion</span><span>Marks</span><span>What it assessed</span></div>
     ${[['A — Focus and method','6','Clarity of the research question and methodology.'],['B — Knowledge and understanding','6','Subject-specific knowledge applied appropriately.'],['C — Critical thinking','12','Analysis, discussion, and evaluation of evidence.'],['D — Presentation','4','Structure, formatting, and citation consistency.'],['E — Engagement','6','Reflection recorded across the RPPF entries.']].map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b><span>${r[2]}</span></div>`).join('')}
    </div>
   </div>
  </section>

  <section id="ee-timeline" class="ee-section">
   <header><span>13 • FORMAT + TIMELINE</span><h2>Protect the final weeks by planning earlier.</h2><p>The source describes a typical 12–18 month process, but your school’s internal deadlines control your actual calendar.</p></header>
   <div class="ee-format-grid"><article><b>4,000 words maximum</b><p>The essay itself runs from introduction through conclusion. Do not plan to hide essential evaluation after the limit.</p></article><article><b>School formatting</b><p>Confirm title page, contents, font, spacing, page numbering, and other submission conventions locally.</p></article><article><b>No abstract required</b><p>The source says the current model does not require an abstract. Confirm local instructions before final submission.</p></article></div>
   <div class="ee-timeline"><div><span>EARLY</span><b>Explore</b><p>Areas of interest, possible material, genuine curiosity.</p></div><i></i><div><span>RQ</span><b>Test scope</b><p>Draft, narrow, gather evidence, get early feedback.</p></div><i></i><div><span>RESEARCH</span><b>Build depth</b><p>Complete most research before deadline pressure begins.</p></div><i></i><div><span>DRAFT</span><b>Write fully</b><p>Finish a complete first draft with time for substantial revision.</p></div><i></i><div><span>FINAL</span><b>Proof + format</b><p>Keep proofreading and formatting as their own stage.</p></div></div>
  </section>

  <section class="ee-finish-card"><span>EXTENDED ESSAY • GUIDE COMPLETE</span><h2>Use the guide to make decisions—not to replace them.</h2><p>Your best EE will still depend on your own reading, research, supervisor conversations, and the exact guidance your school confirms for your assessment session.</p><button type="button" data-ee-reviewed>${doneIds().includes('ee')?'✓ EE guide reviewed':'Mark EE guide reviewed'}</button></section>
 </article>`;
}

function bind(page:HTMLElement){
 page.querySelectorAll<HTMLButtonElement>('[data-ee-scroll]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.eeScroll||'')?.scrollIntoView({behavior:'smooth',block:'start'})));
 let setIndex=0,stageIndex=0;
 const levels=['TOO BROAD','NARROWER','FOCUSED','ANALYTICAL'];
 const notes=['Start with the territory. At this stage, the question is too large to answer with depth.','The field is smaller, but the question still needs a specific text, mechanism, or angle.','A named text and analytical mechanism create a workable focus.','The final stage adds a bounded technique and evaluative framing that can support a sustained argument.'];
 const renderRQ=()=>{
  page.querySelectorAll<HTMLButtonElement>('[data-rq-set]').forEach((b,i)=>b.classList.toggle('active',i===setIndex));
  page.querySelectorAll<HTMLButtonElement>('[data-rq-stage]').forEach((b,i)=>b.classList.toggle('active',i===stageIndex));
  const level=page.querySelector<HTMLElement>('[data-rq-level]'),text=page.querySelector<HTMLElement>('[data-rq-text]'),meter=page.querySelector<HTMLElement>('[data-rq-meter]'),note=page.querySelector<HTMLElement>('[data-rq-note]');
  if(level)level.textContent=levels[stageIndex];if(text)text.textContent=rqSets[setIndex].stages[stageIndex];if(meter)meter.style.width=`${25*(stageIndex+1)}%`;if(note)note.textContent=notes[stageIndex];
 };
 page.querySelectorAll<HTMLButtonElement>('[data-rq-set]').forEach((b,i)=>b.addEventListener('click',()=>{setIndex=i;renderRQ()}));
 page.querySelectorAll<HTMLButtonElement>('[data-rq-stage]').forEach((b,i)=>b.addEventListener('click',()=>{stageIndex=i;renderRQ()}));

 const saved=savedChecks();
 const updateChecks=()=>{const active=[...page.querySelectorAll<HTMLInputElement>('[data-ee-check]')].filter(x=>x.checked).map(x=>Number(x.dataset.eeCheck));localStorage.setItem('litlabEEChecklist',JSON.stringify(active));const count=page.querySelector<HTMLElement>('[data-ee-check-count]'),bar=page.querySelector<HTMLElement>('[data-ee-check-bar]');if(count)count.textContent=`${active.length} / ${checklist.length}`;if(bar)bar.style.width=`${active.length/checklist.length*100}%`};
 page.querySelectorAll<HTMLInputElement>('[data-ee-check]').forEach(input=>{input.checked=saved.includes(Number(input.dataset.eeCheck));input.addEventListener('change',updateChecks)});updateChecks();

 page.querySelectorAll<HTMLButtonElement>('[data-ee-criteria]').forEach(btn=>btn.addEventListener('click',()=>{const mode=btn.dataset.eeCriteria;page.querySelectorAll('[data-ee-criteria]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');page.querySelectorAll<HTMLElement>('[data-ee-criteria-panel]').forEach(panel=>panel.hidden=panel.dataset.eeCriteriaPanel!==mode)}));
 const reviewed=page.querySelector<HTMLButtonElement>('[data-ee-reviewed]');reviewed?.addEventListener('click',()=>{markEE();reviewed.textContent='✓ EE guide reviewed';reviewed.classList.add('reviewed')});
}

function mount(){
 if(route()!=='ee')return;
 const page=[...document.querySelectorAll<HTMLElement>('main .page')].find(el=>el.querySelector('.hero h1,.page-hero h1')?.textContent?.includes('Turn curiosity')||el.textContent?.includes('Research Question Lab'));
 if(!page||page.dataset.eeGuideMounted==='true')return;
 page.dataset.eeGuideMounted='true';page.classList.add('ee-guide-host');page.innerHTML=guideHTML();bind(page);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,60));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
