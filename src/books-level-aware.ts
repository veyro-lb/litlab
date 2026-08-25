import './books-level-aware.css';
import {bookProfiles,type BookProfile} from './books-data';

const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const levelOf=(profile:BookProfile)=>profile.level.toLowerCase().startsWith('sl')?'sl':'hl';
const currentProfile=(page:HTMLElement)=>{
  const title=page.querySelector<HTMLElement>('.book-profile-hero-copy h1')?.textContent?.trim();
  return bookProfiles.find(p=>p.title===title)||bookProfiles.find(p=>p.title.split(';')[0].trim()===title);
};

function applyLibrary(page:HTMLElement){
  const eyebrow=page.querySelector<HTMLElement>('.books-hero .books-eyebrow');
  if(eyebrow&&eyebrow.textContent!=='✦ BOOKS • DP STUDIED WORKS')eyebrow.textContent='✦ BOOKS • DP STUDIED WORKS';
  const heading=page.querySelector<HTMLElement>('.books-library-head h2');
  if(heading&&heading.textContent!=='DP studied-works library')heading.textContent='DP studied-works library';
  const intro=page.querySelector<HTMLElement>('.books-library-head>div>p');
  if(intro&&intro.textContent?.startsWith('Each profile is based'))intro.textContent='Browse the works added to LitLab, with HL and SL clearly labeled. Every profile uses the same revision structure and custom LitLab artwork.';

  const cards=[...page.querySelectorAll<HTMLElement>('[data-open-book]')];
  cards.forEach(card=>{
    const profile=bookProfiles.find(p=>p.id===card.dataset.openBook);if(!profile)return;
    card.dataset.bookLevel=levelOf(profile);
    card.setAttribute('aria-label',`${profile.title}, ${profile.level}`);
  });

  let filters=page.querySelector<HTMLElement>('[data-book-level-filters]');
  if(!filters){
    const host=page.querySelector<HTMLElement>('.books-library-head>div');
    if(host){
      const hl=bookProfiles.filter(p=>levelOf(p)==='hl').length,sl=bookProfiles.filter(p=>levelOf(p)==='sl').length;
      filters=document.createElement('div');filters.className='books-level-filters';filters.dataset.bookLevelFilters='true';
      filters.innerHTML=`<button type="button" class="active" data-book-level="all">All <span>${bookProfiles.length}</span></button><button type="button" data-book-level="hl">HL <span>${hl}</span></button><button type="button" data-book-level="sl">SL <span>${sl}</span></button>`;
      host.append(filters);
    }
  }
  if(!filters||filters.dataset.bound==='true')return;
  filters.dataset.bound='true';let selected='all';
  const input=page.querySelector<HTMLInputElement>('[data-book-search]');
  const apply=()=>{
    const q=input?.value.trim().toLowerCase()||'';let visible=0;
    cards.forEach(card=>{
      const byLevel=selected==='all'||card.dataset.bookLevel===selected;
      const bySearch=!q||(card.dataset.search||'').includes(q);
      card.hidden=!(byLevel&&bySearch);if(!card.hidden)visible++;
    });
    const empty=page.querySelector<HTMLElement>('[data-books-empty]');if(empty)empty.hidden=visible>0;
  };
  filters.querySelectorAll<HTMLButtonElement>('[data-book-level]').forEach(btn=>btn.addEventListener('click',()=>{
    selected=btn.dataset.bookLevel||'all';filters?.querySelectorAll('button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');apply();
  }));
  input?.addEventListener('input',apply);
}

function setNineteenEightyFourFilters(page:HTMLElement){
  const wrap=page.querySelector<HTMLElement>('[data-moment-filters]');
  const input=page.querySelector<HTMLInputElement>('[data-moment-search]');
  if(!wrap||wrap.dataset.levelAwareFilters==='nineteen-eighty-four')return;
  const options=['All','Control','Resistance','Truth','Betrayal','Surveillance'];let selected='all';
  wrap.innerHTML=options.map((x,i)=>`<button type="button" data-level-moment-filter="${esc(x.toLowerCase())}" class="${i===0?'active':''}">${esc(x)}</button>`).join('');
  wrap.dataset.levelAwareFilters='nineteen-eighty-four';
  const apply=()=>{
    const q=input?.value.trim().toLowerCase()||'';
    page.querySelectorAll<HTMLElement>('[data-moment]').forEach(item=>{
      const text=item.dataset.momentText||'';item.hidden=!((!q||text.includes(q))&&(selected==='all'||text.includes(selected)));
    });
  };
  wrap.querySelectorAll<HTMLButtonElement>('[data-level-moment-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    selected=btn.dataset.levelMomentFilter||'all';wrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');apply();
  }));
  input?.addEventListener('input',apply);
}

function applyProfile(page:HTMLElement){
  const profile=currentProfile(page);if(!profile)return;
  page.dataset.profileLevel=levelOf(profile);
  const eyebrow=page.querySelector<HTMLElement>('.book-profile-hero .books-eyebrow');
  const label=`✦ BOOK PROFILE • ${profile.level.toUpperCase()}`;
  if(eyebrow&&eyebrow.textContent!==label)eyebrow.textContent=label;
  if(profile.id==='nineteen-eighty-four'){
    const note=page.querySelector<HTMLElement>('.book-source-note p');
    if(note&&!note.textContent?.includes('Newspeak appendix'))note.textContent='This profile paraphrases evidence points instead of reproducing extended passages. Verify exact wording against your assigned copy before using a direct quotation. Also check whether your class edition includes supplementary material beyond the Newspeak appendix.';
    const search=page.querySelector<HTMLInputElement>('[data-moment-search]');
    if(search)search.placeholder='Search diary, surveillance, Room 101, betrayal…';
    setNineteenEightyFourFilters(page);
  }
}

function sync(){
  if(route()!=='books')return;
  const library=document.querySelector<HTMLElement>('.books-library-page');if(library)applyLibrary(library);
  const profile=document.querySelector<HTMLElement>('.books-profile-page');if(profile)applyProfile(profile);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
