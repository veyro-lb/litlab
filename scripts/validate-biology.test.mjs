import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCurriculum} from './validate-biology.mjs';
const source=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8'));
test('source registry passes',()=>assert.deepEqual(validateCurriculum(source),[]));
for(const [name,mutate] of [
  ['duplicate topic',x=>x.push(structuredClone(x[0]))],
  ['missing statement',x=>x[0].understandings.pop()],
  ['duplicate statement',x=>x[0].understandings[1].id=x[0].understandings[0].id],
  ['incorrect theme',x=>x[0].theme='B'],
  ['HL statement exposed as shared',x=>x[0].understandings[6].level='shared'],
  ['bad source reference',x=>x[0].understandings[0].printedId='A1.2.1'],
  ['missing metadata',x=>delete x[0].questionReferences],
  ['Water missing lesson',x=>delete x[0].lessonId],
  ['Water called approved',x=>x[0].availability='approved'],
  ['unsupported lesson',x=>x[0].lessonId='fake-lesson'],
  ['wrong curriculum version',x=>x[0].version='2023'],
  ['false review status',x=>x[0].review='approved'],
])test(`rejects ${name}`,()=>{const data=structuredClone(source);mutate(data);assert.ok(validateCurriculum(data).length>0);});


const lessonCatalog=JSON.parse(await readFile(new URL('../src/biology/learning/catalog.json',import.meta.url),'utf8'));
const hasRegisteredEntry=(topic,catalog)=>Object.values(catalog).some(entry=>entry.topicId===topic.id);

/** Create a valid fixture with a genuinely unavailable topic, without relying on registry order.
 * In a future fully drafted 40-topic curriculum, simulate a planned topic by
 * removing one catalog entry and restoring the matching topic to planned.
 * The validator itself is unchanged: only the test fixture is transformed.
 */
function unregisteredTopicFixture({allTopicsDrafted=false}={}){
  const topics=structuredClone(source);
  const catalog=structuredClone(lessonCatalog);
  if(allTopicsDrafted){
    for(const topic of topics.filter(t=>t.availability==='planned')){
      const syntheticId='future-draft-'+topic.id.toLowerCase().replaceAll('.','-');
      assert.equal(catalog[syntheticId],undefined);
      topic.availability='draft';
      topic.lessonId=syntheticId;
      catalog[syntheticId]={topicId:topic.id,path:'./future/'+syntheticId+'/lesson.json'};
    }
    assert.equal(topics.some(t=>t.availability==='planned'),false);
    assert.deepEqual(validateCurriculum(topics,catalog),[],'Fully drafted fixture must first be valid');
  }
  let target=topics.find(t=>t.availability==='planned'&&!t.lessonId&&!hasRegisteredEntry(t,catalog));
  if(!target){
    // No genuinely planned topics remain: first restore one drafted topic to
    // a valid unregistered/planned state in this isolated synthetic fixture.
    target=topics.find(t=>t.availability==='draft'&&catalog[t.lessonId]?.topicId===t.id);
    assert.ok(target,'Expected a legitimately registered draft topic to convert');
    delete catalog[target.lessonId];
    delete target.lessonId;
    target.availability='planned';
  }
  assert.equal(hasRegisteredEntry(target,catalog),false);
  assert.equal(target.availability,'planned');
  assert.deepEqual(validateCurriculum(topics,catalog),[],'Baseline negative-test fixture must be valid');
  return {topics,catalog,target};
}

test('rejects unrelated topic given an unregistered/mismatched lesson',()=>{
  const {topics,catalog,target}=unregisteredTopicFixture();
  const unrelated=Object.entries(catalog).find(([,entry])=>entry.topicId!==target.id)?.[0];
  assert.ok(unrelated,'Expected an existing distinct lesson');
  target.lessonId=unrelated;
  assert.ok(validateCurriculum(topics,catalog).some(e=>e.includes(target.id)));
});
test('rejects unrelated topic made draft without a registered lesson',()=>{
  const {topics,catalog,target}=unregisteredTopicFixture();
  target.availability='draft';
  assert.ok(validateCurriculum(topics,catalog).some(e=>e.includes(target.id)));
});
test('rejects unsupported draft when there are no naturally planned topics left',()=>{
  const {topics,catalog,target}=unregisteredTopicFixture({allTopicsDrafted:true});
  target.availability='draft';
  assert.ok(validateCurriculum(topics,catalog).some(e=>e.includes(target.id)));
});
test('rejects a mismatched lesson ID in a fully drafted future registry',()=>{
  const {topics,catalog,target}=unregisteredTopicFixture({allTopicsDrafted:true});
  const unrelated=Object.entries(catalog).find(([,entry])=>entry.topicId!==target.id)?.[0];
  assert.ok(unrelated);
  target.availability='draft';
  target.lessonId=unrelated;
  assert.ok(validateCurriculum(topics,catalog).some(e=>e.includes(target.id)));
});
