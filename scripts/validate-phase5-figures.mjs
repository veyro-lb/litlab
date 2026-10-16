import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

/** Automated *regression* checks, not molecular-geometry or qualified science approval.
 * Check actual authored SVG sources in addition to metadata/asset loading.
 */
export function validatePhase5Figures(files,lessons){
 const errors=[];
 const fail=m=>errors.push(m);
 const figure=(path)=>files[path];
 const textCount=(s,word)=>[...(s||'').matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].filter(([,label])=>label===word).length;
 for(const lesson of Object.values(lessons)){
  for(const asset of lesson.assets){
   if(asset.kind!=='diagram')continue;
   if(!/^\/biology\/(?:nucleic-acids|enzymes-metabolism)\/[a-z0-9-]+\.svg$/.test(asset.src)||
       !/^\/biology\/(?:nucleic-acids|enzymes-metabolism)\/[a-z0-9-]+-recall\.svg$/.test(asset.recallSrc||''))fail('Invalid diagram paths '+asset.id);
   for(const [kind,path] of [['labelled',asset.src],['recall',asset.recallSrc]]){
    const s=figure(path);
    if(typeof s!=='string'){fail('Missing '+kind+' SVG '+path);continue;}
    if(!/^<svg\s/.test(s)||!s.includes('</svg>')||!/<title>[^<]+<\/title>/.test(s)||!/<desc>[^<]+<\/desc>/.test(s)||!/viewBox="0 0 \d+ \d+"/.test(s))fail('Invalid accessible SVG structure '+path);
    if(/<(?:script|foreignObject|image|iframe)\b/i.test(s)||/(?:href|src)="(?:https?:|data:|javascript:)/i.test(s))fail('Unsafe SVG external content '+path);
    for(const [,v] of s.matchAll(/\bfill="([^"]+)"/g)){
     if(!/^(?:#[\da-f]{3,8}|none|transparent|white|black|url\(#[\w-]+\))$/i.test(v))fail('Invalid paint fill '+path);
    }
    if(kind==='recall'&&textCount(s,'?')===0&&!/Recall (?:horizontal variable|rate\/energy axis|vertical axis)/.test(s)&&!s.includes('Reconstruct'))fail('Unlabelled figure lacks recall prompts '+path);
   }
 }
 }
 const a='/biology/nucleic-acids/',c='/biology/enzymes-metabolism/';
 const aN=figure(a+'nucleosome.svg')||'';
 for(const histone of ['H2A','H2B','H3','H4'])if(textCount(aN,histone)!==2)fail('Nucleosome octamer histone count '+histone);
 if(textCount(aN,'H1')!==1||(aN.match(/<circle\b/g)||[]).length!==9||!aN.includes('H1 on linker DNA, outside core'))fail('Nucleosome H1 must remain outside core octamer');
 const anti=figure(a+'paired.svg')||'';
 if(textCount(anti,'5′')!==2||textCount(anti,'3′')!==2||!anti.includes('5′  A  T  G  C  3′')||!anti.includes('3′  T  A  C  G  5′'))fail('DNA antiparallel end labels or base complement reversed');
 const sugar=figure(a+'sugars.svg')||'';
 if(textCount(sugar,'C2′')!==2||textCount(sugar,'OH')!==1||textCount(sugar,'H')!==1||!sugar.includes('3′—OH in both'))fail('Ribose 2′ OH / deoxyribose 2′ H mismatch');
 const nucleotide=figure(a+'nucleotide.svg')||'';
 if(!nucleotide.includes('PO₄')||!nucleotide.includes('Sugar')||!nucleotide.includes('Base')||!/<polygon\b/.test(nucleotide))fail('Nucleotide phosphate-sugar-base connectivity representation changed');
 const history=figure(a+'hershey.svg')||'';
 if(!history.includes('³²P DNA')||!history.includes('Bacterial pellet')||!history.includes('³⁵S coat')||!history.includes('Supernatant'))fail('Hershey Chase tracer mapping reversed');
 const chargaff=figure(a+'chargaff.svg')||'';
 if(textCount(chargaff,'30%')!==2||textCount(chargaff,'20%')!==2)fail('Chargaff illustrative A=T, G=C figures changed');
 const induced=figure(c+'induced.svg')||'';
 if(!induced.includes('Conformational change')||!induced.includes('Catalyst regenerated')||(induced.match(/<path\b/g)||[]).length<3)fail('Induced-fit sequential mechanism incomplete');
 const inhibition=figure(c+'inhibition.svg')||'';
 if(!inhibition.includes('Competitive: active site')||!inhibition.includes('Allosteric: distinct site'))fail('Competitive vs regulatory binding locations missing');
 const alt=lessons['C1.1']?.assets.find(x=>x.id==='c11-inhibition')?.alt||'';
 if(!/mechanism diagram, not a plot/.test(alt)||!/competitive inhibitor occupies/.test(alt))fail('Inhibition accessibility description does not match revised SVG');
 const feedback=figure(c+'feedback.svg')||'';
 if(!feedback.includes('Threonine')||!feedback.includes('Ile')||!feedback.includes('Feedback inhibits early enzyme')||!/<path\s+d="M820 222/.test(feedback))fail('End-product feedback arrow mechanism missing');
 const penicillin=figure(c+'penicillin.svg')||'';
 if(!penicillin.includes('β-lactam')||!penicillin.includes('Covalently acylated PBP'))fail('PBP mechanism labels missing');
 for(const key of ['temperature','ph','substrate','timecourse','activation']){
  const file=figure(c+key+'.svg')||'';
  if((file.match(/<polyline\b/g)||[]).length<(key==='activation'?2:1)||!file.includes('THEORETICAL MODEL ONLY')||!file.includes('numeric tables provided beside graph'))fail('Model graph axis/provenance/regression '+key);
 }
 return errors;
}
export async function readPhase5FigureFiles(lessons){
 const files={};
 for(const lesson of Object.values(lessons))for(const a of lesson.assets)for(const path of [a.src,a.recallSrc]){
  if(typeof path!=='string'||!/^\/biology\/(?:nucleic-acids|enzymes-metabolism)\/[a-z0-9-]+\.svg$/.test(path))continue;
  files[path]=await readFile(new URL('../public'+path,import.meta.url),'utf8');
 }
 return files;
}
export async function readPhase5Lessons(){
 return {'A1.2':JSON.parse(await readFile(new URL('../src/biology/learning/nucleic-acids/lesson.json',import.meta.url),'utf8')),
 'C1.1':JSON.parse(await readFile(new URL('../src/biology/learning/enzymes-metabolism/lesson.json',import.meta.url),'utf8'))};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const lessons=await readPhase5Lessons();
 const errors=validatePhase5Figures(await readPhase5FigureFiles(lessons),lessons);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
 else console.log('Phase 5: 42 labelled/recall scientific SVGs, accessibility, source-safe assets and selected mechanism invariants passed automated regression checks. Specialist review pending.');
}