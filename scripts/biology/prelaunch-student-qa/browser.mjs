import {chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const reg=JSON.parse(readFileSync(resolve(root,'src/biology/curriculum/registry.json'),'utf8'));
const catalog=JSON.parse(readFileSync(resolve(root,'src/biology/learning/catalog.json'),'utf8'));
const out=resolve(root,'qa-artifacts/prelaunch-student-qa');
mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:4173/';
const report={schemaVersion:1,baselineSha:process.env.GITHUB_SHA||'local-unpinned',browser:'Chromium Playwright 1.56.1',startedAt:new Date().toISOString(),viewports:[320,390,768,1024,1440,1920],cases:[],screenshots:[],pageErrors:[],blockedExternalRequests:[],limitations:[
'No manual screen reader (NVDA/VoiceOver/TalkBack) or touch hardware',
'No native browser-toolbar zoom; CSS zoom is only an approximation',
'Full WCAG compliance, scientific correctness, image rights and all 553 understanding states are not certified',
'Offline browser deliberately blocks all external authentication and third-party URLs',
'Image label legibility at zoom is only partly machine measurable and requires human visual review'
]};
const lessonFor=t=>JSON.parse(readFileSync(resolve(root,'src/biology/learning',catalog[t.lessonId].path),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
let page,context;
async function test(name,fn){
 try{const details=await fn();report.cases.push({name,status:'pass',details:details||undefined});console.log('PASS '+name);}
 catch(e){report.cases.push({name,status:'fail',error:String(e)});console.error('FAIL '+name+' '+String(e));}
}
function ok(value,message){if(!value)throw Error(message);}
async function makePage(width=1440,theme='light',level='HL',motion='reduce'){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:motion,serviceWorkers:'block'});
 await ctx.addInitScript(({theme,level})=>{localStorage.litlabTheme=theme;localStorage.setItem('litlab:biology:preferences:v1',level)},{theme,level});
 await ctx.route('**/*',route=>{const url=route.request().url();if(url.startsWith(base)||url.startsWith('blob:')||url.startsWith('data:'))return route.continue();report.blockedExternalRequests.push(url);return route.abort();});
 const p=await ctx.newPage();p.setDefaultTimeout(16000);p.on('pageerror',e=>report.pageErrors.push({url:p.url(),error:String(e)}));
 return {ctx,p};
}
async function visit(p,path,element='.bio-lesson'){await p.goto(base+'#'+path,{waitUntil:'domcontentloaded'});await p.locator(element).waitFor({timeout:18000});}
async function shot(p,name){const relative='qa-artifacts/prelaunch-student-qa/'+name+'.png';await p.screenshot({path:resolve(root,relative),fullPage:true,animations:'disabled'});report.screenshots.push(relative);}
async function noOverflow(p,label){const v=await p.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));ok(v.scroll<=v.client+2,label+' document overflow '+JSON.stringify(v));}
async function captureFigure(p,name){const btn=p.locator('.bio-figure-image').first();await btn.waitFor();const img=btn.locator('img');await img.scrollIntoViewIfNeeded();const image=await img.evaluate(el=>({complete:el.complete,w:el.naturalWidth,h:el.naturalHeight,alt:el.alt,client:el.getBoundingClientRect().width}));ok(image.complete&&image.w>1&&image.h>1,'Figure missing or failed: '+JSON.stringify(image));ok(image.alt.length>18,'Figure has no meaningful alternative: '+JSON.stringify(image));await btn.click();const dialog=p.locator('dialog.bio-figure-dialog[open]');await dialog.waitFor();await shot(p,name+'-enlarged');await p.keyboard.press('Escape');ok(await dialog.count()===0,'Escape did not close figure');ok(await btn.evaluate(el=>el===el.getRootNode().activeElement),'Focus did not return to figure opener');return image;}
try{
 ({ctx:context,p:page}=await makePage());
 await test('Biology homepage and all four themes',async()=>{await visit(page,'biology','.bio-app');for(const theme of 'ABCD')ok(await page.locator('.bio-discovery-theme-'+theme).count()===1,'Missing theme '+theme);await shot(page,'home-entry-1440-light');});
 await test('SL/HL selection and exclusion of HL-only topic',async()=>{await visit(page,'biology','.bio-app');await page.locator('.bio-level input[value="SL"]').check({force:true});await page.locator('#bio-topic-search').fill('A2.1');ok(await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').count()===0,'HL only visible at SL');await page.locator('.bio-level input[value="HL"]').check({force:true});ok(await page.locator('.bio-discovery-topic[data-topic-id="A2.1"]').count()===1,'HL topic not restored');});
 await test('Search, keyboard shortcut and result',async()=>{await visit(page,'biology','.bio-app');await page.keyboard.press('Control+k');ok(await page.locator('#bio-topic-search').evaluate(el=>el===el.getRootNode().activeElement),'Ctrl+K does not focus biology search');await page.locator('#bio-topic-search').fill('C3.1');await page.locator('.bio-discovery-topic[data-topic-id="C3.1"]').click();await page.waitForURL(/#biology\/topic\/C3\.1$/);});
 for(const topic of reg){
  const lesson=lessonFor(topic);
  await test('Topic route '+topic.id,async()=>{await visit(page,'biology/topic/'+topic.id+'/learn');ok((await page.locator('.bio-lesson h1').innerText()).toLowerCase()===topic.title.toLowerCase(),'Wrong topic heading');const visible=await page.locator('.bio-lesson-content').getAttribute('data-understanding-id');ok(visible===topic.understandings[0].id,'First understanding not selected');});
  const all=topic.understandings;
  const selected=[all[0],all[Math.floor(all.length/2)],all[all.length-1],all.find(u=>u.level==='HL')].filter(Boolean);
  const unique=[...new Map(selected.map(u=>[u.id,u])).values()];
  for(const understanding of unique){
   await test('Complete reading '+understanding.id,async()=>{
    await visit(page,'biology/topic/'+topic.id+'/learn?understanding='+understanding.id);
    ok(await page.locator('.bio-lesson-content').getAttribute('data-understanding-id')===understanding.id,'Wrong understanding loaded');
    const section=lesson.sections.find(s=>s.understandingIds.includes(understanding.id));
    ok(!!section,'Missing authored section');
    const sourceBlocks=section.teachingBlocks||section.explanation.split('\n\n').map(x=>({explanation:x}));
    const rendered=page.locator('.bio-reading-passage');
    ok(await rendered.count()===sourceBlocks.length,'Incomplete teaching blocks: expected '+sourceBlocks.length+', got '+await rendered.count());
    for(let index=0;index<sourceBlocks.length;index++){
     const expected=sourceBlocks[index].explanation.replace(/\s+/g,' ').trim();
     const text=(await rendered.nth(index).innerText()).replace(/\s+/g,' ').trim();
     ok(text.includes(expected),'Teaching block '+index+' not fully rendered');
    }
    const h=await page.locator('.bio-lesson-content h2').first().innerText();
    ok(h.trim().length>10,'Missing substantive title');
    await noOverflow(page,understanding.id);
    return {topic:topic.id,level:understanding.level,teachingBlocks:sourceBlocks.length};
   });
  }
 }
 for(const [theme,id] of [['A','A1.1'],['B','B2.1'],['C','C3.1'],['D','D3.2']]){
  await test('Representative figure '+theme,async()=>{const lesson=lessonFor(reg.find(t=>t.id===id));const section=lesson.sections.find(s=>s.assets.length&&s.assets.some(a=>!lesson.assets.find(v=>v.id===a)?.withheldReason));ok(!!section,'No available figure in '+id);await visit(page,'biology/topic/'+id+'/learn?understanding='+section.understandingIds[0]);return await captureFigure(page,'figure-'+theme+'-1440');});
  await test('Practice feedback and marking '+theme,async()=>{await visit(page,'biology/topic/'+id+'/practice');const q=page.locator('fieldset.bio-check').first();await q.waitFor();await q.locator('input[type=radio]').first().check({force:true});await q.getByRole('button',{name:'Check my answer'}).click();await q.locator('.bio-feedback').waitFor();await q.locator('details summary').click();ok((await q.locator('.bio-feedback details p').count())>=2,'No per-option reasoning');await shot(page,'practice-'+theme+'-1440');});
  await test('Revision and flashcards '+theme,async()=>{await visit(page,'biology/topic/'+id+'/revision');await page.locator('.bio-takeaway').first().waitFor();await visit(page,'biology/topic/'+id+'/flashcards');await page.getByRole('button',{name:'Reveal answer'}).first().click();await page.locator('.bio-flashcard-answer[role=status]').waitFor();await page.getByRole('button',{name:/Next card/}).click();});
 }
 await test('Sources and credits are student accessible',async()=>{await visit(page,'biology/topic/A1.1/sources');await page.locator('#bio-sources-heading').waitFor();const n=await page.locator('.bio-educational-sources li').count();ok(n===2,'Expected official IB and Hodder listings, got '+n);const links=await page.locator('.bio-educational-sources a[href^="https://"]').count();ok(links===2,'Expected two https source links, got '+links);await shot(page,'sources-A1.1-1440');});
 await test('Licensed scientific image has exact reusable source and terms',async()=>{
  const lesson=lessonFor(reg.find(t=>t.id==='A2.2'));
  const asset=lesson.assets.find(a=>a.id==='a22-cucumber-tem');
  ok(asset&&asset.sourceUrl&&asset.termsUrl,'Missing authoritative asset citation metadata');
  await visit(page,'biology/topic/A2.2/sources');
  const details=page.locator('details.bio-media-credits');
  await details.waitFor();
  await details.locator('summary').click();
  const item=page.locator('.bio-media-credits li').filter({hasText:asset.captionTitle});
  await item.waitFor();
  const source=await item.getByRole('link',{name:/Original source/}).getAttribute('href');
  const terms=await item.getByRole('link',{name:/Licence or terms/}).getAttribute('href');
  ok(source===asset.sourceUrl,'Exact image source URL mismatch: '+source);
  ok(terms===asset.termsUrl,'Exact license URL mismatch: '+terms);
  ok((await item.innerText()).includes(asset.attribution.slice(0,30)),'Authorship or attribution is hidden');
  await shot(page,'licensed-image-source-A2.2-1440');
  return {source,terms,assetId:asset.id};
 });
 await test('Real licensed multi-panel micrograph fits 320px and enlarges',async()=>{
  const lesson=lessonFor(reg.find(t=>t.id==='A2.2'));
  const section=lesson.sections.find(s=>s.assets.includes('a22-cucumber-tem'));
  ok(!!section,'Licensed TEM has no lesson placement');
  const {ctx,p}=await makePage(320,'light');
  try{
   await visit(p,'biology/topic/A2.2/learn?understanding='+section.understandingIds[0]);
   const figure=p.locator('.bio-figure[data-asset-id="a22-cucumber-tem"]');
   await figure.waitFor();
   const image=figure.locator('img').first();
   const measures=await image.evaluate(el=>({width:el.getBoundingClientRect().width,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,complete:el.complete}));
   ok(measures.complete&&measures.naturalWidth>0,'Licensed TEM failed to load');
   ok(measures.width<=320,'TEM overflows 320px viewport');
   await noOverflow(p,'licensed TEM at 320px');
   await shot(p,'licensed-image-mobile-320');
   await figure.locator('button.bio-figure-image').click();
   await p.locator('dialog.bio-figure-dialog[open]').waitFor();
   const zoom=p.locator('dialog.bio-figure-dialog[open] .bio-figure-zoom');
   await shot(p,'licensed-image-enlarged-320');
   const scroll=await zoom.evaluate(el=>{
    const img=el.querySelector('img');
    const cs=img?getComputedStyle(img):null;
    return {client:el.clientWidth,scroll:el.scrollWidth,imgClientWidth:img?.getBoundingClientRect().width,imgNaturalWidth:img?.naturalWidth,imgNaturalHeight:img?.naturalHeight,imgComputedWidth:cs?.width,imgWidthRule:cs?.width,imgMinWidth:cs?.minWidth};
   });
   ok(scroll.scroll>scroll.client+200,'Large TEM not genuinely enlarged for mobile inspection: '+JSON.stringify(scroll));
   await zoom.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
   ok(await zoom.evaluate(el=>el.scrollLeft)>200,'Cannot horizontally inspect full-resolution micrograph');
   await p.keyboard.press('Escape');
   return measures;
  }finally{await ctx.close();}
 });
 await test('Drawing Practice (when eligible)',async()=>{await visit(page,'biology/topic/A1.1/drawing');const eligible=page.locator('.bio-drawing[data-exercise]');if(!await eligible.count())return {status:'not-available-A1.1',notCountedAsInteractivePass:true};await page.getByRole('button',{name:'Reveal labels'}).first().click();await page.locator('.bio-drawing-reference').waitFor();await page.getByRole('button',{name:'Check labels'}).click();await page.locator('.bio-drawing-field p[role=status]').first().waitFor();await page.getByRole('button',{name:'Draw it yourself'}).click();await page.getByRole('button',{name:/Hide reference & draw/}).click();await shot(page,'drawing-A1.1-1440');});
 await test('Understandings previous/next and browser history',async()=>{await visit(page,'biology/topic/A1.1/learn?understanding=A1.1.1');await page.getByRole('button',{name:/Next:/}).click();await page.waitForURL(/understanding=A1\.1\.2/);await page.goBack();await page.waitForURL(/understanding=A1\.1\.1/);await page.locator('.bio-back').first().click();await page.waitForURL(/#biology\/topic\/A1\.1$/);});
 await test('Semantic heading and focusable table',async()=>{await visit(page,'biology/topic/D3.2/learn?understanding=D3.2.9');const tbl=page.locator('.bio-table-scroll').first();await tbl.waitFor();ok(await tbl.getAttribute('role')==='region','No labelled table region');ok(await tbl.getAttribute('aria-label'),'No table region label');ok(await tbl.getAttribute('tabindex')==='0','Table not keyboard focusable');});

 await test('Keyboard focus visibility on course search',async()=>{
  await visit(page,'biology','.bio-app');
  await page.keyboard.press('Control+k');
  const search=page.locator('#bio-topic-search');
  const visual=await search.evaluate(el=>{const css=getComputedStyle(el);return {active:el===el.getRootNode().activeElement,focusVisible:el.matches(':focus-visible'),outlineWidth:css.outlineWidth,outlineStyle:css.outlineStyle,boxShadow:css.boxShadow};});
  ok(visual.active,'Keyboard shortcut did not move focus to search');
  ok(visual.focusVisible,'Search focus does not match :focus-visible after keyboard action');
  ok((parseFloat(visual.outlineWidth)>0&&visual.outlineStyle!=='none')||visual.boxShadow!=='none','No visible search focus indicator: '+JSON.stringify(visual));
  return visual;
 });
 await test('Image modal keyboard activation and focus restoration',async()=>{
  await visit(page,'biology/topic/A1.1/learn?understanding=A1.1.1');
  const opener=page.locator('button.bio-figure-image').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog=page.locator('dialog.bio-figure-dialog[open]');
  await dialog.waitFor();
  ok(await dialog.evaluate(el=>el.contains(el.getRootNode().activeElement)),'Dialog focus did not move into modal');
  await page.keyboard.press('Escape');
  ok(await dialog.count()===0,'Modal did not close on Escape');
  ok(await opener.evaluate(el=>el===el.getRootNode().activeElement),'Focus not returned to figure opener');
 });
 await test('Heading structure and meaningful image alternatives audit',async()=>{
  const inspected=[];
  for(const id of ['A1.1','B2.1','C3.1','D3.2']){
   await visit(page,'biology/topic/'+id+'/learn');
   const h1=await page.locator('.bio-lesson h1').count();
   ok(h1===1,id+' must have exactly one topic h1, got '+h1);
   const headings=await page.locator('.bio-lesson h1,.bio-lesson h2,.bio-lesson h3,.bio-lesson h4').evaluateAll(els=>els.map(el=>({level:Number(el.tagName.slice(1)),text:el.textContent?.trim().slice(0,80)})));
   const skipped=headings.slice(1).filter((h,i)=>h.level>headings[i].level+1);
   const figures=await page.locator('.bio-figure img').evaluateAll(els=>els.map(el=>({alt:el.alt,complete:el.complete,naturalWidth:el.naturalWidth})));
   for(const img of figures)ok(img.alt.trim().length>18,id+' image missing meaningful alt attribute: '+JSON.stringify(img));
   inspected.push({id,h1,headingCount:headings.length,skippedHeadingLevels:skipped,figureCount:figures.length});
  }
  report.headingAltAudit=inspected;
  return inspected;
 });
 await test('Mobile interactive-target size inventory (informational, not WCAG certification)',async()=>{
  const {ctx,p}=await makePage(320,'light');
  try{
   await visit(p,'biology','.bio-app');
   const targets=await p.locator('.bio-app button,.bio-app a[href],.bio-app input').evaluateAll(els=>els.filter(el=>{
    const box=el.getBoundingClientRect(),s=getComputedStyle(el);
    return box.width>0&&box.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!el.hasAttribute('disabled');
   }).map(el=>{const r=el.getBoundingClientRect();return {label:(el.getAttribute('aria-label')||el.textContent||el.getAttribute('value')||'').trim().slice(0,54),width:Math.round(r.width),height:Math.round(r.height)};}));
   const small=targets.filter(t=>t.width<44||t.height<44);
   report.mobileTargetInventory={viewport:320,total:targets.length,under44Recommendation:small.length,examples:small.slice(0,30),standard:'44px touch-target heuristic; exceptions and spacing not evaluated'};
   return report.mobileTargetInventory;
  }finally{await ctx.close();}
 });
 await context.close();
 for(const theme of ['light','dark']){
  for(const width of [320,390,768,1024,1440,1920]){
   const {ctx,p}=await makePage(width,theme);
   await test('Responsive '+theme+' '+width,async()=>{
    await visit(p,'biology','.bio-app');await noOverflow(p,'homepage');
    await shot(p,'home-'+width+'-'+theme);
    await visit(p,'biology/topic/C3.1/learn?understanding=C3.1.1');await noOverflow(p,'long lesson');
    ok(await p.locator('.bio-reading-passage').count()>0,'Long explanation missing');
    await shot(p,'reading-C3.1-'+width+'-'+theme);
    return {width,theme};
   });
   if(width===320||width===390){
    await test('Table horizontal scroll at '+width+' '+theme,async()=>{
     await visit(p,'biology/topic/D3.2/learn?understanding=D3.2.9');const box=p.locator('.bio-table-scroll').first();await box.waitFor();const v=await box.evaluate(el=>({width:el.getBoundingClientRect().width,client:el.clientWidth,scroll:el.scrollWidth}));ok(v.width<=width+1,'Table overflows document');if(v.scroll>v.client+1){await box.evaluate(el=>{el.scrollLeft=el.scrollWidth;});ok(await box.evaluate(el=>el.scrollLeft)>0,'Cannot scroll table');}await noOverflow(p,'table');await shot(p,'table-D3.2-'+width+'-'+theme);return v;
    });
   }
   if(width===390&&theme==='dark')await test('Reduced motion removes theme-card transitions',async()=>{await visit(p,'biology','.bio-app');const duration=await p.locator('.bio-discovery-theme-A').evaluate(el=>getComputedStyle(el).transitionDuration);ok(duration.split(',').every(x=>parseFloat(x)===0),'Transition persists '+duration);});
   await ctx.close();
  }
 }
 const {ctx:zoomCtx,p:zoomPage}=await makePage(1024);
 await test('CSS-only 200% zoom approximation',async()=>{await visit(zoomPage,'biology','.bio-app');await zoomPage.evaluate(()=>{document.documentElement.style.zoom='200%';});await noOverflow(zoomPage,'CSS zoom');await shot(zoomPage,'css-zoom-200-1024');});
 await zoomCtx.close();
}finally{
 report.finishedAt=new Date().toISOString();
 report.summary={passed:report.cases.filter(c=>c.status==='pass').length,failed:report.cases.filter(c=>c.status==='fail').length,pageErrors:report.pageErrors.length,screenshots:report.screenshots.length,topicRoutes:report.cases.filter(c=>c.name.startsWith('Topic route ')).length,readings:report.cases.filter(c=>c.name.startsWith('Complete reading ')).length};
 writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PRELAUNCH_SUMMARY '+JSON.stringify(report.summary));
 await browser.close();
}
if(report.summary.failed>0||report.pageErrors.length>0)process.exitCode=1;
