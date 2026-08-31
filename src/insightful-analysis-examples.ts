import './insightful-analysis-examples.css';

type InsightExample={
  context:string;
  evidence:string;
  analysis:string;
};

// All examples are intentionally hypothetical so students learn the analytical move
// without mistaking a model sentence for a quotation from a real work.
const examples:Record<string,InsightExample>={
  'Pronoun shifts & group boundaries':{
    context:'Hypothetical speech',
    evidence:'“I have seen the problem. We must protect our neighbourhood from them.”',
    analysis:'The movement from “I” → “we” → “them” turns one speaker’s view into a collective identity, then strengthens that identity by constructing an excluded out-group.'
  },
  'Grammatical agency':{
    context:'Hypothetical novel',
    evidence:'“The manager decided the schedule. The workers were told to leave.”',
    analysis:'The manager occupies the active subject position while the workers receive actions. Grammar therefore reproduces the workplace hierarchy before the narrator explicitly comments on power.'
  },
  'Passive voice & hidden responsibility':{
    context:'Hypothetical news line',
    evidence:'“Dozens of homes were destroyed overnight.”',
    analysis:'The destruction is foregrounded but the destroyer disappears. If responsibility is central to the context, the passive construction can make deliberate violence sound more like an event that simply occurred.'
  },
  'Naming, labels & titles':{
    context:'Hypothetical novel',
    evidence:'“Dr Patel entered first. The cleaner followed behind him.”',
    analysis:'One figure is individualised by name and professional title while the other is reduced to a job. The asymmetry in naming can mirror an asymmetry in social recognition.'
  },
  'Possessives & ownership':{
    context:'Hypothetical dialogue',
    evidence:'“You are my wife. You belong here with me.”',
    analysis:'The possessive “my” begins as conventional relationship language, but “belong” pushes intimacy toward ownership. The surrounding diction determines whether affection has become entitlement.'
  },
  'Modality: must, should, can, might':{
    context:'Hypothetical campaign',
    evidence:'“We might change. We should change. We must change now.”',
    analysis:'The escalating modal force narrows the space for disagreement: possibility becomes moral expectation and finally necessity.'
  },
  'Certainty, hedging & epistemic markers':{
    context:'Hypothetical narrator',
    evidence:'“Obviously, she had forgiven me.”',
    analysis:'“Obviously” performs certainty, yet the need to announce that certainty can make the reader suspicious. The word may reveal self-reassurance rather than secure knowledge.'
  },
  'Presupposition & loaded questions':{
    context:'Hypothetical PSA',
    evidence:'“Why are you still wasting water?”',
    analysis:'The question does not debate whether the viewer wastes water; it treats that accusation as already settled. The audience is pushed to respond inside the campaign’s frame.'
  },
  'Quantifiers & absolutes':{
    context:'Hypothetical speech',
    evidence:'“Everyone knows these changes always fail.”',
    analysis:'“Everyone” and “always” erase exceptions and make a partial judgement sound universal. The certainty can reveal ideological rigidity as much as confidence.'
  },
  'Euphemism & sanitised language':{
    context:'Hypothetical company statement',
    evidence:'“A workforce adjustment will affect several departments.”',
    analysis:'“Workforce adjustment” replaces the more human reality of people losing jobs. The euphemism makes the decision sound technical and administrative rather than emotionally consequential.'
  },
  'Nominalisation':{
    context:'Hypothetical report',
    evidence:'“The removal of residents was completed by Friday.”',
    analysis:'Turning “removed” into the noun “removal” makes the action feel like a process. Rewriting it as “officials removed residents” restores the human agent that the original grammar backgrounds.'
  },
  'Semantic fields & colliding lexicons':{
    context:'Hypothetical dating ad',
    evidence:'“Invest in love. Know your worth. Find someone of real value.”',
    analysis:'The economic semantic field contaminates intimacy with the logic of markets, subtly presenting relationships as transactions measured through investment and value.'
  },

  'Pattern breaking':{
    context:'Hypothetical novel',
    evidence:'Six long, carefully qualified sentences are followed by: “Enough.”',
    analysis:'The fragment matters because the prose first establishes syntactic control. Breaking that pattern formally enacts a moment when deliberation collapses into certainty or emotional rupture.'
  },
  'Repetition with variation':{
    context:'Hypothetical memoir',
    evidence:'“I remember the door.” → “I remember the shouting.” → “I almost remember his face.”',
    analysis:'The repeated opening creates continuity, but “almost” introduces failure at the most personal detail. The variation turns repetition into a map of unstable memory.'
  },
  'Sentence length & syntactic control':{
    context:'Hypothetical fiction',
    evidence:'A breathless 70-word sentence lists every possible consequence, then ends with: “She stops.”',
    analysis:'The long accumulation traps the reader inside spiralling thought; the abrupt short sentence then cuts off that mental momentum, making the stop feel physical as well as grammatical.'
  },
  'Fragments, parataxis & hypotaxis':{
    context:'Hypothetical fiction',
    evidence:'“Door. Footsteps. Silence.”',
    analysis:'The fragments remove connective explanation, forcing the reader to process isolated sensory units. The syntax can mimic shock, vigilance or a mind unable to organise experience into complete thought.'
  },
  'Dashes, ellipses & self-correction':{
    context:'Hypothetical dialogue',
    evidence:'“I wanted—needed—to leave.”',
    analysis:'The dash interrupts the weaker verb and replaces it with a stronger one. The self-revision lets the reader witness the speaker correcting their own emotional truth in real time.'
  },
  'Silence, omission & the unsaid':{
    context:'Hypothetical memoir',
    evidence:'The narrator describes the drive before the crash and the hospital afterward, but never narrates the collision itself.',
    analysis:'The gap becomes meaningful because the narrative can approach the event from both sides but cannot enter it. The omission may mark the limit of memory or psychological tolerance.'
  },
  'Tense shifts & temporal distance':{
    context:'Hypothetical memoir',
    evidence:'“I walked into the room. The lights were off. Suddenly, I am there again.”',
    analysis:'The shift from past to present collapses chronological distance, implying that the memory remains psychologically immediate rather than safely completed.'
  },
  'Circular structure & opening/ending echoes':{
    context:'Hypothetical short story',
    evidence:'The story opens with a locked bedroom door and ends with the protagonist locking that same door from the inside.',
    analysis:'The repeated image creates circularity, but the changed agent transforms its meaning: what began as imposed confinement may end as chosen privacy or self-protection.'
  },
  'Narrative gaps & skipped moments':{
    context:'Hypothetical narrator',
    evidence:'“He raised his hand. The next thing I remember is the kitchen floor.”',
    analysis:'The text omits the central event while preserving its before-and-after effects. The missing moment can make trauma visible through the narrator’s inability to represent it directly.'
  },
  'Pacing & disproportionate attention':{
    context:'Hypothetical novel',
    evidence:'A death is reported in one sentence; the next two pages meticulously describe the untouched cup of tea beside the bed.',
    analysis:'Attention is displaced from the catastrophic event onto a trivial object. The disproportion can suggest numbness: the character can process the cup more easily than the loss.'
  },
  'Genre, layout & white-space disruption':{
    context:'Hypothetical poem',
    evidence:'A breakup poem is formatted like a receipt: “TIME: 3 years / TRUST: returned / TOTAL: 0”.',
    analysis:'The commercial layout forces intimacy into the logic of transaction. Form therefore does the analytical work before individual metaphors are even examined.'
  },

  'Focalisation: whose reality do we inhabit?':{
    context:'Hypothetical novel',
    evidence:'A child describes the arriving officers only as “men with shiny buttons” while the adults hide documents.',
    analysis:'Restricted focalisation gives the reader the child’s limited perception while contextual clues let us infer danger the child cannot name. Innocence and threat coexist in the same scene.'
  },
  'Unreliable narration as self-protection':{
    context:'Hypothetical novel',
    evidence:'“I never frightened anyone,” the narrator insists, moments after describing how everyone goes silent when he enters.',
    analysis:'The contradiction suggests that unreliability protects his self-image. Denying fear allows him to preserve an identity as reasonable rather than intimidating.'
  },
  'Narrative distance':{
    context:'Hypothetical memoir',
    evidence:'After pages of intimate family detail, the mother’s death becomes: “The body was removed at 6:10.”',
    analysis:'The sudden clinical register creates distance exactly where emotion should peak. Detachment can therefore be read as a defensive response rather than absence of feeling.'
  },
  'Dialogue turn-taking & interruption':{
    context:'Hypothetical drama',
    evidence:'“I think we should—” / “No. Listen to me.”',
    analysis:'The second speaker controls not only the topic but the first speaker’s ability to complete thought. Power is enacted through ownership of conversational space.'
  },
  'Identity as performance & code-switching':{
    context:'Hypothetical novel',
    evidence:'At school she says, “Good afternoon, sir.” At home: “Bro, you should’ve seen it.”',
    analysis:'The register shift shows identity adapting to audience and power context. Rather than proving one voice is fake, the contrast can show how belonging requires different performances.'
  },
  'Setting as ideology':{
    context:'Hypothetical film',
    evidence:'Executives meet in a glass office above the city; cleaners work in windowless basement corridors.',
    analysis:'Vertical and spatial organisation turns hierarchy into architecture. The building literally gives one group visibility and overview while containing another below.'
  },
  'Mirrors, clothing & self-surveillance':{
    context:'Hypothetical novel',
    evidence:'Alone before a party, she changes dresses four times and checks her waist in the mirror after each one.',
    analysis:'No external judge is present, yet social judgement still operates. The mirror becomes a mechanism through which external beauty standards have been internalised.'
  },
  'Motif evolution & unstable symbols':{
    context:'Hypothetical novel',
    evidence:'A key first lets the protagonist escape home; later she grips the same key while locking someone else out.',
    analysis:'The motif shifts from freedom to control. Tracking that change is stronger than claiming “the key symbolises freedom” throughout.'
  },
  'Character contradiction':{
    context:'Hypothetical novel',
    evidence:'“Money means nothing to me,” he says, while repeatedly checking the labels on other guests’ clothes.',
    analysis:'His behaviour destabilises his self-description. The contradiction can reveal status anxiety rather than simple lying: he may genuinely want to believe he is above material judgement.'
  },

  'The gaze: who looks and who is looked at?':{
    context:'Hypothetical fashion ad',
    evidence:'The model looks away from the camera while the photograph invites the viewer to inspect her body unobstructed.',
    analysis:'Because the subject does not return the gaze, the viewer occupies the active position of observer. The visual relationship can encourage objectification rather than reciprocal encounter.'
  },
  'Camera angle & vertical power':{
    context:'Hypothetical campaign poster',
    evidence:'A candidate is photographed from below against an open sky, filling most of the frame.',
    analysis:'The low viewpoint and enlarged scale monumentalise the candidate. The audience is physically positioned beneath the figure, translating political authority into visual height.'
  },
  'Framing & what exists outside the frame':{
    context:'Hypothetical charity ad',
    evidence:'A tight close-up shows one crying child; no family, camp, landscape or political context is visible.',
    analysis:'The frame intensifies individual emotion while removing structural context. The viewer is encouraged to read poverty as a personal tragedy before considering its causes.'
  },
  'Cropping & body fragmentation':{
    context:'Hypothetical perfume ad',
    evidence:'Only a woman’s lips, neck and hand appear beside the bottle; her full face is never shown.',
    analysis:'The crop fragments the person into desirable surfaces, weakening individual identity and making the body visually consumable alongside the product.'
  },
  'Negative space & visual marginalisation':{
    context:'Hypothetical PSA',
    evidence:'A lone figure occupies the far lower-right corner while most of the poster is empty white space.',
    analysis:'The composition makes isolation spatial. If the campaign concerns social exclusion, peripheral placement can make marginalisation visible rather than merely naming loneliness.'
  },
  'Foreground, background & depth hierarchy':{
    context:'Hypothetical travel ad',
    evidence:'A tourist is sharp and brightly lit in front; local workers appear small and blurred behind her.',
    analysis:'Depth hierarchy grants individuality to the tourist while turning workers into scenery. Their labour becomes part of the environment that supports the privileged experience.'
  },
  'Salience & visual hierarchy':{
    context:'Hypothetical beauty ad',
    evidence:'The viewer sees a flawless face first, a small serum bottle second, and the brand logo last.',
    analysis:'The reading hierarchy creates a sequence from idealised appearance → proposed solution → brand. Desire is established before the product is introduced.'
  },
  'Vectors & reading path':{
    context:'Hypothetical advertisement',
    evidence:'The model’s eyes look downward toward the watch, while her arm forms a diagonal pointing to the logo.',
    analysis:'Eye-line and body position choreograph attention toward the commodity. The person becomes part of the ad’s directional system for moving the viewer toward purchase.'
  },
  'Proxemics, barriers & thresholds':{
    context:'Hypothetical film still',
    evidence:'Two family members face each other through a closed glass door.',
    analysis:'They can see one another but cannot touch. The transparent barrier makes emotional awareness and physical separation exist simultaneously.'
  },
  'Symmetry & broken symmetry':{
    context:'Hypothetical dystopian poster',
    evidence:'Twenty identical figures stand in perfect rows; one person turns sideways.',
    analysis:'The symmetrical pattern establishes conformity as the visual norm, so the single altered posture acquires disproportionate meaning as individuality or resistance.'
  },
  'Typography, scale & fine print':{
    context:'Hypothetical advertisement',
    evidence:'“FREE FOR A YEAR” fills half the page; “with selected plans” appears in tiny text below.',
    analysis:'Typography ranks the emotional promise above the qualification. The visual hierarchy makes persuasion immediate while complexity becomes easy to overlook.'
  },
  'Colour & lighting relationships':{
    context:'Hypothetical road-safety PSA',
    evidence:'The same red appears only on the warning icon, the driver’s phone notification and the final word “STOP”.',
    analysis:'Meaning comes from repetition across elements, not from “red = danger” alone. The colour visually links distraction to the campaign’s warning and command.'
  },
  'Image-text anchorage & contradiction':{
    context:'Hypothetical corporate ad',
    evidence:'The headline reads “PROGRESS” over a photograph dominated by smokestacks and grey haze.',
    analysis:'The image destabilises the positive word. The viewer must resolve the contradiction, exposing a gap between the company’s rhetoric of progress and its visible consequences.'
  },

  'Implied audience':{
    context:'Hypothetical sustainable-fashion ad',
    evidence:'“Choose better. Invest in pieces that last.” A coat is priced at $900.',
    analysis:'The campaign imagines a consumer wealthy enough to express environmental ethics through expensive purchasing. The implied audience therefore excludes people without that economic freedom.'
  },
  'Manufactured insecurity & aspirational identity':{
    context:'Hypothetical skincare ad',
    evidence:'“Still hiding your skin? Meet the confidence serum.”',
    analysis:'The first question constructs ordinary skin as a source of shame; the product then appears to sell confidence itself. The advertisement creates the deficiency that its solution promises to repair.'
  },
  'Product absence & association transfer':{
    context:'Hypothetical car ad',
    evidence:'For almost the entire ad we see an empty mountain road, sunrise and freedom; the car appears only beside the final logo.',
    analysis:'The campaign sells emotional associations before functional information. Freedom and escape are transferred onto the vehicle even though the product barely participates in the scene.'
  },
  'Fear, guilt & shock appeals':{
    context:'Hypothetical road-safety PSA',
    evidence:'A shattered phone screen appears beside the line: “Your message can wait. Their life cannot.”',
    analysis:'The campaign converts fear and anticipated guilt into behavioural urgency. The second-person possessive also makes the consequence feel personally attributable to the viewer.'
  },
  'Statistics & scientific authority':{
    context:'Hypothetical cosmetics ad',
    evidence:'“93% saw smoother skin. Clinically tested.” No sample size appears on the main page.',
    analysis:'Numerical precision and scientific register create an aura of objectivity, but the absent methodology limits what the statistic actually proves. The authority may be partly rhetorical.'
  },
  'Testimonials, experts & celebrity transfer':{
    context:'Hypothetical finance ad',
    evidence:'A famous footballer says, “This is the investing app I trust.”',
    analysis:'The brand borrows familiarity and success from the celebrity, but fame is not financial expertise. The endorsement transfers cultural status more clearly than relevant knowledge.'
  },
  'Slogans, parallelism & rule of three':{
    context:'Hypothetical campaign',
    evidence:'“Work harder. Live better. Be more.”',
    analysis:'Parallel imperatives make three separate values feel like one complete logic. The rhythm is memorable, but it also compresses a complicated idea of success into personal effort and self-optimisation.'
  },
  'Pseudo-empowerment, cause marketing & tokenism':{
    context:'Hypothetical beauty campaign',
    evidence:'“OWN YOUR POWER” appears above a diverse cast, yet every model is styled toward the same narrow body and beauty ideal.',
    analysis:'The campaign expands visible representation while keeping the underlying standard of desirability largely unchanged. Empowerment may therefore operate more at the level of branding than structural choice.'
  },
  'Humour, incongruity & satire':{
    context:'Hypothetical political cartoon',
    evidence:'Leaders stand in a flooding room arguing about the colour of the bucket instead of removing the water.',
    analysis:'The absurd mismatch makes procedural disagreement look ridiculous beside the scale of the crisis. Humour lowers resistance while exposing misplaced priorities.'
  },
  'Rhetorical questions & false binaries':{
    context:'Hypothetical political ad',
    evidence:'“Do you want to protect jobs—or protect the planet?”',
    analysis:'The either/or frame makes two goals appear mutually exclusive before evidence is discussed. A strong analysis identifies the erased third possibility: policy could attempt to protect both.'
  },

  'Normalisation':{
    context:'Hypothetical dystopian novel',
    evidence:'Characters scan identity cards at every doorway without comment, even inside their own apartment building.',
    analysis:'The striking feature is not surveillance alone but the absence of surprise. Routine behaviour shows that institutional monitoring has become embedded in ordinary life.'
  },
  'Naturalisation':{
    context:'Hypothetical advertisement',
    evidence:'“Boys will be boys,” the narrator says after showing aggressive behaviour as playful and expected.',
    analysis:'The phrase converts a social expectation into something that sounds biologically inevitable. Presenting behaviour as “natural” discourages the audience from questioning how it is taught or rewarded.'
  },
  'Othering':{
    context:'Hypothetical speech',
    evidence:'“Our families deserve security from those people crossing into our communities.”',
    analysis:'“Our” creates an intimate in-group while “those people” distances and homogenises outsiders. The threat is built through linguistic separation before any individual is described.'
  },
  'Power disguised as care':{
    context:'Hypothetical novel',
    evidence:'“I track your phone because I love you. I only want you safe.”',
    analysis:'The language of love and safety reframes surveillance as protection. Resistance can then be made to look like rejection of care, allowing control to operate through affection.'
  },
  'Internalised oppression & self-policing':{
    context:'Hypothetical novel',
    evidence:'No one is watching, yet she pinches her waist, skips lunch and repeats, “I need to look disciplined.”',
    analysis:'External judgement has become self-enforcement. The social standard no longer requires a visible authority because the character has learned to police her own body.'
  },
  'Commodification':{
    context:'Hypothetical fashion campaign',
    evidence:'A luxury T-shirt priced at $500 carries the slogan “REBEL AGAINST THE SYSTEM”.',
    analysis:'Rebellion is converted into a purchasable aesthetic. A political posture that once implied resistance to systems of power becomes another premium consumer identity.'
  },
  'Individualising structural problems':{
    context:'Hypothetical environmental PSA',
    evidence:'“Save the planet: take a two-minute shower.” Industrial emissions are never mentioned.',
    analysis:'The campaign locates environmental responsibility almost entirely in household behaviour. Personal action may matter, but the framing makes institutional and industrial causes less visible.'
  },
  'Depoliticising suffering':{
    context:'Hypothetical charity poster',
    evidence:'A refugee child is pictured beneath “Give hope today”; the conflict, border policy and displacement history are absent.',
    analysis:'The image invites compassion while removing causal context. A political crisis becomes an isolated humanitarian tragedy whose apparent solution is donation rather than structural understanding.'
  },
  'Victim, saviour & spectacle narratives':{
    context:'Hypothetical charity ad',
    evidence:'A named donor stands centrally handing food to a seated group who remain unnamed and silent.',
    analysis:'The composition gives agency and identity to the rescuer while beneficiaries function mainly as recipients. Empathy is produced at the same time as an unequal saviour/victim relationship is reinforced.'
  },
  'Aestheticising suffering':{
    context:'Hypothetical editorial photograph',
    evidence:'A scene of severe poverty is photographed in golden-hour light with carefully balanced, painterly composition.',
    analysis:'The beauty draws the viewer in, which may increase attention, but it also risks making hardship visually pleasurable. The ethical tension lies in what aesthetic appeal enables and what it may soften.'
  },
  'Disease & war metaphors':{
    context:'Hypothetical political speech',
    evidence:'“This city is infected by outsiders. We need to cleanse the problem.”',
    analysis:'The disease metaphor converts people into contamination. Once difference is framed as infection, exclusion begins to sound like treatment rather than a political choice.'
  },
  'Religious, economic & mechanical frames':{
    context:'Hypothetical workplace text',
    evidence:'“Every employee is a cog in the engine of growth; efficiency is our highest value.”',
    analysis:'Mechanical vocabulary foregrounds function and output while suppressing individuality. Human worth is subtly measured according to productivity within the system.'
  },
  'Who benefits from the representation?':{
    context:'Hypothetical beauty ad',
    evidence:'The campaign defines clear, poreless skin as “confidence” and positions its product as the route to achieving it.',
    analysis:'The representation benefits the brand by turning a narrow appearance standard into a personal need. The key claim is not guessed intention, but the commercial advantage created by the definition of confidence.'
  },

  'Recurring pattern across a body of work':{
    context:'Hypothetical photo series',
    evidence:'Across three images, women are repeatedly photographed behind windows, doorframes or railings.',
    analysis:'The repeated framing turns enclosure into a sustained representational strategy. Across the body of work, physical boundaries can therefore become a recurring visual language for restricted agency.'
  },
  'Evolution across the body of work':{
    context:'Hypothetical campaign series',
    evidence:'Early portraits show subjects looking away at the edge of the frame; later works centre them with direct eye contact.',
    analysis:'The shift changes spectatorship across the series: subjects move from objects of observation toward figures who visually confront the audience and claim greater agency.'
  },
  'Strategic inconsistency':{
    context:'Hypothetical photo series',
    evidence:'Most images isolate one subject against empty space, but one work shows a tightly connected group looking directly at the camera.',
    analysis:'The exception prevents “isolation” from becoming an absolute thesis. It may mark a moment where the creator introduces solidarity as a counterforce to the dominant pattern.'
  },
  'Medium & context as meaning':{
    context:'Hypothetical road-safety campaign',
    evidence:'A highway billboard uses six huge words; the Instagram version becomes a swipeable sequence with statistics and testimony.',
    analysis:'The message adapts to conditions of reception. The billboard prioritises instant legibility at speed, while social media can sustain attention and invite interaction over several frames.'
  },
  'Intertextuality & subversion':{
    context:'Hypothetical sneaker ad',
    evidence:'The image recreates Cinderella’s glass-slipper scene, but the “perfect fit” is a battered running shoe held by the heroine herself.',
    analysis:'Recognition activates the familiar transformation fantasy, while the altered object and self-directed action can shift the story from romantic selection toward physical autonomy—though the ad still commercialises that autonomy.'
  },
  'Compare methods, not just themes':{
    context:'Hypothetical IO comparison',
    evidence:'Text A uses a first-person confession about loneliness; Text B photographs a tiny figure surrounded by negative space.',
    analysis:'Both address isolation, but through different methods: one creates psychological proximity through voice, while the other creates visual distance through composition. The comparison stays analytical rather than thematic.'
  },
  'Micro choice → macro pattern':{
    context:'Hypothetical IO link',
    evidence:'Extract: “We must protect ourselves from them.” Elsewhere in the body of work, a poster places one group tightly together and another behind a fence.',
    analysis:'The techniques differ—pronouns versus visual grouping—but both construct the same in-group/out-group logic. That creates a precise bridge from close analysis to the wider body of work.'
  },
  'Pattern + exception':{
    context:'Hypothetical body of work',
    evidence:'Six fashion images crop women into body parts; one final portrait shows a fully framed subject returning the viewer’s gaze.',
    analysis:'The dominant pattern supports an objectification argument, but the exception qualifies it. The body of work predominantly fragments women while one image deliberately restores visual agency.'
  }
};

function esc(value:string){
  return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
}

function enrichCard(card:HTMLElement){
  if(card.dataset.insightExampleReady==='true')return;
  const title=card.querySelector<HTMLElement>('.insight-card-title b')?.textContent?.trim();
  if(!title)return;
  const example=examples[title];
  if(!example)return;
  const body=card.querySelector<HTMLElement>('.insight-card-body');
  if(!body)return;

  const block=document.createElement('div');
  block.className='insight-example';
  block.innerHTML=`
    <div class="insight-example-head"><span>EXAMPLE · SEE IT IN ACTION</span><small>${esc(example.context)}</small></div>
    <p class="insight-example-evidence">${esc(example.evidence)}</p>
    <p class="insight-example-analysis"><b>Analysis:</b> ${esc(example.analysis)}</p>`;

  const where=body.querySelector<HTMLElement>('.insight-where');
  if(where)body.insertBefore(block,where);else body.appendChild(block);
  card.dataset.insightExampleReady='true';
  card.dataset.insightSearch=`${card.dataset.insightSearch||''} ${example.context} ${example.evidence} ${example.analysis}`.toLowerCase();
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
