import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectTransportRequirements} from '../../scripts/biology/ib2025-coursewide-review/transport-requirements.mjs';
const topics=[["B1.1","carbohydrates-lipids",13,0],["B1.2","proteins",12,7],["B2.1","membranes-transport",17,7],["B2.2","organelles-compartmentalization",9,6],["B2.3","cell-specialization",10,4],["B3.1","gas-exchange",13,3],["B3.2","transport",18,8],["B3.3","muscle-motility",10,10],["B4.1","adaptation-environment",8,0],["B4.2","ecological-niches",13,0]];
const revised=["B1.1.5","B1.1.9","B1.2.9","B1.2.11","B2.1.10","B2.1.15","B2.1.16","B2.2.2","B2.2.9","B2.3.4","B2.3.8","B3.1.3","B3.1.13","B3.2.14","B3.2.18","B3.3.2","B3.3.8","B4.1.4","B4.1.6","B4.2.12","B4.2.13"];
const load=slug=>JSON.parse(readFileSync('src/biology/learning/'+slug+'/lesson.json','utf8'));
test('Theme B syllabus alignment, source and learning checks',()=>{
 let total=0;
 for(const [topic,slug,count,hl] of topics){
  const o=load(slug);
  assert.equal(o.topicId,topic);
  if(topic==='B3.2')assert.deepEqual(inspectTransportRequirements(o),[]);
  assert.equal(o.sections.length,count);
  assert.equal(o.sections.filter(s=>s.level==='HL').length,hl);
  o.sections.forEach((s,i)=>{
   assert.deepEqual(s.understandingIds,[topic+'.'+(i+1)]);
   assert.ok(s.teachingBlocks.length>=(topic==='B3.2'?2:3)&&s.explanation.length>=200);
   assert.equal(s.claimReferences.length,s.teachingBlocks.length);
   assert.ok(s.referenceIds.some(x=>/guide|ib/.test(x)));
   assert.ok(s.referenceIds.some(x=>/hodder/.test(x)));
   assert.ok(s.recall.length&&s.interactions.length&&s.misconceptions.length);
   if(topic!=='B3.2'&&revised.includes(s.understandingIds[0]))assert.ok(s.teachingBlocks[0].explanation.length>230);
  });
  const q=o.questions.find(q=>q.id==='theme-b-20261018-'+slug+'-mechanism');
  assert.ok(q);assert.equal(q.marks,q.markingPoints.length);
  total+=count;
 }
 assert.equal(total,123);
});
test('Mechanistic high-risk signposts',()=>{
 const get=(slug,id)=>load(slug).sections.find(s=>s.understandingIds[0]===id).teachingBlocks[0].explanation;
 const pump=get('membranes-transport','B2.1.15');
 assert.ok(pump.includes('three sodium ions')&&pump.includes('two potassium ions'));
 const sgl=get('membranes-transport','B2.1.16');
 assert.ok(sgl.includes('apical')&&sgl.includes('basolateral'));
 assert.ok(get('transport','B3.2.14').includes('heart → gill capillaries → body tissues → heart'));
 assert.ok(get('muscle-motility','B3.3.2').includes('ATP detaches myosin'));
 const niche=get('ecological-niches','B4.2.12');
 assert.ok(niche.includes('fundamental niche')&&niche.includes('realized niche'));
});
