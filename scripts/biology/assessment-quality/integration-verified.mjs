import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const canonical=value=>JSON.stringify(value);
const sha=value=>createHash('sha256').update(canonical(value)).digest('hex');
export function verifyIntegrationPlan(plan,lessons){
  assert.equal(plan.patchCount,25,'Expected exactly 25 individually fingerprinted proposals');
  assert.equal(plan.patches.length,25,'Proposal count mismatch');
  assert.equal(plan.blockedProposals?.length,1,'Separate blocked draft must be visible');
  assert.equal(plan.blockedProposals[0].questionId,'d43-written-1','Unexpected blocked draft');
  assert.equal(plan.blockedProposals[0].canApply,false,'Blocked draft improperly enabled');
  const keys=new Set(),result=[];
  for(const patch of plan.patches){
    const key=patch.lessonFile+'#'+patch.questionId;
    assert(!keys.has(key),'Duplicate question patch '+key);keys.add(key);
    assert.equal(patch.reviewStatus,'pending-qualified-examiner-review',key+': reviewer status');
    assert.match(patch.lessonFile,/^src\/biology\/learning\/[a-z-]+\/lesson\.json$/,key+': safe lesson path');
    assert.equal(patch.previousContentFingerprint?.algorithm,'sha256',key+': fingerprint algorithm');
    assert.equal(sha(patch.originalQuestion),patch.previousContentFingerprint.value,key+': original SHA-256 fingerprint');
    const lesson=lessons[patch.lessonFile];assert(lesson,key+': missing live lesson');
    const matches=lesson.questions.filter(q=>q.id===patch.questionId);
    assert.equal(matches.length,1,key+': unique live question');
    const question=matches[0],replacement=patch.replacementQuestion;
    assert.equal(canonical(question),canonical(replacement),key+': approved-for-integration draft not identical to recorded replacement');
    assert.equal(question.review,'scientific-review',key+': draft review label');
    assert.equal(question.original,true,key+': original BioLab practice');
    assert.equal(question.id,patch.questionId,key+': question ID');
    assert.equal(question.level,patch.level,key+': SL/HL classification');
    assert.equal(question.sectionId,patch.sectionId,key+': section mapping');
    assert.equal(canonical(question.understandingIds),canonical(patch.understandingIds),key+': understanding ID mapping');
    assert.equal(canonical(question.referenceIds),canonical(patch.originalQuestion.referenceIds),key+': preserved source references');
    // The one explicitly fingerprinted exception expands a 3-mark generic question
    // into five independently keyed subparts. All other allocations remain immutable.
    if (question.marks !== patch.originalQuestion.marks) {
      assert.equal(key,'src/biology/learning/inheritance/lesson.json#d32-written-2',key+': unauthorized mark-allocation change');
      assert.equal(patch.originalQuestion.marks,3,key+': original allocated marks must be 3');
      assert.equal(question.marks,5,key+': revised allocated marks must be 5');
      assert.equal(patch.answerKey.marks,5,key+': answer key allocation must be 5');
      assert.match(question.prompt,/\\[5 marks\\]$/,key+': five parts must explicitly display five marks');
      assert.equal(question.markingPoints?.length,5,key+': five independently keyed marking points required');
      assert.match(question.prompt,/\\(a\\).*\\(b\\).*\\(c\\).*\\(d\\).*\\(e\\)/s,key+': five subparts must be present');
    } else {
      assert.equal(question.marks,patch.originalQuestion.marks,key+': mark allocation altered');
    }
    if(question.kind==='selection'){
      assert.equal(question.options.filter(x=>x.correct).length,1,key+': exactly one keyed response');
      assert.equal(question.options.find(x=>x.correct).id,patch.answerKey.correctOptionId,key+': answer key mismatch');
      assert(question.options.every(x=>x.feedback&&x.feedback.length>8),key+': missing diagnostic choice feedback');
    }else{
      assert.equal(question.markingPoints.length,question.marks,key+': independent marking points not mapped to marks');
      assert.equal(canonical(question.markingPoints),canonical(patch.answerKey.markingPoints),key+': examiner guidance mismatch');
      assert.equal(question.answer,patch.answerKey.modelAnswer,key+': response model mismatch');
    }
    result.push({id:patch.questionId,lesson:lesson.topicId,level:question.level,status:'integrated-draft-awaiting-examiner'});
  }
  return{integrated:result.length,blocked:plan.blockedProposals.map(q=>q.questionId),independentExaminerApproval:false,questions:result};
}
export function loadPlan(){
  const plan=read('docs/biology/assessment-quality/PROPOSED_QUESTION_PATCHES.json');
  const paths=[...new Set(plan.patches.map(p=>p.lessonFile))];
  const lessons=Object.fromEntries(paths.map(path=>[path,read(path)]));
  return{plan,lessons};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=verifyIntegrationPlan(...Object.values(loadPlan()));
  const output=resolve(root,'qa-artifacts/assessment-integrity');
  mkdirSync(output,{recursive:true});
  writeFileSync(resolve(output,'integration-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:'PASS',integrated:report.integrated,blocked:report.blocked,independentExaminerApproval:false},null,2));
}
