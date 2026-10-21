import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {drawingRequirements as entries} from './requirements.mjs';
const registry=JSON.parse(readFileSync('src/biology/curriculum/registry.json','utf8'));
const registryText=JSON.stringify(registry);
test('all explicit drawing and construction expectations have activities',()=>{
 for(const code of ['A1.1.2','A1.2.5','A1.2.6','A1.2.7','A2.2.11','B1.2.1','B1.2.2','B2.1.10','B3.1.8','B3.2.9','B3.2.10','C4.2.4','C4.2.11','C4.2.17','D3.1.4','D3.1.9'])assert.ok(entries.some(e=>e.understandingId===code&&e.kind==='required'),code);
 assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
});
test('activities resolve to syllabus codes and real local reference images',()=>{
 for(const e of entries){
  assert.ok(registryText.includes('"'+e.understandingId+'"'),e.understandingId);
  assert.ok(e.understandingId.startsWith(e.topicId+'.'));
  assert.ok(e.checks.length>=2&&e.guidePage>0);
  assert.ok(e.reference&&existsSync('public'+e.reference),e.id);
  assert.ok(e.handoutPage||e.sourceCredit||!e.reference.startsWith('/biology/drawing-references/'),e.id+' source');
 }
});
test('generic cells and enzyme graphs are not falsely advertised as compulsory drawings',()=>{
 for(const id of ['prokaryote','animal','plant','enzyme-graphs'])assert.equal(entries.find(e=>e.id===id).kind,'practice');
 assert.ok(['A','B','C','D'].every(theme=>entries.some(e=>e.topicId.startsWith(theme)&&e.kind==='required')));
});
