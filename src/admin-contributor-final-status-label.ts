let observer:MutationObserver|null=null;
let observed:HTMLElement|null=null;
let timer=0;
let attempts=0;
let queued=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function setText(node:Element|null,text:string){if(node&&node.textContent!==text)node.textContent=text}

function applyLabels(){
  queued=false;
  if(route()!=='admin-contributors')return;
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');if(!page)return;
  page.querySelectorAll<HTMLOptionElement>('select[data-contributor-status] option[value="accepted"]').forEach(option=>setText(option,'Accepted — work can begin'));
  page.querySelectorAll<HTMLOptionElement>('select[data-contributor-status] option[value="completed"]').forEach(option=>setText(option,'Completed / final approved'));
  page.querySelectorAll<HTMLOptionElement>('select[data-contrib-status-filter] option[value="completed"]').forEach(option=>setText(option,'Completed / final approved'));
  page.querySelectorAll<HTMLElement>('.admin-contrib-notify-note').forEach(note=>setText(note,'Accepted keeps the workspace open for tasks, revisions and submissions. Completed / final approved closes active work, preserves the contribution record, and enables certificate/publication steps.'));
}

function queue(){if(queued)return;queued=true;requestAnimationFrame(applyLabels)}

function attach(){
  window.clearTimeout(timer);
  if(route()!=='admin-contributors'){observer?.disconnect();observer=null;observed=null;return}
  const list=document.querySelector<HTMLElement>('[data-contrib-list]');
  if(!list){if(attempts++<30)timer=window.setTimeout(attach,120);return}
  attempts=0;
  if(observed!==list){observer?.disconnect();observed=list;observer=new MutationObserver(queue);observer.observe(list,{childList:true,subtree:true})}
  applyLabels();
}

window.addEventListener('hashchange',()=>{attempts=0;window.setTimeout(attach,80)});
window.addEventListener('focus',()=>{if(route()==='admin-contributors')queue()});
window.addEventListener('litlab:contributor-admin-updated',()=>{if(route()==='admin-contributors')queue()});
document.addEventListener('change',event=>{const target=event.target instanceof Element?event.target:null;if(target?.matches('[data-contrib-role-filter],[data-contrib-status-filter]'))window.setTimeout(queue,0)},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();

export {};
