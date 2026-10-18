import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';

const root='qa-artifacts/ux-final';
const base='http://127.0.0.1:4173/';
const report={commit:process.env.GITHUB_SHA||'local',browser:'Chromium (Playwright)',tests:[],screenshots:[],pageErrors:[],limitations:[
  'No native browser-toolbar 200% zoom verification: CSS zoom is tested as an approximation.',
  'No manual NVDA, VoiceOver or TalkBack test: semantic roles and keyboard focus are browser checks only.',
  'No authenticated live-provider checks or actual touchscreen hardware.',
  'No automated WCAG certification or complete contrast and tap-target audit.'
]};
await mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
async function test(name,work){
 try{await work();report.tests.push({name,status:'pass'});console.log('PASS '+name)}
 catch(e){const message=String(e);report.tests.push({name,status:'fail',message});console.error('FAIL '+name+' '+message)}
}
async function context(theme='light',motion='reduce'){
 const ctx=await browser.newContext({viewport:{width:1440,height:950},reducedMotion:motion,serviceWorkers:'block'});
 await ctx.addInitScript(({theme})=>{localStorage.litlabTheme=theme;localStorage.setItem('litlab:biology:preferences:v1','SL')},{theme});
 await ctx.route('**/*',r=>{
  const u=r.request().url();
  if(u.startsWith(base)||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();
  return r.abort();
 });
 return ctx;
}
function addError(page){page.on('pageerror',e=>report.pageErrors.push(String(e)))}
async function shot(page,name){
 const file=root+'/'+name+'.png';
 await page.screenshot({path:file,fullPage:true,animations:'disabled'});
 report.screenshots.push(file);
}
async function visit(page,hash){
 await page.goto(base+hash);
 await page.locator('.bio-app').waitFor();
}
async function noDocumentOverflow(page,label){
 const rect=await page.evaluate(()=>({
  client:document.documentElement.clientWidth,
  scroll:document.documentElement.scrollWidth,
  app:document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector('.bio-app')?.getBoundingClientRect().width
 }));
 assert.ok(rect.scroll<=rect.client+2,label+' horizontal overflow '+JSON.stringify(rect));
}
async function shadowFocus(page,selector){
 return page.locator(selector).evaluate(el=>el===el.getRootNode().activeElement);
}
try {
 const ctx=await context();
 const page=await ctx.newPage();
 page.setDefaultTimeout(18000);
 addError(page);

 await test('Explore lessons scrolls to course library',async()=>{
  await visit(page,'#biology');
  await page.getByRole('button',{name:/Explore lessons/i}).click();
  const y=await page.locator('#bio-topic-browser').evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(y>=-15&&y<650,'Library not visible after Explore lessons: '+y);
 });
 await test('Find a topic focuses the labelled search; clearing retains focus',async()=>{
  await visit(page,'#biology');
  await page.getByRole('button',{name:/Find a topic/i}).click();
  assert.ok(await shadowFocus(page,'#bio-topic-search'));
  assert.ok(await page.getByRole('textbox',{name:/Search topics by syllabus code/}).count()||await page.getByRole('searchbox',{name:/Search topics by syllabus code/}).count());
  await page.locator('#bio-topic-search').fill('A1.1');
  assert.equal(await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').count(),1);
  await page.getByRole('button',{name:'Clear topic search'}).click();
  assert.equal(await page.locator('#bio-topic-search').inputValue(),'');
  assert.ok(await shadowFocus(page,'#bio-topic-search'));
 });
 await test('Control+K shortcut reaches syllabus search',async()=>{
  await visit(page,'#biology');
  await page.keyboard.press('Control+k');
  assert.ok(await shadowFocus(page,'#bio-topic-search'));
 });
 await test('Practice Questions chooses a real Practice route through a theme',async()=>{
  await visit(page,'#biology');
  await page.getByRole('link',{name:/Practice questions/i}).click();
  await page.waitForURL(/#biology\?resource=practice$/);
  await page.locator('.bio-discovery-theme-A').click();
  await page.waitForURL(/#biology\/theme\/A\?resource=practice$/);
  assert.match(await page.locator('.bio-resource-nav a[aria-current="page"]').innerText(),/Practice/);
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/practice$/);
  await page.locator('.bio-practice').waitFor();
 });
 await test('Review concepts finds a real Revision route',async()=>{
  await visit(page,'#biology');
  await page.getByRole('link',{name:/Review concepts/i}).click();
  await page.waitForURL(/#biology\?resource=revision$/);
  await page.locator('#bio-topic-search').fill('A1.1');
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/revision$/);
  await page.locator('.bio-lesson-content').waitFor();
 });
 await test('Theme, topic, lesson path; browser backward/forward',async()=>{
  await visit(page,'#biology');
  await page.locator('.bio-discovery-theme-A').click();
  await page.waitForURL(/#biology\/theme\/A$/);
  assert.ok(await page.getByRole('navigation',{name:'Biology study modes'}).count());
  await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
  await page.waitForURL(/#biology\/topic\/A1\.1$/);
  await page.locator('.bio-topic-start').click();
  await page.waitForURL(/#biology\/topic\/A1\.1\/learn\?understanding=/);
  await page.locator('.bio-lesson-content').waitFor();
  await page.goBack();
  await page.waitForURL(/#biology\/topic\/A1\.1$/);
  await page.goForward();
  await page.waitForURL(/#biology\/topic\/A1\.1\/learn\?understanding=/);
 });
 await test('SL excludes HL-only topics; HL restores them',async()=>{
  await visit(page,'#biology');
  await page.locator('.bio-level input[value="SL"]').check({force:true});
  await page.locator('#bio-topic-search').fill('A2.1');
  assert.equal(await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').count(),0);
  await page.locator('.bio-level input[value="HL"]').check({force:true});
  await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').waitFor();
  await page.locator('.bio-level input[value="SL"]').check({force:true});
  assert.equal(await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').count(),0);
 });
 await test('Practice answer, retry and in-tab attempt retention',async()=>{
  await visit(page,'#biology/topic/A1.1/practice');
  const q=page.locator('fieldset.bio-check').first();
  await q.waitFor();
  await q.locator('input[type="radio"]').first().check({force:true});
  await q.getByRole('button',{name:'Check my answer'}).click();
  await q.locator('.bio-feedback').waitFor();
  await q.getByRole('button',{name:'Try again'}).click();
  assert.equal(await q.locator('.bio-feedback').count(),0);
  await q.locator('input[type="radio"]').first().check({force:true});
  await q.getByRole('button',{name:'Check my answer'}).click();
  await visit(page,'#biology/topic/A1.1/revision');
  await visit(page,'#biology/topic/A1.1/practice');
  await page.locator('fieldset.bio-check .bio-feedback').first().waitFor();
 });
 await test('Flashcards reveal an authored answer and navigate',async()=>{
  await visit(page,'#biology/topic/A1.1/flashcards');
  await page.locator('.bio-flashcards').waitFor();
  await page.getByRole('button',{name:'Reveal answer'}).first().click();
  await page.locator('.bio-flashcard-answer[role="status"]').waitFor();
  await page.getByRole('button',{name:/Next card/}).click();
  await page.locator('.bio-flashcards').waitFor();
 });
 await test('Sources mode renders without changing its implementation',async()=>{
  await visit(page,'#biology/topic/A1.1/sources');
  await page.locator('.bio-sources').waitFor();
  assert.ok((await page.locator('.bio-sources').innerText()).includes('References'));
 });
 await test('Figure enlargement: focus, Escape, return to opener',async()=>{
  await visit(page,'#biology/topic/A1.1/learn?understanding=A1.1.2');
  const opener=page.locator('.bio-figure-image').first();
  await opener.waitFor();
  await opener.click();
  const dialog=page.locator('dialog.bio-figure-dialog[open]').first();
  await dialog.waitFor();
  assert.ok(await dialog.getByRole('button',{name:'Close figure'}).count());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog.bio-figure-dialog[open]').count(),0);
  assert.ok(await opener.evaluate(el=>el===el.getRootNode().activeElement));
 });
 await test('Invalid route has a working recovery link',async()=>{
  await visit(page,'#biology/non-existent-route');
  await page.getByRole('heading',{name:/isn.t on this map/}).waitFor();
  await page.getByRole('link',{name:/All themes/}).click();
  await page.waitForURL(/#biology$/);
 });
 await test('Reduced motion disables topic-card transition',async()=>{
  await visit(page,'#biology');
  const duration=await page.locator('.bio-discovery-theme-A').evaluate(el=>getComputedStyle(el).transitionDuration);
  assert.ok(duration.split(',').every(v=>parseFloat(v)===0),'Transition active despite reduced-motion: '+duration);
 });

 for(const width of [320,390,768,1440,1920]){
  await test('Mobile/desktop course library and no overflow '+width,async()=>{
   await page.setViewportSize({width,height:950});
   await visit(page,'#biology');
   await page.locator('.bio-discovery-theme-A').waitFor();
   await noDocumentOverflow(page,'Library '+width);
   await shot(page,'library-'+width+'-light');
  });
  await test('Theme and topic readable without overflow '+width,async()=>{
   await visit(page,'#biology/theme/A');
   await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').waitFor();
   await noDocumentOverflow(page,'Theme '+width);
   if(width===390||width===1440)await shot(page,'theme-A-'+width+'-light');
   await visit(page,'#biology/topic/A1.1');
   await page.locator('.bio-topic-premium-head h1').waitFor();
   await noDocumentOverflow(page,'Topic '+width);
   if(width===390||width===1440)await shot(page,'topic-A1.1-'+width+'-light');
  });
  await test('Real lesson reading without document overflow '+width,async()=>{
   await visit(page,'#biology/topic/C3.1/learn?understanding=C3.1.1');
   await page.locator('.bio-lesson-content').waitFor();
   await noDocumentOverflow(page,'C3.1 lesson '+width);
   await shot(page,'lesson-C3.1-'+width+'-light');
  });
 }
 await ctx.close();

 for(const theme of ['dark','light']){
  const ct=await context(theme);
  const p=await ct.newPage();addError(p);
  for(const width of [390,1440]){
   await test(theme+' theme, appearance and screenshot '+width,async()=>{
    await p.setViewportSize({width,height:950});
    await visit(p,'#biology');
    await p.locator('.bio-welcome').waitFor();
    assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
    await noDocumentOverflow(p,theme+' '+width);
    await shot(p,'library-'+width+'-'+theme+'-appearance');
   });
  }
  await ct.close();
 }
 const cz=await context();
 const zp=await cz.newPage();addError(zp);
 await test('CSS 200% zoom reflow approximation (not native browser zoom)',async()=>{
  await zp.setViewportSize({width:1024,height:900});
  await visit(zp,'#biology');
  await zp.evaluate(()=>{document.documentElement.style.zoom='200%'});
  await noDocumentOverflow(zp,'CSS zoom at 1024');
  await shot(zp,'css-zoom-200-1024');
 });
 await cz.close();
}finally {
 report.summary={passed:report.tests.filter(t=>t.status==='pass').length,failed:report.tests.filter(t=>t.status==='fail').length,pageErrors:report.pageErrors.length,screenshots:report.screenshots.length};
 await writeFile(root+'/report.json',JSON.stringify(report,null,2));
 await browser.close();
}
console.log(JSON.stringify(report.summary));
if(report.summary.failed>0||report.pageErrors.length>0)process.exitCode=1;
