let observer:MutationObserver|null=null;
let observed:HTMLElement|null=null;
let timer=0;
let attempts=0;
let queued=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

function applyLabels(){
  queued=false;
  if(route()!=='admin-contributors')return;
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');
  if(!page)return;

  page.querySelectorAll<HTMLOptionElement>('select[data-contributor-status] option[value="accepted"]').forEach(option=>{option.textContent='Accepted — work can begin'});
  page.querySelectorAll<HTMLOptionElement>('select[data-contributor-status] option[value="completed"]').forEach(option=>{option.textContent='Completed / final approved'});
  page.querySelectorAll<HTMLOptionElement>('select[data-contrib-status-filter] option[value="completed"]').forEach(option=>{option.textContent='Completed / final approved'});

  page.querySelectorAll<HTMLElement>('.admin-contrib-notify-note').forEach(note=>{
    note.textContent='Accepted keeps the contributor workspace open for tasks, revisions and Word submissions. Completed / final approved closes active work and turns the student contribution into a permanent completion/CAS evidence archive while keeping documents and live chat available.';
  });
}

function queue(){if(queued)return;queued=true;requestAnimationFrame(applyLabels)}

function attach(){
  window.clearTimeout(timer);
  if(route()!=='admin-contributors'){observer?.disconnect();observer=null;observed=null;return}
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');
  if(!page){if(attempts++<30)timer=window.setTimeout(attach,120);return}
  attempts=0;
  if(observed!==page){
    observer?.disconnect();observed=page;
    observer=new MutationObserver(queue);observer.observe(page,{childList:true,subtree:true});
  }
  applyLabels();
}

window.addEventListener('hashchange',()=>{attempts=0;window.setTimeout(attach,80)});
window.addEventListener('focus',()=>{if(route()==='admin-contributors')queue()});
window.addEventListener('litlab:contributor-admin-updated',()=>{if(route()==='admin-contributors')queue()});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();

export {};
