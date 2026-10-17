#!/usr/bin/env node
/**
 * Read-only patch preflight. Does NOT overwrite lesson JSON.
 * Run against the exact integrated source or use --relaxed-baseline after illustration changes.
 */
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {validateQuestion} from './audit.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=path=>JSON.parse(readFileSync(resolve(ROOT,path),'utf8'));
export function verifyPatchDocument(doc,lessons,registry){
 const problems=[],seen=new Set(),topics=new Map(registry.map(t=>[t.id,t]));
 for(const patch of doc.patches||[]){
  const key=patch.lessonFile+'#'+patch.questionId;
  if(seen.has(key)){problems.push(key+': duplicate patch key');continue;}seen.add(key);
  const lesson=lessons[patch.lessonFile];if(!lesson){problems.push(key+': lesson missing');continue;}
  const q=(lesson.questions||[]).find(q=>q.id===patch.questionId);
  if(!q){problems.push(key+': existing question not found');continue;}
  if(JSON.stringify(q)!==JSON.stringify(patch.originalQuestion)){problems.push(key+': source question changed; stop and rebase this patch');continue;}
  const next=patch.replacementQuestion;
  if(next.id!==q.id||next.sectionId!==q.sectionId||next.level!==q.level||next.paper!==q.paper||next.kind!==q.kind||JSON.stringify(next.understandingIds)!==JSON.stringify(q.understandingIds)){
   problems.push(key+': protected identifiers, scope or question kind changed');continue;
  }
  if((q.options||next.options)&&(
    !Array.isArray(q.options)||!Array.isArray(next.options)||
    JSON.stringify(q.options.map(o=>o.id))!==JSON.stringify(next.options.map(o=>o.id))
  )){problems.push(key+': existing option IDs/order must remain stable');continue;}
  if(JSON.stringify(q.referenceIds)!==JSON.stringify(next.referenceIds)) {problems.push(key+': source reference IDs unexpectedly changed');continue;}
  const topic=topics.get(lesson.topicId);if(!topic){problems.push(key+': registry topic missing');continue;}
  const context={topicId:lesson.topicId,lessonFile:patch.lessonFile,sections:new Map(lesson.sections.map(s=>[s.id,s])),understandings:new Map(topic.understandings.map(u=>[u.id,u])),references:new Set(lesson.references.map(r=>r.id)),assets:new Set(lesson.assets.map(a=>a.id))};
  const invalid=validateQuestion(next,context).filter(x=>x.severity==='error');
  for(const issue of invalid)problems.push(key+': '+issue.rule+' '+issue.detail);
  if(next.data&&!/hypothetical|invented|illustrative|source|experiment/i.test(next.data.caption))problems.push(key+': dataset needs provenance label');
  if(!Array.isArray(patch.sourceEvidence)||!patch.sourceEvidence.length)problems.push(key+': missing source provenance');
  if(!Array.isArray(patch.reviewLimitations)||!patch.reviewLimitations.length)problems.push(key+': missing review limitations');
 }
 return {patches:doc.patches?.length||0,uniqueTargets:seen.size,errors:problems.length,problems};
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
