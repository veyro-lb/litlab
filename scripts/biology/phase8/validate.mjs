// Dedicated Phase 8 validator; requires Node 20+. No shared-system modifications.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export const specs=[
 {topic:'A2.2',file:'src/biology/learning/cell-structure/lesson.json',count:14,shared:11},
 {topic:'B2.3',file:'src/biology/learning/cell-specialization/lesson.json',count:10,shared:6}
];
const statuses=new Set(['draft','source-mapped','scientific-review','approved']);
export function validateLesson(l,s,exists=(p)=>fs.existsSync(path.join(root,p))){
 const e=[],fail=m=>e.push(s.topic+': '+m);
 if(l.schemaVersion!==1||l.topicId!==s.topic||l.curriculumVersion!=='ib-biology-fa2025-v1')fail('schema or topic');
 if(!statuses.has(l.review?.status)||l.review?.status==='approved'||l.review?.reviewer!==null)fail('review approval');
 if(l.sections?.length!==s.count)fail('count');
 const refs=new Set((l.references||[]).map(x=>x.id));
 const assets=new Set((l.assets||[]).map(x=>x.id));
 const secIds=new Set(),seen=new Set();
 for(const [i,x] of (l.sections||[]).entries()){
   const id=s.topic+'.'+(i+1),lev=i<s.shared?'shared':'HL';
   if(x.understandingIds?.length!==1||x.understandingIds[0]!==id||seen.has(id))fail('understanding order '+id);
   seen.add(id);
   if(x.level!==lev)fail('level '+id);
   if(secIds.has(x.id))fail('duplicate section '+id);
   secIds.add(x.id);
   const page=s.topic==='A2.2'?(i<2?39:i<11?40:41):(i<2?55:56);
   if(x.guidePage!==page||x.pdfPage!==page+6)fail('guide page '+id);
   if(!Number.isInteger(x.textbook?.printedPages?.[0])||x.textbook.pdfPages?.[0]!==x.textbook.printedPages[0]+12)fail('Hodder page '+id);
   if(x.explanation?.length<480||x.teachingBlocks?.length<2||!x.workedExample||!x.revisionSummary)fail('short teaching '+id);
   if(!x.misconceptions?.length||!x.recall?.length||!x.interactions?.length||x.terms?.length<3)fail('incomplete pedagogy '+id);
   if(!x.claimReferences?.length||!x.referenceIds?.length)fail('unmapped claim '+id);
   for(const r of x.referenceIds||[])if(!refs.has(r))fail('unknown ref '+r);
   for(const p of x.claimReferences||[])for(const r of p.referenceIds||[])if(!refs.has(r))fail('unknown ref '+r);
   for(const a of x.assets||[])if(!assets.has(a))fail('unknown asset '+a);
   for(const ch of x.interactions||[]){
    if(ch.understandingIds?.[0]!==id||ch.options?.length!==4||ch.options.filter(o=>o.correct).length!==1||ch.options.some(o=>!o.feedback||o.feedback.length<20))fail('invalid check '+id);
   }
 }
 const qids=new Set();
 if(l.questions?.filter(q=>q.options).length<s.count)fail('MCQ count');
 if(l.questions?.filter(q=>q.markingPoints).length<4)fail('written question count');
 for(const q of l.questions||[]){
  if(qids.has(q.id))fail('duplicate question '+q.id);qids.add(q.id);
  const owner=l.sections.find(x=>x.id===q.sectionId);
  if(!owner||q.level!==owner.level||q.understandingIds?.[0]!==owner.understandingIds?.[0])fail('question scope '+q.id);
  if(q.original!==true||!['1A','1B','2'].includes(q.paper))fail('question type '+q.id);
  if(q.options&&(q.options.length!==4||q.options.filter(o=>o.correct).length!==1||q.options.some(o=>!o.feedback||o.feedback.length<20)))fail('invalid MCQ '+q.id);
  if(q.markingPoints&&(!q.answer||q.marks!==q.markingPoints.length))fail('mark guide '+q.id);
  for(const r of q.referenceIds||[])if(!refs.has(r))fail('question ref '+r);
 }
 const seenAssets=new Set();
 for(const a of l.assets||[]){
  if(seenAssets.has(a.id))fail('duplicate asset '+a.id);seenAssets.add(a.id);
  if(!statuses.has(a.review)||a.review==='approved'||!a.alt||!a.captionTitle||!a.license||!a.permissionEvidence||!a.attribution)fail('asset provenance '+a.id);
  for(const p of [a.src,a.recallSrc])if(!p||!p.startsWith('/biology/')||!exists('public'+p))fail('asset missing '+a.id);
  for(const r of a.referenceIds||[])if(!refs.has(r))fail('asset ref '+r);
 }
 if(s.topic==='B2.3'){
  const table=l.sections?.[5]?.graphTables?.[0];
  if(!table||table.rows.some(r=>Number(r[1])!==6*Number(r[0])**2||Number(r[2])!==Number(r[0])**3||Math.abs(Number(r[3])-6/Number(r[0]))>1e-9))fail('SA:V table');
 }
 return e;
}
export function validateAll(){
 const errors=[];
 for(const s of specs){
  let v;
  try{v=JSON.parse(fs.readFileSync(path.join(root,s.file),'utf8'))}
  catch(err){errors.push(s.topic+': file unreadable '+err.message);continue}
  errors.push(...validateLesson(v,s));
 }
 if(60000/30!==2000||6*(2**2)!==24||(2**3)!==8)errors.push('microscope/cube arithmetic');
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const errors=validateAll();
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
 else console.log('Phase 8: positive validation passed for both authored packages');
}
