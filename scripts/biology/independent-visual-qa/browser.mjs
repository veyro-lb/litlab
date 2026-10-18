#!/usr/bin/env node
// Runs only against a LOCAL build of the real BioLab app. Never substitutes a mock page.
import {chromium,expect} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(new URL('../../../',import.meta.url).pathname);
const data=JSON.parse(readFileSync(join(root,'src/biology/curriculum/registry.json'),'utf8'));
const catalog=JSON.parse(readFileSync(join(root,'src/biology/learning/catalog.json'),'utf8'));
const specimens=[
 ['A1.1','bonding'],['A1.2','a12-paired'],['A2.2','a22-prokaryote'],
 ['B1.2','b12-peptide'],['B2.1','b21-figure-15'],['B3.1','b31-leaf'],
 ['B3.2','b32-heart-frontal'],['B3.3','b33-sarcomere'],
 ['D1.2','d12-sequence'],['D3.1','d31-flower-structures'],
 ['D3.1','d31-fertilization-sequence']
];
const sizes=[320,390,768,1024,1440,1920];
const origin=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const out=join(root,'docs/biology/independent-visual-qa/evidence');
mkdirSync(out,{recursive:true});
const report={source:'actual local Chromium rendering',testedSha:process.env.GITHUB_SHA||null,
 widths:sizes,themeModes:['light','dark'],passed:0,failed:0,cases:[],screenshots:[],notes:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,
 headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function record(name,action){
  try{const detail=await action();report.passed++;report.cases.push({name,status:'pass',detail});}
  catch(e){report.failed++;report.cases.push({name,status:'fail',error:String(e).slice(0,1600)});}
}
function lessonFor(topic){
  const t=data.find(x=>x.id===topic);
  return JSON.parse(readFileSync(join(root,'src/biology/learning',catalog[t.lessonId].path.replace(/^\.\//,'')),'utf8'));
}
try {
 for(const mode of ['light','dark'])for(const width of sizes){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:mode,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(({m})=>{
    localStorage.setItem('litlab:biology:preferences:v1','HL');
    localStorage.setItem('litlabTheme',m);
  },{m:mode});
  const baseOrigin=new URL(origin).origin;
  await context.route('**/*',route=>{
    try{return new URL(route.request().url()).origin===baseOrigin?route.continue():route.abort('blockedbyclient');}
    catch{return route.abort('blockedbyclient');}
  });
  const page=await context.newPage();
  for(const [topic,id] of specimens){
   const key=topic+'-'+id+'-'+width+'-'+mode;
   await record(key,async()=>{
    const lesson=lessonFor(topic),index=lesson.sections.findIndex(s=>(s.assets||[]).includes(id));
    if(index<0)throw new Error('asset not placed in section: '+id);
    await page.goto(new URL('#biology/topic/'+topic+'/learn',origin).toString(),{waitUntil:'domcontentloaded'});
    await page.locator('.bio-lesson').waitFor();
    await page.locator('.bio-toc li button').nth(index).click();
    const figure=page.locator('.bio-figure[data-asset-id="'+id+'"]');
    await expect(figure).toBeVisible();
    const image=figure.locator('img').first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    const info=await image.evaluate(img=>({
      alt:img.getAttribute('alt'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
      displayedWidth:img.getBoundingClientRect().width,
      currentSrc:img.currentSrc,
      figureOverflows:img.getBoundingClientRect().right>innerWidth+2
    }));
    expect(info.alt?.length).toBeGreaterThan(10);
    expect(info.naturalWidth).toBeGreaterThan(0);
    expect(info.figureOverflows).toBe(false);
    const screenshot=key+'.png';
    await figure.screenshot({path:join(out,screenshot),animations:'disabled'});
    report.screenshots.push(screenshot);
    // Complete keyboard-only enlargement interaction on every tested figure.
    const opener=figure.locator('button.bio-figure-image');
    await opener.focus();await page.keyboard.press('Enter');
    const dialog=figure.locator('dialog.bio-figure-dialog');
    await expect(dialog).toBeVisible();
    const zoom=dialog.locator('img');
    await expect(zoom).toBeVisible();
    await expect(zoom).toHaveJSProperty('complete',true);
    if(width===320 || width===1440){
      const enlarged=key+'-enlarged.png';
      await dialog.screenshot({path:join(out,enlarged),animations:'disabled'});
      report.screenshots.push(enlarged);
    }
    await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    return {topic,id,width,mode,...info};
   });
  }
  await page.close();await context.close();
 }
} finally {
 await browser.close();
 const path=join(root,'docs/biology/independent-visual-qa/BROWSER_EXECUTION.json');
 writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,screenshots:report.screenshots.length,
   report:'docs/biology/independent-visual-qa/BROWSER_EXECUTION.json'}));
 if(report.failed)process.exitCode=1;
}
