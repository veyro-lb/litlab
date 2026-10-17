import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const artifact='qa-artifacts/premium-interface';
await mkdir(artifact,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={sourceCommit:'2c321ae547baa2a97294728b337a4dfa46e64408',screenshots:[],tests:[],errors:[]};
const current='http://127.0.0.1:4173/';
const before='http://127.0.0.1:4174/';
async function run(name,task) {
  try { await task();report.tests.push({name,result:'pass'});console.log('PASS '+name); }
  catch(error){const message=String(error);report.tests.push({name,result:'fail',message});report.errors.push(name+': '+message);console.error('FAIL '+name+' '+message);}
}
async function context(theme='light'){
 const c=await browser.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce',serviceWorkers:'block'});
 await c.addInitScript((value)=>{localStorage.litlabTheme=value;localStorage.setItem('litlab:biology:preferences:v1','SL')},theme);
 await c.route('**/*',route=>{const url=route.request().url();if(url.startsWith(current)||url.startsWith(before)||url.startsWith('data:'))return route.continue();return route.abort()});
 return c;
}
try{
 const c=await context();
 const page=await c.newPage();
 page.setDefaultTimeout(16000);
 page.on('pageerror',error=>report.errors.push('Uncaught browser error: '+String(error)));
 for(const width of [320,390,768,1024,1440,1920]){
  await run('responsive homepage '+width+'px',async()=>{
   await page.setViewportSize({width,height:950});
   await page.goto(current+'#biology');
   await page.locator('.bio-welcome h1').waitFor();
   await page.locator('.bio-discovery-themes>a').first().waitFor();
   assert.equal(await page.locator('.bio-discovery-theme').count(),4);
   const metrics=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewportWidth:document.documentElement.clientWidth,appWidth:document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector('.bio-app')?.getBoundingClientRect().width}));
   assert.ok(metrics.documentWidth<=metrics.viewportWidth+2,JSON.stringify(metrics));
   const path=artifact+'/after-home-'+width+'-light.png';
   await page.screenshot({path,fullPage:true,animations:'disabled'});
   report.screenshots.push(path);
  });
 }
 for(const width of [390,1440]){
  await run('before homepage '+width+'px',async()=>{
   await page.setViewportSize({width,height:950});
   await page.goto(before+'#biology');
   await page.locator('.bio-course-header h1').waitFor();
   const path=artifact+'/before-home-'+width+'.png';
   await page.screenshot({path,fullPage:true,animations:'disabled'});
   report.screenshots.push(path);
  });
 }
 await run('search, route and lesson',async()=>{
  await page.setViewportSize({width:1440,height:950});
  await page.goto(current+'#biology');
  await page.locator('#bio-topic-search').fill('A1.1');
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1$/);
  await page.locator('.bio-topic-premium-head h1').waitFor();
  await page.locator('.bio-topic-start').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/learn\?understanding=/);
  await page.locator('.bio-lesson-content').waitFor();
 });
 await run('practice tab and direct practice route',async()=>{
  await page.goto(current+'#biology?resource=practice');
  await page.locator('.bio-resource-nav a[aria-current="page"]').filter({hasText:'Practice'}).waitFor();
  await page.locator('#bio-topic-search').fill('A1.1');
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/practice$/);
  await page.locator('.bio-practice').waitFor();
 });
 await run('flashcard route',async()=>{
  await page.goto(current+'#biology?resource=flashcards');
  await page.locator('#bio-topic-search').fill('A1.1');
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/flashcards$/);
  await page.locator('.bio-lesson[data-mode="flashcards"]').waitFor();
 });
 await run('SL excludes HL only, HL includes it',async()=>{
  await page.goto(current+'#biology');
  await page.locator('#bio-topic-search').fill('A2.1');
  assert.equal(await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').count(),0);
  await page.locator('.bio-level input[value="HL"]').check({force:true});
  await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').waitFor();
  await page.locator('.bio-discovery-topic[data-topic-id="A2.1"] .bio-hl-mark').waitFor();
 });
 await run('theme navigation and topic tiles',async()=>{
  await page.goto(current+'#biology');
  await page.locator('#bio-topic-search').fill('');
  await page.locator('.bio-discovery-theme-A').click();
  await page.waitForURL(/#biology\/theme\/A$/);
  await page.locator('.bio-theme-intro h1').waitFor();
  assert.ok(await page.locator('.bio-discovery-topic').count()>=1);
 });
 await run('keyboard search shortcut',async()=>{
  await page.goto(current+'#biology');
  await page.keyboard.press('Control+k');
  assert.equal(await page.locator('#bio-topic-search').evaluate(element=>element===element.getRootNode().activeElement),true);
 });
 await c.close();
 for(const theme of ['dark','light']){
  const themed=await context(theme);
  const p=await themed.newPage();
  await run(theme+' mode appearance',async()=>{
   await p.setViewportSize({width:1440,height:950});
   await p.goto(current+'#biology');
   await p.locator('.bio-welcome').waitFor();
   assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
   const path=artifact+'/after-home-1440-'+theme+'-appearance.png';
   await p.screenshot({path,fullPage:true,animations:'disabled'});
   report.screenshots.push(path);
  });
  await themed.close();
 }
}finally{await writeFile(artifact+'/report.json',JSON.stringify(report,null,2));await browser.close()}
if(report.errors.length)process.exitCode=1;
