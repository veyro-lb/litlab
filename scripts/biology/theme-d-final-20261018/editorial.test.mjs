import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const topics = [
  ['D1.1', 'dna-replication', 9, 5], ['D1.2', 'protein-synthesis', 19, 11],
  ['D1.3', 'mutation-gene-editing', 10, 7], ['D2.1', 'cell-nuclear-division', 17, 11],
  ['D2.2', 'gene-expression', 11, 0], ['D2.3', 'water-potential', 11, 7],
  ['D3.1', 'reproduction', 20, 12], ['D3.2', 'inheritance', 21, 15],
  ['D3.3', 'homeostasis', 11, 6], ['D4.1', 'natural-selection', 15, 8],
  ['D4.2', 'stability-change', 15, 11], ['D4.3', 'climate-change', 12, 8]
];
const load = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const lessons = topics.map(([id, slug]) => load('src/biology/learning/' + slug + '/lesson.json'));
const matrix = load('docs/biology/theme-d-final-20261018/COVERAGE_MATRIX.json');

test('171 unique, ordered, first-assessment-2025 Theme D understandings', () => {
  const all = [];
  lessons.forEach((lesson, i) => {
    const [id,, count, shared] = topics[i];
    assert.equal(lesson.topicId, id);
    assert.equal(lesson.sections.length, count);
    assert.equal(lesson.curriculumVersion, 'ib-biology-fa2025-v1');
    lesson.sections.forEach((section, j) => {
      const required = id + '.' + (j + 1);
      assert.deepEqual(section.understandingIds, [required]);
      assert.equal(section.level, j < shared ? 'shared' : 'HL');
      all.push(required);
    });
  });
  assert.equal(all.length, 171);
  assert.equal(new Set(all).size, 171);
  assert.equal(lessons.reduce((sum, l) => sum + l.sections.filter(s => s.level === 'shared').length, 0), 101);
  assert.equal(lessons.reduce((sum, l) => sum + l.sections.filter(s => s.level === 'HL').length, 0), 70);
});

test('every understanding has original teaching and core source crosswalk', () => {
  lessons.forEach(lesson => lesson.sections.forEach(section => {
    assert.ok(section.explanation.trim().split(/\s+/).length >= 70, section.understandingIds[0]);
    assert.ok(section.workedExample?.trim(), section.understandingIds[0]);
    assert.ok(section.teachingBlocks?.length, section.understandingIds[0]);
    assert.ok(section.referenceIds.some(id => id.startsWith('ib-')));
    assert.ok(section.referenceIds.some(id => id.startsWith('hodder-')));
    assert.ok(section.guidePage > 0);
    assert.ok(section.textbook?.printedPages?.length);
    for (const b of section.teachingBlocks) assert.ok(b.title && b.explanation && b.referenceIds?.length);
  }));
});

test('all cited original Theme D assets exist, without adding global visual assets', () => {
  lessons.forEach(lesson => (lesson.assets || []).forEach(asset => {
    assert.ok(asset.license && /original|project|source|public/i.test(asset.license));
    assert.ok(asset.url?.startsWith('/biology/'));
    assert.ok(existsSync(resolve(root, 'public' + asset.url)), asset.id);
  }));
});

test('table and comparison schemas are unambiguous', () => {
  lessons.forEach(lesson => lesson.sections.forEach(section => {
    for (const t of section.graphTables || []) {
      assert.ok(t.caption?.trim());
      assert.ok(t.headers?.length >= 2);
      assert.ok(t.rows?.length >= 1);
      t.rows.forEach(row => assert.equal(row.length, t.headers.length, section.understandingIds[0]));
    }
  }));
});

test('generic copy-paste questions were replaced where identified', () => {
  lessons.filter(l => ['D3.2','D3.3','D4.1','D4.2'].includes(l.topicId)).forEach(l =>
    l.sections.forEach(s => {
      assert.doesNotMatch(s.guidingQuestion, /How does .+ work, and what evidence or calculation supports it/i);
      assert.doesNotMatch(s.guidingQuestion, /What biological mechanism explains/i);
      assert.doesNotMatch(s.guidingQuestion, /What is the mechanism and population-level consequence of/i);
      assert.doesNotMatch(s.guidingQuestion, /What mechanisms explain .* and what evidence could test them/i);
    })
  );
});

test('no empty curriculum-source coverage or missing editorial matrix items', () => {
  assert.equal(matrix.totalUnderstandings, 171);
  assert.equal(matrix.items.length, 171);
  assert.equal(matrix.refinedUnderstandings, 43);
  const rows = new Map(matrix.items.map(item => [item.understanding, item]));
  assert.equal(rows.size, 171);
  lessons.forEach(l => l.sections.forEach(s => {
    const m = rows.get(s.understandingIds[0]);
    assert.ok(m);
    assert.equal(m.sectionId, s.id);
    assert.equal(m.topic, l.topicId);
    assert.equal(m.level, s.level);
    assert.ok(m.sourceReferences.some(r => r.startsWith('ib-')));
    assert.ok(m.sourceReferences.some(r => r.startsWith('hodder-')));
  }));
});

test('specific high-risk scientific distinctions are retained', () => {
  const section = id => lessons.flatMap(l => l.sections).find(s => s.understandingIds.includes(id));
  for (const [id, keywords] of Object.entries({
    'D1.1.6': ['5′→3′','3′→5′'],
    'D1.2.9': ['AUG','stop'],
    'D1.3.9': ['repair','off-target'],
    'D2.1.9': ['meiosis I','meiosis II'],
    'D2.2.7': ['transgenerational'],
    'D2.3.10': ['Ψw','Ψs','Ψp'],
    'D3.1.4': ['oviduct','testes'],
    'D3.2.21': ['χ²','df'],
    'D3.3.10': ['aquaporin'],
    'D4.1.13': ['Hardy–Weinberg','2pq'],
    'D4.2.3': ['threshold','model'],
    'D4.3.4': ['sea ice','land-based ice']
  })) {
    const content = section(id)?.explanation || '';
    keywords.forEach(term => assert.ok(content.toLowerCase().includes(term.toLowerCase()), id + ':' + term));
  }
});