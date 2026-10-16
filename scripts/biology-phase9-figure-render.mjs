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


  const slugs=['membranes-transport','organelles-compartmentalization','cell-specialization','cell-structure'];
  const manifest=[],bounds=[];
  for(const slug of slugs){
    const lesson=JSON.parse(await readFile(new URL('../src/biology/learning/'+slug+'/lesson.json',import.meta.url),'utf8'));
    for(const asset of lesson.assets)for(const variant of ['src','recallSrc']){
      const source=asset[variant];if(!source)continue;
      const svg=await readFile(new URL('../public'+source,import.meta.url),'utf8');
      for(const width of [320,650]){
        const view=svg.match(/viewBox="[^"]*?([\d.]+) ([\d.]+)"/);if(!view)throw new Error('viewBox '+source);
        const height=Math.ceil(width*Number(view[2])/Number(view[1]));
        await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
        await evaluate(`(document.open(),document.write(${JSON.stringify('<!doctype html><html><body style="margin:0;background:white">'+svg.replace('<svg ','<svg style="display:block;width:100%;height:auto" ')+'</body></html>')}),document.close(),true)`);
        await sleep(20);
        const audit=await evaluate(`(()=>{const svg=document.querySelector('svg'),v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height}}).filter(b=>b.x<0||b.y<0||b.right>v.width||b.bottom>v.height)})()`);
        if(width===650)bounds.push({source,clipped:audit});
        const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
        const file=`phase9-figure-${slug}-${source.split('/').pop().replace('.svg','')}-${width}.png`;
        await writeFile(join(outputDir,file),Buffer.from(shot.data,'base64'));manifest.push({source,width,file});
      }
    }
  }
  await writeFile(join(outputDir,'phase9-figure-manifest.json'),JSON.stringify({manifest,bounds},null,2));
  console.log('Rendered '+manifest.length+' figure views; clipped text in '+bounds.filter(x=>x.clipped.length).length+' files.');
  console.log(JSON.stringify(bounds.filter(x=>x.clipped.length)));
  if(bounds.some(x=>x.clipped.length))process.exitCode=1;
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
