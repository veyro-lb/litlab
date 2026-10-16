import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBatch5} from './validate-batch5.mjs';

const ids=(topic,count,shared)=>Array.from({length:count},(_,i)=>({
 id:topic+'.'+(i+1),
 level:i<shared?'shared':'HL',
 guidePage:topic==='A1.2'?35:65,
 pdfPage:topic==='A1.2'?41:71,
 studentTitle:'A distinct student-facing description '+(i+1)
}));
function fixture(topic='A1.2'){
 const count=topic==='A1.2'?15:17,shared=10;
 const t={id:topic,understandings:ids(topic,count,shared)};
 const sections=t.understandings.map((u,i)=>({
 id:'section-'+(i+1),understandingIds:[u.id],level:u.level,
 explanation:'A template DNA strand is read 3′→5′; RNA matches the coding strand except for uracil. Exocytosis; penicillin; isoleucine; competitive feedback inhibition; initial rate and activation energy.',
 workedExample:'A real example',revisionSummary:'Summary',interactions:[{
 kind:'selection',id:'check-'+i,options:[{correct:true,feedback:'A good reason'},{correct:false,feedback:'A correction'}]
 }],recall:[{id:'recall-'+i}],misconceptions:[{misconception:'Incorrect',correction:'Correct'}],
 claimReferences:[{claim:'a claim',referenceIds:['ib']}],guidePage:u.guidePage,pdfPage:u.pdfPage,
 textbook:{printedPages:[14],pdfPages:[26]},
 ...(topic==='A1.2'&&i===12?{molecularViewer:{
 url:'https://www.rcsb.org/3d-view/1KX5',
 fallback:'A complete written alternative',
 studentInstructions:'Rotate model and identify DNA and histones'
 }}:{})
 }));
 const questions=t.understandings.map((u,i)=>({
 id:'mcq-'+i,paper:'1A',original:true,understandingIds:[u.id],
 options:Array.from({length:4},(_,j)=>({id:String(j),text:'answer '+j,correct:j===0,feedback:'Specific feedback'}))
 }));
 for(let i=0;i<(topic==='A1.2'?2:4);i++)questions.push({id:'written-'+i,paper:'2'});
 for(let i=0;i<(topic==='A1.2'?1:2);i++)questions.push({id:'data-'+i,paper:'1B',data:{caption:'Illustrative test data'}});
 const assets=Array.from({length:8},(_,i)=>({id:'diagram-'+i,kind:'diagram',
 recallSrc:'/biology/draft/recalled-'+i+'.svg',alt:'Accessible written depiction',
 permissionEvidence:'Original and unlicensed material excluded',review:'scientific-review'}));
 return {t,lesson:{sections,questions,assets,review:{status:'scientific-review',reviewer:null}}};
}
test('accepts a structurally complete A1.2 fixture (not science approval)',()=>{
 const {t,lesson}=fixture();
 assert.deepEqual(validateBatch5(t,lesson),[]);
});
test('rejects missing molecular software guidance, HL leaks, and wrong pages',()=>{
 const {t,lesson}=fixture();
 delete lesson.sections[12].molecularViewer;
 lesson.sections[11].level='shared';
 lesson.sections[0].pdfPage=40;
 const issues=validateBatch5(t,lesson).join(' | ');
 assert.match(issues,/molecular viewer/);
 assert.match(issues,/Scope leakage/);
 assert.match(issues,/Guide locator/);
});
test('rejects incomplete four-option MCQs and unauthorized scientific approval',()=>{
 const {t,lesson}=fixture();
 lesson.questions[0].options.pop();
 lesson.review.status='approved';
 const issues=validateBatch5(t,lesson).join(' | ');
 assert.match(issues,/MCQ validity/);
 assert.match(issues,/Unauthorized approval/);
});
test('C1.1 detects missing quantitative-graph data and enzyme mechanisms',()=>{
 const {t,lesson}=fixture('C1.1');
 assert.deepEqual(validateBatch5(t,lesson),[]);
 lesson.sections.forEach(s=>{s.explanation='A simple enzyme statement.'});
 lesson.assets[0].kind='graph';
 const issues=validateBatch5(t,lesson).join(' | ');
 assert.match(issues,/Required enzyme teaching checkpoint/);
 assert.match(issues,/Graph data/);
});
