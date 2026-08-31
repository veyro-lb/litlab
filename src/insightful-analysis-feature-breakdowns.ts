import './insightful-analysis-feature-breakdowns.css';

type FeatureBreakdown={label:string;meaning:string;effect:string};

const breakdowns:Record<string,FeatureBreakdown[]>={
  'Pronoun shifts & group boundaries':[
    {label:'Pronoun shift',meaning:'Changing I/we/you/they changes who appears responsible, included or distant at that exact moment.',effect:'The reader can feel a change in closeness, accountability or collective identity as the pronoun changes.'},
    {label:'Group boundary',meaning:'An us/them division turns identity into a social border and can make belonging depend on exclusion.',effect:'The reader is positioned inside, outside or between groups before the argument is fully evaluated.'}
  ],
  'Passive voice & hidden responsibility':[
    {label:'Passive voice',meaning:'Foregrounding the receiver of an action changes emphasis from who acted to what happened.',effect:'The reader notices consequence first and may experience the action as more impersonal.'},
    {label:'Hidden responsibility',meaning:'Omitting the agent weakens visible accountability and can make a chosen action sound event-like or inevitable.',effect:'The reader may focus less on blame and more on aftermath unless they actively reconstruct the missing actor.'}
  ],
  'Naming, labels & titles':[
    {label:'Naming',meaning:'A proper name grants individuality and can signal recognition, intimacy or social legitimacy.',effect:'The reader is encouraged to encounter the person as a distinct individual rather than a category.'},
    {label:'Labels',meaning:'A role-based label compresses identity into one social function, trait or stereotype.',effect:'The reader may process the person through the category before considering their individuality.'},
    {label:'Titles',meaning:'Titles encode status and formality, making hierarchy visible inside ordinary reference.',effect:'The reader registers authority, respect or distance even before characters act.'}
  ],
  'Possessives & ownership':[
    {label:'Possessives',meaning:'My/our/his/her grammatically attach people, land or ideas to an owner or group.',effect:'Belonging can feel intimate and natural, which can make underlying entitlement easy to miss.'},
    {label:'Ownership',meaning:'Ownership language pushes belonging toward control, suggesting that another person or space can be claimed.',effect:'The reader may sense asymmetry, entitlement or restriction beneath apparently affectionate wording.'}
  ],
  'Certainty, hedging & epistemic markers':[
    {label:'Certainty',meaning:'Strong certainty presents interpretation as settled fact and can close down alternative readings.',effect:'The voice may sound authoritative, or suspiciously over-insistent if certainty is repeatedly announced.'},
    {label:'Hedging',meaning:'Hedges reduce commitment and keep claims provisional, cautious or strategically deniable.',effect:'The reader may perceive uncertainty, politeness, insecurity or calculated restraint.'},
    {label:'Epistemic markers',meaning:'Epistemic markers expose the speaker’s claimed relationship to knowledge rather than the event itself.',effect:'The reader is prompted to judge not only what is said, but how securely the speaker can know it.'}
  ],
  'Presupposition & loaded questions':[
    {label:'Presupposition',meaning:'A hidden assumption is treated as already agreed, so the text can build on it without proving it.',effect:'The reader may accept the premise unconsciously unless they stop to challenge the frame.'},
    {label:'Loaded question',meaning:'The question embeds blame or judgement inside the act of asking, narrowing the possible response.',effect:'The audience is pushed to answer within terms already chosen by the speaker.'}
  ],
  'Quantifiers & absolutes':[
    {label:'Quantifiers',meaning:'Words such as some, many, all or none control the scale of a claim and who it covers.',effect:'The reader’s sense of scope can expand or narrow even when the evidence itself has not changed.'},
    {label:'Absolutes',meaning:'Always/never/everyone erase exceptions and transform a partial judgement into a universal one.',effect:'The claim feels decisive and memorable but can also reveal rigidity, stereotyping or emotional extremity.'}
  ],
  'Euphemism & sanitised language':[
    {label:'Euphemism',meaning:'A softer substitute reduces the emotional or moral force of a harsher reality.',effect:'The reader can process the event with less discomfort because the painful term never appears.'},
    {label:'Sanitised language',meaning:'Technical or clean-sounding diction strips away human detail and reframes harm as procedure.',effect:'The event can feel administrative, distant or necessary rather than personal and ethically charged.'}
  ],
  'Semantic fields & colliding lexicons':[
    {label:'Semantic field',meaning:'Repeated vocabulary from one domain creates a stable conceptual frame through which the subject is interpreted.',effect:'The reader begins to associate the subject with the values and emotions of that lexical field.'},
    {label:'Colliding lexicons',meaning:'Applying one domain to another transfers its logic—for example, economics can make intimacy feel transactional.',effect:'The reader experiences a conceptual tension and may notice that one value-system is colonising another.'}
  ],
  'Sentence length & syntactic control':[
    {label:'Sentence length',meaning:'Long or short sentences regulate pace, pressure, pause and the amount of thought the reader processes at once.',effect:'The reader can feel breathlessness, suspension, bluntness or sudden emotional compression.'},
    {label:'Syntactic control',meaning:'Clause order and grammatical complexity reveal how tightly thought is organised or how visibly that organisation breaks down.',effect:'The reader can experience a mind as controlled, spiralling, fragmented or over-qualified through structure itself.'}
  ],
  'Fragments, parataxis & hypotaxis':[
    {label:'Fragments',meaning:'Incomplete units remove normal grammatical completion and can materialise shock, certainty or fractured thought.',effect:'The reader is forced into abrupt pauses and isolated pieces of information.'},
    {label:'Parataxis',meaning:'Side-by-side clauses flatten hierarchy between events and can make experience feel relentless, factual or emotionally numb.',effect:'The reader processes one unit after another with little interpretive guidance between them.'},
    {label:'Hypotaxis',meaning:'Subordinate clauses build hierarchy and qualification, showing which ideas depend on or complicate others.',effect:'The reader experiences thought as layered, controlled or intellectually elaborate.'}
  ],
  'Dashes, ellipses & self-correction':[
    {label:'Dashes',meaning:'A dash creates visible interruption or redirection, allowing syntax to dramatise a thought colliding with another thought.',effect:'The reader experiences the break in real time rather than simply being told the speaker hesitates.'},
    {label:'Ellipses',meaning:'An ellipsis leaves language incomplete, creating a gap where hesitation, implication or suppression can operate.',effect:'The reader is invited to imagine what the speaker cannot, will not or does not finish saying.'},
    {label:'Self-correction',meaning:'Replacing one word with another exposes a conflict between spontaneous expression and controlled presentation.',effect:'The reader gets access to the first impulse and the attempt to police it.'}
  ],
  'Silence, omission & the unsaid':[
    {label:'Silence',meaning:'Silence makes absence of speech an action that can signal refusal, fear, powerlessness or control.',effect:'The reader must interpret meaning from the social conditions surrounding the lack of response.'},
    {label:'Omission',meaning:'Leaving out an event, agent or context makes the gap itself structurally meaningful.',effect:'The reader becomes more active, reconstructing what the text withholds.'},
    {label:'The unsaid',meaning:'Meaning is displaced into implication, allowing taboo, shame, threat or resistance to exist beneath explicit language.',effect:'The reader senses a second layer of communication beyond the literal wording.'}
  ],
  'Tense shifts & temporal distance':[
    {label:'Tense shift',meaning:'Changing tense alters the grammatical time of an event and can suddenly make memory feel present or possibility feel immediate.',effect:'The reader feels a change in temporal immediacy rather than merely learning when something happened.'},
    {label:'Temporal distance',meaning:'The amount of felt distance between narration and event shapes whether the past seems processed, unresolved or still active.',effect:'The reader can perceive psychological closeness even when chronological time has passed.'}
  ],
  'Circular structure & opening/ending echoes':[
    {label:'Circular structure',meaning:'Returning to the starting situation can suggest recurrence, entrapment, inevitability or deliberately completed design.',effect:'The reader re-evaluates the journey by noticing that the ending loops back rather than simply moves forward.'},
    {label:'Opening/ending echo',meaning:'Repeating one detail in a new context tests whether its meaning has changed across the text.',effect:'The reader carries memory of the first use into the final one and notices transformation or lack of it.'}
  ],
  'Narrative gaps & skipped moments':[
    {label:'Narrative gap',meaning:'A broader absence in narration defines the limit of what can be known, remembered or admitted.',effect:'The reader becomes conscious of missing knowledge and may question reliability or psychological tolerance.'},
    {label:'Skipped moment',meaning:'Jumping over one specific event can make that moment conspicuous precisely because it is not narrated.',effect:'The reader focuses on before-and-after traces and reconstructs the missing centre.'}
  ],
  'Pacing & disproportionate attention':[
    {label:'Pacing',meaning:'The speed of narration controls how long the audience remains with an event and how intensely it is processed.',effect:'The reader can be rushed through action or forced to linger on a moment.'},
    {label:'Disproportionate attention',meaning:'Giving minor details excessive space—or major events almost none—reveals where emotion or attention has been displaced.',effect:'The reader senses that psychological importance and narrative space do not neatly align.'}
  ],
  'Genre, layout & white-space disruption':[
    {label:'Genre',meaning:'Using or breaking genre conventions activates expectations about what kind of text this is and how it should behave.',effect:'The reader notices when a poem, ad or narrative refuses the normal rules of its form.'},
    {label:'Layout',meaning:'Physical arrangement controls sequence, grouping and visual hierarchy, making structure part of the argument.',effect:'The reader’s eye and reading path are shaped before individual sentences are fully processed.'},
    {label:'White space',meaning:'Empty space can materialise pause, isolation, fragmentation or absence instead of describing those ideas verbally.',effect:'The reader physically encounters separation and silence on the page or screen.'}
  ],
  'Unreliable narration as self-protection':[
    {label:'Unreliable narration',meaning:'Contradictions or distortions make the narrated version of reality unstable and open to reader correction.',effect:'The reader becomes an evaluator who compares the narrator’s claims with other evidence.'},
    {label:'Self-protection',meaning:'The distortion gains motive when it preserves the narrator’s innocence, status, identity or emotional stability.',effect:'The reader can interpret unreliability psychologically rather than merely labelling the narrator a liar.'}
  ],
  'Dialogue turn-taking & interruption':[
    {label:'Turn-taking',meaning:'Who receives speaking time reveals whose ideas are permitted to develop and whose questions control the exchange.',effect:'The audience experiences hierarchy through access to conversational space.'},
    {label:'Interruption',meaning:'Cutting into another speaker’s turn asserts control over pace, topic or permission to finish a thought.',effect:'The reader hears dominance enacted structurally, even without an explicit command.'}
  ],
  'Identity as performance & code-switching':[
    {label:'Identity as performance',meaning:'Changing behaviour across audiences suggests identity is socially managed rather than simply fixed and private.',effect:'The reader sees tension between self-presentation, belonging and expectation.'},
    {label:'Code-switching',meaning:'Changing dialect, register or language reveals adaptation to different power contexts and communities.',effect:'The reader notices how social safety, status or belonging can require linguistic adjustment.'}
  ],
  'Mirrors, clothing & self-surveillance':[
    {label:'Mirrors',meaning:'Mirror imagery turns the self into an object of observation and can stage internalised judgement.',effect:'The reader sees a character evaluating themselves through an imagined external gaze.'},
    {label:'Clothing',meaning:'Dress makes identity visible as something selected, performed, imposed or resisted.',effect:'The reader can infer class, conformity, gender performance or social aspiration through appearance.'},
    {label:'Self-surveillance',meaning:'When characters police themselves without visible authority, external power has become internal discipline.',effect:'The reader sees control operating through shame, desire and self-correction rather than force alone.'}
  ],
  'Motif evolution & unstable symbols':[
    {label:'Motif evolution',meaning:'A recurring image gains new associations each time it returns, turning repetition into development.',effect:'The reader revises earlier interpretations as the motif accumulates context.'},
    {label:'Unstable symbols',meaning:'Refusing one fixed symbolic meaning allows the same object to hold conflicting values such as freedom and danger.',effect:'The reader is pushed toward ambiguity rather than a one-word symbolic translation.'}
  ],
  'Camera angle & vertical power':[
    {label:'Camera angle',meaning:'High, low or eye-level framing changes the viewer’s physical relation to the subject.',effect:'The viewer may feel above, below or level with the represented figure.'},
    {label:'Vertical power',meaning:'Height turns status into spatial hierarchy, making dominance or vulnerability visually legible.',effect:'The viewer can register power before interpreting facial expression or text.'}
  ],
  'Framing & what exists outside the frame':[
    {label:'Framing',meaning:'The visible boundary selects which context counts and which details become central.',effect:'The viewer experiences a curated reality rather than the whole scene.'},
    {label:'Outside the frame',meaning:'Excluded context can hide causes, relationships or systems that would complicate the visible message.',effect:'The viewer may individualise an issue because structural information has literally been kept out of sight.'}
  ],
  'Cropping & body fragmentation':[
    {label:'Cropping',meaning:'Cutting away parts of an image directs attention toward selected details and removes surrounding context.',effect:'The viewer inspects what remains while losing access to the whole body or environment.'},
    {label:'Body fragmentation',meaning:'Repeatedly representing a person as parts can detach physical desirability or labour from full identity.',effect:'The viewer may consume or evaluate the body as separate visual units rather than encounter a complete person.'}
  ],
  'Negative space & visual marginalisation':[
    {label:'Negative space',meaning:'Empty space changes scale and distance, making a subject feel isolated, exposed, calm or visually precious.',effect:'The viewer feels spatial separation rather than only being told about it.'},
    {label:'Visual marginalisation',meaning:'Pushing a subject to the edge or reducing their scale turns social exclusion into compositional position.',effect:'The viewer intuitively learns who occupies the centre and who is made peripheral.'}
  ],
  'Foreground, background & depth hierarchy':[
    {label:'Foreground',meaning:'Foregrounding grants immediacy and visual priority to the nearest subject.',effect:'The viewer is directed to treat that figure or object as the primary experience.'},
    {label:'Background',meaning:'Backgrounding can reduce people to context, scenery or an undifferentiated mass.',effect:'The viewer may overlook individuality in figures placed behind the focal subject.'},
    {label:'Depth hierarchy',meaning:'Combining focus, scale and distance ranks subjects across visual depth.',effect:'The viewer learns whose experience matters most through spatial design.'}
  ],
  'Salience & visual hierarchy':[
    {label:'Salience',meaning:'Contrast, size, focus or isolation makes one element demand attention.',effect:'The viewer notices that element first, often before consciously deciding where to look.'},
    {label:'Visual hierarchy',meaning:'The ordered relationship among salient elements creates a sequence of importance and interpretation.',effect:'The viewer is guided through a designed argument such as emotion → statistic → action.'}
  ],
  'Vectors & reading path':[
    {label:'Vectors',meaning:'Eye-lines, limbs, roads or arrows create directional links between elements.',effect:'The viewer’s attention is pulled toward a target such as a product, victim or slogan.'},
    {label:'Reading path',meaning:'The overall sequence of attention turns separate design elements into a visual argument.',effect:'The viewer encounters ideas in an order chosen by the creator rather than randomly.'}
  ],
  'Proxemics, barriers & thresholds':[
    {label:'Proxemics',meaning:'Physical distance between figures converts intimacy, hierarchy or alienation into spatial relation.',effect:'The viewer reads relationships through closeness and separation before dialogue is interpreted.'},
    {label:'Barriers',meaning:'Doors, glass, fences or tables make emotional or social separation physically visible.',effect:'The viewer can see access being blocked even when characters remain visually connected.'},
    {label:'Thresholds',meaning:'Doorways, borders and entrances place a subject between spaces and can materialise transition or unstable belonging.',effect:'The viewer reads the figure as liminal—neither fully inside nor outside.'}
  ],
  'Symmetry & broken symmetry':[
    {label:'Symmetry',meaning:'Balanced repetition creates order, control, ritual or artificial perfection.',effect:'The viewer experiences stability and quickly learns what the composition treats as normal.'},
    {label:'Broken symmetry',meaning:'One disruption becomes meaningful because the surrounding order established a rule first.',effect:'The viewer’s attention snaps toward the exception and can read it as resistance, instability or individuality.'}
  ],
  'Typography, scale & fine print':[
    {label:'Typography',meaning:'Font, weight, case and spacing give verbal language a visual personality and level of authority.',effect:'The viewer can read urgency, prestige, informality or aggression before fully processing the words.'},
    {label:'Scale',meaning:'Relative size ranks messages and images, making some claims visually dominant over others.',effect:'The viewer notices larger elements sooner and may treat them as more important.'},
    {label:'Fine print',meaning:'Small qualifications physically subordinate complexity to the larger persuasive promise.',effect:'The viewer can remember the headline while overlooking conditions that weaken or complicate it.'}
  ],
  'Colour & lighting relationships':[
    {label:'Colour relationships',meaning:'Repeated or contrasting colours connect selected objects, emotions and ideas across the composition.',effect:'The viewer forms associations quickly because the same colour visually groups elements.'},
    {label:'Lighting relationships',meaning:'Illumination and shadow distribute visibility, exposure and concealment.',effect:'The viewer learns who or what deserves attention, mystery, vulnerability or authority through light.'}
  ],
  'Image-text anchorage & contradiction':[
    {label:'Anchorage',meaning:'A caption narrows the possible interpretation of an image and tells the viewer which meaning to privilege.',effect:'The viewer receives guidance that reduces visual ambiguity.'},
    {label:'Image-text contradiction',meaning:'Conflict between words and image creates irony or exposes a gap between stated message and visible reality.',effect:'The viewer must actively resolve the contradiction rather than passively receive one unified message.'}
  ],
  'Manufactured insecurity & aspirational identity':[
    {label:'Manufactured insecurity',meaning:'The message first constructs the audience as deficient so a problem exists that needs solving.',effect:'The viewer begins comparing themselves against a standard supplied by the campaign.'},
    {label:'Aspirational identity',meaning:'The text then offers an ideal future self as the reward for buying, changing or complying.',effect:'The viewer desires transformation and may attach that desire to the product or action.'}
  ],
  'Product absence & association transfer':[
    {label:'Product absence',meaning:'Minimising the object shifts attention from function toward lifestyle, emotion and symbolic identity.',effect:'The viewer desires the world around the product before thinking about the product itself.'},
    {label:'Association transfer',meaning:'Desirable qualities from a celebrity, setting or mood are attached to the brand without needing an explicit argument.',effect:'The viewer may experience the product as carrying status, freedom or desirability borrowed from the surrounding image.'}
  ],
  'Fear, guilt & shock appeals':[
    {label:'Fear appeal',meaning:'Danger or consequence is made vivid so action feels necessary for self-protection.',effect:'The audience feels urgency and may act to avoid the threatened outcome.'},
    {label:'Guilt appeal',meaning:'The campaign makes inaction feel morally implicated, turning responsibility into emotional pressure.',effect:'The audience may act to reduce discomfort or restore a sense of moral adequacy.'},
    {label:'Shock appeal',meaning:'A disturbing or unexpected image breaks habitual attention and forces the issue into consciousness.',effect:'The audience may remember the message more strongly, though extreme shock can also become spectacle.'}
  ],
  'Statistics & scientific authority':[
    {label:'Statistics',meaning:'Numbers make claims look measurable and can compress complex realities into apparently objective evidence.',effect:'The audience may lower scepticism because precision feels factual.'},
    {label:'Scientific authority',meaning:'Technical vocabulary, charts or expert framing borrow the cultural credibility of science.',effect:'The audience may experience persuasion as rational evidence rather than marketing or rhetoric.'}
  ],
  'Testimonials, experts & celebrity transfer':[
    {label:'Testimonials',meaning:'A personal story translates an abstract claim into one emotionally legible experience.',effect:'The audience can identify with a person rather than only process general information.'},
    {label:'Experts',meaning:'Specialist status lends epistemic authority to a claim and frames trust as rational.',effect:'The audience may accept the message because the speaker appears qualified to know.'},
    {label:'Celebrity transfer',meaning:'Fame, beauty or status is transferred from the celebrity to the product or cause by association.',effect:'The audience may desire symbolic proximity to the celebrity rather than evaluate the claim on evidence alone.'}
  ],
  'Slogans, parallelism & rule of three':[
    {label:'Slogans',meaning:'Compression turns a complex position into a repeatable verbal package.',effect:'The audience remembers the phrase easily, even when nuance has been removed.'},
    {label:'Parallelism',meaning:'Repeated grammatical form makes separate ideas feel balanced, linked and rhetorically inevitable.',effect:'The audience experiences rhythm and structural confidence.'},
    {label:'Rule of three',meaning:'A three-part sequence produces a culturally familiar sense of completeness and progression.',effect:'The audience often experiences the list as satisfying, memorable and finished.'}
  ],
  'Pseudo-empowerment, cause marketing & tokenism':[
    {label:'Pseudo-empowerment',meaning:'Liberation language can individualise empowerment into confidence or consumption while deeper structures remain untouched.',effect:'The audience may feel politically affirmed without being asked to question the system producing the inequality.'},
    {label:'Cause marketing',meaning:'A social cause is attached to a brand so moral value becomes part of corporate identity.',effect:'The consumer can experience buying as participation in a cause.'},
    {label:'Tokenism',meaning:'Surface inclusion supplies the appearance of diversity without equivalent agency, complexity or structural influence.',effect:'The audience sees representation while deeper power relations may remain unchanged.'}
  ],
  'Humour, incongruity & satire':[
    {label:'Humour',meaning:'Comedy lowers resistance and can make uncomfortable criticism easier to receive.',effect:'The audience is entertained before recognising the seriousness underneath.'},
    {label:'Incongruity',meaning:'A mismatch between elements makes the familiar appear strange and exposes assumptions that normally go unnoticed.',effect:'The audience experiences surprise or discomfort and is pushed to ask why the elements do not fit.'},
    {label:'Satire',meaning:'Humour or exaggeration targets a norm, institution or behaviour in order to expose its absurdity or hypocrisy.',effect:'The audience is invited to judge the target while participating in the joke.'}
  ],
  'Rhetorical questions & false binaries':[
    {label:'Rhetorical questions',meaning:'The question directs thought toward an implied answer without openly stating the conclusion.',effect:'The audience feels mentally involved while the expected response has already been framed.'},
    {label:'False binaries',meaning:'Reducing a complex issue to two options removes alternatives and makes one choice appear necessary.',effect:'The audience’s range of acceptable conclusions is narrowed before evaluation begins.'}
  ],
  'Internalised oppression & self-policing':[
    {label:'Internalised oppression',meaning:'Social prejudice becomes part of the subject’s own self-concept, so external judgement is reproduced internally.',effect:'The reader sees oppression operating psychologically as well as socially.'},
    {label:'Self-policing',meaning:'The subject actively corrects their own behaviour to fit absorbed rules even without visible enforcement.',effect:'The reader sees power becoming efficient because the individual begins enforcing it on themselves.'}
  ],
  'Victim, saviour & spectacle narratives':[
    {label:'Victim narrative',meaning:'Defining someone mainly through helplessness can generate sympathy while reducing complexity and agency.',effect:'The viewer feels compassion but may see the subject primarily as dependent.'},
    {label:'Saviour narrative',meaning:'Centred rescue roles make the donor or outsider the active moral agent in the story.',effect:'The viewer is positioned as powerful relative to the represented subject.'},
    {label:'Spectacle narrative',meaning:'Suffering becomes the visual material used to capture attention and emotional intensity.',effect:'The viewer may consume pain as an image even while feeling genuine empathy.'}
  ],
  'Disease & war metaphors':[
    {label:'Disease metaphor',meaning:'Describing a group or problem as contamination makes removal, cure or purification seem logically appropriate.',effect:'The audience may perceive difference as biological threat rather than social complexity.'},
    {label:'War metaphor',meaning:'Battle language converts disagreement or difficulty into conflict with enemies, winners and defeat.',effect:'The audience may experience compromise as weakness and aggression as necessary.'}
  ],
  'Religious, economic & mechanical frames':[
    {label:'Religious frame',meaning:'Sacred or sinful language moralises an issue and can elevate ordinary loyalty into duty.',effect:'The audience may judge disagreement as morally wrong rather than merely different.'},
    {label:'Economic frame',meaning:'Value, debt and investment language turns relationships or identities into transactions.',effect:'The audience begins interpreting people through worth, exchange and return.'},
    {label:'Mechanical frame',meaning:'Machine and efficiency language reduces people to functions, output or replaceable parts.',effect:'The audience may prioritise productivity over individuality or humanity.'}
  ],
  'Medium & context as meaning':[
    {label:'Medium',meaning:'The form of delivery determines what kinds of scale, pacing, interaction and attention are possible.',effect:'The audience experiences the same message differently on a billboard, page, stage or social feed.'},
    {label:'Context of reception',meaning:'Where and when the text is encountered changes what the audience can notice and how urgently it must process the message.',effect:'The audience’s interpretation is shaped by conditions such as speed, privacy, public visibility or shareability.'}
  ],
  'Intertextuality & subversion':[
    {label:'Intertextuality',meaning:'Referencing an existing story or image imports its associations without needing to explain them from scratch.',effect:'The audience recognises a familiar cultural script and brings prior expectations into the new work.'},
    {label:'Subversion',meaning:'Altering the familiar reference challenges the assumptions attached to the original.',effect:'The audience first recognises the old meaning, then is forced to reconsider it through the change.'}
  ],
  'Compare methods, not just themes':[
    {label:'Theme comparison',meaning:'A shared concern establishes what the works have in common but does not yet explain how meaning is made.',effect:'The reader understands conceptual similarity but not the distinctive experience created by each work.'},
    {label:'Method comparison',meaning:'Comparing form, language, perspective or visual grammar reveals how the same concern is constructed differently.',effect:'The reader can see why two works position audiences differently even when they address the same issue.'}
  ],
  'Micro choice → macro pattern':[
    {label:'Micro choice',meaning:'A tiny extract-level detail provides precise evidence for how meaning is being constructed locally.',effect:'The analysis feels grounded because it begins with something directly observable.'},
    {label:'Macro pattern',meaning:'The wider recurring strategy shows that the local choice belongs to a sustained representational pattern across the body of work.',effect:'The argument expands convincingly from close reading to creator-wide meaning without jumping straight to theme.'}
  ],
  'Pattern + exception':[
    {label:'Pattern',meaning:'A dominant recurrence supports the main claim by showing that the method is sustained rather than accidental.',effect:'The reader sees a coherent tendency across the body of work.'},
    {label:'Exception',meaning:'A deliberate departure tests the limits of that tendency and reveals where the creator complicates their own pattern.',effect:'The argument becomes more nuanced because it explains both the rule and where the rule stops being fully true.'}
  ]
};

function esc(value:string){
  return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function enrichCard(card:HTMLElement){
  if(card.dataset.insightFeatureBreakdownReady==='true')return;
  const title=card.querySelector<HTMLElement>('.insight-card-title b')?.textContent?.trim();
  if(!title)return;
  const items=breakdowns[title];
  if(!items?.length)return;
  const body=card.querySelector<HTMLElement>('.insight-card-body');
  if(!body)return;

  const meaning=body.querySelector<HTMLElement>('.insight-meaning');
  const effect=Array.from(body.querySelectorAll<HTMLElement>('.insight-answer')).find(el=>!el.classList.contains('insight-meaning')&&!el.classList.contains('insight-deeper'));
  if(!meaning||!effect)return;

  const block=document.createElement('section');
  block.className='insight-feature-breakdown';
  block.innerHTML=`
    <div class="insight-feature-head">
      <span>FEATURE-BY-FEATURE ANALYSIS</span>
      <small>${items.length} PARTS · ANALYSE EACH ONE</small>
    </div>
    <div class="insight-feature-grid cols-${items.length}">
      ${items.map((item,index)=>`
        <article class="insight-feature-item">
          <div class="insight-feature-title"><i>${String(index+1).padStart(2,'0')}</i><b>${esc(item.label)}</b></div>
          <div class="insight-feature-point"><small>HOW IT CREATES MEANING</small><p>${esc(item.meaning)}</p></div>
          <div class="insight-feature-point is-effect"><small>READER / PASSAGE EFFECT</small><p>${esc(item.effect)}</p></div>
        </article>`).join('')}
    </div>`;

  body.insertBefore(block,meaning);
  meaning.remove();
  effect.remove();
  card.dataset.insightFeatureBreakdownReady='true';
  card.dataset.insightSearch=`${card.dataset.insightSearch||''} ${items.map(item=>`${item.label} ${item.meaning} ${item.effect}`).join(' ')}`.toLowerCase();
}

function enrich(){document.querySelectorAll<HTMLElement>('.insight-card').forEach(enrichCard);}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enrich();});}
const observer=new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length))schedule();});
function start(){enrich();observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
