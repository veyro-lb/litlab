import './insightful-analysis-feature-examples.css';

type MiniExample={evidence:string;reading:string};

// Each named feature inside a compound lens gets its own deliberately hypothetical
// example. The combined example below the cards remains as the synthesis model.
const featureExamples:Record<string,Record<string,MiniExample>>={
  'Pronoun shifts & group boundaries':{
    'Pronoun shift':{evidence:'“I can fix this” becomes “we can fix this.”',reading:'The shift expands a private claim into a collective voice, changing responsibility and belonging.'},
    'Group boundary':{evidence:'“We protect our streets from them.”',reading:'“We/our” creates an in-group while “them” constructs a socially distant out-group.'}
  },
  'Passive voice & hidden responsibility':{
    'Passive voice':{evidence:'“The windows were broken overnight.”',reading:'The damaged object is foregrounded, so consequence becomes more prominent than the actor.'},
    'Hidden responsibility':{evidence:'“Mistakes were made.”',reading:'Because no agent is named, accountability becomes harder to assign and the action sounds less deliberate.'}
  },
  'Naming, labels & titles':{
    'Naming':{evidence:'“Maya waited by the door.”',reading:'The proper name individualises the subject and encourages the reader to encounter her as a distinct person.'},
    'Labels':{evidence:'“The immigrant waited by the door.”',reading:'The label reduces identity to one social category, making that category the reader’s first interpretive frame.'},
    'Titles':{evidence:'“Professor Lee entered; Sam followed.”',reading:'The title foregrounds institutional status and can create hierarchy before either person acts.'}
  },
  'Possessives & ownership':{
    'Possessives':{evidence:'“Our land, our future.”',reading:'The repeated possessive grammatically binds place and future to a collective identity.'},
    'Ownership':{evidence:'“You are mine.”',reading:'The language moves beyond intimacy toward control, making the relationship sound proprietary.'}
  },
  'Certainty, hedging & epistemic markers':{
    'Certainty':{evidence:'“She definitely betrayed us.”',reading:'“Definitely” presents interpretation as settled fact and discourages competing explanations.'},
    'Hedging':{evidence:'“She seems to have changed.”',reading:'“Seems” weakens commitment, making the judgement provisional rather than absolute.'},
    'Epistemic markers':{evidence:'“As far as I know, he left early.”',reading:'The phrase exposes the limits of the speaker’s knowledge and reminds the reader that the account is partial.'}
  },
  'Presupposition & loaded questions':{
    'Presupposition':{evidence:'“She stopped cheating.”',reading:'The wording treats earlier cheating as already true rather than something that still needs proof.'},
    'Loaded question':{evidence:'“Why do you keep ignoring your family?”',reading:'The accusation is embedded inside the question, forcing the respondent to answer within a hostile frame.'}
  },
  'Quantifiers & absolutes':{
    'Quantifiers':{evidence:'“Some students struggled” becomes “most students struggled.”',reading:'The quantifier changes the apparent scale of the problem without changing what “struggled” means.'},
    'Absolutes':{evidence:'“You never listen.”',reading:'“Never” erases exceptions and can reveal emotional extremity, rigidity or exaggeration.'}
  },
  'Euphemism & sanitised language':{
    'Euphemism':{evidence:'“He passed away.”',reading:'The softer phrase reduces the blunt emotional force of “died,” potentially protecting speaker or audience from discomfort.'},
    'Sanitised language':{evidence:'“Residents were relocated.”',reading:'Administrative diction strips away the human experience of being forced from a home and makes the action sound procedural.'}
  },
  'Semantic fields & colliding lexicons':{
    'Semantic field':{evidence:'A speech repeats “battle,” “defend,” “enemy,” and “victory.”',reading:'The recurring war vocabulary frames the issue as conflict and makes compromise feel less natural.'},
    'Colliding lexicons':{evidence:'A love poem describes “investment,” “debt,” and “returns.”',reading:'Economic language transfers transactional logic into intimacy, making affection sound measurable or exchange-based.'}
  },
  'Sentence length & syntactic control':{
    'Sentence length':{evidence:'A 60-word anxious sentence is followed by: “Stop.”',reading:'The length shift moves the reader from breathless accumulation to abrupt control.'},
    'Syntactic control':{evidence:'Early sentences are balanced and subordinate; later clauses break into fragments.',reading:'The loss of grammatical organisation can formally mirror a loss of psychological control.'}
  },
  'Fragments, parataxis & hypotaxis':{
    'Fragments':{evidence:'“No keys. No phone. No way out.”',reading:'Incomplete units isolate each detail and can make panic or certainty feel immediate.'},
    'Parataxis':{evidence:'“He arrived. She turned. The door closed.”',reading:'Side-by-side clauses flatten hierarchy and can make events feel relentless, factual or emotionally numb.'},
    'Hypotaxis':{evidence:'“Although she wanted to leave, because her mother was waiting, she stayed.”',reading:'Subordination layers motives and dependencies, making thought feel qualified and complex.'}
  },
  'Dashes, ellipses & self-correction':{
    'Dashes':{evidence:'“I wanted to tell him—but I couldn’t.”',reading:'The dash creates a visible collision between desire and restraint.'},
    'Ellipses':{evidence:'“I thought maybe we could…”',reading:'The unfinished thought makes hesitation and what remains unsaid part of the meaning.'},
    'Self-correction':{evidence:'“I loved her—respected her, I mean.”',reading:'The first word exposes an impulse the speaker immediately tries to revise or police.'}
  },
  'Silence, omission & the unsaid':{
    'Silence':{evidence:'Asked to apologise, the character says nothing and holds eye contact.',reading:'Silence can function as refusal rather than weakness when the surrounding behaviour gives it agency.'},
    'Omission':{evidence:'A memoir narrates the minutes before and after an assault but skips the event itself.',reading:'The missing event becomes structurally conspicuous and may mark trauma, censorship or a limit of narration.'},
    'The unsaid':{evidence:'“You know what happens if you leave.”',reading:'The threat remains implicit, forcing the reader to infer a more disturbing meaning than the literal words state.'}
  },
  'Tense shifts & temporal distance':{
    'Tense shift':{evidence:'“I opened the door. Suddenly, I am back there.”',reading:'The move into present tense collapses chronological distance and makes memory feel immediate.'},
    'Temporal distance':{evidence:'“Years later, I can still hear the lock turn.”',reading:'The sentence acknowledges elapsed time while showing that emotional distance has not increased with it.'}
  },
  'Circular structure & opening/ending echoes':{
    'Circular structure':{evidence:'A story begins and ends at the same bus stop.',reading:'The return can suggest entrapment, recurrence or a deliberately closed structural loop.'},
    'Opening/ending echo':{evidence:'Opening: “The door was locked.” Ending: “She locked the door herself.”',reading:'The repeated image gains new meaning because the agent changes from external control to possible self-protection.'}
  },
  'Narrative gaps & skipped moments':{
    'Narrative gap':{evidence:'The narrator never explains why a sibling disappeared from family photographs.',reading:'A sustained absence creates an area of withheld knowledge that can destabilise trust or expose repression.'},
    'Skipped moment':{evidence:'“He raised his hand. Then I was on the floor.”',reading:'Skipping the impact makes the missing instant conspicuous and shifts attention to its traces and consequences.'}
  },
  'Pacing & disproportionate attention':{
    'Pacing':{evidence:'A chase covers three pages; the arrest happens in one sentence.',reading:'Uneven narrative speed determines which experience the reader is made to inhabit most intensely.'},
    'Disproportionate attention':{evidence:'A death gets one line; an untouched cup gets two pages.',reading:'The imbalance can suggest emotional displacement, numbness or an inability to confront the larger event directly.'}
  },
  'Genre, layout & white-space disruption':{
    'Genre':{evidence:'A love poem is written like a legal contract.',reading:'The genre clash imports rules, obligation and transaction into a supposedly intimate subject.'},
    'Layout':{evidence:'A PSA places “YOU” alone at the top and the consequence far below.',reading:'Physical arrangement controls sequence and can make responsibility visually precede the outcome.'},
    'White space':{evidence:'One word—“alone”—appears surrounded by an almost empty page.',reading:'The page makes isolation spatial, so the reader physically encounters absence rather than only reading about it.'}
  },
  'Unreliable narration as self-protection':{
    'Unreliable narration':{evidence:'“Nobody feared me,” he says after describing a room falling silent when he enters.',reading:'The contradiction gives the reader evidence to correct the narrator’s account.'},
    'Self-protection':{evidence:'He repeatedly calls intimidation “leadership.”',reading:'The reframing preserves a positive self-image, giving the distortion a psychological motive.'}
  },
  'Dialogue turn-taking & interruption':{
    'Turn-taking':{evidence:'One character asks every question while the other only answers.',reading:'Control of questions gives one speaker power over topic, pace and what counts as relevant.'},
    'Interruption':{evidence:'“I just think—” / “No. We’re done.”',reading:'The interruption removes the first speaker’s ability to complete thought, enacting dominance through conversational structure.'}
  },
  'Identity as performance & code-switching':{
    'Identity as performance':{evidence:'At work he is formal and restrained; with friends he becomes loud and playful.',reading:'The contrast suggests self-presentation changes with audience and social expectation rather than remaining fixed.'},
    'Code-switching':{evidence:'“Good evening, sir” at school; “Yo, what’s good?” at home.',reading:'The register shift shows linguistic adaptation to different communities and power contexts.'}
  },
  'Mirrors, clothing & self-surveillance':{
    'Mirrors':{evidence:'She rehearses a smile in the mirror before entering the party.',reading:'The reflection turns the self into an object of judgement and suggests identity is being prepared for an external gaze.'},
    'Clothing':{evidence:'He removes his bright jacket before entering the boardroom.',reading:'Dress becomes a visible negotiation between individuality and institutional conformity.'},
    'Self-surveillance':{evidence:'Alone, she corrects her posture whenever she imagines being photographed.',reading:'No authority is present, yet absorbed standards still regulate behaviour from within.'}
  },
  'Motif evolution & unstable symbols':{
    'Motif evolution':{evidence:'A key first opens an escape route; later it locks someone else out.',reading:'The recurring object accumulates new associations, moving from freedom toward control.'},
    'Unstable symbols':{evidence:'The sea comforts the protagonist early but becomes threatening during escape.',reading:'The same symbol holds conflicting meanings, so context matters more than a fixed dictionary interpretation.'}
  },
  'Camera angle & vertical power':{
    'Camera angle':{evidence:'A child is photographed from directly above.',reading:'The high angle places the viewer physically over the subject and can make the child appear smaller or more vulnerable.'},
    'Vertical power':{evidence:'A leader stands on a platform while the crowd remains below.',reading:'Height turns abstract status into spatial hierarchy even without an extreme camera angle.'}
  },
  'Framing & what exists outside the frame':{
    'Framing':{evidence:'A charity poster uses a tight close-up of one crying child.',reading:'The tight frame intensifies individual emotion and narrows attention to the personal experience.'},
    'Outside the frame':{evidence:'No family, camp, policy or landscape is visible around the child.',reading:'Excluded context can hide structural causes and encourage the viewer to read suffering as isolated tragedy.'}
  },
  'Cropping & body fragmentation':{
    'Cropping':{evidence:'A sports ad cuts off the runner’s head and shows only shoes and legs.',reading:'The crop directs attention toward performance and product while removing identity and facial expression.'},
    'Body fragmentation':{evidence:'Across the campaign, women appear only as lips, waists and legs.',reading:'Repeated fragmentation turns people into consumable visual parts rather than complete subjects.'}
  },
  'Negative space & visual marginalisation':{
    'Negative space':{evidence:'A single chair sits in the middle of a nearly empty poster.',reading:'The surrounding emptiness magnifies isolation, exposure or importance through spatial contrast.'},
    'Visual marginalisation':{evidence:'A worker appears tiny at the extreme edge while executives fill the centre.',reading:'Peripheral placement makes social marginality visible through composition.'}
  },
  'Foreground, background & depth hierarchy':{
    'Foreground':{evidence:'A tourist fills the front of the photograph in sharp focus.',reading:'Foregrounding grants immediacy and makes the tourist’s experience the primary point of attention.'},
    'Background':{evidence:'Workers appear blurred behind the tourist.',reading:'Backgrounding can reduce individuals to scenery supporting someone else’s experience.'},
    'Depth hierarchy':{evidence:'The tourist is large and sharp; workers are small, distant and blurred.',reading:'Combined depth cues rank whose presence and experience the viewer is encouraged to value most.'}
  },
  'Salience & visual hierarchy':{
    'Salience':{evidence:'A single red word “STOP” dominates an otherwise grey poster.',reading:'Contrast and scale make one element command attention before the viewer processes the rest.'},
    'Visual hierarchy':{evidence:'The eye moves from crash image → statistic → “Call now.”',reading:'The ordered sequence turns separate elements into an argument: emotion, evidence, then action.'}
  },
  'Vectors & reading path':{
    'Vectors':{evidence:'A model’s gaze points directly toward the watch on her wrist.',reading:'The eye-line creates a directional link that guides attention toward the product.'},
    'Reading path':{evidence:'The composition leads from face → watch → logo → slogan.',reading:'The full sequence choreographs how the viewer encounters desire, product and brand meaning.'}
  },
  'Proxemics, barriers & thresholds':{
    'Proxemics':{evidence:'Two siblings sit at opposite ends of a long table.',reading:'Physical distance externalises emotional separation without needing explicit dialogue.'},
    'Barriers':{evidence:'They speak through a closed glass door.',reading:'The barrier allows visibility while blocking contact, making connection and separation coexist.'},
    'Thresholds':{evidence:'A character pauses in a doorway with one foot inside and one outside.',reading:'The threshold materialises liminality and an identity caught between spaces or choices.'}
  },
  'Symmetry & broken symmetry':{
    'Symmetry':{evidence:'Rows of identical students stand evenly spaced in a school poster.',reading:'Balanced repetition establishes order and conformity as the visual norm.'},
    'Broken symmetry':{evidence:'One student turns sideways while every other figure faces front.',reading:'The disruption gains meaning because the surrounding symmetry first created a rule to break.'}
  },
  'Typography, scale & fine print':{
    'Typography':{evidence:'A luxury brand uses thin, widely spaced serif capitals.',reading:'The font treatment can construct restraint, exclusivity and prestige before the slogan is interpreted.'},
    'Scale':{evidence:'“FREE” is ten times larger than every other word.',reading:'Relative size makes the promise visually dominant and therefore more memorable.'},
    'Fine print':{evidence:'“Conditions apply” appears in tiny text under the offer.',reading:'The qualification is visually subordinated, making complexity easier to overlook than the headline claim.'}
  },
  'Colour & lighting relationships':{
    'Colour relationships':{evidence:'The same red appears on the warning sign, phone notification and final command.',reading:'Repetition visually links separate elements into one conceptual chain of danger and action.'},
    'Lighting relationships':{evidence:'One figure is brightly lit while the rest remain in shadow.',reading:'Visibility itself creates hierarchy, directing attention and symbolic importance toward the illuminated subject.'}
  },
  'Image-text anchorage & contradiction':{
    'Anchorage':{evidence:'A photo of an empty street is captioned “After the eviction.”',reading:'The caption narrows an ambiguous image toward loss and displacement rather than calm or emptiness in general.'},
    'Image-text contradiction':{evidence:'The word “PROGRESS” appears over polluted smokestacks.',reading:'The visual evidence destabilises the positive wording and forces the viewer to resolve an ironic gap.'}
  },
  'Manufactured insecurity & aspirational identity':{
    'Manufactured insecurity':{evidence:'“Still hiding your skin?”',reading:'The question constructs ordinary appearance as a deficiency before any product is introduced.'},
    'Aspirational identity':{evidence:'“Reveal the confident you.”',reading:'The campaign offers an ideal future self, attaching self-transformation to consumption.'}
  },
  'Product absence & association transfer':{
    'Product absence':{evidence:'A car ad shows mountains and sunrise for 25 seconds; the car appears only at the end.',reading:'Minimal product information shifts desire toward lifestyle, freedom and atmosphere.'},
    'Association transfer':{evidence:'The final car appears immediately after images of open roads and escape.',reading:'The emotional qualities of freedom are transferred onto the product through proximity and sequence.'}
  },
  'Fear, guilt & shock appeals':{
    'Fear appeal':{evidence:'“One text could be the last thing you ever send.”',reading:'The message makes personal danger vivid so avoiding the behaviour feels urgent.'},
    'Guilt appeal':{evidence:'“They go hungry while your leftovers go in the bin.”',reading:'The comparison makes ordinary inaction feel morally implicated and pressures the viewer through responsibility.'},
    'Shock appeal':{evidence:'A road-safety poster shows a phone screen cracked like a skull.',reading:'The disturbing visual breaks routine attention and makes the consequence difficult to ignore.'}
  },
  'Statistics & scientific authority':{
    'Statistics':{evidence:'“93% reported smoother skin.”',reading:'Numerical precision creates an appearance of measurable objectivity, even before methodology is examined.'},
    'Scientific authority':{evidence:'“Dermatologist tested with peptide complex technology.”',reading:'Technical register borrows the credibility of science and makes persuasion appear more rational than promotional.'}
  },
  'Testimonials, experts & celebrity transfer':{
    'Testimonials':{evidence:'“I used to hide my smile. Now I don’t.” — customer quote',reading:'A personal story turns an abstract product promise into an emotionally legible individual experience.'},
    'Experts':{evidence:'A cardiologist in a white coat explains the campaign statistic.',reading:'Specialist status lends epistemic authority because the speaker appears qualified to know.'},
    'Celebrity transfer':{evidence:'A famous athlete says, “This is the watch I trust.”',reading:'Status and admiration attached to the celebrity are transferred onto the product, regardless of technical expertise.'}
  },
  'Slogans, parallelism & rule of three':{
    'Slogans':{evidence:'“Think different.”',reading:'Compression makes a broad brand identity portable, repeatable and easy to remember.'},
    'Parallelism':{evidence:'“We work harder. We move faster. We aim higher.”',reading:'Repeated grammar gives separate claims rhythm, balance and a sense of rhetorical inevitability.'},
    'Rule of three':{evidence:'“Freedom. Justice. Future.”',reading:'The three-part sequence feels complete and memorable, giving abstract values a finished rhetorical shape.'}
  },
  'Pseudo-empowerment, cause marketing & tokenism':{
    'Pseudo-empowerment':{evidence:'“Own your power” ends with “Shop the collection.”',reading:'Liberation is translated into a purchasing act, potentially reducing structural empowerment to consumer confidence.'},
    'Cause marketing':{evidence:'A brand changes its logo for Pride month beside a product launch.',reading:'The social cause becomes part of corporate identity and may generate moral value for the brand.'},
    'Tokenism':{evidence:'A diverse cast appears, but only one body type and beauty standard is shown.',reading:'Surface representation broadens visibility while deeper norms of desirability remain largely unchanged.'}
  },
  'Humour, incongruity & satire':{
    'Humour':{evidence:'A climate ad jokes, “Great news: beachfront property is coming to you.”',reading:'Comedy lowers resistance while keeping the underlying threat cognitively accessible.'},
    'Incongruity':{evidence:'A businessman calmly waters a plant while the office floods around him.',reading:'The mismatch makes normal behaviour look absurd and exposes misplaced priorities.'},
    'Satire':{evidence:'A cartoon crowns a politician “King of Transparency” while hiding documents behind his back.',reading:'Irony and exaggeration invite the audience to judge hypocrisy through ridicule.'}
  },
  'Rhetorical questions & false binaries':{
    'Rhetorical questions':{evidence:'“How much longer can we ignore this?”',reading:'The question guides the audience toward urgency without openly stating the conclusion as a command.'},
    'False binaries':{evidence:'“Choose jobs or choose the planet.”',reading:'The either/or structure erases alternatives and makes two goals seem mutually exclusive.'}
  },
  'Internalised oppression & self-policing':{
    'Internalised oppression':{evidence:'A character repeats, “People like us aren’t meant for university.”',reading:'The social hierarchy has entered the character’s own self-concept and now limits aspiration from within.'},
    'Self-policing':{evidence:'No teacher is present, yet he removes his accent before answering aloud.',reading:'The subject actively corrects himself to satisfy absorbed norms without direct enforcement.'}
  },
  'Victim, saviour & spectacle narratives':{
    'Victim narrative':{evidence:'A charity ad shows recipients seated, silent and unnamed.',reading:'Helplessness is foregrounded, generating sympathy while reducing individuality and agency.'},
    'Saviour narrative':{evidence:'The donor is named and centred while handing food to the group.',reading:'The rescuer receives action and identity, positioning the outsider as the moral agent of the scene.'},
    'Spectacle narrative':{evidence:'The camera lingers on tears in extreme close-up.',reading:'Pain becomes the visual material used to secure attention, creating an ethical tension around spectatorship.'}
  },
  'Disease & war metaphors':{
    'Disease metaphor':{evidence:'“Corruption is a cancer spreading through the city.”',reading:'The metaphor makes the problem sound invasive and implies that removal or cure is the logical response.'},
    'War metaphor':{evidence:'“We must defeat poverty on every front.”',reading:'Battle language creates enemies, victory and urgency, making compromise or complexity less central.'}
  },
  'Religious, economic & mechanical frames':{
    'Religious frame':{evidence:'“Sacrifice today for the sacred future of our nation.”',reading:'Sacred vocabulary moralises loyalty and can make disagreement appear ethically wrong rather than merely different.'},
    'Economic frame':{evidence:'“This friendship is no longer worth the investment.”',reading:'Transactional vocabulary makes intimacy sound measurable in terms of cost, value and return.'},
    'Mechanical frame':{evidence:'“Every worker is a cog in the company machine.”',reading:'People are reduced to productive functions, foregrounding efficiency over individuality.'}
  },
  'Medium & context as meaning':{
    'Medium':{evidence:'A road-safety message appears as a six-word billboard.',reading:'The billboard medium demands instant legibility and therefore rewards compression, scale and visual impact.'},
    'Context of reception':{evidence:'The billboard is placed beside a motorway exit.',reading:'Drivers encounter it quickly and in motion, so location and viewing time shape how the message can be processed.'}
  },
  'Intertextuality & subversion':{
    'Intertextuality':{evidence:'An ad recreates Cinderella’s glass-slipper scene.',reading:'The familiar reference imports ideas of transformation, desirability and the “perfect fit” before the ad explains them.'},
    'Subversion':{evidence:'Cinderella chooses a running shoe and leaves alone.',reading:'Changing the expected object and ending challenges the original script of romantic selection and dependence.'}
  },
  'Compare methods, not just themes':{
    'Theme comparison':{evidence:'Text A and Text B both concern loneliness.',reading:'The shared idea establishes conceptual similarity but does not yet explain how either work creates the experience.'},
    'Method comparison':{evidence:'Text A uses first-person confession; Text B uses a tiny figure in negative space.',reading:'Comparing voice with composition shows how one work creates closeness while the other creates visual distance.'}
  },
  'Micro choice → macro pattern':{
    'Micro choice':{evidence:'Extract: “we” suddenly becomes “they.”',reading:'The pronoun shift gives precise local evidence of a boundary being constructed at that moment.'},
    'Macro pattern':{evidence:'Elsewhere, multiple posters visually separate the same groups with fences and distance.',reading:'Different techniques repeat the same underlying strategy, allowing close analysis to scale into a body-of-work claim.'}
  },
  'Pattern + exception':{
    'Pattern':{evidence:'Six campaign images crop women into isolated body parts.',reading:'The recurrence supports a sustained claim that fragmentation is a dominant representational method.'},
    'Exception':{evidence:'One final portrait shows a fully framed woman returning the viewer’s gaze.',reading:'The departure qualifies the thesis and may deliberately restore agency where the wider pattern usually removes it.'}
  }
};

function esc(value:string){
  return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function enrichCard(card:HTMLElement){
  const title=card.querySelector<HTMLElement>('.insight-card-title b')?.textContent?.trim();
  if(!title)return;
  const byFeature=featureExamples[title];
  if(!byFeature)return;

  const featureCards=card.querySelectorAll<HTMLElement>('.insight-feature-item');
  if(!featureCards.length)return;

  featureCards.forEach(featureCard=>{
    if(featureCard.dataset.insightMiniExampleReady==='true')return;
    const label=featureCard.querySelector<HTMLElement>('.insight-feature-title b')?.textContent?.trim();
    if(!label)return;
    const example=byFeature[label];
    if(!example)return;

    const block=document.createElement('div');
    block.className='insight-feature-example';
    block.innerHTML=`
      <small>MINI EXAMPLE · ${esc(label)}</small>
      <p class="insight-feature-example-evidence">${esc(example.evidence)}</p>
      <p class="insight-feature-example-reading"><b>Reading:</b> ${esc(example.reading)}</p>`;
    featureCard.appendChild(block);
    featureCard.dataset.insightMiniExampleReady='true';
    card.dataset.insightSearch=`${card.dataset.insightSearch||''} ${example.evidence} ${example.reading}`.toLowerCase();
  });

  const combined=card.querySelector<HTMLElement>('.insight-example');
  const combinedLabel=combined?.querySelector<HTMLElement>('.insight-example-head span');
  if(combinedLabel&&!combinedLabel.dataset.insightSynthesisLabel){
    combinedLabel.textContent='SYNTHESIS EXAMPLE · PUT THE FEATURES TOGETHER';
    combinedLabel.dataset.insightSynthesisLabel='true';
  }
}

function enrich(){document.querySelectorAll<HTMLElement>('.insight-card').forEach(enrichCard);}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enrich();});}
const observer=new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length))schedule();});
function start(){enrich();observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
