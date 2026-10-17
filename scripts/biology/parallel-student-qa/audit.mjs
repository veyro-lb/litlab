#!/usr/bin/env node
/**
 * Independent, read-only course/assessment quality audit.
 * Run: node scripts/biology/parallel-student-qa/audit.mjs
 * Does not mutate curriculum, lessons, accounts, or application configuration.
 */
import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = path => JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
const present = value => typeof value === 'string' && value.trim().length > 0;
const normalizeExact = value => String(value ?? '').replace(/\s+/g, ' ').trim();
// Preserve capitalization: capitalization is sometimes precisely what Biology asks students to identify.
const duplicates = values => new Set(values).size !== values.length;

export function inspectChoice(item, topicId, location) {
  const issues = [];
  const add = (severity, rule, detail) => issues.push({id:topicId+':'+item.id+':'+rule, severity, rule, topicId, itemId:item.id, location, detail});
  const options = item.options;
  if (!Array.isArray(options) || options.length < 2) { add('high','choice-options','Fewer than two answer options'); return issues; }
  if (options.filter(o => o.correct === true).length !== 1) add('high','choice-key','Selection question must have exactly one correct option');
  if (duplicates(options.map(o => o.id))) add('high','choice-option-ids','Duplicate option identifiers');
  if (options.some(o => !present(o.text))) add('high','choice-empty','Missing option text');
  if (duplicates(options.map(o => normalizeExact(o.text)))) add('high','choice-repeated','Exactly duplicated answer option text');
  if (options.some(o => !present(o.feedback))) add('medium','choice-feedback-empty','At least one option has no explanation');
  const incorrect = options.filter(o => o.correct === false);
  if (incorrect.length > 1 && new Set(incorrect.map(o => normalizeExact(o.feedback))).size === 1)
    add('medium','choice-feedback-generic','All incorrect choices use identical feedback; review the explanatory value');
  return issues;
}

export function inspectLesson(topic, lesson, relativePath) {
  const issues = [];
  const add = (severity, rule, itemId, detail) => issues.push({id:topic.id+':'+itemId+':'+rule, severity, rule, topicId:topic.id, itemId, location:relativePath, detail});
  if (lesson.topicId !== topic.id || lesson.id !== topic.lessonId) add('high','lesson-identity',topic.id,'Registry, catalog, and lesson identity differ');
  const expected = new Map(topic.understandings.map(u => [u.id,u]));
  const refs = new Set(lesson.references.map(r => r.id));
  const assets = new Map(lesson.assets.map(a => [a.id,a]));
  const secIds = new Set(lesson.sections.map(s => s.id));
  const covered = [];
  for (const section of lesson.sections) {
    if (!Array.isArray(section.understandingIds) || section.understandingIds.length === 0) add('high','section-unmapped',section.id,'No syllabus understanding mapped');
    if (!present(section.explanation)) add('high','section-empty',section.id,'No explanation');
    for (const id of section.understandingIds || []) {
      covered.push(id);
      if (!expected.has(id)) add('high','section-off-topic',section.id,'Unregistered understanding '+id);
      else if (section.level !== expected.get(id).level) add('high','section-scope',section.id,id+' has mismatched SL/HL level');
    }
    for (const assetId of section.assets || []) if (!assets.has(assetId)) add('high','asset-unresolved',section.id,'Unknown asset '+assetId);
    for (const r of section.referenceIds || []) if (!refs.has(r)) add('medium','reference-unresolved',section.id,'Unknown reference '+r);
    const count = section.teachingBlocks?.length ?? section.explanation.split('\n\n').length;
    for (const vis of section.visuals || []) {
      if (!Number.isInteger(vis.afterBlock) || vis.afterBlock < 0 || vis.afterBlock >= count)
        add('medium','visual-placement',section.id,'Visual '+vis.title+' has out-of-range placement');
      if (vis.kind === 'comparison' && (vis.headers.length < 2 || vis.rows.some(row => row.length !== vis.headers.length)))
        add('high','comparison-columns',section.id,'Comparison '+vis.title+' has inconsistent columns');
      if (vis.kind === 'bars' && vis.values.some(v => !Number.isFinite(v.value) || v.value < 0))
        add('high','bar-scale',section.id,'Bars must have finite nonnegative values');
      if (vis.kind === 'sequence' && !vis.steps?.length) add('medium','empty-sequence',section.id,'Empty sequence diagram');
    }
    for (const table of section.graphTables || []) if (table.rows.some(row => row.length !== table.headers.length))
      add('high','table-columns',section.id,'Data table '+table.caption+' has inconsistent columns');
    const embedded = [...(section.interactions || []), ...(section.prediction ? [section.prediction.question] : [])];
    for (const question of embedded) {
      issues.push(...inspectChoice(question, topic.id, relativePath+'#'+section.id));
      for (const id of question.understandingIds || []) if (!expected.has(id) || (topic.level==='shared' && section.level==='shared' && expected.get(id)?.level==='HL'))
        add('high','embedded-scope',question.id,'Embedded question targets an inaccessible understanding '+id);
    }
    for (const stage of section.mechanismChallenge?.stages || [])
      issues.push(...inspectChoice(stage,topic.id,relativePath+'#'+section.id+':mechanism'));
  }
  if (duplicates(covered) || covered.length !== expected.size || expected.size !== new Set(covered).size)
    add('high','coverage',topic.id,'Understanding coverage must be one-to-one; expected '+expected.size+', found '+covered.length);
  const seenQuestionIds = [];
  for (const q of lesson.questions) {
    seenQuestionIds.push(q.id);
    if (!present(q.prompt)) add('high','question-prompt',q.id,'Blank question prompt');
    if (!['1A','1B','2'].includes(q.paper)) add('high','paper-type',q.id,'Unknown paper '+q.paper);
    if (!Number.isInteger(q.marks) || q.marks < 1) add('high','question-marks',q.id,'Invalid mark allocation');
    if (!secIds.has(q.sectionId)) add('high','question-section',q.id,'Missing target section '+q.sectionId);
    for (const id of q.understandingIds || []) {
      if (!expected.has(id)) add('high','question-off-topic',q.id,'Unknown target understanding '+id);
      else if (q.level !== expected.get(id).level) add('high','question-scope',q.id,'Level mismatch for '+id);
    }
    for (const ref of q.referenceIds || []) if (!refs.has(ref)) add('medium','question-reference',q.id,'Unknown source reference '+ref);
    if (q.options) issues.push(...inspectChoice(q,topic.id,relativePath+'#questions'));
    else if (!Array.isArray(q.markingPoints) || !q.markingPoints.length || !present(q.answer))
      add('medium','written-guidance',q.id,'Written response has incomplete answer or marking guidance');
    if (q.data?.rows?.some(row => row.length !== q.data.headers.length))
      add('high','question-data-shape',q.id,'Practice data table columns are inconsistent');
  }
  if (duplicates(seenQuestionIds)) add('high','question-ids',topic.id,'Question IDs repeat inside a topic');
  for (const asset of lesson.assets) {
    if (asset.withheldReason) continue;
    for (const field of ['src','mobileSrc','recallSrc','recallMobileSrc']) {
      const src = asset[field];
      if (!src || /^https?:\/\//.test(src) || /^data:/.test(src)) continue;
      if (!src.startsWith('/')) {add('medium','asset-src',asset.id,'Unexpected relative path '+src);continue;}
      if (!existsSync(resolve(ROOT,'public',src.slice(1))))
        add('high','asset-file',asset.id,'Missing local figure '+src);
    }
    if (!present(asset.alt)) add('medium','asset-alt',asset.id,'Figure has no descriptive alternative text');
  }
  return issues;
}

export function audit() {
  const registry = read('src/biology/curriculum/registry.json');
  const catalog = read('src/biology/learning/catalog.json');
  const findings = [];
  const global = (severity,rule,detail) => findings.push({id:'COURSE:'+rule,severity,rule,topicId:null,itemId:null,location:'src/biology/curriculum/registry.json',detail});
  const all = registry.flatMap(t => t.understandings);
  if (registry.length !== 40) global('high','topics','Expected 40 registered topics; found '+registry.length);
  if (all.length !== 553) global('high','understandings','Expected 553 understandings; found '+all.length);
  if (all.filter(u=>u.level==='shared').length !== 337 || all.filter(u=>u.level==='HL').length !== 216)
    global('high','syllabus-scope','Expected 337 shared and 216 HL understandings');
  if (duplicates(all.map(u=>u.id))) global('high','understanding-ids','Understanding IDs repeat');
  if (duplicates(registry.map(t=>t.id))) global('high','topic-ids','Topic IDs repeat');
  const visited=[];
  for (const topic of registry) {
    if (!topic.lessonId) {global('high','unregistered-'+topic.id,'Topic has no lesson ID');continue;}
    const item = catalog[topic.lessonId];
    if (!item || item.topicId !== topic.id) {global('high','catalog-'+topic.id,'Catalog entry does not map '+topic.id);continue;}
    const relativePath = 'src/biology/learning/'+item.path.replace(/^\.\//,'');
    if (!existsSync(resolve(ROOT,relativePath))) {global('high','file-'+topic.id,'Missing lesson file '+relativePath);continue;}
    const lesson = read(relativePath);
    visited.push(topic.id);
    findings.push(...inspectLesson(topic,lesson,relativePath));
    if (topic.level==='HL' && topic.understandings.some(u=>u.level==='shared'))
      global('high','hl-topic-'+topic.id,'HL-only topic includes shared understandings');
  }
  if (Object.keys(catalog).length !== visited.length) global('high','catalog-count','Catalog has unmatched entries');
  const result={schemaVersion:1,baseCommit:process.env.GITHUB_SHA||null,generatedAt:new Date().toISOString(),
    scope:{topics:registry.length,lessonsAudited:visited.length,understandings:all.length,shared:all.filter(u=>u.level==='shared').length,hl:all.filter(u=>u.level==='HL').length,
      questionCount:registry.reduce((n,t)=>{if(!t.lessonId || !catalog[t.lessonId])return n;return n+read('src/biology/learning/'+catalog[t.lessonId].path.replace(/^\.\//,'')).questions.length;},0)},
    findings, counts:{high:findings.filter(f=>f.severity==='high').length,medium:findings.filter(f=>f.severity==='medium').length,low:findings.filter(f=>f.severity==='low').length},
    limitations:['Static schema and internal consistency only; not scientific validation','Browser behavior and remote figure downloads require separate Playwright test','No student account data read or modified']};
  return result;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = audit(), out = resolve(ROOT,'qa-artifacts/parallel-student-qa/static-audit.json');
  mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({scope:result.scope,counts:result.counts,report:out},null,2));
  if (result.counts.high) process.exitCode = 1;
}
