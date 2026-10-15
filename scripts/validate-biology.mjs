import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const expected={A:[8,15,9,14,6,15,9,11,8],B:[13,12,17,9,10,13,18,10,8,13],C:[17,17,19,14,16,23,18,18,22],D:[9,19,10,17,11,11,20,21,11,15,15,12]};
const hlOnly=new Set(['A2.1','A2.3','A3.2','B3.3','C2.1','D2.2']);
const expectedIds=['A1.1','A1.2','A2.1','A2.2','A2.3','A3.1','A3.2','A4.1','A4.2','B1.1','B1.2','B2.1','B2.2','B2.3','B3.1','B3.2','B3.3','B4.1','B4.2','C1.1','C1.2','C1.3','C2.1','C2.2','C3.1','C3.2','C4.1','C4.2','D1.1','D1.2','D1.3','D2.1','D2.2','D2.3','D3.1','D3.2','D3.3','D4.1','D4.2','D4.3'];
// Shared statement cutoffs transcribed from the guide's SL and HL sections.
const sharedCounts=[6,10,0,11,0,11,0,7,8,13,5,10,3,6,10,10,0,8,13,10,6,8,0,7,16,18,18,22,5,11,7,11,0,7,12,15,6,8,11,8];
export function validateCurriculum(topics){
  const errors=[];const seen=new Set();const statements=new Set();
  const fail=x=>errors.push(x);
  if(topics.length!==40)fail('Expected 40 topics');
  for(const t of topics){
    if(seen.has(t.id))fail(`Duplicate topic ${t.id}`);seen.add(t.id);
    const idx=expectedIds.indexOf(t.id);
    if(idx<0){fail(`Unknown topic ${t.id}`);continue;}
    if(!t.title||t.theme!==t.id[0]||t.organization!==Number(t.id[1]))fail(`Invalid placement/metadata ${t.id}`);
    if(t.version!=='ib-biology-fa2025-v1'||t.review!=='source-mapped'||t.availability!=='planned'||t.lessonId)fail(`Invalid version, review or unsupported lesson ${t.id}`);
    if(t.level!==(hlOnly.has(t.id)?'HL':'shared'))fail(`Invalid topic level ${t.id}`);
    if(!t.questionReferences?.guiding||!t.questionReferences?.linking||!Number.isInteger(t.pdfPage)||t.pdfPage<40)fail(`Missing source references ${t.id}`);
    const themeIndex=expectedIds.filter(id=>id[0]===t.theme).indexOf(t.id);
    if(t.understandings?.length!==expected[t.theme]?.[themeIndex])fail(`Missing understandings ${t.id}`);
    for(const [i,u] of (t.understandings||[]).entries()){
      if(statements.has(u.id))fail(`Duplicate understanding ${u.id}`);statements.add(u.id);
      if(u.id!==`${t.id}.${i+1}`||u.printedId?.replace(/^([A-D])\./,'$1')!==u.id)fail(`Invalid understanding reference ${u.id}`);
      if(u.level!==(i<sharedCounts[idx]?'shared':'HL'))fail(`Invalid statement level ${u.id}`);
      if(!Number.isInteger(u.pdfPage)||u.pdfPage<t.pdfPage||u.pdfPage>114||u.guidePage!==u.pdfPage-6||u.review!=='source-mapped'||typeof u.skillsReference!=='boolean'||typeof u.nosReference!=='boolean')fail(`Missing source metadata ${u.id}`);
    }
  }
  for(const id of expectedIds)if(!seen.has(id))fail(`Missing topic ${id}`);
  return errors;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const data=JSON.parse(await readFile(new URL('../src/biology/curriculum/registry.json',import.meta.url),'utf8'));
  const errors=validateCurriculum(data);
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Biology registry passed: 40 topics, 553 statements, 337 shared / 216 HL; source references and level classifications checked.');
}
