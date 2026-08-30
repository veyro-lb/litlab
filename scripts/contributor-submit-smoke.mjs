import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const chromeCandidates=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const chromePath=chromeCandidates.find(path=>existsSync(path));
if(!chromePath)throw new Error(`No Chrome/Chromium binary found. Checked: ${chromeCandidates.join(', ')}`);

const profileDir=await mkdtemp(join(tmpdir(),'litlab-contributor-smoke-'));
const chrome=spawn(chromePath,[
  '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking',
  '--disable-component-update','--disable-default-apps','--disable-extensions','--disable-sync','--metrics-recording-only',
  '--mute-audio','--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',`--user-data-dir=${profileDir}`,'about:blank'
],{stdio:['ignore','ignore','pipe']});
const chromeExited=new Promise(resolve=>chrome.once('exit',resolve));
let stderr='';
let browserDebuggerUrl='';
chrome.stderr.on('data',chunk=>{
  const text=String(chunk);stderr+=text;if(stderr.length>16000)stderr=stderr.slice(-16000);
  const match=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)browserDebuggerUrl=match[1];
});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function pageSocket(){
  for(let attempt=0;attempt<200;attempt++){
    if(chrome.exitCode!==null)throw new Error(`Chrome exited before DevTools became ready. ${stderr}`);
    if(browserDebuggerUrl){
      const endpoint=new URL(browserDebuggerUrl);
      for(const host of [...new Set([endpoint.hostname,'127.0.0.1','localhost'])]){
        try{
          const response=await fetch(`http://${host}:${endpoint.port}/json/list`);if(!response.ok)continue;
          const targets=await response.json();
          const page=targets.find(target=>target.type==='page'&&target.webSocketDebuggerUrl)||targets.find(target=>target.webSocketDebuggerUrl);
          if(page?.webSocketDebuggerUrl)return page.webSocketDebuggerUrl;
        }catch{}
      }
    }
    await sleep(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready. ${stderr}`);
}

let ws;
try{
  ws=new WebSocket(await pageSocket());
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let nextId=0;const pending=new Map();
  ws.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));if(!message.id)return;
    const item=pending.get(message.id);if(!item)return;pending.delete(message.id);
    if(message.error)item.reject(new Error(`${item.method}: ${message.error.message}`));else item.resolve(message.result||{});
  });
  const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject,method});ws.send(JSON.stringify({id,method,params}))});
  const evaluate=async expression=>{
    const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Browser evaluation failed');
    return result.result?.value;
  };
  const waitFor=async(expression,label,timeout=12000)=>{
    const started=Date.now();
    while(Date.now()-started<timeout){if(await evaluate(expression))return;await sleep(100)}
    throw new Error(`Timed out waiting for ${label}`);
  };

  await command('Page.enable');await command('Runtime.enable');
  await command('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{
    const intendedRole=new URL(location.href).searchParams.get('submitSmokeRole');
    if(intendedRole!=='student'&&intendedRole!=='teacher')return;
    const email=intendedRole+'-smoke@example.test';
    const userId=intendedRole==='student'?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222';
    const enc=value=>btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const token=enc({alg:'none',typ:'JWT'})+'.'+enc({sub:userId,email,role:'authenticated',user_metadata:{full_name:intendedRole==='student'?'Student Smoke':'Teacher Smoke'}})+'.x';
    localStorage.setItem('litlabSupabaseSession',JSON.stringify({access_token:token,refresh_token:'smoke-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer'}));
    localStorage.removeItem('litlabContributorLastSentAt');
    window.__litlabApplicationPost=null;
    window.__litlabSavedRole=intendedRole;
    window.__litlabRoleChecks=0;
    window.__litlabRoleSets=0;
    window.__litlabClickSeen=0;
    document.addEventListener('click',event=>{if(event.target instanceof Element&&event.target.closest('#ll-contributor-form button[type="submit"]'))window.__litlabClickSeen+=1},true);
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async(input,init={})=>{
      const url=typeof input==='string'?input:input instanceof Request?input.url:String(input);
      if(!url.startsWith('https://qdqseajcukfdbfikjptu.supabase.co'))return nativeFetch(input,init);
      const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
      if(url.includes('/auth/v1/user'))return json({id:userId,email});
      if(url.includes('/rest/v1/litlab_contributor_applications')&&String(init.method||'GET').toUpperCase()==='POST'){
        try{window.__litlabApplicationPost=JSON.parse(String(init.body||'{}'))}catch{window.__litlabApplicationPost={parse_error:true}}
        return new Response('',{status:201});
      }
      if(url.includes('/rest/v1/rpc/get_my_litlab_contributor_account_role')){
        window.__litlabRoleChecks+=1;
        return json({role:window.__litlabSavedRole,is_admin:false,needs_choice:false,has_conflict:false,existing_roles:[window.__litlabSavedRole]});
      }
      if(url.includes('/rest/v1/rpc/set_my_litlab_contributor_account_role')){
        window.__litlabRoleSets+=1;
        let requested='';try{requested=JSON.parse(String(init.body||'{}')).p_role||''}catch{}
        window.__litlabSavedRole=requested;
        return json({role:requested,is_admin:false,needs_choice:false,has_conflict:false,changed:true});
      }
      if(url.includes('/rest/v1/rpc/is_litlab_admin'))return json(false);
      if(url.includes('/rest/v1/rpc/touch_litlab_session'))return new Response('',{status:204});
      if(url.includes('/rest/v1/rpc/'))return json([]);
      return json([]);
    };
  })();`});

  for(const role of ['student','teacher']){
    await command('Page.navigate',{url:new URL(`?submitSmokeRole=${role}#contribute`,base).toString()});
    await waitFor(`document.documentElement.dataset.contributorSubmitOwnerReady==='true'`,`${role} submit owner readiness`);
    await waitFor(`document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole==='${role}'`,`${role} authoritative account role`);
    await waitFor(`Boolean(document.querySelector('#ll-contributor-form'))&&!document.querySelector('#ll-contributor-form').hidden`,`${role} visible contributor form`);
    await waitFor(role==='student'?`Boolean(document.querySelector('select[name="student_supervision"]'))`:`Boolean(document.querySelector('input[name="mentee_email"]'))`,`${role} relationship fields`);

    await evaluate(`(()=>{
      const form=document.querySelector('#ll-contributor-form');
      const set=(name,value)=>{const field=form.querySelector('[name="'+name+'"]');if(!field)return;field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))};
      set('full_name','${role==='student'?'Student Smoke':'Teacher Smoke'}');set('email','${role}-smoke@example.test');
      set('topics','Paper 1 analysis and academic writing');set('contribution_idea','Create and improve a useful LitLab academic resource.');set('motivation','I want to help students with clear and accurate explanations.');
      if('${role}'==='student'){set('dp_year','dp1');set('cas_intent','no');set('student_supervision','no');set('contribution_type','content')}
      else{set('subject_taught','DP English A');set('mentee_email','student-linked@example.test');set('contribution_type','teacher-review')}
      form.querySelectorAll('input[type="checkbox"]').forEach(box=>{box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}))});
    })()`);
    await waitFor(`document.querySelector('#ll-contributor-form button[type="submit"]')?.dataset.ready==='true'`,`${role} active-field readiness`);
    await sleep(250);

    const before=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f?.querySelector('button[type="submit"]');const r=b?.getBoundingClientRect();return {nativeValid:f?.checkValidity(),hidden:f?.hidden,button:{disabled:b?.disabled,text:b?.textContent,connected:b?.isConnected,width:r?.width,height:r?.height,ready:b?.dataset.ready},status:f?.querySelector('#ll-contributor-status')?.textContent,rootRole:document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole}})()`);
    if(before?.button?.ready!=='true'||before?.hidden||before?.button?.disabled||!before?.button?.connected||!(before?.button?.width>0)||!(before?.button?.height>0))throw new Error(`${role} submit is not interactable: ${JSON.stringify(before)}`);

    const countersBefore=await evaluate(`({checks:window.__litlabRoleChecks,sets:window.__litlabRoleSets})`);
    const point=await evaluate(`(()=>{const b=document.querySelector('#ll-contributor-form button[type="submit"]');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await command('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',buttons:1,clickCount:1});
    await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',buttons:0,clickCount:1});

    try{await waitFor(`Boolean(window.__litlabApplicationPost)`,`${role} application POST`)}catch(error){
      const state=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f?.querySelector('button[type="submit"]');return {href:location.href,post:window.__litlabApplicationPost,savedRole:window.__litlabSavedRole,roleChecks:window.__litlabRoleChecks,roleSets:window.__litlabRoleSets,clickSeen:window.__litlabClickSeen,status:f?.querySelector('#ll-contributor-status')?.textContent,button:{disabled:b?.disabled,text:b?.textContent,submitting:b?.dataset.submitting,ready:b?.dataset.ready},formHidden:f?.hidden,rootRole:document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole}})()`);
      throw new Error(`${role} application POST did not occur: ${JSON.stringify(state)}; ${error instanceof Error?error.message:String(error)}`);
    }
    await waitFor(`document.querySelector('#ll-contributor-form .ll-contrib-pending-badge')?.textContent==='PENDING ADMIN REVIEW'`,`${role} pending-admin-review confirmation`);

    const result=await evaluate(`({payload:window.__litlabApplicationPost,savedRole:window.__litlabSavedRole,roleChecks:window.__litlabRoleChecks,roleSets:window.__litlabRoleSets,clickSeen:window.__litlabClickSeen,pendingText:document.querySelector('#ll-contributor-form .ll-contrib-pending-badge')?.textContent||'',thanks:Boolean(document.querySelector('#ll-contributor-form .ll-contrib-thanks'))})`);
    if(!(result.roleChecks>countersBefore.checks))throw new Error(`${role} did not re-check account role at submit time: ${JSON.stringify(result)}`);
    if(result.roleSets!==countersBefore.sets)throw new Error(`${role} unexpectedly changed an already-saved account role: ${JSON.stringify(result)}`);
    if(result.savedRole!==role||result.payload?.applicant_type!==role)throw new Error(`${role} role/payload mismatch: ${JSON.stringify(result)}`);
    if(result.pendingText!=='PENDING ADMIN REVIEW'||!result.thanks)throw new Error(`${role} missing pending confirmation: ${JSON.stringify(result)}`);
    console.log(`Contributor submit smoke passed for ${role}: real click -> application POST -> PENDING ADMIN REVIEW (nativeValid=${before.nativeValid}).`);
  }
}finally{
  try{ws?.close()}catch{}
  if(chrome.exitCode===null){chrome.kill('SIGTERM');await Promise.race([chromeExited,sleep(2000)])}
  try{await rm(profileDir,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
}
