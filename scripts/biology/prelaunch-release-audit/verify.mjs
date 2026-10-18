#!/usr/bin/env node
/**
 * BioLab prelaunch audit-only verification. READ ONLY. No app, CI, Git, DB,
 * Vercel, network or student-data writes. Run from any cwd:
 *   node scripts/biology/prelaunch-release-audit/verify.mjs
 * Status is NOT a deployment approval; it remains NO-GO until external evidence.
 */
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {resolve, dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export const auditRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
export const assetRoot = join(auditRoot, 'public/biology');
export const docsRoot = join(auditRoot, 'docs/biology/prelaunch-release-audit');
export const themes = ['A', 'B', 'C', 'D1-D2', 'D3-D4'];
export const expectedSourceSha = '3e07486876700cd35d0931f91a7c11ae82946084';

export function enumerateFiles(directory, prefix = '') {
  return readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const sub = join(directory, entry.name), item = join(prefix, entry.name);
    if (entry.isDirectory()) return enumerateFiles(sub, item);
    return entry.isFile() ? [item.split('\\').join('/')] : [];
  });
}
export const loadJSON = p => JSON.parse(readFileSync(p, 'utf8'));
export function pathForPublicImage(url) {
  if (typeof url !== 'string' || !url.startsWith('/biology/')) return null;
  // File references are explicit and may never contain traversal or queries.
  assert(!url.includes('..') && !url.includes('?') && !url.includes('#'), 'Unsafe media URL: ' + url);
  return 'public' + url;
}
export function summarize(registers, reconciliation, publicPaths) {
  const topics = new Set();
  const records = [];
  const seenPaths = new Set();
  for (const reg of registers) {
    assert.equal(reg.auditBaseSha, expectedSourceSha, 'Source SHA drift');
    assert.equal(reg.count, reg.figures.length, 'Incorrect count in theme register');
    assert.equal(reg.status, 'PREPUBLICATION_BLOCKED_UNTIL_ASSET_LEVEL_APPROVAL');
    for (const entry of reg.figures) {
      assert(entry.assetId && entry.sourceDocument && entry.publicationStatus && entry.claimedUsageRights);
      assert(entry.attributionRequirement && entry.claimedOwner);
      topics.add(entry.topic);
      records.push(entry);
      for (const url of entry.displayPaths) {
        const file = pathForPublicImage(url);
        if (file) seenPaths.add(file);
      }
    }
  }
  const realPaths = new Set(publicPaths.map(p => 'public/biology/' + p));
  const orphanPaths = [...realPaths].filter(p => !seenPaths.has(p)).sort();
  const brokenPaths = [...seenPaths].filter(p => !realPaths.has(p)).sort();
  assert.equal(reconciliation.baselineSha, expectedSourceSha);
  assert.equal(reconciliation.lessonMediaRecords, records.length);
  assert.equal(reconciliation.publicFiles, realPaths.size);
  assert.deepEqual(reconciliation.unmappedPublicAssets.map(a => a.path).sort(), orphanPaths);
  assert.deepEqual(reconciliation.brokenLocalReferences.slice().sort(), brokenPaths);
  assert.equal(topics.size, 40, 'Do not call an incomplete course fully inventoried');
  assert.equal(realPaths.size, 291, 'Source asset tree changed; refresh audit for new SHA');
  assert.equal(records.length, 170, 'Source lesson records changed; refresh audit for new SHA');
  assert.equal(orphanPaths.length, 17, 'Unmapped assets changed; refresh audit');
  assert.equal(brokenPaths.length, 0, 'Referenced local image is missing');
  const blocked = records.filter(e => /PENDING|BLOCKED|WITHHELD/.test(e.publicationStatus));
  assert.equal(blocked.length, records.length, 'Unverified media must not be auto-approved');
  return {
    sourceSha: expectedSourceSha, topics: topics.size, records:records.length,
    publicFiles:realPaths.size, linkedPublicPaths:realPaths.size-orphanPaths.length,
    unlinkedPublicPaths:orphanPaths.length, brokenPaths:brokenPaths.length,
    pendingMediaRecords:blocked.length, status:'NO-GO'
  };
}
export function verifyFromDisk() {
  const registers=themes.map(t => loadJSON(join(docsRoot,`figure-register-theme-${t}.json`)));
  const reconciliation=loadJSON(join(docsRoot,'public-asset-reconciliation.json'));
  const paths=enumerateFiles(assetRoot);
  const result=summarize(registers,reconciliation,paths);
  const blockers=readFileSync(join(docsRoot,'RELEASE_BLOCKERS.md'),'utf8');
  const report=readFileSync(join(docsRoot,'FINAL_RELEASE_AUDIT.md'),'utf8');
  for (const id of ['RA-001','RA-002','RA-004','RA-007','RA-008','RA-009','RA-012']) assert(blockers.includes(id), 'Missing release blocker '+id);
  assert(report.includes('**Release disposition:** **NO-GO'), 'Never imply approval');
  return result;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(verifyFromDisk(),null,2));
    console.log('AUDIT INVENTORY VALID; RELEASE REMAINS NO-GO. No publication, source edits or deployment performed.');
  } catch (error) {
    console.error('AUDIT INVENTORY INVALID: '+error.message);
    process.exitCode=1;
  }
}
