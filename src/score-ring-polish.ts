import './score-ring-polish.css';

let scheduled=false;

function clamp(value:number,min:number,max:number){
  return Math.min(max,Math.max(min,value));
}

function fractionFromRing(ring:HTMLElement){
  const text=(ring.querySelector('small')?.textContent||'').trim();
  const match=text.match(/(\d+)\s*(?:\/|of)\s*(\d+)/i);
  if(!match)return null;
  const correct=Number(match[1]);
  const total=Number(match[2]);
  if(!Number.isFinite(correct)||!Number.isFinite(total)||total<=0)return null;
  return {correct:clamp(correct,0,total),total};
}

function polishRing(ring:HTMLElement){
  const fraction=fractionFromRing(ring);
  if(!fraction)return;

  const {correct,total}=fraction;
  const missed=Math.max(0,total-correct);
  const pct=clamp(Math.round((correct/total)*100),0,100);
  const band=pct>=75?'strong':pct>=50?'developing':'review';

  ring.dataset.scorePolished='true';
  ring.dataset.scoreBand=band;
  ring.style.setProperty('--litlab-score',String(pct));
  ring.setAttribute('role','img');
  ring.setAttribute('aria-label',`${pct}% accuracy: ${correct} of ${total} answers correct`);

  const number=ring.querySelector<HTMLElement>('b');
  const detail=ring.querySelector<HTMLElement>('small');
  if(number)number.innerHTML=`${pct}<span>%</span>`;
  if(detail)detail.textContent=`${correct} of ${total} correct`;

  const result=ring.closest<HTMLElement>('.lab-result');
  if(!result||result.querySelector(':scope > .score-clarity'))return;

  const clarity=document.createElement('div');
  clarity.className='score-clarity';
  clarity.innerHTML=`
    <div><small>ACCURACY</small><b>${pct}%</b></div>
    <div><small>CORRECT</small><b>${correct} / ${total}</b></div>
    <div><small>TO REVIEW</small><b>${missed}</b></div>
    <p>Calculated from this attempt: correct answers ÷ total questions × 100.</p>`;
  ring.insertAdjacentElement('afterend',clarity);
}

function polishScores(){
  document.querySelectorAll<HTMLElement>('.score-ring').forEach(polishRing);
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    polishScores();
  });
}

const root=document.getElementById('root');
if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
