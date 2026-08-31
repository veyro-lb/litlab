import './insightful-analysis-definitions.css';

type DefinitionItem={label:string;definition:string};

// Short, student-facing definitions. Compound lenses deliberately define each named
// feature separately so students do not learn one half of a paired analytical move.
const definitions:Record<string,DefinitionItem[]>={
  'Pronoun shifts & group boundaries':[
    {label:'Pronoun shift',definition:'A change in pronoun choice — such as I → we or we → they — that changes inclusion, responsibility or distance.'},
    {label:'Group boundary',definition:'A linguistic division between an in-group and an out-group, often built through “we/us” versus “they/them”.'}
  ],
  'Grammatical agency':[
    {label:'Grammatical agency',definition:'Who grammar presents as the doer of an action, and who is instead acted upon, controlled or made passive.'}
  ],
  'Passive voice & hidden responsibility':[
    {label:'Passive voice',definition:'A construction where the receiver of an action is foregrounded: “homes were destroyed” rather than “soldiers destroyed homes”.'},
    {label:'Hidden responsibility',definition:'When the person or institution causing an action is omitted, delayed or made less visible in the wording.'}
  ],
  'Naming, labels & titles':[
    {label:'Naming',definition:'Using a proper name to individualise a person and grant a distinct identity.'},
    {label:'Labels',definition:'Reducing someone to a role or category such as “the maid”, “the refugee” or “the girl”.'},
    {label:'Titles',definition:'Status markers such as Dr, Sir or Officer that can encode formality, hierarchy and authority.'}
  ],
  'Possessives & ownership':[
    {label:'Possessives',definition:'Words such as my, his, her and our that grammatically mark belonging or possession.'},
    {label:'Ownership',definition:'A relationship of control or entitlement; in analysis, possessive language can make intimacy sound proprietary.'}
  ],
  'Modality: must, should, can, might':[
    {label:'Modality',definition:'Language that expresses degrees of certainty, possibility, permission or obligation through words such as must, should, can and might.'}
  ],
  'Certainty, hedging & epistemic markers':[
    {label:'Certainty',definition:'Language that presents a claim as definite or unquestionable, such as clearly, certainly or obviously.'},
    {label:'Hedging',definition:'Language that softens commitment to a claim, such as perhaps, seems, may or apparently.'},
    {label:'Epistemic marker',definition:'Any word or phrase that signals how strongly a speaker claims to know or believe something.'}
  ],
  'Presupposition & loaded questions':[
    {label:'Presupposition',definition:'An assumption built into a statement so it is treated as already accepted rather than openly argued.'},
    {label:'Loaded question',definition:'A question that contains an assumption, accusation or judgement inside its wording.'}
  ],
  'Quantifiers & absolutes':[
    {label:'Quantifier',definition:'A word that expresses amount or scope, such as some, many, all, every or none.'},
    {label:'Absolute',definition:'Language such as always, never or everyone that leaves little or no room for exceptions.'}
  ],
  'Euphemism & sanitised language':[
    {label:'Euphemism',definition:'A milder expression used in place of something harsher, disturbing or socially uncomfortable.'},
    {label:'Sanitised language',definition:'Wording that removes emotional, violent or human detail so an action sounds cleaner, safer or more administrative.'}
  ],
  'Nominalisation':[
    {label:'Nominalisation',definition:'Turning an action or process into a noun — for example, “officials removed residents” becoming “the removal of residents”.'}
  ],
  'Semantic fields & colliding lexicons':[
    {label:'Semantic field',definition:'A cluster of words connected by the same area of meaning, such as war, disease, religion or economics.'},
    {label:'Colliding lexicons',definition:'When vocabulary from one domain is applied to another, allowing one system of values to reshape how the other is understood.'}
  ],

  'Pattern breaking':[
    {label:'Pattern breaking',definition:'A deliberate departure from an established repetition, structure, style or visual rule, making the deviation unusually significant.'}
  ],
  'Repetition with variation':[
    {label:'Repetition with variation',definition:'A word, image, structure or scene returns, but something changes each time so the repetition develops rather than merely emphasises.'}
  ],
  'Sentence length & syntactic control':[
    {label:'Sentence length',definition:'The relative shortness or extension of sentences, which can control pace, pressure, pause and processing.'},
    {label:'Syntactic control',definition:'How sentence structure organises thought through clauses, order and punctuation, often reflecting control or its breakdown.'}
  ],
  'Fragments, parataxis & hypotaxis':[
    {label:'Fragment',definition:'An incomplete sentence or clause used as a standalone unit.'},
    {label:'Parataxis',definition:'Clauses placed side by side with little subordination, making ideas feel equal, abrupt or sequential.'},
    {label:'Hypotaxis',definition:'A structure of main and subordinate clauses that creates hierarchy, qualification and complex relationships between ideas.'}
  ],
  'Dashes, ellipses & self-correction':[
    {label:'Dash',definition:'Punctuation that can interrupt, insert, redirect or abruptly shift a thought.'},
    {label:'Ellipsis',definition:'Three dots (…) that can mark hesitation, omission, trailing thought or something left unsaid.'},
    {label:'Self-correction',definition:'When a speaker revises their own wording, exposing tension between an initial thought and the version they choose to present.'}
  ],
  'Silence, omission & the unsaid':[
    {label:'Silence',definition:'An absence of speech that can signal powerlessness, refusal, tension, trauma or control depending on context.'},
    {label:'Omission',definition:'Information, events or agents that the text deliberately or noticeably leaves out.'},
    {label:'The unsaid',definition:'Meaning the audience is expected to infer from what is avoided, implied or impossible to state directly.'}
  ],
  'Tense shifts & temporal distance':[
    {label:'Tense shift',definition:'A change between past, present or future tense that alters how immediate an event feels.'},
    {label:'Temporal distance',definition:'The felt separation between the moment of narration and the event being remembered, imagined or anticipated.'}
  ],
  'Circular structure & opening/ending echoes':[
    {label:'Circular structure',definition:'A text returns to its opening situation, image or language near the end, creating recurrence or closure.'},
    {label:'Opening/ending echo',definition:'A repeated detail at the beginning and end whose changed context can reveal development, entrapment or reinterpretation.'}
  ],
  'Narrative gaps & skipped moments':[
    {label:'Narrative gap',definition:'A meaningful blank in what the narrator tells us — information is missing even though the surrounding story continues.'},
    {label:'Skipped moment',definition:'A specific event the narrative jumps over, often making its absence more significant than direct description would.'}
  ],
  'Pacing & disproportionate attention':[
    {label:'Pacing',definition:'The speed at which a text moves through events, controlled by detail, sentence structure, scene length and omission.'},
    {label:'Disproportionate attention',definition:'When a seemingly minor detail receives far more space than a major event, or a major event receives strikingly little.'}
  ],
  'Genre, layout & white-space disruption':[
    {label:'Genre',definition:'The expected conventions of a text type, such as poem, advert, speech, memoir or report.'},
    {label:'Layout',definition:'How words, images and sections are physically arranged on the page or screen.'},
    {label:'White space',definition:'Deliberately empty visual space that can separate, isolate, slow reading or materialise absence.'}
  ],

  'Focalisation: whose reality do we inhabit?':[
    {label:'Focalisation',definition:'The perspective through which the audience perceives a scene — whose senses, knowledge and assumptions filter what we experience.'}
  ],
  'Unreliable narration as self-protection':[
    {label:'Unreliable narration',definition:'A narration the reader has reason to question because perception, memory, bias or self-interest distorts the account.'},
    {label:'Self-protection',definition:'When that distorted version helps the narrator defend their identity, innocence, status or emotional stability.'}
  ],
  'Narrative distance':[
    {label:'Narrative distance',definition:'How emotionally or psychologically close the narration feels to a character, event or memory.'}
  ],
  'Dialogue turn-taking & interruption':[
    {label:'Turn-taking',definition:'The pattern of who gets to speak, respond, ask questions and hold the conversational floor.'},
    {label:'Interruption',definition:'When one speaker cuts into another’s turn, potentially controlling pace, topic or permission to complete a thought.'}
  ],
  'Identity as performance & code-switching':[
    {label:'Identity as performance',definition:'The idea that people present different versions of themselves in response to audience, setting, pressure or expectation.'},
    {label:'Code-switching',definition:'Changing language, dialect, accent or register between social contexts or audiences.'}
  ],
  'Setting as ideology':[
    {label:'Setting as ideology',definition:'Reading a space not just as scenery, but as a physical expression of social values, hierarchy, belonging or control.'}
  ],
  'Mirrors, clothing & self-surveillance':[
    {label:'Mirrors',definition:'Reflective imagery that can stage how a character examines or judges the self.'},
    {label:'Clothing',definition:'Dress and appearance as signs of status, conformity, rebellion, gender or performed identity.'},
    {label:'Self-surveillance',definition:'When people monitor and discipline themselves according to standards they have internalised from society.'}
  ],
  'Motif evolution & unstable symbols':[
    {label:'Motif evolution',definition:'A recurring image, object or idea whose associations change as it returns across the text.'},
    {label:'Unstable symbol',definition:'A symbol that cannot be reduced to one fixed meaning because context repeatedly reshapes what it signifies.'}
  ],
  'Character contradiction':[
    {label:'Character contradiction',definition:'A gap between what a character says, believes, does or notices that reveals competing desires, values or self-perceptions.'}
  ],

  'The gaze: who looks and who is looked at?':[
    {label:'The gaze',definition:'The visual relationship created by who looks, who is looked at, and whether that look is returned.'}
  ],
  'Camera angle & vertical power':[
    {label:'Camera angle',definition:'The viewpoint from which a subject is shown — high, low or eye-level — shaping the viewer’s physical relation to them.'},
    {label:'Vertical power',definition:'The use of visual height to suggest dominance, vulnerability, equality or hierarchy.'}
  ],
  'Framing & what exists outside the frame':[
    {label:'Framing',definition:'The creator’s decision about what is included, excluded and isolated within the visible boundaries of an image.'},
    {label:'Outside the frame',definition:'Context the viewer cannot see; its absence may narrow interpretation or hide causes, relationships and systems.'}
  ],
  'Cropping & body fragmentation':[
    {label:'Cropping',definition:'Cutting away parts of an image or body so only selected details remain visible.'},
    {label:'Body fragmentation',definition:'Representing a person as separate body parts rather than a complete individual, often affecting agency and objectification.'}
  ],
  'Negative space & visual marginalisation':[
    {label:'Negative space',definition:'Empty space surrounding the main subject in a composition.'},
    {label:'Visual marginalisation',definition:'Placing a subject at the edge, small, isolated or visually subordinate so social marginality can become spatial.'}
  ],
  'Foreground, background & depth hierarchy':[
    {label:'Foreground',definition:'The area that appears closest to the viewer and often receives immediate attention.'},
    {label:'Background',definition:'The area behind the main subject, which can reduce people or objects to context or scenery.'},
    {label:'Depth hierarchy',definition:'Using foreground, focus, scale and distance to rank which subjects receive visual importance.'}
  ],
  'Salience & visual hierarchy':[
    {label:'Salience',definition:'How strongly an element attracts attention through size, contrast, placement, focus, colour or isolation.'},
    {label:'Visual hierarchy',definition:'The designed order in which the viewer notices and prioritises elements in an image or layout.'}
  ],
  'Vectors & reading path':[
    {label:'Vector',definition:'A visible or implied directional line — such as an eye-line, arm, road or arrow — that guides attention.'},
    {label:'Reading path',definition:'The sequence through which a viewer is encouraged to move across visual and verbal elements.'}
  ],
  'Proxemics, barriers & thresholds':[
    {label:'Proxemics',definition:'The meaning created by physical distance and spatial relationships between people or objects.'},
    {label:'Barrier',definition:'A physical divider such as glass, a fence or a table that can materialise separation or restricted access.'},
    {label:'Threshold',definition:'A boundary between spaces — such as a doorway or border — often linked to transition, liminality or uncertain belonging.'}
  ],
  'Symmetry & broken symmetry':[
    {label:'Symmetry',definition:'A balanced composition where elements mirror or evenly correspond, often suggesting order, control or stability.'},
    {label:'Broken symmetry',definition:'A deliberate disruption of that balance, making one element appear exceptional, unstable or resistant.'}
  ],
  'Typography, scale & fine print':[
    {label:'Typography',definition:'The visual design of written language: font, weight, case, spacing and style.'},
    {label:'Scale',definition:'Relative size used to make some words or images dominate others.'},
    {label:'Fine print',definition:'Small, visually subordinate conditions or qualifications that complicate a larger persuasive claim.'}
  ],
  'Colour & lighting relationships':[
    {label:'Colour relationship',definition:'Meaning created by how colours repeat, contrast or connect particular people, objects and ideas.'},
    {label:'Lighting relationship',definition:'Meaning created by who or what is illuminated, shadowed, exposed or concealed.'}
  ],
  'Image-text anchorage & contradiction':[
    {label:'Anchorage',definition:'When words narrow or fix how an otherwise ambiguous image should be interpreted.'},
    {label:'Image-text contradiction',definition:'When visual and verbal messages conflict, creating irony, tension or a gap the viewer must resolve.'}
  ],

  'Implied audience':[
    {label:'Implied audience',definition:'The kind of reader or viewer a text assumes — including their values, knowledge, fears, resources and identity.'}
  ],
  'Manufactured insecurity & aspirational identity':[
    {label:'Manufactured insecurity',definition:'Persuasion that first makes the audience feel deficient, inadequate or anxious about themselves.'},
    {label:'Aspirational identity',definition:'An ideal version of the self that the product, brand or action promises to help the audience become.'}
  ],
  'Product absence & association transfer':[
    {label:'Product absence',definition:'An ad minimises or removes the product itself so lifestyle, emotion or identity becomes the main focus.'},
    {label:'Association transfer',definition:'Desirable qualities attached to a person, scene or feeling are transferred onto the brand or product.'}
  ],
  'Fear, guilt & shock appeals':[
    {label:'Fear appeal',definition:'Persuasion that motivates action by making danger, loss or consequence feel immediate.'},
    {label:'Guilt appeal',definition:'Persuasion that makes inaction feel morally uncomfortable or personally blameworthy.'},
    {label:'Shock appeal',definition:'A deliberately disturbing or unexpected image/message designed to break habitual attention and force notice.'}
  ],
  'Statistics & scientific authority':[
    {label:'Statistics',definition:'Numerical evidence used to make a claim appear measurable, factual and objective.'},
    {label:'Scientific authority',definition:'Technical language, data or expert framing used to borrow the credibility of science and expertise.'}
  ],
  'Testimonials, experts & celebrity transfer':[
    {label:'Testimonial',definition:'A personal account used to make a claim feel authentic, relatable or emotionally credible.'},
    {label:'Expert',definition:'A person whose specialist knowledge is used to lend authority to a message.'},
    {label:'Celebrity transfer',definition:'Fame, desirability or status associated with a celebrity is transferred onto a product, cause or claim.'}
  ],
  'Slogans, parallelism & rule of three':[
    {label:'Slogan',definition:'A compressed, memorable phrase that packages a message for easy recognition and repetition.'},
    {label:'Parallelism',definition:'Repeated grammatical structure that creates rhythm and can make separate ideas feel equally valid or connected.'},
    {label:'Rule of three',definition:'A three-part list or sequence that often feels balanced, complete and memorable.'}
  ],
  'Pseudo-empowerment, cause marketing & tokenism':[
    {label:'Pseudo-empowerment',definition:'Language of liberation or confidence that appears empowering while leaving deeper power structures unchanged.'},
    {label:'Cause marketing',definition:'A brand links itself to a social or political cause in order to build identity, trust or consumer appeal.'},
    {label:'Tokenism',definition:'Surface-level inclusion of a marginalised group without meaningful agency, influence or structural change.'}
  ],
  'Humour, incongruity & satire':[
    {label:'Humour',definition:'Comedy used to entertain, disarm resistance or make criticism easier to receive.'},
    {label:'Incongruity',definition:'A mismatch between elements that normally do not belong together, producing surprise, absurdity or discomfort.'},
    {label:'Satire',definition:'Humour, exaggeration or irony used to expose and criticise behaviour, institutions or social norms.'}
  ],
  'Rhetorical questions & false binaries':[
    {label:'Rhetorical question',definition:'A question designed to guide thought or imply an answer rather than genuinely request information.'},
    {label:'False binary',definition:'Presenting only two options when other possibilities exist, narrowing the audience’s range of acceptable conclusions.'}
  ],

  'Normalisation':[
    {label:'Normalisation',definition:'The process by which harmful, unequal or unusual behaviour becomes treated as ordinary, expected or unremarkable.'}
  ],
  'Naturalisation':[
    {label:'Naturalisation',definition:'Presenting a socially constructed belief or hierarchy as natural, inevitable or simply common sense.'}
  ],
  'Othering':[
    {label:'Othering',definition:'Constructing a person or group as fundamentally separate, unfamiliar or inferior to a dominant “us”.'}
  ],
  'Power disguised as care':[
    {label:'Power disguised as care',definition:'Control or restriction presented through the language of protection, love, safety or concern.'}
  ],
  'Internalised oppression & self-policing':[
    {label:'Internalised oppression',definition:'When people absorb devaluing social beliefs about their own group and begin applying those beliefs to themselves.'},
    {label:'Self-policing',definition:'Monitoring and correcting one’s own behaviour to satisfy social rules even without an authority figure present.'}
  ],
  'Commodification':[
    {label:'Commodification',definition:'Turning people, identities, emotions, culture or political values into things that can be marketed, exchanged or consumed.'}
  ],
  'Individualising structural problems':[
    {label:'Individualising a structural problem',definition:'Reframing an issue caused by institutions or systems as mainly the responsibility of individual choices or effort.'}
  ],
  'Depoliticising suffering':[
    {label:'Depoliticising suffering',definition:'Showing pain intensely while removing the historical, economic or political causes that explain why it exists.'}
  ],
  'Victim, saviour & spectacle narratives':[
    {label:'Victim narrative',definition:'A representation that defines a person mainly through helplessness or suffering, potentially reducing their agency.'},
    {label:'Saviour narrative',definition:'A representation that centres an outsider, donor or institution as the active rescuer of passive subjects.'},
    {label:'Spectacle narrative',definition:'A representation in which suffering becomes something visually consumed for attention, emotion or impact.'}
  ],
  'Aestheticising suffering':[
    {label:'Aestheticising suffering',definition:'Presenting pain, poverty or violence through visually beautiful or polished choices that can create ethical tension.'}
  ],
  'Disease & war metaphors':[
    {label:'Disease metaphor',definition:'Describing people or social problems as infection, cancer, parasites or contamination, implying treatment or removal.'},
    {label:'War metaphor',definition:'Describing an issue through battle, enemies, attack and victory, encouraging conflict-based rather than dialogic thinking.'}
  ],
  'Religious, economic & mechanical frames':[
    {label:'Religious frame',definition:'Using sacred, pure, sinful, sacrifice or salvation language to moralise or sanctify an issue.'},
    {label:'Economic frame',definition:'Using value, debt, investment, profit or exchange language to make relationships or identities seem transactional.'},
    {label:'Mechanical frame',definition:'Using machine, gear, efficiency or productivity language to reduce people to functions within a system.'}
  ],
  'Who benefits from the representation?':[
    {label:'Ideological payoff',definition:'The advantage gained by a person, institution, brand or belief system when the audience accepts a particular representation as normal or true.'}
  ],

  'Recurring pattern across a body of work':[
    {label:'Recurring pattern',definition:'A repeated strategy, image, structure or relationship across several works that reveals a sustained representational tendency.'}
  ],
  'Evolution across the body of work':[
    {label:'Evolution',definition:'A meaningful change in how a creator represents the same idea, subject or method across selected works.'}
  ],
  'Strategic inconsistency':[
    {label:'Strategic inconsistency',definition:'A work that complicates or contradicts the dominant pattern, helping you test and qualify a body-of-work argument.'}
  ],
  'Medium & context as meaning':[
    {label:'Medium',definition:'The form through which a work reaches its audience — such as billboard, photograph, Instagram post, speech or novel.'},
    {label:'Context of reception',definition:'The situation in which the audience encounters the work, shaping attention, scale, participation and interpretation.'}
  ],
  'Intertextuality & subversion':[
    {label:'Intertextuality',definition:'A work refers to another text, image, myth, genre or cultural reference and imports some of its associations.'},
    {label:'Subversion',definition:'The familiar reference is deliberately altered so its original assumptions, values or expectations are challenged.'}
  ],
  'Compare methods, not just themes':[
    {label:'Theme comparison',definition:'Identifying a shared concern or idea across works — useful, but not yet enough for strong analysis.'},
    {label:'Method comparison',definition:'Comparing how different authorial or visual choices construct that shared idea and position the audience differently.'}
  ],
  'Micro choice → macro pattern':[
    {label:'Micro choice',definition:'A precise detail in the extract — a pronoun, angle, verb, crop, pause, colour or structural shift.'},
    {label:'Macro pattern',definition:'The wider strategy that recurs elsewhere in the body of work, even when the exact technique changes.'}
  ],
  'Pattern + exception':[
    {label:'Pattern',definition:'The dominant repeated method or representation that supports your main body-of-work claim.'},
    {label:'Exception',definition:'A work that departs from that pattern and helps you qualify how far your claim is actually true.'}
  ]
};

function esc(value:string){
  return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function fallbackDefinition(title:string,card:HTMLElement):DefinitionItem[]{
  const look=card.querySelector<HTMLElement>('.insight-card-title em')?.textContent?.trim();
  const meaning=card.querySelector<HTMLElement>('.insight-meaning p')?.textContent?.trim();
  const sentence=(meaning||look||'Use this lens to identify how the choice shapes meaning in context.').split(/(?<=[.!?])\s+/)[0];
  return [{label:title,definition:sentence}];
}

function enrichCard(card:HTMLElement){
  if(card.dataset.insightDefinitionReady==='true')return;
  const title=card.querySelector<HTMLElement>('.insight-card-title b')?.textContent?.trim();
  if(!title)return;
  const body=card.querySelector<HTMLElement>('.insight-card-body');
  if(!body)return;

  const items=definitions[title]||fallbackDefinition(title,card);
  const block=document.createElement('div');
  block.className='insight-definition';
  block.innerHTML=`
    <div class="insight-definition-head">
      <span>QUICK DEFINITION</span>
      <small>${items.length>1?`${items.length} FEATURES · BOTH MATTER`:'KNOW IT BEFORE YOU ANALYSE IT'}</small>
    </div>
    <div class="insight-definition-grid ${items.length>1?'is-compound':'is-single'}">
      ${items.map((item,index)=>`<div class="insight-definition-item"><i>${String(index+1).padStart(2,'0')}</i><div><b>${esc(item.label)}</b><p>${esc(item.definition)}</p></div></div>`).join('')}
    </div>`;

  body.insertBefore(block,body.firstChild);
  card.dataset.insightDefinitionReady='true';
  card.dataset.insightSearch=`${card.dataset.insightSearch||''} ${items.map(item=>`${item.label} ${item.definition}`).join(' ')}`.toLowerCase();
}

function enrich(root:ParentNode=document){
  root.querySelectorAll<HTMLElement>('.insight-card').forEach(enrichCard);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    enrich();
  });
}

const observer=new MutationObserver(records=>{
  for(const record of records){
    if(record.addedNodes.length){schedule();break;}
  }
});

function start(){
  enrich();
  observer.observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
