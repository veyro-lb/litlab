import './paper2-comparison-builder.css';
import {bookProfiles} from './books-data';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const LOCAL_KEY='litlabPaper2ComparisonBuilder';

type Session={access_token:string;refresh_token:string};
type User={id:string};
type BuilderState={workA:string;workB:string;concept:string;similarity:string;difference:string;methodA:string;methodB:string;significance:string;evidenceA:string;evidenceB:string;thesis:string;paragraphOne:string;paragraphTwo:string;paragraphThree:string};

const emptyState:BuilderState={workA:'',workB:'',concept:'',similarity:'',difference:'',methodA:'',methodB:'',significance:'',evidenceA:'',evidenceB:'',thesis:'',paragraphOne:'',paragraphTwo:'',paragraphThree:''};
const esc=(v:string)=>v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c));
const route=()=>location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
const session=():Session|null=>{try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return s?.access_token&&s?.refresh_token?s:null}catch{return null}};
const headers=(token:string,extra:Record<string,string>={})=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...extra});
const concepts=[...new Set(['Identity','Power','Control','Freedom','Gender','Memory','Conflict','Belonging','Isolation','Resistance','Responsibility','Justice','Family','Society','Change',...bookProfiles.flatMap(b=>b.themes.map(t=>t.name))])].sort((a,b)=>a.localeCompare(b));

function loadLocal():BuilderState{try{return {...emptyState,...JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}')}}catch{return {...emptyState}}}
function saveLocal(state:BuilderState){localStorage.setItem(LOCAL_KEY,JSON.stringify(state))}
function clearLocal(){localStorage.removeItem(LOCAL_KEY)}
async function currentUser(s:Session){const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(s.access_token)});if(!r.ok)return null;return await r.json() as User}
function titleFor(slug:string){return bookProfiles.find(b=>b.id===slug)?.title||''}

async function loadRemote(s:Session,user:User){const r=await fetch(`${SUPABASE_URL}/rest/v1/litlab_p2_comparison_workspaces?select=*&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers:headers(s.access_token)});if(!r.ok)return null;const rows=await r.json() as Record<string,string|null>[];const row=rows[0];if(!row)return null;return {
 workA:row.work_a_slug||'',workB:row.work_b_slug||'',concept:row.concept||'',similarity:row.similarity||'',difference:row.difference||'',methodA:row.method_a||'',methodB:row.method_b||'',significance:row.significance||'',evidenceA:row.evidence_a||'',evidenceB:row.evidence_b||'',thesis:row.thesis||'',paragraphOne:row.paragraph_one||'',paragraphTwo:row.paragraph_two||'',paragraphThree:row.paragraph_three||''
 } as BuilderState}
async function saveRemote(s:Session,user:User,state:BuilderState){
 const payload={user_id:user.id,work_a_slug:state.workA,work_a_title:titleFor(state.workA),work_b_slug:state.workB,work_b_title:titleFor(state.workB),concept:state.concept,similarity:state.similarity||null,difference:state.difference||null,method_a:state.methodA||null,method_b:state.methodB||null,significance:state.significance||null,evidence_a:state.evidenceA||null,evidence_b:state.evidenceB||null,thesis:state.thesis||null,paragraph_one:state.paragraphOne||null,paragraph_two:state.paragraphTwo||null,paragraph_three:state.paragraphThree||null};
 if(!state.workA||!state.workB||!state.concept)return;
 const r=await fetch(`${SUPABASE_URL}/rest/v1/litlab_p2_comparison_workspaces?on_conflict=user_id`,{method:'POST',headers:headers(s.access_token,{Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(payload)});if(!r.ok)throw new Error('sync failed')
}
async function deleteRemote(s:Session,user:User){
 const r=await fetch(`${SUPABASE_URL}/rest/v1/litlab_p2_comparison_workspaces?user_id=eq.${encodeURIComponent(user.id)}`,{method:'DELETE',headers:headers(s.access_token,{Prefer:'return=minimal'})});
 if(!r.ok)throw new Error('clear failed')
}

function mount(){
 if(route()!=='paper-2')return;
 const section=document.querySelector<HTMLElement>('#p2-comparison');
 if(!section||section.querySelector('[data-p2-builder]'))return;
 let state=session()?loadLocal():{...emptyState};
 const box=document.createElement('div');box.className='p2-builder';box.dataset.p2Builder='true';
 box.innerHTML=`<div class="p2-builder-intro"><div><span>✦ SIGNED-IN TOOL</span><h3>Build your Paper 2 comparison.</h3><p>Choose two works and a concept, then turn similarities, differences, methods, significance, and evidence into one comparative thesis and three paragraph arguments.</p><div class="p2-builder-flow"><b>WORK A</b><i>↔</i><b>WORK B</b><i>→</i><b>CONCEPT</b><i>→</i><strong>ARGUMENT</strong></div></div><button type="button" class="btn primary" data-builder-toggle>Build a comparison →</button></div><div class="p2-builder-workspace" data-builder-workspace hidden></div>`;
 section.append(box);
 const workspace=box.querySelector<HTMLElement>('[data-builder-workspace]')!;
 const syncLabel=()=>session()?'Saved to your LitLab account':'Sign in required';
 const renderWorkspace=()=>{workspace.innerHTML=`<div class="p2-builder-top"><div><span>COMPARISON WORKSPACE</span><h3>Put the works into conversation.</h3></div><div class="p2-builder-save" data-builder-save>${syncLabel()}</div></div>
 <div class="p2-builder-selects"><label><span>Work A</span><select name="workA"><option value="">Choose a studied work</option>${bookProfiles.map(b=>`<option value="${esc(b.id)}" ${state.workA===b.id?'selected':''}>${esc(b.title)}</option>`).join('')}</select></label><div class="p2-builder-versus">VS</div><label><span>Work B</span><select name="workB"><option value="">Choose a studied work</option>${bookProfiles.map(b=>`<option value="${esc(b.id)}" ${state.workB===b.id?'selected':''}>${esc(b.title)}</option>`).join('')}</select></label><label class="p2-builder-concept"><span>Concept / theme</span><select name="concept"><option value="">Choose a concept</option>${concepts.map(c=>`<option value="${esc(c)}" ${state.concept===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label></div>
 <div class="p2-builder-matrix">
  <label><span>Similarity</span><small>Both works...</small><textarea name="similarity" placeholder="show power as something maintained through fear">${esc(state.similarity)}</textarea></label>
  <label><span>Difference</span><small>But they differ because...</small><textarea name="difference" placeholder="Work A makes power institutional, while Work B makes it personal">${esc(state.difference)}</textarea></label>
  <label><span>Work A • authorial method</span><small>How does the writer construct it?</small><textarea name="methodA" placeholder="uses restricted perspective, recurring imagery, structure...">${esc(state.methodA)}</textarea></label>
  <label><span>Work B • authorial method</span><small>How does the writer construct it?</small><textarea name="methodB" placeholder="uses contrast, dialogue, visual framing, symbolism...">${esc(state.methodB)}</textarea></label>
  <label><span>Work A • evidence</span><small>Precise scene, moment, symbol, or short quotation.</small><textarea name="evidenceA" placeholder="A specific scene or evidence point you can recall in the exam">${esc(state.evidenceA)}</textarea></label>
  <label><span>Work B • evidence</span><small>Precise scene, moment, symbol, or short quotation.</small><textarea name="evidenceB" placeholder="A matching or contrasting evidence point from Work B">${esc(state.evidenceB)}</textarea></label>
  <label class="p2-builder-wide"><span>Comparative significance</span><small>So what does this comparison reveal?</small><textarea name="significance" placeholder="The contrast suggests that control survives through both public systems and private complicity.">${esc(state.significance)}</textarea></label>
 </div>
 <div class="p2-builder-build-row"><div><b>Ready to shape the argument?</b><span>LitLab uses only what you entered — it does not invent evidence for the works.</span></div><button type="button" class="btn primary" data-builder-generate>Build thesis + 3 arguments →</button></div>
 <div class="p2-builder-output"><label><span>Comparative thesis draft</span><textarea name="thesis" placeholder="Your comparative thesis will appear here after you build the argument.">${esc(state.thesis)}</textarea></label><div class="p2-builder-paragraphs">${[['paragraphOne','01','Shared idea + first comparison'],['paragraphTwo','02','Method contrast + development'],['paragraphThree','03','Significance + evaluation']].map(([name,no,label])=>`<label><span>${no} • ${label}</span><textarea name="${name}" placeholder="Paragraph argument...">${esc(state[name as keyof BuilderState])}</textarea></label>`).join('')}</div></div>
 <div class="p2-builder-footer"><span data-builder-status>${syncLabel()}</span><button type="button" data-builder-reset>Clear workspace</button></div>`;wire()};
 let remoteTimer=0;
 const setStatus=(text:string)=>workspace.querySelectorAll<HTMLElement>('[data-builder-status],[data-builder-save]').forEach(x=>x.textContent=text);
 const collect=()=>{workspace.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[name]').forEach(el=>{const key=el.name as keyof BuilderState;if(key in state)state[key]=el.value});saveLocal(state);setStatus(session()?'Saving to your LitLab account…':'Sign in required');window.clearTimeout(remoteTimer);remoteTimer=window.setTimeout(()=>void syncRemote(),650)};
 const syncRemote=async()=>{const s=session();if(!s)return;try{const user=await currentUser(s);if(!user)return;await saveRemote(s,user,state);setStatus('Synced to your LitLab account ✓')}catch{setStatus('Could not sync • keep this page open and try again') }};
 const generate=()=>{collect();const a=titleFor(state.workA)||'Work A',b=titleFor(state.workB)||'Work B',concept=state.concept||'the chosen concept';state.thesis=`${a} and ${b} both ${state.similarity||`engage with ${concept}`}, yet ${state.difference||'they construct the idea in meaningfully different ways'}. Through ${state.methodA||`${a}'s authorial choices`} and ${state.methodB||`${b}'s contrasting methods`}, the works suggest that ${state.significance||`${concept} carries different implications across the two texts`}.`;
 state.paragraphOne=`Both ${a} and ${b} ${state.similarity||`develop ${concept}`}. Compare how ${state.methodA||`${a}'s method`} and ${state.methodB||`${b}'s method`} establish this shared idea, using ${state.evidenceA||'precise evidence from Work A'} and ${state.evidenceB||'precise evidence from Work B'}.`;
 state.paragraphTwo=`Develop the contrast: ${state.difference||`${a} and ${b} construct ${concept} differently`}. Explain how the difference in method changes the effect or interpretation rather than simply listing techniques.`;
 state.paragraphThree=`Evaluate why the comparison matters: ${state.significance||`the writers' different treatments of ${concept} lead to different implications`}. Return to both works and connect the evidence to the question.`;
 saveLocal(state);renderWorkspace();void syncRemote()};
 const clearWorkspace=async()=>{if(!confirm('Clear your Paper 2 comparison workspace?'))return;window.clearTimeout(remoteTimer);state={...emptyState};clearLocal();renderWorkspace();const s=session();if(!s)return;setStatus('Clearing saved workspace…');try{const user=await currentUser(s);if(!user)throw new Error('no user');await deleteRemote(s,user);setStatus('Workspace cleared ✓')}catch{setStatus('Could not clear the saved workspace • try again')}};
 const wire=()=>{workspace.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[name]').forEach(el=>el.addEventListener('input',collect));workspace.querySelector('[data-builder-generate]')?.addEventListener('click',generate);workspace.querySelector('[data-builder-reset]')?.addEventListener('click',()=>void clearWorkspace())};
 box.querySelector('[data-builder-toggle]')?.addEventListener('click',()=>{workspace.hidden=!workspace.hidden;if(!workspace.hidden){renderWorkspace();workspace.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'})}});
 if(session()&&Object.values(state).some(Boolean)){workspace.hidden=false;renderWorkspace()}
 const s=session();if(s){void(async()=>{try{const user=await currentUser(s);if(!user)return;const remote=await loadRemote(s,user);if(remote){state=remote;saveLocal(state);workspace.hidden=false;renderWorkspace()}}catch{}})()}
}

let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()})}
window.addEventListener('hashchange',schedule);
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
schedule();
