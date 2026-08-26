import './books-profile-generic-fixes.css';
import {bookProfiles,type BookProfile} from './books-data';

const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const shortTitle=(profile:BookProfile)=>profile.title.split(';')[0].trim();
const coverTitle=(profile:BookProfile)=>shortTitle(profile).toUpperCase().split(/\s+/).map(esc).join('<br/>');

function styleCover(cover:HTMLElement,profile:BookProfile){
  if(cover.dataset.litlabCover==='v2')return;
  const title=cover.querySelector<HTMLElement>('b');
  const author=cover.querySelector<HTMLElement>('small');
  const mark=cover.querySelector<HTMLElement>('.lit-book-eye');
  if(title&&title.dataset.genericBook!==profile.id){title.innerHTML=coverTitle(profile);title.dataset.genericBook=profile.id}
  if(author)author.textContent=profile.author.toUpperCase();
  if(mark)mark.textContent=profile.id==='frankenstein'?'⚡':'◉';
  cover.dataset.bookCover=profile.id;
  cover.classList.toggle('frankenstein-cover',profile.id==='frankenstein');
}

function applyLibrary(page:HTMLElement){
  const cards=[...page.querySelectorAll<HTMLElement>('[data-open-book]')];
  cards.forEach(card=>{
    const profile=bookProfiles.find(p=>p.id===card.dataset.openBook);if(!profile)return;
    const cover=card.querySelector<HTMLElement>('.lit-book-cover');if(cover)styleCover(cover,profile);
  });
  const heroCover=page.querySelector<HTMLElement>('.books-hero-art .lit-book-cover');
  if(heroCover&&bookProfiles[0])styleCover(heroCover,bookProfiles[0]);
  const stats=page.querySelectorAll<HTMLElement>('.books-hero-stats>div');
  if(stats[0]){
    const label=stats[0].querySelector<HTMLElement>('span');
    if(label)label.textContent=bookProfiles.length===1?'profile live':'profiles live';
  }
  const note=page.querySelector<HTMLElement>('.books-library-note b');
  const noteText=page.querySelector<HTMLElement>('.books-library-note p');
  if(note)note.textContent='Build the library one studied work at a time.';
  if(noteText)noteText.textContent='Every new profile uses the same navigation and revision structure, so you can move between works without relearning the interface.';
}

const candidates=['Ambition','Responsibility','Isolation','Creation','Rejection','Nature','Control','Gender','Resistance','Memory','Complicity','Voice','Revenge','Guilt'];
function profileFilters(profile:BookProfile){
  const text=profile.moments.map(m=>`${m.title} ${m.why} ${m.choices} ${m.themes}`).join(' ').toLowerCase();
  return candidates.filter(x=>text.includes(x.toLowerCase())).slice(0,5);
}

function bindProfileMomentFilters(page:HTMLElement,profile:BookProfile){
  const wrap=page.querySelector<HTMLElement>('[data-moment-filters]');
  const input=page.querySelector<HTMLInputElement>('[data-moment-search]');
  if(!wrap||wrap.dataset.genericFilters===profile.id)return;
  const filters=['All',...profileFilters(profile)];
  wrap.innerHTML=filters.map((x,i)=>`<button type="button" data-generic-moment-filter="${esc(x.toLowerCase())}" class="${i===0?'active':''}">${esc(x)}</button>`).join('');
  wrap.dataset.genericFilters=profile.id;
  let filter='all';
  const apply=()=>{
    const q=input?.value.trim().toLowerCase()||'';
    page.querySelectorAll<HTMLElement>('[data-moment]').forEach(item=>{
      const text=item.dataset.momentText||'';
      item.hidden=!((!q||text.includes(q))&&(filter==='all'||text.includes(filter)));
    });
  };
  wrap.querySelectorAll<HTMLButtonElement>('[data-generic-moment-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    filter=btn.dataset.genericMomentFilter||'all';
    wrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');apply();
  }));
  input?.addEventListener('input',apply);
}

function applyProfile(page:HTMLElement){
  const title=page.querySelector<HTMLElement>('.book-profile-hero-copy h1')?.textContent?.trim();
  const profile=bookProfiles.find(p=>p.title===title)||bookProfiles.find(p=>shortTitle(p)===title);if(!profile)return;
  page.querySelectorAll<HTMLElement>('.lit-book-cover').forEach(cover=>styleCover(cover,profile));
  const finish=page.querySelector<HTMLElement>('.book-finish-card>span');
  if(finish)finish.textContent=`${shortTitle(profile).toUpperCase()} • PROFILE COMPLETE`;
  const note=page.querySelector<HTMLElement>('.book-source-note p');
  if(note){
    note.textContent=profile.id==='frankenstein'
      ?'This profile paraphrases evidence points instead of reproducing extended passages. Confirm whether your class uses the 1818 or 1831 edition, and verify exact wording against that assigned copy before using a direct quotation.'
      :'This profile paraphrases evidence points instead of reproducing extended passages. Check your assigned copy for exact wording before using a direct quotation, and keep novel analysis separate from adaptation details.';
  }
  const search=page.querySelector<HTMLInputElement>('[data-moment-search]');
  if(search)search.placeholder=profile.id==='frankenstein'?'Search creation, rejection, ambition, Arctic…':'Search Ceremony, resistance, Historical Notes…';
  bindProfileMomentFilters(page,profile);
}

function sync(){
  if(location.hash.slice(1).split('#')[0]!=='books')return;
  const library=document.querySelector<HTMLElement>('.books-library-page');if(library)applyLibrary(library);
  const profile=document.querySelector<HTMLElement>('.books-profile-page');if(profile)applyProfile(profile);
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
