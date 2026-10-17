// BioLab Final Content Sprint C: independent, read-only structural regression check.
// Run from any directory: node scripts/biology/final-c1-c2/validate.mjs
// This tests mapping, metadata, data arithmetic and assets; it does NOT certify scientific accuracy.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const load = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const specs = [
  ['C1.1','enzymes-metabolism',17,10],
  ['C1.2','cell-respiration',17,6],
  ['C1.3','photosynthesis',19,8],
  ['C2.1','chemical-signalling',14,0],
  ['C2.2','neural-signalling',16,7],
];
const added = [
  'c11-data-inhibition-comparison-20261017',
  'c12-data-respirometer-control-20261017',
  'c13-data-rf-pigments-20261017',
  'c13-data-action-spectrum-20261017',
  'c21-data-second-messenger-20261017',
  'c22-data-spike-frequency-20261017',
];
const registry = load('src/biology/curriculum/registry.json');
const ledger = load('docs/biology/final-c1-c2/COMPLETION_LEDGER.json');
const actual = new Map();
let sections = 0, questions = 0, options = 0;
const seenQ = new Set();
for(const [topic,slug,count,shared] of specs) {
  const l = load(`src/biology/learning/${slug}/lesson.json`);
  const r = registry.find(x => x.id === topic);
  assert.ok(r, `Missing registry topic ${topic}`);
  assert.equal(l.topicId, topic);
  assert.equal(l.sections.length, count);
  assert.equal(r.understandings.length, count);
  assert.equal(l.review.reviewer, null, 'No external approval may be implied');
  const referenceIds = new Set(l.references.map(x => x.id));
  const assetIds = new Set(l.assets.map(a => a.id));
  for(const [i,s] of l.sections.entries()) {
    const id = `${topic}.${i+1}`;
    const level = i < shared ? 'shared' : 'HL';
    assert.deepEqual(s.understandingIds,[id]);
    assert.equal(s.level,level, `Wrong level ${id}`);
    assert.equal(r.understandings[i].level,level, `Registry level mismatch ${id}`);
    assert.ok(s.explanation?.trim() && s.revisionSummary?.trim() && s.workedExample?.trim());
    assert.ok(s.terms?.length && s.claimReferences?.length && s.referenceIds?.length);
    assert.equal(s.claimReferences.map(b => b.claim).join('\n\n'),s.explanation,`Citations drift ${id}`);
    if(s.teachingBlocks) assert.equal(s.teachingBlocks.map(b => b.explanation).join('\n\n'),s.explanation,`Teaching text drift ${id}`);
    for(const ref of s.referenceIds)assert.ok(referenceIds.has(ref),`Bad reference in ${id}`);
    for(const asset of s.assets||[])assert.ok(assetIds.has(asset),`Bad asset in ${id}`);
    const check = s.interactions.find(x => x.kind === 'selection');
    assert.ok(check && check.options.length === 4 && check.options.filter(o=>o.correct).length===1,`Bad quiz in ${id}`);
    for(const option of check.options)assert.ok(option.feedback?.length >= 20,`Weak feedback in ${id}`);
    if(topic==='C2.1'||topic==='C2.2'){
      assert.ok(check.options.every(o=>!/^(?:not correct|incorrect|try again|correct)[:.]/i.test(o.feedback)),`Generic feedback in ${id}`);
      assert.equal(new Set(check.options.map(o=>o.feedback)).size,4,`Duplicated distractor explanations in ${id}`);
    }
    assert.ok(Number.isInteger(s.guidePage) && s.pdfPage===s.guidePage+6,`Invalid guide locator ${id}`);
    assert.ok(s.textbook?.printedPages?.length>0, `Missing textbook chapter reference ${id}`);
    actual.set(id, {topic,sectionId:s.id,level});
    sections++;
    options+=check.options.length;
  }
  for(const q of l.questions) {
    assert.ok(!seenQ.has(q.id),`Duplicate assessment ID ${q.id}`);seenQ.add(q.id);
    assert.ok(q.original===true && q.understandingIds.length>0);
    assert.ok(q.understandingIds.every(id=>actual.has(id)),`Unknown understanding in ${q.id}`);
    assert.equal(q.level,q.understandingIds.some(id=>actual.get(id).level==='HL')?'HL':'shared',`Level mismatch in ${q.id}`);
    assert.ok(l.sections.some(s=>s.id===q.sectionId&&s.understandingIds.some(id=>q.understandingIds.includes(id))),`Question mismatch ${q.id}`);
    for(const id of q.referenceIds)assert.ok(referenceIds.has(id),`Bad question citation ${q.id}`);
    if(q.kind==='selection') {
      assert.equal(q.options.length,4);
      assert.equal(q.options.filter(o=>o.correct).length,1);
      assert.equal(new Set(q.options.map(o=>o.id)).size,4);
      assert.ok(q.options.every(o=>o.feedback?.length>=20));
      options+=q.options.length;
    } else {
      assert.ok(q.answer?.trim() && q.markingPoints?.length===q.marks,`Invalid markscheme ${q.id}`);
      if(q.paper==='1B') {
        assert.ok(q.data?.caption&&q.data.headers?.length&&q.data.rows?.length,`Missing data source label ${q.id}`);
        assert.ok(q.data.rows.every(row=>row.length===q.data.headers.length),`Invalid data shape ${q.id}`);
      }
    }
    questions++;
  }
  for(const asset of l.assets) {
    assert.ok(asset.alt?.trim() && asset.captionTitle?.trim() && asset.referenceIds?.every(id=>referenceIds.has(id)));
    assert.ok(/^\/biology\/[a-z0-9-]+\/[a-z0-9-]+\.(svg|png|jpg|webp)$/.test(asset.src),`Unsafe asset path ${asset.src}`);
    const svgPath = resolve(root,'public'+asset.src);
    assert.ok(existsSync(svgPath),`Missing figure ${svgPath}`);
    if(asset.src.endsWith('.svg')) {
      const svg = readFileSync(svgPath,'utf8');
      assert.ok(/<svg\b/.test(svg) && /<\/svg>/.test(svg) && /viewBox=/.test(svg),`Malformed SVG ${asset.id}`);
      assert.ok(!/<(?:script|foreignObject|iframe)\b/i.test(svg),`Executable SVG ${asset.id}`);
    }
  }
}
assert.equal(sections,83);
assert.ok(questions>=159,`Expected six added reasoning items, found ${questions}`);
assert.equal(actual.size,83);
for(const id of added)assert.ok(seenQ.has(id),`Missing new reasoning item ${id}`);
assert.equal(ledger.topics.length,5);
const rows=ledger.topics.flatMap(t=>t.understandings);
assert.equal(rows.length,83);
assert.equal(new Set(rows.map(r=>r.id)).size,83);
for(const row of rows) {
  assert.ok(actual.has(row.id),`Ledger has nonexistent item ${row.id}`);
  assert.equal(row.level,actual.get(row.id).level,`Ledger level drift ${row.id}`);
  assert.ok(row.sourceEvidence.ibGuide.understanding===row.id && Number.isInteger(row.sourceEvidence.ibGuide.printedPage),`No page evidence ${row.id}`);
  assert.ok(row.editorialChanges.length>0 && row.outstanding?.length>0,`Misleading completion record ${row.id}`);
}
const figureA=readFileSync(resolve(root,'public/biology/cell-respiration/respiration-connected-pathways.svg'),'utf8');
assert.ok(figureA.includes('matrix → intermembrane space')&&figureA.includes('intermembrane space → matrix'),'Mitochondrial H⁺ directions reversed');
const figureB=readFileSync(resolve(root,'public/biology/chemical-signalling/receptor-mechanisms.svg'),'utf8');
for(const term of ['G protein-coupled','tyrosine kinase','steroid','acetylcholine'])assert.ok(figureB.includes(term),`Missing signalling mechanism ${term}`);
const trace=readFileSync(resolve(root,'public/biology/neural-signalling/action-potential-trace.svg'),'utf8');
assert.ok(trace.includes('−70')&&trace.includes('−55 mV')&&trace.includes('M100 314 H834'), 'Neural graph threshold mismatch');
console.log(`PASS: ${sections} numbered understandings, ${questions} assessments, ${options} answer options, 83 ledger entries and original figure assertions.`);
console.log('Scope: automated structural checks ONLY. Run project quality, build, all pre-existing validators and browsers separately.');
