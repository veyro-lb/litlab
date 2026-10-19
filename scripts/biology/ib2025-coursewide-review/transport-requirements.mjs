// Requirements derived from IB Biology Guide B3.2, printed pp.58–60.
// Checks required mechanisms and skills rather than a minimum number of words.
export const requirements={
 1:[/branch/i,/narrow/i,/large.*area/i,/thin|single.*layer/i,/fenestr/i],
 2:[/arter/i,/vein/i,/wall/i,/lumen/i,/micrograph/i,/away.*heart/i,/return/i],
 3:[/muscle/i,/elastic/i,/pressure/i,/stretch/i,/recoil/i],
 4:[/radial/i,/carotid/i,/fingertip/i,/beats per minute/i,/digital/i,/interval/i],
 5:[/flexible/i,/muscle/i,/valve/i,/backflow|reverse flow/i],
 6:[/coronary/i,/plaque/i,/clot/i,/oxygen/i,/correlation coefficient/i,/causation/i,/confound/i],
 7:[/evapor/i,/cell.wall/i,/capillary action/i,/tension/i,/cohe/i,/root/i],
 8:[/dead/i,/lack cell contents/i,/end walls/i,/lignif/i,/pits/i],
 9:[/epidermis/i,/cortex/i,/ring/i,/xylem/i,/phloem/i,/micrograph/i,/plan/i,/annotate/i],
 10:[/epidermis/i,/cortex/i,/central/i,/xylem/i,/phloem/i,/micrograph/i],
 11:[/pressure/i,/filtration/i,/plasma/i,/arteriole/i,/venule/i,/lymph/i],
 12:[/plasma/i,/proteins/i,/red blood cells/i,/tissue fluid/i,/cell membrane/i,/oxygen/i,/wastes/i],
 13:[/thin.walled/i,/gaps/i,/valve/i,/venous circulation/i],
 14:[/fish/i,/gill/i,/mammal/i,/right heart/i,/left heart/i,/lungs/i,/pressure/i],
 15:[/cardiac muscle/i,/pacemaker/i,/atria/i,/ventricles/i,/atrioventricular/i,/semilunar/i,/septum/i,/coronary/i,/venae cavae/i,/pulmonary veins/i,/aorta/i],
 16:[/sinoatrial/i,/left ventric/i,/pressure/i,/atrioventricular/i,/aortic/i,/systolic/i,/diastolic/i],
 17:[/actively transport mineral ions/i,/water.potential/i,/osmot/i,/positive pressure/i,/humid/i,/spring/i],
 18:[/sieve plates/i,/no nucleus/i,/reduced cytoplasm/i,/mitochondria/i,/plasmodesmata/i,/sources/i,/sinks/i]
};
export function inspectTransportRequirements(lesson){
 const errors=[];
 for(const [n,patterns] of Object.entries(requirements)){
  const id='B3.2.'+n;const s=lesson.sections.find(s=>s.understandingIds.includes(id));
  if(!s){errors.push(id+': missing required understanding');continue}
  for(const pattern of patterns)if(!pattern.test(s.explanation))errors.push(id+': missing required mechanism/skill '+pattern);
 }
 return errors;
}
