import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
export function validateLessonGlossary(lesson){
  for(const section of lesson.sections){
    const id=section.understandingIds?.[0]??section.id;
    assert(Array.isArray(section.terms),id+': glossary terms must be an array, never a string');
    for(const [index,term] of section.terms.entries())
      assert(typeof term==='string'&&term.trim(),id+': glossary term '+index+' must be a nonempty string');
  }
  return lesson.sections.length;
}
export function validateCompleteGlossary(){
 const catalog=read('src/biology/learning/catalog.json');
 let count=0;
 assert.equal(Object.keys(catalog).length,40,'Unexpected topic count');
 for(const entry of Object.values(catalog)){
  const lesson=read('src/biology/learning/'+entry.path.slice(2));
  count+=validateLessonGlossary(lesson);
 }
 assert.equal(count,553,'Glossary checks must cover all official understandings');
 return{topics:40,understandings:count};
}
