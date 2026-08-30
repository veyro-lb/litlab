import './admin-feedback-notification.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SEEN_KEY='litlabAdminFeedbackSeenAt';
const CHECK_INTERVAL=10000;
const MIN_CHECK_GAP=4000;

type StoredSession={access_token:string};
type RoleState={is_admin?:boolean};
type FeedbackItem={id:string;created_at:string};
type FeedbackData={items?:FeedbackItem[]};

let isAdmin=false;
let checking=false;
let detectingAdmin=false;
let latestItems:FeedbackItem[]=[];
let lastCheckAt=0;
let syncFrame=0;

function readSession():StoredSession|null{
  try{
    const value=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    return value&&typeof value.access_token==='string'?value:null;
  }catch{return null}
}

function authHeaders(extra:Record<string,string>={}){
  const session=readSession();
  return {
    apikey:SUPABASE_PUBLISHABLE_KEY,
    ...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{ }),
    ...extra
  };
}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const session=readSession();
  if(!session?.access_token)throw new Error('Sign in required');
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',headers:authHeaders({'Content-Type':'application/json',Accept:'application/json'}),body:JSON.stringify(body)
  });
  if(!response.ok)throw new Error(`${name} failed (${response.status})`);
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

function seenAt(){
  const value=Number(localStorage.getItem(SEEN_KEY)||0);
  return Number.isFinite(value)&&value>0?value:0;
}

function feedbackTime(item:FeedbackItem){
  const value=new Date(item.created_at).getTime();
  return Number.isFinite(value)?value:0;
}

function unreadItems(){
  const seen=seenAt();
  return latestItems.filter(item=>feedbackTime(item)>seen);
}

function setIndicator(element:HTMLElement,unread:boolean,count:number){
  if(unread){
    element.dataset.adminFeedbackUnread='true';
    if(element.matches('[data-open-admin-analytics],[data-admin-submission-tab="feedback"]')){
      element.title=count===1?'1 new user feedback response':`${count} new user feedback responses`;
    }
  }else{
    delete element.dataset.adminFeedbackUnread;
    if(/new user feedback response/.test(element.title))element.removeAttribute('title');
  }
}

function applyUnread(){
  const unread=unreadItems();
  const count=unread.length;
  const unreadIds=new Set(unread.map(item=>item.id));
  document.documentElement.classList.toggle('litlab-admin-feedback-unread',count>0);
  document.querySelectorAll<HTMLElement>('.litlab-account-trigger,[data-open-admin-analytics],[data-admin-submission-tab="feedback"]').forEach(element=>setIndicator(element,count>0,count));
  document.querySelectorAll<HTMLElement>('[data-feedback-item][data-feedback-id]').forEach(element=>{
    const itemUnread=unreadIds.has(element.dataset.feedbackId||'');
    if(itemUnread)element.dataset.adminFeedbackUnread='true';else delete element.dataset.adminFeedbackUnread;
    if(itemUnread)element.setAttribute('aria-label','New feedback — open to mark as reviewed');
    else if(element.getAttribute('aria-label')==='New feedback — open to mark as reviewed')element.removeAttribute('aria-label');
  });
}

function markSeenThrough(timestamp:number){
  if(!Number.isFinite(timestamp)||timestamp<=seenAt())return;
  localStorage.setItem(SEEN_KEY,String(timestamp));
  applyUnread();
}

function markFeedbackItemSeen(id:string){
  const item=latestItems.find(candidate=>candidate.id===id);
  if(item)markSeenThrough(feedbackTime(item));
}

function syncIndicators(){
  syncFrame=0;
  if(!isAdmin){
    latestItems=[];
    document.documentElement.classList.remove('litlab-admin-feedback-unread');
    document.querySelectorAll<HTMLElement>('[data-admin-feedback-unread="true"]').forEach(element=>delete element.dataset.adminFeedbackUnread);
    return;
  }
  applyUnread();
}

function scheduleSync(){
  if(syncFrame)return;
  syncFrame=requestAnimationFrame(syncIndicators);
}

async function checkFeedback(force=false){
  if(!isAdmin||checking||!readSession())return;
  if(!force&&Date.now()-lastCheckAt<MIN_CHECK_GAP){scheduleSync();return}
  checking=true;
  try{
    const data=await rpc<FeedbackData>('get_litlab_admin_feedback');
    latestItems=Array.isArray(data?.items)?data.items:[];
    lastCheckAt=Date.now();
    applyUnread();
  }catch(error){
    console.debug('LitLab feedback notification check skipped.',error);
  }finally{checking=false}
}

async function detectAdmin(force=false){
  if(detectingAdmin)return;
  if(!readSession()){
    isAdmin=false;
    scheduleSync();
    return;
  }
  if(isAdmin&&!force){void checkFeedback(false);return}
  detectingAdmin=true;
  try{
    isAdmin=Boolean(await rpc<boolean>('is_litlab_admin'));
    scheduleSync();
    if(isAdmin)await checkFeedback(true);
  }catch{
    if(force)isAdmin=false;
  }finally{detectingAdmin=false}
}

window.addEventListener('litlab:contributor-account-role',event=>{
  const detail=(event as CustomEvent<RoleState>).detail;
  isAdmin=Boolean(detail?.is_admin);
  scheduleSync();
  if(isAdmin)void checkFeedback(true);
});

window.addEventListener('hashchange',()=>{if(isAdmin)void checkFeedback(true);else void detectAdmin(false)});
window.addEventListener('focus',()=>{if(isAdmin)void checkFeedback(false);else void detectAdmin(false)});
window.addEventListener('litlab:submission-sent',event=>{
  const kind=(event as CustomEvent<{kind?:string}>).detail?.kind;
  if(kind==='feedback'&&isAdmin)setTimeout(()=>void checkFeedback(true),400);
});
window.addEventListener('storage',event=>{
  if(event.key===SEEN_KEY)scheduleSync();
  if(event.key===SESSION_KEY)void detectAdmin(true);
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  if(isAdmin)void checkFeedback(false);else void detectAdmin(false);
});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('.litlab-account-trigger')){
    if(isAdmin)void checkFeedback(false);else void detectAdmin(false);
  }
  const summary=target.closest('[data-feedback-item] > summary');
  const item=summary?.parentElement instanceof HTMLElement?summary.parentElement:null;
  const id=item?.dataset.feedbackId||'';
  if(id)markFeedbackItemSeen(id);
},true);

new MutationObserver(scheduleSync).observe(document.body,{childList:true,subtree:true});
window.setInterval(()=>{
  if(document.visibilityState!=='visible')return;
  if(isAdmin)void checkFeedback(false);else if(readSession())void detectAdmin(false);
},CHECK_INTERVAL);

setTimeout(()=>void detectAdmin(false),600);
scheduleSync();
