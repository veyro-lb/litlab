// The activity RPC succeeds inside contributor-workspace.ts but historically did not refresh
// the workspace afterward. Watch only the submitted activity form's status element and, once
// success is confirmed, reuse the existing workspace update event so history/evidence refreshes.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  const applicationId=form?.dataset.activityForm||'';
  if(!form||!applicationId)return;
  const state=form.querySelector<HTMLElement>('[data-form-state]');
  if(!state)return;

  let finished=false;
  const observer=new MutationObserver(()=>{
    if(finished)return;
    const success=state.dataset.state==='success'||/activity saved/i.test(state.textContent||'');
    if(!success)return;
    finished=true;
    observer.disconnect();
    window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{applicationId,kind:'activity'}}));
    const log=document.querySelector<HTMLButtonElement>(`[data-load-activity="${CSS.escape(applicationId)}"]`);
    if(log)window.setTimeout(()=>log.click(),220);
  });
  observer.observe(state,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-state']});
  window.setTimeout(()=>{finished=true;observer.disconnect()},15_000);
},true);

export {};
