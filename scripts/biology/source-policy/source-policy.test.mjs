import test from 'node:test';
import assert from 'node:assert/strict';
import {educationalSources, getFigureCredit} from '../../../src/biology/learning/source-policy.ts';
import {parseBiologyRoute} from '../../../src/biology/routes.ts';

test('course references list the approved textbook and guide in author order', () => {
  assert.deepEqual(educationalSources.map(source => source.id), [
    'hodder-biology-third-edition-2023',
    'ib-biology-guide-2025',
  ]);
  assert.ok(educationalSources.every(source => source.year === 2023 && source.url.startsWith('https://')));
});

test('existing Sources links open the course-wide page without a topic or level', () => {
  for (const hash of [
    '#biology/sources',
    '#biology?resource=sources',
    '#biology/theme/B?resource=sources',
    '#biology/topic/A2.3/sources?understanding=A2.3.1',
  ]) {
    assert.deepEqual(parseBiologyRoute(hash), {kind: 'sources'}, hash);
  }
  assert.deepEqual(parseBiologyRoute('#biology/topic/A1.1/learn?understanding=A1.1.2'), {
    kind: 'topic', id: 'A1.1', mode: 'learn',
  });
});

test('figure credits preserve the original media, reuse terms, and measured-data sources', () => {
  const dataset = {id: 'noaa', title: 'NOAA observed sea-ice dataset', url: 'https://arctic.noaa.gov/data'};
  const unrelated = {id: 'nih', title: 'NIH study', url: 'https://pmc.ncbi.nlm.nih.gov/articles/a'};
  const photo = {
    captionTitle: 'Photo',
    attribution: 'Jane Doe / Wikimedia',
    referenceIds: ['nih'],
    originalUrl: 'https://commons.wikimedia.org/wiki/File:Photo.jpg',
    termsUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };
  const photoCredit = getFigureCredit(photo, [unrelated]);
  assert.equal(photoCredit.sourceUrl, photo.originalUrl);
  assert.equal(photoCredit.termsUrl, photo.termsUrl);
  assert.deepEqual(photoCredit.dataSources, []);
  const plot = {captionTitle: 'Observed sea ice', attribution: 'BioLab plot of measured values', referenceIds: ['noaa']};
  assert.deepEqual(getFigureCredit(plot, [unrelated, dataset]).dataSources, [dataset]);
});
