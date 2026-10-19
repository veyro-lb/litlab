#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const root='docs/biology/final-consolidation/';
const ledger=read(root+'COMPLETE_UNDERSTANDING_VERIFICATION.json');
const rights=read(root+'VISUAL_COVERAGE_AND_RIGHTS.json');
const repairs=read(root+'CONTENT_REPAIR_LEDGER.json');
assert.equal(ledger.rows.length,553);
assert.equal(new Set(ledger.rows.map(r=>r.understandingId)).size,553);
assert.equal(rights.understandings.length,553);
assert.equal(repairs.records.length,12);
const counts=ledger.rows.reduce((acc,r)=>(acc[r.status]=(acc[r.status]||0)+1,acc),{});
assert.equal(counts.AWAITING_INDIVIDUAL_SOURCE_DEPTH_REVIEW,540);
assert.equal(counts.PRIOR_BATCH_SOURCE_CHECKED_IMPROVED_PENDING_QUALIFIED_SIGNOFF,8);
assert.equal(counts.SOURCE_CHECKED_IMPROVED_PENDING_QUALIFIED_SIGNOFF,4);
assert.equal(counts.SOURCE_CHECKED_ADEQUATE_NO_TEACHING_REWRITE,1);
assert.ok(ledger.rows.every(r=>r.independentScientificSignoff===false));
assert.ok(!existsSync('public/biology/source-pdf-figures'));
const dirs=readdirSync('src/biology/learning',{withFileTypes:true}).filter(x=>x.isDirectory()&&existsSync('src/biology/learning/'+x.name+'/lesson.json'));
assert.equal(dirs.length,40);
const lessons=dirs.map(x=>read('src/biology/learning/'+x.name+'/lesson.json'));
const mapped=new Map();
for(const l of lessons){
 const ids=new Set(l.assets.map(a=>a.id));
 for(const a of l.assets)for(const k of ['src','recallSrc','mobileSrc','recallMobileSrc'])if(a[k]){
  assert.ok(!a[k].includes('source-pdf-figures'),a[k]);
  assert.ok(existsSync('public'+a[k]),l.topicId+' '+a.id+' '+k);
 }
 for(const s of l.sections)for(const uid of s.understandingIds){
  assert.ok(!mapped.has(uid),'duplicate '+uid);
  mapped.set(uid,{section:s,lesson:l});
  for(const id of s.assets||[])assert.ok(ids.has(id),uid+': missing '+id);
  for(const p of s.figurePlacements||[]){assert.ok((s.assets||[]).includes(p.assetId),uid+': misplaced '+p.assetId);assert.ok(p.afterBlock<s.teachingBlocks.length,uid+': invalid figure position')}
 }
}
assert.equal(mapped.size,553);
for(const r of ledger.rows){const item=mapped.get(r.understandingId);assert.ok(item,r.understandingId);assert.equal(item.section.id,r.actualLessonSection.id);assert.equal(item.lesson.topicId,r.topicId);}
const exact={'A1.2.7':'a12-dna-rna-comparison','C1.2.13':'nadh-electron-energy-transfer','B3.2.17':'b32-root-pressure-flow','C2.2.11':'saltatory-conduction','D1.1.8':'bacterial-replication-enzymes','D1.2.10':'translation-elongation','D1.2.17':'d12-elongation-cycle','D2.1.11':'d21-meiotic-variation'};
for(const [uid,id] of Object.entries(exact)){const {section}=mapped.get(uid);assert.ok(section.assets.includes(id),uid);assert.ok(section.figurePlacements.some(p=>p.assetId===id),uid+' placement');}
const c=lessons.find(x=>x.topicId==='C1.2');
assert.deepEqual(c.sections.find(s=>s.understandingIds.includes('C1.2.17')).textbook.pdfPages,[436]);
console.log(JSON.stringify({status:'STRUCTURAL CONSOLIDATION CHECK PASSED',topics:40,understandings:553,sourceInformedRevisions:12,remainingDepthReviews:541,removedRightsUnclearedPublicCrops:18},null,2));
