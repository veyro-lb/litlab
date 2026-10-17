// Real Chromium journeys against a local production preview; never deploys a site.
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.DRAWING_PREVIEW_URL||'http://127.0.0.1:4173/';
const folder='qa-artifacts/drawing-practice';
await mkdir(folder,{recursive:true});
const report={sourceCommit:process.env.GITHUB_SHA??null,cases:[],screenshots:[],errors:[],limitations:['No manual screen reader validation','Paper drawings are evaluated only by the student']};
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function context(level='SL',theme='light',width=1440){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(({level,theme})=>{localStorage.setItem('litlab:biology:preferences:v1',level);localStorage.setItem('litlabTheme',theme)},{level,theme});
 await ctx.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===new URL(origin).origin||u.protocol==='data:'?route.continue():route.abort('blockedbyclient')});
 return ctx;
}
async function test(name,action){try{await action();report.cases.push({name,passed:true});console.log('PASS '+name)}catch(e){const reason=String(e).slice(0,1100);report.cases.push({name,passed:false,error:reason});console.error('FAIL '+name+': '+reason)}}
async function visit(page,hash,selector='.bio-drawing'){await page.goto(origin+hash,{waitUntil:'domcontentloaded'});await page.locator(selector).waitFor()}
try{
 const ctx=await context(),page=await ctx.newPage();
 page.on('pageerror',e=>report.errors.push(String(e)));
 await test('Diagram route reachable from real study-mode navigation',async()=>{
  await page.goto(origin+'#biology/topic/A1.1/learn',{waitUntil:'domcontentloaded'});
  await page.getByRole('navigation',{name:'Biology study modes'}).getByRole('link',{name:/Diagrams/}).click();
  await expect(page).toHaveURL(/#biology\/topic\/A1\.1\/drawing/);
  await expect(page.locator('.bio-drawing[data-exercise="water-hydrogen-bonding"]')).toBeVisible();
 });
 await test('Real unlabelled and labelled images toggle correctly',async()=>{
  await visit(page,'#biology/topic/A1.1/drawing');
  const img=page.locator('.bio-drawing-identify .bio-figure img').first();
  await expect(img).toHaveAttribute('src','/biology/water/bonding-recall.svg');
  await expect.poll(()=>img.evaluate(x=>x.complete&&x.naturalWidth>0)).toBe(true);
  await page.locator('.bio-drawing-figure-head').getByRole('button',{name:'Reveal labels'}).click();
  await expect(page.locator('.bio-drawing-identify .bio-figure img')).toHaveAttribute('src','/biology/water/bonding.svg');
  await expect(page.locator('.bio-drawing-reference dt')).toHaveCount(5);
  await page.locator('.bio-drawing-figure-head').getByRole('button',{name:'Hide labels'}).click();
  await expect(page.locator('.bio-drawing-identify .bio-figure img')).toHaveAttribute('src','/biology/water/bonding-recall.svg');
 });
 await test('Correct synonyms match; swapped bonding terms do not',async()=>{
  await visit(page,'#biology/topic/A1.1/drawing');
  await page.getByLabel(/Which atom has the partial negative charge/).fill('oxygen');
  await page.getByLabel(/What does the dashed line between/).fill('polar covalent bond');
  await page.getByRole('button',{name:'Check labels'}).click();
  await expect(page.locator('#bio-feedback-oxygen')).toContainText('Matches');
  await expect(page.locator('#bio-feedback-hydrogen-bond')).toContainText('Not matched');
  await page.getByLabel(/What does the dashed line between/).fill('hydrogen bonding');
  await page.getByRole('button',{name:'Check labels'}).click();
  await expect(page.locator('#bio-feedback-hydrogen-bond')).toContainText('Matches');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByLabel(/Which atom has the partial negative charge/)).toHaveValue('');
 });
 await test('Paper drawing hides model until compare and requires self-assessment',async()=>{
  await visit(page,'#biology/topic/A1.1/drawing');
  await page.getByRole('button',{name:'Draw it yourself'}).click();
  await expect(page.locator('.bio-drawing-paper .bio-figure')).toBeVisible();
  await page.getByRole('button',{name:/Hide reference & draw/}).click();
  await expect(page.locator('.bio-drawing-paper .bio-figure')).toHaveCount(0);
  await expect(page.locator('.bio-drawing-hidden')).toBeVisible();
  await page.getByRole('button',{name:/I have drawn it/}).click();
  await expect(page.locator('.bio-drawing-label-list li')).toHaveCount(5);
  await page.getByRole('button',{name:/Compare drawing/}).click();
  await expect(page.locator('.bio-drawing-paper .bio-figure')).toBeVisible();
  await page.getByRole('button',{name:/Check my drawing/}).click();
  await expect(page.locator('.bio-drawing-checklist input')).toHaveCount(9);
  await page.locator('.bio-drawing-checklist input').first().check();
  await page.getByRole('button',{name:'Finish self-check'}).click();
  await expect(page.locator('.bio-drawing-selfcheck')).toContainText('Self-check recorded');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.locator('.bio-drawing-steps [aria-current=step]')).toContainText('Study');
 });
 await test('Figure enlargement supports keyboard and Escape restores focus',async()=>{
  await visit(page,'#biology/topic/A1.1/drawing');
  const figure=page.locator('.bio-drawing-identify .bio-figure-image');
  await figure.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.bio-figure-dialog[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.bio-figure-dialog[open]')).toHaveCount(0);
  await expect(figure).toBeFocused();
 });
 await test('Unverified figure dependencies are not promoted; SL/HL isolation',async()=>{
  await visit(page,'#biology/topic/D3.1/drawing');
  await expect(page.locator('.bio-drawing-empty')).toContainText('being checked');
  await visit(page,'#biology/topic/A2.1/drawing','.bio-empty');
  await expect(page.locator('.bio-empty')).toContainText('HL only');
  await page.locator('.bio-level input[value=HL]').check({force:true});
  await visit(page,'#biology/topic/A2.1/drawing');
  await expect(page.locator('.bio-drawing-empty')).toContainText('being checked');
 });
 await test('Failed image has a useful fallback instead of false labels',async()=>{
  await ctx.route('**/biology/water/bonding-recall.svg',route=>route.abort('failed'));
  await visit(page,'#biology/topic/A1.1/drawing');
  await expect(page.locator('.bio-image-fallback')).toContainText('Figure unavailable');
 });
 await ctx.close();
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const ctx=await context('SL',theme,width),p=await ctx.newPage();
  p.on('pageerror',e=>report.errors.push(String(e)));
  await test(`Responsive ${width}px ${theme}: no overflow and real screenshot`,async()=>{
   await visit(p,'#biology/topic/A1.1/drawing');
   await expect(p.locator('.bio-drawing')).toBeVisible();
   const sizing=await p.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
   expect(sizing.page).toBeLessThanOrEqual(sizing.viewport+2);
   const name=`water-diagram-${width}-${theme}.png`;
   await p.screenshot({path:folder+'/'+name,fullPage:true,animations:'disabled'});
   report.screenshots.push(name);
  });
  await ctx.close();
 }
}finally{
 report.passed=report.cases.filter(c=>c.passed).length;report.failed=report.cases.filter(c=>!c.passed).length;
 await writeFile(folder+'/report.json',JSON.stringify(report,null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify({sourceCommit:report.sourceCommit,passed:report.passed,failed:report.failed,errors:report.errors.length,screenshots:report.screenshots.length}));
}
if(report.failed||report.errors.length)process.exitCode=1;
