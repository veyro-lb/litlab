// The Start Here vocabulary section used the legacy `glossary` route directly.
// That route now hosts the wider Toolkit shell, so "View full glossary" could
// leave students at the Toolkit landing area instead of the glossary itself.
const DIRECT_GLOSSARY_HASH='glossary#reference';
let focusToken=0;

function currentRoute(){
  return location.hash.slice(1).split('#')[0]||'home';
}

function isFullGlossaryButton(target:EventTarget|null){
  if(!(target instanceof Element))return false;
  const button=target.closest<HTMLButtonElement>('#vocabulary button.text-btn');
  return Boolean(button&&(button.textContent||'').toLowerCase().includes('view full glossary'));
}

function focusGlossaryReference(){
  if(currentRoute()!=='glossary')return;
  const token=++focusToken;
  let attempts=0;

  const tryFocus=()=>{
    if(token!==focusToken||currentRoute()!=='glossary')return;
    attempts+=1;

    const glossaryTab=document.querySelector<HTMLButtonElement>('.keyword-mode-tabs button[data-mode="glossary"]');
    const tools=document.querySelector<HTMLElement>('main .page > .glossary-tools');
    if(glossaryTab&&tools){
      if(!glossaryTab.classList.contains('active'))glossaryTab.click();
      tools.id='glossary-reference';
      requestAnimationFrame(()=>tools.scrollIntoView({behavior:'smooth',block:'start'}));
      return;
    }

    if(attempts<30)window.setTimeout(tryFocus,70);
  };

  window.setTimeout(tryFocus,120);
}

document.addEventListener('click',event=>{
  if(!isFullGlossaryButton(event.target))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.hash=DIRECT_GLOSSARY_HASH;
  focusGlossaryReference();
},true);

window.addEventListener('hashchange',()=>{
  if(location.hash.slice(1)===DIRECT_GLOSSARY_HASH)focusGlossaryReference();
  else focusToken++;
});

window.addEventListener('litlab:feature-ready',()=>{
  if(location.hash.slice(1)===DIRECT_GLOSSARY_HASH)focusGlossaryReference();
});

if(location.hash.slice(1)===DIRECT_GLOSSARY_HASH)focusGlossaryReference();

export {};
