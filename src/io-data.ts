export type GlobalIssuePair={weak:string;improved:string;why:string};
export type ChainExample={choice:string;effect:string;meaning:string;issue:string;significance:string};
export type Drill={prompt:string;model:string};
export type ConnectionDrill={prompt:string;model:string};
export type MiniOral={issue:string;texts:string;shape:string};
export type Continuation={prompt:string;model:string};
export type Mistake={title:string;why:string;fix:string;example:string};

export const globalIssues:GlobalIssuePair[]=[
{weak:'War',improved:'The psychological toll of war on those who return home from it',why:'Narrows an enormous topic to a specific human consequence that both texts can explore concretely.'},
{weak:'The environment',improved:'The tension between economic development and the loss of natural coastline',why:'Names a specific conflict instead of treating the environment as an unlimited topic.'},
{weak:'Inequality',improved:'How access to education perpetuates generational inequality',why:'Adds a mechanism connecting cause and effect.'},
{weak:'Gender',improved:'The pressure on young women to suppress ambition to meet family expectation',why:'Makes the issue specific, human-scale, and analyzable through characterization or rhetoric.'},
{weak:'Technology',improved:'The erosion of genuine human connection through constant digital availability',why:'Turns a broad category into a precise tension created by technology.'},
{weak:'Racism',improved:'How institutional language conceals ongoing racial discrimination',why:'Focuses on a mechanism — language and institutions — that can be analyzed directly.'},
{weak:'Mental health',improved:'The stigma that prevents young people from seeking help for mental health struggles',why:'Adds the specific social mechanism rather than naming the topic alone.'},
{weak:'Poverty',improved:'How poverty limits a person’s ability to make genuinely free choices',why:'Connects an abstract condition to a specific claim about agency.'},
{weak:'Migration',improved:'The loss of identity experienced by those displaced from their homeland',why:'Narrows migration to a particular human consequence.'},
{weak:'Power',improved:'How institutions use bureaucratic language to obscure abuses of power',why:'Specifies both a mechanism and its function.'}
];

export const chainExamples:ChainExample[]=[
{choice:'Fragmented sentence structure in a literary extract about displacement.',effect:'Mimics disrupted thought.',meaning:'Suggests the character’s sense of self is coming apart.',issue:'The psychological toll of forced displacement.',significance:'Shows that displacement can fracture identity, not only relocate a person physically.'},
{choice:'Passive voice in an official relocation notice.',effect:'Obscures who is responsible for the decision.',meaning:'Distances the institution from accountability.',issue:'How institutional language conceals the human cost of policy decisions.',significance:'Reveals how institutions can use language to manage the appearance of harm rather than resolve it.'},
{choice:'A recurring tide or water motif in a novel.',effect:'Links personal loss to an ongoing natural process.',meaning:'Frames loss as cumulative rather than isolated.',issue:'The ongoing nature of environmental displacement.',significance:'Pushes the audience to see the crisis as gradual and continuous, not a one-time event.'},
{choice:'Direct second-person address in a campaign speech.',effect:'Implicates the audience personally.',meaning:'Positions the listener as responsible for acting.',issue:'Collective responsibility for a global crisis.',significance:'Shows how rhetoric can convert a distant issue into a personal obligation.'},
{choice:'An unreliable first-person narrator.',effect:'Forces the reader to question the narrator’s account.',meaning:'Suggests the character may not recognize their own complicity.',issue:'Denial as a barrier to addressing systemic harm.',significance:'Mirrors how individuals and institutions can avoid confronting uncomfortable truths.'},
{choice:'Stark visual contrast in a news photograph.',effect:'Directs attention to disparity between two groups.',meaning:'Visually asserts inequality without needing explanatory prose.',issue:'The visibility or invisibility of inequality in public discourse.',significance:'Shows how visual media can make an abstract inequality suddenly difficult to ignore.'},
{choice:'A structural time jump that skips the moment of loss.',effect:'The audience experiences the event only through its aftermath.',meaning:'Suggests the event may be too painful to represent directly.',issue:'Trauma and the limits of representation.',significance:'Raises the question of what can and cannot be directly depicted about large-scale suffering.'},
{choice:'Euphemistic language such as “relocation assistance.”',effect:'Softens the reality of forced displacement.',meaning:'Manages perception rather than describing the situation fully.',issue:'The gap between official narratives and lived experience.',significance:'Demonstrates how language itself can become a site of power and control.'},
{choice:'Repetition of a closed door or locked gate motif.',effect:'Builds a cumulative sense of exclusion.',meaning:'Suggests the barrier is systemic rather than incidental.',issue:'Structural exclusion of marginalized groups.',significance:'Frames exclusion as embedded in systems rather than caused only by isolated individuals.'},
{choice:'A shift from factual to emotive register in a speech.',effect:'Moves the audience from being informed to being emotionally engaged.',meaning:'Suggests facts alone are considered insufficient to provoke action.',issue:'The role of emotional appeal in mobilizing collective responses to crises.',significance:'Raises a wider question about how global issues are made urgent enough for people to act.'}
];

export const transitionGroups={
'Within a text':['This choice is reinforced elsewhere, when…','A related pattern appears when…','This becomes even clearer if we look at…'],
'Extract → wider work':['This isn’t isolated to this passage — later in the work…','This same tension resurfaces, in a different form, when…','Zooming out from this moment, the wider work shows…'],
'Work 1 → Work 2':['Turning now to the non-literary text, a similar — though differently constructed — pattern emerges…','Where the literary work approaches this through [technique], the non-literary text takes a different route…','This shift from [text type] to [text type] lets us see the issue from another angle…'],
'Choice → global issue':['This choice does more than shape the passage locally — it speaks directly to…','What this technique ultimately reveals about [global issue] is…','This is where the text’s construction and the global issue meet…'],
'Evidence → evaluation':['What makes this particularly effective is…','This is a powerful choice specifically because…','Compared with a more direct approach, this is more or less convincing because…'],
'Closing':['Taken together, both texts suggest…','What this comparison ultimately reveals about [global issue] is…','This leaves the audience or reader with…']
};

export const evaluationExamples=[
'This is particularly effective because it does not simply describe the loss — it makes the reader experience the character’s disorientation.',
'What is powerful here is how understated the language is; the restraint makes the moment hit harder than an overtly emotional description would.',
'This technique is limited in one way: by focusing so tightly on one family, the text risks making a systemic issue feel like an isolated tragedy.',
'Compared with the more direct factual approach of the non-literary text, the literary imagery is arguably more persuasive because it works emotionally rather than only informationally.',
'This is where the text is most convincing: the ambiguity of the ending refuses to give the audience a comfortable resolution.'
];

export const deliveryTips=[
['Pace','Aim for a steady conversational speed. Nerves often make speech faster, so practice slightly slower than feels natural.'],
['Clarity','Prefer precise, manageable sentences over long sentences you may lose track of while speaking.'],
['Confidence','Confidence comes from knowing your structure, evidence, and argument — not from memorizing exact wording.'],
['Natural delivery','Explain ideas as if speaking to a knowledgeable listener, not as if reading an essay aloud.'],
['Avoid robotic memorization','Rehearse the same ideas with slightly different wording each time so the oral remains flexible.'],
['Signposting','Use clear verbal markers such as “first,” “this leads to,” and “finally” so the listener can follow the structure.'],
['Pauses','A brief thinking pause is better than a rushed unclear sentence or a stream of filler words.'],
['Recovery','If you lose your place, briefly restate your last clear analytical point and continue instead of apologizing at length.'],
['Filler words','Record yourself to identify repeated fillers such as “um,” “like,” or “you know.” Awareness usually reduces them.'],
['Practice from an outline','Rehearse from structural bullet points and allow the exact phrasing to change each time.' ]
] as const;

export const analysisDrills:Drill[]=[
{prompt:'“The house stood empty, its windows like eyes that had stopped watching.”',model:'Personification makes the house feel once-alive and now abandoned; the “eyes” imply lost attention or presence, so vacancy becomes a form of loss rather than a neutral fact.'},
{prompt:'“Buy now. Because tomorrow doesn’t wait.”',model:'The imperative and fragment create urgency, while personifying “tomorrow” pressures immediate action; the technique manufactures high stakes around a purchase.'},
{prompt:'“She smiled the way people do when they’ve decided not to cry.”',model:'The simile reframes the smile as suppression rather than happiness, revealing emotional restraint and undercutting the reader’s first assumption.'},
{prompt:'“The committee regrets any inconvenience this may have caused.”',model:'Formal register and minimization distance the institution from responsibility; the wording risks sounding evasive because serious harm is reduced to “inconvenience.”'},
{prompt:'“Every year, the river took a little more of the field.”',model:'Personifying the river as a “taker” frames environmental change as an active, cumulative loss rather than a neutral natural process.'},
{prompt:'“We built this together. We can rebuild it together.”',model:'Repetition of “together” and parallel structure build solidarity and momentum, though the simplicity may also flatten a complex recovery process.'},
{prompt:'“He answered every question with another question.”',model:'The repeated dialogue pattern implies evasiveness or discomfort without direct characterization, making avoidance visible through form.'},
{prompt:'“The graph showed only the last five years.”',model:'Selective framing shapes interpretation by omission; what is excluded can be as persuasive as what is shown.'},
{prompt:'“The letter arrived a week too late to matter.”',model:'Structural timing makes delay itself meaningful, linking the event to missed opportunity or institutional failure.'},
{prompt:'“In the photograph, everyone is looking somewhere else.”',model:'Gaze direction in the visual composition creates disconnection among the subjects and enacts emotional distance without needing written explanation.'}
];

export const choiceDrills:Drill[]=[
{prompt:'“Quietly, carefully, deliberately — she closed the door.”',model:'Triadic structure and three adverbs slow the pacing and emphasize intentionality.'},
{prompt:'“The company that built this town has now abandoned it.”',model:'Juxtaposition of “built” and “abandoned” compresses institutional betrayal into one sentence.'},
{prompt:'“Act now. Your community depends on it.”',model:'Imperative mood and the inclusive appeal to “your community” create urgency and personal stakes.'},
{prompt:'“He was, in every sense that mattered, already gone.”',model:'The modifying phrase narrows and intensifies the claim, implying physical presence without meaningful emotional presence.'},
{prompt:'The document uses only bold, capitalized headers throughout.',model:'Typography and visual hierarchy can signal urgency, emphasis, or institutional authority.'},
{prompt:'“Nobody spoke. The silence did.”',model:'Personification makes silence an active communicative force, implying that unspoken tension carries more meaning than speech.'},
{prompt:'“First the school closed. Then the clinic. Then the bus route.”',model:'Structural listing and escalation build a cumulative sense of community erosion.'},
{prompt:'“I is not what I was.”',model:'Deliberately non-standard syntax can signal disorientation or a destabilized sense of identity.'},
{prompt:'The image is cropped so tightly that only her hands are visible.',model:'Framing isolates one detail and directs interpretation toward that detail while excluding wider context.'},
{prompt:'“We regret to inform you.”',model:'A conventional formal phrase and euphemistic register reduce emotional immediacy and create bureaucratic distance.'}
];

export const connectionDrills:ConnectionDrill[]=[
{prompt:'Passive voice hides who is responsible for a decision.',model:'Connect it to how institutional language can obscure accountability for large-scale crises.'},
{prompt:'A recurring flood image builds cumulative dread.',model:'Connect it to the ongoing and escalating nature of environmental displacement.'},
{prompt:'Inclusive pronouns build collective responsibility.',model:'Connect it to the challenge of mobilizing shared action around a global crisis.'},
{prompt:'An unreliable narrator hides their own complicity.',model:'Connect it to denial as a barrier to confronting systemic harm.'},
{prompt:'A euphemism softens a harsh reality.',model:'Connect it to the gap between official narratives and people’s lived experience of crisis.'},
{prompt:'Visual framing excludes wider context from an image.',model:'Connect it to how media selectively shapes public understanding of an issue.'},
{prompt:'A structural time jump skips over trauma.',model:'Connect it to the limits of representing large-scale suffering directly.'},
{prompt:'A closed-door or gate motif repeats across a work.',model:'Connect it to structural exclusion of marginalized groups.'},
{prompt:'A text shifts from factual to emotional register.',model:'Connect it to how emotional appeal is used to generate urgency around distant issues.'},
{prompt:'A character repeatedly falls silent in dialogue.',model:'Connect it to the silencing of marginalized voices within systems of power.'}
];

export const miniOrals:MiniOral[]=[
{issue:'The loss of coastal homes to environmental change.',texts:'A literary extract about a family leaving home + a news report on relocation policy.',shape:'State issue → literary tide/water imagery and emotional effect → non-literary euphemistic policy language and distancing effect → close on personal grief versus institutional distance.'},
{issue:'Stigma around mental health struggles.',texts:'A literary extract with a character hiding distress + a public health campaign poster.',shape:'State issue → literary silence/avoidance as characterization → non-literary reassuring but vague campaign language → close on the gap between private experience and public messaging.'},
{issue:'Institutional obscuring of accountability.',texts:'A literary extract featuring bureaucratic dialogue + an official public notice.',shape:'State issue → evasive dialogue as characterization → passive voice/euphemism in the notice → close on how both forms manage perception over truth.'},
{issue:'Generational inequality through education access.',texts:'A literary extract about denied opportunity + an infographic on education funding gaps.',shape:'State issue → literary representation of blocked opportunity → non-literary visual data hierarchy → close on individual story versus systemic pattern.'},
{issue:'The erosion of connection through digital life.',texts:'A literary extract depicting isolated characters + an advertisement for an “always connected” product.',shape:'State issue → literary imagery of physical proximity without emotional connection → non-literary irony between connection branding and isolating use → close on marketed versus lived experience.'}
];

export const continuations:Continuation[]=[
{prompt:'“…so the imagery of the closing shutters clearly reinforces the sense of exclusion. This isn’t limited to this one passage, though — later in the novel…”',model:'“…the same image of closing doors reappears when the protagonist is turned away from the town hall meeting, suggesting this exclusion is systemic rather than incidental.”'},
{prompt:'“…the passive construction ‘residents are advised’ distances the institution from responsibility. Turning now to the literary text, a similar…”',model:'“…evasiveness appears in how the mayor never directly answers a question; his dialogue redirects rather than openly denies.”'},
{prompt:'“…this urgency created by the imperative mood is powerful, but it’s worth asking how effective it really is…”',model:'“…because urgency without specific action can feel manipulative rather than genuinely mobilizing, which connects to a wider problem in how crises are communicated.”'},
{prompt:'“…so both texts use fragmentation, but for different reasons…”',model:'“…the novel’s fragments mirror internal breakdown, while the advertisement’s fragments create memorability and pace — the same broad device serving very different purposes.”'},
{prompt:'“…to bring this together, both texts ultimately suggest…”',model:'“…that the global issue is not only an external event but something that reshapes how people understand themselves, whether through personal grief or distancing institutional language.”'}
];

export const mistakes:Mistake[]=[
{title:'Global issue is too broad',why:'It produces general discussion instead of precise textual analysis.',fix:'Narrow the issue to a specific mechanism, tension, or consequence.',example:'Move from “war” to the psychological toll of war on people returning home.'},
{title:'Summarizing instead of analyzing',why:'Retelling content uses speaking time without demonstrating analytical skill.',fix:'Lead with choice → effect → meaning rather than plot description.',example:'Analyze the construction of a departure instead of simply saying the character leaves home.'},
{title:'Memorizing a full script',why:'Delivery becomes flat and fragile, especially when a line is forgotten or the discussion changes direction.',fix:'Rehearse from a structural outline and flexible ideas.',example:'Explain the same point with slightly different wording in each rehearsal.'},
{title:'Ignoring form',why:'The task asks how content and form present the issue; content-only discussion misses the construction of meaning.',fix:'Pair each content point with an authorial, structural, linguistic, or visual choice.',example:'Do not stop at “the text is about loss”; explain how fragmented syntax constructs that loss.'},
{title:'Weak connection between text and issue',why:'If the issue only loosely applies to one text, the argument feels forced.',fix:'Test both materials against the issue before committing to the pairing.',example:'Choose a non-literary text that substantially engages with the issue rather than only mentioning it.'},
{title:'Extract is too short or too simple',why:'There is not enough technique or meaning to sustain close analysis.',fix:'Choose a dense extract within the teacher-guided size limit.',example:'Prefer a passage with structural or rhetorical complexity over one that is mostly plot mechanics.'},
{title:'Never moving beyond the extract',why:'The response shows close reading but not understanding of the issue across the wider work.',fix:'Connect each extract to a precise moment or pattern elsewhere.',example:'After the close reading, name a later scene where the issue develops or changes.'},
{title:'No evaluation',why:'The analysis stops at description rather than judgment.',fix:'Explain why a choice is convincing, powerful, limited, subtle, or especially significant.',example:'Do not only name the effect; assess why that effect works in this context.'},
{title:'Uneven treatment of the two texts',why:'One text dominating the oral weakens the dual-text requirement.',fix:'Time both sections during rehearsal and aim for comparable depth.',example:'Check that literary and non-literary analysis receive roughly balanced attention.'},
{title:'Rambling without structure',why:'The listener cannot easily follow the argument.',fix:'Use a clear sequence and spoken signposting.',example:'Use verbal markers such as “first,” “turning to,” and “finally.”'},
{title:'Treating the discussion as an afterthought',why:'The follow-up discussion is part of the assessed session.',fix:'Practice responding to unscripted questions about the texts and issue.',example:'Ask a friend or teacher to give unpredictable follow-up questions after practice.'},
{title:'Reading directly from notes',why:'It makes delivery less natural and suggests weak command of the material.',fix:'Use brief prompts or keywords rather than complete sentences.',example:'Rehearse until you only need occasional glances at the outline.'},
{title:'Forcing terminology',why:'Naming techniques without explaining their effect is surface-level analysis.',fix:'Only use a term when you can immediately explain what it changes and why it matters.',example:'Do not say only “juxtaposition”; explain exactly what is contrasted and its significance.'},
{title:'Losing track of time',why:'A cut-short oral or rushed ending damages organization and completeness.',fix:'Rehearse with timed checkpoints until pacing becomes familiar.',example:'Practice the full 10-minute oral multiple times, not only isolated sections.'},
{title:'Reusing a work across restricted components',why:'The supplied guidance warns that IO works cannot be reused for Paper 2 and, at HL, the HL Essay.',fix:'Plan text choices across assessment components early and confirm them with your teacher.',example:'Keep a simple checklist showing which assessment component each studied work is assigned to.'}
];
