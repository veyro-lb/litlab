#!/usr/bin/env node
/**
 * Read-only preflight for original BioLab practice question proposals.
 * This tool NEVER edits the production lesson JSON. Changed questions fail closed.
 */
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateQuestion} from './audit.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=path=>JSON.parse(readFileSync(resolve(ROOT,path),'utf8'));
export const questionSha256=q=>createHash('sha256').update(JSON.stringify(q),'utf8').digest('hex');
const validLessonPath=p=>typeof p==='string'&&/^src\/biology\/learning\/[a-z0-9-]+\/lesson\.json$/.test(p);

export function verifyPatchDocument(doc,lessons,registry) {
 const problems=[],seen=new Set(),topics=new Map(registry.map(t=>[t.id,t]));
 if(!Array.isArray(doc.patches))return {patches:0,uniqueTargets:0,matchedFingerprints:0,errors:1,problems:['patches array missing']};
 if(doc.patchCount!==doc.patches.length)problems.push('patchCount differs from patches.length');
 let matchedFingerprints=0;
 for(const patch of doc.patches) {
  const key=String(patch.lessonFile)+'#'+String(patch.questionId);
  if(seen.has(key)){problems.push(key+': duplicate patch key');continue;}seen.add(key);
  if(!validLessonPath(patch.lessonFile)){problems.push(key+': unsafe lesson path');continue;}
  const lesson=lessons[patch.lessonFile];if(!lesson){problems.push(key+': lesson missing');continue;}
  const q=(lesson.questions||[]).find(q=>q.id===patch.questionId);
  if(!q){problems.push(key+': existing question not found');continue;}
  const f=patch.previousContentFingerprint;
  if(!f||f.algorithm!=='sha256'||f.encoding!=='utf8'||f.canonicalization!=='JSON.stringify(parsed-question-object)'||!(/^[a-f0-9]{64}$/.test(f.value||''))){
   problems.push(key+': missing or unsupported original-question SHA-256 fingerprint');continue;
  }
  if(questionSha256(patch.originalQuestion)!==f.value){
   problems.push(key+': originalQuestion snapshot does not match declared fingerprint');continue;
  }
  if(questionSha256(q)!==f.value||JSON.stringify(q)!==JSON.stringify(patch.originalQuestion)){
   problems.push(key+': source question changed since review; refuse to apply');continue;
  }
  matchedFingerprints++;
  if(!patch.sourceLessonBlobSha||!(/^[a-f0-9]{40}$/.test(patch.sourceLessonBlobSha)))problems.push(key+': source lesson blob provenance missing');
  const next=patch.replacementQuestion;
  if(!next||next.id!==q.id||next.sectionId!==q.sectionId||next.level!==q.level||next.paper!==q.paper||next.kind!==q.kind||next.original!==true||JSON.stringify(next.understandingIds)!==JSON.stringify(q.understandingIds)){
   problems.push(key+': protected identifiers, provenance, scope or question kind changed');continue;
  }
  if(q.paper==='1A'&&next.marks!==1)problems.push(key+': Paper 1A item must allocate 1 mark');
  if((q.options||next.options)&&(
   !Array.isArray(q.options)||!Array.isArray(next.options)||
   JSON.stringify(q.options.map(o=>o.id))!==JSON.stringify(next.options.map(o=>o.id))
  )){problems.push(key+': existing option IDs/order must remain stable');continue;}
  if(JSON.stringify(q.referenceIds)!==JSON.stringify(next.referenceIds))
   problems.push(key+': source reference IDs unexpectedly changed');
  if(next.review!=='scientific-review'||patch.reviewStatus!=='pending-qualified-examiner-review')
   problems.push(key+': unsigned review status must not claim approval');
  if(patch.practiceProvenance!=='original-BioLab-IB-inspired-not-official')
   problems.push(key+': missing explicit unofficial-practice provenance');
  if(!Array.isArray(patch.assessmentSkills)||!patch.assessmentSkills.length)
   problems.push(key+': assessment skill mapping missing');
  if(typeof patch.changeRationale!=='string'||patch.changeRationale.length<15)
   problems.push(key+': rationale missing');
  if(!patch.answerKey||!['selection','constructed-response'].includes(patch.answerKey.type))
   problems.push(key+': explicit answer key missing');
  else if(next.options) {
   const correct=next.options.filter(o=>o.correct===true);
   if(patch.answerKey.type!=='selection'||correct.length!==1||correct[0].id!==patch.answerKey.correctOptionId||correct[0].text!==patch.answerKey.correctOptionText)
    problems.push(key+': answer key disagrees with actual correct choice');
  }else if(patch.answerKey.type!=='constructed-response'||patch.answerKey.modelAnswer!==next.answer||
    patch.answerKey.marks!==next.marks||JSON.stringify(patch.answerKey.markingPoints)!==JSON.stringify(next.markingPoints))
    problems.push(key+': written answer key disagrees with marking points');
  const topic=topics.get(lesson.topicId);if(!topic){problems.push(key+': registry topic missing');continue;}
  const context={topicId:lesson.topicId,lessonFile:patch.lessonFile,
   sections:new Map(lesson.sections.map(s=>[s.id,s])),
   understandings:new Map(topic.understandings.map(u=>[u.id,u])),
   references:new Set(lesson.references.map(r=>r.id)),
   assets:new Set(lesson.assets.map(a=>a.id))};
  for(const issue of validateQuestion(next,context).filter(x=>x.severity==='error'))
   problems.push(key+': '+issue.rule+' '+issue.detail);
  if(next.data&&!/hypothetical|invented|illustrative|model|source|experiment/i.test(next.data.caption))
   problems.push(key+': dataset needs a clear provenance label');
  if(!Array.isArray(patch.sourceEvidence)||!patch.sourceEvidence.length||patch.sourceEvidence.some(e=>!e.referenceId||!e.locator))
   problems.push(key+': source provenance missing');
  if(!Array.isArray(patch.reviewLimitations)||!patch.reviewLimitations.length)
   problems.push(key+': explicit review limitations missing');
 }
 return {patches:doc.patches.length,uniqueTargets:seen.size,matchedFingerprints,errors:problems.length,problems,
  note:'Validation only; no lesson changes. Correctness and alternative marks require a qualified examiner.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const doc=read('docs/biology/assessment-quality/PROPOSED_QUESTION_PATCHES.json');
 const registry=read('src/biology/curriculum/registry.json');
 const paths=[...new Set(doc.patches.map(x=>x.lessonFile))];
 const lessons=Object.fromEntries(paths.map(p=>[p,read(p)]));
 const result=verifyPatchDocument(doc,lessons,registry);
 console.log(JSON.stringify(result,null,2));if(result.errors)process.exitCode=1;
}
