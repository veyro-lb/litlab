#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const registry=JSON.parse(readFileSync('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json','utf8'));
assert.equal(registry.figures.length,14);
const seenPaths=new Set(),seenAssets=new Set();
for(const fig of registry.figures){
 assert.ok(fig.source&&fig.originalSha256&&fig.sourcePdfPage&&fig.understandingId);
 assert.ok(!seenPaths.has(fig.path));seenPaths.add(fig.path);
 assert.ok(!seenAssets.has(fig.assetId));seenAssets.add(fig.assetId);
 assert.match(fig.path,/^\/biology\/licensed-book-crops\/[a-z0-9-]+\.png$/);
 const file='public'+fig.path;assert.ok(existsSync(file),'missing source crop '+file);
 const digest=createHash('sha256').update(readFileSync(file)).digest('hex');
 assert.equal(digest,fig.originalSha256,'source crop differs from original PDF pixels: '+fig.assetId);
}
const dirs=['water','nucleic-acids','cell-structure','proteins','membranes-transport','gas-exchange','transport','reproduction'];
for(const dir of dirs){
 const lesson=JSON.parse(readFileSync('src/biology/learning/'+dir+'/lesson.json','utf8'));
 for(const asset of lesson.assets.filter(x=>x.src.startsWith('/biology/licensed-book-crops/'))){
  const fig=registry.figures.find(x=>x.assetId===asset.id);
  assert.ok(fig,'unregistered cropped illustration '+asset.id);
  assert.equal(asset.src,fig.path);assert.equal(asset.attribution,fig.source);
  assert.equal(asset.publicReproductionRights,'cleared');
  assert.ok(asset.permissionEvidence.includes('2026-10-19'));
  assert.ok(lesson.sections.some(s=>s.assets.includes(asset.id)),'crop not actually placed in lesson '+asset.id);
 }
}
assert.ok(!existsSync('public/biology/source-pdf-figures'),'historical uncleared crop directory restored unexpectedly');
console.log('Original source-PDF crops passed: 14 exact SHA-256 matches, placed and source-attributed.');
