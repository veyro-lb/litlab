import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTopic} from '../themes-ab-final/validate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const registry = read('src/biology/curriculum/registry.json');
const catalog = read('src/biology/learning/catalog.json');
const topicIds = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'A2.3'];
const expectedCounts = [8, 15, 9, 14, 6];

function load(id) {
  const topic = registry.find(t => t.id === id);
  assert.ok(topic, 'missing registry topic ' + id);
  const entry = catalog[topic.lessonId];
  assert.ok(entry && entry.topicId === id, 'missing catalog package ' + id);
  return {topic, lesson: read('src/biology/learning/' + entry.path.replace(/^\.\//, ''))};
}

test('all 52 A1–A2 understandings retain exact identities, scoping, questions and available figures', () => {
  let total = 0;
  let hl = 0;
  for (const [i, id] of topicIds.entries()) {
    const {topic, lesson} = load(id);
    const missing = validateTopic(topic, lesson, src =>
      fs.existsSync(path.join(ROOT, 'public', src.replace(/^\//, ''))));
    assert.deepEqual(missing, [], id + ': ' + missing.join('; '));
    assert.equal(lesson.sections.length, expectedCounts[i], id + ' understanding count');
    assert.deepEqual(lesson.sections.map(s => s.understandingIds[0]),
      Array.from({length: expectedCounts[i]}, (_, n) => id + '.' + (n + 1)));
    assert.ok(lesson.sections.every(s => !s.assets.some(key =>
      lesson.assets.find(a => a.id === key)?.withheldReason)), id + ': no withheld diagram');
    total += lesson.sections.length;
    hl += lesson.sections.filter(s => s.level === 'HL').length;
  }
  assert.equal(total, 52);
  assert.equal(hl, 25);
});

test('A2.1.2 has one correct, semantically aligned virus-autonomy answer', () => {
  const {lesson} = load('A2.1');
  const q = lesson.questions.find(q => q.id === 'a21-p1a-2');
  assert.ok(q?.prompt.includes('bacteriophage lambda'));
  assert.equal(q.options.filter(o => o.correct).length, 1);
  assert.match(q.options.find(o => o.correct).text, /requires a host bacterium/i);
  assert.ok(q.options.every(o => o.feedback && o.feedback !== q.options[0].feedback));
  assert.match(lesson.sections.find(s => s.understandingIds[0] === 'A2.1.2').explanation,
    /lack cytoplasm, ribosomes and independent energy metabolism/);
});

test('A1.1.6 heat-capacity calculation states mass, consistent units and solutions', () => {
  const {lesson} = load('A1.1');
  const q = lesson.questions.find(q => q.id === 'p1b-2');
  assert.match(q.prompt, /0\.010 kg/);
  assert.match(q.prompt, /4184 J kg/);
  assert.match(q.prompt, /1007 J kg/);
  const water = 100 / (0.010 * 4184);
  const air = 100 / (0.010 * 1007);
  assert.ok(Math.abs(water - 2.39) < 0.01);
  assert.ok(Math.abs(air - 9.93) < 0.01);
  assert.match(q.answer, /2\.39 K/);
  assert.match(q.answer, /9\.93 K/);
  assert.equal(q.marks, q.markingPoints.length);
});

test('critical source-branch additions are preserved', () => {
  const dna = load('A1.2').lesson;
  const a1213 = dna.sections.find(s => s.understandingIds[0] === 'A1.2.13');
  assert.match(a1213.explanation, /H1 is a separate linker histone, not/);
  assert.ok(dna.questions.some(q => q.id === 'a12-nucleosome-explanation'));
  const cell = load('A2.2').lesson;
  assert.ok(cell.questions.some(q => q.id === 'a22-graticule-calibration'));
  assert.match(cell.sections.find(s => s.understandingIds[0] === 'A2.2.2').explanation,
    /100 µm across 40 eyepiece-graticule divisions/);
});

test('new visual comparisons are structurally valid and positioned after real teaching paragraphs', () => {
  for (const id of topicIds) {
    const {lesson} = load(id);
    for (const s of lesson.sections)
      for (const v of s.visuals || []) {
        assert.ok(Number.isInteger(v.afterBlock) && v.afterBlock >= 0 &&
          v.afterBlock < s.teachingBlocks.length, s.id + ': invalid visual anchor');
        if (v.kind === 'comparison') {
          assert.ok(v.headers.length >= 2 && v.rows.length > 0);
          assert.ok(v.rows.every(row => row.length === v.headers.length),
            s.id + ': ragged table');
        }
      }
  }
});

test('negative: invalid A2.1.2 multiple-choice key is rejected', () => {
  const {topic, lesson} = load('A2.1');
  const mutated = structuredClone(lesson);
  mutated.questions.find(q => q.id === 'a21-p1a-2').options
    .forEach(o => { o.correct = false; });
  assert.ok(validateTopic(topic, mutated).some(error => /MCQ answer key/.test(error)));
});

test('negative: HL-only A2.3 content cannot be silently marked shared', () => {
  const {topic, lesson} = load('A2.3');
  const mutated = structuredClone(lesson);
  mutated.sections[0].level = 'shared';
  assert.ok(validateTopic(topic, mutated).some(error => /level mismatch/.test(error)));
});

test('negative: figure comparison with inconsistent row length is rejected', () => {
  const {topic, lesson} = load('A2.1');
  const mutated = structuredClone(lesson);
  const section = mutated.sections.find(s => s.understandingIds[0] === 'A2.1.2');
  section.visuals.find(v => v.kind === 'comparison').rows[0].pop();
  assert.ok(validateTopic(topic, mutated).some(error => /ragged comparison/.test(error)));
});
