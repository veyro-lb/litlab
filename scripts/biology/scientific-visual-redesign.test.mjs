// BioLab scientific-visual source and syllabus regression gate.
// Does NOT substitute for human scientific or rendered-browser inspection.
import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
const json=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const lesson=json('src/biology/learning/reproduction/lesson.json');
const audit=json('docs/biology/scientific-visual-redesign/VISUAL_AUDIT.json');
const targets=[
 {id:'d31-male-anatomy',labels:['Penis','Erectile tissue','Urethra','Sperm duct (vas deferens)','Seminal vesicle','Prostate gland','Epididymis','Testis','Scrotum']},
 {id:'d31-female-frontal',labels:['Oviduct (Fallopian tube)','Ovary','Uterus','Endometrium','Cervix','Vagina']},
 {id:'d31-female-sagittal',labels:['Uterus','Endometrium','Cervix','Vagina','Vulva (external)']},
 {id:'d31-flower-structures',labels:['Stamen (anther + filament)','Anther','Filament','Petal','Sepal','Stigma','Style','Ovary','Ovule','Carpel (female organ)']}
];
const visibleText=s=>s.replace(/<title\b[^>]*>[\s\S]*?<\/title>/g,'').replace(/<desc\b[^>]*>[\s\S]*?<\/desc>/g,'').replace(/<[^>]+>/g,' ');
function validateSources(x) {
 const errors=[];
 if(x.topicId!=='D3.1')errors.push('topic');
 const anatomy=x.sections.find(s=>s.understandingIds.includes('D3.1.4'));
 if(!anatomy)errors.push('anatomy section');
 else {
  if(anatomy.assets.join('|')!=='d31-male-anatomy|d31-female-frontal|d31-female-sagittal|d31-hodder-male|d31-hodder-female')errors.push('anatomy assets');
  if(anatomy.figurePlacements?.length!==5||anatomy.figurePlacements?.some(p=>p.afterBlock!==0))errors.push('anatomy placements');
 }
 const flower=x.sections.find(s=>s.understandingIds.includes('D3.1.9'));
 if(!flower?.assets.includes('d31-flower-structures'))errors.push('flower placement');
 for(const {id} of targets){
  const asset=x.assets.find(a=>a.id===id);
  if(!asset) {errors.push(id+' metadata');continue;}
  for(const key of ['src','recallSrc','mobileSrc','recallMobileSrc']){
   if(!asset[key]||!existsSync(join(root,'public',asset[key].replace(/^\//,''))))errors.push(id+' '+key+' unavailable');
  }
  if(!asset.alt||asset.alt.length<80||!asset.permissionEvidence||!asset.referenceIds.includes('ib-d31'))errors.push(id+' provenance/alt');
 }
 return errors;
}
test('D3.1 exact figure placements, accessibility and local variants',()=>assert.deepEqual(validateSources(lesson),[]));
test('negative: deleting a placement fails the validator',()=>{
 const copy=structuredClone(lesson);copy.sections.find(s=>s.understandingIds.includes('D3.1.4')).figurePlacements.pop();
 assert.ok(validateSources(copy).includes('anatomy placements'));
});
test('negative: broken recall path fails the validator',()=>{
 const copy=structuredClone(lesson);copy.assets.find(a=>a.id==='d31-male-anatomy').recallSrc='/biology/reproduction/not-present.svg';
 assert.ok(validateSources(copy).some(e=>e.includes('recallSrc unavailable')));
});
test('all sixteen labelled/recall/mobile SVGs use safe local SVG markup',()=>{
 for(const {id,labels} of targets){
  for(const suffix of ['','-recall','-mobile','-mobile-recall']){
   const svg=readFileSync(join(root,'public/biology/reproduction',id+suffix+'.svg'),'utf8');
   assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 \d+ \d+"/);
   assert.match(svg,/<title\b/); assert.match(svg,/<desc\b/);
   assert.match(svg,/<\/svg>\s*$/);
   assert.doesNotMatch(svg,/<script\b|<foreignObject\b|onload\s*=|xlink:href\s*=|<image\b/i);
   const text=visibleText(svg);
   if(!suffix.includes('recall'))for(const label of labels)assert.ok(text.includes(label),id+suffix+' missing visible label '+label);
   if(suffix.includes('mobile'))assert.ok(Number(svg.match(/viewBox="0 0 (\d+)/)?.[1])<=800,'mobile viewBox too wide');
  }
 }
});
test('course inventory remains 40 topics, 553 unique understandings and handout crosswalk',()=>{
 const dirs=readdirSync(join(root,'src/biology/learning'),{withFileTypes:true}).filter(x=>x.isDirectory()&&existsSync(join(root,'src/biology/learning',x.name,'lesson.json')));
 const ids=new Set(),topicIds=new Set();
 for(const d of dirs){const l=json('src/biology/learning/'+d.name+'/lesson.json');topicIds.add(l.topicId);for(const s of l.sections)for(const id of s.understandingIds)ids.add(id);}
 assert.equal(dirs.length,40);assert.equal(topicIds.size,40);assert.equal(ids.size,553);
 assert.equal(audit.counts.topics,40);assert.equal(audit.counts.uniqueUnderstandingIds,553);
 assert.equal(audit.handoutCrosswalk.length,17);
 assert.ok(audit.assetInventory.length>=160);
 assert.ok(audit.assetInventory.every(a=>a.scientificReview.includes('Pending')),'no premature certification');
});

test('A2.2.8 plant palisade cell is present, localized and paired with exact mobile recall',()=>{
 const a22=json('src/biology/learning/cell-structure/lesson.json');
 const s=a22.sections.find(s=>s.understandingIds.includes('A2.2.8'));
 assert.ok(s.assets.includes('a22-plant-palisade'));
 assert.deepEqual(s.figurePlacements.slice(0,2),[{assetId:'a22-plant-palisade',afterBlock:0},{assetId:'a22-groups',afterBlock:1}]);
 const a=a22.assets.find(a=>a.id==='a22-plant-palisade');
 assert.ok(a.alt.length>100&&a.referenceIds.includes('ib-a22'));
 const key=['Cell wall','Chloroplast','Large central sap vacuole','Golgi apparatus','Mitochondrion','Plasma membrane','Cytoplasm','Free 80S ribosomes','Smooth endoplasmic reticulum','Rough endoplasmic reticulum','Nucleus'];
 for(const suffix of ['','-recall','-mobile','-mobile-recall']){
  const name='public/biology/cell-structure/a22-plant-palisade'+suffix+'.svg';
  const s=readFileSync(join(root,name),'utf8');
  assert.match(s,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox=/);
  assert.match(s,/<\/svg>\s*$/);
  assert.doesNotMatch(s,/<script\b|<foreignObject\b|<image\b/i);
  if(!suffix.includes('recall'))for(const label of key)assert.ok(visibleText(s).includes(label),name+' missing '+label);
 }
});

// Original-source images are checked pixel-for-pixel against the extraction manifest.
const originalFigures=json('docs/biology/source-figure-credits.json').figures;
function sourceImageErrors(record){
 const errors=[];
 if(!/^\/biology\/source-pdf-figures\/[a-z0-9-]+\.png$/.test(record.src))return ['unsafe image path'];
 const file=join(root,'public',record.src.slice(1));
 if(!existsSync(file))return ['missing image'];
 const bytes=readFileSync(file);
 if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))errors.push('invalid PNG');
 if(createHash('sha256').update(bytes).digest('hex')!==record.sha256)errors.push('changed original pixels');
 const lessons=readdirSync(join(root,'src/biology/learning'),{withFileTypes:true})
  .filter(d=>d.isDirectory()&&existsSync(join(root,'src/biology/learning',d.name,'lesson.json')))
  .map(d=>json('src/biology/learning/'+d.name+'/lesson.json'));
 const lesson=lessons.find(l=>l.topicId===record.topicId);
 const asset=lesson?.assets.find(a=>a.id===record.assetId);
 const section=lesson?.sections.find(s=>s.understandingIds.includes(record.understandingId));
 if(!asset||asset.src!==record.src||!section?.assets.includes(record.assetId))errors.push('missing syllabus placement');
 if(!asset?.attribution.includes(record.source)||!asset?.license.includes('Third-party licensed illustration'))errors.push('missing original source credit');
 for(const key of ['recallSrc','mobileSrc','recallMobileSrc'])
  if(asset?.[key]!==record.src)errors.push('redrawn variant '+key);
 return errors;
}
test('18 exact PDF figure crops have unchanged SHA-256, correct syllabus placement and visible Sources attribution',()=>{
 assert.equal(originalFigures.length,18);
 const ids=new Set(originalFigures.map(f=>f.figureId));
 assert.equal(ids.size,18);
 for(const record of originalFigures)assert.deepEqual(sourceImageErrors(record),[],record.figureId);
});
test('negative: substituted or uncredited PDF screenshot is rejected',()=>{
 const changed={...originalFigures[0],sha256:'0'.repeat(64)};
 assert.ok(sourceImageErrors(changed).includes('changed original pixels'));
 const unlinked={...originalFigures[0],assetId:'not-a-real-asset'};
 assert.ok(sourceImageErrors(unlinked).includes('missing syllabus placement'));
});
