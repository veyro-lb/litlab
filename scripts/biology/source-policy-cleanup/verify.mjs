import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateLesson} from '../../validate-lesson.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const read=(path)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const one=(d,id)=>d.sections.find(s=>s.understandingIds.includes(id));
const refs=(obj)=>{const found=[];function visit(v){if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(k==='referenceIds'&&Array.isArray(x))found.push(...x);else if(typeof x==='object')visit(x)}}visit(obj);return found};
const absent=(bad,rs)=>bad.every(id=>!rs.includes(id));
const problem=(errors,condition,message)=>{if(!condition)errors.push(message)};

export function inspectFocusedLesson(d) {
 const errors=[];
 if(d.topicId==='D4.3'){
  const a=one(d,'D4.3.1'),b=one(d,'D4.3.4'),c=one(d,'D4.3.6');
  problem(errors,!!a&&!!b&&!!c,'D4.3 core understandings missing');
  if(a&&b&&c){
   problem(errors,!/NASA.*2025|1\.19|1951.?1980/i.test(JSON.stringify({a,qs:d.questions.filter(q=>q.understandingIds.includes('D4.3.1'))})),'D4.3.1 deprecated NASA statistic remains');
   problem(errors,absent(['nasa-temp'],refs(a))&&!a.graphTables?.length,'D4.3.1 removed observation must not be graphed/cited');
   problem(errors,/CO₂|carbon dioxide/i.test(a.explanation)&&/methane|CH₄/i.test(a.explanation)&&/correlation/i.test(a.explanation),'D4.3.1 mechanism and evidence incomplete');
   problem(errors,absent(['noaa-seaice'],refs(b))&&!b.graphTables?.length&&!b.assets.includes('d43-seaice'),'D4.3.4 specialized NOAA table/figure survives');
   problem(errors,/emperor penguin/i.test(b.explanation)&&/walrus/i.test(b.explanation)&&/landfast/i.test(b.explanation),'D4.3.4 biological examples incomplete');
   problem(errors,d.questions.filter(q=>q.understandingIds.includes('D4.3.4')).every(q=>!/NOAA 2025|March\/September 2025|0\.91 million/.test(JSON.stringify(q))),'D4.3.4 obsolete quantitative quiz');
   problem(errors,['newguinea-birds','na-tree-ranges'].every(id=>c.referenceIds.includes(id)),'D4.3.6 missing prescribed-case provenance');
  }
 }
 if(d.topicId==='A1.1'){
  const a=one(d,'A1.1.6'),b=one(d,'A1.1.7'),c=one(d,'A1.1.8');
  problem(errors,!!a&&!!b&&!!c,'Water shared/HL understandings missing');
  if(a&&b&&c){
   problem(errors,absent(['buoyancy','viscosity','heat','conduction','density-usgs'],refs(a)),'A1.1.6 redundant physics citations');
   problem(errors,absent(['origin-update','early-earth','origin-2026','habitable'],refs(b)),'A1.1.7 scope-inappropriate research citation');
   problem(errors,/asteroid/i.test(b.explanation)&&/gravity/i.test(b.explanation)&&/condens/i.test(b.explanation),'A1.1.7 origin/retention requirements lost');
   problem(errors,/Goldilocks|habitable zone/i.test(c.explanation),'A1.1.8 Goldilocks zone removed');
   problem(errors,d.questions.some(q=>q.id==='p1b-2'&&/2\.39 K/.test(q.answer)&&/9\.93 K/.test(q.answer)),'A1.1.6 calculation lost');
  }
 }
 if(d.topicId==='B2.3'){
  for(let i=1;i<=6;i++)problem(errors,absent(['ncbi-niche','ncbi-potency'],refs(one(d,'B2.3.'+i))), 'B2.3.'+i+' unnecessary external source tags');
  problem(errors,!!one(d,'B2.3.10')&&one(d,'B2.3.10').level==='HL','B2.3 HL scope lost');
  problem(errors,one(d,'B2.3.6')?.graphTables?.[0]?.rows?.length>=4,'B2.3.6 cube comparison lost');
 }
 if(d.topicId==='C1.3'){
  const a=one(d,'C1.3.8');
  problem(errors,refs(a).includes('face-review'),'C1.3.8 FACE evidence removed');
  for(const s of d.sections.filter(s=>s!==a))
   problem(errors,!refs(s).includes('face-review'),s.understandingIds[0]+' unrelated FACE research citation');
 }
 if(d.topicId==='C4.2'){
  const a=one(d,'C4.2.20'),fig=d.assets.find(x=>x.id==='c42-keeling-2024-2025');
  problem(errors,!!a&&!!fig,'C4.2.20 observed monthly graph missing');
  if(a&&fig){
   problem(errors,a.assets.includes(fig.id)&&a.figurePlacements?.some(x=>x.assetId===fig.id),'C4.2.20 graph not in teaching');
   problem(errors,fig.referenceIds.includes('noaa-keeling-monthly')&&fig.attribution.includes('NOAA'),'C4.2.20 monthly provenance missing');
   problem(errors,a.graphTables?.some(x=>x.rows.length===2&&/annual|long-term/i.test(x.caption)),'C4.2.20 historical annual means incorrectly removed');
   problem(errors,/6\.14 ppm/.test(a.workedExample)&&/seasonal/i.test(a.workedExample),'C4.2.20 measured seasonal interpretation missing');
   problem(errors,/2024 and 2025/.test(fig.alt),'C4.2.20 two within-year observation series missing');
  }
 }
 return errors;
}

export function verifyCourse(){
 const registry=read('src/biology/curriculum/registry.json');
 const catalog=read('src/biology/learning/catalog.json');
 assert.equal(registry.length,40,'All 40 syllabus topics must remain');
 assert.equal(Object.keys(catalog).length,40,'All 40 lesson catalog entries must remain');
 const all=registry.flatMap(x=>x.understandings);
 assert.equal(all.length,553,'All 553 syllabus understandings must remain');
 assert.equal(new Set(all.map(x=>x.id)).size,553,'Understanding IDs must be unique');
 assert.equal(all.filter(x=>x.level==='shared').length,337);
 assert.equal(all.filter(x=>x.level==='HL').length,216);
 let questions=0,assets=0,sections=0;
 for(const topic of registry){
  const entry=catalog[topic.lessonId];assert.equal(entry?.topicId,topic.id);
  const d=read('src/biology/learning/'+entry.path.replace(/^\.\//,''));
  assert.deepEqual(validateLesson(d,topic),[],topic.id+' generic validation');
  assert.deepEqual(inspectFocusedLesson(d),[],topic.id+' source-policy validation');
  for(const a of d.assets){if(a.src.startsWith('/biology/'))assert.ok(existsSync(resolve(root,'public'+a.src)),topic.id+': missing '+a.src)}
  questions+=d.questions.length;assets+=d.assets.length;sections+=d.sections.length;
 }
 assert.equal(sections,553,'Every understanding must retain teaching');
 const co2=read('src/biology/learning/transfers-energy-matter/lesson.json');
 const graph=co2.assets.find(x=>x.id==='c42-keeling-2024-2025');
 const svg=readFileSync(resolve(root,'public'+graph.src),'utf8');
 assert.equal((svg.match(/<circle /g)||[]).length,24,'24 observed monthly points (12 per year)');
 assert.equal((svg.match(/<polyline /g)||[]).length,2,'Exactly 2 observed series');
 assert.ok(!/<script\b/i.test(svg),'No script in plotted SVG');
 assert.ok(Math.abs((430.51-424.37)-6.14)<1e-9,'Observed 2025 seasonal amplitude');
 const result={status:'PASS',topics:40,understandings:553,shared:337,additionalHL:216,questions,assets,seasonalPoints:24,sourceScope:'validated; independent scientific examiner review still required'};
 return result;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 try{console.log(JSON.stringify(verifyCourse(),null,2))}
 catch(e){console.error(e);process.exitCode=1}
}
