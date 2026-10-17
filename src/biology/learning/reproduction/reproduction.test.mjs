// Standalone D3.1 structural and negative validation. Run: node --test src/biology/learning/reproduction/reproduction.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=new URL('./lesson.json',import.meta.url);
const mapFile=new URL('./UNDERSTANDING_MAP.json',import.meta.url);
const lesson=JSON.parse(readFileSync(file,'utf8'));
const map=JSON.parse(readFileSync(mapFile,'utf8'));
const ids=map.understandings.map(u=>u.id);
function validate(x){
 const errors=[];
 if(x.topicId!=='D3.1'||x.schemaVersion!==1)errors.push('topic/schema');
 if(x.review.status==='approved'||x.review.reviewer)errors.push('review must remain pending');
 const seen=[];
 for(const s of x.sections){
  if(s.understandingIds.length!==1)errors.push('one ID per section');
  for(const id of s.understandingIds){seen.push(id);const m=map.understandings.find(u=>u.id===id);
   if(!m)errors.push('unknown understanding '+id);else if(m.scope!==s.level)errors.push('scope '+id);
  }
  if(s.claimReferences.map(c=>c.claim).join('\\n\\n')!==s.explanation)errors.push('claim reconstruction '+s.id);
  if(s.interactions.length<1||s.recall.length<1)errors.push('activities '+s.id);
  if(!s.workedExample||!s.misconceptions.length)errors.push('teaching supports '+s.id);
 }
 if(new Set(seen).size!==ids.length||seen.length!==ids.length||ids.some(id=>!seen.includes(id)))errors.push('coverage');
 for(const q of x.questions){
   if(!q.original||!ids.includes(q.understandingIds[0])||!x.sections.some(s=>s.id===q.sectionId))errors.push('question metadata '+q.id);
   if(q.kind!=='structured-response'&&!q.options)errors.push('question form '+q.id);
 }
 if(x.questions.length!==20)errors.push('questions');
 return errors;
}
test('exact coverage: 12 shared and 8 additional HL',()=>{
 assert.equal(ids.length,20);
 assert.equal(map.understandings.filter(u=>u.scope==='shared').length,12);
 assert.equal(map.understandings.filter(u=>u.scope==='HL').length,8);
 assert.deepEqual(validate(lesson),[]);
});
test('negative: dropping a section is detected',()=>{
 const x=structuredClone(lesson);x.sections.pop();assert.ok(validate(x).includes('coverage'));
});
test('negative: exposing an HL section at SL is rejected',()=>{
 const x=structuredClone(lesson);x.sections[19].level='shared';
 assert.ok(validate(x).some(e=>e.startsWith('scope ')));
});
test('negative: unreconciled explanation and source claims are rejected',()=>{
 const x=structuredClone(lesson);x.sections[0].explanation+=' Unsupported addition';
 assert.ok(validate(x).some(e=>e.startsWith('claim reconstruction')));
});
test('negative: accidental approval without review is rejected',()=>{
 const x=structuredClone(lesson);x.review.status='approved';
 assert.ok(validate(x).includes('review must remain pending'));
});
