#!/usr/bin/env node
/**
 * Structural integrity check for the first-pass BioLab course-depth audit.
 * This does NOT certify scientific correctness, teaching adequacy, licensing,
 * accessibility or browser rendering. Those require separate reviews.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docs = 'docs/biology/full-course-depth-audit';
const files = [
  'matrix-A.json',
  'matrix-B-molecules-cells.json',
  'matrix-B-organisms-ecosystems.json',
  'matrix-C.json',
  'matrix-D-molecules-cells.json',
  'matrix-D-organisms-ecosystems.json',
];
const expected = {
  'A1.1':8,'A1.2':15,'A2.1':9,'A2.2':14,'A2.3':6,'A3.1':15,'A3.2':9,'A4.1':11,'A4.2':8,
  'B1.1':13,'B1.2':12,'B2.1':17,'B2.2':9,'B2.3':10,'B3.1':13,'B3.2':18,'B3.3':10,'B4.1':8,'B4.2':13,
  'C1.1':17,'C1.2':17,'C1.3':19,'C2.1':14,'C2.2':16,'C3.1':23,'C3.2':18,'C4.1':18,'C4.2':22,
  'D1.1':9,'D1.2':19,'D1.3':10,'D2.1':17,'D2.2':11,'D2.3':11,'D3.1':20,'D3.2':21,'D3.3':11,
  'D4.1':15,'D4.2':15,'D4.3':12,
};
const allowed = new Set([
  'COMPLETE AND VERIFIED AGAINST SOURCES',
  'IMPROVED — QUALIFIED REVIEW PENDING',
  'NEEDS FURTHER WORK'
]);
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const assert = (ok, why) => { if (!ok) throw new Error(why); };
const seenTopics = new Set(), seenIds = new Set();
const results = { topics:0, understandings:0, improved:0, complete:0, needsFurtherWork:0,
  missingExactHodderPagePointers:0, structuralWarnings:[] };

for (const file of files) {
  const doc = readJson(path.join(docs, file));
  assert(doc.schemaVersion === 1 && Array.isArray(doc.topics), 'Invalid matrix: ' + file);
  for (const topic of doc.topics) {
    const id = topic.topicId;
    assert(Object.hasOwn(expected,id), 'Unknown topic in matrix: ' + id);
    assert(!seenTopics.has(id), 'Duplicate topic in matrix: ' + id);
    seenTopics.add(id); results.topics++;
    assert(topic.lessonPath.startsWith('src/biology/learning/') &&
           topic.lessonPath.endsWith('/lesson.json'), 'Unsafe/missing lesson path: '+id);
    const lesson = readJson(topic.lessonPath);
    assert(lesson.topicId === id, 'Lesson topicId mismatch: '+id);
    const sections = new Map((lesson.sections||[]).flatMap(s =>
      (s.understandingIds||[]).map(u=>[u,s])));
    const assets = new Set((lesson.assets||[]).map(a=>a.id));
    const refs = new Set((lesson.references||[]).map(r=>r.id));
    assert(topic.understandings.length===expected[id], 'IB count mismatch: '+id);
    for(let n=1;n<=expected[id];n++){
      const uid=id+'.'+n;
      const row=topic.understandings.find(x=>x.id===uid);
      assert(!!row && !seenIds.has(uid), 'Missing/duplicate numbered understanding: '+uid);
      assert(allowed.has(row.status), 'Invalid audit status: '+uid);
      const s=sections.get(uid);
      assert(!!s && s.id===row.sectionId, 'Section mapping mismatch: '+uid);
      assert(s.level===row.scope, 'SL/HL mapping mismatch: '+uid);
      assert(typeof s.explanation==='string' && s.explanation.trim(), 'No teaching text: '+uid);
      assert(Array.isArray(s.teachingBlocks) && s.teachingBlocks.length>0, 'No teaching blocks: '+uid);
      assert(Number.isInteger(row.guidePdfPage) && row.guidePdfPage>0, 'Missing IB locator: '+uid);
      for(const assetId of s.assets||[])assert(assets.has(assetId), 'Unregistered asset in '+uid+': '+assetId);
      for(const refId of s.referenceIds||[])assert(refs.has(refId), 'Unregistered source in '+uid+': '+refId);
      if(!row.hodderPdfPages?.length)results.missingExactHodderPagePointers++;
      if(row.status==='IMPROVED — QUALIFIED REVIEW PENDING')results.improved++;
      if(row.status==='COMPLETE AND VERIFIED AGAINST SOURCES')results.complete++;
      if(row.status==='NEEDS FURTHER WORK')results.needsFurtherWork++;
      seenIds.add(uid); results.understandings++;
    }
    assert(sections.size===expected[id], 'Unexpected lesson section count: '+id);
  }
}
assert(seenTopics.size===40 && results.understandings===553,
  'Expected 40 topics and 553 syllabus understandings');

// New original figures introduced by this audit must exist as first-party SVGs.
const newFigures=[
  'public/biology/nucleic-acids/dna-rna-comparison.svg',
  'public/biology/cell-respiration/nadh-electron-energy-transfer.svg',
  'public/biology/transport/root-pressure-cause-sequence.svg',
  'public/biology/neural-signalling/saltatory-conduction-nodes.svg',
  'public/biology/dna-replication/replication-enzyme-sequence.svg',
  'public/biology/protein-synthesis/translation-elongation-cycle.svg',
  'public/biology/cell-nuclear-division/meiosis-two-variation-mechanisms.svg'
];
for(const src of newFigures){
  const actual=path.join(root,src);
  assert(fs.existsSync(actual),'Missing new figure: '+src);
  const svg=fs.readFileSync(actual,'utf8');
  assert(svg.includes('<svg') && svg.includes('</svg>') && svg.includes('xmlns=') &&
         svg.includes('<title') && svg.includes('<desc'),
         'Malformed/inaccessible SVG scaffold: '+src);
}
results.structuralWarnings.push(
  'This script does not reverify biological claims or IB guide wording.',
  results.missingExactHodderPagePointers ? 'Some inventory rows still need exact Hodder pointers.' : 'All inventory rows have Hodder pointers; locator presence is not full scientific verification.',
  'No desktop/mobile browser rendering, visual QA, source-rights clearance or qualified review is established here.'
);
console.log(JSON.stringify({status:'STRUCTURAL CHECK PASSED',...results},null,2));
