// Original exercise metadata derived from syllabus expectations and the handout's checklist.
// No third-party illustrations are copied. Pending items never appear as available exercises.
export const exercises=Object.freeze([{
 id:'water-hydrogen-bonding',topicId:'A1.1',understandingId:'A1.1.2',assetId:'bonding',level:'shared',
 title:'Water: bonds and partial charges',handoutPage:2,
 introduction:'Identify the atoms, partial charges, and two different kinds of bonding. Then redraw the arrangement from memory.',
 drawPrompt:'Draw two bent water molecules, show their partial charges, and connect one δ+ hydrogen to a neighbouring δ− oxygen with a dashed hydrogen bond.',
 labels:[
  {id:'oxygen',name:'Oxygen atom',synonyms:['oxygen','o atom','o'],clue:'Which atom has the partial negative charge (δ−)?',function:'Oxygen attracts shared electrons more strongly and carries the partial negative charge.'},
  {id:'hydrogen',name:'Hydrogen atom',synonyms:['hydrogen','h atom','h'],clue:'Which atom has the partial positive charge (δ+)?',function:'Hydrogen has less shared electron density in an O–H bond and carries a partial positive charge.'},
  {id:'covalent',name:'Polar covalent bond',synonyms:['polar covalent bonding','polar covalent'],clue:'What kind of bond is the solid O–H link within a molecule?',function:'Within each water molecule oxygen and hydrogen share electrons unequally.'},
  {id:'hydrogen-bond',name:'Hydrogen bond',synonyms:['hydrogen bonding'],clue:'What does the dashed line between separate water molecules represent?',function:'A δ+ hydrogen is attracted to a δ− oxygen in a neighbouring water molecule.'},
  {id:'delta',name:'Partial charge (δ)',synonyms:['delta','δ','partial charges','partial charge'],clue:'What is the name or symbol for the small δ+ and δ− charges?',function:'Delta denotes an unequal distribution of electrical charge, not whole ionic charges.'}
 ],
 conventions:[
 'Each water molecule is bent rather than linear.',
 'Solid O–H bonds are within molecules; the dashed hydrogen bond is between molecules.',
 'Oxygen is δ− and hydrogen is δ+; no full ionic charges are shown.',
 'Use straight, non-crossing leader lines with complete label names.'
 ],
 availabilityEvidence:'Original BioLab bonding and bonding-recall SVGs, with source-checked geometry and labels. Asset provenance is recorded in the existing lesson.'
}]);
export const figureDependencies=Object.freeze([
 ['A1.2','DNA nucleotide',2],['A1.2','RNA nucleotide',2],['A1.2','DNA structure',2],
 ['A1.2','RNA structure',3],['A2.2','Prokaryotic cell',3],['A2.2','Animal cell',4],
 ['A2.2','Leaf palisade plant cell',5],['B1.2','Generalized amino acid',6],
 ['B1.2','Peptide-bond condensation',6],['B2.1','Fluid mosaic membrane model',6],
 ['B3.1','Dicot leaf plan section',7],['B3.2','Dicot stem plan section',7],
 ['B3.2','Dicot root plan section',7],['D3.1','Male-typical reproductive system',8],
 ['D3.1','Female-typical reproductive system',9],['D3.1','Insect-pollinated flower',10]
].map(([topicId,title,handoutPage])=>({topicId,title,handoutPage})));
export const normalizeLabel=value=>String(value??'').normalize('NFKC').toLowerCase().trim().replace(/[.(),]/g,' ').replace(/\s+/g,' ');
export function isCorrectLabel(label,answer){const value=normalizeLabel(answer);return !!value&&[label.name,...label.synonyms].some(alias=>normalizeLabel(alias)===value)}
export function availableExercises(lesson,level,sections){return exercises.filter(ex=>{
 if(lesson.topicId!==ex.topicId||(ex.level==='HL'&&level==='SL'))return false;
 if(!sections.some(s=>s.understandingIds.includes(ex.understandingId)&&s.assets.includes(ex.assetId)))return false;
 const asset=lesson.assets.find(a=>a.id===ex.assetId);
 // Explicit allowlist: no stock, unreviewed or incorrectly paired figures.
 return !!asset&&asset.level==='shared'&&asset.review==='scientific-review'&&!asset.withheldReason&&
 asset.src==='/biology/water/bonding.svg'&&asset.recallSrc==='/biology/water/bonding-recall.svg'&&
 asset.license.startsWith('Original project artwork; use under the repository')&&
 asset.permissionEvidence.includes('geometry and labels checked');
})}
