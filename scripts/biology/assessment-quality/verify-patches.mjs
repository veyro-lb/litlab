#!/usr/bin/env node
/**
 * Read-only patch preflight. Does NOT overwrite lesson JSON.
 * Run against the exact integrated source or use --relaxed-baseline after illustration changes.
 */
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateQuestion} from './audit.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=path=>JSON.parse(readFileSync(resolve(ROOT,path),'utf8'));
// Fingerprint the parsed source question, not an untrusted patch summary.
export const questionSha256=question=>createHash('sha256').update(JSON.stringify(question)).digest('hex');
export function verifyPatchDocument(doc,lessons,registry){
 const problems=[],seen=new Set(),topics=new Map(registry.map(t=>[t.id,t]));
 let matchedFingerprints=0;
 if(!Array.isArray(doc.patches)){return {patches:0,uniqueTargets:0,matchedFingerprints,errors:1,problems:['patches must be an array']};}
 if(doc.patchCount!==undefined&&doc.patchCount!==doc.patches.length)problems.push('patchCount does not match the patches array');
 for(const patch of doc.patches||[]){
  const key=patch.lessonFile+'#'+patch.questionId;
  if(seen.has(key)){problems.push(key+': duplicate patch key');continue;}seen.add(key);
  if(!/^src\/biology\/learning\/[a-z0-9-]+\/lesson\.json$/.test(patch.lessonFile)){
   problems.push(key+': unsafe lesson path');continue;
  }
  const lesson=lessons[patch.lessonFile];if(!lesson){problems.push(key+': lesson missing');continue;}
  const q=(lesson.questions||[]).find(q=>q.id===patch.questionId);
  if(!q){problems.push(key+': existing question not found');continue;}
  const fingerprint=patch.previousContentFingerprint;
  if(!fingerprint||fingerprint.algorithm!=='sha256'||fingerprint.encoding!=='utf8'||fingerprint.canonicalization!=='JSON.stringify(parsed-question-object)'||!(/^[a-f0-9]{64}$/.test(fingerprint.value||''))){
   problems.push(key+': missing or invalid SHA-256 fingerprint');continue;
  }
  if(questionSha256(patch.originalQuestion)!==fingerprint.value){problems.push(key+': original snapshot does not match its fingerprint');continue;}
  if(JSON.stringify(q)!==JSON.stringify(patch.originalQuestion)){
   problems.push(key+': original snapshot does not match live question; source question changed; stop and rebase this patch');continue;
  }
  if(questionSha256(q)!==fingerprint.value){problems.push(key+': live source question changed; fingerprint mismatch');continue;}
  matchedFingerprints++;
  const next=patch.replacementQuestion;
  if(!next||typeof next!=='object'){problems.push(key+': missing replacement question');continue;}
  if(patch.reviewStatus!=='pending-qualified-examiner-review'||next.review==='approved'||next.review!=='scientific-review')
   problems.push(key+': unsafe review status (independent examiner sign-off required)');
  if(next.id!==q.id||next.sectionId!==q.sectionId||next.level!==q.level||next.paper!==q.paper||next.kind!==q.kind||JSON.stringify(next.understandingIds)!==JSON.stringify(q.understandingIds)){
   problems.push(key+': protected identifiers, scope or question kind changed');continue;
  }
  if((q.options||next.options)&&(
    !Array.isArray(q.options)||!Array.isArray(next.options)||
    JSON.stringify(q.options.map(o=>o.id))!==JSON.stringify(next.options.map(o=>o.id))
  )){problems.push(key+': existing option IDs/order must remain stable');continue;}
  if(JSON.stringify(q.referenceIds)!==JSON.stringify(next.referenceIds)) {problems.push(key+': source reference IDs unexpectedly changed');continue;}
  if(next.original!==q.original||next.marks!==q.marks)problems.push(key+': question provenance or mark allocation changed');
  if(next.kind==='selection'){
   const actual=next.options?.filter(o=>o.correct===true)||[];
   if(patch.answerKey?.type!=='selection'||actual.length!==1||patch.answerKey.correctOptionId!==actual[0].id||patch.answerKey.correctOptionText!==actual[0].text)
    problems.push(key+': answer key mismatch with replacement question');
  }else if(patch.answerKey?.type!=='constructed-response'||patch.answerKey.modelAnswer!==next.answer||patch.answerKey.marks!==next.marks||JSON.stringify(patch.answerKey.markingPoints)!==JSON.stringify(next.markingPoints)){
   problems.push(key+': answer key mismatch with written marking guidance');
  }
  const topic=topics.get(lesson.topicId);if(!topic){problems.push(key+': registry topic missing');continue;}
  const context={topicId:lesson.topicId,lessonFile:patch.lessonFile,sections:new Map(lesson.sections.map(s=>[s.id,s])),understandings:new Map(topic.understandings.map(u=>[u.id,u])),references:new Set(lesson.references.map(r=>r.id)),assets:new Set(lesson.assets.map(a=>a.id))};
  const invalid=validateQuestion(next,context).filter(x=>x.severity==='error');
  for(const issue of invalid)problems.push(key+': '+issue.rule+' '+issue.detail);
  if(next.data&&!/hypothetical|invented|illustrative|source|experiment/i.test(next.data.caption))problems.push(key+': dataset needs provenance label');
  if(!Array.isArray(patch.sourceEvidence)||!patch.sourceEvidence.length)problems.push(key+': missing source provenance');
  if(!Array.isArray(patch.reviewLimitations)||!patch.reviewLimitations.length)problems.push(key+': missing review limitations');
 }
 return {patches:doc.patches.length,uniqueTargets:seen.size,matchedFingerprints,errors:problems.length,problems};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const doc=read('docs/biology/assessment-quality/PROPOSED_QUESTION_PATCHES.json');
 const registry=read('src/biology/curriculum/registry.json');
 const paths=[...new Set(doc.patches.map(x=>x.lessonFile))];
 const lessons=Object.fromEntries(paths.map(p=>[p,read(p)]));
 const result=verifyPatchDocument(doc,lessons,registry);
 console.log(JSON.stringify(result,null,2));
 if(result.errors)process.exitCode=1;
}
