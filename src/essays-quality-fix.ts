export {};

let scheduled=false;

function setText(element:HTMLElement|null,text:string){
  if(element&&element.textContent!==text)element.textContent=text;
}

function polishHub(){
  const card=document.querySelector<HTMLElement>('.essays-choice-hl');
  if(!card)return;
  const status=card.querySelector<HTMLElement>('.essays-status');
  if(status){
    setText(status,'Guide available');
    status.classList.remove('preparing');
    status.classList.add('ready','hl-guide-ready');
  }
  setText(card.querySelector<HTMLElement>('.essays-choice-copy p'),'Open the full LitLab HL Essay guide for choosing a work, developing a line of inquiry, analysis, structure, criteria, common mistakes and a final checklist.');
}

const replacements:[string,string][]=[
  ['The supplied pack asks students to confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with their teacher/current official course guide.','Confirm the exact current criteria wording, grade weighting, assessment-reuse rules, and any school-specific process with your teacher or current official course guide.'],
  ['word range in the supplied pack','word range'],
  ['but the pack frames it as narrower than the EE and grounded mainly in close reading rather than wider research.','It is narrower than the EE and grounded mainly in close reading rather than wider research.'],
  ['The pack says the HL Essay must be based on one work or body of work already studied in class.','The HL Essay must be based on one work or body of work already studied in class.'],
  ['For Language and Literature, the pack notes that the choice can be literary or non-literary if it was genuinely studied in class.','For Language and Literature, the choice can be literary or non-literary if it was genuinely studied in class.'],
  ['The supplied pack flags reuse of a work already used for the Individual Oral as a restriction; confirm the current rule with your teacher/course guide before finalizing your choice.','A work already used for the Individual Oral should not be reused for the HL Essay; confirm the current assessment-reuse rule with your teacher or current course guide before finalizing your choice.'],
  ['The pack suggests the course’s seven key concepts as useful starting points when you are not sure where to begin:','The course’s seven key concepts are useful starting points when you are not sure where to begin:'],
  ['The pack says limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.','Limited, well-chosen critical material can strengthen the essay, but outside research should not crowd out your own close analysis.'],
  ['The pack says to cite the primary work and any secondary sources consistently using the citation style required by your school. It notes that the IB does not mandate one universal style for this purpose.','Cite the primary work and any secondary sources consistently using the citation style required by your school. The IB does not mandate one universal citation style for this purpose.'],
  ['The pack describes the teacher as an adviser who can guide the line of inquiry and general direction.','The teacher acts as an adviser who can guide the line of inquiry and general direction.'],
  ['The pack distinguishes this from the Extended Essay: it says there is no equivalent formal multi-session reflection process or reflection form.','Unlike the Extended Essay, there is no equivalent formal multi-session reflection process or reflection form.'],
  ['The supplied pack summarizes four criteria worth 5 marks each, for 20 marks total.','The HL Essay is assessed through four criteria worth 5 marks each, for 20 marks total.'],
  ['The content pack specifically says the exact current descriptor wording should be confirmed against your school’s copy of the official subject guide.','Confirm the exact current descriptor wording against your school’s copy of the official subject guide.'],
  ['Use the pack’s practice bank to see how a focused inquiry connects a work, an authorial choice, and a course concept.','Use these examples to see how a focused inquiry connects a work, an authorial choice, and a course concept.'],
  ['The source pack suggests turning the narrowing examples and practice bank into a future Line of Inquiry Lab, plus a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.','The narrowing examples and practice bank can also support a future Line of Inquiry Lab and a “spot the weak inquiry” activity built from the common mistakes. The checklist is already interactive here.'],
  ['Know which details are firm in the pack and which ones still need school-level confirmation.','Know which details are established and which ones still need school-level confirmation.'],
  ['The pack says the 1,200–1,500 word range, one-work/body-of-work format, four 5-mark criteria, line-of-inquiry framing, and seven concepts were cross-checked against the official IB subject brief and several current teacher/tutoring guides.','Core format: 1,200–1,500 words, one work or body of work, four 5-mark criteria, a student-developed line of inquiry, and the seven course concepts as useful starting points.'],
  ['The supplied document does not currently attribute any specific HL Essay advice to your teacher. Add school-specific guidance only after your teacher confirms it.','No school-specific HL Essay advice is included yet. Add school-specific guidance only after your teacher confirms it.'],
  ['Exact current weighting of the HL Essay in the final HL grade; the pack says published figures vary and asks for teacher confirmation.','Exact current weighting of the HL Essay in the final HL grade; confirm the current figure with your teacher or official course guide.']
];

function polishHLCopy(){
  const root=document.querySelector<HTMLElement>('.hl-guide-page');
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node=walker.nextNode();
  while(node){
    let next=node.nodeValue||'';
    for(const [from,to] of replacements){if(next.includes(from))next=next.replace(from,to)}
    if(next!==node.nodeValue)node.nodeValue=next;
    node=walker.nextNode();
  }
}

function run(){scheduled=false;polishHub();polishHLCopy()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}

window.addEventListener('hashchange',schedule);
window.addEventListener('pageshow',schedule);
new MutationObserver(mutations=>{
  for(const mutation of mutations){
    if(mutation.addedNodes.length){schedule();return}
  }
}).observe(document.body,{childList:true,subtree:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
