import './ui-quality-pass.css';
import './mobile-hardening.css';
import './interaction-health.css';

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
  document.querySelectorAll<HTMLElement>('.litlab-account-status small').forEach(element=>{
    if(element.textContent?.includes('Progress sync can be added next'))element.textContent='Your saved LitLab tools and progress are connected to this account.';
  });
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

function polishHLEssayCopy(){
  const page=document.querySelector<HTMLElement>('.hl-guide-page[data-hl-guide="true"]');
  if(!page||page.dataset.directCopy==='true')return;
  const replacements:[string,string][]=[
    ['The supplied pack asks students to confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with their teacher/current official course guide.','Confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with your teacher and current official course guide.'],
    ['word range in the supplied pack','word range'],
    ['the pack frames it as narrower than the EE and grounded mainly in close reading rather than wider research','it is narrower than the EE and grounded mainly in close reading rather than wider research'],
    ['The pack says the HL Essay must be based on one work or body of work already studied in class.','The HL Essay must be based on one work or body of work already studied in class.'],
    ['For Language and Literature, the pack notes that the choice can be literary or non-literary if it was genuinely studied in class.','For Language and Literature, the choice can be literary or non-literary if it was genuinely studied in class.'],
    ['The supplied pack flags reuse of a work already used for the Individual Oral as a restriction; confirm the current rule with your teacher/course guide before finalizing your choice.','Confirm the current assessment-reuse rules with your teacher/current course guide before finalizing your choice.'],
    ['The pack suggests the course’s seven key concepts as useful starting points when you are not sure where to begin:','The course’s seven key concepts are useful starting points when you are not sure where to begin:'],
    ['The pack says limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.','Limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.'],
    ['The pack says to cite the primary work and any secondary sources consistently using the citation style required by your school. It notes that the IB does not mandate one universal style for this purpose.','Cite the primary work and any secondary sources consistently using the citation style required by your school. The IB does not mandate one universal citation style for this purpose.'],
    ['The pack describes the teacher as an adviser who can guide the line of inquiry and general direction.','The teacher acts as an adviser who can guide the line of inquiry and general direction.'],
    ['The pack distinguishes this from the Extended Essay: it says there is no equivalent formal multi-session reflection process or reflection form.','Unlike the Extended Essay, there is no equivalent formal multi-session reflection process or reflection form.'],
    ['The supplied pack summarizes four criteria worth 5 marks each, for 20 marks total.','The HL Essay is assessed across four criteria worth 5 marks each, for 20 marks total.'],
    ['The content pack specifically says the exact current descriptor wording should be confirmed against your school’s copy of the official subject guide.','Confirm the exact current descriptor wording against your school’s copy of the official subject guide.'],
    ['Use the pack’s practice bank to see how a focused inquiry connects a work, an authorial choice, and a course concept.','Use the practice bank to see how a focused inquiry connects a work, an authorial choice, and a course concept.'],
    ['The source pack suggests turning the narrowing examples and practice bank into a future Line of Inquiry Lab, plus a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.','Use the narrowing examples and practice bank as a Line of Inquiry Lab: test how well each inquiry narrows a concept, work, and authorial choice. The checklist is already interactive here.'],
    ['Know which details are firm in the pack and which ones still need school-level confirmation.','Know which details are established and which ones still need school-level confirmation.'],
    ['The pack says the 1,200–1,500 word range, one-work/body-of-work format, four 5-mark criteria, line-of-inquiry framing, and seven concepts were cross-checked against the official IB subject brief and several current teacher/tutoring guides.','The 1,200–1,500 word range, one-work/body-of-work format, four 5-mark criteria, line-of-inquiry framing, and seven concepts were cross-checked against the official IB subject brief and current teacher-authored guidance.'],
    ['The supplied document does not currently attribute any specific HL Essay advice to your teacher. Add school-specific guidance only after your teacher confirms it.','No school-specific HL Essay advice is included here yet. Add school-specific guidance only after your teacher confirms it.'],
    ['the pack says published figures vary and asks for teacher confirmation.','published figures can vary, so confirm the current weighting with your teacher/current guide.']
  ];
  const walker=document.createTreeWalker(page,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];
  let node=walker.nextNode();
  while(node){nodes.push(node as Text);node=walker.nextNode()}
  nodes.forEach(textNode=>{
    let text=textNode.textContent||'';
    replacements.forEach(([from,to])=>{if(text.includes(from))text=text.replace(from,to)});
    textNode.textContent=text;
  });
  page.dataset.directCopy='true';
}

function polishTutor(){
  const root=document.querySelector<HTMLElement>('.litlab-tutor');if(!root)return;
  const practice=root.querySelector<HTMLButtonElement>('[data-tutor-mode="practice"].active');
  if(practice&&!root.querySelector('.tutor-practice-options')&&root.dataset.practicePrimed!=='true'){
    root.dataset.practicePrimed='true';
    practice.click();
  }
}

function polish(){scheduled=false;polishAuthCopy();polishAccountCenter();polishAdminCopy();polishDashboard();polishBookProfile();polishPaper1Copy();polishHLEssayCopy();polishTutor()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(polish)}

const relevantSelector=['.litlab-auth-dialog','.litlab-account-menu','.litlab-account-center-card','.admin-page','.admin-gate','.my-litlab-dashboard','.books-profile-page','.paper1-guide-page','.hl-guide-page','.litlab-tutor'].join(',');
function relevantNode(node:Node){if(!(node instanceof Element))return false;return node.matches(relevantSelector)||Boolean(node.querySelector(relevantSelector))}
const observer=new MutationObserver(mutations=>{for(const mutation of mutations){for(const node of mutation.addedNodes){if(relevantNode(node)){schedule();return}}}});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>setTimeout(schedule,80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
