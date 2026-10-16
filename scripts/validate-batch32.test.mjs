import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateBatch32} from './validate-batch32.mjs';
const load=async p=>JSON.parse(await readFile(new URL('../src/biology/'+p,import.meta.url),'utf8'));
const [registry,catalog,b11,b12]=await Promise.all([load('curriculum/registry.json'),load('learning/catalog.json'),load('learning/carbohydrates-lipids/lesson.json'),load('learning/proteins/lesson.json')]);
const fixtures=()=>[structuredClone(registry),structuredClone(catalog),{'B1.1':structuredClone(b11),'B1.2':structuredClone(b12)}];
test('Phase 3.2 mapped drafts satisfy bounded contract',()=>{const [r,c,lessons]=fixtures();assert.deepEqual(validateBatch32(r,c,lessons),[])});
for(const [reason,mutate] of [
 ['omit protein HL section',([, ,l])=>l['B1.2'].sections.pop()],
 ['leak HL into SL',([, ,l])=>l['B1.2'].sections[5].level='shared'],
 ['remove claim evidence',([,,l])=>l['B1.1'].sections[3].claimReferences=[]],
 ['duplicate B1.1 understanding',([,,l])=>l['B1.1'].sections[2].understandingIds=['B1.1.1']],
 ['drift textbook page',([,,l])=>l['B1.2'].sections[0].textbook.pdfPages[0]++],
 ['remove practice for a section',([,,l])=>l['B1.1'].questions=l['B1.1'].questions.filter(q=>!q.understandingIds.includes('B1.1.13'))],
 ['remove figure recall path',([,,l])=>delete l['B1.2'].assets[0].recallSrc],
 ['claim unqualified approval',([,,l])=>l['B1.1'].review.status='approved'],
 ['catalog mismatch',([,c])=>c['b1-2-proteins-v1'].topicId='B1.1'],
 ['missing scientific misconception feedback',([,,l])=>l['B1.1'].sections[8].misconceptions=[]],
 ['missing official steroid visual',([,,l])=>l['B1.1'].sections[12].assets=[]],
 ['missing B1.1 nature-of-science recall',([,,l])=>l['B1.1'].sections[0].recall=l['B1.1'].sections[0].recall.filter(x=>x.id!=='b11-nos-si-prefixes')],
 ['missing interactive peptide mechanism',([,,l])=>delete l['B1.2'].sections[1].mechanismChallenge],
 ['unbalanced correct answer position',([,,l])=>l['B1.1'].questions.filter(q=>q.paper==='1A').forEach(q=>q.options.sort((a,b)=>Number(b.correct)-Number(a.correct)))]

])test('Phase 3.2 rejects '+reason,()=>{const values=fixtures();mutate(values);assert.ok(validateBatch32(...values).length>0)});
