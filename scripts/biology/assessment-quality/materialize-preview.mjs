#!/usr/bin/env node
/** Apply guarded assessment proposals only to a disposable /tmp copy for rendering QA.
 * NEVER write to a version-controlled lesson JSON file.
 */
import {readFileSync,writeFileSync,realpathSync,existsSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';
import {verifyPatchDocument} from './verify-patches.mjs';
const source=resolve(new URL('../../../',import.meta.url).pathname);
const destination=process.argv[2]&&realpathSync(process.argv[2]);
if(!destination||!destination.startsWith('/tmp/biolab-assessment-preview.')||destination===source||source.startsWith(destination+sep))
 throw Error('Preview destination must be a separately created /tmp/biolab-assessment-preview.* checkout');
const read=(root,path)=>JSON.parse(readFileSync(join(root,path),'utf8'));
const doc=read(source,'docs/biology/assessment-quality/PROPOSED_QUESTION_PATCHES.json');
const reg=read(source,'src/biology/curriculum/registry.json');
const paths=[...new Set(doc.patches.map(p=>p.lessonFile))];
const lessons=Object.fromEntries(paths.map(p=>[p,read(destination,p)]));
const result=verifyPatchDocument(doc,lessons,reg);
if(result.errors){console.error(JSON.stringify(result,null,2));process.exit(1);}
for(const path of paths){
 const real=realpathSync(join(destination,path));
 if(!real.startsWith(destination+sep))throw Error('Source path escaped preview copy');
 const lesson=lessons[path],patches=doc.patches.filter(p=>p.lessonFile===path);
 for(const p of patches){const n=lesson.questions.findIndex(q=>q.id===p.questionId);if(n<0)throw Error('Missing question: '+p.questionId);lesson.questions[n]=p.replacementQuestion;}
 writeFileSync(real,JSON.stringify(lesson,null,2)+'\n');
}
console.log(JSON.stringify({appliedInDisposablePreview:result.matchedFingerprints,lessonFilesInDisposablePreview:paths.length,workingTreeLessonFilesTouched:0}));
