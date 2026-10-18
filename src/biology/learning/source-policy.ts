import type {Level} from '../curriculum/schema';
import type {Asset, Lesson} from './lesson-contract';

/** Curated authorities, never derived from mutable lesson.references records. */
export const APPROVED_EDUCATIONAL_SOURCE_IDS = ['ib-biology-guide-2025', 'hodder-biology-third-edition-2023'] as const;
export type EducationalSourceId = typeof APPROVED_EDUCATIONAL_SOURCE_IDS[number];
export interface EducationalSource {
  id: EducationalSourceId;
  title: string;
  description: string;
  url: string;
  linkDescription: string;
}

const EDUCATIONAL_WHITELIST: readonly EducationalSource[] = Object.freeze([
  Object.freeze({
    id: 'ib-biology-guide-2025',
    title: 'IB Diploma Programme Biology guide — first assessment 2025',
    description: 'International Baccalaureate Organization (2023). Official curriculum, understandings, SL/HL scope and assessment requirements.',
    url: 'https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/',
    linkDescription: 'Official IB Biology subject page (the complete guide may require IB Programme Resource Centre access)'
  }),
  Object.freeze({
    id: 'hodder-biology-third-edition-2023',
    title: 'Biology for the IB Diploma Programme — Third Edition',
    description: 'C. J. Clegg, Andrew Davis and Christopher Talbot. Hodder Education (2023), ISBN 9781398364240. An independently published coursebook reviewed in cooperation with the IB; not an official IB publication.',
    url: 'https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition',
    linkDescription: 'Publisher book listing'
  })
]);

/** One canonical record per approved authority in a stable order; no lesson URL can extend the whitelist. */
export function getStudentEducationalSources(): EducationalSource[] {
  const seen = new Set<EducationalSourceId>();
  return EDUCATIONAL_WHITELIST.filter(source => {
    if (!APPROVED_EDUCATIONAL_SOURCE_IDS.includes(source.id) || seen.has(source.id)) return false;
    seen.add(source.id);
    return true;
  });
}

export interface MediaCredit {
  id: string;
  title: string;
  kind: 'media' | 'data' | 'observation';
  attribution: string;
  license: string;
  sourceUrl?: string;
  termsUrl?: string;
}
const safeUrl = (url?: string): string | undefined => url && /^https:\/\/[^/\s]+/i.test(url) ? url : undefined;
const isInScope = (scope: 'shared' | 'HL', level: Level) => level === 'HL' || scope === 'shared';

/** Preserve external reuse and measured-data provenance WITHOUT promoting it to educational authority. */
export function getStudentMediaCredits(lesson: Lesson, level: Level): MediaCredit[] {
  const references = new Map(lesson.references.map(reference => [reference.id, reference]));
  const credits: MediaCredit[] = [];
  const seen = new Set<string>();
  const add = (credit: MediaCredit) => {
    if (!seen.has(credit.id)) {
      seen.add(credit.id);
      credits.push(credit);
    }
  };
  for (const asset of lesson.assets.filter(item => isInScope(item.level, level))) {
    const reused = Boolean(asset.sourceUrl || asset.originalUrl || asset.termsUrl) ||
      /creative commons|cc[- ]by|public domain|third.party licen[cs]/i.test(asset.license);
    const dataContext = [asset.attribution, asset.captionTitle, asset.interpretation || ''].join(' ');
    const hasData = /\b(dataset|observed|measured|measurement|data from|source data|noaa|nasa giss|reported values)\b/i.test(dataContext);
    if (!reused && !hasData) continue;
    const supporting = (asset.referenceIds || []).map(id => references.get(id)).filter(ref => ref && safeUrl(ref.url));
    const dataAttribution = hasData && supporting.length ? ' Data source: ' + supporting.map(ref => ref!.title).join('; ') + '.' : '';
    const primarySource = safeUrl(asset.sourceUrl) || safeUrl(asset.originalUrl) ||
      (hasData ? safeUrl(supporting[0]?.url) : undefined);
    add({
      id: 'asset:' + asset.id,
      title: asset.captionTitle || asset.id,
      kind: reused ? 'media' : 'data',
      attribution: asset.attribution + dataAttribution,
      license: asset.license,
      sourceUrl: primarySource,
      termsUrl: safeUrl(asset.termsUrl)
    });
  }
  for (const section of lesson.sections.filter(item => isInScope(item.level, level))) {
    for (const micrograph of section.authenticMicrographs || []) {
      add({
        id: 'observation:' + micrograph.id,
        title: micrograph.title,
        kind: 'observation',
        attribution: micrograph.author + ' · ' + micrograph.specimen + ' · ' + micrograph.modality,
        license: micrograph.license,
        sourceUrl: safeUrl(micrograph.sourceUrl),
        termsUrl: safeUrl(micrograph.licenseUrl)
      });
    }
  }
  return credits;
}
