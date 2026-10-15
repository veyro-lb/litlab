import {readFile,access} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function validateWater(d) {
  const errors=[];const fail=x=>errors.push(x);
  if(d.id!=='a1-1-water-v1'||d.topicId!=='A1.1'||d.curriculumVersion!=='ib-biology-fa2025-v1')fail('Invalid lesson identity');
  if(d.review?.status!=='scientific-review'||d.review?.reviewer!==null)fail('Unapproved draft must retain qualified-review gate');
  if(d.sections?.length!==8)fail('All eight Water understandings required');
  const refs=new Set((d.references||[]).map(r=>r.id));const assets=new Map((d.assets||[]).map(a=>[a.id,a]));const ids=new Set();
  const add=id=>{if(!id||ids.has(id))fail(`Missing or duplicated item ID ${id}`);ids.add(id)};
  const references=(rs,label)=>{if(!rs?.length||rs.some(r=>!refs.has(r)))fail(`Unknown or missing reference ${label}`)};
  const expected=Array.from({length:8},(_,i)=>`A1.1.${i+1}`);
  for(const [i,s] of (d.sections||[]).entries()){
    add(s.id);if(s.understandingIds?.length!==1||s.understandingIds[0]!==expected[i])fail(`Invalid coverage ${s.id}`);
    if(s.level!==(i<6?'shared':'HL'))fail(`Incorrect level ${s.id}`);
    if(s.guidePage!==(i<5?34:35)||s.pdfPage!==s.guidePage+6)fail(`Bad page ${s.id}`);
    if(!s.explanation||s.explanation.length<500||!s.revisionSummary||!s.workedExample||!s.terms?.length||!s.misconceptions?.length)fail(`Incomplete explanation ${s.id}`);
    references(s.referenceIds,s.id);
    if(!s.claimReferences?.length||s.claimReferences.map(c=>c.claim).join('\n\n')!==s.explanation)fail(`Unmapped claim ${s.id}`);
    for(const c of s.claimReferences||[])references(c.referenceIds,s.id);
    for(const id of s.assets||[])if(!assets.has(id)||s.level==='shared'&&assets.get(id)?.level==='HL')fail(`Invalid scoped asset ${id}`);
    if(!s.interactions?.length||s.recall?.length!==2)fail(`Missing activity/recall ${s.id}`);
    for(const q of [...s.interactions||[],...s.recall||[]]){add(q.id);if(!q.prompt)fail('Missing prompt');if(q.kind==='selection'&&q.options?.filter(o=>o.correct).length!==1)fail(`Invalid answer ${q.id}`);}
    if(!(d.questions||[]).some(q=>q.understandingIds.includes(expected[i])))fail(`No assessment for ${expected[i]}`);
  }
  const sectionIds=new Set(d.sections.map(s=>s.id));
  for(const q of d.questions||[]){
    add(q.id);if(!q.original||!sectionIds.has(q.sectionId)||!q.understandingIds?.length||q.understandingIds.some(id=>!expected.includes(id)))fail(`Invalid original question mapping ${q.id}`);
    if(q.level!==(q.understandingIds.some(id=>Number(id.split('.').at(-1))>6)?'HL':'shared'))fail(`Question scope error ${q.id}`);
    references(q.referenceIds,q.id);
    if(q.paper==='1A') {if(q.marks!==1||q.options?.length!==4||q.options.filter(o=>o.correct).length!==1||q.options.some(o=>!o.feedback||!o.text))fail(`Invalid choice bank ${q.id}`)}
    else if(!q.answer||q.marks!==q.markingPoints?.length||q.review!=='scientific-review')fail(`Invalid written marking guidance ${q.id}`);
    if(q.paper==='1B'&&(!q.data?.caption.includes('Illustrative')||!q.data?.rows?.length||!q.data?.headers?.length))fail(`Unlabelled data ${q.id}`);
  }
  if(d.questions.filter(q=>q.paper==='1A').length!==10||d.questions.filter(q=>q.paper==='1B').length!==2||d.questions.filter(q=>q.paper==='2').length!==3)fail('Incomplete practice bank');
  for(const a of d.assets||[]){if(!a.alt||!a.attribution||!a.license||!a.permissionEvidence||a.review!=='scientific-review'||!a.src?.startsWith('/biology/water/'))fail(`Missing asset provenance ${a.id}`);references(a.referenceIds,a.id);if(a.kind==='photograph'&&(!a.sourceUrl||!a.originalUrl||!a.termsUrl))fail(`Missing photo permission evidence ${a.id}`);}
  return errors;
}
export const water=JSON.parse(await readFile(new URL('../src/biology/learning/water/lesson.json',import.meta.url),'utf8'));
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const errors=validateWater(water);
 for(const a of water.assets){for(const src of [a.src,a.recallSrc].filter(Boolean)){try{await access(new URL('../public'+src,import.meta.url))}catch{errors.push('Missing asset '+src)}}}
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log('Water passed: 8 mapped sections, 16 recall prompts, 10 MCQs, 2 data tasks, 3 structured tasks; source and asset records present. Scientific approval remains pending.');
}
