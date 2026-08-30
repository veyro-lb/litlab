import './admin-role-preview.css';

type PreviewRole='student'|'teacher';
type RoleState={role?:PreviewRole|null;is_admin?:boolean};

type PreviewEventDetail={active:boolean;role:PreviewRole|null;actual_is_admin:true;read_only:true};

const SESSION_KEY='litlabAdminPreviewRole';
const AUTH_SESSION_KEY='litlabSupabaseSession';
const ROLE_RPC='get_my_litlab_contributor_account_role';
const SUPABASE_HOST='qdqseajcukfdbfikjptu.supabase.co';

let actualAdmin=false;
let actualRoleState:RoleState|null=null;
let previewRole=readStoredPreview();
let lastAuthValue=localStorage.getItem(AUTH_SESSION_KEY)||'';
let statusTimer=0;

const nativeFetch=window.fetch.bind(window);

function readStoredPreview():PreviewRole|null{
  try{
    const value=sessionStorage.getItem(SESSION_KEY);
    return value==='student'||value==='teacher'?value:null;
  }catch{return null}
}

function writeStoredPreview(role:PreviewRole|null){
  try{if(role)sessionStorage.setItem(SESSION_KEY,role);else sessionStorage.removeItem(SESSION_KEY)}catch{}
}

function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0].trim().toLowerCase()||'home'}
function signedIn(){
  try{return Boolean((JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)||'null') as {access_token?:string}|null)?.access_token)}catch{return false}
}
function roleLabel(role:PreviewRole){return role==='teacher'?'Teacher':'Student'}
function active(){return actualAdmin&&Boolean(previewRole)}

function inputUrl(input:RequestInfo|URL){return typeof input==='string'?input:input instanceof URL?input.toString():input.url}
function inputMethod(input:RequestInfo|URL,init?:RequestInit){return String(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase()}
function inputCache(input:RequestInfo|URL,init?:RequestInit){return init?.cache||(input instanceof Request?input.cache:undefined)}
function parsedUrl(input:RequestInfo|URL){try{return new URL(inputUrl(input),location.href)}catch{return null}}
function roleRpc(url:URL){return url.hostname===SUPABASE_HOST&&url.pathname.endsWith(`/rest/v1/rpc/${ROLE_RPC}`)}

function previewRoleResponse(){
  return new Response(JSON.stringify({role:previewRole,is_admin:false,needs_choice:false,has_conflict:false,existing_roles:[previewRole],preview_admin:true,actual_is_admin:true}),{
    status:200,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
  });
}

function mutationRpcName(url:URL){
  const marker='/rest/v1/rpc/';
  const index=url.pathname.indexOf(marker);
  return index<0?'':decodeURIComponent(url.pathname.slice(index+marker.length));
}

function isPreviewMutation(url:URL,method:string){
  if(url.hostname!==SUPABASE_HOST)return false;
  if(method==='GET'||method==='HEAD'||method==='OPTIONS')return false;
  if(roleRpc(url))return false;
  if(url.pathname.startsWith('/storage/v1/'))return true;
  if(!url.pathname.startsWith('/rest/v1/'))return false;
  const rpc=mutationRpcName(url);
  if(rpc){
    return /^(set|create|update|delete|submit|save|assign|approve|reject|archive|restore|send|mark|finalize|upsert|insert|record|complete|promote|revoke|remove|add|claim|publish|notify)_/i.test(rpc);
  }
  return method==='POST'||method==='PATCH'||method==='PUT'||method==='DELETE';
}

window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
  if(!active())return nativeFetch(input,init);
  const url=parsedUrl(input);if(!url)return nativeFetch(input,init);
  const method=inputMethod(input,init);
  // account-role-auth marks its authoritative admin lookup with cache:no-store.
  // Every other contributor role lookup receives the temporary preview role.
  if(roleRpc(url)&&inputCache(input,init)!=='no-store')return previewRoleResponse();
  if(isPreviewMutation(url,method)){
    showStatus('Preview is read-only — no LitLab data was changed.');
    return new Response(JSON.stringify({message:'Admin preview is read-only. Exit preview to make changes.'}),{status:403,headers:{'Content-Type':'application/json'}});
  }
  return nativeFetch(input,init);
}) as typeof window.fetch;

function dispatchPreviewEvent(){
  const detail:PreviewEventDetail={active:active(),role:previewRole,actual_is_admin:true,read_only:true};
  window.dispatchEvent(new CustomEvent<PreviewEventDetail>('litlab:admin-preview-role',{detail}));
}

function refreshContributorExperience(){
  dispatchPreviewEvent();
  if(route()==='contribute'){
    window.setTimeout(()=>window.dispatchEvent(new HashChangeEvent('hashchange')) ,0);
  }else location.hash='contribute';
}

function setPreview(role:PreviewRole){
  if(!actualAdmin)return;
  previewRole=role;writeStoredPreview(role);syncUi();refreshContributorExperience();
}

function exitPreview(){
  previewRole=null;writeStoredPreview(null);syncUi();dispatchPreviewEvent();
  if(route()==='contribute')location.hash='admin';
}

function showStatus(message:string){
  window.clearTimeout(statusTimer);
  document.querySelectorAll<HTMLElement>('[data-admin-preview-status]').forEach(el=>{el.textContent=message;el.hidden=false});
  statusTimer=window.setTimeout(()=>document.querySelectorAll<HTMLElement>('[data-admin-preview-status]').forEach(el=>{el.textContent='Read-only preview — your real account remains Admin.';el.hidden=false}),2600);
}

function menuMarkup(){
  const studentActive=previewRole==='student'?' is-active':'';
  const teacherActive=previewRole==='teacher'?' is-active':'';
  return `<section class="ll-admin-preview-menu" data-admin-preview-menu><div class="ll-admin-preview-menu-head"><span>ADMIN PREVIEW</span><b>View LitLab as another role</b><small>Your login stays Admin. Preview mode never changes your saved account type.</small></div><div class="ll-admin-preview-menu-actions"><button type="button" class="${studentActive}" data-admin-preview="student" aria-pressed="${previewRole==='student'}"><i>✦</i>Student</button><button type="button" class="${teacherActive}" data-admin-preview="teacher" aria-pressed="${previewRole==='teacher'}"><i>✓</i>Teacher</button></div>${previewRole?'<button type="button" class="ll-admin-preview-exit-menu" data-admin-preview-exit>Exit preview</button>':''}</section>`;
}

function ensureMenu(){
  const menu=document.querySelector<HTMLElement>('.litlab-account-menu');if(!menu)return;
  menu.querySelector('[data-admin-preview-menu]')?.remove();
  if(!actualAdmin)return;
  const fragment=document.createRange().createContextualFragment(menuMarkup());
  const signout=menu.querySelector('.litlab-signout');if(signout)menu.insertBefore(fragment,signout);else menu.append(fragment);
  menu.querySelectorAll<HTMLButtonElement>('[data-admin-preview]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();setPreview(button.dataset.adminPreview as PreviewRole)}));
  menu.querySelector<HTMLButtonElement>('[data-admin-preview-exit]')?.addEventListener('click',event=>{event.stopPropagation();exitPreview()});
}

function bannerMarkup(role:PreviewRole){
  const other=role==='teacher'?'student':'teacher';
  return `<aside class="ll-admin-preview-banner" data-admin-preview-banner role="status" aria-live="polite"><div><span>ADMIN PREVIEW</span><b>Viewing ${roleLabel(role)} experience</b><small data-admin-preview-status>Read-only preview — your real account remains Admin.</small></div><div class="ll-admin-preview-banner-actions"><button type="button" data-admin-preview="${other}">View ${roleLabel(other)}</button><button type="button" data-admin-preview-exit>Exit preview</button></div></aside>`;
}

function ensureBanner(){
  document.querySelector('[data-admin-preview-banner]')?.remove();
  if(!active()||!previewRole)return;
  document.body.insertAdjacentHTML('beforeend',bannerMarkup(previewRole));
  const banner=document.querySelector<HTMLElement>('[data-admin-preview-banner]');
  banner?.querySelector<HTMLButtonElement>('[data-admin-preview]')?.addEventListener('click',()=>setPreview((banner.querySelector<HTMLButtonElement>('[data-admin-preview]')?.dataset.adminPreview||'student') as PreviewRole));
  banner?.querySelector<HTMLButtonElement>('[data-admin-preview-exit]')?.addEventListener('click',exitPreview);
}

function syncDocumentState(){
  if(active()&&previewRole){
    document.documentElement.dataset.litlabAdminPreviewRole=previewRole;
    document.documentElement.dataset.litlabAdminPreview='true';
  }else{
    delete document.documentElement.dataset.litlabAdminPreviewRole;
    delete document.documentElement.dataset.litlabAdminPreview;
  }
}

function syncUi(){syncDocumentState();ensureBanner();ensureMenu()}

function clearForNonAdmin(){
  actualAdmin=false;actualRoleState=null;previewRole=null;writeStoredPreview(null);syncUi();dispatchPreviewEvent();
}

window.addEventListener('litlab:contributor-account-role',event=>{
  const detail=(event as CustomEvent<RoleState>).detail;if(!detail||typeof detail!=='object')return;
  actualRoleState=detail;actualAdmin=Boolean(detail.is_admin);
  if(!actualAdmin){clearForNonAdmin();return}
  previewRole=readStoredPreview();syncUi();
  if(previewRole&&route()==='contribute')window.setTimeout(refreshContributorExperience,40);
});

document.addEventListener('submit',event=>{
  if(!active())return;
  const form=event.target instanceof HTMLFormElement?event.target:null;if(!form)return;
  if(!form.closest('#ll-contributor-root,#ll-admin-contributor-workspace,[data-teacher-review],.ll-teacher-zone,.ll-contributor-page'))return;
  event.preventDefault();event.stopImmediatePropagation();showStatus('Preview is read-only — form submission was blocked.');
},true);

document.addEventListener('click',event=>{
  const trigger=event.target instanceof Element?event.target.closest('.litlab-account-trigger'):null;
  if(trigger)window.setTimeout(ensureMenu,40);
},true);

const observer=new MutationObserver(()=>{
  if(actualAdmin&&!signedIn()){clearForNonAdmin();return}
  if(actualAdmin){if(document.querySelector('.litlab-account-menu')&&!document.querySelector('[data-admin-preview-menu]'))ensureMenu();if(active()&&!document.querySelector('[data-admin-preview-banner]'))ensureBanner()}
});
observer.observe(document.body,{childList:true,subtree:true});

window.setInterval(()=>{
  const auth=localStorage.getItem(AUTH_SESSION_KEY)||'';
  if(auth===lastAuthValue)return;lastAuthValue=auth;
  if(!signedIn())clearForNonAdmin();
},900);

syncUi();

export {};
