type Row=Record<string,any>;
type Assignment=Row&{
  application_id:string;
  contribution_type?:string;
  status?:string;
  student_name?:string;
  topics?:string;
};
type WorkspaceEvent={assignments?:Assignment[]};
type PromotionStage='loading'|'waiting_evidence'|'waiting_supervisor'|'supervisor_review'|'student_revision'|'admin_review'|'complete';
type PromotionState={label:string;detail:string;top:string;tone:'waiting'|'action'|'success';action:boolean;cssKey:string;lockedReason:string};

const SELECTED_KEY='litlabTeacherSelectedStudent';
let assignments:Assignment[]=[];
let scheduled=false;
let observer:MutationObserver|null=null;
const hiddenBeforePromotion=new WeakMap<HTMLElement,boolean>();
const headBeforePromotion=new WeakMap<HTMLElement,{title:string;copy:string}>();

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function host(){return document.querySelector<HTMLElement>('[data-contributor-workspace]')}
function isPromotion(a:Assignment|null|undefined){return String(a?.contribution_type||'').trim().toLowerCase()==='promotion'}
function text(el:Element|null|undefined,value:string){if(el&&el.textContent!==value)el.textContent=value}
function promotionAssignments(){return assignments.filter(isPromotion)}
function selectedApplicationId(root:HTMLElement){
  const selected=root.querySelector<HTMLButtonElement>('[data-teacher-student-select][aria-current="true"], [data-teacher-student-select].is-selected')?.dataset.teacherStudentSelect||'';
  if(selected&&assignments.some(a=>a.application_id===selected))return selected;
  const stored=sessionStorage.getItem(SELECTED_KEY)||'';
  if(stored&&assignments.some(a=>a.application_id===stored))return stored;
  return assignments[0]?.application_id||'';
}
function assignmentById(id:string){return assignments.find(a=>a.application_id===id)||null}
function cardFor(root:HTMLElement,id:string){
  const cards=Array.from(root.querySelectorAll<HTMLElement>('.ll-teacher-assignment'));
  return cards.find(card=>card.dataset.promotionApplicationId===id||card.dataset.teacherStudentId===id)||cards[assignments.findIndex(a=>a.application_id===id)]||null;
}
function stageFor(card:HTMLElement|null,a:Assignment):PromotionStage{
  if(String(a.status||'').toLowerCase()==='completed')return 'complete';
  if(!card)return 'loading';
  if(card.querySelector('[data-promotion-supervisor-review]'))return 'supervisor_review';
  const badge=card.querySelector<HTMLElement>('.ll-promotion-supervisor-head em');
  const stageClass=badge?Array.from(badge.classList).find(name=>name.startsWith('stage-')):'';
  const stage=String(stageClass||'').replace(/^stage-/,'') as PromotionStage;
  if(['waiting_evidence','waiting_supervisor','supervisor_review','student_revision','admin_review','complete'].includes(stage))return stage;
  const copy=(badge?.textContent||card.querySelector('[data-promotion-supervisor-panel]')?.textContent||'').toLowerCase();
  if(copy.includes('ready for supervisor review'))return 'supervisor_review';
  if(copy.includes('changes requested'))return 'student_revision';
  if(copy.includes('with litlab admin')||copy.includes('supervisor approved'))return 'admin_review';
  if(copy.includes('completed'))return 'complete';
  if(copy.includes('waiting for student evidence')||copy.includes('nothing to approve'))return 'waiting_evidence';
  if(copy.includes('supervisor link pending'))return 'waiting_supervisor';
  return card.querySelector('[data-promotion-supervisor-panel]')?'waiting_evidence':'loading';
}
function stateFor(stage:PromotionStage):PromotionState{
  if(stage==='supervisor_review')return {label:'Needs review',detail:'Promotion evidence is ready. Open the submitted links and files, check the student’s process, then complete the CAS supervisor review.',top:'CAS supervisor · promotion review needed',tone:'action',action:true,cssKey:'needs-review',lockedReason:''};
  if(stage==='student_revision')return {label:'Waiting for revision',detail:'You requested changes. Wait for the student to add or update their Promotion evidence before reviewing again.',top:'CAS supervisor · waiting for revised evidence',tone:'waiting',action:false,cssKey:'waiting-revision',lockedReason:'Waiting for the student to submit revised Promotion evidence.'};
  if(stage==='admin_review')return {label:'Sent to LitLab',detail:'You approved the current Promotion evidence. LitLab admin now owns the final review.',top:'CAS supervisor · Promotion sent to LitLab',tone:'waiting',action:false,cssKey:'sent-admin',lockedReason:'Your Promotion review is complete and the contribution is with LitLab admin.'};
  if(stage==='complete')return {label:'Complete',detail:'This Promotion contribution is complete. Your supervisor review remains attached to the student’s record.',top:'CAS supervisor · Promotion completed',tone:'success',action:false,cssKey:'complete',lockedReason:'This Promotion contribution is complete.'};
  if(stage==='waiting_supervisor')return {label:'Review setup pending',detail:'LitLab is finalizing the supervisor-review step for this Promotion contribution. No DOCX is required.',top:'CAS supervisor · review setup pending',tone:'waiting',action:false,cssKey:'waiting-doc',lockedReason:'The Promotion supervisor-review step is still being prepared.'};
  if(stage==='loading')return {label:'Checking evidence',detail:'Loading the student’s Promotion submission. No Word document is required for this contribution.',top:'CAS supervisor · checking Promotion evidence',tone:'waiting',action:false,cssKey:'waiting-doc',lockedReason:'The student’s Promotion evidence is still loading.'};
  return {label:'Waiting for evidence',detail:'The student has not submitted review-ready Promotion evidence yet. No supervisor action is needed, and no DOCX is required.',top:'CAS supervisor · waiting for promotion evidence',tone:'waiting',action:false,cssKey:'waiting-doc',lockedReason:'Waiting for the student to submit Promotion evidence.'};
}
function setStateClass(el:HTMLElement|null,state:PromotionState){
  if(!el)return;
  const wanted=`is-${state.cssKey}`;
  const current=Array.from(el.classList).filter(name=>name.startsWith('is-'));
  if(current.length!==1||current[0]!==wanted){current.forEach(name=>el.classList.remove(name));el.classList.add(wanted)}
  text(el,state.label);
}
function ensureTargetId(el:HTMLElement,id:string){if(!el.id)el.id=id;return el.id}
function lockGuideButton(button:HTMLButtonElement,state:PromotionState){
  button.classList.add('locked');button.setAttribute('aria-disabled','true');button.dataset.contributorLocked=state.lockedReason||'This Promotion review is not available yet.';
  delete button.dataset.contributorSectionJump;
  button.removeAttribute('aria-current');button.classList.remove('current');
}
function openGuideButton(button:HTMLButtonElement,target:HTMLElement){
  button.classList.remove('locked');button.removeAttribute('aria-disabled');delete button.dataset.contributorLocked;
  button.dataset.contributorSectionJump=ensureTargetId(target,`ll-promotion-supervisor-review-${target.closest<HTMLElement>('.ll-teacher-assignment')?.dataset.promotionApplicationId||'current'}`);
}
function ensurePromotionPlaceholder(card:HTMLElement,a:Assignment){
  const real=card.querySelector<HTMLElement>('[data-promotion-supervisor-panel]');
  const old=card.querySelector<HTMLElement>('[data-promotion-teacher-placeholder]');
  if(real){old?.remove();return real}
  if(old)return old;
  const placeholder=document.createElement('section');
  placeholder.className='ll-promotion-supervisor-panel';
  placeholder.dataset.promotionTeacherPlaceholder='true';
  placeholder.innerHTML=`<div class="ll-promotion-loading"><b>PROMOTION EVIDENCE REVIEW</b><span>Loading ${esc(a.student_name||'the student')}’s Promotion submission… No Word document is required.</span></div>`;
  const history=card.querySelector('.ll-review-history');
  if(history)history.before(placeholder);else card.appendChild(placeholder);
  return placeholder;
}
function patchPromotionCard(root:HTMLElement,a:Assignment){
  const card=cardFor(root,a.application_id);if(!card)return null;
  card.classList.add('ll-promotion-supervisor-card');card.dataset.promotionApplicationId=a.application_id;
  text(card.querySelector('.ll-card-title span'),'PROMOTION SUPERVISION');
  const docs=card.querySelector<HTMLElement>('.ll-assigned-docs');if(docs&&!docs.hidden)docs.hidden=true;
  card.querySelectorAll<HTMLElement>('form.ll-review-form,form[data-teacher-review],form[data-role-aware-review]').forEach(form=>{if(!form.hidden)form.hidden=true});
  const genericHistory=card.querySelector<HTMLElement>(':scope > .ll-review-history');if(genericHistory&&!genericHistory.hidden)genericHistory.hidden=true;
  ensurePromotionPlaceholder(card,a);
  return card;
}
function patchRoster(root:HTMLElement,a:Assignment,state:PromotionState){
  const button=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-teacher-student-select]')).find(item=>item.dataset.teacherStudentSelect===a.application_id);
  if(button){button.dataset.promotionAssignment='true';button.dataset.promotionAction=state.action?'true':'false';setStateClass(button.querySelector<HTMLElement>('em'),state)}
}
function refreshRosterCounts(root:HTMLElement){
  const roster=root.querySelector<HTMLElement>('[data-teacher-student-roster]');if(!roster)return;
  const buttons=Array.from(roster.querySelectorAll<HTMLButtonElement>('[data-teacher-student-select]'));
  const needs=buttons.filter(button=>button.dataset.promotionAction==='true'||(button.querySelector('em')?.textContent||'').trim().toLowerCase()==='needs review').length;
  const waiting=buttons.filter(button=>{const value=(button.querySelector('em')?.textContent||'').trim().toLowerCase();return value.includes('waiting')||value.includes('pending')||value.includes('checking')}).length;
  const counts=roster.querySelectorAll<HTMLElement>('.ll-teacher-roster-counts > span');
  if(counts[1])text(counts[1].querySelector('b'),String(needs));
  if(counts[2])text(counts[2].querySelector('b'),String(waiting));
  counts[1]?.classList.toggle('is-action',needs>0);
}
function patchSelectedHeader(root:HTMLElement,a:Assignment,state:PromotionState){
  const head=root.querySelector<HTMLElement>('[data-teacher-selected-head]');if(!head)return;
  const topic=a.topics||'Promotion contribution';
  const p=head.querySelector<HTMLElement>('p');
  const html=`<b>${esc(topic)}</b> · ${esc(state.detail)}`;
  if(p&&p.innerHTML!==html)p.innerHTML=html;
  setStateClass(head.querySelector<HTMLElement>('.ll-teacher-selected-actions em'),state);
}
function patchGuide(root:HTMLElement,a:Assignment,state:PromotionState,card:HTMLElement|null){
  const guide=document.querySelector<HTMLElement>('[data-contributor-state-guide]');if(!guide)return;
  guide.dataset.tone=state.tone;
  text(guide.querySelector('.ll-contributor-toc-state'),state.top);
  const review=guide.querySelector<HTMLButtonElement>('[data-section-key="review-student"]');
  if(review){
    text(review,'Review evidence');
    const target=card?.querySelector<HTMLElement>('[data-promotion-supervisor-review]')||card?.querySelector<HTMLElement>('[data-promotion-supervisor-panel]')||null;
    if(state.action&&target)openGuideButton(review,target);else lockGuideButton(review,state);
  }
  const history=guide.querySelector<HTMLButtonElement>('[data-section-key="review-history"]');
  if(history){
    text(history,'Supervisor history');
    const target=card?.querySelector<HTMLElement>('.ll-promotion-review-summary')||null;
    if(target)openGuideButton(history,target);else{
      history.classList.add('locked');history.setAttribute('aria-disabled','true');history.dataset.contributorLocked='Supervisor review history appears after you submit a Promotion review.';delete history.dataset.contributorSectionJump;
    }
  }
}
function setHiddenForPromotion(el:HTMLElement|null,hide:boolean){
  if(!el)return;
  if(hide){
    if(!hiddenBeforePromotion.has(el))hiddenBeforePromotion.set(el,el.hidden);
    if(!el.hidden)el.hidden=true;
    el.dataset.promotionTeacherHidden='true';
    return;
  }
  if(el.dataset.promotionTeacherHidden==='true'){
    el.hidden=hiddenBeforePromotion.get(el)??false;
    delete el.dataset.promotionTeacherHidden;
  }
}
function patchGenericTeacherSurfaces(root:HTMLElement,promotionSelected:boolean){
  const head=root.querySelector<HTMLElement>(':scope > .ll-workspace-head');
  if(head){
    const title=head.querySelector<HTMLElement>('h2'),copy=head.querySelector<HTMLElement>('p');
    if(promotionSelected){
      if(!headBeforePromotion.has(head))headBeforePromotion.set(head,{title:title?.textContent||'',copy:copy?.textContent||''});
      text(title,'Your Promotion supervisor workspace.');
      text(copy,'Review the student’s Promotion evidence, attached proof, results and reflection. No Word document is required for this contribution.');
    }else{
      const original=headBeforePromotion.get(head);if(original){text(title,original.title);text(copy,original.copy);headBeforePromotion.delete(head)}
    }
  }
  setHiddenForPromotion(root.querySelector<HTMLElement>('[data-teacher-reviewer-role-card]'),promotionSelected);
  setHiddenForPromotion(root.querySelector<HTMLElement>('[data-role-scope-card]'),promotionSelected);
  setHiddenForPromotion(root.querySelector<HTMLElement>('[data-teacher-mentor-dashboard]'),promotionSelected);
}
function apply(){
  scheduled=false;if(route()!=='contribute')return;
  const root=host();if(!root)return;
  const promotionRows=promotionAssignments();
  if(!assignments.length||!promotionRows.length){patchGenericTeacherSurfaces(root,false);return}
  const states=new Map<string,{card:HTMLElement|null;state:PromotionState}>();
  promotionRows.forEach(a=>{const card=patchPromotionCard(root,a);const state=stateFor(stageFor(card,a));states.set(a.application_id,{card,state});patchRoster(root,a,state)});
  refreshRosterCounts(root);
  const selectedId=selectedApplicationId(root);const selected=assignmentById(selectedId);const promotionSelected=isPromotion(selected);
  patchGenericTeacherSurfaces(root,promotionSelected);
  if(!selected||!promotionSelected)return;
  const data=states.get(selected.application_id)||{card:cardFor(root,selected.application_id),state:stateFor('loading')};
  patchSelectedHeader(root,selected,data.state);patchGuide(root,selected,data.state,data.card);
}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(apply)}
function startObserver(){
  observer?.disconnect();observer=new MutationObserver(records=>{
    if(!assignments.some(isPromotion))return;
    const relevant=records.some(record=>{
      const target=record.target instanceof Element?record.target:record.target.parentElement;
      return !target?.closest('[data-promotion-teacher-placeholder]');
    });
    if(relevant)schedule();
  });
  observer.observe(document.body,{childList:true,subtree:true});
}
window.addEventListener('litlab:contributor-workspace-data',event=>{const detail=(event as CustomEvent<WorkspaceEvent>).detail||{};if(Array.isArray(detail.assignments))assignments=detail.assignments;schedule()});
window.addEventListener('litlab:contributor-workspace-updated',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('hashchange',()=>{if(route()!=='contribute')assignments=[];schedule()});
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('[data-teacher-student-select]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{startObserver();schedule()},{once:true});else{startObserver();schedule()}

export {};
