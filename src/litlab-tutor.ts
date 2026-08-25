import './litlab-tutor.css';

type TutorMode='ask'|'explain'|'practice';
type TutorAction={label:string;route:string;skill?:string;toolkitMode?:'glossary'|'keywords'|'commands'};
type TutorReply={text:string;actions?:TutorAction[];suggestions?:string[]};
type KnowledgeItem={keywords:string[];reply:TutorReply};
type PracticeItem={question:string;options:string[];correct:number;explanation:string;review?:TutorAction};

const ROUTES:Record<string,string>={
  home:'Home',start:'Start Here',papers:'Papers','paper-1':'Paper 1','paper-2':'Paper 2',
  io:'Individual Oral',books:'Books',ee:'Extended Essay',skills:'Skills Lab',glossary:'Toolkit',about:'About / CAS'
};

const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';
const routeLabel=()=>ROUTES[currentRoute()]||'LitLab';
const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9\s'-]/g,' ').replace(/\s+/g,' ').trim();
const words=(value:string)=>new Set(normalize(value).split(' ').filter(Boolean));
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const knowledge:KnowledgeItem[]=[
  {keywords:['hi','hello','hey','sup'],reply:{text:'Hi! I’m the LitLab Tutor. Ask me about Paper 1, Paper 2, the IO, books, the EE, analysis, thesis writing, evaluation, authorial choices, or where to practice.',suggestions:['How do I stop summarizing?','Help me write a thesis','What should I practice?']}},
  {keywords:['what is litlab','litlab','website help','where am i'],reply:{text:'LitLab is a student-made DP English companion. Use the guides to learn, Skills Lab to practice, and Toolkit to check terminology, writing vocabulary, and command terms.',actions:[{label:'Open Start Here',route:'start'},{label:'Open Skills Lab',route:'skills'},{label:'Open Toolkit',route:'glossary'}]}},
  {keywords:['paper 1','paper one','unseen text','unseen'],reply:{text:'Paper 1 is about analyzing how a text creates meaning. A useful LitLab approach is: understand the situation, notice patterns, identify precise authorial choices, explain their effect, interpret the meaning, evaluate why the choice works, then connect it to your argument. Avoid turning the response into summary or a list of techniques.',actions:[{label:'Open Paper 1',route:'paper-1'},{label:'Practice analysis',route:'skills',skill:'analysis'}],suggestions:['How do I annotate?','How do I write a Paper 1 thesis?','What is evaluation?']}},
  {keywords:['paper 2','paper two','comparative essay','comparison essay'],reply:{text:'Paper 2 is comparative. The goal is not to write one mini essay on Work A and another on Work B. Build one argument that keeps the works in conversation: shared idea → different or similar authorial choices → effect → meaning → why the comparison matters.',actions:[{label:'Open Paper 2',route:'paper-2'},{label:'Practice comparison',route:'skills',skill:'mixed'}],suggestions:['How do I compare properly?','How do I memorize for Paper 2?','Help with a comparative thesis']}},
  {keywords:['individual oral','io','oral','global issue'],reply:{text:'For the IO, keep linking close analysis to the wider work and the global issue. A useful reasoning chain is: authorial choice → effect → meaning → global issue → wider significance. Prepare ideas and structure, but avoid sounding like you memorized a script word-for-word.',actions:[{label:'Open IO guide',route:'io'}],suggestions:['What makes a focused global issue?','How do I sound natural in the IO?','How do I connect to the wider work?']}},
  {keywords:['extended essay','ee','research question','rq'],reply:{text:'For an English EE, a strong research question should be focused enough to analyze deeply and should invite an argument, not just description. LitLab’s RQ Lab moves from broad → narrower → focused → analytical. Exact current EE requirements should always be checked against current IB guidance and your supervisor.',actions:[{label:'Open EE guide',route:'ee'}],suggestions:['How do I narrow a research question?','What makes an EE analytical?']}},
  {keywords:['book','books','novel','work','works'],reply:{text:'Use the Books section to build a useful study record for each work: important characters, themes, motifs, symbols, structure, authorial choices, key moments, and connections to other works. For Paper 2, remember arguments and significant moments rather than memorizing entire essays.',actions:[{label:'Open Books',route:'books'}]}},
  {keywords:['analysis','analyze','analyzing','how to analyze','analysis ladder'],reply:{text:'A strong LitLab analysis chain is: NOTICE what stands out → NAME the authorial choice → explain the EFFECT → interpret the MEANING → EVALUATE why the choice is effective or significant → CONNECT it to the wider idea or argument. Technique identification is only one step.',actions:[{label:'Open Start Here',route:'start'},{label:'Open Analysis Lab',route:'skills',skill:'analysis'}],suggestions:['What is the difference between effect and meaning?','Give me an analysis practice question','How do I stop summarizing?']}},
  {keywords:['summary','summarizing','stop summarizing','summary vs analysis'],reply:{text:'Summary tells me what happens. Analysis explains how a creator’s choices produce meaning. A quick test: if your sentence could be written without mentioning a choice, effect, or interpretation, it may still be summary. Ask: “Why did this detail stand out, how was it created, and what does it suggest?”',actions:[{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}]}},
  {keywords:['authorial choice','authorial choices','technique','techniques','literary device','device'],reply:{text:'An authorial choice is any meaningful decision in how a text is constructed: diction, imagery, syntax, structure, perspective, characterization, juxtaposition, repetition, framing, typography, and more. Name the choice precisely, then explain what it does in this specific text.',actions:[{label:'Authorial Choice Check',route:'skills',skill:'choices'},{label:'Open Toolkit',route:'glossary',toolkitMode:'glossary'}]}},
  {keywords:['evaluation','evaluate','effectively','effective','successful','successfully'],reply:{text:'Evaluation is a supported judgment, not just adding “effectively.” Weak: “The writer effectively uses imagery.” Stronger: “The writer effectively uses the recurring window imagery because the physical barrier makes Mara’s conflict between freedom and obligation visible.” The judgment must be justified by analysis.',actions:[{label:'Open Evaluation Lab',route:'skills',skill:'evaluation'}],suggestions:['What is the difference between effect and evaluation?','Help me improve an evaluation sentence']}},
  {keywords:['effect vs meaning','effect and meaning','difference effect meaning'],reply:{text:'Effect is what a choice creates or changes for the reader/text: emphasis, tension, contrast, pace, distance, intimacy, uncertainty. Meaning is the interpretation that follows: what the effect suggests about a character, relationship, theme, value, or idea. Strong analysis connects both.'}},
  {keywords:['thesis','thesis statement','argument','main argument'],reply:{text:'A strong thesis gives the essay a debatable direction. Aim to combine the creator’s important choices, the central idea/theme, and an evaluative judgment that you can prove. Avoid a thesis that only lists techniques. Example structure: “Through X and Y, the writer effectively presents Z as…, revealing…”',actions:[{label:'Open Thesis Lab',route:'skills',skill:'thesis'}],suggestions:['What makes a thesis evaluative?','Show me a weak vs strong thesis']}},
  {keywords:['paragraph','paragraph structure','analytical paragraph','pee','peel'],reply:{text:'Focus on the logic underneath any paragraph acronym: Claim → Evidence/reference → Authorial choice → Effect → Interpretation → Evaluation → Connection to the argument. You do not need to force every paragraph into identical sentence counts.',actions:[{label:'Open Paragraph Builder',route:'skills',skill:'paragraph'}]}},
  {keywords:['annotate','annotation','annotating'],reply:{text:'Annotate selectively. Mark patterns, contrasts, shifts, repeated images/words, unusual syntax, tone changes, and details that connect to audience or purpose. Then group those annotations into 2–4 larger ideas. Highlighting everything gives you no hierarchy.',actions:[{label:'Open Paper 1',route:'paper-1'}]}},
  {keywords:['audience'],reply:{text:'Audience is who the text is addressing or positioning. Don’t stop at naming the audience. Ask how diction, tone, structure, visuals, pronouns, or appeals are shaped for that audience and what response the creator encourages.'}},
  {keywords:['purpose'],reply:{text:'Purpose is what the text is trying to achieve: persuade, criticize, inform, challenge, celebrate, expose, reassure, entertain, and so on. Treat purpose as something you prove through authorial choices, not a label you guess once and forget.'}},
  {keywords:['tone'],reply:{text:'Tone is the attitude created by the text’s language and presentation. Be precise: reflective, skeptical, restrained, accusatory, celebratory, ironic, urgent, detached, nostalgic, confrontational, etc. Then identify which choices create that tone and why the tone matters.',actions:[{label:'Open Toolkit',route:'glossary',toolkitMode:'keywords'}]}},
  {keywords:['juxtaposition'],reply:{text:'Juxtaposition places contrasting elements close together so their relationship becomes meaningful. Analyze what is being contrasted, what tension or contradiction becomes visible, and how that supports the wider idea. Don’t stop at “this creates contrast.”',actions:[{label:'Open Toolkit',route:'glossary',toolkitMode:'keywords'}]}},
  {keywords:['imagery'],reply:{text:'Imagery creates sensory or visual impressions. Instead of saying “the author uses imagery,” describe the image, explain the impression it creates, interpret what that impression suggests, and connect it to the wider argument.',actions:[{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}]}},
  {keywords:['symbolism','symbol'],reply:{text:'Symbolism gives an object, image, place, or action meaning beyond its literal role. The important question is not “what is the symbol?” but “how does its meaning develop in this specific text, and why is that useful to the argument?”'}},
  {keywords:['diction','word choice'],reply:{text:'Diction means word choice. Analyze the connotations or pattern created by specific words rather than saying “good diction.” Look for semantic fields, levels of formality, loaded language, pronouns, verbs, adjectives, and repeated vocabulary.'}},
  {keywords:['syntax','sentence structure'],reply:{text:'Syntax is how words, phrases, and sentences are arranged. Sentence length, fragments, interruptions, parallel structures, unusual order, and punctuation can affect pace, emphasis, tension, control, or voice.'}},
  {keywords:['compare','comparison','how to compare','comparative'],reply:{text:'Strong comparison puts both works inside the same analytical sentence or paragraph. Move beyond “both show power.” Ask: how do both creators construct power, where do their methods differ, and what does that difference reveal?',actions:[{label:'Open Paper 2',route:'paper-2'}]}},
  {keywords:['contrast'],reply:{text:'Contrast focuses on meaningful difference. Explain not only what is different, but how the different method, perspective, structure, or outcome changes the meaning. Difference without significance is still just observation.'}},
  {keywords:['command terms','command term','analyze compare evaluate','question word'],reply:{text:'Command terms tell you the kind of thinking a task expects. For example: Analyze = break down how choices create meaning; Compare = develop meaningful similarities; Contrast = meaningful differences; Evaluate = make a supported judgment. Always answer the exact focus of the question too.',actions:[{label:'Open Command Terms',route:'glossary',toolkitMode:'commands'}]}},
  {keywords:['keywords','better vocabulary','analytical verbs','transitions','vocabulary'],reply:{text:'Use advanced vocabulary only when it makes your idea more precise. Toolkit includes authorial choices, analytical verbs, evaluative language, transitions, comparison language, and precise vocabulary. Strong reasoning matters more than forcing sophisticated words.',actions:[{label:'Open Keywords',route:'glossary',toolkitMode:'keywords'}]}},
  {keywords:['glossary','definition','definitions','toolkit'],reply:{text:'Toolkit is LitLab’s reference space. Use Glossary for definitions, Keywords for analytical writing language, and Command Terms to decode what a question is asking you to do.',actions:[{label:'Open Toolkit',route:'glossary'}]}},
  {keywords:['skills lab','practice','test my skills','what should i practice','practice next'],reply:{text:'If you are unsure what to practice, start with Analysis Lab. Then move to Thesis Lab, Authorial Choice Check, Evaluation Lab, Paragraph Builder, and finally Mixed Skill Check. Your weakest reasoning step is usually more useful to train than memorizing more terminology.',actions:[{label:'Open Skills Lab',route:'skills'}]}},
  {keywords:['memorize','memorizing','memorization','paper 2 memorize'],reply:{text:'For Paper 2, memorize a flexible knowledge map rather than full essays: key moments, short useful quotations where appropriate, themes, character developments, motifs, structural choices, and 2–3 strong comparisons between works. Then adapt that knowledge to the exact question.'}},
  {keywords:['focused global issue','global issue too broad','narrow global issue'],reply:{text:'A focused global issue should be specific enough to analyze but broad enough to matter beyond one character or scene. “Power” is too broad. A more focused direction could examine how institutional pressure shapes individual identity or belonging. Make sure both works genuinely support the issue.',actions:[{label:'Open IO guide',route:'io'}]}},
  {keywords:['wider work','wider body','connect wider work'],reply:{text:'Don’t treat the extract and wider work as two unrelated sections. Use the extract to establish a pattern, then show where that pattern develops, changes, or is challenged elsewhere in the work. The connection should deepen the global issue, not just prove you remember another scene.',actions:[{label:'Open IO guide',route:'io'}]}},
  {keywords:['sound natural','memorized script','memorise script','delivery','io delivery'],reply:{text:'For a more natural IO, memorize your argument map rather than every sentence. Practice transitions, key evidence, and the order of ideas. If you lose your place, return to the chain: choice → effect → meaning → global issue.'}},
  {keywords:['narrow research question','narrow rq','research question broad'],reply:{text:'To narrow a research question, reduce the number of texts/ideas, specify the feature or relationship you want to analyze, and make the question invite interpretation. A useful test: could the answer become a debatable argument rather than a long summary?',actions:[{label:'Open EE RQ Lab',route:'ee'}]}},
  {keywords:['official','current requirement','requirements','word limit','how many minutes','how long','marks','criteria','grading'],reply:{text:'For exact current IB requirements, timings, word limits, criteria, or assessment rules, please verify the current official IB guidance and your teacher. LitLab Tutor is a local student study helper, so I won’t invent an official rule. I can still explain the underlying skill or help you find the relevant LitLab guide.',suggestions:['Explain the skill instead','Where should I look on LitLab?']}}
];

const practices:PracticeItem[]=[
  {question:'Which sentence is the strongest analysis?',options:[
    'The writer uses imagery in the description of the window.',
    'The window is important because Mara looks at it.',
    'The contrast between the bright field and cold classroom uses visual imagery to make freedom feel physically close but inaccessible, reinforcing Mara’s conflict between desire and obligation.',
    'The writer uses lots of techniques to interest the reader.'
  ],correct:2,explanation:'The strongest option moves through choice → effect → interpretation → wider idea. It does not stop at identifying imagery.',review:{label:'Open Analysis Lab',route:'skills',skill:'analysis'}},
  {question:'Which thesis has the strongest evaluative direction?',options:[
    'The writer uses imagery, repetition and symbolism.',
    'The text is about power and has many techniques.',
    'Through repeated clock imagery and fragmented syntax, the writer effectively presents pressure as a force that narrows the student’s ability to think clearly.',
    'Power is shown throughout the text.'
  ],correct:2,explanation:'It names meaningful choices, gives an arguable interpretation, and makes an evaluative judgment that can be supported.',review:{label:'Open Thesis Lab',route:'skills',skill:'thesis'}},
  {question:'Which sentence contains genuine evaluation?',options:[
    'The writer effectively uses contrast.',
    'The writer uses contrast to show difference.',
    'The abrupt contrast is particularly effective because it interrupts the confident public message with a private image of rejection, exposing the gap between belonging and exclusion.',
    'The contrast makes the reader feel something.'
  ],correct:2,explanation:'Evaluation needs a judgment plus a reason. “Effective” by itself is not evaluation.',review:{label:'Open Evaluation Lab',route:'skills',skill:'evaluation'}},
  {question:'Which Paper 2 comparison is strongest?',options:[
    'Both works show power.',
    'Work A has power. Work B also has power.',
    'Both writers question authority, but while Work A makes control visible through public ritual, Work B presents it through private relationships, creating different forms of pressure.',
    'The books are similar but also different.'
  ],correct:2,explanation:'It compares the shared concept and the different authorial methods in one line of reasoning.',review:{label:'Open Paper 2',route:'paper-2'}},
  {question:'Which is analysis rather than summary?',options:[
    'Sami receives a rejection letter and folds it in his hand.',
    'The audience stands and applauds.',
    'The repeated folding of the rejection letter turns exclusion into a physical action, contrasting sharply with the public slogan of unity above the stage.',
    'Sami is sitting in the third row.'
  ],correct:2,explanation:'It explains how a detail is constructed and what the contrast suggests, rather than only retelling events.',review:{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}},
  {question:'Which global-issue direction is the most focused?',options:[
    'Power',
    'Problems in society',
    'How institutional expectations can restrict individual identity and belonging',
    'People and life'
  ],correct:2,explanation:'It is specific enough to analyze while still extending beyond one character or scene. Always check that both chosen works genuinely support it.',review:{label:'Open IO guide',route:'io'}},
  {question:'What should come after identifying an authorial choice in a strong analytical chain?',options:[
    'Immediately list another technique',
    'Explain its effect and what that effect suggests',
    'Repeat the quotation',
    'Add a sophisticated transition word'
  ],correct:1,explanation:'Identification is only the beginning. The next useful move is to explain effect, then meaning, evaluation, and connection.',review:{label:'Open Start Here',route:'start'}},
  {question:'Which sentence uses “evaluate” correctly?',options:[
    'The writer has a metaphor.',
    'The metaphor is effective.',
    'The metaphor is especially effective because its repeated confinement imagery makes the character’s loss of agency increasingly visible.',
    'The metaphor means the reader is interested.'
  ],correct:2,explanation:'A supported judgment explains why the method is effective and what it accomplishes.',review:{label:'Open Command Terms',route:'glossary',toolkitMode:'commands'}}
];

function scoreKnowledge(query:string,item:KnowledgeItem){
  const q=normalize(query);
  const qWords=words(query);
  let score=0;
  for(const keyword of item.keywords){
    const k=normalize(keyword);
    if(!k)continue;
    if(q===k)score+=12;
    else if(q.includes(k))score+=7+Math.min(3,k.split(' ').length);
    else{
      const parts=k.split(' ').filter(Boolean);
      const hits=parts.filter(part=>qWords.has(part)).length;
      if(hits===parts.length&&hits)score+=4+hits;
      else score+=hits*.7;
    }
  }
  return score;
}

function pageContextReply():TutorReply{
  const route=currentRoute();
  const map:Record<string,TutorReply>={
    home:{text:'You’re on Home. If you’re new, start with Start Here. If you already know the basics, Skills Lab is the fastest way to find what needs work.',actions:[{label:'Start Here',route:'start'},{label:'Skills Lab',route:'skills'}]},
    start:{text:'You’re in Start Here. This page teaches the reasoning underneath DP English analysis: notice → choice → effect → meaning → evaluation → connection.',actions:[{label:'Practice it',route:'skills',skill:'analysis'}]},
    papers:{text:'You’re in Papers. Choose Paper 1 for unseen-text analysis or Paper 2 for comparative writing.',actions:[{label:'Paper 1',route:'paper-1'},{label:'Paper 2',route:'paper-2'}]},
    'paper-1':{text:'You’re on Paper 1. Ask me about annotation, authorial choices, thesis writing, analytical paragraphs, evaluation, or avoiding summary.'},
    'paper-2':{text:'You’re on Paper 2. Ask me about comparison, comparative thesis writing, planning, evidence, or how to avoid two separate mini essays.'},
    io:{text:'You’re on the IO guide. Ask about global issues, extract analysis, wider-work links, delivery, or practice strategy.'},
    books:{text:'You’re in Books. Ask how to organize themes, characters, motifs, key moments, authorial choices, or Paper 2 connections.'},
    ee:{text:'You’re on the EE guide. Ask about narrowing a topic, forming an analytical research question, or building an argument. Verify exact official requirements with current IB guidance and your supervisor.'},
    skills:{text:'You’re in Skills Lab. Tell me what feels hardest—analysis, thesis, authorial choices, evaluation, paragraph logic, or comparison—and I’ll point you to the best practice.'},
    glossary:{text:'You’re in Toolkit. Ask for a definition, a better analytical verb, an evaluative word, or what a command term such as “Analyze” or “Evaluate” is asking you to do.'}
  };
  return map[route]||{text:`You’re on ${routeLabel()}. Ask me what you want to understand or where to go next.`};
}

function answerQuery(query:string,mode:TutorMode):TutorReply{
  const clean=normalize(query);
  if(!clean)return {text:'Type a question and I’ll try to match it to LitLab’s English guidance.'};

  if(mode==='explain'&&(clean==='this'||clean==='explain this'||clean==='help with this')){
    return {text:`I need a little more detail. You’re currently on ${routeLabel()}. Paste the term, sentence, thesis, or concept you want explained.`,suggestions:['Explain evaluation','Explain authorial choices','Explain thesis writing']};
  }

  if(/\b(where am i|this page|what can i do here|help on this page)\b/.test(clean))return pageContextReply();

  let best:KnowledgeItem|undefined;
  let bestScore=0;
  for(const item of knowledge){
    const score=scoreKnowledge(query,item);
    if(score>bestScore){bestScore=score;best=item}
  }

  if(best&&bestScore>=3.4)return best.reply;

  if(mode==='explain'){
    return {text:'I couldn’t confidently match that to the local LitLab knowledge bank. Try naming the exact term or skill—for example “juxtaposition,” “evaluation,” “Paper 2 comparison,” or “global issue.” I won’t invent an answer when I’m unsure.',suggestions:['What is evaluation?','What is juxtaposition?','How do I compare properly?']};
  }

  return {text:'I couldn’t confidently match that question yet. This tutor is local—not generative AI—so it answers from LitLab’s built-in study guidance rather than guessing. Try asking about Paper 1, Paper 2, IO, EE, analysis, thesis, evaluation, authorial choices, books, Skills Lab, or Toolkit.',actions:[{label:'Open Start Here',route:'start'},{label:'Open Toolkit',route:'glossary'}],suggestions:['How do I stop summarizing?','Help me write a thesis','What should I practice?']};
}

function tutorIcon(){
  return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M12 3.5 13.5 8l4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5L6 9.5 10.5 8 12 3.5Z" fill="currentColor"/><path d="M18.2 14.4 19 17l2.6.8L19 18.6l-.8 2.6-.8-2.6-2.6-.8 2.6-.8.8-2.6Z" fill="currentColor"/></svg>';
}
function arrowIcon(){
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function closeIcon(){
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
}

let mode:TutorMode=(localStorage.getItem('litlabTutorMode') as TutorMode)||'ask';
if(!['ask','explain','practice'].includes(mode))mode='ask';
let practiceIndex=Math.floor(Math.random()*practices.length);
let practiceAnswered=false;

function go(action:TutorAction){
  if(action.skill)localStorage.setItem('litlabLastSkill',action.skill);
  location.hash=action.route;
  if(action.toolkitMode){
    const desired=action.toolkitMode;
    const trySelect=(attempt=0)=>{
      const button=document.querySelector<HTMLButtonElement>(`.keyword-mode-tabs button[data-mode="${desired}"]`);
      if(button)button.click();
      else if(attempt<12)setTimeout(()=>trySelect(attempt+1),80);
    };
    setTimeout(()=>trySelect(),100);
  }
}

function createTutor(){
  if(document.querySelector('.litlab-tutor'))return;

  const root=document.createElement('div');
  root.className='litlab-tutor';
  root.innerHTML=`
    <button class="tutor-launcher" type="button" aria-label="Open LitLab Tutor" aria-expanded="false">
      <span class="tutor-launcher-icon">${tutorIcon()}</span>
      <span class="tutor-launcher-copy"><b>Ask LitLab</b><small>Local study tutor</small></span>
    </button>
    <section class="tutor-panel" role="dialog" aria-label="LitLab Tutor" aria-hidden="true">
      <header class="tutor-head">
        <div class="tutor-brand"><span>${tutorIcon()}</span><div><b>LitLab Tutor</b><small>DP English study companion</small></div></div>
        <button class="tutor-close" type="button" aria-label="Close LitLab Tutor">${closeIcon()}</button>
      </header>
      <div class="tutor-context"><span class="tutor-status-dot"></span><span>Local • Private</span><i></i><span class="tutor-page-context"></span></div>
      <div class="tutor-modes" role="tablist" aria-label="Tutor mode">
        <button type="button" data-tutor-mode="ask" role="tab">Ask</button>
        <button type="button" data-tutor-mode="explain" role="tab">Explain</button>
        <button type="button" data-tutor-mode="practice" role="tab">Practice</button>
      </div>
      <div class="tutor-messages" aria-live="polite"></div>
      <div class="tutor-compose">
        <div class="tutor-input-wrap">
          <input class="tutor-input" type="text" autocomplete="off" maxlength="420" placeholder="Ask a DP English question…" aria-label="Ask LitLab Tutor" />
          <button class="tutor-send" type="button" aria-label="Send question">${arrowIcon()}</button>
        </div>
        <small class="tutor-disclaimer">Built-in LitLab guidance, not generative AI. Verify exact current IB requirements with official guidance and your teacher.</small>
      </div>
    </section>`;
  document.body.append(root);

  const launcher=root.querySelector<HTMLButtonElement>('.tutor-launcher')!;
  const panel=root.querySelector<HTMLElement>('.tutor-panel')!;
  const close=root.querySelector<HTMLButtonElement>('.tutor-close')!;
  const messages=root.querySelector<HTMLElement>('.tutor-messages')!;
  const input=root.querySelector<HTMLInputElement>('.tutor-input')!;
  const send=root.querySelector<HTMLButtonElement>('.tutor-send')!;
  const context=root.querySelector<HTMLElement>('.tutor-page-context')!;
  const modeButtons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tutor-mode]'));

  function syncContext(){context.textContent=routeLabel()}
  function syncMode(){
    modeButtons.forEach(button=>{
      const selected=button.dataset.tutorMode===mode;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-selected',String(selected));
    });
    input.placeholder=mode==='ask'?'Ask a DP English question…':mode==='explain'?'What should I explain?': 'Practice mode — use the answer choices above';
    input.disabled=mode==='practice';
    send.disabled=mode==='practice';
  }

  function openTutor(){
    root.classList.add('open');
    launcher.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    syncContext();
    if(!messages.children.length)welcome();
    if(mode!=='practice')setTimeout(()=>input.focus(),reduceMotion()?0:180);
  }
  function closeTutor(){
    root.classList.remove('open');
    launcher.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
    launcher.focus();
  }

  function addMessage(kind:'user'|'tutor',text:string){
    const wrap=document.createElement('div');
    wrap.className=`tutor-message ${kind}`;
    const bubble=document.createElement('div');
    bubble.className='tutor-bubble';
    bubble.textContent=text;
    wrap.append(bubble);
    messages.append(wrap);
    messages.scrollTop=messages.scrollHeight;
    return wrap;
  }

  function addReply(reply:TutorReply){
    const wrap=addMessage('tutor',reply.text);
    if(reply.actions?.length){
      const actions=document.createElement('div');
      actions.className='tutor-actions';
      reply.actions.forEach(action=>{
        const button=document.createElement('button');
        button.type='button';
        button.innerHTML=`<span>${action.label}</span>${arrowIcon()}`;
        button.addEventListener('click',()=>{go(action);closeTutor()});
        actions.append(button);
      });
      wrap.append(actions);
    }
    if(reply.suggestions?.length){
      const chips=document.createElement('div');
      chips.className='tutor-suggestions';
      reply.suggestions.forEach(suggestion=>{
        const button=document.createElement('button');
        button.type='button';
        button.textContent=suggestion;
        button.addEventListener('click',()=>ask(suggestion));
        chips.append(button);
      });
      wrap.append(chips);
    }
    messages.scrollTop=messages.scrollHeight;
  }

  function welcome(){
    addReply({text:`Hi! I’m your local LitLab Tutor. You’re currently on ${routeLabel()}. I can explain English concepts, help you find the right LitLab tool, or give you a quick practice question.`,suggestions:['How do I stop summarizing?','Help me write a thesis','What should I practice?']});
  }

  function ask(value?:string){
    const question=(value??input.value).trim();
    if(!question)return;
    addMessage('user',question);
    input.value='';
    window.setTimeout(()=>addReply(answerQuery(question,mode)),reduceMotion()?0:120);
  }

  function showPractice(){
    practiceAnswered=false;
    const item=practices[practiceIndex%practices.length];
    const wrap=addMessage('tutor',item.question);
    wrap.classList.add('practice-message');
    const options=document.createElement('div');
    options.className='tutor-practice-options';
    item.options.forEach((option,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.textContent=option;
      button.addEventListener('click',()=>{
        if(practiceAnswered)return;
        practiceAnswered=true;
        options.querySelectorAll<HTMLButtonElement>('button').forEach((btn,i)=>{
          btn.disabled=true;
          if(i===item.correct)btn.classList.add('correct');
          else if(i===index)btn.classList.add('wrong');
        });
        const feedback=document.createElement('div');
        feedback.className='tutor-practice-feedback';
        feedback.innerHTML=`<b>${index===item.correct?'Correct — nice reasoning.':'Not quite — use the feedback.'}</b><p>${item.explanation}</p>`;
        if(item.review){
          const review=document.createElement('button');
          review.type='button';
          review.className='tutor-review-link';
          review.innerHTML=`${item.review.label}${arrowIcon()}`;
          review.addEventListener('click',()=>{go(item.review!);closeTutor()});
          feedback.append(review);
        }
        const next=document.createElement('button');
        next.type='button';
        next.className='tutor-next-practice';
        next.textContent='Next practice question';
        next.addEventListener('click',()=>{
          practiceIndex=(practiceIndex+1)%practices.length;
          showPractice();
        });
        feedback.append(next);
        wrap.append(feedback);
        messages.scrollTop=messages.scrollHeight;
      });
      options.append(button);
    });
    wrap.append(options);
    messages.scrollTop=messages.scrollHeight;
  }

  launcher.addEventListener('click',()=>root.classList.contains('open')?closeTutor():openTutor());
  close.addEventListener('click',closeTutor);
  send.addEventListener('click',()=>ask());
  input.addEventListener('keydown',event=>{if(event.key==='Enter')ask()});
  modeButtons.forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.tutorMode as TutorMode;
    localStorage.setItem('litlabTutorMode',mode);
    syncMode();
    if(mode==='practice')showPractice();
    else{
      addReply(mode==='explain'
        ? {text:'Explain mode: name a term, paste a short thesis/analytical sentence, or ask what a concept means. I’ll match it to LitLab’s built-in guidance.',suggestions:['Explain evaluation','Explain juxtaposition','Explain Paper 2 comparison']}
        : {text:`Ask mode: ask me a DP English question or ask what to do on ${routeLabel()}.`,suggestions:['What can I do on this page?','What should I practice?']});
      setTimeout(()=>input.focus(),0);
    }
  }));
  window.addEventListener('hashchange',()=>{setTimeout(syncContext,80)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.classList.contains('open'))closeTutor()});

  syncMode();
  syncContext();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createTutor,{once:true});
else createTutor();
