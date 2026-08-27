import './tutor-smart-layer.css';
import {siteDocs,type SiteDoc} from './tutor-site-knowledge';

type TutorMode='ask'|'explain'|'practice';
type Concept={definition:string;effect:string;example:string;use:string};
type Ranked={doc:SiteDoc;score:number};
type SmartReply={text:string;actions?:{label:string;route:string}[];suggestions?:string[];topic?:string};

type Turn={query:string;topic:string;answer:string};
const history:Turn[]=[];

const STOP=new Set('a an and are as at be been being but by can could did do does for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this to was we were what when where which who why with would you your'.split(' '));
const ALIASES:Record<string,string>={
  analyse:'analyze',analysis:'analyze',analysing:'analyze',analysed:'analyze',
  characterisation:'characterization',focalisation:'focalization',organisation:'organization',
  p1:'paper 1',p2:'paper 2',io:'individual oral',ee:'extended essay',hl:'higher level',
  juxtapose:'juxtaposition',symbolic:'symbolism',metaphorical:'metaphor',rhetorical:'rhetoric'
};

const CONCEPTS:Record<string,Concept>={
  metaphor:{definition:'A metaphor describes one thing in terms of another without using “like” or “as”.',effect:'It creates an implied comparison that can reshape how the reader understands an idea, person, object, or relationship.',example:'Calling a city “a machine” can suggest efficiency, repetition, dehumanization, or lack of freedom depending on context.',use:'Do not stop at “this is a metaphor.” Explain what qualities are transferred by the comparison and why those qualities matter.'},
  simile:{definition:'A simile makes an explicit comparison, usually using “like” or “as”.',effect:'It can make an abstract idea concrete, create imagery, establish tone, or guide the audience toward a particular association.',example:'“The room was silent like a sealed vault” could create a sense of isolation or pressure.',use:'Analyze the specific qualities of the comparison rather than simply naming the device.'},
  imagery:{definition:'Imagery is descriptive language that appeals to sensory experience or creates a vivid mental picture.',effect:'It can establish atmosphere, make an idea concrete, intensify emotion, or repeatedly associate a subject with particular sensations.',example:'Cold metallic imagery around a workplace may make it feel impersonal or oppressive.',use:'Identify the pattern or sensory field, then explain what atmosphere or interpretation it constructs.'},
  diction:{definition:'Diction is the creator’s deliberate choice of words and their connotations.',effect:'Word choice shapes tone, attitude, characterization, audience positioning, and the values attached to an idea.',example:'Calling a protest “a disturbance” rather than “a movement” frames the event very differently.',use:'Quote or identify the precise word and unpack its connotations instead of saying only “the author uses diction.”'},
  syntax:{definition:'Syntax is the arrangement and structure of words, phrases, and clauses in sentences.',effect:'Sentence structure can control pace, emphasis, clarity, tension, fragmentation, authority, or uncertainty.',example:'A series of very short sentences can create urgency or blunt certainty.',use:'Describe the actual structural feature—short clauses, repetition, interruption, parallelism—and connect it to effect and meaning.'},
  juxtaposition:{definition:'Juxtaposition places two ideas, images, characters, settings, or moments close together so their relationship becomes noticeable.',effect:'It often emphasizes contrast, similarity, hypocrisy, change, conflict, or competing values.',example:'A luxurious celebration immediately beside an image of poverty can expose inequality.',use:'Explain exactly what is being placed together, what difference or similarity becomes visible, and why that matters.'},
  symbolism:{definition:'Symbolism occurs when a concrete object, image, color, place, or action carries meaning beyond its literal role.',effect:'A recurring symbol can condense a larger theme, value, conflict, or psychological state into something tangible.',example:'A locked door might come to represent exclusion, secrecy, safety, or lost freedom depending on its repeated context.',use:'Base symbolic claims on patterns in the text. Avoid assuming that every object automatically represents something.'},
  motif:{definition:'A motif is a recurring element—such as an image, phrase, object, situation, or idea—that develops significance through repetition.',effect:'Repetition lets meaning accumulate and can connect different moments or stages of a character or argument.',example:'Repeated references to mirrors might build a motif of identity, self-surveillance, or fractured self-image.',use:'Track how the recurring element changes or develops instead of treating every repetition as identical.'},
  tone:{definition:'Tone is the creator’s attitude toward the subject, audience, or situation, communicated through choices such as diction, syntax, imagery, and structure.',effect:'Tone influences how the audience interprets the subject and can reveal confidence, irony, hostility, intimacy, urgency, detachment, and more.',example:'Formal vocabulary combined with clipped commands may create an authoritative tone.',use:'Name a precise tone and prove it through specific choices rather than labeling tone as simply “positive” or “negative.”'},
  mood:{definition:'Mood is the emotional atmosphere experienced by the audience.',effect:'It shapes how a scene or text feels—tense, nostalgic, unsettling, hopeful, claustrophobic, and so on.',example:'Dark imagery, silence, and delayed information may create an ominous mood.',use:'Distinguish mood from tone: mood describes atmosphere; tone describes the creator’s attitude.'},
  irony:{definition:'Irony involves a meaningful gap between appearance and reality, expectation and outcome, words and intended meaning, or what different people know.',effect:'It can create humor, criticism, tension, sympathy, or expose contradiction and hypocrisy.',example:'A character praising “freedom” while controlling everyone around them can create situational or thematic irony.',use:'Identify the two conflicting levels and explain what the gap reveals.'},
  satire:{definition:'Satire uses humor, exaggeration, irony, parody, or ridicule to criticize behavior, institutions, values, or social problems.',effect:'It entertains while exposing flaws and encouraging the audience to question what is being criticized.',example:'An exaggerated advertisement that treats a trivial product as morally essential can satirize consumer culture.',use:'Explain the target of the satire, the method used, and the criticism produced.'},
  allusion:{definition:'An allusion is an indirect reference to another text, event, person, myth, religion, artwork, or cultural idea.',effect:'It can bring outside associations into the text quickly, deepen characterization, or create comparison and irony.',example:'Describing a difficult journey as an “Odyssey” invokes associations with long struggle and return.',use:'Only analyze an allusion when the reference is reasonably supportable and relevant to the argument.'},
  anaphora:{definition:'Anaphora is repetition at the beginning of successive clauses, sentences, or lines.',effect:'It can build rhythm, emphasis, momentum, memorability, or emotional intensity.',example:'“We will learn. We will adapt. We will rebuild.” creates cumulative emphasis.',use:'Explain why the repeated opening matters in that context and how the sequence develops.'},
  antithesis:{definition:'Antithesis places contrasting ideas in a balanced or parallel structure.',effect:'It sharpens opposition and can make an argument more memorable or present a conflict as clear and decisive.',example:'“We need courage, not comfort” places competing values in direct opposition.',use:'Analyze both the contrast and the balanced structure that makes it forceful.'},
  hyperbole:{definition:'Hyperbole is deliberate exaggeration for emphasis rather than literal accuracy.',effect:'It can intensify emotion, create humor, dramatize a viewpoint, or reveal a speaker’s state of mind.',example:'“I waited a thousand years” exaggerates duration to communicate frustration.',use:'Explain what feeling or attitude the exaggeration magnifies.'},
  euphemism:{definition:'A euphemism replaces a direct or uncomfortable expression with a softer or less explicit one.',effect:'It can reduce discomfort, hide responsibility, manipulate perception, create politeness, or reveal social values.',example:'“Collateral damage” can distance an audience from the human consequences of violence.',use:'Compare the euphemistic wording with the more direct reality it obscures or softens.'},
  caesura:{definition:'A caesura is a noticeable pause within a line, often created by punctuation or syntax.',effect:'It can interrupt rhythm, create hesitation, emphasize a contrast, or make a thought feel fractured.',example:'“I wanted to speak — but nothing came.” uses the pause to dramatize interruption.',use:'Connect the pause to voice, rhythm, thought, or emotion rather than naming punctuation alone.'},
  enjambment:{definition:'Enjambment occurs when a poetic sentence or phrase continues beyond the end of a line without a strong pause.',effect:'It can speed movement, create suspense, connect ideas, or produce tension between line and sentence structure.',example:'A thought that spills into the next line may imitate urgency or continuation.',use:'Explain what the line break delays, emphasizes, or connects.'},
  characterization:{definition:'Characterization is the set of choices through which a character is constructed.',effect:'Dialogue, action, description, relationships, focalization, and contrast can shape the audience’s understanding of identity, values, motives, and change.',example:'A character who repeatedly avoids direct answers may be constructed as evasive, fearful, strategic, or conflicted.',use:'Name the specific method of characterization and connect it to a larger interpretation.'},
  focalization:{definition:'Focalization describes whose perspective filters the information the audience receives.',effect:'It controls access to knowledge and can create intimacy, bias, limitation, suspense, or unreliable interpretation.',example:'A scene filtered through a frightened child may make ordinary events appear threatening.',use:'Separate who tells the story from whose perspective organizes perception when that distinction matters.'},
  'unreliable narrator':{definition:'An unreliable narrator is a narrator whose account the audience has reason not to accept completely at face value.',effect:'Unreliability creates interpretive tension and can expose bias, self-deception, limited knowledge, or manipulation.',example:'Contradictions between a narrator’s claims and observable events may make their version doubtful.',use:'Point to textual evidence of unreliability rather than assuming first-person narration is automatically unreliable.'},
  foreshadowing:{definition:'Foreshadowing plants details that gain significance because they anticipate or prepare for later developments.',effect:'It can create suspense, inevitability, dramatic irony, or thematic coherence.',example:'Repeated warnings about a bridge before a later accident may make the outcome feel prepared rather than random.',use:'Explain how the earlier detail changes the audience’s reading once the later event occurs.'},
  allegory:{definition:'An allegory is a sustained narrative in which characters, events, or settings systematically correspond to a wider political, moral, social, or philosophical meaning.',effect:'It allows a story to operate on both literal and symbolic levels.',example:'A fictional society of animals might systematically represent classes or political groups.',use:'Show the sustained pattern of correspondence; one isolated symbol is not enough to establish allegory.'},
  'semantic field':{definition:'A semantic field is a group of words connected by a shared area of meaning.',effect:'A repeated field can build atmosphere, frame a subject, and make certain associations dominate the audience’s interpretation.',example:'Words such as “battle,” “attack,” “defend,” and “victory” create a semantic field of conflict.',use:'Identify several related words and explain what shared framing they create.'},
  'rhetorical question':{definition:'A rhetorical question is asked primarily for effect rather than to receive a direct answer.',effect:'It can challenge the audience, imply an answer, create involvement, express disbelief, or guide reasoning.',example:'“How long can we ignore this?” pressures the audience to accept that action is overdue.',use:'Explain the implied answer and how the question positions the audience.'},
  ethos:{definition:'Ethos is an appeal based on credibility, character, expertise, or trustworthiness.',effect:'It can make an audience more willing to accept a claim because of who appears to support it or how credible the speaker seems.',example:'A doctor citing clinical experience may establish professional credibility.',use:'Analyze how credibility is constructed rather than merely saying “the author uses ethos.”'},
  pathos:{definition:'Pathos is an appeal to emotion.',effect:'It can create sympathy, fear, hope, guilt, anger, pride, or another emotional response that influences judgment.',example:'A charity showing one individual story can make a large issue emotionally immediate.',use:'Name the emotion, the exact choice that creates it, and how that response supports purpose.'},
  logos:{definition:'Logos is an appeal through reasoning, evidence, examples, statistics, or logical relationships.',effect:'It can make an argument appear rational, structured, and evidence-based.',example:'Comparing measured outcomes before and after a policy can support a causal argument.',use:'Evaluate the quality and relevance of the reasoning rather than assuming any number automatically proves a claim.'},
  thesis:{definition:'A thesis is the central arguable claim that gives an essay its interpretive direction.',effect:'A strong thesis controls what the essay will prove and helps each paragraph contribute to one coherent argument.',example:'Instead of “Both works show power,” argue how the works construct power differently and why that difference matters.',use:'Make it specific, arguable, responsive to the task, and broad enough to support several connected paragraph claims.'},
  analysis:{definition:'Analysis explains how specific choices create effects and how those effects support an interpretation.',effect:'It turns evidence into reasoning instead of leaving quotations or observations unexplained.',example:'Choice → effect → meaning → significance is a useful chain.',use:'Keep asking “how?” and “so what?” after identifying evidence or a technique.'},
  evaluation:{definition:'Evaluation is a supported judgment about significance, effectiveness, limitations, ambiguity, or why a choice matters.',effect:'It pushes an answer beyond explanation by weighing the importance or success of what has been analyzed.',example:'Rather than “this is effective,” explain why the choice is especially effective for that audience, purpose, moment, or theme.',use:'Evaluation must be justified; avoid empty praise words.'},
  context:{definition:'Context is relevant background that helps explain a text, choice, audience, production situation, or interpretation.',effect:'Useful context can sharpen analysis, but irrelevant context can turn an essay into background summary.',example:'A historical restriction matters only if it helps explain a specific representation or choice in the text.',use:'Use context as evidence for interpretation, not as a separate history paragraph.'},
  audience:{definition:'Audience is the group a text is designed to reach, address, influence, or position.',effect:'Creators adapt language, structure, evidence, tone, and design based on assumptions about that audience.',example:'A campaign aimed at teenagers may use informal language, direct address, and platform-specific visuals.',use:'Link audience to actual choices instead of simply naming a demographic.'},
  purpose:{definition:'Purpose is what a creator is trying to make the audience think, feel, understand, question, or do.',effect:'Purpose gives direction to the analysis of choices and audience positioning.',example:'An editorial may aim not only to inform but to make readers view a policy as urgent and unacceptable.',use:'State a precise purpose and show how specific choices serve it.'}
};

function normalize(value:string){
  let text=value.normalize('NFKD').toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-');
  text=text.replace(/\bp\s*1\b/g,'paper 1').replace(/\bp\s*2\b/g,'paper 2').replace(/\bio\b/g,'individual oral').replace(/\bee\b/g,'extended essay').replace(/\b1984\b/g,'nineteen eighty four');
  text=text.replace(/[^a-z0-9\s'-]/g,' ').replace(/\s+/g,' ').trim();
  return text.split(' ').map(token=>ALIASES[token]||token).join(' ');
}
function words(value:string){return normalize(value).split(' ').filter(x=>x&&!STOP.has(x)&&x.length>1)}
function clip(value:string,max=560){
  const clean=value.replace(/\s+/g,' ').trim();
  if(clean.length<=max)return clean;
  const slice=clean.slice(0,max);
  const stop=Math.max(slice.lastIndexOf('. '),slice.lastIndexOf('; '),slice.lastIndexOf(' '));
  return `${slice.slice(0,stop>max*.65?stop:max).trim()}…`;
}
function currentRoute(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

function scoreDoc(query:string,doc:SiteDoc){
  const q=normalize(query);const qWords=words(query);const title=normalize(doc.title);const keys=normalize(doc.keywords.join(' '));const body=normalize(doc.body);
  let score=Number(doc.priority||0);
  if(q===title)score+=30;
  if(q.includes(title)&&title.length>3)score+=14;
  if(title.includes(q)&&q.length>3)score+=10;
  for(const token of qWords){
    if(title.split(' ').includes(token))score+=6;
    else if(keys.includes(token))score+=3.5;
    else if(body.includes(token))score+=1;
  }
  for(const key of doc.keywords){
    const k=normalize(key);if(k.length>3&&q.includes(k))score+=8;
  }
  if(doc.route===currentRoute())score+=1.8;
  return score;
}
function rankDocs(query:string,limit=5):Ranked[]{
  return siteDocs.map(doc=>({doc,score:scoreDoc(query,doc)})).filter(x=>x.score>2.5).sort((a,b)=>b.score-a.score).slice(0,limit);
}

function activeMode():TutorMode{
  const active=document.querySelector<HTMLButtonElement>('.tutor-modes button.active');
  const text=(active?.textContent||'ask').trim().toLowerCase();
  return text.includes('practice')?'practice':text.includes('explain')?'explain':'ask';
}
function wantsSimple(q:string){return /\b(simple|simply|easy|easier|basic|brief|short|eli5|like i am|like i'm|beginner)\b/.test(normalize(q))}
function wantsDepth(q:string,mode:TutorMode){return mode==='explain'||/\b(deep|detailed|detail|thorough|fully|in depth|more explanation|explain more|why exactly)\b/.test(normalize(q))}
function wantsExample(q:string){return /\b(example|for example|show me|demonstrate|sample)\b/.test(normalize(q))}
function isFollowUp(q:string){
  const n=normalize(q);return history.length>0&&words(q).length<=8&&(/\b(it|this|that|those|them|why|how|example|simpler|deeper|again|more|paper 1|paper 2|individual oral)\b/.test(n)||/^(and|but|so|okay|ok)\b/.test(n));
}
function contextualQuery(q:string){
  if(!isFollowUp(q))return q;
  const last=history[history.length-1];return `${last.topic} ${q}`;
}

function conceptFor(query:string):[string,Concept]|null{
  const q=normalize(query);
  const candidates=Object.entries(CONCEPTS).map(([name,entry])=>({name,entry,score:q===name?20:q.includes(name)?12:name.includes(q)&&q.length>3?8:0})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return candidates[0]?[candidates[0].name,candidates[0].entry]:null;
}
function conceptText(name:string,c:Concept,q:string,mode:TutorMode){
  if(wantsSimple(q))return `${name[0].toUpperCase()+name.slice(1)} means: ${c.definition}\n\nSimple example: ${c.example}\n\nIn analysis, the important question is: ${c.use}`;
  if(wantsDepth(q,mode))return `${name[0].toUpperCase()+name.slice(1)}\n\nWhat it is\n${c.definition}\n\nWhat it can do\n${c.effect}\n\nExample\n${c.example}\n\nHow to analyze it\n${c.use}\n\nA useful rule: identify the feature precisely, explain the effect it creates in this specific context, then push into what that effect suggests or reveals. The technique name is the start of analysis, not the conclusion.`;
  return `${name[0].toUpperCase()+name.slice(1)}: ${c.definition}\n\nWhy it matters: ${c.effect}\n\nExample: ${c.example}\n\nFor IB analysis: ${c.use}`;
}

function integrityReply(q:string):SmartReply|null{
  const n=normalize(q);
  const asksWhole=/\b(write|do|complete|make|generate|give me)\b.{0,45}\b(full|entire|whole|ready|final)?\s*(essay|extended essay|hl essay|individual oral script|io script|paper 1 response|paper 2 essay|oral script)\b/.test(n);
  if(!asksWhole)return null;
  return {text:'I can help you build a strong response, but I should not create a ready-to-submit assessed essay, IO script, EE, or other final IB work for you.\n\nI can still do the useful part with you: unpack the question, test your thesis, plan paragraph arguments, identify authorial choices, improve analysis, challenge weak reasoning, and give feedback on your own draft.\n\nSend me the prompt plus your current idea—even if it is rough—and I’ll coach it step by step.',suggestions:['Help me build a thesis','Check my paragraph','How should I plan this?'],topic:'academic integrity'};
}
function quoteReply(q:string):SmartReply|null{
  if(!/\b(exact quote|exact quotation|give me a quote|give me quotations|quotes from|quotation from)\b/.test(normalize(q)))return null;
  return {text:'I can help you locate or paraphrase useful evidence ideas, but I should not invent exact wording. For literary evidence, verify every quotation against your own copy of the text before using it.\n\nTell me the work, character/theme, and argument you are trying to support. I can suggest the kind of moment or evidence to look for and explain how to analyze it.',suggestions:['How do I analyze evidence?','What counts as a strong Paper 2 moment?'],topic:'evidence'};
}

function writingCoach(q:string):SmartReply|null{
  const n=normalize(q);
  const asks=/\b(check|review|feedback|improve|fix|rate|is this good|make this better|what is wrong with)\b/.test(n);
  if(!asks||q.trim().length<55)return null;
  const sample=q.replace(/^.*?(?:[:\-]|\n)/,'').trim();
  if(sample.length<35)return null;
  const hasEvidence=/[“”"']/.test(sample)||/\b(line|word|phrase|scene|moment|image|quotation|quote|evidence)\b/.test(n);
  const choiceTerms=Object.keys(CONCEPTS).filter(term=>!['analysis','evaluation','thesis','context','audience','purpose'].includes(term));
  const choices=choiceTerms.filter(term=>n.includes(term)).slice(0,3);
  const hasEffect=/\b(create|creates|creating|emphasize|highlight|build|evoke|intensify|pace|tension|contrast|distance|intimacy|urgency|tone|mood|positions|makes the reader|causes)\b/.test(n);
  const hasMeaning=/\b(suggest|imply|reveal|represent|symbolize|indicate|reflect|demonstrate|portray|construct|shows that|reveals that)\b/.test(n);
  const hasEval=/\b(effective|significant|important|powerful|convincing|successful|limited|ambiguous|because|therefore|ultimately)\b/.test(n);
  const strengths:string[]=[];const priorities:string[]=[];
  if(hasEvidence)strengths.push('it refers to textual evidence or a specific textual moment');else priorities.push('anchor the claim in a precise word, image, structural feature, or moment');
  if(choices.length)strengths.push(`it identifies ${choices.join(', ')}`);else priorities.push('name the most precise authorial choice you can actually observe');
  if(hasEffect)strengths.push('it explains an effect');else priorities.push('state what the choice creates—such as tension, emphasis, contrast, pace, intimacy, distance, or a particular tone');
  if(hasMeaning)strengths.push('it moves into interpretation');else priorities.push('push from effect to meaning: what does this suggest about the character, relationship, theme, value, or issue?');
  if(hasEval)strengths.push('it contains evaluative reasoning');else priorities.push('add significance only when you can justify why the choice is especially important, effective, limited, or ambiguous');
  const verdict=strengths.length>=4?'This is already analytically strong in structure.':strengths.length>=2?'This has a solid base, but the reasoning chain can be tightened.':'This currently reads more like a starting observation than developed analysis.';
  const revision=`${verdict}\n\nWhat is working\n${strengths.length?strengths.map(x=>`• ${x}`).join('\n'):'• You have a claim worth developing.'}\n\nBest next improvements\n${priorities.length?priorities.slice(0,4).map(x=>`• ${x}`).join('\n'):'• Make sure every interpretive claim is genuinely supported by the wording and context.'}\n\nSelf-check\nCan a reader trace this chain: evidence → choice → effect → meaning → significance? If one arrow is missing, that is the best place to revise.`;
  return {text:revision,suggestions:['Show me how to add evaluation','What is effect vs meaning?','Help me improve my thesis'],topic:'writing feedback'};
}

function parseComparison(q:string){
  const n=normalize(q);
  let match=n.match(/(?:difference between|compare)\s+(.+?)\s+(?:and|with)\s+(.+)/);
  if(!match)match=n.match(/(.+?)\s+vs\.?\s+(.+)/);
  if(!match)return null;
  const clean=(s:string)=>s.replace(/^(the|a|an)\s+/,'').replace(/\b(explain|please|difference|compare)\b/g,'').trim();
  return [clean(match[1]),clean(match[2])] as [string,string];
}
function lookupThing(term:string){
  const concept=conceptFor(term);if(concept)return {title:concept[0],body:`${concept[1].definition} ${concept[1].effect}`,concept:concept[1]};
  const ranked=rankDocs(term,1);if(ranked[0]&&ranked[0].score>5)return {title:ranked[0].doc.title,body:ranked[0].doc.body,doc:ranked[0].doc};
  return null;
}
function comparisonReply(q:string):SmartReply|null{
  const pair=parseComparison(q);if(!pair)return null;
  const a=lookupThing(pair[0]);const b=lookupThing(pair[1]);if(!a||!b)return null;
  return {text:`${a.title} vs ${b.title}\n\n${a.title}\n${clip(a.body,360)}\n\n${b.title}\n${clip(b.body,360)}\n\nThe key distinction\nDo not choose between them by label alone. Ask what feature is actually present and what analytical job the term helps you explain. If both labels are defensible, use the more precise one and justify it with the text.`,suggestions:['Give me an example','How would I write this in analysis?'],topic:`${a.title} vs ${b.title}`};
}

function synthesizeDocs(q:string,mode:TutorMode,ranked:Ranked[]):SmartReply{
  const best=ranked[0].doc;const secondary=ranked.slice(1,3).map(x=>x.doc).filter(doc=>doc.id!==best.id);
  const simple=wantsSimple(q);const deep=wantsDepth(q,mode);const example=wantsExample(q);
  let text='';
  if(simple){
    text=`${best.title}, simply:\n${clip(best.body,420)}`;
  }else if(deep){
    text=`${best.title}\n\nCore idea\n${clip(best.body,650)}`;
    if(secondary.length)text+=`\n\nConnected ideas\n${secondary.map(doc=>`• ${doc.title}: ${clip(doc.body,260)}`).join('\n')}`;
    text+=`\n\nHow to use this analytically\nMove from a precise observation to its effect, then interpret what that effect suggests and connect it to the task. Avoid adding a technique label or contextual fact unless it actually changes the reasoning.`;
  }else{
    text=`${best.title}: ${clip(best.body,520)}`;
    if(secondary[0]&&secondary[0].category!==best.category)text+=`\n\nUseful connection: ${secondary[0].title} — ${clip(secondary[0].body,220)}`;
  }
  if(example&&!/\bexample\b/i.test(text))text+=`\n\nExample method\nTake one precise detail, name the choice only if the label is defensible, explain the immediate effect, then ask “so what does that reveal or suggest?” That final move turns identification into analysis.`;
  const actions:Array<{label:string;route:string}>=[];const seen=new Set<string>();
  for(const item of ranked){if(item.doc.action&&!seen.has(item.doc.action.route)){seen.add(item.doc.action.route);actions.push({label:item.doc.action.label,route:item.doc.action.route});if(actions.length===2)break}}
  return {text,actions,suggestions:['Explain it more simply','Give me an example','Why does this matter?','Test me on this'],topic:best.title};
}

function broadEnglishFallback(q:string):SmartReply{
  const n=normalize(q);
  if(/\b(grammar|sentence|comma|semicolon|colon|apostrophe|passive voice|active voice)\b/.test(n))return {text:'I can help with grammar and writing as well. Paste the exact sentence and tell me what you want to know—correctness, punctuation, clarity, concision, tone, or why a rule applies. I’ll explain the rule and the reasoning rather than only giving a correction.',suggestions:['Check this sentence','Explain active vs passive voice'],topic:'grammar'};
  if(/\b(poem|poetry|novel|play|advertisement|speech|article|cartoon|photograph|poster|comic|memoir|prose)\b/.test(n))return {text:'I can analyze that kind of text with you. Give me the extract, describe the feature you notice, or paste the sentence/image wording you are working from. I can help you move through: notice → authorial choice → effect → meaning → evaluation → wider connection.\n\nI will not invent details that are not in the text, so the more specific evidence you give me, the stronger the explanation can be.',suggestions:['How do I start analyzing it?','What authorial choices should I look for?'],topic:'text analysis'};
  return {text:`I’m strongest on DP English, literature, language analysis, writing, Paper 1, Paper 2, the IO, EE/HL Essay skills, and the content published in LitLab. I don’t have a reliable source for that exact question yet, so I would rather not invent an answer.\n\nIf this is an English question, give me the term, sentence, extract, prompt, or context and I can usually reason through it with you. If it depends on an exact external fact, verify that fact with your teacher or a current reliable source.`,suggestions:['Explain an English term','Check my analysis','Help me understand this page'],topic:'general help'};
}

function smartAnswer(raw:string,mode:TutorMode):SmartReply{
  const q=raw.trim();const n=normalize(q);
  if(!q)return {text:'Ask me anything about DP English, a LitLab page, an authorial choice, a text, or your own draft.',topic:'help'};
  if(/^(hi|hello|hey|yo|hii+|heyy+)\b/.test(n))return {text:'Hi! I can explain concepts, compare techniques, coach your writing, unpack assessment questions, use the current LitLab page as context, and follow up on what we were just discussing. Try giving me a term, a prompt, or a sentence from your own analysis.',suggestions:['Explain juxtaposition','How do I stop summarizing?','Check my paragraph','What should I practice?'],topic:'help'};
  const integrity=integrityReply(q);if(integrity)return integrity;
  const quote=quoteReply(q);if(quote)return quote;
  const writing=writingCoach(q);if(writing)return writing;
  const compare=comparisonReply(q);if(compare)return compare;

  if(/\b(where am i|what is on this page|what can i do here|help with this page|this page)\b/.test(n)){
    const main=document.querySelector<HTMLElement>('main');const heading=main?.querySelector('h1,h2');
    return {text:`You’re currently on ${heading?.textContent?.trim()||currentRoute()}. I can use the visible content on this page as context. Ask about a heading, term, instruction, example, or paste the exact part that is confusing you.`,suggestions:['Explain the main idea of this page','What should I focus on here?'],topic:heading?.textContent?.trim()||currentRoute()};
  }

  const contextual=contextualQuery(q);
  const concept=conceptFor(contextual);
  if(concept&&(/\b(what is|what does|define|meaning|explain|how does|example|why|difference|use)\b/.test(normalize(contextual))||normalize(contextual).split(' ').length<=4)){
    const [name,c]=concept;
    return {text:conceptText(name,c,q,mode),suggestions:['Give me another example','How do I analyze this in Paper 1?','What is a similar technique?','Test me on this'],topic:name};
  }

  if(/\b(effect vs meaning|effect and meaning|difference between effect and meaning|meaning vs effect)\b/.test(n))return {text:'Effect is the immediate result a choice creates in the text or audience experience—such as tension, pace, emphasis, intimacy, distance, contrast, or uncertainty. Meaning is the interpretation that follows: what that effect suggests about a character, relationship, theme, value, or wider idea.\n\nA useful chain is:\nchoice → effect → meaning\n\nExample: short fragmented sentences → create a broken, breathless pace → suggest that the speaker is panicked or mentally overwhelmed.\n\nIf you jump directly from technique to theme, the reasoning often feels unsupported.',suggestions:['Give me another example','How do I add evaluation?'],topic:'effect vs meaning'};
  if(/\b(summary vs analysis|analysis vs summary|stop summarizing|stop summary|too much summary)\b/.test(n))return {text:'Summary tells the reader what happens or what is said. Analysis explains how a creator constructs meaning.\n\nA quick test: if your sentence could be written without mentioning any deliberate textual choice, it may still be summary.\n\nUpgrade pattern:\n1. What exactly do I notice?\n2. What choice creates it?\n3. What effect does that choice produce?\n4. What does the effect suggest or reveal?\n5. Why is that significant for the task?\n\nUse plot only as brief context for the analytical point.',suggestions:['Show me a summary-to-analysis example','Check my paragraph'],topic:'summary vs analysis'};

  const ranked=rankDocs(contextual,5);
  if(ranked[0]&&ranked[0].score>=5)return synthesizeDocs(q,mode,ranked);
  return broadEnglishFallback(q);
}

function bubble(role:'user'|'assistant',text:string){
  const item=document.createElement('div');item.className=`tutor-message ${role==='user'?'user':'assistant'} smart-tutor-message`;
  const b=document.createElement('div');b.className='tutor-bubble';b.textContent=text;item.appendChild(b);return item;
}
function routeAction(label:string,route:string){
  const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.addEventListener('click',()=>{location.hash=route});return btn;
}
function appendAssistant(reply:SmartReply){
  const messages=document.querySelector<HTMLElement>('.tutor-messages');if(!messages)return;
  const item=bubble('assistant',reply.text);
  if(reply.actions?.length){const row=document.createElement('div');row.className='tutor-actions';reply.actions.slice(0,2).forEach(a=>row.appendChild(routeAction(a.label,a.route)));item.appendChild(row)}
  if(reply.suggestions?.length){const row=document.createElement('div');row.className='tutor-suggestions smart-tutor-suggestions';reply.suggestions.slice(0,4).forEach(s=>{const btn=document.createElement('button');btn.type='button';btn.textContent=s;row.appendChild(btn)});item.appendChild(row)}
  messages.appendChild(item);messages.scrollTop=messages.scrollHeight;
}
function appendUser(text:string){
  const messages=document.querySelector<HTMLElement>('.tutor-messages');if(!messages)return;
  messages.appendChild(bubble('user',text));messages.scrollTop=messages.scrollHeight;
}
function runQuery(text:string){
  const mode=activeMode();if(mode==='practice')return false;
  const clean=text.trim();if(!clean)return true;
  appendUser(clean);
  const input=document.querySelector<HTMLInputElement>('.tutor-input');if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))}
  const thinking=bubble('assistant','Thinking through the strongest explanation…');thinking.classList.add('smart-tutor-thinking');document.querySelector<HTMLElement>('.tutor-messages')?.appendChild(thinking);
  requestAnimationFrame(()=>document.querySelector<HTMLElement>('.tutor-messages')?.scrollTo({top:999999,behavior:'smooth'}));
  window.setTimeout(()=>{
    thinking.remove();const reply=smartAnswer(clean,mode);history.push({query:clean,topic:reply.topic||clean,answer:reply.text});if(history.length>8)history.shift();appendAssistant(reply);
  },90);
  return true;
}

function intercept(event:Event){
  const mode=activeMode();if(mode==='practice')return;
  const target=event.target as HTMLElement|null;if(!target)return;
  if(event.type==='click'){
    const suggestion=target.closest<HTMLButtonElement>('.tutor-suggestions button');
    const send=target.closest<HTMLButtonElement>('.tutor-send');
    if(!suggestion&&!send)return;
    const text=suggestion?.textContent?.trim()||document.querySelector<HTMLInputElement>('.tutor-input')?.value||'';
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();runQuery(text);
  }
  if(event.type==='keydown'&&target.matches('.tutor-input')){
    const key=event as KeyboardEvent;if(key.key!=='Enter'||key.shiftKey||key.isComposing)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();runQuery((target as HTMLInputElement).value);
  }
}
document.addEventListener('click',intercept,true);
document.addEventListener('keydown',intercept,true);

function enhanceLabel(){
  const small=document.querySelector<HTMLElement>('.tutor-brand small');if(small&&!small.dataset.smart){small.dataset.smart='1';small.textContent='Context-aware DP English coach'}
  const launcher=document.querySelector<HTMLElement>('.tutor-launcher-copy small');if(launcher&&!launcher.dataset.smart){launcher.dataset.smart='1';launcher.textContent='Ask • Explain • Coach'}
}
new MutationObserver(enhanceLabel).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceLabel,{once:true});else enhanceLabel();
