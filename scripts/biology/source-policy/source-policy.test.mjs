import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getStudentEducationalSources, getStudentMediaCredits, APPROVED_EDUCATIONAL_SOURCE_IDS} from '../../../src/biology/learning/source-policy.ts';

test('the educational whitelist is fixed, complete and deduplicated', () => {
  const authorities = getStudentEducationalSources();
  assert.equal(authorities.length, 2);
  assert.deepEqual(authorities.map(x => x.id), [...APPROVED_EDUCATIONAL_SOURCE_IDS]);
  assert.equal(new Set(authorities.map(x => x.url)).size, 2);
  assert.ok(authorities.every(x => x.url.startsWith('https://')));
  assert.ok(authorities[0].url.includes('ibo.org/'));
  assert.ok(authorities[1].url.includes('hachettelearning.com/'));
  assert.match(authorities[1].description, /independently published/i);
  assert.doesNotMatch(authorities[1].description, /official IB publication\./i);
});

test('arbitrary teaching links can never be promoted by the Sources component', async () => {
  const text = await readFile(new URL('../../../src/biology/learning/SourcesPanel.tsx',import.meta.url),'utf8');
  const parent = await readFile(new URL('../../../src/biology/learning/LessonView.tsx',import.meta.url),'utf8');
  assert.match(text, /getStudentEducationalSources\(\)/);
  assert.doesNotMatch(text, /lesson\.references\.(map|filter)/);
  assert.match(parent, /<SourcesPanel lesson=\{lesson\} level=\{level\}/);
  assert.doesNotMatch(parent, /lesson\.references\.filter\(r=>inScope\(r,level\)\)/);
  for (const banned of ['ncbi.nlm.nih.gov', 'pmc.ncbi.nlm.nih.gov','openstax.org','stembook','pubmed']) {
    assert.ok(!getStudentEducationalSources().some(source => source.url.toLowerCase().includes(banned)));
  }
});

test('genuine third-party media survives and remains separate from educational sources', () => {
  const fixture = {
    references: [
      {id:'nih',title:'NIH study',url:'https://pmc.ncbi.nlm.nih.gov/articles/a'},
      {id:'noaa',title:'NOAA observed sea-ice dataset',url:'https://arctic.noaa.gov/data'}
    ],
    assets: [
      {id:'own',captionTitle:'Own figure',attribution:'Original BioLab artwork',license:'Original project artwork; no third-party',referenceIds:['nih'],level:'shared'},
      {id:'photo',captionTitle:'Photo',attribution:'Jane Doe / Wikimedia',license:'CC BY-SA 4.0',referenceIds:['nih'],sourceUrl:'https://commons.wikimedia.org/wiki/File:Photo.jpg',termsUrl:'https://creativecommons.org/licenses/by-sa/4.0/',level:'shared'},
      {id:'plot',captionTitle:'Observed sea ice',attribution:'Original BioLab plot of measured values',license:'Original project work',referenceIds:['noaa'],level:'HL'}
    ],
    sections: [{
      id:'a',level:'shared',authenticMicrographs:[{id:'m',title:'Micrograph',author:'Lab',specimen:'Leaf',modality:'TEM',license:'CC BY 4.0',sourceUrl:'https://commons.wikimedia.org/wiki/File:Leaf.jpg',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}]
    }]
  };
  const sl = getStudentMediaCredits(fixture,'SL');
  assert.deepEqual(sl.map(x=>x.id), ['asset:photo','observation:m']);
  assert.ok(sl[0].termsUrl?.startsWith('https://creativecommons.org/'));
  assert.deepEqual(getStudentMediaCredits(fixture,'HL').map(x=>x.id),['asset:photo','asset:plot','observation:m']);
  assert.match(getStudentMediaCredits(fixture,'HL')[1].attribution,/NOAA/);
  assert.equal(getStudentEducationalSources().length,2);
});

test('responsive source presentation is present for mobile and desktop', async () => {
  const css = await readFile(new URL('../../../src/biology/biology.css',import.meta.url),'utf8');
  assert.match(css,/\.bio-educational-sources\{[^}]*display:grid/);
  assert.match(css,/@media\(max-width:760px\)\{\s*\.bio-app \.bio-sources/);
  assert.match(css,/overflow-wrap:anywhere/);
});
