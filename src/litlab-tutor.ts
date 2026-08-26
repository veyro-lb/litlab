import './litlab-tutor.css';
import {siteDocs,type SiteDoc,type TutorLink,type TutorToolkitMode} from './tutor-site-knowledge';

type TutorMode='ask'|'explain'|'practice';
type TutorAction={label:string;route:string;skill?:string;toolkitMode?:TutorToolkitMode};
type TutorReply={text:string;actions?:TutorAction[];suggestions?:string[]};
type PracticeItem={question:string;options:string[];correct:number;explanation:string;review?:TutorAction};
type PreparedDoc=SiteDoc&{normTitle:string;normBody:string;normKeywords:string[];titleTokens:string[];keywordTokens:string[];bodyTokens:string[]};
type ScoredDoc={doc:PreparedDoc;score:number;fuzzy:boolean};

const ROUTES:Record<string,string>={
  home:'Home',start:'Start Here',papers:'Papers','paper-1':'Paper 1','paper-2':'Paper 2',
  io:'Individual Oral',books:'Books',ee:'Extended Essay',skills:'Skills Lab',glossary:'Toolkit',about:'About / CAS'
};
const STOPWORDS=new Set('a an and are as at be been being but by can could did do does for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this to was we were what when where which who why with would you your'.split(' '));
const TOKEN_CANON:Record<string,string>={
  analyse:'analyze',analyses:'analyzes',analysed:'analyzed',analysing:'analyzing',
  memorise:'memorize',memorised:'memorized',memorising:'memorizing',memorisation:'memorization',
  practise:'practice',practised:'practiced',practising:'practicing',
  characterisation:'characterization',focalisation:'focalization',emphasise:'emphasize',emphasises:'emphasizes',
  colour:'color',colours:'colors',behaviour:'behavior',behaviours:'behaviors',organise:'organize',organising:'organizing'
};

const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';
const routeLabel=()=>ROUTES[currentRoute()]||'LitLab';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function normalize(value:string){
  let text=value.normalize('NFKD').toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-');
  text=text.replace(/\bp\s*1\b/g,'paper 1').replace(/\bp\s*2\b/g,'paper 2').replace(/\b1984\b/g,'nineteen eighty four').replace(/\bio\b/g,'individual oral').replace(/\bee\b/g,'extended essay');
  text=text.replace(/[^a-z0-9\s'-]/g,' ').replace(/\s+/g,' ').trim();
  return text.split(' ').map(token=>TOKEN_CANON[token]||token).join(' ');
}
function tokens(value:string){
  return normalize(value).split(' ').filter(token=>token&&(!STOPWORDS.has(token))&&(token.length>1||/^\d+$/.test(token)));
}
function uniqueTokens(value:string,limit=120){return [...new Set(tokens(value))].slice(0,limit)}

function editDistance(a:string,b:string,max=2){
  if(a===b)return 0;
  if(Math.abs(a.length-b.length)>max)return max+1;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const row=[i];let rowMin=i;
    for(let j=1;j<=b.length;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      const value=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+cost);
      row[j]=value;if(value<rowMin)rowMin=value;
    }
    if(rowMin>max)return max+1;
    prev=row;
  }
  return prev[b.length];
}
function tokenSimilarity(a:string,b:string){
  if(a===b)return 1;
  if(!a||!b)return 0;
  if(a.length>=4&&b.length>=4&&(a.startsWith(b)||b.startsWith(a)))return .91;
  if(a[0]!==b[0]||Math.abs(a.length-b.length)>2)return 0;
  const max=Math.min(a.length,b.length)>=8?2:Math.min(a.length,b.length)>=4?1:0;
  if(!max)return 0;
  const distance=editDistance(a,b,max);
  if(distance>max)return 0;
  return 1-distance/Math.max(a.length,b.length);
}
function maxSimilarity(token:string,candidates:string[]){
  let best=0;
  for(const candidate of candidates){
    const score=tokenSimilarity(token,candidate);
    if(score>best)best=score;
    if(best===1)break;
  }
  return best;
}
function prepare(doc:SiteDoc):PreparedDoc{
  return {...doc,normTitle:normalize(doc.title),normBody:normalize(doc.body),normKeywords:doc.keywords.map(normalize),titleTokens:uniqueTokens(doc.title,24),keywordTokens:uniqueTokens(doc.keywords.join(' '),60),bodyTokens:uniqueTokens(doc.body,130)};
}
const preparedDocs=siteDocs.map(prepare);

function pageDocs(){
  const main=document.querySelector<HTMLElement>('main');
  if(!main)return [] as PreparedDoc[];
  const seen=new Set<string>();
  const result:PreparedDoc[]=[];
  main.querySelectorAll<HTMLElement>('h1,h2,h3,h4,summary').forEach((heading,index)=>{
    if(result.length>=32||heading.offsetParent===null)return;
    const title=(heading.textContent||'').replace(/\s+/g,' ').trim();
    if(title.length<2||seen.has(title.toLowerCase()))return;
    const container=heading.closest<HTMLElement>('section,article,details')||heading.parentElement;
    const body=(container?.textContent||'').replace(/\s+/g,' ').trim().slice(0,1800);
    if(body.length<18)return;
    seen.add(title.toLowerCase());
    result.push(prepare({id:`live-${currentRoute()}-${index}`,title,body,keywords:[title,routeLabel(),'current page','this page'],route:currentRoute(),category:'Current page',action:{label:`Stay on ${routeLabel()}`,route:currentRoute()},priority:2.4}));
  });
  return result;
}

function scoreDoc(query:string,queryTokens:string[],doc:PreparedDoc){
  const q=normalize(query);let score=doc.priority||0;let fuzzy=false;
  if(q===doc.normTitle)score+=22;
  else if(doc.normTitle.length>3&&q.includes(doc.normTitle))score+=13;
  else if(q.length>3&&doc.normTitle.includes(q))score+=9;
  for(const keyword of doc.normKeywords){
    if(!keyword)continue;
    if(q===keyword)score+=15;
    else if(keyword.length>3&&q.includes(keyword))score+=7+Math.min(4,keyword.split(' ').length);
  }
  let matched=0;
  for(const token of queryTokens){
    const title=maxSimilarity(token,doc.titleTokens);
    const key=maxSimilarity(token,doc.keywordTokens);
    const body=maxSimilarity(token,doc.bodyTokens);
    if(title>=.78){score+=title*5.4;matched++;if(title<1)fuzzy=true}
    else if(key>=.78){score+=key*3.6;matched++;if(key<1)fuzzy=true}
    else if(body>=.84){score+=body*1.35;matched++;if(body<1)fuzzy=true}
  }
  if(queryTokens.length>1&&matched===queryTokens.length)score+=2.4;
  if(doc.route===currentRoute())score+=1.1;
  if(/\b(definition|meaning|what is|what does)\b/.test(q)&&['Glossary','Authorial choice','Command term','Book symbol','Book motif','Book character','Book theme'].includes(doc.category))score+=1.4;
  if(/\b(book|novel|character|theme|symbol|motif|scene|chapter|ending)\b/.test(q)&&doc.category.startsWith('Book'))score+=1.2;
  return {doc,score,fuzzy} as ScoredDoc;
}
function ranked(query:string){
  const qTokens=uniqueTokens(query,40);
  return [...preparedDocs,...pageDocs()].map(doc=>scoreDoc(query,qTokens,doc)).sort((a,b)=>b.score-a.score).slice(0,8);
}
function clip(value:string,max=720){
  if(value.length<=max)return value;
  const cut=value.slice(0,max);
  const stop=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('; '),cut.lastIndexOf(' '));
  return `${cut.slice(0,stop>max*.65?stop:max).trim()}…`;
}
function actionFrom(link?:TutorLink):TutorAction|undefined{return link?{...link}:undefined}

function pageContextReply():TutorReply{
  const route=currentRoute();
  const map:Record<string,TutorReply>={
    home:{text:'You’re on Home. Start Here explains the DP English reasoning map; Skills Lab is the quickest way to practice; Toolkit is the reference bank.',actions:[{label:'Start Here',route:'start'},{label:'Skills Lab',route:'skills'},{label:'Toolkit',route:'glossary'}]},
    start:{text:'Start Here focuses on the reasoning underneath analysis: notice → authorial choice → effect → meaning → evaluation → connection.',actions:[{label:'Practice Analysis',route:'skills',skill:'analysis'}]},
    papers:{text:'Papers is the gateway to Paper 1 unseen analysis and Paper 2 comparative writing.',actions:[{label:'Paper 1',route:'paper-1'},{label:'Paper 2',route:'paper-2'}]},
    'paper-1':{text:'Paper 1 covers format, the unseen-text process, annotation, audience/purpose/context, tone, authorial choices, analysis, evaluation, thesis, paragraphs, planning, timing, mistakes, and original practice.'},
    'paper-2':{text:'Paper 2 covers format, prompt decoding, choosing works, integrated comparison, comparative vocabulary, thesis writing, paragraph logic, themes, methods, evidence, planning, mistakes, and practice.'},
    io:{text:'The IO guide covers global-issue focus, extract analysis, wider-work links, transitions, evaluation, delivery, practice, timing, and common mistakes.'},
    books:{text:'Books contains searchable profiles for the published studied works. Ask about a character, theme, symbol, motif, authorial choice, key moment, argument, evidence point, or comparison. Coming Soon profiles stay intentionally blank.'},
    ee:{text:'The EE guide covers choosing English, scope, research-question development, research, planning, analysis, sources, supervisor/reflection, mistakes, criteria/model notes, checklist, and timeline.'},
    skills:{text:'Skills Lab includes Analysis Lab, Thesis Lab, Authorial Choice Check, Evaluation Lab, Paragraph Builder, Mixed Skill Check, and Mistake Clinic.'},
    glossary:{text:'Toolkit includes definitions and terminology plus analytical vocabulary, command-term guidance, and sentence frames.'}
  };
  return map[route]||{text:`You’re on ${routeLabel()}. Ask about any visible idea, control, section, or English concept on this page.`};
}

function writingCoach(query:string):TutorReply|null{
  const clean=normalize(query);
  const asksForFeedback=/\b(check|improve|feedback|fix|better|good thesis|good paragraph|good analysis|is this|rate this|review this)\b/.test(clean);
  if(!asksForFeedback&&!(mode==='explain'&&query.trim().length>95))return null;
  const sample=query.replace(/^.*?[:\-]\s*/,'').trim();
  if(sample.length<35)return null;
  const choiceTerms=siteDocs.filter(doc=>doc.category==='Authorial choice').flatMap(doc=>doc.keywords).map(normalize);
  const hasChoice=choiceTerms.some(term=>term.length>3&&clean.includes(term));
  const hasEffect=/\b(create|creates|creating|emphasize|emphasizes|highlight|highlights|build|builds|evoke|evokes|intensify|intensifies|pace|tension|contrast|distance|intimacy|urgency|tone)\b/.test(clean);
  const hasMeaning=/\b(suggest|suggests|imply|implies|reveal|reveals|represent|represents|symbolize|symbolizes|indicate|indicates|reflect|reflects|show|shows)\b/.test(clean);
  const hasEvaluation=/\b(effective|effectively|convincing|convincingly|powerful|powerfully|significant|significantly|successful|successfully|subtle|subtly|because)\b/.test(clean);
  const hasConnection=/\b(ultimately|therefore|wider|theme|argument|global issue|thesis|reinforces|complicates)\b/.test(clean);
  const strengths:string[]=[];const next:string[]=[];
  if(hasChoice)strengths.push('you name a recognizable authorial choice');else next.push('name the most precise observable authorial choice');
  if(hasEffect)strengths.push('you describe an effect');else next.push('explain what the choice creates: pace, tension, emphasis, contrast, distance, tone, or another specific effect');
  if(hasMeaning)strengths.push('you move toward interpretation');else next.push('push from the effect into what it suggests about the character, relationship, theme, value, or idea');
  if(hasEvaluation)strengths.push('there is evaluative direction');else next.push('if useful, add a supported judgment explaining why the choice is especially effective, significant, limited, or ambiguous');
  if(hasConnection)strengths.push('you connect the point outward');
  const text=`I would treat this as a draft rather than a single “right” answer. ${strengths.length?`What is already working: ${strengths.join('; ')}.`:'It has a starting idea, but the analytical chain is still underdeveloped.'} ${next.length?`Best next move${next.length>1?'s':''}: ${next.join('; ')}.`:'The main reasoning steps are present. Now check that every claim is genuinely supported by the evidence and wording of the text.'} Different interpretations can still work if the evidence supports them.`;
  const target=clean.includes('thesis')?'thesis':clean.includes('paragraph')?'paragraph':'analysis';
  return {text,actions:[{label:target==='thesis'?'Open Thesis Lab':target==='paragraph'?'Open Paragraph Builder':'Open Analysis Lab',route:'skills',skill:target}],suggestions:['What is effect vs meaning?','How do I add evaluation?']};
}

function answerQuery(query:string,activeMode:TutorMode):TutorReply{
  const clean=normalize(query);
  if(!clean)return {text:'Ask a question about LitLab or DP English. Spelling does not have to be perfect.'};
  if(/^(hi|hello|hey|yo|sup|hii+|heyy+)\b/.test(clean))return {text:'Hi! Ask me about any LitLab guide, published book profile, English concept, practice skill, or something visible on the page. Spelling mistakes are fine.',suggestions:['How do I stop summarizing?','What is the difference between effect and meaning?','What should I practice?']};
  if(/\b(where am i|this page|what can i do here|help on this page|what is on this page)\b/.test(clean))return pageContextReply();
  if(activeMode==='explain'&&(clean==='this'||clean==='explain this'||clean==='help with this'))return {text:`Tell me the exact term, sentence, thesis, or idea you want explained. You’re currently on ${routeLabel()}, and I can also use the content visible on this page.`,suggestions:['Explain evaluation','Explain juxtaposition','Explain Paper 2 comparison']};

  const coached=writingCoach(query);if(coached)return coached;

  if(/\b(effect vs meaning|effect and meaning|difference between effect and meaning|meaning vs effect)\b/.test(clean))return {text:'Effect is what a choice creates or changes in the text or audience experience—for example tension, pace, emphasis, intimacy, distance, contrast, or uncertainty. Meaning is the interpretation that follows: what that effect suggests about a character, relationship, theme, value, or wider idea. Strong analysis moves from choice → effect → meaning rather than treating those as the same step.',actions:[{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}]};
  if(/\b(summary vs analysis|analysis vs summary|stop summarizing|stop summary)\b/.test(clean))return {text:'Summary tells what happens or what is said. Analysis explains how a creator’s choices construct an effect and what that effect suggests. A useful test is: could the sentence exist without discussing a choice, effect, or interpretation? If yes, it may still be summary.',actions:[{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}]};

  const results=ranked(query);
  const best=results[0];
  if(best&&best.score>=5.2){
    const compareIntent=/\b(vs|versus|difference|different|compare|comparison|contrast|between)\b/.test(clean);
    const second=results.find(item=>item.doc.id!==best.doc.id&&item.score>=Math.max(5.2,best.score*.72)&&item.doc.title!==best.doc.title);
    if(compareIntent&&second){
      const text=`Two LitLab entries are especially relevant.\n\n${best.doc.title}: ${clip(best.doc.body,470)}\n\n${second.doc.title}: ${clip(second.doc.body,470)}\n\nThe useful comparison is the relationship between those two explanations, not just the labels. If the text supports more than one interpretation, explain which reading fits your evidence best.`;
      const actions=[actionFrom(best.doc.action),actionFrom(second.doc.action)].filter((item):item is TutorAction=>Boolean(item)).slice(0,2);
      return {text,actions:actions.length?actions:undefined};
    }
    const fuzzyNote=best.fuzzy&&!best.doc.normTitle.includes(clean)&&!clean.includes(best.doc.normTitle)?' I matched this approximately, so spelling does not need to be exact.':'';
    const openMind=['Book theme','Book authorial choice','Book symbol','Book motif','Interpretation'].includes(best.doc.category)?' This is a supported LitLab reading, not the only interpretation a text could allow.':'';
    return {text:`${best.doc.title}: ${clip(best.doc.body)}${fuzzyNote}${openMind}`,actions:best.doc.action?[actionFrom(best.doc.action)!]:undefined};
  }

  if(activeMode==='explain')return {text:`I couldn’t match that confidently enough to a published LitLab entry. Try keeping the key noun in the question—even with spelling mistakes—or paste the sentence/term you mean. I won’t invent a book detail or an official IB rule that LitLab does not contain.`,suggestions:['What can I do on this page?','Explain evaluation','Explain a command term']};
  return {text:'I could not match that confidently enough yet. Try the same question with the main topic included—for example the book title, Paper 1, Paper 2, IO, EE, a technique, or the skill you mean. I tolerate spelling mistakes, but I still avoid guessing when the site does not support an answer.',actions:[{label:'Open Toolkit',route:'glossary'},{label:'Open Skills Lab',route:'skills'}],suggestions:['What can I do on this page?','What is evaluation?','Help me with a thesis']};
}

const practices:PracticeItem[]=[
  {question:'Which sentence is the strongest analysis?',options:['The writer uses imagery in the description of the window.','The window is important because Mara looks at it.','The contrast between the bright field and cold classroom uses visual imagery to make freedom feel physically close but inaccessible, reinforcing Mara’s conflict between desire and obligation.','The writer uses lots of techniques to interest the reader.'],correct:2,explanation:'The strongest option moves through choice → effect → interpretation → wider idea rather than stopping at identification.',review:{label:'Open Analysis Lab',route:'skills',skill:'analysis'}},
  {question:'Which thesis has the strongest evaluative direction?',options:['The writer uses imagery, repetition and symbolism.','The text is about power and has many techniques.','Through repeated clock imagery and fragmented syntax, the writer effectively presents pressure as a force that narrows the student’s ability to think clearly.','Power is shown throughout the text.'],correct:2,explanation:'It names meaningful choices, gives an arguable interpretation, and makes an evaluative judgment that can be supported.',review:{label:'Open Thesis Lab',route:'skills',skill:'thesis'}},
  {question:'Which sentence contains genuine evaluation?',options:['The writer effectively uses contrast.','The writer uses contrast to show difference.','The abrupt contrast is particularly effective because it interrupts the confident public message with a private image of rejection, exposing the gap between belonging and exclusion.','The contrast makes the reader feel something.'],correct:2,explanation:'Evaluation needs a judgment plus a reason. “Effective” by itself is not evaluation.',review:{label:'Open Evaluation Lab',route:'skills',skill:'evaluation'}},
  {question:'Which Paper 2 comparison is strongest?',options:['Both works show power.','Work A has power. Work B also has power.','Both writers question authority, but while Work A makes control visible through public ritual, Work B presents it through private relationships, creating different forms of pressure.','The books are similar but also different.'],correct:2,explanation:'It compares the shared concept and different authorial methods inside one line of reasoning.',review:{label:'Open Paper 2',route:'paper-2'}},
  {question:'Which is analysis rather than summary?',options:['Sami receives a rejection letter and folds it in his hand.','The audience stands and applauds.','The repeated folding of the rejection letter turns exclusion into a physical action, contrasting sharply with the public slogan of unity above the stage.','Sami is sitting in the third row.'],correct:2,explanation:'It explains how a detail is constructed and what the contrast suggests rather than only retelling events.',review:{label:'Practice Analysis Lab',route:'skills',skill:'analysis'}},
  {question:'Which global-issue direction is the most focused?',options:['Power','Problems in society','How institutional expectations can restrict individual identity and belonging','People and life'],correct:2,explanation:'It is specific enough to analyze while still extending beyond one character or scene. Both chosen works still need to support it.',review:{label:'Open IO guide',route:'io'}},
  {question:'What should come after identifying an authorial choice?',options:['Immediately list another technique','Explain its effect and what that effect suggests','Repeat the quotation','Add a sophisticated transition word'],correct:1,explanation:'Identification is only the beginning. The next useful move is effect, then meaning, evaluation, and connection.',review:{label:'Open Start Here',route:'start'}},
  {question:'Which sentence uses “evaluate” correctly?',options:['The writer has a metaphor.','The metaphor is effective.','The metaphor is especially effective because its repeated confinement imagery makes the character’s loss of agency increasingly visible.','The metaphor means the reader is interested.'],correct:2,explanation:'A supported judgment explains why the method is effective and what it accomplishes.',review:{label:'Open Command Terms',route:'glossary',toolkitMode:'commands'}},
  {question:'Which Paper 2 preparation is most flexible?',options:['Memorize one full essay and force it onto the question.','Memorize every page of both books.','Know key moments, methods, themes, short useful quotations, and several adaptable comparisons.','Only memorize plot summaries.'],correct:2,explanation:'Paper 2 uses an unseen question, so flexible knowledge is more useful than a fixed rehearsed essay.',review:{label:'Open Paper 2',route:'paper-2'}},
  {question:'Which approach to interpretation is strongest?',options:['There is always exactly one hidden correct meaning.','Any interpretation is correct even without evidence.','A reading can be different from someone else’s if it is precise, evidence-based, and fits the text.','Technique labels matter more than explaining meaning.'],correct:2,explanation:'Literary interpretation allows defensible alternatives, but the evidence and reasoning still have to support the claim.',review:{label:'Open Analysis Lab',route:'skills',skill:'analysis'}}
];

function tutorIcon(){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M12 3.5 13.5 8l4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5L6 9.5 10.5 8 12 3.5Z" fill="currentColor"/><path d="M18.2 14.4 19 17l2.6.8L19 18.6l-.8 2.6-.8-2.6-2.6-.8 2.6-.8.8-2.6Z" fill="currentColor"/></svg>'}
function arrowIcon(){return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
function closeIcon(){return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'}

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
      if(button)button.click();else if(attempt<14)setTimeout(()=>trySelect(attempt+1),80);
    };
    setTimeout(()=>trySelect(),100);
  }
}

function createTutor(){
  if(document.querySelector('.litlab-tutor'))return;
  const root=document.createElement('div');root.className='litlab-tutor';
  root.innerHTML=`
    <button class="tutor-launcher" type="button" aria-label="Open LitLab Tutor" aria-expanded="false"><span class="tutor-launcher-icon">${tutorIcon()}</span><span class="tutor-launcher-copy"><b>Ask LitLab</b><small>Site-aware tutor</small></span></button>
    <section class="tutor-panel" role="dialog" aria-label="LitLab Tutor" aria-hidden="true">
      <header class="tutor-head"><div class="tutor-brand"><span>${tutorIcon()}</span><div><b>LitLab Tutor</b><small>DP English study companion</small></div></div><button class="tutor-close" type="button" aria-label="Close LitLab Tutor">${closeIcon()}</button></header>
      <div class="tutor-context"><span class="tutor-status-dot"></span><span>Site-aware • Private</span><i></i><span class="tutor-page-context"></span></div>
      <div class="tutor-modes" role="tablist" aria-label="Tutor mode"><button type="button" data-tutor-mode="ask" role="tab">Ask</button><button type="button" data-tutor-mode="explain" role="tab">Explain</button><button type="button" data-tutor-mode="practice" role="tab">Practice</button></div>
      <div class="tutor-messages" aria-live="polite"></div>
      <div class="tutor-compose"><div class="tutor-input-wrap"><textarea class="tutor-input" rows="1" autocomplete="off" maxlength="900" placeholder="Ask a DP English question…" aria-label="Ask LitLab Tutor"></textarea><button class="tutor-send" type="button" aria-label="Send question">${arrowIcon()}</button></div><small class="tutor-disclaimer">Built-in LitLab guidance, not generative AI. It can handle approximate spelling and search published site content. Verify exact current IB requirements with official guidance and your teacher.</small></div>
    </section>`;
  document.body.append(root);

  const launcher=root.querySelector<HTMLButtonElement>('.tutor-launcher')!;
  const panel=root.querySelector<HTMLElement>('.tutor-panel')!;
  const close=root.querySelector<HTMLButtonElement>('.tutor-close')!;
  const messages=root.querySelector<HTMLElement>('.tutor-messages')!;
  const input=root.querySelector<HTMLTextAreaElement>('.tutor-input')!;
  const send=root.querySelector<HTMLButtonElement>('.tutor-send')!;
  const context=root.querySelector<HTMLElement>('.tutor-page-context')!;
  const modeButtons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tutor-mode]'));

  const scrollEnd=()=>{messages.scrollTop=messages.scrollHeight};
  const growInput=()=>{input.style.height='auto';input.style.height=`${Math.min(104,Math.max(36,input.scrollHeight))}px`};
  function syncContext(){context.textContent=routeLabel()}
  function syncMode(){
    modeButtons.forEach(button=>{const selected=button.dataset.tutorMode===mode;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected))});
    input.placeholder=mode==='ask'?'Ask anything in LitLab…':mode==='explain'?'Paste or name what you want explained…':'Practice mode — choose an answer above';
    input.disabled=mode==='practice';send.disabled=mode==='practice';
    if(mode!=='practice')growInput();
  }
  function openTutor(){
    root.classList.add('open');document.body.classList.add('litlab-tutor-open');launcher.setAttribute('aria-expanded','true');panel.setAttribute('aria-hidden','false');syncContext();
    if(!messages.children.length)welcome();if(mode!=='practice')setTimeout(()=>input.focus(),reduceMotion()?0:150);
  }
  function closeTutor(){root.classList.remove('open');document.body.classList.remove('litlab-tutor-open');launcher.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true');launcher.focus()}
  function addMessage(kind:'user'|'tutor',text:string){
    const wrap=document.createElement('div');wrap.className=`tutor-message ${kind}`;const bubble=document.createElement('div');bubble.className='tutor-bubble';bubble.textContent=text;wrap.append(bubble);messages.append(wrap);scrollEnd();return wrap;
  }
  function addReply(reply:TutorReply){
    const wrap=addMessage('tutor',reply.text);
    if(reply.actions?.length){const actions=document.createElement('div');actions.className='tutor-actions';reply.actions.forEach(action=>{const button=document.createElement('button');button.type='button';button.innerHTML=`<span>${action.label}</span>${arrowIcon()}`;button.addEventListener('click',()=>{go(action);closeTutor()});actions.append(button)});wrap.append(actions)}
    if(reply.suggestions?.length){const chips=document.createElement('div');chips.className='tutor-suggestions';reply.suggestions.forEach(suggestion=>{const button=document.createElement('button');button.type='button';button.textContent=suggestion;button.addEventListener('click',()=>ask(suggestion));chips.append(button)});wrap.append(chips)}
    scrollEnd();
  }
  function welcome(){addReply({text:`Hi! I’m the site-aware LitLab Tutor. You’re on ${routeLabel()}. I search LitLab’s guides, published book profiles, reference material, and the content visible on your current page. Spelling does not have to be perfect, and evidence-based alternative interpretations are welcome.`,suggestions:['What can I do on this page?','How do I stop summarizing?','Ask about a book character or symbol']})}
  function ask(value?:string){
    const question=(value??input.value).trim();if(!question)return;addMessage('user',question);input.value='';growInput();window.setTimeout(()=>addReply(answerQuery(question,mode)),reduceMotion()?0:90);
  }
  function showPractice(){
    practiceAnswered=false;const item=practices[practiceIndex%practices.length];const wrap=addMessage('tutor',item.question);wrap.classList.add('practice-message');const options=document.createElement('div');options.className='tutor-practice-options';
    item.options.forEach((option,index)=>{const button=document.createElement('button');button.type='button';button.textContent=option;button.addEventListener('click',()=>{if(practiceAnswered)return;practiceAnswered=true;options.querySelectorAll<HTMLButtonElement>('button').forEach((btn,i)=>{btn.disabled=true;if(i===item.correct)btn.classList.add('correct');else if(i===index)btn.classList.add('wrong')});const feedback=document.createElement('div');feedback.className='tutor-practice-feedback';const lead=document.createElement('b');lead.textContent=index===item.correct?'Correct — nice reasoning.':'Not quite — use the feedback.';const explanation=document.createElement('p');explanation.textContent=item.explanation;feedback.append(lead,explanation);if(item.review){const review=document.createElement('button');review.type='button';review.className='tutor-review-link';review.innerHTML=`${item.review.label}${arrowIcon()}`;review.addEventListener('click',()=>{go(item.review!);closeTutor()});feedback.append(review)}const next=document.createElement('button');next.type='button';next.className='tutor-next-practice';next.textContent='Next practice question';next.addEventListener('click',()=>{practiceIndex=(practiceIndex+1)%practices.length;showPractice()});feedback.append(next);wrap.append(feedback);scrollEnd()});options.append(button)});
    wrap.append(options);scrollEnd();
  }

  launcher.addEventListener('click',()=>root.classList.contains('open')?closeTutor():openTutor());close.addEventListener('click',closeTutor);send.addEventListener('click',()=>ask());
  input.addEventListener('input',growInput);input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();ask()}});
  modeButtons.forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.tutorMode as TutorMode;localStorage.setItem('litlabTutorMode',mode);syncMode();if(mode==='practice')showPractice();else{addReply(mode==='explain'?{text:'Explain mode: paste a short thesis or analytical sentence, name a term, or ask why an idea works. I’ll use LitLab’s published guidance and give flexible feedback rather than forcing one formula.',suggestions:['Explain evaluation','Explain juxtaposition','Check this analysis sentence']}: {text:`Ask mode: ask about any published LitLab content or something visible on ${routeLabel()}. Typos are okay.`,suggestions:['What can I do on this page?','What should I practice?']});setTimeout(()=>input.focus(),0)}}));
  window.addEventListener('hashchange',()=>setTimeout(syncContext,80));document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.classList.contains('open'))closeTutor()});
  syncMode();syncContext();growInput();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createTutor,{once:true});else createTutor();
