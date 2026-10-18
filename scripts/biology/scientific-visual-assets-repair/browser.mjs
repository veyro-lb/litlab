import {execFileSync} from 'node:child_process';
import {chromium,expect} from '@playwright/test';
import {readdirSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const phase=process.argv[2]||'before',out=`qa-artifacts/scientific-visual-assets-repair/${phase}`;
mkdirSync(out,{recursive:true});
const lessons=readdirSync('src/biology/learning',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>`src/biology/learning/${x.name}/lesson.json`).filter(x=>{try{readFileSync(x);return true}catch{return false}}).map(x=>JSON.parse(readFileSync(x)));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[],issues=[],zoomChecks=[],svgChecks=[];
const beforeIds=['krebs-cycle','mitochondrial-chemiosmosis','thylakoid-chemiosmosis','calvin-carbon','a22-prokaryote','a22-eukaryote','b21-figure-13','a12-hershey','a32-vertebrate-tree','d41-selection'];
const beforePaths=new Set(lessons.flatMap(d=>d.assets.filter(a=>beforeIds.includes(a.id)).flatMap(a=>[a.src,a.mobileSrc].filter(Boolean))));
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
 await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4173')?r.continue():r.abort());
 if(phase==='before')await context.route('**/*.svg',route=>{const p=new URL(route.request().url()).pathname;if(beforePaths.has(p)){let body;try{body=execFileSync('git',['show','a03f8f86af7009a529b6aaf8fd7e581a3928de52:public'+p],{stdio:['ignore','pipe','ignore']});}catch{body=execFileSync('git',['show','a03f8f86af7009a529b6aaf8fd7e581a3928de52:public'+p.replace('-mobile.svg','.svg')]);}return route.fulfill({contentType:'image/svg+xml',body});}return route.continue();});
 const page=await context.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',e=>issues.push(String(e)));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const d of lessons.sort((a,b)=>a.topicId.localeCompare(b.topicId))){
   const seen=new Set();
   for(const s of d.sections){
    const assets=s.assets.filter(id=>!seen.has(id)&&(phase!=='before'||beforeIds.includes(id)));s.assets.forEach(id=>seen.add(id));
    if(phase==='before'&&!assets.length)continue;
    if(!assets.length&&!s.visuals?.length&&!s.graphTables?.length&&!s.authenticMicrographs?.length&&!s.mechanismChallenge&&!s.molecularViewer&&d.topicId!=='B2.2'&&s!==d.sections[0])continue;
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
      if(phase!=='before'){
       await f.locator('.bio-figure-image').click();const dialog=f.locator('dialog[open]');await dialog.waitFor();
       const enlarged=dialog.locator('.bio-figure-zoom img');await enlarged.evaluate(img=>img.decode());
       const zoom=await enlarged.evaluate(img=>({w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height,nw:img.naturalWidth,nh:img.naturalHeight,viewport:img.parentElement.clientWidth,scroll:img.parentElement.scrollWidth}));
       if(Math.abs(zoom.w/zoom.h-zoom.nw/zoom.nh)>.02)issues.push(`${id} ${width}: distorted enlarged ${aid}`);
       if(width===390&&aid==='krebs-cycle')await dialog.screenshot({path:`${out}/zoom-krebs-390.png`});
       await page.keyboard.press('Escape');if(await dialog.count())issues.push(`${id}: Escape did not close ${aid}`);
       try{await expect(f.locator('.bio-figure-image')).toBeFocused()}catch{issues.push(`${id}: focus not restored ${aid}`)}
       zoomChecks.push({id,aid,width,...zoom});
      }
     }
     const embedded=reading.locator(phase==='before'?'.no-embedded-before':'.bio-learning-visual,.bio-reading-data,.bio-authentic-microscopy,.bio-heat-investigation,.bio-investigation,.bio-mechanism');
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
 if(phase!=='before'){
  await page.setViewportSize({width:1440,height:1000});
  const paths=new Set(lessons.flatMap(d=>d.assets.flatMap(a=>[a.src,a.mobileSrc,a.recallSrc,a.recallMobileSrc].filter(p=>p?.endsWith('.svg')))));
  for(const path of paths){
   await page.goto('http://127.0.0.1:4173'+path);
   const clipped=await page.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return ['missing SVG'];const outer=svg.getBoundingClientRect();return [...svg.querySelectorAll('text')].filter(t=>{const r=t.getBoundingClientRect();return r.width>0&&(r.left<outer.left-2||r.top<outer.top-2||r.right>outer.right+2||r.bottom>outer.bottom+2)}).map(t=>t.textContent)});
   svgChecks.push({path,clipped});
  }
  await page.goto('http://127.0.0.1:4173/#biology/topic/A1.1/learn?understanding=A1.1.6');
  await page.locator('#water-heat-energy').fill('2000');await page.locator('#water-heat-mass').fill('1');
  await expect(page.locator('.bio-heat-output')).toContainText('0.48 K');
  await page.locator('#water-heat-mass').fill('2');await expect(page.locator('.bio-heat-output')).toContainText('0.24 K');
  await page.goto('http://127.0.0.1:4173/#biology/topic/B2.2/learn?understanding=B2.2.4');
  await page.locator('#b22-volume').focus();await page.keyboard.press('Home');
  await expect(page.locator('.bio-concentration-model output')).toContainText('24.0');
  await page.keyboard.press('ArrowRight');await expect(page.locator('.bio-concentration-model output')).toContainText('12.0');
  // Report pre-existing and new clipping separately; all findings require review.
  writeFileSync(`${out}/svg-label-bounds.json`,JSON.stringify(svgChecks,null,2));
  await page.evaluate(()=>localStorage.setItem('litlab:biology:preferences:v1','SL'));
  for(const [topic,id] of [['A1.1','A1.1.2'],['B2.1','B2.1.13'],['C3.2','C3.2.5'],['D2.1','D2.1.8']]){
   await page.goto(`http://127.0.0.1:4173/#biology/topic/${topic}/learn?understanding=${id}`);await page.locator(`[data-reading-id="${id}"]`).waitFor();
   await page.locator('.bio-figure-image').first().screenshot({path:`${out}/SL-${id}.png`});
  }
 }
 await context.close();
}finally{writeFileSync(`${out}/report.json`,JSON.stringify({phase,results,zoomChecks,svgChecks,issues},null,2));await browser.close()}
console.log(JSON.stringify({results:results.length,issues}));if(issues.length)process.exitCode=1;
