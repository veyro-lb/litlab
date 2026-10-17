import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEvidence} from './validate-evidence.mjs';
const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const base=()=>read('docs/biology/foundation-qa/UNDERSTANDING_EVIDENCE.json');
test('source-mapped evidence accounts for all 115 understandings without suggesting expert approval',()=>{
 const d=base();
 assert.equal(d.records.length,115);
 assert.deepEqual(validateEvidence(d),[]);
 assert.equal(d.records.every(x=>x.figures.allScientificAccuracyAndLicensingApprovals==='pending'),true);
});
test('missing record cannot be silently treated as complete',()=>{
 const d=base();d.records.pop();
 assert.ok(validateEvidence(d).some(e=>e.includes('115 unique understandings')));
});
test('fabricated word count invalidates evidence',()=>{
 const d=base();d.records[0].teaching.readingWords+=99;
 assert.ok(validateEvidence(d).some(e=>e.includes('Reading depth drift')));
});
test('claiming science review approval without an expert is disallowed',()=>{
 const d=base();d.records[0].figures.allScientificAccuracyAndLicensingApprovals='approved';
 assert.ok(validateEvidence(d).some(e=>e.includes('must not claim qualified approval')));
});
test('withheld structural diagrams cannot be silently unflagged',()=>{
 const d=base();d.qualitySignals.withheldAssets=[];
 assert.ok(validateEvidence(d).some(e=>e.includes('Withheld figure ledger drift')));
});
test('assessment and actual micrograph provenance are checked',()=>{
 const d=base(),x=d.records.find(x=>x.understandingId==='A2.2.10');
 x.assessments=[];
 x.figures.assets[0].provenancePresent=false;
 const errors=validateEvidence(d);
 assert.ok(errors.some(e=>e.includes('assessment coverage drift')));
 assert.ok(errors.some(e=>e.includes('Figure provenance or withholding drift')));
});
test('licensed microscopy assignments and source rights cannot drift',()=>{
 const d=base(),x=d.records.find(x=>x.understandingId==='A2.2.10');
 assert.ok(x.authenticMicroscopy?.length>=2);
 x.authenticMicroscopy[0].sourceUrl='https://example.com/unverified-image';
 assert.ok(validateEvidence(d).some(e=>e.includes('Licensed microscopy evidence drift')));
});
