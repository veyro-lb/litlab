import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';

const base=process.env.LITLAB_PREVIEW_URL || 'http://127.0.0.1:4173/';
const candidates=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const executablePath=candidates.find(existsSync);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const output=resolve('qa-artifacts/biolab-navigation');
mkdirSync(output,{recursive:true});
const results=[];
try {
 for (const {name,width,height} of [{name:'desktop',width:1440,height:900},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844},{name:'small-mobile',width:320,height:720}]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  const visit=async route=>{await page.goto(new URL('#'+route,base).toString());await page.locator('.subject-bar').waitFor();};
  try {
   await visit('home');
   const switcher=page.getByRole('navigation',{name:'Switch between LitLab and BioLab'});
   assert.equal((await switcher.locator('a').allTextContents()).map(s=>s.trim()).join('|'),'LitLab|BioLab','Study-space names must be LitLab and BioLab');
   assert.equal(await switcher.locator('a[aria-current="page"]').innerText(),'LitLab');
   assert.equal(await page.locator('.biolab-section-navigation').count(),0,'BioLab course navigation should not appear inside LitLab');
   await switcher.getByRole('link',{name:'BioLab — Biology'}).click();
   await page.waitForURL(/#biology$/);
   const nav=page.getByRole('navigation',{name:'BioLab course navigation'});
   await nav.waitFor();
   assert.deepEqual((await nav.locator('a').allTextContents()).map(s=>s.trim()),['Curriculum','Theme A','Theme B','Theme C','Theme D']);
   assert.equal(await nav.locator('a[aria-current="page"]').innerText(),'Curriculum');
   assert.equal(await switcher.locator('a[aria-current="page"]').innerText(),'BioLab');
   await page.locator('[data-biology-host] .bio-app').waitFor();
   await page.screenshot({path:resolve(output,name+'-biolab-home.png'),animations:'disabled'});
   await nav.getByRole('link',{name:'Theme B'}).click();
   await page.waitForURL(/#biology\/theme\/B$/);
   assert.equal(await nav.locator('a[aria-current="page"]').innerText(),'Theme B');
   await visit('biology/topic/A1.1/learn?understanding=A1.1.1');
   await page.locator('[data-biology-host] .bio-lesson').waitFor();
   assert.equal(await nav.locator('a[aria-current="page"]').innerText(),'Theme A','Topic pages must retain their active theme navigation');
   await page.screenshot({path:resolve(output,name+'-biolab-lesson.png'),animations:'disabled'});
   const back=page.getByRole('link',{name:'Return to LitLab home'});
   assert.equal(await back.count(),1,'BioLab header must include a clear way back to LitLab');
   await back.click();
   await page.waitForURL(/#home$/);
   assert.equal(await page.locator('.subject-bar[data-subject="english"]').count(),1);
   assert.equal(await switcher.locator('a[aria-current="page"]').innerText(),'LitLab');
   const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert(metrics.scroll<=metrics.client+2,'Return route overflows at '+name+': '+JSON.stringify(metrics));
   await visit('biology');
   const bioMetrics=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
    navVisible:(()=>{const r=document.querySelector('.biolab-section-navigation')?.getBoundingClientRect();return Boolean(r&&r.width>0&&r.height>0)})()
   }));
   assert(bioMetrics.navVisible,'BioLab nav is hidden at '+name);
   assert(bioMetrics.scroll<=bioMetrics.client+2,'BioLab route overflows at '+name+': '+JSON.stringify(bioMetrics));
   assert.deepEqual(errors,[],'JavaScript exceptions found at '+name);
   results.push({viewport:name,status:'passed',...bioMetrics});
   console.log('PASS '+name+' LitLab/BioLab switcher, theme navigation, topic, return and reflow');
  } finally {await context.close();}
 }
 console.log(JSON.stringify({result:'passed',viewports:results.length,results},null,2));
} finally {await browser.close()}
