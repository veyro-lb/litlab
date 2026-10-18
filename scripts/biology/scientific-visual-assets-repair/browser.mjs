import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {readdirSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const phase=process.argv[2]||'before',out=`qa-artifacts/scientific-visual-assets-repair/${phase}`;
mkdirSync(out,{recursive:true});
const lessons=readdirSync('src/biology/learning',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>`src/biology/learning/${x.name}/lesson.json`).filter(x=>{try{readFileSync(x);return true}catch{return false}}).map(x=>JSON.parse(readFileSync(x)));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[],issues=[];
const beforeIds=['krebs-cycle','mitochondrial-chemiosmosis','thylakoid-chemiosmosis','calvin-carbon'];
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
 await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4173')?r.continue():r.abort());
 if(phase==='before')await context.route('**/*.svg',route=>{const p=new URL(route.request().url()).pathname;if(beforeIds.some(id=>p.endsWith('/'+id+'.svg'))){const body=execFileSync('git',['show','a03f8f86af7009a529b6aaf8fd7e581a3928de52:public'+p]);return route.fulfill({contentType:'image/svg+xml',body});}return route.continue();});
 const page=await context.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',e=>issues.push(String(e)));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const d of lessons.sort((a,b)=>a.topicId.localeCompare(b.topicId))){
   const seen=new Set();
   for(const s of d.sections){
    const assets=s.assets.filter(id=>!seen.has(id)&&(phase!=='before'||beforeIds.includes(id)));s.assets.forEach(id=>seen.add(id));
    if(phase==='before'&&!assets.length)continue;
    if(!assets.length&&!s.visuals?.length&&!s.graphTables?.length&&!s.authenticMicrographs?.length&&s!==d.sections[0])continue;
    const id=s.understandingIds[0];
    try{
     await page.goto(`http://127.0.0.1:4173/#biology/topic/${d.topicId}/learn?understanding=${id}`);
     const reading=page.locator(`[data-reading-id="${id}"]`);await reading.waitFor();
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
     if(overflow)issues.push(`${id} ${width}: page overflow`);
     let count=0;
     const figures=reading.locator('.bio-figure-clean');
     for(let i=0;i<await figures.count();i++){
      const f=figures.nth(i),aid=await f.getAttribute('data-asset-id');if(!assets.includes(aid))continue;
      const img=f.locator('.bio-figure-image img');
      await f.scrollIntoViewIfNeeded();
      const info=await img.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}return {src:img.currentSrc,w:img.naturalWidth,h:img.naturalHeight}});
      if(!info.w)issues.push(`${id} ${width}: broken ${aid}`);
      await f.screenshot({path:`${out}/${id}-${aid}-${width}.png`});
      results.push({topic:d.topicId,id,assetId:aid,width,...info});count++;
     }
     const embedded=reading.locator(phase==='before'?'.no-embedded-before':'.bio-learning-visual,.bio-reading-data,.bio-authentic-microscopy');
     for(let i=0;i<await embedded.count();i++){
      await embedded.nth(i).screenshot({path:`${out}/${id}-embedded-${i}-${width}.png`});count++;
     }
     if(phase!=='before'&&s===d.sections[0])await reading.locator('.bio-reading-passage').first().screenshot({path:`${out}/${d.topicId}-opening-${width}.png`});
     results.push({topic:d.topicId,id,width,embedded:await embedded.count(),count});
    }catch(e){issues.push(`${id} ${width}: ${String(e)}`)}
   }
   console.log(phase,width,d.topicId);
  }
 }
 await context.close();
}finally{writeFileSync(`${out}/report.json`,JSON.stringify({phase,results,issues},null,2));await browser.close()}
console.log(JSON.stringify({results:results.length,issues}));if(issues.length)process.exitCode=1;
