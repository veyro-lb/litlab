#!/usr/bin/env node
/**
 * Browser-driven independent BioLab QA against a LOCAL, disposable preview.
 *
 * npm ci && npm run build
 * npm run preview -- --host 127.0.0.1 --port 4173
 * CHROME_BIN=/path/to/chromium node scripts/biology/parallel-student-qa/browser.mjs
 *
 * No account login, remote deployment, backend mutations, or telemetry required.
 * Screenshots are from the actual Chromium-rendered application, not mockups.
 */
import {chromium, expect} from '@playwright/test';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=new URL('../../../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const registry=read('src/biology/curriculum/registry.json');
const catalog=read('src/biology/learning/catalog.json');
const lessons=new Map(registry.map(t=>[t.id,read('src/biology/learning/'+catalog[t.lessonId].path.replace(/^\.\//,''))]));
const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const rootUrl=new URL(base),output=resolve('docs/biology/parallel-student-qa/evidence');
mkdirSync(output,{recursive:true});
const report={schemaVersion:1,sourceSha:process.env.GITHUB_SHA||null,base,environment:{viewportWidths:[320,390,768,1024,1440,1920],browser:'Chromium',zoom:'CSS zoom approximation, NOT native browser zoom',screenReader:'not tested'},cases:[],screenshots:[],runtime:[],console:[],failedRequests:[],limitations:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const file=(name)=>output+'/'+name;
async function createContext(width=1440,level='HL',touch=false){
  const c=await browser.newContext({viewport:{width,height:900},hasTouch:touch,reducedMotion:'reduce',serviceWorkers:'block'});
  await c.addInitScript(value=>{localStorage.setItem('litlab:biology:preferences:v1',value);localStorage.setItem('litlabTheme','light');},level);
  // Only local application resources; remote sign-in, analytics and student data are not exercised.
  await c.route('**/*',route=>{
    const requestUrl=new URL(route.request().url());
    return requestUrl.origin===rootUrl.origin?route.continue():route.abort('blockedbyclient');
  });
  return c;
}
const tracked=page=>{
  page.on('pageerror',e=>report.runtime.push({url:page.url(),error:String(e)}));
  page.on('requestfailed',r=>report.failedRequests.push({page:page.url(),request:r.url(),failure:r.failure()?.errorText||null}));
  page.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({url:page.url(),level:m.type(),message:m.text().slice(0,700)});});
  return page;
};
async function check(name,details,run){
  try{await run();report.cases.push({name,details,pass:true});console.log('PASS '+name);}
  catch(e){report.cases.push({name,details,pass:false,error:String(e).slice(0,1500)});console.error('FAIL '+name+': '+e);}
}
async function visit(page,route){
  await page.goto(new URL('#'+route,base).toString(),{waitUntil:'domcontentloaded'});
  await page.locator('.bio-lesson').waitFor({timeout:20000});
}
async function shot(page,name){
  await page.screenshot({path:file(name),fullPage:true,animations:'disabled'});
  report.screenshots.push(name);
}
async function assertNoOverflow(page,width){
  const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
  expect(actual,'Horizontal overflow at '+width+'px').toBeLessThanOrEqual(width+2);
}
try{
  const desktop=await createContext();const page=tracked(await desktop.newPage());page.setDefaultTimeout(14000);
  await check('HL course library and four themes','1440px, #biology',async()=>{
    await page.goto(new URL('#biology',base).toString());
    await expect(page.locator('.bio-course-header h1')).toHaveText('Biology');
    for(const id of ['A','B','C','D'])await expect(page.locator('.bio-library-theme-'+id)).toHaveCount(1);
    await expect(page.locator('.bio-library-topic')).toHaveCount(40);
    await shot(page,'hl-library-1440.png');
  });
  await check('Course search reaches topics across themes','1440px, #biology',async()=>{
    const search=page.locator('input[type=search]');await search.fill('D3.2');
    await expect(page.locator('.bio-library-topic')).toHaveCount(1);
    await expect(page.locator('[data-topic-id="D3.2"]')).toBeVisible();
    await search.fill('');
  });
  for(const topic of registry){
    await check('HL lesson direct link '+topic.id,'1440px, #biology/topic/'+topic.id+'/learn',async()=>{
      await visit(page,'biology/topic/'+topic.id+'/learn');
      await expect(page.locator('.bio-lesson h1')).toHaveText(topic.title);
      await expect(page.locator('.bio-reading')).toBeVisible();
      const lesson=lessons.get(topic.id),toc=page.locator('.bio-toc li');
      await expect(toc).toHaveCount(lesson.sections.length);
      await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',lesson.sections[0].understandingIds[0]);
    });
  }
  for(const id of ['A1.1','B2.1','C3.1','D3.2']){
    const lesson=lessons.get(id),choice=lesson.questions.find(q=>q.options?.length>=2);
    await check('Section selection and hash restore '+id,'1440px, #biology/topic/'+id+'/learn',async()=>{
      await visit(page,'biology/topic/'+id+'/learn');
      const last=page.locator('.bio-toc li button').last();
      await last.click();
      await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',lesson.sections.at(-1).understandingIds[0]);
      await page.reload();
      await expect(page.locator('.bio-lesson-content')).toHaveAttribute('data-understanding-id',lesson.sections.at(-1).understandingIds[0]);
      await shot(page,'lesson-'+id.toLowerCase().replace('.','-')+'-1440.png');
    });
    await check('Practice correct, retry, feedback and route memory '+id,'1440px, practice',async()=>{
      await visit(page,'biology/topic/'+id+'/practice');
      if(!choice)throw new Error('No MCQ in topic '+id);
      const card=page.locator('.bio-practice-choice').filter({has:page.locator('[data-question-id="'+choice.id+'"]')}).first();
      const key=choice.options.find(o=>o.correct===true);
      const wrong=choice.options.find(o=>o.correct===false);
      await card.locator('input[value="'+key.id+'"]').check();
      await card.getByRole('button',{name:'Check my answer'}).click();
      await expect(card.locator('.bio-feedback[data-outcome="correct"]')).toBeVisible();
      await visit(page,'biology/topic/'+id+'/learn');
      await visit(page,'biology/topic/'+id+'/practice');
      const same=page.locator('[data-question-id="'+choice.id+'"]');
      await expect(same.locator('.bio-feedback[data-outcome="correct"]')).toBeVisible();
      await same.getByRole('button',{name:'Try again'}).click();
      await same.locator('input[value="'+wrong.id+'"]').check();
      await same.getByRole('button',{name:'Check my answer'}).click();
      await expect(same.locator('.bio-feedback[data-outcome="retry"]')).toBeVisible();
      await same.locator('details summary').click();
      await expect(same.locator('.bio-feedback details p')).toHaveCount(choice.options.length);
    });
    await check('Flashcards and revision '+id,'1440px, flashcards + revision',async()=>{
      await visit(page,'biology/topic/'+id+'/flashcards');
      await expect(page.locator('.bio-flashcards')).toBeVisible();
      await page.getByRole('button',{name:'Reveal answer'}).first().click();
      await expect(page.locator('.bio-flashcard-answer')).toBeVisible();
      await page.getByRole('button',{name:'Next card'}).first().click();
      await visit(page,'biology/topic/'+id+'/revision');
      await expect(page.locator('.bio-takeaway')).toBeVisible();
    });
    await check('Figure interaction and keyboard dismissal '+id,'1440px, lesson',async()=>{
      await visit(page,'biology/topic/'+id+'/learn');
      const button=page.locator('.bio-figure-image').first();
      if(!(await button.count()))return; // Topic may have no visible figures.
      await button.scrollIntoViewIfNeeded();
      const img=button.locator('img');
      await expect.poll(()=>img.evaluate(x=>x.complete&&x.naturalWidth>0),{timeout:12000}).toBe(true);
      await button.focus();await page.keyboard.press('Enter');
      await expect(page.locator('.bio-figure-dialog[open]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.bio-figure-dialog[open]')).toHaveCount(0);
      await expect(button).toBeFocused();
    });
  }

  for(const id of ['A1.1','B2.1','C3.1','D3.2']){
    const lesson=lessons.get(id),written=lesson.questions.find(q=>q.markingPoints?.length);
    await check('Written self-review, tab retention and refresh reset '+id,'1440px, practice (real Chromium)',async()=>{
      if(!written)throw new Error('No written response item in '+id);
      await visit(page,'biology/topic/'+id+'/practice');
      const selector='.bio-written[data-question-id="'+written.id+'"]';
      const card=page.locator(selector),draft='Independent QA draft for '+id+' — ungraded self-review';
      await card.locator('textarea').fill(draft);
      await card.getByRole('button',{name:'Compare with marking guidance'}).click();
      await expect(card.locator('.bio-feedback')).toContainText('Self-review guidance only');
      await visit(page,'biology/topic/'+id+'/learn');
      await visit(page,'biology/topic/'+id+'/practice');
      await expect(page.locator(selector+' textarea')).toHaveValue(draft);
      await page.reload();
      await expect(page.locator(selector+' textarea')).toHaveValue('');
    });
  }
  await check('Reproduce PQA-001 A2.1.2 keyed-content contradiction in actual browser','1440px, HL practice',async()=>{
    const item=lessons.get('A2.1').questions.find(q=>q.id==='a21-p1a-2');
    if(!item)throw new Error('Missing target question a21-p1a-2');
    const keyed=item.options?.find(o=>o.correct===true);
    if(!keyed)throw new Error('Missing keyed response');
    await visit(page,'biology/topic/A2.1/practice');
    const card=page.locator('[data-question-id="a21-p1a-2"]');
    await expect(card.locator('legend')).toContainText('cells are independently living units');
    await expect(card.locator('label').filter({has:card.locator('input[value="'+keyed.id+'"]')})).toContainText('host');
    await card.locator('input[value="'+keyed.id+'"]').check();
    await card.getByRole('button',{name:'Check my answer'}).click();
    await expect(card.locator('.bio-feedback[data-outcome="correct"]')).toBeVisible();
    report.reproductions??=[];
    report.reproductions.push({finding:'PQA-001',topic:'A2.1',questionId:item.id,stem:item.prompt,keyedAnswer:keyed.text,keyedFeedback:keyed.feedback,browserMarkedCorrect:true,specialistScienceReviewRequired:true});
    await shot(page,'pqa-001-a2-1-2-keyed-contradiction-1440.png');
  });
  await check('Reproduce PQA-002 two distinct wrong selections with identical feedback','1440px, HL practice',async()=>{
    const item=lessons.get('A2.1').questions.find(q=>q.id==='a21-p1a-1');
    if(!item)throw new Error('Missing target question a21-p1a-1');
    const wrong=item.options.filter(o=>o.correct===false);
    if(wrong.length<2)throw new Error('Not enough distractors to compare');
    await visit(page,'biology/topic/A2.1/practice');
    const card=page.locator('[data-question-id="a21-p1a-1"]');
    for(const [index,option] of wrong.slice(0,2).entries()){
      if(index)await card.getByRole('button',{name:'Try again'}).click();
      await card.locator('input[value="'+option.id+'"]').check();
      await card.getByRole('button',{name:'Check my answer'}).click();
      await expect(card.locator('.bio-feedback[data-outcome="retry"]')).toContainText(option.feedback);
    }
    if(wrong[0].feedback!==wrong[1].feedback)throw new Error('PQA-002 source reproduction no longer present; update finding');
    report.reproductions??=[];
    report.reproductions.push({finding:'PQA-002',topic:'A2.1',questionId:item.id,distractorOptionIds:wrong.slice(0,2).map(o=>o.id),identicalFeedback:wrong[0].feedback,bothSelectedInBrowser:true});
  });
  await check('Browser back/forward and invalid route','1440px',async()=>{
    await page.goto(new URL('#biology',base).toString());
    await page.goto(new URL('#biology/topic/A1.1/learn',base).toString());
    await page.goBack();await expect(page.locator('.bio-course-header h1')).toHaveText('Biology');
    await page.goForward();await expect(page.locator('.bio-lesson')).toBeVisible();
    await page.goto(new URL('#biology/topic/X9.9',base).toString());
    await expect(page.locator('.bio-empty')).toBeVisible();
  });
  await desktop.close();
  const sl=await createContext(390,'SL',true);const sp=tracked(await sl.newPage());
  await check('SL excludes HL-only topics and sections','390px',async()=>{
    await sp.goto(new URL('#biology',base).toString());
    for(const topic of registry.filter(t=>t.level==='HL'))await expect(sp.locator('[data-topic-id="'+topic.id+'"]')).toHaveCount(0);
    await sp.goto(new URL('#biology/topic/A2.1/learn',base).toString());
    await expect(sp.locator('.bio-empty')).toContainText('HL only');
    await visit(sp,'biology/topic/A1.1/learn');
    await expect(sp.locator('.bio-toc li')).toHaveCount(lessons.get('A1.1').sections.filter(s=>s.level==='shared').length);
    await expect(sp.locator('.bio-lesson-content')).toHaveAttribute('data-level','shared');
  });
  await sl.close();
  for(const width of [320,390,768,1024,1440,1920]){
    const c=await createContext(width,'HL',width<=768);const p=tracked(await c.newPage());
    await check('Responsive library '+width+'px','actual Chromium viewport',async()=>{
      await p.goto(new URL('#biology',base).toString());
      await expect(p.locator('.bio-course-header h1')).toBeVisible();
      await assertNoOverflow(p,width);
      await shot(p,'library-'+width+'.png');
    });
    await check('Responsive long lesson '+width+'px','C3.1, actual Chromium viewport',async()=>{
      await visit(p,'biology/topic/C3.1/learn');
      await assertNoOverflow(p,width);
      await shot(p,'lesson-c3-1-'+width+'.png');
    });
    if(width===1024){
      await check('CSS zoom approximation at 200%','not native browser zoom',async()=>{
        await p.evaluate(()=>{document.documentElement.style.zoom='200%';});
        await assertNoOverflow(p,width);
        await shot(p,'css-zoom-200-1024.png');
      });
    }
    await c.close();
  }
}finally{
  report.failed=report.cases.filter(c=>!c.pass).length;
  report.passed=report.cases.filter(c=>c.pass).length;
  report.finishedAt=new Date().toISOString();
  writeFileSync(file('browser-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  console.log(JSON.stringify({passed:report.passed,failed:report.failed,runtimeErrors:report.runtime.length,consoleIssues:report.console.length,screenshots:report.screenshots.length},null,2));
}
if(report.failed||report.runtime.length)process.exitCode=1;
