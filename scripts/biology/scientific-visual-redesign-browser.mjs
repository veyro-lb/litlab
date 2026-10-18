// Authenticated-looking preferences are local-only demo state. No public deployment.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out='qa-artifacts/scientific-visual-redesign';await mkdir(out,{recursive:true});
const origin='http://127.0.0.1:4173';
const issues=[],shots=[],results=[];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 const page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>issues.push('page: '+String(e)));
 const variants=[['anatomy','D3.1.4',3],['flower','D3.1.9',1]];
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  for(const [name,id,n] of variants){
   try{
    await page.goto(origin+'/#biology/topic/D3.1/learn?understanding='+id);
    const reading=page.locator('[data-reading-id="'+id+'"]');await reading.waitFor({state:'visible'});
    const figures=reading.locator('.bio-figure-image');if(await figures.count()!==n)throw Error(name+': expected '+n+' figures, found '+await figures.count());
    for(let i=0;i<n;i++){
     const image=figures.nth(i).locator('img');await image.evaluate(img=>{img.loading='eager';img.decoding='sync';});
     await figures.nth(i).scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());
     const info=await image.evaluate(img=>({currentSrc:img.currentSrc,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight}));
     if(!info.naturalWidth||!info.naturalHeight)throw Error('broken image '+JSON.stringify(info));
     if(width<=560&&!info.currentSrc.includes('-mobile.svg'))throw Error('missing mobile source '+info.currentSrc);
     if(width>560&&info.currentSrc.includes('-mobile.svg'))throw Error('incorrect desktop source '+info.currentSrc);
     await figures.nth(i).screenshot({path:out+'/'+name+'-'+i+'-'+width+'.png'});
     shots.push(name+'-'+i+'-'+width+'.png');results.push({width,id,assetIndex:i,...info});
    }
    if(width===390&&id==='D3.1.4'){const figure=figures.first();await figure.click();const dialog=page.locator('dialog[open]');await dialog.waitFor();await dialog.screenshot({path:out+'/modal-390.png'});shots.push('modal-390.png');await page.keyboard.press('Escape');if(await dialog.count())throw Error('Escape failed to close figure modal');}
   }catch(e){issues.push(name+' '+width+': '+String(e));}
  }
 }
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  try{
   await page.goto(origin+'/#biology/topic/D3.1/revision?understanding=D3.1.4');
   await page.locator('.bio-figure-image').first().waitFor();const hide=page.getByRole('button',{name:'Hide figure labels for recall'});if(await hide.count())await hide.click();
   const images=page.locator('.bio-figure-image img');
   for(let i=0;i<3;i++){await images.nth(i).scrollIntoViewIfNeeded();await images.nth(i).evaluate(async img=>{img.loading='eager';await img.decode()});const src=await images.nth(i).evaluate(img=>img.currentSrc);if(!src.includes('recall.svg'))throw Error('recall source not selected '+src);}
   await page.locator('.bio-figure-image').first().screenshot({path:out+'/recall-'+width+'.png'});shots.push('recall-'+width+'.png');
   await page.getByRole('button',{name:'Reveal figure labels'}).click();
  }catch(e){issues.push('recall '+width+': '+String(e));}
 }
 await page.setViewportSize({width:390,height:900});await page.evaluate(()=>{localStorage.litlabTheme='dark'});await page.goto(origin+'/#biology/topic/D3.1/learn?understanding=D3.1.4');try{await page.locator('.bio-figure-image').first().screenshot({path:out+'/dark-390.png'});shots.push('dark-390.png')}catch(e){issues.push('dark mode: '+String(e))}
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  try{
   await page.goto(origin+'/#biology/topic/A2.2/learn?understanding=A2.2.8');
   const p=page.locator('[data-asset-id="a22-plant-palisade"] .bio-figure-image img');await p.waitFor();
   await p.scrollIntoViewIfNeeded();await p.evaluate(img=>img.decode());
   const info=await p.evaluate(img=>({src:img.currentSrc,w:img.naturalWidth,h:img.naturalHeight}));
   if(info.w<1||info.h<1)throw Error('plant image failed to load');
   if(width===390&&!info.src.includes('-mobile.svg'))throw Error('plant mobile variant missing');
   await page.locator('[data-asset-id="a22-plant-palisade"]').screenshot({path:out+'/plant-'+width+'.png'});
   shots.push('plant-'+width+'.png');
  }catch(e){issues.push('plant '+width+': '+String(e))}
 }
 for(const suffix of ['','-recall','-mobile','-mobile-recall']){
  const file='a22-plant-palisade'+suffix+'.svg';
  try{
   await page.goto(origin+'/biology/cell-structure/'+file);
   const clipped=await page.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return ['missing svg'];const sr=svg.getBoundingClientRect();return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBoundingClientRect();return b.left<sr.left-2||b.top<sr.top-2||b.right>sr.right+2||b.bottom>sr.bottom+2}).map(t=>t.textContent)});
   if(clipped.length)issues.push('plant SVG text outside viewBox '+file+': '+clipped.join(','));
  }catch(e){issues.push('plant SVG '+file+': '+String(e))}
 }
 for(const stem of ['d31-male-anatomy','d31-female-frontal','d31-female-sagittal','d31-flower-structures']){
  for(const suffix of ['','-recall','-mobile','-mobile-recall']){
   const file=stem+suffix+'.svg';
   try{
    await page.goto(origin+'/biology/reproduction/'+file);
    const clipped=await page.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return ['missing svg'];const sr=svg.getBoundingClientRect();return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBoundingClientRect();return b.left<sr.left-2||b.top<sr.top-2||b.right>sr.right+2||b.bottom>sr.bottom+2}).map(t=>t.textContent)});
    if(clipped.length)issues.push('SVG label outside viewBox '+file+': '+clipped.join(', '));
   }catch(e){issues.push('svg '+file+': '+String(e))}
  }
 }
 await context.close();
}finally{await writeFile(out+'/report.json',JSON.stringify({issues,shots,results},null,2));await browser.close()}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1}else console.log('D3.1 visual screenshot QA PASS: '+shots.length+' screenshots, '+results.length+' loaded figures');
