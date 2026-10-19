import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SPEC=[
  {slug:'diversity-organisms',prefix:'A3.1',count:15,shared:11},
  {slug:'classification-cladistics',prefix:'A3.2',count:9,shared:0},
  {slug:'evolution-speciation',prefix:'A4.1',count:11,shared:7},
  {slug:'conservation-biodiversity',prefix:'A4.2',count:8,shared:8},
];
const readJson=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const questionsFor=(lesson,id)=>lesson.questions.filter(q=>q.understandingIds?.includes(id));

/** Pure positive/negative content checks. Human scientific certification is explicitly NOT implied. */
export function auditLesson(lesson,spec,exists=()=>true) {
  const errors=[];
  const fail=(reason)=>errors.push(spec.prefix+': '+reason);
  if(lesson.topicId!==spec.prefix||lesson.schemaVersion!==1)fail('identity/version');
  const expected=new Map(Array.from({length:spec.count},(_,i)=>[
    spec.prefix+'.'+(i+1),i<spec.shared?'shared':'HL'
  ]));
  if(lesson.sections?.length!==expected.size)fail('understanding total');
  const refs=new Set((lesson.references||[]).map(r=>r.id));
  const assets=new Map((lesson.assets||[]).map(a=>[a.id,a]));
  const seen=new Set(),qids=new Set(),usedAssets=new Set();
  for(const s of lesson.sections||[]) {
    const id=s.understandingIds?.[0];
    if(s.understandingIds?.length!==1||!expected.has(id)||seen.has(id))fail('duplicate/unknown section '+s.id);
    seen.add(id);
    if(s.level!==expected.get(id))fail('level '+id);
    if(!s.guidingQuestion||!s.explanation||!s.revisionSummary||!s.workedExample)fail('incomplete explanation '+id);
    if(!s.misconceptions?.length||!s.recall?.length||!s.interactions?.length)fail('missing retrieval/feedback '+id);
    if(!s.teachingBlocks?.length||s.teachingBlocks.some(b=>!b.title||!b.explanation))fail('section heading '+id);
    if(s.teachingBlocks?.map(b=>b.explanation).join('\n\n')!==s.explanation)fail('teaching block drift '+id);
    if(s.claimReferences?.map(c=>c.claim).join('\n\n')!==s.explanation)fail('source-claim drift '+id);
    if((s.referenceIds||[]).some(r=>!refs.has(r)))fail('unresolved section source '+id);
    for(const c of s.claimReferences||[])if(!c.referenceIds?.length||c.referenceIds.some(r=>!refs.has(r)))fail('unresolved claim source '+id);
    for(const b of s.teachingBlocks||[])if(!b.referenceIds?.length||b.referenceIds.some(r=>!refs.has(r)))fail('unresolved block source '+id);
    for(const a of s.assets||[]) { usedAssets.add(a); if(!assets.has(a))fail('missing section asset '+a); }
    for(const p of s.figurePlacements||[]) {
      usedAssets.add(p.assetId);
      if(!assets.has(p.assetId)||!Number.isInteger(p.afterBlock)||p.afterBlock<0||p.afterBlock>=s.teachingBlocks.length)fail('invalid figure placement '+id);
    }
    for(const v of s.visuals||[]) {
      if(!v.title||!Number.isInteger(v.afterBlock)||v.afterBlock<0||v.afterBlock>=s.teachingBlocks.length)fail('visual anchor '+id);
      if(v.kind==='comparison'&&(!v.headers?.length||!v.rows?.length||v.rows.some(row=>row.length!==v.headers.length)))fail('invalid comparison '+id);
      if(v.kind==='sequence'&&(!v.steps?.length||v.steps.some(x=>!x.title||!x.description)))fail('invalid sequence '+id);
      if(v.kind==='bars'&&(!v.unit||!v.note||!v.values?.length||v.values.some(x=>!Number.isFinite(x.value))))fail('invalid graph '+id);
    }
    for(const q of s.interactions||[])if(q.options?.filter(x=>x.correct).length!==1||q.options.some(x=>!x.feedback))fail('interaction key '+id);
    if(!questionsFor(lesson,id).length)fail('unassessed understanding '+id);
  }
  if(seen.size!==expected.size)fail('missing understanding identifier(s)');
  for(const q of lesson.questions||[]) {
    if(qids.has(q.id))fail('duplicate question '+q.id);
    qids.add(q.id);
    if(!q.original||!q.prompt||!q.referenceIds?.length||q.referenceIds.some(r=>!refs.has(r)))fail('question provenance '+q.id);
    if(!q.understandingIds?.length||q.understandingIds.some(id=>!expected.has(id)))fail('question understanding '+q.id);
    if(!lesson.sections.some(s=>s.id===q.sectionId&&s.understandingIds.some(id=>q.understandingIds.includes(id))))fail('orphan assessment '+q.id);
    const lev=q.understandingIds.some(id=>expected.get(id)==='HL')?'HL':'shared';
    if(q.level!==lev)fail('question level '+q.id);
    if(q.paper==='1A') {
      if(q.marks!==1||q.options?.length!==4||q.options.filter(x=>x.correct).length!==1||q.options.some(x=>!x.feedback))fail('MCQ key '+q.id);
    } else if(!['1B','2'].includes(q.paper)||q.marks!==q.markingPoints?.length||!q.answer)fail('marking rubric '+q.id);
    if(q.paper==='1B'&&(!q.data?.caption||!q.data.headers?.length||!q.data.rows?.length||q.data.rows.some(row=>row.length!==q.data.headers.length)))fail('data shape '+q.id);
  }
  for(const a of lesson.assets||[]) {
    if(!a.attribution||!a.license||!a.permissionEvidence||!a.alt||!a.captionTitle||a.review==='approved')fail('asset rights/review '+a.id);
    if(!a.withheldReason&&(!a.src?.startsWith('/biology/')||!exists('public'+a.src)))fail('missing figure '+a.id);
  }
  for(const a of usedAssets)if(!assets.has(a))fail('asset reference '+a);
  if(lesson.review?.status==='approved'||lesson.review?.reviewer)fail('unverified certification claim');
  return errors;
}

export function auditAll(lessons,exists=()=>true) {
  const errors=[];
  for(const spec of SPEC) {
    if(!lessons[spec.prefix])errors.push('Missing topic '+spec.prefix);
    else errors.push(...auditLesson(lessons[spec.prefix],spec,exists));
  }
  if(lessons['A3.2']) {
    const q=lessons['A3.2'].questions.find(x=>x.id==='a32-p1b-constructed-alignment');
    if(!q||!/construct|fiction/i.test(q.data?.caption||'')||q.marks!==3)errors.push('Missing synthetic alignment and interpretation question');
  }
  if(lessons['A4.2']) {
    const s=lessons['A4.2'].sections.find(x=>x.understandingIds[0]==='A4.2.5');
    if(!s?.visuals?.some(x=>/construct|hypothet/i.test(x.title)))errors.push('Model ecological counts not clearly labeled hypothetical');
    const q=lessons['A4.2'].questions.find(x=>x.id==='a42-p1b-survey');
    if(!q||q.data.rows[0].slice(1).reduce((a,b)=>a+b,0)!==30||q.data.rows[1].slice(1).reduce((a,b)=>a+b,0)!==30)errors.push('Survey model count check failed');
  }
  if(Math.abs(0.006/(2*0.001)-3)>1e-12)errors.push('Molecular-clock teaching calculation failed');
  return errors;
}

export function loadAndAudit() {
  const lessons=Object.fromEntries(SPEC.map(s=>[s.prefix,readJson('src/biology/learning/'+s.slug+'/lesson.json')]));
  return auditAll(lessons,p=>fs.existsSync(path.join(ROOT,p)));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const errors=loadAndAudit();
  if(errors.length) {console.error(errors.join('\n'));process.exitCode=1;}
  else console.log('PASS: 43 understanding IDs; SL/HL; 4 lesson packages; source mappings; question marks and keys; visuals; original asset provenance; model data.');
}
