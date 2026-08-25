import { animate } from 'motion';
import './skills-lab.css';

type Option={text:string;correct:boolean;why:string};
type QuizQuestion={prompt:string;options:Option[];skill:string};
type AnalysisStage={name:string;question:string;options:Option[];fragment:string;lesson:string};
type AnalysisSample={title:string;focus:string;text:string;stages:AnalysisStage[];model:string};
type ThesisChallenge={prompt:string;context:string;options:Option[];anatomy:string[]};

type SkillProgress={completed:string[];bestScores:Record<string,number>};

const SKILL_KEY='litlabSkillProgress';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const route=()=>location.hash.slice(1).split('#')[0]||'home';

const skillCards=[
  ['analysis','Analysis Lab','Build analysis one thinking move at a time.','6-step reasoning'],
  ['thesis','Thesis Lab','Form focused, arguable and evaluative thesis statements.','3 challenges'],
  ['choices','Authorial Choice Check','Identify choices accurately and connect them to effect.','8 questions'],
  ['evaluation','Evaluation Lab','Practice judging how effectively a choice creates meaning.','6 questions'],
  ['paragraph','Paragraph Builder','Put analytical reasoning into a logical sequence.','2 builds'],
  ['mixed','Mixed Skill Check','Test everything together and find what to review next.','10 questions']
] as const;

const analysisSamples:AnalysisSample[]=[
  {
    title:'The classroom window',
    focus:'Freedom vs obligation',
    text:'At the end of every lesson, Mara paused beside the classroom window. Beyond the glass, the football field shone in late sunlight, while the fluorescent lights above her hummed coldly. She pressed her palm to the pane, then turned back toward the stack of unfinished worksheets.',
    stages:[
      {name:'NOTICE',question:'Which detail gives the strongest starting point for analysis?',fragment:'warm sunlight outside ↔ cold fluorescent light inside',lesson:'Strong analysis often begins with a contrast, pattern, shift or repeated detail rather than a plot fact.',options:[
        {text:'The contrast between the warm sunlight outside and the cold light inside.',correct:true,why:'This notices a deliberate pattern that can create meaning.'},
        {text:'Mara is standing beside a window.',correct:false,why:'That is accurate, but it is mainly a plot observation.'},
        {text:'There are worksheets in the classroom.',correct:false,why:'The worksheets may matter later, but they are not the strongest pattern to begin with.'}
      ]},
      {name:'CHOICE',question:'What authorial choice best describes how that contrast is created?',fragment:'juxtaposition + contrasting imagery',lesson:'Naming the choice precisely gives you a mechanism to analyse.',options:[
        {text:'Juxtaposition and contrasting imagery.',correct:true,why:'The two environments are deliberately placed against each other.'},
        {text:'Rhetorical question.',correct:false,why:'No question is being asked.'},
        {text:'Flashback.',correct:false,why:'The scene stays in the present moment.'}
      ]},
      {name:'EFFECT',question:'What effect does this contrast create?',fragment:'creates a divide between freedom and restriction',lesson:'Effect should describe what the choice actually changes: atmosphere, emphasis, perspective, response or contrast.',options:[
        {text:'It creates a divide between the attractive world outside and the restrictive classroom inside.',correct:true,why:'This explains the immediate effect of the contrast.'},
        {text:'It makes the paragraph longer.',correct:false,why:'Length is not the meaningful effect here.'},
        {text:'It proves Mara hates school.',correct:false,why:'That claim is too absolute for the evidence.'}
      ]},
      {name:'MEANING',question:'Which interpretation is best supported?',fragment:'the glass mirrors Mara’s sense of confinement',lesson:'Interpretation asks what the effect suggests about an idea, character, relationship or situation.',options:[
        {text:'The physical boundary of the window reflects Mara’s feeling that responsibility limits her freedom.',correct:true,why:'This connects setting, action and contrast without overclaiming.'},
        {text:'Mara definitely wants to become a football player.',correct:false,why:'The text does not give enough evidence for that conclusion.'},
        {text:'The fluorescent lights symbolise technology.',correct:false,why:'That interpretation ignores the stronger spatial contrast.'}
      ]},
      {name:'EVALUATION',question:'Which sentence genuinely evaluates the writer’s choice?',fragment:'effectively makes an internal conflict visible',lesson:'Evaluation is a judgment plus a reason. Adding “effectively” alone is not enough.',options:[
        {text:'The contrast is effective because the glass makes Mara’s emotional conflict visible without stating it directly.',correct:true,why:'It judges the choice and explains why it works.'},
        {text:'The writer uses juxtaposition effectively.',correct:false,why:'It uses an evaluative word but does not justify the judgment.'},
        {text:'The imagery is interesting.',correct:false,why:'“Interesting” is vague and gives no analytical reason.'}
      ]},
      {name:'WIDER THEME',question:'What larger idea does the analysis most convincingly support?',fragment:'reinforces freedom versus obligation',lesson:'The wider connection should grow from the close analysis rather than jump to an unrelated theme.',options:[
        {text:'The tension between personal freedom and obligation.',correct:true,why:'This is supported by the contrast, setting and Mara’s action.'},
        {text:'The importance of competitive sport.',correct:false,why:'The field contributes to the image of freedom, but sport is not the main idea.'},
        {text:'Technology is always harmful.',correct:false,why:'That is a broad generalisation not supported by this passage.'}
      ]}
    ],
    model:'By juxtaposing the warm sunlight beyond the window with the cold fluorescent classroom, the writer effectively turns the glass into a visual boundary between freedom and obligation. The contrast externalises Mara’s sense of confinement, suggesting that her responsibilities restrict the autonomy she desires and reinforcing the wider tension between freedom and control.'
  },
  {
    title:'The applause',
    focus:'Belonging vs exclusion',
    text:'“Together, we rise,” the gold slogan announced above the stage. The audience stood to applaud. In the third row, Sami kept his hands beneath his chair and folded the rejection letter into smaller and smaller squares until the paper disappeared inside his fist.',
    stages:[
      {name:'NOTICE',question:'Which pattern is most worth investigating?',fragment:'public unity ↔ private rejection',lesson:'Contradictions often create strong analytical directions.',options:[
        {text:'The public message of unity is placed beside Sami’s private experience of rejection.',correct:true,why:'The contradiction gives you a strong pattern to analyse.'},
        {text:'The slogan is gold.',correct:false,why:'Colour may contribute, but the central contradiction is stronger.'},
        {text:'Sami sits in the third row.',correct:false,why:'That fact alone does not create a useful analytical pattern.'}
      ]},
      {name:'CHOICE',question:'Which authorial choice creates the contradiction most clearly?',fragment:'juxtaposition + situational irony',lesson:'Choose terminology that accurately describes what the text is doing.',options:[
        {text:'Juxtaposition with situational irony.',correct:true,why:'The unity message is contradicted by the experience shown beside it.'},
        {text:'Simile.',correct:false,why:'There is no comparison using “like” or “as”.'},
        {text:'Flashback.',correct:false,why:'The passage stays in one present scene.'}
      ]},
      {name:'EFFECT',question:'What does the repeated folding of the letter do?',fragment:'repetition embodies contained disappointment',lesson:'Physical actions can externalise emotion without directly naming it.',options:[
        {text:'It makes Sami’s attempt to contain and hide his disappointment feel increasingly tense.',correct:true,why:'This explains how repeated action shapes emotional meaning.'},
        {text:'It shows Sami enjoys origami.',correct:false,why:'That ignores the rejection context.'},
        {text:'It makes the audience seem louder.',correct:false,why:'The repeated action mainly develops Sami’s internal response.'}
      ]},
      {name:'MEANING',question:'What does the scene suggest about the institution’s message?',fragment:'questions whether public belonging matches lived experience',lesson:'Good interpretation is arguable and evidence-based, not absolute.',options:[
        {text:'Its language of belonging may be performative when individual experience contradicts it.',correct:true,why:'This is supported by the slogan/rejection contrast without claiming too much.'},
        {text:'Every institution deliberately lies.',correct:false,why:'That is an unsupported universal claim.'},
        {text:'Sami does not understand the slogan.',correct:false,why:'The tension comes from contradiction, not misunderstanding.'}
      ]},
      {name:'EVALUATION',question:'Which evaluation is strongest?',fragment:'effectively exposes contradiction without explaining it outright',lesson:'Evaluate the method by explaining what makes it convincing, subtle or powerful.',options:[
        {text:'The juxtaposition is especially effective because the celebratory slogan remains visible while Sami silently hides evidence of exclusion.',correct:true,why:'It explains why the arrangement communicates the contradiction well.'},
        {text:'The writer successfully uses a slogan.',correct:false,why:'It gives no reason why the use is successful.'},
        {text:'The scene is emotional.',correct:false,why:'That is a reaction rather than evaluation of the creator’s method.'}
      ]},
      {name:'WIDER THEME',question:'Which wider theme best fits this analysis?',fragment:'belonging, exclusion and public ideals',lesson:'Reconnect the close detail to the broader argument.',options:[
        {text:'Belonging, exclusion, and the gap between public ideals and private experience.',correct:true,why:'This theme grows directly from every stage of the analysis.'},
        {text:'Paper folding as creativity.',correct:false,why:'That ignores the social contradiction in the scene.'},
        {text:'Gold as the most important colour.',correct:false,why:'A visual detail is not the broadest idea being developed.'}
      ]}
    ],
    model:'By juxtaposing the gold slogan “Together, we rise” with Sami’s silent handling of a rejection letter, the writer creates situational irony that exposes the gap between public ideals and private experience. The repeated folding of the letter effectively turns disappointment into a controlled physical action, making exclusion visible without direct explanation and developing the wider theme of belonging versus exclusion.'
  }
];

const thesisChallenges:ThesisChallenge[]=[
  {
    prompt:'How does the writer present pressure in the scene?',
    context:'A student repeatedly checks a clock while unfinished work piles around them.',
    options:[
      {text:'The writer uses techniques to show pressure.',correct:false,why:'Too vague: it does not make an arguable claim or identify how pressure is constructed.'},
      {text:'The writer uses repetition and imagery to show that the student feels pressure.',correct:false,why:'Better, but it still mostly identifies choices and restates the idea.'},
      {text:'Through the repeated clock imagery and increasingly fragmented syntax, the writer effectively presents pressure as a force that narrows the student’s ability to think clearly.',correct:true,why:'It gives a focused claim, identifies methods, interprets their meaning and includes supported evaluation.'}
    ],
    anatomy:['Focused idea: pressure narrows the student’s thinking','Authorial choices: repeated clock imagery + fragmented syntax','Evaluation: effectively','Interpretation: pressure becomes psychologically restrictive']
  },
  {
    prompt:'How is authority represented?',
    context:'A principal gives a polished speech while students exchange uneasy glances beneath the stage.',
    options:[
      {text:'Authority is shown in the text.',correct:false,why:'This is a topic, not a thesis.'},
      {text:'The principal is powerful because he gives a speech.',correct:false,why:'This is descriptive and gives little analytical direction.'},
      {text:'By juxtaposing the principal’s polished public language with the students’ silent reactions, the writer convincingly presents authority as dependent on appearance rather than genuine trust.',correct:true,why:'It is arguable, specific, method-based and evaluative.'}
    ],
    anatomy:['Focused idea: authority depends on appearance','Choice: juxtaposition','Evidence direction: polished speech vs silent reactions','Evaluation: convincingly','Interpretation: public confidence hides weak trust']
  },
  {
    prompt:'How does the text explore isolation?',
    context:'A character moves through a crowded station while the narration focuses on muffled sounds and blurred faces.',
    options:[
      {text:'The writer uses imagery, symbolism and diction in a successful way to show isolation.',correct:false,why:'It names several terms but still does not explain what the text suggests about isolation.'},
      {text:'Isolation is a big theme because the character is alone.',correct:false,why:'This is mostly summary and does not explain how meaning is created.'},
      {text:'The writer effectively combines blurred visual imagery with muffled auditory detail to present isolation as emotional disconnection even within a physically crowded space.',correct:true,why:'It makes a precise, arguable interpretation and shows how authorial choices create it.'}
    ],
    anatomy:['Focused idea: isolation can exist inside a crowd','Choices: visual + auditory imagery','Evaluation: effectively combines','Interpretation: physical closeness does not guarantee emotional connection']
  }
];

const choiceQuiz:QuizQuestion[]=[
  {skill:'Authorial choices',prompt:'“The hallway swallowed the final footsteps.” Which choice is most central?',options:[
    {text:'Personification',correct:true,why:'The hallway is given the human/animate action of swallowing.'},
    {text:'Flashback',correct:false,why:'There is no shift to an earlier event.'},
    {text:'Rhetorical question',correct:false,why:'No question is asked.'}
  ]},
  {skill:'Authorial choices',prompt:'A paragraph begins with long flowing sentences, then suddenly changes to: “Stop. Listen.” What matters most?',options:[
    {text:'A structural and syntactical shift',correct:true,why:'The sudden sentence shortening changes pace and emphasis.'},
    {text:'A simile',correct:false,why:'No explicit comparison is used.'},
    {text:'Foreshadowing only',correct:false,why:'The clearest observable choice is the shift in syntax and structure.'}
  ]},
  {skill:'Authorial choices',prompt:'Two images are placed side by side: a spotless advertisement and a littered street beneath it.',options:[
    {text:'Juxtaposition',correct:true,why:'The images are positioned together so their contrast becomes meaningful.'},
    {text:'Alliteration',correct:false,why:'This is not primarily a sound pattern.'},
    {text:'First-person narration',correct:false,why:'Narrative perspective is not the key choice described.'}
  ]},
  {skill:'Authorial choices',prompt:'The phrase “still waiting” appears at the end of four consecutive paragraphs.',options:[
    {text:'Repetition with structural patterning',correct:true,why:'The phrase recurs in the same structural position, building emphasis.'},
    {text:'Hyperbole',correct:false,why:'No deliberate exaggeration is described.'},
    {text:'Dialogue',correct:false,why:'The important feature is recurrence, not speech.'}
  ]},
  {skill:'Authorial choices',prompt:'The narrator knows one character’s thoughts but not anyone else’s.',options:[
    {text:'Limited focalisation / limited perspective',correct:true,why:'Access to consciousness is restricted to one character.'},
    {text:'Omniscient narration',correct:false,why:'An omniscient narrator would have broader access.'},
    {text:'Second-person address',correct:false,why:'There is no “you” address described.'}
  ]},
  {skill:'Authorial choices',prompt:'A poster makes the word “FREE” enormous while the conditions are tiny at the bottom.',options:[
    {text:'Typography and visual hierarchy',correct:true,why:'Scale and placement guide attention and influence interpretation.'},
    {text:'Onomatopoeia',correct:false,why:'This is a visual design choice, not sound imitation.'},
    {text:'Flash-forward',correct:false,why:'No time shift is involved.'}
  ]},
  {skill:'Authorial choices',prompt:'“Cold corridors, closed curtains, clipped conversations.” What pattern is noticeable?',options:[
    {text:'Alliteration and semantic patterning',correct:true,why:'Repeated initial sounds and related diction create a controlled pattern.'},
    {text:'Rhetorical question',correct:false,why:'No question is present.'},
    {text:'Dialogue',correct:false,why:'These are descriptive phrases rather than spoken exchange.'}
  ]},
  {skill:'Authorial choices',prompt:'The scene opens and closes with the same image of an unlocked door, but its meaning changes by the end.',options:[
    {text:'Circular structure / framing',correct:true,why:'The repeated opening/closing image creates structural framing and invites comparison.'},
    {text:'Pun',correct:false,why:'No wordplay is described.'},
    {text:'Direct address',correct:false,why:'The audience is not directly spoken to.'}
  ]}
];

const evaluationQuiz:QuizQuestion[]=[
  {skill:'Evaluation',prompt:'Which sentence contains genuine evaluation?',options:[
    {text:'The writer effectively uses the empty chair because its repeated presence makes absence physically visible.',correct:true,why:'It judges effectiveness and explains why the choice works.'},
    {text:'The writer effectively uses an empty chair.',correct:false,why:'The judgment is unsupported.'},
    {text:'There is an empty chair.',correct:false,why:'This is observation only.'}
  ]},
  {skill:'Evaluation',prompt:'Which evaluation is most precise?',options:[
    {text:'The abrupt sentence break is particularly effective because it interrupts the reader at the same moment the character’s confidence collapses.',correct:true,why:'It connects method, placement, effect and meaning.'},
    {text:'The sentence break is very good.',correct:false,why:'“Very good” gives no analytical reason.'},
    {text:'The writer uses punctuation.',correct:false,why:'This only identifies a feature.'}
  ]},
  {skill:'Evaluation',prompt:'Which sentence avoids overclaiming?',options:[
    {text:'The contrast subtly encourages the reader to question whether the speaker’s confidence is genuine.',correct:true,why:'“Encourages” and “whether” leave room for interpretation.'},
    {text:'The contrast proves the speaker is lying.',correct:false,why:'“Proves” is too absolute for most literary interpretation.'},
    {text:'The contrast is successful because it is contrast.',correct:false,why:'This is circular reasoning.'}
  ]},
  {skill:'Evaluation',prompt:'Which is the strongest evaluative link to theme?',options:[
    {text:'By withholding the character’s name, the writer powerfully broadens the scene from one individual experience into a more universal exploration of invisibility.',correct:true,why:'It evaluates the choice and explains its thematic consequence.'},
    {text:'Not giving a name is effective.',correct:false,why:'It gives no reason for effectiveness.'},
    {text:'The character has no name.',correct:false,why:'This is simply identification.'}
  ]},
  {skill:'Evaluation',prompt:'Which sentence evaluates visual design rather than just describing it?',options:[
    {text:'The oversized headline dominates the page, effectively forcing the promise to be noticed before the small-print limitations.',correct:true,why:'It judges how visual hierarchy shapes attention.'},
    {text:'The headline is large.',correct:false,why:'This is description only.'},
    {text:'The poster uses typography successfully.',correct:false,why:'The evaluation is vague and unsupported.'}
  ]},
  {skill:'Evaluation',prompt:'Why is “effectively” not enough by itself?',options:[
    {text:'Because evaluation needs a reason explaining how or why the choice succeeds.',correct:true,why:'Exactly: judgment must be supported by analysis.'},
    {text:'Because the word “effectively” is never allowed in analytical writing.',correct:false,why:'It can be useful when the judgment is justified.'},
    {text:'Because every sentence must use “powerfully” instead.',correct:false,why:'No single evaluative word is required.'}
  ]}
];

const mixedQuiz:QuizQuestion[]=[
  {skill:'Analysis',prompt:'Which sentence moves furthest beyond summary?',options:[
    {text:'The speaker leaves the room.',correct:false,why:'This reports what happens.'},
    {text:'The writer uses repetition.',correct:false,why:'This identifies a choice but does not analyse it.'},
    {text:'The repeated command narrows the speaker’s language, suggesting that frustration has replaced careful reasoning.',correct:true,why:'It connects choice → effect → interpretation.'}
  ]},
  {skill:'Thesis',prompt:'Which is the strongest thesis?',options:[
    {text:'This text has many techniques about power.',correct:false,why:'Too vague and not arguable.'},
    {text:'By contrasting public certainty with private hesitation, the writer convincingly presents power as unstable and dependent on performance.',correct:true,why:'Specific, arguable, method-based and evaluative.'},
    {text:'Power is a theme in the text.',correct:false,why:'This states a topic rather than a claim.'}
  ]},
  {skill:'Authorial choices',prompt:'Placing a cheerful slogan beside an image of visible hardship is primarily an example of…',options:[
    {text:'Juxtaposition',correct:true,why:'The contrast is created through deliberate placement.'},
    {text:'Onomatopoeia',correct:false,why:'No sound imitation is involved.'},
    {text:'Flashback',correct:false,why:'No time shift occurs.'}
  ]},
  {skill:'Evaluation',prompt:'Which sentence best evaluates a choice?',options:[
    {text:'The writer uses imagery effectively.',correct:false,why:'The judgment has no supporting reason.'},
    {text:'The recurring storm imagery is effective because it turns the character’s anxiety into a pattern the reader can track across the scene.',correct:true,why:'It explains why the choice is effective.'},
    {text:'There is storm imagery.',correct:false,why:'Identification only.'}
  ]},
  {skill:'Analysis',prompt:'What usually comes after identifying an authorial choice?',options:[
    {text:'Explain the effect and what meaning it helps create.',correct:true,why:'This is the analytical move that takes you beyond technique spotting.'},
    {text:'Immediately list another technique.',correct:false,why:'A list does not explain meaning.'},
    {text:'Retell the plot around it.',correct:false,why:'That returns to summary.'}
  ]},
  {skill:'Thesis',prompt:'What makes a thesis arguable?',options:[
    {text:'It makes a specific interpretation that needs evidence and reasoning to prove.',correct:true,why:'An arguable thesis gives the response something to demonstrate.'},
    {text:'It contains at least five technique names.',correct:false,why:'Technique quantity does not create an argument.'},
    {text:'It repeats the essay question word for word.',correct:false,why:'Restating the question is not a claim.'}
  ]},
  {skill:'Authorial choices',prompt:'A sudden move from long sentences to one-word sentences is primarily a change in…',options:[
    {text:'Syntax and pacing',correct:true,why:'Sentence structure changes the rhythm and emphasis.'},
    {text:'Setting only',correct:false,why:'The described change is linguistic/structural.'},
    {text:'Character name',correct:false,why:'Naming is unrelated.'}
  ]},
  {skill:'Evaluation',prompt:'Which evaluative claim is weakest?',options:[
    {text:'The imagery is successful because it is good.',correct:true,why:'This is circular and vague.'},
    {text:'The restrained imagery is effective because it lets the emotional tension emerge without overexplaining it.',correct:false,why:'This gives a supported evaluative judgment.'},
    {text:'The repeated silence becomes increasingly powerful because each recurrence follows a failed attempt at communication.',correct:false,why:'This connects evaluation to pattern and placement.'}
  ]},
  {skill:'Paragraph structure',prompt:'Which sequence best represents analytical reasoning?',options:[
    {text:'Claim → evidence → authorial choice → effect → interpretation → connection/evaluation',correct:true,why:'This keeps the paragraph moving from argument to evidence to meaning.'},
    {text:'Plot summary → plot summary → technique list → conclusion',correct:false,why:'This does not develop analysis.'},
    {text:'Quotation → unrelated context → new topic → technique name',correct:false,why:'The logic is disconnected.'}
  ]},
  {skill:'Analysis',prompt:'Why is “this makes the reader want to read more” usually weak?',options:[
    {text:'It is vague and does not specify the response, meaning or purpose created.',correct:true,why:'Effects should be precise and connected to the text’s argument.'},
    {text:'Because readers are never relevant.',correct:false,why:'Audience response can matter when analysed specifically.'},
    {text:'Because effect should never be discussed.',correct:false,why:'Effect is an important analytical step.'}
  ]}
];

const paragraphChallenges=[
  {
    title:'Pressure and control',
    text:'“The clock clicked again. Twelve minutes. Eleven. Ten. Arun crossed out the same sentence for the fourth time.”',
    pieces:[
      ['claim','The scene presents pressure as something that gradually takes control of Arun’s thinking.'],
      ['evidence','The repeated countdown — “Twelve minutes. Eleven. Ten.” — makes passing time impossible to ignore.'],
      ['choice','Through repetition and increasingly fragmented syntax, the writer compresses the rhythm of the scene.'],
      ['effect','This accelerating rhythm makes the moment feel restrictive and mentally crowded.'],
      ['interpretation','Arun’s repeated crossing-out suggests that the pressure is no longer helping him work; it is interrupting his ability to decide.'],
      ['evaluation','The structural compression is effective because the reader experiences the same narrowing sense of time that Arun does, reinforcing the idea that pressure can reduce rather than improve control.']
    ]
  },
  {
    title:'Belonging and exclusion',
    text:'“Everyone wore the same blue badge. Lina turned hers over so the blank silver back faced outward.”',
    pieces:[
      ['claim','The scene presents belonging as something Lina is expected to display rather than something she genuinely feels.'],
      ['evidence','Although “everyone” wears the blue badge visibly, Lina turns hers so that only its blank reverse can be seen.'],
      ['choice','The writer uses visual contrast and symbolic detail to separate Lina from the group.'],
      ['effect','The hidden colour makes her difference subtle but deliberate.'],
      ['interpretation','Her action suggests resistance to the identity the badge is meant to represent.'],
      ['evaluation','The symbolism is effective because a small physical gesture communicates social distance without requiring Lina to state her feelings directly.']
    ]
  }
] as const;

function loadProgress():SkillProgress{
  try{
    const value=JSON.parse(localStorage.getItem(SKILL_KEY)||'null');
    if(value&&Array.isArray(value.completed)&&typeof value.bestScores==='object')return value;
  }catch{}
  return {completed:[],bestScores:{}};
}

function saveResult(id:string,score:number){
  const progress=loadProgress();
  if(!progress.completed.includes(id))progress.completed.push(id);
  progress.bestScores[id]=Math.max(progress.bestScores[id]||0,score);
  localStorage.setItem(SKILL_KEY,JSON.stringify(progress));
  syncProgressUI();
}

function pageTemplate(){
  return `
  <section class="page skills-lab-page" aria-labelledby="skills-lab-title">
    <header class="skills-hero">
      <div class="skills-hero-copy">
        <span class="skills-eyebrow">✦ LITLAB PRACTICE SPACE</span>
        <h1 id="skills-lab-title">Skills Lab</h1>
        <p>Learn the idea, test it, get feedback, and try again. This is where LitLab turns English concepts into actual practice.</p>
        <div class="skills-hero-tags"><span>Analysis</span><span>Thesis</span><span>Authorial choices</span><span>Evaluation</span><span>Paragraphs</span></div>
      </div>
      <div class="skills-hero-meter" aria-hidden="true"><div class="skills-orbit o1"></div><div class="skills-orbit o2"></div><div class="skills-core"><b>TEST</b><span>YOUR<br/>SKILLS</span></div></div>
    </header>

    <div class="skills-disclaimer"><b>Student practice, not an official IB test.</b><span>The goal is to strengthen transferable analytical thinking. Course-specific assessment instructions still come from your teacher and current IB guidance.</span></div>

    <section class="skills-overview" aria-label="Skills Lab progress">
      <div><span>YOUR PRACTICE PROGRESS</span><h2>Choose a skill to train.</h2><p>Completing a lab means you reviewed the skill — not that you have permanently mastered it.</p></div>
      <div class="skills-progress-summary"><b class="skills-progress-count">0 / 6</b><span>labs reviewed</span><div class="skills-progress-bar"><i></i></div></div>
    </section>

    <nav class="skills-tool-grid" aria-label="Skills Lab tools">
      ${skillCards.map(([id,title,desc,meta],i)=>`<button type="button" class="skills-tool-card" data-tool="${id}"><span class="skills-tool-no">0${i+1}</span><div><b>${title}</b><p>${desc}</p><small>${meta}</small></div><em>→</em></button>`).join('')}
    </nav>

    <section class="skills-workspace" aria-live="polite">
      <div class="skills-workspace-head"><div><span class="skills-current-kicker">CURRENT LAB</span><h2 class="skills-current-title">Analysis Lab</h2></div><button type="button" class="skills-dashboard-btn">All skills</button></div>
      <div class="skills-workspace-body"></div>
    </section>

    <section class="skills-learning-note"><span>★</span><div><b>Use mistakes as data.</b><p>If a question catches you out, read the explanation before continuing. The point of the lab is not to get 100% immediately; it is to understand why one line of reasoning is stronger than another.</p></div></section>
  </section>`;
}

function syncProgressUI(){
  const page=document.querySelector<HTMLElement>('.skills-lab-page');
  if(!page)return;
  const progress=loadProgress();
  const count=skillCards.filter(([id])=>progress.completed.includes(id)).length;
  const countEl=page.querySelector<HTMLElement>('.skills-progress-count');
  const bar=page.querySelector<HTMLElement>('.skills-progress-bar i');
  if(countEl)countEl.textContent=`${count} / ${skillCards.length}`;
  if(bar)bar.style.width=`${Math.round(count/skillCards.length*100)}%`;
  page.querySelectorAll<HTMLButtonElement>('.skills-tool-card').forEach(card=>{
    const id=card.dataset.tool||'';
    card.classList.toggle('reviewed',progress.completed.includes(id));
    const best=progress.bestScores[id];
    const meta=card.querySelector('small');
    if(meta&&typeof best==='number')meta.textContent=`Best: ${best}% • reviewed`;
  });
}

function renderAnalysis(root:HTMLElement){
  let sampleIndex=0;
  let stageIndex=0;
  const solved:string[]=[];

  const render=()=>{
    const sample=analysisSamples[sampleIndex];
    const stage=sample.stages[stageIndex];
    root.innerHTML=`
      <div class="lab-intro"><span>ANALYSIS LAB</span><h3>Build the reasoning, not just the technique list.</h3><p>Move through <b>Notice → Choice → Effect → Meaning → Evaluation → Wider Theme</b>. Each correct move adds to your reasoning chain.</p></div>
      <div class="sample-switch">${analysisSamples.map((s,i)=>`<button type="button" data-sample="${i}" class="${i===sampleIndex?'active':''}">${i+1}. ${s.title}</button>`).join('')}</div>
      <div class="analysis-practice-grid">
        <article class="practice-text"><span>ORIGINAL LITLAB TEXT</span><blockquote>${sample.text}</blockquote><small>Focus: ${sample.focus}</small></article>
        <div class="practice-question">
          <div class="practice-progress"><span>${stage.name}</span><b>${stageIndex+1} / ${sample.stages.length}</b><i style="width:${Math.round((stageIndex+1)/sample.stages.length*100)}%"></i></div>
          <h3>${stage.question}</h3>
          <div class="practice-options">${stage.options.map((o,i)=>`<button type="button" data-option="${i}"><span>${String.fromCharCode(65+i)}</span>${o.text}</button>`).join('')}</div>
          <div class="practice-feedback" aria-live="polite"></div>
          <button type="button" class="btn primary practice-next" disabled>${stageIndex===sample.stages.length-1?'Finish analysis':'Continue →'}</button>
        </div>
      </div>
      <div class="reasoning-chain"><span>YOUR REASONING CHAIN</span><div>${solved.length?solved.map((x,i)=>`<b><small>${i+1}</small>${x}</b>`).join('<em>→</em>'):'<p>Complete the first move to begin building your analysis.</p>'}</div></div>`;

    root.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach(btn=>btn.addEventListener('click',()=>{
      sampleIndex=Number(btn.dataset.sample);stageIndex=0;solved.length=0;render();
    }));

    const feedback=root.querySelector<HTMLElement>('.practice-feedback')!;
    const next=root.querySelector<HTMLButtonElement>('.practice-next')!;
    root.querySelectorAll<HTMLButtonElement>('[data-option]').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.parentElement?.classList.contains('answered'))return;
      const option=stage.options[Number(btn.dataset.option)];
      if(option.correct){
        btn.parentElement?.classList.add('answered');
        btn.classList.add('correct');
        solved.push(stage.fragment);
        feedback.className='practice-feedback correct';
        feedback.innerHTML=`<b>✓ Strong move.</b><p>${option.why}</p><small>${stage.lesson}</small>`;
        next.disabled=false;
      }else{
        btn.classList.add('wrong');
        feedback.className='practice-feedback wrong';
        feedback.innerHTML=`<b>Not quite yet.</b><p>${option.why}</p><small>Try another option before moving on.</small>`;
      }
    }));

    next.addEventListener('click',()=>{
      if(next.disabled)return;
      if(stageIndex<sample.stages.length-1){stageIndex++;render();return;}
      saveResult('analysis',100);
      root.innerHTML=`
        <div class="lab-result success"><span>✓ ANALYSIS BUILT</span><h3>Now compare your reasoning chain with a polished model.</h3><p>${sample.model}</p>
        <div class="result-breakdown"><b>What made it analytical?</b><span>It identified a pattern.</span><span>It named accurate choices.</span><span>It explained effect and meaning.</span><span>It evaluated why the method worked.</span><span>It connected the detail to a wider idea.</span></div>
        <div class="button-row"><button type="button" class="btn secondary retry-analysis">Try again</button><button type="button" class="btn primary next-analysis">Try the other sample →</button></div></div>`;
      root.querySelector<HTMLButtonElement>('.retry-analysis')?.addEventListener('click',()=>{stageIndex=0;solved.length=0;render()});
      root.querySelector<HTMLButtonElement>('.next-analysis')?.addEventListener('click',()=>{sampleIndex=(sampleIndex+1)%analysisSamples.length;stageIndex=0;solved.length=0;render()});
    });
  };
  render();
}

function renderThesis(root:HTMLElement){
  let index=0;
  let correct=0;
  const render=()=>{
    const item=thesisChallenges[index];
    root.innerHTML=`
      <div class="lab-intro"><span>THESIS LAB</span><h3>A thesis is a claim you must prove — not a list of techniques.</h3><p>Look for four things: <b>focused interpretation + authorial choices + evaluation + a clear direction for the argument.</b></p></div>
      <div class="thesis-card"><div class="thesis-prompt"><span>PRACTICE ${index+1} / ${thesisChallenges.length}</span><h3>${item.prompt}</h3><p>${item.context}</p></div>
      <div class="thesis-options">${item.options.map((o,i)=>`<button type="button" data-thesis="${i}"><span>${String.fromCharCode(65+i)}</span><p>${o.text}</p></button>`).join('')}</div>
      <div class="thesis-feedback" aria-live="polite"></div><button type="button" class="btn primary thesis-next" disabled>${index===thesisChallenges.length-1?'See result':'Next thesis →'}</button></div>`;
    const feedback=root.querySelector<HTMLElement>('.thesis-feedback')!;
    const next=root.querySelector<HTMLButtonElement>('.thesis-next')!;
    root.querySelectorAll<HTMLButtonElement>('[data-thesis]').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.parentElement?.classList.contains('answered'))return;
      const option=item.options[Number(btn.dataset.thesis)];
      if(option.correct){correct++;btn.parentElement?.classList.add('answered');btn.classList.add('correct');}
      else btn.classList.add('wrong');
      feedback.className=`thesis-feedback ${option.correct?'correct':'wrong'}`;
      feedback.innerHTML=`<b>${option.correct?'✓ Strong thesis.':'Needs another look.'}</b><p>${option.why}</p>${option.correct?`<div class="thesis-anatomy">${item.anatomy.map(x=>`<span>✓ ${x}</span>`).join('')}</div>`:''}`;
      if(option.correct)next.disabled=false;
    }));
    next.addEventListener('click',()=>{
      if(index<thesisChallenges.length-1){index++;render();return;}
      const score=Math.round(correct/thesisChallenges.length*100);saveResult('thesis',score);
      root.innerHTML=`<div class="lab-result"><span>THESIS LAB COMPLETE</span><h3>${score===100?'Strong thesis instincts.':'Good practice — keep testing specificity.'}</h3><p>A useful thesis usually makes a <b>specific interpretation</b>, identifies the <b>methods</b> that create it, and includes evaluation only when that judgment is supported.</p>
      <div class="thesis-formula"><span>AUTHORIAL CHOICES</span><em>+</em><span>ARGUABLE INTERPRETATION</span><em>+</em><span>SUPPORTED EVALUATION</span><em>=</em><b>STRONG DIRECTION</b></div>
      <button type="button" class="btn primary thesis-restart">Practice again →</button></div>`;
      root.querySelector<HTMLButtonElement>('.thesis-restart')?.addEventListener('click',()=>{index=0;correct=0;render()});
    });
  };
  render();
}

function renderQuiz(root:HTMLElement,title:string,intro:string,questions:QuizQuestion[],id:string){
  let index=0,score=0;
  const weak:Record<string,number>={};
  const render=()=>{
    const q=questions[index];
    root.innerHTML=`<div class="lab-intro"><span>${title.toUpperCase()}</span><h3>${title}</h3><p>${intro}</p></div>
      <div class="quiz-shell"><div class="quiz-meta"><span>Question ${index+1} of ${questions.length}</span><b>${q.skill}</b><i style="width:${Math.round(index/questions.length*100)}%"></i></div><h3>${q.prompt}</h3>
      <div class="practice-options">${q.options.map((o,i)=>`<button type="button" data-quiz="${i}"><span>${String.fromCharCode(65+i)}</span>${o.text}</button>`).join('')}</div>
      <div class="practice-feedback" aria-live="polite"></div><button type="button" class="btn primary quiz-next" disabled>${index===questions.length-1?'See result':'Next →'}</button></div>`;
    const feedback=root.querySelector<HTMLElement>('.practice-feedback')!;
    const next=root.querySelector<HTMLButtonElement>('.quiz-next')!;
    root.querySelectorAll<HTMLButtonElement>('[data-quiz]').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.parentElement?.classList.contains('answered'))return;
      btn.parentElement?.classList.add('answered');
      const chosen=q.options[Number(btn.dataset.quiz)];
      root.querySelectorAll<HTMLButtonElement>('[data-quiz]').forEach((b,i)=>{if(q.options[i].correct)b.classList.add('correct')});
      if(chosen.correct){score++;btn.classList.add('correct')}else{btn.classList.add('wrong');weak[q.skill]=(weak[q.skill]||0)+1}
      feedback.className=`practice-feedback ${chosen.correct?'correct':'wrong'}`;
      feedback.innerHTML=`<b>${chosen.correct?'✓ Correct.':'Not this time.'}</b><p>${chosen.why}</p><small>${chosen.correct?'Explain the reasoning to yourself before continuing.':'Read why the stronger answer works before moving on.'}</small>`;
      next.disabled=false;
    }));
    next.addEventListener('click',()=>{
      if(index<questions.length-1){index++;render();return;}
      const pct=Math.round(score/questions.length*100);saveResult(id,pct);
      const weakest=Object.entries(weak).sort((a,b)=>b[1]-a[1])[0]?.[0];
      root.innerHTML=`<div class="lab-result ${pct>=80?'success':''}"><span>${title.toUpperCase()} COMPLETE</span><div class="score-ring"><b>${pct}%</b><small>${score}/${questions.length}</small></div><h3>${pct>=90?'Excellent understanding.':pct>=70?'Strong base — review the misses.':'Useful result — now you know what to train.'}</h3><p>${weakest?`Your most useful review target from this attempt is <b>${weakest}</b>.`:'You did not show a clear weak area on this attempt.'}</p><button type="button" class="btn primary quiz-restart">Try again →</button></div>`;
      root.querySelector<HTMLButtonElement>('.quiz-restart')?.addEventListener('click',()=>{index=0;score=0;Object.keys(weak).forEach(k=>delete weak[k]);render()});
    });
  };
  render();
}

function shuffle<T>(items:T[]):T[]{
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  return copy;
}

function renderParagraph(root:HTMLElement){
  let challengeIndex=0;
  const render=()=>{
    const challenge=paragraphChallenges[challengeIndex];
    let order=shuffle(challenge.pieces.map((_,i)=>i));
    const draw=()=>{
      const list=root.querySelector<HTMLElement>('.paragraph-sort-list');
      if(!list)return;
      list.innerHTML=order.map((pieceIndex,pos)=>{const [type,text]=challenge.pieces[pieceIndex];return `<div class="paragraph-piece" data-pos="${pos}"><span>${pos+1}</span><div><small>${type}</small><p>${text}</p></div><div class="piece-actions"><button type="button" data-up="${pos}" ${pos===0?'disabled':''} aria-label="Move up">↑</button><button type="button" data-down="${pos}" ${pos===order.length-1?'disabled':''} aria-label="Move down">↓</button></div></div>`}).join('');
      list.querySelectorAll<HTMLButtonElement>('[data-up]').forEach(btn=>btn.addEventListener('click',()=>{const p=Number(btn.dataset.up);[order[p-1],order[p]]=[order[p],order[p-1]];draw()}));
      list.querySelectorAll<HTMLButtonElement>('[data-down]').forEach(btn=>btn.addEventListener('click',()=>{const p=Number(btn.dataset.down);[order[p+1],order[p]]=[order[p],order[p+1]];draw()}));
    };
    root.innerHTML=`<div class="lab-intro"><span>PARAGRAPH BUILDER</span><h3>Structure the reasoning, not a rigid formula.</h3><p>Move the six pieces into the clearest analytical sequence. Different teachers may teach different paragraph labels; this activity focuses on the <b>logic underneath them</b>.</p></div>
      <div class="paragraph-builder"><article class="practice-text"><span>ORIGINAL LITLAB TEXT</span><blockquote>${challenge.text}</blockquote><small>${challenge.title}</small></article><div><div class="paragraph-sort-list"></div><div class="paragraph-check-feedback" aria-live="polite"></div><button type="button" class="btn primary paragraph-check">Check order</button></div></div>`;
    draw();
    root.querySelector<HTMLButtonElement>('.paragraph-check')?.addEventListener('click',()=>{
      const correct=order.every((value,index)=>value===index);
      const feedback=root.querySelector<HTMLElement>('.paragraph-check-feedback')!;
      if(correct){
        feedback.className='paragraph-check-feedback correct';feedback.innerHTML='<b>✓ Clear analytical progression.</b><p>The paragraph moves from claim → evidence → method → effect → interpretation → evaluation/connection.</p>';
        saveResult('paragraph',100);
        const button=root.querySelector<HTMLButtonElement>('.paragraph-check')!;button.textContent=challengeIndex===paragraphChallenges.length-1?'Restart both':'Try second build →';button.onclick=()=>{challengeIndex=(challengeIndex+1)%paragraphChallenges.length;render()};
      }else{
        const firstWrong=order.findIndex((value,index)=>value!==index);
        feedback.className='paragraph-check-feedback wrong';feedback.innerHTML=`<b>Not quite yet.</b><p>Look closely around position ${firstWrong+1}. Ask whether the reader has enough evidence and explanation before the paragraph moves to interpretation or evaluation.</p>`;
      }
    });
  };
  render();
}

function setTool(page:HTMLElement,id:string){
  const body=page.querySelector<HTMLElement>('.skills-workspace-body');
  const title=page.querySelector<HTMLElement>('.skills-current-title');
  if(!body||!title)return;
  const card=skillCards.find(([tool])=>tool===id)||skillCards[0];
  title.textContent=card[1];
  page.querySelectorAll<HTMLButtonElement>('.skills-tool-card').forEach(btn=>btn.classList.toggle('active',btn.dataset.tool===id));
  localStorage.setItem('litlabLastSkill',id);
  if(!reduceMotion())void animate(body,{opacity:[0,1],transform:['translateY(10px)','translateY(0px)']},{duration:.28,ease:[.2,.8,.2,1]});
  if(id==='analysis')renderAnalysis(body);
  else if(id==='thesis')renderThesis(body);
  else if(id==='choices')renderQuiz(body,'Authorial Choice Check','Accuracy matters. Identify the most relevant choice before you explain its effect.',choiceQuiz,'choices');
  else if(id==='evaluation')renderQuiz(body,'Evaluation Lab','A strong evaluation judges how well a choice creates meaning and explains the reason for that judgment.',evaluationQuiz,'evaluation');
  else if(id==='paragraph')renderParagraph(body);
  else renderQuiz(body,'Mixed Skill Check','A ten-question review across analysis, thesis, authorial choices, evaluation and paragraph logic.',mixedQuiz,'mixed');
  page.querySelector('.skills-workspace')?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
}

function syncSkillsNavigation(){
  if(route()!=='skills')return;
  document.title='LitLab — Skills Lab';
  document.querySelectorAll<HTMLButtonElement>('.topbar nav button').forEach(button=>{
    const isSkills=(button.textContent||'').trim()==='Skills Lab';
    button.classList.toggle('active',isSkills);
    if(isSkills)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  document.querySelectorAll<HTMLButtonElement>('.mobile-menu button').forEach(button=>button.classList.toggle('ux-active',(button.textContent||'').trim().startsWith('Skills Lab')));
  const dock=document.querySelector<HTMLElement>('.litlab-route-dock');
  if(dock){
    dock.classList.remove('is-home');
    dock.innerHTML='<div class="route-crumbs"><button type="button" data-skills-home>Home</button><span>›</span><strong>Skills Lab</strong></div><div class="route-actions"><button type="button" class="route-back" data-skills-ee>← Extended Essay</button><button type="button" class="route-next" data-skills-home>Home →</button></div>';
    dock.querySelectorAll<HTMLButtonElement>('[data-skills-home]').forEach(btn=>btn.addEventListener('click',()=>{location.hash='home'}));
    dock.querySelector<HTMLButtonElement>('[data-skills-ee]')?.addEventListener('click',()=>{location.hash='ee'});
  }
}

let mounting=false;
function mountSkillsLab(){
  if(route()!=='skills')return;
  const main=document.querySelector<HTMLElement>('main#main');
  if(!main||mounting)return;
  mounting=true;
  main.classList.add('skills-lab-main');
  let page=main.querySelector<HTMLElement>('.skills-lab-page');
  if(!page){
    main.insertAdjacentHTML('beforeend',pageTemplate());
    page=main.querySelector<HTMLElement>('.skills-lab-page')!;
    if(!reduceMotion())void animate(page,{opacity:[0,1]},{duration:.3,ease:'easeOut'});
    page.querySelectorAll<HTMLButtonElement>('.skills-tool-card').forEach(btn=>btn.addEventListener('click',()=>setTool(page!,btn.dataset.tool||'analysis')));
    page.querySelector<HTMLButtonElement>('.skills-dashboard-btn')?.addEventListener('click',()=>page?.querySelector('.skills-tool-grid')?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth'}));
    const last=localStorage.getItem('litlabLastSkill');
    setTool(page,skillCards.some(([id])=>id===last)?last!:'analysis');
  }
  syncProgressUI();
  syncSkillsNavigation();
  mounting=false;
}

function unmountSkillsLab(){
  const main=document.querySelector<HTMLElement>('main#main');
  main?.classList.remove('skills-lab-main');
  main?.querySelector('.skills-lab-page')?.remove();
}

function patchHomeDiscovery(){
  if(route()!=='home')return;
  document.querySelectorAll<HTMLElement>('.section-head h2').forEach(h=>{if(h.textContent?.trim()==='Five places. One clear map.')h.textContent='Six places. One clear map.'});
  const quick=document.querySelector<HTMLElement>('.quick-strip');
  if(quick&&!Array.from(quick.querySelectorAll('button')).some(b=>b.textContent?.includes('Skills Lab'))){
    const button=document.createElement('button');button.type='button';button.innerHTML='Skills Lab <span aria-hidden="true">→</span>';button.addEventListener('click',()=>{location.hash='skills'});quick.append(button);
  }
}

function syncRoute(){
  setTimeout(()=>{
    if(route()==='skills')mountSkillsLab();else unmountSkillsLab();
    patchHomeDiscovery();
  },90);
}

const observer=new MutationObserver(()=>{
  if(route()==='skills'&&!document.querySelector('.skills-lab-page'))mountSkillsLab();
  if(route()==='home')patchHomeDiscovery();
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{childList:true,subtree:true});syncRoute()},{once:true});
else{observer.observe(document.body,{childList:true,subtree:true});syncRoute()}
window.addEventListener('hashchange',syncRoute);
