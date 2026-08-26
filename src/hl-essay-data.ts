export type HLCriterion={name:string;marks:number;focus:string};
export type HLMistake={title:string;why:string;fix:string;example:string};
export type HLNarrowingExample={work:string;broad:string;narrower:string;focused:string;concept:string};
export type HLPractice={work:string;inquiry:string;concept:string};

export const hlConcepts=['Identity','Culture','Creativity','Communication','Transformation','Perspective','Representation'];

export const hlNarrowingExamples:HLNarrowingExample[]=[
  {work:'Persepolis',broad:'Identity in Persepolis.',narrower:'How Marji’s identity is shaped by displacement.',focused:'How does Marjane Satrapi use visual style to represent Marji’s fractured sense of identity across her time in Vienna?',concept:'Identity'},
  {work:'Nineteen Eighty-Four',broad:'Power in Nineteen Eighty-Four.',narrower:'How language relates to power in the novel.',focused:'How does Orwell use the invented vocabulary of Newspeak to represent the Party’s control over thought?',concept:'Communication'},
  {work:'The Handmaid’s Tale',broad:'Gender in The Handmaid’s Tale.',narrower:'How clothing relates to gendered control.',focused:'How does Atwood use the color-coded dress system to construct Gilead’s stratification of women?',concept:'Representation'},
  {work:'Carol Ann Duffy — The World’s Wife',broad:'Carol Ann Duffy’s poetry and voice.',narrower:'How Duffy gives voice to historically silenced women.',focused:'How does Duffy use dramatic monologue in The World’s Wife to reconstruct interiority for women defined only through their relationships to famous men?',concept:'Perspective'}
];

export const hlGoodFits=[
  'A specific authorial technique or pattern you can trace across a work with real depth, such as a recurring motif, structural choice, or narrative device.',
  'A tension or ambiguity in the work that rewards close, sustained analysis rather than quick resolution.',
  'A genuine question you do not already know the full answer to — something that creates room for real thinking rather than a recycled class response.'
];

export const hlPoorFits=[
  'A theme so broad it could apply to almost any work, such as “love” or “death,” without a sharper angle.',
  'A question that mainly asks what happens and therefore invites plot summary instead of analysis.',
  'A comparison between two works. The source pack treats that as Paper 2 territory rather than the HL Essay.',
  'A line of inquiry that simply repeats a class discussion or essay prompt without adding a more focused, independent angle.'
];

export const hlCriteria:HLCriterion[]=[
  {name:'A — Knowledge, Understanding and Interpretation',marks:5,focus:'Understanding of the work and interpretations connected to the line of inquiry, supported by well-chosen references.'},
  {name:'B — Analysis and Evaluation',marks:5,focus:'Analysis and evaluation of authorial choices — language, technique, style, and other constructed features — in relation to the line of inquiry.'},
  {name:'C — Focus, Organization and Development',marks:5,focus:'Clear organization, sustained focus on the line of inquiry, and purposeful development across the essay.'},
  {name:'D — Language',marks:5,focus:'Clear, accurate, appropriately formal academic register and style.'}
];

export const hlMistakes:HLMistake[]=[
  {title:'Line of inquiry too broad',why:'It becomes almost impossible to explore the idea with real depth in 1,200–1,500 words.',fix:'Use a narrowing process before committing to the inquiry.',example:'Move from “identity in Persepolis” to a specific visual technique operating in a specific context.'},
  {title:'Description instead of analysis',why:'It wastes scarce word count and directly weakens the analytical work the essay needs to do.',fix:'Ask whether each paragraph explains how an authorial choice creates effect and meaning, or merely reports what happens.',example:'Replace a plot-summary paragraph with sustained analysis of a specific choice and its effect.'},
  {title:'Exceeding the word limit',why:'The pack states that examiners will not read beyond 1,500 words, so important material beyond that point will not be assessed.',fix:'Track word count from the first draft rather than waiting until the end.',example:'Trim an overlong introduction instead of sacrificing the analytical body of the essay.'},
  {title:'Choosing a work already used for the IO',why:'The source pack identifies this as a restriction and says the same work should not be reused for the IO and HL Essay.',fix:'Plan which studied work is assigned to which assessment component early, and confirm the current rule with your teacher/course guide.',example:'Keep a simple list showing which work has been “spent” on which component.'},
  {title:'A line of inquiry that is really a comparison',why:'The HL Essay is built around one work or body of work, while comparison belongs elsewhere in the course.',fix:'Check that the whole inquiry can be explored inside a single work or body of work.',example:'Rework “How do two authors represent power?” into a focused inquiry about one of those works.'},
  {title:'Repeating a class essay or discussion',why:'It weakens the sense of independent thinking the HL Essay is meant to demonstrate.',fix:'Push beyond the existing class angle toward a more precise, personally generated analytical focus.',example:'Turn a broad class theme into a narrower technical question you have not already answered.'},
  {title:'Weak or vague line of inquiry statement',why:'An unclear opening focus makes it difficult for the whole essay to stay coherent.',fix:'State the line of inquiry precisely in the introduction and make the analytical angle visible.',example:'Replace “This essay explores identity” with a specific, technique-focused inquiry statement.'},
  {title:'No real development across paragraphs',why:'A list of similar points does not create a developing argument.',fix:'Make each paragraph build on the previous one rather than repeat it.',example:'Write a one-sentence summary of each paragraph and check whether the ideas genuinely progress.'},
  {title:'Long, indiscriminate quotations',why:'They consume word count that could be used for analysis.',fix:'Quote only the precise words or phrases doing the analytical work.',example:'Use the key phrase instead of reproducing a whole sentence when only a few words matter.'},
  {title:'Overloading with secondary sources',why:'Outside criticism can crowd out your own close analysis, which remains the central task.',fix:'Use secondary sources sparingly and only when they genuinely sharpen your argument.',example:'Use one relevant piece of criticism instead of several sources added mainly for appearance.'},
  {title:'Informal or inconsistent register',why:'Language is directly assessed and weak register can reduce clarity and authority.',fix:'Proofread specifically for formality, precision, and consistency — not only grammar.',example:'Replace casual phrasing with clear, precise academic language.'},
  {title:'Losing sight of the line of inquiry midway through',why:'The essay can become a collection of interesting observations rather than one sustained argument.',fix:'Return explicitly to the line of inquiry at key points throughout the essay.',example:'End body paragraphs by making the connection back to the inquiry visible.'},
  {title:'Choosing a work too thin to sustain the essay',why:'You may run out of distinct analytical material and start repeating yourself.',fix:'Test early whether the work can support several genuinely different analytical points.',example:'Choose a denser work or suitable body of work if a short text cannot sustain enough depth.'},
  {title:'Treating the teacher’s role as passive',why:'You lose valuable early feedback on whether the line of inquiry is viable and focused.',fix:'Use teacher check-ins actively while the inquiry is still being shaped.',example:'Bring a draft line of inquiry to your teacher before writing the full essay.'},
  {title:'Weak conclusion that only restates the introduction',why:'It misses the chance to synthesize what the analysis has actually demonstrated.',fix:'Use the conclusion to state what the essay has shown about the line of inquiry.',example:'Finish with a synthesizing judgment rather than repeating the opening claim.'}
];

export const hlChecklist=[
  'My line of inquiry is specific, analytical, and focused on one work or body of work.',
  'I have checked that my chosen work is eligible and has not already been used in a conflicting assessment component.',
  'My essay is within the 1,200–1,500 word range described in the source pack.',
  'Every paragraph connects explicitly back to the line of inquiry.',
  'Analysis dominates over description or plot summary.',
  'Quotations are short, precise, and purposeful.',
  'My register is consistently formal and academic.',
  'Any secondary sources are cited consistently and used sparingly.',
  'My conclusion synthesizes findings instead of simply repeating the introduction.',
  'I have proofread for language accuracy and clarity.'
];

export const hlPractice:HLPractice[]=[
  {work:'Persepolis',inquiry:'How does Satrapi use panel composition to represent conformity under the veil requirement?',concept:'Representation'},
  {work:'The Handmaid’s Tale',inquiry:'How does Atwood use euphemistic language to construct Gilead’s control over reproduction?',concept:'Communication'},
  {work:'Nineteen Eighty-Four',inquiry:'How does Orwell use the telescreen as a structural device to construct constant surveillance?',concept:'Perspective'},
  {work:'Frankenstein',inquiry:'How does Shelley use the novel’s nested narrative structure to shape the reader’s sympathy toward the Creature?',concept:'Perspective'},
  {work:'The Stranger',inquiry:'How does Camus use flat, detached narration to construct Meursault’s alienation from social convention?',concept:'Identity'},
  {work:'Carol Ann Duffy’s poetry',inquiry:'How does Duffy use extended metaphor to reconstruct conventional ideas of love in “Valentine”?',concept:'Creativity'}
];
