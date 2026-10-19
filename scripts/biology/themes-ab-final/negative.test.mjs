import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditCourse, validateTopic} from './validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/biology/curriculum/registry.json'), 'utf8'));
const lesson = JSON.parse(fs.readFileSync(path.join(root, 'src/biology/learning/nucleic-acids/lesson.json'), 'utf8'));
const topic = registry.find(t => t.id === 'A1.2');
const copy = () => structuredClone(lesson);
const check = d => validateTopic(topic, d, () => true);

test('all 19 A/B topics have mapped teaching assets and questions', () => {
  const result = auditCourse();
  assert.deepEqual(result.totals.topics, 19);
  assert.deepEqual(result.totals.understandings, 218);
  assert.deepEqual(result.errors, [], result.errors.join('\n'));
});
test('rejects a dropped understanding', () => {
  const d = copy(); d.sections.pop();
  assert.ok(check(d).some(e => e.includes('coverage mismatch')));
});
test('rejects an SL/HL level leak', () => {
  const d = copy(); d.sections.find(s => s.understandingIds[0] === 'A1.2.13').level = 'shared';
  assert.ok(check(d).some(e => e.includes('level mismatch')));
});
test('rejects a wrong four-choice answer key', () => {
  const d = copy(); d.questions.find(q => q.paper === '1A').options.forEach(o => o.correct = false);
  assert.ok(check(d).some(e => e.includes('MCQ answer key')));
});
test('rejects teaching paragraphs diverging from claim references', () => {
  const d = copy(); d.sections[0].explanation += ' Changed without supporting claim mapping.';
  assert.ok(check(d).some(e => e.includes('claim reference drift')));
});
test('rejects a ragged comparison table', () => {
  const d = copy(); d.sections.find(s => s.understandingIds[0] === 'A1.2.9').visuals[0].rows[0].pop();
  assert.ok(check(d).some(e => e.includes('ragged comparison')));
});
test('rejects marking points not matching marks', () => {
  const d = copy(); d.questions.find(q => q.id === 'a12-nucleosome-explanation').markingPoints.pop();
  assert.ok(check(d).some(e => e.includes('written marking scheme')));
});
