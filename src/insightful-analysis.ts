import './insightful-analysis.css';

type InsightCategory=
  |'Micro-language'
  |'Structure & form'
  |'Narrative & character'
  |'Visual & multimodal'
  |'Persuasion & media'
  |'Power & ideology'
  |'Body of work';

type InsightLens={
  title:string;
  category:InsightCategory;
  look:string;
  meaning:string;
  effect:string;
  deeper:string;
  where:string;
};

const lenses:InsightLens[]=[
  {title:'Pronoun shifts & group boundaries',category:'Micro-language',look:'Track I, we, you and they — especially when the pronoun changes.',meaning:'Pronouns decide who belongs inside the speaker’s identity and who is pushed outside it. A move from “I” to “we” can turn a private belief into apparent collective truth.',effect:'The audience may feel included, implicated or separated from an out-group before the argument is consciously evaluated.',deeper:'Qualify the effect: “we” can create genuine solidarity, but it can also manufacture consensus. Ask whose differences disappear inside the collective pronoun.',where:'Speeches, political campaigns, PSAs, manifestos, opinion writing, novels, memoirs'},
  {title:'Grammatical agency',category:'Micro-language',look:'Ask who is the subject of active verbs and who is repeatedly acted upon.',meaning:'Grammar can distribute power. Characters who decide, command and move occupy active subject positions; characters who are told, moved or watched can be linguistically deprived of agency.',effect:'The reader can absorb a hierarchy as grammatically normal before it is explicitly discussed.',deeper:'Compare the pattern across characters. The strongest claim is often not that one verb is active, but that agency is systematically given to one group and withheld from another.',where:'Novels, drama, journalism, speeches, ads, institutional writing'},
  {title:'Passive voice & hidden responsibility',category:'Micro-language',look:'Look for constructions such as “mistakes were made” or “people were displaced”.',meaning:'Passive voice can foreground an event while deleting or delaying the person responsible for causing it.',effect:'Attention shifts from accountability toward consequence, making deliberate actions feel more impersonal or inevitable.',deeper:'Do not claim every passive is evasive. Ask whether the missing agent matters in this exact context and who benefits from its absence.',where:'News reports, corporate statements, political rhetoric, war writing, dystopias, institutional texts'},
  {title:'Naming, labels & titles',category:'Micro-language',look:'Notice who receives a proper name and who is reduced to “the girl”, “the worker”, “sir”, “mother” or another role.',meaning:'Naming individualises; labels can reduce a person to function, status, gender or stereotype. Titles can formalise hierarchy.',effect:'The reader is invited to recognise some figures as full individuals while processing others primarily through a social category.',deeper:'Track changes in naming. Becoming named can signal recognition; losing a name can signal erasure, intimacy lost or institutional control.',where:'Novels, drama, memoir, journalism, charity campaigns, political writing'},
  {title:'Possessives & ownership',category:'Micro-language',look:'Circle “my”, “his”, “her”, “our” and possessive constructions around people, land or identity.',meaning:'Possessive grammar can blur belonging with ownership. Intimacy may quietly become entitlement or control.',effect:'Relationships can sound natural and affectionate while still encoding asymmetry.',deeper:'Ask whether the possessive is mutual. “Our country” can unite an audience, while “my woman” can reveal a proprietary understanding of another person.',where:'Novels, speeches, nationalism, advertising, relationship dialogue, memoir'},
  {title:'Modality: must, should, can, might',category:'Micro-language',look:'Track modal verbs and how strong or weak the obligation/certainty becomes.',meaning:'Modality controls the linguistic space for disagreement. “Must” creates necessity; “should” moralises; “might” opens uncertainty; “can” frames possibility or permission.',effect:'The audience may feel pressured, reassured or invited into a possibility depending on the modal force.',deeper:'Look for shifts in modality. A speaker moving from “might” to “must” may be escalating authority or converting opinion into obligation.',where:'Speeches, PSAs, ads, rules, editorials, dialogue, persuasive writing'},
  {title:'Certainty, hedging & epistemic markers',category:'Micro-language',look:'Notice “obviously”, “clearly”, “perhaps”, “apparently”, “seems”, “surely”.',meaning:'These words reveal how strongly a speaker claims to know something. Excessive certainty can paradoxically expose insecurity; hedging can reveal doubt or strategic caution.',effect:'They calibrate how trustworthy, authoritative or unstable a voice appears.',deeper:'Ask why certainty needs to be announced. “Obviously she loves me” may function as self-reassurance rather than proof.',where:'Unreliable narration, speeches, interviews, opinion writing, journalism, dialogue'},
  {title:'Presupposition & loaded questions',category:'Micro-language',look:'Ask what a sentence assumes before the audience has agreed to it: “Why are you still failing?”',meaning:'Presuppositions smuggle claims into the background of language. The question can make an assumption feel settled rather than debatable.',effect:'The audience is pushed to answer inside the speaker’s frame instead of questioning the frame itself.',deeper:'Expose the hidden premise explicitly. This is especially powerful when innocence, blame, normality or social expectations are assumed.',where:'Interviews, political debates, advertisements, headlines, dialogue, courtroom-style rhetoric'},
  {title:'Quantifiers & absolutes',category:'Micro-language',look:'Mark words such as all, every, nobody, always, never, only.',meaning:'Absolutist language compresses complexity into certainty and can reveal stereotyping, emotional extremity or ideological rigidity.',effect:'It can make a claim memorable and decisive while reducing room for exceptions.',deeper:'Find the exception the language erases. A nuanced argument can show how the text turns a partial experience into a universal rule.',where:'Propaganda, speeches, ads, arguments, dialogue, unreliable narration'},
  {title:'Euphemism & sanitised language',category:'Micro-language',look:'Look for mild or technical words replacing painful, violent or morally charged realities.',meaning:'Euphemism creates emotional distance and can make harmful actions sound administrative, necessary or clean.',effect:'The reader may process an event intellectually without fully confronting its human cost.',deeper:'Compare the euphemism with the reality it replaces. The gap often reveals institutional self-protection or moral avoidance.',where:'Politics, war reporting, corporate communication, dystopia, bureaucracy, journalism'},
  {title:'Nominalisation',category:'Micro-language',look:'Spot actions turned into nouns: destruction, removal, displacement, failure, restructuring.',meaning:'Nominalisation can turn human actions into abstract processes, often obscuring who acted on whom.',effect:'Events can appear neutral, technical or inevitable rather than chosen.',deeper:'Rewrite the noun as an active verb in your head. The missing actor often reveals the ideological work performed by the original phrasing.',where:'Institutional writing, politics, journalism, academic rhetoric, dystopia'},
  {title:'Semantic fields & colliding lexicons',category:'Micro-language',look:'Group repeated vocabulary from the same domain: war, religion, economics, disease, machinery, imprisonment, nature.',meaning:'A semantic field supplies a conceptual frame. When two fields collide — romance described through economics, for example — one area of life contaminates the meaning of another.',effect:'The audience begins interpreting an issue through the values of the borrowed vocabulary.',deeper:'Analyse the worldview produced by the pattern, not each word separately. Ask what becomes thinkable once love is “investment” or disagreement is “war”.',where:'Poetry, prose, speeches, ads, propaganda, journalism, body-of-work analysis'},

  {title:'Pattern breaking',category:'Structure & form',look:'Establish what normally repeats, then find the moment the pattern suddenly changes.',meaning:'Deviation becomes meaningful because the text first teaches the audience what to expect. A break can enact emotional collapse, resistance, revelation or transformation.',effect:'The reader feels disruption formally, not just through content.',deeper:'Name the baseline pattern before analysing the exception. “Long controlled syntax gives way to fragments” is stronger than analysing the fragment alone.',where:'Poetry, prose, speeches, ads, graphic narratives, film sequences'},
  {title:'Repetition with variation',category:'Structure & form',look:'Track what changes each time a repeated word, image, sentence or scene returns.',meaning:'Repetition can develop rather than merely emphasise. A phrase may become desperate, ironic, emptied of meaning or newly empowering.',effect:'The reader carries memory from the earlier repetition into the changed version.',deeper:'Compare first use vs final use. The difference between them can reveal an entire character arc or ideological shift.',where:'Poetry, speeches, novels, slogans, drama, campaigns'},
  {title:'Sentence length & syntactic control',category:'Structure & form',look:'Notice sudden movement between long, layered sentences and short, controlled ones.',meaning:'Syntax can embody mental pace: accumulation can feel obsessive or overwhelming; compression can create certainty, shock or emotional shutdown.',effect:'The reader’s breathing and processing speed are shaped by the sentence itself.',deeper:'Connect form to consciousness or authority. Avoid “short sentences create tension” unless you explain why the shortening matters at that moment.',where:'Novels, memoir, speeches, journalism, literary non-fiction'},
  {title:'Fragments, parataxis & hypotaxis',category:'Structure & form',look:'Look for incomplete sentences, clauses placed side by side, or heavily subordinated syntax.',meaning:'Fragments can enact fracture or certainty; parataxis can make events feel relentless or emotionally flat; hypotaxis can suggest control, qualification or complex thought.',effect:'The reader experiences different relationships between ideas — abrupt, equal, dependent or unstable.',deeper:'Ask whether the syntax mirrors the speaker’s mental state or the text’s power structure rather than treating grammar as decorative.',where:'Fiction, poetry, memoir, speeches, reportage'},
  {title:'Dashes, ellipses & self-correction',category:'Structure & form',look:'Notice where thought is interrupted, trails away or is revised: “I loved her — respected her, I mean.”',meaning:'Punctuation can stage a conflict between spontaneous thought and controlled expression.',effect:'The reader encounters hesitation or repression in real time instead of being told it exists.',deeper:'The first version of a self-correction may expose what the speaker immediately tries to police or conceal.',where:'Drama, dialogue, memoir, poetry, stream of consciousness'},
  {title:'Silence, omission & the unsaid',category:'Structure & form',look:'Ask what a character, narrator, image or campaign conspicuously refuses to name or explain.',meaning:'Absence can represent trauma, censorship, shame, resistance or ideological erasure.',effect:'The reader is forced to infer meaning from a gap, becoming more actively involved in interpretation.',deeper:'Do not assume silence means powerlessness. It can also be refusal. Decide which interpretation is best supported by who controls the surrounding language.',where:'Drama, fiction, memoir, PSAs, ads, journalism, photography'},
  {title:'Tense shifts & temporal distance',category:'Structure & form',look:'Track movement between past, present and future, especially inside memory.',meaning:'A shift into present tense can collapse chronological distance and make the past psychologically unresolved or newly immediate.',effect:'The reader may feel a remembered event happening rather than being safely recalled.',deeper:'Distinguish calendar time from psychological time. A past event can remain emotionally present.',where:'Memoir, trauma narratives, fiction, poetry, speeches'},
  {title:'Circular structure & opening/ending echoes',category:'Structure & form',look:'Compare repeated images, locations, phrases or situations at the beginning and end.',meaning:'Returning to the start can suggest entrapment, cycles, inevitability or a transformed understanding of the same image.',effect:'The audience retrospectively reinterprets the opening through knowledge gained by the ending.',deeper:'Ask whether the return means “nothing changed” or whether the same image now carries different meaning. Those are very different readings.',where:'Novels, short stories, films, poems, campaigns'},
  {title:'Narrative gaps & skipped moments',category:'Structure & form',look:'Notice important events that are omitted while moments before and after are described.',meaning:'A gap can signal trauma, censorship, unreliable memory or deliberate control of reader knowledge.',effect:'The missing event becomes conspicuous precisely because the text circles around it.',deeper:'Analyse what the narrator can describe versus what they cannot. The boundary of narration can reveal the boundary of psychological tolerance.',where:'Memoir, fiction, graphic memoir, fragmented narratives'},
  {title:'Pacing & disproportionate attention',category:'Structure & form',look:'Compare how much textual space is given to trivial details versus major events.',meaning:'Over-description can displace emotion onto an object; under-description of catastrophe can suggest numbness or normalisation.',effect:'The reader senses that narrative importance and emotional importance do not neatly match.',deeper:'Ask why the text lingers here but rushes there. Distribution of attention is itself an authorial choice.',where:'Novels, memoir, literary journalism, film editing'},
  {title:'Genre, layout & white-space disruption',category:'Structure & form',look:'Notice when a poem resembles a receipt, a novel inserts documents, or layout becomes unusually empty/fragmented.',meaning:'Form can comment on content: a love poem shaped like a contract can make intimacy feel transactional; white space can materialise silence or absence.',effect:'The reader must physically navigate meaning differently.',deeper:'Analyse the clash between expected genre conventions and the form actually used.',where:'Poetry, graphic novels, experimental fiction, ads, digital texts'},

  {title:'Focalisation: whose reality do we inhabit?',category:'Narrative & character',look:'Ask whose perceptions filter the scene and what the audience is prevented from knowing.',meaning:'Restricted focalisation can trap the reader inside a character’s assumptions, prejudice, innocence or fear.',effect:'The reader may temporarily share a worldview the text later complicates or exposes.',deeper:'Separate narrator from focaliser. Ask not only “who tells?” but “through whose consciousness is this moment experienced?”',where:'Novels, short stories, memoir-like fiction, film point of view'},
  {title:'Unreliable narration as self-protection',category:'Narrative & character',look:'Find contradictions, impossible certainty, selective memory or gaps between narration and observable evidence.',meaning:'Unreliability can protect identity. A narrator may reconstruct events because acknowledging guilt, weakness or prejudice would threaten their self-image.',effect:'The reader becomes an evaluator rather than a passive recipient of the story.',deeper:'Go beyond “the narrator lies”. Ask why this version of reality is psychologically or ideologically necessary for them.',where:'Fiction, dramatic monologues, memoir-like narratives'},
  {title:'Narrative distance',category:'Narrative & character',look:'Notice moments when description becomes unusually intimate, detached, clinical or impersonal.',meaning:'Distance can function as emotional defence. A narrator may become cold precisely where the subject is most painful.',effect:'A mismatch between event and tone can make suppressed feeling more visible.',deeper:'Compare emotional distance across the text. A sudden shift often matters more than a consistently detached style.',where:'Fiction, memoir, war writing, trauma narratives'},
  {title:'Dialogue turn-taking & interruption',category:'Narrative & character',look:'Track who asks questions, answers, interrupts, changes topic and gets to finish sentences.',meaning:'Conversation has a structure of power. Dominance can be enacted through control of speaking space rather than explicit commands.',effect:'The audience experiences hierarchy through rhythm and access to speech.',deeper:'Analyse whose questions go unanswered and whose words redirect the scene. Silence after a question can be as powerful as the answer.',where:'Drama, novels, interviews, film dialogue, transcripts'},
  {title:'Identity as performance & code-switching',category:'Narrative & character',look:'Compare how a character speaks, dresses or behaves across audiences and spaces.',meaning:'Identity can appear situational rather than fixed: a version of the self is performed to gain safety, status, belonging or approval.',effect:'The reader sees tension between private self-conception and public expectation.',deeper:'Do not automatically privilege the private version as the “real” self. The text may present identity as multiple, adaptive and socially produced.',where:'Novels, memoir, drama, ads, social media texts, postcolonial writing'},
  {title:'Setting as ideology',category:'Narrative & character',look:'Treat homes, schools, borders, offices, streets and institutions as systems of values, not just scenery.',meaning:'Space can embody hierarchy, gender roles, class, surveillance, belonging or exclusion.',effect:'Abstract power becomes physically navigable: characters can be contained, elevated, separated or watched.',deeper:'Ask who controls the space, who moves freely inside it, and which spaces require a different performance of identity.',where:'Novels, drama, film, photography, graphic narratives'},
  {title:'Mirrors, clothing & self-surveillance',category:'Narrative & character',look:'Notice repeated acts of looking at oneself, dressing, masking or correcting appearance.',meaning:'The character may internalise an external gaze and begin policing themselves according to social expectations.',effect:'Control appears to operate even when no authority figure is physically present.',deeper:'A mirror is richer than “identity”: ask whose standards the character has learned to see themselves through.',where:'Fiction, film, beauty advertising, memoir, gender-focused texts'},
  {title:'Motif evolution & unstable symbols',category:'Narrative & character',look:'Track a recurring object/image and record how its emotional or contextual meaning changes.',meaning:'Symbols rarely need one fixed translation. A house can move from refuge to confinement; an open road from freedom to vulnerability.',effect:'The audience revises earlier interpretations as the motif accumulates new contexts.',deeper:'Strong analysis explains transformation: “initially…, yet later…” rather than assigning a dictionary meaning.',where:'Novels, poetry, film, graphic narratives, bodies of work'},
  {title:'Character contradiction',category:'Narrative & character',look:'Compare what a character claims with what they repeatedly do, notice or avoid.',meaning:'Contradictions can reveal repression, hypocrisy, unstable identity or competing desires.',effect:'The reader learns to interpret behaviour as evidence that can challenge spoken self-description.',deeper:'Do not reduce contradiction to dishonesty. A character can sincerely hold incompatible beliefs.',where:'Drama, novels, memoir, film, interviews'},

  {title:'The gaze: who looks and who is looked at?',category:'Visual & multimodal',look:'Trace eye-lines, spectatorship and whether the subject returns the viewer’s gaze.',meaning:'Looking can encode power. The observer interprets; the observed person may become an object of scrutiny or desire.',effect:'The viewer is assigned a position inside the visual relationship rather than remaining neutral.',deeper:'A direct gaze can confront, invite or accuse; an averted gaze can suggest vulnerability or make objectification easier. Context decides.',where:'Advertising, photography, film, posters, magazine covers, graphic narratives'},
  {title:'Camera angle & vertical power',category:'Visual & multimodal',look:'Ask whether the viewer looks up, down or directly across at the subject.',meaning:'Low angles can monumentalise; high angles can diminish; eye-level framing can create equality or confrontation.',effect:'Physical viewpoint shapes perceived status before the subject speaks.',deeper:'Combine angle with scale, posture and context. A low angle is not automatically “powerful” if other choices undermine it.',where:'Film, photography, advertising, political posters'},
  {title:'Framing & what exists outside the frame',category:'Visual & multimodal',look:'Identify what the creator includes, excludes and isolates.',meaning:'A frame controls context. Tight framing can individualise suffering while hiding the system around it.',effect:'The viewer receives a curated reality and may focus on personal emotion rather than structural cause.',deeper:'Ask what interpretation might become possible if the frame were wider. The absent context can be ideologically significant.',where:'Photography, journalism, charity ads, film, social media'},
  {title:'Cropping & body fragmentation',category:'Visual & multimodal',look:'Notice heads, faces or bodies cut into parts — lips, legs, abs, hands, eyes.',meaning:'Fragmentation can separate physical desirability or labour from individual identity, turning a person into a consumable part or function.',effect:'The viewer is encouraged to inspect the body rather than encounter the whole person.',deeper:'Cropping can also create intimacy or anonymity; support objectification claims with the wider visual pattern.',where:'Fashion, beauty, fitness ads, photography, magazine design'},
  {title:'Negative space & visual marginalisation',category:'Visual & multimodal',look:'Measure the empty space around a person/object and where the subject sits in the frame.',meaning:'Empty space can materialise isolation, vulnerability, luxury, calm or social marginality.',effect:'The viewer feels distance through composition rather than being told someone is alone.',deeper:'Connect compositional position to social position when supported: a subject pushed to the edge can visually embody marginalisation.',where:'PSAs, photography, ads, posters, covers'},
  {title:'Foreground, background & depth hierarchy',category:'Visual & multimodal',look:'Ask who is sharp, large and foregrounded versus blurred or relegated to scenery.',meaning:'Depth can distribute significance. Backgrounded workers, crowds or communities may become environmental support for a privileged focal subject.',effect:'The viewer learns whose experience deserves attention.',deeper:'Analyse not just visibility but individuality: are background figures distinct people or an undifferentiated mass?',where:'Photography, film, ads, editorial images'},
  {title:'Salience & visual hierarchy',category:'Visual & multimodal',look:'Identify what your eye sees first, second and last through size, contrast, isolation, focus and placement.',meaning:'Design creates an order of importance and therefore an order of interpretation.',effect:'The viewer’s attention can be directed before they consciously read the message.',deeper:'Map the sequence as an argument: emotion → statistic → action, or lifestyle → product → logo.',where:'Ads, PSAs, posters, webpages, magazine covers, infographics'},
  {title:'Vectors & reading path',category:'Visual & multimodal',look:'Follow eye-lines, pointing arms, roads, arrows and perspective lines.',meaning:'Vectors connect elements and can guide the viewer toward a product, victim, slogan or solution.',effect:'The composition choreographs where attention travels.',deeper:'Ask what causal story the path creates. A model’s gaze leading to a product can convert the human figure into a mechanism for consumption.',where:'Advertising, PSAs, posters, photography, comics'},
  {title:'Proxemics, barriers & thresholds',category:'Visual & multimodal',look:'Track physical distance and objects such as windows, doors, tables, fences, glass or borders between figures.',meaning:'Space can externalise intimacy, hierarchy, exclusion or liminality. A transparent barrier can preserve sight while preventing contact.',effect:'The viewer reads relationships through physical geometry.',deeper:'Thresholds are especially useful for characters caught between identities, spaces or stages of life.',where:'Film, photography, graphic novels, theatre staging, ads'},
  {title:'Symmetry & broken symmetry',category:'Visual & multimodal',look:'Notice highly ordered compositions and the one element that disrupts them.',meaning:'Symmetry can construct control, perfection, ritual or institutional order; asymmetry can code a figure as disruptive or individual.',effect:'The audience feels stability or disturbance before identifying why.',deeper:'The exception only gains meaning because the surrounding design establishes conformity as normal.',where:'Ads, film, architecture photography, political imagery'},
  {title:'Typography, scale & fine print',category:'Visual & multimodal',look:'Compare font size, weight, case, style and the prominence of disclaimers.',meaning:'Typography creates a hierarchy between what the creator wants remembered and what they are legally or strategically required to include.',effect:'Large promises become emotionally dominant while qualifying information recedes.',deeper:'Analyse contradictions between bold headline and tiny conditions. The typography can visually rank persuasion above complexity.',where:'Advertising, PSAs, posters, packaging, webpages'},
  {title:'Colour & lighting relationships',category:'Visual & multimodal',look:'Track repeated colours, contrast, saturation and who or what receives light.',meaning:'Colour and lighting create associations through relationships, not fixed dictionaries. Repeated red linking a victim and warning icon can transfer danger across elements.',effect:'The viewer forms visual connections quickly and often pre-consciously.',deeper:'Avoid “red means danger” in isolation. Explain placement, repetition, contrast and how the colour changes the hierarchy of the image.',where:'Film, photography, ads, posters, graphic narratives'},
  {title:'Image-text anchorage & contradiction',category:'Visual & multimodal',look:'Ask whether the caption fixes the image’s meaning or conflicts with what the image shows.',meaning:'Text can anchor an ambiguous visual, while contradiction creates irony and forces the viewer to resolve a gap.',effect:'The audience can be guided toward one reading or made into an active interpreter.',deeper:'When words say “progress” beside destruction, analyse the gap between official rhetoric and visible consequence.',where:'Ads, PSAs, political cartoons, journalism, social media, posters'},

  {title:'Implied audience',category:'Persuasion & media',look:'Ask what kind of person the text assumes the viewer is: wealthy, insecure, patriotic, young, guilty, environmentally conscious.',meaning:'Persuasion works through assumptions about the audience’s values, fears and resources.',effect:'The reader is invited to recognise themselves inside a pre-designed identity.',deeper:'Ask who is excluded by those assumptions. “Ethical consumption” may presume the audience has enough money to express ethics through purchasing.',where:'Advertising, PSAs, speeches, campaigns, magazines, social media'},
  {title:'Manufactured insecurity & aspirational identity',category:'Persuasion & media',look:'Find the hidden sequence: you are inadequate → imagine a better self → this product/action bridges the gap.',meaning:'The text may create the deficiency it claims to solve, selling self-transformation rather than an object.',effect:'The audience can begin evaluating themselves against an ideal supplied by the campaign.',deeper:'Ask whether the “solution” depends on the audience continuing to feel incomplete.',where:'Beauty, fitness, fashion, lifestyle, car and technology advertising'},
  {title:'Product absence & association transfer',category:'Persuasion & media',look:'Notice when the product is tiny or absent while lifestyle, celebrity, landscape or emotion dominates.',meaning:'The real commodity becomes status, freedom, desirability or belonging. Meaning is transferred from the lifestyle image onto the brand.',effect:'The viewer desires an identity first and encounters the product second.',deeper:'The less functional information an ad provides, the more useful it can be to ask what symbolic identity is actually being sold.',where:'Luxury, perfume, fashion, car and lifestyle advertising'},
  {title:'Fear, guilt & shock appeals',category:'Persuasion & media',look:'Identify disturbing imagery followed by a behavioural solution or moral demand.',meaning:'The campaign converts emotion into urgency: fear motivates avoidance; guilt reframes inaction as moral failure; shock breaks habitual disengagement.',effect:'The audience may act before fully reasoning through the issue.',deeper:'Evaluate ethically as well as rhetorically. Shock can force attention but can also turn suffering into spectacle.',where:'Road safety, health PSAs, charity campaigns, activism'},
  {title:'Statistics & scientific authority',category:'Persuasion & media',look:'Notice precise numbers, percentages, charts, technical vocabulary and “clinically tested” language.',meaning:'Numerical precision and scientific register construct objectivity, expertise and rational legitimacy.',effect:'The viewer may lower scepticism because the message looks measurable and evidence-based.',deeper:'Ask what context the number lacks and whether technical language genuinely explains evidence or merely performs expertise.',where:'PSAs, health ads, cosmetics, journalism, political campaigns, tech advertising'},
  {title:'Testimonials, experts & celebrity transfer',category:'Persuasion & media',look:'Identify whose credibility, status or emotional story is being borrowed.',meaning:'Authority or cultural capital is transferred from a person to a product, claim or cause.',effect:'The audience evaluates the message through trust or admiration already attached to the speaker.',deeper:'Distinguish expertise from fame. A celebrity can supply recognition without supplying relevant knowledge.',where:'Advertising, campaigns, charity, influencer content, health communication'},
  {title:'Slogans, parallelism & rule of three',category:'Persuasion & media',look:'Look for compressed, rhythmic, repeated grammatical structures and three-part lists.',meaning:'Form makes complex ideas feel complete, memorable and self-evident. Parallel grammar can make different claims appear equally valid.',effect:'The audience remembers the structure even when nuance is lost.',deeper:'Ask what complexity had to be removed to make the message repeatable.',where:'Speeches, political campaigns, ads, PSAs, manifestos'},
  {title:'Pseudo-empowerment, cause marketing & tokenism',category:'Persuasion & media',look:'Compare activist language or diverse imagery with what the campaign ultimately asks the audience to buy or admire.',meaning:'Political ideas such as empowerment or inclusion can be converted into brand identity without changing underlying power relations.',effect:'The consumer can feel participation in a cause through consumption or visual approval.',deeper:'Do not dismiss every inclusive campaign as fake. Ask whether representation changes agency and structure, or operates mainly at the level of image.',where:'Fashion, beauty, corporate campaigns, cause marketing, social media'},
  {title:'Humour, incongruity & satire',category:'Persuasion & media',look:'Find serious issues presented through jokes, absurd combinations or deliberately mismatched tone.',meaning:'Humour lowers resistance and can expose contradiction by making accepted behaviour appear strange.',effect:'The audience is entertained before recognising the criticism.',deeper:'Ask who is the target of the joke. Satire becomes analytically meaningful when you identify what norm or authority is being destabilised.',where:'Political cartoons, ads, opinion media, satire, campaigns'},
  {title:'Rhetorical questions & false binaries',category:'Persuasion & media',look:'Notice questions with an expected answer and either/or structures that erase alternatives.',meaning:'The creator can make the audience mentally supply the desired conclusion while restricting the range of thinkable responses.',effect:'Persuasion feels participatory even though the frame has already been controlled.',deeper:'Name the missing third option. Exposing what the binary excludes often reveals the ideology behind it.',where:'Speeches, ads, propaganda, interviews, editorials'},

  {title:'Normalisation',category:'Power & ideology',look:'Ask what disturbing, unequal or unusual behaviour nobody in the text seems surprised by.',meaning:'The absence of reaction reveals what a society has learned to treat as ordinary.',effect:'The reader may become disturbed not only by the event, but by how routine it appears to characters.',deeper:'Sometimes the casual tone around violence is more revealing than graphic description because it shows power embedded in habit.',where:'Dystopia, novels, drama, journalism, institutional cultures'},
  {title:'Naturalisation',category:'Power & ideology',look:'Find socially produced beliefs described as natural, obvious, inevitable or “just the way things are”.',meaning:'Ideology becomes strongest when it disguises itself as common sense rather than argument.',effect:'Alternatives can seem irrational or unnatural before they are considered.',deeper:'Separate biology/nature from cultural construction. Ask who benefits when a hierarchy is presented as inevitable.',where:'Gender representation, politics, ads, colonial texts, social commentary'},
  {title:'Othering',category:'Power & ideology',look:'Track us/them language, labels, stereotypes, accents, spatial distance and repeated emphasis on difference.',meaning:'The text may not simply describe difference; it can construct difference as the defining feature of a group.',effect:'The audience is encouraged to perceive an out-group as less familiar, less individual or more threatening.',deeper:'Analyse the mechanism of distance — pronouns, imagery, naming, framing — rather than making an unsupported general claim about prejudice.',where:'Politics, propaganda, journalism, literature, campaigns'},
  {title:'Power disguised as care',category:'Power & ideology',look:'Notice restriction expressed through protection, safety, love, guidance or concern.',meaning:'Control becomes harder to resist when domination is linguistically reframed as benevolence.',effect:'A character who resists can be made to appear ungrateful or reckless.',deeper:'Explore the ambiguity: care and control can coexist. The strongest reading may be that genuine affection becomes the vehicle through which restriction operates.',where:'Novels, drama, dystopia, family narratives, political rhetoric'},
  {title:'Internalised oppression & self-policing',category:'Power & ideology',look:'Find characters enforcing social expectations on themselves even when no authority figure is present.',meaning:'External power becomes internal discipline. The system no longer needs constant visible enforcement.',effect:'The reader sees oppression working through desire, shame, self-correction or self-surveillance.',deeper:'Connect mirrors, language, body control or code-switching to the standards the character has absorbed.',where:'Gender texts, postcolonial literature, dystopia, beauty culture, memoir'},
  {title:'Commodification',category:'Power & ideology',look:'Notice emotions, rebellion, identity, sexuality, culture or activism represented as things that can be bought, sold or branded.',meaning:'Human or political values are translated into market value.',effect:'Consumption appears capable of delivering authenticity, freedom or moral identity.',deeper:'Ask what is lost when liberation becomes an aesthetic or product category.',where:'Advertising, social media, fashion, dystopia, capitalist critique'},
  {title:'Individualising structural problems',category:'Power & ideology',look:'Look for systemic issues reframed as matters of personal effort, habits, resilience or consumer choice.',meaning:'Responsibility moves downward from institutions to individuals, making structural causes less visible.',effect:'The audience may blame themselves or other individuals rather than questioning systems.',deeper:'Ask what institutions, histories or material conditions disappear when the problem is personalised.',where:'Environmental campaigns, wellness culture, politics, charity, workplace media'},
  {title:'Depoliticising suffering',category:'Power & ideology',look:'Notice suffering shown intensely while its historical, economic or political causes remain absent.',meaning:'A structural issue becomes an isolated human tragedy that invites emotion without explanation.',effect:'The viewer may feel sympathy but lack the context needed to understand responsibility.',deeper:'This can make charity feel like the solution to a problem whose causes the campaign never names.',where:'Charity campaigns, humanitarian photography, journalism, PSAs'},
  {title:'Victim, saviour & spectacle narratives',category:'Power & ideology',look:'Ask who is active, who is passive, who rescues whom and whose suffering supplies the image’s emotional power.',meaning:'A campaign can humanise suffering while simultaneously denying subjects agency and centring the donor, institution or viewer as rescuer.',effect:'The audience is positioned as morally powerful relative to the represented subject.',deeper:'Hold both effects together: empathy can be generated at the same time as hierarchy is reproduced.',where:'Charity advertising, humanitarian campaigns, documentaries, news photography'},
  {title:'Aestheticising suffering',category:'Power & ideology',look:'Notice beautiful lighting, composition or colour applied to violence, poverty or pain.',meaning:'Aesthetic quality can create an ethical tension when suffering becomes visually pleasurable or shareable.',effect:'The viewer may be drawn toward the image even as the subject matter should repel or disturb.',deeper:'Evaluate the tension rather than assuming beauty automatically invalidates the message. Ask what the aesthetic treatment enables and risks.',where:'Photography, film, charity campaigns, editorial imagery'},
  {title:'Disease & war metaphors',category:'Power & ideology',look:'Track words such as infection, parasite, cure, battle, enemy, attack, victory.',meaning:'Metaphor can transform people or social issues into biological threats or battles, making exclusion and aggression appear therapeutic or necessary.',effect:'The audience is encouraged to think in terms of enemies, winners and removal rather than complexity or dialogue.',deeper:'Follow the logic of the metaphor to its implied solution. If a group becomes a “disease”, what does “cure” begin to imply?',where:'Propaganda, politics, journalism, health discourse, dystopia'},
  {title:'Religious, economic & mechanical frames',category:'Power & ideology',look:'Notice sacred/pure/sacrifice; value/debt/investment; machine/gear/efficiency vocabularies applied outside their normal domains.',meaning:'Borrowed vocabularies can sanctify authority, commodify relationships or reduce people to productive functions.',effect:'The audience imports the values of one domain into another without an explicit argument.',deeper:'Name what the borrowed frame makes visible and what it erases: efficiency may foreground output while suppressing humanity.',where:'Literature, speeches, ads, workplace rhetoric, dystopia'},
  {title:'Who benefits from the representation?',category:'Power & ideology',look:'After identifying an effect, ask which character, institution, brand or ideology gains power from this way of seeing.',meaning:'Representation is not neutral: constructing beauty, danger, success or normality can create material or social advantage.',effect:'The reader moves from describing a message to questioning its ideological payoff.',deeper:'This question is strongest when tied to textual evidence, not guessed intention. Analyse what the representation enables regardless of whether the creator consciously planned every implication.',where:'Any text; especially ads, campaigns, politics, institutions and social commentary'},

  {title:'Recurring pattern across a body of work',category:'Body of work',look:'Track repeated framing, settings, colours, pronouns, character positions, motifs, slogans or visual relationships across multiple works.',meaning:'Recurrence can turn an isolated technique into a creator’s sustained way of representing an issue.',effect:'The audience encounters a consistent worldview rather than a one-off effect.',deeper:'Name the pattern precisely and connect it to the global issue: “female subjects repeatedly isolated inside domestic frames” is stronger than “the artist uses framing”.',where:'IO bodies of work, ad campaigns, photography series, poetry collections, author studies'},
  {title:'Evolution across the body of work',category:'Body of work',look:'Compare an early and later use of the same motif, subject or strategy.',meaning:'Change can reveal development, increasing complexity or a shift in the creator’s treatment of the issue.',effect:'The audience can see representation becoming more confrontational, ambiguous, agentic or restrained over time.',deeper:'Do not force chronology if the works are not meaningfully developmental. Use “across the selected works” when date is irrelevant.',where:'IO, campaigns, photo series, poetry collections, graphic works'},
  {title:'Strategic inconsistency',category:'Body of work',look:'Find a work that complicates or contradicts the dominant pattern.',meaning:'Inconsistency can create nuance rather than weaken your argument. It may expose tension inside the creator’s wider project.',effect:'The audience is prevented from reducing the body of work to one simple message.',deeper:'Use the exception to qualify your thesis: “predominantly…, although…” or “while most works…, this piece complicates…”.',where:'IO bodies of work, author studies, campaigns, collections'},
  {title:'Medium & context as meaning',category:'Body of work',look:'Ask how a billboard, Instagram post, photograph, speech, mural, magazine cover or novel is encountered differently.',meaning:'Medium shapes scale, duration, audience participation, circulation and authority.',effect:'The same message can feel private, public, interruptive, shareable or institutional depending on where it appears.',deeper:'Connect medium to purpose rather than naming it. A roadside PSA has seconds to communicate; an Instagram campaign depends on scroll behaviour and shareability.',where:'All non-literary bodies of work; also multimodal literary forms'},
  {title:'Intertextuality & subversion',category:'Body of work',look:'Find references to myths, religion, fairy tales, iconic art, famous slogans, genres or cultural images.',meaning:'The new work imports associations from the original, then may preserve or overturn them.',effect:'Recognition gives the audience an expectation that the creator can exploit.',deeper:'Analyse the difference between original and altered version. Subversion becomes meaningful through the precise element that is changed.',where:'Ads, political cartoons, poetry, novels, photography, graphic narratives'},
  {title:'Compare methods, not just themes',category:'Body of work',look:'When two works share an idea, ask how each constructs it differently through form, perspective, language or visual grammar.',meaning:'A body-of-work argument becomes analytical when similarity in concern is paired with difference in method.',effect:'The audience can be positioned differently toward the same issue across works.',deeper:'Use integrated comparison: “Whereas X distances the viewer through…, Y directly implicates them through…”.',where:'IO, Paper 2, paired campaigns, author/artist studies'},
  {title:'Micro choice → macro pattern',category:'Body of work',look:'Start with one tiny choice in the extract, then locate the same underlying strategy elsewhere.',meaning:'This creates a defensible bridge between close analysis and the wider body of work.',effect:'The argument feels evidence-led rather than like a broad theme pasted onto the extract.',deeper:'The repeated element does not need to be identical. A pronoun shift in one text and visual grouping in another can both construct the same in-group/out-group logic.',where:'IO extract-to-body-of-work links, comparative analysis'},
  {title:'Pattern + exception',category:'Body of work',look:'Identify the dominant recurring method, then deliberately search for the strongest exception.',meaning:'The exception tests the limits of your interpretation and can reveal where the creator becomes more ambiguous or self-critical.',effect:'Your argument gains complexity and avoids sounding mechanically universal.',deeper:'A strong “to what extent” answer often comes from this structure: mostly true, but altered under specific conditions.',where:'IO, Paper 2, collections, campaigns, author/artist studies'}
];

const underLines=[
  ['Ask “why this exact choice?”','Imagine the obvious alternative. “She obeyed” instead of “she listened” adds hierarchy; “mistakes were made” instead of “we made mistakes” removes responsibility.'],
  ['Find what is missing','Who is not named, not shown, not allowed to speak, not given context, or removed from the grammar? Absence can be evidence.'],
  ['Notice what is too normal','If characters barely react to violence, surveillance or inequality, analyse the lack of surprise. Normalisation may be the point.'],
  ['Track shifts, not just features','I → we, past → present, formal → informal, long → short, active → passive, centred → marginal. Change creates development.'],
  ['Establish the pattern, then hunt the exception','The one broken rule often carries more meaning than the ten examples that follow it.'],
  ['Ask who has power','Who speaks, looks, acts, names, interrupts, chooses, occupies the centre, controls the frame or defines what is “normal”?'],
  ['Separate what the text says from what it does','A campaign can say “empowerment” while its visual grammar still objectifies. Contradictions between message and form are analytical gold.'],
  ['Ask what worldview feels natural','What is presented as obvious: beauty = thinness, success = wealth, masculinity = silence, progress = consumption? Does the text reinforce or challenge it?'],
  ['Ask who benefits','Which person, institution, brand or ideology gains authority when the audience accepts this representation?'],
  ['Analyse choices together','A direct gaze + second person + imperative can collectively implicate the viewer. Connected choices usually create stronger meaning than isolated device spotting.'],
  ['Use “simultaneously” and “however”','High-level interpretation often holds two effects together: humanises yet objectifies; protects yet confines; includes yet controls.'],
  ['Keep asking “so what?”','Choice → immediate effect → audience positioning → deeper implication → wider purpose. Stop only when the final claim still grows from the evidence.']
];

const currentRoute=()=>location.hash.slice(1).split('#')[0]||'home';
let scheduled=false;

function directChild(page:HTMLElement,className:string){
  return Array.from(page.children).find(el=>el instanceof HTMLElement&&el.classList.contains(className)) as HTMLElement|undefined;
}

function toolkitPage(){
  if(currentRoute()!=='glossary')return null;
  return Array.from(document.querySelectorAll<HTMLElement>('main .page')).find(page=>
    directChild(page,'glossary-tools')&&directChild(page,'glossary-grid')&&page.querySelector(':scope > .keyword-mode-tabs')
  )||null;
}

function arrowIcon(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function searchIcon(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
}

function chevronIcon(){
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function createChooserCard(){
  const button=document.createElement('button');
  button.type='button';
  button.className='toolkit-choice insight-toolkit-choice';
  button.dataset.toolkitMode='insights';
  button.innerHTML=`<span class="toolkit-choice-icon" aria-hidden="true">↗</span><span class="toolkit-choice-copy"><small>READ BENEATH THE LINES</small><b>Insightful Analysis</b><em>High-yield lenses, reader effects, deeper implications and body-of-work moves.</em></span>${arrowIcon()}<span class="insight-choice-new">NEW</span>`;
  return button;
}

function createCard(lens:InsightLens,index:number){
  const card=document.createElement('details');
  card.className='insight-card';
  card.dataset.insightCategory=lens.category;
  card.dataset.insightSearch=[lens.title,lens.category,lens.look,lens.meaning,lens.effect,lens.deeper,lens.where].join(' ').toLowerCase();
  card.innerHTML=`
    <summary>
      <span class="insight-card-number">${String(index+1).padStart(2,'0')}</span>
      <span class="insight-card-title"><small>${lens.category}</small><b>${lens.title}</b><em>${lens.look}</em></span>
      <span class="insight-card-chevron">${chevronIcon()}</span>
    </summary>
    <div class="insight-card-body">
      <div class="insight-answer insight-meaning"><span>HOW IT CREATES MEANING</span><p>${lens.meaning}</p></div>
      <div class="insight-answer"><span>READER / PASSAGE EFFECT</span><p>${lens.effect}</p></div>
      <div class="insight-answer insight-deeper"><span>PUSH IT DEEPER · TO WHAT EXTENT?</span><p>${lens.deeper}</p></div>
      <div class="insight-where"><b>Find it in</b><span>${lens.where}</span></div>
    </div>`;
  return card;
}

function createPanel(){
  const panel=document.createElement('section');
  panel.className='insight-analysis-panel';
  panel.hidden=true;

  const categories:('All'|InsightCategory)[]=['All','Micro-language','Structure & form','Narrative & character','Visual & multimodal','Persuasion & media','Power & ideology','Body of work'];

  panel.innerHTML=`
    <section class="insight-hero">
      <div class="insight-hero-copy">
        <span class="insight-new"><i></i> NEW · ANALYSIS ADVANTAGE</span>
        <h2>Ace the analysis criteria.<br><em>See what others miss.</em></h2>
        <p>This is not a device list to name-drop. Use it to turn tiny choices into defensible interpretations about audience, power, identity, ideology and purpose.</p>
        <div class="insight-formula" aria-label="Analysis depth formula">
          <span>CHOICE</span><i>→</i><span>EFFECT</span><i>→</i><span>READER POSITION</span><i>→</i><span>DEEPER IMPLICATION</span><i>→</i><span>WIDER PURPOSE</span>
        </div>
      </div>
      <div class="insight-orbit" aria-hidden="true"><span>WHY?</span><i></i><b>SO<br>WHAT?</b><em></em></div>
    </section>

    <section class="insight-depth">
      <div class="insight-section-head"><span>THE DEPTH LADDER</span><h3>Move past “this shows…”</h3><p>Each step should grow naturally from the previous one. If you cannot prove the next step from the text, stop before you overclaim.</p></div>
      <div class="insight-depth-grid">
        <div><span>01</span><b>Notice</b><p>What exact word, pattern, image, shift or absence is unusual?</p></div>
        <div><span>02</span><b>Mechanism</b><p>How does the choice change emphasis, perspective, pace, distance or hierarchy?</p></div>
        <div><span>03</span><b>Position</b><p>What is the reader/viewer made to feel, assume, notice, judge or overlook?</p></div>
        <div><span>04</span><b>Implication</b><p>What does that reveal about identity, power, relationships, society or values?</p></div>
        <div><span>05</span><b>Qualify</b><p>Could it do two things at once? Where are the limits of your interpretation?</p></div>
      </div>
    </section>

    <section class="insight-model">
      <span>MODEL THINKING CHAIN</span>
      <div class="insight-model-grid">
        <div><small>TINY CHOICE</small><b>“I” → “we”</b></div><i>→</i>
        <div><small>IMMEDIATE EFFECT</small><b>Expands a private claim into a group voice</b></div><i>→</i>
        <div><small>READER POSITION</small><b>Invites the audience inside apparent consensus</b></div><i>→</i>
        <div><small>DEEPER READING</small><b>Personal ideology can masquerade as collective truth</b></div>
      </div>
      <p><b>Qualification:</b> “we” may create genuine solidarity too. Context decides whether inclusion is communal, strategic, or both.</p>
    </section>

    <section class="insight-bank">
      <div class="insight-section-head insight-bank-head"><div><span>THE HIGH-YIELD BANK</span><h3>${lenses.length} ways to create deeper meaning</h3><p>Open only what you need. Search by technique, effect, idea or text type.</p></div><strong class="insight-visible-count">${lenses.length} shown</strong></div>
      <div class="insight-quick" aria-label="High-yield analysis shortcuts">
        <span>Start with:</span>
        <button type="button" data-insight-query="agency">Agency</button>
        <button type="button" data-insight-query="pattern">Pattern breaks</button>
        <button type="button" data-insight-query="contradiction">Contradiction</button>
        <button type="button" data-insight-query="absence">Absence</button>
        <button type="button" data-insight-query="normalisation">Normalisation</button>
        <button type="button" data-insight-query="audience">Audience positioning</button>
      </div>
      <div class="insight-tools">
        <label class="insight-search">${searchIcon()}<input type="search" placeholder="Search: gaze, power, ads, omission, syntax…" aria-label="Search Insightful Analysis"/></label>
        <div class="insight-filters" role="group" aria-label="Filter Insightful Analysis by category"></div>
      </div>
      <div class="insight-grid"></div>
      <div class="insight-empty" hidden><b>No matching lens yet.</b><span>Try a broader word such as “power”, “visual”, “audience” or “structure”.</span></div>
    </section>

    <section class="under-lines">
      <div class="under-lines-head"><span>READ UNDER THE LINES</span><h3>How to notice what most students pass over</h3><p>Use these as questions while annotating. They push you from feature-spotting toward interpretation.</p></div>
      <div class="under-lines-grid"></div>
      <div class="so-what-ladder">
        <span>THE “SO WHAT?” TEST</span>
        <p><b>“The writer uses passive voice.”</b> → So what? → The actor disappears. → So what? → Responsibility becomes less visible. → So what? → Violence can appear impersonal or inevitable. → <strong>Now you have meaning.</strong></p>
      </div>
    </section>

    <div class="insight-final-reminder"><b>High-mark habit:</b> tiny choice + recurring pattern + audience positioning + larger implication. Precise evidence beats an obscure technique name every time.</div>`;

  const grid=panel.querySelector<HTMLElement>('.insight-grid')!;
  lenses.forEach((lens,index)=>grid.append(createCard(lens,index)));

  const underGrid=panel.querySelector<HTMLElement>('.under-lines-grid')!;
  underLines.forEach(([title,text],index)=>{
    const item=document.createElement('article');
    item.className='under-line-card';
    item.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><div><b>${title}</b><p>${text}</p></div>`;
    underGrid.append(item);
  });

  const filters=panel.querySelector<HTMLElement>('.insight-filters')!;
  const input=panel.querySelector<HTMLInputElement>('.insight-search input')!;
  const count=panel.querySelector<HTMLElement>('.insight-visible-count')!;
  const empty=panel.querySelector<HTMLElement>('.insight-empty')!;
  let category:'All'|InsightCategory='All';
  let query='';

  const apply=()=>{
    let visible=0;
    grid.querySelectorAll<HTMLDetailsElement>('.insight-card').forEach(card=>{
      const categoryMatch=category==='All'||card.dataset.insightCategory===category;
      const searchMatch=!query||Boolean(card.dataset.insightSearch?.includes(query));
      card.hidden=!(categoryMatch&&searchMatch);
      if(!card.hidden)visible++;
    });
    count.textContent=`${visible} shown`;
    empty.hidden=visible!==0;
  };

  categories.forEach(name=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=name;
    button.classList.toggle('active',name==='All');
    button.addEventListener('click',()=>{
      category=name;
      filters.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn===button));
      apply();
    });
    filters.append(button);
  });

  input.addEventListener('input',()=>{query=input.value.trim().toLowerCase();apply()});
  panel.querySelectorAll<HTMLButtonElement>('[data-insight-query]').forEach(button=>button.addEventListener('click',()=>{
    category='All';
    filters.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn.textContent==='All'));
    input.value=button.dataset.insightQuery||'';
    query=input.value.toLowerCase();
    apply();
    panel.querySelector('.insight-tools')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    input.focus({preventScroll:true});
  }));

  return panel;
}

function enhance(){
  const page=toolkitPage();
  if(!page)return;
  const tabs=page.querySelector<HTMLElement>(':scope > .keyword-mode-tabs');
  if(!tabs){setTimeout(schedule,50);return}
  tabs.setAttribute('aria-label','Toolkit reference mode');

  if(!tabs.querySelector('button[data-mode="insights"]')){
    const button=document.createElement('button');
    button.type='button';
    button.setAttribute('role','tab');
    button.dataset.mode='insights';
    button.innerHTML='Insightful Analysis <span class="toolkit-insight-tab-new">NEW</span>';
    const frames=tabs.querySelector('button[data-mode="frames"]');
    if(frames)frames.insertAdjacentElement('afterend',button);else tabs.append(button);
  }

  if(!page.querySelector(':scope > .insight-analysis-panel'))page.append(createPanel());

  const chooserGrid=page.querySelector<HTMLElement>(':scope > .toolkit-chooser .toolkit-choice-grid');
  if(chooserGrid&&!chooserGrid.querySelector('[data-toolkit-mode="insights"]')){
    const card=createChooserCard();
    const frames=chooserGrid.querySelector('[data-toolkit-mode="frames"]');
    if(frames)frames.insertAdjacentElement('afterend',card);else chooserGrid.append(card);
  }
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
