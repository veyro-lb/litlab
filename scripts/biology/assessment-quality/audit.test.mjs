import test from 'node:test';
import assert from 'node:assert/strict';
import {validateChoice,validateData,validateQuestion,validateLesson} from './audit.mjs';

const section={id:'sec',level:'shared',understandingIds:['A1.1.1'],recall:[],misconceptions:[],interactions:[]};
const topic={id:'A1.1',understandings:[{id:'A1.1.1',level:'shared'},{id:'A1.1.7',level:'HL'}]};
const ctx={topicId:'A1.1',lessonFile:'fixture.json',sections:new Map([['sec',section]]),understandings:new Map(topic.understandings.map(u=>[u.id,u])),references:new Set(['ib']),assets:new Set(['fig'])};
const base=()=>({id:'q',kind:'selection',paper:'1A',prompt:'Which explanation fits?',marks:1,sectionId:'sec',understandingIds:['A1.1.1'],level:'shared',referenceIds:['ib'],options:[{id:'a',text:'Valid explanation',correct:true,feedback:'Mechanism is correctly explained.'},{id:'b',text:'Incorrect claim',correct:false,feedback:'This confuses solvent function with catalytic action.'},{id:'c',text:'Another error',correct:false,feedback:'Here energy input is needed; water does not provide it.'}]});
const has=(issues,rule,severity='error')=>issues.some(x=>x.rule===rule&&x.severity===severity);
test('well-formed selection passes all mechanical gates',()=>assert.equal(validateQuestion(base(),ctx).filter(x=>x.severity==='error').length,0));
test('no correct answer and two correct answers fail',()=>{
 for(const booleans of [[false,false,false],[true,true,false]]){
  const q=base();q.options.forEach((o,i)=>o.correct=booleans[i]);
  assert.ok(has(validateQuestion(q,ctx),'answer-key'));
 }
});
test('duplicate option identifiers and texts fail; capitalization is preserved',()=>{
 const q=base();q.options[2].id='b';q.options[2].text='Incorrect claim';
 assert.ok(has(validateChoice(q),'duplicate-option-id'));
 assert.ok(has(validateChoice(q),'duplicate-option-text'));
 q.options[2].text='incorrect claim';assert.ok(!has(validateChoice(q),'duplicate-option-text'));
});
test('missing option feedback, blank options and boilerplate detected',()=>{
 const q=base();q.options[1].feedback='';q.options[2].text='';
 assert.ok(has(validateChoice(q),'missing-feedback'));assert.ok(has(validateChoice(q),'missing-option-text'));
 q.options[1].feedback='Not in this case';assert.ok(has(validateChoice(q),'boilerplate-feedback','review'));
});
test('feedback diagnostic heuristic does not fail legitimate identical reasoning',()=>{
 const q=base();q.options[1].feedback='Both options confuse covalent bonds with hydrogen bonds.';q.options[2].feedback=q.options[1].feedback;
 assert.ok(has(validateChoice(q),'generic-feedback','review'));
 assert.equal(validateChoice(q).filter(x=>x.severity==='error').length,0);
});
test('HL-only scope leak, bad understanding and broken reference fail',()=>{
 const q=base();q.understandingIds=['A1.1.7'];q.referenceIds=['does-not-exist'];
 assert.ok(has(validateQuestion(q,ctx),'scope-leak'));
 assert.ok(has(validateQuestion(q,ctx),'missing-source'));
 q.understandingIds=['A1.1.99'];
 assert.ok(has(validateQuestion(q,ctx),'unknown-understanding'));
});
test('cross-section valid target is only a review flag',()=>{
 const q=base();q.understandingIds=['A1.1.1','A1.1.7'];q.level='HL';
 // Mixed SL and HL targets is a genuine scope issue.
 assert.ok(has(validateQuestion(q,ctx),'scope-leak'));
 const sameLevel={...ctx,understandings:new Map([['A1.1.1',{level:'shared'}],['A1.1.2',{level:'shared'}]])};
 q.understandingIds=['A1.1.2'];q.level='shared';
 assert.ok(has(validateQuestion(q,sameLevel),'cross-section-link','review'));
 assert.ok(!has(validateQuestion(q,sameLevel),'unknown-understanding'));
});
test('written marking points required and allocations must agree',()=>{
 const q=base();delete q.options;q.kind='structured-response';q.paper='2';q.marks=3;q.answer='Three separate points.';q.markingPoints=['Point one','Point one'];
 assert.ok(has(validateQuestion(q,ctx),'mark-count'));
 assert.ok(has(validateQuestion(q,ctx),'duplicate-marking-point'));
 q.markingPoints=[];assert.ok(has(validateQuestion(q,ctx),'missing-marking-guidance'));
});
test('invalid table shape and unknown asset IDs fail',()=>{
 const q=base();q.data={caption:'Hypothetical data',headers:['A','B'],rows:[[1,2,3]]};
 q.figureId='missing-figure';
 assert.ok(has(validateQuestion(q,ctx),'dataset-geometry'));
 assert.ok(has(validateQuestion(q,ctx),'missing-figure'));
});
test('no invented experimental provenance: unlabelled dataset is review warning',()=>{
 assert.ok(has(validateData({caption:'',headers:['x','y'],rows:[[1,2]]}),'data-provenance','review'));
});
test('flashcard blanks, misconception corrections, and duplicate IDs are detected',()=>{
 const q=base(),L={topicId:'A1.1',questions:[q,{...q}],sections:[{...section,recall:[{id:'rec',prompt:'?',answer:'',understandingIds:['A1.1.1']}],misconceptions:[{misconception:'',correction:''}]}],references:[{id:'ib'}],assets:[]};
 const issues=validateLesson(L,topic,'fixture.json');
 for(const rule of ['duplicate-question-id','flashcard-incomplete','misconception-incomplete'])assert.ok(has(issues,rule),rule);
});
