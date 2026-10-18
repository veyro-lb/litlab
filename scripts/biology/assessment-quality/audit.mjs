#!/usr/bin/env node
/**
 * Independent assessment structural validator. No lesson files are modified.
 * Scientific truth, data provenance and diagram identity require human review.
 * Usage: node scripts/biology/assessment-quality/audit.mjs
 */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const norm=x=>String(x??'').replace(/\s+/g,' ').trim();
function push(out,severity,rule,where,detail){out.push({severity,rule,...where,detail});}
export function validateChoice(q,where={}){
 const out=[],options=q.options;
 if(!Array.isArray(options)||options.length<2){push(out,'error','missing-options',where,'Selection requires at least two options');return out;}
 const yes=options.filter(o=>o.correct===true);
 if(yes.length!==1)push(out,'error','answer-key',where,'Exactly one option must have correct=true');
 if(options.some(o=>o.correct!==true&&o.correct!==false))push(out,'error','answer-boolean',where,'All options need boolean correct');
 if(new Set(options.map(o=>o.id)).size!==options.length)push(out,'error','duplicate-option-id',where,'Repeated option identifier');
 if(new Set(options.map(o=>norm(o.text))).size!==options.length)push(out,'error','duplicate-option-text',where,'Identical option text (case preserved)');
 if(options.some(o=>!nonempty(o.text)))push(out,'error','missing-option-text',where,'Answer option has no text');
 if(options.some(o=>!nonempty(o.feedback)))push(out,'error','missing-feedback',where,'Every option requires feedback');
 const wrong=options.filter(o=>o.correct===false);
 if(wrong.length>1&&new Set(wrong.map(o=>norm(o.feedback))).size===1)push(out,'review','generic-feedback',where,'Different distractors share feedback; scientific/editorial review required');
 if(wrong.some(o=>/^(incorrect[.!]?\s*)?(not in this case|consider why|review the lesson)/i.test(norm(o.feedback))))
  push(out,'review','boilerplate-feedback',where,'Feedback may not diagnose distractor misconception');
 return out;
}
export function validateData(data,where={}){
 const out=[];
 if(!data||!Array.isArray(data.headers)||!Array.isArray(data.rows)||data.headers.length<2||!data.rows.length||data.headers.some(x=>!nonempty(x)))
  push(out,'error','dataset-geometry',where,'Require at least 2 named columns and one row');
 else if(data.rows.some(row=>!Array.isArray(row)||row.length!==data.headers.length||row.some(cell=>typeof cell==='number'&&!Number.isFinite(cell))))
  push(out,'error','dataset-geometry',where,'Each row must match header length and numbers must be finite');
 if(data&&!nonempty(data.caption))push(out,'review','data-provenance',where,'Caption should identify real source or hypothetical illustrative data');
 return out;
}
export function validateQuestion(q,ctx){
 const out=[],where={topicId:ctx.topicId,itemId:q.id||'(no id)',lessonFile:ctx.lessonFile};
 const add=(sev,rule,detail)=>push(out,sev,rule,where,detail);
 if(!nonempty(q.id)||!nonempty(q.prompt))add('error','question-empty','Question identifier and prompt required');
 if(!Number.isInteger(q.marks)||q.marks<1)add('error','invalid-mark-allocation','Marks must be positive integers');
 if(!['1A','1B','2'].includes(q.paper))add('error','invalid-paper','Paper must be 1A, 1B or 2');
 if(!ctx.sections.has(q.sectionId))add('error','missing-section','Referenced section does not exist');
 const ids=q.understandingIds||[];
 if(!Array.isArray(ids)||!ids.length)add('error','missing-understanding','Understanding IDs required');
 for(const id of ids){
  const u=ctx.understandings.get(id);
  if(!u)add('error','unknown-understanding','Unregistered understanding '+id);
  else if(q.level!==u.level)add('error','scope-leak','Question level differs from IB understanding '+id+' ('+u.level+')');
  else if(ctx.sections.has(q.sectionId)&&!ctx.sections.get(q.sectionId).understandingIds.includes(id))
   add('review','cross-section-link','Question connects a different valid understanding; confirm deliberate cross-section placement');
 }
 if(ctx.sections.has(q.sectionId)&&ctx.sections.get(q.sectionId).level!==q.level)add('error','section-scope','Section level differs from question level');
 for(const id of q.referenceIds||[])if(!ctx.references.has(id))add('error','missing-source','Unknown local source reference '+id);
 if(!Array.isArray(q.referenceIds)||!q.referenceIds.length)add('review','missing-source','No evidence references');
 if(Array.isArray(q.options))out.push(...validateChoice(q,where));
 else if(q.kind==='selection')add('error','missing-options','Selection question has no options');
 else{
  if(!nonempty(q.answer)||!Array.isArray(q.markingPoints)||!q.markingPoints.length)add('error','missing-marking-guidance','Written response requires answer and marking points');
  else{
   if(q.markingPoints.length!==q.marks)add('error','mark-count','Marking point count differs from stated marks; split or identify permissible alternatives');
   if(q.markingPoints.some(x=>!nonempty(x)))add('error','blank-marking-point','Marking point is blank');
   if(new Set(q.markingPoints.map(norm)).size!==q.markingPoints.length)add('error','duplicate-marking-point','Repeated marking point');
  }
 }
 if(q.data)out.push(...validateData(q.data,where));
 const deps=[...(q.assetIds||[]),...(q.figureIds||[]),...(q.figureId?[q.figureId]:[])];
 for(const id of deps)if(!ctx.assets.has(id))add('error','missing-figure','Question figure asset ID not in this lesson: '+id);
 if(/(?:diagram|micrograph|the figure)/i.test(q.prompt)&&!deps.length)add('review','figure-revalidation','Figure-dependent language lacks explicit asset ID; check rendering and asset mapping');
 return out;
}
export function validateLesson(lesson,topic,lessonFile='',publicRoot=null){
 const out=[],ctx={topicId:topic.id,lessonFile,understandings:new Map(topic.understandings.map(u=>[u.id,u])),sections:new Map((lesson.sections||[]).map(s=>[s.id,s])),references:new Set((lesson.references||[]).map(r=>r.id)),assets:new Set((lesson.assets||[]).map(a=>a.id))};
 const add=(sev,rule,itemId,detail)=>push(out,sev,rule,{topicId:topic.id,lessonFile,itemId},detail);
 if(lesson.topicId!==topic.id)add('error','lesson-topic',topic.id,'Lesson ID and registry topic mismatch');
 const seen=new Set();
 for(const q of lesson.questions||[]){
  if(seen.has(q.id))add('error','duplicate-question-id',q.id,'Repeated question ID');seen.add(q.id);
  out.push(...validateQuestion(q,ctx));
 }
 for(const section of lesson.sections||[]){
  for(const r of section.recall||[]){
   if(!nonempty(r.prompt)||!nonempty(r.answer))add('error','flashcard-incomplete',r.id,'Recall requires meaningful prompt and answer');
   for(const id of r.understandingIds||[])if(!ctx.understandings.has(id))add('error','flashcard-understanding',r.id,'Unknown recall understanding '+id);
  }
  for(const m of section.misconceptions||[])if(!nonempty(m.misconception)||!nonempty(m.correction))
   add('error','misconception-incomplete',section.id,'Misconception and correction required');
  for(const q of [...(section.interactions||[]),...(section.prediction?.question?[section.prediction.question]:[])]){
   const where={topicId:topic.id,lessonFile,itemId:q.id||section.id};
   out.push(...validateChoice(q,where));
   for(const id of q.understandingIds||[])if(!ctx.understandings.has(id))add('error','embedded-understanding',q.id,'Unregistered understanding '+id);
  }
  for(const stage of section.mechanismChallenge?.stages||[])out.push(...validateChoice(stage,{topicId:topic.id,lessonFile,itemId:stage.id}));
 }
 for(const a of lesson.assets||[]){
  if(a.withheldReason)continue;
  for(const field of ['src','mobileSrc','recallSrc','recallMobileSrc']){
   const src=a[field];if(!src)continue;
   if(src.startsWith('/')&&publicRoot&&!existsSync(resolve(publicRoot,src.slice(1))))
    add('error','missing-figure-file',a.id,'Missing local asset '+src);
  }
 }
 return out;
}
export function audit(root=ROOT){
 const registry=JSON.parse(readFileSync(resolve(root,'src/biology/curriculum/registry.json'),'utf8'));
 const catalog=JSON.parse(readFileSync(resolve(root,'src/biology/learning/catalog.json'),'utf8'));
 const issues=[],counts={topics:0,practiceQuestions:0,embeddedInteractions:0,recallCards:0},perTopic=[];
 for(const t of registry){
  const entry=catalog[t.lessonId];if(!entry){push(issues,'error','missing-catalog',{topicId:t.id,itemId:t.id},'Topic has no lesson');continue;}
  const path='src/biology/learning/'+entry.path.replace(/^\.\//,'');
  const L=JSON.parse(readFileSync(resolve(root,path),'utf8'));
  const errors=validateLesson(L,t,path,resolve(root,'public'));
  issues.push(...errors);
  const embedded=L.sections.reduce((n,s)=>n+(s.interactions?.length||0)+(s.prediction?.question?1:0)+(s.mechanismChallenge?.stages?.length||0),0);
  const cards=L.sections.reduce((n,s)=>n+(s.recall?.length||0),0);
  counts.topics++;counts.practiceQuestions+=L.questions.length;counts.embeddedInteractions+=embedded;counts.recallCards+=cards;
  perTopic.push({topicId:t.id,questions:L.questions.length,errors:errors.filter(x=>x.severity==='error').length,reviews:errors.filter(x=>x.severity==='review').length});
 }
 return {sourceSha:process.env.GITHUB_SHA||null,counts,severityCounts:{errors:issues.filter(x=>x.severity==='error').length,review:issues.filter(x=>x.severity==='review').length},issues,perTopic,limitations:['Structural consistency only; does not establish scientific correctness','Cross-section linked questions are editorial review flags, not automatic errors','Figure identity and data provenance require human validation']};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=audit();console.log(JSON.stringify(result,null,2));
 if(result.severityCounts.errors)process.exitCode=1;
}
