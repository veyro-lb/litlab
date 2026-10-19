import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Exact three-way provenance gate for the launch candidate. No tests or source
// approvals are diluted: every change must come from one of these reviewed
// branch heads, with the individual figure placements checked independently.
const common='268415f2c744699d860976212406142d9c35d658';
const screenshot='3ca27790b6a3bdef0bdcf9a1cdeb8b53d03dff24';
const scientific='8f3cede80fe4e4d4c7edfaa44a760d1c39f7929f';
const slugs=['cell-nuclear-division','cell-respiration','dna-replication','homeostasis','neural-signalling','photosynthesis','protein-synthesis','transport'];
const from=(ref,path)=>JSON.parse(execFileSync('git',['show',ref+':'+path],{encoding:'utf8',maxBuffer:6e6}));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function merge(base,visual,science,path){
 if(equal(base,visual))return science;
 if(equal(base,science))return visual;
 if(equal(visual,science))return science;
 if(base&&visual&&science&&typeof base==='object'&&typeof visual==='object'&&typeof science==='object'
    &&Array.isArray(base)===Array.isArray(visual)&&Array.isArray(base)===Array.isArray(science)){
  if(Array.isArray(base)){
   assert.equal(base.length,visual.length,path+' screenshot items changed');
   assert.equal(base.length,science.length,path+' scientific items changed');
   return base.map((item,i)=>merge(item,visual[i],science[i],path+'['+i+']'));
  }
  const merged={};
  for(const key of new Set([...Object.keys(science),...Object.keys(visual),...Object.keys(base)])){
   const value=merge(base[key],visual[key],science[key],path+'.'+key);
   if(value!==undefined)merged[key]=value;
  }
  return merged;
 }
 assert.fail('Overlapping, nonidentical edits require manual merge: '+path);
}
test('the integrated 40-topic course combines science review and original textbook crops without modifying either set of edits',()=>{
 const originals=new Set();
 const record=JSON.parse(readFileSync('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json','utf8'));
 assert.equal(record.figures.length,26);
 for(const f of record.figures)originals.add(f.path);
 assert.equal(originals.size,26);
 for(const slug of slugs){
  const path='src/biology/learning/'+slug+'/lesson.json';
  const science=from(scientific,path);
  const final=JSON.parse(readFileSync(path,'utf8'));
  const expected=merge(from(common,path),from(screenshot,path),science,path);
  // Two publisher figure replacements require explicit, accurate accessibility interpretation.
  const figureInterpretation={"d12-elongation-cycle":"The numbered stages represent successive steps in one translation cycle, not separate ribosomes. A ribosome advances along mRNA in the 5′ to 3′ direction and releases the polypeptide at a stop codon.","d21-meiotic-variation":"Independent orientation at metaphase I changes which maternal and paternal homologues pass to gametes; this mechanism is distinct from exchange between non-sister chromatids during prophase I."};
  for(const asset of expected.assets)if(figureInterpretation[asset.id])asset.interpretation=figureInterpretation[asset.id];
  assert.deepEqual(final,expected,path+' changed unexpectedly');
  assert.deepEqual(final.sections.map(s=>s.id),science.sections.map(s=>s.id));
  assert.deepEqual(final.questions.map(q=>q.id),science.questions.map(q=>q.id));
  assert.deepEqual(final.sections.map(s=>s.explanation),science.sections.map(s=>s.explanation),path+' scientific text was replaced');
  assert.deepEqual(final.questions,science.questions,path+' assessment answers were replaced');
 }
});
