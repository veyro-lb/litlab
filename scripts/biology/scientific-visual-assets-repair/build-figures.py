from pathlib import Path
import html,textwrap
ROOT=Path(__file__).resolve().parents[3] / 'public/biology'
INK='#163d48';TEAL='#147d83';BLUE='#316aaf';RED='#b84c6f';GOLD='#a87013';GREEN='#4c8759'
def text(x,y,s,size=22,fill=INK,anchor='start',weight=400):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}">{html.escape(s)}</text>'
def lines(x,y,s,width=40,size=21,fill=INK,anchor='start'):
 return ''.join(text(x,y+i*(size+7),v,size,fill,anchor) for i,v in enumerate(textwrap.wrap(s,width)))
def rect(x,y,w,h,fill='#e5f3ef',stroke='#86ada8',r=12):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def path(d,color=TEAL,width=3,arrow=False):return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"'+(f' marker-end="url(#{color[1:]})"' if arrow else '')+'/>'
def box(x,y,w,h,title,sub='',color='#e5f3ef'):
 return rect(x,y,w,h,color)+text(x+w/2,y+31,title,22,anchor='middle',weight=600)+(text(x+w/2,y+60,sub,20,anchor='middle') if sub else '')
def circle(x,y,r,fill):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'
def save(topic,name,title,desc,body,h=740,w=600):
 defs=''.join(f'<marker id="{c[1:]}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="{c}"/></marker>' for c in [TEAL,BLUE,RED,GOLD,GREEN])
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{html.escape(title)}</title><desc id="desc">{html.escape(desc)}</desc><defs>{defs}</defs><rect width="{w}" height="{h}" rx="12" fill="#fbfdfb"/><g font-family="Arial, sans-serif">'+text(28,40,title,25,weight=700)+body+'</g></svg>'
 p=ROOT/topic/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(svg)
# Genuine closed Krebs cycle; only prescribed names, no unsupported ATP-yield claim.
b=text(28,76,'Mitochondrial matrix · one acetyl group per turn',20)
b+=box(50,126,220,77,'Oxaloacetate','4C')+box(334,126,220,77,'Citrate','6C')
b+=path('M272 163H329',arrow=True)+text(301,111,'+ acetyl 2C',20,anchor='middle')
b+=path('M444 208V278',arrow=True)+box(334,286,220,77,'5C intermediate')
b+=text(306,244,'CO₂',22,RED,anchor='end')+text(306,273,'NADH',21,BLUE,anchor='end')
b+=path('M444 368V438',arrow=True)+box(334,446,220,77,'4C intermediates')
b+=text(306,403,'CO₂',22,RED,anchor='end')+text(306,432,'NADH',21,BLUE,anchor='end')
b+=path('M330 485H159V209',arrow=True)+text(145,371,'Regeneration',20,anchor='middle')
b+=text(170,552,'ATP + NADH + FADH₂',21,BLUE)
b+=rect(28,585,544,117)+text(48,618,'Per turn: 2 CO₂, 3 NADH, 1 FADH₂',22,weight=600)+text(48,650,'and 1 ATP equivalent. Four oxidations.',21)+text(48,681,'Two turns per glucose. CoA recycled.',20)
save('cell-respiration','krebs-cycle.svg','Krebs cycle: carbon returns to 4C','Acetyl 2C joins oxaloacetate 4C to make citrate 6C. Two decarboxylations form 4C intermediates; oxidation regenerates oxaloacetate. Per turn: two CO2, three NADH, one FADH2 and one ATP equivalent. Intermediate steps grouped; not to scale.',b,730)
# Membrane diagram: electron pathway separate from proton arrows.
b=text(28,77,'Intermembrane space · higher H⁺ concentration',20)
b+=rect(28,92,544,122,'#e2edf8')+text(48,128,'H⁺   H⁺   H⁺   H⁺   H⁺   H⁺',25,BLUE)
b+=rect(28,214,544,90,'#c9ddd6')+text(36,332,'Matrix · lower H⁺ concentration',21)
b+=rect(90,192,120,133,'#bedfe3')+text(150,244,'Chain',21,anchor='middle')+text(150,273,'carriers',21,anchor='middle')
b+=path('M112 371V151',BLUE,4,True)+text(42,174,'H⁺',22,BLUE)
b+=rect(378,192,150,133,'#f0d5b4')+text(453,244,'ATP',22,anchor='middle')+text(453,273,'synthase',21,anchor='middle')+path('M500 150V374',GOLD,4,True)
b+=text(517,177,'H⁺',22,GOLD)+path('M416 349V397',GOLD,3,True)+text(453,427,'ATP',24,GOLD,anchor='middle')+text(363,375,'ADP + Pi',20,GOLD,anchor='end')
b+=text(35,452,'Electron flow (not proton movement):',22,weight=600)
b+=box(30,473,156,70,'NADH → NAD⁺')+path('M191 508H223',arrow=True)+box(232,473,145,70,'Carriers')+path('M382 508H414',arrow=True)+box(424,473,146,70,'O₂ → H₂O')
b+=lines(30,584,'Electron transfer releases energy for proton pumping from matrix to intermembrane space.',42)
b+=lines(30,680,'Proton return through ATP synthase drives phosphorylation. No fixed ATP-per-NADH yield.',42)
save('cell-respiration','mitochondrial-chemiosmosis.svg','Chemiosmosis in mitochondria','Original model: electron transport pumps protons from matrix to intermembrane space; protons return to matrix through ATP synthase. Electrons supplied by NADH pass to oxygen, which forms water. Proton and electron pathways shown separately; membrane complexes grouped.',b,780)
# Light reactions, explicitly connected electron chain, H pumping separate.
b=text(28,77,'STROMA · ATP and NADPH made on this side',20)
b+=text(48,118,'Light',21,GOLD)+path('M91 128L126 177',GOLD,3,True)+text(310,118,'Light',21,GOLD)+path('M350 128L383 177',GOLD,3,True)
b+=rect(28,188,544,91,'#c9ddd6')
for x,w,label in [(65,98,'PSII'),(219,114,'Chain'),(365,98,'PSI')]:b+=rect(x,194,w,77,'#e0efed')+text(x+w/2,239,label,22,anchor='middle')
b+=path('M167 230H215',arrow=True)+path('M337 230H361',arrow=True)
b+=path('M468 231H538V153',arrow=True)+text(540,141,'e⁻',20,anchor='middle')
b+=text(358,96,'NADP⁺ → NADPH',20,BLUE)
b+=path('M277 152V336',BLUE,4,True)+text(304,318,'H⁺ pumped in',20,BLUE)
b+=text(28,382,'LUMEN · H⁺ accumulates here',22,weight=600)
b+=text(35,317,'2 H₂O',20)+path('M92 301V276',arrow=True)+text(35,350,'O₂ + 4 H⁺ + 4 e⁻',20)+text(35,410,'Water splitting replaces electrons lost by PSII.',20)
b+=rect(28,443,544,74,'#c9ddd6')+rect(191,423,211,111,'#f0d5b4')+text(296,472,'ATP synthase',22,anchor='middle')+text(296,502,'H⁺ flows out',21,GOLD,anchor='middle')
b+=text(28,558,'Lumen',20)+path('M440 561V403',GOLD,4,True)+text(458,413,'Stroma',20)+text(458,448,'H⁺',22,GOLD)
b+=text(30,610,'ADP + Pi → ATP on the stroma side',23,GOLD)
b+=lines(30,654,'Chain carriers transfer electrons from PSII to PSI. Light excites electrons at both photosystems.',43)
save('photosynthesis','thylakoid-chemiosmosis.svg','Light reactions: two linked pathways','Linear electron transport model. Water is split at PSII on the lumen side; electrons pass through carriers to PSI then support reduction of NADP on the stroma side. Proton pumping into lumen and proton return via ATP synthase are distinct from electron flow. Bottom inset separates ATP synthase orientation; not a second membrane.',b,730)
# Calvin true cycle, 3 CO2 accounting.
b=text(28,76,'Chloroplast stroma · accounting for 3 CO₂',21)
b+=box(173,109,253,77,'3 RuBP','3 × 5C = 15C')+text(30,214,'+ 3 CO₂',23,RED)+path('M300 190V244',arrow=True)+text(329,222,'Rubisco',21)
b+=box(173,252,253,77,'6 GP','6 × 3C = 18C')+path('M300 334V394',arrow=True)
b+=text(330,358,'6 ATP',21,GOLD)+text(330,384,'6 NADPH',21,BLUE)
b+=box(173,402,253,77,'6 TP','6 × 3C = 18C')
b+=path('M432 440H537V532',arrow=True)+text(435,567,'1 TP exits',22,weight=600)+text(435,596,'3C net gain',20)
b+=path('M300 484V546',arrow=True)+box(173,554,253,77,'5 TP','5 × 3C = 15C')
b+=path('M168 593H112V147H166',arrow=True)+text(31,383,'3 ATP',22,GOLD)+text(31,415,'for RuBP',18)+text(31,442,'regeneration',18)
b+=lines(30,679,'GP = glycerate 3-phosphate; TP = triose phosphate. Net 1 TP uses 9 ATP and 6 NADPH.',45,20)
save('photosynthesis','calvin-carbon.svg','Calvin cycle: fixation to regeneration','Three CO2 add to three RuBP to give six GP, reduced using six ATP and six NADPH to six TP. One TP leaves; five TP plus three ATP regenerate three RuBP. Original accounting model; no direct formation of glucose from a single turn.',b,742)
# Replication enzymes: clear bacterial staged fragment not misleading fork geometry
b=text(28,77,'Bacterial lagging strand · one fragment at a time',20)
for i,(title,sub) in enumerate([('1 · Primase','makes an RNA primer'),('2 · DNA polymerase III','adds DNA to the primer’s 3′ end'),('3 · DNA polymerase I','replaces RNA primer with DNA'),('4 · DNA ligase','seals the remaining backbone nick')]):
 y=103+i*137;b+=text(30,y+21,title,23,weight=600)+text(30,y+51,sub,20)
 if i<2:b+=path(f'M80 {y+88}H180',RED,9)+(path(f'M184 {y+88}H502',TEAL,9) if i==1 else '')
 else:b+=path(f'M80 {y+88}H{285 if i==2 else 502}',TEAL,9)+(path(f'M299 {y+88}H502',TEAL,9) if i==2 else '')
 b+=text(44,y+96,'5′',20)+text(200 if i==0 else 529,y+96,'3′',20)
 if i<3:b+=path(f'M300 {y+105}V{y+125}',arrow=True)
b+=text(30,682,'RNA primer',21,RED)+text(220,682,'New DNA',21,TEAL)+text(30,716,'All DNA extension is 5′ → 3′. Stages are simplified.',20)
save('dna-replication','bacterial-replication-enzymes.svg','Replication enzymes divide the work','Prokaryotic model: primase lays RNA primer; DNA polymerase III extends DNA 5 prime to 3 prime; DNA polymerase I replaces primer with DNA; ligase seals phosphodiester backbone nicks. Each horizontal strip is a successive state of one fragment, not a replication fork.',b,740)
# Translation: tRNA and ribosome spatial diagram plus state transition
b=text(28,77,'mRNA is read 5′ → 3′; chain grows N → C',21)
b+=rect(107,166,397,227,'#e2edf8',BLUE,65)+text(300,198,'Ribosome',22,BLUE,anchor='middle')
b+=text(212,235,'P site',21,anchor='middle')+text(383,235,'A site',21,anchor='middle')
b+=path('M214 266V315',RED,6)+path('M385 266V315',GOLD,6)+text(214,340,'UAC',22,RED,anchor='middle')+text(385,340,'GGC',22,GOLD,anchor='middle')
b+=path('M31 365H562',TEAL,4,True)+text(32,401,'5′',22)+text(558,401,'3′',22)+text(214,373,'AUG',23,anchor='middle',weight=700)+text(385,373,'CCG',23,anchor='middle',weight=700)
for x in [134,160,186,212]:b+=circle(x,263,10,RED)
b+=circle(385,263,11,GOLD)+path('M238 262H363',BLUE,3,True)+text(298,294,'Transfer',19,BLUE,anchor='middle')
b+=text(40,140,'Growing chain on tRNA',20,RED)+text(348,140,'Next amino acid',20,GOLD)
b+=lines(30,451,'1. A charged tRNA pairs its anticodon with the next mRNA codon in the A site.',44)
b+=lines(30,549,'2. A peptide bond transfers the growing chain from the P-site tRNA to the A-site amino acid.',44)
b+=lines(30,651,'3. Ribosome moves one codon toward 3′. Empty tRNA exits; loaded tRNA moves to P.',44)
b+=text(30,758,'Codon example AUG–CCG is illustrative. Not to scale.',19)
save('protein-synthesis','translation-elongation.svg','Translation: pair, join, move','An illustrative ribosome with P and A sites on mRNA reading 5 prime AUG CCG 3 prime. tRNA anticodons are displayed antiparallel. The polypeptide transfers from P to A, then translocation moves the ribosome one codon toward mRNA 3 prime. E site and initiation factors omitted.',b,790)
# alternative splicing blocks
b=text(28,77,'One gene · different mature mRNA products',21)
colors=[BLUE,TEAL,RED]
for i,c in enumerate(colors):b+=rect(50+i*181,135,134,58,c,c)+text(117+i*181,173,f'Exon {i+1}',21,'#fff',anchor='middle')
b+=path('M187 164H227',width=4)+path('M368 164H408',width=4)+text(208,118,'intron',17,anchor='middle')+text(389,118,'intron',17,anchor='middle')
b+=path('M184 215L159 301',arrow=True)+path('M416 215L442 467',arrow=True)
b+=text(30,284,'Splicing pattern A',23,weight=600)
for i,c in enumerate(colors):b+=rect(50+i*160,309,145,58,c,c)+text(122+i*160,347,f'Exon {i+1}',21,'#fff',anchor='middle')
b+=text(30,452,'Splicing pattern B',23,weight=600)
for i,(c,n) in enumerate([(BLUE,1),(RED,3)]):b+=rect(130+i*174,483,155,58,c,c)+text(207+i*174,521,f'Exon {n}',21,'#fff',anchor='middle')
b+=lines(30,602,'Introns are removed in both products. Exon 2 is included in A and skipped in B.',43)
b+=lines(30,683,'Different exon combinations can encode different protein variants. Simplified model.',43)
save('protein-synthesis','alternative-splicing.svg','Alternative splicing selects exons','Original three-exon pre-mRNA model: all introns removed; mature mRNA A retains exons 1 2 3 whereas B retains exons 1 and 3. This is a conceptual example, not a named gene.',b,760)
# crossing over: homolog pairs sister chromatids not X ambiguous
b=text(28,77,'Prophase I · paired homologous chromosomes',21)
b+=text(115,113,'Homologue A',21,BLUE,anchor='middle')+text(438,113,'Homologue B',21,RED,anchor='middle')
for x,c in [(85,BLUE),(145,BLUE),(410,RED),(470,RED)]:b+=path(f'M{x} 145V293',c,12)+circle(x,215,9,INK)
b+=path('M157 263C240 320 314 320 398 263',GOLD,3,True)+path('M398 240C314 183 240 183 157 240',GOLD,3,True)+text(290,345,'Non-sister chromatids exchange',21,anchor='middle')+text(290,375,'equivalent DNA segments',21,anchor='middle')
b+=path('M300 395V444',arrow=True)
for x,c,tail in [(85,BLUE,BLUE),(145,BLUE,RED),(410,RED,BLUE),(470,RED,RED)]:b+=path(f'M{x} 467V573',c,12)+path(f'M{x} 581V632',tail,12)+circle(x,530,9,INK)
b+=text(28,680,'Two chromatids are recombinant; two unchanged.',21)+text(28,715,'Chromosome number is unchanged by crossing over.',20)
save('cell-nuclear-division','crossing-over.svg','Crossing over exchanges DNA','Paired replicated homologues each have two sister chromatids. An equivalent distal segment exchanges between one chromatid of each homologue, yielding two recombinant and two non-recombinant chromatids. Centromeres shown as dark dots; chromosomes spread for clarity. Not sister chromatid exchange.',b,740)
# meiosis separate number model using rods/X four gametes, helpful independent assortment can draw 2 alternatives
b=text(28,77,'Two homologous pairs · 2n = 4',21)
# X chromosomes blue red with second pair shorter
for x,c,h in [(100,BLUE,65),(220,RED,65),(375,BLUE,42),(495,RED,42)]:
 b+=path(f'M{x-16} 127L{x+16} {127+h}M{x+16} 127L{x-16} {127+h}',c,7)
b+=text(30,234,'Meiosis I: homologues separate',23,weight=600)
b+=path('M160 201L145 265',arrow=True)+path('M445 201L455 265',arrow=True)
for offset in [0,310]:
 b+=rect(35+offset,277,220,112,'#eef4f7')
 for x,c,h in [(105+offset,BLUE if offset==0 else RED,60),(185+offset,RED if offset==0 else BLUE,40)]:b+=path(f'M{x-12} 299L{x+12} {299+h}M{x+12} 299L{x-12} {299+h}',c,7)
b+=text(30,441,'Meiosis II: sister chromatids separate',23,weight=600)
for j in range(4):
 x=27+j*145;b+=path(f'M{145 if j<2 else 455} 394L{x+55} 484',arrow=True)+rect(x,494,111,107,'#eef4f7')
 b+=path(f'M{x+35} 516V577',BLUE if j<2 else RED,7)+path(f'M{x+75} 528V565',RED if j<2 else BLUE,7)
b+=text(30,648,'Four haploid products · each n = 2',22,weight=600)
b+=lines(30,691,'One possible orientation is shown. Independent orientation of each pair gives 2ⁿ combinations before crossing over.',44,20)
save('cell-nuclear-division','meiosis-separation.svg','Meiosis: one replication, two divisions','Original 2n=4 model: replicated homologous pairs segregate in meiosis I; sister chromatids separate in meiosis II to four n=2 products. Two parental origins blue/red. One orientation shown, with possible combinations 2 to the n before crossing over. Crossing over not depicted in this separate counting model.',b,770)
# saltatory no misleading impulse physically jumping
b=text(28,77,'Myelin insulates internodes; nodes regenerate impulses',19)
b+=text(50,143,'Axon interior',21)+path('M30 223H570',BLUE,4)+path('M30 312H570',BLUE,4)
for x in [35,216,397]:b+=rect(x,188,132,34,'#f0d5b4',GOLD)+rect(x,314,132,34,'#f0d5b4',GOLD)
b+=text(55,377,'Myelin',21,GOLD)+text(185,176,'Node',21,anchor='middle')+text(365,176,'Node',21,anchor='middle')
b+=path('M184 188V257',RED,4,True)+text(184,123,'Na⁺ in',20,RED,anchor='middle')
b+=path('M196 273H353',TEAL,4,True)+text(277,301,'Local current',19,TEAL,anchor='middle')+path('M367 190V256',RED,4,True)
b+=path('M185 405Q276 365 365 405',arrow=True)+text(279,447,'Direction of propagation',22,anchor='middle')
b+=lines(30,500,'1. Na⁺ entry depolarizes an active node. Local current spreads inside the axon beneath the myelin.',43)
b+=lines(30,599,'2. The next node reaches threshold and regenerates an action potential. Refractoriness limits backward re-excitation.',43)
b+=text(30,724,'The action potential does not physically leap a gap.',20)
save('neural-signalling','saltatory-conduction.svg','Saltatory conduction at nodes','Axon membrane under myelin with gaps at nodes of Ranvier. Sodium influx at an active node creates local current spreading under myelin; the next node regenerates the action potential. Refractory membrane limits backward propagation. Not an electrical spark jumping through space; schematic.',b,755)
# phloem pressure flow paired columns
b=text(28,77,'One source-to-sink pathway · direction follows demand',19)
b+=rect(65,135,136,436,'#e2edf8',BLUE)+rect(365,135,154,436,'#e2f2e8',GREEN)
b+=text(133,117,'Xylem',23,BLUE,anchor='middle')+text(442,117,'Phloem',23,GREEN,anchor='middle')
b+=path('M210 202H353',BLUE,4,True)+text(282,185,'H₂O',22,BLUE,anchor='middle')
b+=text(365,167,'High pressure',19,GREEN)+path('M443 237V451',GREEN,6,True)+text(452,331,'Sap',22,GREEN)
b+=path('M355 509H212',BLUE,4,True)+text(282,493,'H₂O',22,BLUE,anchor='middle')+text(365,552,'Lower pressure',19,GREEN)
b+=text(32,614,'SOURCE: sucrose loading lowers water potential.',20)+text(32,645,'Water enters from xylem; pressure rises.',20)+text(32,684,'SINK: sucrose unloading; water can return.',20)+text(32,715,'Bulk flow follows the hydrostatic pressure gradient.',20)
b+=text(531,207,'Sugar',18,GREEN,anchor='middle')+path('M569 229H525',GREEN,3,True)+text(531,475,'Sugar',18,GREEN,anchor='middle')+path('M525 454H568',GREEN,3,True)
save('transport','phloem-pressure-flow.svg','Phloem: pressure drives bulk flow','Original pressure-flow model. Sucrose loading at source lowers phloem water potential so water enters from xylem and raises hydrostatic pressure. Sap flows toward lower pressure at a sink, where unloading allows water to return to xylem. Separate sieve tubes can transport in different directions. Not to scale.',b,750)
# root pressure
b=text(28,77,'Root: mineral uptake changes water potential',21)
b+=rect(34,130,180,367,'#f1e5d3',GOLD)+rect(351,130,212,367,'#e2edf8',BLUE)
b+=text(124,170,'Root cells',22,anchor='middle')+text(457,170,'Xylem',22,BLUE,anchor='middle')
b+=text(124,235,'Mineral ions',21,anchor='middle')+path('M224 250H341',TEAL,4,True)+text(282,218,'Active',20,anchor='middle')+text(282,292,'transport',19,anchor='middle')+text(282,324,'ATP used',19,GOLD,anchor='middle')
b+=path('M224 400H341',BLUE,4,True)+text(282,380,'H₂O',23,BLUE,anchor='middle')+text(282,439,'Osmosis',20,BLUE,anchor='middle')
b+=path('M456 447V219',BLUE,5,True)+text(457,480,'Pressure rises',20,BLUE,anchor='middle')
b+=lines(30,553,'Ion loading lowers xylem water potential. Water moves in by osmosis, producing positive root pressure.',44)
b+=lines(30,656,'Root pressure can push sap upward, but transpiration pull is the main driver in tall plants.',44)
save('transport','root-pressure.svg','Root pressure: ion loading draws water','Conceptual root-cell to xylem model: active ion loading decreases xylem water potential; osmotic water entry raises positive pressure. The root endodermal barrier is omitted for clarity. Root pressure is distinct from the transpiration-tension mechanism.',b,740)
# Henle countercurrent geometry
b=text(28,77,'Cortex above; medullary concentration rises below',20)
for y,c in [(126,'#edf5ef'),(246,'#e2eee6'),(366,'#d4e4db'),(486,'#c1d5ca')]:b+=rect(28,y,544,120,c,c,0)
b+=text(37,114,'Descending',20)+text(251,114,'Ascending',20)+text(443,114,'Collecting',20)
b+=path('M132 150V499Q132 556 212 556Q292 556 292 499V150',BLUE,20)+path('M132 170V480',INK,3,True)+path('M292 480V170',INK,3,True)
b+=path('M492 149V559',GREEN,20)+path('M492 170V539',INK,3,True)
for y in [249,369,489]:
 b+=path(f'M147 {y}H208',BLUE,3,True)+text(169,y-14,'H₂O',18,BLUE)
 b+=path(f'M307 {y}H374',GOLD,3,True)+text(328,y-14,'Na⁺',18,GOLD)
 b+=path(f'M477 {y}H411',BLUE,3,True)
b+=text(30,644,'Descending limb: water leaves by osmosis.',20,BLUE)
b+=text(30,677,'Ascending limb: Na⁺ pumped out; not water.',20,GOLD)
b+=text(30,710,'Gradient permits collecting-duct water reabsorption.',19)
b+=text(30,740,'ADH regulates collecting-duct water permeability.',19,GREEN)
save('homeostasis','loop-henle-gradient.svg','Loop of Henle builds a gradient','Countercurrent schematic with descending filtrate on left, ascending limb on right and collecting duct further right. Water exits descending limb; ascending limb pumps sodium into medulla and is water-impermeable. Increasing medullary osmotic concentration enables collecting duct water reabsorption when ADH increases permeability. No fabricated numerical gradient.',b,773)
# Full bacterial cell replaces three disconnected summary icons.
b=text(28,77,'Generalized bacterium · structures vary by species',20)
b+=rect(75,205,450,259,'#e4ead3',GREEN,120)+rect(90,222,420,225,'#eef5ed',TEAL,105)
b+=path('M525 327Q573 279 567 391Q566 447 585 466',TEAL,5)
b+=path('M195 321C178 256 297 270 326 312S437 347 404 397S289 394 260 361S164 373 195 321Z',RED,5)
for x,y in [(144,313),(170,391),(230,254),(286,409),(377,256),(463,356),(423,416),(335,246),(126,353)]:b+=circle(x,y,4,BLUE)
b+=f'<ellipse cx="388" cy="304" rx="24" ry="13" fill="none" stroke="{GOLD}" stroke-width="3"/>'
for x1,y1,x2,y2,label,tx,ty in [(144,313,45,150,'70S ribosomes',30,136),(81,271,43,192,'Cell wall',30,180),(100,405,49,508,'Plasma membrane',30,538),(273,342,280,500,'Nucleoid: DNA',223,538),(388,293,431,156,'Plasmid',411,137),(566,417,500,562,'Flagellum',411,592)]:
 b+=path(f'M{x1} {y1}L{x2} {y2}',width=1.6)+text(tx,ty,label,20)
b+=text(420,487,'Cytoplasm',20)+path('M437 467L440 425',width=1.6)
b+=lines(30,649,'No membrane-enclosed nucleus or other membrane-bound organelles. Plasmids and flagella are not universal.',43)
save('cell-structure','a22-prokaryote.svg','Prokaryotic cell: connected structures','Generalized bacterial model with peptidoglycan cell wall outside plasma membrane, cytoplasm with 70S ribosomes, DNA nucleoid not enclosed by a membrane, optional plasmid and flagellum. Not a universal set of bacterial surface structures; no Gram-negative outer membrane shown.',b,760)
# Animal-cell section with organelles placed inside one shared cell boundary.
b=text(28,77,'Animal cell section · not a photograph or a fixed layout',19)
b+=f'<ellipse cx="300" cy="340" rx="244" ry="211" fill="#eef6f3" stroke="{TEAL}" stroke-width="4"/>'
b+=f'<ellipse cx="257" cy="326" rx="76" ry="65" fill="#e4dcef" stroke="#8566a5" stroke-width="6"/>'+circle(249,330,21,'#8566a5')
for y in [223,244,265]:
 b+=path(f'M330 {y}Q390 {y-21} 449 {y+9}',TEAL,5)
 for x in [345,370,396,421]:b+=circle(x,y-4,3,BLUE)
for y in [390,412,434]:b+=path(f'M349 {y}Q390 {y+12} 432 {y-3}',GOLD,5)
for x,y in [(132,304),(183,461)]:
 b+=f'<ellipse cx="{x}" cy="{y}" rx="40" ry="24" fill="#f5e4cc" stroke="{GOLD}" stroke-width="2"/>'+path(f'M{x-22} {y}q10 -17 20 0t20 0',GOLD,2)
for x,y in [(127,373),(361,480),(419,343),(190,218),(300,467)]:b+=circle(x,y,4,BLUE)
b+=circle(453,370,16,RED)
for x1,y1,x2,y2,label,tx,ty in [(65,291,41,161,'Plasma membrane',30,136),(233,302,105,213,'Nucleus',30,193),(358,235,432,149,'Rough ER',414,128),(405,412,520,465,'Golgi apparatus',385,504),(180,460,115,551,'Mitochondrion',30,583),(300,467,298,552,'Free ribosomes',244,583),(453,370,550,358,'Lysosome',440,335)]:
 b+=path(f'M{x1} {y1}L{x2} {y2}',width=1.6)+text(tx,ty,label,20)
b+=lines(30,647,'Ribosomes on the rough ER face the cytosol. No cell wall or chloroplasts. Organelle sizes are simplified.',43)
save('cell-structure','a22-eukaryote.svg','Eukaryotic animal cell','Independent animal-cell section with plasma membrane enclosing cytoplasm, nucleus with nucleolus and nuclear envelope, rough ER with cytosolic ribosomes, Golgi stack, mitochondria with internal folds, lysosome and free ribosomes. No cell wall or chloroplast. Simplified subset; organelles not to scale.',b,753)
# Labelled neuron structure, preserving optional interactions elsewhere.
b=text(28,77,'A myelinated neuron · one simplified form',21)
b+=f'<ellipse cx="151" cy="265" rx="62" ry="65" fill="#e7deef" stroke="#8566a5" stroke-width="3"/>'+circle(151,265,20,'#8566a5')
for d in ['M105 221L70 153L40 127','M74 163L105 128','M90 249L43 215L28 172','M91 284L37 308L28 351','M114 315L78 387L40 409','M81 381L112 406']:b+=path(d,'#8566a5',4)
b+=path('M209 265H524V468',TEAL,7)
for x in [247,355,463]:b+=rect(x,240,77,50,'#f0d5b4',GOLD,18)
for d in ['M524 449L479 504','M524 468L566 509','M524 468V525']:b+=path(d,TEAL,4)
for x,y in [(479,504),(566,509),(524,525)]:b+=circle(x,y,9,TEAL)
b+=text(30,113,'Dendrites',21)+text(33,449,'Cell body',21)+path('M113 428L130 323',width=1.5)
b+=text(249,204,'Axon + myelin sheath',21)+path('M344 216V239',width=1.5)
b+=text(275,347,'Node of Ranvier',21)+path('M338 325V270',width=1.5)
b+=path('M245 382H476',BLUE,4,True)+text(246,420,'Typical signal direction',20,BLUE)
b+=text(325,570,'Axon terminals',21)+path('M467 550L483 514',width=1.5)
b+=lines(30,639,'Dendrites and cell body receive inputs. Action potentials propagate along the axon; terminals signal to target cells.',43)
save('neural-signalling','neuron-structure.svg','Neuron: receive, conduct, transmit','Simplified myelinated multipolar neuron. Branched dendrites and nucleated cell body receive signals. Axon is wrapped in separated myelin segments with nodes of Ranvier and ends in branching terminals. Arrow denotes typical information flow along axon; many neuron forms differ.',b,740)
# Preserve accurate existing bilayer drawings; improve vesicle topology only.
b=text(28,77,'Membrane bending changes which space contains cargo',18)
for y,title in [(117,'ENDOCYTOSIS: outside → vesicle'),(408,'EXOCYTOSIS: vesicle → outside')]:b+=text(30,y,title,23,weight=600)
b+=text(35,156,'Outside cell',19)+text(35,369,'Cytosol',19)
b+=path('M30 208H190Q228 208 228 245Q228 296 271 296Q315 296 315 245Q315 208 353 208H570',TEAL,5)+circle(270,254,12,GOLD)
b+=path('M357 256H401',arrow=True)+circle(461,292,39,'#dceef1')+circle(461,292,12,GOLD)
b+=text(382,358,'Internal vesicle',19)
b+=text(35,450,'Outside cell',19)+text(35,660,'Cytosol',19)
b+=circle(131,565,38,'#dceef1')+circle(131,565,12,GOLD)+path('M188 552H228',arrow=True)
b+=path('M30 493H321Q351 493 351 530Q351 570 397 570Q443 570 443 530Q443 493 478 493H570',TEAL,5)
b+=circle(397,520,12,GOLD)+path('M397 505V463',GOLD,3,True)+circle(397,447,10,GOLD)
b+=lines(30,704,'Vesicle membrane joins the plasma membrane during fusion. Cargo need not pass through a channel.',45,20)
save('membranes-transport','mechanism-13.svg','Endocytosis and exocytosis','Original membrane-topology model. Endocytosis: plasma membrane invaginates around extracellular cargo and closes to form an internal vesicle. Exocytosis: cytosolic vesicle fuses with the plasma membrane and exposes cargo to the exterior. Different successive states separated by arrows; not a channel.',b,777)
# Qualitative selection graphs with explicit axes and the same pre-selection distribution.
import math
for mobile in [False,True]:
 w=600 if mobile else 1050;h=1130 if mobile else 465
 b=text(28,78,'Dashed: before selection · solid: after selection',19)
 for i,title in enumerate(['Directional','Stabilizing','Disruptive']):
  ox=95 if mobile else 58+i*338;oy=150+i*310 if mobile else 146;gw=410 if mobile else 274;gh=184
  b+=text(ox,oy-24,title,23,weight=600)+path(f'M{ox} {oy}V{oy+gh}H{ox+gw}',INK,2)
  def gauss(x,mu,sd):return math.exp(-0.5*((x-mu)/sd)**2)/sd
  for baseline in [True,False]:
   pts=[]
   for n in range(101):
    u=n/100
    v=gauss(u,.5,.16) if baseline else (gauss(u,.72,.16) if i==0 else gauss(u,.5,.10) if i==1 else .5*gauss(u,.26,.10)+.5*gauss(u,.74,.10))
    pts.append(f'{ox+u*gw:.2f},{oy+gh-v*38:.2f}')
   b+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="{("#7c8794" if baseline else TEAL)}" stroke-width="3"'+(' stroke-dasharray="7 5"' if baseline else '')+'/>'
  b+=text(ox+gw/2,oy+gh+30,'Trait value',19,anchor='middle')
  b+=f'<text transform="translate({ox-32} {oy+gh/2}) rotate(-90)" font-size="18" fill="{INK}" text-anchor="middle">Frequency density</text>'
 b+=text(28,h-23,'Conceptual distributions; no observed data or fixed trait units.',18)
 save('natural-selection','d41-selection-patterns'+('-mobile' if mobile else '')+'.svg','Selection changes a trait distribution','Constructed equal-area distributions compare before and after selection: directional shifts the mean; stabilizing narrows around the same mean; disruptive favours extremes. Axes show trait value and frequency density. No observational dataset, fitness curve or numerical trait scale is implied.',b,h,w)
