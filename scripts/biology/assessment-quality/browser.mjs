#!/usr/bin/env node
/** Real Chromium smoke tests for existing rendered assessment, not unintegrated patches. */
import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const ROOT=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,ROOT),'utf8'));
const catalog=read('src/biology/learning/catalog.json');
const registry=read('src/biology/curriculum/registry.json');
const get=topic=>{const t=registry.find(x=>x.id===topic);return read('src/biology/learning/'+catalog[t.lessonId].path.replace(/^\.\//,''));};
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const origin=new URL(base).origin;
const dir='qa-artifacts/assessment-quality';mkdirSync(dir,{recursive:true});
const result={sourceSha:process.env.GITHUB_SHA||null,kind:'actual render of baseline questions; proposed JSON patches not yet integrated',checks:[],errors:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
async function context(level='HL'){
 const c=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 await c.addInitScript(value=>{localStorage.setItem('litlab:biology:preferences:v1',value);localStorage.setItem('litlabTheme','light')},level);
 await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort('blockedbyclient'));
 return c;
}
async function record(name,fn){try{await fn();result.checks.push({name,pass:true});console.log('PASS '+name)}catch(e){result.checks.push({name,pass:false,error:String(e)});console.error('FAIL '+name+': '+e)}}
try{
 const c=await context(),p=await c.newPage();p.on('pageerror',e=>result.errors.push(String(e)));p.setDefaultTimeout(18000);
 for(const [topic,id] of [['A2.1','a21-p1a-2'],['D1.1','d11-mcq-1'],['D2.2','d22-mcq-1'],['C4.1','c41-mcq-1'],['C4.2','c42-mcq-1'],['D3.2','d32-mcq-1']]){
  await record('answer submission and explained correction: '+topic+'/'+id,async()=>{
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
 await record('A2.1.2 former contradiction is fixed in rendered baseline',async()=>{
  const q=get('A2.1').questions.find(x=>x.id==='a21-p1a-2'),key=q.options.find(x=>x.correct);
  if(!q.prompt.includes('not a self-sustaining living cell')||!key.text.includes('host bacterium'))throw Error('Old contradictory item may have reappeared');
  await p.goto(base+'#biology/topic/A2.1/practice');
  const el=p.locator('[data-question-id="a21-p1a-2"]');
  await expect(el.locator('legend')).toContainText('not a self-sustaining living cell');
  await p.screenshot({path:dir+'/a21-fixed-render.png',fullPage:false});
 });
 await record('written self-review renders 3 distinct points',async()=>{
  await p.goto(base+'#biology/topic/D3.2/practice');
  const el=p.locator('[data-question-id="d32-written-1"]');
  await expect(el).toBeVisible();await el.getByRole('button',{name:'Compare with marking guidance'}).click();
  await expect(el.locator('.bio-feedback li')).toHaveCount(3);
 });
 await c.close();
 const sl=await context('SL'),sp=await sl.newPage();
 await record('SL blocked from HL-only D2.2 questions',async()=>{
  await sp.goto(base+'#biology/topic/D2.2/practice');
  await expect(sp.locator('.bio-empty')).toContainText('HL only');
  await expect(sp.locator('[data-question-id="d22-mcq-1"]')).toHaveCount(0);
 });await sl.close();
}finally{
 result.passed=result.checks.filter(x=>x.pass).length;result.failed=result.checks.filter(x=>!x.pass).length;
 writeFileSync(dir+'/browser-results.json',JSON.stringify(result,null,2)+'\n');await browser.close();
 console.log(JSON.stringify({passed:result.passed,failed:result.failed,pageErrors:result.errors.length}));
}
if(result.failed||result.errors.length)process.exitCode=1;
