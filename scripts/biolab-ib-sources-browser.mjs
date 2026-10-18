import {chromium, expect} from '@playwright/test';
import {readFile, mkdir, writeFile} from 'node:fs/promises';

const out = 'qa-artifacts/ib-source-audit';
await mkdir(out,{recursive:true});
const registry=JSON.parse(await readFile('src/biology/curriculum/registry.json','utf8'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const failures=[],captures=[];
try {
 const ctx=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
 await ctx.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4173/')?route.continue():route.abort());
 const page=await ctx.newPage();
 page.setDefaultTimeout(9000);
 page.on('pageerror',error=>failures.push('Runtime: '+String(error)));
 for (const topic of registry) {
  try {
   await page.goto('http://127.0.0.1:4173/#biology/topic/'+topic.id+'/sources');
   await expect(page.locator('.bio-sources')).toBeVisible();
   const sourceList=page.locator('.bio-core-sources > li');
   await expect(sourceList).toHaveCount(2);
   const links=await sourceList.locator('a').evaluateAll(nodes=>nodes.map(a=>a.href));
   if (!links[0].startsWith('https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/')||!links[1].startsWith('https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition')) throw Error('Unexpected source destination');
   const sourceText=await page.locator('.bio-sources').innerText();
   if (/StemBook|NCBI Bookshelf|Independent research or figure reference|Main teaching and curriculum reference/.test(sourceText)) throw Error('Unapproved generic source clutter visible');
   if (['A1.1','B2.3','C1.2','D4.3'].includes(topic.id)) {
    for(const width of [390,1440]){
     await page.setViewportSize({width,height:900});
     const filename='sources-'+topic.id+'-'+width+'.png';
     await page.screenshot({path:out+'/'+filename,fullPage:true});
     captures.push(filename);
    }
   }
  } catch(error){failures.push(topic.id+': '+String(error));}
 }
 for(const topic of ['A1.1','B2.3','C1.2','D4.3']) {
  try {
   const understanding=registry.find(t=>t.id===topic).understandings[0].id;
   await page.goto('http://127.0.0.1:4173/#biology/topic/'+topic+'/learn?understanding='+understanding);
   await expect(page.locator('.bio-reading')).toBeVisible();
   await expect(page.locator('.bio-reading-passage').first()).toBeVisible();
   const filename='lesson-'+topic+'-1440.png';
   await page.setViewportSize({width:1440,height:900});
   await page.screenshot({path:out+'/'+filename,fullPage:true});
   captures.push(filename);
  }catch(error){failures.push('Lesson '+topic+': '+String(error));}
 }
 await ctx.close();
} finally {
 await writeFile(out+'/browser-report.json',JSON.stringify({topicCount:registry.length,captures,failures},null,2));
 await browser.close();
}
console.log('IB Sources browser: '+registry.length+' topics, '+captures.length+' screenshots, '+failures.length+' failures');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
