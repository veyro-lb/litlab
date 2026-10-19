import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {inspectTransportRequirements} from './transport-requirements.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const prefix='docs/biology/ib2025-coursewide-review/';
const locators=read(prefix+'TEXTBOOK_LOCATOR_VERIFICATION.json');
const transport=read('src/biology/learning/transport/lesson.json');
test('173 exact textbook locators and all 58 former gaps match the lessons',()=>{
 assert.equal(locators.records.length,173);assert.equal(new Set(locators.records.map(r=>r.understandingId)).size,173);
 assert.equal(locators.sourcePdfPages,868);assert.match(locators.sourceSha256,/^[a-f0-9]{64}$/);
 assert.equal(locators.records.filter(r=>r.before===null).length,58);
 for(const r of locators.records){
  const s=read(r.lessonPath).sections.find(s=>s.understandingIds.includes(r.understandingId));assert.deepEqual(s.textbook,r.after);
  assert.ok(r.after.pdfPages.length>0);assert.deepEqual(r.after.pdfPages,r.after.printedPages.map(n=>n+12));assert.ok(r.after.pdfPages.every(n=>n>0&&n<=868));assert.match(r.sourceTextSha256,/^[a-f0-9]{64}$/);
 }
 const matrix=read(prefix+'REVIEW_MATRIX.json');assert.equal(matrix.counts.textbookLocatorsVerified,173);assert.equal(matrix.counts.currentPassGuideCompared,115);assert.equal(matrix.counts.notYetIndividuallyReviewedInCurrentPass,438);
 assert.equal(matrix.rows.filter(r=>r.hodder.locatorVerifiedThisPass).length,173);assert.ok(matrix.rows.every(r=>!r.independentScientificApproval&&!r.currentPassCompleteSourceReview));
});
test('all 18 transport understandings retain prescribed mechanisms and skills',()=>assert.deepEqual(inspectTransportRequirements(transport),[]));
for(const [id,pattern] of [[1,/fenestr\w*/gi],[2,/micrograph\w*/gi],[3,/recoil/gi],[4,/carotid/gi],[5,/valves?/gi],[6,/correlation coefficient/gi],[7,/capillary action/gi],[8,/pits/gi],[9,/cortex/gi],[10,/phloem/gi],[11,/plasma/gi],[12,/proteins/gi],[13,/gaps/gi],[14,/gill\w*/gi],[15,/septum/gi],[16,/sinoatrial/gi],[17,/positive pressure/gi],[18,/plasmodesmata/gi]]){
 test('negative: loss of prescribed B3.2.'+id+' content is rejected',()=>{const clone=structuredClone(transport);clone.sections[id-1].explanation=clone.sections[id-1].explanation.replace(pattern,'[removed]');assert.ok(inspectTransportRequirements(clone).some(x=>x.startsWith('B3.2.'+id+':')))});
}
test('all native scientific visuals remain anchored to actual teaching blocks',()=>{
 for(const slug of readdirSync('src/biology/learning')){
  let l;try{l=read(`src/biology/learning/${slug}/lesson.json`)}catch{continue}
  for(const s of l.sections)for(const v of s.visuals??[])assert.ok(Number.isInteger(v.afterBlock)&&v.afterBlock>=0&&v.afterBlock<s.teachingBlocks.length,s.id+' '+v.title);
 }
});
test('neural answers preserve prescribed mechanisms without teaching pump-driven rapid repolarization',()=>{
 const l=read('src/biology/learning/neural-signalling/lesson.json');const q=n=>l.questions.find(q=>q.id==='c22-written-'+n);
 assert.match(q(6).answer,/Ca²⁺/);assert.match(q(6).answer,/exocytosis/);assert.match(q(8).answer,/K⁺ efflux/);assert.match(q(9).answer,/return current outside/);assert.match(q(10).answer,/20 Hz/);assert.match(q(13).answer,/hyperpolarization/);assert.match(q(13).answer,/farther from threshold/);
 assert.match(l.sections[7].explanation,/does not cause the rapid falling phase/);assert.match(l.sections[7].explanation,/does not reverse the bulk/);
});
test('every follow-up lesson change has exact before/after evidence and preserves all IDs',()=>{
 const e=read(prefix+'FOLLOWUP_CHANGES.json');
 for(const record of e.records){
  const old=JSON.parse(execFileSync('git',['show',e.baseCommit+':'+record.lessonPath],{encoding:'utf8',maxBuffer:5e6}));const now=read(record.lessonPath);
  const fields=(a,b)=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].sort().filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>[k,{before:a[k]??null,after:b[k]??null}]));
  for(const collection of ['sections','questions']){
   assert.deepEqual(now[collection].map(x=>x.id),old[collection].map(x=>x.id));
   for(const [i,item] of now[collection].entries()){
    const changes=fields(old[collection][i],item);const listed=record.records.find(x=>x.collection===collection&&x.id===item.id);
    if(Object.keys(changes).length)assert.deepEqual(listed?.fields,changes,item.id+' recorded changes');else assert.equal(listed,undefined);
   }
  }
  const changed=fields(old,now);delete changed.sections;delete changed.questions;assert.deepEqual(record.lessonFields,changed);
 }
});
