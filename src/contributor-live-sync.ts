const USER_REFRESH_DELAY=180;
const FORM_REFRESH_DELAY=900;
let userTimer=0;
let adminTimer=0;

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}

function scheduleUserRefresh(delay=USER_REFRESH_DELAY){
  window.clearTimeout(userTimer);
  userTimer=window.setTimeout(()=>{
    if(route()!=='contribute'||document.hidden)return;
    const button=document.querySelector<HTMLButtonElement>('[data-my-contrib-refresh]');
    if(button&&!button.disabled)button.click();
  },delay);
}

function scheduleAdminRefresh(delay=USER_REFRESH_DELAY){
  window.clearTimeout(adminTimer);
  adminTimer=window.setTimeout(()=>{
    if(route()!=='admin-contributors'||document.hidden)return;
    const button=document.querySelector<HTMLButtonElement>('[data-contrib-refresh]');
    if(button&&!button.disabled)button.click();
  },delay);
}

window.addEventListener('litlab:contributor-submitted',()=>scheduleUserRefresh(120));
window.addEventListener('litlab:contributor-workspace-updated',()=>scheduleUserRefresh());
window.addEventListener('litlab:contributor-admin-updated',()=>scheduleAdminRefresh());
window.addEventListener('litlab:certificate-read',()=>scheduleUserRefresh(100));

// These workspace forms save asynchronously in contributor-workspace.ts. They do not all
// emit their own update event, so re-read permanent history shortly after submission. A failed
// save only causes a harmless re-read; successful saves become visible without manual refresh.
document.addEventListener('submit',event=>{
  const form=event.target instanceof HTMLFormElement?event.target:null;
  if(!form)return;
  if(form.matches('[data-revision-response],[data-activity-form],[data-teacher-review]'))scheduleUserRefresh(FORM_REFRESH_DELAY);
},false);

// When the admin notification layer discovers a new application/message, keep an open
// contributor dashboard aligned with it instead of waiting for the dashboard's next poll.
const attrObserver=new MutationObserver(records=>{
  if(route()!=='admin-contributors')return;
  if(records.some(record=>record.attributeName==='data-litlab-admin-contributor-update'))scheduleAdminRefresh(120);
});
attrObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-litlab-admin-contributor-update']});

export {};
