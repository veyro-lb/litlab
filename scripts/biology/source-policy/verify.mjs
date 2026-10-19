import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = new URL('../../../src/biology/learning/', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
const registry = JSON.parse(await readFile(new URL('../../../src/biology/curriculum/registry.json', import.meta.url), 'utf8'));
const topicIds = new Set(registry.map(topic => topic.id));
const problems = [], entries = [], catalogueReport = [];
const sourceType = r => {
  const t = String(r.title || '');
  if (/\bhodder\b|clegg.+davis|biology for the ib diploma.+third/i.test(t)) return 'hodder-biology-third-edition-2023';
  if (/international baccalaureate|(?:\bIB|\bDP) (?:DP )?(?:Biology )?[Gg]uide|^Biology guide/i.test(t)) return 'ib-biology-guide-2025';
  return 'external';
};
const unique = xs => [...new Set(xs)];
const excerpt = text => String(text || '').replace(/\s+/g, ' ').slice(0, 220);
const data = Object.values(catalog);
if (data.length !== 40) problems.push('Expected exactly 40 topic lesson packages; got ' + data.length);
const covered = new Set();

for (const spec of data) {
  if (!/^[A-D][1-4]\.\d$/.test(spec.topicId) || !/^\.[/][a-z0-9-]+[/]lesson\.json$/.test(spec.path)) {
    problems.push('Unsafe or malformed catalogue entry: ' + JSON.stringify(spec)); continue;
  }
  let lesson;
  try { lesson = JSON.parse(await readFile(new URL(spec.path, root), 'utf8')); }
  catch (e) { problems.push(spec.topicId + ': cannot read lesson: ' + e.message); continue; }
  if (lesson.topicId !== spec.topicId || !topicIds.has(spec.topicId) || covered.has(spec.topicId)) {
    problems.push('Missing/duplicate registry mapping: ' + spec.topicId); continue;
  }
  covered.add(spec.topicId);
  const references = new Map((lesson.references || []).map(r => [r.id, r]));
  const principals = unique([...references.values()].map(sourceType).filter(x => x !== 'external'));
  const flagByUnderstanding = new Map();
  for (const section of lesson.sections || []) {
    for (const claim of section.claimReferences || []) {
      const records = (claim.referenceIds || []).map(id => references.get(id)).filter(Boolean);
      const external = records.filter(record => sourceType(record) === 'external');
      if (!external.length) continue;
      const hasPrincipal = records.some(record => sourceType(record) !== 'external');
      for (const understandingId of section.understandingIds || []) {
        if (!flagByUnderstanding.has(understandingId)) flagByUnderstanding.set(understandingId, {
          understandingId, topicId: spec.topicId, level: section.level, action: 'Verify with both principal educational authorities; replace unsupported teaching examples instead of silently removing explanations.',
          unverifiedClaimMappings: []
        });
        flagByUnderstanding.get(understandingId).unverifiedClaimMappings.push({
          status: hasPrincipal ? 'external-corroboration-alongside-principal' : 'external-only-citation',
          claimExcerpt: excerpt(claim.claim),
          existingInternalReferences: external.map(r => ({id: r.id, title: r.title, url: r.url || null}))
        });
      }
    }
  }
  entries.push(...flagByUnderstanding.values());
  catalogueReport.push({
    topicId: spec.topicId,
    sourceIdsPresent: principals,
    principalSourceMissingFromLessonMetadata: ['ib-biology-guide-2025','hodder-biology-third-edition-2023'].filter(id => !principals.includes(id)),
    rawReferences: references.size,
    flaggedUnderstandings: [...flagByUnderstanding.keys()]
  });
}
for (const topicId of topicIds) if (!covered.has(topicId)) problems.push('Missing topic: ' + topicId);
const outside = entries.flatMap(e => e.unverifiedClaimMappings);
const report = {
  policyVersion: 'ib-sources-20261018',
  base: 'feature/biolab-ib-final-base-20261018',
  interpretation: 'These are claim-source mapping gaps for editorial review, NOT scientific-falsity findings. No theme lesson text was changed.',
  summary: {
    topicsChecked: catalogueReport.length,
    flaggedUnderstandingCount: entries.length,
    externalOnlyClaimMappings: outside.filter(x => x.status === 'external-only-citation').length,
    mixedClaimMappings: outside.filter(x => x.status !== 'external-only-citation').length
  },
  topics: catalogueReport, entries
};
if (process.argv.includes('--write')) {
  const output = new URL('../../../docs/biology/IB_SOURCE_UNDERSTANDING_LEDGER.json', import.meta.url);
  await writeFile(output, JSON.stringify(report,null,2) + '\n');
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(report,null,2) + '\n');
else {
  console.log('IB source-policy audit: ' + JSON.stringify(report.summary));
  for (const topic of catalogueReport) console.log(topic.topicId + ' flagged: ' + (topic.flaggedUnderstandings.join(', ') || 'none') + (topic.principalSourceMissingFromLessonMetadata.length ? ' | missing metadata: ' + topic.principalSourceMissingFromLessonMetadata.join(', ') : ''));
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
}
