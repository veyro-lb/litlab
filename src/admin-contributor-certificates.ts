import './admin-contributor-certificates.css';
import {saveCertificatePdf,type CertificatePdfData} from './litlab-pdf-export';

const SUPABASE_URL='https://qdqseajcukfdbfikjptu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_FNjxRB0rtl5TwnC8NtCDGg_RHEpSZLN';
const SESSION_KEY='litlabSupabaseSession';
const REQUEST_TIMEOUT_MS=12_000;

type StoredSession={access_token?:string};
type CertificateRecord={id:string;application_id:string;certificate_code:string;contributor_name:string;contributor_role:string;contribution_title:string;contribution_type:string;contribution_description:string;completed_at:string;issued_at:string;verified_minutes?:number|null;issuer_name:string;issuer_title:string;updated_at:string};
type Context={application_id:string;status:string;applicant_type:'student'|'teacher';full_name:string;contribution_type:string;topics?:string|null;contribution_idea?:string|null;completed_at?:string|null;self_recorded_minutes:number;document_count:number;project_title?:string|null;project_goal?:string|null;project_deliverable?:string|null;certificate?:CertificateRecord|null};

let listObserver:MutationObserver|null=null;
let observedList:HTMLElement|null=null;
let activeAppId='';
let context:Context|null=null;
let scanTimer=0;
let scanAttempts=0;
let scanQueued=false;

function token(){try{return (JSON.parse(localStorage.getItem(SESSION_KEY)||'null') as StoredSession|null)?.access_token||''}catch{return ''}}
function route(){return location.hash.replace(/^#/,'').split('#')[0].split('?')[0]||'home'}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
function label(value:unknown){return String(value??'').replace(/[-_]/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase())}
function fmtDate(value?:string|null){if(!value)return 'Not recorded';const d=new Date(value);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'})}
function duration(minutes:number){const h=minutes/60;return Number.isInteger(h)?`${h} hour${h===1?'':'s'}`:`${h.toFixed(1)} hours`}
function toPdf(cert:CertificateRecord,preview=false):CertificatePdfData{return {certificateCode:cert.certificate_code,contributorName:cert.contributor_name,contributorRole:cert.contributor_role,contributionTitle:cert.contribution_title,contributionType:label(cert.contribution_type),contributionDescription:cert.contribution_description,completedAt:cert.completed_at,issuedAt:cert.issued_at,verifiedMinutes:cert.verified_minutes,issuerName:cert.issuer_name,issuerTitle:cert.issuer_title,preview}}

async function rpc<T>(name:string,body:Record<string,unknown>={}):Promise<T>{
  const auth=token();if(!auth)throw new Error('Developer sign-in required');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${auth}`},body:JSON.stringify(body),signal:controller.signal});
    if(!response.ok){let message=`${name} failed (${response.status})`;try{const parsed=await response.json() as {message?:string};if(parsed.message)message=parsed.message}catch{}throw new Error(message)}
    const text=await response.text();return (text?JSON.parse(text):null) as T;
  }finally{window.clearTimeout(timeout)}
}

function cardCompleted(card:HTMLElement){return Boolean(card.querySelector('.admin-contrib-summary-meta .status.completed'))}
function setButtonContents(button:HTMLButtonElement,completed:boolean){
  const nextState=completed?'ready':'locked';
  if(button.dataset.certificateState===nextState)return;
  button.dataset.certificateState=nextState;
  const icon=document.createElement('span');icon.textContent=completed?'✦':'○';
  button.replaceChildren(icon,document.createTextNode(completed?' Certificate':' Certificate after completion'));
}
function enhanceCard(card:HTMLElement){
  const strip=card.querySelector<HTMLElement>('.admin-contrib-chat-strip');if(!strip)return;
  let button=card.querySelector<HTMLButtonElement>('[data-admin-certificate-open]');
  if(!button){button=document.createElement('button');button.type='button';button.dataset.adminCertificateOpen='true';button.className='admin-contributor-certificate-button';strip.appendChild(button)}
  const completed=cardCompleted(card);
  if(button.disabled===completed)button.disabled=!completed;
  button.classList.toggle('is-ready',completed);
  setButtonContents(button,completed);
  const title=completed?'Create, update or download this contributor certificate':'Set this contribution to Completed / final approved before issuing a certificate.';
  if(button.title!==title)button.title=title;
}
function enhanceCards(){if(route()!=='admin-contributors')return;document.querySelectorAll<HTMLElement>('.admin-contrib-card').forEach(enhanceCard)}
function queueEnhance(){if(scanQueued)return;scanQueued=true;requestAnimationFrame(()=>{scanQueued=false;enhanceCards()})}
function observeList(){
  window.clearTimeout(scanTimer);
  if(route()!=='admin-contributors'){listObserver?.disconnect();listObserver=null;observedList=null;return}
  const list=document.querySelector<HTMLElement>('[data-contrib-list]');
  if(!list){if(scanAttempts++<40)scanTimer=window.setTimeout(observeList,140);return}
  scanAttempts=0;
  if(observedList!==list){listObserver?.disconnect();observedList=list;listObserver=new MutationObserver(queueEnhance);listObserver.observe(list,{childList:true,subtree:true})}
  enhanceCards();
}

function modal(){return document.getElementById('ll-admin-certificate-modal')}
function close(){activeAppId='';context=null;modal()?.remove()}
function shell(){
  modal()?.remove();const overlay=document.createElement('div');overlay.id='ll-admin-certificate-modal';overlay.className='ll-admin-certificate-overlay';
  overlay.innerHTML=`<section class="ll-admin-certificate-modal" role="dialog" aria-modal="true" aria-label="Contributor certificate"><header><div><span>LITLAB • CERTIFICATE</span><h2>Contributor certificate</h2></div><button type="button" data-certificate-close aria-label="Close">×</button></header><div data-certificate-body><div class="ll-admin-certificate-loading"><i></i>Loading certificate record…</div></div></section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)close()});overlay.querySelector('[data-certificate-close]')?.addEventListener('click',close);document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('is-open'));
}
function role(ctx:Context){return ctx.applicant_type==='teacher'?'Teacher Reviewer / Mentor':'DP Student Contributor'}
function defaultDescription(ctx:Context){const parts=[ctx.project_goal,ctx.project_deliverable?`Deliverable: ${ctx.project_deliverable}`:''].filter(Boolean);return parts.join(' ')||ctx.contribution_idea||`${role(ctx)} contribution to LitLab.`}
function certificateDataFromForm(form:HTMLFormElement,preview=false):CertificatePdfData{
  if(!context)throw new Error('Certificate context is unavailable.');const data=new FormData(form);const hours=String(data.get('verified_hours')||'').trim();
  return {certificateCode:context.certificate?.certificate_code||(preview?'PREVIEW — NOT ISSUED':'PENDING'),contributorName:context.full_name,contributorRole:role(context),contributionTitle:String(data.get('title')||'').trim(),contributionType:label(context.contribution_type),contributionDescription:String(data.get('description')||'').trim(),completedAt:context.completed_at||new Date().toISOString(),issuedAt:context.certificate?.issued_at||new Date().toISOString(),verifiedMinutes:hours?Math.max(0,Math.round(Number(hours)*60)):null,issuerName:String(data.get('issuer_name')||'LitLab').trim()||'LitLab',issuerTitle:String(data.get('issuer_title')||'LitLab Contributor Program').trim()||'LitLab Contributor Program',preview};
}
function existingBlock(cert:CertificateRecord){return `<div class="ll-existing-certificate"><div><span>ISSUED CERTIFICATE</span><b>${esc(cert.certificate_code)}</b><small>Issued ${esc(fmtDate(cert.issued_at))} • Reissuing updates the same certificate ID and sends a fresh contributor notification.</small></div><button type="button" data-admin-download-issued-certificate>Download issued PDF</button></div>`}
function render(){
  const body=modal()?.querySelector<HTMLElement>('[data-certificate-body]');if(!body||!context)return;
  const cert=context.certificate;const title=cert?.contribution_title||context.project_title||context.topics||label(context.contribution_type);const description=cert?.contribution_description||defaultDescription(context);const verified=cert?.verified_minutes;const issuerName=cert?.issuer_name||'LitLab';const issuerTitle=cert?.issuer_title||'LitLab Contributor Program';const selfHours=context.self_recorded_minutes/60;
  body.innerHTML=`<div class="ll-admin-certificate-content">
    <section class="ll-certificate-person-summary"><div class="mark"><img src="./favicon.svg" alt="" aria-hidden="true"/></div><div><span>CONTRIBUTOR</span><h3>${esc(context.full_name)}</h3><p>${esc(role(context))} • ${esc(label(context.contribution_type))}</p></div><aside><b>${esc(fmtDate(context.completed_at))}</b><small>Completed / final approved</small></aside></section>
    ${cert?existingBlock(cert):''}
    <section class="ll-certificate-record-facts"><article><span>Word submissions</span><b>${context.document_count}</b></article><article><span>Self-recorded activity</span><b>${context.self_recorded_minutes?esc(duration(context.self_recorded_minutes)):'None'}</b></article><article><span>Certificate status</span><b>${cert?'Issued':'Not issued'}</b></article></section>
    <form data-admin-certificate-form>
      <div class="ll-admin-certificate-grid two"><label><span>Certificate contribution title</span><input name="title" maxlength="240" required value="${esc(title)}"/></label><label><span>Verified contribution time <small>(optional)</small></span><input name="verified_hours" type="number" min="0" max="${selfHours}" step="0.25" value="${verified==null?'':Number(verified)/60}" placeholder="Leave blank if not verified"/><small class="hint">Cannot exceed ${esc(duration(context.self_recorded_minutes||0))} self-recorded.</small></label></div>
      <label><span>Contribution description</span><textarea name="description" minlength="10" maxlength="3000" rows="5" required>${esc(description)}</textarea><small class="hint">Use factual wording describing the work LitLab actually verified. Do not claim IB/CAS approval.</small></label>
      <div class="ll-admin-certificate-grid two"><label><span>Issuer name</span><input name="issuer_name" maxlength="160" required value="${esc(issuerName)}"/></label><label><span>Issuer title</span><input name="issuer_title" maxlength="180" required value="${esc(issuerTitle)}"/></label></div>
      <div class="ll-admin-certificate-warning"><b>Before sending</b><p>Check the contributor name, contribution title, description, completion date and any verified time. “Issue & send” saves the certificate to this LitLab account, triggers a new-update notification, and lets the contributor download the PDF from their completed workspace.</p></div>
      <div class="ll-admin-certificate-actions"><button type="button" class="secondary" data-admin-certificate-preview>Preview PDF</button><button type="submit">${cert?'Update & resend certificate':'Issue & send certificate'}</button></div><small data-certificate-state role="status"></small>
    </form>
  </div>`;
}
async function openFor(card:HTMLElement){activeAppId=card.dataset.appId||'';if(!activeAppId)return;shell();try{context=await rpc<Context>('admin_get_litlab_contributor_certificate_context',{p_application_id:activeAppId});if(context.status!=='completed')throw new Error('Complete this contribution before issuing a certificate.');render()}catch(error){console.error(error);const body=modal()?.querySelector<HTMLElement>('[data-certificate-body]');if(body)body.innerHTML=`<div class="ll-admin-certificate-error"><b>Certificate builder could not load.</b><p>${esc(error instanceof Error?error.message:'Check your developer session and try again.')}</p></div>`}}
async function preview(form:HTMLFormElement,button:HTMLButtonElement){if(!form.checkValidity()){form.reportValidity();return}const original=button.textContent||'Preview PDF';button.disabled=true;button.textContent='Creating preview…';try{await saveCertificatePdf(certificateDataFromForm(form,true))}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}}
async function issue(form:HTMLFormElement,button:HTMLButtonElement){
  if(!context||!form.checkValidity()){form.reportValidity();return}
  const data=new FormData(form);const hours=String(data.get('verified_hours')||'').trim();const state=form.querySelector<HTMLElement>('[data-certificate-state]');const original=button.textContent||'Issue & send certificate';button.disabled=true;button.textContent='Sending certificate…';if(state){state.textContent='Saving certificate to the contributor account…';state.dataset.state=''}
  try{
    const cert=await rpc<CertificateRecord>('admin_issue_litlab_contributor_certificate',{p_application_id:context.application_id,p_contribution_title:String(data.get('title')||'').trim(),p_contribution_description:String(data.get('description')||'').trim(),p_verified_minutes:hours?Math.max(0,Math.round(Number(hours)*60)):null,p_issuer_name:String(data.get('issuer_name')||'LitLab').trim(),p_issuer_title:String(data.get('issuer_title')||'LitLab Contributor Program').trim()});
    context.certificate=cert;render();const newState=modal()?.querySelector<HTMLElement>('[data-certificate-state]');if(newState){newState.textContent='Certificate issued and sent to the contributor’s LitLab account.';newState.dataset.state='success'}window.dispatchEvent(new CustomEvent('litlab:contributor-admin-updated',{detail:{id:context.application_id,certificate:true}}));
  }catch(error){console.error(error);if(state){state.textContent=error instanceof Error?error.message:'Certificate could not be issued.';state.dataset.state='error'}}finally{if(button.isConnected){button.disabled=false;button.textContent=original}}
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const open=target.closest<HTMLButtonElement>('[data-admin-certificate-open]');if(open){const card=open.closest<HTMLElement>('.admin-contrib-card');if(card&&!open.disabled){event.preventDefault();event.stopPropagation();void openFor(card)}return}
  if(target.closest('[data-certificate-close]')){close();return}
  const previewButton=target.closest<HTMLButtonElement>('[data-admin-certificate-preview]');if(previewButton){const form=previewButton.closest<HTMLFormElement>('[data-admin-certificate-form]');if(form)void preview(form,previewButton).catch(error=>{console.error(error);window.alert('The certificate preview PDF could not be created.')});return}
  const downloadButton=target.closest<HTMLButtonElement>('[data-admin-download-issued-certificate]');if(downloadButton&&context?.certificate){void saveCertificatePdf(toPdf(context.certificate)).catch(error=>{console.error(error);window.alert('The certificate PDF could not be created.')})}
},true);

document.addEventListener('submit',event=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(!form?.matches('[data-admin-certificate-form]'))return;event.preventDefault();const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');if(button)void issue(form,button)},true);
document.addEventListener('change',event=>{const target=event.target instanceof Element?event.target:null;if(target?.matches('select[data-contributor-status]'))window.setTimeout(enhanceCards,80)},true);
window.addEventListener('hashchange',()=>{close();listObserver?.disconnect();listObserver=null;observedList=null;window.clearTimeout(scanTimer);scanAttempts=0;if(route()==='admin-contributors')setTimeout(observeList,120)});
window.addEventListener('litlab:contributor-admin-updated',()=>{if(route()==='admin-contributors')setTimeout(enhanceCards,80)});
window.addEventListener('focus',()=>{if(route()==='admin-contributors')enhanceCards()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeList,{once:true});else observeList();

export {};