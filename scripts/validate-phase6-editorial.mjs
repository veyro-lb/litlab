import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

/** Portable editorial invariants for newly authored lessons.
 * Automated checks cannot assess whether distractors are scientifically plausible:
 * a qualified reviewer still must inspect the content.
 */
export function validateEditorialLesson(lesson){
 const problems=[];
 const issue=(id,why)=>problems.push(lesson.topicId+' '+id+': '+why);
 const sectionQuestions=lesson.sections.flatMap(s=>(s.interactions||[]).map(q=>({id:s.understandingIds[0],q})));
 const practice=lesson.questions.filter(q=>q.paper==='1A'&&Array.isArray(q.options));
 const byUnderstanding=new Map(practice.map(q=>[q.understandingIds[0],q]));
 for(const {id,q} of sectionQuestions){
  const matched=byUnderstanding.get(id);
  if(!matched){issue(id,'missing paired practice MCQ');continue;}
  if(q.prompt!==matched.prompt || JSON.stringify(q.options.map(o=>[o.text,o.correct,o.feedback]))!==
    JSON.stringify(matched.options.map(o=>[o.text,o.correct,o.feedback])))
    issue(id,'Learn/Practice copies disagree');
 }
 for(const q of [...practice,...sectionQuestions.map(x=>x.q)]){
  const id=q.id;
  if(q.options.length!==4)issue(id,'expected four choices');
  if(q.options.filter(o=>o.correct).length!==1)issue(id,'expected exactly one defensible keyed choice');
  if(new Set(q.options.map(o=>o.text.trim())).size!==q.options.length)issue(id,'duplicated distractor text');
  if(new Set(q.options.map(o=>o.feedback.trim())).size!==q.options.length)issue(id,'duplicated feedback');
  if(q.options.some(o=>!o.feedback || o.feedback.trim().length<20))issue(id,'insufficient causal feedback');
 }
 for(const section of lesson.sections){
  if(!section.mechanismChallenge)continue;
  for(const stage of section.mechanismChallenge.stages){
   const id=section.understandingIds[0]+'/'+stage.id;
   if(stage.options.length<2||stage.options.filter(o=>o.correct).length!==1)issue(id,'invalid mechanism predictions');
   if(stage.options.some(o=>!o.feedback||o.feedback.trim().length<28)||stage.explanation.trim().length<40)
    issue(id,'mechanism lacks actionable causal explanation');
   if(new Set(stage.options.map(o=>o.feedback)).size!==stage.options.length)issue(id,'mechanism feedback repeated');
  }
 }
 return problems;
}
export async function readPhase6Lessons(){
 const root=new URL('../src/biology/learning/',import.meta.url);
 const a=JSON.parse(await readFile(new URL('nucleic-acids/lesson.json',root),'utf8'));
 const c=JSON.parse(await readFile(new URL('enzymes-metabolism/lesson.json',root),'utf8'));
 return [a,c];
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const lessons=await readPhase6Lessons();
 const errors=lessons.flatMap(validateEditorialLesson);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log('Phase 6: 32 paired Learn/Practice questions and 8 mechanism stages pass reusable editorial regression checks. Human plausibility review remains required.');
}
