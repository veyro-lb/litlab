import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';
const root=new URL('../../../',import.meta.url);const r=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const lesson=r('src/biology/learning/photosynthesis/lesson.json'),topic=r('src/biology/curriculum/registry.json').find(t=>t.id==='C1.3');
test('official coverage and lesson schema',()=>{assert.equal(lesson.sections.length,19);assert.equal(lesson.questions.length,38);assert.deepEqual(validateLesson(lesson,topic),[])});
test('SL/HL isolation and visual rights',()=>{assert.equal(lesson.sections.filter(s=>s.level==='shared').length,8);assert.equal(lesson.sections.filter(s=>s.level==='HL').length,11);for(const a of lesson.assets){assert.ok(existsSync(new URL('public'+a.src,root)));assert.ok(a.permissionEvidence&&a.license)}});
test('all MCQs have one correct and feedback for each option',()=>{for(const q of lesson.questions.filter(q=>q.paper==='1A')){assert.equal(q.options.length,4);assert.equal(q.options.filter(o=>o.correct).length,1);assert.ok(q.options.every(o=>o.feedback.length>15))}});
test('chloroplast chemiosmosis directions and Calvin accounting',()=>{const svg=readFileSync(new URL('public/biology/photosynthesis/thylakoid-chemiosmosis.svg',root),'utf8');assert.match(svg,/STROMA/);assert.match(svg,/THYLAKOID LUMEN/);assert.match(svg,/H⁺/);const cal=lesson.sections.find(s=>s.understandingIds.includes('C1.3.17')).explanation;assert.match(cal,/five/);assert.match(cal,/three RuBP/)})
