// Run: node scripts/biology/phase8/negative.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {specs,validateAll,validateLesson} from './validate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=(s)=>JSON.parse(fs.readFileSync(path.join(root,s.file),'utf8'));
const check=(mutate,needle,s=specs[0])=>{
 const x=structuredClone(read(s));mutate(x);
 assert.ok(validateLesson(x,s).some(e=>e.includes(needle)),'expected '+needle);
};
assert.deepEqual(validateAll(),[]);
check(x=>x.sections[1].understandingIds=['A2.2.1'],'understanding order');
check(x=>x.sections[11].level='shared','level');
check(x=>x.sections[0].guidePage=100,'guide page');
check(x=>x.sections[0].textbook.pdfPages=[999],'Hodder page');
check(x=>x.questions[0].options.forEach(o=>o.correct=true),'invalid MCQ');
check(x=>x.questions[0].options.forEach(o=>o.correct=false),'invalid MCQ');
check(x=>x.assets[0].recallSrc='/biology/no-such.svg','asset missing');
check(x=>x.review.status='approved','review approval');
check(x=>x.questions[0].level='HL','question scope');
check(x=>x.sections[0].explanation='tiny','short teaching');
check(x=>x.sections[0].referenceIds=['invalid'],'unknown ref');
check(x=>x.questions.push(structuredClone(x.questions[0])),'duplicate question');
check(x=>x.sections[5].graphTables[0].rows[0][1]=10,'SA:V table',specs[1]);
console.log('Phase 8: thirteen deliberately malformed fixtures rejected');
