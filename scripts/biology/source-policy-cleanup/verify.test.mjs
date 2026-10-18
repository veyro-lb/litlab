import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inspectFocusedLesson,verifyCourse} from './verify.mjs';

const root=resolve('src/biology/learning');
const load=slug=>JSON.parse(readFileSync(resolve(root,slug,'lesson.json'),'utf8'));

test('course registry, lessons, science references, diagrams and 553 understanding IDs remain mapped',()=>{
 const r=verifyCourse();
 assert.equal(r.status,'PASS');
 assert.equal(r.topics,40);
 assert.equal(r.understandings,553);
 assert.equal(r.seasonalPoints,24);
});

test('negative: removed NASA annual anomaly in core climate teaching is detected',()=>{
 const doc=load('climate-change');
 const s=doc.sections.find(s=>s.understandingIds.includes('D4.3.1'));
 s.teachingBlocks[0].explanation+=" NASA 2025 +1.19 °C.";
 s.explanation=s.teachingBlocks.map(b=>b.explanation).join('\n\n');
 assert.ok(inspectFocusedLesson(doc).some(x=>x.includes('deprecated NASA statistic')));
});

test('negative: Arctic NOAA statistics incorrectly attached to required penguin/walrus teaching are detected',()=>{
 const doc=load('climate-change');
 doc.sections.find(s=>s.understandingIds.includes('D4.3.4')).graphTables=[{caption:'NOAA reference table',headers:['year'],rows:[[2025]]}];
 assert.ok(inspectFocusedLesson(doc).some(x=>x.includes('specialized NOAA table')));
});

test('negative: removal of required FACE evidence from C1.3.8 is detected',()=>{
 const doc=load('photosynthesis');
 const s=doc.sections.find(s=>s.understandingIds.includes('C1.3.8'));
 s.referenceIds=s.referenceIds.filter(x=>x!=='face-review');
 s.claimReferences.forEach(c=>{c.referenceIds=c.referenceIds.filter(x=>x!=='face-review')});
 s.teachingBlocks.forEach(b=>{b.referenceIds=b.referenceIds.filter(x=>x!=='face-review')});
 assert.ok(inspectFocusedLesson(doc).some(x=>x.includes('FACE evidence removed')));
});

test('negative: missing actual monthly CO2 graph in C4.2.20 is detected',()=>{
 const doc=load('transfers-energy-matter');
 doc.sections.find(s=>s.understandingIds.includes('C4.2.20')).assets=[];
 assert.ok(inspectFocusedLesson(doc).some(x=>x.includes('graph not in teaching')));
});

test('negative: removal of Goldilocks-zone HL teaching from A1.1.8 is detected',()=>{
 const doc=load('water');
 doc.sections.find(s=>s.understandingIds.includes('A1.1.8')).explanation='Water may be found on some other planets.';
 assert.ok(inspectFocusedLesson(doc).some(x=>x.includes('Goldilocks zone removed')));
});
