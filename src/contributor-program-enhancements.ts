import './contributor-program-enhancements.css';
import {createLitLabLogo} from './brand-mark';

function isContributorPage(){return location.hash.replace(/^#/,'').split('#')[0]==='contribute'}

function enhanceBrand(root:HTMLElement){
  const brand=root.querySelector<HTMLButtonElement>('.ll-contrib-brand');
  if(!brand||brand.dataset.logoEnhanced==='true')return;
  brand.dataset.logoEnhanced='true';
  brand.textContent='';
  const logo=createLitLabLogo('ll-contrib-logo',true);
  brand.appendChild(logo);
}

function enhanceResearchCopy(root:HTMLElement){
  const cards=Array.from(root.querySelectorAll<HTMLElement>('.ll-contrib-hero-card>div'));
  const research=cards.find(card=>card.querySelector('b')?.textContent?.trim()==='Research');
  const copy=research?.querySelector('small');
  if(copy)copy.textContent='Reliable source-based notes, original DP-style practice questions, mock exam prompts, practice tasks and sample responses.';

  const studentCard=Array.from(root.querySelectorAll<HTMLElement>('.ll-contrib-role-grid article')).find(card=>card.querySelector('h3')?.textContent?.includes('DP Student'));
  if(studentCard&&!studentCard.querySelector('[data-practice-note]')){
    const note=document.createElement('p');
    note.dataset.practiceNote='true';
    note.className='ll-contrib-practice-note';
    note.innerHTML='<b>Practice-material contributions are welcome.</b> You can create original DP/IB-style questions, mock exam prompts, practice exercises or sample responses. Do not copy official IB past-paper questions, mark schemes or other copyrighted material.';
    studentCard.querySelector('ul')?.after(note);
  }
}

function enhanceContributionSelect(root:HTMLElement){
  const form=root.querySelector<HTMLFormElement>('#ll-contributor-form');
  if(!form)return;
  const role=form.querySelector<HTMLInputElement>('input[name="applicant_type"]:checked')?.value||'student';
  const select=form.querySelector<HTMLSelectElement>('select[name="contribution_type"]');
  if(!select||role!=='student')return;
  if(!select.querySelector('option[value="practice"]')){
    const option=document.createElement('option');
    option.value='practice';
    option.textContent='Create original practice questions / mock exam material / sample responses';
    const review=select.querySelector('option[value="review"]');
    if(review)select.insertBefore(option,review);else select.appendChild(option);
  }
  const topic=form.querySelector<HTMLTextAreaElement>('textarea[name="topics"]');
  if(topic)topic.placeholder='Paper 1, Paper 2, IO, EE, a literary work, authorial choices, original practice questions, mock exam tasks, sample responses…';
  const idea=form.querySelector<HTMLTextAreaElement>('textarea[name="contribution_idea"]');
  if(idea)idea.placeholder='Describe the resource, topic, original practice material, sample response, review or improvement you have in mind.';
}

function enhance(root:HTMLElement){
  enhanceBrand(root);
  enhanceResearchCopy(root);
  enhanceContributionSelect(root);
}

function scan(){
  if(!isContributorPage())return;
  const root=document.getElementById('ll-contributor-root');
  if(root)enhance(root);
}

new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
document.addEventListener('change',event=>{
  const target=event.target;
  if(target instanceof HTMLInputElement&&target.name==='applicant_type')requestAnimationFrame(scan);
});
window.addEventListener('hashchange',()=>requestAnimationFrame(scan));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else scan();
