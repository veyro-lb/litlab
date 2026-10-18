import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {referenceIdentity,validateStudentSourceList,inspectLessonSources,buildUnderstandingMatrix,auditCourse} from './ib-source-policy.mjs';

test('the two authorized IB sources have canonical identities and verified destinations',async()=>{
 const sources=JSON.parse(await readFile(new URL('../../src/biology/learning/approved-sources.json',import.meta.url),'utf8'));
 assert.deepEqual(validateStudentSourceList(sources),[]);
 assert.ok(validateStudentSourceList([sources[0],sources[0]]).length);
 assert.ok(validateStudentSourceList([...sources,{...sources[1],identity:'external'}]).length);
 assert.ok(validateStudentSourceList([{...sources[0],url:'https://unauthorized.invalid/'},sources[1]]).length);
});
test('Hodder and Guide aliases deduplicate by identity, not by title or legacy reference id',()=>{
 const lesson={references:[
  {id:'a',title:'IB Biology Guide (first assessment 2025)'},
  {id:'b',title:'International Baccalaureate, Biology guide (first assessment 2025)'},
  {id:'c',title:'Clegg, Davis and Talbot, Biology for the IB Diploma Programme, third edition (Hodder, 2023)'},
  {id:'d',title:'Hodder Biology Third Edition — Clegg, Davis and Talbot'},
  {id:'e',title:'NCBI Bookshelf: unapproved historical scientific evidence'}
 ],sections:[]};
 const result=inspectLessonSources(lesson);
 assert.equal(result.duplicates.length,2);
 assert.equal(result.external.length,1);
 assert.equal(result.missingGuide,false);
 assert.equal(result.missingHodder,false);
 assert.equal(referenceIdentity(lesson.references[4]),null);
});
test('ledger never mistakes a populated catalog section for verified scientific approval',()=>{
 const topics=[{id:'A1.1',understandings:[{id:'A1.1.1',studentTitle:'Water as the medium for life',level:'shared',guidePage:34,pdfPage:40}]}];
 const lessons=new Map([['A1.1',{review:{status:'scientific-review'},references:[{id:'h',title:'Clegg, Davis and Talbot, Biology for the IB Diploma, third edition'}],sections:[{id:'water-1',understandingIds:['A1.1.1'],referenceIds:['h'],claimReferences:[{referenceIds:['h']}],explanation:'Aqueous medium',assets:[]}],questions:[{understandingIds:['A1.1.1']}]}]]);
 const rows=buildUnderstandingMatrix(topics,lessons);
 assert.equal(rows.length,1);
 assert.equal(rows[0].lessonCoverage.explanationPresent,true);
 assert.equal(rows[0].editorialReview.status,'pending-qualified-editorial-verification');
 assert.equal(rows[0].officialGuide.officialRequirementText,null);
});
test('whole registered BioLab course has no unapproved student Sources entries',async()=>{
 const {errors,report,matrix}=await auditCourse();
 assert.deepEqual(errors,[]);
 assert.equal(report.topics,40);
 assert.equal(report.understandings,553);
 assert.equal(matrix.filter(r=>r.editorialReview.status==='pending-qualified-editorial-verification').length,553);
 assert.equal(report.approvedStudentFacingReferenceEntries,80);
 assert.ok(report.externalTeachingReferencesRemovedFromStudents>0);
});

test('four committed review matrices preserve all 553 official identifiers and level boundaries',async()=>{
 const files=['A','B','C','D'];
 const all=(await Promise.all(files.map(async theme=>JSON.parse(await readFile(new URL('../../docs/biology/IB_SOURCE_MATRIX_THEME_'+theme+'.json',import.meta.url),'utf8'))))).flat();
 assert.equal(all.length,553);
 assert.equal(new Set(all.map(row=>row.understandingId)).size,553);
 assert.equal(all.filter(row=>row.scope==='SL+HL').length,337);
 assert.equal(all.filter(row=>row.scope==='HL-only').length,216);
 assert.equal(all.filter(row=>row.review.qualifiedScienceApproval).length,0);
 assert.equal(all.filter(row=>row.officialGuide.verifiedAgainstGuide).length,8);
 assert.ok(all.every(row=>row.hodder.printedPages.length&&row.coverage.explanationPresent&&row.coverage.questionCount>0));
});
