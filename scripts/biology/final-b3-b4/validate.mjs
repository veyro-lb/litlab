// Final B3/B4 scoped integrity gate. Run from repository root with Node >=20.
// Never changes registries, course packages or deployment configuration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateLesson} from '../../validate-lesson.mjs';
import {validateTopic} from '../themes-ab-final/validate.mjs';

const read = path => JSON.parse(fs.readFileSync(path,'utf8'));
const registry=read('src/biology/curriculum/registry.json');
const specifications=[
 ['B3.1','gas-exchange',13,10,3],
 ['B3.2','transport',18,10,8],
 ['B3.3','muscle-motility',10,0,10],
 ['B4.1','adaptation-environment',8,8,0],
 ['B4.2','ecological-niches',13,13,0]
];
let sections=0,questions=0,visuals=0,assets=0;
const assetPaths=new Set();
for(const [id,slug,total,shared,hl] of specifications){
 const lesson=read('src/biology/learning/'+slug+'/lesson.json');
 const topic=registry.find(t=>t.id===id);
 const manifest=read('docs/biology/theme-b/'+id+'-manifest.json');
 assert.ok(topic,'registry missing '+id);
 const projected={...topic,lessonId:lesson.id,understandings:topic.understandings.map(u=>({...u,studentTitle:manifest.titles.find(t=>t.id===u.id)?.studentTitle}))};
 assert.deepEqual(validateLesson(lesson,projected),[],id+' source contract');
 const exists = src=>fs.existsSync('public'+src);
 assert.deepEqual(validateTopic(projected,lesson,exists),[],id+' teaching/figure/visual contract');
 assert.equal(lesson.sections.length,total,id+' total understanding count');
 assert.equal(lesson.sections.filter(s=>s.level==='shared').length,shared,id+' SL scope count');
 assert.equal(lesson.sections.filter(s=>s.level==='HL').length,hl,id+' HL scope count');
 assert.equal(lesson.sections.every(s=>(s.visuals||[]).every(v=>Number.isInteger(v.afterBlock)&&v.afterBlock>=0&&v.afterBlock<s.teachingBlocks.length)),true,'all scientific visuals anchored to visible teaching blocks');
 for(let i=0;i<total;i++){
  const item=lesson.sections[i],number=id+'.'+(i+1);
  assert.deepEqual(item.understandingIds,[number],number+' ordered one-to-one');
  assert.ok(item.teachingBlocks.length>=4,number+' extended teaching structure');
  assert.equal(new Set(item.teachingBlocks.map(b=>b.title)).size,item.teachingBlocks.length,number+' distinctive titled blocks');
  assert.ok(item.teachingBlocks.every(b=>b.explanation.length>100),number+' substantial explanatory paragraphs');
  assert.ok(item.explanation.trim().split(/\s+/).length>=200,number+' complete explanation');
  assert.equal(item.claimReferences.length,item.teachingBlocks.length,number+' source-mapped paragraphs');
  assert.ok(item.interactions.every(q=>q.options.filter(o=>o.correct).length===1&&q.options.every(o=>o.feedback?.length>25)));
  assert.ok(lesson.questions.some(q=>q.understandingIds.includes(number)),number+' assessment');
  assert.ok(item.claimReferences.every(c=>c.referenceIds.every(rid=>lesson.references.some(r=>r.id===rid))),number+' claim provenance');
 }
 for(const a of lesson.assets){
  if(!a.withheldReason){
   assert.ok(exists(a.src),a.src+' missing');
   assetPaths.add('public'+a.src);
  }
  assert.ok(a.kind!=='photograph'||a.sourceUrl&&a.originalUrl&&a.termsUrl,a.id+' photograph rights');
 }
 sections+=lesson.sections.length;questions+=lesson.questions.length;assets+=lesson.assets.length;
 visuals+=lesson.sections.reduce((n,s)=>n+(s.visuals?.length||0),0);
}
assert.equal(sections,62);
assert.equal(questions,77);
assert.ok(visuals>=9,'at least the nine original in-lesson visuals remain');
assert.ok(assets>=12);
const sarcomere=fs.readFileSync('public/biology/muscle-motility/sarcomere.svg','utf8');
const lines=[...sarcomere.matchAll(/M(\d+) (\d+)H(\d+)/g)].map(m=>Math.abs(Number(m[1])-Number(m[3])));
assert.deepEqual(lines.slice(0,8),new Array(8).fill(210),'actin filament lengths remain identical');
assert.deepEqual(lines.slice(8,10),[210,210],'myosin filament lengths remain identical');
assert.match(sarcomere,/I.band and H.zone narrow|I.band and H.zone/i);
const heart=fs.readFileSync('public/biology/transport/heart-frontal.svg','utf8');
for(const term of ['Right atrium','Right ventricle','Left atrium','Left ventricle','Tricuspid valve','Mitral valve','Pulmonary valve','Aortic valve','Venae cavae','Pulmonary veins','Aorta'])assert.ok(heart.includes(term),'heart missing '+term);
assert.ok((heart.match(/marker-end=/g)||[]).length>=6,'heart arrows');
for(const path of assetPaths){const svg=fs.readFileSync(path,'utf8');if(path.endsWith('.svg'))assert.match(svg,/<svg[^>]+viewBox=["'][^"']+["']/)}
console.log(JSON.stringify({scope:'final-b3-b4',sectionCount:sections,questionCount:questions,visualCount:visuals,registeredAssets:assets,assetPathsVerified:assetPaths.size,positive:'PASS',nativeRuntime:process.version},null,2));
