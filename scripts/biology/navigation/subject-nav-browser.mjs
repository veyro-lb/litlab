import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium,expect} from '@playwright/test';

const base=process.env.LITLAB_PREVIEW_URL || 'http://127.0.0.1:4173/';
const candidates=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const executablePath=candidates.find(existsSync);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const output=resolve('qa-artifacts/biolab-navigation');
mkdirSync(output,{recursive:true});
const results=[];

async function verifySignedInStudyAccess(){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 const lesson='#biology/topic/A1.1/learn?understanding=A1.1.2';
 const callback=new URL(base);
 callback.hash='access_token=study-access-fixture&refresh_token=refresh-fixture&expires_in=3600';
 await context.route('https://qdqseajcukfdbfikjptu.supabase.co/**',async route=>{
  const endpoint=new URL(route.request().url()).pathname;
  if(endpoint==='/auth/v1/authorize')return route.fulfill({status:302,headers:{location:callback.href}});
  const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey, authorization, content-type, prefer'};
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
  if(endpoint==='/auth/v1/user')return route.fulfill({headers,json:{id:'00000000-0000-4000-8000-000000000001',user_metadata:{full_name:'Study Access Student'}}});
  if(endpoint.endsWith('/get_my_litlab_contributor_account_role'))return route.fulfill({headers,json:{role:null,needs_choice:true,is_admin:false}});
  return route.fulfill({headers,json:[]});
 });
 try{
  await page.goto(new URL(lesson,base).href);
  const section=page.locator('.bio-lesson-content[data-understanding-id="A1.1.2"]');
  await expect(section).toBeVisible();
  await page.getByRole('button',{name:'Sign in to ibdplabs'}).click();
  await page.getByRole('button',{name:'Continue with Google'}).press('Enter');
  const account=page.locator('.litlab-account-trigger');
  await expect(account).toBeVisible();
  assert.equal(new URL(page.url()).hash,lesson);
  await expect(section).toBeVisible();
  await expect(page.locator('[data-auth-role-setup]')).toHaveCount(0);
  await account.click();
  await page.getByRole('button',{name:'Choose Student or Teacher account type'}).click();
  await page.getByRole('button',{name:'Continue studying'}).click();
  await expect(section).toBeVisible();
  const spaces=page.getByRole('navigation',{name:'Switch between LitLab and BioLab'});
  await spaces.getByRole('link',{name:'LitLab — English'}).click();
  await expect(page.locator('.home-hero')).toBeVisible();
  await spaces.getByRole('link',{name:'BioLab — Biology'}).click();
  await expect(page.locator('.bio-discovery-theme-A')).toBeVisible();
  await expect(account).toBeVisible();
  await expect(page.locator('[data-auth-role-setup]')).toHaveCount(0);
  console.log('PASS signed-in lesson return and study access for an account without a contributor role');
 }finally{await context.close();}
}

try {
 await verifySignedInStudyAccess();
 for(const theme of ['light','dark'])for (const {name,width,height} of [{name:'desktop',width:1440,height:900},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844},{name:'small-mobile',width:320,height:720}]) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:name.includes('mobile'),reducedMotion:'reduce'});
  await context.addInitScript(theme=>localStorage.litlabTheme=theme,theme);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  const visit=async route=>{await page.goto(new URL('#'+route,base).toString());await page.locator('.subject-bar[data-subject="'+(route.startsWith('biology')?'biology':'english')+'"] ').waitFor();};
  try {
   async function verifyHeaderScroll(subject) {
    const header=page.locator('.topbar');
    const bar=page.locator('.subject-bar[data-subject="'+subject+'"]');
    const start=(await header.boundingBox()).y;
    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
    await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(100);
    const headerBox=await header.boundingBox();
    const barBox=await bar.boundingBox();
    assert(Math.abs(start-headerBox.y)<1,subject+' header moved when scrolling at '+name);
    assert(barBox.y+barBox.height<=headerBox.y+1,subject+' study spaces stayed in view while scrolling at '+name);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   }
   await visit('home');
   await expect(page.locator('[data-auth-modal]')).toHaveCount(0);
   await verifyHeaderScroll('english');
   const switcher=page.getByRole('navigation',{name:'Switch between LitLab and BioLab'});
   assert.equal((await switcher.locator('a').allTextContents()).map(s=>s.trim()).join('|'),'LitLab|BioLab','Study-space names must be LitLab and BioLab');
   assert.equal(await switcher.locator('a[aria-current="page"]').innerText(),'LitLab');
   const brand=page.getByRole('button',{name:'LitLab home'}).locator('img');
   const sharedLogo=await brand.getAttribute('src');
   const switcherLayout=await switcher.boundingBox();
   const styles=await switcher.locator('a').evaluateAll(links=>links.map(link=>{const r=link.getBoundingClientRect(),s=getComputedStyle(link);return {w:r.width,h:r.height,font:s.fontSize,weight:s.fontWeight,radius:s.borderRadius,padding:s.padding,gap:s.gap}}));
   assert(styles.every(s=>s.h>=44),'Study-space controls need usable touch targets');
   assert(Math.abs(styles[0].w-styles[1].w)<1&&Math.abs(styles[0].h-styles[1].h)<1,'Study-space controls should have matching dimensions');
   for(const key of ['font','weight','radius','padding','gap'])assert.equal(styles[0][key],styles[1][key],'Mismatched switcher styling: '+key);
   await switcher.getByRole('link',{name:'BioLab — Biology'}).focus();
   assert.equal(await switcher.getByRole('link',{name:'BioLab — Biology'}).evaluate(el=>getComputedStyle(el).outlineStyle),'solid','Keyboard focus must be visible');
   assert.equal(await page.locator('.biolab-section-navigation').count(),0,'BioLab course navigation should not appear inside LitLab');
   await switcher.getByRole('link',{name:'BioLab — Biology'}).click();
   await page.waitForURL(/#biology$/);
   const signInDialog=page.getByRole('dialog',{name:'Sign in to ibdplabs'});
   const guest=signInDialog.getByRole('button',{name:'Continue as guest'});
   await expect(signInDialog).toHaveAttribute('data-auth-subject','BioLab');
   const bioAccent=await signInDialog.evaluate(el=>getComputedStyle(el).getPropertyValue('--accent'));
   await guest.click();
   await expect(signInDialog).toHaveCount(0);
   const nav=page.getByRole('navigation',{name:'BioLab course navigation'});
   const menuToggle=page.getByRole('button',{name:'Toggle menu'});
   const openCourseNav=async()=>{
    if(width<=1100) await menuToggle.click();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button',{name:/Toolkit/})).toHaveCount(0);
   };
   await openCourseNav();
   assert.deepEqual((await nav.locator('a').allTextContents()).map(s=>s.trim()),['Curriculum','Theme A','Theme B','Theme C','Theme D']);
   assert.equal(await nav.locator('a[aria-current="page"]').innerText(),'Curriculum');
   assert.equal(await switcher.locator('a[aria-current="page"]').innerText(),'BioLab');
   await expect(brand).toHaveAttribute('src',sharedLogo);
   const biologySwitcher=await switcher.boundingBox();
   assert(Math.abs(switcherLayout.x-biologySwitcher.x)<1&&Math.abs(switcherLayout.width-biologySwitcher.width)<1,'Study-space switcher changes layout between sections at '+name);
   await page.locator('[data-biology-host] .bio-app').waitFor();
   if(width<=1100) await menuToggle.click();
   await page.screenshot({path:resolve(output,name+'-'+theme+'-biolab-home.png'),animations:'disabled'});
   await verifyHeaderScroll('biology');
   await openCourseNav();
   await nav.getByRole('link',{name:'Theme B'}).click();
   await page.waitForURL(/#biology\/theme\/B$/);
   if(width<=1100) await expect(menuToggle).toHaveAttribute('aria-expanded','false');
   await openCourseNav();
   await expect(nav.locator('a[aria-current="page"]')).toHaveText('Theme B');
   await visit('biology/topic/A1.1/learn?understanding=A1.1.1');
   await page.locator('[data-biology-host] .bio-lesson').waitFor();
   await openCourseNav();
   await expect(nav.locator('a[aria-current="page"]')).toHaveText('Theme A');
   if(width<=1100) await menuToggle.press('Escape');
   const signIn=page.getByRole('button',{name:'Sign in to ibdplabs'});
   await expect(page.locator('[data-auth-modal]')).toHaveCount(0);
   await signIn.press('Enter');
   const google=signInDialog.getByRole('button',{name:'Continue with Google'});
   await expect(google).toBeFocused();
   await guest.focus();
   await page.keyboard.press('Tab');
   await expect(signInDialog.getByRole('button',{name:'Close',exact:true})).toBeFocused();
   await page.keyboard.press('Escape');
   await expect(signIn).toBeFocused();
   await signIn.click();
   await guest.click();
   await expect(signInDialog).toHaveCount(0);
   await expect(page).toHaveURL(/#biology\/topic\/A1\.1\/learn\?understanding=A1\.1\.1$/);
   await expect.poll(async()=>{
    const heading=await page.locator('.bio-lesson-content h2').boundingBox();
    const header=await page.locator('.topbar').boundingBox();
    return heading.y-header.y-header.height;
   }).toBeGreaterThanOrEqual(0);
   await page.screenshot({path:resolve(output,name+'-'+theme+'-biolab-lesson.png'),animations:'disabled'});
   if(name==='desktop'||name==='small-mobile'){
    await visit('biology?resource=flashcards');
    await expect(page.getByRole('heading',{name:'Flashcard decks'})).toBeVisible();
    await expect(page.locator('.bio-discovery-topic[data-topic-id="B2.1"]')).toBeVisible();
    await page.getByRole('navigation',{name:'Flashcard themes'}).getByRole('link',{name:'Theme A',exact:true}).click();
    await expect(page.locator('.bio-discovery-topic[data-topic-id="B2.1"]')).toHaveCount(0);
    await page.locator('#bio-topic-search').fill('Water');
    await page.locator('.bio-discovery-topic[data-topic-id="A1.1"]').click();
    const deck=page.getByRole('region',{name:'Flashcards'});
    await expect(deck.getByRole('heading',{name:'A1.1 Water',level:1})).toBeVisible();
    const card=deck.locator('.bio-card-button');
    const answer=deck.locator('.bio-flashcard-answer');
    const position=deck.locator('.bio-deck-progress');
    await expect(position).toContainText('Card 1 of 14');
    await expect(card).toHaveAccessibleDescription(/earliest cells/i);
    await expect(answer).toBeHidden();
    await page.keyboard.press('Space');
    await expect(answer).toBeVisible();
    await expect(deck.locator('.bio-flashcard [role=status]')).toContainText('aqueous environment');
    await card.press('Space');
    await expect(answer).toBeHidden();

    await deck.getByLabel('Review').selectOption('A1.1.2');
    await expect(position).toContainText('A1.1.2');
    await expect(position).toContainText('Card 1 of 3');
    await expect(card).toHaveAccessibleDescription(/partial charges/i);
    await expect(deck.getByRole('link',{name:'Read the lesson'})).toHaveAttribute('href','#biology/topic/A1.1/learn?understanding=A1.1.2');
    if(name==='desktop'){
     await page.emulateMedia({reducedMotion:'no-preference'});
     await card.press('ArrowRight');
     await expect(card.locator('.bio-card-face')).toHaveCSS('animation-name','bio-card-swipe-in');
    }else{
     await card.scrollIntoViewIfNeeded();
     const {x,y,width,height}=await card.boundingBox();
     const swipeY=Math.round(y+height/2);
     const moveX=[.75,.54,.31].map(relative=>Math.round(x+width*relative));
     const session=await context.newCDPSession(page);
     await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:moveX[0],y:swipeY}]});
     for(const fingerX of moveX.slice(1)){
      await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:fingerX,y:swipeY}]});
     }
     await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await expect(card.locator('.bio-card-face')).toHaveCSS('animation-name','none');
    }
    await expect(position).toContainText('Card 2 of 3');
    await expect(answer).toBeHidden();
    await card.click();
    await expect(answer).toBeVisible();
    await deck.getByRole('button',{name:'Next card'}).click();
    await expect(position).toContainText('Card 3 of 3');
    await deck.getByRole('button',{name:'Restart deck'}).click();
    await expect(position).toContainText('Card 1 of 3');
    await expect(answer).toBeHidden();
    await card.click();
    await deck.getByRole('button',{name:'Review again',exact:true}).click();
    await expect(position).toContainText('Card 2 of 3');
    const review=deck.getByRole('button',{name:'Needs review 1',exact:true});
    await review.click();
    await expect(review).toHaveAttribute('aria-pressed','true');
    await expect(position).toContainText('Card 1 of 1');
    await expect(card).toHaveAccessibleDescription(/partial charges/i);
    await card.click();
    await deck.getByRole('button',{name:'Got it',exact:true}).click();
    await expect(deck.getByRole('heading',{name:'No cards to review here'})).toBeVisible();
    await expect(deck.getByRole('button',{name:'Needs review 0',exact:true})).toBeFocused();
    await expect(deck.locator('.bio-deck-tally')).toContainText('1 marked');
    await deck.getByRole('button',{name:'Show all cards',exact:true}).click();
    await expect(position).toContainText('Card 2 of 3');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(overflow<=2,'Flashcard layout overflows at '+name);
    await page.screenshot({path:resolve(output,name+'-'+theme+'-flashcards.png'),animations:'disabled'});
   }
   const back=page.getByRole('button',{name:'LitLab home'});
   assert.equal(await back.count(),1,'BioLab header must include a clear way back to LitLab');
   await page.reload();
   await back.click();
   await page.waitForURL(/#home$/);
   await expect(page.locator('.subject-bar[data-subject="english"]')).toHaveCount(1);
   await expect(switcher.locator('a[aria-current="page"]')).toHaveText('LitLab');
   await expect(signInDialog).toHaveCount(0);
   await signIn.click();
   await expect(signInDialog).toHaveAttribute('data-auth-subject','LitLab');
   const litAccent=await signInDialog.evaluate(el=>getComputedStyle(el).getPropertyValue('--accent'));
   assert.notEqual(litAccent,bioAccent,'Sign-in accents must match the active lab');
   await page.keyboard.press('Escape');
   const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   assert(metrics.scroll<=metrics.client+2,'Return route overflows at '+name+': '+JSON.stringify(metrics));
   await visit('biology');
   await openCourseNav();
   const bioMetrics=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth
   }));
   assert(bioMetrics.scroll<=bioMetrics.client+2,'BioLab route overflows at '+name+': '+JSON.stringify(bioMetrics));
   assert.deepEqual(errors,[],'JavaScript exceptions found at '+name);
   results.push({viewport:name,theme,status:'passed',...bioMetrics});
   console.log('PASS '+name+' LitLab/BioLab switcher, theme navigation, topic, return and reflow');
  } finally {await context.close();}
 }
 console.log(JSON.stringify({result:'passed',viewports:results.length,results},null,2));
} finally {await browser.close()}
