import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyPatchDocument,questionSha256} from './verify-patches.mjs';
const path='src/biology/learning/test-topic/lesson.json';
const topic={id:'X1.1',understandings:[{id:'X1.1.1',level:'shared'}]};
const choice=()=>({id:'original-1',paper:'1A',kind:'selection',original:true,level:'shared',sectionId:'unit-1',referenceIds:['guide'],understandingIds:['X1.1.1'],marks:1,
 prompt:'Which explanation follows from the evidence?',review:'draft',
 options:[{id:'a',text:'Evidence supports A',correct:true,feedback:'The inference follows from the mechanism.'},
 {id:'b',text:'Evidence supports B',correct:false,feedback:'B confuses association and causal mechanism.'},
 {id:'c',text:'Evidence supports C',correct:false,feedback:'C assumes a measurement not present.'}]});
const environment=()=>{
 const q=choice(),next={...structuredClone(q),prompt:'Interpret a new hypothetical observation.',review:'scientific-review'};
 const patch={lessonFile:path,sourceLessonBlobSha:'a'.repeat(40),questionId:q.id,
  originalQuestion:structuredClone(q),replacementQuestion:next,previousContentFingerprint:{algorithm:'sha256',encoding:'utf8',canonicalization:'JSON.stringify(parsed-question-object)',value:questionSha256(q)},
  sourceEvidence:[{referenceId:'guide',locator:'Guide p. 22'}],
  reviewLimitations:['Human biology examiner must review'],
  changeRationale:'Replaces cue recognition with mechanistic inference.',
  assessmentSkills:['Paper 1A'],reviewStatus:'pending-qualified-examiner-review',
  practiceProvenance:'original-BioLab-IB-inspired-not-official',
  answerKey:{type:'selection',correctOptionId:'a',correctOptionText:'Evidence supports A'}};
 const lesson={topicId:'X1.1',questions:[q],sections:[{id:'unit-1',level:'shared',understandingIds:['X1.1.1']}],references:[{id:'guide'}],assets:[]};
 return {doc:{patchCount:1,patches:[patch]},lessons:{[path]:lesson},registry:[topic],patch,lesson};
};
const check=e=>verifyPatchDocument(e.doc,e.lessons,e.registry);
test('unchanged source question and complete proposal pass fingerprint-guarded preflight',()=>{const r=check(environment());assert.equal(r.errors,0,JSON.stringify(r.problems));assert.equal(r.matchedFingerprints,1)});
test('fingerprint SHA256 matches known stable string representation',()=>assert.equal(questionSha256({a:'b'}),'db4a7ecb114bc66c623a06c4ff6fe8daa2f49cc270ebbf7a1f81e22ab061c837'));
test('a changed live question fails closed without overwriting it',()=>{const e=environment();e.lesson.questions[0].prompt='Parallel editorial edit';assert.ok(check(e).problems.some(x=>x.includes('source question changed')));assert.equal(e.lesson.questions[0].prompt,'Parallel editorial edit')});
test('tampered original snapshot is rejected even if source question is untouched',()=>{const e=environment();e.patch.originalQuestion.prompt='Altered snapshot';assert.ok(check(e).problems.some(x=>x.includes('snapshot does not match')))});
test('missing fingerprint and duplicate target fail',()=>{const e=environment();delete e.patch.previousContentFingerprint;assert.ok(check(e).problems.some(x=>x.includes('fingerprint')));e.patch.previousContentFingerprint={algorithm:'sha256',encoding:'utf8',canonicalization:'JSON.stringify(parsed-question-object)',value:questionSha256(e.patch.originalQuestion)};e.doc.patches.push(structuredClone(e.patch));e.doc.patchCount=2;assert.ok(check(e).problems.some(x=>x.includes('duplicate patch')))});
test('answer keys, review status and references are protected',()=>{const e=environment();e.patch.answerKey.correctOptionId='b';e.patch.reviewStatus='approved';e.patch.replacementQuestion.referenceIds=['missing'];const p=check(e).problems;assert.ok(p.some(x=>x.includes('answer key')));assert.ok(p.some(x=>x.includes('review status')));assert.ok(p.some(x=>x.includes('source reference IDs')))});
test('no arbitrary paths, copied official claims or mismatched metadata',()=>{const e=environment();e.patch.lessonFile='../../public/biology/lesson.json';e.doc.patchCount=3;const p=check(e).problems;assert.ok(p.some(x=>x.includes('unsafe lesson path')));assert.ok(p.some(x=>x.includes('patchCount')))});
test('written marking guidance and independent mark allocations validated',()=>{const e=environment(),q=e.lesson.questions[0];delete q.options;q.paper='2';q.kind='structured';q.marks=2;q.answer='A and B';q.markingPoints=['A','B'];e.patch.originalQuestion=structuredClone(q);e.patch.replacementQuestion={...structuredClone(q),review:'scientific-review',markingPoints:['A','A']};e.patch.previousContentFingerprint.value=questionSha256(q);e.patch.answerKey={type:'constructed-response',modelAnswer:'A and B',marks:2,markingPoints:['A','A']};assert.ok(check(e).problems.some(x=>x.includes('duplicate-marking-point')))});
