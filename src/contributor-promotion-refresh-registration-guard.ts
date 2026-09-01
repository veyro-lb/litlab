type Listener=EventListenerOrEventListenerObject|null;

const nativeAdd=window.addEventListener.bind(window);
let restored=false;
let workspaceUpdateWrapped=false;
let focusSkipped=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function promotionSubmissionActive(){
  if(route()!=='contribute')return false;
  return Boolean(document.querySelector('[data-contributor-workspace].ll-promotion-workspace-mode,[data-contributor-workspace] [data-promotion-submission-page]'));
}
function callListener(listener:Listener,event:Event){
  if(typeof listener==='function')return listener.call(window,event);
  return listener?.handleEvent(event);
}

function commitOtherValue(form:HTMLFormElement,name:'channel'|'medium'){
  const select=form.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
  if(!select||select.value!=='Other')return true;
  const input=form.querySelector<HTMLInputElement>(`input[name="${name}_other"]`);
  const value=input?.value.trim()||'';
  if(!input||value.length<2){
    input?.setCustomValidity('Please specify your choice.');
    input?.reportValidity();
    return false;
  }
  input.setCustomValidity('');
  select.setCustomValidity('');
  const option=document.createElement('option');
  option.value=value;
  option.textContent=value;
  option.dataset.promotionCustomOther='true';
  select.appendChild(option);
  select.value=value;
  return true;
}

// Register before contributor-promotion-submission's capture submit owner. If a student chose
// Other, convert the typed explanation into the actual channel/medium value that the existing
// RPC submitter reads from FormData. This keeps the backend clean instead of storing "Other".
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form?.matches('[data-promotion-submission-form]'))return;
  if(commitOtherValue(form,'channel')&&commitOtherValue(form,'medium'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);

// contributor-promotion-submission registers a generic workspace-updated listener that
// deletes its already-loaded Promotion context and immediately paints the loading state.
// Generic LitLab live-sync events can fire even when Promotion evidence did not change,
// producing a visible "self refresh"/flash. Wrap only that next registration: on an active
// Promotion student workspace, keep the stable rendered context instead of destroying it.
// The evidence submit path already reloads and re-renders its context explicitly before it
// emits workspace-updated, so suppressing this duplicate reload does not hide a submission.
(window as any).addEventListener=function(type:string,listener:Listener,options?:boolean|AddEventListenerOptions){
  if(type==='litlab:contributor-workspace-updated'&&!workspaceUpdateWrapped){
    workspaceUpdateWrapped=true;
    const wrapped:EventListener=(event)=>{
      if(promotionSubmissionActive())return;
      callListener(listener,event);
    };
    nativeAdd(type,wrapped,options);
    return;
  }

  // The submission module also schedules a full Promotion pass every time the browser window
  // regains focus. It is unnecessary because cached content is already current and is a common
  // source of perceived page refreshes when switching tabs. Skip only that next focus listener;
  // later focus listeners (for generic guide sanity) register normally.
  if(type==='focus'&&!focusSkipped){
    focusSkipped=true;
    return;
  }

  nativeAdd(type,listener as EventListener,options);
};

export function restorePromotionRefreshRegistrationGuard(){
  if(restored)return;
  restored=true;
  (window as any).addEventListener=nativeAdd;
}
