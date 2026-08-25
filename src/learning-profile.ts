import './learning-profile.css';

type Stat={correct:number;wrong:number;lastAt:number};
type Recent={skill:string;correct:boolean;source:string;at:number};
type Profile={stats:Record<string,Stat>;recent:Recent[];clinicSessions:number};
type ClinicOption={text:string;correct:boolean;why:string};
type ClinicQuestion={skill:string;prompt:string;lesson:string;options:ClinicOption[]};

const PROFILE_KEY='litlabLearningProfile';
const SKILL_KEY='litlabSkillProgress';
const GUIDE_KEY='litlabDone';
const CLINIC_OPEN_KEY='litlabOpenClinic';
const route=()=>location.hash.slice(1).split('#')[0]||'home';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const skillIdLabels:Record<string,string>={
  analysis:'Analysis',thesis:'Thesis',choices:'Authorial choices',evaluation:'Evaluation',paragraph:'Paragraph structure',mixed:'Mixed skills'
};

const clinicBank:ClinicQuestion[]=[
  {skill:'Analysis',prompt:'Which sentence best moves from effect to meaning?',lesson:'Meaning explains what the effect suggests about an idea, relationship, character, or wider concern.',options:[
    {text:'The short sentences create a faster pace.',correct:false,why:'That identifies an effect, but it stops before interpretation.'},
    {text:'The short sentences create urgency, suggesting that the character is losing the time and control needed to think carefully.',correct:true,why:'This moves from effect into an evidence-based interpretation.'},
    {text:'The writer uses short sentences.',correct:false,why:'That only identifies the choice.'}
  ]},
  {skill:'Analysis',prompt:'A student writes: “The rain makes the scene sad.” What is the strongest next move?',lesson:'Strong analysis makes the effect precise, then connects it to meaning.',options:[
    {text:'Name three more techniques.',correct:false,why:'A longer technique list does not deepen the interpretation.'},
    {text:'Explain how the repeated rain imagery creates emotional heaviness and what that suggests about the character’s isolation.',correct:true,why:'This develops effect and meaning rather than stopping at a vague response.'},
    {text:'Retell what happens during the rain.',correct:false,why:'That returns to summary.'}
  ]},
  {skill:'Analysis',prompt:'Which claim is most securely supported by a silent character repeatedly folding a rejection letter?',lesson:'Interpretations should be arguable without becoming absolute or speculative.',options:[
    {text:'The repeated action may externalize an attempt to contain disappointment.',correct:true,why:'The interpretation grows directly from the action and context.'},
    {text:'The character definitely hates everyone in the room.',correct:false,why:'That is too absolute for the available evidence.'},
    {text:'The paper proves the character enjoys crafts.',correct:false,why:'That ignores the rejection context.'}
  ]},
  {skill:'Authorial choices',prompt:'A text places a polished campaign poster beside a damaged neighborhood wall. Which choice is most useful to name?',lesson:'Choose the term that most precisely describes how the meaning is being constructed.',options:[
    {text:'Juxtaposition',correct:true,why:'The two contrasting images are deliberately placed together.'},
    {text:'Flashback',correct:false,why:'No shift in time is described.'},
    {text:'Onomatopoeia',correct:false,why:'The key feature is visual placement, not sound imitation.'}
  ]},
  {skill:'Authorial choices',prompt:'The narration gives access to only one character’s thoughts while everyone else remains externally described. What matters most?',lesson:'Perspective and focalization shape what the audience can know and how events are interpreted.',options:[
    {text:'Limited focalization / limited perspective',correct:true,why:'Access to consciousness is restricted to one viewpoint.'},
    {text:'Omniscient narration',correct:false,why:'Omniscient narration would provide broader access.'},
    {text:'A rhetorical question',correct:false,why:'No question is involved.'}
  ]},
  {skill:'Authorial choices',prompt:'A paragraph shifts from long flowing sentences to “No. Not again.” Which choices are most relevant?',lesson:'Sentence structure and pacing are often connected; identify the change before explaining its effect.',options:[
    {text:'Syntax and pacing',correct:true,why:'The sudden shortening changes rhythm, emphasis, and emotional pressure.'},
    {text:'Setting and costume',correct:false,why:'Neither describes the sentence-level shift.'},
    {text:'Only symbolism',correct:false,why:'The clearest observable mechanism is structural and syntactical.'}
  ]},
  {skill:'Evaluation',prompt:'Which sentence contains genuine evaluation?',lesson:'Evaluation is a judgment supported by an analytical reason.',options:[
    {text:'The writer effectively uses contrast.',correct:false,why:'It gives a judgment but no reason for it.'},
    {text:'The contrast is effective because the public slogan remains visible beside the character’s private rejection, making the institution’s contradiction immediately clear.',correct:true,why:'The judgment is justified through the way the choice creates meaning.'},
    {text:'The contrast is interesting.',correct:false,why:'“Interesting” is vague and unsupported.'}
  ]},
  {skill:'Evaluation',prompt:'What is the main problem with “The imagery is successful because it is good”?',lesson:'Evaluation should explain why the method succeeds, fails, complicates, or strengthens meaning.',options:[
    {text:'It is circular and gives no analytical reason.',correct:true,why:'“Good” simply repeats the positive judgment.'},
    {text:'The word imagery can never be used.',correct:false,why:'Imagery is valid terminology when it accurately describes the choice.'},
    {text:'Evaluation should never discuss success.',correct:false,why:'Success or effectiveness can be evaluated when supported.'}
  ]},
  {skill:'Evaluation',prompt:'Which evaluation is most precise?',lesson:'Precise evaluation identifies what makes a choice convincing, subtle, limited, powerful, or significant.',options:[
    {text:'The ending is powerful.',correct:false,why:'The judgment is not explained.'},
    {text:'The circular ending is especially effective because the repeated doorway image returns with a changed meaning, allowing the reader to measure the character’s development.',correct:true,why:'It evaluates the structural choice through its specific effect and significance.'},
    {text:'The writer uses structure successfully.',correct:false,why:'This is too general to show why the structure succeeds.'}
  ]},
  {skill:'Thesis',prompt:'Which thesis gives the strongest direction for an analytical response?',lesson:'A strong thesis combines an arguable interpretation with relevant methods and supported evaluation.',options:[
    {text:'The text uses many techniques to show power.',correct:false,why:'It is vague and gives no arguable interpretation.'},
    {text:'Power is an important theme in the text.',correct:false,why:'This identifies a topic rather than a claim to prove.'},
    {text:'By contrasting public confidence with private hesitation, the writer convincingly presents power as unstable and dependent on performance.',correct:true,why:'It is specific, arguable, method-based, and evaluative.'}
  ]},
  {skill:'Thesis',prompt:'What makes a thesis arguable?',lesson:'An arguable thesis needs evidence and reasoning to prove; it should not simply repeat an obvious fact.',options:[
    {text:'It makes a specific interpretation that could be supported, challenged, or qualified with evidence.',correct:true,why:'That gives the essay a position to demonstrate.'},
    {text:'It lists at least five techniques.',correct:false,why:'Technique quantity does not create an argument.'},
    {text:'It repeats the wording of the question.',correct:false,why:'Restating the prompt is not the same as answering it.'}
  ]},
  {skill:'Thesis',prompt:'Which revision most improves “The writer uses imagery to show isolation”?',lesson:'Improve a thesis by making the interpretation more precise and showing how the method creates that idea.',options:[
    {text:'The writer uses imagery, diction, syntax, repetition, and symbolism to show isolation.',correct:false,why:'This adds techniques but not a stronger interpretation.'},
    {text:'Through blurred visual imagery and muffled sound, the writer effectively presents isolation as emotional disconnection even within a crowded public space.',correct:true,why:'It sharpens the idea, identifies methods, and gives analytical direction.'},
    {text:'Isolation is very important.',correct:false,why:'This remains broad and unarguable.'}
  ]},
  {skill:'Paragraph structure',prompt:'Which sequence best develops an analytical paragraph?',lesson:'Paragraph structure should carry the reader from argument to evidence to method, meaning, and significance.',options:[
    {text:'Claim → evidence → authorial choice → effect → interpretation → evaluation/connection',correct:true,why:'Each step develops the reasoning instead of jumping between unrelated points.'},
    {text:'Quotation → plot summary → new topic → technique list',correct:false,why:'The logic is disconnected.'},
    {text:'Technique list → conclusion → context → claim',correct:false,why:'The argument needs a clearer analytical progression.'}
  ]},
  {skill:'Paragraph structure',prompt:'What should a strong link sentence do at the end of a paragraph?',lesson:'A link should reconnect the paragraph’s analysis to the thesis or wider argument, not merely announce that the paragraph is finished.',options:[
    {text:'Reconnect the paragraph’s interpretation to the central argument or theme.',correct:true,why:'This shows why the close analysis matters to the essay as a whole.'},
    {text:'Say “In conclusion” after every paragraph.',correct:false,why:'That signals an ending without developing the argument.'},
    {text:'Introduce an unrelated new technique.',correct:false,why:'A link should consolidate the current reasoning.'}
  ]},
  {skill:'Paragraph structure',prompt:'A paragraph includes evidence but never explains why it matters. Which step is missing most clearly?',lesson:'Evidence only becomes analytical when reasoning explains how it supports the claim.',options:[
    {text:'Interpretation / significance',correct:true,why:'The paragraph needs to explain what the evidence suggests and why that matters.'},
    {text:'A second quotation immediately after the first',correct:false,why:'More evidence does not solve missing reasoning.'},
    {text:'A longer plot summary',correct:false,why:'Summary would move further away from analysis.'}
  ]}
];

function loadJSON<T>(key:string,fallback:T):T{
  try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}
}

function loadProfile():Profile{
  const value=loadJSON<Profile|null>(PROFILE_KEY,null);
  if(value&&value.stats&&Array.isArray(value.recent))return {stats:value.stats,recent:value.recent,clinicSessions:value.clinicSessions||0};
  return {stats:{},recent:[],clinicSessions:0};
}

function saveProfile(profile:Profile){
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
}

function normalizeSkill(raw:string){
  const value=raw.trim();
  if(/^paragraph/i.test(value))return 'Paragraph structure';
  if(/^authorial/i.test(value)||value==='CHOICE')return 'Authorial choices';
  if(value==='EVALUATION')return 'Evaluation';
  if(['NOTICE','EFFECT','MEANING','WIDER THEME'].includes(value))return 'Analysis';
  if(/^thesis/i.test(value))return 'Thesis';
  return value||'Analysis';
}

function recordAttempt(skill:string,correct:boolean,source:string){
  const profile=loadProfile();
  const name=normalizeSkill(skill);
  const stat=profile.stats[name]||{correct:0,wrong:0,lastAt:0};
  if(correct)stat.correct++;else stat.wrong++;
  stat.lastAt=Date.now();
  profile.stats[name]=stat;
  profile.recent=[{skill:name,correct,source,at:Date.now()},...profile.recent].slice(0,8);
  saveProfile(profile);
}

function skillProgress(){
  const value=loadJSON<{completed?:string[];bestScores?:Record<string,number>}>(SKILL_KEY,{});
  return {completed:Array.isArray(value.completed)?value.completed:[],bestScores:value.bestScores||{}};
}

function guideProgress(){
  const value=loadJSON<string[]>(GUIDE_KEY,[]);
  return Array.isArray(value)?value:[];
}

function rankedSkills(){
  const profile=loadProfile();
  const scores=new Map<string,{accuracy:number;attempts:number;wrong:number}>();
  Object.entries(profile.stats).forEach(([skill,stat])=>{
    const attempts=stat.correct+stat.wrong;
    if(attempts)scores.set(skill,{accuracy:stat.correct/attempts,attempts,wrong:stat.wrong});
  });
  const progress=skillProgress();
  Object.entries(progress.bestScores).forEach(([id,score])=>{
    const skill=skillIdLabels[id];
    if(skill&&skill!=='Mixed skills'&&!scores.has(skill))scores.set(skill,{accuracy:Math.max(0,Math.min(100,score))/100,attempts:1,wrong:score<100?1:0});
  });
  return Array.from(scores.entries()).map(([skill,data])=>({skill,...data}));
}

function learningSnapshot(){
  const ranked=rankedSkills();
  const strongest=[...ranked].sort((a,b)=>b.accuracy-a.accuracy||b.attempts-a.attempts)[0];
  const weaknessPool=ranked.filter(x=>x.wrong>0||x.accuracy<.85);
  const weakest=[...weaknessPool].sort((a,b)=>a.accuracy-b.accuracy||b.attempts-a.attempts)[0];
  return {strongest,weakest};
}

function percent(value:number){return `${Math.round(value*100)}%`}
function escapeHTML(value:string){return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch))}

function dashboardAction(kind:string){
  if(kind==='clinic'){
    localStorage.setItem(CLINIC_OPEN_KEY,'1');
    location.hash='skills';
  }else if(kind==='skills'){
    localStorage.setItem('litlabLastSkill','mixed');
    location.hash='skills';
  }else if(kind==='start')location.hash='start';
  else location.hash='skills';
}

function createDashboard(){
  if(route()!=='home'||document.querySelector('.my-litlab-dashboard'))return;
  const quick=document.querySelector<HTMLElement>('.quick-strip')?.closest<HTMLElement>('.section');
  if(!quick)return;

  const guides=guideProgress();
  const skills=skillProgress();
  const profile=loadProfile();
  const {strongest,weakest}=learningSnapshot();
  const guideIds=['start','paper-1','paper-2','io','books','ee'];
  const guideCount=guideIds.filter(id=>guides.includes(id)).length;
  const skillCount=['analysis','thesis','choices','evaluation','paragraph','mixed'].filter(id=>skills.completed.includes(id)).length;

  let action='clinic',actionLabel='Open Mistake Clinic →';
  let recommendation='Build your next practice session around the skill that has caused the most difficulty.';
  if(!weakest&&skillCount===0){action='skills';actionLabel='Start Skills Lab →';recommendation='You have not generated enough practice data yet. Complete a Skills Lab activity so LitLab can start making useful recommendations.'}
  else if(!weakest&&guideCount===0){action='start';actionLabel='Open Start Here →';recommendation='Start with the course map, then return to Skills Lab when you are ready to test the ideas.'}
  else if(!weakest){action='skills';actionLabel='Take Mixed Skill Check →';recommendation='Your current results do not show a clear weak area. A mixed check is the best way to find the next useful target.'}
  else recommendation=`Your current review target is ${weakest.skill}. Mistake Clinic will prioritize that skill and explain every answer.`;

  const recent=profile.recent.slice(0,4);
  const section=document.createElement('section');
  section.className='section my-litlab-dashboard';
  section.innerHTML=`
    <div class="my-litlab-heading">
      <div><span>✦ MY LITLAB</span><h2>Your learning dashboard.</h2><p>LitLab uses practice saved on this browser to show what you have reviewed, what looks strongest, and what deserves another attempt.</p></div>
      <span class="my-litlab-local">Saved locally • no account</span>
    </div>
    <div class="my-litlab-grid">
      <article class="my-litlab-card progress-card">
        <span class="dashboard-kicker">PROGRESS</span><h3>Keep the map visible.</h3>
        <div class="dashboard-progress-row"><div><b>Course guides</b><span>${guideCount} / ${guideIds.length}</span></div><i><em style="width:${Math.round(guideCount/guideIds.length*100)}%"></em></i></div>
        <div class="dashboard-progress-row"><div><b>Skills Lab</b><span>${skillCount} / 6</span></div><i><em style="width:${Math.round(skillCount/6*100)}%"></em></i></div>
        <small>Reviewed does not mean mastered. Use the dashboard as a direction finder, not a grade.</small>
      </article>
      <article class="my-litlab-card insight-card">
        <span class="dashboard-kicker">SKILL SIGNALS</span><h3>What is the practice data saying?</h3>
        <div class="skill-signal positive"><small>STRONGEST SIGNAL</small><b>${strongest?escapeHTML(strongest.skill):'Not enough data yet'}</b><span>${strongest?`${percent(strongest.accuracy)} across ${strongest.attempts} recorded attempt${strongest.attempts===1?'':'s'}`:'Complete a Skills Lab question to begin.'}</span></div>
        <div class="skill-signal review"><small>NEEDS PRACTICE</small><b>${weakest?escapeHTML(weakest.skill):'No clear weakness yet'}</b><span>${weakest?`${percent(weakest.accuracy)} accuracy in the available practice data`:'A mixed check can reveal a useful target.'}</span></div>
      </article>
      <article class="my-litlab-card recommend-card">
        <span class="dashboard-kicker">RECOMMENDED NEXT</span><h3>${weakest?`Train ${escapeHTML(weakest.skill)}.`:'Generate your next signal.'}</h3><p>${recommendation}</p><button type="button" class="btn primary" data-dashboard-action="${action}">${actionLabel}</button>
      </article>
      <article class="my-litlab-card recent-card">
        <span class="dashboard-kicker">RECENT PRACTICE</span><h3>Your latest learning signals.</h3>
        <div class="recent-learning-list">${recent.length?recent.map(item=>`<div><span class="${item.correct?'ok':'miss'}">${item.correct?'✓':'↻'}</span><p><b>${escapeHTML(item.skill)}</b><small>${item.correct?'Strong answer':'Review signal'} • ${escapeHTML(item.source)}</small></p></div>`).join(''):'<div class="recent-empty"><p><b>No practice history yet.</b><small>Your recent Skills Lab answers will appear here.</small></p></div>'}</div>
      </article>
    </div>`;
  section.querySelectorAll<HTMLButtonElement>('[data-dashboard-action]').forEach(button=>button.addEventListener('click',()=>dashboardAction(button.dataset.dashboardAction||'skills')));
  quick.insertAdjacentElement('afterend',section);
}

function clinicTarget(){
  const {weakest}=learningSnapshot();
  if(weakest&&clinicBank.some(q=>q.skill===weakest.skill))return weakest.skill;
  const progress=skillProgress();
  const scored=Object.entries(progress.bestScores).filter(([id])=>id!=='mixed').sort((a,b)=>a[1]-b[1]);
  const mapped=scored[0]&&skillIdLabels[scored[0][0]];
  return mapped&&clinicBank.some(q=>q.skill===mapped)?mapped:'Evaluation';
}

function shuffle<T>(items:T[]){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  return copy;
}

function ensureClinicCard(){
  if(route()!=='skills')return;
  const page=document.querySelector<HTMLElement>('.skills-lab-page');
  const grid=page?.querySelector<HTMLElement>('.skills-tool-grid');
  if(!page||!grid||grid.querySelector('[data-mistake-clinic]'))return;
  const target=clinicTarget();
  const card=document.createElement('button');
  card.type='button';
  card.className='skills-tool-card mistake-clinic-card';
  card.dataset.mistakeClinic='true';
  card.innerHTML=`<span class="skills-tool-no">★</span><div><b>Mistake Clinic</b><p>Practice the skill your recent answers say needs the most attention.</p><small>Current target: ${escapeHTML(target)}</small></div><em>→</em>`;
  card.addEventListener('click',()=>openClinic(page));
  grid.prepend(card);

  if(localStorage.getItem(CLINIC_OPEN_KEY)==='1'){
    localStorage.removeItem(CLINIC_OPEN_KEY);
    setTimeout(()=>openClinic(page),80);
  }
}

function openClinic(page:HTMLElement){
  const body=page.querySelector<HTMLElement>('.skills-workspace-body');
  const title=page.querySelector<HTMLElement>('.skills-current-title');
  if(!body||!title)return;
  page.querySelectorAll('.skills-tool-card').forEach(el=>el.classList.remove('active'));
  page.querySelector<HTMLElement>('[data-mistake-clinic]')?.classList.add('active');
  title.textContent='Mistake Clinic';
  localStorage.setItem('litlabLastSkill','analysis');
  renderClinic(body);
  page.querySelector('.skills-workspace')?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
}

function renderClinic(root:HTMLElement){
  const target=clinicTarget();
  let pool=shuffle(clinicBank.filter(q=>q.skill===target));
  if(pool.length<4)pool=[...pool,...shuffle(clinicBank.filter(q=>q.skill!==target))];
  const questions=pool.slice(0,4);
  let index=0,score=0;

  const render=()=>{
    const q=questions[index];
    root.innerHTML=`
      <div class="clinic-intro"><div><span>ADAPTIVE REVIEW</span><h3>Mistake Clinic</h3><p>LitLab selected <b>${escapeHTML(target)}</b> from the practice data stored on this browser. Answer four focused questions, read the feedback, and use the misses as your next study direction.</p></div><div class="clinic-target"><small>CURRENT TARGET</small><b>${escapeHTML(target)}</b></div></div>
      <div class="clinic-question-shell">
        <div class="clinic-meta"><span>Question ${index+1} / ${questions.length}</span><b>${escapeHTML(q.skill)}</b><i><em style="width:${Math.round(index/questions.length*100)}%"></em></i></div>
        <h3>${q.prompt}</h3>
        <div class="practice-options clinic-options">${q.options.map((option,i)=>`<button type="button" data-clinic-option="${i}"><span>${String.fromCharCode(65+i)}</span>${option.text}</button>`).join('')}</div>
        <div class="practice-feedback clinic-feedback" aria-live="polite"></div>
        <button type="button" class="btn primary clinic-next" disabled>${index===questions.length-1?'See clinic result':'Next question →'}</button>
      </div>`;

    const feedback=root.querySelector<HTMLElement>('.clinic-feedback')!;
    const next=root.querySelector<HTMLButtonElement>('.clinic-next')!;
    root.querySelectorAll<HTMLButtonElement>('[data-clinic-option]').forEach(button=>button.addEventListener('click',()=>{
      if(button.parentElement?.classList.contains('answered'))return;
      button.parentElement?.classList.add('answered');
      const selected=q.options[Number(button.dataset.clinicOption)];
      root.querySelectorAll<HTMLButtonElement>('[data-clinic-option]').forEach((candidate,i)=>{if(q.options[i].correct)candidate.classList.add('correct')});
      if(selected.correct){score++;button.classList.add('correct')}else button.classList.add('wrong');
      recordAttempt(q.skill,selected.correct,'Mistake Clinic');
      feedback.className=`practice-feedback clinic-feedback ${selected.correct?'correct':'wrong'}`;
      feedback.innerHTML=`<b>${selected.correct?'✓ Strong reasoning.':'This is the useful part.'}</b><p>${selected.why}</p><small>${q.lesson}</small>`;
      next.disabled=false;
    }));

    next.addEventListener('click',()=>{
      if(index<questions.length-1){index++;render();return}
      const pct=Math.round(score/questions.length*100);
      const profile=loadProfile();profile.clinicSessions++;saveProfile(profile);
      root.innerHTML=`<div class="lab-result clinic-result ${pct>=75?'success':''}"><span>MISTAKE CLINIC COMPLETE</span><div class="score-ring"><b>${pct}%</b><small>${score}/${questions.length}</small></div><h3>${pct===100?'Clean recovery.':pct>=75?'Good recovery — review the one that caught you.':'Keep this skill in your review rotation.'}</h3><p>Your clinic targeted <b>${escapeHTML(target)}</b>. The dashboard will now use these answers when deciding what to recommend next.</p><div class="clinic-result-actions"><button type="button" class="btn secondary clinic-again">Run another clinic</button><button type="button" class="btn primary clinic-mixed">Open Mixed Skill Check →</button></div></div>`;
      root.querySelector<HTMLButtonElement>('.clinic-again')?.addEventListener('click',()=>renderClinic(root));
      root.querySelector<HTMLButtonElement>('.clinic-mixed')?.addEventListener('click',()=>{
        const page=document.querySelector<HTMLElement>('.skills-lab-page');
        page?.querySelector<HTMLButtonElement>('.skills-tool-card[data-tool="mixed"]')?.click();
      });
    });
  };
  render();
}

function capturePracticeSignal(event:MouseEvent){
  if(route()!=='skills')return;
  const target=event.target as Element|null;
  const button=target?.closest<HTMLButtonElement>('[data-quiz],[data-thesis],[data-option]');
  if(!button||button.dataset.learningRecorded==='true')return;
  setTimeout(()=>{
    if(button.dataset.learningRecorded==='true')return;
    const isCorrect=button.classList.contains('correct');
    const isWrong=button.classList.contains('wrong');
    if(!isCorrect&&!isWrong)return;
    button.dataset.learningRecorded='true';
    let skill='Analysis';
    let source=(document.querySelector<HTMLElement>('.skills-current-title')?.textContent||'Skills Lab').trim();
    if(button.hasAttribute('data-quiz'))skill=(button.closest('.quiz-shell')?.querySelector<HTMLElement>('.quiz-meta b')?.textContent||source).trim();
    else if(button.hasAttribute('data-thesis'))skill='Thesis';
    else skill=(button.closest('.practice-question')?.querySelector<HTMLElement>('.practice-progress span')?.textContent||'Analysis').trim();
    recordAttempt(skill,isCorrect,source);
  },0);
}

let scheduled=false;
function enhance(){
  createDashboard();
  ensureClinicCard();
}
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}

const root=document.getElementById('root');
if(root)new MutationObserver(()=>{
  if(route()==='home'&&!document.querySelector('.my-litlab-dashboard'))schedule();
  if(route()==='skills'&&!document.querySelector('[data-mistake-clinic]'))schedule();
}).observe(root,{childList:true,subtree:true});

document.addEventListener('click',capturePracticeSignal,true);
window.addEventListener('hashchange',()=>setTimeout(schedule,120));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
