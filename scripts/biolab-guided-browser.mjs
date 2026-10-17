import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const out='qa-artifacts/textbook-redesign';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={generatedAt:new Date().toISOString(),checks:[],failures:[],externalRequests:[],runtimeErrors:[],headerMatrix:[],understandings:[]};
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const english={litlabDone:'["start"]',litlabSkillProgress:'{"completed":[],"bestScores":{}}',litlabLearningProfile:'{"stats":{},"recent":[],"clinicSessions":0}',litlabBookProfilesReviewed:'[]',litlabEEChecklist:'[]',litlabChoiceBankProgress:'{"stats":{}}'};
async function check(name,fn){try{await fn();report.checks.push({name,pass:true});console.log('PASS '+name)}catch(e){report.checks.push({name,pass:false,error:String(e)});report.failures.push(name+': '+String(e));console.error('FAIL '+name+': '+e)}}
async function newPage({width=1440,height=1000,theme='light',signed=false,touch=false}={}){
 const context=await browser.newContext({viewport:{width,height},hasTouch:touch,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(({theme,signed,english})=>{localStorage.litlabTheme=theme;localStorage.setItem('litlab:biology:preferences:v1','HL');for(const[k,v]of Object.entries(english))localStorage.setItem(k,v);if(signed)localStorage.setItem('litlabSupabaseSession',JSON.stringify({access_token:'synthetic-test-token',refresh_token:'synthetic-refresh',expires_at:2147483647,token_type:'bearer'}))},{theme,signed,english});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:4173'||u.origin==='http://127.0.0.1:4174')return route.continue();
 report.externalRequests.push({method:route.request().method(),origin:u.origin,mocked:signed&&u.pathname==='/auth/v1/user'});
 if(signed&&u.pathname==='/auth/v1/user')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'00000000-0000-4000-8000-000000000001',email:'qa@example.invalid',user_metadata:{full_name:'Synthetic Account With An Intentionally Very Long Display Name'}})});
 return route.abort();});
 const p=await context.newPage();p.on('pageerror',e=>report.runtimeErrors.push(String(e)));return p;
}
async function go(p,hash){await p.goto(base+'#'+hash);await p.locator('.bio-app').waitFor();if(hash.includes('/learn'))await p.locator('.bio-guided').waitFor()}
const phase=(p,i)=>p.locator('.bio-phase-nav button').nth(i).click();
async function bounds(p){return p.evaluate(()=>{const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};const els=[...document.querySelectorAll('.topbar a,.topbar button')].filter(visible);const controls=els.map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label')||e.textContent.trim(),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}});const overlap=[];for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlap.push([a.label,b.label])}return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,controls,overlap}})}
try{
 // Exact-source baseline, built separately from the unmodified starting commit.
 for(const width of [320,390,1440])await check(`before screenshot ${width}`,async()=>{const p=await newPage({width});await p.goto('http://127.0.0.1:4174/#biology/topic/B2.2/learn');await p.locator('.bio-lesson-content').waitFor();await p.screenshot({path:`${out}/before-b22-${width}.png`,fullPage:true});await p.context().close()});
 for(const width of [320,390,768,1024,1440,1920])for(const theme of ['light','dark'])for(const signed of [false,true])await check(`header ${width} ${theme} ${signed?'signed fixture':'guest'}`,async()=>{
  const p=await newPage({width,theme,signed,touch:width<=390});await go(p,'biology/topic/B2.2/learn');await p.locator(signed?'.litlab-account-trigger':'.litlab-auth-signin').waitFor();
  const b=await bounds(p);report.headerMatrix.push({width,theme,signed,...b});expect(b.overlap).toEqual([]);expect(b.scrollWidth).toBeLessThanOrEqual(width+1);for(const c of b.controls){expect(c.left).toBeGreaterThanOrEqual(0);expect(c.right).toBeLessThanOrEqual(width+1);expect(c.height).toBeGreaterThanOrEqual(40)}
  await p.locator('.topbar').screenshot({path:`${out}/header-${width}-${theme}-${signed?'signed':'guest'}.png`});
  if(signed){await p.locator('.litlab-account-trigger').click();await expect(p.locator('.litlab-account-menu')).toBeVisible();const r=await p.locator('.litlab-account-menu').boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width+1);await p.keyboard.press('Escape')}
  else{await p.locator('.litlab-auth-signin').click();await expect(p.locator('.litlab-auth-dialog')).toBeVisible();await p.keyboard.press('Escape')}
  await p.locator('[aria-label="Toggle theme"]').focus();await p.keyboard.press('Enter');await expect(p.locator('html')).toHaveAttribute('data-theme',theme==='light'?'dark':'light');
  await p.context().close();
 });
 const p=await newPage();await go(p,'biology');
 for(const t of ['A1.1','A1.2','B1.1','B1.2','B2.1','B2.2','B2.3','C1.1'])await check(`${t} primary entry opens teaching`,async()=>{await go(p,'biology');await p.locator(`[data-topic-id="${t}"]`).first().click();await expect(p.locator('.bio-guided')).toBeVisible()});
 const catalog=JSON.parse(await readFile('src/biology/learning/catalog.json','utf8'));
 for(const entry of Object.values(catalog)){
  const lesson=JSON.parse(await readFile('src/biology/learning/'+entry.path.slice(2),'utf8'));
  for(const section of lesson.sections)await check(section.understandingIds[0]+' student task',async()=>{
   const id=section.understandingIds[0];await go(p,`biology/topic/${lesson.topicId}/learn?understanding=${id}`);await expect(p.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',id);
   await phase(p,0);if(section.prediction){const q=section.prediction.question;await p.locator(`[data-question-id="${q.id}"] input[value="${q.options.find(o=>!o.correct).id}"]`).check();await expect(p.locator(`[data-question-id="${q.id}"] .bio-feedback`)).toContainText('Reconsider.')}else await p.locator('textarea').first().fill('My synthetic prediction, with a reason.');
   await phase(p,1);const blocks=section.teachingBlocks??[];for(let i=0;i<blocks.length;i++){await p.locator('.bio-explanation-controls button').nth(i).click();await expect(p.locator('.bio-explanation-panel')).toContainText(blocks[i].explanation)}
   for(const img of await p.locator('.bio-figure picture img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(x=>x.complete&&x.naturalWidth>0)).toBe(true)}
   if(section.assets.length){await p.getByRole('button',{name:'Hide figure labels for recall',exact:true}).click();await expect(p.locator('.bio-figure picture img').first()).toHaveAttribute('src',/recall/);await p.getByRole('button',{name:'Reveal figure labels',exact:true}).click()}
   if(lesson.topicId==='B2.2'){await p.locator('.bio-lesson-content').screenshot({path:`${out}/after-${id}-explanation.png`});await p.getByRole('button',{name:'Enlarge figure',exact:true}).first().click();await expect(p.locator('dialog[open]')).toBeVisible();await p.keyboard.press('Tab');expect(await p.locator('dialog').evaluate(d=>d.contains(d.getRootNode().activeElement))).toBe(true);await p.keyboard.press('Escape');await expect(p.getByRole('button',{name:'Enlarge figure',exact:true}).first()).toBeFocused()}
   await phase(p,2);const q=section.interactions[0];await p.locator(`[data-question-id="${q.id}"] input[value="${q.options.find(o=>!o.correct).id}"]`).check();await expect(p.locator(`[data-question-id="${q.id}"] .bio-feedback`)).toContainText('Reconsider.');await p.locator(`[data-question-id="${q.id}"] input[value="${q.options.find(o=>o.correct).id}"]`).check();await expect(p.locator(`[data-question-id="${q.id}"] .bio-feedback`)).toContainText('Correct.');
   if(lesson.topicId==='B2.2'){const investigation=p.locator('.bio-investigation');await expect(investigation).toBeVisible();const correct=['b','b','b','b','b','a','b','b','b'][Number(id.split('.')[2])-1];await investigation.locator(`input[value="${correct}"]`).check();await expect(investigation.locator('.bio-feedback')).toContainText('Correct.');if(id==='B2.2.4'){await p.locator('#b22-volume').fill('4');await expect(p.locator('output')).toContainText('6.0')}await p.locator('.bio-lesson-content').screenshot({path:`${out}/after-${id}-investigation.png`})}
   await phase(p,3);await p.locator('.bio-recall-group button').first().click();await expect(p.locator('.bio-recall-group [role=status]').first()).toBeVisible();await p.locator('.bio-misconception textarea').first().fill('My repaired explanation.');await p.locator('.bio-misconception button').first().click();await expect(p.locator('.bio-misconception [role=status]').first()).toBeVisible();
   expect(await p.locator('.bio-lesson-content').innerText()).not.toMatch(/(?:PDF|Guide|textbook)\s+p(?:p)?\.?\s*\d/i);
   report.understandings.push({id,explanationConnections:blocks.length,imagesLoaded:section.assets.length,feedback:true,retrieval:true,misconceptionRepair:true,educationalApproval:false});
  });
  await check(`${lesson.topicId} scope, sources, practice and state`,async()=>{
   const hl=lesson.sections.find(s=>s.level==='HL');if(hl){await go(p,`biology/topic/${lesson.topicId}/learn?understanding=${hl.understandingIds[0]}`);await p.locator('input[name=biology-level][value=SL]').check();await expect(p.locator('.bio-lesson-content')).not.toHaveAttribute('data-level','HL');await p.locator('input[name=biology-level][value=HL]').check()}
   await go(p,`biology/topic/${lesson.topicId}/sources`);expect(await p.locator('.bio-sources').innerText()).not.toMatch(/(?:PDF|Guide|textbook)\s+p(?:p)?\.?\s*\d/i);await expect(p.locator('.bio-sources')).toContainText('Hodder');
   await go(p,`biology/topic/${lesson.topicId}/practice`);const q=lesson.questions.find(q=>q.options);const wrong=q.options.find(o=>!o.correct);await p.locator(`[data-question-id="${q.id}"] input[value="${wrong.id}"]`).check();await p.getByRole('button',{name:'Review missed questions',exact:true}).click();await expect(p.locator('.bio-practice-choice')).toHaveCount(1);await p.getByRole('button',{name:'Show all practice',exact:true}).click();
   await p.locator('.bio-written textarea').first().fill('Synthetic written response retained for review.');await p.locator('.bio-written>button').first().click();await expect(p.locator('.bio-written .bio-feedback').first()).toContainText('No automatic written-response mark');await go(p,`biology/topic/${lesson.topicId}/revision`);await go(p,`biology/topic/${lesson.topicId}/practice`);await expect(p.locator('.bio-written textarea').first()).toHaveValue('Synthetic written response retained for review.');
  });
 }
 await check('keyboard and touch at 320, 390, 768, 1024, 1440, 1920 and 200% reflow',async()=>{
  for(const width of [320,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});await go(p,'biology/topic/B2.2/learn?understanding=B2.2.4');await phase(p,1);await p.locator('.bio-lesson-content').screenshot({path:`${out}/after-b22-${width}.png`});expect((await bounds(p)).scrollWidth).toBeLessThanOrEqual(width+1);await p.locator('.bio-phase-nav button').nth(2).focus();await p.keyboard.press('Enter');await expect(p.locator('.bio-investigation')).toBeVisible()}
  // 200% browser zoom reflow equivalent: 1440 CSS-pixel window has 720 CSS pixels available.
  await p.setViewportSize({width:720,height:500});await go(p,'biology/topic/B2.2/learn?understanding=B2.2.4');await phase(p,1);expect((await bounds(p)).scrollWidth).toBeLessThanOrEqual(721);await p.screenshot({path:`${out}/zoom-200-reflow.png`,fullPage:true});
  const t=await newPage({width:390,touch:true});await go(t,'biology/topic/B2.2/learn');await t.locator('.bio-phase-nav button').nth(2).tap();await expect(t.locator('.bio-investigation')).toBeVisible();await t.locator('.bio-toc summary').tap();await t.locator('.bio-lesson-nav button').nth(1).tap();await expect(t.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id','B2.2.2');await t.context().close();
 });
 await check('Cell structure remains planned; existing English and Biology progress unchanged',async()=>{await go(p,'biology/topic/A2.2/learn');await expect(p.locator('.bio-lesson')).toHaveCount(0);const values=await p.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(english));expect(values).toEqual(english);expect(await p.evaluate(()=>localStorage.getItem('litlab:biology:progress:v1'))).toBeNull();await p.locator('.bio-subject-return').click();await expect(p.locator('.home-hero')).toBeVisible()});
 expect(report.runtimeErrors).toEqual([]);
 await p.context().close();
}finally{await writeFile(out+'/browser-report.json',JSON.stringify(report,null,2));await browser.close()}
if(report.failures.length)process.exitCode=1;
