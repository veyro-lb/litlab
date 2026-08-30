import './contributor-journey-live-sync.css';

type Role='student'|'teacher'|'';
type Row=Record<string,any>;
type WorkspaceEvent={workspaces?:Row[];assignments?:Row[];selectedId?:string;source?:string;syncedAt?:number};
type SyncMessage={type:'refresh';at:number;reason:string};

const SESSION_KEY='litlabSupabaseSession';
const CHANNEL_NAME='litlab-contributor-journey-sync-v1';
const ACTIVE_POLL_MS=10_000;
const STATUS_TICK_MS=5_000;

let pollTimer=0;
let refreshTimer=0;
let refreshDue=0;
let statusTimer=0;
let observerTimer=0;
let lastSyncedAt=0;
let lastChangedAt=0;
let lastSnapshot='';

const channel=typeof BroadcastChannel==='function'?new BroadcastChannel(CHANNEL_NAME):null;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function token(){try{return String((JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as {access_token?:string}|null)?.access_token||'')}catch{return ''}}
function root(){return document.getElementById('ll-contributor-root')}
function role():Role{const value=root()?.dataset.contributorAccountRole||'';return value==='student'||value==='teacher'?value:''}
function eligible(){return route()==='contribute'&&Boolean(token())&&!document.hidden&&navigator.onLine}
function timestamp(value:unknown){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}

function compactWorkspace(row:Row){
  return {
    id:row.id,status:row.status,status_updated_at:row.status_updated_at,applicant_type:row.applicant_type,
    brief:row.brief?{project_title:row.brief.project_title,due_at:row.brief.due_at,goal:row.brief.goal,deliverable:row.brief.deliverable}:null,
    tasks:Array.isArray(row.tasks)?row.tasks.map((item:Row)=>[item.id,item.status,item.due_at,item.title]):[],
    revisions:Array.isArray(row.revisions)?row.revisions.map((item:Row)=>[item.id,item.status,item.created_at,item.contributor_response]):[],
    documents:Array.isArray(row.documents)?row.documents.map((item:Row)=>[item.id,item.created_at,item.version_label,item.original_name]):[],
    reviews:Array.isArray(row.reviews)?row.reviews.map((item:Row)=>[item.created_at,item.recommendation,item.summary,item.reviewer_name]):[],
    reviewer:row.reviewer?{name:row.reviewer.name,assigned_at:row.reviewer.assigned_at}:null,
    v3:row.v3?{onboarding:row.v3.onboarding,brief_agreement:row.v3.brief_agreement}:null
  };
}

function compactAssignment(row:Row){
  return {
    id:row.application_id,status:row.status,assigned_at:row.assigned_at,student_name:row.student_name,topics:row.topics,
    documents:Array.isArray(row.documents)?row.documents.map((item:Row)=>[item.id,item.created_at,item.version_label,item.original_name]):[],
    reviews:Array.isArray(row.reviews)?row.reviews.map((item:Row)=>[item.created_at,item.recommendation,item.summary]):[]
  };
}

function snapshot(detail:WorkspaceEvent){
  try{return JSON.stringify({selectedId:detail.selectedId||'',workspaces:(detail.workspaces||[]).map(compactWorkspace),assignments:(detail.assignments||[]).map(compactAssignment)})}catch{return `${detail.selectedId||''}:${detail.workspaces?.length||0}:${detail.assignments?.length||0}`}
}

function clearRefresh(){window.clearTimeout(refreshTimer);refreshTimer=0;refreshDue=0}
function fireRefresh(reason:string){
  clearRefresh();
  if(!eligible())return;
  window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{kind:'journey_sync',reason,source:'journey-live-sync'}}));
}
function requestRefresh(reason:string,delay=0){
  if(route()!=='contribute'||!token())return;
  const due=Date.now()+Math.max(0,delay);
  if(refreshTimer&&refreshDue<=due)return;
  clearRefresh();refreshDue=due;
  refreshTimer=window.setTimeout(()=>fireRefresh(reason),Math.max(0,due-Date.now()));
}
function shareRefresh(reason:string){
  try{channel?.postMessage({type:'refresh',at:Date.now(),reason} satisfies SyncMessage)}catch{}
}

function clearPoll(){window.clearTimeout(pollTimer);pollTimer=0}
function schedulePoll(){
  clearPoll();
  if(route()!=='contribute'||!token()||document.hidden)return;
  pollTimer=window.setTimeout(()=>{
    if(navigator.onLine)requestRefresh('live-poll');
    schedulePoll();
  },ACTIVE_POLL_MS);
}

function forceJourneyRender(){
  const journey=document.querySelector<HTMLElement>('[data-v3-journey],#ll-v3-journey');
  if(journey)delete journey.dataset.journeySignature;
}
function syncAge(){
  if(!navigator.onLine)return 'Offline · progress will sync when you reconnect';
  if(!lastSyncedAt)return 'Live sync is starting…';
  const seconds=Math.max(0,Math.floor((Date.now()-lastSyncedAt)/1000));
  if(lastChangedAt&&Date.now()-lastChangedAt<12_000)return 'Updated · latest progress is synced';
  if(seconds<8)return 'Live · synced just now';
  if(seconds<60)return `Live · synced ${seconds}s ago`;
  return `Live · synced ${Math.floor(seconds/60)}m ago`;
}
function ensureStatus(){
  const journey=document.querySelector<HTMLElement>('[data-v3-journey],#ll-v3-journey');
  const accountRole=role();
  if(!journey||!accountRole){document.querySelector('[data-contributor-journey-live-sync]')?.remove();return}
  const head=journey.querySelector<HTMLElement>('.ll-v3-journey-head');if(!head)return;
  let status=head.querySelector<HTMLElement>('[data-contributor-journey-live-sync]');
  if(!status){status=document.createElement('div');status.dataset.contributorJourneyLiveSync='true';status.className='ll-contributor-journey-live-sync';head.append(status)}
  const label=accountRole==='teacher'?'Teacher journey':'Student journey';
  status.innerHTML=`<i aria-hidden="true"></i><span><b>${label} live</b><small>${syncAge()}</small></span>`;
  status.classList.toggle('is-offline',!navigator.onLine);
  journey.dataset.journeyLiveSyncedAt=String(lastSyncedAt||0);
}
function scheduleStatus(){
  window.clearTimeout(statusTimer);
  ensureStatus();
  statusTimer=window.setTimeout(scheduleStatus,STATUS_TICK_MS);
}

function workspaceData(event:Event){
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  const next=snapshot(detail);
  const now=Date.now();
  if(lastSnapshot&&next!==lastSnapshot)lastChangedAt=now;
  lastSnapshot=next;
  lastSyncedAt=Number(detail.syncedAt)||now;
  forceJourneyRender();
  window.setTimeout(ensureStatus,160);
  window.dispatchEvent(new CustomEvent('litlab:contributor-journey-synced',{detail:{role:role(),selectedId:detail.selectedId||'',syncedAt:lastSyncedAt,changedAt:lastChangedAt,source:detail.source||'workspace'}}));
}

function localChange(reason:string,delay=180){
  shareRefresh(reason);
  requestRefresh(reason,delay);
  schedulePoll();
}

channel?.addEventListener('message',event=>{
  const data=event.data as SyncMessage|undefined;
  if(!data||data.type!=='refresh')return;
  requestRefresh(`peer:${data.reason||'change'}`,80);
});

window.addEventListener('litlab:contributor-workspace-data',workspaceData);
window.addEventListener('litlab:contributor-submitted',()=>localChange('application-submitted',350));
window.addEventListener('litlab:contributor-admin-updated',()=>localChange('admin-updated',120));
window.addEventListener('litlab:certificate-read',()=>localChange('certificate-read',120));
window.addEventListener('litlab:contributor-account-role',()=>localChange('account-role',80));
window.addEventListener('litlab:contributor-workspace-updated',event=>{
  const detail=(event as CustomEvent<{source?:string;kind?:string}>).detail||{};
  if(detail.source==='journey-live-sync')return;
  shareRefresh(detail.kind||'workspace-updated');
  requestRefresh(detail.kind||'workspace-updated',160);
});

window.addEventListener('hashchange',()=>{
  lastSnapshot='';lastSyncedAt=0;lastChangedAt=0;
  if(route()==='contribute'){requestRefresh('navigation',70);schedulePoll();window.setTimeout(ensureStatus,220)}else{clearPoll();clearRefresh()}
});
window.addEventListener('focus',()=>{if(route()==='contribute'){requestRefresh('focus',40);schedulePoll()}});
window.addEventListener('pageshow',()=>{if(route()==='contribute'){requestRefresh('pageshow',40);schedulePoll()}});
window.addEventListener('online',()=>{if(route()==='contribute'){requestRefresh('online',20);schedulePoll();ensureStatus()}});
window.addEventListener('offline',ensureStatus);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearPoll();return}
  if(route()==='contribute'){requestRefresh('visible',40);schedulePoll();ensureStatus()}
});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY){lastSnapshot='';lastSyncedAt=0;requestRefresh('session-changed',40);schedulePoll()}});

document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;if(!form||route()!=='contribute')return;
  if(form.matches('#ll-contributor-form,[data-docx-upload],[data-revision-response],[data-activity-form],[data-teacher-review],form.ll-review-form'))localChange('form-submit',1200);
},false);

const observer=new MutationObserver(()=>{
  window.clearTimeout(observerTimer);
  observerTimer=window.setTimeout(ensureStatus,80);
});
function start(){
  observer.observe(document.body,{childList:true,subtree:true});
  scheduleStatus();
  if(route()==='contribute'){requestRefresh('startup',120);schedulePoll()}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {};
