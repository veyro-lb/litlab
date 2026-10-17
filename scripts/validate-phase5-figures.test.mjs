import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPhase5FigureFiles,readPhase5Lessons,validatePhase5Figures} from './validate-phase5-figures.mjs';
const lessons=await readPhase5Lessons(),files=await readPhase5FigureFiles(lessons);
const corrupt=(p,search,replacement)=>{const copy={...files};assert.ok(copy[p]?.includes(search),'Expected original fixture text in '+p);copy[p]=copy[p].replace(search,replacement);return copy;};
test('All Phase 5 labelled and recall original figures pass scientific regression checks',()=>assert.deepEqual(validatePhase5Figures(files,lessons),[]));
for(const [name,p,before,after] of [
 ['wrong core histone count','/biology/nucleic-acids/nucleosome-topology-20261017.svg','>H2A</text>','>H1</text>'],
 ['reversed DNA polarity','/biology/nucleic-acids/paired.svg','5′  A  T  G  C  3′','3′  A  T  G  C  5′'],
 ['incorrect ribose hydroxyl','/biology/nucleic-acids/sugars.svg','>OH</text>','>H</text>'],
 ['Hershey isotope flipped','/biology/nucleic-acids/hershey.svg','³²P DNA','³⁵S DNA'],
 ['invalid SVG paint','/biology/enzymes-metabolism/active.svg','fill="#f1f7fa"','fill="not-a-color"'],
 ['removing induced-fit explanation','/biology/enzymes-metabolism/induced.svg','Conformational change','Rigid lock only'],
 ['removing allosteric site','/biology/enzymes-metabolism/inhibition.svg','Allosteric: distinct site','Active-site only'],
 ['breaking end-product feedback','/biology/enzymes-metabolism/feedback.svg','Feedback inhibits early enzyme','Activation instead'],
 ['removing graph curve','/biology/enzymes-metabolism/activation.svg','<polyline','<not-a-curve'],
 ['removing PBP active-site chemistry','/biology/enzymes-metabolism/penicillin.svg','Covalently acylated PBP','Unbound enzyme'],
])test('rejects science diagram regression: '+name,()=>{
 assert.ok(validatePhase5Figures(corrupt(p,before,after),lessons).length>0);
});
test('rejects stale alternative text inconsistent with updated inhibition diagram',()=>{
 const changed=structuredClone(lessons);
 changed['C1.1'].assets.find(x=>x.id==='c11-inhibition').alt='Competitive inhibitor rate models, with two empirical curves';
 assert.match(validatePhase5Figures(files,changed).join('; '),/accessibility description/);
});
test('rejects missing recall SVG',()=>{
 const copy={...files};delete copy['/biology/nucleic-acids/nucleotide-recall.svg'];
 assert.match(validatePhase5Figures(copy,lessons).join('; '),/Missing recall SVG/);
});

test('rejects H1 moved into the octamer artwork region',()=>{
 const altered=corrupt('/biology/nucleic-acids/nucleosome-topology-20261017.svg','<circle cx="785" cy="289"','<circle cx="425" cy="289"');
 assert.match(validatePhase5Figures(altered,lessons).join('; '),/H1 must remain outside/);
});
test('rejects an unreviewed replacement SVG with an unapproved path',()=>{
 const altered=structuredClone(lessons);
 altered['A1.2'].assets.find(a=>a.id==='a12-nucleosome').src='/biology/nucleic-acids/other.svg';
 assert.match(validatePhase5Figures(files,altered).join('; '),/Invalid diagram paths/);
});
