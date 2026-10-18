import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectSection,inspectCourse,loadCourse} from './validate.mjs';
const fixture=()=>({
 section:{
  id:'s',understandingIds:['A1.1.1'],level:'shared',explanation:'A distinct fallback explanation.',
  teachingBlocks:[{title:'Why the property matters',explanation:'Water provides the solvent environment for intracellular reactions. A second idea supports cell transport.',referenceIds:['guide']}],
  revisionSummary:'Water acts as a medium.',workedExample:'A transport example.',
  assets:['diagram'],figurePlacements:[{assetId:'diagram',afterBlock:0}],
  graphTables:[{caption:'Values',headers:['x','y'],rows:[[1,2]]}],visuals:[{kind:'comparison',title:'Compare',afterBlock:0,headers:['a','b'],rows:[['1','2']]}],claimReferences:[{claim:'Water provides the solvent environment for intracellular reactions.',referenceIds:['guide']}]
 },lesson:{assets:[{id:'diagram',level:'shared'}],references:[{id:'guide'}]}
});
test('valid authored reading has no structural errors',()=>{
 const {section,lesson}=fixture();
 assert.deepEqual(inspectSection(section,lesson,'shared').errors,[]);
});
test('missing teaching blocks is a regression',()=>{const {section,lesson}=fixture();delete section.teachingBlocks;assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/missing explicit teachingBlocks/)});
test('empty block body is a regression',()=>{const {section,lesson}=fixture();section.teachingBlocks[0].explanation='';assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/empty block title or explanation/)});
test('empty legacy explanation is not silently accepted',()=>{const {section,lesson}=fixture();section.explanation='';assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/empty explanation fallback/)});
test('duplicated reading paragraphs are rejected',()=>{const {section,lesson}=fixture();const a=section.teachingBlocks[0].explanation;section.teachingBlocks[0].explanation=a+'\n\n'+a;assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/duplicate paragraphs/)});
test('sentence-length teaching heading is flagged for editorial attention',()=>{const {section,lesson}=fixture();section.teachingBlocks[0].title='The title has become a complete explanatory sentence that distracts a reader from the actual content of the main passage and needs rewriting';assert.match(inspectSection(section,lesson,'shared').warnings.join(' '),/overlong explanation-like heading/)});
test('legacy divergence is a review warning, not automatic scientific failure',()=>{const {section,lesson}=fixture();section.explanation='Completely different explanation';const result=inspectSection(section,lesson,'shared');assert.equal(result.errors.length,0);assert.match(result.warnings.join(' '),/legacy explanation differs/)});
test('bad figure placement is rejected',()=>{const {section,lesson}=fixture();section.figurePlacements[0].afterBlock=999;assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/figure afterBlock/)});
test('broken graph table is rejected',()=>{const {section,lesson}=fixture();section.graphTables[0].rows=[['single']];assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/graphTable columns mismatch/)});
test('comparison visual column mismatch is rejected',()=>{const {section,lesson}=fixture();section.visuals[0].rows=[['single']];assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/comparison columns mismatch/)});
test('SL/HL mismatch is rejected',()=>{const {section,lesson}=fixture();section.level='HL';assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/scope metadata mismatch/)});
test('unknown claim source is rejected',()=>{const {section,lesson}=fixture();section.claimReferences[0].referenceIds=['unlisted'];assert.match(inspectSection(section,lesson,'shared').errors.join(' '),/nonexistent source/)});
test('integrated course has 40 topics / 553 visible understanding mappings',async()=>{
 const {registry,catalog,lessons}=await loadCourse();
 const out=inspectCourse(registry,catalog,lessons);
 assert.equal(out.counts.topics,40);
 assert.equal(out.counts.renderedUnderstandings,553);
 assert.equal(out.counts.lessons,40);
 assert.deepEqual(out.errors,[],'Never treat this passing as educational approval');
});
