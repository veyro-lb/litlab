import './books-library.css';
import './books-cover-system.css';
import './books-poetry.css';
import {bookProfiles,type BookPoetry,type BookProfile} from './books-data';

const REVIEW_KEY='litlabBookProfilesReviewed';
const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const route=()=>location.hash.slice(1).split('#')[0]||'home';
const esc=(value:string)=>value.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]||ch));
const reviewed=()=>{try{const v=JSON.parse(localStorage.getItem(REVIEW_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};

type CoverMotif='handmaid'|'surveillance'|'electric'|'persepolis'|'sun'|'voice'|'generic';
type CoverSpec={title?:string;motif:CoverMotif;base:string;wash:string;ink:string;accent:string};
const coverSpecs:Record<string,CoverSpec>={
  'handmaids-tale':{title:"THE HANDMAID'S TALE",motif:'handmaid',base:'#75152d',wash:'#d44958',ink:'#fff7ee',accent:'#f2cbbf'},
  'nineteen-eighty-four':{title:'1984',motif:'surveillance',base:'#090d14',wash:'#252b35',ink:'#f4efe7',accent:'#ef3e50'},
  frankenstein:{title:'FRANKENSTEIN',motif:'electric',base:'#07140f',wash:'#143725',ink:'#efffe7',accent:'#9beb62'},
  persepolis:{title:'PERSEPOLIS',motif:'persepolis',base:'#f1eadf',wash:'#d7cfc4',ink:'#171717',accent:'#cf413c'},
  'the-stranger':{title:'THE STRANGER',motif:'sun',base:'#d78728',wash:'#f3c96d',ink:'#1e1710',accent:'#ff5d33'},
  'carol-ann-duffy':{title:'SELECTED POEMS',motif:'voice',base:'#24143b',wash:'#65408a',ink:'#fbf3ff',accent:'#d69cff'}
};
const fallbackCover:CoverSpec={motif:'generic',base:'#19162f',wash:'#493b7c',ink:'#f8f6ff',accent:'#9b82ff'};
const compactLevel=(level:string)=>level.replace(/\s*studied work\s*/i,'').trim().toUpperCase()||'LITLAB';
const compactYear=(year:string)=>year==='Coming soon'?'COMING SOON':year.split('/')[0].trim();

function coverMotif(motif:CoverMotif){
  if(motif==='handmaid')return `<div class="lit-cover-motif motif-handmaid"><i class="hm-halo"></i><i class="hm-face"></i><i class="hm-wing hm-left"></i><i class="hm-wing hm-right"></i><i class="hm-eye"></i></div>`;
  if(motif==='surveillance')return `<div class="lit-cover-motif motif-surveillance"><b>84</b><i class="sv-lens"></i><i class="sv-beam"></i><i class="sv-scan one"></i><i class="sv-scan two"></i></div>`;
  if(motif==='electric')return `<div class="lit-cover-motif motif-electric"><i class="el-bolt"></i><i class="el-body"></i><i class="el-stitch s1"></i><i class="el-stitch s2"></i><i class="el-stitch s3"></i><span>+</span></div>`;
  if(motif==='persepolis')return `<div class="lit-cover-motif motif-persepolis"><i class="pp-panel p1"></i><i class="pp-panel p2"></i><i class="pp-panel p3"></i><i class="pp-face"></i><i class="pp-hair"></i><i class="pp-scarf"></i></div>`;
  if(motif==='sun')return `<div class="lit-cover-motif motif-sun"><i class="sun-disc"></i><i class="sun-horizon"></i><i class="sun-figure"></i><i class="sun-shadow"></i></div>`;
  if(motif==='voice')return `<div class="lit-cover-motif motif-voice"><b>“</b><i class="voice-line v1"></i><i class="voice-line v2"></i><i class="voice-line v3"></i><span>VOICE</span></div>`;
  return `<div class="lit-cover-motif motif-generic"><b>LL</b><i></i><span>STUDY EDITION</span></div>`;
}

function markReviewed(id:string){
  const list=reviewed();
  if(!list.includes(id))localStorage.setItem(REVIEW_KEY,JSON.stringify([...list,id]));
  try{
    const done=JSON.parse(localStorage.getItem('litlabDone')||'[]');
    if(Array.isArray(done)&&!done.includes('books'))localStorage.setItem('litlabDone',JSON.stringify([...done,'books']));
  }catch{}
}

function cover(profile:BookProfile,large=false){
  const spec=coverSpecs[profile.id]||fallbackCover;
  return `<div class="lit-book-cover ${large?'large':''}" data-litlab-cover="v2" data-cover-id="${esc(profile.id)}" data-book-id="${esc(profile.id)}" style="--cover-base:${spec.base};--cover-wash:${spec.wash};--cover-ink:${spec.ink};--cover-accent:${spec.accent}" aria-hidden="true">
    <div class="lit-cover-texture"></div>
    <div class="lit-cover-series"><span>${esc(compactLevel(profile.level))}</span><b>LITLAB</b></div>
    ${coverMotif(spec.motif)}
    <div class="lit-cover-copy"><strong>${esc(spec.title||profile.title.toUpperCase())}</strong><small>${esc(profile.author||'LITLAB STUDY PROFILE')}</small></div>
    <div class="lit-cover-foot"><span>STUDY EDITION</span><b>${esc(compactYear(profile.year))}</b></div>
  </div>`;
}

function renderLibrary(page:HTMLElement){
  page.className='page books-library-page';
  page.dataset.booksEnhanced='true';
  delete page.dataset.activeBook;
  delete page.dataset.poetryProfile;
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
  page.dataset.activeBook=profile.id;
  const poetry=profile.poetry;
  page.toggleAttribute('data-poetry-profile', Boolean(poetry));
  const sections=[
    ['book-overview','Overview'], ['book-characters',poetry?'Speakers':'Characters'], ['book-themes','Themes'],
    ['book-symbols','Symbols + motifs'], ['book-choices',poetry?'Poetic choices':'Authorial choices'],
    ['book-voice','Voice + structure'], ['book-moments',poetry?'Explore poems':'Important moments'],
    ['book-paper2','Paper 2'], ['book-arguments','Arguments'],
    ...(poetry?[['book-practice','Quick practice']]:[]), ['book-review','Misunderstandings + FAQ'],
  ];
  page.innerHTML=`
    <div class="book-profile-topline"><button type="button" data-back-library>← Back to Books</button><span>${esc(profile.level)} • ${esc(profile.year)}</span></div>
    <section class="book-profile-hero">
      <div class="book-profile-cover-wrap">${cover(profile,true)}</div>
      <div class="book-profile-hero-copy"><span class="books-eyebrow">✦ BOOK PROFILE • HL STUDIED WORK</span><h1>${esc(profile.title)}</h1><p class="book-byline">${esc(profile.author)}</p><div class="book-facts"><span><b>${poetry?'Scope':'Published'}</b>${esc(profile.year)}</span><span><b>Form</b>${esc(profile.form)}</span><span><b>Language</b>${esc(profile.language)}</span></div><p class="book-profile-lead">${esc(profile.overview)}</p><div class="book-profile-actions"><button type="button" class="btn primary" data-jump="${poetry?'book-moments':'book-themes'}">${poetry?'Explore the poems':'Start with themes →'}</button><button type="button" class="btn secondary ${isReviewed?'reviewed':''}" data-mark-book>${isReviewed?'✓ Profile reviewed':'Mark profile reviewed'}</button></div></div>
    </section>
    <nav class="book-profile-toc" aria-label="Book profile sections">${sections.map(([id,label])=>`<button type="button" data-jump="${id}">${label}</button>`).join('')}</nav>

    <section id="book-overview" class="book-section"><div class="book-section-head"><span>01 • OVERVIEW</span><h2>${poetry?'About the poet and the selection':'What world are we entering?'}</h2></div><div class="book-overview-grid"><article><span>SHORT OVERVIEW</span><p>${esc(profile.overview)}</p></article><article><span>CONTEXT RELEVANT TO ANALYSIS</span><p>${esc(profile.context)}</p></article></div><div class="book-source-note"><b>Edition / quotation note</b><p>${esc(poetry?.sourceNote || 'This profile paraphrases evidence points instead of reproducing extended passages. Check your assigned copy for exact wording before using a direct quotation, and keep novel analysis separate from adaptation details.')}</p></div>${poetry?`<p class="book-poetry-sources">Further reading · ${poetry.sources.map(source=>`<a href="${esc(source.url)}">${esc(source.title)}</a>`).join(' · ')}</p>`:''}</section>

    <section id="book-characters" class="book-section"><div class="book-section-head"><span>02 • ${poetry?'SPEAKERS &amp; PERSONAS':'CHARACTERS'}</span><h2>${poetry?'Who is speaking?':'Track development, relationships, and construction.'}</h2><p>${poetry?'Open a speaker group to see how voice and perspective shape the poem.':'Open a character to see how role, development, themes, and characterization methods connect.'}</p></div><div class="book-character-grid">${profile.characters.map(c=>`<details class="book-character"><summary><div><span>${poetry?'PERSONA':'CHARACTER'}</span><h3>${esc(c.name)}</h3><p>${esc(c.role)}</p></div><b>+</b></summary><div class="book-character-body"><div><span>DEVELOPMENT</span><p>${esc(c.development)}</p></div><div><span>THEMES / DECISIONS</span><p>${esc(c.themes)}</p></div><div><span>${poetry?'HOW THE VOICE IS BUILT':'CHARACTERIZATION METHODS'}</span><p>${esc(c.methods)}</p></div></div></details>`).join('')}</div></section>

    <section id="book-themes" class="book-section"><div class="book-section-head"><span>03 • THEMES</span><h2>Theme is stronger when you can explain how it is built.</h2></div><div class="book-theme-grid">${profile.themes.map((t,i)=>`<article class="book-theme-card"><div class="book-theme-no">${String(i+1).padStart(2,'0')}</div><h3>${esc(t.name)}</h3><div><span>HOW IT APPEARS</span><p>${esc(t.appears)}</p></div><div><span>AUTHORIAL CONSTRUCTION</span><p>${esc(t.choices)}</p></div><div><span>INTERPRETATION</span><p>${esc(t.interpretation)}</p></div>${t.compare?`<small>COMPARE WITH • ${esc(t.compare)}</small>`:''}</article>`).join('')}</div></section>

    <section id="book-symbols" class="book-section"><div class="book-section-head"><span>04 • SYMBOLS + MOTIFS</span><h2>Recurring details worth remembering.</h2></div><div class="book-dual-grid"><div><h3>Symbols</h3><div class="book-reference-list">${profile.symbols.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></div><div><h3>Motifs</h3><div class="book-reference-list">${profile.motifs.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join('')}</div></div></div></section>

    <section id="book-choices" class="book-section"><div class="book-section-head"><span>05 • ${poetry?'POETIC CHOICES':'AUTHORIAL CHOICES'}</span><h2>${poetry?'How Duffy makes meaning through form and language':'Methods that shape the whole novel.'}</h2><p>${poetry?'Choose a method and trace how it works in one poem.':'Use these as starting points, then anchor them in a specific moment when writing.'}</p></div><div class="book-choice-grid">${profile.choices.map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></section>

    <section id="book-voice" class="book-section"><div class="book-section-head"><span>06 • VOICE + STRUCTURE + SETTING</span><h2>Three large-scale choices that change interpretation.</h2></div><div class="book-big-choice-grid"><article><span>${poetry?'SPEAKER / PERSPECTIVE':'NARRATIVE PERSPECTIVE / VOICE'}</span><p>${esc(profile.voice)}</p></article><article><span>STRUCTURE</span><p>${esc(profile.structure)}</p></article><article><span>SETTING</span><p>${esc(profile.setting)}</p></article></div></section>

    ${renderBookMoments(profile)}

    <section id="book-paper2" class="book-section"><div class="book-section-head"><span>08 • PAPER 2 CONNECTIONS</span><h2>Compare methods, not only themes.</h2><p>These pairings come from the current study profile. Use them when the comparison work is one you have actually studied.</p></div><div class="book-table-wrap"><table class="book-comparison-table"><thead><tr><th>Theme / idea</th><th>Compare with</th><th>Similarity</th><th>Difference</th><th>Authorial methods</th><th>Why it matters</th></tr></thead><tbody>${profile.connections.map(c=>`<tr><td data-label="Theme / idea"><b>${esc(c.theme)}</b></td><td data-label="Compare with"><strong>${esc(c.with)}</strong></td><td data-label="Similarity">${esc(c.similarity)}</td><td data-label="Difference">${esc(c.difference)}</td><td data-label="Authorial methods">${esc(c.methods)}</td><td data-label="Why it matters">${esc(c.why)}</td></tr>`).join('')}</tbody></table></div></section>

    <section id="book-arguments" class="book-section"><div class="book-section-head"><span>09 • POSSIBLE ARGUMENTS</span><h2>${poetry?'Argument starters for Duffy’s poetry':'Ten directions you can adapt to an actual prompt.'}</h2><p>These are argument starters, not sentences to memorize unchanged.</p></div><div class="book-argument-grid">${profile.arguments.map((a,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${esc(a)}</p></article>`).join('')}</div></section>

    ${poetry?renderPoetryPractice(poetry):''}
    <section id="book-review" class="book-section"><div class="book-section-head"><span>10 • REVIEW</span><h2>Common misunderstandings and ${poetry?'poetry':'book'} FAQs.</h2></div><div class="book-review-grid"><div><h3>Common misunderstandings</h3>${profile.misunderstandings.map((x,i)=>`<article><span>${i+1}</span><p>${esc(x)}</p></article>`).join('')}</div><div><h3>${poetry?'Poetry':'Book'} FAQs</h3>${profile.faqs.map(x=>`<details><summary>${esc(x.q)}<b>+</b></summary><p>${esc(x.a)}</p></details>`).join('')}</div></div><div class="book-finish-card"><span>${esc(profile.title.split(';')[0].trim().toUpperCase())} • PROFILE COMPLETE</span><h3>Use the profile to find evidence, not replace rereading.</h3><p>The strongest revision combines this map with your own copy, annotations, class discussion, and teacher priorities.</p><button type="button" class="btn primary ${isReviewed?'reviewed':''}" data-mark-book>${isReviewed?'✓ Profile reviewed':'Mark profile reviewed'}</button></div></section>`;

  page.querySelectorAll<HTMLButtonElement>('[data-back-library]').forEach(btn=>btn.addEventListener('click',()=>{renderLibrary(page);window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'})}));
  page.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach(button=>button.addEventListener('click',()=>{
    const section=document.getElementById(button.dataset.jump||'');
    if(!section)return;
    const heading=section.querySelector('h2');
    if(heading){
      heading.tabIndex=-1;
      heading.focus({preventScroll:true});
    }
    section.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
  }));
  page.querySelectorAll<HTMLButtonElement>('[data-mark-book]').forEach(btn=>btn.addEventListener('click',()=>{
    markReviewed(profile.id);page.querySelectorAll<HTMLButtonElement>('[data-mark-book]').forEach(b=>{b.textContent='✓ Profile reviewed';b.classList.add('reviewed')});
  }));
  if(poetry)bindPoetryPractice(page,poetry);
  bindMomentFilters(page);
  window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
}

function renderBookMoments(profile: BookProfile) {
  const poetry=profile.poetry;
  const catalog=poetry?.catalog.flatMap(group=>group.titles.map(title=>({title, collection:group.collection})))||[];
  const collections=[...new Set([
    ...profile.moments.flatMap(moment=>moment.collection?[moment.collection]:[]),
    ...catalog.map(entry=>entry.collection),
  ])].sort((left,right)=>left.localeCompare(right));
  const byTitle=(left:{title:string},right:{title:string})=>left.title.localeCompare(right.title);
  const moments=poetry?[...profile.moments].sort((left,right)=>{
    if(left.reading&&right.reading)return left.reading.pdfPage-right.reading.pdfPage;
    return Number(Boolean(right.reading))-Number(Boolean(left.reading))||byTitle(left,right);
  }):profile.moments;
  const filters=['All','Control','Gender','Resistance','Memory','Complicity'];
  return `<section id="book-moments" class="book-section">
    <div class="book-section-head">
      <span>07 • ${poetry?'POEMS':'IMPORTANT MOMENTS'}</span>
      <h2>${poetry?'Poem guide and index':'Twenty moments worth being able to locate and use.'}</h2>
      <p>${poetry?'Explore the main collection in reading order. Search by poem, theme or technique, or change the collection to browse the wider index.':'Use the timeline to find what happens, how it is written, and what argument it can support.'}</p>
    </div>
    <div class="book-moment-tools ${poetry?'book-poetry-tools':''}">
      <label>
        <span>${poetry?'Search poems':'Find a moment'}</span>
        <input type="search" placeholder="${poetry?'Try sonnet, grief, or Medusa…':'Search Ceremony, resistance, Historical Notes…'}" data-moment-search/>
      </label>
      ${poetry?`<label>
        <span id="book-poem-collection-label">Collection</span>
        <select data-poem-collection aria-labelledby="book-poem-collection-label">
          <option value="">All collections</option>
          ${collections.map(collection=>`<option${collection===poetry.featuredCollection?' selected':''}>${esc(collection)}</option>`).join('')}
        </select>
      </label>
      <label>
        <span id="book-poem-coverage-label">Coverage</span>
        <select data-poem-coverage aria-labelledby="book-poem-coverage-label">
          <option value="">All poems</option>
          <option value="guide">Study guides</option>
          <option value="index">Index entries</option>
        </select>
      </label>`:`<div class="book-moment-filters" data-moment-filters>
        ${filters.map((label,index)=>`<button type="button" data-moment-filter="${label.toLowerCase()}" class="${index===0?'active':''}">${label}</button>`).join('')}
      </div>`}
    </div>
    ${poetry?`<p class="book-poem-count" data-poem-count role="status">${moments.length+catalog.length} poems · ${moments.length} study guides</p>
    <h3 class="book-poem-group-title" data-poem-group="guide">Study guides</h3>`:''}
    <div class="book-moment-list" data-moment-list>
      ${moments.map(moment=>{
        const search=[moment.collection,moment.title,moment.why,moment.choices,moment.themes,moment.paper2,moment.reading?.analysis,moment.reading?.focus].join(' ').trim().toLowerCase();
        return `<details data-moment ${poetry?'data-poem-entry="guide"':''} data-collection="${esc(moment.collection||'')}" data-moment-text="${esc(search)}">
          <summary>
            <span aria-hidden="true">${poetry?'¶':String(moment.n).padStart(2,'0')}</span>
            <div>
              <h3>${esc(moment.title)}</h3>
              ${moment.collection?`<small class="book-poem-collection">${esc(moment.collection)}${moment.reading?` · PDF p. ${moment.reading.pdfPage}`:''}</small>`:''}
              <p>${esc(moment.themes)}</p>
            </div>
            <b>+</b>
          </summary>
          <div class="book-moment-body ${moment.reading?'book-poem-study':''}">
            <div><span>${moment.reading?'POEM OVERVIEW':'WHY IT MATTERS'}</span><p>${esc(moment.why)}</p></div>
            <div><span>${poetry?'POETIC TECHNIQUES':'CHOICE(S)'}</span><p>${esc(moment.choices)}</p></div>
            ${moment.reading?`<div class="book-poem-analysis">
              <span>HOW THE TECHNIQUE WORKS</span><p>${esc(moment.reading.analysis)}</p>
            </div>
            <div class="book-poem-close-reading">
              <span>TRY A CLOSE READING · PDF P. ${moment.reading.pdfPage}</span><p>${esc(moment.reading.focus)}</p>
            </div>`:''}
            ${moment.paper2?`<div><span>${poetry?'COMPARISON IDEA':'PAPER 2 USE'}</span><p>${esc(moment.paper2)}</p></div>`:''}
          </div>
        </details>`;
      }).join('')}
    </div>
    ${poetry?'<p class="book-poem-empty" data-poem-empty role="status" hidden>No poems match these filters.</p>':''}
    ${poetry?`<h3 class="book-poem-group-title" data-poem-group="index">Index entries</h3>
    <ul class="book-poem-index">
      ${[...catalog].sort(byTitle).map(entry=>`<li data-poem-entry="index"
        data-collection="${esc(entry.collection)}"
        data-moment-text="${esc(`${entry.title} ${entry.collection}`.toLowerCase())}">
        <strong>${esc(entry.title)}</strong><span>${esc(entry.collection)}</span>
      </li>`).join('')}
    </ul>`:''}
    <div class="book-evidence-panel">
      <div>
        <span>EVIDENCE ANCHORS • PARAPHRASED</span>
        <h3>${poetry?'Practise close reading':'Three moments to know especially well.'}</h3>
        <p>Use these notes to locate the evidence in your assigned edition.</p>
      </div>
      <div>${profile.evidence.map(item=>`<article><b>${esc(item.title)}</b><p>${esc(item.text)}</p></article>`).join('')}</div>
    </div>
  </section>`;
}

function renderPoetryPractice(poetry: BookPoetry) {
  return `<section id="book-practice" class="book-section">
    <div class="book-section-head"><h2>Quick practice</h2><p>Match each speaker or technique to a poem and check your reasoning.</p></div>
    <div class="book-poetry-practice">
      ${poetry.practice.map((question, index)=>`<form data-poetry-question>
        <fieldset class="book-poetry-question">
          <legend>${esc(question.prompt)}</legend>
          ${question.options.map((option, choice)=>`<label><input type="radio" name="answer-${index}" value="${choice}" required> ${esc(option)}</label>`).join('')}
          <button class="btn secondary" type="submit">Check answer</button>
          <p class="book-poetry-feedback" role="status"></p>
        </fieldset>
      </form>`).join('')}
    </div>
  </section>`;
}

function bindPoetryPractice(page: HTMLElement, poetry: BookPoetry) {
  page.querySelectorAll<HTMLFormElement>('[data-poetry-question]').forEach((form, index)=>{
    const question=poetry.practice[index];
    const feedback=form.querySelector<HTMLElement>('.book-poetry-feedback')!;
    form.addEventListener('change',()=>{ feedback.textContent=''; });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const answer=new FormData(form).get(`answer-${index}`);
      feedback.textContent=Number(answer)===question.answer
        ? `Correct. ${question.feedback}`
        : 'Try again. Look for the technique or situation named in the question.';
    });
  });
}

function bindMomentFilters(page: HTMLElement) {
  const input=page.querySelector<HTMLInputElement>('[data-moment-search]');
  const collection=page.querySelector<HTMLSelectElement>('[data-poem-collection]');
  const coverage=page.querySelector<HTMLSelectElement>('[data-poem-coverage]');
  const count=page.querySelector<HTMLElement>('[data-poem-count]');
  const empty=page.querySelector<HTMLElement>('[data-poem-empty]');
  const entries=page.querySelectorAll<HTMLElement>(coverage?'[data-poem-entry]':'[data-moment]');
  const groups=page.querySelectorAll<HTMLElement>('[data-poem-group]');
  let filter='all';
  const apply=()=>{
    const query=(input?.value.trim().toLowerCase()||'').replace(/’/g,"'");
    let visible=0;
    let guided=0;
    entries.forEach(item=>{
      const searchable=(item.dataset.momentText||'').replace(/’/g,"'");
      const matchesCollection=!collection?.value||item.dataset.collection===collection.value;
      const matchesCoverage=!coverage?.value||item.dataset.poemEntry===coverage.value;
      item.hidden=!(matchesCollection&&matchesCoverage&&searchable.includes(query)&&(filter==='all'||searchable.includes(filter)));
      if(!item.hidden){
        visible++;
        if(item.dataset.poemEntry==='guide')guided++;
      }
    });
    if(empty)empty.hidden=visible>0;
    if(count)count.textContent=`${visible} ${visible===1?'poem':'poems'} · ${guided} study ${guided===1?'guide':'guides'}`;
    groups.forEach(heading=>{
      heading.hidden=(heading.dataset.poemGroup==='guide'?guided:visible-guided)===0;
    });
  };
  input?.addEventListener('input',apply);
  collection?.addEventListener('change',apply);
  coverage?.addEventListener('change',apply);
  if(collection)apply();
  page.querySelectorAll<HTMLButtonElement>('[data-moment-filter]').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.momentFilter||'all';
    page.querySelectorAll('[data-moment-filter]').forEach(item=>item.classList.toggle('active',item===button));
    apply();
  }));
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
