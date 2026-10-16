// Phase 3.2 bounded two-topic production checks. Structural and provenance checks, not scientific certification.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validateLesson} from './validate-lesson.mjs';

const root=new URL('../src/biology/',import.meta.url);
export function validateBatch32(registry,catalog,lessonMap){
 const errors=[];
 for(const [topicId,expectedShared,expectedHL,expectedAssets] of [['B1.1',13,0,7],['B1.2',5,7,4]]){
  const t=registry.find(x=>x.id===topicId),d=lessonMap[topicId];
  if(!t||!d){errors.push('Missing topic/lesson '+topicId);continue}
  const ids=t.understandings.map(x=>x.id),prefix=topicId+'.';
  if(ids.length!==expectedShared+expectedHL||ids.some((id,i)=>id!==prefix+(i+1)))errors.push('Incorrect numbered understanding sequence '+topicId);
  if(t.understandings.filter(x=>x.level==='shared').length!==expectedShared||t.understandings.filter(x=>x.level==='HL').length!==expectedHL)errors.push('SL/HL boundary incorrect '+topicId);
  if(t.lessonId!==d.id||t.availability!=='draft'||catalog[d.id]?.topicId!==topicId)errors.push('Catalog/registry drift '+topicId);
  errors.push(...validateLesson(d,t).map(e=>topicId+': '+e));
  const sectionMap=new Map(d.sections.map(s=>[s.understandingIds[0],s]));
  for(const u of t.understandings){
   const s=sectionMap.get(u.id);
   if(!s)continue;
   if(s.guidePage!==u.guidePage||s.pdfPage!==u.pdfPage)errors.push('IB guide page mismatch '+u.id);
   if(!s.textbook?.printedPages?.every((page,i)=>page+12===s.textbook.pdfPages[i]))errors.push('Hodder printed/PDF page mismatch '+u.id);
   if(s.teachingBlocks?.length<2||s.interactions.length<1||s.recall.length<1)errors.push('Missing progressive teaching or retrieval '+u.id);
   if(!d.questions.some(q=>q.understandingIds.includes(u.id)&&q.paper==='1A'))errors.push('No exam-style MCQ for '+u.id);
   if(!u.studentTitle||!s.misconceptions[0]?.correction)errors.push('Missing display title/misconception repair '+u.id);
   if(['B1.1.2','B1.2.2'].includes(u.id)&&!s.mechanismChallenge)errors.push('Missing interactive mechanism reasoning '+u.id);
   if(['B1.1.4','B1.1.10','B1.1.13'].includes(u.id)&&!s.assets.length)errors.push('Missing official molecular recognition diagram '+u.id);
   if(u.id==='B1.1.1'&&!s.recall.some(r=>r.id==='b11-nos-si-prefixes'))errors.push('Unmapped NOS SI prefixes');
   if(u.id==='B1.2.11'&&!s.recall.some(r=>r.id==='b12-nos-cryo'))errors.push('Unmapped NOS cryogenic electron microscopy');
  }
  const mcqPositions=d.questions.filter(q=>q.paper==='1A').map(q=>q.options.findIndex(o=>o.correct));
  const checkPositions=d.sections.map(s=>s.interactions[0]?.options?.findIndex(o=>o.correct)).filter(x=>x>=0);
  if(new Set(mcqPositions).size<4||new Set(checkPositions).size<3)errors.push('Unbalanced fixed-position correct answers '+topicId);
  const mechanismSections=d.sections.filter(s=>s.mechanismChallenge);
  for(const s of mechanismSections)if(new Set(s.mechanismChallenge.stages.map(st=>st.options.findIndex(o=>o.correct))).size<2)errors.push('Fixed-position mechanism predictions '+s.id);
  if(d.assets.length<expectedAssets||d.assets.some(a=>a.review==='approved'||a.alt?.length<75||!a.recallSrc||!a.src.startsWith('/biology/')||a.level==='HL'&&topicId==='B1.1'))errors.push('Missing original accessible recall figures '+topicId);
  if(d.review.reviewer!==null||d.review.status!=='scientific-review')errors.push('Review status misrepresented '+topicId);
  if(d.references.some(r=>r.title.includes('Hodder')&&r.url?.endsWith('.pdf')))errors.push('Copyrighted textbook PDF linked '+topicId);
  if(topicId==='B1.2'&&d.sections.slice(0,5).some(s=>s.level!=='shared'))errors.push('SL protein content hidden');
  if(topicId==='B1.2'&&d.sections.slice(5).some(s=>s.level!=='HL'))errors.push('HL proteins scope exposed');
 }
 return errors;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const registry=JSON.parse(await readFile(new URL('curriculum/registry.json',root),'utf8'));
 const catalog=JSON.parse(await readFile(new URL('learning/catalog.json',root),'utf8'));
 const lessonMap={};
 for(const [id,path] of [['B1.1','learning/carbohydrates-lipids/lesson.json'],['B1.2','learning/proteins/lesson.json']])lessonMap[id]=JSON.parse(await readFile(new URL(path,root),'utf8'));
 const errors=validateBatch32(registry,catalog,lessonMap);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
 else console.log('Phase 3.2: 25/25 syllabus-mapped sections and B1.1/B1.2 contract/provenance gates passed. Qualified scientific and educational approval still pending.');
}
