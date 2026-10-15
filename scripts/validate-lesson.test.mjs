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
const result=await build({stdin:{contents:`export {default as LessonView} from './src/biology/learning/LessonView.tsx';export {default as TopicOverview} from './src/biology/components/TopicOverview.tsx';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,platform:'node',format:'esm',packages:'external',write:false,jsx:'automatic'});
await writeFile(out,result.outputFiles[0].text);
const {LessonView,TopicOverview}=await import(out.href);await unlink(out);
const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
const render=(lesson,t,level,mode,id)=>renderToStaticMarkup(createElement(LessonView,{lesson,topic:t,level,mode,hash:`#biology/topic/${t.id}/${mode}${id?'?understanding='+id:''}`}));
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
