import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const base='58e52cc482f7e896bd7de3f8c85ccf2dadf8e1ce';
const prefix='docs/biology/ib2025-coursewide-review/';
const registry=read('src/biology/curriculum/registry.json');
const matrix=read(prefix+'REVIEW_MATRIX.json');
const lessons=readdirSync('src/biology/learning').flatMap(slug=>{try{return [read(`src/biology/learning/${slug}/lesson.json`)]}catch{return []}});
const byTopic=new Map(lessons.map(x=>[x.topicId,x]));
test('complete matrix preserves every official ID/level and makes no new source certification',()=>{
 const expected=registry.flatMap(t=>t.understandings.map(u=>[u.id,u.level]));
 assert.deepEqual(matrix.rows.map(r=>[r.understandingId,r.level]),expected);
 assert.equal(new Set(matrix.rows.map(r=>r.understandingId)).size,553);
 assert.equal(matrix.rows.filter(r=>r.currentPassGuideCompared).length,matrix.counts.currentPassGuideCompared);
 assert.equal(matrix.rows.filter(r=>!r.currentPassGuideCompared).length,matrix.counts.notYetIndividuallyReviewedInCurrentPass);
 assert.equal(matrix.counts.currentPassCompleteSourceReview,0);
 for(const r of matrix.rows){
  assert.equal(r.independentScientificApproval,false);assert.equal(r.hodder.verifiedThisPass,false);
  assert.equal(r.currentPassCompleteSourceReview,false);
  if(r.currentPassGuideCompared){assert.ok(r.guide.comparedStatementAndGuidance.length>30);assert.ok(r.reviewEvidence.length>0)}
  else {assert.equal(r.status,'Not yet individually reviewed');assert.equal(r.guide.comparedStatementAndGuidance,undefined)}
 }
});
test('before/after ledger matches actual lesson fields and counts, not just a claimed status',()=>{
 for(const topic of ['C1.2','C1.3','D1.1','D1.2','D2.1']){
  const evidence=read(prefix+topic+'_CHANGES.json');const current=read(evidence.lessonPath);
  const previous=JSON.parse(execFileSync('git',['show',base+':'+evidence.lessonPath],{encoding:'utf8',maxBuffer:5e6}));
  for(const [field,values] of Object.entries(evidence.lessonFields??{})){assert.deepEqual(previous[field]??null,values.before);assert.deepEqual(current[field]??null,values.after)}
  for(const record of evidence.records){
   const a=previous[record.collection].find(x=>x.id===record.id);const b=current[record.collection].find(x=>x.id===record.id);
   assert.deepEqual(record.changedFields,Object.keys(record.fields));
   for(const [field,values] of Object.entries(record.fields)){assert.deepEqual(a[field]??null,values.before);assert.deepEqual(b[field]??null,values.after)}
  }
  assert.equal(evidence.explanationCharacters.after,current.sections.reduce((n,s)=>n+s.explanation.length,0));
 }
});
test('ATP restoration, every asset record, and every question/section ID stay intact',()=>{
 for(const topic of ['C1.2','C1.3','D1.1','D1.2','D2.1']){
  const e=read(prefix+topic+'_CHANGES.json');const now=read(e.lessonPath);const old=JSON.parse(execFileSync('git',['show',base+':'+e.lessonPath],{encoding:'utf8',maxBuffer:5e6}));
  assert.deepEqual(now.assets,old.assets);
  for(const col of ['sections','questions'])assert.deepEqual(now[col].map(x=>x.id),old[col].map(x=>x.id));
  if(topic==='C1.2')assert.deepEqual(now.sections[0],old.sections[0]);
 }
});
test('shared photosynthesis models do not require additional HL light-reaction mechanisms',()=>{
 const l=byTopic.get('C1.3');
 for(const q of l.questions.filter(q=>q.level==='shared')){
  assert.doesNotMatch([q.prompt,q.answer,...(q.markingPoints??[])].join(' '),/photosystem|NADPH|Calvin cycle|RuBP/i);
 }
 const names=l.sections.filter(s=>s.level==='shared').map(s=>s.understandingIds[0]);
 assert.deepEqual(names,Array.from({length:8},(_,i)=>'C1.3.'+(i+1)));
});
test('specific mechanism marking points include the answer the question asks for',()=>{
 const photo=byTopic.get('C1.3');
 const nadp=photo.questions.find(q=>q.id==='c13-structured-13');assert.match(nadp.answer,/two electrons/);assert.match(nadp.answer,/stroma/);
 const rubisco=photo.questions.find(q=>q.id==='c13-structured-15');assert.match(rubisco.answer,/RuBP/);assert.match(rubisco.answer,/two three-carbon/);
 const respiration=byTopic.get('C1.2');assert.match(respiration.questions.find(q=>q.id==='c12-written-6').answer,/0.15 cm³ min⁻¹ g⁻¹/);
 const division=byTopic.get('D2.1');assert.match(division.sections[14].explanation,/threshold/);assert.doesNotMatch(division.sections[14].explanation,/cyclin-dependent kinase/);
});
