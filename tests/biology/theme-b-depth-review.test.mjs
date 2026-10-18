import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const topicSlugs={'B1.1':'carbohydrates-lipids','B1.2':'proteins','B2.1':'membranes-transport','B2.2':'organelles-compartmentalization','B2.3':'cell-specialization','B3.1':'gas-exchange','B3.2':'transport','B3.3':'muscle-motility','B4.1':'adaptation-environment','B4.2':'ecological-niches'};
const depth=read('docs/biology/theme-b-final-20261018/STRUCTURE_FUNCTION_DEPTH_REVIEW_123.json');
const registry=read('src/biology/curriculum/registry.json');
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;
const lessons=Object.fromEntries(Object.entries(topicSlugs).map(([id,slug])=>[id,read('src/biology/learning/'+slug+'/lesson.json')]));
test('Every one of 123 understanding IDs has a source-scoped before/after record',()=>{
 assert.equal(depth.understandings.length,123);
 assert.equal(new Set(depth.understandings.map(r=>r.id)).size,123);
 assert.equal(Object.keys(lessons).length,10);
 for(const row of depth.understandings){
  const topic=row.id.split('.').slice(0,2).join('.');
  const lesson=lessons[topic];
  const section=lesson.sections.find(s=>s.understandingIds[0]===row.id);
  const u=registry.find(t=>t.id===topic).understandings.find(x=>x.id===row.id);
  assert.ok(section&&u,row.id+' present');
  assert.equal(section.level,u.level,row.id+' correct shared/HL scope');
  assert.equal(section.level,row.level,row.id+' audit scope');
  assert.equal(words(section.explanation),row.afterMainWords,row.id+' audit matches actual teaching');
  assert.equal(section.teachingBlocks.length,row.afterTeachingBlocks,row.id+' block count');
  assert.equal(section.claimReferences.length,section.teachingBlocks.length,row.id+' paragraph references');
  assert.equal(section.explanation,section.teachingBlocks.map(x=>x.explanation).join('\n\n'),row.id+' Learn text matches blocks');
  assert.equal(section.explanation,section.claimReferences.map(x=>x.claim).join('\n\n'),row.id+' claims mapped');
  assert.ok(section.referenceIds.some(x=>/ib|guide/.test(x))&&section.referenceIds.some(x=>/hodder/.test(x)),row.id+' dual source');
  assert.ok(row.ibGuidePrintedPage&&row.hodderPrintedPages.length,row.id+' precise locators');
  if(topic.startsWith('B3')||topic.startsWith('B4')){
    assert.equal(row.editorialClassification,'corrected',row.id+' change classification');
    assert.ok(row.addedMainWords>=55,row.id+' substantial specific mechanism addition');
    assert.ok(words(section.explanation)>=200,row.id+' depth');
    assert.ok(row.addedHeadings.length===1,row.id+' unique new heading');
  }else{
    assert.equal(row.editorialClassification,'complete',row.id+' retained foundation');
    assert.ok(words(section.explanation)>=190,row.id+' initial depth');
  }
  for(const v of section.visuals||[]){
    assert.ok(Number.isInteger(v.afterBlock)&&v.afterBlock>=0&&v.afterBlock<section.teachingBlocks.length,row.id+' visual anchored');
    if(v.kind==='comparison')assert.ok(v.rows.every(r=>r.length===v.headers.length),row.id+' rectangular table');
    if(v.kind==='sequence')assert.ok(v.steps.every(st=>st.title&&st.description),row.id+' explained sequence');
  }
 }
});
test('Core scientific directions remain explicit',()=>{
 const explain=(topic,id)=>lessons[topic].sections.find(x=>x.understandingIds.includes(id)).explanation;
 for(const [topic,id,terms] of [
  ['B3.1','B3.1.3',['ventilation','blood']],
  ['B3.2','B3.2.7',['negative','cohesion']],
  ['B3.2','B3.2.14',['gill','heart']],
  ['B3.2','B3.2.18',['source','sink']],
  ['B3.3','B3.3.2',['actin','myosin','ATP','Z lines']],
  ['B4.1','B4.1.4',['transect','abiotic']],
  ['B4.2','B4.2.12',['fundamental','realized']]
 ])for(const term of terms)assert.ok(explain(topic,id).toLowerCase().includes(term.toLowerCase()),id+' missing '+term);
 assert.ok(lessons['B3.3'].sections.every(s=>s.level==='HL'));
 assert.ok(lessons['B4.1'].sections.concat(lessons['B4.2'].sections).every(s=>s.level==='shared'));
});
