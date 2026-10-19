import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateLesson} from './validate-lesson.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function validatePhase7(d,topic){
 const errors=[...validateLesson(d,topic)],fail=x=>errors.push(x);
 const expected=d.topicId==='B2.1'?17:d.topicId==='B2.2'?9:0;
 if(!expected)return ['Unexpected batch topic'];
 if(d.sections.length!==expected)fail('Section count');
 if(d.questions.filter(q=>q.paper==='1A').length<expected)fail('MCQ count');
 if(d.review?.status==='approved'||d.review?.reviewer)fail('Unqualified review status');
 for(let i=0;i<expected;i++){
  const id=d.topicId+'.'+(i+1),s=d.sections[i],level=d.topicId==='B2.1'?(i<10?'shared':'HL'):(i<3?'shared':'HL');
  const gp=d.topicId==='B2.1'?(i<5?52:i<15?53:54):(i<4?54:55);
  if(!s||s.understandingIds.join(',')!==id||s.level!==level)fail('Understanding order/level '+id);
  if(!topic.understandings[i]||topic.understandings[i].id!==id||topic.understandings[i].level!==level)fail('Registry order/level '+id);
  if(!s)continue;
  if(s.guidePage!==gp||s.pdfPage!==gp+6)fail('Guide page '+id);
  if(s.textbook.printedPages.some((v,j)=>s.textbook.pdfPages[j]!==v+12))fail('Textbook page '+id);
  if((s.explanation.match(/\S+/g)||[]).length<100||s.teachingBlocks?.length<3)fail('Thin explanation '+id);
  if(!s.assets?.length||!s.recall?.length||!s.interactions?.length||!s.misconceptions?.length)fail('Incomplete learning '+id);
  if(!d.questions.some(q=>q.paper==='1A'&&q.understandingIds.includes(id)))fail('Missing original MCQ '+id);
 }
 for(const q of d.questions)if(q.paper==='1A'&&(q.options?.length!==4||q.options.filter(o=>o.correct).length!==1||q.options.some(o=>!o.feedback?.trim())))fail('Incorrect options '+q.id);
 for(const q of d.questions)if(q.paper!=='1A'&&(!q.answer||!q.markingPoints?.length))fail('Written marking '+q.id);
 const authoredSingleFigures = {
  'b21-figure-7':'/biology/membranes-transport/pump-alternating-access-20261017.svg',
  'b21-figure-15':'/biology/membranes-transport/sodium-potassium-pump-20261017.svg',
  'b21-figure-16':'/biology/membranes-transport/intestinal-glucose-topology-20261017.svg',
  'b21-transport-table':'/biology/membranes-transport/transport-pathways-20261017.svg'
 };
 for(const a of d.assets){
  const intentionallySingle=d.topicId==='B2.1'&&authoredSingleFigures[a.id]===a.src;
  const originalScreenshot=/^\/biology\/source-pdf-figures\/[a-z0-9-]+\.png$/.test(a.src);
  if(!a.src||!a.permissionEvidence||a.review==='approved'||(!a.recallSrc&&!intentionallySingle&&!originalScreenshot))
   fail('Asset review '+a.id);
  // Exact publisher/handout screenshots must not reveal a redrawn recall image.
  if(a.recallSrc===a.src&&!originalScreenshot)fail('Distinct recall asset required '+a.id);
  if(originalScreenshot){
   if(a.recallSrc!==a.src||a.mobileSrc!==a.src||a.recallMobileSrc!==a.src)
    fail('Original screenshot variants must use the exact same source '+a.id);
   if(!/IB Biology Drawings|Hodder Education/.test(a.attribution)||!/third-party licen[cs]/i.test(a.license))
    fail('Original screenshot source credit '+a.id);
  }
 }
 // Keep the three-out / two-in ATPase stoichiometry invariant with real superscript ion charges.
 if(d.topicId==='B2.1'&&!/exports\s+(?:three|3)\s+Na[+⁺]\s+ions?\s+from\s+the\s+cytosol\s+and\s+imports\s+(?:two|2)\s+K[+⁺]\s+ions?\s+for\s+each\s+ATP\s+hydrolysed/i.test(d.sections[14].explanation))fail('Pump stoichiometry');
 if(d.topicId==='B2.2'&&!['cell wall','cytoskeleton','cytoplasm','ribosomes'].every(v=>d.sections[0].explanation.includes(v)))fail('IB organelle definition');
 return errors;
}
export async function checkFiles(){
 const topics=JSON.parse(await readFile(path.join(root,'docs/biology/phase7/registry-proposal.json'),'utf8'));
 const catalog=JSON.parse(await readFile(path.join(root,'docs/biology/phase7/catalog-proposal.json'),'utf8'));
 const errors=[],summary=[];
 for(const [key,e] of Object.entries(catalog)){
  if(!/^\.[/][a-z0-9-]+[/]lesson\.json$/.test(e.path)){errors.push('Unsafe lesson path '+key);continue}
  const d=JSON.parse(await readFile(path.join(root,'src/biology/learning',e.path.slice(2)),'utf8'));
  const t=topics.find(x=>x.id===d.topicId);
  errors.push(...validatePhase7(d,t).map(x=>d.topicId+': '+x));
  for(const a of d.assets)for(const src of [a.src,...(a.recallSrc?[a.recallSrc]:[])]){
   const originalScreenshot=/^[/]biology[/]source-pdf-figures[/][a-z0-9-]+[.]png$/.test(src);
   if(!originalScreenshot&&!/^[/]biology[/][a-z0-9-]+[/][a-z0-9-]+[.]svg$/.test(src)){errors.push('Unsafe artwork '+src);continue}
   try{
    const f=path.join(root,'public',src.slice(1));await access(f);
    if(originalScreenshot){
     const png=await readFile(f);
     if(!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))errors.push('Invalid original PNG '+src);
    }else{
     const svg=await readFile(f,'utf8');
     if(!svg.includes('<svg')||!svg.includes('viewBox=')||!svg.includes('<title')||svg.includes('<image '))errors.push('Bad SVG '+src);
    }
   }catch{errors.push('Missing image '+src)}
  }
  summary.push({topic:d.topicId,sections:d.sections.length,mcqs:d.questions.filter(q=>q.paper==='1A').length,structured:d.questions.filter(q=>q.paper!=='1A').length,figures:d.assets.length});
 }
 if(summary.length!==2)errors.push('Need two lesson packages');
 return {errors,summary};
}
if(process.argv[1]?.endsWith('validate-phase7-batch3.mjs')){
 const results=await checkFiles();
 if(results.errors.length){console.error(results.errors.join('\n'));process.exitCode=1}
 else console.log('PASS '+JSON.stringify(results.summary));
}
