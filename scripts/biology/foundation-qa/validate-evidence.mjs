import {readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root = new URL('../../../',import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path,root),'utf8'));
const catalog=read('src/biology/learning/catalog.json');
const topicLessons=Object.values(catalog).map(entry=>read('src/biology/learning/'+entry.path.slice(2)));
const calculatedWords=value=>value.trim().split(/\s+/).filter(Boolean).length;
export function validateEvidence(evidence,lessons=topicLessons){
 const errors=[],fail=x=>errors.push(x);
 if(evidence.schemaVersion!==1||!evidence.records||!Array.isArray(evidence.records))return ['Invalid evidence contract'];
 const records=evidence.records;
 const byTopic=new Map(lessons.map(l=>[l.topicId,l]));
 const actual=lessons.flatMap(l=>l.sections.map(s=>({l,s,id:s.understandingIds[0]})));
 const byId=new Map(records.map(x=>[x.understandingId,x]));
 const ids=records.map(x=>x.understandingId);
 if(ids.length!==115||new Set(ids).size!==ids.length||actual.length!==115)fail('Evidence does not cover exactly 115 unique understandings');
 if(evidence.scope.topics!==9||evidence.scope.understandings!==115)fail('Incorrect scope counts');
 const shared=actual.filter(({s})=>s.level==='shared').length;
 const hl=actual.filter(({s})=>s.level==='HL').length;
 if(shared!==74||hl!==41||evidence.scope.shared!==shared||evidence.scope.HL!==hl)fail('Incorrect SL/HL scope');
 for(const l of lessons)if(evidence.scope.byTopic?.[l.topicId]!==l.sections.length)fail('Topic coverage drift '+l.topicId);
 for(const {l,s,id} of actual){
  const x=byId.get(id);
  if(!x){fail('Missing evidence '+id);continue}
  const mark=message=>fail(id+': '+message);
  if(x.topicId!==l.topicId||x.level!==s.level||x.lessonReviewStage!==l.review.status)mark('Review topic or level drift');
  if(x.teaching?.readingWords!==calculatedWords(s.explanation)||x.teaching?.visibleParagraphs!==s.explanation.trim().split(/\n\n+/).length)mark('Reading depth drift');
  if(JSON.stringify(x.teaching?.namedSections)!==JSON.stringify(s.teachingBlocks?.map(b=>b.title)||[]))mark('Teaching heading drift');
  if(x.teaching?.authoredSimplification!==Boolean(s.support?.simple)||!x.teaching?.workedExample||!s.workedExample)mark('Authored support or example drift');
  if(x.sources?.guidePrintedPage!==s.guidePage||JSON.stringify(x.sources?.hodderPrintedPages)!==JSON.stringify(s.textbook?.printedPages||[])||JSON.stringify(x.sources?.hodderPdfPagesPrivate)!==JSON.stringify(s.textbook?.pdfPages||[]))mark('Textbook or guide locator drift');
  const names=s.referenceIds.map(id=>l.references.find(r=>r.id===id)?.title).filter(Boolean);
  if(JSON.stringify(x.sources?.references)!==JSON.stringify(names))mark('Reference mapping drift');
  const visuals=(s.visuals||[]).map(v=>({title:v.title,kind:v.kind,afterBlock:v.afterBlock,needsScientistAndAccessibilityApproval:true}));
  if(JSON.stringify(x.figures?.learningVisuals)!==JSON.stringify(visuals))mark('Scientific visuals drift');
  const assets=s.assets.map(id=>{const a=l.assets.find(a=>a.id===id);return{id,kind:a?.kind||'unknown',license:a?.license||null,provenancePresent:Boolean(a?.permissionEvidence),withheld:Boolean(a?.withheldReason),withheldReason:a?.withheldReason??null,scientificReview:'unapproved'}});
  if(JSON.stringify(x.figures?.assets)!==JSON.stringify(assets))mark('Figure provenance or withholding drift');
  if(x.figures?.allScientificAccuracyAndLicensingApprovals!=='pending'||x.figures?.allAccessibilityApprovals!=='pending')mark('Automated evidence must not claim qualified approval');
  if(x.misconceptions?.length!==s.misconceptions.length||x.misconceptions.some((m,i)=>m.claim!==s.misconceptions[i].misconception||m.correction!==s.misconceptions[i].correction||m.expertReviewed!==false))mark('Misconception or human-review mapping drift');
  if(JSON.stringify(x.interactions?.selectionIds)!==JSON.stringify(s.interactions.map(q=>q.id))||JSON.stringify(x.interactions?.recallIds)!==JSON.stringify(s.recall.map(q=>q.id)))mark('Retrieval interaction drift');
  if(x.interactions?.hasPrediction!==Boolean(s.prediction)||x.interactions?.hasMechanismSequence!==Boolean(s.mechanismChallenge))mark('Activity mapping drift');
  const qs=l.questions.filter(q=>q.understandingIds.includes(id)).map(q=>({id:q.id,paper:q.paper,marks:q.marks,review:q.review??'pending'}));
  if(JSON.stringify(x.assessments)!==JSON.stringify(qs))mark('Original assessment coverage drift');
  if(x.remainingReview?.length<4||!x.remainingReview.every(v=>typeof v==='string'&&v.length))mark('Unresolved expert release gates absent');
 }
 for(const id of ids)if(!actual.some(x=>x.id===id))fail('Evidence of nonexistent understanding '+id);
 const short=actual.filter(x=>calculatedWords(x.s.explanation)<180).map(x=>x.id).sort();
 if(JSON.stringify([...evidence.qualitySignals.under180Words].sort())!==JSON.stringify(short))fail('Depth-review ledger drift');
 const helps=actual.filter(x=>Boolean(x.s.support?.simple)).length;
 if(evidence.qualitySignals.authoredSimplifications!==helps)fail('Authored simplification count drift');
 const withheld=[...new Set(lessons.flatMap(l=>l.assets.filter(a=>a.withheldReason).map(a=>a.id)))].sort();
 if(JSON.stringify([...evidence.qualitySignals.withheldAssets].sort())!==JSON.stringify(withheld))fail('Withheld figure ledger drift');
 if(!evidence.evidenceType?.includes('not independent expert approval'))fail('Approval boundary missing');
 return errors;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const errors=validateEvidence(read('docs/biology/foundation-qa/UNDERSTANDING_EVIDENCE.json'));
 console.log(JSON.stringify({understandings:115,topics:9,errors},null,2));
 if(errors.length)process.exitCode=1;
}
