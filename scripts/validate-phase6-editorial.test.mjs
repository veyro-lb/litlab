import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPhase6Lessons,validateEditorialLesson} from './validate-phase6-editorial.mjs';
const [a,c]=await readPhase6Lessons();
const copy=x=>structuredClone(x);
const section=(lesson,id)=>lesson.sections.find(s=>s.understandingIds.includes(id));
test('A1.2 and C1.1 have consistent, unique causal feedback between Learn and Practice',()=>{
 assert.deepEqual(validateEditorialLesson(a),[]);
 assert.deepEqual(validateEditorialLesson(c),[]);
});
test('negative: section/practice answer divergence is rejected',()=>{
 const x=copy(c); section(x,'C1.1.17').interactions[0].options[0].feedback='Changed to contradict practice';
 assert.ok(validateEditorialLesson(x).some(e=>e.includes('Learn/Practice copies disagree')));
});
test('negative: duplicated distractor feedback is rejected',()=>{
 const x=copy(a),q=x.questions.find(q=>q.understandingIds.includes('A1.2.8')&&q.paper==='1A');
 q.options[1].feedback=q.options[0].feedback;
 assert.ok(validateEditorialLesson(x).some(e=>e.includes('duplicated feedback')));
});
test('negative: wrong answer-key cardinality is rejected',()=>{
 const x=copy(c),q=x.questions.find(q=>q.understandingIds.includes('C1.1.17')&&q.paper==='1A');
 q.options[1].correct=true;
 assert.ok(validateEditorialLesson(x).some(e=>e.includes('expected exactly one')));
});
test('negative: superficial mechanism-step guidance is rejected',()=>{
 const x=copy(a);section(x,'A1.2.8').mechanismChallenge.stages[0].explanation='Correct';
 assert.ok(validateEditorialLesson(x).some(e=>e.includes('mechanism lacks actionable')));
});
test('PBP resistance task distinguishes altered target from drug destruction and exposure',()=>{
 const q=c.questions.find(q=>q.paper==='1A'&&q.understandingIds.includes('C1.1.17'));
 assert.match(q.prompt,/target/i);
 assert.match(q.options.find(o=>o.correct).text,/penicillin-binding protein/i);
 const incorrect=q.options.filter(o=>!o.correct).map(o=>o.text).join(' ');
 assert.match(incorrect,/β-lactamase/i);
 assert.match(incorrect,/porin/i);
 assert.match(incorrect,/efflux/i);
 assert.doesNotMatch(incorrect,/collagen|enzyme to ATP/i);
});
test('A1.2 transcription activity explains both strand roles and opposite directionality',()=>{
 const stages=section(a,'A1.2.8').mechanismChallenge.stages;
 assert.match(stages[0].options.find(o=>o.id==='b').feedback,/coding DNA strand/);
 assert.match(stages[1].explanation,/3′→5′/);
 assert.match(stages[1].explanation,/5′→3′/);
});
