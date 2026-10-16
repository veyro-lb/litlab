import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePhase7,checkFiles} from './validate-phase7-batch3.mjs';
const t=JSON.parse(await readFile(new URL('../docs/biology/phase7/registry-proposal.json',import.meta.url),'utf8'));
for(const slug of ['membranes-transport','organelles-compartmentalization']){
 const d=JSON.parse(await readFile(new URL('../src/biology/learning/'+slug+'/lesson.json',import.meta.url),'utf8'));
 const topic=t.find(x=>x.id===d.topicId);
 test(d.topicId+' positive structural mapping',()=>assert.deepEqual(validatePhase7(d,topic),[]));
 for(const [name,fn] of [
  ['duplicate ID',x=>x.sections[1].understandingIds=x.sections[0].understandingIds],
  ['SL/HL leakage',x=>x.sections.at(-1).level='shared'],
  ['unknown science reference',x=>x.sections[0].referenceIds=['absent']],
  ['false approval',x=>x.review.status='approved'],
  ['wrong page',x=>x.sections[0].pdfPage=1],
  ['two correct MCQ options',x=>x.questions[0].options.find(o=>!o.correct).correct=true],
  ['invalid marks',x=>x.questions.find(q=>q.paper==='2').marks=99],
  ['missing artwork recall',x=>x.assets[0].recallSrc=''],
  ['missing correction',x=>x.sections[0].misconceptions=[]]
 ])test(d.topicId+' rejects '+name,()=>{const x=JSON.parse(JSON.stringify(d));fn(x);assert.ok(validatePhase7(x,topic).length)});
}
test('all 26 original figure pairs exist',async()=>{const r=await checkFiles();assert.deepEqual(r.errors,[]);assert.equal(r.summary.reduce((n,s)=>n+s.figures,0),26)});
