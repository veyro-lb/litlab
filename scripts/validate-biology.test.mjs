import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCurriculum} from './validate-biology.mjs';
const source=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8'));
test('source registry passes',()=>assert.deepEqual(validateCurriculum(source),[]));
for(const [name,mutate] of [
  ['duplicate topic',x=>x.push(structuredClone(x[0]))],
  ['missing statement',x=>x[0].understandings.pop()],
  ['duplicate statement',x=>x[0].understandings[1].id=x[0].understandings[0].id],
  ['incorrect theme',x=>x[0].theme='B'],
  ['HL statement exposed as shared',x=>x[0].understandings[6].level='shared'],
  ['bad source reference',x=>x[0].understandings[0].printedId='A1.2.1'],
  ['missing metadata',x=>delete x[0].questionReferences],
  ['unsupported lesson',x=>x[0].lessonId='fake-lesson'],
  ['wrong curriculum version',x=>x[0].version='2023'],
  ['false review status',x=>x[0].review='approved'],
])test(`rejects ${name}`,()=>{const data=structuredClone(source);mutate(data);assert.ok(validateCurriculum(data).length>0);});
