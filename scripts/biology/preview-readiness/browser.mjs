import {chromium,expect} from '@playwright/test';
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
const registry=JSON.parse(readFileSync('src/biology/curriculum/registry.json','utf8'));
const lessons=readdirSync('src/biology/learning',{withFileTypes:true}).filter(e=>e.isDirectory()).flatMap(e=>{try{return [JSON.parse(readFileSync('src/biology/learning/'+e.name+'/lesson.json','utf8'))]}catch{return []}});
const byTopic=new Map(lessons.map(l=>[l.topicId,l]));
const base=(process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/').replace(/\/?$/,'/');
const folder='qa-artifacts/preview-readiness';
mkdirSync(folder,{recursive:true});
const report={sha:process.env.GITHUB_SHA||null,topics:registry.length,topicVisits:0,understandingVisits:0,viewportPasses:{},checks:[],errors:[],screenshots:[],notes:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
function fail(name,e){const message=name+': '+String(e);report.errors.push(message);report.checks.push({name,passed:false,error:String(e)});console.error('FAIL '+message)}
function pass(name){report.checks.push({name,passed:true})}
async function context(width,level='HL'){
 const c=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce',serviceWorkers:'block'});
 await c.addInitScript(level=>{localStorage.setItem('litlab:biology:preferences:v1',level);localStorage.litlabTheme='light'},level);
 return c;
}
async function visit(page,topic,understanding){
 const hash='#biology/topic/'+topic+'/learn'+(understanding?'?understanding='+encodeURIComponent(understanding):'');
 await page.goto(base+hash,{waitUntil:'domcontentloaded'});
 await page.locator('.bio-lesson').waitFor({timeout:12000});
}
async function overflow(page){return page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth)}
try{
 for(const width of [1440,834,390]){
  const c=await context(width),page=await c.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',e=>report.errors.push('JS error '+width+': '+String(e)));
  for(const topic of registry){
   const lesson=byTopic.get(topic.id);
   const name=topic.id+' at '+width;
   try{
    if(!lesson)throw Error('Lesson JSON missing');
    const sections=lesson.sections.filter(s=>s.level==='shared'||s.level==='HL');
    await visit(page,topic.id,sections[0].understandingIds[0]);
    if((await page.locator('.bio-lesson h1').innerText()).trim()!==topic.title)throw Error('Wrong lesson heading');
    const nav=await page.locator('.bio-toc li').count();
    if(nav!==sections.length)throw Error('Navigation mismatch: '+nav+' versus '+sections.length);
    if(await overflow(page)>2)throw Error('Document horizontal overflow: '+await overflow(page)+'px');
    report.topicVisits++;
    pass(name+' route/navigation/layout');
    if(width===1440){
     for(const section of sections){
      const id=section.understandingIds[0];
      const key=topic.id+' '+id;
      try{
       await visit(page,topic.id,id);
       const reading=page.locator('[data-reading-id="'+id+'"]');
       await reading.waitFor();
       if((await reading.innerText()).trim().length<100)throw Error('Empty or truncated reading content');
       const paragraphs=reading.locator('.bio-reading-passage');
       if(await paragraphs.count()!==(section.teachingBlocks?.length??section.explanation.split('\n\n').length))throw Error('Missing teaching paragraphs');
       const placements=section.figurePlacements??section.assets.map((assetId,i)=>({assetId,afterBlock:Math.min(i+1,section.teachingBlocks.length-1)}));
       for(const placement of placements){
        const figure=paragraphs.nth(placement.afterBlock).locator('[data-asset-id="'+placement.assetId+'"]');
        if(await figure.count()!==1)throw Error('Missing/misplaced figure '+placement.assetId+' at '+placement.afterBlock);
       }
       const total=await reading.locator('[data-asset-id]').count();
       if(total!==section.assets.length)throw Error('Incorrect figure count '+total+' versus '+section.assets.length);
       report.understandingVisits++;pass(key+' teaching/figures');
      }catch(e){fail(key,e)}
     }
    }else{
     const figure=page.locator('.bio-reading .bio-figure-clean img').first();
     if(await figure.count()){
      await figure.scrollIntoViewIfNeeded();
      const info=await figure.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}return {complete:img.complete,width:img.naturalWidth}});
      if(info.width===0)report.notes.push(name+' first scientific image failed decoding: '+await figure.getAttribute('src'));
     }
    }
    if(['A1.2','C1.2','C1.3','D2.1'].includes(topic.id)){
     const shot=topic.id.replace('.','-')+'-'+width+'.png';
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.screenshot({path:folder+'/'+shot,fullPage:false});report.screenshots.push(shot);
    }
   }catch(e){fail(name,e)}
  }
  report.viewportPasses[width]=report.topicVisits;
  await c.close();
 }
 const c=await context(320),page=await c.newPage();
 for(const id of ['A1.2','B2.1','C1.2','D2.1']){
  try{await visit(page,id);const delta=await overflow(page);if(delta>2)throw Error(delta+'px overflow');pass(id+' 320px narrow viewport')}
  catch(e){fail(id+' 320px',e)}
 }
 await c.close();
 const sl=await context(390,'SL'),sp=await sl.newPage();
 for(const topic of registry){
  const l=byTopic.get(topic.id);
  try{
   await sp.goto(base+'#biology/topic/'+topic.id+'/learn',{waitUntil:'domcontentloaded'});
   if(l.sections.some(s=>s.level==='shared')){
    await expect(sp.locator('.bio-lesson h1')).toHaveText(topic.title,{timeout:12000});
    await expect(sp.locator('.bio-reading')).toBeVisible({timeout:12000});
    const expected=l.sections.filter(s=>s.level==='shared').length;
    await expect(sp.locator('.bio-toc li')).toHaveCount(expected,{timeout:12000});
   }else{
    await expect(sp.locator('.bio-empty')).toContainText('HL only',{timeout:12000});
   }
   pass(topic.id+' SL/HL scope');
  }catch(e){fail(topic.id+' SL scope',e)}
 }
 await sl.close();
}finally{
 writeFileSync(folder+'/report.json',JSON.stringify(report,null,2));
 await browser.close();
}
const counts={topics:report.topics,topicVisits:report.topicVisits,understandingVisits:report.understandingVisits,checks:report.checks.length,failed:report.errors.length,screenshots:report.screenshots.length,sha:report.sha};
console.log(JSON.stringify(counts,null,2));
if(report.errors.length)process.exitCode=1;
