import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const cases=[
 {topic:'D4.3',id:'D4.3.1',expected:'infrared',absent:/NASA.?s 2025|1\.19 °C|1951.?1980/i},
 {topic:'D4.3',id:'D4.3.4',expected:'emperor penguins',absent:/NOAA 2025|0\.91 million|14\.12 million/i},
 {topic:'A1.1',id:'A1.1.7',expected:'asteroid',absent:/deuterium.to.protium|lunar regolith/i},
 {topic:'C4.2',id:'C4.2.20',expected:'Mauna Loa',figure:'c42-keeling-2024-2025'},
 {topic:'C1.3',id:'C1.3.8',expected:'carbon dioxide'}
];
mkdirSync('qa-artifacts/source-policy-cleanup',{recursive:true});
const failures=[],successes=[];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.setItem('litlabTheme','light')});
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
  const page=await context.newPage();
  page.on('pageerror',e=>failures.push('runtime: '+String(e)));
  for(const c of cases){
   try{
    await page.goto(base+'#biology/topic/'+c.topic+'/learn?understanding='+c.id,{waitUntil:'domcontentloaded'});
    const section=page.locator('.bio-lesson-content[data-understanding-id="'+c.id+'"]');
    await section.waitFor({timeout:25000});
    const content=await section.innerText();
    assert.ok(content.toLowerCase().includes(c.expected.toLowerCase()),c.id+': required explanation missing');
    if(c.absent)assert.doesNotMatch(content,c.absent,c.id+': unnecessary source material visible');
    if(c.figure){const figure=section.locator('[data-asset-id="'+c.figure+'"] img');await figure.waitFor({timeout:10000});
     const loaded=await figure.evaluate(x=>x.complete&&x.naturalWidth>0);assert.ok(loaded,c.id+': monthly observation figure not loaded');}
    const html=await page.locator('.bio-reading-passage').count();assert.ok(html>=1,c.id+': core paragraphs not rendered');
    if(width===390||c.figure)await section.screenshot({path:'qa-artifacts/source-policy-cleanup/'+c.id.replaceAll('.','-')+'-'+width+'.png',animations:'disabled'});
    successes.push({width,id:c.id,pass:true,paragraphs:html});
   }catch(e){failures.push(c.id+' @'+width+': '+String(e));}
  }
  await context.close();
 }
}finally{await browser.close();}
const report={cases:successes,failures,environment:'Chromium, local built site, no remote access or sign-in'};
writeFileSync('qa-artifacts/source-policy-cleanup/browser-results.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
