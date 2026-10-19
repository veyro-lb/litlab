import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readNew,checkScientificRegressions,validatePhase9} from './validate-phase9.mjs';
test('all integrated drafts remain compatible with the nine scientifically guarded Phase 9 baseline lessons',()=>{const r=validatePhase9();assert.deepEqual(r.errors,[]);assert.equal(r.summary.topics,40);assert.equal(r.summary.understandings,553);assert.ok(r.summary.activeTopics>=9);assert.ok(r.summary.activeUnderstandings>=115);assert.ok(r.summary.shared>=74);assert.ok(r.summary.HL>=41);assert.equal(r.summary.activeUnderstandings,r.summary.shared+r.summary.HL);});
for(const [name,id,bad,needle] of [
 ['pump cannot reverse Na/K stoichiometry','b21-paper1a-15','Two Na+ leave and three K+ enter per ATP.','stoichiometry'],
 ['secondary transport is driven by sodium, not direct carrier ATP hydrolysis','b21-paper1a-16','ATP is hydrolysed directly by every SGLT.','driving force'],
 ['photosystems and Calvin enzymes occupy distinct compartments','b22-paper1a-5','Photosystems in stroma and Calvin cycle in thylakoid lumen.','structural distinction'],
 ['cube calculation retains inverse-length units','b23-p1a-6','24 µm²; 8 µm³; 3 µm²','Cube units'],
 ['magnification uses matching length units','a22-paper2-1','84/28 = 3 times; units ignored.','Magnification'],
 ['calibrated scale-bar ratio converts into micrometres','a22-paper2-2','75/30 = 2.5 mm actual.','scale-bar']
])test(name,()=>{const ls=readNew();const q=ls.flatMap(l=>l.questions).find(q=>q.id===id);if(q.options)q.options.find(o=>o.correct).text=bad;else q.answer=bad;assert.ok(checkScientificRegressions(ls).some(e=>e.includes(needle)));});
test('larger cube decreases SA/V; each displayed row obeys area and volume formulas',()=>{const ls=readNew(),table=ls.find(l=>l.topicId==='B2.3').sections[5].graphTables[0];assert.ok(Number(table.rows[0][3])>Number(table.rows.at(-1)[3]));table.rows[1][2]=999;assert.ok(checkScientificRegressions(ls).includes('Cube model data'));});
test('authentic microscopy needs original source, permission terms and scale evidence',()=>{const ls=readNew(),photo=ls.find(l=>l.topicId==='A2.2').assets.find(a=>a.kind==='photograph');delete photo.termsUrl;assert.ok(checkScientificRegressions(ls).some(e=>e.includes('microscopy')));});
test('shared teaching cannot cite HL-only sources',()=>{const ls=readNew(),l=ls[0];l.references[0].level='HL';assert.ok(checkScientificRegressions(ls).some(e=>e.includes('HL reference leakage')));});
test('answer keys cannot repeat a fixed four-position cycle',()=>{const ls=readNew(),qs=ls[0].questions.filter(q=>q.options);qs.forEach((q,i)=>q.options.forEach((o,j)=>o.correct=j===i%4));assert.ok(checkScientificRegressions(ls).some(e=>e.includes('answer-position')));});
test('Learn and Practice causal feedback stay aligned after a content edit',()=>{const ls=readNew(),l=ls[2];l.sections[0].interactions[0].options[0].feedback='Different feedback';assert.ok(checkScientificRegressions(ls).some(e=>e.includes('Paired question drift')));});
