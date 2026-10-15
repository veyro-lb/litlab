import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
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
    await sleep(220);
    const clicked=await evaluate("(()=>{const b=document.querySelector('[data-quiz]');if(!b)return false;b.click();return true})()");
    const state=await evaluate("(()=>({cards:document.querySelectorAll('.skills-tool-card').length,answered:!!document.querySelector('.practice-options.answered'),feedback:document.querySelector('.practice-feedback')?.textContent?.slice(0,80)||''}))()");
    console.log('Skills Lab answer DOM: '+JSON.stringify(state));
    return open&&clicked&&state.answered;
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
