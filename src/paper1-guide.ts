import './paper1-guide.css';
import{analysisExamples,approachSteps,choiceGroups,commonMistakes,evaluationExamples,paper1Practices,paragraphPairs,thesisPairs,toneBank,type Paper1Practice}from'./paper1-data';

const OFFICIAL_COURSE='https://ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-language-and-literature/';
const OFFICIAL_2026='https://ibpublishing.ibo.org/exinst/apps/exinst/index.html?chapter=1&doc=EX_instructions_2026_e&part=8';
const route=()=>location.hash.slice(1).split('#')[0]||'home';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sections=[
  ['p1-overview','Overview'],['p1-approach','Unseen approach'],['p1-annotation','Annotation'],['p1-apc','Audience • Purpose • Context'],['p1-tone','Tone'],['p1-choices','Authorial choices'],['p1-analysis','Analysis'],['p1-evaluation','Evaluation'],['p1-thesis','Thesis'],['p1-paragraphs','Paragraphs'],['p1-planning','Planning'],['p1-time','Time'],['p1-mistakes','Mistakes'],['p1-practice','Practice']
] as const;

function esc(value:string){return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch))}
function list(items:string[]){return `<ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul>`}

function template(){
  return `<section class="page paper1-guide-page" aria-labelledby="paper1-title">
    <div class="paper1-breadcrumb"><button type="button" data-go="papers">Papers</button><span>›</span><strong>Paper 1</strong></div>
    <header class="paper1-hero">
      <div class="paper1-hero-copy">
        <span class="paper1-eyebrow">✦ ELENA'S CONTENT PACK • LITLAB INTEGRATION</span>
        <h1 id="paper1-title">Paper 1</h1>
        <h2>Analyze what is in front of you.</h2>
        <p>Read an unseen text, identify the choices doing the most work, and build a focused argument about <b>how those choices shape meaning</b>. This guide turns the full Paper 1 content pack into a study path you can actually use.</p>
        <div class="paper1-hero-actions"><button type="button" class="btn primary" data-scroll="p1-approach">Start with the unseen-text process →</button><button type="button" class="btn secondary" data-go="paper-2">Switch to Paper 2</button></div>
      </div>
      <div class="paper1-hero-model" aria-hidden="true"><span>NOTICE</span><i>→</i><span>CHOICE</span><i>→</i><span>EFFECT</span><i>→</i><span>MEANING</span><i>→</i><span>EVALUATE</span></div>
    </header>

    <aside class="paper1-official-check">
      <div><span>OFFICIAL COURSE CHECK • 2026</span><h3>Know what is official and what is strategy.</h3></div>
      <div class="official-facts">
        <p><b>Language A: Language & Literature:</b> Paper 1 uses two previously unseen non-literary texts of different text types.</p>
        <p><b>SL:</b> write one guided textual analysis on the text you choose. <b>HL:</b> write two separate guided analyses, one on each text.</p>
        <p><b>Guiding question:</b> it provides a focus. A clear alternative technical/formal focus is possible, but simply writing an unfocused commentary can limit performance.</p>
      </div>
      <div class="official-actions"><a href="${OFFICIAL_2026}" target="_blank" rel="noopener noreferrer">2026 examiner guidance ↗</a><a href="${OFFICIAL_COURSE}" target="_blank" rel="noopener noreferrer">Official course page ↗</a></div>
    </aside>

    <nav class="paper1-guide-nav" aria-label="Paper 1 guide sections"><span>ON THIS GUIDE</span>${sections.map(([id,label],i)=>`<button type="button" data-scroll="${id}" class="${i===0?'current':''}">${label}</button>`).join('')}</nav>

    <section id="p1-overview" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>01 • OVERVIEW</span><h2>Paper 1 is analysis, not a comprehension test.</h2><p>The goal is to explain how a text has been constructed and why that construction matters for a particular audience and purpose.</p></div>
      <div class="paper1-overview-grid">
        <article><b>WHAT YOU ARE DOING</b><h3>Build an interpretation.</h3><p>Notice language, structure, visual features, tone and patterns. Then connect them into a coherent argument rather than a list of techniques.</p></article>
        <article><b>WHAT YOU ARE NOT DOING</b><h3>Retelling the text.</h3><p>“The writer says climate change is urgent” is summary. Analysis explains how particular choices construct that urgency and why they matter.</p></article>
        <article><b>WHAT STRONG RESPONSES DO</b><h3>Develop fewer points deeply.</h3><p>Use precise evidence, return to audience/purpose where relevant, evaluate choices, and keep every paragraph attached to the central line of argument.</p></article>
      </div>
      <div class="paper1-criteria">
        <div><span>A</span><b>Understanding & interpretation</b><p>Show what the text means beyond the literal and support the reading with relevant references.</p></div>
        <div><span>B</span><b>Analysis & evaluation</b><p>Explain how textual features and authorial choices shape meaning; higher-level analysis moves beyond identification.</p></div>
        <div><span>C</span><b>Focus & organization</b><p>Maintain a clear focus and an easily followed line of argument.</p></div>
        <div><span>D</span><b>Language</b><p>Communicate clearly and accurately in an appropriate analytical register.</p></div>
      </div>
      <div class="paper1-verify-note"><b>Course-detail note</b><p>Elena's pack lists SL as 1h15 / 20 marks / 35% and HL as 2h15 / 40 marks / 35%. Because the school should follow the current first-assessment-2026 guide, LitLab treats exact timing/weighting as a detail to confirm with your teacher or current course guide before an exam.</p></div>
    </section>

    <section id="p1-approach" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>02 • UNSEEN TEXT PROCESS</span><h2>Use the same thinking sequence until it becomes automatic.</h2><p>Read → situation → audience → purpose → tone → patterns → choices → interpretation → argument → thesis → plan → write.</p></div>
      <div class="paper1-stepper">
        <div class="paper1-step-list">${approachSteps.map((step,i)=>`<button type="button" data-approach="${i}" class="${i===0?'active':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${step[0]}</b></button>`).join('')}</div>
        <article class="paper1-step-detail"><span>STEP 01</span><h3>${approachSteps[0][0]}</h3><p>${approachSteps[0][1]}</p><div><b>Mistake to avoid</b><p>${approachSteps[0][2]}</p></div></article>
      </div>
    </section>

    <section id="p1-annotation" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>03 • ANNOTATION</span><h2>Annotate for function, not decoration.</h2><p>A useful annotation becomes a paragraph idea. A useless annotation simply repeats the words already on the page.</p></div>
      <div class="paper1-annotation-grid">
        <article class="paper1-strategy-card"><span>STUDENT STRATEGY</span><h3>A fast annotation system</h3>${list([
          'Underline short phrases with strong connotation, imagery or emotional charge — the words you may actually quote.',
          'Circle repeated words, structural markers, numbers and facts that appear deliberately emphasized.',
          'Write function in the margin: “builds urgency,” “undercuts the claim,” “shifts to personal register.”',
          'Bracket shifts and contrasts, then label exactly what changes: “factual → emotional,” “stillness → movement.”',
          'Use a small tally for repeated patterns. Repetition can become a paragraph when it connects to the central idea.',
          'After annotating, group the strongest notes into 3–4 clusters. Those clusters become possible paragraph arguments.'
        ])}<p class="paper1-micro-note">If nearly the whole text is highlighted, you have not prioritized. Elena's suggested target is roughly 6–8 genuinely useful moments.</p></article>
        <article class="paper1-worked-text"><span>ORIGINAL LITLAB MINI TEXT</span><blockquote>“The last bus left twenty minutes ago, but she was still standing at the stop, coat pulled tight, watching the empty road as if watching hard enough might change what had already happened. Somewhere behind her, the town was closing up for the night — shutters coming down, one by one, like eyes.”</blockquote><div class="annotation-notes"><p><b>“but”</b> → contrast between the fact that the bus is gone and her refusal to leave.</p><p><b>“coat pulled tight”</b> → physical cold can also suggest self-protection.</p><p><b>“shutters… like eyes”</b> → the simile makes the town seem to withdraw, reinforcing isolation.</p><p><b>Pattern</b> → bus gone + shutters closing = repeated imagery of ending/exclusion.</p></div></article>
      </div>
      <div class="paper1-chain"><b>Turn one annotation into analysis</b><span>Claim</span><i>→</i><span>Evidence</span><i>→</i><span>Choice</span><i>→</i><span>Effect</span><i>→</i><span>Meaning</span><i>→</i><span>Evaluation</span></div>
    </section>

    <section id="p1-apc" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>04 • AUDIENCE • PURPOSE • CONTEXT</span><h2>Choices only make sense inside a situation.</h2><p>Do not mention these three once in the introduction and forget them. Use them when they explain why a textual choice works.</p></div>
      <div class="paper1-apc-grid">
        <article><span>AUDIENCE</span><h3>Who is this designed to reach?</h3><p>Look at vocabulary level, assumed knowledge, pronouns, platform and what the text bothers to explain.</p>${list(['Who already agrees?','Who needs convincing?','What knowledge is assumed?','Who feels directly addressed?'])}<div class="weak-strong"><small>WEAK</small><p>“The audience is readers of the article.”</p><small>STRONGER</small><p>Unexplained financial terminology can signal an audience already fluent in economics, shaping the piece as an insider argument rather than an explainer.</p></div></article>
        <article><span>PURPOSE</span><h3>What is the text trying to do?</h3><p>Inform, persuade, warn, criticize, entertain, reassure, mobilize, sell, provoke — often more than one at once.</p>${list(['What should change in the audience?','What action or belief is encouraged?','Does the purpose shift?','How does each choice help achieve it?'])}<div class="weak-strong"><small>WEAK</small><p>“The purpose is to persuade.”</p><small>STRONGER</small><p>An anecdote before statistics can build emotional connection first, making later evidence feel like confirmation rather than a cold demand for agreement.</p></div></article>
        <article><span>CONTEXT</span><h3>Use context only when the text earns it.</h3><p>Context can be historical, cultural, social or situational, but unseen analysis is not a test of how much outside knowledge you can force into the response.</p>${list(['Use framing information supplied with the text.','Let context explain a choice you have already noticed.','Do not invent an unsupported backstory.','Do not replace textual analysis with historical background.'])}</article>
      </div>
    </section>

    <section id="p1-tone" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>05 • TONE BANK</span><h2>Move beyond “positive” and “negative.”</h2><p>Tone is the creator's attitude toward the subject and/or audience. The most useful analytical move is often tracking a <b>shift</b> rather than attaching one word to the whole text.</p></div>
      <div class="paper1-filter-row"><label><span>Search tone</span><input type="search" data-tone-search placeholder="Try skeptical, restrained, intimate…"></label><span class="paper1-count" data-tone-count>${toneBank.length} tone words</span></div>
      <div class="paper1-tone-grid">${toneBank.map(([word,definition,use])=>`<article data-tone-card data-search="${esc(`${word} ${definition} ${use}`.toLowerCase())}"><b>${word}</b><p>${definition}</p><small>${use}</small></article>`).join('')}</div>
    </section>

    <section id="p1-choices" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>06 • AUTHORIAL CHOICES</span><h2>Name the mechanism, then explain what it changes.</h2><p>The pack includes 44 choices across language, structure, narrative and visual/multimodal analysis. Accuracy matters more than impressive terminology.</p></div>
      <div class="paper1-choice-controls"><div class="paper1-choice-tabs">${Object.keys(choiceGroups).map((cat,i)=>`<button type="button" data-choice-tab="${cat}" class="${i===0?'active':''}">${cat}</button>`).join('')}</div><label><span>Find a choice</span><input type="search" data-choice-search placeholder="Search juxtaposition, modality, framing…"></label></div>
      <div class="paper1-choice-grid"></div>
    </section>

    <section id="p1-analysis" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>07 • ANALYSIS</span><h2>Keep moving until the observation becomes an argument.</h2><p>Elena's progression matches the core LitLab method: <b>Observation → Choice → Effect → Meaning → Evaluation → Wider idea</b>.</p></div>
      <div class="paper1-analysis-formula">${['OBSERVATION','CHOICE','EFFECT','MEANING','EVALUATION','WIDER IDEA'].map((x,i)=>`<span>${x}</span>${i<5?'<i>→</i>':''}`).join('')}</div>
      <div class="paper1-analysis-lab"><div class="paper1-analysis-tabs">${analysisExamples.map((x,i)=>`<button type="button" data-analysis-example="${i}" class="${i===0?'active':''}">${x.label}</button>`).join('')}</div><div class="paper1-analysis-steps">${analysisExamples[0].steps.map((step,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${step}</p></article>`).join('')}</div></div>
    </section>

    <section id="p1-evaluation" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>08 • EVALUATION</span><h2>“Effectively” is not evaluation by itself.</h2><p>Evaluation makes a judgment about how well a choice shapes meaning, then explains <b>why that judgment is justified here</b>.</p></div>
      <div class="paper1-effect-eval"><article><small>EFFECT</small><p>“The short sentence creates urgency.”</p></article><span>→</span><article><small>EVALUATION</small><p>“The urgency is especially effective after the long descriptive sentence because the sudden rhythmic break jolts the audience in a way that mirrors the shock being described.”</p></article></div>
      <div class="paper1-eval-prompts">${['What would be lost if a different choice were used?','Why does this work for this particular audience or purpose?','Does the choice achieve more than one effect at once?','Is there a limitation — could it alienate, oversimplify or manipulate?'].map(x=>`<div><span>?</span><p>${x}</p></div>`).join('')}</div>
      <details class="paper1-example-drawer"><summary>See 10 strong evaluation examples <span>＋</span></summary><div>${evaluationExamples.map((x,i)=>`<p><b>${i+1}.</b> ${x}</p>`).join('')}</div></details>
    </section>

    <section id="p1-thesis" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>09 • THESIS</span><h2>Your thesis is the argument the whole response has to prove.</h2><p>It should not be a summary, a topic or a shopping list of devices.</p></div>
      <div class="paper1-thesis-formula"><span>CREATOR</span><i>+</i><span>RELEVANT CHOICES</span><i>+</i><span>CENTRAL IDEA</span><i>+</i><span>ANALYTICAL / EVALUATIVE DIRECTION</span></div>
      <div class="paper1-pairs">${thesisPairs.map((x,i)=>`<article><span>THESIS ${String(i+1).padStart(2,'0')}</span><div class="pair weak"><small>WEAK</small><p>${x.weak}</p></div><div class="pair strong"><small>IMPROVED</small><p>${x.better}</p></div><p class="pair-why"><b>Why stronger:</b> ${x.why}</p></article>`).join('')}</div>
    </section>

    <section id="p1-paragraphs" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>10 • ANALYTICAL PARAGRAPHS</span><h2>Make the reasoning visible.</h2><p>A paragraph should carry the reader from a claim to evidence, into analysis, and back to the essay's central argument.</p></div>
      <div class="paper1-paragraph-chain">${['CLAIM','EVIDENCE / REFERENCE','AUTHORIAL CHOICE','EFFECT','MEANING','EVALUATION','CONNECTION'].map((x,i)=>`<span>${x}</span>${i<6?'<i>→</i>':''}`).join('')}</div>
      <div class="paper1-paragraph-pairs">${paragraphPairs.map((x,i)=>`<article><span>EXAMPLE ${i+1}</span><details><summary>See weak paragraph</summary><p>${x.weak}</p></details><div class="better-paragraph"><small>IMPROVED</small><p>${x.better}</p></div><p class="pair-why"><b>Why stronger:</b> ${x.why}</p></article>`).join('')}</div>
    </section>

    <section id="p1-planning" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>11 • PLANNING</span><h2>Group ideas by function, not by whatever you noticed first.</h2><p>Choose the annotation clusters that are most text-supported and most useful for your thesis.</p></div>
      <div class="paper1-plan-rules">${['State each paragraph argument in one sentence before writing.','If two paragraph claims sound almost identical, merge or replace one.','Give each paragraph distinct evidence and a distinct analytical job.','Echo the thesis’s key idea when connecting a paragraph back to the central argument.'].map((x,i)=>`<div><span>0${i+1}</span><p>${x}</p></div>`).join('')}</div>
      <div class="paper1-plan-examples">
        <article><span>PLAN A • OPINION COLUMN</span><h3>Urban green space</h3><p><b>Thesis:</b> Through movement from personal anecdote to civic appeal and a semantic field of loss, the writer transforms a local planning issue into an argument about collective responsibility for shared space.</p><ol><li>Opening anecdote + intimate register → emotional entry and credibility.</li><li>Loss/erosion vocabulary → frames the issue as an ongoing process.</li><li>Inclusive pronouns + closing imperative → converts private reflection into civic action.</li></ol></article>
        <article><span>PLAN B • ADVERTISEMENT</span><h3>Fitness app</h3><p><b>Thesis:</b> Through before/after visual composition and second-person imperatives, the advertisement constructs self-improvement as urgent yet effortless, appealing to aspiration over practicality.</p><ol><li>Split-screen contrast → transformation becomes the visual promise.</li><li>Second-person imperatives → audience becomes the hero of the transformation.</li><li>Minimal wording + white space → simplicity reinforces the “effortless” framing.</li></ol></article>
      </div>
    </section>

    <section id="p1-time" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>12 • TIME MANAGEMENT</span><h2>A practice framework, not an official formula.</h2><p>Elena's suggested SL breakdown is meant to protect planning and writing time. Adjust it during timed practice to fit your actual reading/writing speed.</p></div>
      <div class="paper1-strategy-label">STUDENT STRATEGY • BASED ON A 75-MINUTE SL PRACTICE</div>
      <div class="paper1-time-grid"><div><span>READ + CHOOSE</span><b>8–10 min</b><p>Read both texts and make a genuine selection.</p></div><div><span>ANNOTATE</span><b>10–12 min</b><p>Mark patterns without turning the whole page into highlights.</p></div><div><span>PLAN</span><b>8–10 min</b><p>Thesis + paragraph arguments + evidence.</p></div><div><span>WRITE</span><b>40–45 min</b><p>Protect the bulk of the session for developed analysis.</p></div><div><span>CHECK</span><b>~5 min</b><p>Fix unclear wording, missing links and avoidable language errors.</p></div></div>
      <p class="paper1-micro-note">Confirm the exact current exam duration and weighting with your teacher/current IB guide before using any timing framework as an assessment requirement.</p>
    </section>

    <section id="p1-mistakes" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>13 • COMMON MISTAKES</span><h2>Recognize the failure pattern before you repeat it.</h2><p>Each card gives the weakness, the repair, and a weak → stronger example.</p></div>
      <div class="paper1-mistake-grid">${commonMistakes.map((x,i)=>`<details><summary><span>${String(i+1).padStart(2,'0')}</span><b>${x[0]}</b><em>＋</em></summary><div><p>${x[1]}</p><p><b>Fix:</b> ${x[2]}</p><div class="weak-strong"><small>WEAK</small><p>${x[3]}</p><small>BETTER</small><p>${x[4]}</p></div></div></details>`).join('')}</div>
    </section>

    <section id="p1-practice" class="paper1-section" data-guide-section>
      <div class="paper1-section-head"><span>14 • ORIGINAL PAPER 1 PRACTICE</span><h2>Five texts. Twenty-six questions. Explanations after every answer.</h2><p>All five texts in Elena's pack are original LitLab practice material — not past-paper extracts and not official IB assessments.</p></div>
      <div class="paper1-practice-tabs">${paper1Practices.map((x,i)=>`<button type="button" data-practice="${i}" class="${i===0?'active':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${x.title}</b><small>${x.type}</small></button>`).join('')}</div>
      <div class="paper1-practice-workspace"></div>
    </section>

    <section class="paper1-finish">
      <div><span>✦ PAPER 1 CONTENT PACK</span><h2>Use the guide. Then test the skill.</h2><p>Content and organization were supplied by Elena for LitLab; the site integration turns that material into reference, examples and original practice. Student-strategy sections stay labelled as strategy rather than official requirements.</p></div>
      <div><button type="button" class="btn primary" data-paper1-complete>Mark Paper 1 reviewed ✓</button><button type="button" class="btn secondary" data-go="skills">Open Skills Lab →</button></div>
    </section>
  </section>`;
}

function renderChoices(page:HTMLElement,category:string,query=''){
  const grid=page.querySelector<HTMLElement>('.paper1-choice-grid');if(!grid)return;
  const q=query.trim().toLowerCase();
  const rows=(choiceGroups[category]||choiceGroups.Language).filter(x=>!q||`${x.term} ${x.definition} ${x.effect} ${x.meaning}`.toLowerCase().includes(q));
  grid.innerHTML=rows.length?rows.map(x=>`<details><summary><span>${esc(x.term)}</span><em>＋</em></summary><div class="choice-detail"><p><small>DEFINITION</small>${esc(x.definition)}</p><p><small>POSSIBLE EFFECT</small>${esc(x.effect)}</p><p><small>POSSIBLE MEANING</small>${esc(x.meaning)}</p><p class="bad-explanation"><small>COMMON WEAK EXPLANATION</small>${esc(x.bad)}</p></div></details>`).join(''):'<div class="paper1-no-match">No authorial choice matches that search.</div>';
}

function renderPractice(page:HTMLElement,index:number){
  const root=page.querySelector<HTMLElement>('.paper1-practice-workspace');if(!root)return;
  const item=paper1Practices[index];
  let qIndex=0,score=0;
  const draw=()=>{
    const q=item.questions[qIndex];
    root.innerHTML=`<div class="paper1-practice-layout">
      <article class="practice-passage"><div class="practice-passage-head"><span>ORIGINAL LITLAB ${esc(item.type.toUpperCase())}</span><b>${esc(item.title)}</b></div><blockquote>${esc(item.text)}</blockquote>${item.visual?`<div class="practice-visual-note"><span>VISUAL DESCRIPTION</span><p>${esc(item.visual)}</p></div>`:''}<button type="button" class="practice-reveal">Reveal analytical breakdown</button><div class="practice-breakdown" hidden><p><small>MAIN IDEA / THEME</small>${esc(item.theme)}</p><p><small>NOTICE</small>${esc(item.notice)}</p><p><small>AUTHORIAL CHOICES</small>${esc(item.choices)}</p><p><small>POSSIBLE EFFECTS</small>${esc(item.effects)}</p><p><small>INTERPRETATION</small>${esc(item.interpretation)}</p><p><small>EVALUATION</small>${esc(item.evaluation)}</p><p><small>POSSIBLE THESIS</small>${esc(item.thesis)}</p><p><small>POSSIBLE PARAGRAPH</small>${esc(item.paragraph)}</p></div></article>
      <article class="practice-quiz"><div class="practice-quiz-meta"><span>QUESTION ${qIndex+1} / ${item.questions.length}</span><b>${score} correct so far</b><i><em style="width:${Math.round(qIndex/item.questions.length*100)}%"></em></i></div><h3>${esc(q.prompt)}</h3><div class="paper1-options">${q.options.map((opt,i)=>`<button type="button" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span><p>${esc(opt)}</p></button>`).join('')}</div><div class="paper1-answer-feedback" aria-live="polite"></div><button type="button" class="btn primary paper1-next" disabled>${qIndex===item.questions.length-1?'See result':'Next question →'}</button></article>
    </div>`;
    root.querySelector<HTMLButtonElement>('.practice-reveal')?.addEventListener('click',e=>{const btn=e.currentTarget as HTMLButtonElement;const panel=root.querySelector<HTMLElement>('.practice-breakdown');if(!panel)return;panel.hidden=!panel.hidden;btn.textContent=panel.hidden?'Reveal analytical breakdown':'Hide analytical breakdown'});
    const feedback=root.querySelector<HTMLElement>('.paper1-answer-feedback')!;const next=root.querySelector<HTMLButtonElement>('.paper1-next')!;
    root.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.parentElement?.classList.contains('answered'))return;btn.parentElement?.classList.add('answered');
      const picked=Number(btn.dataset.answer);root.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((candidate,i)=>{if(i===q.correct)candidate.classList.add('correct')});
      if(picked===q.correct){score++;btn.classList.add('correct')}else btn.classList.add('wrong');
      feedback.className=`paper1-answer-feedback ${picked===q.correct?'correct':'wrong'}`;feedback.innerHTML=`<b>${picked===q.correct?'✓ Strong answer.':'Not this one.'}</b><p>${esc(q.why)}</p>`;next.disabled=false;
    }));
    next.addEventListener('click',()=>{if(qIndex<item.questions.length-1){qIndex++;draw();return}const pct=Math.round(score/item.questions.length*100);root.innerHTML=`<div class="paper1-practice-result"><span>PRACTICE COMPLETE</span><div class="paper1-score-ring" style="--paper1-score:${pct}%"><b>${pct}%</b><small>${score} of ${item.questions.length} correct</small></div><h3>${pct===100?'Excellent close-reading control.':pct>=75?'Strong result — review the miss before moving on.':'Useful practice — use the explanations as your next study direction.'}</h3><p>You completed <b>${esc(item.title)}</b>. This score is a practice signal, not an IB grade.</p><div><button type="button" class="btn secondary practice-again">Try this text again</button><button type="button" class="btn primary practice-next-text">Next practice text →</button></div></div>`;root.querySelector<HTMLButtonElement>('.practice-again')?.addEventListener('click',()=>renderPractice(page,index));root.querySelector<HTMLButtonElement>('.practice-next-text')?.addEventListener('click',()=>{const nextIndex=(index+1)%paper1Practices.length;page.querySelector<HTMLButtonElement>(`[data-practice="${nextIndex}"]`)?.click()})});
  };draw();
}

function setGuideActive(page:HTMLElement,id:string){page.querySelectorAll<HTMLButtonElement>('.paper1-guide-nav button[data-scroll]').forEach(btn=>btn.classList.toggle('current',btn.dataset.scroll===id))}

function bind(page:HTMLElement){
  page.querySelectorAll<HTMLElement>('[data-go]').forEach(el=>el.addEventListener('click',()=>{location.hash=el.dataset.go||'home'}));
  page.querySelectorAll<HTMLButtonElement>('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.scroll||'';page.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});setGuideActive(page,id)}));

  page.querySelectorAll<HTMLButtonElement>('[data-approach]').forEach(btn=>btn.addEventListener('click',()=>{const index=Number(btn.dataset.approach);const step=approachSteps[index];page.querySelectorAll('[data-approach]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const detail=page.querySelector<HTMLElement>('.paper1-step-detail');if(detail)detail.innerHTML=`<span>STEP ${String(index+1).padStart(2,'0')}</span><h3>${step[0]}</h3><p>${step[1]}</p><div><b>Mistake to avoid</b><p>${step[2]}</p></div>`}));

  const toneInput=page.querySelector<HTMLInputElement>('[data-tone-search]');toneInput?.addEventListener('input',()=>{const q=toneInput.value.trim().toLowerCase();let visible=0;page.querySelectorAll<HTMLElement>('[data-tone-card]').forEach(card=>{const show=!q||(card.dataset.search||'').includes(q);card.hidden=!show;if(show)visible++});const count=page.querySelector<HTMLElement>('[data-tone-count]');if(count)count.textContent=`${visible} tone word${visible===1?'':'s'}`});

  let choiceCategory='Language';const choiceInput=page.querySelector<HTMLInputElement>('[data-choice-search]');renderChoices(page,choiceCategory);
  page.querySelectorAll<HTMLButtonElement>('[data-choice-tab]').forEach(btn=>btn.addEventListener('click',()=>{choiceCategory=btn.dataset.choiceTab||'Language';page.querySelectorAll('[data-choice-tab]').forEach(x=>x.classList.toggle('active',x===btn));renderChoices(page,choiceCategory,choiceInput?.value||'')}));choiceInput?.addEventListener('input',()=>renderChoices(page,choiceCategory,choiceInput.value));

  page.querySelectorAll<HTMLButtonElement>('[data-analysis-example]').forEach(btn=>btn.addEventListener('click',()=>{const index=Number(btn.dataset.analysisExample);page.querySelectorAll('[data-analysis-example]').forEach(x=>x.classList.toggle('active',x===btn));const root=page.querySelector<HTMLElement>('.paper1-analysis-steps');if(root)root.innerHTML=analysisExamples[index].steps.map((step,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${step}</p></article>`).join('')}));

  page.querySelectorAll<HTMLButtonElement>('[data-practice]').forEach(btn=>btn.addEventListener('click',()=>{const index=Number(btn.dataset.practice);page.querySelectorAll('[data-practice]').forEach(x=>x.classList.toggle('active',x===btn));renderPractice(page,index)}));renderPractice(page,0);

  page.querySelector<HTMLButtonElement>('[data-paper1-complete]')?.addEventListener('click',e=>{const button=e.currentTarget as HTMLButtonElement;const main=document.querySelector<HTMLElement>('main#main');const native=Array.from(main?.children||[]).find(el=>el instanceof HTMLElement&&el.classList.contains('page')&&!el.classList.contains('paper1-guide-page')) as HTMLElement|undefined;const mark=native?.querySelector<HTMLButtonElement>('.completion:not(.ready) .btn.primary');if(mark)mark.click();else{try{const done=JSON.parse(localStorage.getItem('litlabDone')||'[]');if(Array.isArray(done)&&!done.includes('paper-1'))localStorage.setItem('litlabDone',JSON.stringify([...done,'paper-1']))}catch{}}button.textContent='Paper 1 reviewed ✓';button.classList.add('reviewed')});
  try{const done=JSON.parse(localStorage.getItem('litlabDone')||'[]');if(Array.isArray(done)&&done.includes('paper-1')){const b=page.querySelector<HTMLButtonElement>('[data-paper1-complete]');if(b){b.textContent='Paper 1 reviewed ✓';b.classList.add('reviewed')}}}catch{}

  const observers=Array.from(page.querySelectorAll<HTMLElement>('[data-guide-section]'));if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(visible)setGuideActive(page,(visible.target as HTMLElement).id)},{rootMargin:'-175px 0px -60% 0px',threshold:[0,.05]});observers.forEach(x=>io.observe(x))}
}

function syncNavigation(){
  if(route()!=='paper-1')return;document.title='LitLab — Paper 1';
  document.querySelectorAll<HTMLButtonElement>('.topbar nav button').forEach(button=>{const active=(button.textContent||'').trim()==='Papers';button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
}

let mounting=false;
function mount(){
  if(route()!=='paper-1')return;const main=document.querySelector<HTMLElement>('main#main');if(!main||mounting)return;mounting=true;main.classList.add('paper1-guide-main');let page=main.querySelector<HTMLElement>('.paper1-guide-page');if(!page){main.insertAdjacentHTML('beforeend',template());page=main.querySelector<HTMLElement>('.paper1-guide-page')!;bind(page)}syncNavigation();mounting=false;
}
function unmount(){const main=document.querySelector<HTMLElement>('main#main');main?.classList.remove('paper1-guide-main');main?.querySelector('.paper1-guide-page')?.remove()}
function sync(){setTimeout(()=>{if(route()==='paper-1')mount();else unmount()},90)}
const root=document.getElementById('root');if(root)new MutationObserver(()=>{if(route()==='paper-1'&&!document.querySelector('.paper1-guide-page'))mount()}).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',sync);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
