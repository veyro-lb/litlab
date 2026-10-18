// Student-facing educational sources are whitelisted in approved-sources.json.
// Other existing lesson references are historical scientific/image provenance, NOT approved teaching endorsements.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const learning=new URL('../../src/biology/learning/',import.meta.url);
const curriculum=new URL('../../src/biology/curriculum/registry.json',import.meta.url);
const coreFile=new URL('../../src/biology/learning/approved-sources.json',import.meta.url);
const viewFile=new URL('../../src/biology/learning/LessonView.tsx',import.meta.url);
const expected=[
 ['ib-biology-guide-fa2025','official-syllabus','https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/'],
 ['hodder-biology-third-2023-9781398364240','ib-reviewed-coursebook','https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition']
];

export function referenceIdentity(reference){
 const text=(reference?.title||'').toLowerCase();
 if(/biology guide/.test(text)&&/(?:\bib\b|international baccalaureate)/.test(text))return 'ib-biology-guide-fa2025';
 if((/clegg/.test(text)&&/(?:talbot|davis)/.test(text))||(/hodder/.test(text)&&/biology/.test(text))||/9781398364240/.test(text))return 'hodder-biology-third-2023-9781398364240';
 return null;
}
export function validateStudentSourceList(sources){
 const errors=[];
 if(!Array.isArray(sources)||sources.length!==2)return ['Students must see exactly two IB-policy educational references'];
 const keys=new Set();
 sources.forEach((s,i)=>{
  const [identity,type,url]=expected[i];
  if(s.identity!==identity||s.type!==type||s.url!==url)errors.push('Unauthorized or reordered educational reference at '+i);
  if(keys.has(s.identity))errors.push('Duplicate canonical identity '+s.identity);
  keys.add(s.identity);
  if(!s.title?.trim()||!s.description?.trim()||!s.linkLabel?.trim())errors.push('Incomplete source entry '+i);
 });
 return errors;
}
export function inspectLessonSources(lesson){
 const seen=new Set(),duplicates=[],external=[];
 for(const ref of lesson.references){
  const id=referenceIdentity(ref);
  if(!id){external.push(ref);continue;}
  if(seen.has(id))duplicates.push(ref);
  seen.add(id);
 }
 const claims=lesson.sections.flatMap(s=>[...s.claimReferences||[],...s.teachingBlocks||[]]).filter(c=>(c.referenceIds||[]).some(id=>external.some(r=>r.id===id)));
 return {external,duplicates,core:[...seen],claimsUsingExternalProvenance:claims.length,missingGuide:!seen.has(expected[0][0]),missingHodder:!seen.has(expected[1][0])};
}
export function buildUnderstandingMatrix(registry,lessonMap){
 return registry.flatMap(topic=>topic.understandings.map(item=>{
  const lesson=lessonMap.get(topic.id),section=lesson?.sections.find(s=>s.understandingIds.includes(item.id));
  const sourceInfo=lesson?inspectLessonSources(lesson):null;
  const refMap=new Map((lesson?.references||[]).map(r=>[r.id,r]));
  const externalIds=section?[...new Set([...section.referenceIds,...section.claimReferences.flatMap(c=>c.referenceIds)])].filter(id=>refMap.has(id)&&!referenceIdentity(refMap.get(id))):[];
  return {
   topicId:topic.id, understandingId:item.id, level:item.level==='HL'?'HL-only':'SL-and-HL',
   // studentTitle is authored metadata, NOT verbatim text of the IB requirement.
   requirementWorkingTitle:item.studentTitle||null,
   officialGuide:{publication:'IB Biology Guide, first assessment 2025',printedPage:item.guidePage,pdfPage:item.pdfPage,officialRequirementText:null,verification:'not independently transcribed or certified'},
   hodder:{publication:'Biology for the IB Diploma Programme, third edition (2023)',chapter:topic.id,printedPages:section?.textbook?.printedPages||[],pdfPages:section?.textbook?.pdfPages||[],verification:'locator present; scientific text comparison pending'},
   lessonCoverage:section?{sectionId:section.id,explanationPresent:Boolean(section.explanation?.trim()),questions:lesson.questions.filter(q=>q.understandingIds.includes(item.id)).length,visuals:(section.assets?.length||0)+(section.visuals?.length||0)+(section.graphTables?.length||0)}:null,
   editorialReview:{status:'pending-qualified-editorial-verification',existingDraftStatus:lesson?.review.status||'missing',externalProvenanceIds:externalIds,sourceRecordMissingGuide:sourceInfo?.missingGuide??true,sourceRecordMissingHodder:sourceInfo?.missingHodder??true}
  };
 }));
}
export async function auditCourse(){
 const [sources,registry,catalog,view]=await Promise.all([
  readFile(coreFile,'utf8').then(JSON.parse),
  readFile(curriculum,'utf8').then(JSON.parse),
  readFile(new URL('catalog.json',learning),'utf8').then(JSON.parse),
  readFile(viewFile,'utf8')
 ]);
 const errors=validateStudentSourceList(sources);
 if(!view.includes("approvedSources.map(source=>")||view.includes("lesson.references.filter(r=>inScope(r,level)).map(r=>"))errors.push('Sources UI does not use the verified student-facing whitelist');
 const map=new Map();
 for(const {topicId,path} of Object.values(catalog)){
  if(!/^\.\x2f[a-z0-9-]+\/lesson\.json$/.test(path))throw Error('Unexpected catalog lesson path: '+path);
  map.set(topicId,JSON.parse(await readFile(new URL(path,learning),'utf8')));
 }
 const matrix=buildUnderstandingMatrix(registry,map);
 const records=[...map.values()].map(inspectLessonSources);
 const report={
  generatedAt:'2026-10-18', branchScope:'isolated IB source policy audit',topics:map.size,understandings:matrix.length,
  originalStudentFacingReferenceEntries:[...map.values()].reduce((n,l)=>n+l.references.length,0),
  approvedStudentFacingReferenceEntries:map.size*sources.length,
  externalTeachingReferencesRemovedFromStudents:records.reduce((n,r)=>n+r.external.length,0),
  redundantCoreReferencesRemovedFromStudents:records.reduce((n,r)=>n+r.duplicates.length,0),
  topicsWithMissingGuideProvenance:registry.filter(t=>records.length&&inspectLessonSources(map.get(t.id)).missingGuide).map(t=>t.id),
  topicsWithMissingHodderProvenance:registry.filter(t=>records.length&&inspectLessonSources(map.get(t.id)).missingHodder).map(t=>t.id),
  claimsWithLegacyExternalProvenance:records.reduce((n,r)=>n+r.claimsUsingExternalProvenance,0),
  independentlyScientificallyApprovedUnderstandingCount:0,
  imageRightsReviewedByQualifiedLegalExpert:false
 };
 if(map.size!==40||matrix.length!==553)errors.push('Unexpected course coverage count');
 return {errors,report,matrix,core:sources};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {errors,report,matrix}=await auditCourse();
 console.log(JSON.stringify(report,null,2));
 if(process.argv.includes('--matrix'))console.log(JSON.stringify(matrix,null,2));
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log('Student source whitelist, 40 lesson source inventories and 553 curriculum mappings passed structural source-policy checks. Scientific verification remains open.');
}
