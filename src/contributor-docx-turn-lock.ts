import './contributor-docx-turn-lock.css';

type Status='new'|'reviewing'|'accepted'|'declined'|'completed';
type DocumentRow={id?:string;created_at?:string;version_label?:string;original_name?:string};
type Review={recommendation?:'approve'|'request_changes';created_at?:string};
type Revision={status?:'open'|'responded'|'resolved';created_at?:string};
type Workspace={id:string;status?:Status;applicant_type?:'student'|'teacher';documents?:DocumentRow[];reviews?:Review[];revisions?:Revision[];reviewer?:{name?:string}|null};
type WorkspaceEvent={selectedId?:string;workspaces?:Workspace[]};

let workspaces:Workspace[]=[];
let selectedId='';
let scheduled=false;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function stamp(value?:string){const n=Date.parse(value||'');return Number.isFinite(n)?n:0}
function current(){return workspaces.find(w=>w.id===selectedId)||workspaces[0]||null}
function latestByTime<T extends {created_at?:string}>(rows:T[]){return rows.slice().sort((a,b)=>stamp(b.created_at)-stamp(a.created_at))[0]||null}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}

function revisionSource(app:Workspace,latestDoc:DocumentRow){
  const docTime=stamp(latestDoc.created_at);
  const admin=(app.revisions||[]).some(r=>r.status!=='resolved'&&stamp(r.created_at)>docTime);
  if(admin)return 'admin' as const;
  const teacher=(app.reviews||[]).some(r=>r.recommendation==='request_changes'&&stamp(r.created_at)>docTime);
  if(teacher)return 'teacher' as const;
  return '' as const;
}

function lockCopy(app:Workspace,latestDoc:DocumentRow){
  const docTime=stamp(latestDoc.created_at);
  const approved=(app.reviews||[]).some(r=>r.recommendation==='approve'&&stamp(r.created_at)>docTime);
  if(approved)return {title:'Upload locked — with LitLab admin',body:'Your teacher approved the current DOCX. It is now with LitLab admin for review. You can upload again only if LitLab sends you a new revision request.'};
  if(app.reviewer?.name)return {title:`Upload locked — with ${app.reviewer.name}`,body:`Your current DOCX is being reviewed by ${app.reviewer.name}. Wait for the decision. If changes are requested, LitLab will reopen one revised-DOCX upload for you.`};
  return {title:'Upload locked — with LitLab admin',body:'Your current DOCX is under LitLab review. You can upload another version only when LitLab sends you a new revision request.'};
}

function removeNotice(card:HTMLElement){card.querySelector('[data-docx-turn-notice]')?.remove()}
function ensureNotice(card:HTMLElement,kind:'locked'|'open',title:string,body:string){
  let notice=card.querySelector<HTMLElement>('[data-docx-turn-notice]');
  if(!notice){notice=document.createElement('div');notice.dataset.docxTurnNotice='true';const form=card.querySelector('form[data-docx-upload]');if(form)form.before(notice);else card.querySelector('.ll-doc-list')?.before(notice)||card.appendChild(notice)}
  notice.className=`ll-docx-turn-notice is-${kind}`;
  const signature=`${kind}:${title}:${body}`;
  if(notice.dataset.signature!==signature){notice.dataset.signature=signature;notice.innerHTML=`<span>${kind==='locked'?'🔒':'↻'}</span><div><b>${esc(title)}</b><p>${esc(body)}</p></div>`}
}

function apply(){
  scheduled=false;
  if(route()!=='contribute')return;
  const app=current();
  if(!app||app.applicant_type!=='student')return;
  const card=document.querySelector<HTMLElement>('.ll-workspace-docs');
  if(!card)return;
  const form=card.querySelector<HTMLFormElement>(`form[data-docx-upload="${CSS.escape(app.id)}"]`);
  const docs=app.documents||[];
  const latest=latestByTime(docs);
  if(!latest||!['accepted','reviewing'].includes(app.status||'')){
    removeNotice(card);
    if(form)form.hidden=false;
    card.classList.remove('ll-docx-turn-locked','ll-docx-turn-open');
    return;
  }

  const source=revisionSource(app,latest);
  if(source){
    card.classList.remove('ll-docx-turn-locked');card.classList.add('ll-docx-turn-open');
    if(form)form.hidden=false;
    const title=source==='teacher'?'Changes requested — upload one revised DOCX':'LitLab requested changes — upload one revised DOCX';
    const body=source==='teacher'?'Make the requested changes, submit one new DOCX, and it will return to your teacher. Uploads lock again immediately after submission.':'Make the requested changes and submit one new DOCX. Uploads lock again immediately while LitLab reviews the new version.';
    ensureNotice(card,'open',title,body);
    return;
  }

  card.classList.add('ll-docx-turn-locked');card.classList.remove('ll-docx-turn-open');
  if(form){
    form.hidden=true;
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLButtonElement>('input,select,textarea,button').forEach(control=>{control.disabled=true});
  }
  const copy=lockCopy(app,latest);
  ensureNotice(card,'locked',copy.title,copy.body);
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.workspaces))workspaces=detail.workspaces;
  selectedId=detail.selectedId||selectedId;
  schedule();
});
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('litlab:contributor-admin-updated',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('hashchange',()=>{if(route()!=='contribute'){workspaces=[];selectedId=''}schedule()});

const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();

export {};
