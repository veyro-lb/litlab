/**
 * Non-destructive BioLab teaching integrity checks.
 * These tests detect schema/rendering errors, NOT curriculum or scientific approval.
 * Teaching blocks are authoritative for the Learn screen; explanation is legacy fallback.
 */
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const tidy=s=>String(s??'').replace(/\s+/g,' ').trim();
const paragraphs=s=>String(s??'').split(/\n\s*\n/).map(tidy).filter(Boolean);
export const renderedTeaching=s=>Array.isArray(s.teachingBlocks)&&s.teachingBlocks.length
  ?s.teachingBlocks.map(b=>b.explanation??'').join('\n\n')
  :String(s.explanation??'');
export function inspectSection(section,lesson,requiredLevel){
 const errors=[],warnings=[],id=section.understandingIds?.[0]??section.id??'unknown';
 const fail=(message)=>errors.push(id+': '+message);
 const warn=(message)=>warnings.push(id+': '+message);
 const blocks=section.teachingBlocks;
 if(!Array.isArray(blocks)||blocks.length===0)fail('missing explicit teachingBlocks');
 if(!tidy(section.explanation))fail('empty explanation fallback');
 if(Array.isArray(blocks)&&blocks.some(b=>!tidy(b.title)||!tidy(b.explanation)))fail('empty block title or explanation');
 if(!tidy(renderedTeaching(section)))fail('empty student-visible teaching');
 if(requiredLevel&&section.level!==requiredLevel)fail('scope metadata mismatch');
 const p=paragraphs(renderedTeaching(section)).map(x=>x.toLowerCase());
 if(new Set(p).size!==p.length)fail('duplicate paragraphs within main teaching');
 const seen=new Set();
 for(const b of blocks??[]){const key=tidy(b.title).toLowerCase();if(key&&seen.has(key))warn('duplicate heading '+key);if(key.split(/\s+/).length>16)warn('overlong explanation-like heading; review reading hierarchy');seen.add(key)}
 if(blocks?.length&&tidy(section.explanation)!==tidy(renderedTeaching(section)))warn('legacy explanation differs from rendered blocks; ensure editorial parity');
 if(!tidy(section.revisionSummary))warn('missing revision summary');
 if(!tidy(section.workedExample))warn('missing worked example');
 const assets=new Map((lesson.assets??[]).map(a=>[a.id,a]));
 for(const idAsset of section.assets??[])if(!assets.has(idAsset))fail('unknown asset '+idAsset);
 for(const fp of section.figurePlacements??[]){
  if(!assets.has(fp.assetId)||!(section.assets??[]).includes(fp.assetId))fail('figure placement references unavailable asset');
  if(!Number.isInteger(fp.afterBlock)||fp.afterBlock<0||fp.afterBlock>=Math.max(blocks?.length??0,1))fail('figure afterBlock outside rendered passages');
 }
 for(const v of section.visuals??[]){
  if(!Number.isInteger(v.afterBlock)||v.afterBlock<0||v.afterBlock>=Math.max(blocks?.length??0,1))fail('visual afterBlock outside rendered passages');
  if(v.kind==='comparison'&&v.rows?.some(row=>row.length!==v.headers.length))fail('comparison columns mismatch');
  if(v.kind==='bars'&&v.values?.some(value=>!Number.isFinite(value.value)))fail('invalid numerical chart value');
 }
 for(const g of section.graphTables??[])if(!g.headers?.length||g.rows?.some(row=>row.length!==g.headers.length))fail('graphTable columns mismatch');
 const refs=new Set((lesson.references??[]).map(r=>r.id));
 for(const cr of section.claimReferences??[]){
  for(const r of cr.referenceIds??[])if(!refs.has(r))fail('claim references nonexistent source '+r);
  if(tidy(cr.claim)&&!tidy(section.explanation).includes(tidy(cr.claim))&&!tidy(renderedTeaching(section)).includes(tidy(cr.claim)))warn('claim text not traceable to main/legacy explanation');
 }
 for(const asset of section.assets??[]){const a=assets.get(asset);if(a&&section.level==='shared'&&a.level==='HL')fail('HL asset exposed in shared lesson')}
 return {errors,warnings};
}
export function inspectCourse(registry,catalog,lessons){
 const errors=[],warnings=[],seen=new Set();
 const topics=new Map(registry.map(t=>[t.id,t]));
 for(const [lessonId,meta] of Object.entries(catalog)){
  const lesson=lessons.get(lessonId);if(!lesson){errors.push('Missing lesson '+lessonId);continue}
  const t=topics.get(lesson.topicId);if(!t){errors.push('Unknown topic '+lesson.topicId);continue}
  const expected=new Map(t.understandings.map(x=>[x.id,x]));
  if(t.lessonId!==lessonId)errors.push(t.id+': catalog/registry lesson ID mismatch');
  const secIDs=new Set(lesson.sections.map(s=>s.id));
  for(const s of lesson.sections){
   for(const id of s.understandingIds??[]){
    if(seen.has(id))errors.push('Duplicate understanding '+id);
    seen.add(id);
    if(!expected.has(id))errors.push('Unregistered understanding '+id);
    const x=inspectSection(s,lesson,expected.get(id)?.level);
    errors.push(...x.errors);warnings.push(...x.warnings);
   }
  }
  for(const id of expected.keys())if(!lesson.sections.some(s=>s.understandingIds.includes(id)))errors.push('Missing Learn teaching for '+id);
  for(const q of lesson.questions??[]){
    if(!secIDs.has(q.sectionId))errors.push(q.id+': missing section mapping '+q.sectionId);
    for(const id of q.understandingIds??[])if(!expected.has(id))errors.push(q.id+': invalid assessment mapping '+id);
  }
 }
 for(const t of registry)for(const u of t.understandings)if(!seen.has(u.id))errors.push('Missing understanding '+u.id);
 if(seen.size!==553)errors.push('Expected 553 unique rendered understandings; found '+seen.size);
 return {errors,warnings,counts:{topics:registry.length,renderedUnderstandings:seen.size,lessons:lessons.size}};
}
export async function loadCourse(){
 const path='src/biology/learning/';
 const [registry,catalog]=await Promise.all([readFile('src/biology/curriculum/registry.json','utf8'),readFile(path+'catalog.json','utf8')]);
 const c=JSON.parse(catalog),lessons=new Map();
 await Promise.all(Object.entries(c).map(async ([id,entry])=>lessons.set(id,JSON.parse(await readFile(path+entry.path.replace(/^\.\//,''),'utf8')))));
 return {registry:JSON.parse(registry),catalog:c,lessons};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {registry,catalog,lessons}=await loadCourse();
 const result=inspectCourse(registry,catalog,lessons);
 for(const error of result.errors)console.error('ERROR',error);
 console.log(JSON.stringify({counts:result.counts,errors:result.errors.length,warnings:result.warnings.length,notes:'Warnings are editorial review items; zero errors never means scientific approval.'}));
 if(result.errors.length)process.exitCode=1;
}
