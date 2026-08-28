const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

function token(){try{return String(JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token||'')}catch{return ''}}
function clickClose(notice:HTMLElement,selector:string){
  const close=notice.querySelector<HTMLButtonElement>(selector);
  if(close&&!close.disabled)close.click();
}

async function markCertificateRead(applicationId:string){
  const auth=token();if(!applicationId||!auth)return;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_my_litlab_contributor_certificate_read`,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},
      body:JSON.stringify({p_application_id:applicationId})
    });
    if(!response.ok)return;
    window.dispatchEvent(new CustomEvent('litlab:certificate-read',{detail:{applicationId,source:'certificate-download'}}));
  }catch{}
}

// Notification routing is handled on document capture so buttons can open the exact
// contribution that generated the update. Run the notice's own bookkeeping one step
// earlier on window capture, otherwise stopImmediatePropagation can prevent its local
// seen/dismissed state from being saved and the same popup can return on the next poll.
window.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;

  // PDF delivery owns this click later on document capture. Marking the certificate read
  // from window capture guarantees the unread badge clears even though PDF delivery stops
  // propagation after starting the download.
  const certificate=target.closest('[data-download-contributor-certificate],[data-history-download-certificate]');
  if(certificate){
    const holder=certificate.closest<HTMLElement>('[data-contributor-completion-archive],[data-history-contribution]');
    const applicationId=holder?.dataset.applicationId||holder?.dataset.historyContribution||'';
    if(applicationId)void markCertificateRead(applicationId);
  }

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
