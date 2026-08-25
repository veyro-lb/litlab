import './books-library.css';
import {bookProfiles,type BookProfile} from './books-data';

const REVIEW_KEY='litlabBookProfilesReviewed';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const reviewed=()=>{try{const v=JSON.parse(localStorage.getItem(REVIEW_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};

function markReviewed(id:string){
  const list=reviewed();
  if(!list.includes(id))localStorage.setItem(REVIEW_KEY,JSON.stringify([...list,id]));
  try{
    const done=JSON.parse(localStorage.getItem('litlabDone')||'[]');
    if(Array.isArray(done)&&!done.includes('books'))localStorage.setItem('litlabDone',JSON.stringify([...done,'books']));
  }catch{}
}

function cover(profile:BookProfile,large=false){
  return `<div class="lit-book-cover ${large?'large':''}" aria-hidden="true">
    <div class="lit-book-cover-grid"></div><div class="lit-book-eye">◉</div>
    <div class="lit-book-wing left"></div><div class="lit-book-wing right"></div>
    <span>${esc(profile.level.toUpperCase())}</span><b>THE<br/>HANDMAID'S<br/>TALE</b><small>MARGARET ATWOOD</small>
  </div>`;
}

function renderLibrary(page:HTMLElement){
  page.className='page books-library-page';
  page.dataset.booksEnhanced='true';
  page.innerHTML=`
    <section class="books-hero">
      <div class="books-hero-copy"><span class="books-eyebrow">✦ BOOKS • HL LIBRARY</span><h1>Know the work.<br/><em>Build the argument.</em></h1><p>LitLab turns each studied work into a revision profile built around what you actually need later: characters, themes, methods, important moments, evidence anchors, and Paper 2 connections.</p><div class="books-hero-stats"><div><b>${bookProfiles.length}</b><span>profile live</span></div><div><b>${bookProfiles.reduce((n,p)=>n+p.moments.length,0)}</b><span>important moments</span></div><div><b>${bookProfiles.reduce((n,p)=>n+p.arguments.length,0)}</b><span>argument starters</span></div></div></div>
      <div class="books-hero-art">${cover(bookProfiles[0],true)}</div>
    </section>
    <section class="books-library-head"><div><span>YOUR STUDIED WORKS</span><h2>HL book library</h2><p>Each profile is based on the study material added to LitLab and uses custom LitLab artwork rather than commercial cover images.</p></div><label class="books-search"><span>Search library</span><div>⌕<input type="search" placeholder="Title, author, theme…" data-book-search/></div></label></section>
    <div class="books-profile-grid" data-book-grid>${bookProfiles.map((profile,i)=>`
      <button type="button" class="books-profile-card" data-open-book="${esc(profile.id)}" data-search="${esc((profile.title+' '+profile.author+' '+profile.themes.map(t=>t.name).join(' ')).toLowerCase())}">
        ${cover(profile)}<div class="books-card-copy"><span>BOOK ${String(i+1).padStart(2,'0')} • ${esc(profile.level.toUpperCase())}</span><h3>${esc(profile.title)}</h3><p>${esc(profile.author)} • ${esc(profile.year)}</p><div class="books-card-tags">${profile.themes.slice(0,3).map(t=>`<small>${esc(t.name)}</small>`).join('')}</div><b>Open study profile <i>→</i></b></div>
      </button>`).join('')}</div>
    <div class="books-empty" data-books-empty hidden><b>No book profile matches that search.</b><span>Try a title, author, or broad theme.</span></div>
    <section class="books-library-note"><span>01</span><div><b>One profile at a time.</b><p>This library will grow as each studied-work document is added. The structure is already reusable, so later books can slot into the same system without changing how students navigate.</p></div></section>`;

  page.querySelectorAll<HTMLButtonElement>('[data-open-book]').forEach(btn=>btn.addEventListener('click',()=>{
    const profile=bookProfiles.find(p=>p.id===btn.dataset.openBook);if(profile)renderProfile(page,profile);
  }));
  const input=page.querySelector<HTMLInputElement>('[data-book-search]');
  input?.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();let visible=0;
    page.querySelectorAll<HTMLElement>('[data-open-book]').forEach(card=>{const show=!q||(card.dataset.search||'').includes(q);card.hidden=!show;if(show)visible++});
    const empty=page.querySelector<HTMLElement>('[data-books-empty]');if(empty)empty.hidden=visible>0;
  });
}

function renderProfile(page:HTMLElement,profile:BookProfile){
  const isReviewed=reviewed().includes(profile.id);
  page.className='page books-profile-page';
  page.innerHTML=`
    <div class="book-profile-topline"><button type="button" data-back-library>← Back to Books</button><span>${esc(profile.level)} • ${esc(profile.year)}</span></div>
    <section class="book-profile-hero">
      <div class="book-profile-cover-wrap">${cover(profile,true)}</div>
      <div class="book-profile-hero-copy"><span class="books-eyebrow">✦ BOOK PROFILE • HL STUDIED WORK</span><h1>${esc(profile.title)}</h1><p class="book-byline">${esc(profile.author)}</p><div class="book-facts"><span><b>Published</b>${esc(profile.year)}</span><span><b>Form</b>${esc(profile.form)}</span><span><b>Language</b>${esc(profile.language)}</span></div><p class="book-profile-lead">${esc(profile.overview)}</p><div class="book-profile-actions"><button type="button" class="btn primary" data-jump="book-themes">Start with themes →</button><button type="button" class="btn secondary ${isReviewed?'reviewed':''}" data-mark-book>${isReviewed?'✓ Profile reviewed':'Mark profile reviewed'}</button></div></div>
    </section>
    <nav class="book-profile-toc" aria-label="Book profile sections">${[['book-overview','Overview'],['book-characters','Characters'],['book-themes','Themes'],['book-symbols','Symbols + motifs'],['book-choices','Authorial choices'],['book-voice','Voice + structure'],['book-moments','Important moments'],['book-paper2','Paper 2'],['book-arguments','Arguments'],['book-review','Misunderstandings + FAQ']].map(([id,label])=>`<button type="button" data-jump="${id}">${label}</button>`).join('')}</nav>

    <section id="book-overview" class="book-section"><div class="book-section-head"><span>01 • OVERVIEW</span><h2>What world are we entering?</h2></div><div class="book-overview-grid"><article><span>SHORT OVERVIEW</span><p>${esc(profile.overview)}</p></article><article><span>CONTEXT RELEVANT TO ANALYSIS</span><p>${esc(profile.context)}</p></article></div><div class="book-source-note"><b>Edition / quotation note</b><p>This profile paraphrases evidence points instead of reproducing extended passages. Check your assigned copy for exact wording before using a direct quotation, and keep novel analysis separate from adaptation details.</p></div></section>

    <section id="book-characters" class="book-section"><div class="book-section-head"><span>02 • CHARACTERS</span><h2>Track development, relationships, and construction.</h2><p>Open a character to see how role, development, themes, and characterization methods connect.</p></div><div class="book-character-grid">${profile.characters.map(c=>`<details class="book-character"><summary><div><span>CHARACTER</span><h3>${esc(c.name)}</h3><p>${esc(c.role)}</p></div><b>+</b></summary><div class="book-character-body"><div><span>DEVELOPMENT</span><p>${esc(c.development)}</p></div><div><span>THEMES / DECISIONS</span><p>${esc(c.themes)}</p></div><div><span>CHARACTERIZATION METHODS</span><p>${esc(c.methods)}</p></div></div></details>`).join('')}</div></section>

    <section id="book-themes" class="book-section"><div class="book-section-head"><span>03 • THEMES</span><h2>Theme is stronger when you can explain how it is built.</h2></div><div class="book-theme-grid">${profile.themes.map((t,i)=>`<article class="book-theme-card"><div class="book-theme-no">${String(i+1).padStart(2,'0')}</div><h3>${esc(t.name)}</h3><div><span>HOW IT APPEARS</span><p>${esc(t.appears)}</p></div><div><span>AUTHORIAL CONSTRUCTION</span><p>${esc(t.choices)}</p></div><div><span>INTERPRETATION</span><p>${esc(t.interpretation)}</p></div>${t.compare?`<small>COMPARE WITH • ${esc(t.compare)}</small>`:''}</article>`).join('')}</div></section>

    <section id="book-symbols" class="book-section"><div class="book-section-head"><span>04 • SYMBOLS + MOTIFS</span><h2>Recurring details worth remembering.</h2></div><div class="book-dual-grid"><div><h3>Symbols</h3><div class="book-reference-list">${profile.symbols.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></div><div><h3>Motifs</h3><div class="book-reference-list">${profile.motifs.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></div></div></section>

    <section id="book-choices" class="book-section"><div class="book-section-head"><span>05 • AUTHORIAL CHOICES</span><h2>Methods that shape the whole novel.</h2><p>Use these as starting points, then anchor them in a specific moment when writing.</p></div><div class="book-choice-grid">${profile.choices.map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></section>

    <section id="book-voice" class="book-section"><div class="book-section-head"><span>06 • VOICE + STRUCTURE + SETTING</span><h2>Three large-scale choices that change interpretation.</h2></div><div class="book-big-choice-grid"><article><span>NARRATIVE PERSPECTIVE / VOICE</span><p>${esc(profile.voice)}</p></article><article><span>STRUCTURE</span><p>${esc(profile.structure)}</p></article><article><span>SETTING</span><p>${esc(profile.setting)}</p></article></div></section>

    <section id="book-moments" class="book-section"><div class="book-section-head"><span>07 • IMPORTANT MOMENTS</span><h2>Twenty moments worth being able to locate and use.</h2><p>Search the timeline instead of memorizing a random quotation list. Know what happens, what choice matters, and what argument the moment can support.</p></div><div class="book-moment-tools"><label><span>Find a moment</span><input type="search" placeholder="Search Ceremony, resistance, Historical Notes…" data-moment-search/></label><div class="book-moment-filters" data-moment-filters>${['All','Control','Gender','Resistance','Memory','Complicity'].map((x,i)=>`<button type="button" data-moment-filter="${x.toLowerCase()}" class="${i===0?'active':''}">${x}</button>`).join('')}</div></div><div class="book-moment-list" data-moment-list>${profile.moments.map(m=>`<details data-moment data-moment-text="${esc((m.title+' '+m.why+' '+m.choices+' '+m.themes+' '+(m.paper2||'')).toLowerCase())}"><summary><span>${String(m.n).padStart(2,'0')}</span><div><h3>${esc(m.title)}</h3><p>${esc(m.themes)}</p></div><b>+</b></summary><div class="book-moment-body"><div><span>WHY IT MATTERS</span><p>${esc(m.why)}</p></div><div><span>CHOICE(S)</span><p>${esc(m.choices)}</p></div>${m.paper2?`<div><span>PAPER 2 USE</span><p>${esc(m.paper2)}</p></div>`:''}</div></details>`).join('')}</div><div class="book-evidence-panel"><div><span>EVIDENCE ANCHORS • PARAPHRASED</span><h3>Three moments to know especially well.</h3><p>These are evidence locations, not ready-made direct quotations.</p></div><div>${profile.evidence.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></div></section>

    <section id="book-paper2" class="book-section"><div class="book-section-head"><span>08 • PAPER 2 CONNECTIONS</span><h2>Compare methods, not only themes.</h2><p>These pairings come from the current study profile. Use them when the comparison work is one you have actually studied.</p></div><div class="book-table-wrap"><table class="book-comparison-table"><thead><tr><th>Theme / idea</th><th>Compare with</th><th>Similarity</th><th>Difference</th><th>Authorial methods</th><th>Why it matters</th></tr></thead><tbody>${profile.connections.map(c=>`<tr><td data-label="Theme / idea"><b>${esc(c.theme)}</b></td><td data-label="Compare with"><strong>${esc(c.with)}</strong></td><td data-label="Similarity">${esc(c.similarity)}</td><td data-label="Difference">${esc(c.difference)}</td><td data-label="Authorial methods">${esc(c.methods)}</td><td data-label="Why it matters">${esc(c.why)}</td></tr>`).join('')}</tbody></table></div></section>

    <section id="book-arguments" class="book-section"><div class="book-section-head"><span>09 • POSSIBLE ARGUMENTS</span><h2>Ten directions you can adapt to an actual prompt.</h2><p>These are argument starters, not sentences to memorize unchanged.</p></div><div class="book-argument-grid">${profile.arguments.map((a,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${esc(a)}</p></article>`).join('')}</div></section>

    <section id="book-review" class="book-section"><div class="book-section-head"><span>10 • REVIEW</span><h2>Common misunderstandings and book FAQs.</h2></div><div class="book-review-grid"><div><h3>Common misunderstandings</h3>${profile.misunderstandings.map((x,i)=>`<article><span>${i+1}</span><p>${esc(x)}</p></article>`).join('')}</div><div><h3>Book FAQs</h3>${profile.faqs.map(x=>`<details><summary>${esc(x.q)}<b>+</b></summary><p>${esc(x.a)}</p></details>`).join('')}</div></div><div class="book-finish-card"><span>THE HANDMAID'S TALE • PROFILE COMPLETE</span><h3>Use the profile to find evidence, not replace rereading.</h3><p>The strongest revision combines this map with your own copy, annotations, class discussion, and teacher priorities.</p><button type="button" class="btn primary ${isReviewed?'reviewed':''}" data-mark-book>${isReviewed?'✓ Profile reviewed':'Mark profile reviewed'}</button></div></section>`;

  page.querySelectorAll<HTMLButtonElement>('[data-back-library]').forEach(btn=>btn.addEventListener('click',()=>{renderLibrary(page);window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'})}));
  page.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.jump||'')?.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'})));
  page.querySelectorAll<HTMLButtonElement>('[data-mark-book]').forEach(btn=>btn.addEventListener('click',()=>{
    markReviewed(profile.id);page.querySelectorAll<HTMLButtonElement>('[data-mark-book]').forEach(b=>{b.textContent='✓ Profile reviewed';b.classList.add('reviewed')});
  }));
  bindMomentFilters(page);
  window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
}

function bindMomentFilters(page:HTMLElement){
  const input=page.querySelector<HTMLInputElement>('[data-moment-search]');let filter='all';
  const apply=()=>{const q=input?.value.trim().toLowerCase()||'';page.querySelectorAll<HTMLElement>('[data-moment]').forEach(item=>{const text=item.dataset.momentText||'';const byText=!q||text.includes(q);const byFilter=filter==='all'||text.includes(filter);item.hidden=!(byText&&byFilter)});};
  input?.addEventListener('input',apply);
  page.querySelectorAll<HTMLButtonElement>('[data-moment-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.momentFilter||'all';page.querySelectorAll('[data-moment-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');apply()}));
}

function sync(){
  if(route()!=='books')return;
  const page=document.querySelector<HTMLElement>('#main > .page');
  if(!page||page.dataset.booksEnhanced==='true'||page.classList.contains('books-profile-page'))return;
  renderLibrary(page);
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}
const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,90));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
