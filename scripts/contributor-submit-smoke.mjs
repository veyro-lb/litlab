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
async function waitForDebugger(){
  for(let attempt=0;attempt<200;attempt++){
    if(chrome.exitCode!==null)throw new Error(`Chrome exited before DevTools became ready. ${stderr}`);
    if(browserDebuggerUrl){
      const endpoint=new URL(browserDebuggerUrl);
      for(const host of [...new Set([endpoint.hostname,'127.0.0.1','localhost'])]){
        try{
          const response=await fetch(`http://${host}:${endpoint.port}/json/list`);if(!response.ok)continue;
          const targets=await response.json();const page=targets.find(target=>target.type==='page'&&target.webSocketDebuggerUrl)||targets.find(target=>target.webSocketDebuggerUrl);
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
  ws=new WebSocket(await waitForDebugger());
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
    const role=new URL(location.href).searchParams.get('submitSmokeRole');
    if(role!=='student'&&role!=='teacher')return;
    const email=role+'-smoke@example.test';
    const userId=role==='student'?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222';
    const enc=value=>btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const token=enc({alg:'none',typ:'JWT'})+'.'+enc({sub:userId,email,role:'authenticated',user_metadata:{full_name:role==='student'?'Student Smoke':'Teacher Smoke'}})+'.x';
    localStorage.setItem('litlabSupabaseSession',JSON.stringify({access_token:token,refresh_token:'smoke-refresh'}));
    localStorage.removeItem('litlabContributorLastSentAt');
    window.__litlabApplicationPost=null;
    window.__litlabRoleChecks=0;
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
      if(url.includes('/rest/v1/rpc/get_my_litlab_contributor_account_role')){window.__litlabRoleChecks+=1;return json({role,is_admin:false,needs_choice:false,has_conflict:false,existing_roles:[role]})}
      if(url.includes('/rest/v1/rpc/is_litlab_admin'))return json(false);
      if(url.includes('/rest/v1/rpc/touch_litlab_session'))return new Response('',{status:204});
      if(url.includes('/rest/v1/rpc/'))return json([]);
      return json([]);
    };
  })();`});

  for(const role of ['student','teacher']){
    const url=new URL(`?submitSmokeRole=${role}#contribute`,base).toString();
    await command('Page.navigate',{url});
    await waitFor(`Boolean(document.querySelector('#ll-contributor-form'))`,`${role} contributor form`);
    await evaluate(`(()=>{
      const root=document.getElementById('ll-contributor-root');if(root)root.dataset.contributorAccountRole='${role}';
      const apply=document.getElementById('contribute-apply');const form=document.querySelector('#ll-contributor-form');
      if(apply){apply.hidden=false;apply.setAttribute('aria-hidden','false')}
      if(form){form.hidden=false;const input=form.querySelector('input[name="applicant_type"][value="${role}"]');if(input){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}}
      return true;
    })()`);
    await waitFor(role==='student'?`Boolean(document.querySelector('select[name="student_supervision"]'))`:`Boolean(document.querySelector('input[name="mentee_email"]'))`,`${role} relationship fields`);

    const fillResult=await evaluate(`(()=>{
      const form=document.querySelector('#ll-contributor-form');if(!form)return {ok:false,reason:'missing form'};
      const set=(name,value)=>{const field=form.querySelector('[name="'+name+'"]');if(!field)return false;field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));return true};
      set('full_name','${role==='student'?'Student Smoke':'Teacher Smoke'}');
      set('email','${role}-smoke@example.test');
      set('topics','Paper 1 analysis and academic writing');
      set('contribution_idea','Create and improve a useful LitLab academic resource.');
      set('motivation','I want to help students with clear and accurate explanations.');
      if('${role}'==='student'){
        set('dp_year','dp1');set('cas_intent','no');set('student_supervision','no');set('contribution_type','content');
      }else{
        set('subject_taught','DP English A');set('mentee_email','student-linked@example.test');set('contribution_type','teacher-review');
      }
      form.querySelectorAll('input[type="checkbox"]').forEach(box=>{box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}))});
      return {ok:true};
    })()`);
    if(!fillResult?.ok)throw new Error(`${role} form fill failed: ${JSON.stringify(fillResult)}`);
    await sleep(100);

    const before=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f?.querySelector('button[type="submit"]');return {valid:f?.checkValidity(),status:f?.querySelector('#ll-contributor-status')?.textContent,button:{disabled:b?.disabled,text:b?.textContent,submitting:b?.dataset.submitting,ready:b?.dataset.ready},invalid:Array.from(f?.elements||[]).filter(x=>x instanceof HTMLInputElement||x instanceof HTMLTextAreaElement||x instanceof HTMLSelectElement).filter(x=>!x.checkValidity()).map(x=>({name:x.name,type:x.type||x.tagName,value:x.value,required:x.required}))}})()`);
    if(!before?.valid)throw new Error(`${role} form is invalid before click: ${JSON.stringify(before)}`);
    if(before?.button?.disabled)throw new Error(`${role} submit button is disabled despite a valid form: ${JSON.stringify(before)}`);

    const roleChecksBefore=await evaluate(`window.__litlabRoleChecks`);
    await evaluate(`document.querySelector('#ll-contributor-form button[type="submit"]')?.click()`);
    await sleep(800);
    const afterClick=await evaluate(`(()=>{const f=document.querySelector('#ll-contributor-form');const b=f?.querySelector('button[type="submit"]');return {post:window.__litlabApplicationPost,roleChecks:window.__litlabRoleChecks,clickSeen:window.__litlabClickSeen,status:f?.querySelector('#ll-contributor-status')?.textContent,button:{disabled:b?.disabled,text:b?.textContent,submitting:b?.dataset.submitting}}})()`);
    if(!afterClick?.post)throw new Error(`${role} click produced no application POST: ${JSON.stringify({before,roleChecksBefore,afterClick})}`);
    const result=await evaluate(`({payload:window.__litlabApplicationPost,thanks:Boolean(document.querySelector('#ll-contributor-form .ll-contrib-thanks')),roleChecks:window.__litlabRoleChecks})`);
    if(!(result?.roleChecks>roleChecksBefore))throw new Error(`${role} submit did not re-check the authoritative account role: ${JSON.stringify(result)}`);
    if(result?.payload?.applicant_type!==role)throw new Error(`${role} submitted wrong applicant_type: ${JSON.stringify(result)}`);
    if(!result?.thanks)throw new Error(`${role} did not render submission confirmation: ${JSON.stringify(result)}`);
    console.log(`Contributor submit smoke passed for ${role}.`);
  }
}finally{
  try{ws?.close()}catch{}
  if(chrome.exitCode===null){chrome.kill('SIGTERM');await Promise.race([chromeExited,sleep(2000)])}
  try{await rm(profileDir,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
}
