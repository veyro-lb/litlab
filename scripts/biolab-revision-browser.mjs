import {chromium, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin = process.env.REVISION_PREVIEW_URL ?? 'http://127.0.0.1:4173/';
const registry = JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({executablePath: process.env.CHROME_BIN, args: ['--no-sandbox']});

async function newPage(theme, level, width) {
  const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce', serviceWorkers: 'block'});
  await context.addInitScript(({theme, level}) => {
    localStorage.setItem('litlabTheme', theme);
    localStorage.setItem('litlab:biology:preferences:v1', level);
  }, {theme, level});
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return {page, context, errors};
}

async function visit(page, hash) {
  await page.goto(origin + hash);
  await expect(page.locator('.bio-revision')).toBeVisible();
}

try {
  const {page, context, errors} = await newPage('light', 'SL', 1440);
  await visit(page, '#biology?resource=revision');
  await expect(page.locator('.bio-rev-tile')).toHaveCount(registry.filter(topic => topic.level === 'shared' && topic.lessonId).length);
  await page.getByLabel('Theme', {exact: true}).selectOption('B');
  await expect(page.getByRole('link', {name: 'Start recall for Water', exact: true})).toHaveCount(0);
  await page.getByLabel('Theme', {exact: true}).selectOption('');
  await page.getByRole('searchbox').fill('A1.1');
  await page.getByRole('link', {name: 'Start recall for Water', exact: true}).click();

  const reveal = page.getByRole('button', {name: /^Show answers?$/});
  await expect(page.locator('#bio-rev-answer')).toBeHidden();
  await reveal.press('Space');
  await expect(page.locator('#bio-rev-answer')).toBeVisible();
  await page.getByRole('button', {name: 'Review again', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Review again', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', {name: 'Next', exact: true}).press('Enter');
  await expect(page.locator('#bio-rev-prompt')).toBeFocused();
  await expect(page.locator('#bio-rev-answer')).toBeHidden();
  await expect(page.locator('.bio-rev-card-meta')).toContainText('A1.1.2');

  await page.getByRole('link', {name: 'All revision topics', exact: true}).click();
  await page.reload();
  await page.getByRole('button', {name: 'Needs review', exact: true}).click();
  await expect(page.locator('.bio-rev-tile')).toHaveCount(1);
  await page.getByRole('link', {name: 'Start recall for Water', exact: true}).click();
  await expect(page.locator('.bio-rev-card-meta')).toContainText('1 / 1');
  await reveal.click();
  await page.getByRole('button', {name: 'Got it', exact: true}).click();
  await expect(page.locator('.bio-rev-empty')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Needs review (0)', exact: true})).toBeFocused();
  await expect(page.locator('.bio-rev-results')).toContainText('1 of 6');

  await visit(page, '#biology/topic/A1.1/revision?understanding=A1.1.5');
  await expect(page.locator('.bio-rev-card-meta')).toContainText('A1.1.5');
  await page.getByRole('link', {name: 'Read the explanation', exact: true}).click();
  await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id', 'A1.1.5');
  await expect(page.locator('.bio-reading')).toBeVisible();
  await visit(page, '#biology/topic/A1.1/revision?understanding=A1.1.8');
  await expect(page.locator('.bio-rev-card-meta')).toContainText('A1.1.1');
  await expect(page.locator('#bio-revision-understanding option')).toHaveCount(6);
  await visit(page, '#biology/topic/A1.1/revision?view=sheet');
  await page.getByText('Cohesion and adhesion are different', {exact: true}).click();
  await expect(page.getByRole('table', {name: 'Cohesion and adhesion are different'})).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();

  const mobile = await newPage('dark', 'HL', 320);
  await visit(mobile.page, '#biology/theme/A?resource=revision');
  await expect(mobile.page.getByLabel('Theme', {exact: true})).toHaveValue('A');
  await expect(mobile.page.locator('.bio-rev-tile')).toHaveCount(registry.filter(topic => topic.theme === 'A' && topic.lessonId).length);
  await mobile.page.getByRole('link', {name: 'Cheat sheet for Water', exact: true}).click();
  await expect(mobile.page.locator('.bio-rev-note')).toHaveCount(8);
  await mobile.page.getByText('Cohesion and adhesion are different', {exact: true}).click();
  await expect(mobile.page.locator('.bio-rev-table-mobile').first().getByText('Adhesion', {exact: true}).first()).toBeVisible();
  await expect(mobile.page.getByRole('table', {name: 'Cohesion and adhesion are different'})).toHaveCount(0);
  await mobile.page.locator('.bio-rev-note summary').first().click();
  await expect(mobile.page.locator('.bio-rev-note dd').first()).toBeVisible();
  await expect(mobile.page.locator('.bio-revision img')).toHaveCount(0);
  const width = await mobile.page.evaluate(() => ({document: document.documentElement.scrollWidth, viewport: innerWidth}));
  expect(width.document).toBeLessThanOrEqual(width.viewport + 2);
  for (const topic of registry.filter(item => item.lessonId)) {
    const route = `#biology/topic/${topic.id}/revision`;
    await visit(mobile.page, route);
    await expect(mobile.page.locator('#bio-revision-understanding option')).toHaveCount(topic.understandings.length);
    await visit(mobile.page, route+'?view=sheet');
    await expect(mobile.page.locator('.bio-rev-note')).toHaveCount(topic.understandings.length);
  }
  expect(mobile.errors).toEqual([]);
  console.log('Passed revision routing, keyboard recall, saved ratings, SL/HL coverage, and mobile cheat sheets across all 40 topics.');
} finally {
  await browser.close();
}
