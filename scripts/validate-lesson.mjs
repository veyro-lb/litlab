// Shared source-of-truth contract for every authored lesson. Scientific accuracy still needs human review.
export function validateLesson(d,topic){
 const errors=[];const fail=x=>errors.push(x);
 if(!d||!topic||d.schemaVersion!==1||d.topicId!==topic.id||d.id!==topic.lessonId||d.curriculumVersion!==topic.version){fail('Lesson identity/version differs from registry');return errors}
 if(!Array.isArray(d.sections)||!d.sections.length||!Array.isArray(d.questions)||!Array.isArray(d.references)||!Array.isArray(d.assets)){fail('Missing lesson collections');return errors}
 if(!d.title||!d.introduction||!d.summary||!d.learningPath?.length||!Array.isArray(d.prerequisites)||!Array.isArray(d.objectives))fail('Missing lesson teaching metadata');
 const u=new Map(topic.understandings.map(x=>[x.id,x]));const covered=[];const ids=new Set();
 const add=(id)=>{if(typeof id!=='string'||!id||ids.has(id))fail(`Missing or duplicate ID ${id}`);ids.add(id)};
 const refs=new Set();for(const r of d.references){add(`reference:${r.id}`);refs.add(r.id);if(!r.title||!r.locator||!/^\d{4}-\d{2}-\d{2}$/.test(r.accessedAt)||!['shared','HL'].includes(r.level)||r.url&&!/^https:\/\//.test(r.url))fail(`Invalid reference ${r.id}`)}
 const checkRefs=(rs,label)=>{if(!Array.isArray(rs)||!rs.length||rs.some(id=>!refs.has(id)))fail(`Unknown/missing references ${label}`)};
 const checkScope=(x,label)=>{if(!Array.isArray(x.understandingIds)||!x.understandingIds.length||new Set(x.understandingIds).size!==x.understandingIds.length||x.understandingIds.some(id=>!u.has(id)))fail(`Unknown/duplicate understanding ${label}`);else if(x.level!==(x.understandingIds.some(id=>u.get(id).level==='HL')?'HL':'shared'))fail(`Scope mismatch ${label}`)};
 const review=d.review;
 if(!review||!['draft','source-mapped','scientific-review','approved'].includes(review.status)||!review.sourceCheckedAt)fail('Invalid review record');
 if(review?.status==='approved'&&(!review.reviewer?.name||!review.reviewer?.qualification||!review.reviewer?.reviewedAt||!d.references.length))fail('Approval requires qualified named review and evidence');
 for(const x of topic.understandings){if(!x.studentTitle?.trim())fail(`Missing registry display title ${x.id}`)}
 const assets=new Map();for(const a of d.assets){add(`asset:${a.id}`);assets.set(a.id,a);checkRefs(a.referenceIds,a.id);if(!a.captionTitle||!a.alt||!a.src?.startsWith('/biology/')||!a.attribution||!a.license||!a.permissionEvidence||a.review==='approved'&&review?.status!=='approved')fail(`Incomplete asset ${a.id}`);if(!['shared','HL'].includes(a.level))fail(`Invalid asset scope ${a.id}`);if(a.kind==='photograph'&&[a.sourceUrl,a.originalUrl,a.termsUrl].some(x=>!x?.startsWith('https://')))fail(`Missing photo rights ${a.id}`)}
 function choice(q){if(q.kind!=='selection'||!q.prompt||!q.options?.length||q.options.filter(o=>o.correct).length!==1||new Set(q.options.map(o=>o.id)).size!==q.options.length||q.options.some(o=>!o.id||!o.text||!o.feedback))fail(`Invalid selection ${q.id}`)}
 for(const s of d.sections){
  add(s.id);checkScope(s,s.id);covered.push(...s.understandingIds||[]);
  if('title' in s)fail(`Section title must come from registry ${s.id}`);
  if(!s.guidingQuestion||!s.explanation||!s.revisionSummary||!s.terms?.length||!s.workedExample||!s.misconceptions?.length)fail(`Incomplete teaching structure ${s.id}`);
  checkRefs(s.referenceIds,s.id);
  if(s.claimReferences?.map(x=>x.claim).join('\n\n')!==s.explanation)fail(`Unmapped explanation ${s.id}`);
  for(const c of s.claimReferences||[])checkRefs(c.referenceIds,s.id);
  if(s.teachingBlocks){if(s.teachingBlocks.map(b=>b.explanation).join('\n\n')!==s.explanation)fail(`Teaching blocks drift ${s.id}`);for(const b of s.teachingBlocks){if(!b.title)fail(`Missing teaching heading ${s.id}`);checkRefs(b.referenceIds,s.id)}}
  if(s.support){const h=s.support;if(!h.simple?.trim()||!h.example?.trim()||!h.different?.trim()||!Array.isArray(h.concepts)||h.concepts.some(c=>!c.title?.trim()||!c.explanation?.trim()||!Array.isArray(c.keywords)||!c.keywords.length||c.keywords.some(k=>!k.trim())))fail('Invalid authored help '+s.id)}
  if(s.figurePlacements&&(!Array.isArray(s.figurePlacements)||s.figurePlacements.length!==s.assets.length||new Set(s.figurePlacements.map(p=>p.assetId)).size!==s.assets.length||s.figurePlacements.some(p=>!s.assets.includes(p.assetId)||!Number.isInteger(p.afterBlock)||p.afterBlock<0||p.afterBlock>=(s.teachingBlocks?.length??0))))fail('Invalid in-text figure placement '+s.id);
  if(s.prediction){choice(s.prediction.question);if(!s.prediction.context?.trim()||s.prediction.question.understandingIds?.some(id=>!s.understandingIds.includes(id)))fail('Invalid prediction mapping '+s.id)}
  if(s.graphTables&&(!Array.isArray(s.graphTables)||s.graphTables.some(g=>!g.caption||!g.headers?.length||!g.rows?.length||g.rows.some(row=>row.length!==g.headers.length))))fail('Invalid graph table '+s.id);
  if(s.authenticMicrographs){
   if(!Array.isArray(s.authenticMicrographs)||new Set(s.authenticMicrographs.map(c=>c.id)).size!==s.authenticMicrographs.length)fail('Duplicate/invalid authentic microscopy '+s.id);
   for(const c of s.authenticMicrographs){
    if(!c.id||!c.title||!c.specimen||!['light','TEM'].includes(c.modality)||!c.observationPrompt||!c.expectedEvidence||!c.scaleNote||!c.limitation||!c.author||!c.license||!c.licenseUrl||!refs.has(c.referenceId)||!s.referenceIds.includes(c.referenceId))fail('Unmapped authentic microscopy '+s.id);
    if(!c.imageUrl?.startsWith('https://upload.wikimedia.org/wikipedia/commons/')||!c.sourceUrl?.startsWith('https://commons.wikimedia.org/wiki/File:')||!c.licenseUrl?.startsWith('https://'))fail('Unverified external microscopy domain '+s.id);
    if(c.scaleNote?.toLowerCase().includes('invented')&&c.scaleNote?.toLowerCase().includes('bar')){/* A cautionary note is valid, not fabricated scale evidence. */}
   }
  }

  if(s.molecularViewer&&(!s.molecularViewer.title||!s.molecularViewer.prompt||!s.molecularViewer.fallback||!s.molecularViewer.structureId||!s.molecularViewer.url.startsWith('https://www.rcsb.org/3d-view/')||!refs.has(s.molecularViewer.referenceId)))fail('Invalid molecular viewing '+s.id);
  if(s.enrichment){if(!s.enrichment.title||!s.enrichment.text)fail(`Missing enrichment ${s.id}`);checkRefs(s.enrichment.referenceIds,s.id)}
  if(s.textbook){checkRefs([s.textbook.referenceId],s.id);if(!s.textbook.printedPages?.length||s.textbook.printedPages.length!==s.textbook.pdfPages?.length)fail(`Incomplete textbook locator ${s.id}`)}
  if(!s.interactions?.length||!s.recall?.length)fail(`Missing retrieval ${s.id}`);
  for(const q of [...s.interactions||[],...s.recall||[]]){add(q.id);if(!q.understandingIds?.length||q.understandingIds.some(id=>!s.understandingIds.includes(id)))fail(`Activity mapping drift ${q.id}`);if(q.kind==='selection')choice(q);else if(q.kind!=='recall'||!q.prompt||!q.answer)fail(`Invalid recall ${q.id}`)}
  for(const id of s.assets||[]){const a=assets.get(id);if(!a||s.level==='shared'&&a.level==='HL')fail(`Missing/leaking asset ${id}`)}
  if(s.mechanismChallenge){
   const c=s.mechanismChallenge;
   if(!c.title?.trim()||!c.instructions?.trim()||!Array.isArray(c.stages)||c.stages.length<2||new Set(c.stages.map(x=>x?.id)).size!==c.stages.length)fail('Invalid mechanism challenge '+s.id);
   for(const stage of Array.isArray(c.stages)?c.stages:[]){
    if(!stage?.id||!stage.prompt?.trim()||!stage.explanation?.trim()||!Array.isArray(stage.options)||stage.options.length<3||stage.options.filter(x=>x.correct).length!==1||new Set(stage.options.map(x=>x.id)).size!==stage.options.length||stage.options.some(x=>!x.id||!x.text?.trim()||!x.feedback?.trim()))fail('Invalid mechanism stage '+s.id);
   }
  }
  if(s.explorer&&(!s.explorer.title||(s.explorer.prompt!==undefined&&(typeof s.explorer.prompt!=='string'||!s.explorer.prompt.trim()))||!s.explorer.features?.length||new Set(s.explorer.features.map(f=>f.id)).size!==s.explorer.features.length||s.explorer.features.some(f=>!f.id||!f.label||!f.explanation)))fail(`Invalid explorer ${s.id}`);
 }
 if(covered.length!==u.size||new Set(covered).size!==covered.length||[...u.keys()].some(id=>!covered.includes(id)))fail('Missing or duplicate curriculum coverage');
 for(const q of d.questions){add(q.id);checkScope(q,q.id);checkRefs(q.referenceIds,q.id);const section=d.sections.find(s=>s.id===q.sectionId);if(!q.original||!section||!section.understandingIds.some(id=>q.understandingIds?.includes(id)))fail(`Question/explanation mismatch ${q.id}`);if(q.paper==='1A'){choice(q);if(q.marks!==1||q.options?.length!==4)fail(`Invalid MCQ ${q.id}`)}else if(!['1B','2'].includes(q.paper)||!q.prompt||!q.answer||!q.markingPoints?.length||q.marks!==q.markingPoints.length)fail(`Invalid written question ${q.id}`);if(q.paper==='1B'&&(!q.data?.caption||!q.data.headers?.length||!q.data.rows?.length||q.data.rows.some(row=>row.length!==q.data.headers.length)))fail(`Invalid data table ${q.id}`)}
 for(const id of u.keys())if(!d.questions.some(q=>q.understandingIds?.includes(id)))fail(`Unassessed understanding ${id}`);
 return errors;
}
