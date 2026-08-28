let queued=false;

function syncCertificateUnreadSummary(){
  const root=document.querySelector<HTMLElement>('[data-my-contributions]');if(!root)return;
  const unread=root.querySelectorAll('.ll-history-cert-badge.is-new').length;
  const summary=root.querySelector<HTMLElement>('.ll-my-contrib-summary');if(!summary)return;
  const box=summary.querySelector<HTMLElement>(':scope > .has-new');
  if(!box)return;
  if(unread<=0){box.remove();return}
  const count=box.querySelector<HTMLElement>('strong');const label=box.querySelector<HTMLElement>('span');
  if(count)count.textContent=String(unread);
  if(label)label.textContent=`New certificate${unread===1?'':'s'}`;
}

function queueSync(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncCertificateUnreadSummary()})}

window.addEventListener('litlab:certificate-read',queueSync);

export {};