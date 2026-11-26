import {bookProfiles, type BookProfile} from './books-data';
import {duffyCatalog, expandedDuffyGuides, worldsWife, worldsWifeReading} from './books-duffy-poems';

const duffy: BookProfile = {
  id: 'carol-ann-duffy',
  title: 'Carol Ann Duffy’s Poetry',
  author: 'Carol Ann Duffy',
  year: 'Multiple collections',
  form: 'Poetry and dramatic monologues',
  language: 'English',
  level: 'HL studied work',
  overview: 'Study all 30 poems in The World’s Wife in the order they appear in the Picador edition. Each guide explains a poetic technique through a specific moment and gives you a close-reading task with a PDF page reference.',
  context: 'Carol Ann Duffy is a Scottish poet who served as UK Poet Laureate from 2009 to 2019. In The World’s Wife, she revisits myths, scripture and literary history through the voices of women whose perspectives the familiar stories leave out.',
  poetry: {
    featuredCollection: worldsWife,
    catalog: duffyCatalog,
    sourceNote: 'The World’s Wife guides follow the annotated PDF of the 2017 Picador electronic edition. References use the page number shown in the PDF viewer. Other collections are available in the Collection filter.',
    sources: [
      {title: 'Scottish Poetry Library', url: 'https://www.scottishpoetrylibrary.org.uk/poet/carol-ann-duffy/'},
      {title: 'Picador · Collected Poems', url: 'https://www.panmacmillan.com/authors/carol-ann-duffy/collected-poems/9781447231752'},
      {title: 'The World’s Wife contents', url: 'https://drake.ecampus.com/worlds-wife-duffy-carol-ann/bk/9780330372213'},
      {title: 'Selected Poems contents', url: 'https://lackawanna.ecampus.com/selected-poems-carol-ann-duffy-duffy/bk/9780140587357'},
      {title: 'Feminine Gospels contents', url: 'https://lackawanna.ecampus.com/feminine-gospels-poems-national-carol-ann/bk/9780571211876'},
      {title: 'Poetry Foundation · Rapture', url: 'https://www.poetryfoundation.org/books/book-picks/1836765/rapture'},
      {title: 'OCR · Rapture selection', url: 'https://www.ocr.org.uk/Images/171203-specification-accredited-as-level-gce-english-language-and-literature-h074.pdf'},
      {title: 'Poetry Foundation · Warming Her Pearls', url: 'https://www.poetryfoundation.org/poems/56715/warming-her-pearls'},
      {title: 'Scottish Review of Books · The Bees', url: 'https://www.scottishreviewofbooks.org/2011/11/'},
      {title: 'Sincerity contents preview', url: 'https://books.google.com/books?id=ocZUDwAAQBAJ'},
      {title: 'Hachette · The Laughter of Stafford Girls’ High', url: 'https://magazines.hachettelearning.com/magazine/english-review/29/4/insights-whats-so-amusing/'},
      {title: 'Tim Scheffe · The Falling Soldier', url: 'https://zenodo.org/records/4166398'},
    ],
    practice: [
      {prompt: 'Which speaker repeatedly changes shape to get away from her pursuer?', options: ['Medusa', 'Thetis', 'Circe'], answer: 1, feedback: 'In Thetis, each new shape creates a different possibility for escape. Notice how each is met by a new way of capturing her.'},
      {prompt: 'Whose voice revisits a detail from Shakespeare’s will?', options: ['Miss Havisham', 'Medusa', 'Anne Hathaway'], answer: 2, feedback: 'Duffy gives Anne Hathaway a sonnet in which the bed becomes a place of shared intimacy and imagination.'},
      {prompt: 'Which poem uses needlework to explore the speaker’s creative independence?', options: ['Penelope', 'Mrs Faust', 'Mrs Midas'], answer: 0, feedback: 'Penelope continues threading her needle at the sound of returning footsteps. The action keeps attention on the work she has chosen.'},
      {prompt: 'Which speaker has already begun rebuilding her life when the person she mourned returns?', options: ['Medusa', 'Mrs Lazarus', 'Mrs Midas'], answer: 1, feedback: 'In Mrs Lazarus, the return interrupts a process of grief that has already changed what the speaker wants and needs.'},
    ],
  },
  characters: [
    {name: 'Women speaking back', role: 'Anne Hathaway, Mrs Lazarus and Medusa tell stories usually framed by someone else.', development: 'Anne reinterprets a detail from Shakespeare’s will, Mrs Lazarus questions what a return from death means for her, and Medusa speaks from inside her transformation.', themes: 'Voice, memory and the power to define a story.', methods: 'Dramatic monologue, allusion and a shift in whose experience the reader follows.'},
    {name: 'Speakers shaped by betrayal', role: 'Miss Havisham and Medusa describe what rejection feels like from inside their anger.', development: 'Havisham cannot leave the failed wedding behind. Medusa’s mounting suspicion reshapes how she sees the world and herself.', themes: 'Betrayal, rage and transformation.', methods: 'Fractured syntax, disturbing imagery and volatile shifts in tone.'},
    {name: 'People on the margins', role: 'The servant in Warming Her Pearls and the speaker in Stealing occupy different positions outside social power.', development: 'The servant’s private desire remains hidden inside a routine of service. The theft of a snowman briefly gives the speaker something to possess, then leaves the underlying isolation intact.', themes: 'Class, unspoken desire and alienation.', methods: 'First-person address, ordinary objects and the gap between public behavior and private feeling.'},
    {name: 'A professional witness', role: 'War Photographer follows a photojournalist as he processes images of conflict.', development: 'The darkroom ritual gives way to an intrusive memory, then the poem follows the images toward publication and the reader’s brief response.', themes: 'Witnessing, distance and responsibility.', methods: 'Third-person perspective, regular stanzas and contrasts between conflict zones and home.'},
    {name: 'A speaker seeking attention', role: 'The first-person speaker in Education for Leisure turns boredom and resentment into a claim to power.', development: 'The monologue escalates from ordinary details toward a threat that implicates the reader.', themes: 'Social neglect, alienation and violence.', methods: 'Plain diction, escalating actions and a shift into direct address.'},
  ],
  themes: [
    {name: 'Reclaiming silenced voices', appears: 'Anne Hathaway, Mrs Lazarus and Medusa foreground lives that familiar stories define through other people.', choices: 'Duffy keeps enough of the source story recognizable for the reader to hear what changes when a different person speaks.', interpretation: 'The poems ask who gets to decide which parts of a story matter.', compare: 'The Handmaid’s Tale'},
    {name: 'Unconventional love', appears: 'Valentine uses an onion as a love gift. The related poem Warming Her Pearls places desire inside a routine of domestic service.', choices: 'Extended metaphor and charged sensory details give ordinary objects an intimate meaning.', interpretation: 'Love can involve tenderness, discomfort and unequal power at the same time.'},
    {name: 'Violence and rejection', appears: 'Havisham and Medusa give anger a first-person voice. Education for Leisure links threatened violence to an isolated speaker’s desire for recognition.', choices: 'Duffy varies the delivery from fractured speech to unsettling calm.', interpretation: 'The monologues let readers examine what feeds destructive impulses while leaving the speakers’ claims open to scrutiny.', compare: 'Frankenstein'},
    {name: 'The ethics of witnessing', appears: 'War Photographer follows suffering as it moves from lived experience to a darkroom image and then to a newspaper.', choices: 'Changes in setting and tightly patterned stanzas emphasize the distance between photographer, subject and reader.', interpretation: 'Making suffering visible can draw attention to it while giving an audience the option to look away.', compare: 'Persepolis'},
    {name: 'Memory, loss and time', appears: 'Anne Hathaway revisits intimacy through memory. Mrs Lazarus traces grief beyond bereavement and into recovery.', choices: 'A reflective sonnet and a disrupted narrative give loss two different shapes.', interpretation: 'Memory can sustain an intimate bond. Time can also change what a grieving person wants from the future.'},
  ],
  symbols: [
    {title: 'The onion · Valentine', text: 'Its layers, sting and lingering scent give love a physical presence and complicate the expectations attached to a romantic gift.'},
    {title: 'Photographic negatives · War Photographer', text: 'The developing image turns an experience of suffering into something an editor can select and a distant audience can see.'},
    {title: 'The remembered bed · Anne Hathaway', text: 'Duffy turns a detail from Shakespeare’s will into an image of the couple’s shared intimacy and imagination.'},
    {title: 'The snowman · Stealing', text: 'The stolen object offers a brief feeling of control. Its eventual destruction exposes how little satisfaction the theft gives the speaker.'},
  ],
  motifs: [
    {title: 'Direct address', text: 'An implied listener gives the speaker someone to persuade, confront or invite closer. Notice who is addressed and when that changes.'},
    {title: 'Everyday objects and unsettling images', text: 'Familiar objects ground the poems in ordinary experience. When their associations shift, they make emotions feel newly physical.'},
    {title: 'Inherited stories', text: 'Myth, scripture and literary history give readers familiar points of reference that Duffy can rework through a change in perspective.'},
  ],
  choices: [
    {title: 'Dramatic monologue', text: 'A constructed speaker reveals attitudes and blind spots through how they tell their story. Compare what the speaker thinks they are showing with what a reader might infer.'},
    {title: 'Extended metaphor', text: 'In Valentine each new property of the onion adds a different quality to the poem’s idea of intimacy.'},
    {title: 'Conversational diction', text: 'The everyday vocabulary of Stealing and Education for Leisure makes their more unsettling ideas arrive in a voice that sounds familiar.'},
    {title: 'Reworking the sonnet', text: 'Anne Hathaway uses a form associated with Shakespeare and love poetry to give Anne control of how the relationship is remembered.'},
    {title: 'Allusion and intertextuality', text: 'Havisham draws on Great Expectations, while Mrs Lazarus changes the focus of a biblical story. Identify which part of the inherited story Duffy brings forward.'},
  ],
  voice: 'Distinguish the poet from her speakers. Havisham and Medusa expose their own preoccupations through first-person speech, while War Photographer uses a third-person perspective closely aligned with the photographer’s experience.',
  structure: 'Compare the compressed sonnet of Anne Hathaway, the four regular stanzas of War Photographer and the shifts in stanza and line length in Valentine. Track how a turn, interruption or closing image changes the expectation set up at the start.',
  setting: 'The darkroom in War Photographer creates physical distance from the conflict zones while allowing memory to return. The remembered bed in Anne Hathaway makes intimacy accessible through a private space. An implied setting can matter too, such as the distance between speaker and listener in Valentine.',
  moments: [
    {n: 1, title: 'Valentine', collection: 'Mean Time', themes: 'Intimacy · Honesty · Possession', why: 'An unnamed speaker offers a lover an onion. The gift leads from closeness to tears and finally to a threatening image, complicating the promise of intimacy.', choices: 'Extended metaphor, direct address, brief lines and a shift in tone.', paper2: 'Trace how ordinary objects acquire meanings that complicate conventional ideas about love.'},
    {n: 2, title: 'War Photographer', collection: 'Standing Female Nude', themes: 'Witnessing · Memory · Distance', why: 'A photojournalist processes photographs of conflict in a darkroom. The poem moves from his careful work to the choices made by editors and the brief attention of readers.', choices: 'Four regular six-line stanzas, close third-person perspective and contrasts between the darkroom, conflict zones and home.', paper2: 'Compare the photographer’s mediation of suffering with Satrapi’s use of first-person visual memoir in Persepolis.'},
    {n: 3, title: 'Havisham', collection: 'Mean Time', themes: 'Betrayal · Rage · Grief', why: 'Dickens’s Miss Havisham speaks in her own voice. Desire and hostility repeatedly surface together, keeping the wedding’s aftermath present in her thoughts.', choices: 'Dramatic monologue, compressed oppositions, disruptive line breaks and violent imagery.', paper2: 'Compare how Duffy and Shelley make the aftermath of rejection available through a speaker’s own account.'},
    {n: 4, title: 'Anne Hathaway', collection: 'The World’s Wife', themes: 'Voice · Intimacy · Memory', why: 'Shakespeare’s wife remembers their intimacy through the bed he left her. The poem gives her the authority to say what that object means.', choices: 'Sonnet form, theatrical and literary imagery, and a closing couplet that concentrates the poem’s treatment of memory.', paper2: 'Compare the authority of Anne’s retrospective voice with Offred’s act of telling her own story in The Handmaid’s Tale.'},
    {n: 5, title: 'Mrs Lazarus', collection: 'The World’s Wife', themes: 'Grief · Recovery · Time', why: 'Lazarus’s wife gradually rebuilds her life. His return interrupts the future she has begun to imagine, making the celebrated miracle unsettling from her perspective.', choices: 'Dramatic monologue, biblical allusion and a structural reversal after the passage of time.', paper2: 'Compare works that change the meaning of a familiar public story by foregrounding its private consequences.'},
    {n: 6, title: 'Medusa', collection: 'The World’s Wife', themes: 'Jealousy · Betrayal · Monstrosity', why: 'Medusa describes a transformation bound up with jealousy and suspicion. Her account invites sympathy while leaving room to question how she interprets events.', choices: 'First-person monologue, escalating images of petrification and direct address.', paper2: 'Compare how Duffy and Shelley use the voice of a feared figure to complicate a reader’s judgment.'},
    {n: 7, title: 'Education for Leisure', collection: 'Standing Female Nude', themes: 'Alienation · Neglect · Violence', why: 'A disaffected speaker looks for recognition and control. The escalation and closing address make the reader feel less safely distant from the threat.', choices: 'Plain first-person diction, escalation and a closing shift toward the listener.', paper2: 'Compare how an unsettling voice affects the reader’s understanding of alienation in The Stranger.'},
    {n: 8, title: 'Stealing', collection: 'Selling Manhattan', themes: 'Alienation · Possession · Destruction', why: 'A speaker recalls stealing a snowman. The theft offers a brief sense of control, and what follows shows how little that control changes.', choices: 'Conversational confession, direct address, an unusual central object and irony.', paper2: 'Compare how Duffy and Camus use detached or evasive speakers to unsettle judgments about motive.'},
    ...expandedDuffyGuides,
  ],
  evidence: [
    {title: 'Valentine · The last turn', text: 'Locate the shift from presenting the onion as a gift to imagery of danger and persistence. Explain what this does to the tone of the address.'},
    {title: 'War Photographer · The developing image', text: 'Locate the moment when an image brings a particular death back into the darkroom. Connect the return of memory to the controlled stanza form.'},
    {title: 'Anne Hathaway · The closing couplet', text: 'Locate the return to the remembered bed near the end. Explain how the sonnet lets Anne determine what the bequest means.'},
  ],
  connections: [
    {theme: 'Reclaiming silenced women’s voices', with: 'The Handmaid’s Tale', similarity: 'Anne Hathaway and Offred claim authority over stories that others can interpret for them.', difference: 'Duffy concentrates Anne’s memory of intimacy in a sonnet. Atwood follows Offred’s voice across a novel and reframes it in the Historical Notes.', methods: 'Lyric persona and sonnet form alongside fragmented first-person narration and a framing section.', why: 'Compare how each form gives a woman authority over her story and where that authority remains vulnerable.'},
    {theme: 'Rejection and violence', with: 'Frankenstein', similarity: 'Medusa, Havisham and the Creature describe exclusion or rejection from inside their own experience.', difference: 'Duffy concentrates distress in compressed monologues. Shelley lets the Creature recount a sequence of encounters inside a framed narrative.', methods: 'Transformation imagery and fractured syntax alongside embedded first-person narration.', why: 'Compare how each writer invites sympathy while leaving the reader room to question the speaker’s choices.'},
    {theme: 'Witnessing suffering', with: 'Persepolis', similarity: 'Both show how selected images shape a distant audience’s understanding of violence.', difference: 'Duffy follows a professional witness whose photographs circulate through the press. Satrapi depicts events she experienced and stories she received from others.', methods: 'Shifts between darkroom, memory and readership alongside panel selection, visual contrast and the child’s perspective.', why: 'The comparison can show how the medium and the witness’s position affect what an audience sees.'},
    {theme: 'Social alienation', with: 'The Stranger', similarity: 'Stealing and Education for Leisure make readers encounter people whose voices unsettle ordinary expectations about behavior and motive.', difference: 'Duffy builds an immediate relationship between a speaker and implied listener. Camus develops Meursault’s detachment over a longer narrative and shows society judging it at trial.', methods: 'Direct address and compressed monologue alongside restrained first-person prose and a trial narrative.', why: 'Compare how each form shapes who gets to interpret the speaker’s behavior.'},
  ],
  arguments: [
    'By turning inherited stories into dramatic monologues, Duffy gives figures such as Medusa and Mrs Lazarus control over what the reader sees and whose losses count.',
    'The movement from ordinary speech to threatening imagery in Education for Leisure links social invisibility to a desire for recognition and control.',
    'In Stealing, a conversational tone makes the gap between the speaker’s claimed motives and the emptiness of the act more visible.',
    'The sonnet in Anne Hathaway gives a woman usually known through her husband’s biography the authority of a love poet.',
    'War Photographer uses formal order to expose the gap between professional control and the experiences that return through memory.',
    'Valentine uses the onion’s changing associations to make tenderness and danger part of the same account of intimacy.',
    'Mrs Lazarus shifts attention from the celebrated return to the grieving person who has had to live through the absence.',
    'Late turns in poems such as Valentine and Education for Leisure force the reader to reconsider what appeared to be an ordinary address.',
  ],
  misunderstandings: [
    'Treating every first-person voice as Duffy herself. Identify the speaker, the situation and the implied listener before making a claim.',
    'Equating conversational language with simple meaning. Examine what happens when plain diction meets intense imagery.',
    'Summarizing the source myth and stopping there. Explain what changes when a different person tells the story.',
    'Applying one account of form or tone to all the poems. Compare the formal pattern and shifts within each poem.',
  ],
  faqs: [
    {q: 'How much of the original myth or story do I need?', a: 'Know enough to explain what Duffy changes. For Medusa, start with the mythic association with petrification, then explain what hearing her perspective adds.'},
    {q: 'Which poems should I use in Paper 2?', a: 'Work from the selection assigned by your teacher. Choose poems that let you analyze a specific method and answer the question, then compare with another work you studied.'},
    {q: 'Where can I check the exact wording?', a: 'Use your assigned anthology or edition. The evidence anchors point you to moments and techniques you can locate in the text.'},
  ],
};

duffy.moments = duffy.moments.map(moment => {
  const reading = moment.collection === worldsWife ? worldsWifeReading.get(moment.title) : undefined;
  return reading ? {...moment, reading} : moment;
});

if (!bookProfiles.some(profile => profile.id === duffy.id)) bookProfiles.push(duffy);
