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
  const pdf = page.getByRole('region', {name: 'Cheat sheet PDF'});
  const first = pdf.getByRole('region', {name: /^Page 1 of [12]$/});
  await expect(first.locator('canvas')).toBeVisible({timeout: 20000});
  await expect(first).toContainText('Polarity');
  await expect(first).toContainText('Exam tip');
  await expect(pdf).toContainText('Worked question');
  await expect(pdf).toContainText('Cohesion and adhesion are different');
  await expect(pdf).not.toContainText('A1.1.8');
  await expect(page.locator('.bio-sheets-point')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    pdf.getByRole('link', {name: 'Download PDF', exact: true}).click(),
  ]);
  expect(download.suggestedFilename()).toBe('BioLab-A1.1-SL-Cheat-Sheet.pdf');
  const pdfBytes = await readFile(await download.path());
  expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-');

  await page.goto(origin+'#biology/topic/A1.1/revision?understanding=A1.1.5');
  await expect(pdf).toContainText('A1.1.5');
  await page.getByRole('link', {name: 'Full explanation'}).click();
  await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id', 'A1.1.5');
  await page.getByRole('link', {name: 'Cheat sheet · A1.1.5'}).click();
  await expect(pdf).toContainText('A1.1.5');
  await page.goto(origin+'#biology?resource=revision');
  await expect(navigation.getByRole('link', {name: 'Cheat Sheets', exact: true})).toHaveAttribute('aria-current', 'page');
  expect(errors).toEqual([]);
  await context.close();

  const mobile = await openContext('dark', 'HL', 320);
  await mobile.page.goto(origin+'#biology/theme/A?resource=cheat-sheets');
  await expect(mobile.page.getByLabel('Theme', {exact: true})).toHaveValue('A');
  await expect(mobile.page.locator('.bio-sheets-tile')).toHaveCount(registry.filter(topic => topic.theme === 'A' && topic.lessonId).length);
  await mobile.page.getByRole('link', {name: 'A1.1 Water', exact: true}).click();
  const mobilePdf = mobile.page.getByRole('region', {name: 'Cheat sheet PDF'});
  await expect(mobilePdf.getByRole('region', {name: /^Page 1 of [12]$/}).locator('canvas')).toBeVisible({timeout: 20000});
  await expect(mobilePdf).toContainText('A1.1.8');
  await expect(mobilePdf.getByRole('link', {name: 'Download PDF', exact: true})).toHaveAttribute('download', 'BioLab-A1.1-HL-Cheat-Sheet.pdf');
  await mobilePdf.getByRole('button', {name: 'Zoom in'}).click();
  await expect(mobilePdf.getByRole('region', {name: 'Zoomed PDF pages'})).toBeVisible();
  await mobilePdf.getByRole('button', {name: 'Fit width'}).click();
  for (const topic of registry.filter(item => item.lessonId)) {
    await mobile.page.goto(origin+`#biology/topic/${topic.id}/cheat-sheets`);
    await expect(mobile.page.locator('.bio-sheets-code')).toContainText(topic.id);
    await expect(mobilePdf.getByRole('region', {name: /^Page 1 of [12]$/}).locator('canvas')).toBeVisible({timeout: 20000});
    await expect(mobilePdf).toContainText('Worked question');
    await expect(mobilePdf).toContainText(topic.understandings.at(-1).id);
    expect(await mobile.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  }
  await mobile.page.goto(origin+'#biology/topic/C3.1/cheat-sheets');
  await expect(mobilePdf.getByRole('region', {name: 'Page 1 of 2'}).locator('canvas')).toBeVisible({timeout: 20000});
  await expect(mobilePdf.getByRole('region', {name: 'Page 2 of 2'}).locator('canvas')).toBeVisible();
  expect(mobile.errors).toEqual([]);
  console.log('All 40 inline Cheat Sheet previews passed. Checked navigation, scope, download, zoom and responsive layout.');
} finally {
  await browser.close();
}
