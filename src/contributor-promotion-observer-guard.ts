const NativeMutationObserver=window.MutationObserver;
let restored=false;

class PromotionMutationObserver extends NativeMutationObserver{
  constructor(callback:MutationCallback){
    super((records,observer)=>{
      const filtered=records.filter(record=>{
        const target=record.target instanceof Element?record.target:record.target.parentElement;
        if(!target)return true;
        if(target.closest('[data-contributor-state-guide]'))return false;
        if(target.closest('[data-promotion-submission-page]'))return false;
        if(target.closest('[data-v3-evidence][data-promotion-generic-hidden]'))return false;
        return true;
      });
      if(filtered.length)callback(filtered,observer);
    });
  }
}

window.MutationObserver=PromotionMutationObserver;

export function restorePromotionMutationObserver(){
  if(restored)return;
  restored=true;
  window.MutationObserver=NativeMutationObserver;
}
