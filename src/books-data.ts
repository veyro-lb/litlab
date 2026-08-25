export type BookCharacter={name:string;role:string;development:string;themes:string;methods:string};
export type BookTheme={name:string;appears:string;choices:string;interpretation:string;compare?:string};
export type BookItem={title:string;text:string};
export type BookMoment={n:number;title:string;why:string;choices:string;themes:string;paper2?:string};
export type BookConnection={theme:string;with:string;similarity:string;difference:string;methods:string;why:string};
export type BookFAQ={q:string;a:string};
export type BookProfile={
  id:string;title:string;author:string;year:string;form:string;language:string;level:string;
  context:string;overview:string;
  characters:BookCharacter[];themes:BookTheme[];symbols:BookItem[];motifs:BookItem[];choices:BookItem[];
  voice:string;structure:string;setting:string;moments:BookMoment[];evidence:BookItem[];
  connections:BookConnection[];arguments:string[];misunderstandings:string[];faqs:BookFAQ[];
};

export const handmaidsTale:BookProfile={
  id:'handmaids-tale',
  title:"The Handmaid's Tale",
  author:'Margaret Atwood',
  year:'1985',
  form:'Dystopian / speculative fiction novel',
  language:'English',
  level:'HL studied work',
  context:'Written during a period of rising religious-conservative political activism and backlash against second-wave feminism in the 1980s. Atwood has said that she avoided inventing practices without historical precedent. The novel imagines a near-future United States transformed by a Christian-fundamentalist coup into the theocratic Republic of Gilead during a fertility crisis.',
  overview:'Offred is a Handmaid in Gilead, a regime that has removed women’s legal, financial, and bodily autonomy. Fertile women are assigned to elite households and forced into the Ceremony, a state-sanctioned reproductive ritual. Offred’s present life of surveillance, routine, and quiet resistance is interrupted by memories of Luke, her daughter, and Moira. Her secret meetings with the Commander and relationship with Nick draw her deeper into Gilead’s contradictions. The novel ends with Offred taken away in a van, leaving rescue and arrest unresolved, before a mock-academic epilogue centuries later reframes her account as a historical artifact.',
  characters:[
    {name:'Offred',role:'Narrator and protagonist; observant, guarded, quietly resistant.',development:'Moves from numb compliance toward small, risky acts of connection, desire, and resistance.',themes:'Complicity, survival, resistance, memory, identity.',methods:'First-person narration, present-tense immediacy, flashback, self-correction, uncertainty about memory.'},
    {name:'The Commander',role:'Head of Offred’s household; publicly enforces Gilead while privately breaking its rules.',development:'His loneliness and hypocrisy become more visible through Scrabble, private meetings, and Jezebel’s.',themes:'Complicity, hypocrisy, language, power, public ideology vs. private desire.',methods:'Characterized through contradiction between rigid authority and private craving for conversation and intimacy.'},
    {name:'Serena Joy',role:'The Commander’s Wife; former religious media figure and anti-feminist activist.',development:'Increasingly bitter, resentful, and controlling as the system she helped support confines her too.',themes:'Complicity, irony, gendered power, resentment.',methods:'Sharp dialogue and pointed physical details such as her garden and cane.'},
    {name:'Moira',role:'Offred’s outspoken, defiant college friend.',development:'Moves from active rebellion and escape attempts to resigned survival at Jezebel’s.',themes:'Resistance, survival, limits of defiance.',methods:'Foil to Offred: Moira acts where Offred often observes, making their different survival strategies visible.'},
    {name:'Nick',role:'Household chauffeur with deliberately ambiguous loyalties.',development:'Becomes Offred’s lover; his connection to resistance and role in her final fate remain unresolved.',themes:'Trust, uncertainty, hope, risk.',methods:'Characterized through restraint, withheld information, and ambiguity.'},
    {name:'Aunt Lydia',role:'Indoctrinator at the Red Center and repeated voice of Gilead’s ideology.',development:'Functions consistently as an internal enforcer of the regime.',themes:'Ideological control, complicity, women policing women.',methods:'Repeated sayings, moralizing tone, remembered instruction, and ideological repetition.'}
  ],
  themes:[
    {name:'Totalitarian control and surveillance',appears:'Eyes, checkpoints, informants, movement restrictions, dress codes, and guarded daily routines.',choices:'Offred’s careful narration constantly registers the possibility of being watched.',interpretation:'Control works through internalized fear as much as visible punishment.',compare:'1984 — surveillance, conformity, and thought control.'},
    {name:'Gender and reproductive control',appears:'The Ceremony, the caste system of Wives / Handmaids / Marthas / Aunts, and the removal of women’s legal and financial autonomy.',choices:'Ritualized and euphemistic vocabulary normalizes institutionalized violence.',interpretation:'Control over reproduction becomes inseparable from control over personhood.',compare:'Persepolis — state regulation of women’s bodies, dress, and behavior.'},
    {name:'Complicity and resistance',appears:'Offred’s compromises and rebellions, Serena Joy’s ironic entrapment, Moira’s defiance and later resignation.',choices:'Morally ambiguous decisions replace simple hero/villain categories.',interpretation:'Resistance and complicity can coexist within the same person.',compare:'The Stranger — different relationships between an individual and constraining systems.'},
    {name:'Language as control',appears:'Gilead’s invented vocabulary, ritual labels, and the renaming of Handmaids according to Commanders.',choices:'Readers must learn the regime’s vocabulary alongside Offred.',interpretation:'Controlling language becomes a way of controlling identity, memory, and thought.',compare:'1984 — Newspeak as a parallel mechanism of linguistic control.'},
    {name:'Memory and storytelling as resistance',appears:'Offred revises memories, addresses an unnamed listener, and reconstructs experiences that the epilogue later presents as recorded testimony.',choices:'Metafictional framing and self-aware narration foreground the act of telling.',interpretation:'Preserving and telling a story can resist erasure even when memory is incomplete.',compare:'Persepolis — retrospective personal narration reclaiming experience from political or historical erasure.'}
  ],
  symbols:[
    {title:'Red habit and white wings',text:'The clothing combines fertility imagery with enforced restriction and invisibility: color marks function, while the wings limit sight and obscure the face.'},
    {title:'Color-coded caste system',text:'Blue, green, red, and striped clothing reduce women’s identities to assigned social functions and make hierarchy instantly visible.'},
    {title:'Scrabble',text:'An ordinary literacy game becomes a symbol of forbidden language, intimacy, reading, and autonomy because women are prohibited from reading.'},
    {title:'Closet inscription',text:'A fragment left by a previous Handmaid becomes a symbol of covert resistance and solidarity across time between women who never meet.'},
    {title:'The Eye',text:'The surveillance emblem represents the regime’s constant presence and the uncertainty of who may be observing.'}
  ],
  motifs:[
    {title:'Small sensory pleasures',text:'Saved butter, remembered food, and other bodily pleasures preserve a private inner self beneath enforced conformity.'},
    {title:'Checkpoints and passes',text:'Repeated bureaucratic controls reinforce how completely Gilead regulates movement and ordinary life.'},
    {title:'Addressing an unnamed “you”',text:'Direct address reinforces the desire to be heard, believed, and remembered, connecting narration to resistance.'}
  ],
  choices:[
    {title:'Fragmented, achronological structure',text:'Present-day Gilead scenes and flashbacks interrupt one another, mirroring trauma, disorientation, and the refusal of a smooth resolved narrative.'},
    {title:'Present-tense narration',text:'Gilead scenes unfold with claustrophobic immediacy, keeping the reader inside Offred’s restricted knowledge moment by moment.'},
    {title:'Euphemistic invented vocabulary',text:'The reader must learn Gilead’s language, experiencing how repeated terminology can normalize the system it describes.'},
    {title:'Ambiguous ending',text:'The unresolved van scene withholds closure and reinforces uncertainty, trust, fear, and the limits of what Offred or the reader can know.'},
    {title:'Historical Notes frame',text:'The mock-academic epilogue destabilizes the authority of Offred’s story and satirizes how detached scholarship can sanitize lived suffering.'}
  ],
  voice:'Offred narrates in the first person, mostly using present tense for life in Gilead and past tense for remembered life before it. Her voice is self-aware, self-correcting, and uncertain. She revises details and openly acknowledges reconstruction. The Historical Notes later reveal why this matters: the account has been assembled from recorded testimony. The result is not a simply “unreliable” or deceptive narrator, but a human narrator working with imperfect memory under extreme pressure.',
  structure:'The novel alternates routine present-day sections with flashbacks and recurring “Night” sections. Memory repeatedly interrupts the present instead of appearing in neat chronological order. The novel proper ends in radical uncertainty as Offred enters the van, then the Historical Notes shift genre and perspective by presenting her story as material for future academic study.',
  setting:'Gilead occupies a near-future version of the United States, especially the area around Cambridge, Massachusetts. Familiar institutions are repurposed for authoritarian aims: spaces associated with education or ordinary civic life become sites of indoctrination and control. This makes oppression feel like something that can emerge from familiar structures rather than from a completely foreign world.',
  moments:[
    {n:1,title:'Opening description of the Red Center',why:'Transforms a familiar former gymnasium into an instrument of indoctrination and establishes how Gilead repurposes ordinary spaces.',choices:'Retrospective, matter-of-fact description.',themes:'Control, memory, institutional transformation.',paper2:'Compare repurposed institutions with 1984.'},
    {n:2,title:'Introduction of the household and routines',why:'Establishes the caste system, domestic hierarchy, ritual, and daily surveillance.',choices:'Detailed procedural description.',themes:'Gender, control, routine.'},
    {n:3,title:'Flashbacks to Luke and Offred’s daughter',why:'Grounds the political system in personal loss and shows what Offred had before Gilead.',choices:'Warmer personal memory contrasted with the present.',themes:'Memory, loss, identity.'},
    {n:4,title:'First full depiction of the Ceremony',why:'Central dramatization of institutionalized reproductive control.',choices:'Flat, dissociated narration and ritualized language.',themes:'Gender, bodily control, dehumanization.',paper2:'Compare state control of women’s bodies with Persepolis.'},
    {n:5,title:'Discovery of the closet inscription',why:'Connects Offred to an unknown previous Handmaid and creates covert solidarity across time.',choices:'Discovered object / fragment as narrative device.',themes:'Resistance, memory, solidarity.'},
    {n:6,title:'Shopping dialogue with Ofglen',why:'Hints that resistance exists beneath ordinary routines.',choices:'Coded, guarded dialogue.',themes:'Resistance, surveillance, trust.'},
    {n:7,title:'Salvaging and Particicution ritual',why:'Shows how the regime channels violence through ordinary women and makes subjects participate in control.',choices:'Ritualized public violence and disturbing crowd dynamics.',themes:'Complicity, violence, control.',paper2:'Compare state-orchestrated group emotion with 1984.'},
    {n:8,title:'The Commander begins secret Scrabble meetings',why:'Reveals hypocrisy beneath official ideology and makes literacy itself intimate and subversive.',choices:'Quiet domestic scene; symbolic use of an ordinary game.',themes:'Language, hypocrisy, complicity.'},
    {n:9,title:'Offred and the Commander’s relationship deepens',why:'Complicates simple moral judgment and exposes the human desires inside institutional power.',choices:'Ambiguous, uneasy tone.',themes:'Complicity, power, intimacy.'},
    {n:10,title:'The Commander takes Offred to Jezebel’s',why:'Exposes elite hypocrisy: those enforcing puritanical rules privately violate them.',choices:'Dramatic irony and contrast between public ideology and hidden practice.',themes:'Hypocrisy, power, gender.'},
    {n:11,title:'Offred reunites with Moira at Jezebel’s',why:'Shows the limits of resistance and the emotional cost of prolonged control.',choices:'Bittersweet, restrained reunion.',themes:'Resistance, survival, loss.'},
    {n:12,title:'Serena Joy arranges Offred’s encounter with Nick',why:'Shows Serena operating inside and around rules for her own survival and interests.',choices:'Cold, transactional arrangement.',themes:'Complicity, irony, reproductive control.'},
    {n:13,title:'Offred’s relationship with Nick deepens',why:'Introduces vulnerability, desire, and hope into a narration dominated by caution.',choices:'Tender but uncertain tone.',themes:'Trust, hope, risk.'},
    {n:14,title:'Ofglen disappears',why:'Makes the danger and cost of organized resistance suddenly concrete.',choices:'Abrupt absence and withheld explanation.',themes:'Resistance, uncertainty, fear.'},
    {n:15,title:'Janine / Ofwarren’s baby is later judged nonviable',why:'Reveals the psychological and bodily toll of Gilead’s reproductive obsession.',choices:'Restrained aftermath rather than melodramatic explanation.',themes:'Gender, control, trauma.'},
    {n:16,title:'Serena Joy discovers evidence of Offred’s secret outings',why:'Brings hidden rule-breaking into confrontation and drives the novel toward its climax.',choices:'Confrontation scene and exposed secrecy.',themes:'Complicity, punishment, power.'},
    {n:17,title:'Offred is taken away in the van',why:'Withholds the information needed to decide whether this is arrest or rescue.',choices:'Deliberate narrative ambiguity.',themes:'Uncertainty, trust, hope, fear.',paper2:'Useful for comparing how endings offer or refuse closure.'},
    {n:18,title:'The Historical Notes begin',why:'Reframes the entire narrative as reconstructed historical testimony.',choices:'Metafictional frame shift and change of register.',themes:'Memory, storytelling, historical interpretation.'},
    {n:19,title:'Professor Pieixoto’s academic treatment of Offred',why:'Satirizes the distance that scholarship can create from lived suffering.',choices:'Ironic and joking academic register.',themes:'Memory, erasure, interpretation.',paper2:'Compare treatment of historical suffering and memory with Persepolis.'},
    {n:20,title:'Flashback to the coup and loss of women’s jobs / bank access',why:'Shows how rapidly legal and institutional rights can be removed.',choices:'Sudden systemic description embedded in personal memory.',themes:'Totalitarian control, gender, institutional power.',paper2:'Compare rapid institutional takeover with 1984.'}
  ],
  evidence:[
    {title:'Closet inscription',text:'Use the moment when Offred discovers a message left by a previous Handmaid. It supports arguments about private resistance, solidarity, memory, and how fragments can carry meaning across time.'},
    {title:'Offred reflects on her assigned name',text:'Use her early reflections on naming to analyze how Gilead erases individual identity by redefining women through ownership and social function.'},
    {title:'Historical Notes lecture',text:'Use Professor Pieixoto’s detached, joking academic tone to support arguments about memory, historical distance, whose voice receives authority, and the sanitizing of suffering.'}
  ],
  connections:[
    {theme:'Surveillance and control',with:'1984',similarity:'Both depict pervasive state surveillance that pressures people toward conformity.',difference:'Atwood’s system is explicitly gendered and reproductive, while Orwell’s is broader political and ideological control.',methods:'Ritual / euphemistic language and bodily regulation vs. Newspeak and Party surveillance.',why:'Lets you compare different mechanisms used to produce totalizing control.'},
    {theme:'State control of women’s bodies',with:'Persepolis',similarity:'Both show the state regulating women’s bodies, appearance, and behavior.',difference:'Atwood uses speculative systematic fiction; Satrapi presents lived memoir-based historical experience.',methods:'Ritualized dystopian fiction vs. autobiographical graphic memoir.',why:'Useful for comparing imagined extremity with documented experience of gendered control.'},
    {theme:'Individual vs. oppressive system',with:'The Stranger',similarity:'Both protagonists are shaped by forces that constrain or judge them.',difference:'Offred’s constraint is imposed by a totalitarian system; Meursault’s estrangement is more existential and self-generated.',methods:'Fragmented self-doubting narration vs. flat detached narration.',why:'Clarifies the difference between externally imposed and internally originating alienation.'},
    {theme:'Silenced or diminished women’s voices',with:'Carol Ann Duffy',similarity:'Both can reclaim voice for women reduced, erased, or defined through male-centered systems.',difference:'Atwood develops a sustained novel-length reconstruction; Duffy often works through compressed lyric or dramatic monologue.',methods:'Extended first-person narrative and frame vs. concentrated poetic voice.',why:'Shows how similar feminist concerns can be constructed at very different formal scales.'}
  ],
  arguments:[
    'Gilead’s control depends as much on euphemistic language as on physical force.',
    'The novel suggests that complicity and resistance often coexist within the same character rather than functioning as opposites.',
    'Offred’s self-doubting narration shows how trauma destabilizes memory without making her voice meaningless.',
    'The Historical Notes critique how future scholarship can sanitize documented suffering.',
    'Small private acts preserve selfhood under total institutional control.',
    'The ambiguous ending refuses to offer false comfort or certainty.',
    'Serena Joy’s entrapment in a system she helped support creates a specific irony about complicity.',
    'By repurposing familiar institutions, the novel suggests authoritarianism can emerge from within an ordinary society.',
    'The caste system among women shows oppression working through divisions among the oppressed, not only through top-down authority.',
    'Naming and renaming function as psychological tools of control over identity.'
  ],
  misunderstandings:[
    'Do not treat the novel as simply “about the future.” Its warning is constructed from historical precedents.',
    'Do not turn Offred into a conventional heroic rebel. Her ordinariness, passivity, compromises, and survival choices are central to the novel.',
    'Do not treat the Historical Notes as an optional appendix. They materially change the structure and meaning of the novel.',
    'Do not force the ending into “hopeful” or “bleak.” Its unresolved ambiguity is the structural point.'
  ],
  faqs:[
    {q:'Is Offred’s real name confirmed in the novel?',a:'No. The novel does not explicitly confirm a real name for Offred. Avoid presenting adaptation-based assumptions as textual fact.'},
    {q:'Should the Historical Notes be used in analysis?',a:'Yes. They are structurally and thematically important because they reframe the narrative and change how the reader thinks about evidence, memory, authority, and suffering.'},
    {q:'Can I use details from the TV adaptation in Paper 2 or the IO?',a:'Keep analysis grounded in the studied novel unless your teacher has explicitly assigned another text or adaptation as a separate work.'},
    {q:'Can I memorize these as exact quotations?',a:'No. LitLab paraphrases evidence points here. Verify any wording you plan to quote directly against your own assigned copy and edition.'}
  ]
};

export const bookProfiles:BookProfile[]=[handmaidsTale];
