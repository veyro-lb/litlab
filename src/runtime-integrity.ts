import './runtime-integrity.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const P2_LOCAL_KEY='litlabPaper2ComparisonBuilder';

type Session={access_token:string;refresh_token:string};
type User={id:string};

const route=()=>location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home';
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const session=():Session|null=>{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as Partial<Session>|null;
    return value&&typeof value.access_token==='string'&&value.access_token&&typeof value.refresh_token==='string'&&value.refresh_token?value as Session:null;
  }catch{return null}
};
const headers=(token:string)=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json'});

function activeMain(){
  return document.querySelector<HTMLElement>('main[data-litlab-special-route-host]')||document.querySelector<HTMLElement>('#root main#main');
}

document.addEventListener('click',event=>{
  const skip=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('.skip[href="#main"]'):null;
  if(!skip)return;
  event.preventDefault();
  event.stopPropagation();
  const main=activeMain();
  if(!main)return;
  if(!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
  main.focus({preventScroll:true});
  main.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
},true);

function pauseIoPractice(){
  const button=document.querySelector<HTMLButtonElement>('[data-io-stopwatch-toggle]');
  if(button&&button.textContent?.trim().toLowerCase()==='pause')button.click();
}
let previousRoute=route();
window.addEventListener('hashchange',()=>{
  const next=route();
  if(previousRoute==='io'&&next!=='io')pauseIoPractice();
  previousRoute=next;
});
window.addEventListener('pagehide',pauseIoPractice);

async function currentUser(s:Session){
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(s.access_token)});
    return response.ok?await response.json() as User:null;
  }catch{return null}
}

function paper2LocalIsEmpty(){
  try{
    const value=JSON.parse(localStorage.getItem(P2_LOCAL_KEY)||'{}') as Record<string,unknown>;
    return Object.values(value).every(item=>item===''||item===null||item===undefined||item===false||Array.isArray(item)&&item.length===0);
  }catch{return false}
}

async function clearPaper2Remote(){
  const s=session();
  if(!s)return;
  const user=await currentUser(s);
  if(!user)return;
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/litlab_p2_comparison_workspaces?user_id=eq.${encodeURIComponent(user.id)}`,{
      method:'DELETE',
      headers:headers(s.access_token)
    });
  }catch{}
}

document.addEventListener('click',event=>{
  const reset=event.target instanceof Element?event.target.closest('[data-builder-reset]'):null;
  if(!reset)return;
  queueMicrotask(()=>{if(paper2LocalIsEmpty())void clearPaper2Remote()});
});

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const evidence=document.querySelector<HTMLElement>('[data-evidence-modal]');
  if(evidence)evidence.remove();
});

window.addEventListener('pageshow',()=>{
  requestAnimationFrame(()=>{
    const main=activeMain();
    if(main&&!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
    document.querySelectorAll<HTMLButtonElement>('.litlab-route-dock button').forEach(button=>button.type='button');
  });
});
