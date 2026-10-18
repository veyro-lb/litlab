import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const catalog=[
 ['D1.1','dna-replication','D1.1.7'],
 ['D1.2','protein-synthesis','D1.2.17'],
 ['D1.3','mutation-gene-editing','D1.3.9'],
 ['D2.1','cell-nuclear-division','D2.1.9'],
 ['D2.2','gene-expression','D2.2.6'],
 ['D2.3','water-potential','D2.3.10'],
 ['D3.1','reproduction','D3.1.4'],
 ['D3.2','inheritance','D3.2.21'],
 ['D3.3','homeostasis','D3.3.10'],
 ['D4.1','natural-selection','D4.1.13'],
 ['D4.2','stability-change','D4.2.3'],
 ['D4.3','climate-change','D4.3.7']
];
const dir=resolve('qa-artifacts/theme-d');mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
let failures=[];
try{
 for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:950},serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.setItem('litlabDone',JSON.stringify(['start']));});
  await ctx.route('**/*',route=>{try{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'?route.continue():route.abort()}catch{return route.abort()}});
  const page=await ctx.newPage();page.setDefaultTimeout(10000);
  for(const [topic,slug,id] of catalog){
   try{
    const lesson=JSON.parse(readFileSync('src/biology/learning/'+slug+'/lesson.json','utf8'));
    const section=lesson.sections.find(s=>s.understandingIds.includes(id));
    await page.goto('http://127.0.0.1:4173/#biology/topic/'+topic+'/learn?understanding='+id,{waitUntil:'domcontentloaded'});
    await page.locator('.bio-reading').waitFor({timeout:15000});
    await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',id);
    await expect(page.locator('.bio-reading-passage')).toHaveCount(section.teachingBlocks.length);
    await expect(page.locator('.bio-reading-passage h3').last()).toHaveText(section.teachingBlocks.at(-1).title);
    const readtext=(await page.locator('.bio-reading').innerText()).toLowerCase();
    if(!readtext.includes(section.teachingBlocks.at(-1).explanation.slice(0,35).toLowerCase()))throw Error('Last teaching block not visible');
    await expect(page.locator('.bio-worked-example')).toBeVisible();
    await page.locator('.bio-lesson-content').screenshot({path:dir+'/'+id.replaceAll('.','-')+'-'+width+'.png'});
    console.log('PASS '+id+' '+width+'px');
   }catch(err){failures.push(id+' '+width+': '+String(err));console.error('FAIL '+id+' '+width+': '+err)}
  }
  await ctx.close();
 }
}finally{await browser.close()}
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
