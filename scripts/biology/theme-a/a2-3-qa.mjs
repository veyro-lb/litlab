import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../../../'+p,import.meta.url),'utf8'));
const d=load('src/biology/learning/viruses/lesson.json');const t=load('src/biology/curriculum/registry.json').find(t=>t.id==='A2.3');const rt={...t,lessonId:d.id};
assert.equal(t.availability,'planned');assert.equal(d.sections.length,6);assert.equal(d.questions.length,12);assert.deepEqual(d.sections.map(x=>x.understandingIds[0]),t.understandings.map(x=>x.id));assert.deepEqual(validateLesson(d,rt),[]);
for(const mutate of [d=>{d.sections[0].level='shared'},d=>{d.sections.pop()},d=>{d.sections[1].claimReferences=[]},d=>{d.questions[0].options[1].correct=true},d=>{d.assets[0].license=''}]){const bad=structuredClone(d);mutate(bad);assert.ok(validateLesson(bad,rt).length>0)}
console.log('A2.3 positive and five negative checks passed');
