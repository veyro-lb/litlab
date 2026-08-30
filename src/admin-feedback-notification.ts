import './admin-feedback-notification.css';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const SEEN_KEY='litlabAdminFeedbackSeenAt';
const CHECK_INTERVAL=60000;

type StoredSession={access_token:string};
type RoleState={is_admin?:boolean};
type FeedbackItem={id:string;created_at:string};
type FeedbackData={items?:FeedbackItem[]};

let isAdmin=false;
let checking=false;
let latestFeedbackAt=0;
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
    ...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}),
    ...extra
  };
}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
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

function newestFeedbackAt(items:FeedbackItem[]=[]){
  return items.reduce((latest,item)=>{
    const value=new Date(item.created_at).getTime();
    return Number.isFinite(value)?Math.max(latest,value):latest;
  },0);
}

function currentRoute(){return location.hash.replace(/^#/,'').split('?')[0].split('#')[0].trim().toLowerCase()||'home'}

function feedbackIsVisible(){
  if(currentRoute()!=='admin')return false;
  const container=document.querySelector<HTMLElement>('#litlab-admin-feedback[data-loaded="true"]');
  const tab=container?.querySelector<HTMLButtonElement>('[data-admin-submission-tab="feedback"]');
  const panel=container?.querySelector<HTMLElement>('[data-admin-submission-panel="feedback"]');
  if(!container||!tab?.classList.contains('active')||!panel||panel.hidden)return false;
  const rect=container.getBoundingClientRect();
  return rect.top<window.innerHeight&&rect.bottom>0;
}

function markSeen(){
  if(!latestFeedbackAt)return;
  if(latestFeedbackAt>seenAt())localStorage.setItem(SEEN_KEY,String(latestFeedbackAt));
  applyUnread(false);
}

function setIndicator(element:HTMLElement,unread:boolean){
  if(unread){
    element.dataset.adminFeedbackUnread='true';
    if(element.matches('[data-open-admin-analytics],[data-admin-submission-tab="feedback"]'))element.title='New user feedback received';
  }else{
    delete element.dataset.adminFeedbackUnread;
    if(element.title==='New user feedback received')element.removeAttribute('title');
  }
}

function applyUnread(unread=latestFeedbackAt>seenAt()){
  document.documentElement.classList.toggle('litlab-admin-feedback-unread',unread);
  document.querySelectorAll<HTMLElement>('.litlab-account-trigger,[data-open-admin-analytics],[data-admin-submission-tab="feedback"]').forEach(element=>setIndicator(element,unread));
}

function syncIndicators(){
  syncFrame=0;
  if(!isAdmin){applyUnread(false);return}
  if(feedbackIsVisible()&&latestFeedbackAt>seenAt()){markSeen();return}
  applyUnread();
}

function scheduleSync(){
  if(syncFrame)return;
  syncFrame=requestAnimationFrame(syncIndicators);
}

async function checkFeedback(force=false){
  if(!isAdmin||checking||!readSession())return;
  if(!force&&Date.now()-lastCheckAt<10000){scheduleSync();return}
  checking=true;
  try{
    const data=await rpc<FeedbackData>('get_litlab_admin_feedback');
    latestFeedbackAt=newestFeedbackAt(data?.items||[]);
    lastCheckAt=Date.now();
    if(feedbackIsVisible()&&latestFeedbackAt>seenAt())markSeen();
    else applyUnread();
  }catch(error){
    console.debug('LitLab feedback notification check skipped.',error);
  }finally{checking=false}
}

async function detectAdmin(){
  if(!readSession())return;
  try{
    isAdmin=Boolean(await rpc<boolean>('is_litlab_admin'));
    scheduleSync();
    if(isAdmin)void checkFeedback(true);
  }catch{}
}

window.addEventListener('litlab:contributor-account-role',event=>{
  const detail=(event as CustomEvent<RoleState>).detail;
  isAdmin=Boolean(detail?.is_admin);
  scheduleSync();
  if(isAdmin)void checkFeedback(true);
});

window.addEventListener('hashchange',()=>{
  scheduleSync();
  if(isAdmin)void checkFeedback(true);
});
window.addEventListener('focus',()=>{if(isAdmin)void checkFeedback(false)});
window.addEventListener('scroll',scheduleSync,{passive:true});
window.addEventListener('litlab:submission-sent',()=>{if(isAdmin)setTimeout(()=>void checkFeedback(true),600)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isAdmin)void checkFeedback(false)});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('.litlab-account-trigger')&&isAdmin)void checkFeedback(false);
  if(target?.closest('[data-admin-submission-tab="feedback"]'))setTimeout(()=>{scheduleSync();if(isAdmin)void checkFeedback(false)},0);
},true);

new MutationObserver(scheduleSync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','data-loaded']});
window.setInterval(()=>{if(document.visibilityState==='visible'&&isAdmin)void checkFeedback(false)},CHECK_INTERVAL);

setTimeout(()=>void detectAdmin(),900);
scheduleSync();