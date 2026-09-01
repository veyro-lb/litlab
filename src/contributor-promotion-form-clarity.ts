import './contributor-promotion-form-clarity.css';

let pending=false;

function otherField(form:HTMLFormElement,selectName:'channel'|'medium'){
  const select=form.querySelector<HTMLSelectElement>(`select[name="${selectName}"]`);
  if(!select)return;
  const fieldName=`${selectName}_other`;
  let field=form.querySelector<HTMLLabelElement>(`[data-promotion-other-field="${selectName}"]`);
  const wantsOther=select.value==='Other';

  if(!wantsOther){
    field?.remove();
    return;
  }

  if(!field){
    field=document.createElement('label');
    field.className='ll-promo-other-field';
    field.dataset.promotionOtherField=selectName;
    field.innerHTML=`<span>${selectName==='channel'?'Please specify the channel / location':'Please specify what you published or did'}</span><input name="${fieldName}" type="text" required minlength="2" maxlength="180" autocomplete="off" placeholder="${selectName==='channel'?'Example: School assembly, Facebook group, local event…':'Example: Podcast mention, club presentation, custom campaign…'}"/>`;
    select.closest('label')?.insertAdjacentElement('afterend',field);
  }
  const input=field.querySelector<HTMLInputElement>('input');
  if(input){
    input.required=true;
    input.setCustomValidity('');
  }
}

function physicalRequirement(form:HTMLFormElement){
  const mode=form.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value||'digital';
  const files=form.querySelector<HTMLInputElement>('input[name="files"]');
  const drop=form.querySelector<HTMLElement>('[data-promotion-drop]');
  const rule=form.querySelector<HTMLElement>('[data-promotion-file-rule]');
  const physical=mode==='physical';

  if(files){
    files.required=physical;
    files.setAttribute('aria-required',physical?'true':'false');
  }
  drop?.classList.toggle('is-required',physical);
  if(rule){
    rule.textContent=physical
      ?'Attach at least one photo, image or PDF showing the physical promotion.'
      :'Optional, but strongly recommended so reviewers can see what the promotion looked like.';
  }
}

function enhance(scope:ParentNode=document){
  scope.querySelectorAll<HTMLFormElement>('[data-promotion-submission-form]').forEach(form=>{
    otherField(form,'channel');
    otherField(form,'medium');
    physicalRequirement(form);
  });
}

function schedule(){
  if(pending)return;
  pending=true;
  queueMicrotask(()=>{
    pending=false;
    enhance();
  });
}

document.addEventListener('change',event=>{
  const target=event.target;
  if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement))return;
  const form=target.closest<HTMLFormElement>('[data-promotion-submission-form]');
  if(!form)return;
  if(target.name==='channel')otherField(form,'channel');
  if(target.name==='medium')otherField(form,'medium');
  if(target.name==='mode')physicalRequirement(form);
},true);

const observer=new MutationObserver(records=>{
  if(records.some(record=>Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches('[data-promotion-submission-form]')||node.querySelector?.('[data-promotion-submission-form]')))))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('litlab:contributor-workspace-data',schedule);
window.addEventListener('hashchange',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
