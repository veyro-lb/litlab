/**
 * IB-only student source policy and explicit source-to-understanding mapping audit.
 * Run: node scripts/audit-ib-source-policy.mjs [--write]
 * This checks identities and existing mapping; it DOES NOT certify scientific accuracy,
 * permissions, or individual lesson completeness.
 */
import {readFile, writeFile, mkdir} from 'node:fs/promises';

const root = new URL('../src/biology/', import.meta.url);
const outputRoot = new URL('../docs/biology/ib-source-audit/', import.meta.url);
const registry = JSON.parse(await readFile(new URL('curriculum/registry.json', root), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('learning/catalog.json', root), 'utf8'));
const sourceCode = await readFile(new URL('learning/ib-sources.ts', root), 'utf8');
const lessonView = await readFile(new URL('learning/LessonView.tsx', root), 'utf8');
const errors = [];
const flags = [];
const matrix = [];
const external = [];
let duplicateInternal = 0;
let externalClaims = 0;
let missingCoreClaims = 0;
let sourceEntries = 0;
let figureAssets = 0;

function normalURL(value) {
  try {
    const uri = new URL(value);
    return uri.host.toLowerCase().replace(/^www\./, '') + uri.pathname.replace(/\/+$/, '').toLowerCase();
  } catch { return ''; }
}
function classify(reference) {
  const title = String(reference.title ?? '').toLowerCase();
  if (/\b(?:hodder|clegg|talbot)\b|third edition/.test(title)) return 'hodder';
  if (/(?:international baccalaureate|\bib\b.*biology guide|biology guide.*first assessment)/.test(title)) return 'ib';
  return 'other';
}
function identity(reference) {
  const kind = classify(reference);
  if (kind === 'hodder') return 'hodder:9781398364240';
  if (kind === 'ib') return 'ib:biology-guide:fa2025';
  return reference.url ? 'url:' + normalURL(reference.url) : 'title:' + String(reference.title).trim().toLowerCase();
}
function csvCell(value) {
  return '"' + String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g,' ') + '"';
}
function csvRow(cols) {return cols.map(csvCell).join(',');}

const sourceIds = [...sourceCode.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]);
const sourceURLs = [...sourceCode.matchAll(/\burl:\s*'([^']+)'/g)].map(match => match[1]);
const expectedIds = ['ib-biology-guide-fa2025', 'hodder-biology-third-edition-2023'];
if (sourceIds.join('|') !== expectedIds.join('|')) errors.push('Student-facing source list differs from the two authorized canonical identities.');
if (new Set(sourceURLs.map(normalURL)).size !== 2 || sourceURLs.length !== 2) errors.push('Student-facing sources must have exactly two distinct publisher/IB URLs.');
if (!sourceURLs[0]?.startsWith('https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/')) errors.push('Official IB link must be the authorized biology page, not a mirrored guide.');
if (!sourceURLs[1]?.startsWith('https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition')) errors.push('Coursebook link must point to the publisher.');
const sourceUI = lessonView.split("{mode==='sources'&&")[1] ?? '';
if (!lessonView.includes('STUDENT_BIOLOGY_SOURCES.map(') || /lesson\.references\.(?:map|filter)|r\.title/.test(sourceUI)) errors.push('Sources view must use only the curated IB/Hodder list; raw provenance must not be rendered.');
if (/Main teaching and curriculum reference|Independent research or figure reference/.test(sourceUI)) errors.push('Legacy source-label clutter returned to the interface.');

if (!Array.isArray(registry) || registry.length !== 40) errors.push('Expected 40 registered syllabus topics.');
if (Object.keys(catalog).length !== 40) errors.push('Expected 40 registered lesson packages.');

const topicCounts = [];
const registeredIds = new Set();
const registeredTopics = new Set();
for (const topic of registry) {
  if (registeredTopics.has(topic.id)) errors.push('Duplicate topic: ' + topic.id);
  registeredTopics.add(topic.id);
  const entries = Object.values(catalog).filter(value => value.topicId === topic.id);
  if (entries.length !== 1) {errors.push('Missing/duplicate lesson catalog link for ' + topic.id); continue;}
  const entry = entries[0];
  if (!/^\.\/[a-z0-9-]+\/lesson\.json$/.test(entry.path)) {errors.push('Unsafe catalog path for ' + topic.id); continue;}
  let lesson;
  try {lesson = JSON.parse(await readFile(new URL('learning/' + entry.path.slice(2), root), 'utf8'));}
  catch (error) {errors.push('Cannot open lesson for ' + topic.id + ': ' + error.message); continue;}
  if (lesson.topicId !== topic.id) errors.push('Lesson/topic mismatch for ' + topic.id);
  if (lesson.review.status === 'approved' && !lesson.review.reviewer?.name) errors.push('Unreviewed approval claim in ' + topic.id);
  sourceEntries += lesson.references.length;
  figureAssets += lesson.assets.length;
  const coreIB = lesson.references.filter(r => classify(r) === 'ib');
  const coreHodder = lesson.references.filter(r => classify(r) === 'hodder');
  if (coreIB.length !== 1 || coreHodder.length !== 1) errors.push('Missing or repeated internal IB/Hodder source identity for ' + topic.id);
  const bySourceId = new Map(lesson.references.map(ref => [ref.id, ref]));
  const distinct = new Set();
  for (const ref of lesson.references) {
    const id = identity(ref);
    if (distinct.has(id)) {duplicateInternal++;errors.push('Duplicate reference identity ' + id + ' in ' + topic.id);}
    distinct.add(id);
    if (classify(ref) === 'other') external.push({topic:topic.id, title:ref.title, url:ref.url ?? '', id:ref.id});
  }
  const sectionByUnderstanding = new Map();
  for (const section of lesson.sections) {
    for (const id of section.understandingIds) {
      if (sectionByUnderstanding.has(id)) errors.push('Repeated lesson coverage ' + id);
      sectionByUnderstanding.set(id,section);
    }
  }
  for (const requirement of topic.understandings) {
    if (registeredIds.has(requirement.id)) errors.push('Repeated syllabus ID ' + requirement.id);
    registeredIds.add(requirement.id);
    const sec = sectionByUnderstanding.get(requirement.id);
    const status = sec ? 'Existing teaching section mapped; scientific check not complete' : 'NO TEACHING SECTION';
    if (!sec) errors.push('Missing teaching section for ' + requirement.id);
    else if (sec.level !== requirement.level) errors.push('SL/HL mismatch in ' + requirement.id);
    const refs = sec?.referenceIds ?? [];
    const teachingRefs = refs.map(id => bySourceId.get(id)).filter(Boolean);
    const unapproved = teachingRefs.filter(r => classify(r) === 'other');
    const lacksCore = !teachingRefs.some(r => classify(r) === 'ib') || !teachingRefs.some(r => classify(r) === 'hodder');
    if (unapproved.length) {externalClaims++;flags.push(requirement.id + ': legacy non-IB provenance requires core-source re-verification');}
    if (lacksCore) {missingCoreClaims++;flags.push(requirement.id + ': no complete direct IB + Hodder source mapping');}
    const publishedPages = sec?.textbook?.printedPages?.join('; ') ?? '';
    const hodderLocator = 'Chapter ' + topic.id + ' ' + topic.title + (publishedPages ? ' (printed pp. ' + publishedPages + ')' : ' (precise pages require review)');
    matrix.push([
      topic.id, topic.title, requirement.id, requirement.level === 'HL' ? 'Additional HL / HL-only' : 'Shared SL + HL',
      'IB Biology Guide FA2025, printed p. ' + requirement.guidePage,
      requirement.studentTitle,
      requirement.draftSummary,
      hodderLocator,
      status,
      unapproved.length ? 'Legacy external source claims need IB/Hodder re-verification' : 'Detailed scientific/assessment review pending',
      lacksCore ? 'Incomplete core-source mapping' : 'Core sources referenced; evidence not yet independently verified',
      lesson.review.status,
      lesson.review.reviewer?.name ? 'Qualified reviewer documented' : 'Qualified independent editorial review outstanding'
    ]);
  }
  if (sectionByUnderstanding.size !== topic.understandings.length) errors.push('Extra/unknown lesson coverage in ' + topic.id);
  topicCounts.push({topic:topic.id,understandings:topic.understandings.length,sections:lesson.sections.length,references:lesson.references.length,external:lesson.references.filter(r=>classify(r)==='other').length});
}
if (registeredIds.size !== 553 || matrix.length !== 553) errors.push('Expected 553 numbered syllabus understandings.');
const externalSorted = external.sort((a,b)=>(a.topic+a.title).localeCompare(b.topic+b.title));
const duplicateLabels = [...new Set(externalSorted.map(e => e.title))];
const csv = [
  csvRow(['topic_id','topic_title','official_understanding_id','level','official_guide_location','registry_requirement_title','registered_requirement_paraphrase_not_verbatim','hodder_chapter_and_printed_pages','existing_teaching_coverage','content_corrections_needed','core_reference_traceability','existing_review_stage','independent_editorial_status']),
  ...matrix.map(csvRow)
].join('\n')+'\n';
const report = [
  '# BioLab IB-only source audit — editorial status',
  '',
  'This report is generated from the registered course and each actual lesson JSON. It is a mapping/structure audit, **not** a line-by-line scientific sign-off, permission clearance, or an official IB endorsement.',
  '',
  '| Measure | Count |',
  '|---|---:|',
  '| Registered topics | ' + registry.length + ' |',
  '| Numbered syllabus understandings with matrix rows | ' + matrix.length + ' |',
  '| Internal reference records after safe duplicate merges | ' + sourceEntries + ' |',
  '| Legacy non-IB reference records retained for private provenance | ' + external.length + ' |',
  '| Distinct legacy non-IB reference titles | ' + duplicateLabels.length + ' |',
  '| Duplicate source identities still present internally | ' + duplicateInternal + ' |',
  '| Understandings with unapproved legacy reference provenance | ' + externalClaims + ' |',
  '| Understandings missing a full direct IB + Hodder reference mapping | ' + missingCoreClaims + ' |',
  '| Original/external assets retained for separate image rights review | ' + figureAssets + ' |',
  '| Automated structural/policy errors | ' + errors.length + ' |',
  '',
  '## Source types shown to students',
  '',
  '1. Official IB Biology Guide — First Assessment 2025: the authoritative syllabus, linked to the IB subject page (full Guide through authorized IB channels).',
  '2. Biology for the IB Diploma Programme, Third Edition (Hodder, 2023): ISBN 9781398364240, IB-reviewed teaching reference, linked to the publisher.',
  '',
  'Students do not see the following historical scientific cross-checking references as approved lesson teaching sources. Their claim pointers and licensing records are retained internally pending re-verification against the IB Guide and Hodder.',
  '',
  '## Legacy non-IB reference inventory (not approved BioLab teaching references)',
  '',
  ...externalSorted.map(ref => '- **' + ref.topic + '** — ' + ref.title + (ref.url ? ' (' + ref.url + ')' : '') + ' [' + ref.id + ']'),
  '',
  '## Known blockers before scientific approval',
  '',
  '- Qualified biology educator/editor and IB examiner must inspect all 553 requirement-by-requirement explanations and test feedback.',
  '- Syllabus alignment alone does not establish the correctness of diagrams, micrographs, labels, numerical graphs, or questions.',
  '- External evidence cited internally needs re-verification from eligible IB course materials; retain historical claim and permission records until reconciled.',
  '- Determine formal third-party licensing requirements for IB material and for this paid/third-party digital learning use. The supplied Guide copyright page states that commercial third-party use requires a written license.',
  '- Verify publisher permissions for any reproduced Hodder expression/artwork; BioLab must create original text and diagrams.',
  '- Confirm actual image licensing, eligibility, provenance, and factual interpretation independently before describing microscopy as reviewed.',
  '- Browser/mobile QA, TypeScript production build, and independent student-outcome testing are separate deliverables and are not established by this content map.',
  '',
  '## Automated structural failures',
  '',
  ...(errors.length ? errors.map(e=>'- '+e) : ['- None found by this script. This is **not** scientific certification.']),
  ''
].join('\n');
if (process.argv.includes('--write')) {
  await mkdir(outputRoot, {recursive:true});
  await writeFile(new URL('understanding-verification-matrix.csv',outputRoot), csv);
  await writeFile(new URL('source-and-editorial-report.md',outputRoot), report);
}
console.log('Source-policy audit: ' + registry.length + ' topics, ' + matrix.length + ' understandings, ' + external.length + ' legacy non-IB references, ' + duplicateInternal + ' duplicate internal sources, ' + errors.length + ' structural/policy errors.');
if (errors.length) {console.error(errors.join('\n'));process.exitCode = 1;}
