type Row=Record<string,any>;
type Assignment=Row&{application_id?:string;documents?:Row[];reviews?:Row[]};
type WorkspaceEvent={assignments?:Assignment[]};

let assignments:Assignment[]=[];

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function time(value:unknown){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0}
function needsReview(item:Assignment){
  const docs=Array.isArray(item.documents)?item.documents:[];
  const reviews=Array.isArray(item.reviews)?item.reviews:[];
  const latestDoc=docs.slice().sort((a,b)=>time(b.created_at)-time(a.created_at))[0];
  const latestReview=reviews.slice().sort((a,b)=>time(b.created_at)-time(a.created_at))[0];
  return Boolean(latestDoc&&(!latestReview||time(latestDoc.created_at)>time(latestReview.created_at)));
}
function guideButton(key:string){return document.querySelector<HTMLButtonElement>(`[data-contributor-state-guide] [data-section-key="${CSS.escape(key)}"]`)}
function visible(el:HTMLElement|null){return Boolean(el&&el.isConnected&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden')}
function fallback(key:string){
  const selectors:Record<string,string>={
    application:'[data-contributor-application-launcher],#contribute-apply',
    status:'[data-review-lifecycle-path],.ll-workspace-status',
    orientation:'[data-v3-standard]',
    project:'.ll-workspace-brief,.ll-workspace-wait',
    tasks:'.ll-task-list',
    revisions:'.ll-revision-list',
    submission:'.ll-workspace-docs',
    'teacher-feedback':'[data-student-teacher-feedback]',
    'assigned-students':'[data-teacher-student-roster],[data-teacher-student-browser]',
    'review-student':'form[data-teacher-review]:not([hidden]),form.ll-review-form:not([hidden])',
    'review-history':'.ll-review-history',
    messages:'[data-contributor-chat-hub]',
    history:'[data-v3-history],[data-my-contributions]',
    completion:'[data-lifecycle-complete-card],[data-contributor-completion-archive]',
    impact:'[data-v3-impact]',
    journey:'[data-v3-journey]'
  };
  return document.querySelector<HTMLElement>(selectors[key]||'');
}
function focusTarget(target:HTMLElement){
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  window.setTimeout(()=>target.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')?.focus({preventScroll:true}),300);
}
function selectStudentNeedingReview(){
  const item=assignments.find(needsReview);if(!item?.application_id)return false;
  const button=document.querySelector<HTMLButtonElement>(`[data-teacher-student-select="${CSS.escape(String(item.application_id))}"]`);
  if(!button)return false;
  button.click();
  return true;
}
function activate(key:string,attempt=0){
  if(key==='review-student'&&attempt===0&&selectStudentNeedingReview()){
    window.setTimeout(()=>activate(key,1),120);
    return;
  }
  const button=guideButton(key);
  if(button&&!button.classList.contains('locked')){button.click();return}
  if(button&&button.classList.contains('locked')){button.click();return}
  const target=fallback(key);if(visible(target))focusTarget(target!);
}
function normalize(value:string){return ({standard:'orientation',brief:'project',documents:'submission'} as Record<string,string>)[value]||value}

document.addEventListener('click',event=>{
  if(route()!=='contribute')return;
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const action=target.closest<HTMLButtonElement>('[data-contributor-journey-jump],[data-v3-jump]');if(!action)return;
  const raw=action.dataset.contributorJourneyJump||action.dataset.v3Jump||'';if(!raw)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  activate(normalize(raw));
},true);

window.addEventListener('litlab:contributor-workspace-data',event=>{
  const rows=(event as CustomEvent<WorkspaceEvent>).detail?.assignments;
  if(Array.isArray(rows))assignments=rows;
});
window.addEventListener('hashchange',()=>{if(route()!=='contribute')assignments=[]});

export {};
