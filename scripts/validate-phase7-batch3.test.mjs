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
test('B2.1 pump science: three Na⁺ exported and two K⁺ imported per ATP',async()=>{
 const B21=JSON.parse(await readFile(new URL('../src/biology/learning/membranes-transport/lesson.json',import.meta.url),'utf8'));
 const topic=t.find(x=>x.id==='B2.1');
 assert.deepEqual(validatePhase7(B21,topic),[]);
 const wrongNa=structuredClone(B21);
 wrongNa.sections[14].explanation=wrongNa.sections[14].explanation.replace('exports three Na⁺ ions','exports four Na⁺ ions');
 assert.ok(validatePhase7(wrongNa,topic).includes('Pump stoichiometry'));
 const wrongK=structuredClone(B21);
 wrongK.sections[14].explanation=wrongK.sections[14].explanation.replace('imports two K⁺ ions','imports three K⁺ ions');
 assert.ok(validatePhase7(wrongK,topic).includes('Pump stoichiometry'));
});
test('all 23 retained recall pairs and 4 reviewed single-frame replacements exist',async()=>{
 const r=await checkFiles();
 assert.deepEqual(r.errors,[]);
 assert.equal(r.summary.reduce((n,s)=>n+s.figures,0),27);
 const B21=JSON.parse(await readFile(new URL('../src/biology/learning/membranes-transport/lesson.json',import.meta.url),'utf8'));
 const B22=JSON.parse(await readFile(new URL('../src/biology/learning/organelles-compartmentalization/lesson.json',import.meta.url),'utf8'));
 assert.equal([...B21.assets,...B22.assets].filter(a=>a.recallSrc).length,23);
 assert.deepEqual(B21.assets.filter(a=>!a.recallSrc).map(a=>a.id).sort(),['b21-figure-15','b21-figure-16','b21-figure-7','b21-transport-table']);
});
test('single-frame replacements cannot evade source-path and recall-pair checks',async()=>{
 const B21=JSON.parse(await readFile(new URL('../src/biology/learning/membranes-transport/lesson.json',import.meta.url),'utf8'));
 const topic=t.find(x=>x.id==='B2.1');
 const bad=structuredClone(B21);
 bad.assets.find(a=>a.id==='b21-figure-15').src='/biology/membranes-transport/unknown-pump.svg';
 assert.ok(validatePhase7(bad,topic).some(x=>x.includes('Asset review')));
 const badPair=structuredClone(B21);
 badPair.assets.find(a=>a.id==='b21-figure-1').recallSrc='';
 assert.ok(validatePhase7(badPair,topic).some(x=>x.includes('Asset review')));
});
