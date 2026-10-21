import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const topics=JSON.parse(readFileSync('src/biology/curriculum/registry.json','utf8'));
const base=(process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/').replace(/\/?$/,'/');
const dir='qa-artifacts/coursewide-reading';mkdirSync(dir,{recursive:true});
const report={checks:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [320,1440]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('litlab:biology:preferences:v1','HL'));
  const page=await context.newPage();page.setDefaultTimeout(10000);
  page.on('pageerror',error=>report.errors.push('Runtime: '+error.message));
  for(const topic of topics)for(const u of topic.understandings){
   try{
    await page.goto(base+'#biology/topic/'+topic.id+'/learn?understanding='+u.id,{waitUntil:'domcontentloaded'});
    const reading=page.locator(`[data-reading-id="${u.id}"]`);await expect(reading).toBeVisible();
    const images=reading.locator('.bio-figure picture img');
    for(let i=0;i<await images.count();i++){
     const img=images.nth(i);await img.scrollIntoViewIfNeeded();
     const stats=await img.evaluate(async el=>{el.loading='eager';await el.decode();const r=el.getBoundingClientRect();return {src:el.currentSrc,w:r.width,h:r.height,nw:el.naturalWidth,nh:el.naturalHeight,left:r.left,right:r.right}});
     if(!stats.nw||!stats.nh||stats.w<=0||stats.h<=0)throw Error('Broken/hidden image '+stats.src);
     if(stats.left< -2||stats.right>width+2||Math.abs(stats.w/stats.h-stats.nw/stats.nh)>.03)throw Error('Clipping or distortion '+JSON.stringify(stats));
    }
    if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>2)throw Error('Horizontal overflow');
    await expect(reading.locator('.bio-image-fallback')).toHaveCount(0);
    report.checks.push({understandingId:u.id,width,images:await images.count(),passed:true});
   }catch(error){report.errors.push(`${u.id} at ${width}: ${error.message}`);report.checks.push({understandingId:u.id,width,passed:false});}
  }
  await page.screenshot({path:dir+`/final-reading-${width}.png`,fullPage:true});await context.close();
 }
}finally{await browser.close();writeFileSync(dir+'/report.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({readings:report.checks.length,errors:report.errors.length}));
if(report.errors.length)process.exitCode=1;
