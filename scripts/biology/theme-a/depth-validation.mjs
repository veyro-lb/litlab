// Theme A source-aligned depth gate. Checks are mechanical, not scientific certification.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';
const read = path => JSON.parse(readFileSync(new URL('../../../'+path, import.meta.url), 'utf8'));
const registry = read('src/biology/curriculum/registry.json');
const files = [
 ['A1.1','water',8,15],['A1.2','nucleic-acids',15,19],
 ['A2.1','origins-cells',9,18],['A2.2','cell-structure',14,21],
 ['A2.3','viruses',6,12],['A3.1','diversity-organisms',15,30],
 ['A3.2','classification-cladistics',9,18],
 ['A4.1','evolution-speciation',11,22],
 ['A4.2','conservation-biodiversity',8,17]
];
const generic = /^(Observe and define|Explain, evaluate and apply|Investigate a consequence|Mechanism and limitations|Biological reasoning example|Mechanism and interpretation|Apply it to an example|Mechanism and scientific limitations|Applied biological example|Ancestry and evidence|Interpret a case|Mechanism and qualifying evidence|A concrete biological example|Scientific mechanism, evidence and limits|Apply the evidence)$/;
let reviewed = 0;
for (const [topicId,slug,sectionsCount,questionsCount] of files) {
 const lesson=read('src/biology/learning/'+slug+'/lesson.json');
 const topic=registry.find(t=>t.id===topicId);
 assert.ok(topic,'missing registry topic '+topicId);
 assert.equal(lesson.topicId,topicId);
 assert.equal(lesson.sections.length,sectionsCount,topicId);
 assert.equal(lesson.questions.length,questionsCount,topicId);
 assert.deepEqual(lesson.sections.flatMap(s=>s.understandingIds),topic.understandings.map(u=>u.id),topicId+' understandings');
 assert.deepEqual(validateLesson(lesson,{...topic,lessonId:lesson.id}),[],topicId+' contract');
 for (const section of lesson.sections) {
  const id=section.understandingIds[0];
  const wordCount=section.teachingBlocks.map(b=>b.explanation).join(' ').trim().split(/\\s+/).length;
  assert.ok(wordCount>=150,id+' main reading shorter than 150 words: '+wordCount);
  assert.equal(section.teachingBlocks.map(b=>b.explanation).join('\\n\\n'),section.explanation,id+' teaching-block drift');
  assert.equal(section.claimReferences.map(x=>x.claim).join('\\n\\n'),section.explanation,id+' claim drift');
  assert.ok(section.teachingBlocks.every(b=>b.title.trim().length>5&&!generic.test(b.title)),id+' generic teaching heading');
  assert.equal(section.level,topic.understandings.find(u=>u.id===id).level,id+' scope');
  reviewed++;
 }
 console.log(topicId+': '+sectionsCount+' sections, '+questionsCount+' questions, all source-mapped reading blocks >=150 words');
}
assert.equal(reviewed,95,'full Theme A understanding count');
console.log('PASS: 95/95 Theme A understanding depth checks; all original section/question IDs verified against branch contract.');
