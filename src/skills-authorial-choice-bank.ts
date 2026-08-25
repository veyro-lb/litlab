import './skills-authorial-choice-bank.css';
import type {ChoiceBankCategory,ChoiceBankQuestion,ChoiceBankRaw} from './skills-choice-bank-types';
import {languageChoiceBank} from './skills-choice-bank-language';
import {structuralChoiceBank} from './skills-choice-bank-structural';
import {narrativeChoiceBank} from './skills-choice-bank-narrative';
import {visualChoiceBank} from './skills-choice-bank-visual';

const BANK_KEY='litlabChoiceBankProgress';
const SKILL_KEY='litlabSkillProgress';
const categories:('All'|ChoiceBankCategory)[]=['All','Language','Structural','Narrative','Visual / multimodal'];
const rawGroups:[ChoiceBankCategory,ChoiceBankRaw[]][]=[
  ['Language',languageChoiceBank],['Structural',structuralChoiceBank],['Narrative',narrativeChoiceBank],['Visual / multimodal',visualChoiceBank]
];
const bank:ChoiceBankQuestion[]=rawGroups.flatMap(([category,items])=>items.map(([id,term,example,prompt,precision,options])=>({
  id,category,term,example,prompt,precision,options:options.map(([text,why],i)=>({text,why,correct:i===0}))
})));

type TermStat={attempts:number;correct:number};
type ChoiceProgress={stats:Record<string,TermStat>;missed:number[]};
type SessionAnswer={id:number;category:ChoiceBankCategory;term:string;correct:boolean};

const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const shuffle=<T,>(items:T[])=>{
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  return copy;
};
function loadProgress():ChoiceProgress{
  try{
    const raw=JSON.parse(localStorage.getItem(BANK_KEY)||'{}');
    return {stats:raw.stats&&typeof raw.stats==='object'?raw.stats:{},missed:Array.isArray(raw.missed)?raw.missed:[]};
  }catch{return {stats:{},missed:[]}}
}
function saveProgress(progress:ChoiceProgress){localStorage.setItem(BANK_KEY,JSON.stringify(progress))}
function syncSkillReviewed(page:HTMLElement,score:number){
  try{
    const raw=JSON.parse(localStorage.getItem(SKILL_KEY)||'{}');
    const completed=Array.isArray(raw.completed)?raw.completed:[];
    if(!completed.includes('choices'))completed.push('choices');
    const bestScores=raw.bestScores&&typeof raw.bestScores==='object'?raw.bestScores:{};
    bestScores.choices=Math.max(Number(bestScores.choices)||0,score);
    localStorage.setItem(SKILL_KEY,JSON.stringify({completed,bestScores}));
    page.querySelector<HTMLButtonElement>('[data-tool="choices"]')?.classList.add('reviewed');
    const count=page.querySelectorAll('.skills-tool-card.reviewed').length;
    const countEl=page.querySelector<HTMLElement>('.skills-progress-count');
    const bar=page.querySelector<HTMLElement>('.skills-progress-bar i');
    if(countEl)countEl.textContent=`${count} / 6`;
    if(bar)bar.style.width=`${Math.round(count/6*100)}%`;
  }catch{}
}
function categoryCount(category:'All'|ChoiceBankCategory){return category==='All'?bank.length:bank.filter(q=>q.category===category).length}
function randomized(q:ChoiceBankQuestion):ChoiceBankQuestion{return {...q,options:shuffle(q.options.map(o=>({...o})))}}

function renderChoiceBank(body:HTMLElement,page:HTMLElement){
  body.dataset.choiceBankRoot='true';
  let category:'All'|ChoiceBankCategory='All';
  let mode:'standard'|'missed'='standard';
  let session:ChoiceBankQuestion[]=[];
  let answers:SessionAnswer[]=[];
  let index=0;
  let answered=false;
  let selected=-1;

  body.innerHTML=`
    <div class="lab-intro choice-bank-intro">
      <span>AUTHORIAL CHOICE CHECK • 40 ORIGINAL QUESTIONS</span>
      <h3>Identify the most precise authorial choice.</h3>
      <p>Each example is designed around a specific choice. Pick the strongest label, then study <b>every explanation</b>—including why the nearby terms are weaker fits. The aim is precise understanding, not lucky recognition.</p>
    </div>
    <div class="choice-bank-overview" aria-label="Authorial Choice Check overview">
      <article><span>QUESTION BANK</span><b>40</b><p>original LitLab questions</p></article>
      <article><span>CATEGORIES</span><b>4</b><p>language, structural, narrative, visual</p></article>
      <article><span>REFERENCE COVERAGE</span><b>40 / 44</b><p>authorial-choice terms covered</p></article>
      <article><span>LEARNING RULE</span><b>Why?</b><p>every option is explained</p></article>
    </div>
    <section class="choice-bank-control-card">
      <div class="choice-bank-filter-head"><div><span>PRACTICE FOCUS</span><b>Choose a category or review your misses.</b></div><button type="button" class="choice-bank-missed-btn" data-choice-missed></button></div>
      <div class="choice-bank-filters" role="group" aria-label="Authorial choice category"></div>
      <div class="choice-bank-stats" aria-live="polite"></div>
    </section>
    <section class="choice-bank-stage" aria-live="polite"></section>`;

  const stage=body.querySelector<HTMLElement>('.choice-bank-stage')!;
  const filters=body.querySelector<HTMLElement>('.choice-bank-filters')!;
  const stats=body.querySelector<HTMLElement>('.choice-bank-stats')!;
  const missedButton=body.querySelector<HTMLButtonElement>('[data-choice-missed]')!;

  function renderFilters(){
    filters.innerHTML=categories.map(cat=>`<button type="button" data-choice-category="${esc(cat)}" class="${category===cat&&mode==='standard'?'active':''}"><b>${esc(cat==='Visual / multimodal'?'Visual / multimodal':cat)}</b><span>${categoryCount(cat)}</span></button>`).join('');
    const progress=loadProgress();
    missedButton.disabled=progress.missed.length===0;
    missedButton.classList.toggle('active',mode==='missed');
    missedButton.innerHTML=`<span>MISSED DRILL</span><b>${progress.missed.length}</b>`;
  }
  function renderStats(){
    const progress=loadProgress();
    const entries=Object.values(progress.stats);
    const attempts=entries.reduce((n,item)=>n+(Number(item.attempts)||0),0);
    const correct=entries.reduce((n,item)=>n+(Number(item.correct)||0),0);
    const practiced=entries.filter(item=>(Number(item.attempts)||0)>0).length;
    const accuracy=attempts?Math.round(correct/attempts*100):0;
    stats.innerHTML=`<div><span>Terms practiced</span><b>${practiced} / 40</b></div><div><span>Overall accuracy</span><b>${accuracy}%</b></div><div><span>Currently missed</span><b>${progress.missed.length}</b></div>`;
  }
  function buildSession(){
    const progress=loadProgress();
    let pool=bank.filter(q=>category==='All'||q.category===category);
    if(mode==='missed')pool=pool.filter(q=>progress.missed.includes(q.id));
    session=pool.map(randomized);
    answers=[];index=0;answered=false;selected=-1;
    renderFilters();renderStats();renderQuestion();
  }
  function optionClass(optionIndex:number,q:ChoiceBankQuestion){
    if(!answered)return '';
    const option=q.options[optionIndex];
    if(option.correct)return 'correct';
    if(optionIndex===selected)return 'wrong';
    return 'dimmed';
  }
  function renderQuestion(){
    if(!session.length){
      stage.innerHTML=`<div class="choice-bank-empty"><span>✓</span><h3>${mode==='missed'?'No missed questions left.':'No questions in this set.'}</h3><p>${mode==='missed'?'You cleared the current missed set. Switch back to the full bank or a category to keep practicing.':'Choose another category to continue.'}</p><button type="button" class="btn primary" data-choice-full>Return to full bank</button></div>`;
      return;
    }
    if(index>=session.length){renderResult();return}
    const q=session[index];
    const pct=Math.round(index/session.length*100);
    stage.innerHTML=`<div class="choice-bank-question-card">
      <div class="choice-bank-meta"><div><span>${mode==='missed'?'MISSED DRILL':esc(q.category.toUpperCase())}</span><b>${esc(q.term)}</b>${q.precision?'<em>PRECISION PAIR</em>':''}</div><div><strong>${index+1}</strong><span>/ ${session.length}</span></div><i style="width:${pct}%"></i></div>
      <div class="choice-bank-example"><span>ORIGINAL EXAMPLE</span><blockquote>${esc(q.example)}</blockquote></div>
      <h3>${esc(q.prompt)}</h3>
      ${q.precision?'<div class="choice-bank-precision-note"><b>Close terminology:</b> More than one nearby term may sound plausible here. Use the explanations to see why this bank prefers the more precise label for this example.</div>':''}
      <div class="choice-bank-options ${answered?'answered':''}">${q.options.map((o,i)=>`<button type="button" data-choice-option="${i}" class="${optionClass(i,q)}" ${answered?'disabled':''}><span>${String.fromCharCode(65+i)}</span><p>${esc(o.text)}</p></button>`).join('')}</div>
      ${answered?`<div class="choice-bank-explanations"><div class="choice-bank-explanations-head"><span>WHY EACH OPTION?</span><b>${q.options.find(o=>o.correct)?.text.split(' — ')[0]||q.term} is the strongest fit.</b></div>${q.options.map((o,i)=>`<article class="${o.correct?'correct':''}${i===selected&&!o.correct?' selected-wrong':''}"><span>${String.fromCharCode(65+i)}</span><div><b>${o.correct?'Why this is correct':'Why this is weaker'}</b><p>${esc(o.why)}</p></div></article>`).join('')}</div>`:''}
      <div class="choice-bank-actions"><span>${answers.filter(a=>a.correct).length} correct so far</span><button type="button" class="btn primary" data-choice-next ${answered?'':'disabled'}>${index===session.length-1?'Finish set':'Next question'} →</button></div>
    </div>`;
  }
  function recordAnswer(optionIndex:number){
    if(answered||index>=session.length)return;
    answered=true;selected=optionIndex;
    const q=session[index];
    const correct=q.options[optionIndex]?.correct===true;
    answers.push({id:q.id,category:q.category,term:q.term,correct});
    const progress=loadProgress();
    const key=String(q.id);
    const stat=progress.stats[key]||{attempts:0,correct:0};
    stat.attempts+=1;if(correct)stat.correct+=1;progress.stats[key]=stat;
    const missed=new Set(progress.missed);
    if(correct)missed.delete(q.id);else missed.add(q.id);
    progress.missed=[...missed].sort((a,b)=>a-b);
    saveProgress(progress);renderFilters();renderStats();renderQuestion();
  }
  function renderResult(){
    const score=answers.length?Math.round(answers.filter(a=>a.correct).length/answers.length*100):0;
    syncSkillReviewed(page,score);
    const wrong=answers.filter(a=>!a.correct);
    const categoryRows=(['Language','Structural','Narrative','Visual / multimodal'] as ChoiceBankCategory[]).map(cat=>{
      const set=answers.filter(a=>a.category===cat);if(!set.length)return'';
      const good=set.filter(a=>a.correct).length;
      return `<div><span>${esc(cat)}</span><b>${good} / ${set.length}</b><i style="width:${Math.round(good/set.length*100)}%"></i></div>`;
    }).join('');
    stage.innerHTML=`<div class="choice-bank-result">
      <span>SET COMPLETE</span><div class="choice-bank-score" style="--choice-score:${score}%"><b>${score}%</b><small>${answers.filter(a=>a.correct).length} / ${answers.length} correct</small></div>
      <h3>${score>=90?'Strong precision.':score>=70?'Good base—tighten the close pairs.':'Use the misses as your next study list.'}</h3>
      <p>Finishing a set means you reviewed the skill. It does not mean every term is permanently mastered.</p>
      <div class="choice-bank-category-results">${categoryRows}</div>
      <div class="choice-bank-review-list"><span>TERMS TO REVIEW</span>${wrong.length?`<div>${wrong.map(a=>`<b>${esc(a.term)}</b>`).join('')}</div>`:'<p>No misses in this set.</p>'}</div>
      <div class="choice-bank-result-actions"><button type="button" class="btn" data-choice-retry>Run this set again</button><button type="button" class="btn primary" data-choice-missed ${loadProgress().missed.length?'':'disabled'}>Practice missed questions</button></div>
    </div>`;
  }

  body.addEventListener('click',event=>{
    const target=event.target as HTMLElement;
    const catButton=target.closest<HTMLButtonElement>('[data-choice-category]');
    if(catButton){category=catButton.dataset.choiceCategory as 'All'|ChoiceBankCategory;mode='standard';buildSession();return}
    if(target.closest('[data-choice-full]')){category='All';mode='standard';buildSession();return}
    if(target.closest('[data-choice-missed]')){if(loadProgress().missed.length){mode='missed';buildSession()}return}
    if(target.closest('[data-choice-retry]')){buildSession();return}
    const option=target.closest<HTMLButtonElement>('[data-choice-option]');
    if(option){recordAnswer(Number(option.dataset.choiceOption));return}
    if(target.closest('[data-choice-next]')){if(!answered)return;index+=1;answered=false;selected=-1;renderQuestion();stage.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  });
  buildSession();
}

function sync(){
  if(route()!=='skills')return;
  const page=document.querySelector<HTMLElement>('.skills-lab-page');if(!page)return;
  const card=page.querySelector<HTMLButtonElement>('[data-tool="choices"]');
  if(card){
    const desc=card.querySelector<HTMLElement>('p');const meta=card.querySelector<HTMLElement>('small');
    if(desc)desc.textContent='Identify closely related authorial choices precisely and learn from every option.';
    if(meta)meta.textContent='40 questions • 4 categories';
  }
  const title=page.querySelector<HTMLElement>('.skills-current-title');
  const body=page.querySelector<HTMLElement>('.skills-workspace-body');
  if(!body||title?.textContent?.trim()!=='Authorial Choice Check'||body.dataset.choiceBankRoot==='true')return;
  renderChoiceBank(body,page);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
