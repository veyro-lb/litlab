import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validateLesson} from './validate-lesson.mjs';

export function validateBatch5(registry,catalog,lessons){
 const errors=[];
 for(const [id,shared,hl,figureMinimum,writtenMinimum] of [['A1.2',10,5,8,3],['C1.1',10,7,10,4]]){
  const t=registry.find(x=>x.id===id),d=lessons[id];
  if(!t||!d){errors.push('Missing topic '+id);continue;}
  const all=t.understandings;
  if(all.length!==shared+hl||all.some((u,i)=>u.id!==id+'.'+(i+1)))errors.push('Numbered syllabus mismatch '+id);
  if(all.filter(u=>u.level==='shared').length!==shared||all.filter(u=>u.level==='HL').length!==hl)errors.push('SL/HL boundary mismatch '+id);
  if(t.lessonId!==d.id||t.availability!=='draft'||catalog[d.id]?.topicId!==id)errors.push('Topic not correctly registered '+id);
  errors.push(...validateLesson(d,t).map(e=>id+': '+e));
  for(const u of all){
   const s=d.sections.find(s=>s.understandingIds.includes(u.id));
   if(!s){errors.push('Missing section '+u.id);continue;}
   if(!u.studentTitle||s.guidePage!==u.guidePage||s.pdfPage!==u.pdfPage)errors.push('Title / guide locator mismatch '+u.id);
   if(!s.textbook?.printedPages?.length||!s.textbook.printedPages.every((x,i)=>s.textbook.pdfPages[i]===x+12))errors.push('Hodder locator mismatch '+u.id);
   if(!s.teachingBlocks||s.teachingBlocks.length<2||!s.interactions?.length||!s.recall?.length||!s.misconceptions[0]?.correction)errors.push('Missing teaching sequence '+u.id);
   if(!d.questions.some(q=>q.paper==='1A'&&q.understandingIds.includes(u.id)))errors.push('Missing MCQ '+u.id);
  }
  if(d.questions.filter(q=>q.paper==='1A').length<all.length||d.questions.filter(q=>q.paper!=='1A').length<writtenMinimum)errors.push('Question bank too small '+id);
  if(d.questions.filter(q=>q.paper==='1A').some(q=>q.options.length!==4||q.options.filter(o=>o.correct).length!==1||q.options.some(o=>o.feedback.trim().length<15)))errors.push('MCQ answer/feedback invalid '+id);
  if(d.assets.length<figureMinimum||d.assets.some(a=>{
   const authoredNucleosome=id==='A1.2'&&a.id==='a12-nucleosome'&&a.src==='/biology/nucleic-acids/nucleosome-topology-20261017.svg';
   return (!a.recallSrc&&!authoredNucleosome)||!a.src||!['HL','shared'].includes(a.level)||a.review!=='scientific-review'||!a.permissionEvidence;
  }))errors.push('Original/recall assets missing '+id);
  if(d.review.status!=='scientific-review'||d.review.reviewer!==null)errors.push('Human review falsely recorded '+id);
 }
 const a=lessons['A1.2'],c=lessons['C1.1'];
 if(a){
  const s=id=>a.sections.find(x=>x.understandingIds[0]===id);
  if(!s('A1.2.13')?.molecularViewer?.url.startsWith('https://www.rcsb.org/3d-view/1KX5')||!s('A1.2.13')?.molecularViewer?.fallback.includes('does not satisfy'))errors.push('Missing guided hands-on nucleosome software use');
  if(!s('A1.2.8')?.explanation.includes('coding DNA strand')||!s('A1.2.8')?.explanation.includes('template'))errors.push('Transcription correction absent');
  if(!s('A1.2.6')?.explanation.includes('antiparallel')||!s('A1.2.13')?.explanation.includes('H1'))errors.push('DNA/nucleosome scientific invariants absent');
  if(!a.questions.some(q=>q.paper==='1B'&&/invented|illustrative/i.test(q.data?.caption||'')))errors.push('No disclosed illustrative DNA data exercise');
 }
 if(c){
  const s=id=>c.sections.find(x=>x.understandingIds[0]===id);
  if(!s('C1.1.11')?.explanation.includes('exocytosis')||!s('C1.1.11')?.explanation.includes('endocytosis'))errors.push('Secretion correction absent');
  if(!s('C1.1.10')?.explanation.includes('net energy difference')||!/β-lactamases|beta-lactamases/i.test(s('C1.1.17')?.explanation||''))errors.push('Activation energy/PBP correction absent');
  for(const id of ['C1.1.8','C1.1.9','C1.1.10','C1.1.15']){
   const section=s(id);
   if(!section?.graphTables?.length)errors.push('Missing graph table '+id);
   for(const g of section?.graphTables||[]){
    if(!/model|theoretical|illustrative|invented/i.test(g.caption)||!g.headers.some(h=>/min|mol|energy|time|°C|pH/.test(h)))errors.push('Graph provenance/units missing '+id);
    if(g.rows.some(row=>row.length!==g.headers.length||row.some(v=>typeof v!=='number'||!Number.isFinite(v))))errors.push('Invalid numeric table '+id);
   }
  }
  const time=s('C1.1.9')?.graphTables?.[0];
  if(time&&!(Math.abs((time.rows[1][1]-time.rows[0][1])/(time.rows[1][0]-time.rows[0][0])-17.008)<0.01))errors.push('Reaction time-course arithmetic incorrect');
  const energy=s('C1.1.10')?.graphTables?.[0];
  if(energy&&!(energy.rows[0][1]===energy.rows[0][2]&&energy.rows.at(-1)[1]===energy.rows.at(-1)[2]))errors.push('Activation energy net difference drift');
  const substrate=s('C1.1.8')?.graphTables?.find(g=>g.caption.includes('Michaelis'));
  if(substrate&&!(substrate.rows.find(row=>row[0]===2)?.[1]===5))errors.push('Michaelis–Menten model arithmetic incorrect');
 }
 return errors;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const root=new URL('../src/biology/',import.meta.url);
 const registry=JSON.parse(await readFile(new URL('curriculum/registry.json',root),'utf8'));
 const catalog=JSON.parse(await readFile(new URL('learning/catalog.json',root),'utf8'));
 const lessons={'A1.2':JSON.parse(await readFile(new URL('learning/nucleic-acids/lesson.json',root),'utf8')),'C1.1':JSON.parse(await readFile(new URL('learning/enzymes-metabolism/lesson.json',root),'utf8'))};
 const e=validateBatch5(registry,catalog,lessons);
 if(e.length){console.error(e.join('\n'));process.exitCode=1;}else console.log('Batch 2: all 32 scoped sections, 32 MCQs, source/asset/graph contracts and scientific invariants pass structural validation. Qualified review still pending.');
}