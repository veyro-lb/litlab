type Assignment=Record<string,any>&{
  application_id:string;
  contribution_type?:string;
  promotion_evidence_count?:number;
  promotion_evidence_file_count?:number;
  promotion_latest_evidence_at?:string|null;
};
type WorkspaceEvent={assignments?:Assignment[]};

const COOLDOWN_MS=15_500;
const RETRY_MS=16_500;
let assignments:Assignment[]=[];
const lastKick=new Map<string,number>();
const retryTimers=new Map<string,number>();

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function isPromotion(a:Assignment|null|undefined){return String(a?.contribution_type||'').trim().toLowerCase()==='promotion'}
function evidenceCount(a:Assignment){return Math.max(0,Number(a.promotion_evidence_count||0))}
function fileCount(a:Assignment){return Math.max(0,Number(a.promotion_evidence_file_count||0))}
function cardFor(id:string){
  return Array.from(document.querySelectorAll<HTMLElement>('.ll-teacher-assignment')).find(card=>
    card.dataset.promotionApplicationId===id||card.dataset.teacherStudentId===id
  )||null;
}
function renderedEvidenceCount(card:HTMLElement){return card.querySelectorAll('.ll-promotion-evidence-list > article').length}
function panelIsStale(a:Assignment,card:HTMLElement|null){
  const expected=evidenceCount(a);
  if(expected<=0)return false;
  if(!card)return true;
  const panel=card.querySelector<HTMLElement>('[data-promotion-supervisor-panel]');
  if(!panel)return true;
  if(renderedEvidenceCount(card)>=expected)return false;
  const copy=(panel.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(panel.querySelector('.ll-promotion-loading,[data-promotion-teacher-placeholder]'))return true;
  if(copy.includes('waiting for evidence')||copy.includes('waiting for student evidence')||copy.includes('nothing to approve yet')||copy.includes('no promotion evidence yet'))return true;
  return renderedEvidenceCount(card)<expected;
}
function showRefreshing(a:Assignment,card:HTMLElement|null){
  if(!card)return;
  const panel=card.querySelector<HTMLElement>('[data-promotion-supervisor-panel]');
  if(!panel)return;
  const loading=panel.querySelector<HTMLElement>('.ll-promotion-loading');
  if(!loading)return;
  loading.innerHTML=`<div class="ll-promotion-loading-mark" aria-hidden="true"><span></span></div><div class="ll-promotion-loading-copy"><span>PROMOTION EVIDENCE</span><b>Evidence submitted — opening review</b><p>${evidenceCount(a)} evidence item${evidenceCount(a)===1?'':'s'}${fileCount(a)?` and ${fileCount(a)} attachment${fileCount(a)===1?'':'s'}`:''} ${evidenceCount(a)===1?'is':'are'} saved. LitLab is loading the supervisor review details now.</p></div><em>Refreshing</em>`;
}
function clearRetry(id:string){const timer=retryTimers.get(id);if(timer)window.clearTimeout(timer);retryTimers.delete(id)}
function scheduleRetry(a:Assignment){
  clearRetry(a.application_id);
  const timer=window.setTimeout(()=>{
    retryTimers.delete(a.application_id);
    const latest=assignments.find(row=>row.application_id===a.application_id)||a;
    check(latest,true);
  },RETRY_MS);
  retryTimers.set(a.application_id,timer);
}
function kick(a:Assignment,force=false){
  const id=a.application_id;if(!id)return;
  const now=Date.now();const previous=lastKick.get(id)||0;
  if(!force&&now-previous<COOLDOWN_MS)return;
  lastKick.set(id,now);
  showRefreshing(a,cardFor(id));
  window.dispatchEvent(new CustomEvent('litlab:contributor-workspace-updated',{detail:{
    source:'promotion-teacher-evidence-sync',applicationId:id,evidenceCount:evidenceCount(a),fileCount:fileCount(a),latestEvidenceAt:a.promotion_latest_evidence_at||null
  }}));
  scheduleRetry(a);
}
function check(a:Assignment,force=false){
  if(route()!=='contribute'||!isPromotion(a)||evidenceCount(a)<=0){clearRetry(a.application_id);return}
  const card=cardFor(a.application_id);
  if(!panelIsStale(a,card)){clearRetry(a.application_id);return}
  kick(a,force);
}
function checkAll(force=false){assignments.filter(isPromotion).forEach(a=>check(a,force))}

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};
  if(Array.isArray(detail.assignments))assignments=detail.assignments;
  window.setTimeout(()=>checkAll(false),40);
});
window.addEventListener('litlab:promotion-context-ready',()=>window.setTimeout(()=>checkAll(false),80));
window.addEventListener('focus',()=>window.setTimeout(()=>checkAll(true),80));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.setTimeout(()=>checkAll(true),80)});
window.addEventListener('hashchange',()=>{if(route()!=='contribute'){retryTimers.forEach(timer=>window.clearTimeout(timer));retryTimers.clear();lastKick.clear();assignments=[]}});

export {};
