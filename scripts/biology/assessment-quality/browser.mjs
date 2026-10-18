#!/usr/bin/env node
/** Chromium checks for baseline or disposable fingerprint-guarded patch preview.
 * These are original practice questions; no lesson files are committed by this script.
 */
import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const ROOT=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,ROOT),'utf8'));
const catalog=read('src/biology/learning/catalog.json');
const registry=read('src/biology/curriculum/registry.json');
const patches=read('docs/biology/assessment-quality/PROPOSED_QUESTION_PATCHES.json');
const get=topic=>{const t=registry.find(x=>x.id===topic);return read('src/biology/learning/'+catalog[t.lessonId].path.replace(/^\.\//,''));};
const patched=process.env.BIOLAB_PATCH_PREVIEW==='1';
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const origin=new URL(base).origin;
const dir='qa-artifacts/assessment-quality';mkdirSync(dir,{recursive:true});
const result={sourceSha:process.env.GITHUB_SHA||null,mode:patched?'disposable-proposal-preview':'original-lesson-baseline',noOfficialIBExamsCopied:true,checks:[],errors:[],screenshots:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
async function context(level='HL'){
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 await c.addInitScript(value=>{localStorage.setItem('litlab:biology:preferences:v1',value);localStorage.setItem('litlabTheme','light')},level);
 await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort('blockedbyclient'));
 return c;
}
async function record(name,fn){try{await fn();result.checks.push({name,pass:true});console.log('PASS '+name)}catch(e){result.checks.push({name,pass:false,error:String(e)});console.error('FAIL '+name+': '+e)}}
function patch(id){const p=patches.patches.find(p=>p.questionId===id);if(!p)throw Error('Unknown patch '+id);return p.replacementQuestion;}
async function shot(p,name){const path=dir+'/'+name+'.png';await p.screenshot({path,fullPage:false});result.screenshots.push(path)}
try{
 const c=await context(),p=await c.newPage();p.on('pageerror',e=>result.errors.push(String(e)));p.setDefaultTimeout(18000);
 if(!patched){
  for(const [topic,id] of [['A2.1','a21-p1a-2'],['D1.1','d11-mcq-1'],['D2.2','d22-mcq-1'],['C4.1','c41-mcq-1'],['C4.2','c42-mcq-1'],['D3.2','d32-mcq-1']]){
   await record('baseline wrong/right explanation: '+topic+'/'+id,async()=>{
    const q=get(topic).questions.find(z=>z.id===id),correct=q.options.find(o=>o.correct),wrong=q.options.find(o=>!o.correct);
    await p.goto(base+'#biology/topic/'+topic+'/practice',{waitUntil:'domcontentloaded'});
    const el=p.locator('[data-question-id="'+id+'"]');await expect(el).toBeVisible();
    await expect(el.locator('legend')).toHaveText(q.prompt);
    await el.locator('input[value="'+wrong.id+'"]').check();await el.getByRole('button',{name:'Check my answer'}).click();
    await expect(el.locator('.bio-feedback[data-outcome="retry"]')).toContainText(wrong.feedback);
    await el.getByRole('button',{name:'Try again'}).click();
    await el.locator('input[value="'+correct.id+'"]').check();await el.getByRole('button',{name:'Check my answer'}).click();
    await expect(el.locator('.bio-feedback[data-outcome="correct"]')).toContainText(correct.feedback);
   });
  }
  await record('A2.1.2 previously contradictory key remains fixed',async()=>{
   const q=get('A2.1').questions.find(x=>x.id==='a21-p1a-2'),key=q.options.find(x=>x.correct);
   if(!q.prompt.includes('not a self-sustaining living cell')||!key.text.includes('host bacterium'))throw Error('Old contradiction returned');
   await p.goto(base+'#biology/topic/A2.1/practice');
   await expect(p.locator('[data-question-id="a21-p1a-2"] legend')).toContainText('not a self-sustaining living cell');
   await shot(p,'baseline-a21-question');
  });
  await record('baseline written guidance has 3 distinct marking points',async()=>{
   await p.goto(base+'#biology/topic/D3.2/practice');
   const el=p.locator('[data-question-id="d32-written-1"]');await expect(el).toBeVisible();
   await el.getByRole('button',{name:'Compare with marking guidance'}).click();
   await expect(el.locator('.bio-feedback li')).toHaveCount(3);
  });
 }else{
  const cases=[['A3.2','a32-p1a-1'],['A3.2','a32-p1a-2'],['A3.2','a32-p1a-3'],
   ['C4.1','c41-mcq-5'],['C4.1','c41-mcq-6'],['C4.2','c42-mcq-5'],['C4.2','c42-mcq-6']];
  for(const [topic,id] of cases){
   await record('candidate full distractor explanations and correct answer: '+topic+'/'+id,async()=>{
    const q=patch(id),correct=q.options.find(o=>o.correct);
    await p.goto(base+'#biology/topic/'+topic+'/practice',{waitUntil:'domcontentloaded'});
    const el=p.locator('[data-question-id="'+id+'"]');await expect(el).toBeVisible();
    await expect(el.locator('legend')).toHaveText(q.prompt);
    for(const wrong of q.options.filter(o=>!o.correct)){
     await el.locator('input[value="'+wrong.id+'"]').check();
     await el.getByRole('button',{name:'Check my answer'}).click();
     await expect(el.locator('.bio-feedback[data-outcome="retry"]')).toContainText(wrong.feedback);
     await el.locator('summary').click();await expect(el.locator('details')).toContainText(wrong.feedback);
     if(id==='a32-p1a-1'&&wrong===q.options.find(o=>!o.correct))await shot(p,'candidate-hl-distractor');
     await el.getByRole('button',{name:'Try again'}).click();
    }
    await el.locator('input[value="'+correct.id+'"]').check();
    await el.getByRole('button',{name:'Check my answer'}).click();
    await expect(el.locator('.bio-feedback[data-outcome="correct"]')).toContainText(correct.feedback);
    if(id==='a32-p1a-1')await shot(p,'candidate-hl-correct');
   });
  }
  const written=[['B3.1','b31-6-structured'],['B4.1','b41-4-data'],
   ['C4.1','c41-written-5'],['C4.2','c42-written-6']];
  for(const [topic,id] of written){
   await record('candidate written marking and data integrity: '+topic+'/'+id,async()=>{
    const q=patch(id);await p.goto(base+'#biology/topic/'+topic+'/practice',{waitUntil:'domcontentloaded'});
    const el=p.locator('[data-question-id="'+id+'"]');await expect(el).toBeVisible();
    await expect(el.locator('h3')).toHaveText(q.prompt);
    if(q.data){
     await expect(el.locator('tbody tr')).toHaveCount(q.data.rows.length);
     await expect(el.locator('table caption')).toHaveText(q.data.caption);
    }
    await el.locator('textarea').fill('Self-review attempt; no automatic examiner mark.');
    await el.getByRole('button',{name:'Compare with marking guidance'}).click();
    await expect(el.locator('.bio-feedback li')).toHaveCount(q.marks);
    await expect(el.locator('.bio-feedback')).toContainText('Self-review guidance only');
    for(const point of q.markingPoints)await expect(el.locator('.bio-feedback')).toContainText(point);
    if(id==='b41-4-data')await shot(p,'candidate-transect-marking');
    if(id==='b31-6-structured')await shot(p,'candidate-spirometry-marking');
   });
  }
 }
 await c.close();
 const sl=await context('SL'),sp=await sl.newPage();
 await record('SL users do not see HL-only D2.2 questions',async()=>{
  await sp.goto(base+'#biology/topic/D2.2/practice');
  await expect(sp.locator('.bio-empty')).toContainText('HL only');
  await expect(sp.locator('[data-question-id="d22-mcq-1"]')).toHaveCount(0);
 });
 if(patched)await record('SL users do not see candidate HL-only A3.2 items',async()=>{
  await sp.goto(base+'#biology/topic/A3.2/practice');
  await expect(sp.locator('[data-question-id="a32-p1a-1"]')).toHaveCount(0);
 });
 await sl.close();
}finally{
 result.passed=result.checks.filter(x=>x.pass).length;result.failed=result.checks.filter(x=>!x.pass).length;
 writeFileSync(dir+'/'+(patched?'browser-results.candidate.json':'browser-results.baseline.json'),JSON.stringify(result,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({mode:result.mode,passed:result.passed,failed:result.failed,pageErrors:result.errors.length,screenshots:result.screenshots}));
}
if(result.failed||result.errors.length)process.exitCode=1;
