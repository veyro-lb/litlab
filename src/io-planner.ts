import './io-planner.css';
import {bookProfiles} from './books-data';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const LOCAL_KEY='litlabIOPlanner';

type Session={access_token:string;refresh_token:string};
type User={id:string};
type PlannerState={globalIssue:string;literaryWork:string;secondType:string;secondTitle:string;literaryExtract:string;secondExtract:string;literaryChoices:string;secondChoices:string;literaryWider:string;secondWider:string;significance:string;outline:string[];checklist:boolean[];lastPracticeSeconds:number};

const checklistLabels=[
 'Global issue is focused and clearly stated.',
 'Both materials are identified early.',
 'I use precise evidence from both extracts.',
 'I explain authorial choices, not just identify them.',
 'I move from choice → effect → meaning → global issue.',
 'I connect each extract to the wider work / body of work.',
 'My speaking time is reasonably balanced between both materials.',
 'My ending synthesizes what the comparison reveals about the global issue.'
];
const emptyState:PlannerState={globalIssue:'',literaryWork:'',secondType:'Non-literary body of work',secondTitle:'',literaryExtract:'',secondExtract:'',literaryChoices:'',secondChoices:'',literaryWider:'',secondWider:'',significance:'',outline:Array(10).fill(''),checklist:Array(checklistLabels.length).fill(false),lastPracticeSeconds:0};
const esc=(v:string)=>v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c));
const route=()=>location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
const session=():Session|null=>{try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return s?.access_token&&s?.refresh_token?s:null}catch{return null}};
const headers=(token:string,extra:Record<string,string>={})=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...extra});

function normalize(raw:Partial<PlannerState>):PlannerState{return {...emptyState,...raw,outline:Array.from({length:10},(_,i)=>raw.outline?.[i]||''),checklist:Array.from({length:checklistLabels.length},(_,i)=>Boolean(raw.checklist?.[i]))}}
function loadLocal(){try{return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}'))}catch{return normalize({})}}
function saveLocal(state:PlannerState){localStorage.setItem(LOCAL_KEY,JSON.stringify(state))}
async function currentUser(s:Session){const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(s.access_token)});if(!r.ok)return null;return await r.json() as User}
async function loadRemote(s:Session,user:User){const r=await fetch(`${SUPABASE_URL}/rest/v1/litlab_io_planners?select=data&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers:headers(s.access_token)});if(!r.ok)return null;const rows=await r.json() as {data:Partial<PlannerState>}[];return rows[0]?.data?normalize(rows[0].data):null}
async function saveRemote(s:Session,user:User,state:PlannerState){const r=await fetch(`${SUPABASE_URL}/rest/v1/litlab_io_planners?on_conflict=user_id`,{method:'POST',headers:headers(s.access_token,{Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({user_id:user.id,data:state})});if(!r.ok)throw new Error('sync failed')}

function mount(){
 if(route()!=='io')return;
 const section=document.querySelector<HTMLElement>('#io-structure');
 if(!section||section.querySelector('[data-io-planner]'))return;
 let state=session()?loadLocal():normalize({});
 const box=document.createElement('div');box.className='io-planner';box.dataset.ioPlanner='true';
 box.innerHTML=`<div class="io-planner-hero"><div><span>✦ SIGNED-IN IO TOOL</span><h3>Build your Individual Oral.</h3><p>Plan the global issue, materials, extracts, authorial choices and wider-work links, then shape them into a 10-point speaking outline and rehearse it against a 10-minute target.</p><div class="io-planner-flow"><b>GLOBAL ISSUE</b><i>→</i><b>TEXTS</b><i>→</i><b>CHOICES</b><i>→</i><b>10 POINTS</b><i>→</i><strong>PRACTICE</strong></div></div><button type="button" class="btn primary" data-io-planner-toggle>Open IO Planner →</button></div><div class="io-planner-workspace" data-io-planner-workspace hidden></div>`;
 const timerCard=section.querySelector('.io-timer-card');if(timerCard)section.insertBefore(box,timerCard);else section.append(box);
 const workspace=box.querySelector<HTMLElement>('[data-io-planner-workspace]')!;
 let remoteTimer=0,clockTimer=0,clockStart=0,clockElapsed=state.lastPracticeSeconds,clockRunning=false;
 const syncLabel=()=>session()?'Saved to your LitLab account':'Sign in required';
 const titleFor=(slug:string)=>bookProfiles.find(b=>b.id===slug)?.title||'';
 const formatTime=(seconds:number)=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 const setSaveStatus=(text:string)=>workspace.querySelectorAll<HTMLElement>('[data-io-save]').forEach(x=>x.textContent=text);
 const save=()=>{saveLocal(state);window.clearTimeout(remoteTimer);remoteTimer=window.setTimeout(()=>void syncRemote(),650)};
 const collect=()=>{workspace.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[name]').forEach(el=>{const name=el.name;if(name.startsWith('outline-')){state.outline[Number(name.split('-')[1])]=el.value}else if(name in state){(state as unknown as Record<string,string>)[name]=el.value}});save();setSaveStatus(session()?'Saving to your LitLab account…':'Sign in required')};
 const syncRemote=async()=>{const s=session();if(!s)return;try{const user=await currentUser(s);if(!user)return;await saveRemote(s,user,state);setSaveStatus('Synced to your LitLab account ✓')}catch{setSaveStatus('Could not sync • keep this page open and try again')}};
 const buildOutline=()=>{collect();const lit=titleFor(state.literaryWork)||'your literary work',second=state.secondTitle||'your second material',issue=state.globalIssue||'your global issue';state.outline=[
  `Frame the global issue: ${issue}. Identify ${lit} and ${second}.`,
  `Literary extract: locate the chosen moment and establish why it matters to ${issue}. ${state.literaryExtract||''}`.trim(),
  `Literary close analysis: ${state.literaryChoices||'develop a precise authorial choice → effect → meaning point.'}`,
  `Literary development: connect the extract to the wider work. ${state.literaryWider||'Name a precise wider-work moment or recurring pattern.'}`,
  `Literary synthesis: explain what the work’s treatment reveals about ${issue}.`,
  `${state.secondType}: introduce ${second} and the selected extract / text. ${state.secondExtract||''}`.trim(),
  `Second-material close analysis: ${state.secondChoices||'develop a precise authorial choice → effect → meaning point.'}`,
  `Wider body-of-work link: ${state.secondWider||'Name a precise wider reference and explain whether it reinforces or complicates the extract.'}`,
  `Bring the materials together: compare how their different choices construct ${issue}.`,
  `Close with significance: ${state.significance||`explain what the comparison reveals about the wider significance of ${issue}.`}`
 ];saveLocal(state);renderWorkspace();void syncRemote()};
 const updateClock=()=>{const display=workspace.querySelector<HTMLElement>('[data-io-stopwatch]');const status=workspace.querySelector<HTMLElement>('[data-io-stopwatch-state]');const bar=workspace.querySelector<HTMLElement>('[data-io-stopwatch-bar]');if(!display||!status||!bar)return;const seconds=clockRunning?clockElapsed+Math.floor((Date.now()-clockStart)/1000):clockElapsed;display.textContent=formatTime(seconds);bar.style.width=`${Math.min(100,(seconds/600)*100)}%`;status.textContent=seconds>=600?'10-minute target reached':clockRunning?'speaking…':'ready';};
 const startStop=()=>{const button=workspace.querySelector<HTMLButtonElement>('[data-io-stopwatch-toggle]');if(clockRunning){clockElapsed+=Math.floor((Date.now()-clockStart)/1000);clockRunning=false;window.clearInterval(clockTimer);state.lastPracticeSeconds=clockElapsed;save();if(button)button.textContent='Resume'}else{clockStart=Date.now();clockRunning=true;clockTimer=window.setInterval(updateClock,250);if(button)button.textContent='Pause'}updateClock()};
 const resetClock=()=>{clockRunning=false;window.clearInterval(clockTimer);clockElapsed=0;state.lastPracticeSeconds=0;save();const button=workspace.querySelector<HTMLButtonElement>('[data-io-stopwatch-toggle]');if(button)button.textContent='Start 10-minute run';updateClock()};
 const renderWorkspace=()=>{window.clearInterval(clockTimer);clockRunning=false;clockElapsed=state.lastPracticeSeconds;workspace.innerHTML=`<div class="io-planner-top"><div><span>IO WORKSPACE</span><h3>Plan → outline → speak.</h3></div><div class="io-planner-save" data-io-save>${syncLabel()}</div></div>
 <section class="io-planner-stage"><div class="io-planner-stage-head"><span>01</span><div><b>Plan the oral</b><p>Keep every field analytical and precise. Nothing here is generated from unsupported book content.</p></div></div><div class="io-planner-grid">
 <label class="wide"><span>Global issue</span><textarea name="globalIssue" placeholder="A focused issue with global significance and clear textual fit…">${esc(state.globalIssue)}</textarea></label>
 <label><span>Literary work</span><select name="literaryWork"><option value="">Choose a LitLab work</option>${bookProfiles.map(b=>`<option value="${esc(b.id)}" ${state.literaryWork===b.id?'selected':''}>${esc(b.title)}</option>`).join('')}</select></label>
 <label><span>Second material type</span><select name="secondType">${['Non-literary body of work','Literary body of work','Non-literary text'].map(x=>`<option ${state.secondType===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label class="wide"><span>Second text / body of work</span><input name="secondTitle" value="${esc(state.secondTitle)}" placeholder="Title, campaign, collection, creator…"/></label>
 <label><span>Literary extract</span><textarea name="literaryExtract" placeholder="Chapter / scene / lines and the precise moment you selected…">${esc(state.literaryExtract)}</textarea></label>
 <label><span>Second extract / text</span><textarea name="secondExtract" placeholder="Which image, article, ad, speech, panel, scene, etc.?">${esc(state.secondExtract)}</textarea></label>
 <label><span>Literary authorial choices</span><textarea name="literaryChoices" placeholder="Choice → effect → meaning → global issue…">${esc(state.literaryChoices)}</textarea></label>
 <label><span>Second-material choices</span><textarea name="secondChoices" placeholder="Choice → effect → meaning → global issue…">${esc(state.secondChoices)}</textarea></label>
 <label><span>Literary wider-work links</span><textarea name="literaryWider" placeholder="Precise later/earlier moment, recurring image, structural pattern…">${esc(state.literaryWider)}</textarea></label>
 <label><span>Second wider body-of-work links</span><textarea name="secondWider" placeholder="Another text / image / campaign feature / recurring pattern…">${esc(state.secondWider)}</textarea></label>
 <label class="wide"><span>Comparative significance</span><textarea name="significance" placeholder="What does placing these representations together reveal about the global issue?">${esc(state.significance)}</textarea></label></div></section>
 <section class="io-planner-stage"><div class="io-planner-stage-head"><span>02</span><div><b>Build the 10-point outline</b><p>LitLab structures only what you entered. Edit every point until it sounds like your own speaking notes.</p></div><button type="button" class="btn primary" data-io-build-outline>Build 10 points →</button></div><div class="io-outline-grid">${state.outline.map((x,i)=>`<label><span>${String(i+1).padStart(2,'0')}</span><textarea name="outline-${i}" placeholder="Speaking point ${i+1}…">${esc(x)}</textarea></label>`).join('')}</div></section>
 <section class="io-planner-stage io-practice-stage"><div class="io-planner-stage-head"><span>03</span><div><b>Practice the delivery</b><p>Use the stopwatch for a full speaking run. Aim to complete the argument close to 10:00 without rushing the ending.</p></div></div><div class="io-practice-layout"><div class="io-stopwatch"><span>10-MINUTE SPEAKING STOPWATCH</span><strong data-io-stopwatch>${formatTime(clockElapsed)}</strong><small data-io-stopwatch-state>${clockElapsed>=600?'10-minute target reached':'ready'}</small><div class="io-stopwatch-track"><i data-io-stopwatch-bar style="width:${Math.min(100,(clockElapsed/600)*100)}%"></i></div><div><button type="button" class="btn primary" data-io-stopwatch-toggle>${clockElapsed?'Resume':'Start 10-minute run'}</button><button type="button" class="btn secondary" data-io-stopwatch-reset>Reset</button></div></div><div class="io-speaking-checklist"><span>SPEAKING CHECKLIST</span>${checklistLabels.map((label,i)=>`<label><input type="checkbox" data-io-check="${i}" ${state.checklist[i]?'checked':''}/><i></i><b>${esc(label)}</b></label>`).join('')}</div></div></section>
 <div class="io-planner-footer"><span data-io-save>${syncLabel()}</span><button type="button" data-io-planner-clear>Clear planner</button></div>`;wireWorkspace();updateClock()};
 const wireWorkspace=()=>{workspace.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[name]').forEach(el=>el.addEventListener('input',collect));workspace.querySelector('[data-io-build-outline]')?.addEventListener('click',buildOutline);workspace.querySelector('[data-io-stopwatch-toggle]')?.addEventListener('click',startStop);workspace.querySelector('[data-io-stopwatch-reset]')?.addEventListener('click',resetClock);workspace.querySelectorAll<HTMLInputElement>('[data-io-check]').forEach(cb=>cb.addEventListener('change',()=>{state.checklist[Number(cb.dataset.ioCheck)]=cb.checked;save();void syncRemote()}));workspace.querySelector('[data-io-planner-clear]')?.addEventListener('click',()=>{if(!confirm('Clear your IO planner and speaking checklist?'))return;state=normalize({});saveLocal(state);resetClock();renderWorkspace();void syncRemote()})};
 box.querySelector('[data-io-planner-toggle]')?.addEventListener('click',()=>{workspace.hidden=!workspace.hidden;if(!workspace.hidden){renderWorkspace();workspace.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'})}});
 if(session()&&(state.globalIssue||state.literaryWork||state.secondTitle||state.outline.some(Boolean))){workspace.hidden=false;renderWorkspace()}
 const s=session();if(s){void(async()=>{try{const user=await currentUser(s);if(!user)return;const remote=await loadRemote(s,user);if(remote){state=remote;saveLocal(state);workspace.hidden=false;renderWorkspace()}}catch{}})()}
}

let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})}
window.addEventListener('hashchange',schedule);
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
schedule();
