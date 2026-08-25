import {bookProfiles} from './books-data';

const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));

function currentProfile(page:HTMLElement){
  const title=page.querySelector<HTMLElement>('.book-profile-hero-copy h1')?.textContent?.trim();
  return bookProfiles.find(profile=>profile.title===title)||bookProfiles.find(profile=>profile.title.split(';')[0].trim()===title);
}

function bindFilters(page:HTMLElement){
  const wrap=page.querySelector<HTMLElement>('[data-moment-filters]');
  const input=page.querySelector<HTMLInputElement>('[data-moment-search]');
  if(!wrap||wrap.dataset.persepolisFilters==='true')return;
  const options=['All','Revolution','Identity','Gender','War','Displacement'];
  let selected='all';
  wrap.innerHTML=options.map((label,index)=>`<button type="button" data-persepolis-filter="${esc(label.toLowerCase())}" class="${index===0?'active':''}">${esc(label)}</button>`).join('');
  wrap.dataset.persepolisFilters='true';
  wrap.dataset.genericFilters='persepolis';
  const apply=()=>{
    const query=input?.value.trim().toLowerCase()||'';
    page.querySelectorAll<HTMLElement>('[data-moment]').forEach(item=>{
      const text=item.dataset.momentText||'';
      const bySearch=!query||text.includes(query);
      const byFilter=selected==='all'||text.includes(selected);
      item.hidden=!(bySearch&&byFilter);
    });
  };
  wrap.querySelectorAll<HTMLButtonElement>('[data-persepolis-filter]').forEach(button=>button.addEventListener('click',()=>{
    selected=button.dataset.persepolisFilter||'all';
    wrap.querySelectorAll('button').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    apply();
  }));
  input?.addEventListener('input',apply);
}

function apply(page:HTMLElement){
  const profile=currentProfile(page);if(profile?.id!=='persepolis')return;
  const note=page.querySelector<HTMLElement>('.book-source-note p');
  const noteText='This profile paraphrases evidence points rather than reproducing extended passages. Because Persepolis is translated from French, verify exact wording and secondary-character spellings against your assigned edition before using a direct quotation.';
  if(note&&note.textContent!==noteText)note.textContent=noteText;
  const search=page.querySelector<HTMLInputElement>('[data-moment-search]');
  if(search)search.placeholder='Search veil, Anoosh, Vienna, war, departure…';
  bindFilters(page);
}

function sync(){
  if(route()!=='books')return;
  const page=document.querySelector<HTMLElement>('.books-profile-page');if(page)apply(page);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
