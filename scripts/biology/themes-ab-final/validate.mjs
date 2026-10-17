import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const fromRoot = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(fromRoot(p), 'utf8'));

export function validateTopic(topic, lesson, assetExists = () => true) {
  const errors = [];
  const error = (s) => errors.push(topic.id + ': ' + s);
  if (lesson.schemaVersion !== 1 || lesson.topicId !== topic.id || lesson.id !== topic.lessonId ||
      lesson.curriculumVersion !== topic.version) error('lesson identity / version mismatch');
  const expected = new Map(topic.understandings.map(u => [u.id, u.level]));
  const seen = new Set();
  const references = new Set((lesson.references || []).map(r => r.id));
  const assets = new Map((lesson.assets || []).map(a => [a.id, a]));
  for (const section of lesson.sections || []) {
    const ids = section.understandingIds || [];
    if (ids.length !== 1 || !expected.has(ids[0]) || seen.has(ids[0]))
      error('missing, duplicate or invalid understanding ' + section.id);
    ids.forEach(id => seen.add(id));
    if (section.level !== expected.get(ids[0])) error('SL/HL level mismatch ' + section.id);
    if ((section.claimReferences || []).map(c => c.claim).join('\n\n') !== section.explanation)
      error('claim reference drift ' + section.id);
    if (section.teachingBlocks && section.teachingBlocks.map(b => b.explanation).join('\n\n') !== section.explanation)
      error('teaching paragraph drift ' + section.id);
    if ((section.referenceIds || []).some(id => !references.has(id))) error('bad source reference ' + section.id);
    for (const id of section.assets || []) {
      const a = assets.get(id);
      if (!a) error('missing asset metadata ' + id);
      else if (!a.withheldReason && a.src.startsWith('/biology/') && !assetExists(a.src))
        error('missing image bytes ' + a.src);
    }
    for (const v of section.visuals || []) {
      if (!Number.isInteger(v.afterBlock) || v.afterBlock < 0 ||
          v.afterBlock >= (section.teachingBlocks?.length || 0))
        error('invalid visual anchor ' + section.id);
      if (v.kind === 'comparison' && (!v.headers?.length || !v.rows?.length ||
          v.rows.some(row => row.length !== v.headers.length)))
        error('ragged comparison ' + section.id);
      if (v.kind === 'sequence' && (!v.steps?.length ||
          v.steps.some(step => !step.title || !step.description)))
        error('empty process step ' + section.id);
      if (v.kind === 'bars' && (!v.unit || !v.note || !v.values?.length ||
          v.values.some(x => !Number.isFinite(x.value))))
        error('invalid quantitative graph ' + section.id);
    }
    for (const g of section.graphTables || []) {
      if (!g.caption || !g.headers?.length || !g.rows?.length ||
          g.rows.some(row => row.length !== g.headers.length))
        error('invalid graph/data table ' + section.id);
    }
    for (const q of section.interactions || []) {
      if (q.kind !== 'selection' || q.options?.filter(o => o.correct).length !== 1 ||
          q.options?.some(o => !o.feedback)) error('invalid in-lesson choice ' + q.id);
    }
  }
  if (seen.size !== expected.size) error('numbered-understanding coverage mismatch');
  const questions = new Set();
  for (const q of lesson.questions || []) {
    if (questions.has(q.id)) error('duplicate question id ' + q.id);
    questions.add(q.id);
    if (!q.understandingIds?.length || q.understandingIds.some(id => !expected.has(id)) ||
        !lesson.sections.some(s => s.id === q.sectionId &&
          q.understandingIds.some(id => s.understandingIds.includes(id))))
      error('orphan question ' + q.id);
    if (q.level !== (q.understandingIds.some(id => expected.get(id) === 'HL') ? 'HL' : 'shared'))
      error('question level mismatch ' + q.id);
    if (q.paper === '1A') {
      if (q.marks !== 1 || q.options?.length !== 4 ||
          q.options.filter(o => o.correct).length !== 1 ||
          q.options.some(o => !o.feedback)) error('invalid MCQ answer key ' + q.id);
    } else if (!['1B', '2'].includes(q.paper) || q.marks !== q.markingPoints?.length ||
               !q.answer || !q.prompt) error('invalid written marking scheme ' + q.id);
  }
  for (const id of expected.keys()) {
    if (![...(lesson.questions || [])].some(q => q.understandingIds.includes(id)))
      error('no assessment for ' + id);
  }
  return errors;
}

export function auditCourse(root = ROOT) {
  const registry = read('src/biology/curriculum/registry.json');
  const catalog = read('src/biology/learning/catalog.json');
  const topics = registry.filter(t => t.theme === 'A' || t.theme === 'B');
  const totals = { topics: topics.length, A: 0, B: 0, understandings: 0, questions: 0 };
  const errors = [];
  for (const t of topics) {
    const entry = catalog[t.lessonId];
    if (!entry) { errors.push('Missing catalog entry for ' + t.id); continue; }
    const lessonPath = path.join('src/biology/learning', entry.path.replace(/^\.\//, ''));
    const d = read(lessonPath);
    const exists = (src) => fs.existsSync(path.join(root, 'public', src.slice(1)));
    errors.push(...validateTopic(t, d, exists));
    totals[t.theme] += t.understandings.length;
    totals.understandings += t.understandings.length;
    totals.questions += d.questions.length;
  }
  if (totals.topics !== 19 || totals.A !== 95 || totals.B !== 123 || totals.understandings !== 218)
    errors.push('A/B registry count differs from required 19 / 95 / 123 / 218');
  return { totals, errors };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outcome = auditCourse();
  console.log(JSON.stringify(outcome, null, 2));
  if (outcome.errors.length) process.exitCode = 1;
}
