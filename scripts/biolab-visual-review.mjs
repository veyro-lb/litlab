import {chromium} from '@playwright/test';import {mkdir,writeFile,readFile} from 'node:fs/promises';
const out='qa-artifacts/visual-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const report={screenshots:[],errors:[],svgTextOverflow:[]};
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});await context.addInitScript(()=>{localStorage.setItem('litlab:biology:preferences:v1','HL');localStorage.litlabTheme='light'});await context.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4173/')?route.continue():route.abort());const p=await context.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>report.errors.push(String(e)));
 for(const width of [390,1440]){
  await p.setViewportSize({width,height:1000});
  for(const [name,hash] of [['library','biology'],['water','biology/topic/A1.1/learn?understanding=A1.1.3'],['organelles','biology/topic/B2.2/learn?understanding=B2.2.4']]){
   try{await p.goto('http://127.0.0.1:4173/#'+hash);await p.locator('.bio-app').waitFor();if(name==='library'){await p.locator('[data-topic-id="A1.1"]>summary').click()}else await p.locator('[data-reading-id="'+(name==='water'?'A1.1.3':'B2.2.4')+'"]').waitFor();await p.locator('.bio-app').evaluate(async root=>{for(const img of root.querySelectorAll('img'))img.loading='eager';await Promise.all([...root.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;setTimeout(resolve,2000)})))});await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});await p.waitForTimeout(80);await p.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});report.screenshots.push(`${name}-${width}.png`);if(name==='water'){await p.getByRole('button',{name:'Simplify this',exact:true}).click();await p.locator('.bio-lesson-content').screenshot({path:`${out}/help-${width}.png`})}}catch(e){report.errors.push(name+' '+width+': '+String(e));await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});await p.waitForTimeout(80);await p.screenshot({path:`${out}/error-${name}-${width}.png`,fullPage:true})}
  }
 }
 // Explicit supported widths for the four redrawn organelle figures, without a deployment.
 for(const width of [375,768,1024]){
  try{
   await p.setViewportSize({width,height:1000});
   await p.goto('http://127.0.0.1:4173/#biology/topic/B2.2/learn?understanding=B2.2.4');
   await p.locator('[data-reading-id="B2.2.4"]').waitFor();
   await p.locator('.bio-figure-image img').first().evaluate(async img=>{img.loading='eager';await img.decode()});
   await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});
   await p.screenshot({path:`${out}/organelles-${width}.png`,fullPage:true});
   report.screenshots.push(`organelles-${width}.png`);
  }catch(e){report.errors.push('organelles '+width+': '+String(e))}
 }
 // Additional visual acceptance states: topic list, answer feedback, section actions and enlarged diagram.
 for(const width of [390,1440]){
  await p.setViewportSize({width,height:1000});
  for(const [name,hash] of [['topic-list','biology/topic/A1.1'],['practice-feedback','biology/topic/A1.1/practice?understanding=A1.1.3'],['lesson-controls','biology/topic/A1.1/learn?understanding=A1.1.3']]){
   try{
    await p.goto('http://127.0.0.1:4173/#'+hash);await p.locator('.bio-app').waitFor();
    if(name==='practice-feedback'){const q=p.locator('.bio-practice-choice .bio-check').first();if(await q.getByRole('button',{name:'Try again'}).count()){await q.getByRole('button',{name:'Try again'}).click();await q.locator('.bio-feedback').waitFor({state:'detached'});}await q.locator('input[type=radio]').first().check();await q.getByRole('button',{name:'Check my answer'}).click();await q.locator('.bio-feedback').waitFor();}
    if(name==='lesson-controls')await p.locator('.bio-toc').evaluate(el=>el.open=true);
    await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});
    await p.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});report.screenshots.push(`${name}-${width}.png`);
    if(name==='lesson-controls'){await p.locator('.bio-section-controls').screenshot({path:`${out}/buttons-${width}.png`});report.screenshots.push(`buttons-${width}.png`);await p.locator('.bio-lesson-nav').screenshot({path:`${out}/mobile-nav-${width}.png`});report.screenshots.push(`mobile-nav-${width}.png`);const figure=p.locator('.bio-figure-image').first();if(await figure.count()){await figure.click();await p.locator('dialog[open]').screenshot({path:`${out}/diagram-enlarged-${width}.png`});report.screenshots.push(`diagram-enlarged-${width}.png`);await p.keyboard.press('Escape')}}
   }catch(e){report.errors.push(name+' '+width+': '+String(e))}
  }
 }
 for(const width of [320,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});await p.goto('http://127.0.0.1:4173/#biology');await p.locator('.litlab-auth-signin').waitFor();await p.locator('.topbar').screenshot({path:`${out}/header-${width}.png`});}
 const catalog=JSON.parse(await readFile('src/biology/learning/catalog.json','utf8'));for(const e of Object.values(catalog)){const l=JSON.parse(await readFile('src/biology/learning/'+e.path.slice(2),'utf8'));for(const a of l.assets.filter(a=>a.kind==='original-svg'&&!a.withheldReason)){await p.goto('http://127.0.0.1:4173'+a.src);const clipped=await p.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return ['not svg'];const v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width+1||b.y+b.height>v.height+1}).map(t=>t.textContent)});if(clipped.length)report.svgTextOverflow.push({id:a.id,src:a.src,clipped});if(['A1.1','B2.2'].includes(l.topicId)){await p.setViewportSize({width:1000,height:750});await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'})});await p.waitForTimeout(80);await p.screenshot({path:`${out}/figure-${a.id}.png`})}}}
 // Test the selected mobile SVG text bounds and render each modified visual variant.
 for(const n of [3,4,5,8])for(const size of ['mobile','mobile-recall']){
  const src='/biology/organelles-compartmentalization/organelle-'+n+'-'+size+'.svg';
  await p.goto('http://127.0.0.1:4173'+src);
  const clipped=await p.evaluate(()=>{const svg=document.querySelector('svg');if(!svg)return ['not svg'];const v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width+1||b.y+b.height>v.height+1}).map(t=>t.textContent)});
  if(clipped.length)report.svgTextOverflow.push({src,clipped});
  await p.setViewportSize({width:375,height:1000});await p.screenshot({path:`${out}/figure-${n}-${size}-375.png`,fullPage:true});
 }
 await context.close();
}finally{await writeFile(out+'/visual-report.json',JSON.stringify(report,null,2));await browser.close()}
if(report.errors.length||report.svgTextOverflow.length)process.exitCode=1;
