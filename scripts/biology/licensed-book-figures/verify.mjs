#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const registry=JSON.parse(readFileSync('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json','utf8'));
assert.equal(registry.version,2);
assert.equal(registry.figures.length,26);
assert.equal(registry.figures.filter(f=>f.sourceBook==='Biology for the IB Diploma, Third Edition').length,14);
assert.equal(registry.figures.filter(f=>f.sourceBook==='IB Biology Drawings').length,12);
const root='src/biology/learning';
const lessons=readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&existsSync(`${root}/${d.name}/lesson.json`)).map(d=>({slug:d.name,...JSON.parse(readFileSync(`${root}/${d.name}/lesson.json`,'utf8'))}));
const seenPaths=new Set(),seenAssets=new Set();let placements=0;
for(const fig of registry.figures){
 assert.ok(fig.source&&fig.originalSha256&&fig.sourcePdfPage&&fig.understandingId&&fig.lessonSectionId&&fig.sourceBook);
 assert.ok(!seenPaths.has(fig.path));seenPaths.add(fig.path);
 const identity=fig.topicId+':'+fig.assetId;assert.ok(!seenAssets.has(identity));seenAssets.add(identity);
 assert.match(fig.path,/^\/biology\/licensed-book-crops\/[a-z0-9-]+\.png$/);
 const file='public'+fig.path;assert.ok(existsSync(file),'missing source crop '+file);
 const bytes=readFileSync(file);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),fig.originalSha256,'source crop changed: '+identity);
 assert.equal(bytes.subarray(1,4).toString(),'PNG');
 const lesson=lessons.find(l=>l.topicId===fig.topicId&&l.slug===fig.lessonSlug);assert.ok(lesson,identity);
 const asset=lesson.assets.find(a=>a.id===fig.assetId);assert.ok(asset,identity);
 assert.equal(asset.src,fig.path);assert.equal(asset.attribution,fig.source);
 assert.equal(asset.publicReproductionRights,'cleared');assert.ok(asset.permissionEvidence.includes('2026-10-19'));
 assert.ok(asset.alt&&asset.captionTitle,'accessible figure description missing');
 // An old responsive source must not silently substitute a recreated diagram on mobile.
 for(const key of ['mobileSrc','recallSrc','recallMobileSrc'])assert.ok(!asset[key],identity+': unexpected variant '+key);
 const actual=lesson.sections.filter(s=>s.assets.includes(fig.assetId));assert.ok(actual.length,identity+' not placed');
 assert.deepEqual(fig.placements.map(p=>p.lessonSectionId).sort(),actual.map(s=>s.id).sort(),identity+' incomplete placement register');
 for(const p of fig.placements){
  const section=actual.find(s=>s.id===p.lessonSectionId);assert.ok(section.understandingIds.includes(p.understandingId));
  if(fig.cropBoxPdfPoints){
   const slot=section.figurePlacements?.find(x=>x.assetId===fig.assetId);assert.ok(slot,identity+' no inline placement');
   assert.ok(Number.isInteger(slot.afterBlock)&&slot.afterBlock>=0&&slot.afterBlock<section.teachingBlocks.length);
   assert.equal(slot.afterBlock,p.afterBlock);assert.ok(asset.level!=='HL'||section.level==='HL');
  }
  placements++;
 }
 assert.ok(fig.placements.some(p=>p.lessonSectionId===fig.lessonSectionId&&p.understandingId===fig.understandingId));
 if(fig.cropBoxPdfPoints){
  assert.equal(fig.cropBoxPdfPoints.length,4);assert.equal(fig.renderDpi,216);
  assert.equal(fig.printedPage,fig.sourcePdfPage-12);assert.ok(fig.figureNumber&&fig.replacedRecreatedFigure&&fig.oldAssetPath.endsWith('.svg'));
  assert.ok(bytes.readUInt32BE(16)>=850&&bytes.readUInt32BE(20)>=500,'Insufficient crop resolution '+identity);
 }
}
for(const lesson of lessons)for(const a of lesson.assets.filter(a=>a.src.startsWith('/biology/licensed-book-crops/'))){
 assert.ok(registry.figures.some(f=>f.topicId===lesson.topicId&&f.assetId===a.id&&f.path===a.src),'Unregistered screenshot '+a.id);
}
const required=['C1.2.9','C1.2.11','C1.3.21','C1.3.22','D1.1.7','D1.2.7','D1.2.16','D2.1.12','D2.1.13','C2.2.13','B3.2.31','D3.3.11'];
assert.deepEqual([...registry.requiredHodderFigures].sort(),required.sort());
for(const figure of required)assert.ok(registry.figures.some(f=>f.figureNumber===figure),'Required Hodder screenshot absent: '+figure);
assert.ok(!registry.figures.some(f=>f.figureNumber==='C1.2.10'),'Rejected ATP-yield figure included');
assert.deepEqual(readdirSync('public/biology/licensed-book-crops').map(f=>'/biology/licensed-book-crops/'+f).sort(),[...seenPaths].sort(),'Unregistered public screenshot files');
assert.ok(!existsSync('public/biology/source-pdf-figures'));
console.log(`Original source-PDF crops passed: 26 exact SHA-256 matches (14 Hodder, 12 Drawings), ${placements} attributed section placements; all 12 required Hodder figures present.`);
