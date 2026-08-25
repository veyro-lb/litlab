import './skills-choice-bank-ui-fix.css';

const route=()=>location.hash.slice(1).split('#')[0]||'home';

function compactOptionLabel(value:string){
  let text=value.replace(/\s+/g,' ').trim();
  if(/short sentence length/i.test(text))return 'Sentence length';
  text=text.split(' — ')[0].trim();
  text=text.replace(/,\s*(?:treated|considered|described)\b.*$/i,'').trim();
  text=text.replace(/^(?:A|An)\s+(?=[A-Z])/,'');
  return text;
}

function polishChoiceBank(){
  if(route()!=='skills')return;
  const root=document.querySelector<HTMLElement>('.skills-workspace-body[data-choice-bank-root="true"]');
  if(!root)return;

  root.querySelectorAll<HTMLElement>('.choice-bank-options button p').forEach(label=>{
    if(!label.dataset.fullChoiceLabel)label.dataset.fullChoiceLabel=label.textContent?.trim()||'';
    const source=label.dataset.fullChoiceLabel||label.textContent||'';
    label.textContent=compactOptionLabel(source);
  });

  const filterTitle=root.querySelector<HTMLElement>('.choice-bank-filter-head b');
  if(filterTitle)filterTitle.textContent='Choose your practice set.';
}

let queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;polishChoiceBank()});
}

const app=document.getElementById('root');
if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
