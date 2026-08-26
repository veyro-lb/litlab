export type SearchItem={title:string;preview:string;to:string;category:string};
export type FAQ={q:string;a:string;to?:string};
export type GlossaryItem={term:string;definition:string;example?:string;category:string};
export type Tip={title:string;text:string};

export const nav=[
  ['home','Home'],['start','Start Here'],['papers','Papers'],['io','IO'],['books','Books'],['essays','Essays'],['skills','Skills Lab']
] as const;

export const homeCards=[
  {slug:'start',n:'01',title:'Start Here',desc:'Understand the map of DP English, analysis, authorial choices and the habits that make everything else easier.',icon:'FlaskConical'},
  {slug:'papers',n:'02',title:'Papers',desc:'Choose Paper 1 or Paper 2, then explore the right skills, strategies and practice structure.',icon:'FileText'},
  {slug:'io',n:'03',title:'Individual Oral',desc:'A clear home for global issues, extracts, analysis, structure, delivery and practice.',icon:'Mic2'},
  {slug:'books',n:'04',title:'Books',desc:'Organise the books you study so themes, characters, choices and connections are easy to revisit.',icon:'LibraryBig'},
  {slug:'essays',n:'05',title:'Essays',desc:'Choose Extended Essay or HL Essay, then open the guide and workspace that match the essay you are preparing.',icon:'SearchCheck'},
  {slug:'skills',n:'06',title:'Skills Lab',desc:'Test your understanding through interactive analysis, thesis, evaluation, authorial-choice and paragraph practice.',icon:'FlaskConical'}
];

export const compass=[
  {slug:'start',label:'START',sub:'New to DP English?',x:50,y:9},
  {slug:'papers',label:'PAPERS',sub:'Paper 1 + Paper 2',x:86,y:32},
  {slug:'io',label:'IO',sub:'Individual Oral',x:79,y:78},
  {slug:'essays',label:'ESSAYS',sub:'EE + HL Essay',x:21,y:78},
  {slug:'books',label:'BOOKS',sub:'Build your library',x:14,y:32},
  {slug:'skills',label:'SKILLS LAB',sub:'Test your understanding',x:50,y:91}
];

export const faqs:FAQ[]=[
  {q:'What is the difference between Paper 1 and Paper 2?',a:'At a high level, Paper 1 asks you to analyse unseen material, while Paper 2 asks you to build a comparative literary argument using works you have studied. The exact Paper 1 text type and task format depend on whether you take Language A: Literature or Language A: Language & Literature, and on your level.',to:'papers'},
  {q:'What exactly is the IO?',a:'The Individual Oral is an assessed oral task built around analysis and interpretation. The exact pairing of material differs between Language A courses, so LitLab keeps course-specific details clearly labelled rather than treating one formula as universal.',to:'io'},
  {q:'Do I need to memorise entire essays?',a:'A stronger long-term strategy is to understand how to form an argument, select evidence and explain authorial choices. Memorised paragraphs are less adaptable when the question, text or focus changes.'},
  {q:'What does “authorial choice” actually mean?',a:'It means a decision made by a writer or creator about how meaning is communicated — for example diction, imagery, structure, perspective, repetition, contrast, framing or layout.',to:'start#choices'},
  {q:'What is the difference between summary and analysis?',a:'Summary tells us what happens or what is said. Analysis explains how a choice creates an effect or meaning, and why that matters to the wider text.',to:'start#analysis'},
  {q:'When should I start keeping notes on my books?',a:'As early as possible. A small organised record of important moments, themes, choices and connections is far easier to use later than trying to reconstruct an entire book from memory.',to:'books'},
  {q:'What is a global issue?',a:'It is a significant issue that can be explored across contexts. How it is used in the IO depends on your specific Language A course, so check teacher and current IB guidance before finalising assessment choices.',to:'io'},
  {q:'Is the Extended Essay part of English?',a:'The EE is part of the DP core for all Diploma candidates. Students choose an approved subject-focused or interdisciplinary route; an English-focused EE is one possible choice depending on the session and school arrangements.',to:'ee'},
  {q:'Do all schools teach the same books?',a:'No. The works studied can differ by school and course. That is why LitLab’s Books section is designed as a flexible library that can be filled with the works your class actually studies.',to:'books'}
];

export const tips:Tip[]=[
  {title:'Go beyond the label',text:'“The author uses repetition” is only the start. Explain what is repeated, the effect it creates, and why that effect matters.'},
  {title:'Track patterns',text:'Repeated images, contrasts, shifts and structural choices often become more useful than isolated technique spotting.'},
  {title:'Keep evidence organised',text:'Record important moments while you study. Future you should not have to search an entire book for one idea.'},
  {title:'Ask why here?',text:'A choice becomes more interesting when you ask why it appears at this exact moment rather than somewhere else.'},
  {title:'Compare methods, not plots',text:'In comparative writing, move beyond “both books show power”. Compare how each creator constructs that idea and to what effect.'},
  {title:'Treat feedback like data',text:'If the same weakness appears in teacher comments more than once, turn it into a specific practice target.'},
  {title:'Plan before you decorate',text:'A clear argument with precise evidence beats sophisticated vocabulary attached to a weak line of reasoning.'},
  {title:'Read the task language carefully',text:'Underline the actual focus of the question before deciding which ideas and evidence belong in your response.'}
];

export const glossary:GlossaryItem[]=[
  {term:'Analysis',definition:'Explaining how choices create meaning, not simply identifying them.',example:'Instead of naming “repetition”, explain what the repetition emphasises and why that matters.',category:'Core'},
  {term:'Interpretation',definition:'A reasoned understanding of what a text may mean, supported by evidence and analysis.',category:'Core'},
  {term:'Authorial choice',definition:'A decision made by a writer or creator about how meaning is communicated.',category:'Core'},
  {term:'Audience',definition:'The person or group a text is created for, whether specific, implied or broad.',category:'Context'},
  {term:'Purpose',definition:'What a creator may be trying to achieve through a text or work.',category:'Context'},
  {term:'Context',definition:'Relevant circumstances surrounding the creation, setting or reception of a text.',category:'Context'},
  {term:'Tone',definition:'The attitude or stance communicated through language and other choices.',category:'Technique'},
  {term:'Mood',definition:'The atmosphere or emotional quality a text creates for its audience.',category:'Technique'},
  {term:'Theme',definition:'A significant recurring idea explored through a work.',category:'Books'},
  {term:'Motif',definition:'A recurring image, idea, object or pattern that contributes to meaning.',category:'Books'},
  {term:'Symbol',definition:'Something that carries meaning beyond its literal function in a particular context.',category:'Technique'},
  {term:'Imagery',definition:'Language or visual detail that creates sensory or imaginative impressions.',category:'Technique'},
  {term:'Diction',definition:'A creator’s choice of words and the associations or effects those choices produce.',category:'Technique'},
  {term:'Syntax',definition:'The arrangement and structure of words and sentences.',category:'Technique'},
  {term:'Structure',definition:'How parts of a text or work are organised and related.',category:'Technique'},
  {term:'Juxtaposition',definition:'Placing elements near each other so their contrast or relationship becomes meaningful.',category:'Technique'},
  {term:'Characterisation',definition:'The methods used to construct and develop a character.',category:'Books'},
  {term:'Narrative perspective',definition:'The position or viewpoint through which a story is presented.',category:'Books'},
  {term:'Thesis',definition:'A focused, arguable central claim that gives an analytical response direction.',category:'Writing'},
  {term:'Evidence',definition:'A specific textual detail or reference used to support an interpretation.',category:'Writing'},
  {term:'Global issue',definition:'A significant issue explored across contexts; assessment use should be checked against current course guidance.',category:'IO'},
  {term:'Paper 1',definition:'An examination component centred on analysis of unseen material; the exact task differs by Language A course and level.',category:'Papers'},
  {term:'Paper 2',definition:'A comparative literary essay examination based on studied works.',category:'Papers'},
  {term:'Individual Oral',definition:'An assessed oral analysis task in Language A. The required pairing of material depends on the course.',category:'IO'},
  {term:'Extended Essay',definition:'An independent DP core research project culminating in a formal academic paper.',category:'EE'}
];

export const searchItems:SearchItem[]=[
  {title:'Start Here',preview:'DP English overview, analysis, authorial choices, thesis basics and beginner setup.',to:'start',category:'Guide'},
  {title:'Analysis vs Summary',preview:'Learn the difference between retelling and explaining how meaning is created.',to:'start#analysis',category:'Start Here'},
  {title:'Authorial Choices',preview:'Language, structure, narrative and visual choices.',to:'start#choices',category:'Start Here'},
  {title:'LitLab Analysis Ladder',preview:'Notice → Name → Effect → Meaning → Purpose → Connection.',to:'start#ladder',category:'Start Here'},
  {title:'Papers',preview:'Choose Paper 1 or Paper 2.',to:'papers',category:'Guide'},
  {title:'Paper 1',preview:'Unseen analysis workspace and future guide.',to:'paper-1',category:'Papers'},
  {title:'Paper 2',preview:'Comparative literary writing workspace and future guide.',to:'paper-2',category:'Papers'},
  {title:'Individual Oral',preview:'IO overview, practice timer and future content structure.',to:'io',category:'Guide'},
  {title:'Books',preview:'Book library, study profile structure and note-taking system.',to:'books',category:'Guide'},
  {title:'Essays',preview:'Choose between the Extended Essay and HL Essay guides and their saved workspaces.',to:'essays',category:'Guide'},
  {title:'Extended Essay',preview:'English EE starting point, research question workshop and Essay Workspace.',to:'ee',category:'Essays'},
  {title:'HL Essay',preview:'HL Essay line of inquiry, structure, analysis, criteria and Essay Workspace.',to:'hl-essay',category:'Essays'},
  {title:'Skills Lab',preview:'Interactive practice for analysis, thesis writing, authorial choices, evaluation, paragraph structure and mixed review.',to:'skills',category:'Practice'},
  {title:'Analysis Lab',preview:'Build analysis through Notice → Choice → Effect → Meaning → Evaluation → Wider Theme.',to:'skills',category:'Skills Lab'},
  {title:'Thesis Lab',preview:'Learn how to form focused, arguable and evaluative analytical thesis statements.',to:'skills',category:'Skills Lab'},
  {title:'Authorial Choice Check',preview:'Identify choices accurately and connect them to effect.',to:'skills',category:'Skills Lab'},
  {title:'Evaluation Lab',preview:'Practice judging how effectively a creator’s choices produce meaning.',to:'skills',category:'Skills Lab'},
  {title:'Paragraph Builder',preview:'Put analytical reasoning in a logical order and understand why each move matters.',to:'skills',category:'Skills Lab'},
  {title:'Mixed Skill Check',preview:'Test your overall understanding and get a recommendation for what to review next.',to:'skills',category:'Skills Lab'},
  {title:'Glossary',preview:'Search DP English terminology.',to:'glossary',category:'Reference'},
  ...glossary.map(g=>({title:g.term,preview:g.definition,to:'glossary',category:'Glossary'}))
];

export const officialSources=[
  {label:'IB — Studies in language and literature',url:'https://ibo.org/programmes/diploma-programme/curriculum/language-and-literature/'},
  {label:'IB — Language A: language and literature',url:'https://ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-language-and-literature/'},
  {label:'IB — Language A: literature',url:'https://ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-literature/'},
  {label:'IB — Extended essay',url:'https://ibo.org/programmes/diploma-programme/curriculum/dp-core/extended-essay/'}
];
