import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const folder='qa-artifacts/ib-source-policy';
await mkdir(folder,{recursive:true});
const topics=['A1.1','A1.2','A2.1','A2.2','A2.3','A3.1','A3.2','A4.1','A4.2','B1.1','B1.2','B2.1','B2.2','B2.3','B3.1','B3.2','B3.3','B4.1','B4.2','C1.1','C1.2','C1.3','C2.1','C2.2','C3.1','C3.2','C4.1','C4.2','D1.1','D1.2','D1.3','D2.1','D2.2','D2.3','D3.1','D3.2','D3.3','D4.1','D4.2','D4.3'];
const report={topics:[],screenshots:[],errors:[],externalNetworkRequests:[]};
const browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin===new URL(base).origin||url.protocol==='data:')return route.continue();
   report.externalNetworkRequests.push(url.origin);
   return route.abort();
  });
  const page=await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror',e=>report.errors.push('Browser runtime: '+String(e)));
  for(const topic of topics){
   try{
    await page.goto(base+'#biology/topic/'+topic+'/sources');
    await page.locator('.bio-sources .bio-approved-sources>li').first().waitFor();
    await expect(page.locator('.bio-sources .bio-approved-sources>li')).toHaveCount(2);
    await expect(page.locator('.bio-approved-sources>li').first()).toContainText('Official IB Biology Guide');
    await expect(page.locator('.bio-approved-sources>li').nth(1)).toContainText('Hodder');
    const text=await page.locator('.bio-sources').innerText();
    for(const forbidden of ['NCBI Bookshelf','StemBook','Independent research or figure reference','Main teaching and curriculum reference','PMC scientific']){
     if(text.includes(forbidden))throw Error('Unapproved student-facing source '+forbidden);
    }
    const widthResult=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    if(widthResult.scroll>widthResult.viewport+2)throw Error('Horizontal overflow '+JSON.stringify(widthResult));
    report.topics.push({topic,width,approvedSources:2,pass:true});
    if(['A1.1','B2.2','C1.2','D3.2'].includes(topic)){
      const dest=folder+'/sources-'+topic+'-'+width+'.png';
      await page.screenshot({path:dest,fullPage:true,animations:'disabled'});
      report.screenshots.push(dest);
    }
   }catch(e){report.errors.push(topic+' @'+width+': '+String(e));report.topics.push({topic,width,pass:false,error:String(e)})}
  }
  for(const id of ['A1.1.7','A1.1.8']){
   try{
    await page.goto(base+'#biology/topic/A1.1/learn?understanding='+id);
    await page.locator('.bio-reading').waitFor();
    await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',id);
    const dest=folder+'/lesson-'+id+'-'+width+'.png';await page.screenshot({path:dest,fullPage:true,animations:'disabled'});report.screenshots.push(dest);
   }catch(e){report.errors.push('Water lesson '+id+' @'+width+': '+String(e))}
  }
  await context.close();
 }
}finally{
 await writeFile(folder+'/report.json',JSON.stringify(report,null,2));
 await browser.close();
}
if(report.errors.length){console.error(report.errors.join('\\n'));process.exitCode=1}else console.log('PASS: 40 topics × 2 screen widths; each Sources page has exactly 2 verified educational references.');
