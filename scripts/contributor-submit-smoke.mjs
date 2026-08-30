import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const base=process.env.LITLAB_PREVIEW_URL||'http://127.0.0.1:4173/';
const chromePath=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(existsSync);
if(!chromePath)throw new Error('No Chrome/Chromium binary found.');

const profileDir=await mkdtemp(join(tmpdir(),'litlab-contributor-smoke-'));
const chrome=spawn(chromePath,[
  '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking',
  '--disable-component-update','--disable-default-apps','--disable-extensions','--disable-sync','--metrics-recording-only',
  '--mute-audio','--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',`--user-data-dir=${profileDir}`,'about:blank'
],{stdio:['ignore','ignore','pipe']});
const chromeExited=new Promise(resolve=>chrome.once('exit',resolve));
let stderr='';let debuggerUrl='';
chrome.stderr.on('data',chunk=>{const text=String(chunk);stderr=(stderr+text).slice(-16000);const match=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)debuggerUrl=match[1]});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function pageSocket(){
  for(let i=0;i<200;i++){
    if(chrome.exitCode!==null)throw new Error(`Chrome exited early. ${stderr}`);
    if(debuggerUrl){
      const endpoint=new URL(debuggerUrl);
      for(const host of [...new Set([endpoint.hostname,'127.0.0.1','localhost'])]){
        try{
          const response=await fetch(`http://${host}:${endpoint.port}/json/list`);if(!response.ok)continue;
          const targets=await response.json();const page=targets.find(t=>t.type==='page'&&t.webSocketDebuggerUrl)||targets.find(t=>t.webSocketDebuggerUrl);
          if(page?.webSocketDebuggerUrl)return page.webSocketDebuggerUrl;
        }catch{}
      }
    }
    await sleep(100);
  }
  throw new Error(`DevTools did not become ready. ${stderr}`);
}

let ws;
try{
  ws=new WebSocket(await pageSocket());
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let id=0;const pending=new Map();
  ws.addEventListener('message',event=>{const msg=JSON.parse(String(event.data));if(!msg.id)return;const item=pending.get(msg.id);if(!item)return;pending.delete(msg.id);msg.error?item.reject(new Error(`${item.method}: ${msg.error.message}`)):item.resolve(msg.result||{})});
  const command=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject,method});ws.send(JSON.stringify({id:next,method,params}))});
  const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text||'Browser evaluation failed');return result.result?.value};
  const waitFor=async(expression,label,timeout=12000)=>{const start=Date.now();while(Date.now()-start<timeout){if(await evaluate(expression))return;await sleep(100)}throw new Error(`Timed out waiting for ${label}`)};

  await command('Page.enable');await command('Runtime.enable');
  await command('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{
    const role=new URL(location.href).searchParams.get('submitSmokeRole');if(role!=='student'&&role!=='teacher')return;
    const email=role+'-smoke@example.test';const userId=role==='student'?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222';
    const enc=v=>btoa(unescape(encodeURIComponent(JSON.stringify(v)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const token=enc({alg:'none',typ:'JWT'})+'.'+enc({sub:userId,email,role:'authenticated',user_metadata:{full_name:role==='student'?'Student Smoke':'Teacher Smoke'}})+'.x';
    localStorage.setItem('litlabSupabaseSession',JSON.stringify({access_token:token,refresh_token:'smoke-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer'}));localStorage.removeItem('litlabContributorLastSentAt');
    window.__litlabApplicationPost=null;window.__litlabSavedRole=role;window.__litlabRoleChecks=0;window.__litlabRoleSets=0;window.__litlabClickSeen=0;
    document.addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('#ll-contributor-form button[type="submit"]'))window.__litlabClickSeen+=1},true);
    const nativeFetch=window.fetch.bind(window);window.fetch=async(input,init={})=>{
      const url=typeof input==='string'?input:input instanceof Request?input.url:String(input);if(!url.startsWith('https://qdqseajcukfdbfikjptu.supabase.co'))return nativeFetch(input,init);
      const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
      if(url.includes('/auth/v1/user'))return json({id:userId,email});
      if(url.includes('/rest/v1/litlab_contributor_applications')&&String(init.method||'GET').toUpperCase()==='POST'){try{window.__litlabApplicationPost=JSON.parse(String(init.body||'{}'))}catch{window.__litlabApplicationPost={parse_error:true}}return new Response('',{status:201})}
      if(url.includes('/rest/v1/rpc/get_my_litlab_contributor_account_role')){window.__litlabRoleChecks+=1;return json({role:window.__litlabSavedRole,is_admin:false,needs_choice:false,has_conflict:false,existing_roles:[window.__litlabSavedRole]})}
      if(url.includes('/rest/v1/rpc/set_my_litlab_contributor_account_role')){window.__litlabRoleSets+=1;let requested='';try{requested=JSON.parse(String(init.body||'{}')).p_role||''}catch{}window.__litlabSavedRole=requested;return json({role:requested,is_admin:false,needs_choice:false,has_conflict:false,changed:true})}
      if(url.includes('/rest/v1/rpc/is_litlab_admin'))return json(false);if(url.includes('/rest/v1/rpc/touch_litlab_session'))return new Response('',{status:204});if(url.includes('/rest/v1/rpc/'))return json([]);return json([]);
    };
  })();`});

  for(const role of ['student','teacher']){
    await command('Page.navigate',{url:new URL(`?submitSmokeRole=${role}#contribute`,base).toString()});
    await waitFor(`document.documentElement.dataset.contributorSubmitOwnerReady==='true'`,`${role} submit owner`);
    await waitFor(`Boolean(document.querySelector('#ll-contributor-form'))`,`${role} form`);

    // Seed the app's cached account-role state through its own synchronization event. The submit
    // path must still call get_my_litlab_contributor_account_role again before the INSERT.
    await evaluate(`window.dispatchEvent(new CustomEvent('litlab:contributor-account-role',{detail:{role:'${role}',is_admin:false,needs_choice:false,has_conflict:false,existing_roles:['${role}']}}))`);
    await waitFor(`document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole==='${role}'`,`${role} role state`);
    await waitFor(`document.querySelector('#ll-contributor-form')?.hidden===false`,`${role} visible form`);
    await waitFor(role==='student'?`Boolean(document.querySelector('select[name="student_supervision"]'))`:`Boolean(document.querySelector('input[name="mentee_email"]'))`,`${role} relationship fields`);

    await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const set=(n,v)=>{const x=f.querySelector('[name="'+n+'"]');if(!x)return;x.value=v;x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}))};set('full_name','${role==='student'?'Student Smoke':'Teacher Smoke'}');set('email','${role}-smoke@example.test');set('topics','Paper 1 analysis and academic writing');set('contribution_idea','Create and improve a useful LitLab academic resource.');set('motivation','I want to help students with clear and accurate explanations.');if('${role}'==='student'){set('dp_year','dp1');set('cas_intent','no');set('student_supervision','no');set('contribution_type','content')}else{set('subject_taught','DP English A');set('mentee_email','student-linked@example.test');set('contribution_type','teacher-review')}f.querySelectorAll('input[type="checkbox"]').forEach(x=>{x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}))})})()`);
    await waitFor(`document.querySelector('#ll-contributor-form button[type="submit"]')?.dataset.ready==='true'`,`${role} active-field readiness`);
    await sleep(250);

    const before=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f.querySelector('button[type="submit"]');const r=b.getBoundingClientRect();return {nativeValid:f.checkValidity(),hidden:f.hidden,ready:b.dataset.ready,disabled:b.disabled,width:r.width,height:r.height,status:f.querySelector('#ll-contributor-status')?.textContent,rootRole:document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole}})()`);
    if(before.hidden||before.ready!=='true'||before.disabled||!(before.width>0)||!(before.height>0))throw new Error(`${role} submit not interactable: ${JSON.stringify(before)}`);

    const checksBefore=await evaluate(`window.__litlabRoleChecks`);
    const setsBefore=await evaluate(`window.__litlabRoleSets`);
    const point=await evaluate(`(()=>{const b=document.querySelector('#ll-contributor-form button[type="submit"]');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await command('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',buttons:1,clickCount:1});
    await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',buttons:0,clickCount:1});

    try{await waitFor(`Boolean(window.__litlabApplicationPost)`,`${role} application POST`)}catch(error){const state=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f?.querySelector('button[type="submit"]');return {href:location.href,post:window.__litlabApplicationPost,savedRole:window.__litlabSavedRole,checks:window.__litlabRoleChecks,sets:window.__litlabRoleSets,clicks:window.__litlabClickSeen,status:f?.querySelector('#ll-contributor-status')?.textContent,button:{disabled:b?.disabled,text:b?.textContent,submitting:b?.dataset.submitting,ready:b?.dataset.ready},hidden:f?.hidden,rootRole:document.getElementById('ll-contributor-root')?.dataset.contributorAccountRole}})()`);throw new Error(`${role} application POST missing: ${JSON.stringify(state)}; ${error instanceof Error?error.message:String(error)}`)}
    await waitFor(`document.querySelector('#ll-contributor-form .ll-contrib-pending-badge')?.textContent==='PENDING ADMIN REVIEW'`,`${role} pending review`);

    const result=await evaluate(`({payload:window.__litlabApplicationPost,savedRole:window.__litlabSavedRole,checks:window.__litlabRoleChecks,sets:window.__litlabRoleSets,clicks:window.__litlabClickSeen,pending:document.querySelector('#ll-contributor-form .ll-contrib-pending-badge')?.textContent,thanks:Boolean(document.querySelector('#ll-contributor-form .ll-contrib-thanks'))})`);
    if(!(result.checks>checksBefore))throw new Error(`${role} submit did not re-check role: ${JSON.stringify(result)}`);if(result.sets!==setsBefore)throw new Error(`${role} unexpectedly changed saved role: ${JSON.stringify(result)}`);if(result.savedRole!==role||result.payload?.applicant_type!==role)throw new Error(`${role} payload mismatch: ${JSON.stringify(result)}`);if(result.pending!=='PENDING ADMIN REVIEW'||!result.thanks)throw new Error(`${role} pending confirmation missing: ${JSON.stringify(result)}`);
    console.log(`Contributor submit smoke passed for ${role}: click -> role check -> POST -> PENDING ADMIN REVIEW (nativeValid=${before.nativeValid}).`);
  }
}finally{
  try{ws?.close()}catch{}if(chrome.exitCode===null){chrome.kill('SIGTERM');await Promise.race([chromeExited,sleep(2000)])}try{await rm(profileDir,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
}
