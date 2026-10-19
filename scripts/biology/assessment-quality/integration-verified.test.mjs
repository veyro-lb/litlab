import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPlan,verifyIntegrationPlan} from './integration-verified.mjs';
test('all 25 revised questions are exact fingerprint-approved-for-integration draft replacements',()=>{
 const {plan,lessons}=loadPlan(),result=verifyIntegrationPlan(plan,lessons);
 assert.equal(result.integrated,25);
 assert.deepEqual(result.blocked,['d43-written-1']);
 assert.equal(result.independentExaminerApproval,false);
});
test('negative: a changed question stem is not silently treated as an integrated patch',()=>{
 const {plan,lessons}=loadPlan(),key=plan.patches[0].lessonFile;
 lessons[key].questions.find(q=>q.id===plan.patches[0].questionId).prompt+=' altered';
 assert.throws(()=>verifyIntegrationPlan(plan,lessons),/not identical/);
});
test('negative: changed marks, misleading reviewer status or blocked draft cannot pass',()=>{
 const a=loadPlan();a.plan.patches[0].reviewStatus='approved';
 assert.throws(()=>verifyIntegrationPlan(a.plan,a.lessons),/reviewer status/);
 const b=loadPlan();b.plan.blockedProposals[0].canApply=true;
 assert.throws(()=>verifyIntegrationPlan(b.plan,b.lessons),/improperly enabled/);
 const c=loadPlan(),p=c.plan.patches.find(p=>p.replacementQuestion.markingPoints);
 c.lessons[p.lessonFile].questions.find(q=>q.id===p.questionId).marks++;
 assert.throws(()=>verifyIntegrationPlan(c.plan,c.lessons),/not identical/);
});
