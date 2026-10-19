import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const registry=JSON.parse(readFileSync('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json','utf8'));
const figures=process.env.BIOLAB_CROP_QA_BATCH?registry.figures.filter(f=>f.batch===process.env.BIOLAB_CROP_QA_BATCH):registry.figures;
const widths=(process.env.BIOLAB_CROP_QA_WIDTHS||'1440,390').split(',').map(Number);
const themes=(process.env.BIOLAB_CROP_QA_THEMES||'light').split(',');
const base=(process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/').replace(/\/?$/,'/');
const dir=process.env.BIOLAB_CROP_QA_DIR||'qa-artifacts/licensed-book-figures';mkdirSync(dir,{recursive:true});
const report={base,sha:process.env.GITHUB_SHA||null,checks:[],errors:[],screenshots:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const request=await browser.newContext();
 for(const f of figures){
  const response=await request.request.get(base.replace(/\/$/,'')+f.path);
  if(!response.ok()||createHash('sha256').update(await response.body()).digest('hex')!==f.originalSha256)report.errors.push('Served crop hash mismatch: '+f.path);
 }
 await request.close();
 for(const theme of themes)for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(theme=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme=theme},theme);
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',e=>report.errors.push('Runtime '+width+': '+e.message));
  for(const f of figures)for(const p of f.placements){
   const name=`${f.topicId} ${p.understandingId} ${f.assetId} at ${width} ${theme}`;
   try{
    await page.goto(base+'#biology/topic/'+f.topicId+'/learn?understanding='+p.understandingId,{waitUntil:'domcontentloaded'});
    const reading=page.locator(`[data-reading-id="${p.understandingId}"]`);await expect(reading).toBeVisible();
    for(const oldPath of f.replacedAssetPaths||[])await expect(reading.locator(`img[src="${oldPath}"]`)).toHaveCount(0);
    const figure=reading.locator(`[data-asset-id="${f.assetId}"]`);await expect(figure).toBeVisible();
    if(p.afterBlock!==undefined)await expect(reading.locator('.bio-reading-passage').nth(p.afterBlock).locator(`[data-asset-id="${f.assetId}"]`)).toHaveCount(1);
    const img=figure.locator('picture img');await img.scrollIntoViewIfNeeded();
    const stats=await img.evaluate(async el=>{el.loading='eager';await el.decode();const r=el.getBoundingClientRect();return {src:new URL(el.currentSrc).pathname,nw:el.naturalWidth,nh:el.naturalHeight,w:r.width,h:r.height,left:r.left,right:r.right}});
    if(stats.src!==f.path||stats.nw<10||stats.nh<10)throw Error('Wrong/broken image '+JSON.stringify(stats));
    if(stats.left< -2||stats.right>width+2||Math.abs(stats.w/stats.h-stats.nw/stats.nh)>.02)throw Error('Clipping/aspect ratio problem');
    if(stats.h>682)throw Error('Inline screenshot is unnecessarily tall');
    await expect(figure.locator(':scope > .bio-book-credit')).toBeVisible();
    await expect(figure.locator(':scope > .bio-book-credit')).toContainText(f.source);
    await expect(figure.locator(':scope > figcaption')).toBeVisible();
    const caption=await figure.locator(':scope > figcaption').evaluate(el=>el.firstChild.textContent);if(!caption.trim())throw Error('Empty visible caption');
    if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>2)throw Error('Horizontal page overflow');
    if(f.cropBoxPdfPoints&&p.lessonSectionId===f.lessonSectionId){
     const shot=`${f.sourceFigureId}-${width}-${theme}.png`;await figure.screenshot({path:dir+'/'+shot});report.screenshots.push(shot);
     await figure.locator('button.bio-figure-image').click();
     const dialog=figure.locator('dialog');await expect(dialog).toBeVisible();
     await expect(dialog.locator('.bio-book-credit')).toContainText(f.source);
     const enlarged=dialog.locator('.bio-figure-zoom img');const before=await enlarged.evaluate(el=>el.getBoundingClientRect().width);
     await dialog.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(dialog.locator('output')).toHaveText('150%');
     if(await enlarged.evaluate(el=>el.getBoundingClientRect().width)<=before)throw Error('Zoom did not enlarge');
     const pan=dialog.locator('.bio-figure-zoom');await pan.evaluate(el=>el.scrollLeft=80);
     if(await pan.evaluate(el=>el.scrollWidth>el.clientWidth&&el.scrollLeft===0))throw Error('Zoomed image cannot pan');
     await dialog.getByRole('button',{name:'Reset',exact:true}).click();await expect(dialog.locator('output')).toHaveText('100%');
     await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
     await expect(figure.locator('button.bio-figure-image')).toBeFocused();
    }
    report.checks.push({name,passed:true,source:stats.src});console.log('PASS '+name);
   }catch(e){report.errors.push(name+': '+String(e));report.checks.push({name,passed:false});console.error('FAIL '+name+': '+String(e));}
  }
  await context.close();
 }
}finally{await browser.close();writeFileSync(dir+'/report.json',JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({placements:report.checks.length,servedHashes:figures.length,errors:report.errors.length}));
if(report.errors.length)process.exitCode=1;
