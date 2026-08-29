import './contributor-compact-chat.css';

type WorkspaceRow={id:string;applicant_type?:'student'|'teacher';topics?:string;contribution_type?:string;status?:string};
type WorkspaceEvent={selectedId?:string;workspaces?:WorkspaceRow[]};

let selectedId='';
let workspaces:WorkspaceRow[]=[];
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function current(){return workspaces.find(row=>row.id===selectedId)||workspaces[0]||null}
function root(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function topbar(){return document.querySelector<HTMLElement>('.ll-contrib-topbar')}

function removeCompact(){
  document.querySelector('[data-contributor-compact-chat]')?.remove();
  document.body.classList.remove('ll-compact-contributor-chat');
  root()?.classList.remove('ll-compact-chat-enabled');
}

function ensureButton(){
  let button=document.querySelector<HTMLButtonElement>('[data-contributor-compact-chat]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.dataset.contributorCompactChat='true';
    button.className='ll-contributor-compact-chat';
  }
  const bar=topbar();
  if(bar&&button.parentElement!==bar){
    const back=bar.querySelector('.ll-contrib-back');
    if(back)bar.insertBefore(button,back);else bar.appendChild(button);
  }else if(!bar){
    const host=root();
    if(host&&button.parentElement!==host){const head=host.querySelector<HTMLElement>(':scope > .ll-workspace-head');if(head)head.before(button);else host.prepend(button)}
  }
  return button;
}

function apply(){
  scheduled=false;
  if(route()!=='contribute'){removeCompact();return}
  const host=root();const app=current();
  if(!host||!app?.id){removeCompact();return}

  document.body.classList.add('ll-compact-contributor-chat');
  host.classList.add('ll-compact-chat-enabled');

  const button=ensureButton();
  const teacher=app.applicant_type==='teacher';
  const title=teacher?'Teacher reviewer support':app.topics||'Contributor conversation';
  button.dataset.chatOpen='true';
  button.dataset.chatMode='user';
  button.dataset.applicationId=app.id;
  button.dataset.chatTitle=title;
  button.setAttribute('aria-label',teacher?'Open private live chat with LitLab for teacher support':'Open private live chat with LitLab for this contribution');
  button.title=teacher?'Private teacher support with LitLab':'Private contributor chat with LitLab';
  button.innerHTML='<span aria-hidden="true"><i></i></span><b>Chat with LitLab</b>';
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  selectedId=detail.selectedId||selectedId;
  schedule();
});
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('hashchange',()=>{if(route()!=='contribute'){selectedId='';workspaces=[]}schedule()});
window.addEventListener('focus',schedule);

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
