import { animate } from 'motion';
import './command-terms.css';

type CommandTerm={
  term:string;
  meaning:string;
  doThis:string;
  mistake:string;
  example:string;
  category:'Analysis'|'Comparison'|'Evaluation'|'Explanation'|'Interpretation';
};

const commandTerms:CommandTerm[]=[
  {term:'Analyze',meaning:'Break something down and explain how its parts or choices create meaning.',doThis:'Move beyond identifying a feature. Explain the choice, its effect, what it suggests, and why that matters to the wider argument.',mistake:'Only naming techniques or retelling what happens.',example:'Instead of “The writer uses repetition,” explain what is repeated, what it emphasizes, and how it shapes the text’s larger idea.',category:'Analysis'},
  {term:'Examine',meaning:'Look closely at an idea, method, relationship, or feature and investigate how it works.',doThis:'Select relevant evidence, study the details carefully, and develop a reasoned interpretation from them.',mistake:'Listing everything you know about the topic without focusing on the specific wording of the task.',example:'If asked to examine setting, focus on how specific details of setting construct meaning rather than summarizing every location.',category:'Analysis'},
  {term:'Explore',meaning:'Investigate an idea from more than one useful angle and develop what the evidence suggests.',doThis:'Follow patterns, tensions, developments, and possible interpretations rather than forcing one simple answer immediately.',mistake:'Treating “explore” as permission to write loosely without a clear argument.',example:'Explore how isolation develops by tracing changes in setting, imagery, and character behavior across key moments.',category:'Interpretation'},
  {term:'Interpret',meaning:'Develop a supported understanding of what a detail, pattern, or text may mean.',doThis:'Make an arguable claim and support it with specific textual evidence and analysis.',mistake:'Making a creative guess that the evidence does not support.',example:'The repeated locked-door imagery may suggest that the character experiences family expectations as a form of confinement.',category:'Interpretation'},
  {term:'Explain',meaning:'Make an idea clear by showing how or why it works.',doThis:'Give the reasoning that connects your evidence to your conclusion.',mistake:'Repeating the same claim using different words.',example:'Do not stop at “the tone becomes tense”; explain which choices create the tension and why that change matters.',category:'Explanation'},
  {term:'Identify',meaning:'Recognize and name a relevant feature, idea, choice, or detail.',doThis:'Be precise and select the feature that actually answers the task.',mistake:'Assuming identification alone is full analysis.',example:'Identify the structural shift first; then, if the task asks for analysis, explain its effect and significance.',category:'Explanation'},
  {term:'Justify',meaning:'Give convincing reasons and evidence for a claim, interpretation, or choice.',doThis:'State your position and show why the evidence makes that position reasonable.',mistake:'Using “because” without actually giving strong evidence or reasoning.',example:'Justify why the ending is significant by connecting its final image to a pattern established earlier in the text.',category:'Evaluation'},
  {term:'Evaluate',meaning:'Make a supported judgment about effectiveness, significance, success, limitation, or impact.',doThis:'Judge the choice and explain why your judgment is convincing. Evaluation should grow out of analysis.',mistake:'Adding words like “effectively” or “powerfully” without explaining why.',example:'The juxtaposition is especially effective because it makes the character’s private exclusion visible beside the institution’s public language of unity.',category:'Evaluation'},
  {term:'Assess',meaning:'Reach a reasoned judgment after considering the evidence, strengths, limitations, or competing possibilities.',doThis:'Weigh the evidence before deciding how convincing, important, or valid a claim is.',mistake:'Giving a personal opinion without analytical support.',example:'Assess how far the narrator can be trusted by considering both moments of apparent honesty and moments where the narration becomes selective.',category:'Evaluation'},
  {term:'To what extent',meaning:'Decide how far you agree with a claim rather than treating it as completely true or completely false.',doThis:'Establish a position, consider qualifications or exceptions, and reach a balanced judgment.',mistake:'Writing a simple yes/no response or ignoring evidence that complicates your position.',example:'You might argue that power is presented mainly as restrictive, while showing that some characters also use power as protection or resistance.',category:'Evaluation'},
  {term:'Compare',meaning:'Show meaningful similarities between two works, moments, characters, ideas, or methods.',doThis:'Put both sides into the same line of reasoning and explain why the similarity matters.',mistake:'Writing about Work A and Work B separately and adding “similarly” at the end.',example:'Both writers present belonging as unstable, but each constructs that instability through a different relationship between setting and character.',category:'Comparison'},
  {term:'Contrast',meaning:'Show meaningful differences between two works, ideas, methods, or effects.',doThis:'Explain not only what is different, but how that difference changes the meaning or argument.',mistake:'Creating a list of differences with no analytical significance.',example:'Whereas one narrator openly expresses fear, the other suppresses it through detached language, creating different representations of vulnerability.',category:'Comparison'},
  {term:'Compare and contrast',meaning:'Discuss both important similarities and important differences.',doThis:'Build an integrated argument that connects the two works throughout rather than separating comparison into isolated sections.',mistake:'Doing all similarities first and all differences later without linking them to a central argument.',example:'Both works examine authority, yet one presents it as visible public control while the other emphasizes quiet control within relationships.',category:'Comparison'},
  {term:'Discuss',meaning:'Develop a reasoned argument about an issue by considering relevant evidence, interpretations, and complexity.',doThis:'Take a clear position while acknowledging tensions, alternatives, or qualifications where they genuinely matter.',mistake:'Giving a neutral information dump with no argument of your own.',example:'A discussion of identity might consider how identity is imposed, resisted, and reconstructed rather than making one absolute claim.',category:'Interpretation'},
  {term:'Consider',meaning:'Think carefully about a specific idea or possibility and explain its relevance to the task.',doThis:'Focus on the named issue, examine useful evidence, and show what conclusions follow.',mistake:'Mentioning the topic briefly and then moving back to a prepared answer.',example:'If asked to consider the role of memory, make memory central to the argument rather than a small supporting point.',category:'Interpretation'},
  {term:'How',meaning:'Focus on method: the choices, structures, techniques, or processes through which meaning is created.',doThis:'Make authorial choices central to the response and connect them to effect, meaning, and purpose.',mistake:'Answering only what the text says instead of how it communicates the idea.',example:'For “How is conflict presented?”, analyze the methods used to construct conflict, not simply which characters disagree.',category:'Analysis'},
  {term:'Why',meaning:'Focus on significance, purpose, cause, or the reason a choice matters.',doThis:'Explain the larger consequence of the detail or method you have analyzed.',mistake:'Guessing the creator’s personal intention as if you can know it with certainty.',example:'Instead of claiming “the author wanted to make us sad,” explain why the restrained tone makes the loss more powerful or significant.',category:'Explanation'}
];

const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';
let commandActive=false;
let mountedPage:HTMLElement|null=null;
let scheduled=false;

function directChild(page:HTMLElement,className:string){
  return Array.from(page.children).find(el=>el instanceof HTMLElement&&el.classList.contains(className)) as HTMLElement|undefined;
}

function chevron(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function commandCard(item:CommandTerm){
  const details=document.createElement('details');
  details.dataset.commandTerm='true';
  details.dataset.search=(item.term+' '+item.meaning+' '+item.doThis+' '+item.mistake+' '+item.example+' '+item.category).toLowerCase();
  details.innerHTML=`
    <summary><span><b>${item.term}</b><small>${item.category}</small></span>${chevron()}</summary>
    <div class="command-term-body">
      <p>${item.meaning}</p>
      <div class="command-term-grid">
        <div><span>WHAT THE TASK WANTS</span><p>${item.doThis}</p></div>
        <div><span>COMMON MISTAKE</span><p>${item.mistake}</p></div>
      </div>
      <em><b>Mini example</b>${item.example}</em>
    </div>`;
  return details;
}

function createCommandPanel(){
  const panel=document.createElement('section');
  panel.className='keyword-panel command-panel';
  panel.hidden=true;
  panel.innerHTML=`
    <div class="keyword-intro command-intro">
      <div>
        <span class="keyword-eyebrow">Question decoder</span>
        <h2>Command Terms</h2>
        <p>Learn what common DP English task words are actually asking you to do. The wording used in a task can vary by course, teacher and assessment, so treat this as a <b>student interpretation guide</b> and always follow the exact question and current course guidance.</p>
      </div>
      <span class="keyword-count">${commandTerms.length} terms</span>
    </div>
    <div class="glossary-tools command-tools">
      <div class="inline-search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" placeholder="Search analyze, compare, evaluate…" aria-label="Search command terms" /></div>
      <div class="command-shortcuts" aria-label="Command term groups"></div>
    </div>
    <div class="glossary-grid command-grid"></div>
    <div class="command-reminder"><b>LitLab reminder:</b> A command term tells you the kind of thinking the task expects. It does not replace answering the specific focus of the question.</div>`;

  const grid=panel.querySelector<HTMLElement>('.command-grid')!;
  commandTerms.forEach(item=>grid.append(commandCard(item)));

  const categories=['All','Analysis','Comparison','Evaluation','Explanation','Interpretation'];
  const shortcuts=panel.querySelector<HTMLElement>('.command-shortcuts')!;
  let activeCategory='All';
  let search='';

  const applyFilter=()=>{
    let visible=0;
    grid.querySelectorAll<HTMLDetailsElement>('details[data-command-term]').forEach((detail,index)=>{
      const item=commandTerms[index];
      const matchesCategory=activeCategory==='All'||item.category===activeCategory;
      const matchesSearch=!search||detail.dataset.search?.includes(search);
      detail.hidden=!(matchesCategory&&matchesSearch);
      if(!detail.hidden)visible++;
    });
    let empty=grid.querySelector<HTMLElement>('.command-empty');
    if(!visible){
      if(!empty){
        empty=document.createElement('div');
        empty.className='keyword-empty command-empty';
        empty.innerHTML='<b>No matching command term.</b><span>Try a broader search or another group.</span>';
        grid.append(empty);
      }
    }else empty?.remove();
  };

  categories.forEach(name=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=name;
    button.classList.toggle('active',name==='All');
    button.addEventListener('click',()=>{
      activeCategory=name;
      shortcuts.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn===button));
      applyFilter();
    });
    shortcuts.append(button);
  });

  const input=panel.querySelector<HTMLInputElement>('input');
  input?.addEventListener('input',()=>{search=input.value.trim().toLowerCase();applyFilter()});
  return panel;
}

function applyCommandMode(page:HTMLElement){
  const panel=page.querySelector<HTMLElement>(':scope > .command-panel');
  const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  const originalTools=directChild(page,'glossary-tools');
  const originalGrid=directChild(page,'glossary-grid');
  const keywordPanel=page.querySelector<HTMLElement>(':scope > .keyword-panel:not(.command-panel)');
  if(!panel||!tabs||!originalTools||!originalGrid)return;

  if(commandActive){
    originalTools.hidden=true;
    originalGrid.hidden=true;
    if(keywordPanel)keywordPanel.hidden=true;
    panel.hidden=false;
    tabs.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
      const selected=button.dataset.mode==='commands';
      button.classList.toggle('active',selected);
      button.setAttribute('aria-selected',String(selected));
    });
  }else{
    panel.hidden=true;
  }
}

function enhanceCommandTerms(){
  if(currentRoute()!=='glossary')return;
  const page=Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(el=>directChild(el,'glossary-tools')&&directChild(el,'glossary-grid'));
  if(!page)return;
  mountedPage=page;

  const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  if(!tabs){setTimeout(scheduleEnhance,60);return}

  let commandButton=tabs.querySelector<HTMLButtonElement>('button[data-mode="commands"]');
  if(!commandButton){
    commandButton=document.createElement('button');
    commandButton.type='button';
    commandButton.setAttribute('role','tab');
    commandButton.dataset.mode='commands';
    commandButton.textContent='Command Terms';
    commandButton.addEventListener('click',()=>{
      commandActive=true;
      applyCommandMode(page);
      const panel=page.querySelector<HTMLElement>(':scope > .command-panel');
      if(panel&&!reduceMotion())void animate(panel,{opacity:[0,1],transform:['translateY(10px)','translateY(0px)']},{duration:.32,ease:'easeOut'});
    });
    tabs.append(commandButton);
  }

  tabs.querySelectorAll<HTMLButtonElement>('button:not([data-mode="commands"])').forEach(button=>{
    if(button.dataset.commandBound)return;
    button.dataset.commandBound='true';
    button.addEventListener('click',()=>{commandActive=false;page.querySelector<HTMLElement>(':scope > .command-panel')?.setAttribute('hidden','')});
  });

  let panel=page.querySelector<HTMLElement>(':scope > .command-panel');
  if(!panel){
    panel=createCommandPanel();
    const keywordPanel=page.querySelector<HTMLElement>(':scope > .keyword-panel:not(.command-panel)');
    if(keywordPanel?.nextSibling)page.insertBefore(panel,keywordPanel.nextSibling);else page.append(panel);
  }

  setTimeout(()=>applyCommandMode(page),0);
}

function scheduleEnhance(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    enhanceCommandTerms();
    if(commandActive&&mountedPage)setTimeout(()=>applyCommandMode(mountedPage!),0);
  });
}

const root=document.getElementById('root');
const observer=new MutationObserver(()=>{
  if(currentRoute()!=='glossary')return;
  scheduleEnhance();
});
if(root)observer.observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{
  commandActive=false;
  mountedPage=null;
  setTimeout(scheduleEnhance,100);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleEnhance,{once:true});else scheduleEnhance();
