import './paper1-format-polish.css';

const route=()=>location.hash.slice(1).split('#')[0]||'home';

function renderLevelTable(page:HTMLElement){
  const overview=page.querySelector<HTMLElement>('#p1-overview');
  const head=overview?.querySelector<HTMLElement>('.paper1-section-head');
  if(!overview||!head||overview.querySelector('.paper1-level-table-wrap'))return;

  head.insertAdjacentHTML('afterend',`
    <div class="paper1-level-table-wrap" aria-label="Paper 1 SL and HL comparison">
      <div class="paper1-level-table-title">
        <div><span>SL vs HL • AT A GLANCE</span><b>Paper 1 format, timing, marks, and weighting</b></div>
        <small>Quick exam reference</small>
      </div>
      <div class="paper1-level-table-scroll">
        <table class="paper1-level-table">
          <thead>
            <tr><th>Level</th><th>Texts analyzed</th><th>Time given</th><th>Marks available</th><th>Weighting of final grade</th><th>Marking</th></tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Level"><strong class="paper1-level-badge">SL</strong></td>
              <td data-label="Texts analyzed"><b>1 text</b><span>Your choice of the two given</span></td>
              <td data-label="Time given"><strong>1 hour 15 minutes</strong></td>
              <td data-label="Marks available"><strong>20 marks</strong></td>
              <td data-label="Weighting"><strong class="paper1-weight">35%</strong></td>
              <td data-label="Marking"><b>4 criteria</b><span>5 marks each (A–D)</span></td>
            </tr>
            <tr>
              <td data-label="Level"><strong class="paper1-level-badge hl">HL</strong></td>
              <td data-label="Texts analyzed"><b>Both texts</b><span>Two separate analyses</span></td>
              <td data-label="Time given"><strong>2 hours 15 minutes</strong></td>
              <td data-label="Marks available"><strong>40 marks</strong><span>20 per analysis</span></td>
              <td data-label="Weighting"><strong class="paper1-weight">35%</strong></td>
              <td data-label="Marking"><b>Same 4 criteria</b><span>Applied separately to each analysis</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="paper1-level-note"><b>HL reminder:</b> the two analyses are separate standalone responses. They are not compared with one another. <span>These figures are the working course figures in the supplied Paper 1 material; confirm exact current timing and weighting with your teacher/current IB course guide before an exam.</span></p>
    </div>`);

  const verify=overview.querySelector<HTMLElement>('.paper1-verify-note');
  if(verify){
    const title=verify.querySelector<HTMLElement>('b');
    const text=verify.querySelector<HTMLElement>('p');
    if(title)title.textContent='Verification note';
    if(text)text.textContent='The comparison table above shows the working Paper 1 figures clearly. Confirm the exact current assessment details with your teacher or current IB course guide before using them as official exam requirements.';
  }
}

function markChoiceSection(page:HTMLElement){
  page.querySelector<HTMLElement>('#p1-choices')?.classList.add('paper1-wide-reference');
}

function enhance(){
  if(route()!=='paper-1')return;
  const page=document.querySelector<HTMLElement>('.paper1-guide-page');
  if(!page)return;
  renderLevelTable(page);
  markChoiceSection(page);
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,120));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
