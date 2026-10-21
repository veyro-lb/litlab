"""Restore the 28 recorded explanation consolidations; retain all assessed content and skills."""
import json
from pathlib import Path
for slug in ['enzymes-metabolism','homeostasis']:
    path=Path('src/biology/learning')/slug/'lesson.json'
    lesson=json.loads(path.read_text())
    for section in lesson['sections']:
        section['teachingBlocks']=section['teachingBlocks'][:2]
        uid=section['understandingIds'][0]
        if uid=='C1.1.10':
            section['teachingBlocks'][1]['explanation']='The textbook figure compares two pathways with identical reactant and product energy levels. Measure activation energy vertically from the reactant level to each peak: the catalysed barrier is lower. The horizontal axis represents reaction progress, not elapsed time. In the separate numerical worked example, reactants are at 20, products at 0, and the peaks at 90 and 55 kJ mol⁻¹. The barriers are therefore 70 and 35 kJ mol⁻¹, while both net energy differences are −20 kJ mol⁻¹. Those invented values are for calculation practice; they are not measurements read from the textbook figure.'
        if uid=='C1.1.15':
            section['teachingBlocks'][0]['explanation']='A competitive inhibitor binds reversibly to the active site, competing with the substrate and preventing substrate binding while it occupies that site. Raising substrate concentration increases the chance that substrate binds instead, so sufficiently high substrate concentration can overcome reversible competitive inhibition. Compare rates at the same substrate concentration and keep enzyme concentration, pH and temperature constant.'
        if uid=='C1.1.17':
            section['teachingBlocks'][0]['explanation']='Penicillin inhibits bacterial transpeptidase enzymes that form peptide cross-links in peptidoglycan cell walls. The enzyme reacts with penicillin, producing a chemically changed, inactive active site. This mechanism-based inhibition is effectively irreversible: adding more substrate does not simply displace the bound inhibitor. Growing bacteria then form weaker walls and become vulnerable to osmotic damage; human cells have no peptidoglycan wall.'
        if uid=='D3.3.7':
            section['teachingBlocks'][0]['explanation']='Excretion removes waste products of metabolism, such as urea. Osmoregulation maintains the osmotic concentration of body fluids by regulating the balance of water and dissolved substances. The kidneys perform both roles through filtration, selective reabsorption and adjustable water recovery. Use osmoles per litre (osmol L⁻¹) for osmotic concentration: a more concentrated solution contains more osmotically active particles per litre.'
        if uid=='D3.3.9':
            section['teachingBlocks'][0]['explanation']='The ascending limb of the loop of Henle actively transports sodium ions out of the tubular fluid and has low water permeability. This maintains a high osmotic concentration in the renal medulla. The descending limb is permeable to water, so water can leave by osmosis into the concentrated surrounding tissue.'
            section['teachingBlocks'][1]['explanation']='The concentrated medulla provides the osmotic gradient that allows water to be reabsorbed from collecting ducts when ADH increases their water permeability. Active ion transport supplies the energy link; water itself moves passively by osmosis. For this understanding, trace the causal sequence: sodium transport from the ascending limb → concentrated medulla → water reabsorption from collecting ducts.'
        section['explanation']='\n\n'.join(b['explanation'] for b in section['teachingBlocks'])
        section['claimReferences']=[dict(claim=b['explanation'],referenceIds=b['referenceIds']) for b in section['teachingBlocks']]
        for p in section.get('figurePlacements',[]):p['afterBlock']=min(p['afterBlock'],len(section['teachingBlocks'])-1)
    path.write_text(json.dumps(lesson,ensure_ascii=False,indent=2)+'\n')
