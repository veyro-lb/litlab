import './sentence-frames.css';

type FrameCategory='Paragraphs'|'Thesis'|'Introductions'|'Conclusions'|'Comparison'|'IO';
type FrameItem={
  title:string;
  category:FrameCategory;
  purpose:string;
  frame:string;
  example:string;
  tip:string;
  priority?:boolean;
};

const frames:FrameItem[]=[
  {
    title:'PEEL+ analytical paragraph',category:'Paragraphs',priority:true,
    purpose:'Build a complete analytical paragraph without stopping at technique identification.',
    frame:'POINT → EVIDENCE → AUTHORIAL CHOICE → EFFECT → MEANING → EVALUATION → LINK',
    example:'The writer presents isolation as restrictive. This is evident when [brief evidence]. Through [authorial choice], the text creates [effect], suggesting [interpretation]. This is particularly effective because [supported judgment]. Therefore, the moment reinforces the wider argument that [link to thesis/theme].',
    tip:'Treat PEEL as a reasoning chain, not a rigid sentence-count formula. Strong paragraphs can combine steps naturally.'
  },
  {
    title:'Point / analytical claim',category:'Paragraphs',
    purpose:'Start the paragraph with an arguable idea rather than a plot detail.',
    frame:'The writer presents [idea/theme/relationship] as [specific interpretation], particularly through [relevant pattern or choice].',
    example:'The writer presents belonging as conditional, particularly through the contrast between public language of unity and private moments of exclusion.',
    tip:'A strong point should be something the paragraph can prove, not simply “the author uses imagery.”'
  },
  {
    title:'Integrating evidence',category:'Paragraphs',
    purpose:'Blend a short quotation or textual reference into your own sentence.',
    frame:'This is reinforced when [context], as the text describes / states / presents “[short evidence],” which [begin analysis].',
    example:'This is reinforced when the classroom is described as “coldly” lit, a detail that makes the setting feel emotionally restrictive rather than neutral.',
    tip:'Avoid dropping a quotation into the paragraph with no grammatical connection or explanation.'
  },
  {
    title:'Choice → effect',category:'Paragraphs',
    purpose:'Explain what an authorial choice actually does in this specific moment.',
    frame:'By using [choice], the writer [analytical verb] [specific effect], which [shapes/positions/emphasizes] [reader or textual response].',
    example:'By juxtaposing the bright field with the cold classroom, the writer intensifies the contrast between freedom and obligation.',
    tip:'Use a precise effect such as tension, emphasis, intimacy, distance, urgency, contrast, uncertainty, or pace.'
  },
  {
    title:'Effect → meaning',category:'Paragraphs',
    purpose:'Move from what the choice creates to what that effect suggests.',
    frame:'This [effect] suggests that [interpretation], revealing / reinforcing / complicating the idea that [wider meaning].',
    example:'This physical contrast suggests that freedom feels visible but inaccessible to Mara, reinforcing the idea that obligation can operate as a form of confinement.',
    tip:'Effect is what the choice creates; meaning is the interpretation you build from that effect.'
  },
  {
    title:'Evaluation sentence',category:'Paragraphs',
    purpose:'Make a supported judgment instead of simply adding the word “effectively.”',
    frame:'This choice is particularly effective / significant because [specific reason], allowing the writer to [larger analytical consequence].',
    example:'The juxtaposition is particularly effective because the physical barrier makes Mara’s internal conflict visible, allowing the theme of obligation to emerge through the setting itself.',
    tip:'Your judgment needs a reason. “The author effectively uses imagery” is not evaluation by itself.'
  },
  {
    title:'Link back to the argument',category:'Paragraphs',
    purpose:'End the paragraph by showing why the analysis matters to the thesis.',
    frame:'Ultimately, this reinforces / complicates the argument that [return to thesis], because [what this paragraph has now shown].',
    example:'Ultimately, this reinforces the argument that institutional pressure shapes identity by turning ordinary spaces into reminders of restriction.',
    tip:'Do not just repeat your topic sentence. Show what the paragraph has added to the argument.'
  },
  {
    title:'Analytical thesis',category:'Thesis',priority:true,
    purpose:'Create a thesis with choices, interpretation, and an evaluative direction.',
    frame:'Through [choice 1], [choice 2], and [choice 3 if useful], the writer effectively presents [central idea/theme] as [arguable interpretation], revealing [larger significance].',
    example:'Through juxtaposition, imagery, and symbolism, the writer effectively presents power as a force that shapes both individual identity and relationships, revealing how control can become internalized.',
    tip:'Do not turn the thesis into a technique list. Every choice should support the same larger argument.'
  },
  {
    title:'Paper 1 thesis',category:'Thesis',
    purpose:'Answer an unseen-text question with a clear analytical direction.',
    frame:'By combining [major choices], the text [evaluative verb] constructs [focus from the question] as [interpretation], ultimately [wider purpose/significance].',
    example:'By combining direct address, visual contrast, and urgent diction, the advertisement convincingly constructs environmental responsibility as a personal obligation, pressuring the audience to see inaction as a moral choice.',
    tip:'Build the thesis around the question’s focus, not around every technique you noticed while annotating.'
  },
  {
    title:'Paper 2 comparative thesis',category:'Thesis',
    purpose:'Make one argument that keeps both works in conversation.',
    frame:'Although both [Work A] and [Work B] explore [shared concern], [creator A] presents it as [interpretation A] through [method], whereas [creator B] uses [method] to present it as [interpretation B], revealing [comparative significance].',
    example:'Although both works explore belonging, one presents exclusion through visible institutional barriers, whereas the other locates it within intimate relationships, revealing different ways social pressure shapes identity.',
    tip:'The comparison should already exist inside the thesis; avoid writing two unrelated mini-theses.'
  },
  {
    title:'Paper 1 introduction',category:'Introductions',priority:true,
    purpose:'Open efficiently, establish the text situation, and move quickly to your argument.',
    frame:'[Text type / situation] addresses [audience/context if relevant] in order to [broad purpose]. Through [main choices], the writer [evaluative analytical claim answering the question].',
    example:'The campaign poster addresses young consumers by framing everyday purchasing as an ethical decision. Through direct address, visual contrast, and imperative language, it effectively turns environmental responsibility into a personal and immediate obligation.',
    tip:'Skip huge universal openings such as “Since the beginning of time…” Start with the actual text and question.'
  },
  {
    title:'Paper 2 introduction',category:'Introductions',
    purpose:'Introduce both works and establish the comparative argument without summarizing their plots.',
    frame:'[Work A] by [creator] and [Work B] by [creator] both examine [question focus]. While both [shared direction], they differ in [important comparative distinction]. Ultimately, [comparative thesis].',
    example:'Both works examine the pressures surrounding identity. While each depicts belonging as unstable, they differ in where that instability comes from: one emphasizes institutional control, while the other focuses on family expectations. Ultimately, these differences reveal…',
    tip:'Only include context that helps answer the question. Plot summary belongs nowhere in the introduction unless a tiny detail is essential.'
  },
  {
    title:'General analytical introduction',category:'Introductions',
    purpose:'Move from a focused context sentence into a precise thesis.',
    frame:'In [text/work], [creator] explores [specific issue]. Rather than presenting it as [simple view], the text constructs it as [more precise interpretation]. Through [major choices], [thesis].',
    example:'In the text, the writer explores the relationship between ambition and pressure. Rather than presenting ambition as purely positive, the text constructs it as increasingly restrictive. Through fragmented syntax and recurring clock imagery, the writer…',
    tip:'An introduction should orient the reader and establish your argument; it does not need to preview every paragraph mechanically.'
  },
  {
    title:'Analytical conclusion',category:'Conclusions',priority:true,
    purpose:'Synthesize the argument instead of repeating the thesis word-for-word.',
    frame:'Ultimately, the text presents [central idea] as [refined interpretation]. By combining [most important methods/patterns], the writer [final evaluative judgment], showing that [larger significance].',
    example:'Ultimately, the text presents pressure as something that gradually becomes internal rather than remaining an external demand. By combining recurring clock imagery with increasingly fragmented syntax, the writer convincingly shows how expectations can reshape the way an individual thinks and acts.',
    tip:'Do not introduce brand-new evidence in the conclusion. Show what your analysis has demonstrated overall.'
  },
  {
    title:'Paper 2 comparative conclusion',category:'Conclusions',
    purpose:'Finish by explaining what the comparison reveals across both works.',
    frame:'Taken together, both works suggest [shared conclusion], yet their different use of [method / perspective / structure] reveals [important distinction]. This makes the comparison significant because [larger insight].',
    example:'Taken together, both works suggest that belonging can become a form of control, yet their different use of setting reveals whether that pressure is presented as public or intimate. The comparison therefore exposes how similar social forces can operate through very different experiences.',
    tip:'Synthesize the relationship between the works; do not simply summarize Paragraph 1, Paragraph 2, Paragraph 3.'
  },
  {
    title:'Integrated similarity',category:'Comparison',
    purpose:'Compare both works inside the same line of reasoning.',
    frame:'Both [Work A] and [Work B] present [shared idea]; however / specifically, [creator A] uses [choice] to [effect], while [creator B] similarly uses [choice] to [effect], emphasizing [comparative meaning].',
    example:'Both works present authority as restrictive: one uses enclosed settings to create physical confinement, while the other uses repeated interruptions in dialogue to make control visible within relationships.',
    tip:'“Both texts show power” is only the starting observation. Explain how and why the similarity matters.'
  },
  {
    title:'Integrated contrast',category:'Comparison',
    purpose:'Show a meaningful difference and explain its significance.',
    frame:'Whereas [Work A] uses [choice] to present [idea] as [interpretation], [Work B] relies on [different choice] to construct it as [different interpretation], suggesting [why the difference matters].',
    example:'Whereas the first work uses public settings to present authority as visible and institutional, the second relies on private dialogue to construct control as intimate and difficult to escape.',
    tip:'A difference becomes analytical only when you explain what changes because of it.'
  },
  {
    title:'Qualification / nuance',category:'Comparison',
    purpose:'Avoid absolute claims when the evidence is more complicated.',
    frame:'Although [main claim] is largely true, [qualification / exception] complicates this view by [reason], suggesting that [more nuanced interpretation].',
    example:'Although both works largely present isolation as damaging, moments of voluntary solitude complicate this view by showing that distance can also create independence.',
    tip:'Nuance is useful when it grows from evidence; do not force a counterargument into every paragraph.'
  },
  {
    title:'IO extract → global issue',category:'IO',
    purpose:'Connect close analysis of the extract directly to the global issue.',
    frame:'Through [authorial choice], the extract presents [specific moment/relationship] as [interpretation]. This connects to the global issue of [focused GI] because [clear reasoning].',
    example:'Through repeated interruptions, the extract presents the speaker’s voice as continually restricted. This connects to the global issue of institutional pressure on individual identity because control is shown operating through everyday communication.',
    tip:'Do not mention the global issue as a separate label at the end; make the analytical connection explicit.'
  },
  {
    title:'IO wider-work connection',category:'IO',
    purpose:'Move from the extract to a meaningful pattern elsewhere in the work.',
    frame:'This pattern extends beyond the extract. Elsewhere in the work, [brief moment/pattern] similarly / differently [analytical connection], showing that [development of GI or wider meaning].',
    example:'This pattern extends beyond the extract. Later, the same pressure appears through the character’s self-censorship, showing that the external restriction has gradually become internalized.',
    tip:'Use the wider work to deepen the pattern, not simply to prove that you remember another scene.'
  }
];

const categories=['All','Paragraphs','Thesis','Introductions','Conclusions','Comparison','IO'] as const;
const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';
let scheduled=false;

function directChild(page:HTMLElement,className:string){
  return Array.from(page.children).find(el=>el instanceof HTMLElement&&el.classList.contains(className)) as HTMLElement|undefined;
}

function toolkitPage(){
  if(currentRoute()!=='glossary')return null;
  return Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(page=>directChild(page,'glossary-tools')&&directChild(page,'glossary-grid'))||null;
}

function chevron(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function copyIcon(){
  return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.8"/></svg>';
}

async function copyText(text:string,button:HTMLButtonElement){
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
    else{
      const area=document.createElement('textarea');
      area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();document.execCommand('copy');area.remove();
    }
    const old=button.innerHTML;
    button.textContent='Copied';
    button.classList.add('copied');
    setTimeout(()=>{button.innerHTML=old;button.classList.remove('copied')},1200);
  }catch{
    button.textContent='Copy failed';
    setTimeout(()=>{button.innerHTML=`${copyIcon()} Copy frame`},1200);
  }
}

function frameCard(item:FrameItem){
  const details=document.createElement('details');
  details.className='sentence-frame-card';
  details.dataset.frameCategory=item.category;
  details.dataset.frameSearch=(item.title+' '+item.category+' '+item.purpose+' '+item.frame+' '+item.example+' '+item.tip).toLowerCase();
  details.innerHTML=`
    <summary>
      <span class="sentence-frame-title"><small>${item.category}${item.priority?' · MOST USEFUL':''}</small><b>${item.title}</b><em>${item.purpose}</em></span>
      <span class="sentence-frame-chevron">${chevron()}</span>
    </summary>
    <div class="sentence-frame-body">
      <div class="sentence-frame-block frame-template">
        <div class="sentence-frame-block-head"><span>REUSABLE FRAME</span><button type="button" class="sentence-copy">${copyIcon()} Copy frame</button></div>
        <p>${item.frame}</p>
      </div>
      <div class="sentence-frame-block frame-example"><span>STRONGER EXAMPLE</span><p>${item.example}</p></div>
      <div class="sentence-frame-tip"><b>LitLab tip</b><p>${item.tip}</p></div>
    </div>`;
  const copy=details.querySelector<HTMLButtonElement>('.sentence-copy');
  copy?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();void copyText(item.frame,copy)});
  return details;
}

function createPanel(){
  const panel=document.createElement('section');
  panel.className='sentence-frame-panel';
  panel.hidden=true;
  panel.innerHTML=`
    <div class="sentence-frame-intro">
      <div>
        <span>SENTENCE SCAFFOLDS</span>
        <h2>Sentence Frames</h2>
        <p>Use these as <b>starting structures</b> for analytical writing. Adapt the wording to your text and argument instead of copying a frame mechanically.</p>
      </div>
      <strong>${frames.length} frames</strong>
    </div>
    <div class="sentence-priority">
      <span>START WITH THE ESSENTIALS</span>
      <div class="sentence-priority-grid"></div>
    </div>
    <div class="sentence-frame-tools">
      <label class="sentence-frame-search"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" placeholder="Search PEEL, thesis, introduction, conclusion…" aria-label="Search sentence frames" /></label>
      <div class="sentence-frame-filters" aria-label="Sentence frame groups"></div>
    </div>
    <div class="sentence-frame-grid"></div>
    <div class="sentence-frame-reminder"><b>Remember:</b> A frame helps organize your reasoning. Your evidence, interpretation, and evaluation still need to be specific to the text and question.</div>`;

  const grid=panel.querySelector<HTMLElement>('.sentence-frame-grid')!;
  frames.forEach(item=>grid.append(frameCard(item)));

  const priorityGrid=panel.querySelector<HTMLElement>('.sentence-priority-grid')!;
  frames.filter(item=>item.priority).forEach(item=>{
    const button=document.createElement('button');
    button.type='button';
    button.innerHTML=`<small>${item.category}</small><b>${item.title}</b><span>Open frame →</span>`;
    button.addEventListener('click',()=>{
      const target=Array.from(grid.querySelectorAll<HTMLDetailsElement>('.sentence-frame-card')).find(card=>card.querySelector('summary b')?.textContent===item.title);
      if(target){target.hidden=false;target.open=true;target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})}
    });
    priorityGrid.append(button);
  });

  const filters=panel.querySelector<HTMLElement>('.sentence-frame-filters')!;
  const input=panel.querySelector<HTMLInputElement>('input')!;
  let category='All';
  let query='';

  const apply=()=>{
    let visible=0;
    grid.querySelectorAll<HTMLDetailsElement>('.sentence-frame-card').forEach(card=>{
      const categoryMatch=category==='All'||card.dataset.frameCategory===category;
      const searchMatch=!query||card.dataset.frameSearch?.includes(query);
      card.hidden=!(categoryMatch&&searchMatch);
      if(!card.hidden)visible++;
    });
    let empty=grid.querySelector<HTMLElement>('.sentence-frame-empty');
    if(!visible){
      if(!empty){empty=document.createElement('div');empty.className='sentence-frame-empty';empty.innerHTML='<b>No matching frame.</b><span>Try a broader search or another category.</span>';grid.append(empty)}
    }else empty?.remove();
  };

  categories.forEach(name=>{
    const button=document.createElement('button');
    button.type='button';button.textContent=name;button.classList.toggle('active',name==='All');
    button.addEventListener('click',()=>{category=name;filters.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn===button));apply()});
    filters.append(button);
  });
  input.addEventListener('input',()=>{query=input.value.trim().toLowerCase();apply()});
  return panel;
}

function chooserCard(){
  const button=document.createElement('button');
  button.type='button';
  button.className='toolkit-choice';
  button.dataset.toolkitMode='frames';
  button.innerHTML='<span class="toolkit-choice-icon" aria-hidden="true">¶</span><span class="toolkit-choice-copy"><small>BUILD THE SENTENCE</small><b>Sentence Frames</b><em>PEEL paragraphs, thesis statements, introductions, conclusions, comparison and IO links.</em></span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return button;
}

function enhance(){
  const page=toolkitPage();
  if(!page)return;
  const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  if(!tabs){setTimeout(schedule,50);return}

  if(!tabs.querySelector('button[data-mode="frames"]')){
    const button=document.createElement('button');
    button.type='button';button.setAttribute('role','tab');button.dataset.mode='frames';button.textContent='Sentence Frames';
    tabs.append(button);
  }

  if(!page.querySelector(':scope > .sentence-frame-panel'))page.append(createPanel());

  const chooserGrid=page.querySelector<HTMLElement>(':scope > .toolkit-chooser .toolkit-choice-grid');
  if(chooserGrid&&!chooserGrid.querySelector('[data-toolkit-mode="frames"]'))chooserGrid.append(chooserCard());
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}

const root=document.getElementById('root');
if(root)new MutationObserver(()=>{if(currentRoute()==='glossary')schedule()}).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,100));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
