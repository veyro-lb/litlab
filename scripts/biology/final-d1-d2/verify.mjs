/**
 * Final Sprint D: isolated six-package data, scientific-invariant and rights preflight.
 * No shared registry, catalog, global UI or deployment files are altered.
 * Run: node scripts/biology/final-d1-d2/verify.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const spec=[
  {slug:'dna-replication',topic:'D1.1',total:9,shared:5},
  {slug:'protein-synthesis',topic:'D1.2',total:19,shared:11},
  {slug:'mutation-gene-editing',topic:'D1.3',total:10,shared:7},
  {slug:'cell-nuclear-division',topic:'D2.1',total:17,shared:11},
  {slug:'gene-expression',topic:'D2.2',total:11,shared:0},
  {slug:'water-potential',topic:'D2.3',total:11,shared:7}
];
const get=(path)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
export function validate(data, assetAvailable=(path)=>existsSync(resolve(root,'public',(path.startsWith('/')?path.slice(1):path)))) {
  let sectionCount=0,questionCount=0,visualCount=0;
  const details=[];
  for(const s of spec){
    const lesson=data[s.topic];
    assert.equal(lesson.topicId,s.topic,'Unexpected topic identity');
    assert.equal(lesson.review?.reviewer,null,'Do not claim qualified independent approval');
    assert.notEqual(lesson.review?.status,'approved','Unreviewed content cannot be published as approved');
    assert.equal(lesson.sections?.length,s.total,s.topic+' section total');
    const ids=Array.from({length:s.total},(_,i)=>s.topic+'.'+(i+1));
    assert.deepEqual(lesson.sections.map(x=>x.understandingIds[0]),ids,s.topic+' understanding IDs');
    const assetIds=new Set(lesson.assets.map(a=>a.id));
    assert.equal(assetIds.size,lesson.assets.length,s.topic+' asset IDs');
    const references=new Set(lesson.references.map(r=>r.id));
    const questionIds=new Set();
    for(let i=0;i<s.total;i++){
      const section=lesson.sections[i],id=ids[i],level=i<s.shared?'shared':'HL';
      assert.deepEqual(section.understandingIds,[id],id+' one-to-one mapping');
      assert.equal(section.level,level,id+' level');
      assert.ok(section.guidePage>0 && section.pdfPage>0,id+' source locator');
      assert.ok(section.explanation?.length>400,id+' insufficient explanation');
      assert.ok(section.teachingBlocks?.length>=2,id+' requires explanatory passages');
      assert.equal(section.explanation,section.teachingBlocks.map(b=>b.explanation).join('\n\n'),id+' section/block coherence');
      assert.ok(section.teachingBlocks.every(b=>b.title && b.explanation?.length>=70),id+' heading/explanation');
      assert.ok(section.workedExample?.length>45,id+' living-system application');
      assert.ok(section.misconceptions?.length>0 && section.misconceptions.every(m=>m.misconception&&m.correction),id+' misconception correction');
      assert.ok(section.referenceIds?.length>0&&section.referenceIds.every(r=>references.has(r)),id+' source mapping');
      assert.ok(section.claimReferences?.length>0&&section.claimReferences.every(c=>c.claim&&c.referenceIds.every(r=>references.has(r))),id+' claim mapping');
      assert.ok(section.interactions?.some(q=>q.options?.filter(o=>o.correct===true).length===1),id+' choice practice');
      assert.ok(section.recall?.some(q=>q.answer),id+' recall practice');
      for(const aid of section.assets){assert.ok(assetIds.has(aid),id+' unknown asset '+aid)}
      for(const placement of section.figurePlacements||[]){assert.ok(section.assets.includes(placement.assetId),id+' orphan placement');assert.ok(Number.isInteger(placement.afterBlock)&&placement.afterBlock<section.teachingBlocks.length,id+' misplaced figure')}
      for(const visual of section.visuals||[]){
        assert.ok(visual.title?.length>8,id+' untitled visual');
        assert.ok(Number.isInteger(visual.afterBlock)&&visual.afterBlock>=0&&visual.afterBlock<section.teachingBlocks.length,id+' visual position');
        if(visual.kind==='comparison'){assert.ok(visual.headers.length>=2&&visual.rows.length>=2,id+' insufficient comparison');assert.ok(visual.rows.every(r=>r.length===visual.headers.length),id+' column mismatch')}
        else if(visual.kind==='sequence'){assert.ok(visual.steps?.length>=2&&visual.steps.every(st=>st.title&&st.description),id+' malformed process')}
        else if(visual.kind==='bars'){assert.ok(visual.values.every(v=>v.value>=0)&&visual.note,id+' ungrounded bar')}
        else throw Error(id+' unknown visual kind '+visual.kind);
        visualCount++;
      }
    }
    for(const a of lesson.assets){
      assert.ok(a.alt?.length>60&&a.captionTitle&&a.interpretation,s.topic+' unlabeled figure '+a.id);
      assert.ok(a.permissionEvidence&&a.license&&a.attribution,s.topic+' rights metadata');
      assert.ok(a.referenceIds?.every(r=>references.has(r)),s.topic+' asset references');
      if(!a.withheldReason)assert.ok(assetAvailable(a.src),s.topic+' missing file '+a.src);
    }
    for(const q of lesson.questions||[]){
      assert.ok(!questionIds.has(q.id),s.topic+' duplicate question '+q.id);questionIds.add(q.id);
      assert.ok(q.understandingIds?.length&&q.understandingIds.every(id=>ids.includes(id)),s.topic+' out-of-scope question '+q.id);
      assert.ok(q.understandingIds.every(id=>q.level===lesson.sections[ids.indexOf(id)].level),q.id+' question level');
      assert.ok(q.prompt?.length>15&&q.marks>0&&Number.isInteger(q.marks),q.id+' prompt/marks');
      assert.ok(q.referenceIds?.length>0&&q.referenceIds.every(id=>references.has(id)),q.id+' sources');
      if(q.kind==='selection'){
        assert.equal(q.options?.length,4,q.id+' option count');
        assert.equal(q.options.filter(o=>o.correct===true).length,1,q.id+' answer key');
        assert.ok(q.options.every(o=>o.text&&o.feedback),q.id+' distractor feedback');
      }else{
        assert.ok(q.answer?.length>35,q.id+' answer');
        assert.ok(q.markingPoints?.length>=2,q.id+' marking points');
      }
    }
    for(const id of ids)assert.ok(lesson.questions.some(q=>q.understandingIds.includes(id)),id+' assessment coverage');
    sectionCount+=lesson.sections.length;questionCount+=lesson.questions.length;
    details.push({topic:s.topic,shared:s.shared,HL:s.total-s.shared,sections:s.total,questions:lesson.questions.length,visuals:lesson.sections.reduce((n,x)=>n+(x.visuals||[]).length,0)});
  }
  assert.equal(sectionCount,77,'77 understandings required');
  const dna=data['D1.1'],protein=data['D1.2'],mutation=data['D1.3'],division=data['D2.1'],expression=data['D2.2'],water=data['D2.3'];
  assert.match(dna.sections[6].explanation,/5′→3′/);
  assert.match(dna.sections[6].explanation,/Okazaki/);
  assert.match(dna.sections[7].explanation,/polymerase III/);
  assert.match(dna.sections[8].explanation,/3′→5′ exonuclease/);
  assert.ok(!dna.sections.some(x=>/lagging strand (is|being) synthesized 3′→5′/i.test(x.explanation)));
  assert.match(protein.sections[6].explanation,/3′-UAC-5′/);
  assert.match(protein.sections[14].explanation,/poly\(A\)/);
  assert.match(protein.sections[16].explanation,/A site/);
  assert.match(mutation.sections[4].explanation,/natural selection/i);
  assert.match(division.sections[4].explanation,/eight DNA molecules/);
  assert.match(division.sections[8].explanation,/Meiosis I/);
  assert.ok(expression.sections.every(x=>x.level==='HL'));
  assert.match(water.sections[9].explanation,/−800 kPa/);
  assert.match(water.sections[9].explanation,/−200 kPa/);
  assert.match(water.sections[9].explanation,/xylem/);
  const modelQuestion=water.questions.find(q=>q.id==='d23-signed-psi-2');
  assert.ok(modelQuestion?.answer.includes('−450 kPa'));
  assert.equal(-750+300,-450);
  const pcr=dna.questions.find(q=>q.id==='d11-pcr-model-data-1b');
  assert.ok(pcr?.answer.includes('320'));assert.equal(20*2**4,320);
  return {status:'PASS: isolated local syllabus/content preflight (NOT external scientific approval)',sections:sectionCount,questions:questionCount,visuals:visualCount,details};
}
export function load(){
  return Object.fromEntries(spec.map(s=>[s.topic,get('src/biology/learning/'+s.slug+'/lesson.json')]));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){console.log(JSON.stringify(validate(load()),null,2))}
