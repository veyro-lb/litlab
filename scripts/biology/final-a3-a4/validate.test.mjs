import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditLesson,auditAll,loadAndAudit} from './validate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const load=slug=>JSON.parse(fs.readFileSync(path.join(root,'src/biology/learning/'+slug+'/lesson.json'),'utf8'));
const clone=x=>structuredClone(x);

test('all 43 original-understanding packages validate',()=>{
  assert.deepEqual(loadAndAudit(),[]);
});
test('negative: wrong HL scope is rejected',()=>{
  const lesson=load('classification-cladistics');
  lesson.sections[0].level='shared';
  assert.match(auditLesson(lesson,{prefix:'A3.2',count:9,shared:0}) .join(' | '),/level/);
});
test('negative: missing and duplicated understanding are rejected',()=>{
  const lesson=load('diversity-organisms');
  lesson.sections[1].understandingIds=['A3.1.1'];
  assert.match(auditLesson(lesson,{prefix:'A3.1',count:15,shared:11}).join(' | '),/duplicate|missing/);
});
test('negative: dishonest source and scoring drift are rejected',()=>{
  const lesson=load('evolution-speciation');
  lesson.sections[0].claimReferences[0].claim='content changed without cited text';
  lesson.questions.find(q=>q.paper==='2').marks=99;
  const message=auditLesson(lesson,{prefix:'A4.1',count:11,shared:7}).join(' | ');
  assert.match(message,/source-claim drift/);
  assert.match(message,/marking rubric/);
});
test('negative: orphan image or badly shaped comparison is rejected',()=>{
  const lesson=load('conservation-biodiversity');
  lesson.sections[0].visuals[0].rows[0].pop();
  assert.match(auditLesson(lesson,{prefix:'A4.2',count:8,shared:8}).join(' | '),/invalid comparison/);
});
test('negative: fabricated certainty around sample data is not accepted',()=>{
  const lesson=load('classification-cladistics');
  lesson.questions.find(q=>q.id==='a32-p1b-constructed-alignment').data.caption='Observed DNA sequence';
  const all={'A3.1':load('diversity-organisms'),'A3.2':lesson,'A4.1':load('evolution-speciation'),'A4.2':load('conservation-biodiversity')};
  assert.match(auditAll(all,p=>fs.existsSync(path.join(root,p))).join(' | '),/synthetic alignment/);
});
