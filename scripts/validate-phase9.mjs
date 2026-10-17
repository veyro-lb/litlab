import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateLesson} from './validate-lesson.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export const newSlugs=['membranes-transport','organelles-compartmentalization','cell-specialization','cell-structure'];
export const readNew=()=>newSlugs.map(s=>read('src/biology/learning/'+s+'/lesson.json'));
export function checkScientificRegressions(lessons){
 const e=[],byId=new Map(lessons.map(l=>[l.topicId,l]));
 const keyed=id=>{for(const l of lessons){const q=l.questions.find(q=>q.id===id);if(q)return q.options?.find(o=>o.correct)?.text||q.answer||''}return ''};
 if(!/three Na\+ leave and two K\+ enter per ATP/i.test(keyed('b21-paper1a-15')))e.push('Na/K pump 3:2 ATP stoichiometry');
 if(!/Na\+ entering.*electrochemical gradient/i.test(keyed('b21-paper1a-16')))e.push('Secondary transport driving force');
 if(!/Photosystems in thylakoid membranes and Calvin cycle in stroma/i.test(keyed('b22-paper1a-5')))e.push('Chloroplast structural distinction');
 if(!/24 µm²; 8 µm³; 3 µm⁻¹/.test(keyed('b23-p1a-6')))e.push('Cube units and calculation');
 const table=byId.get('B2.3')?.sections[5].graphTables[0];
 if(!table||table.rows.some(([l,a,v,r])=>Number(a)!==6*Number(l)**2||Number(v)!==Number(l)**3||Math.abs(Number(r)-Number(a)/Number(v))>1e-9))e.push('Cube model data');
 if(!/3000/.test(keyed('a22-paper2-1'))||!/30 µm/.test(keyed('a22-paper2-2')))e.push('Magnification and scale-bar conversion');
 const photo=byId.get('A2.2')?.assets.find(a=>a.kind==='photograph');
 if(!photo||!photo.sourceUrl||!photo.originalUrl||!photo.termsUrl||!/500 nm/.test(photo.alt))e.push('Authentic microscopy source and scale evidence');
 for(const l of lessons){
  const refs=new Map(l.references.map(r=>[r.id,r]));
  for(const x of [...l.sections,...l.questions,...l.assets])if(x.level==='shared'&&x.referenceIds?.some(id=>refs.get(id)?.level==='HL'))e.push('HL reference leakage '+l.topicId);
  const keys=l.questions.filter(q=>q.options).map(q=>q.options.findIndex(o=>o.correct));
  for(let period=1;period<=4;period++)if(keys.length>=8&&keys.every((k,i)=>i<period||k===keys[i-period]))e.push('Predictable answer-position cycle '+l.topicId);
  for(const s of l.sections){const q=l.questions.find(q=>q.options&&q.sectionId===s.id);for(const c of s.interactions)if(q?.prompt===c.prompt&&JSON.stringify(q.options.map(o=>[o.text,o.correct,o.feedback]))!==JSON.stringify(c.options.map(o=>[o.text,o.correct,o.feedback])))e.push('Paired question drift '+s.id);}
 }
 return e;
}
const byTopicId=(id,lessons)=>lessons.find(l=>l.topicId===id);
export function validatePhase9(){
 const errors=[],registry=read('src/biology/curriculum/registry.json'),catalog=read('src/biology/learning/catalog.json'),lessons=readNew();
 const expected=['A1.1','A1.2','A2.2','B1.1','B1.2','B2.1','B2.2','B2.3','C1.1'];
 const activeIds=registry.filter(t=>t.lessonId&&t.availability==='draft').map(t=>t.id);
 if(Object.keys(catalog).length!==activeIds.length||expected.some(id=>!Object.values(catalog).some(x=>x.topicId===id))||activeIds.some(id=>!Object.values(catalog).some(x=>x.topicId===id)))errors.push('Registered lesson catalog must include all active topics and retain nine Phase 9 source-mapped baselines');
 const cell=registry.find(t=>t.id==='A2.2');if(cell.availability!=='draft'||cell.lessonId!==byTopicId('A2.2',lessons)?.id||!Object.values(catalog).some(x=>x.topicId==='A2.2'))errors.push('A2.2 draft catalog/registry drift');
 for(const l of lessons){
  const t=structuredClone(registry.find(t=>t.id===l.topicId));
  errors.push(...validateLesson(l,t).map(e=>l.topicId+': '+e));
 }
 errors.push(...checkScientificRegressions(lessons));
 const significant=registry.map(t=>({id:t.id,title:t.title,theme:t.theme,organization:t.organization,version:t.version,level:t.level,pdfPage:t.pdfPage,questionReferences:t.questionReferences,understandings:t.understandings.map(({studentTitle,draftSummary,...u})=>u)}));
 const digest=createHash('sha256').update(JSON.stringify(significant)).digest('hex');
 if(digest!==read('docs/biology/phase9/REGISTRY_BASELINE.json').sha256)errors.push('Official registry identifiers, levels or source metadata changed');
 const provenance=read('docs/biology/phase9/MICROSCOPY_PROVENANCE.json');
 for(const p of provenance){const file=path.join(root,'public/biology/cell-structure/cucumber-leaf-tem.webp');if(createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==p.localWebpSHA256||!p.pixelEqualityVerified||p.humanReviewer!==null)errors.push('Microscopy provenance integrity');}
 const active=registry.filter(t=>t.availability==='draft');
 return {errors,summary:{topics:registry.length,understandings:registry.reduce((n,t)=>n+t.understandings.length,0),activeTopics:active.length,activeUnderstandings:active.reduce((n,t)=>n+t.understandings.length,0),shared:active.flatMap(t=>t.understandings).filter(u=>u.level==='shared').length,HL:active.flatMap(t=>t.understandings).filter(u=>u.level==='HL').length,requiresQualifiedReview:active.filter(t=>t.id==='A2.2').map(t=>t.id),registryDigest:digest}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const r=validatePhase9();console.log(JSON.stringify(r,null,2));if(r.errors.length)process.exitCode=1;}
