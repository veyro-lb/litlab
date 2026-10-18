// Real local Vite builds only. Produce before/after evidence without deploying.
import {chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const dir='qa-artifacts/figure-layout';mkdirSync(dir,{recursive:true});
const cases=[
 ['A1.1','water','cohesion'],['A1.2','nucleic-acids','a12-nucleotide'],
 ['A2.2','cell-structure','a22-organization'],['B1.2','proteins','b12-levels'],
 ['B2.1','membranes-transport','b21-figure-4'],['B3.2','transport','b32-heart-frontal'],
 ['C1.2','cell-respiration','krebs-cycle'],['C1.3','photosynthesis','thylakoid-chemiosmosis'],
 ['C2.2','neural-signalling','action-potential-trace'],['D1.1','dna-replication','d11-orientation'],
 ['D1.2','protein-synthesis','d12-sequence'],['D2.1','cell-nuclear-division','d21-mitosis-2n4'],
 ['D3.3','homeostasis','d33-feedback']
];
const manifest={head:process.env.GITHUB_SHA||null,baseline:'a03f8f86af7009a529b6aaf8fd7e581a3928de52',source:'actual local production builds',results:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],executablePath:process.env.CHROME_BIN||undefined});
try{
 for(const width of [1440,834,390]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    return url.hostname==='127.0.0.1'&&(url.port==='4173'||url.port==='4174')?route.continue():route.abort();
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',e=>manifest.errors.push({type:'runtime',width,message:String(e)}));
  for(const [topic,slug,id] of cases){
   const lesson=JSON.parse(readFileSync(join('src/biology/learning',slug,'lesson.json'),'utf8'));
   const section=lesson.sections.find(s=>(s.assets||[]).includes(id));
   if(!section){manifest.errors.push({type:'missing-placement',topic,id});continue}
   const uid=section.understandingIds[0];
   for(const mode of ['before','after']){
    const port=mode==='before'?4174:4173;
    const path=dir+'/'+mode+'-'+topic.replaceAll('.','')+'-'+id+'-'+width+'.png';
    try{
     await page.goto('http://127.0.0.1:'+port+'/#biology/topic/'+topic+'/learn?understanding='+uid,{waitUntil:'domcontentloaded'});
     await page.locator('.bio-lesson-content[data-understanding-id="'+uid+'"]').waitFor();
     const figure=page.locator('.bio-lesson-content .bio-figure[data-asset-id="'+id+'"]');
     await figure.waitFor({state:'visible'});
     const img=figure.locator('.bio-figure-image picture img').first();
     await img.scrollIntoViewIfNeeded();
     await img.evaluate(async el=>{el.loading='eager';await el.decode();if(el.naturalWidth<1)throw Error('Missing pixels')});
     const info=await img.evaluate(el=>{
      const rect=el.getBoundingClientRect(),f=el.closest('figure').getBoundingClientRect();
      return {naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,width:Math.round(rect.width),height:Math.round(rect.height),figureWidth:Math.round(f.width),size:el.closest('figure').dataset.size,clipped:rect.right>innerWidth+2||rect.left< -2};
     });
     if(info.clipped)throw Error('Image extends beyond viewport');
     if(mode==='after'){
      if(!info.size)throw Error('Missing size classification');
      const max={compact:400,standard:600,detailed:800,wide:860}[info.size];
      if(info.width>max+2)throw Error('Size cap '+max+' exceeded by '+info.width);
      const trigger=figure.locator('button.bio-figure-image');
      await trigger.focus();await page.keyboard.press('Enter');
      const dialog=figure.locator('dialog.bio-figure-dialog');
      await dialog.waitFor({state:'visible'});
      const zoom=dialog.getByRole('button',{name:'Zoom in'});
      const big=dialog.locator('.bio-figure-zoom img');
      const size1=await big.evaluate(e=>e.getBoundingClientRect().width);
      await zoom.click();
      await dialog.locator('output').getByText('150%',{exact:true}).waitFor({state:'visible'});
      await big.evaluate(el=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const size2=await big.evaluate(e=>e.getBoundingClientRect().width);
      if(size2<=size1)throw Error('Zoom did not enlarge image (at 100% '+size1+'px; at 150% '+size2+'px)');
      await dialog.getByRole('button',{name:'Reset'}).click();
      await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
      if(!(await trigger.evaluate(e=>e===e.getRootNode().activeElement)))throw Error('Focus did not return');
     }
     await figure.screenshot({path,animations:'disabled'});
     manifest.results.push({topic,id,uid,width,mode,file:path,...info});
     console.log('PASS '+mode+' '+topic+' '+id+' '+width);
    }catch(e){manifest.errors.push({type:'figure',topic,id,uid,mode,width,error:String(e)});console.error('FAIL '+mode+' '+topic+' '+id+' '+width+': '+e)}
   }
  }
  await context.close();
 }
 // Previously embedded handout crop: do not render without documented reproduction rights.
 const ctx=await browser.newContext({viewport:{width:1440,height:900}});
 await ctx.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL')});
 const page=await ctx.newPage();
 await page.goto('http://127.0.0.1:4173/#biology/topic/A1.2/learn?understanding=A1.2.6');
 const withheld=page.locator('.bio-withheld-figure[data-asset-id="a12-paired"]');
 await withheld.waitFor({state:'visible',timeout:15000});
 if(await withheld.locator('img').count())manifest.errors.push({type:'copyright',error:'PDF crop still rendered'});
 await ctx.close();
}finally{
 await browser.close();
 writeFileSync(dir+'/report.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({samples:manifest.results.length,errors:manifest.errors.length}));
 if(manifest.errors.length)process.exitCode=1;
}
