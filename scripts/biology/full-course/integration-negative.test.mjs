import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const registry=read('src/biology/curriculum/registry.json');
const catalog=read('src/biology/learning/catalog.json');
const ledger=read('docs/biology/full-course-integration/READINESS_LEDGER.json');
const registered=registry.filter(t=>t.lessonId);
const examples=new Map(registered.map(t=>[t.id,{topic:t,lesson:read('src/biology/learning/'+catalog[t.lessonId].path.slice(2))}]));

test('IB course preserves the full registry while checking exact draft coverage against the evidence ledger',()=>{
  assert.equal(registry.length,40);
  const all=registry.flatMap(t=>t.understandings);
  assert.equal(all.length,553);
  assert.equal(all.filter(u=>u.level==='shared').length,337);
  assert.equal(all.filter(u=>u.level==='HL').length,216);
  assert.equal(new Set(all.map(u=>u.id)).size,553);
  assert.equal(registered.length,ledger.registeredDrafts.topics);
  const missing=registry.filter(t=>!t.lessonId);
  assert.deepEqual(missing.map(t=>t.id),ledger.plannedTopics.map(t=>t.id));
  assert.ok(missing.every(t=>t.availability==='planned'));
  assert.equal(Object.keys(catalog).length,registered.length);
  assert.equal(ledger.registeredDrafts.topics,registered.length);
  assert.equal(ledger.registeredDrafts.understandings,registered.reduce((n,t)=>n+t.understandings.length,0));
  assert.equal(ledger.registeredDrafts.shared,registered.flatMap(t=>t.understandings).filter(u=>u.level==='shared').length);
  assert.equal(ledger.registeredDrafts.hlOnly,registered.flatMap(t=>t.understandings).filter(u=>u.level==='HL').length);
  assert.equal(ledger.qualityGates.publicRelease,'NO-GO');
});

test('every imported topic validates source references, teaching titles, assessments, levels and visible asset files',()=>{
  const observed=new Set();
  for(const {topic,lesson} of examples.values()){
    assert.equal(topic.availability,'draft');
    assert.equal(lesson.topicId,topic.id);
    assert.deepEqual(validateLesson(lesson,topic),[],topic.id);
    for(const u of topic.understandings){
      assert.ok(u.studentTitle?.trim(),u.id);
      assert.ok(!observed.has(u.id),u.id);observed.add(u.id);
    }
    assert.equal(lesson.review.reviewer,null,topic.id+' must not invent expert approval');
    for(const asset of lesson.assets)for(const src of [asset.src,asset.recallSrc,asset.mobileSrc,asset.recallMobileSrc].filter(Boolean)){
      assert.match(src,/^\/biology\/[a-z0-9-]+\/[a-z0-9-]+\.(svg|jpg|png|webp)$/);
      assert.ok(existsSync(new URL('public'+src,root)),topic.id+' '+src);
      assert.ok(asset.permissionEvidence&&asset.license&&asset.alt,topic.id+' '+asset.id);
    }
  }
  assert.equal(observed.size,registered.flatMap(t=>t.understandings).length);
});

test('negative gate catches HL leakage, broken keyed answers and missing teaching',()=>{
  const {topic,lesson}=examples.get('A2.1');
  const leaked=structuredClone(lesson);leaked.sections[0].level='shared';
  assert.ok(validateLesson(leaked,topic).some(e=>e.includes('Scope mismatch')));
  const broken=structuredClone(lesson);broken.sections.pop();
  assert.ok(validateLesson(broken,topic).some(e=>e.includes('coverage')));
  const answer=structuredClone(lesson);
  const question=answer.questions.find(q=>q.kind==='selection');
  assert.ok(question&&question.options.length>=2);
  const correct=question.options.findIndex(o=>o.correct);
  question.options[(correct+1)%question.options.length].correct=true;
  assert.ok(validateLesson(answer,topic).some(e=>e.includes('Invalid selection')));
});
