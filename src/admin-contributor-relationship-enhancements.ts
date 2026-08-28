const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';

type StoredSession={access_token?:string};
type App={id:string;applicant_type:'student'|'teacher';student_supervision:string|null;mentor_email:string|null;mentee_email:string|null;status:string};
let cache:App[]=[];
let loading=false;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function supervisionLabel(value:string|null){return value==='yes'?'Yes — mentor/coordinator assigned':value==='not_yet'?'Not yet — plans to arrange one':value==='no'?'No — not currently':'—'}

async function load(){
  if(route()!=='admin-contributors'||loading||!token())return;
  loading=true;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_litlab_contributor_applications`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token()}`},body:'{}'});
    if(!response.ok)return;
    cache=await response.json() as App[];
    enhance();
  }finally{loading=false}
}

function relabelStatuses(root:ParentNode){
  root.querySelectorAll<HTMLOptionElement>('option[value="new"]').forEach(o=>o.textContent='Pending');
  root.querySelectorAll<HTMLOptionElement>('option[value="reviewing"]').forEach(o=>o.textContent='Needs review');
  root.querySelectorAll<HTMLOptionElement>('option[value="declined"]').forEach(o=>o.textContent='Rejected');
  root.querySelectorAll<HTMLElement>('.admin-contrib-summary-meta .status.new').forEach(el=>el.textContent='Pending');
  root.querySelectorAll<HTMLElement>('.admin-contrib-summary-meta .status.reviewing').forEach(el=>el.textContent='Needs review');
  root.querySelectorAll<HTMLElement>('.admin-contrib-summary-meta .status.declined').forEach(el=>el.textContent='Rejected');
}

function detail(label:string,value:string){return `<div class="admin-contrib-detail"><span>${esc(label)}</span><p>${esc(value)}</p></div>`}

function enhance(){
  if(route()!=='admin-contributors')return;
  const page=document.querySelector<HTMLElement>('[data-litlab-admin-contributors-page]');
  if(!page)return;
  relabelStatuses(page);
  page.querySelectorAll<HTMLElement>('.admin-contrib-card[data-app-id]').forEach(card=>{
    if(card.dataset.relationshipEnhanced==='true')return;
    const app=cache.find(row=>row.id===card.dataset.appId);
    if(!app)return;
    const grid=card.querySelector<HTMLElement>('.admin-contrib-detail-grid');
    if(!grid)return;
    if(app.applicant_type==='student'){
      grid.insertAdjacentHTML('afterbegin',`${detail('Mentor / coordinator oversight',supervisionLabel(app.student_supervision))}${app.mentor_email?detail('Mentor / coordinator email',app.mentor_email):''}`);
    }else if(app.mentee_email){
      grid.insertAdjacentHTML('afterbegin',detail('Student being mentored — email',app.mentee_email));
    }
    const statusRow=card.querySelector<HTMLElement>('.admin-contrib-status-row');
    if(statusRow&&!statusRow.querySelector('[data-status-notify-note]')){
      const note=document.createElement('small');
      note.dataset.statusNotifyNote='true';
      note.className='admin-contrib-notify-note';
      note.textContent='Status changes are saved to the applicant’s LitLab account and can trigger an in-site notification while they are signed in.';
      statusRow.after(note);
    }
    card.dataset.relationshipEnhanced='true';
  });
}

new MutationObserver(()=>{enhance();if(route()==='admin-contributors'&&!cache.length)void load()}).observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{cache=[];if(route()==='admin-contributors')setTimeout(()=>void load(),250)});
if(route()==='admin-contributors')setTimeout(()=>void load(),700);
