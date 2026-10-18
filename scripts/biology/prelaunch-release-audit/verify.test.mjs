import test from 'node:test';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {auditRoot,docsRoot,assetRoot,enumerateFiles,loadJSON,pathForPublicImage,verifyFromDisk,summarize,themes} from './verify.mjs';

function fixture(){
  return {
    regs:themes.map(t=>loadJSON(join(docsRoot,`figure-register-theme-${t}.json`))),
    rec:loadJSON(join(docsRoot,'public-asset-reconciliation.json')),
    paths:enumerateFiles(assetRoot)
  };
}
test('exact 40-lesson audit inventory reconciles against public assets, with NO-GO status',()=>{
  const v=verifyFromDisk();
  assert.equal(v.sourceSha,'3e07486876700cd35d0931f91a7c11ae82946084');
  assert.equal(v.topics,40);
  assert.equal(v.records,170);
  assert.equal(v.publicFiles,291);
  assert.equal(v.unlinkedPublicPaths,17);
  assert.equal(v.brokenPaths,0);
  assert.equal(v.pendingMediaRecords,170);
  assert.equal(v.status,'NO-GO');
});
test('a missing public figure is never silently marked present',()=>{
  const x=fixture(),p=x.paths.find(p=>p.endsWith('water/bonding.svg'));
  assert(p);
  assert.throws(()=>summarize(x.regs,x.rec,x.paths.filter(t=>t!==p)),/publicFiles|Unmapped|Referenced|Source asset tree changed/i);
});
test('rights class remains pending and does not auto-upgrade on descriptive original claim',()=>{
  const x=fixture();
  const t=x.regs.find(r=>r.figures.some(f=>f.publicationStatus==='PENDING_ORIGINAL_CREATOR_AUTHORIZATION'));
  assert(t);
  const el=t.figures.find(f=>f.publicationStatus==='PENDING_ORIGINAL_CREATOR_AUTHORIZATION');
  el.publicationStatus='CLEARED';
  assert.throws(()=>summarize(x.regs,x.rec,x.paths),/unverified|auto-approved/i);
});
test('new asset means inventory requires a fresh source SHA-based audit',()=>{
  const x=fixture();
  x.paths.push('never-reviewed/unlicensed-example.svg');
  assert.throws(()=>summarize(x.regs,x.rec,x.paths),/publicFiles|Unmapped|Source asset tree changed/i);
});
test('source branch SHA cannot silently drift',()=>{
  const x=fixture();x.regs[0].auditBaseSha='unreviewed-rebase';
  assert.throws(()=>summarize(x.regs,x.rec,x.paths),/Source SHA drift/i);
});
test('reject dangerous public image URL path traversal',()=>{
  assert.equal(pathForPublicImage('/biology/water/bonding.svg'),'public/biology/water/bonding.svg');
  assert.equal(pathForPublicImage('https://commons.wikimedia.org/example.png'),null);
  assert.throws(()=>pathForPublicImage('/biology/../../private.png'),/Unsafe media URL/i);
});
