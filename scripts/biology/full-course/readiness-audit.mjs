import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read=(path)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const registry=read('src/biology/curriculum/registry.json');
const catalog=read('src/biology/learning/catalog.json');
const ledger=read('docs/biology/full-course-integration/READINESS_LEDGER.json');
const ensure=(condition,message)=>assert.ok(condition,message);
ensure(Array.isArray(registry),'The biology registry must be a topic array');
assert.equal(registry.length,40,'Official syllabus topic registry must remain at 40');
const all=registry.flatMap(topic=>topic.understandings);
assert.equal(all.length,553,'Official registry must include 553 understandings');
assert.equal(all.filter(item=>item.level==='shared').length,337,'337 shared SL/HL understandings required');
assert.equal(all.filter(item=>item.level==='HL').length,216,'216 additional HL understandings required');
assert.equal(new Set(all.map(item=>item.id)).size,553,'Understanding IDs must be globally unique');
assert.equal(new Set(registry.map(t=>t.id)).size,40,'Topic IDs must be unique');
const registered=registry.filter(topic=>Boolean(topic.lessonId));
assert.equal(Object.keys(catalog).length,registered.length,'Catalog must equal actually registered lesson count');
const byId=new Map(all.map(u=>[u.id,u]));
let mapped=0, shared=0, hl=0;
for(const topic of registry){
  const ids=new Set(topic.understandings.map(u=>u.id));
  for(const understanding of topic.understandings){
    ensure(understanding.id.startsWith(topic.id+'.'),'Topic/understanding ID mismatch: '+understanding.id);
    ensure(understanding.studentTitle?.trim(),'Missing descriptive teaching heading: '+understanding.id);
  }
  if(!topic.lessonId){
    assert.equal(topic.availability,'planned','Unregistered topic cannot claim draft status: '+topic.id);
    continue;
  }
  ensure(topic.availability==='draft','Registered lesson is not a draft: '+topic.id);
  const entry=catalog[topic.lessonId];
  ensure(entry&&entry.topicId===topic.id,'Missing/mismatched catalog entry: '+topic.id);
  const file=resolve(root,'src/biology/learning',entry.path);
  ensure(existsSync(file),'Missing lesson JSON: '+file);
  const lesson=JSON.parse(readFileSync(file,'utf8'));
  assert.equal(lesson.topicId,topic.id,'Lesson/topic mismatch: '+topic.id);
  assert.equal(lesson.id,topic.lessonId,'Lesson/catalog ID mismatch: '+topic.id);
  const seen=[];
  for(const section of lesson.sections||[]){
    ensure(Array.isArray(section.understandingIds)&&section.understandingIds.length>0,'Unmapped section: '+section.id);
    ensure(typeof section.explanation==='string'&&section.explanation.trim().length>0,'Blank section: '+section.id);
    for(const id of section.understandingIds){
      ensure(ids.has(id),'Out-of-topic understanding: '+id);
      assert.equal(section.level,byId.get(id).level,'SL/HL scope mismatch: '+id);
      seen.push(id);
    }
  }
  assert.equal(seen.length,ids.size,'Section count mismatch: '+topic.id);
  assert.deepEqual([...seen].sort(),[...ids].sort(),'Understanding coverage mismatch: '+topic.id);
  for(const question of lesson.questions||[]){
    for(const id of question.understandingIds||[]){
      ensure(ids.has(id),'Assessment targets a different topic: '+question.id);
      assert.equal(question.level,byId.get(id).level,'Assessment SL/HL scope mismatch: '+question.id);
    }
    if(question.kind==='selection'){
      ensure(Array.isArray(question.options)&&question.options.length>=2,'Insufficient choices: '+question.id);
      assert.equal(question.options.filter(option=>option.correct===true).length,1,'Incorrect answer key: '+question.id);
      ensure(question.options.every(option=>typeof option.feedback==='string'&&option.feedback.trim()),'Missing answer feedback: '+question.id);
    }
  }
  mapped+=ids.size;
  shared+=topic.understandings.filter(u=>u.level==='shared').length;
  hl+=topic.understandings.filter(u=>u.level==='HL').length;
}
assert.equal(ledger.courseRegistry.topics,40);
assert.equal(ledger.courseRegistry.understandings,553);
assert.equal(ledger.courseRegistry.shared,337);
assert.equal(ledger.courseRegistry.hlOnly,216);
assert.equal(ledger.registeredDrafts.topics,registered.length,'Readiness ledger topic count drift');
assert.equal(ledger.registeredDrafts.understandings,mapped,'Readiness ledger understanding count drift');
assert.equal(ledger.registeredDrafts.shared,shared,'Readiness ledger shared count drift');
assert.equal(ledger.registeredDrafts.hlOnly,hl,'Readiness ledger HL count drift');
ensure(ledger.qualityGates.publicRelease==='NO-GO','Never auto-certify public release');
console.log(JSON.stringify({status:'PASS — technical mapping integrity only',registeredTopics:registered.length,registeredUnderstandings:mapped,shared,hl,unimplementedTopics:40-registered.length,scientificApproval:'NOT ASSESSED',publicRelease:'NO-GO'},null,2));
