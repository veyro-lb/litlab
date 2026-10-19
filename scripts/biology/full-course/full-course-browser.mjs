import {chromium,expect} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const registry=read('src/biology/curriculum/registry.json');
const available=registry.filter(t=>t.lessonId);
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const folder='qa-artifacts/full-course';
mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={sha:process.env.GITHUB_SHA||null,topics:[],screenshots:[],errors:[],cases:[]};
async function context(width=1440,level='HL',touch=false){
  const ctx=await browser.newContext({viewport:{width,height:930},hasTouch:touch,serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.addInitScript(level=>{localStorage.setItem('litlab:biology:preferences:v1',level);localStorage.litlabTheme='light';},level);
  await ctx.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.origin===new URL(base).origin)return route.continue();
    return route.abort();
  });
  return ctx;
}
async function check(name,fn){try{await fn();report.cases.push({name,pass:true});console.log('PASS '+name)}catch(e){const msg=String(e);report.cases.push({name,pass:false,error:msg});report.errors.push(name+': '+msg);console.error('FAIL '+name+': '+msg)}}
async function visit(page,route){await page.goto(base+'#'+route,{waitUntil:'domcontentloaded'});await page.locator('.bio-lesson').waitFor({timeout:15000});}
try{
  const desk=await context();const p=await desk.newPage();
  p.setDefaultTimeout(12000);
  p.on('pageerror',error=>report.errors.push('Runtime: '+String(error)));
  await check('Full Biology course library',async()=>{
    await p.goto(base+'#biology');
    await expect(p.locator('#bio-welcome-title')).toHaveText('Biology, made clearer.');
    await p.screenshot({path:folder+'/library-desktop.png',fullPage:true});
    report.screenshots.push('library-desktop.png');
  });
  for(const topic of available){
    await check('Desktop lesson '+topic.id,async()=>{
      await visit(p,'biology/topic/'+topic.id+'/learn');
      await expect(p.locator('.bio-lesson h1')).toHaveText(topic.title);
      await expect(p.locator('.bio-reading').first()).toBeVisible();
      const visible=p.locator('[data-reading-id]').first();
      await expect(visible).toBeVisible();
      report.topics.push(topic.id);
    });
  }
  for(const [name,id] of [['theme-a','A2.1'],['theme-b','B3.2'],['theme-c','C3.1'],['theme-d','D3.2']]){
    await check('Theme '+name+' complete lesson screenshot',async()=>{
      await visit(p,'biology/topic/'+id+'/learn');
      await p.screenshot({path:folder+'/'+name+'-lesson-desktop.png',fullPage:true});
      report.screenshots.push(name+'-lesson-desktop.png');
    });
    for(const [mode,selector] of [['practice','.bio-practice'],['sources','.bio-sources'],['flashcards','.bio-flashcards']]){
      await check(id+' '+mode,async()=>{
        await visit(p,'biology/topic/'+id+'/'+mode);
        await expect(p.locator(selector)).toBeVisible();
        if(mode==='practice'&&name==='theme-d'){
          await p.screenshot({path:folder+'/practice-desktop.png',fullPage:true});
          report.screenshots.push('practice-desktop.png');
        }
      });
    }
    await check(id+' enlarge diagram with keyboard escape',async()=>{
      await visit(p,'biology/topic/'+id+'/learn');
      const button=p.locator('.bio-figure-image').first();
      if(await button.count()){
        await button.click();
        await expect(p.locator('.bio-figure-dialog[open]')).toBeVisible();
        await p.keyboard.press('Escape');
        await expect(p.locator('.bio-figure-dialog[open]')).toHaveCount(0);
      }
    });
  }
  await desk.close();
  for(const width of [320,390,768]){
    const mobile=await context(width,'HL',true);const page=await mobile.newPage();
    await check('Mobile course navigation '+width,async()=>{
      await page.goto(base+'#biology',{waitUntil:'domcontentloaded'});
      await expect(page.locator('#bio-welcome-title')).toBeVisible();
      const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(scroll).toBeLessThanOrEqual(width+2);
      await page.screenshot({path:folder+'/library-'+width+'.png',fullPage:true});
      report.screenshots.push('library-'+width+'.png');
    });
    await check('Mobile complete lesson '+width,async()=>{
      await visit(page,'biology/topic/C3.1/learn');
      await expect(page.locator('.bio-reading')).toBeVisible();
      const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(scroll).toBeLessThanOrEqual(width+2);
      await page.screenshot({path:folder+'/theme-c-lesson-'+width+'.png',fullPage:true});
      report.screenshots.push('theme-c-lesson-'+width+'.png');
    });
    await mobile.close();
  }
  const sl=await context(390,'SL',true),sp=await sl.newPage();
  await check('HL-only lesson inaccessible at SL',async()=>{
    await sp.goto(base+'#biology/topic/A2.1/learn',{waitUntil:'domcontentloaded'});
    await expect(sp.locator('.bio-empty')).toContainText('HL only');
  });
  await sl.close();
}finally{
  writeFileSync(folder+'/report.json',JSON.stringify(report,null,2));
  await browser.close();
}
if(report.errors.length)process.exitCode=1;
console.log(JSON.stringify({topicsVisited:report.topics.length,checks:report.cases.length,failures:report.errors.length,screenshots:report.screenshots.length,sha:report.sha},null,2));
