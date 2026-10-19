// Headless Chromium screenshot evidence of the actual BioLab application.
 // Local Vite build only: do not deploy or synthesize a pretend website.
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const root='http://127.0.0.1:4173/';
const dir='qa-artifacts/site-preview';
mkdirSync(dir,{recursive:true});
const cases=[
  {topic:'A1.2',uid:'A1.2.2',id:'a12-nucleotide',slug:'dna-nucleotide'},
  {topic:'A2.2',uid:'A2.2.6',id:'a22-eukaryote',slug:'animal-cell'},
  {topic:'A2.2',uid:'A2.2.8',id:'a22-palisade-pdf',slug:'plant-palisade'},
  {topic:'B2.1',uid:'B2.1.4',id:'b21-figure-4',slug:'fluid-mosaic-membrane'},
  {topic:'B3.1',uid:'B3.1.7',id:'b31-leaf',slug:'dicot-leaf'},
  {topic:'D3.1',uid:'D3.1.4',id:'d31-male-pdf',slug:'reproductive-anatomy'},
  {topic:'D3.1',uid:'D3.1.9',id:'d31-flower-structures',slug:'flower'}
];
const report={gitSha:process.env.GITHUB_SHA??null,site:'real local Vite production build, no public deployment',screenshots:[],failures:[]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.setItem('litlabTheme','light');});
  const page=await context.newPage();
  page.on('pageerror',e=>report.failures.push({width,type:'pageerror',message:String(e)}));
  for(const item of cases){
    const name=item.slug+'-'+width+'.png';
    try{
      const u=root+'#biology/topic/'+item.topic+'/learn?understanding='+item.uid;
      await page.goto(u,{waitUntil:'domcontentloaded'});
      const article=page.locator('.bio-lesson-content[data-understanding-id="'+item.uid+'"]');
      await article.waitFor({state:'visible',timeout:25000});
      const figure=article.locator('.bio-figure[data-asset-id="'+item.id+'"]');
      await figure.waitFor({state:'visible',timeout:15000});
      const image=figure.locator('img').first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async img=>{if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true})});if(img.decode)await img.decode();if(!img.naturalWidth)throw new Error('Image has no pixels');});
      const source=await image.getAttribute('src');
      if(!source?.startsWith('/biology/ancient-mariner/'))throw new Error('Site still shows old visual: '+source);
      // Keep a little above the diagram visible to show the real lesson context.
      await page.evaluate(()=>window.scrollBy(0,-100));
      await page.screenshot({path:dir+'/'+name,animations:'disabled'});
      const audit=await page.evaluate(()=>({horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth}));
      report.screenshots.push({file:name,source,topic:item.topic,understanding:item.uid,assetId:item.id,width,context:'real BioLab lesson viewport',...audit});
      console.log('PASS '+name+' '+source);
      if(audit.horizontalOverflow)report.failures.push({type:'overflow',file:name,...audit});
    }catch(e){report.failures.push({type:'capture',width,topic:item.topic,error:String(e)});console.error('FAIL '+name+' '+e);}
  }
  await context.close();
}
}finally{
 writeFileSync(dir+'/capture-report.json',JSON.stringify(report,null,2)+'\n');
 await browser.close();
}
console.log(JSON.stringify({screenshots:report.screenshots.length,failures:report.failures.length,sha:report.gitSha}));
if(report.failures.length)process.exitCode=1;
