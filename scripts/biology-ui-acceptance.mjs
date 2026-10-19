#!/usr/bin/env node
// Real integrated BioLab Chromium acceptance, run against an isolated local production preview.
// Does not mutate course content, authenticate, deploy or claim native browser zoom coverage.
import {chromium, expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

const origin=process.env.UI_ACCEPTANCE_PREVIEW_URL||'http://127.0.0.1:4173/';
const output='qa-artifacts/ui-acceptance';
await mkdir(output,{recursive:true});
const report={sourceSha:process.env.GITHUB_SHA||null,base:origin,browser:'Playwright Chromium',cases:[],screenshots:[],pageErrors:[],accessibilityLimitations:['No screen reader or manual assistive-technology evaluation','No native browser zoom verification','No complete WCAG audit or axe-core package','Authentication and translation backends are not exercised in isolated offline CI'],viewportWidths:[320,390,768,1024,1440,1920]};
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function context(level='SL',theme='light',width=1440){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.addInitScript(({level,theme})=>{localStorage.setItem('litlab:biology:preferences:v1',level);localStorage.setItem('litlabTheme',theme)}, {level,theme});
 await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===new URL(origin).origin||u.protocol==='data:')return route.continue();return route.abort('blockedbyclient')});
 return ctx;
}
function track(page){page.on('pageerror',e=>report.pageErrors.push({url:page.url(),message:String(e)}));page.setDefaultTimeout(14000);return page}
async function check(name,fn){
 try{await fn();report.cases.push({name,pass:true});console.log('PASS '+name)}
 catch(e){const message=String(e).slice(0,1300);report.cases.push({name,pass:false,error:message});console.error('FAIL '+name+' '+message)}
}
async function navigate(page,hash,selector='.bio-app'){await page.goto(origin+hash,{waitUntil:'domcontentloaded'});await page.locator(selector).first().waitFor()}
async function shot(page,name){await page.screenshot({path:output+'/'+name,fullPage:true,animations:'disabled'});report.screenshots.push(name)}
async function noOverflow(page,width){
 const m=await page.evaluate(()=>{const app=document.querySelector('[data-biology-host]')?.shadowRoot?.querySelector('.bio-app');return {page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,app:app?.getBoundingClientRect().width}});
 expect(m.page,'document horizontal overflow: '+JSON.stringify(m)).toBeLessThanOrEqual(width+2);
 expect(m.app,'app oversized: '+JSON.stringify(m)).toBeLessThanOrEqual(width+2);
}
try {
 const c=await context(),p=track(await c.newPage());
 await check('Student homepage is real, has 4 direct theme links and no fake progress',async()=>{
   await navigate(p,'#biology','.bio-welcome');
   await expect(p.locator('.bio-discovery-theme')).toHaveCount(4);
   await expect(p.locator('.bio-welcome h1')).toBeVisible();
   await expect(p.locator('.bio-disclaimer')).toContainText('not affiliated');
   const copy=await p.locator('.bio-app').innerText();
   expect(copy).not.toMatch(/(?:\b\d+%\s*mastery\b|\bstreak\s*:\s*\d+\b)/i);
 });
 await check('Explore lessons scrolls to genuine curriculum browser',async()=>{
   await navigate(p,'#biology');
   await p.getByRole('button',{name:/Explore lessons/i}).click();
   const v=await p.locator('#bio-topic-browser').evaluate(e=>({top:e.getBoundingClientRect().top,scroll:window.scrollY}));
   expect(v.scroll).toBeGreaterThan(0);
   expect(Math.abs(v.top)).toBeLessThan(160);
 });
 await check('Find a topic focuses live search',async()=>{
   await navigate(p,'#biology');
   await p.getByRole('button',{name:/Find a topic/i}).click();
   await expect(p.locator('#bio-topic-search')).toBeFocused();
 });
 await check('Ctrl+K and Cmd+K focus real topic search and filter syllabus codes',async()=>{
   await navigate(p,'#biology');
   await p.keyboard.press('Control+k');
   await expect(p.locator('#bio-topic-search')).toBeFocused();
   await p.locator('#bio-topic-search').blur();
   await p.keyboard.press('Meta+k');
   await expect(p.locator('#bio-topic-search')).toBeFocused();
   await p.locator('#bio-topic-search').fill('A1.1');
   await expect(p.locator('.bio-discovery-topic[data-topic-id="A1.1"]')).toHaveCount(1);
   await expect(p.locator('.bio-discovery-topic')).toHaveCount(1);
 });
 await check('No-results message is actionable and clear search restores themes',async()=>{
   await p.locator('#bio-topic-search').fill('not-a-real-biology-topic');
   await expect(p.locator('.bio-search-empty')).toContainText('No matching topics');
   await p.locator('.bio-search-empty button').click();
   await expect(p.locator('.bio-discovery-theme')).toHaveCount(4);
 });
 await check('Four theme cards open their correct actual curriculum',async()=>{
   for(const id of ['A','B','C','D']){
     await navigate(p,'#biology');
     await p.locator('.bio-discovery-theme-'+id).click();
     await expect(p).toHaveURL(new RegExp('#biology/theme/'+id+'$'));
     await expect(p.locator('.bio-theme-intro h1')).toBeVisible();
     expect(await p.locator('.bio-discovery-topic').count()).toBeGreaterThan(0);
   }
 });
 await check('Topic card opens real overview and lesson understanding',async()=>{
   await navigate(p,'#biology/theme/A');
   await p.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
   await expect(p).toHaveURL(/#biology\/topic\/A1\.1$/);
   await expect(p.locator('.bio-topic-premium-head h1')).toContainText('Water');
   await p.locator('.bio-topic-start').click();
   await expect(p).toHaveURL(/#biology\/topic\/A1\.1\/learn\?understanding=/);
   await expect(p.locator('.bio-lesson-content')).toBeVisible();
 });
 await check('Home Practice action opens real selection and student can submit answer',async()=>{
   await navigate(p,'#biology');
   await p.getByRole('link',{name:/Practice questions/i}).click();
   await expect(p.locator('.bio-resource-nav a[aria-current="page"]')).toContainText('Practice');
   await p.locator('#bio-topic-search').fill('A1.1');
   await p.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
   await expect(p.locator('.bio-practice-choice').first()).toBeVisible();
   const first=p.locator('.bio-practice-choice').first();
   await first.locator('input[type=radio]').first().check();
   await first.getByRole('button',{name:'Check my answer'}).click();
   await expect(first.locator('.bio-feedback')).toBeVisible();
 });
 await check('Revision and Flashcards show functional existing learning content',async()=>{
   await navigate(p,'#biology/topic/A1.1/revision','.bio-lesson[data-mode=revision]');
   await expect(p.locator('.bio-takeaway')).toBeVisible();
   await navigate(p,'#biology/topic/A1.1/flashcards','.bio-lesson[data-mode=flashcards]');
   await expect(p.locator('.bio-flashcards')).toBeVisible();
   await p.getByRole('button',{name:'Reveal answer'}).first().click();
   await expect(p.locator('.bio-flashcard-answer')).toBeVisible();
 });
 await check('Sources mode shows syllabus and coursebook provenance and review caveat',async()=>{
   await navigate(p,'#biology/topic/A1.1/sources','.bio-sources');
   await expect(p.locator('.bio-sources')).toContainText('IB Diploma Programme Biology guide');
   await expect(p.locator('.bio-sources')).toContainText('Hodder');
   await expect(p.locator('.bio-sources')).toContainText('not been certified by the IB or a qualified scientific reviewer');
 });
 await check('Study mode preserved from landing page through theme and topic tile',async()=>{
   await navigate(p,'#biology?resource=practice');
   await p.locator('.bio-discovery-theme-A').click();
   await expect(p).toHaveURL(/#biology\/theme\/A\?resource=practice$/);
   await p.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
   await expect(p.locator('.bio-practice')).toBeVisible();
 });
 await check('Deep links, refresh, back and forward work',async()=>{
   await navigate(p,'#biology');
   await navigate(p,'#biology/topic/A1.1/learn','.bio-lesson');
   await p.reload();
   await expect(p.locator('.bio-lesson-content')).toBeVisible();
   await p.goBack();
   await expect(p.locator('.bio-welcome')).toBeVisible();
   await p.goForward();
   await expect(p.locator('.bio-lesson-content')).toBeVisible();
   await navigate(p,'#biology/topic/X9.9','.bio-empty');
   await expect(p.locator('.bio-empty')).toContainText('isn’t on this map');
 });
 await check('SL blocks HL-only lesson and HL reveals genuine topic',async()=>{
   await navigate(p,'#biology/topic/A2.1/learn','.bio-empty');
   await expect(p.locator('.bio-empty')).toContainText('HL only');
   await navigate(p,'#biology');
   await p.locator('#bio-topic-search').fill('A2.1');
   await expect(p.locator('.bio-discovery-topic[data-topic-id="A2.1"]')).toHaveCount(0);
   await p.locator('.bio-level input[value=HL]').check({force:true});
   await expect(p.locator('.bio-discovery-topic[data-topic-id="A2.1"]')).toBeVisible();
   await p.locator('.bio-discovery-topic[data-topic-id="A2.1"]').click();
   await expect(p.locator('.bio-topic-premium-head')).toBeVisible();
 });
 await check('Visible focus and search accessible name are provided',async()=>{
   await navigate(p,'#biology');
   const accessible=await p.locator('#bio-topic-search').evaluate(e=>({label:e.labels?.[0]?.textContent??'',type:e.type}));
   expect(accessible.label).toContain('Search topics');
   expect(accessible.type).toBe('search');
   await p.locator('#bio-topic-search').focus();
   await p.keyboard.press('Tab');
   const focused=await p.evaluate(()=>{const root=document.querySelector('[data-biology-host]').shadowRoot;return root.activeElement?.tagName});
   expect(['BUTTON','A','INPUT','SUMMARY']).toContain(focused);
 });
 await check('Real A1.1.2 scientific figure opens by keyboard and Escape restores focus',async()=>{
   await navigate(p,'#biology/topic/A1.1/learn?understanding=A1.1.2','.bio-lesson-content[data-understanding-id="A1.1.2"]');
   const figure=p.locator('.bio-figure-image').first();
   await expect(figure).toBeVisible();
   await expect.poll(()=>figure.locator('img').first().evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
   await figure.focus();
   await p.keyboard.press('Enter');
   await expect(p.locator('.bio-figure-dialog[open]')).toBeVisible();
   await p.keyboard.press('Escape');
   await expect(p.locator('.bio-figure-dialog[open]')).toHaveCount(0);
   await expect(figure).toBeFocused();
 });

 await check('Global English subject navigation and actual appearance toggle work',async()=>{
   await navigate(p,'#biology');
   const before=await p.locator('html').getAttribute('data-theme');
   await p.locator('.topbar .icon-btn').click();
   const after=await p.locator('html').getAttribute('data-theme');
   expect(after).not.toBe(before);
   await p.locator('.topbar .icon-btn').click();
   await expect(p.locator('html')).toHaveAttribute('data-theme',before);
   await p.locator('.topbar .bio-subject-return').click();
   await expect(p).toHaveURL(/#home$/);
   await expect(p.locator('.topbar')).toHaveAttribute('data-subject','english');
   await navigate(p,'#biology');
   await expect(p.locator('.topbar')).toHaveAttribute('data-subject','biology');
 });
 await check('Authentication entry opens a labelled dialog and Escape restores control focus',async()=>{
   await navigate(p,'#biology');
   const trigger=p.locator('[data-auth-open]');
   await expect(trigger).toHaveAttribute('aria-label','Sign in to LitLab');
   await trigger.click();
   await expect(p.locator('[data-auth-modal][role=dialog]')).toBeVisible();
   await expect(p.locator('[data-auth-google]')).toBeFocused();
   await p.keyboard.press('Escape');
   await expect(p.locator('[data-auth-modal]')).toHaveCount(0);
   await expect(p.locator('[data-auth-open]')).toBeFocused();
 });
 await check('Reduced motion and focus visibility in actual keyboard navigation',async()=>{
   await navigate(p,'#biology');
   const duration=await p.locator('.bio-discovery-theme-A').evaluate(el=>getComputedStyle(el).transitionDuration);
   expect(duration).toBe('0s');
   await p.locator('#bio-topic-search').focus();
   await p.keyboard.press('Tab');
   const focus=await p.evaluate(()=>{const el=document.querySelector('[data-biology-host]').shadowRoot.activeElement;return {tag:el?.tagName,style:el?getComputedStyle(el).outlineStyle:'none'}});
   expect(['A','BUTTON']).toContain(focus.tag);
   expect(focus.style).not.toBe('none');
 });
 await c.close();

 for(const width of report.viewportWidths){
   const ctx=await context('HL','light',width),page=track(await ctx.newPage());
   await check('Actual Chromium homepage responsive '+width+'px',async()=>{
     await navigate(page,'#biology','.bio-discovery-theme');
     await noOverflow(page,width);
     await shot(page,'home-'+width+'-light.png');
   });
   await check('Actual Chromium theme and topic responsive '+width+'px',async()=>{
     await navigate(page,'#biology/theme/A','.bio-discovery-topic');
     await noOverflow(page,width);
     if(width===320||width===390||width===1440)await shot(page,'theme-A-'+width+'-light.png');
     await navigate(page,'#biology/topic/A1.1','.bio-topic-premium-head');
     await noOverflow(page,width);
     if(width===390||width===1440)await shot(page,'topic-A1.1-'+width+'-light.png');
   });
   await check('Actual Chromium lesson responsive '+width+'px',async()=>{
     await navigate(page,'#biology/topic/A1.1/learn','.bio-lesson-content');
     await noOverflow(page,width);
     if(width===390||width===1440)await shot(page,'lesson-A1.1-'+width+'-light.png');
   });
   await ctx.close();
 }
 for(const theme of ['dark','light']){
   const ctx=await context('HL',theme,1440),page=track(await ctx.newPage());
   await check(theme+' appearance on real homepage and lesson',async()=>{
     await navigate(page,'#biology','.bio-welcome');
     await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
     await shot(page,'home-1440-'+theme+'-mode.png');
     await navigate(page,'#biology/topic/A1.1/learn','.bio-lesson-content');
     await shot(page,'lesson-A1.1-1440-'+theme+'-mode.png');
   });
   await ctx.close();
 }
} finally {
 report.passed=report.cases.filter(x=>x.pass).length;
 report.failed=report.cases.filter(x=>!x.pass).length;
 report.finishedAt=new Date().toISOString();
 await writeFile(output+'/report.json',JSON.stringify(report,null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify({sha:report.sourceSha,passed:report.passed,failed:report.failed,pageErrors:report.pageErrors.length,screenshots:report.screenshots.length}));
}
if(report.failed||report.pageErrors.length)process.exitCode=1;
