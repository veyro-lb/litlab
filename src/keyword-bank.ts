import { animate } from 'motion';
import './keyword-bank.css';

type KeywordItem={
  term:string;
  definition:string;
  example?:string;
  category:'Authorial choices'|'Analytical verbs'|'Evaluation'|'Transitions'|'Comparison'|'Precise vocabulary';
};

const keywords:KeywordItem[]=[
  {term:'Juxtaposition',definition:'Placing two elements close together so their contrast or relationship becomes meaningful.',example:'Use it when the creator places opposing characters, settings, images or ideas beside each other.',category:'Authorial choices'},
  {term:'Imagery',definition:'Descriptive language or visual detail that creates sensory or imaginative impressions.',example:'Analyse what kind of image is created and what it suggests beyond simply saying “imagery is used”.',category:'Authorial choices'},
  {term:'Symbolism',definition:'Using an object, image, place or action to carry meaning beyond its literal role.',example:'Explain what the symbol comes to represent in this specific text.',category:'Authorial choices'},
  {term:'Diction',definition:'The creator’s choice of words and the associations, tone or emphasis those words produce.',example:'Useful when one word or a pattern of vocabulary is especially important.',category:'Authorial choices'},
  {term:'Syntax',definition:'The arrangement and structure of words, phrases and sentences.',example:'Consider sentence length, order, fragments, interruptions or unusual sentence patterns.',category:'Authorial choices'},
  {term:'Repetition',definition:'The deliberate reuse of a word, phrase, image, sound or structural pattern.',example:'Ask what is being reinforced, intensified or made memorable through the repetition.',category:'Authorial choices'},
  {term:'Contrast',definition:'A clear difference between two elements used to make their qualities or ideas more noticeable.',example:'Useful for analysing opposing characters, moods, values, settings or perspectives.',category:'Authorial choices'},
  {term:'Motif',definition:'A recurring image, object, phrase or idea that develops meaning across a text.',example:'Track how the motif changes or gains significance over time.',category:'Authorial choices'},
  {term:'Metaphor',definition:'A comparison in which one thing is described as another in order to create an association or idea.',example:'Move beyond identifying the metaphor by explaining what the comparison reveals.',category:'Authorial choices'},
  {term:'Simile',definition:'A comparison using words such as “like” or “as”.',example:'Focus on the qualities transferred through the comparison and why they matter.',category:'Authorial choices'},
  {term:'Personification',definition:'Giving human qualities or actions to something non-human.',example:'Consider how this changes the audience’s relationship with the object, place or idea.',category:'Authorial choices'},
  {term:'Irony',definition:'A gap between appearance and reality, expectation and outcome, or literal words and intended meaning.',example:'Explain what the irony exposes, criticises or makes the audience reconsider.',category:'Authorial choices'},
  {term:'Foreshadowing',definition:'A detail that anticipates or hints at something that happens later.',example:'Analyse how it creates expectation, tension or a pattern that becomes meaningful in retrospect.',category:'Authorial choices'},
  {term:'Allusion',definition:'An indirect reference to another text, event, person, myth or cultural idea.',example:'Explain what associations the reference brings into the text.',category:'Authorial choices'},
  {term:'Narrative perspective',definition:'The viewpoint through which a narrative is presented.',example:'Ask what the chosen viewpoint allows the audience to know, question or overlook.',category:'Authorial choices'},
  {term:'Focalisation',definition:'The perspective through which events, thoughts or perceptions are filtered within a narrative.',example:'Useful when the narrator and the character whose perspective shapes the scene are not exactly the same.',category:'Authorial choices'},
  {term:'Characterisation',definition:'The methods used to construct and develop a character.',example:'Look at dialogue, actions, description, relationships, thoughts and contrasts with other characters.',category:'Authorial choices'},
  {term:'Dialogue',definition:'Spoken interaction between characters, including what is said, how it is said and what remains unsaid.',example:'Analyse tone, interruption, silence, power or conflict within the exchange.',category:'Authorial choices'},
  {term:'Pacing',definition:'The speed at which information, events or moments are presented.',example:'Short scenes, long pauses or rapid sequences can change tension and emphasis.',category:'Authorial choices'},
  {term:'Structural shift',definition:'A noticeable change in time, tone, focus, viewpoint, setting or form.',example:'Ask why the shift happens at that exact point and what changes because of it.',category:'Authorial choices'},
  {term:'Semantic field',definition:'A group of words connected by a shared area of meaning.',example:'For example, repeated vocabulary of war, religion, confinement or nature may build a wider pattern.',category:'Authorial choices'},
  {term:'Framing',definition:'The way a subject, image or idea is positioned and bounded for the audience.',example:'Especially useful for visual and multimodal texts: what is included, excluded or emphasised?',category:'Authorial choices'},
  {term:'Composition',definition:'The arrangement of visual elements within an image, page or frame.',example:'Consider balance, placement, scale, direction and visual hierarchy.',category:'Authorial choices'},
  {term:'Typography',definition:'The visual design of written text, including font size, weight, style and placement.',example:'Analyse how typography directs attention, establishes tone or creates hierarchy.',category:'Authorial choices'},

  {term:'Conveys',definition:'Communicates or expresses an idea, feeling or attitude.',example:'“The imagery conveys a sense of confinement.”',category:'Analytical verbs'},
  {term:'Suggests',definition:'Points toward a possible interpretation without making it completely explicit.',example:'Useful when your interpretation is reasonable but not stated directly.',category:'Analytical verbs'},
  {term:'Implies',definition:'Communicates an idea indirectly rather than stating it openly.',example:'Use when meaning is strongly hinted through context or choice.',category:'Analytical verbs'},
  {term:'Emphasises',definition:'Gives extra importance or prominence to an idea or detail.',example:'“The repetition emphasises the speaker’s frustration.”',category:'Analytical verbs'},
  {term:'Reinforces',definition:'Strengthens an idea, pattern or effect that is already present.',example:'Useful when several choices work together toward the same meaning.',category:'Analytical verbs'},
  {term:'Highlights',definition:'Draws attention to a particular detail, contrast or idea.',example:'“The contrast highlights the gap between appearance and reality.”',category:'Analytical verbs'},
  {term:'Establishes',definition:'Creates or sets up an idea, tone, relationship or atmosphere.',example:'Useful near the beginning of a text or moment.',category:'Analytical verbs'},
  {term:'Evokes',definition:'Brings a feeling, image, association or response to mind.',example:'“The sensory imagery evokes discomfort and vulnerability.”',category:'Analytical verbs'},
  {term:'Reveals',definition:'Makes something about a character, relationship, idea or perspective clearer.',example:'Use when a choice exposes information or a deeper implication.',category:'Analytical verbs'},
  {term:'Constructs',definition:'Builds or creates a particular representation through deliberate choices.',example:'“The narrator constructs the city as threatening rather than welcoming.”',category:'Analytical verbs'},
  {term:'Portrays',definition:'Represents a person, group, place or idea in a particular way.',example:'Be specific about how it is portrayed and to what effect.',category:'Analytical verbs'},
  {term:'Positions',definition:'Encourages the audience to view a person, issue or idea from a particular angle.',example:'Especially useful for persuasion, representation and point of view.',category:'Analytical verbs'},
  {term:'Foregrounds',definition:'Makes an element especially prominent or important.',example:'“The opening foregrounds isolation before the conflict begins.”',category:'Analytical verbs'},
  {term:'Intensifies',definition:'Makes an effect, emotion or idea stronger.',example:'Useful for escalation, repetition, pacing or increasingly forceful language.',category:'Analytical verbs'},
  {term:'Undermines',definition:'Weakens, questions or destabilises an idea, claim or impression.',example:'“The ironic ending undermines the character’s earlier confidence.”',category:'Analytical verbs'},
  {term:'Complicates',definition:'Makes an idea less simple by introducing tension, contradiction or another perspective.',example:'A strong alternative to pretending every text has one clear message.',category:'Analytical verbs'},
  {term:'Challenges',definition:'Questions or resists an assumption, value, convention or viewpoint.',example:'Useful when a text pushes against an expected way of thinking.',category:'Analytical verbs'},
  {term:'Critiques',definition:'Examines and exposes problems or limitations in an idea, system or behaviour.',example:'Use only when you can show what is being criticised and how.',category:'Analytical verbs'},
  {term:'Exposes',definition:'Makes a hidden problem, contradiction or truth visible.',example:'“The juxtaposition exposes the hypocrisy of the institution.”',category:'Analytical verbs'},
  {term:'Mirrors',definition:'Reflects or parallels another element, idea or development.',example:'“The setting mirrors the character’s emotional isolation.”',category:'Analytical verbs'},
  {term:'Shapes',definition:'Influences how an idea, character or response develops.',example:'A useful broad verb when a choice contributes to meaning over time.',category:'Analytical verbs'},

  {term:'Effectively',definition:'In a way that successfully achieves a clear intended effect.',example:'Use only when you explain what makes the choice effective.',category:'Evaluation'},
  {term:'Convincingly',definition:'In a way that makes a portrayal, argument or representation believable or persuasive.',example:'“The contrast convincingly presents the relationship as unstable.”',category:'Evaluation'},
  {term:'Successfully',definition:'In a way that achieves the effect or purpose being discussed.',example:'Always support the judgement with analysis rather than using it as empty praise.',category:'Evaluation'},
  {term:'Powerfully',definition:'In a strongly impactful or emotionally forceful way.',example:'Best used when you can identify what creates that power.',category:'Evaluation'},
  {term:'Subtly',definition:'In an indirect, restrained or not immediately obvious way.',example:'Useful for implication, symbolism, irony and quiet shifts in tone.',category:'Evaluation'},
  {term:'Deliberately',definition:'In a way that appears purposeful rather than accidental.',example:'Useful for discussing placement, repetition or structural decisions.',category:'Evaluation'},
  {term:'Strategically',definition:'In a carefully chosen way that serves a particular purpose or effect.',example:'“The writer strategically delays the revelation until the final paragraph.”',category:'Evaluation'},
  {term:'Significantly',definition:'In a way that has important meaning or consequence.',example:'Follow it with the significance: why does this detail matter?',category:'Evaluation'},
  {term:'Ambiguously',definition:'In a way that allows more than one reasonable interpretation.',example:'Useful when the text deliberately avoids a single clear answer.',category:'Evaluation'},
  {term:'Ironically',definition:'In a way that creates or depends on a contradiction between expectation and reality.',example:'Use when the irony itself contributes to your evaluation of the choice.',category:'Evaluation'},

  {term:'Moreover',definition:'Adds another supporting point that develops the same line of argument.',example:'Use to extend an idea, not to introduce a contradiction.',category:'Transitions'},
  {term:'Furthermore',definition:'Adds further evidence or reasoning to the same argument.',example:'Similar to “moreover”; useful when building a cumulative point.',category:'Transitions'},
  {term:'Additionally',definition:'Introduces another related point or piece of evidence.',example:'Useful, but avoid repeating it at the start of every paragraph.',category:'Transitions'},
  {term:'However',definition:'Introduces a contrast, limitation or qualification.',example:'Useful when the next point changes or complicates the previous one.',category:'Transitions'},
  {term:'Nevertheless',definition:'Shows that the next point remains true despite what was just mentioned.',example:'Useful for nuanced arguments rather than simple opposites.',category:'Transitions'},
  {term:'Conversely',definition:'Introduces an opposite or strongly contrasting perspective or situation.',example:'Often useful in comparative writing.',category:'Transitions'},
  {term:'Similarly',definition:'Introduces a comparable idea, method or effect.',example:'Make sure you explain the meaningful similarity instead of only saying both texts are similar.',category:'Transitions'},
  {term:'Likewise',definition:'Shows that a similar point also applies to another example or text.',example:'Useful for concise comparison.',category:'Transitions'},
  {term:'In contrast',definition:'Signals a clear difference between two ideas, choices or texts.',example:'Follow with the specific difference and its significance.',category:'Transitions'},
  {term:'Consequently',definition:'Shows that one idea or choice leads to a result or effect.',example:'Useful for explaining cause-and-effect in analysis.',category:'Transitions'},
  {term:'Therefore',definition:'Introduces a conclusion or consequence based on earlier reasoning.',example:'Use when the logical connection is genuinely supported.',category:'Transitions'},
  {term:'Thus',definition:'A concise way to introduce a result, implication or conclusion.',example:'Useful near the end of a chain of analysis.',category:'Transitions'},
  {term:'Notably',definition:'Signals that a detail deserves particular attention.',example:'“Notably, the tone shifts only after the character is left alone.”',category:'Transitions'},
  {term:'Crucially',definition:'Signals that the next point is especially important to the argument.',example:'Use sparingly so it keeps its emphasis.',category:'Transitions'},
  {term:'Ultimately',definition:'Introduces the final or larger implication of the analysis.',example:'Useful when reconnecting a paragraph to the thesis or wider theme.',category:'Transitions'},

  {term:'Whereas',definition:'Links two contrasting ideas or methods in one sentence.',example:'“Whereas one writer presents power as public performance, the other locates it in private control.”',category:'Comparison'},
  {term:'While',definition:'Can place two ideas side by side to show similarity, contrast or qualification.',example:'Useful for integrated comparison rather than discussing each text separately.',category:'Comparison'},
  {term:'By contrast',definition:'Introduces a meaningful difference from the previous example or text.',example:'Explain how the difference changes meaning, not just what is different.',category:'Comparison'},
  {term:'Unlike',definition:'Directly signals that one text, character or method differs from another.',example:'“Unlike the first narrator, the second openly acknowledges uncertainty.”',category:'Comparison'},
  {term:'Both',definition:'Signals a shared feature between two works or examples.',example:'Follow with how each creator handles that shared idea differently.',category:'Comparison'},
  {term:'In comparison',definition:'Explicitly places the next point in relation to another text or example.',example:'Useful when moving between two works in a comparative paragraph.',category:'Comparison'},
  {term:'On the other hand',definition:'Introduces a contrasting perspective, method or result.',example:'Useful in drafting, though “whereas” or “by contrast” can sometimes create tighter comparison.',category:'Comparison'},
  {term:'In both works',definition:'Signals a shared feature or concern across two studied works.',example:'Follow immediately with the specific shared idea and then compare how each creator develops it.',category:'Comparison'},

  {term:'Nuanced',definition:'Containing subtle differences, complexity or more than one layer of meaning.',example:'Useful when an idea cannot be reduced to a simple positive/negative interpretation.',category:'Precise vocabulary'},
  {term:'Ambivalent',definition:'Showing mixed or conflicting feelings or attitudes.',example:'Useful for characters, narrators or texts that appear both attracted to and critical of something.',category:'Precise vocabulary'},
  {term:'Paradoxical',definition:'Containing an apparent contradiction that may reveal a deeper truth or tension.',example:'Use when two seemingly incompatible ideas exist together.',category:'Precise vocabulary'},
  {term:'Oppressive',definition:'Restricting freedom or creating a sense of control, pressure or domination.',example:'Useful for settings, systems, relationships or atmospheres when supported by evidence.',category:'Precise vocabulary'},
  {term:'Alienating',definition:'Creating distance, exclusion or a sense of not belonging.',example:'Can describe an effect on a character or audience.',category:'Precise vocabulary'},
  {term:'Fragmented',definition:'Broken into disconnected, interrupted or non-linear parts.',example:'Useful for structure, memory, identity, narration or sentence form.',category:'Precise vocabulary'},
  {term:'Cyclical',definition:'Returning to an earlier point, pattern, image or situation.',example:'Useful when the ending echoes the beginning or a pattern repeats.',category:'Precise vocabulary'},
  {term:'Hierarchical',definition:'Organised according to levels of power, status or importance.',example:'Useful when analysing institutions, class, gender or social relationships.',category:'Precise vocabulary'},
  {term:'Marginalised',definition:'Pushed to the edge of a group, society or system and given reduced power or visibility.',example:'Use carefully and support the claim with the text’s representation.',category:'Precise vocabulary'},
  {term:'Conventional',definition:'Following familiar, expected or traditional forms and ideas.',example:'Useful when a text follows established genre or social expectations.',category:'Precise vocabulary'},
  {term:'Subversive',definition:'Challenging, disrupting or overturning established expectations or power structures.',example:'Explain exactly what convention or assumption is being challenged.',category:'Precise vocabulary'},
  {term:'Pervasive',definition:'Spread throughout a text, setting, society or pattern.',example:'“A pervasive sense of surveillance shapes the setting.”',category:'Precise vocabulary'},
  {term:'Implicit',definition:'Suggested or understood without being directly stated.',example:'Useful when meaning comes from implication rather than explicit wording.',category:'Precise vocabulary'},
  {term:'Explicit',definition:'Clearly and directly stated or shown.',example:'Useful for distinguishing direct statements from implied meanings.',category:'Precise vocabulary'},
  {term:'Connotation',definition:'An association or idea suggested by a word beyond its literal dictionary meaning.',example:'Useful when analysing why one word was chosen instead of another.',category:'Precise vocabulary'},
  {term:'Ambiguity',definition:'The presence of more than one possible meaning or interpretation.',example:'Analyse whether the ambiguity creates uncertainty, complexity or tension.',category:'Precise vocabulary'},
  {term:'Tension',definition:'A sense of conflict, pressure, uncertainty or opposition between elements.',example:'Can exist between characters, ideas, tones, expectations or structural patterns.',category:'Precise vocabulary'},
  {term:'Dichotomy',definition:'A division into two strongly contrasting or opposing categories.',example:'Use only when the text genuinely sets up a binary opposition.',category:'Precise vocabulary'},
  {term:'Agency',definition:'The ability of a person or character to make choices and act independently.',example:'Useful when analysing power, control, freedom or constraint.',category:'Precise vocabulary'},
  {term:'Power dynamics',definition:'The way power is distributed, negotiated or challenged within a relationship or group.',example:'More precise than simply writing “there is power”.',category:'Precise vocabulary'},
  {term:'Representation',definition:'The way a person, group, place, event or idea is constructed and presented.',example:'Ask what choices shape that representation and what values it may reflect.',category:'Precise vocabulary'},
  {term:'Conformity',definition:'Behaviour that follows accepted rules, expectations or social norms.',example:'Useful when analysing pressure to fit into a group or system.',category:'Precise vocabulary'},
  {term:'Resistance',definition:'Opposition to control, pressure, authority or expected behaviour.',example:'Can be physical, verbal, symbolic, structural or internal.',category:'Precise vocabulary'},
  {term:'Vulnerability',definition:'A state of being exposed to harm, pressure, uncertainty or emotional risk.',example:'Useful for analysing power relationships and characterisation.',category:'Precise vocabulary'},
  {term:'Isolation',definition:'Separation from other people, groups, places or forms of connection.',example:'Distinguish physical isolation from emotional or social isolation when possible.',category:'Precise vocabulary'},
  {term:'Transformation',definition:'A significant change in character, relationship, identity, perspective or condition.',example:'Track what causes the change and how the creator communicates it.',category:'Precise vocabulary'}
];

const categories=['All','Authorial choices','Analytical verbs','Evaluation','Transitions','Comparison','Precise vocabulary'] as const;
type Category=typeof categories[number];

let mode:'glossary'|'keywords'='glossary';
let query='';
let category:Category='All';
let scheduled=false;

function currentRoute(){return location.hash.slice(1).split('#')[0]||'home'}

function chevron(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function keywordDetail(item:KeywordItem){
  const details=document.createElement('details');
  details.dataset.keyword='true';
  details.innerHTML=`<summary><span><b>${item.term}</b><small>${item.category}</small></span>${chevron()}</summary><p>${item.definition}</p>${item.example?`<em>${item.example}</em>`:''}`;
  return details;
}

function renderKeywordGrid(panel:HTMLElement){
  const grid=panel.querySelector<HTMLElement>('.keyword-grid');
  const count=panel.querySelector<HTMLElement>('.keyword-count');
  if(!grid)return;
  const q=query.trim().toLowerCase();
  const filtered=keywords.filter(item=>(category==='All'||item.category===category)&&(!q||(item.term+' '+item.definition+' '+(item.example||'')+' '+item.category).toLowerCase().includes(q)));
  grid.replaceChildren(...filtered.map(keywordDetail));
  if(count)count.textContent=`${filtered.length} ${filtered.length===1?'word':'words'}`;
  if(!filtered.length){
    const empty=document.createElement('div');
    empty.className='keyword-empty';
    empty.innerHTML='<b>No matching keyword yet.</b><span>Try a broader search or another category.</span>';
    grid.append(empty);
  }
}

function createKeywordPanel(){
  const panel=document.createElement('section');
  panel.className='keyword-panel';
  panel.hidden=true;
  panel.innerHTML=`
    <div class="keyword-intro">
      <div><span class="keyword-eyebrow">Student writing toolkit</span><h2>Keywords for stronger analysis</h2><p>Useful authorial choices, analytical verbs, evaluative language, transitions, comparison phrases and precise vocabulary. These are <b>not required IB words</b> — use them only when they accurately describe your point.</p></div>
      <span class="keyword-count">${keywords.length} words</span>
    </div>
    <div class="glossary-tools keyword-tools">
      <div class="inline-search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" placeholder="Search keywords, verbs, transitions…" aria-label="Search keywords" /></div>
      <div class="filter-chips keyword-filters"></div>
    </div>
    <div class="glossary-grid keyword-grid"></div>`;

  const input=panel.querySelector<HTMLInputElement>('input');
  input?.addEventListener('input',()=>{query=input.value;renderKeywordGrid(panel)});
  const filters=panel.querySelector<HTMLElement>('.keyword-filters');
  categories.forEach(name=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=name;
    button.classList.toggle('active',name===category);
    button.addEventListener('click',()=>{
      category=name;
      filters?.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn===button));
      renderKeywordGrid(panel);
    });
    filters?.append(button);
  });
  renderKeywordGrid(panel);
  return panel;
}

function directChild(page:HTMLElement,className:string){
  return Array.from(page.children).find(el=>el instanceof HTMLElement&&el.classList.contains(className)) as HTMLElement|undefined;
}

function switchMode(page:HTMLElement,next:'glossary'|'keywords'){
  mode=next;
  const tabs=page.querySelector<HTMLElement>('.keyword-mode-tabs');
  const originalTools=directChild(page,'glossary-tools');
  const originalGrid=directChild(page,'glossary-grid');
  const panel=page.querySelector<HTMLElement>(':scope > .keyword-panel');
  if(!tabs||!originalTools||!originalGrid||!panel)return;

  const showKeywords=next==='keywords';
  originalTools.hidden=showKeywords;
  originalGrid.hidden=showKeywords;
  panel.hidden=!showKeywords;
  tabs.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
    const selected=button.dataset.mode===next;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-selected',String(selected));
  });
  if(showKeywords){
    requestAnimationFrame(()=>{
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      void animate(panel,{opacity:[0,1],transform:['translateY(10px)','translateY(0px)']},{duration:.32,ease:'easeOut'});
    });
  }
}

function enhanceGlossary(){
  if(currentRoute()!=='glossary')return;
  const page=Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(el=>directChild(el,'glossary-tools')&&directChild(el,'glossary-grid'));
  if(!page)return;

  let tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  let panel=page.querySelector<HTMLElement>(':scope > .keyword-panel');
  if(!tabs){
    tabs=document.createElement('div');
    tabs.className='keyword-mode-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Glossary reference mode');
    tabs.innerHTML='<button type="button" role="tab" data-mode="glossary">Glossary</button><button type="button" role="tab" data-mode="keywords">Keywords</button>';
    const firstTools=directChild(page,'glossary-tools');
    page.insertBefore(tabs,firstTools||null);
    tabs.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.addEventListener('click',()=>switchMode(page,button.dataset.mode==='keywords'?'keywords':'glossary')));
  }
  if(!panel){
    panel=createKeywordPanel();
    const originalGrid=directChild(page,'glossary-grid');
    if(originalGrid?.nextSibling)page.insertBefore(panel,originalGrid.nextSibling);else page.append(panel);
  }
  switchMode(page,mode);
}

function scheduleEnhance(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhanceGlossary()});
}

const observer=new MutationObserver(scheduleEnhance);
const root=document.getElementById('root');
if(root)observer.observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(scheduleEnhance,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleEnhance,{once:true});else scheduleEnhance();
