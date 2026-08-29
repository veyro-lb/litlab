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
const port=9229;
const chrome=spawn(chromePath,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  `--remote-debugging-port=${port}`,`--user-data-dir=${profileDir}`,'about:blank'
],{stdio:['ignore','ignore','pipe']});
let chromeStderr='';
chrome.stderr.on('data',chunk=>{chromeStderr+=String(chunk);if(chromeStderr.length>12000)chromeStderr=chromeStderr.slice(-12000)});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForDebugger(){
  for(let attempt=0;attempt<50;attempt++){
    try{const response=await fetch(`http://127.0.0.1:${port}/json/list`);if(response.ok){const targets=await response.json();if(targets[0]?.webSocketDebuggerUrl)return targets[0].webSocketDebuggerUrl}}catch{}
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready. ${chromeStderr}`);
}

const websocketUrl=await waitForDebugger();
const ws=new WebSocket(websocketUrl);
await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map();
const runtimeErrors=[];
ws.addEventListener('message',event=>{
  const message=JSON.parse(String(event.data));
  if(message.id){
    const item=pending.get(message.id);if(!item)return;
    pending.delete(message.id);
    if(message.error)item.reject(new Error(`${item.method}: ${message.error.message}`));else item.resolve(message.result||{});
    return;
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

try{
  for(const viewport of viewports){
    await command('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:viewport.deviceScaleFactor,mobile:viewport.mobile,screenWidth:viewport.width,screenHeight:viewport.height});
    for(const route of routes){
      runtimeErrors.length=0;
      const url=new URL(`#${route}`,base).toString();
      await command('Page.navigate',{url});
      await sleep(route==='contribute'||route.startsWith('admin')?1800:1200);
      const evaluated=await command('Runtime.evaluate',{expression:auditExpression,returnByValue:true,awaitPromise:true});
      const audit=evaluated.result?.value||{};
      const screenshot=await command('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      const filename=`${route.replace(/[^a-z0-9-]/gi,'-')}-${viewport.name}.png`;
      await writeFile(join(outputDir,filename),Buffer.from(screenshot.data,'base64'));
      const row={route,viewport:viewport.name,url,...audit,runtimeErrors:[...runtimeErrors],screenshot:filename};
      report.push(row);
      if(audit.overflow)failures.push(`${route} (${viewport.name}) has horizontal document overflow: ${audit.scrollWidth}px > ${audit.viewportWidth}px`);
      if(!audit.hasMain||audit.mainTextLength<20)failures.push(`${route} (${viewport.name}) did not render a usable main surface`);
      if(audit.featureLoading)failures.push(`${route} (${viewport.name}) still reports feature bundle "${audit.featureLoading}" as loading`);
      for(const error of runtimeErrors)failures.push(`${route} (${viewport.name}) browser exception: ${error}`);
      console.log(`${viewport.name.padEnd(7)} ${route.padEnd(19)} width ${audit.viewportWidth}/${audit.scrollWidth} main ${audit.mainTextLength} chars${audit.overflow?' OVERFLOW':''}`);
    }
  }
}finally{
  await writeFile(join(outputDir,'browser-smoke-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),base,report,failures},null,2));
  ws.close();
  chrome.kill('SIGTERM');
  await rm(profileDir,{recursive:true,force:true});
}

if(failures.length){
  console.error('\nBrowser smoke audit failed:\n');
  failures.forEach(failure=>console.error(`- ${failure}`));
  process.exitCode=1;
}else console.log(`\nBrowser smoke audit passed: ${report.length} desktop/mobile route renders checked.`);
