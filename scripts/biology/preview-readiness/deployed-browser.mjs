import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.BIOLAB_PUBLIC_PREVIEW_URL||'https://feature-biolab-preview-qa-fixes-20261018-litlab.jamesloom18.workers.dev/';
const base=new URL(origin).origin+'/';
const out='qa-artifacts/preview-readiness/deployed';
mkdirSync(out,{recursive:true});
const report={url:base,sourceSha:process.env.GITHUB_SHA||null,testing:'anonymous, read-only Cloudflare branch preview',checks:[],pageErrors:[],shots:[],limitations:['No Cloudflare deploy-to-commit attestation provided by the website','Automated viewport checks do not replace manual assistive-technology or human scientific-label review']};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function check(name,fn){try{await fn();report.checks.push({name,status:'pass'});console.log('PASS '+name)}catch(e){const msg=String(e).slice(0,800);report.checks.push({name,status:'fail',error:msg});console.error('FAIL '+name+': '+msg)}}
async function runViewport(width){
 const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
 const p=await ctx.newPage();p.setDefaultTimeout(18000);
 p.on('pageerror',err=>report.pageErrors.push({width,message:String(err)}));
 await check('Public Biology landing '+width,async()=>{
  await p.goto(base+'#biology',{waitUntil:'domcontentloaded'});
  await expect(p.locator('#bio-welcome-title')).toHaveText('Biology, made clearer.',{timeout:25000});
  await expect(p.locator('.bio-disclaimer')).toContainText('not affiliated');
 });
 await check('Cloudflare serves fixed A1.2.7 with two colocated original figures '+width,async()=>{
  await p.goto(base+'#biology/topic/A1.2/learn?understanding=A1.2.7',{waitUntil:'domcontentloaded'});
  const reading=p.locator('[data-reading-id="A1.2.7"]');
  await expect(reading).toBeVisible({timeout:25000});
  const blocks=reading.locator('.bio-reading-passage');
  await expect(blocks).toHaveCount(3);
  const sugar=blocks.nth(0).locator('[data-asset-id="a12-sugars"]');
  const comparison=blocks.nth(1).locator('[data-asset-id="a12-dna-rna-comparison"]');
  await expect(sugar).toHaveCount(1);
  await expect(comparison).toHaveCount(1);
  await expect(reading.locator('.bio-figure-clean')).toHaveCount(2);
  for(const figure of [sugar,comparison]){
   const img=figure.locator('img').first();await img.scrollIntoViewIfNeeded();
   const stats=await img.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}return {naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight}});
   if(stats.naturalWidth<2||stats.naturalHeight<2)throw Error('Broken figure '+await figure.getAttribute('data-asset-id'));
  }
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(overflow>2)throw Error('Page horizontal overflow '+overflow);
  const path='a12-7-'+width+'.png';await p.screenshot({path:out+'/'+path,fullPage:false});report.shots.push(path);
 });
 if(width===1440){
  await check('A1.2.7 multiple-choice answer and feedback work on public preview',async()=>{
   const q=p.locator('[data-question-id="a12-check-7"]');await expect(q).toBeVisible();
   await q.locator('input[value="check-o3"]').check();
   await q.getByRole('button',{name:'Check my answer'}).click();
   await expect(q.locator('.bio-feedback[data-outcome="correct"]')).toBeVisible();
  });
  await check('Deployed scientific figure dialog enlarges and Escape closes',async()=>{
   const b=p.locator('.bio-reading .bio-figure-image').first();
   await b.click();
   const dialog=p.locator('.bio-figure-dialog[open]');await expect(dialog).toBeVisible();
   await dialog.getByRole('button',{name:'Zoom in'}).click();
   await p.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  });
  await check('Deployed structured response reveals marking guidance',async()=>{
   await p.goto(base+'#biology/topic/A1.2/practice',{waitUntil:'domcontentloaded'});
   const q=p.locator('.bio-written').first();
   await expect(q).toBeVisible({timeout:20000});
   await q.locator('textarea').fill('My independent practice response for preview verification.');
   await q.getByRole('button',{name:'Compare with marking guidance'}).click();
   await expect(q.locator('.bio-feedback')).toBeVisible();
  });
  for(const topic of ['A1.1','C1.2','C1.3','D1.1','D2.1']){
   await check('Deployed anonymous direct lesson '+topic,async()=>{
    await p.goto(base+'#biology/topic/'+topic+'/learn',{waitUntil:'domcontentloaded'});
    await expect(p.locator('.bio-lesson')).toBeVisible({timeout:25000});
    await expect(p.locator('.bio-reading')).toBeVisible({timeout:25000});
   });
  }
 }
 await ctx.close();
}
try{await runViewport(1440);await runViewport(390)}
finally{await browser.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2))}
const pass=report.checks.filter(x=>x.status==='pass').length,fail=report.checks.length-pass;
console.log(JSON.stringify({pass,fail,pageErrors:report.pageErrors.length,sourceSha:report.sourceSha,url:base}));
if(fail||report.pageErrors.length)process.exitCode=1;
