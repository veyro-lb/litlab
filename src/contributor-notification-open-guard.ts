function clickClose(notice:HTMLElement,selector:string){
  const close=notice.querySelector<HTMLButtonElement>(selector);
  if(close&&!close.disabled)close.click();
}

// Notification routing is handled on document capture so buttons can open the exact
// contribution that generated the update. Run the notice's own bookkeeping one step
// earlier on window capture, otherwise stopImmediatePropagation can prevent its local
// seen/dismissed state from being saved and the same popup can return on the next poll.
window.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;

  const userStatus=target.closest<HTMLButtonElement>('#ll-contributor-status-notice .ll-contributor-status-open');
  if(userStatus){
    const notice=userStatus.closest<HTMLElement>('#ll-contributor-status-notice');
    if(notice)clickClose(notice,'.ll-contributor-status-close');
    return;
  }

  const userWorkspace=target.closest<HTMLButtonElement>('#ll-user-workspace-update-notice [data-open]');
  if(userWorkspace){
    const notice=userWorkspace.closest<HTMLElement>('#ll-user-workspace-update-notice');
    if(notice)clickClose(notice,'[data-close]');
    return;
  }

  const adminContributor=target.closest<HTMLButtonElement>('#ll-admin-contributor-update-notice [data-admin-update-open]');
  if(adminContributor){
    const notice=adminContributor.closest<HTMLElement>('#ll-admin-contributor-update-notice');
    if(notice)clickClose(notice,'[data-admin-update-close]');
    return;
  }

  const adminWorkspace=target.closest<HTMLButtonElement>('#ll-admin-workspace-update-notice [data-open]');
  if(adminWorkspace){
    const notice=adminWorkspace.closest<HTMLElement>('#ll-admin-workspace-update-notice');
    if(notice)clickClose(notice,'[data-close]');
  }
},true);

export {};
