// Isolated Theme C editorial regression guard.
// Run from the repository root: node scripts/biology/theme-c-final/verify-theme-c.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const entries = [
  ['C1.1', 'enzymes-metabolism', 10, 17],
  ['C1.2', 'cell-respiration', 6, 17],
  ['C1.3', 'photosynthesis', 8, 19],
  ['C2.1', 'chemical-signalling', 0, 14],
  ['C2.2', 'neural-signalling', 7, 16],
  ['C3.1', 'integration-body-systems', 16, 23],
  ['C3.2', 'defence-against-disease', 18, 18],
  ['C4.1', 'populations-communities', 18, 18],
  ['C4.2', 'transfers-energy-matter', 22, 22],
];
const registry = JSON.parse(readFileSync('src/biology/curriculum/registry.json', 'utf8'));
const join = items => items.join(String.fromCharCode(10, 10));
let understandings = 0, questions = 0, graphTables = 0;

for (const [id, slug, shared, total] of entries) {
  const topic = registry.find(t => t.id === id);
  assert(topic, 'Missing registry topic ' + id);
  const lesson = JSON.parse(readFileSync('src/biology/learning/' + slug + '/lesson.json', 'utf8'));
  assert.equal(lesson.topicId, id);
  assert.equal(lesson.id, topic.lessonId);
  assert.equal(topic.understandings.length, total, id + ' official count');
  assert.equal(lesson.sections.length, total, id + ' section count');

  const sectionIds = new Set(), seen = new Set();
  let sharedCount = 0;
  for (const section of lesson.sections) {
    assert.equal(section.understandingIds?.length, 1, section.id + ' not a 1:1 section');
    const uid = section.understandingIds[0];
    const expected = topic.understandings.find(u => u.id === uid);
    assert(expected, 'Unknown understanding ' + uid);
    assert(!seen.has(uid), 'Duplicate understanding ' + uid);
    assert(!sectionIds.has(section.id), 'Duplicate section ' + section.id);
    seen.add(uid);
    sectionIds.add(section.id);
    assert.equal(section.level, expected.level, uid + ' scope changed');
    if (section.level === 'shared') sharedCount++;
    assert(!Object.hasOwn(section, 'title'), uid + ' should receive title from registry');
    assert(section.teachingBlocks?.length && section.claimReferences?.length, uid + ' missing teaching/provenance');
    assert.equal(join(section.teachingBlocks.map(b => b.explanation)), section.explanation, uid + ' block drift');
    assert.equal(join(section.claimReferences.map(c => c.claim)), section.explanation, uid + ' source-claim drift');
    assert(section.referenceIds?.some(x => x.startsWith('ib-')), uid + ' missing IB source');
    assert(section.referenceIds?.some(x => x.startsWith('hodder-')), uid + ' missing textbook source');
    assert(section.interactions?.length && section.recall?.length, uid + ' missing retrieval');
    for (const table of section.graphTables || []) {
      assert(table.caption && table.headers?.length && table.rows?.length, uid + ' incomplete graph table');
      assert(table.rows.every(row => row.length === table.headers.length), uid + ' mismatched graph data');
      graphTables++;
    }
    understandings++;
  }
  assert.equal(sharedCount, shared, id + ' SL boundary');
  assert.equal(seen.size, total, id + ' missing understanding');
  questions += lesson.questions.length;
  console.log(id + ': ' + total + '/' + total + ' exact understandings (' +
    shared + ' SL+HL, ' + (total - shared) + ' HL)');
}

const resp = JSON.parse(readFileSync('src/biology/learning/cell-respiration/lesson.json', 'utf8'));
const sharedComparison = resp.sections.find(s => s.understandingIds.includes('C1.2.5'));
assert(sharedComparison);
assert(!/\bNAD\b|\bpyruvate\b/i.test(sharedComparison.explanation),
  'HL biochemical detail leaked into SL C1.2.5 explanation');
assert.equal(understandings, 164);
console.log('Coverage: 164/164. Question records: ' + questions +
  '. Graph data tables: ' + graphTables + '.');
console.log('Structural checks passed; independent scientific approval and build/browser tests remain separate.');
