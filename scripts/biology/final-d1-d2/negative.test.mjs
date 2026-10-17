import test from 'node:test';
import assert from 'node:assert/strict';
import {load,validate} from './verify.mjs';
const copy=()=>structuredClone(load());
const safe=()=>true;
test('baseline 77-understanding package remains internally consistent',()=>{
 const r=validate(copy());assert.equal(r.sections,77);assert.equal(r.details.length,6);
});
test('negative: missing numbered syllabus entry is rejected',()=>{
 const x=copy();x['D1.1'].sections.splice(2,1);
 assert.throws(()=>validate(x,safe),/section total/);
});
test('negative: HL-only D2.2 cannot leak into SL',()=>{
 const x=copy();x['D2.2'].sections[0].level='shared';
 assert.throws(()=>validate(x,safe),/level/);
});
test('negative: altered DNA synthesis direction is rejected',()=>{
 const x=copy();x['D1.1'].sections[6].teachingBlocks=[{title:'Incorrect',explanation:'Lagging strand is synthesized 3′→5′.'},{title:'Incorrect II',explanation:'Wrong direction.'}];
 x['D1.1'].sections[6].explanation=x['D1.1'].sections[6].teachingBlocks.map(b=>b.explanation).join('\n\n');
 assert.throws(()=>validate(x,safe));
});
test('negative: two keyed choices cannot both be correct',()=>{
 const x=copy();x['D2.3'].questions.find(q=>q.kind==='selection').options[1].correct=true;
 assert.throws(()=>validate(x,safe),/answer key/);
});
test('negative: question loses its matching scope',()=>{
 const x=copy();x['D2.2'].questions[0].level='shared';
 assert.throws(()=>validate(x,safe),/question level/);
});
test('negative: contradictory water-potential result is rejected',()=>{
 const x=copy();const q=x['D2.3'].questions.find(q=>q.id==='d23-signed-psi-2');q.answer=q.answer.replace('−450 kPa','+450 kPa');
 assert.throws(()=>validate(x,safe),/false|assert|expected/i);
});
test('negative: malformed comparison rows are rejected',()=>{
 const x=copy();x['D2.1'].sections[3].visuals[0].rows[0].pop();
 assert.throws(()=>validate(x,safe),/column mismatch/);
});
test('negative: editorial draft cannot falsely claim independent review',()=>{
 const x=copy();x['D1.3'].review.status='approved';
 assert.throws(()=>validate(x,safe),/approved/);
});
