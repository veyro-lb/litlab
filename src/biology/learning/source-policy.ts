import type {Asset, Reference} from './lesson-contract';

export const educationalSources = [
  {
    id: 'hodder-biology-third-edition-2023',
    authors: 'Clegg, C. J., Davis, A., & Talbot, C.',
    year: 2023,
    title: 'Biology for the IB Diploma Programme',
    edition: '3rd ed.',
    publisher: 'Hodder Education',
    url: 'https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition-defc78b551283db4b70d5a5cce8a276d',
    linkLabel: 'Publisher’s book page',
  },
  {
    id: 'ib-biology-guide-2025',
    authors: 'International Baccalaureate Organization.',
    year: 2023,
    title: 'Biology guide: First assessment 2025',
    url: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/biology/',
    linkLabel: 'Official IB Biology subject page',
  },
] as const;

const safeUrl = (url?: string) => url && /^https:\/\/[^/\s]+/i.test(url) ? url : undefined;

export function getFigureCredit(asset: Asset, references: readonly Reference[]) {
  const context = [asset.attribution, asset.captionTitle, asset.interpretation].join(' ');
  const hasData = /\b(dataset|observed|measured|measurement|data from|source data|noaa|nasa giss|reported values)\b/i.test(context);
  const dataSources = hasData
    ? references.filter(reference => asset.referenceIds.includes(reference.id) && safeUrl(reference.url))
    : [];
  return {
    attribution: asset.attribution,
    sourceUrl: safeUrl(asset.sourceUrl) || safeUrl(asset.originalUrl),
    termsUrl: safeUrl(asset.termsUrl),
    dataSources,
  };
}
