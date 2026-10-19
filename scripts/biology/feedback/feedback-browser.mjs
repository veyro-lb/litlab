import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const BASE=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const CHROME=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(existsSync);
const browser=await chromium.launch({headless:true,...(CHROME?{executablePath:CHROME}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const dir=resolve('qa-artifacts/biolab-feedback');
mkdirSync(dir,{recursive:true});
let checks=0;
try {
 for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  const posts=[];
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  // Mock Supabase at the network boundary; this QA never inserts user/test rows in production.
  await context.route('https://qdqseajcukfdbfikjptu.supabase.co/rest/v1/**',async route=>{
   const request=route.request();
   const common={'access-control-allow-origin':'*','access-control-allow-headers':'apikey, authorization, content-type, prefer','access-control-allow-methods':'POST, OPTIONS'};
   if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:common});
   if(request.method()==='POST'){
    posts.push({url:request.url(),payload:request.postDataJSON()});
    return route.fulfill({status:201,headers:{...common,'content-type':'application/json'},body:''});
   }
   return route.abort();
  });
  const open=async route=>{
   await page.goto(new URL('#'+route,BASE).toString());
   await page.locator('#ll-feedback-trigger').waitFor();
  };
  try{
   await open('biology/topic/A1.1/learn?understanding=A1.1.2');
   await page.locator('.bio-app .bio-feedback-action').waitFor();
   const entry=page.getByRole('button',{name:'Give feedback about this BioLab page'});
   await entry.click();
   const modal=page.locator('#ll-feedback-root.open .ll-feedback-modal');
   await modal.waitFor();
   await expect(modal.locator('#ll-feedback-title')).toHaveText('Tell us how BioLab can be better.');
   await expect(modal.locator('.ll-feedback-context')).toContainText('Topic A1.1');
   const section=modal.locator('#ll-feedback-form select[name=section]');
   await expect(section).toHaveValue('BioLab — A1.1');
   await expect(section.locator('option')).toContainText(['BioLab — A1.1','BioLab — Curriculum','BioLab — Lessons','BioLab — Practice','BioLab — Revision / flashcards','BioLab — Diagrams / figures','BioLab — SL / HL','BioLab — Site experience','BioLab — Other']);
   await modal.locator('#ll-feedback-form textarea[name=unclear]').fill('Please clarify the diagram labels for this understanding.');
   await modal.locator('#ll-feedback-form .ll-rating label').filter({has:page.locator('input[name=rating][value="3"]')}).click();
   await expect(modal.locator('#ll-feedback-form input[name=rating][value="3"]')).toBeChecked();
   await modal.getByRole('button',{name:'Send feedback'}).click();
   await expect(modal.getByRole('heading',{name:'Thank you for helping shape BioLab.'})).toBeVisible();
   assert.equal(posts.length,1,'Expected one BioLab feedback submission');
   assert(posts[0].url.endsWith('/litlab_feedback'),'Wrong Supabase table for feedback');
   assert.equal(posts[0].payload.section,'BioLab — A1.1');
   assert.equal(posts[0].payload.rating,3);
   assert.equal(posts[0].payload.unclear,'Please clarify the diagram labels for this understanding.');
   assert(posts[0].payload.source_page.includes('#biology/topic/A1.1/learn?understanding=A1.1.2'));
   assert(posts[0].payload.section.length<=80&&posts[0].payload.source_page.length<=180,'DB constraint exceeded');
   await page.screenshot({path:resolve(dir,viewport.name+'-confirmation.png'),animations:'disabled'});
   await modal.getByRole('button',{name:'Back to BioLab'}).click();
   await expect(page.locator('#ll-feedback-root.open')).toHaveCount(0);
   await expect(entry).toBeFocused();
   checks+=7;

   await entry.click();
   await modal.locator('#ll-feedback-form textarea[name=improve]').fill('Different follow-up; this must not be silently reported as sent.');
   await modal.getByRole('button',{name:'Send feedback'}).click();
   await expect(modal.locator('#ll-feedback-status')).toContainText('has not been sent yet');
   assert.equal(posts.length,1,'Cooldown incorrectly sent second report');
   await modal.getByRole('button',{name:'Close feedback form'}).click();
   checks+=2;

   await entry.click();
   await modal.getByRole('tab',{name:/Report a technical problem/}).click();
   await modal.locator('#ll-technical-form select[name=category]').selectOption('display-visual');
   await modal.locator('#ll-technical-form textarea[name=description]').fill('The cell diagram fails to load when opening the lesson.');
   await modal.getByRole('button',{name:'Send technical report'}).click();
   await expect(modal.getByRole('heading',{name:'Thanks for helping us debug BioLab.'})).toBeVisible();
   assert.equal(posts.length,2,'Expected second, separate technical submission');
   assert(posts[1].url.endsWith('/litlab_technical_reports'),'Wrong Supabase table for technical report');
   assert.equal(posts[1].payload.category,'display-visual');
   assert(posts[1].payload.source_page.includes('#biology/topic/A1.1/'));
   assert(posts[1].payload.source_page.length<=220);
   await modal.getByRole('button',{name:'Back to BioLab'}).click();
   checks+=5;

   await open('home');
   await expect(page.locator('.subject-bar[data-subject=english]')).toHaveCount(1);
   await page.locator('#ll-feedback-trigger').click();
   await expect(modal.locator('#ll-feedback-title')).toHaveText('Tell us how LitLab can be better.');
   await expect(modal.locator('#ll-feedback-form select[name=section]')).toHaveValue('General website');
   assert.equal(await modal.locator('#ll-feedback-form option').filter({hasText:'BioLab — A1.1'}).count(),0,'Biology choice leaked into English form');
   await modal.getByRole('button',{name:'Close feedback form'}).click();
   checks+=3;

   await open('biology');
   await page.locator('.bio-app .bio-feedback-action').click();
   await expect(modal.locator('#ll-feedback-form select[name=section]')).toHaveValue('BioLab — Curriculum');
   const rect=await modal.boundingBox();
   assert(rect&&rect.width<=viewport.width+1,'Feedback modal overflows the viewport');
   await page.screenshot({path:resolve(dir,viewport.name+'-feedback.png'),animations:'disabled'});
   await modal.getByRole('button',{name:'Close feedback form'}).click();
   assert.deepEqual(errors,[],'Unhandled browser page errors');
   checks+=3;
   console.log('PASS '+viewport.name+' BioLab feedback, technical report, page context, LitLab regression, and responsive modal');
  } finally {await context.close();}
 }
 console.log(JSON.stringify({status:'PASS',checks,network:'Supabase mocked, no production inserts'},null,2));
} finally {await browser.close();}
