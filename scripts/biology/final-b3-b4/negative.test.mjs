// Run with node --test scripts/biology/final-b3-b4/negative.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';
import {validateTopic} from '../themes-ab-final/validate.mjs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const d=load('src/biology/learning/transport/lesson.json');
const registry=load('src/biology/curriculum/registry.json').find(t=>t.id==='B3.2');
const manifest=load('docs/biology/theme-b/B3.2-manifest.json');
const topic={...registry,lessonId:d.id,understandings:registry.understandings.map(u=>({...u,studentTitle:manifest.titles.find(x=>x.id===u.id)?.studentTitle}))};
const copy=()=>structuredClone(d);
test('duplicate numbered understanding rejected',()=>{
 const bad=copy();bad.sections[1].understandingIds=[bad.sections[0].understandingIds[0]];
 assert.ok(validateLesson(bad,topic).length);
});
test('HL assessment leaking into shared understanding rejected',()=>{
 const bad=copy();bad.questions.find(q=>q.level==='HL').level='shared';
 assert.ok(validateLesson(bad,topic).length);
});
test('two correct MCQ options rejected',()=>{
 const bad=copy();bad.questions.find(q=>q.paper==='1A').options[1].correct=true;
 assert.ok(validateLesson(bad,topic).length);
});
test('source-claim drift rejected',()=>{
 const bad=copy();bad.sections[0].teachingBlocks[1].explanation+=' invented text';
 assert.ok(validateLesson(bad,topic).length);
});
test('missing heart asset rejected',()=>{
 const bad=copy();const a=bad.assets.find(a=>a.id==='b32-heart-frontal');a.src='/biology/transport/not-present.svg';
 assert.ok(validateTopic(topic,bad,src=>src!=='/biology/transport/not-present.svg').length);
});
test('ragged embedded scientific comparison rejected',()=>{
 const bad=copy();const v=bad.sections.find(s=>s.id==='b32-18').visuals[0];v.rows[0]=['Incomplete'];
 assert.ok(validateTopic(topic,bad,()=>true).length);
});
test('unanchored scientific comparison rejected',()=>{
 const bad=copy();bad.sections.find(s=>s.id==='b32-18').visuals[0].afterBlock=98;
 assert.ok(validateTopic(topic,bad,()=>true).length);
});
