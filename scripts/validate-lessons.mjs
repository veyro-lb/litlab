import {readFile,access} from 'node:fs/promises';
import {validateLesson} from './validate-lesson.mjs';
const root=new URL('../src/biology/learning/',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('catalog.json',root),'utf8'));
const registry=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8'));
const errors=[];const topicIds=new Set();
for(const [id,entry] of Object.entries(catalog)){
 if(!/^\.\/[a-z0-9-]+\/lesson\.json$/.test(entry.path)){errors.push('Unsafe catalog path '+id);continue}
 if(topicIds.has(entry.topicId))errors.push('Duplicate catalog topic '+entry.topicId);topicIds.add(entry.topicId);
 const topic=registry.find(t=>t.id===entry.topicId);
 try{
  const lesson=JSON.parse(await readFile(new URL(entry.path,root),'utf8'));
  errors.push(...validateLesson(lesson,topic));
  for(const a of lesson.assets||[])for(const src of [a.src,a.recallSrc,a.mobileSrc,a.recallMobileSrc].filter(Boolean)){
   if(!/^\/biology\/[a-z0-9-]+\/[a-z0-9-]+\.(svg|jpg|png|webp)$/.test(src)){errors.push('Unsafe asset path '+src);continue}
   try{await access(new URL('../public'+src,import.meta.url))}catch{errors.push('Missing asset '+src)}
  }
 }catch(e){errors.push('Cannot validate '+id+': '+e.message)}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`All ${Object.keys(catalog).length} registered lesson packages passed generic mapping, content, scope, provenance and asset-file checks.`);
