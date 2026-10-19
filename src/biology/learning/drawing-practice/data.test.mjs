import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,figureDependencies,isCorrectLabel,availableExercises} from './data.mjs';
const source={topicId:'A1.1',assets:[{id:'bonding',src:'/biology/water/bonding.svg',recallSrc:'/biology/water/bonding-recall.svg',level:'shared',review:'scientific-review',license:'Original project artwork; use under the repository’s terms.',permissionEvidence:'geometry and labels checked against references.'}]};
const sections=[{understandingIds:['A1.1.2'],assets:['bonding'],level:'shared'}];
const ready=(lesson=source,level='SL',scope=sections)=>availableExercises(lesson,level,scope);
test('verified original visual is available in its own scope',()=>{assert.equal(ready().length,1);assert.equal(ready(source,'HL').length,1);assert.equal(ready(source,'SL',[]).length,0)});
test('negative: invalid review, rights, association or recall art is blocked',()=>{
 for(const mutation of [{review:'source-mapped'},{recallSrc:undefined},{src:'/biology/water/fake.jpg'},{license:'third-party rights uncertain'},{permissionEvidence:'not checked'},{withheldReason:'science hold'}]){
  assert.equal(ready({...source,assets:[{...source.assets[0],...mutation}]}).length,0,JSON.stringify(mutation));
 }
 assert.equal(ready({...source,topicId:'D3.1'}).length,0);
});
test('future structures are dependencies, never advertised as ready',()=>{assert.equal(figureDependencies.length,16);assert.ok(!exercises.some(e=>e.topicId==='D3.1'));assert.ok(figureDependencies.every(x=>!('assetId'in x)))});
test('synonyms are exact and do not confuse different biological structures',()=>{
 const e=exercises[0];assert.ok(isCorrectLabel(e.labels[0],' Oxygen '));assert.ok(isCorrectLabel(e.labels[3],'hydrogen bonding'));assert.ok(isCorrectLabel(e.labels[4],'δ'));
 assert.equal(isCorrectLabel(e.labels[3],'polar covalent bond'),false);assert.equal(isCorrectLabel(e.labels[0],'hydrogen'),false);assert.equal(isCorrectLabel(e.labels[0],''),false);
 assert.equal(isCorrectLabel(e.labels[2],'covalent'),false);
});
test('exercise keys and explanations are complete',()=>{for(const e of exercises){assert.equal(new Set(e.labels.map(l=>l.id)).size,e.labels.length);assert.ok(e.labels.every(l=>l.name&&l.clue&&l.function));assert.equal(e.understandingId,'A1.1.2')}});
