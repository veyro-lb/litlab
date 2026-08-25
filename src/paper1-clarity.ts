import './paper1-clarity.css';
import './paper1-render-fix.css';
import{choiceGroups,paper1Practices}from'./paper1-data';

const route=()=>location.hash.slice(1).split('#')[0]||'home';

function esc(value:string){return value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch))}

function setText(root:ParentNode,selector:string,text:string){const el=root.querySelector<HTMLElement>(selector);if(el)el.textContent=text}

function cleanStudentFacingCopy(page:HTMLElement){
  setText(page,'.paper1-eyebrow','✦ PAPER 1 • LITLAB STUDY GUIDE');
  const hero=page.querySelector<HTMLElement>('.paper1-hero-copy>p');
  if(hero)hero.innerHTML='Read an unseen text, identify the choices doing the most work, and build a focused argument about <b>how those choices shape meaning</b>. Use this guide as a complete Paper 1 study path: understand the process, review the reference material, then test yourself with original practice.';
  page.querySelector<HTMLElement>('.paper1-verify-note')?.remove();
  setText(page,'#p1-annotation .paper1-micro-note','If nearly the whole text is highlighted, you have not prioritized. As a student strategy, aim for roughly 6–8 genuinely useful moments rather than marking everything.');
  const choicesIntro=page.querySelector<HTMLElement>('#p1-choices .paper1-section-head p');
  if(choicesIntro)choicesIntro.innerHTML='This reference includes <b>44 authorial choices</b> across language, structure, narrative, and visual/multimodal analysis. Accuracy matters more than impressive terminology.';
  const analysisIntro=page.querySelector<HTMLElement>('#p1-analysis .paper1-section-head p');
  if(analysisIntro)analysisIntro.innerHTML='Use the LitLab progression: <b>Observation → Choice → Effect → Meaning → Evaluation → Wider idea</b>.';
  setText(page,'#p1-time .paper1-section-head p','This suggested SL breakdown is designed to protect planning and writing time. Adjust it during timed practice to fit your actual reading and writing speed.');
  setText(page,'#p1-practice .paper1-section-head p','All five texts are original LitLab practice material — not past-paper extracts and not official IB assessments.');
  setText(page,'.paper1-finish>div:first-child>span','✦ PAPER 1 STUDY GUIDE');
  setText(page,'.paper1-finish>div:first-child>p','Use the reference sections, examples, and original practice together. Student-strategy sections are labeled as strategy rather than official requirements.');
}

function renderLevelTable(page:HTMLElement){
  const overview=page.querySelector<HTMLElement>('#p1-overview');
  const head=overview?.querySelector<HTMLElement>('.paper1-section-head');
  if(!overview||!head||overview.querySelector('.paper1-level-table-wrap'))return;
  head.insertAdjacentHTML('afterend',`<div class="paper1-level-table-wrap" aria-label="Paper 1 SL and HL comparison">
    <div class="paper1-level-table-title"><div><span>SL vs HL • AT A GLANCE</span><b>Paper 1 format, timing, marks, and weighting</b></div><small>Quick exam reference</small></div>
    <div class="paper1-level-table-scroll"><table class="paper1-level-table">
      <thead><tr><th>Level</th><th>Texts analyzed</th><th>Time given</th><th>Marks available</th><th>Weighting of final grade</th><th>Marking</th></tr></thead>
      <tbody>
        <tr><td data-label="Level"><strong class="paper1-level-badge">SL</strong></td><td data-label="Texts analyzed"><b>1 text</b><span>Your choice of the two given</span></td><td data-label="Time given"><strong>1 hour 15 minutes</strong></td><td data-label="Marks available"><strong>20 marks</strong></td><td data-label="Weighting"><strong class="paper1-weight">35%</strong></td><td data-label="Marking"><b>4 criteria</b><span>5 marks each (A–D)</span></td></tr>
        <tr><td data-label="Level"><strong class="paper1-level-badge hl">HL</strong></td><td data-label="Texts analyzed"><b>Both texts</b><span>Two separate analyses</span></td><td data-label="Time given"><strong>2 hours 15 minutes</strong></td><td data-label="Marks available"><strong>40 marks</strong><span>20 per analysis</span></td><td data-label="Weighting"><strong class="paper1-weight">35%</strong></td><td data-label="Marking"><b>Same 4 criteria</b><span>Applied separately to each analysis</span></td></tr>
      </tbody>
    </table></div>
    <p class="paper1-level-note"><b>HL reminder:</b> the two analyses are separate standalone responses; they are not compared with one another.</p>
  </div>`);
}

function renderPracticeOverview(page:HTMLElement){
  const section=page.querySelector<HTMLElement>('#p1-practice');
  const head=section?.querySelector<HTMLElement>('.paper1-section-head');
  if(!section||!head||section.querySelector('.paper1-practice-overview'))return;
  const rows=paper1Practices.map((item,i)=>`<tr><td data-label="Text"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(item.title)}</b></td><td data-label="Text type">${esc(item.type)}</td><td data-label="Main analytical focus">${esc(item.theme)}</td><td data-label="Questions"><b>${item.questions.length}</b></td></tr>`).join('');
  head.insertAdjacentHTML('afterend',`<div class="paper1-practice-overview"><div class="paper1-table-title"><span>QUICK OVERVIEW</span><b>Choose a practice text by what you want to analyze.</b></div><div class="paper1-table-scroll"><table><thead><tr><th>Practice text</th><th>Text type</th><th>Main analytical focus</th><th>Questions</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}

function renderChoiceTable(page:HTMLElement){
  const grid=page.querySelector<HTMLElement>('.paper1-choice-grid');if(!grid)return;
  const category=page.querySelector<HTMLButtonElement>('[data-choice-tab].active')?.dataset.choiceTab||'Language';
  const query=(page.querySelector<HTMLInputElement>('[data-choice-search]')?.value||'').trim().toLowerCase();
  const rows=(choiceGroups[category]||choiceGroups.Language).filter(item=>!query||`${item.term} ${item.definition} ${item.effect} ${item.meaning} ${item.bad}`.toLowerCase().includes(query));
  if(!rows.length){grid.innerHTML='<div class="paper1-no-match">No authorial choice matches that search.</div>';return}
  grid.innerHTML=`<div class="paper1-choice-table-wrap"><div class="paper1-table-title"><span>${esc(category.toUpperCase())}</span><b>${rows.length} reference entr${rows.length===1?'y':'ies'}</b></div><div class="paper1-table-scroll"><table class="paper1-choice-table"><thead><tr><th>Term</th><th>Definition</th><th>Possible effect</th><th>Possible meaning</th><th>Common weak explanation</th></tr></thead><tbody>${rows.map(item=>`<tr><td data-label="Term"><b>${esc(item.term)}</b></td><td data-label="Definition">${esc(item.definition)}</td><td data-label="Possible effect">${esc(item.effect)}</td><td data-label="Possible meaning">${esc(item.meaning)}</td><td data-label="Common weak explanation" class="weak-cell">${esc(item.bad)}</td></tr>`).join('')}</tbody></table></div><p class="paper1-table-note">Use the table to move from naming a choice to explaining its effect and possible meaning. The final column shows the kind of vague explanation to avoid.</p></div>`;
}

function bindChoiceTable(page:HTMLElement){
  if(page.dataset.choiceTableBound==='true')return;
  page.dataset.choiceTableBound='true';
  page.querySelectorAll<HTMLButtonElement>('[data-choice-tab]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(()=>renderChoiceTable(page))));
  page.querySelector<HTMLInputElement>('[data-choice-search]')?.addEventListener('input',()=>queueMicrotask(()=>renderChoiceTable(page)));
  queueMicrotask(()=>renderChoiceTable(page));
}

function enhance(){
  if(route()!=='paper-1')return;
  const page=document.querySelector<HTMLElement>('.paper1-guide-page');
  if(!page){setTimeout(schedule,120);return}
  cleanStudentFacingCopy(page);
  renderLevelTable(page);
  renderPracticeOverview(page);
  page.querySelector<HTMLElement>('#p1-choices')?.classList.add('paper1-wide-reference');
  bindChoiceTable(page);
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,120));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
