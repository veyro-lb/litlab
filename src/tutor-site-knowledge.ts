import {faqs,glossary,searchItems,tips} from './content';
import {approachSteps,choiceGroups,toneBank} from './paper1-data';
import {comparisonPairs,comparativeVocabulary,evidenceChecklist,questionBreakdowns,themes as paper2Themes,mistakes as paper2Mistakes,thesisPairs,paragraphPairs} from './paper2-data';
import {globalIssues,chainExamples,transitionGroups,evaluationExamples as ioEvaluationExamples,deliveryTips,mistakes as ioMistakes} from './io-data';
import './books-frankenstein';
import './books-nineteen-eighty-four';
import './books-persepolis';
import './books-coming-soon';
import {bookProfiles} from './books-data';

export type TutorToolkitMode='glossary'|'keywords'|'commands'|'frames';
export type TutorLink={label:string;route:string;skill?:string;toolkitMode?:TutorToolkitMode};
export type SiteDoc={id:string;title:string;body:string;keywords:string[];route:string;category:string;action?:TutorLink;priority?:number};

const docs:SiteDoc[]=[];
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72);
const sentence=(parts:(string|undefined|null)[])=>parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
function add(category:string,title:string,body:string,keywords:string[],route:string,action?:TutorLink,priority=0){
  if(!body.trim())return;
  docs.push({id:`${slug(category)}-${slug(title)}-${docs.length}`,title,body:body.trim(),keywords:[title,...keywords].filter(Boolean),route,category,action,priority});
}

// Core site navigation, FAQ, glossary, and study tips.
faqs.forEach(item=>add('FAQ',item.q,item.a,[item.q],item.to?.split('#')[0]||'home',item.to?{label:'Open related guide',route:item.to.split('#')[0]}:undefined,1));
glossary.forEach(item=>add('Glossary',item.term,sentence([item.definition,item.example]),[item.term,item.category,'definition','meaning'], 'glossary',{label:'Open Toolkit',route:'glossary',toolkitMode:'glossary'},2));
searchItems.forEach(item=>add('Site guide',item.title,item.preview,[item.title,item.category,'where can i find','open'],item.to.split('#')[0],{label:`Open ${item.title}`,route:item.to.split('#')[0]},.5));
tips.forEach(item=>add('Study tip',item.title,item.text,[item.title,'tip','advice'],currentRouteForTip(item.title),undefined,.25));

function currentRouteForTip(title:string){
  const t=title.toLowerCase();
  if(t.includes('compare'))return 'paper-2';
  if(t.includes('evidence'))return 'books';
  if(t.includes('task'))return 'glossary';
  return 'start';
}

// Paper 1: process, tone, and the full authorial-choice bank.
add('Paper 1','Paper 1 format','LitLab’s current working reference lists Language A: Language & Literature Paper 1 as two previously unseen non-literary texts. SL writes one guided textual analysis on one chosen text; HL writes two separate guided analyses, one on each text. The guide lists SL as 1 hour 15 minutes, 20 marks and 35%, and HL as 2 hours 15 minutes, 40 marks total and 35%. Confirm final exam details with your teacher or current course guide.',['paper 1 time','paper 1 marks','paper 1 weighting','sl paper 1','hl paper 1','guided analysis','unseen non literary'],'paper-1',{label:'Open Paper 1',route:'paper-1'},3);
approachSteps.forEach((step,index)=>add('Paper 1 process',`Paper 1 step ${index+1}: ${step[0]}`,`${step[1]} Mistake to avoid: ${step[2]}`,[step[0],'paper 1 process','unseen approach','annotation'], 'paper-1',{label:'Open Paper 1',route:'paper-1'},1));
toneBank.forEach(item=>add('Tone',item[0],`${item[1]} Example situation: ${item[2]}`,[item[0],'tone','attitude'], 'paper-1',{label:'Open Paper 1 tone guide',route:'paper-1'},1));
Object.entries(choiceGroups).forEach(([group,items])=>items.forEach(item=>add('Authorial choice',item.term,`${item.definition} Typical effect: ${item.effect} Analytical meaning: ${item.meaning} Avoid vague analysis such as: ${item.bad}`,[item.term,group,'authorial choice','technique','device','effect'], 'paper-1',{label:'Practice Authorial Choices',route:'skills',skill:'choices'},2)));
add('Paper 1','Annotation strategy','Annotate selectively for function. Prioritize patterns, contrasts, shifts, repeated words or images, unusual syntax, tone changes, visual choices, and details that connect to audience or purpose. Then group the strongest notes into a few paragraph-level ideas instead of highlighting everything.',['annotate','annotation','highlight','how to annotate','paper 1 notes'],'paper-1',{label:'Open Paper 1',route:'paper-1'},2);
add('Paper 1','Audience, purpose, and context','Audience asks who the text is designed to reach and how choices position that group. Purpose asks what the creator is trying to make the audience think, feel, understand, or do. Context is useful only when it helps explain a textual choice; do not invent unsupported background.',['audience','purpose','context','apc','paper 1 audience'],'paper-1',{label:'Open Paper 1',route:'paper-1'},2);

// Paper 2: prompt decoding, comparison, evidence, planning, and common mistakes.
add('Paper 2','Paper 2 format','LitLab’s current working reference lists Paper 2 as one unseen general essay question chosen from four, using two studied works, closed book, with 1 hour 45 minutes and 30 marks at both SL and HL. The guide lists a weighting of 35% at SL and 25% at HL. Confirm final assessment details with your teacher or current course guide.',['paper 2 time','paper 2 marks','paper 2 weighting','sl paper 2','hl paper 2','closed book','choose one of four'],'paper-2',{label:'Open Paper 2',route:'paper-2'},3);
questionBreakdowns.forEach((item,index)=>add('Paper 2 question',`Paper 2 question decoder ${index+1}`,`Question: ${item.question} Key concept: ${item.concept} Instruction: ${item.instruction} What it needs: ${item.breakdown}`,[item.concept,item.instruction,'decode question','paper 2 prompt'], 'paper-2',{label:'Open Paper 2 question guide',route:'paper-2'},1));
comparisonPairs.forEach((item,index)=>add('Paper 2 comparison',`Comparative writing example ${index+1}`,`Weak: ${item.weak} Stronger: ${item.strong}`,[item.weak,'compare','comparison','paper 2','strong comparison'], 'paper-2',{label:'Open Paper 2 comparison',route:'paper-2'},1));
thesisPairs.forEach((item,index)=>add('Paper 2 thesis',`Comparative thesis example ${index+1}`,`Weak: ${item.weak} Stronger: ${item.strong} What improved: ${item.improved}`,['paper 2 thesis','comparative thesis','thesis example'], 'paper-2',{label:'Open Paper 2 thesis guide',route:'paper-2'},2));
paragraphPairs.forEach((item,index)=>add('Paper 2 paragraph',`Comparative paragraph example ${index+1}`,`Weak: ${item.weak} Stronger: ${item.strong} Why it improves: ${item.note}`,['paper 2 paragraph','integrated comparison','paragraph example'], 'paper-2',{label:'Open Paper 2 paragraphs',route:'paper-2'},1));
add('Paper 2','Comparative vocabulary',`Similarity: ${comparativeVocabulary.similarity.join(', ')}. Contrast: ${comparativeVocabulary.contrast.join(', ')}. Nuance: ${comparativeVocabulary.nuance.join(', ')}. Use connective language to clarify a real comparison, not to fake one.`,['comparison words','comparative vocabulary','transitions','similarly','whereas','conversely'],'paper-2',{label:'Open Paper 2 vocabulary',route:'paper-2'},1);
add('Paper 2','Evidence preparation',evidenceChecklist.join(' '),['paper 2 evidence','memorize paper 2','quotes','scenes','key moments','closed book'],'paper-2',{label:'Open Paper 2 evidence guide',route:'paper-2'},2);
add('Paper 2','Themes and concepts',`Useful starting concepts include ${paper2Themes.join(', ')}. A theme label is only a starting point; turn it into a specific claim about how each work treats the idea.`,['paper 2 themes','themes','concepts','power','identity','belonging'],'paper-2',{label:'Open Paper 2 themes',route:'paper-2'},1);
paper2Mistakes.forEach(item=>add('Paper 2 mistake',item.title,`Why it hurts: ${item.why} Fix: ${item.fix} Example: ${item.example}`,[item.title,'paper 2 mistake','avoid'], 'paper-2',{label:'Open Paper 2 mistakes',route:'paper-2'},1));

// IO: global issue, close-analysis chain, transitions, evaluation, delivery, mistakes.
add('IO','IO timing','LitLab’s IO guide uses a 15-minute assessment shape: about 10 minutes for the prepared oral followed by about 5 minutes of teacher discussion. Use your teacher and current course guidance to confirm the exact procedure that applies to you.',['io time','io timing','10 minutes','5 minutes','individual oral timing'],'io',{label:'Open IO guide',route:'io'},3);
globalIssues.forEach(item=>add('IO global issue',`Global issue: ${item.improved}`,`Too broad: ${item.weak}. Better focus: ${item.improved}. Why: ${item.why}`,[item.weak,item.improved,'global issue','narrow global issue'], 'io',{label:'Open IO guide',route:'io'},2));
chainExamples.forEach((item,index)=>add('IO analysis',`IO analysis chain ${index+1}`,`Choice: ${item.choice} Effect: ${item.effect} Meaning: ${item.meaning} Global issue: ${item.issue} Significance: ${item.significance}`,[item.choice,item.issue,'choice effect meaning global issue','io analysis'], 'io',{label:'Open IO analysis',route:'io'},1));
Object.entries(transitionGroups).forEach(([group,items])=>add('IO transition',`IO transitions: ${group}`,items.join(' '),[group,'io transition','signposting','transition'], 'io',{label:'Open IO guide',route:'io'},1));
add('IO','IO evaluation',ioEvaluationExamples.join(' '),['io evaluation','evaluate in io','effectiveness','significance'],'io',{label:'Open IO guide',route:'io'},1);
deliveryTips.forEach(item=>add('IO delivery',`IO delivery: ${item[0]}`,item[1],[item[0],'io delivery','speaking','oral practice'], 'io',{label:'Open IO delivery guide',route:'io'},1));
ioMistakes.forEach(item=>add('IO mistake',item.title,`Why it hurts: ${item.why} Fix: ${item.fix} Example: ${item.example}`,[item.title,'io mistake','avoid'], 'io',{label:'Open IO guide',route:'io'},1));

// Extended Essay: the main guidance currently published on the EE page.
const eeDocs:[string,string,string[]][]=[
 ['Extended Essay overview','The English-focused EE is an independent DP Core research project built around a focused question, sustained textual analysis, credible research, and a developing line of argument. LitLab lists a 4,000-word maximum and recommends confirming the model that applies to your cohort.',['extended essay','ee','4000 words','dp core','english ee']],
 ['Choosing English for the EE','English is a good fit when you enjoy sustained close analysis, independent reading, and evidence-based humanities argument. If your real question is mainly empirical or data-driven, another subject route may fit better.',['choose english ee','english ee fit','should i do english ee']],
 ['EE research question','Move from curiosity → area of interest → specific topic/material → focused research question → sustained argument. A strong RQ is narrow enough for depth, invites analysis rather than description, and can lead to a debatable answer. How, in what ways, and to what extent often create more analytical room than a yes/no question.',['research question','rq','narrow rq','ee question','how to make rq']],
 ['EE sources and research','Build from the primary text or material and credible secondary scholarship. General summary sites may help orientation but should not replace research. Keep a research log so quotations, paraphrases, ideas, source details, and changes in thinking stay traceable.',['ee sources','secondary sources','research log','scholarly criticism','bibliography']],
 ['EE structure and analysis','Organize the essay around sub-arguments that progressively answer the research question, not around plot chronology. Analysis should dominate. Use context only when it changes or strengthens a specific interpretation, and evaluate significance, limitations, or alternative readings throughout.',['ee structure','ee analysis','ee argument','summary in ee','context ee','evaluation ee']],
 ['EE referencing and academic honesty','Use one required citation style consistently, maintain a complete bibliography, and attribute quotations, paraphrases, and borrowed ideas. Missing attribution is an academic-honesty problem regardless of essay quality.',['ee referencing','citations','bibliography','academic honesty','plagiarism']],
 ['EE supervisor and reflection','Use supervisor meetings as checkpoints for scope, method, and clarity. Keep notes on how your thinking changes so reflection is based on the real research process. Exact reflection forms, session requirements, formatting, and cohort rules should be confirmed with your supervisor or EE coordinator.',['ee supervisor','reflection','rppf','ee meetings','ee coordinator']],
 ['EE May 2027 model note','LitLab’s EE guide is built mainly around the May 2027 model described in its supplied material, including subject-focused and interdisciplinary pathways and a 30-point criteria structure. Confirm with your EE coordinator that this is the model that applies to your cohort before relying on exact procedural details.',['may 2027 ee','30 points','interdisciplinary ee','subject focused ee','criteria']]
];
eeDocs.forEach(item=>add('Extended Essay',item[0],item[1],item[2],'ee',{label:'Open EE guide',route:'ee'},2));

// Skills Lab and flexible writing guidance.
const skillDocs:[string,string,string,string][]=[
 ['Analysis Lab','Build the reasoning chain from what you notice to choice, effect, meaning, evaluation, and wider connection.','analysis lab','analysis'],
 ['Thesis Lab','Practice focused, arguable thesis statements that combine interpretation, relevant methods, and supported evaluative direction.','thesis lab','thesis'],
 ['Authorial Choice Check','Practice identifying authorial choices precisely, distinguishing closely related terms, and connecting the label to effect.','authorial choice check choice bank','choices'],
 ['Evaluation Lab','Practice supported judgments about effectiveness, significance, ambiguity, limitations, and why a choice matters.','evaluation lab','evaluation'],
 ['Paragraph Builder','Practice arranging claim, evidence, choice, effect, interpretation, evaluation, and connection into a logical paragraph.','paragraph builder peel pee','paragraph'],
 ['Mixed Skill Check','Use mixed questions to test several reasoning skills together and identify the next useful practice target.','mixed skill check practice next','mixed'],
 ['Mistake Clinic','Review recurring errors and prioritize the reasoning skill that has caused the most difficulty.','mistake clinic mistakes weak skill','mixed']
];
skillDocs.forEach(item=>add('Skills Lab',item[0],item[1],[item[2],'skills lab','practice'], 'skills',{label:`Open ${item[0]}`,route:'skills',skill:item[3]},2));
add('Interpretation','More than one interpretation can be valid','Literary analysis is not always about finding one secret correct meaning. Different interpretations or technique labels can be defensible when they fit the evidence and context. Prefer the most precise label for the feature you can actually observe, then explain why your reading is convincing. If the text is genuinely ambiguous, acknowledge that ambiguity instead of forcing certainty.',['open minded','multiple interpretations','is my interpretation wrong','different interpretation','ambiguous','can there be two answers'],'start',{label:'Practice analysis',route:'skills',skill:'analysis'},3);

// Toolkit-style command terms, vocabulary and frames. These mirror the language used across LitLab.
const commands:[string,string][]=[
 ['Analyze','Break something down and explain how its choices or parts create meaning.'],['Examine','Look closely at an idea, method, relationship, or feature and investigate how it works.'],['Explore','Investigate an idea from useful angles while developing an argument rather than writing loosely.'],['Interpret','Develop a supported understanding of what a detail, pattern, or text may mean.'],['Explain','Make an idea clear by showing how or why it works.'],['Identify','Recognize and name a relevant feature precisely; identification alone is not full analysis.'],['Justify','Give convincing reasons and evidence for a claim or choice.'],['Evaluate','Make a supported judgment about effectiveness, significance, success, limitation, or impact.'],['Assess','Weigh evidence, strengths, limitations, or competing possibilities before reaching a judgment.'],['To what extent','Decide how far a claim is true, including qualifications or exceptions instead of a simple yes/no.'],['Compare','Develop meaningful similarities while keeping both works in the same line of reasoning.'],['Contrast','Develop meaningful differences and explain why those differences matter.'],['Compare and contrast','Discuss important similarities and differences inside an integrated argument.'],['Discuss','Develop a reasoned argument using relevant evidence, interpretation, and complexity.'],['Consider','Think carefully about the named idea and make it central to the response.'],['How','Focus on method: the choices, structures, or processes through which meaning is created.'],['Why','Focus on significance, cause, purpose, or why a choice matters without pretending you can know an author’s private intention.']
];
commands.forEach(item=>add('Command term',item[0],item[1],[item[0],'command term','question word','task word'], 'glossary',{label:'Open Command Terms',route:'glossary',toolkitMode:'commands'},2));
add('Toolkit','Analytical verbs','Useful verbs include conveys, suggests, implies, emphasizes, reinforces, highlights, establishes, evokes, reveals, constructs, portrays, positions, foregrounds, intensifies, undermines, complicates, challenges, critiques, exposes, mirrors, and shapes. Choose the verb that accurately describes what the textual choice does.',['analytical verbs','better verbs','vocabulary','conveys','suggests','reveals','constructs'],'glossary',{label:'Open Keywords',route:'glossary',toolkitMode:'keywords'},2);
add('Toolkit','Evaluative vocabulary','Useful evaluative language includes effectively, convincingly, successfully, powerfully, subtly, deliberately, strategically, significantly, and ambiguously. These words only count as evaluation when the judgment is supported with a reason.',['evaluation words','evaluative vocabulary','effectively','convincingly','powerfully','subtly'],'glossary',{label:'Open Keywords',route:'glossary',toolkitMode:'keywords'},2);
const frames:[string,string,string][]=[
 ['PEEL+ analytical paragraph','Point → evidence → authorial choice → effect → meaning → evaluation → link. Treat this as a reasoning chain, not a rigid sentence-count formula.','peel pee paragraph frame'],
 ['Choice to effect','By using [choice], the writer [analytical verb] [specific effect], which shapes or emphasizes [response or feature].','choice effect sentence frame'],
 ['Effect to meaning','This [effect] suggests that [interpretation], revealing, reinforcing, or complicating the wider idea that [meaning].','effect meaning sentence frame'],
 ['Evaluation sentence','This choice is particularly effective or significant because [specific reason], allowing the writer to [larger analytical consequence].','evaluation frame sentence starter'],
 ['Analytical thesis','Through [relevant choices], the writer presents [central idea] as [arguable interpretation], revealing [larger significance]. Add evaluative language only where you can support it.','thesis frame analytical thesis'],
 ['Paper 1 thesis','By combining [major choices], the text constructs [focus from the question] as [interpretation], ultimately [wider purpose or significance].','paper 1 thesis frame'],
 ['Paper 2 comparative thesis','Although both works explore [shared concern], Work A presents it as [interpretation A] through [method], whereas Work B uses [method] to present it as [interpretation B], revealing [comparative significance].','paper 2 thesis frame comparative thesis'],
 ['Paper 1 introduction','[Text type or situation] addresses [audience/context if relevant] in order to [broad purpose]. Through [main choices], the creator [analytical claim answering the question].','paper 1 introduction frame'],
 ['Comparison pivot','Where Work A constructs [idea] through [method], Work B achieves, complicates, or challenges a comparable effect through [different method], suggesting [comparative significance].','comparison sentence frame pivot'],
 ['Conclusion','Return to the central interpretation and synthesize what the analysis or comparison has revealed; do not simply repeat the introduction sentence-for-sentence.','conclusion frame ending essay']
];
frames.forEach(item=>add('Sentence frame',item[0],item[1],[item[2],'sentence frame','starter','writing frame'], 'glossary',{label:'Open Sentence Frames',route:'glossary',toolkitMode:'frames'},2));

// Published book profiles. Every profile field becomes searchable Tutor knowledge.
for(const profile of bookProfiles){
  const base=[profile.title,profile.author,profile.id.replace(/-/g,' '),profile.title==='Nineteen Eighty-Four'?'1984':''].filter(Boolean);
  const action={label:'Open Books',route:'books'} as TutorLink;
  const published=Boolean(profile.overview||profile.context||profile.characters.length||profile.themes.length);
  if(!published){
    add('Book profile',profile.title,`${profile.title} is listed in LitLab as ${profile.level}, but its study profile is still Coming Soon. LitLab has not published characters, themes, authorial choices, moments, evidence, or comparison guidance for it yet, so the Tutor will not invent those details.`,[...base,'coming soon','book profile'], 'books',action,4);
    continue;
  }
  add('Book overview',`${profile.title} — overview`,profile.overview,[...base,'overview','plot','what happens'], 'books',action,3);
  add('Book context',`${profile.title} — context`,profile.context,[...base,'context','historical context','author context'], 'books',action,2);
  profile.characters.forEach(item=>add('Book character',`${profile.title} — ${item.name}`,`Role: ${item.role} Development: ${item.development} Themes: ${item.themes} Authorial methods: ${item.methods}`,[...base,item.name,'character','characterization','characterisation'], 'books',action,3));
  profile.themes.forEach(item=>add('Book theme',`${profile.title} — ${item.name}`,`Where it appears: ${item.appears} Choices: ${item.choices} Interpretation: ${item.interpretation}${item.compare?` Comparison: ${item.compare}`:''}`,[...base,item.name,'theme','idea'], 'books',action,3));
  profile.symbols.forEach(item=>add('Book symbol',`${profile.title} — ${item.title}`,item.text,[...base,item.title,'symbol','symbolism'], 'books',action,3));
  profile.motifs.forEach(item=>add('Book motif',`${profile.title} — ${item.title}`,item.text,[...base,item.title,'motif','recurring image'], 'books',action,2));
  profile.choices.forEach(item=>add('Book authorial choice',`${profile.title} — ${item.title}`,item.text,[...base,item.title,'authorial choice','method','technique'], 'books',action,3));
  add('Book narration',`${profile.title} — voice / narration`,profile.voice,[...base,'voice','narrator','narration','perspective','focalization'], 'books',action,2);
  add('Book structure',`${profile.title} — structure`,profile.structure,[...base,'structure','form','ending','opening'], 'books',action,2);
  add('Book setting',`${profile.title} — setting`,profile.setting,[...base,'setting','place'], 'books',action,2);
  profile.moments.forEach(item=>add('Book moment',`${profile.title} — ${item.title}`,`Why it matters: ${item.why} Choices: ${item.choices} Themes: ${item.themes}${item.paper2?` Paper 2 use: ${item.paper2}`:''}`,[...base,item.title,'key moment','scene','evidence'], 'books',action,2));
  profile.evidence.forEach(item=>add('Book evidence',`${profile.title} — evidence: ${item.title}`,item.text,[...base,item.title,'evidence','quotation','quote'], 'books',action,2));
  profile.connections.forEach(item=>add('Book comparison',`${profile.title} ↔ ${item.with}: ${item.theme}`,`Similarity: ${item.similarity} Difference: ${item.difference} Methods: ${item.methods} Why this comparison helps: ${item.why}`,[...base,item.with,item.theme,'compare','comparison','paper 2 connection'], 'books',action,3));
  profile.arguments.forEach((item,index)=>add('Book argument',`${profile.title} — argument ${index+1}`,item,[...base,'argument','thesis','claim'], 'books',action,2));
  profile.misunderstandings.forEach((item,index)=>add('Book misconception',`${profile.title} — misconception ${index+1}`,item,[...base,'mistake','misunderstanding','misconception'], 'books',action,2));
  profile.faqs.forEach(item=>add('Book FAQ',`${profile.title} — ${item.q}`,item.a,[...base,item.q], 'books',action,3));
}

export const siteDocs=docs;
