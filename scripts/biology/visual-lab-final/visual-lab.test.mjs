import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {renderCirculation} from './build-circulation.mjs';
const base='public/biology/transport/';
const fish=['fish-heart','fish-gills','fish-body'];
const mammal=['mammal-right-heart','mammal-lungs','mammal-left-heart','mammal-body'];
test('exact fish topology heart → gills → body → heart; no gill bypass',()=>{
  const svg=readFileSync(base+'heart-circuits.svg','utf8');
  for(const [from,to] of [[fish[0],fish[1]],[fish[1],fish[2]],[fish[2],fish[0]]])assert.match(svg,new RegExp('data-from="'+from+'" data-to="'+to+'"'));
  assert.equal((svg.match(/data-from="fish-/g)||[]).length,3);
  assert.doesNotMatch(svg,/data-from="fish-gills" data-to="fish-heart"/);
  assert.match(svg,/marker-end="url\(#arrow-low\)"/);
  assert.match(svg,/marker-end="url\(#arrow-high\)"/);
});
test('mammalian double circuit directional node order',()=>{
 const svg=readFileSync(base+'heart-circuits.svg','utf8');
 for(const [from,to] of [[mammal[0],mammal[1]],[mammal[1],mammal[2]],[mammal[2],mammal[3]],[mammal[3],mammal[0]]])assert.match(svg,new RegExp('data-from="'+from+'" data-to="'+to+'"'));
 assert.equal((svg.match(/data-from="mammal-/g)||[]).length,4);
});
test('four figures reproducibly generated, recall blanks do not reveal names',()=>{
for(const [name,flags] of [['heart-circuits.svg',{}],['heart-circuits-recall.svg',{recall:true}],['heart-circuits-mobile.svg',{mobile:true}],['heart-circuits-mobile-recall.svg',{mobile:true,recall:true}]]){
  const svg=readFileSync(base+name,'utf8');assert.equal(svg,renderCirculation(flags));assert.match(svg,/<svg /);assert.match(svg,/<desc /);assert.equal((svg.match(/marker-end=/g)||[]).length,7);
  if(flags.recall) assert.doesNotMatch(svg,/class="node-text"/);
  if(flags.mobile)assert.match(svg,/viewBox="0 0 580 1130"/);
}});
test('DNA base-pair contact counts in both variants',()=>{
 for(const file of ['paired.svg','paired-recall.svg']){const svg=readFileSync('public/biology/nucleic-acids/'+file,'utf8');assert.equal((svg.match(/data-pair="AT" data-bond-count="2"/g)||[]).length,2);assert.equal((svg.match(/data-pair="GC" data-bond-count="3"/g)||[]).length,2);assert.equal((svg.match(/data-hydrogen-bond="true"/g)||[]).length,10);}
});
test('negative: a gills-to-heart bypass is rejected by flow proof',()=>{
 const invalid=renderCirculation().replace('data-from="fish-gills" data-to="fish-body"','data-from="fish-gills" data-to="fish-heart"');
 assert.doesNotMatch(renderCirculation(),/data-from="fish-gills" data-to="fish-heart"/);
 assert.match(invalid,/data-from="fish-gills" data-to="fish-heart"/);
});
