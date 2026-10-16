import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const routes=['home','start','papers','paper-1','paper-2','io','books','ee','glossary','about','essays','hl-essay','contribute','admin','admin-contributors'];
const viewports=[
  {name:'desktop',width:1440,height:1000,deviceScaleFactor:1,mobile:false},
  {name:'mobile',width:390,height:844,deviceScaleFactor:1,mobile:true}
];
const chromeCandidates=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const chromePath=chromeCandidates.find(path=>existsSync(path));
if(!chromePath)throw new Error(`No Chrome/Chromium binary found. Checked: ${chromeCandidates.join(', ')}`);

const outputDir=join(process.cwd(),'qa-artifacts');
await mkdir(outputDir,{recursive:true});
const profileDir=await mkdtemp(join(tmpdir(),'litlab-chrome-'));
const chrome=spawn(chromePath,[
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking',
  '--disable-features=ServiceWorker',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-sync',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-allow-origins=*',
  '--remote-debugging-address=127.0.0.1',
  '--remote-debugging-port=0',
  `--user-data-dir=${profileDir}`,
  'about:blank'
],{stdio:['ignore','ignore','pipe']});
const chromeExited=new Promise(resolve=>chrome.once('exit',resolve));
let chromeStderr='';
let browserDebuggerUrl='';
chrome.stderr.on('data',chunk=>{
  const text=String(chunk);
  chromeStderr+=text;
  if(chromeStderr.length>24000)chromeStderr=chromeStderr.slice(-24000);
  const match=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if(match)browserDebuggerUrl=match[1];
});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForDebugger(){
  for(let attempt=0;attempt<200;attempt++){
    if(chrome.exitCode!==null)throw new Error(`Chrome exited before DevTools became ready (code ${chrome.exitCode}). ${chromeStderr}`);
    if(browserDebuggerUrl){
      const endpoint=new URL(browserDebuggerUrl);
      const hosts=[endpoint.hostname,'127.0.0.1','localhost'];
      for(const host of [...new Set(hosts)]){
        try{
          const response=await fetch(`http://${host}:${endpoint.port}/json/list`);
          if(!response.ok)continue;
          const targets=await response.json();
          const page=targets.find(target=>target.type==='page'&&target.webSocketDebuggerUrl)||targets.find(target=>target.webSocketDebuggerUrl);
          if(page?.webSocketDebuggerUrl)return page.webSocketDebuggerUrl;
        }catch{}
      }
    }
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready after 20 seconds. ${chromeStderr}`);
}

let ws;
try{
  const websocketUrl=await waitForDebugger();
  ws=new WebSocket(websocketUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let nextId=0;
  const pending=new Map();
  const runtimeErrors=[];
  let pageLoadCount=0;
  const blockedExternal=[];
  const escapedExternal=[];
  const interceptionErrors=[];
  ws.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));
    if(message.id){
      const item=pending.get(message.id);if(!item)return;
      pending.delete(message.id);
      if(message.error)item.reject(new Error(`${item.method}: ${message.error.message}`));else item.resolve(message.result||{});
      return;
    }
    if(message.method==='Page.loadEventFired')pageLoadCount++;
    if(message.method==='Fetch.requestPaused'){
      const req=message.params?.request||{},url=req.url||'',requestId=message.params.requestId;
      const local=(()=>{try{const u=new URL(url);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port==='4173'&&!u.username&&!u.password}catch{return false}})();
      if(!local)blockedExternal.push({method:req.method||'GET',origin:(()=>{try{return new URL(url).origin}catch{return 'invalid'}})()});
      void command(local?'Fetch.continueRequest':'Fetch.failRequest',local?{requestId}:{requestId,errorReason:'BlockedByClient'}).catch(e=>interceptionErrors.push(String(e)));
    }
    if(message.method==='Network.responseReceived'){
      const url=message.params?.response?.url||'';
      if(/^https?:/.test(url)){
        const local=(()=>{try{const u=new URL(url);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port==='4173'}catch{return false}})();
        if(!local)escapedExternal.push(new URL(url).origin);
      }
    }
    if(message.method==='Runtime.exceptionThrown'){
      const detail=message.params?.exceptionDetails;
      runtimeErrors.push(detail?.exception?.description||detail?.text||'Uncaught browser exception');
    }
  });
  function command(method,params={}){
    return new Promise((resolve,reject)=>{
      const id=++nextId;pending.set(id,{resolve,reject,method});ws.send(JSON.stringify({id,method,params}));
    });
  }

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  const report=[];
  const failures=[];
  const interactions=[];
  async function evaluate(expression){
    const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'Browser evaluate failed');
    return r.result?.value;
  }
  async function check(label,fn){
    try{const value=await fn();const ok=Boolean(value);interactions.push({label,pass:ok});if(!ok)failures.push('Interaction failed: '+label);console.log((ok?'PASS ':'FAIL ')+label)}
    catch(e){interactions.push({label,pass:false,error:String(e)});failures.push('Interaction failed: '+label+' '+String(e));console.error('FAIL '+label+' '+String(e))}
  }
  await command('Network.setBypassServiceWorker',{bypass:true});
  await command('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
  const probe=await evaluate("fetch('https://example.invalid/litlab-phase16-probe',{method:'POST'}).then(()=> 'ESCAPED',()=> 'BLOCKED')");
  await check('CDP blocks external POST before opening LitLab',async()=>probe==='BLOCKED'&&blockedExternal.some(x=>x.origin==='https://example.invalid'));

  const auditExpression=`(()=>{
    const html=document.documentElement;
    const body=document.body;
    const viewportWidth=html.clientWidth;
    const scrollWidth=Math.max(html.scrollWidth,body?.scrollWidth||0);
    const overflow=scrollWidth>viewportWidth+2;
    const offenders=[];
    if(overflow){
      for(const el of document.querySelectorAll('body *')){
        if(offenders.length>=12)break;
        const style=getComputedStyle(el);
        if(style.display==='none'||style.visibility==='hidden')continue;
        const rect=el.getBoundingClientRect();
        if(rect.width<=0||rect.height<=0)continue;
        if(rect.right>viewportWidth+2||rect.left<-2){
          offenders.push({tag:el.tagName.toLowerCase(),className:String(el.className||'').slice(0,100),left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width)});
        }
      }
    }
    const main=document.querySelector('main#main,main[data-litlab-special-route-host],main[data-litlab-react-main]');
    return {
      title:document.title,
      viewportWidth,
      scrollWidth,
      overflow,
      offenders,
      hasMain:Boolean(main),
      mainTextLength:(main?.textContent||'').trim().length,
      featureLoading:html.dataset.litlabFeatureLoading||'',
      featureReady:html.dataset.litlabFeatureReady||'',
      bodyHeight:Math.round(body?.getBoundingClientRect().height||0)
    };
  })()`;

  const authExpression=`(()=>{
    const modal=document.querySelector('[data-auth-modal],.litlab-auth-modal');
    if(!modal)return {present:false};
    const dialog=modal.querySelector('.litlab-auth-dialog,[role="dialog"]')||modal;
    const r=dialog.getBoundingClientRect();
    const viewportWidth=document.documentElement.clientWidth;
    const viewportHeight=window.innerHeight;
    return {present:true,left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),viewportWidth,viewportHeight,inFrame:r.left>=-2&&r.right<=viewportWidth+2&&r.top>=-2&&r.bottom<=viewportHeight+2};
  })()`;
  const closeAuthExpression=`(()=>{const modal=document.querySelector('[data-auth-modal],.litlab-auth-modal');if(!modal)return false;const close=modal.querySelector('[data-auth-close],.litlab-auth-close,button[aria-label*="Close" i]');if(close){close.click();return true}modal.remove();return true})()`;

  for(const viewport of viewports){
    await command('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:viewport.deviceScaleFactor,mobile:viewport.mobile,screenWidth:viewport.width,screenHeight:viewport.height});
    for(const route of routes){
      runtimeErrors.length=0;
      const url=new URL(`#${route}`,base).toString();
      await command('Page.navigate',{url});
      await sleep(route==='contribute'||route.startsWith('admin')?1800:1200);

      const authResult=await command('Runtime.evaluate',{expression:authExpression,returnByValue:true});
      const auth=authResult.result?.value||{present:false};
      if(auth.present){
        const authShot=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
        const authFilename=`${route.replace(/[^a-z0-9-]/gi,'-')}-${viewport.name}-auth.png`;
        await writeFile(join(outputDir,authFilename),Buffer.from(authShot.data,'base64'));
        if(!auth.inFrame)failures.push(`${route} (${viewport.name}) sign-in dialog is outside the viewport: ${JSON.stringify(auth)}`);
        await command('Runtime.evaluate',{expression:closeAuthExpression,returnByValue:true});
        await sleep(120);
      }

      const evaluated=await command('Runtime.evaluate',{expression:auditExpression,returnByValue:true,awaitPromise:true});
      const audit=evaluated.result?.value||{};
      const screenshot=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      const filename=`${route.replace(/[^a-z0-9-]/gi,'-')}-${viewport.name}.png`;
      await writeFile(join(outputDir,filename),Buffer.from(screenshot.data,'base64'));
      const row={route,viewport:viewport.name,url,auth,...audit,runtimeErrors:[...runtimeErrors],screenshot:filename};
      report.push(row);
      if(audit.overflow)failures.push(`${route} (${viewport.name}) has horizontal document overflow: ${audit.scrollWidth}px > ${audit.viewportWidth}px`);
      if(!audit.hasMain||audit.mainTextLength<20)failures.push(`${route} (${viewport.name}) did not render a usable main surface`);
      if(audit.featureLoading)failures.push(`${route} (${viewport.name}) still reports feature bundle "${audit.featureLoading}" as loading`);
      for(const error of runtimeErrors)failures.push(`${route} (${viewport.name}) browser exception: ${error}`);
      console.log(`${viewport.name.padEnd(7)} ${route.padEnd(19)} width ${audit.viewportWidth}/${audit.scrollWidth} main ${audit.mainTextLength} chars${auth.present?' auth-ok':''}${audit.overflow?' OVERFLOW':''}`);
    }
  }


  // Interactive, synthetic-data checks running after all 30 existing desktop/mobile route checks.
  await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false,screenWidth:1440,screenHeight:1000});
  await command('Page.navigate',{url:new URL('#home',base).toString()});await sleep(1200);
  await check('Primary navigation click reaches Start Here',async()=>{
    const clicked=await evaluate("(()=>{const b=[...document.querySelectorAll('.topbar nav button')].find(x=>x.textContent.trim()==='Start Here');if(!b)return false;b.click();return true})()");
    await sleep(300);return clicked&&await evaluate("location.hash==='#start'");
  });
  await check('Browser back and forward preserve English routes',async()=>{
    await evaluate("history.back()");await sleep(350);
    const back=await evaluate("location.hash==='#home'");
    await evaluate("history.forward()");await sleep(350);
    return back&&await evaluate("location.hash==='#start'");
  });
  await command('Page.navigate',{url:new URL('#home',base).toString()});await sleep(950);
  await check('Theme toggles without breaking header',async()=>{
    const before=await evaluate("document.documentElement.dataset.theme");
    const clicked=await evaluate("(()=>{const b=document.querySelector('button[aria-label=\"Toggle theme\"]');if(!b)return false;b.click();return true})()");
    await sleep(200);const after=await evaluate("document.documentElement.dataset.theme");
    await evaluate("document.querySelector('button[aria-label=\"Toggle theme\"]')?.click()");
    return clicked&&before!==after;
  });
  await check('Search dialog opens and Escape closes it',async()=>{
    const clicked=await evaluate("(()=>{const b=document.querySelector('.search-trigger');if(!b)return false;b.click();return true})()");
    await sleep(180);
    const opened=clicked&&await evaluate("!!document.querySelector('.modal[role=dialog]')");
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await sleep(150);return opened&&!(await evaluate("!!document.querySelector('.modal[role=dialog]')"));
  });
  await command('Page.navigate',{url:new URL('#glossary',base).toString()});await sleep(1250);
  await check('Glossary accepts a search term',async()=>{
    const used=await evaluate("(()=>{const x=document.querySelector('.glossary-tools input');if(!x)return false;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'analysis');x.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
    await sleep(300);return used&&await evaluate("document.querySelectorAll('.glossary-grid details').length>0");
  });
  await command('Page.navigate',{url:new URL('#skills',base).toString()});await sleep(2300);
  const guestModalClosed=await evaluate(closeAuthExpression);
  console.log('Skills Lab guest modal dismissed: '+guestModalClosed);
  await sleep(260);
  const skillsState=await evaluate("(()=>({route:location.hash,page:!!document.querySelector('.skills-lab-page'),cards:document.querySelectorAll('.skills-tool-card').length,quiz:document.querySelectorAll('[data-quiz]').length,feature:document.documentElement.dataset.litlabFeatureReady||'',main:(document.querySelector('main#main')?.textContent||'').slice(0,120)}))()");
  console.log('Skills Lab pretest DOM: '+JSON.stringify(skillsState));
  const skillsImage=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
  await writeFile(join(outputDir,'skills-lab-desktop-diagnostic.png'),Buffer.from(skillsImage.data,'base64'));
  await check('Skills Lab practice answer clickable',async()=>{
    const open=await evaluate("(()=>{const b=document.querySelector('.skills-tool-card[data-tool=\"choices\"]');if(!b)return false;b.click();return true})()");
    // The production choice-bank enhancer replaces the legacy quiz on the next frame.
    // Wait for the actual 40-question bank, then assert its answer and explanation state.
    let ready=false;
    for(let attempt=0;attempt<40;attempt++){
      ready=await evaluate("!!document.querySelector('[data-choice-bank-root] [data-choice-option]')");
      if(ready)break;
      await sleep(100);
    }
    const clicked=ready&&await evaluate("(()=>{const b=document.querySelector('[data-choice-bank-root] [data-choice-option]');if(!b)return false;b.click();return true})()");
    const state=await evaluate("(()=>({answered:!!document.querySelector('.choice-bank-options.answered'),disabled:document.querySelectorAll('[data-choice-option]:disabled').length,explanations:document.querySelectorAll('.choice-bank-explanations article').length,nextEnabled:document.querySelector('[data-choice-next]')?.disabled===false}))()");
    console.log('Skills Lab answer DOM: '+JSON.stringify(state));
    return open&&clicked&&state.answered&&state.disabled===4&&state.explanations===4&&state.nextEnabled;
  });
  const synthetic={
    litlabDone:'["start"]',
    litlabSkillProgress:'{"completed":[],"bestScores":{}}',
    litlabLearningProfile:'{"stats":{},"recent":[],"clinicSessions":0}',
    litlabBookProfilesReviewed:'[]',
    litlabEEChecklist:'[]',
    litlabChoiceBankProgress:'{"stats":{}}'
  };
  await evaluate("(()=>{const x="+JSON.stringify(synthetic)+";for(const [k,v] of Object.entries(x))localStorage.setItem(k,v);return true})()");
  for(const route of ['home','paper-1','books','glossary','ee']){
    await command('Page.navigate',{url:new URL('#'+route,base).toString()});await sleep(700);
  }
  await check('Six English progress keys survive read-only navigation',async()=>{
    const keys=Object.keys(synthetic);
    const values=await evaluate("Object.fromEntries("+JSON.stringify(keys)+".map(k=>[k,localStorage.getItem(k)]))");
    return JSON.stringify(values)===JSON.stringify(synthetic);
  });
  await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
  await command('Page.navigate',{url:new URL('#home',base).toString()});await sleep(950);
  await check('390px mobile menu navigates to Start Here',async()=>{
    const open=await evaluate("(()=>{const b=document.querySelector('button[aria-label=\"Toggle menu\"]');if(!b)return false;b.click();return true})()");
    await sleep(130);
    const drawer=await evaluate("!!document.querySelector('.mobile-menu')");
    const click=await evaluate("(()=>{const b=[...document.querySelectorAll('.mobile-menu button')].find(x=>x.textContent.includes('Start Here'));if(!b)return false;b.click();return true})()");
    await sleep(280);return open&&drawer&&click&&await evaluate("location.hash==='#start'");
  });
  await command('Page.navigate',{url:new URL('#books',base).toString()});await sleep(1050);
  await command('Page.navigate',{url:new URL('#glossary',base).toString()});await sleep(1100);
  await check('Books to Glossary restores React-owned main',async()=>await evaluate("location.hash==='#glossary'&&!document.querySelector('main[data-litlab-special-route-host]')&&!!document.querySelector('.glossary-tools')"));

  // Phase 2 Biology uses a shadow tree owned by React, isolated from legacy enhancers.
  const bio = "document.querySelector('[data-biology-host]')?.shadowRoot";
  async function bioEval(expression){return evaluate(`(()=>{const root=${bio};if(!root)return false;return (${expression});})()`)}
  async function waitBio(){
    for(let i=0;i<50;i++){
      if(await bioEval("!!root.querySelector('.bio-app')"))return;
      await sleep(100);
    }
    throw new Error('Biology did not render');
  }
  await check('English navigation did not fetch the lazy Biology entry',async()=>await evaluate("!performance.getEntriesByType('resource').some(x=>/\\/entry-[^/]+\\.js/.test(x.name))"));
  await check('Subject switch opens Biology from English',async()=>{
    // A real guest dismisses the existing English sign-in overlay before using the switch.
    await evaluate(closeAuthExpression);
    const clicked=await evaluate("(()=>{const a=document.querySelector('.subject-navigation a[href=\"#biology\"]');if(!a)return false;a.click();return true})()");
    await waitBio();return clicked&&await bioEval("root.querySelector('h1')?.textContent.includes('Life is connected')");
  });
  await check('Biology excludes English announcements, tutoring and guest sign-in prompts',async()=>{
    await sleep(1000);
    return await evaluate("!document.querySelector('#ll-analysis-launch-notice')&&!document.querySelector('[data-auth-modal]')&&getComputedStyle(document.querySelector('.tutor-topbar-trigger')).display==='none'");
  });
  await check('Biology keyboard search stays within Biology',async()=>{
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'k',code:'KeyK',modifiers:2,windowsVirtualKeyCode:75});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'k',code:'KeyK',modifiers:2,windowsVirtualKeyCode:75});
    return await bioEval("root.activeElement?.type==='search'&&!document.querySelector('.modal[role=dialog]')");
  });
  await check('Skip link focuses content without changing subject or route',async()=>{
    await evaluate("document.querySelector('a.skip').click()");
    return await evaluate("location.hash==='#biology'&&document.activeElement?.id==='main'");
  });
  await check('SL curriculum contains exactly 34 topics and excludes six HL-only topics',async()=>await bioEval("root.querySelectorAll('[data-topic-id]').length===34&&!root.querySelector('[data-topic-id=\"A2.1\"]')&&!root.querySelector('[data-topic-id=\"D2.2\"]')"));
  await check('Higher Level includes all 40 topics',async()=>{
    await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(150);
    return await bioEval("root.querySelectorAll('[data-topic-id]').length===40&&!!root.querySelector('[data-topic-id=\"A2.1\"]')");
  });
  for(const [term,count] of [['Water',2],['Unity and diversity',9]])await check(`Curriculum search finds ${term}`,async()=>{
    await evaluate(`(()=>{const root=${bio};const x=root.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,${JSON.stringify(term)});x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await sleep(150);return await bioEval(`root.querySelectorAll('[data-topic-id]').length===${count}`);
  });
  await check('Curriculum search filters by official topic code',async()=>{
    await evaluate(`(()=>{const root=${bio};const x=root.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'A1.1');x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await sleep(180);return await bioEval("root.querySelectorAll('[data-topic-id]').length===1&&!!root.querySelector('[data-topic-id=\"A1.1\"]')");
  });
  await check('Topic link opens the Water overview with 8 HL statements',async()=>{
    await bioEval("(root.querySelector('[data-topic-id=\"A1.1\"]').click(),true)");await sleep(250);
    return await bioEval("root.querySelectorAll('[data-understanding-id]').length===8&&root.querySelector('h1')?.textContent==='Water'");
  });
  await check('SL selection hides Water additional HL statements',async()=>{
    await bioEval("(root.querySelector('input[value=SL]').click(),true)");await sleep(150);
    return await bioEval("root.querySelectorAll('[data-understanding-id]').length===6&&!root.querySelector('[data-understanding-id=\"A1.1.7\"]')");
  });
  await check('Biology history and keyboard focus follow navigation',async()=>{
    await evaluate("history.back()");await sleep(250);
    const back=await evaluate("location.hash==='#biology'");
    await evaluate("history.forward()");await sleep(250);
    const focus=await bioEval("root.activeElement?.classList.contains('bio-app')");
    return back&&focus&&await evaluate("location.hash==='#biology/topic/A1.1'");
  });
  // Exercise actual keyboard selection of the native radio group.
  await check('SL/HL control supports keyboard selection',async()=>{
    await bioEval("(root.querySelector('input[value=SL]').focus(),true)");
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
    await sleep(150);const ok=await bioEval("root.querySelector('input[value=HL]').checked&&root.querySelectorAll('[data-understanding-id]').length===8");
    await bioEval("(root.querySelector('input[value=SL]').click(),true)");return ok;
  });
  let biologyNavigation=0;
  async function waitForLoad(previous){
    for(let i=0;i<200;i++){
      if(pageLoadCount>previous)return;
      await sleep(50);
    }
    throw new Error('Page load event did not arrive');
  }
  async function freshBiologyRoute(route){
    const url=new URL('#'+route,base);
    // A unique query forces a document navigation; fragments alone reuse the old document.
    url.searchParams.set('biologyQaNavigation',String(++biologyNavigation));
    const previous=pageLoadCount;
    await command('Page.navigate',{url:url.toString()});await waitForLoad(previous);await waitBio();
    if(await evaluate('location.hash')!=='#'+route)throw new Error('Unexpected loaded route: '+await evaluate('location.hash'));
  }
  const bioRoutes=['biology','biology/theme/A','biology/theme/B','biology/theme/C','biology/theme/D','biology/topic/A1.1','biology/topic/A2.1','biology/topic/Z9.9','biology/topic/A1.99'];
  for(const viewport of viewports){
    await command('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.mobile,screenWidth:viewport.width,screenHeight:viewport.height});
    for(const route of bioRoutes){
      runtimeErrors.length=0;
      await freshBiologyRoute(route);
      if(route==='biology'){const previous=pageLoadCount;await command('Page.reload',{ignoreCache:true});await waitForLoad(previous);await waitBio();}
      await sleep(route==='biology'?1100:400);
      console.log('Biology direct route DOM: '+JSON.stringify({expected:route,hash:await evaluate('location.hash'),heading:await bioEval("root.querySelector('h1,h2')?.textContent")}));
      if(route==='biology')await check(`Direct Biology entry has no English overlays (${viewport.name})`,async()=>await evaluate("!document.querySelector('[data-auth-modal]')&&!document.querySelector('#ll-analysis-launch-notice')"));
      await evaluate(closeAuthExpression);
      await check(`Biology ${route} ${viewport.name} renders without overflow or exceptions`,async()=>{
        const audit=await bioEval("({text:root.querySelector('.bio-app')?.textContent.length,width:root.querySelector('.bio-app')?.scrollWidth,view:document.documentElement.clientWidth,title:root.querySelector('h1,h2')?.textContent})");
        return audit.text>150&&audit.width<=audit.view+2&&runtimeErrors.length===0&&await evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth+2");
      });
      if(route==='biology/topic/Z9.9'||route==='biology/topic/A1.99')await check(`Unknown Biology topic stays in Biology (${route}, ${viewport.name})`,async()=>await bioEval("!!root.querySelector('.bio-empty h1')&&root.querySelector('.bio-empty h1').textContent.includes('isn’t on this map')"));
      if(route==='biology/topic/A2.1')await check(`HL-only direct link respects SL (${viewport.name})`,async()=>await bioEval("root.querySelector('.bio-empty h2')?.textContent==='This topic is HL only'&&!root.querySelector('[data-understanding-id]')"));
      const shot=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      await writeFile(join(outputDir,route.replaceAll('/','-')+'-'+viewport.name+'.png'),Buffer.from(shot.data,'base64'));
    }
    await freshBiologyRoute('biology');await sleep(350);await evaluate(closeAuthExpression);
    await evaluate("document.querySelector('button[aria-label=\"Toggle theme\"]').click()");await sleep(220);
    await check(`Biology dark theme inherits design tokens (${viewport.name})`,async()=>await bioEval("getComputedStyle(root.querySelector('.bio-app')).getPropertyValue('--bg').trim()==='#0a0f1f'"));
    const dark=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    await writeFile(join(outputDir,'biology-dark-'+viewport.name+'.png'),Buffer.from(dark.data,'base64'));
    await evaluate("document.querySelector('button[aria-label=\"Toggle theme\"]').click()");
  }
  // Water pilot: preserve all foundation assertions above and extend the same isolated session.
  await freshBiologyRoute('biology/topic/A1.1/learn');await sleep(300);
  await check('Water draft loads directly with review gate and six SL sections',async()=>await bioEval("root.querySelector('[data-lesson-id]')?.dataset.mode==='learn'&&root.querySelectorAll('.bio-lesson-nav li').length===6&&root.querySelector('.bio-review-banner').textContent.includes('Awaiting qualified')"));
  await check('Water concept check explains incorrect and correct choices and retry',async()=>{
    await bioEval("(root.querySelector('[data-question-id=c1] input[value=b]').click(),true)");await sleep(60);
    const bad=await bioEval("root.querySelector('[data-question-id=c1] .bio-feedback')?.textContent.includes('Reconsider.')");
    await bioEval("(root.querySelector('[data-question-id=c1] .bio-actions button').click(),true)");await sleep(60);
    const reset=await bioEval("!root.querySelector('[data-question-id=c1] input:checked')");
    await bioEval("(root.querySelector('[data-question-id=c1] input[value=a]').click(),true)");await sleep(60);
    return bad&&reset&&await bioEval("root.querySelector('[data-question-id=c1] .bio-feedback')?.textContent.includes('Correct.')&&root.querySelectorAll('[data-question-id=c1] details p').length===3");
  });
  await check('Learn and Revision share section content and preserve answers',async()=>{
    await bioEval("(root.querySelector('a[href=\"#biology/topic/A1.1/revision\"]').click(),true)");await sleep(100);
    const ok=await bioEval("root.querySelector('[data-mode=revision]')&&root.querySelector('[data-question-id=c1] input[value=a]').checked&&root.querySelector('.bio-takeaway').textContent.includes('Early cells')");
    await bioEval("(root.querySelector('a[href=\"#biology/topic/A1.1/learn\"]').click(),true)");await sleep(100);return ok;
  });
  await check('Recall reveal and hide works',async()=>{
    await bioEval("(root.querySelector('.bio-recall button').click(),true)");await sleep(50);
    const shown=await bioEval("root.querySelector('.bio-recall button').getAttribute('aria-expanded')==='true'&&!!root.querySelector('.bio-recall p')");
    await bioEval("(root.querySelector('.bio-recall button').click(),true)");await sleep(50);return shown&&await bioEval("!root.querySelector('.bio-recall p')");
  });
  await check('All eight understanding sections render only in HL and figures load',async()=>{
    await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(100);
    const seen=[];
    for(let i=0;i<8;i++){
      await bioEval(`(root.querySelectorAll('.bio-lesson-nav button')[${i}].click(),true)`);await sleep(100);
      seen.push(await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId"));
      await bioEval("(root.querySelectorAll('.bio-figure img').forEach(x=>{x.loading='eager'}),true)");
      for(let j=0;j<30;j++){if(await bioEval("[...root.querySelectorAll('.bio-figure img')].every(x=>x.complete&&x.naturalWidth>0)"))break;await sleep(80)}
      if(!await bioEval("[...root.querySelectorAll('.bio-figure img')].every(x=>x.complete&&x.naturalWidth>0)"))return false;
    }
    return seen.join(',')===Array.from({length:8},(_,i)=>'A1.1.'+(i+1)).join(',')&&await bioEval("root.querySelectorAll('.bio-lesson-nav li').length===8");
  });
  await check('SL excludes HL section while retaining hidden study state for return to HL',async()=>{
    await bioEval("(root.querySelector('[data-question-id=c8] input[value=a]').click(),true)");await sleep(50);
    await bioEval("(root.querySelector('input[value=SL]').click(),true)");await sleep(70);
    const hidden=await bioEval("root.querySelectorAll('.bio-lesson-nav li').length===6&&!root.querySelector('[data-level=HL]')&&!root.querySelector('[data-question-id=c8]')");
    await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(70);
    return hidden&&await bioEval("root.querySelector('[data-question-id=c8] input[value=a]').checked");
  });
  await check('Molecule explorer and hidden-label recall give explanations',async()=>{
    await bioEval("(root.querySelectorAll('.bio-lesson-nav button')[1].click(),true)");await sleep(80);
    await bioEval("(root.querySelectorAll('.bio-explorer button')[3].click(),true)");await sleep(70);
    const explanation=await bioEval("root.querySelector('.bio-explorer [role=status]').textContent.includes('different molecules')");
    await bioEval("(root.querySelector('.bio-lesson-content>.bio-actions button').click(),true)");await sleep(70);
    const hidden=await bioEval("root.querySelector('[data-asset-id=bonding] img').src.includes('-recall.svg')");
    await bioEval("(root.querySelector('.bio-lesson-content>.bio-actions button').click(),true)");await sleep(60);
    return explanation&&hidden&&await bioEval("!root.querySelector('[data-asset-id=bonding] img').src.includes('-recall.svg')");
  });
  await check('Lesson section navigation supports keyboard activation',async()=>{
    await bioEval("(root.querySelectorAll('.bio-lesson-nav button')[2].focus(),true)");
    console.log('Water keyboard before: '+JSON.stringify(await bioEval("({active:root.activeElement?.outerHTML,section:root.querySelector('.bio-lesson-content').dataset.understandingId,focused:document.hasFocus()})")));
    await command('Page.bringToFront');
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(160);
    console.log('Water keyboard after: '+JSON.stringify(await bioEval("({active:root.activeElement?.outerHTML?.slice(0,250),section:root.querySelector('.bio-lesson-content').dataset.understandingId,focused:document.hasFocus()})")));
    return await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.3'&&root.activeElement.classList.contains('bio-lesson-content')");
  });
  await check('Practice filters SL questions, explains all distractors and reviews errors',async()=>{
    await bioEval("(root.querySelector('input[value=SL]').click(),true)");
    await evaluate("location.hash='biology/topic/A1.1/practice'");await sleep(120);
    const scope=await bioEval("root.querySelectorAll('.bio-practice-choice').length===8&&root.querySelectorAll('.bio-written').length===4&&!root.querySelector('[data-question-id=p1a-7]')&&!root.querySelector('[data-question-id=p2-3]')");
    await bioEval("(root.querySelector('[data-question-id=p1a-1] input[value=b]').click(),true)");await sleep(70);
    const feedback=await bioEval("root.querySelector('[data-question-id=p1a-1] .bio-feedback').textContent.includes('Reconsider.')&&root.querySelectorAll('[data-question-id=p1a-1] details p').length===4");
    await bioEval("(root.querySelector('.bio-practice>button').click(),true)");await sleep(60);
    const filtered=await bioEval("root.querySelectorAll('.bio-practice-choice').length===1&&!root.querySelector('.bio-written')");
    await bioEval("(root.querySelector('.bio-practice>button').click(),true)");return scope&&feedback&&filtered;
  });
  await check('Written practice keeps drafts across modes without awarding a score',async()=>{
    await evaluate(`(()=>{const root=${bio},x=root.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(x,'My synthetic explanation');x.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(60);
    await evaluate("location.hash='biology/topic/A1.1/revision'");await sleep(60);await evaluate("location.hash='biology/topic/A1.1/practice'");await sleep(70);
    const saved=await bioEval("root.querySelector('textarea').value==='My synthetic explanation'");
    await bioEval("(root.querySelector('.bio-written>button').click(),true)");await sleep(60);
    return saved&&await bioEval("root.querySelector('.bio-written .bio-feedback').textContent.includes('No automatic written-response mark')");
  });
  await check('HL practice contains 10 choices and all five written tasks',async()=>{
    await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(70);
    return await bioEval("root.querySelectorAll('.bio-practice-choice').length===10&&root.querySelectorAll('.bio-written').length===5");
  });
  await check('Source register contains provenance and human-review limits',async()=>{
    await evaluate("location.hash='biology/topic/A1.1/sources'");await sleep(90);
    return await bioEval("root.querySelector('.bio-sources').textContent.includes('Qualified reviewer: not yet assigned')&&root.querySelector('.bio-sources').textContent.includes('NOAA')&&root.querySelector('.bio-sources').textContent.includes('NASA')&&root.querySelectorAll('.bio-sources details').length===8");
  });
  await check('Reviewing a wrong answer returns to its explanation',async()=>{
    await evaluate("location.hash='biology/topic/A1.1/practice'");await sleep(80);
    await bioEval("(root.querySelectorAll('[data-question-id=p1a-1] .bio-actions button')[1].click(),true)");await sleep(80);
    return await bioEval("root.querySelector('[data-mode=learn]')&&root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.1'");
  });
  await check('Study state survives Biology/English route unmount',async()=>{
    await evaluate("location.hash='home'");await sleep(200);await evaluate("location.hash='biology/topic/A1.1/practice'");await waitBio();await sleep(130);
    return await bioEval("root.querySelector('textarea').value==='My synthetic explanation'&&root.querySelector('[data-question-id=p1a-1] input[value=b]').checked");
  });
  await check('Lesson mode browser history follows native links',async()=>{
    await bioEval("(root.querySelector('a[href=\"#biology/topic/A1.1/revision\"]').click(),true)");await sleep(70);await evaluate('history.back()');await sleep(80);
    const back=await bioEval("!!root.querySelector('[data-mode=practice]')");await evaluate('history.forward()');await sleep(80);return back&&await bioEval("!!root.querySelector('[data-mode=revision]')");
  });
  await check('Missing scientific image retains its nonvisual explanation',async()=>{
    await evaluate("location.hash='biology/topic/A1.1/learn'");await sleep(70);
    await bioEval("(root.querySelectorAll('.bio-lesson-nav button')[1].click(),true)");await sleep(70);
    await bioEval("(root.querySelectorAll('.bio-figure source').forEach(x=>x.remove()),root.querySelector('.bio-figure img').src='/biology/water/nonexistent-qa.svg',true)");await sleep(200);
    return await bioEval("!!root.querySelector('.bio-image-fallback')&&root.querySelector('.bio-figure figcaption').textContent.includes('Solid O–H')");
  });
  // Fresh documents intentionally clear ephemeral study data. Capture the actual routes and figures.
  for(const viewport of viewports){
    await command('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.mobile,screenWidth:viewport.width,screenHeight:viewport.height});
    for(const mode of ['learn','revision','practice','sources']){
      runtimeErrors.length=0;await freshBiologyRoute('biology/topic/A1.1/'+mode);await sleep(180);
      await check(`Fresh Water ${mode} ${viewport.name} has correct mode and no overflow`,async()=>await bioEval(`root.querySelector('[data-mode=${mode}]')&&root.querySelector('.bio-app').scrollWidth<=document.documentElement.clientWidth+2` )&&await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2')&&runtimeErrors.length===0);
      await evaluate("window.scrollTo({top:0,left:0,behavior:'instant'})");await sleep(80);
      const modeShot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await writeFile(join(outputDir,`water-${mode}-entry-${viewport.name}.png`),Buffer.from(modeShot.data,'base64'));
    }
    await freshBiologyRoute('biology/topic/A1.1/learn');await sleep(130);
    await bioEval("(root.querySelectorAll('.bio-lesson-nav button')[1].click(),true)");await sleep(100);
    await bioEval("(root.querySelectorAll('.bio-figure img').forEach(x=>x.loading='eager'),true)");await sleep(200);
    await evaluate("window.scrollTo({top:0,left:0,behavior:'instant'})");await sleep(120);
    const full=await command('Page.getLayoutMetrics');
    const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:viewport.width,height:full.cssContentSize.height,scale:1}});
    await writeFile(join(outputDir,'water-learn-'+viewport.name+'.png'),Buffer.from(shot.data,'base64'));
    if(viewport.mobile)await check('Water navigation responds to touch',async()=>{
      await bioEval("(root.querySelectorAll('.bio-lesson-nav button')[3].scrollIntoView({block:'center',behavior:'instant'}),true)");await sleep(50);
      const pt=await bioEval("(()=>{const r=root.querySelectorAll('.bio-lesson-nav button')[3].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
      await command('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      console.log('Water touch point: '+JSON.stringify(pt));
      await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[pt]});await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(180);
      console.log('Water touch after: '+JSON.stringify(await bioEval("({section:root.querySelector('.bio-lesson-content').dataset.understandingId,scrollY:window.scrollY})")));
      await command('Emulation.setTouchEmulationEnabled',{enabled:false});
      return await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.4'");
    });
    await evaluate("document.querySelector('button[aria-label=\"Toggle theme\"]').click()");await sleep(80);
    await check(`Water dark theme ${viewport.name} renders legible content tokens`,async()=>await bioEval("getComputedStyle(root.querySelector('.bio-app')).getPropertyValue('--bg').trim()==='#0a0f1f'&&!!root.querySelector('.bio-lesson-content h2')"));
    const dark=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(join(outputDir,'water-dark-'+viewport.name+'.png'),Buffer.from(dark.data,'base64'));
    await evaluate("document.querySelector('button[aria-label=\"Toggle theme\"]').click()");
    await bioEval("(root.querySelector('input[value=SL]').click(),true)");
  }
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:844,deviceScaleFactor:1,mobile:true});
  await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await freshBiologyRoute('biology/topic/A1.1/learn');await sleep(100);
  await check('Water reflows at 320px and respects reduced-motion media',async()=>await bioEval("root.querySelector('.bio-app').scrollWidth<=320&&document.documentElement.scrollWidth<=320&&getComputedStyle(root.querySelector('.bio-mode-nav a')).transitionDuration==='0s'"));
  await command('Emulation.setEmulatedMedia',{features:[]});
  // Phase 3.1: registry titles, understanding deep links and responsive scientific canvases.
  const expectedWater=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8')).find(t=>t.id==='A1.1').understandings;
  async function waitLesson(){for(let i=0;i<50;i++){if(await bioEval("!!root.querySelector('[data-lesson-id]')"))return;await sleep(80)}throw new Error('Lesson chunk did not load')}
  await freshBiologyRoute('biology/topic/A1.1/learn');await waitLesson();
  await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(70);
  for(const mode of ['learn','revision']){
    await evaluate(`location.hash='biology/topic/A1.1/${mode}'`);await sleep(100);
    for(let i=0;i<8;i++)await check(`Numbered ${mode} ${expectedWater[i].id} heading and navigation agree`,async()=>{
      await bioEval(`(root.querySelectorAll('.bio-lesson-nav button')[${i}].click(),true)`);await sleep(100);
      const row=await bioEval("(()=>{const s=root.querySelector('.bio-lesson-content'),b=root.querySelector('.bio-lesson-nav [aria-current=step]');return {id:s.dataset.understandingId,heading:s.querySelector('h2').textContent.trim(),navigation:b.querySelector('.bio-understanding-label').textContent.trim(),size:parseFloat(getComputedStyle(b.querySelector('b')).fontSize)}})()");
      return row.id===expectedWater[i].id&&row.heading===`${expectedWater[i].id} — ${expectedWater[i].studentTitle}`&&row.heading===row.navigation&&row.size>=12;
    });
  }
  await check('Understanding deep link survives a fresh document and opens the requested section',async()=>{
    await freshBiologyRoute('biology/topic/A1.1/learn?understanding=A1.1.5');await waitLesson();await sleep(120);
    return await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.5'");
  });
  await check('Previous and next use official understanding links',async()=>{
    await bioEval("(root.querySelector('.bio-section-controls button').click(),true)");await sleep(120);
    const previous=await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.4'");
    await bioEval("(root.querySelectorAll('.bio-section-controls button')[1].click(),true)");await sleep(120);
    return previous&&await bioEval("root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.5'")&&(await evaluate('location.hash')).includes('understanding=A1.1.5');
  });
  await check('Targeted revision and explanation retain the same understanding',async()=>{
    await bioEval("(root.querySelector('.bio-related-study a').click(),true)");await sleep(130);
    const revision=await bioEval("root.querySelector('[data-mode=revision]')&&root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.5'");
    await bioEval("(root.querySelector('.bio-related-study a').click(),true)");await sleep(130);
    return revision&&await bioEval("root.querySelector('[data-mode=learn]')&&root.querySelector('.bio-lesson-content').dataset.understandingId==='A1.1.5'");
  });
  await check('Targeted practice displays only questions mapped to that understanding',async()=>{
    await bioEval("(root.querySelectorAll('.bio-related-study a')[1].click(),true)");await sleep(130);
    return await bioEval("!!root.querySelector('.bio-practice-target')&&root.querySelectorAll('.bio-practice-choice').length===1&&[...root.querySelectorAll('.bio-question-syllabus')].every(x=>x.textContent.includes('A1.1.5'))");
  });
  await check('Direct HL understanding never leaks into SL study',async()=>{
    await freshBiologyRoute('biology/topic/A1.1/learn?understanding=A1.1.8');await waitLesson();await bioEval("(root.querySelector('input[value=SL]').click(),true)");await sleep(120);
    return await bioEval("root.querySelector('.bio-lesson-content').dataset.level==='shared'&&!root.querySelector('[data-syllabus-id=\"A1.1.8\"]')");
  });
  // Capture all eight actual sections and figures in both target widths. Human visual review follows.
  for(const width of [320,390,768,1440]){
    const mobile=width<768;await command('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile,screenWidth:width,screenHeight:1000});
    await freshBiologyRoute('biology/topic/A1.1');await sleep(120);await bioEval("(root.querySelector('input[value=HL]').click(),true)");await sleep(80);
    await check(`Numbered topic overview ${width}px lists all registry titles`,async()=>await bioEval("root.querySelectorAll('.bio-statement-list h3 [data-syllabus-id]').length===8&&root.querySelector('.bio-app').scrollWidth<=document.documentElement.clientWidth+2"));
    await evaluate("window.scrollTo({top:0,behavior:'instant'})");await sleep(70);
    let shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(outputDir,`phase31-overview-${width}.png`),Buffer.from(shot.data,'base64'));
    await freshBiologyRoute('biology/topic/A1.1/learn?understanding=A1.1.2');await waitLesson();await sleep(100);
    await check(`Numbered navigation and teaching reflow at ${width}px`,async()=>await bioEval("root.querySelector('.bio-app').scrollWidth<=document.documentElement.clientWidth+2&&document.documentElement.scrollWidth<=document.documentElement.clientWidth+2&&parseFloat(getComputedStyle(root.querySelector('.bio-lesson-content h2 b')).fontSize)>=16"));
    if(mobile)await check(`Mobile contents collapse and keyboard reopening at ${width}px`,async()=>{
      await bioEval("(root.querySelector('.bio-toc summary').click(),true)");await sleep(50);const closed=await bioEval("!root.querySelector('.bio-toc').open");
      await command('Page.bringToFront');await bioEval("(root.querySelector('.bio-toc summary').focus(),true)");console.log('TOC before '+JSON.stringify(await bioEval("({open:root.querySelector('.bio-toc').open,focused:document.hasFocus(),active:root.activeElement?.outerHTML})")));await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(80);
      console.log('TOC after '+JSON.stringify(await bioEval("({closedBeforeKey:true,open:root.querySelector('.bio-toc').open,focused:document.hasFocus(),active:root.activeElement?.outerHTML})")));return closed&&await bioEval("root.querySelector('.bio-toc').open");
    });
    for(const mode of ['learn','revision']){
      await evaluate(`location.hash='biology/topic/A1.1/${mode}?understanding=A1.1.2'`);await sleep(120);
      await evaluate("window.scrollTo({top:0,behavior:'instant'})");await sleep(70);
      shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(outputDir,`phase31-${mode}-${width}.png`),Buffer.from(shot.data,'base64'));
    }
    if(width===390||width===1440)for(let i=0;i<8;i++){
      await evaluate(`location.hash='biology/topic/A1.1/learn?understanding=${expectedWater[i].id}'`);await sleep(120);
      await bioEval("(root.querySelectorAll('.bio-figure img').forEach(x=>x.loading='eager'),true)");
      for(let j=0;j<30;j++){if(await bioEval("[...root.querySelectorAll('.bio-figure img')].every(x=>x.complete&&x.naturalWidth>0)"))break;await sleep(80)}
      await check(`Scientific figures ${expectedWater[i].id} load at ${width}px with readable alternative`,async()=>await bioEval("[...root.querySelectorAll('.bio-figure img')].every(x=>x.complete&&x.naturalWidth>0&&x.alt.length>40)&&root.querySelector('.bio-lesson-content h2').getBoundingClientRect().top>=65"));
      await evaluate("window.scrollTo({top:0,behavior:'instant'})");await sleep(70);shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(outputDir,`phase31-section-${i+1}-${width}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  // Phase 3.2: the first two real drafted subjects, incl. 320px, SL/HL boundary and screenshots.
  const batchTopics=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8')).filter(t=>t.id==='B1.1'||t.id==='B1.2');
  for(const width of [320,390,768,1440]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:width===1440?1000:844,deviceScaleFactor:1,mobile:width<=390,screenWidth:width,screenHeight:width===1440?1000:844});
    for(const t of batchTopics)for(const level of ['SL','HL']){
      await freshBiologyRoute('biology/topic/'+t.id+'/learn');await waitLesson();
      await bioEval("(root.querySelector('input[value="+level+"]')?.click(),true)");await sleep(100);
      const count=t.understandings.filter(x=>level==='HL'||x.level==='shared').length;
      await check('Batch '+t.id+' '+level+' '+width+'px syllabus navigation',async()=>{
        const result=await bioEval("(()=>{const n=root.querySelectorAll('.bio-lesson-nav button').length;const content=root.querySelector('.bio-lesson-content');const vw=window.innerWidth;return {n,id:content?.dataset.understandingId,overflow:document.documentElement.scrollWidth>vw+2}})()");
        return result?.n===count&&!result.overflow&&result.id===t.id+'.1';
      });
      await check('Batch '+t.id+' '+level+' '+width+'px Learn teaching check',async()=>await bioEval("!!root.querySelector('.bio-teaching-block h3')&&!!root.querySelector('.bio-recall-group')&&!!root.querySelector('.bio-misconception')"));
      if(width===390||width===1440){
        await evaluate("window.scrollTo({top:0,behavior:'instant'})");await sleep(85);
        const capture=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
        await writeFile(join(outputDir,'phase32-'+t.id+'-'+level+'-learn-'+width+'.png'),Buffer.from(capture.data,'base64'));
        if(t.id==='B1.2'&&level==='HL'){
          await evaluate("location.hash='biology/topic/B1.2/learn?understanding=B1.2.12'");await sleep(130);
          await check('Additional HL protein interaction and figure load '+width,async()=>{
            await bioEval("(root.querySelectorAll('.bio-figure img').forEach(x=>x.loading='eager'),true)");
            for(let wait=0;wait<24;wait++){if(await bioEval("[...root.querySelectorAll('.bio-figure img')].every(x=>x.complete&&x.naturalWidth>0)"))break;await sleep(80);}
            return await bioEval("root.querySelector('.bio-lesson-content')?.dataset.understandingId==='B1.2.12'&&[...root.querySelectorAll('.bio-figure img')].some(x=>x.complete&&x.naturalWidth>0&&x.alt.length>70)");
          });
          const advanced=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
          await writeFile(join(outputDir,'phase32-B1.2-HL-structure-'+width+'.png'),Buffer.from(advanced.data,'base64'));
        }
      }
      await evaluate("location.hash='biology/topic/"+t.id+"/practice'");await sleep(125);
      await check('Batch '+t.id+' '+level+' practice obeys syllabus boundary',async()=>await bioEval("root.querySelectorAll('.bio-practice-choice').length==="+count));
    }
  }

  // Test the actual reasoning gate, incorrect feedback and a valid prediction at two screen sizes.
  for(const width of [390,1440]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1000,deviceScaleFactor:1,mobile:width===390,screenWidth:width,screenHeight:width===390?844:1000});
    for(const topicId of ['B1.1','B1.2']){
      await freshBiologyRoute('biology/topic/'+topicId+'/learn?understanding='+topicId+'.2');await waitLesson();
      await bioEval("(root.querySelector('input[value=SL]')?.click(),true)");await sleep(120);
      await check('Mechanism '+topicId+' '+width+' has three valid stages',async()=>await bioEval("root.querySelector('.bio-mechanism')?.textContent.includes('STEP 1 OF 3')===true"));
      const slug=topicId==='B1.1'?'carbohydrates-lipids':'proteins';
      const lessonData=JSON.parse(await readFile(new URL('../src/biology/learning/'+slug+'/lesson.json',import.meta.url),'utf8'));
      const firstOptions=lessonData.sections[1].mechanismChallenge.stages[0].options;
      const wrongIndex=firstOptions.findIndex(x=>!x.correct),rightIndex=firstOptions.findIndex(x=>x.correct);
      await bioEval("(root.querySelectorAll('.bio-mechanism-choices button')["+wrongIndex+"].click(),true)");await sleep(70);
      await check('Mechanism '+topicId+' '+width+' explains incorrect prediction and gates progress',async()=>await bioEval("root.querySelector('.bio-mechanism-feedback')?.textContent.includes('Try again')&&root.querySelector('.bio-mechanism-next').disabled"));
      await bioEval("(root.querySelectorAll('.bio-mechanism-choices button')["+rightIndex+"].click(),true)");await sleep(80);
      await check('Mechanism '+topicId+' '+width+' unlocks next step after correct prediction',async()=>await bioEval("root.querySelector('.bio-mechanism-feedback')?.textContent.includes('Correct prediction')&&!root.querySelector('.bio-mechanism-next').disabled"));
      const pic=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
      await writeFile(join(outputDir,'phase32-mechanism-'+topicId+'-'+width+'.png'),Buffer.from(pic.data,'base64'));
      await bioEval("(root.querySelector('.bio-mechanism-next').click(),true)");await sleep(70);
      await check('Mechanism '+topicId+' '+width+' advances only after correct answer',async()=>await bioEval("root.querySelector('.bio-mechanism')?.textContent.includes('STEP 2 OF 3')===true"));
    }
  }

  await check('Biology dashboard does not request the lazy lesson body',async()=>{await freshBiologyRoute('biology');await sleep(100);return await evaluate("!performance.getEntriesByType('resource').some(x=>/\\/assets\\/lesson-[^/]+\\.js/.test(x.name))")});
  await check('Biology assets retain original figures and add narrow scientific canvases',async()=>{
    await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await freshBiologyRoute('biology/topic/A1.1/learn?understanding=A1.1.2');await waitLesson();await sleep(150);
    return await bioEval("root.querySelector('.bio-figure img').currentSrc.includes('bonding-mobile.svg')");
  });
  await check('Water lessons preserve all six English progress values',async()=>{
    const values=await evaluate("Object.fromEntries("+JSON.stringify(Object.keys(synthetic))+".map(k=>[k,localStorage.getItem(k)]))");return JSON.stringify(values)===JSON.stringify(synthetic);
  });
  await check('Water study writes neither cloud progress nor local progress',async()=>await evaluate("localStorage.getItem('litlab:biology:progress:v1')===null"));
  await check('Biology browsing preserves all six English progress values',async()=>{
    const values=await evaluate("Object.fromEntries("+JSON.stringify(Object.keys(synthetic))+".map(k=>[k,localStorage.getItem(k)]))");
    return JSON.stringify(values)===JSON.stringify(synthetic);
  });
  await check('Biology does not create fabricated progress',async()=>await evaluate("localStorage.getItem('litlab:biology:progress:v1')===null"));
  await check('Subject switch returns to English after Biology',async()=>{
    await evaluate("document.querySelector('.subject-navigation a[href=\"#home\"]').click()");await sleep(400);
    return await evaluate("location.hash==='#home'&&!!document.querySelector('.home-hero')&&!document.querySelector('[data-biology-host]')");
  });
  await check('No external response bypassed interception',async()=>escapedExternal.length===0&&interceptionErrors.length===0);
  await writeFile(join(outputDir,'phase16-interaction-report.json'),JSON.stringify({interactions,blockedExternal,escapedExternal,interceptionErrors,failures},null,2));
  console.log('Phase 1.6 interactions: '+interactions.filter(x=>x.pass).length+'/'+interactions.length+' passed; '+blockedExternal.length+' external requests blocked');

  await writeFile(join(outputDir,'browser-smoke-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),base,report,failures},null,2));
  if(failures.length){
    console.error('\nBrowser smoke audit failed:\n');
    failures.forEach(failure=>console.error(`- ${failure}`));
    process.exitCode=1;
  }else console.log(`\nBrowser smoke audit passed: ${report.length} desktop/mobile route renders checked.`);
}finally{
  try{ws?.close()}catch{}
  if(chrome.exitCode===null){
    chrome.kill('SIGTERM');
    await Promise.race([chromeExited,sleep(2000)]);
  }
  try{
    await rm(profileDir,{recursive:true,force:true,maxRetries:6,retryDelay:150});
  }catch(error){
    console.warn(`Visual QA completed, but Chrome profile cleanup was skipped: ${error instanceof Error?error.message:String(error)}`);
  }
}
