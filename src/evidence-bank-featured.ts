import './evidence-bank-featured.css';

function upgradeEvidenceLaunchers(){
  if(location.hash.slice(1).split('#')[0]!=='books')return;

  const library=document.querySelector<HTMLElement>('.books-library-page');
  if(library&&!library.querySelector('[data-evidence-feature-card]')){
    library.querySelector('.books-library-head > .evidence-launch')?.remove();
    const head=library.querySelector('.books-library-head');
    if(head){
      const card=document.createElement('section');
      card.className='evidence-feature-card';
      card.dataset.evidenceFeatureCard='true';
      card.innerHTML=`
        <div class="evidence-feature-icon" aria-hidden="true"><span>“</span><b>+</b></div>
        <div class="evidence-feature-copy">
          <span class="evidence-feature-eyebrow">MY LITLAB • SIGNED-IN TOOL</span>
          <h2>Build your Evidence Bank.</h2>
          <p>Save the quotations and moments you actually want to use. Keep the page, effect, analysis, and your own notes together so revision becomes much faster.</p>
          <div class="evidence-feature-flow" aria-label="Evidence workflow"><span>QUOTE / EVIDENCE</span><i>→</i><span>EFFECT</span><i>→</i><span>ANALYSIS</span></div>
        </div>
        <div class="evidence-feature-action">
          <button type="button" class="evidence-feature-button" data-evidence-open>Open Evidence Bank <span>→</span></button>
          <small><i>✓</i> Saved securely to your LitLab account</small>
        </div>`;
      head.insertAdjacentElement('afterend',card);
    }
  }

  const profile=document.querySelector<HTMLElement>('.books-profile-page');
  if(profile){
    const button=profile.querySelector<HTMLButtonElement>('.book-profile-actions .evidence-launch');
    if(button&&!button.dataset.evidenceFeatured){
      button.dataset.evidenceFeatured='true';
      button.classList.remove('secondary');
      button.classList.add('primary','evidence-profile-launch');
      button.innerHTML='<span class="evidence-profile-plus">+</span><span><b>Build your Evidence Bank</b><small>Save evidence from this book</small></span><i>→</i>';
    }
  }
}

const observer=new MutationObserver(()=>requestAnimationFrame(upgradeEvidenceLaunchers));
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(upgradeEvidenceLaunchers));
requestAnimationFrame(upgradeEvidenceLaunchers);
