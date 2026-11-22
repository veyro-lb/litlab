import {chromium, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin = process.env.CHEAT_SHEETS_PREVIEW_URL ?? 'http://127.0.0.1:4173/';
const registry = JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json', import.meta.url), 'utf8'));
const browser = await chromium.launch({executablePath: process.env.CHROME_BIN, args: ['--no-sandbox']});

async function openContext(theme, level, width) {
  const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce', serviceWorkers: 'block'});
  await context.addInitScript(({theme, level}) => {
    localStorage.setItem('litlabTheme', theme);
    localStorage.setItem('litlab:biology:preferences:v1', level);
    localStorage.setItem('ibdplabsSignInReminderSeen', 'true');
  }, {theme, level});
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return {page, context, errors};
}

try {
  const {page, context, errors} = await openContext('light', 'SL', 1440);
  await page.goto(origin+'#biology');
  const navigation = page.getByRole('navigation', {name: 'Biology study modes'});
  await expect(navigation.getByRole('link', {name: 'Revision', exact: true})).toHaveCount(0);
  await navigation.getByRole('link', {name: 'Cheat Sheets', exact: true}).press('Enter');
  await expect(page.locator('.bio-sheets-tile')).toHaveCount(registry.filter(topic => topic.level === 'shared' && topic.lessonId).length);
  await page.getByLabel('Theme', {exact: true}).selectOption('B');
  await expect(page.getByRole('link', {name: 'A1.1 Water', exact: true})).toHaveCount(0);
  await page.getByLabel('Theme', {exact: true}).selectOption('');
  await page.getByRole('searchbox').fill('A1.1');
  await page.getByRole('link', {name: 'A1.1 Water', exact: true}).press('Enter');
  await expect(page).toHaveURL(/#biology\/topic\/A1\.1\/cheat-sheets$/);
  await expect(page.getByRole('heading', {name: 'At a glance'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Exam tip'})).toBeVisible();
  await expect(page.locator('.bio-sheets-point-body').first()).toBeVisible();
  const note = page.locator('.bio-sheets-note').first();
  await expect(note.getByText('Common mistake', {exact: true})).toBeVisible();
  await expect(note.getByText('Correction', {exact: true})).toBeVisible();
  const figure = page.locator('.bio-sheets-point [data-asset-id="bonding"]');
  await figure.getByRole('button', {name: /^Enlarge diagram/}).click();
  await expect(figure.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(figure.getByRole('dialog')).toHaveCount(0);
  const selfCheck = page.locator('.bio-sheets-self-check');
  await expect(selfCheck.getByText(/Hydrogen bonds create cohesion/)).toBeVisible();
  await expect(page.locator('.bio-sheets-point')).toHaveCount(6);
  await expect(page.locator('.bio-sheets-extension')).toHaveCount(0);
  await expect(page.getByRole('link', {name: 'Active recall', exact: true})).toHaveCount(0);
  await expect(page.getByRole('table', {name: 'Cohesion and adhesion are different'})).toBeVisible();

  await page.goto(origin+'#biology/topic/A1.1/revision?understanding=A1.1.5');
  const point = page.locator('.bio-sheets-point[data-understanding-id="A1.1.5"]');
  await expect(point).toHaveAttribute('data-highlighted', 'true');
  await point.getByRole('link', {name: 'Full explanation'}).click();
  await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id', 'A1.1.5');
  await page.getByRole('link', {name: 'Cheat sheet · A1.1.5'}).click();
  await expect(point).toHaveAttribute('data-highlighted', 'true');
  await page.goto(origin+'#biology?resource=revision');
  await expect(navigation.getByRole('link', {name: 'Cheat Sheets', exact: true})).toHaveAttribute('aria-current', 'page');
  expect(errors).toEqual([]);
  await context.close();

  const mobile = await openContext('dark', 'HL', 320);
  await mobile.page.goto(origin+'#biology/theme/A?resource=cheat-sheets');
  await expect(mobile.page.getByLabel('Theme', {exact: true})).toHaveValue('A');
  await expect(mobile.page.locator('.bio-sheets-tile')).toHaveCount(registry.filter(topic => topic.theme === 'A' && topic.lessonId).length);
  await mobile.page.getByRole('link', {name: 'A1.1 Water', exact: true}).click();
  await expect(mobile.page.locator('.bio-sheets-table-mobile').first().getByText('Adhesion', {exact: true}).first()).toBeVisible();
  await expect(mobile.page.getByRole('table', {name: 'Cohesion and adhesion are different'})).toHaveCount(0);
  await expect(mobile.page.locator('.bio-sheets-extension')).toBeVisible();

  const headings = new Set();
  for (const topic of registry.filter(item => item.lessonId)) {
    await mobile.page.goto(origin+`#biology/topic/${topic.id}/cheat-sheets`);
    await expect(mobile.page.locator('.bio-sheets-code')).toContainText(topic.id);
    await expect(mobile.page.locator('.bio-sheets-essentials > div')).toHaveCount(3);
    await expect(mobile.page.locator('.bio-sheets-point')).toHaveCount(topic.understandings.length);
    await expect(mobile.page.getByRole('heading', {name: 'Worked question'})).toBeVisible();
    await expect(mobile.page.locator('.bio-sheets-answer')).toBeVisible();
    await expect(mobile.page.locator('.bio-sheets details:not(dialog details)')).toHaveCount(0);
    for (const img of await mobile.page.locator('.bio-sheets-point picture img').all()) {
      await img.evaluate(el => { el.loading = 'eager'; });
      await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    const firstHeading = await mobile.page.locator('.bio-sheets-essentials dt').first().innerText();
    expect(headings.has(firstHeading), firstHeading+' is repeated').toBe(false);
    headings.add(firstHeading);
    const width = await mobile.page.evaluate(() => ({document: document.documentElement.scrollWidth, viewport: innerWidth}));
    expect(width.document).toBeLessThanOrEqual(width.viewport + 2);
  }
  expect(mobile.errors).toEqual([]);
  console.log('All 40 Cheat Sheets passed. Checked navigation, search, scope, legacy links, mobile comparisons and reflow.');
} finally {
  await browser.close();
}
