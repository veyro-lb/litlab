import assert from 'node:assert/strict';
import {chromium, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {preview} from 'vite';
import {drawingRequirements} from '../../src/biology/learning/drawing-practice/requirements.mjs';

const registry = JSON.parse(readFileSync('src/biology/curriculum/registry.json'));
const server = await preview({preview: {host: '127.0.0.1', port: 4183, strictPort: true}});
const origin = 'http://127.0.0.1:4183';
const browser = await chromium.launch({
  ...(process.env.BIOLAB_CHROMIUM_EXECUTABLE && {executablePath: process.env.BIOLAB_CHROMIUM_EXECUTABLE}),
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const errors = [];
const context = await browser.newContext({reducedMotion: 'reduce'});
await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(4500);
page.on('pageerror', error => errors.push(error.message));
const route = (hash) => page.goto(origin + '/#biology' + hash, {waitUntil: 'domcontentloaded'});
const topic = (id, mode, query = '') => route(`/topic/${id}/${mode}${query}`);
const visibleImage = async (image) => {
  await expect(image).toBeVisible();
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
};

try {
  await topic('A1.2', 'practice');
  const question = page.locator('.bio-practice-choice').first();
  await question.getByRole('radio', {name: 'B. Every virus has DNA'}).click();
  await question.getByRole('button', {name: 'Check my answer'}).click();
  await expect(question.getByText('Reconsider.', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Review missed questions'}).click();
  await question.getByRole('button', {name: 'Try again'}).click();
  await expect(question.getByRole('button', {name: 'Check my answer'})).toBeDisabled();
  await question.getByRole('radio', {name: 'B. Every virus has DNA'}).click();
  await question.getByRole('button', {name: 'Check my answer'}).click();
  await expect(question.getByText('Reconsider.', {exact: true})).toBeVisible();
  await question.getByRole('radio', {name: /All living organisms carry/}).click();
  await expect(question.getByRole('button', {name: 'Check my answer'})).toBeEnabled();
  await expect(page.locator('.bio-practice-status')).toContainText('1 to revisit');
  await question.getByRole('button', {name: 'Check my answer'}).click();
  await expect(page.getByText('No missed questions to revisit.')).toBeVisible();
  await expect(page.locator('.bio-practice-status')).toContainText('1 currently correct');
  await page.getByRole('radio', {name: /HL ·/}).click();
  await page.getByRole('button', {name: 'Paper 1B · Data questions'}).click();
  await expect(page.locator('.bio-practice-choice')).toHaveCount(0);
  await expect(page.getByRole('region', {name: 'Practice data'}).first()).toBeVisible();

  await topic('A1.1', 'drawing', '?diagram=water');
  const notes = page.getByRole('textbox', {name: 'What will you improve next time?'});
  await notes.fill('Label both partial charges.');
  await page.getByRole('button', {name: 'Hide reference & draw'}).click();
  await expect(page.getByText('Reference hidden', {exact: true})).toBeVisible();
  await page.reload();
  await expect(notes).toHaveValue('Label both partial charges.');
  await topic('A2.2', 'drawing', '?diagram=organelles');
  await expect(notes).toHaveValue('');
  const specimen = page.getByLabel('Choose a specimen');
  const specimenIds = await specimen.locator('option').evaluateAll(options => options.map(option => option.value));
  for (const id of specimenIds) {
    await specimen.selectOption(id);
    await visibleImage(page.locator('.bio-drawing-evidence .bio-microscopy-case .bio-figure-image img'));
  }
  await page.getByText('Reveal labels and annotation guidance', {exact: true}).click();
  await expect(page.locator('.bio-microscopy-case details[open]')).toBeVisible();

  for (const id of ['stem', 'root']) {
    await topic('B3.2', 'drawing', '?diagram=' + id);
    const images = await page.locator('.bio-drawing-evidence .bio-microscopy-case .bio-figure-image img').all();
    assert.equal(images.length, id === 'root' ? 2 : 1);
    for (const image of images) await visibleImage(image);
  }
  await topic('C4.2', 'drawing', '?diagram=energy-pyramid');
  await expect(page.getByRole('cell', {name: '20,810'})).toBeVisible();
  await page.getByText('Compare with the measured model and calculations').click();
  await expect(page.getByText(/16.2%. The secondary-to-tertiary/)).toBeVisible();

  await topic('D2.1', 'learn', '?understanding=D2.1.10');
  await visibleImage(page.locator('[data-asset-id="d21-non-disjunction"] .bio-figure-image img'));
  const enlarge = page.getByRole('button', {name: /Enlarge diagram: Nondisjunction/});
  await enlarge.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', {name: 'Zoom in'}).click();
  await expect(page.getByRole('dialog').locator('output')).toHaveText('150%');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(enlarge).toBeFocused();

  await route('/exam-skills');
  await expect(page.getByRole('heading', {name: 'Exam skills', exact: true})).toBeVisible();
  await expect(page.locator('[data-practice-set]')).toHaveCount(4);
  const cases = await page.locator('[data-practice-set]').all();
  for (const work of cases) {
    await work.locator(':scope > summary').click();
    await work.getByRole('textbox').first().fill('My practice response');
    await work.getByText('Show marking guidance').first().click();
    await expect(work.locator('details[open] li').first()).toBeVisible();
    const firstLink = work.locator('.bio-exam-links a').first();
    const href = await firstLink.getAttribute('href');
    assert.match(href, /understanding=[A-D]\d\.\d+\.\d+$/);
  }
  await expect(page.getByRole('heading', {name: 'Scientific investigation'})).toBeVisible();

  for (const width of [360, 390, 768]) {
    await page.setViewportSize({width, height: 880});
    for (const path of ['/exam-skills', '/topic/B3.2/drawing?diagram=root', '/topic/C4.2/drawing?diagram=energy-pyramid', '/topic/D2.1/learn?understanding=D2.1.10', '/topic/A1.2/practice']) {
      await route(path);
      await expect(page.locator(path === '/exam-skills' ? '.bio-exam-skills' : '.bio-lesson')).toBeVisible();
      if (path === '/exam-skills') await page.getByText('Light intensity and photosynthesis', {exact: true}).click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal page overflow at ${width}px on ${path}`);
    }
  }
  await page.setViewportSize({width: 1440, height: 900});
  await route('');
  await page.getByRole('radio', {name: /HL ·/}).click();
  let understandings = 0;
  for (const t of registry) {
    for (const u of t.understandings) {
      await topic(t.id, 'learn', '?understanding=' + u.id);
      await expect(page.locator(`[data-reading-id="${u.id}"]`)).toBeVisible();
      understandings++;
    }
  }
  for (const e of drawingRequirements) {
    await topic(e.topicId, 'drawing', '?diagram=' + e.id);
    await expect(page.locator(`[data-exercise="${e.id}"]`)).toBeVisible();
  }
  assert.deepEqual(errors, []);
  console.log(`Verified ${understandings} understanding routes, ${drawingRequirements.length} drawing routes, four evidence sets and the practice, notes, keyboard and viewport regressions.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
