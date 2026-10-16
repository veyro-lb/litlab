import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateWater,water} from './validate-water.mjs';
test('complete source-checked draft passes',()=>assert.deepEqual(validateWater(water),[]));
for(const [name,mutate] of [
 ['missing understanding',d=>d.sections.pop()],
 ['HL leak into shared scope',d=>d.sections[6].level='shared'],
 ['empty lesson explanation',d=>d.sections[0].explanation='Water is useful.'],
 ['unmapped scientific claim',d=>d.sections[1].claimReferences.pop()],
 ['unknown source',d=>d.sections[0].referenceIds=['invented']],
 ['false scientific approval',d=>d.review.status='approved'],
 ['fabricated reviewer',d=>d.review.reviewer={name:'Someone'}],
 ['multiple correct choices',d=>d.questions[0].options.forEach(o=>o.correct=true)],
 ['missing distractor feedback',d=>d.questions[0].options[0].feedback=''],
 ['unmapped exam question',d=>d.questions[0].understandingIds=['A1.2.1']],
 ['HL question exposed in SL',d=>d.questions[6].level='shared'],
 ['unlabelled illustrative data',d=>d.questions.find(q=>q.paper==='1B').data.caption='Results'],
 ['inconsistent mark allocation',d=>d.questions.find(q=>q.paper==='2').marks=20],
 ['missing image rights',d=>delete d.assets.find(a=>a.kind==='photograph').termsUrl],
 ['missing recall activity',d=>d.sections[3].recall=[]],
 ['duplicate IDs',d=>d.questions[1].id=d.questions[0].id],
 ['bad source page',d=>d.sections[5].guidePage=34],
])test('rejects '+name,()=>{const d=structuredClone(water);mutate(d);assert.ok(validateWater(d).length>0)});
test('illustrative calculations and ratios agree with answers',()=>{
 const [cap,heat]=water.questions.filter(q=>q.paper==='1B');
 assert.equal(Number(cap.data.rows[0][1])/Number(cap.data.rows[2][1]),4);
 assert.equal((100/(Number(heat.data.rows[0][1])*Number(heat.data.rows[0][2]))).toFixed(2),'2.38');
 assert.equal(100/(Number(heat.data.rows[1][1])*Number(heat.data.rows[1][2])),10);
});
