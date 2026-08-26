import './ui-quality-pass.css';
import './mobile-hardening.css';

const bookSearchExamples:Record<string,string>={
  'The Handmaid’s Tale':'Search Ceremony, resistance, Historical Notes…',
  'The Handmaid\'s Tale':'Search Ceremony, resistance, Historical Notes…',
  'Frankenstein':'Search creation, rejection, ambition, Arctic…',
  'Nineteen Eighty-Four':'Search Big Brother, Room 101, Newspeak, paperweight…',
  'Persepolis':'Search veil, Anoosh, Vienna, war, departure…'
};

let scheduled=false;

function replaceText(element:HTMLElement|null,from:string,to:string){
  if(!element?.textContent?.includes(from))return;
  element.textContent=element.textContent.replace(from,to);
}

function polishAuthCopy(){
  const dialog=document.querySelector<HTMLElement>('.litlab-auth-dialog');
  if(dialog){
    const intro=dialog.querySelector<HTMLElement>(':scope > p');
    if(intro&&intro.textContent?.includes('Use your Google account'))intro.textContent='Choose an available sign-in method to create or access your LitLab account. You can also close this window and keep browsing.';
    const note=dialog.querySelector<HTMLElement>(':scope > small');
    if(note&&note.textContent?.includes('Google password'))note.textContent='Your sign-in password is handled by your provider and is never shared with LitLab.';
  }
  document.querySelectorAll<HTMLElement>('.litlab-account-status b').forEach(element=>{if(element.textContent?.trim()==='Google account connected')element.textContent='Account connected'});
}

function polishAccountCenter(){
  const card=document.querySelector<HTMLElement>('.litlab-account-center-card');
  if(!card)return;
  const connected=card.querySelector<HTMLElement>('.litlab-account-center-head i');if(connected?.textContent?.trim()==='Google connected')connected.textContent='Account connected';
  const identity=card.querySelector<HTMLElement>('.litlab-account-center-head p');if(identity?.textContent?.trim()==='Google account')identity.textContent='Signed-in account';
  replaceText(card.querySelector<HTMLElement>('.litlab-account-center-explain'),'stored with your Google account','stored with your LitLab account');
  const message=card.querySelector<HTMLElement>('[data-account-message]');
  if(message?.textContent?.includes('Your Google password and other Google data'))message.textContent='Only LitLab learning progress is included. Your sign-in password and external account data are never stored by LitLab.';
}

function polishAdminCopy(){
  document.querySelectorAll<HTMLElement>('.admin-user-table th').forEach(element=>{if(element.textContent?.trim()==='Last Google sign-in')element.textContent='Last provider sign-in'});
  document.querySelectorAll<HTMLElement>('.admin-metric small,.admin-gate-card p,.admin-privacy p').forEach(element=>{
    if(!element.textContent)return;
    const next=element.textContent.replace('Google-authenticated LitLab accounts','Authenticated LitLab accounts').replace('recent Google sign-in','recent provider sign-in').replace('approved LitLab developer Google account','approved LitLab developer account').replace('No Google passwords, Gmail messages, Drive files','No provider passwords, email messages, cloud files');
    if(next!==element.textContent)element.textContent=next;
  });
}

function polishDashboard(){const local=document.querySelector<HTMLElement>('.my-litlab-local');if(local?.textContent?.includes('no account'))local.textContent='Saved on this browser'}

function polishBookProfile(){
  const page=document.querySelector<HTMLElement>('.books-profile-page');if(!page)return;
  const title=page.querySelector<HTMLElement>('.book-profile-hero-copy h1')?.textContent?.trim()||'';
  const placeholder=bookSearchExamples[title];const input=page.querySelector<HTMLInputElement>('[data-moment-search]');if(placeholder&&input&&input.placeholder!==placeholder)input.placeholder=placeholder;
}

function polishPaper1Copy(){
  const page=document.querySelector<HTMLElement>('.paper1-guide-page');if(!page)return;
  const eyebrow=page.querySelector<HTMLElement>('.paper1-eyebrow');if(eyebrow?.textContent?.includes("ELENA'S CONTENT PACK"))eyebrow.textContent='✦ PAPER 1 • LITLAB STUDY GUIDE';
  replaceText(page.querySelector<HTMLElement>('.paper1-hero-copy>p'),'full Paper 1 content pack','full Paper 1 guide');
  const courseNote=page.querySelector<HTMLElement>('.paper1-verify-note p');
  if(courseNote?.textContent?.includes("Elena's pack lists"))courseNote.textContent='LitLab’s current working reference lists SL as 1h15 / 20 marks / 35% and HL as 2h15 / 40 marks / 35%. Because your school should follow the current course guide, confirm exact timing and weighting with your teacher before an exam.';
  const annotationNote=page.querySelector<HTMLElement>('.paper1-micro-note');
  if(annotationNote?.textContent?.includes("Elena's suggested target"))annotationNote.textContent='If nearly the whole text is highlighted, you have not prioritized. A useful target is roughly 6–8 genuinely useful moments.';
}

function polish(){scheduled=false;polishAuthCopy();polishAccountCenter();polishAdminCopy();polishDashboard();polishBookProfile();polishPaper1Copy()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(polish)}

const relevantSelector=['.litlab-auth-dialog','.litlab-account-menu','.litlab-account-center-card','.admin-page','.admin-gate','.my-litlab-dashboard','.books-profile-page','.paper1-guide-page'].join(',');
function relevantNode(node:Node){if(!(node instanceof Element))return false;return node.matches(relevantSelector)||Boolean(node.querySelector(relevantSelector))}
const observer=new MutationObserver(mutations=>{for(const mutation of mutations){for(const node of mutation.addedNodes){if(relevantNode(node)){schedule();return}}}});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
