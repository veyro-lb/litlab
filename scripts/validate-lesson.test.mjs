import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {build} from 'esbuild';
import {validateLesson} from './validate-lesson.mjs';
import {water} from './validate-water.mjs';
const registry=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8'));
const topic=registry.find(t=>t.id==='A1.1');
test('generic contract validates actual Water against registry',()=>assert.deepEqual(validateLesson(water,topic),[]));
for(const [name,change] of [
 ['schema version',d=>d.schemaVersion=2],['wrong topic',d=>d.topicId='B1.1'],
 ['duplicate coverage',d=>d.sections[1].understandingIds=['A1.1.1']],
 ['independent section title',d=>d.sections[0].title='Drift'],
 ['wrong recall mapping',d=>d.sections[0].recall[0].understandingIds=['A1.1.8']],
 ['wrong explanation return',d=>d.questions[0].sectionId='water-8'],
 ['blocks differ from claims',d=>d.sections[5].teachingBlocks[0].explanation='Different'],
 ['unknown enrichment evidence',d=>d.sections[5].enrichment.referenceIds=['missing']],
 ['blank explorer prediction',d=>d.sections[3].explorer.prompt=''],
 ['unqualified approval',d=>d.review={...d.review,status:'approved'}],
 ['HL figure leakage',d=>d.assets[0].level='HL'],
 ['missing asset caption',d=>delete d.assets[0].captionTitle],
 ['empty section list',d=>d.sections=[]],
 ['invalid table width',d=>d.questions.find(q=>q.data).data.rows[0].pop()]
])test('generic contract rejects '+name,()=>{const d=structuredClone(water);change(d);assert.ok(validateLesson(d,topic).length)});
test('missing display title rejected at registry boundary',()=>{const t=structuredClone(topic);delete t.understandings[0].studentTitle;assert.ok(validateLesson(water,t).some(e=>e.includes('display title')))});
// Non-public hypothetical topic: intentionally synthetic teaching text, never registered or shipped.
const fixtureTopic={...topic,id:'B1.9',title:'Synthetic renderer fixture',lessonId:'synthetic-test-only',understandings:[1,2,3].map(i=>({id:`B1.9.${i}`,studentTitle:`Synthetic understanding ${i}`,level:i===3?'HL':'shared'}))};
const fixture={...structuredClone(water),id:fixtureTopic.lessonId,topicId:fixtureTopic.id,title:fixtureTopic.title,assets:[],questions:[],sections:[]};
fixture.sections=[1,2,3].map(i=>({id:`fixture-${i}`,understandingIds:[`B1.9.${i}`],level:i===3?'HL':'shared',guidingQuestion:'What does this synthetic fixture exercise?',explanation:'Synthetic content for renderer validation only.',revisionSummary:'Synthetic summary only.',terms:['Fixture: test-only data'],workedExample:'A renderer dry run, not a Biology lesson.',misconceptions:[{misconception:'This is a real lesson.',correction:'It is never registered.'}],claimReferences:[{claim:'Synthetic content for renderer validation only.',referenceIds:['bio-water']}],referenceIds:['bio-water'],assets:[],guidePage:1,pdfPage:1,interactions:[{kind:'selection',id:`fc-${i}`,prompt:'Synthetic check',understandingIds:[`B1.9.${i}`],options:[{id:'a',text:'Fixture',correct:true,feedback:'Test only.'}]}],recall:[{kind:'recall',id:`fr-${i}`,prompt:'Synthetic recall',answer:'Test only.',understandingIds:[`B1.9.${i}`]}]}));
fixture.questions=fixture.sections.map((s,i)=>({id:`fq-${i}`,kind:'selection',paper:'1A',original:true,understandingIds:s.understandingIds,level:s.level,sectionId:s.id,prompt:'Synthetic test question',marks:1,referenceIds:['bio-water'],options:['a','b','c','d'].map(id=>({id,text:`Synthetic ${id}`,correct:id==='a',feedback:'Test only.'}))}));
test('synthetic three-understanding topic validates without Water IDs',()=>assert.deepEqual(validateLesson(fixture,fixtureTopic),[]));
// Compile the real TSX renderer with the existing build dependency; no browser or additional dependency.
const out=new URL(`.lesson-render-${process.pid}.mjs`,import.meta.url);
const result=await build({stdin:{contents:`export {default as LessonView} from './src/biology/learning/LessonView.tsx';export {saveStudy} from './src/biology/learning/content.ts';export {default as TopicOverview} from './src/biology/components/TopicOverview.tsx';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'esm',packages:'external',write:false,jsx:'automatic'});
await writeFile(out,result.outputFiles[0].text);
const {LessonView,TopicOverview,saveStudy}=await import(out.href);await unlink(out);
const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
const render=(lesson,t,level,mode,id,phase=0)=>{const section=lesson.sections.find(s=>s.understandingIds.includes(id))??lesson.sections[0];saveStudy(lesson.id,{answers:{},drafts:{[section.id+':phase']:String(phase)},revealed:{},labels:true,sectionId:section.id});return renderToStaticMarkup(createElement(LessonView,{lesson,topic:t,level,mode,hash:`#biology/topic/${t.id}/${mode}${id?'?understanding='+id:''}`}))};
test('actual Learn and Revision headings use exact registry IDs and titles for all eight',()=>{
 for(const mode of ['learn','revision'])for(const u of topic.understandings){const html=render(water,topic,'HL',mode,u.id);assert.ok(html.includes(`data-understanding-id="${u.id}"`));assert.ok(html.includes(`<b>${u.id}</b>`));assert.ok(html.includes(u.studentTitle.replaceAll('&','&amp;')))}
 const overview=renderToStaticMarkup(createElement(TopicOverview,{topic,level:'HL'}));for(const u of topic.understandings)assert.ok(overview.includes(`understanding=${u.id}`));
});
test('actual SL markup excludes HL-only sections and assessments',()=>{for(const mode of ['learn','revision','practice']){const html=render(water,topic,'SL',mode);assert.ok(!html.includes('data-syllabus-id="A1.1.7"'));assert.ok(!html.includes('data-syllabus-id="A1.1.8"'));assert.ok(!html.includes('data-question-id="p1a-7"'))}});
test('synthetic real renderer supports 3 sections, study modes and scoped practice',()=>{
 for(const mode of ['learn','revision','practice','sources']){const html=render(fixture,fixtureTopic,'HL',mode,'B1.9.2');assert.ok(html.includes('Synthetic renderer fixture'));assert.ok(!html.includes('biology/topic/A1.1'));if(mode!=='sources')assert.ok(html.includes('B1.9.2'))}
 assert.ok(!render(fixture,fixtureTopic,'SL','learn').includes('data-syllabus-id="B1.9.3"'));
});
test('synthetic all-HL topic validates and renders in HL',()=>{const t=structuredClone(fixtureTopic),d=structuredClone(fixture);t.level='HL';t.understandings.forEach(u=>u.level='HL');d.sections.forEach(s=>s.level='HL');d.questions.forEach(q=>q.level='HL');assert.deepEqual(validateLesson(d,t),[]);assert.ok(render(d,t,'HL','learn').includes('ADDITIONAL HL'));assert.ok(render(d,t,'SL','learn').includes('This topic is HL only'))});

test('progressive Water teaching steps remain evidence-mapped and appear as readable headings',()=>{
 for(const s of water.sections){
  assert.ok(s.teachingBlocks?.length>=3,`${s.understandingIds[0]} needs distinct teaching steps`);
  assert.equal(s.teachingBlocks.map(x=>x.explanation).join('\n\n'),s.explanation);
  const html=render(water,topic,'HL','learn',s.understandingIds[0],1);
  for(const block of s.teachingBlocks)assert.ok(html.includes(block.title.replaceAll('&','&amp;')),`Missing ${block.title}`);
 }
});
test('reading is visible and optional authored support has keyboard-native controls',()=>{
 for(const id of ['A1.1.2','A1.1.4','A1.1.5','A1.1.6']){
  const s=water.sections.find(x=>x.understandingIds.includes(id));
  assert.ok(s.explorer?.prompt?.trim());
  const html=render(water,topic,'HL','learn',id);
  assert.ok(html.includes('Need this explained more simply?'));
  assert.ok(html.includes('Choose explanation support'));
  assert.ok(html.includes('Simplify this'));
  assert.ok(!html.includes('bio-learning-step'));
  for(const b of s.teachingBlocks)assert.ok(html.includes(b.explanation.replaceAll('&','&amp;').replaceAll('>','&gt;').replaceAll('<','&lt;').replaceAll('\"','&quot;').replaceAll("'",'&#x27;')));
 }
});
test('an HL-only or unknown deep link cannot reveal an SL practice target',()=>{
 const hl=render(water,topic,'SL','practice','A1.1.8');
 assert.ok(!hl.includes('Targeting A1.1.8'));
 assert.ok(!hl.includes('data-syllabus-id="A1.1.8"'));
 const invalid=render(water,topic,'SL','practice','A1.1.999');
 assert.ok(!invalid.includes('Targeting A1.1.999'));
});

// Reusable challenge contract: validate both valid and deliberately malformed stages.
const challenge={title:'Synthetic mechanism',instructions:'Predict what happens.',stages:[1,2].map(i=>({id:'s'+i,prompt:'Predict step '+i,explanation:'Step explained.',options:['a','b','c'].map((id,j)=>({id,text:'Choice '+id,correct:j===0,feedback:'Because of the model.'}))}))};
test('generic reusable mechanism challenge validates',()=>{const d=structuredClone(water);d.sections[0].mechanismChallenge=structuredClone(challenge);assert.deepEqual(validateLesson(d,topic),[])});
test('mechanism rejects two correct predictions',()=>{const d=structuredClone(water);d.sections[0].mechanismChallenge=structuredClone(challenge);d.sections[0].mechanismChallenge.stages[0].options[1].correct=true;assert.ok(validateLesson(d,topic).some(x=>x.includes('Invalid mechanism stage')))});
test('mechanism rejects missing stage feedback',()=>{const d=structuredClone(water);d.sections[0].mechanismChallenge=structuredClone(challenge);d.sections[0].mechanismChallenge.stages[1].options[2].feedback='';assert.ok(validateLesson(d,topic).some(x=>x.includes('Invalid mechanism stage')))});

for(const slug of ['carbohydrates-lipids','proteins']){
 const d=JSON.parse(await readFile(new URL('../src/biology/learning/'+slug+'/lesson.json',import.meta.url),'utf8'));
 const t=registry.find(x=>x.id===d.topicId);
 test('Phase 4 actual '+t.id+' headings and scope in Learn, Revision and targeted Practice',()=>{
  for(const u of t.understandings){
   for(const mode of ['learn','revision']){const html=render(d,t,'HL',mode,u.id);assert.ok(html.includes(`data-understanding-id="${u.id}"`));assert.ok(html.includes(u.studentTitle.replaceAll('&','&amp;')))}
   if(u.level==='HL')for(const mode of ['learn','revision','practice'])assert.ok(!render(d,t,'SL',mode,u.id).includes(`data-syllabus-id="${u.id}"`));
  }
 });
}

for(const stages of [{bad:true},[null,null]])test('mechanism rejects malformed stages '+JSON.stringify(stages),()=>{const d=structuredClone(water);d.sections[0].mechanismChallenge={...structuredClone(challenge),stages};assert.ok(validateLesson(d,topic).some(x=>x.includes('Invalid mechanism')))});

for(const slug of ['carbohydrates-lipids','proteins']){
 const d=JSON.parse(await readFile(new URL('../src/biology/learning/'+slug+'/lesson.json',import.meta.url),'utf8'));const t=registry.find(x=>x.id===d.topicId);
 test('visible answer letters follow option order without changing internal IDs: '+t.id,()=>{
  const html=render(d,t,'HL','practice');
  for(const q of d.questions.filter(q=>q.options)){
   const body=html.split(`data-question-id="${q.id}"`)[1].split('</fieldset>')[0];
   q.options.forEach((o,i)=>{const encoded=renderToStaticMarkup(createElement('span',null,o.text)).slice(6,-7);assert.ok(body.includes(`<b>${String.fromCharCode(65+i)}.</b> ${encoded}`));assert.ok(body.includes(`value="${o.id}"`))});
  }
 });
}

for(const [name,mutate] of [
 ['empty simpler explanation',d=>d.sections[0].support.simple=''],
 ['no matching keywords',d=>d.sections[0].support.concepts[0].keywords=[]],
 ['out-of-range figure placement',d=>d.sections[1].figurePlacements[0].afterBlock=99],
 ['unmapped figure placement',d=>d.sections[1].figurePlacements[0].assetId='missing']
])test('authored reading contract rejects '+name,()=>{const d=structuredClone(water);mutate(d);assert.ok(validateLesson(d,topic).length)});
for(const entry of Object.values(JSON.parse(await readFile(new URL('../src/biology/learning/catalog.json',import.meta.url),'utf8')))){
 const d=JSON.parse(await readFile(new URL('../src/biology/learning/'+entry.path.slice(2),import.meta.url),'utf8'));const t=registry.find(t=>t.id===d.topicId);
 test(d.topicId+' full scientific prose renders without opening teaching panels',()=>{
  for(const section of d.sections){const html=render(d,t,'HL','learn',section.understandingIds[0]);for(const block of section.teachingBlocks){const encoded=renderToStaticMarkup(createElement('p',null,block.explanation)).slice(3,-4);assert.ok(html.includes(encoded),section.understandingIds[0]+' hidden or missing prose')};assert.ok(!html.includes('bio-learning-step'));assert.ok(!html.includes('bio-phase-nav'));assert.ok(html.includes('Need this explained more simply?'))}
 });
}
