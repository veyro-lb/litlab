import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const topics=[
 ['D1.1','dna-replication',9,5],['D1.2','protein-synthesis',19,11],['D1.3','mutation-gene-editing',10,7],
 ['D2.1','cell-nuclear-division',17,11],['D2.2','gene-expression',11,0],['D2.3','water-potential',11,7],
 ['D3.1','reproduction',20,12],['D3.2','inheritance',21,15],['D3.3','homeostasis',11,6],
 ['D4.1','natural-selection',15,8],['D4.2','stability-change',15,11],['D4.3','climate-change',12,8]
];
const ledger=read('docs/biology/theme-d-final-20261018/UNDERSTANDING_DEPTH_LEDGER.json');
const baseline=read('docs/biology/theme-d-final-20261018/BASELINE_DEPTH_7FA17DF.json');
const lessons=topics.map(([id,slug])=>read('src/biology/learning/'+slug+'/lesson.json'));
const rows=new Map(ledger.understandings.map(r=>[r.understanding,r]));
const words=text=>text.trim().split(/\s+/).length;

test('171 original numbered understandings remain in the Guide source order and proper scope',()=>{
 assert.equal(rows.size,171);
 assert.equal(ledger.understandings.length,171);
 const seen=new Set();
 topics.forEach(([id,,count,shared],i)=>{
  const l=lessons[i];assert.equal(l.topicId,id);assert.equal(l.sections.length,count);
  l.sections.forEach((s,j)=>{
   const key=id+'.'+(j+1);assert.deepEqual(s.understandingIds,[key]);assert.equal(s.level,j<shared?'shared':'HL');
   assert.ok(!seen.has(key));seen.add(key);
   assert.ok(s.referenceIds.some(x=>x.startsWith('ib-')));
   assert.ok(s.referenceIds.some(x=>x.startsWith('hodder-')));
  });
 });
 assert.equal(seen.size,171);
 assert.equal(lessons.flatMap(l=>l.sections).filter(s=>s.level==='shared').length,101);
 assert.equal(lessons.flatMap(l=>l.sections).filter(s=>s.level==='HL').length,70);
});

test('Learn mode has developed original paragraphs, useful headings and synchronized source claims',()=>{
 for(const l of lessons)for(const s of l.sections){
  const key=s.understandingIds[0],row=rows.get(key);assert.ok(row,key);
  assert.ok(words(s.explanation)>=150,key+': underdeveloped teaching');
  assert.ok(s.teachingBlocks.length>=2,key+': missing headings');
  assert.ok(s.teachingBlocks.every(b=>b.title&&b.explanation.trim().length>=70),key+': short paragraph');
  assert.equal(s.explanation,s.teachingBlocks.map(b=>b.explanation).join('\n\n'),key+': reading/summary mismatch');
  assert.equal(s.explanation,s.claimReferences.map(b=>b.claim).join('\n\n'),key+': source claims out of sync');
  assert.ok(s.claimReferences.every(c=>c.referenceIds.length),key+': missing citations');
  assert.equal(row.depth.afterWords,words(s.explanation),key+': ledger stale');
  assert.equal(row.depth.beforeWords,baseline.counts[key],key+': baseline stale');
  assert.ok(row.sourceCrosswalk.levelMatches);
  assert.ok(row.sourceCrosswalk.syllabusIdMatches);
  assert.ok(s.workedExample.trim().length>45,key+': missing causal example');
  assert.ok(s.interactions?.length&&s.recall?.length,key+': lost learning tasks');
 }
});

test('all former generic editorial headings have meaningful scientific titles',()=>{
 for(const l of lessons)for(const s of l.sections)for(const b of s.teachingBlocks){
  assert.doesNotMatch(b.title,/^Mechanism, prediction and limits$|^Mechanism, evidence and limitations$/i);
 }
});

test('source-aligned hard mechanisms survive depth expansions',()=>{
 const map=new Map(lessons.flatMap(l=>l.sections.map(s=>[s.understandingIds[0],s.explanation])));
 for(const [id,tokens]of Object.entries({
  'D1.1.8':['primase','polymerase I','polymerase III','ligase'],
  'D1.2.7':['codon','anticodon'],
  'D1.3.9':['off-target','Cas9'],
  'D2.1.9':['meiosis I','meiosis II'],
  'D2.2.6':['methylation','histone'],
  'D2.3.10':['Ψw','Ψs','Ψp'],
  'D3.1.15':['acrosome','cortical'],
  'D3.2.21':['χ²','df'],
  'D3.3.10':['aquaporin'],
  'D4.1.13':['Hardy–Weinberg','2pq'],
  'D4.2.3':['threshold','model'],
  'D4.3.7':['acidification','bleaching']
 })){
  const v=map.get(id);assert.ok(v,id);
  for(const token of tokens)assert.ok(v.toLowerCase().includes(token.toLowerCase()),id+': '+token);
 }
});

test('word gains and untouched assessment packages match the recorded audit',()=>{
 const sum=ledger.understandings.reduce((n,r)=>n+r.depth.addedWords,0);
 assert.equal(sum,ledger.totals.addedExplanationWords);
 assert.equal(ledger.totals.understandings,171);
 assert.equal(ledger.totals.expandedThisPass,138);
 assert.equal(ledger.totals.shortBelow150,0);
 assert.ok(lessons.every(l=>l.review.reviewer===null&&l.review.status!=='approved'));
 assert.ok(lessons.every(l=>l.questions.length>0));
});
