"""Original conceptual diagrams, independent geometry (no publisher artwork)."""
from pathlib import Path
from html import escape
import json
out=Path('public/biology/organelles-compartmentalization')
ink='#173d40';green='#147d6f';blue='#246da2';orange='#b14e26'
def text(x,y,s,size=22,color=ink,recall=False):return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}"'+(' data-recall-label="true"' if recall else '')+'>'+escape(s)+'</text>'
def path(d,color=green,width=4,fill='none',arrow=False):return f'<path d="{d}" stroke="{color}" stroke-width="{width}" fill="{fill}"'+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def rect(x,y,w,h,fill='#e2f0ed',stroke=green,rx=14):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
def circle(x,y,r=18,fill='#eaa862'):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{ink}" stroke-width="2"/>'
def arrow(x,y,x2,y2):return path(f'M{x} {y} L{x2} {y2}',ink,3,arrow=True)
def label(x,y,s,x2=None,y2=None):return text(x,y,s,21,recall=True)+(path(f'M{x+8} {y+8} L{x2} {y2}',ink,2) if x2 is not None else '')
fig=[]
# 1. A protocol flow, explicitly a model rather than an organelle micrograph.
s=rect(40,110,220,150)+text(58,145,'Cell homogenate',23)+text(58,185,'Disrupted cells;',20)+text(58,216,'many organelles intact',18)
s+=arrow(280,185,350,185)+rect(370,110,355,150)+text(390,147,'Centrifuge, then separate',23)+label(390,191,'Supernatant: still suspended')+label(390,230,'Pellet: sedimented material')
s+=arrow(550,275,550,335)+rect(80,350,645,125)+text(105,390,'Test fractions for several marker activities',23)+text(105,427,'Enrichment supports an inference; contamination limits it.',20)
s+=text(40,520,'NOS: a new separation technique made functional tests possible.',20)
fig.append(('From a cell to evidence of function',s,'Cells are disrupted to obtain a homogenate retaining many intact organelles. Centrifugation produces a pellet and a supernatant. Testing several markers in separated fractions supports inference of organelle function, with contamination limiting certainty. This protocol is schematic, not an image of a real experiment.'))
# 2. Two boundaries on left with a gap representing pore connecting same sides.
s=rect(40,105,370,345,'#e6f1f8',blue)+text(66,145,'NUCLEUS',24,blue)+rect(55,120,340,315,'none',blue)
s+=text(75,202,'DNA → primary RNA',23)+text(75,251,'exon A | intron X | exon B',20)+arrow(232,268,232,305)+label(90,343,'Splicing: remove intron X')+text(120,397,'mature mRNA: A–B',23)
s+=rect(389,352,36,62,'#f7faf6','#f7faf6',0)+arrow(325,382,480,382)+label(418,330,'Nuclear pore',409,357)
s+=text(482,145,'CYTOPLASM',24)+circle(570,382,36)+text(535,389,'ribosome',14)+arrow(616,382,697,382)+text(570,451,'polypeptide',20)+label(493,285,'Translation stays outside')
s+=text(45,510,'RNA is processed before cytoplasmic ribosomes read it.',21)
fig.append(('Separate the message from its translation',s,'Two nuclear-envelope membranes separate nuclear transcription and RNA processing from cytoplasmic translation. A transcript with exons A and B and intron X is spliced to mature A–B mRNA. The mRNA exits through a pore spanning both membranes and is translated by a cytoplasmic ribosome. The pore and ribosome are greatly enlarged; RNA letters denote segments, not individual bases.'))
# 3. Three bounded chambers; no pretend phagocytosis micrograph.
s=text(40,140,'1  Engulf',23)+text(310,140,'2  Fuse',23)+text(568,140,'3  Digest',23)
for x in [135,395,655]:s+=circle(x,275,87,'#e2f0ed')
s+=rect(104,262,63,25,'#ce7570',orange,10)+label(50,410,'Phagocytic vacuole',100,359)+text(65,450,'Bacterium enclosed',18)
s+=circle(343,182,27,'#f8d1a6')+text(315,189,'enzymes',12)+arrow(350,213,374,242)+rect(364,262,63,25,'#ce7570',orange,10)+label(300,410,'Lysosome fusion',365,344)
s+=text(622,264,'pH ≈ 5',19)+''.join(circle(x,y,5,'#ce7570') for x,y in [(628,295),(654,307),(676,286),(640,316)])+label(558,410,'Phagolysosome',645,364)+text(560,450,'Acidic digestion',19)
s+=arrow(231,276,292,276)+arrow(489,276,549,276)+text(45,510,'All three spaces are separated from surrounding cytosol.',21)
fig.append(('Contain the particle and control its chemistry',s,'An engulfed bacterium is enclosed in a membrane-bounded phagocytic vacuole. A lysosome supplies digestive enzymes by fusion. The resulting phagolysosome has acidic conditions favourable to acid hydrolases, while the cytosol remains outside its membrane. Circles represent compartments at successive times, not three stages inside one continuous organelle. pH is an approximate typical value.'))
# 4. Actual continuous inner membrane cross-section and functional lower inset.
s='<ellipse cx="400" cy="226" rx="324" ry="112" fill="#dcecf5" stroke="'+blue+'" stroke-width="5"/>'
d='M125 200 Q146 145 214 148 L236 148 L236 233 Q236 260 254 260 Q272 260 272 233 L272 148 L326 148 L326 233 Q326 260 344 260 Q362 260 362 233 L362 148 L416 148 L416 233 Q416 260 434 260 Q452 260 452 233 L452 148 L506 148 L506 233 Q506 260 524 260 Q542 260 542 233 L542 148 L586 148 Q670 161 676 226 Q670 306 580 309 L214 309 Q127 306 125 240 Z'
s+=path(d,orange,5,'#fff0dd')+label(75,96,'Outer membrane',140,146)+label(447,96,'Intermembrane space',595,142)+label(285,204,'Matrix')+label(281,362,'Cristae: continuous inner membrane',344,260)
s+=rect(60,402,680,110,'#eff5f2',ink)+text(80,431,'INNER MEMBRANE: FUNCTIONAL INSET',17)+label(80,475,'Matrix → H+ pump → intermembrane space')+label(80,502,'Matrix ← H+ through ATP synthase ← intermembrane space')
fig.append(('Mitochondria: area, spaces and direction',s,'An outer membrane surrounds a folded, continuous inner membrane. The matrix is enclosed by the inner membrane. Intermembrane space lies between outer and inner membranes and extends into crista spaces. Respiratory H+ pumping proceeds from matrix toward intermembrane space; ATP-producing return through inner-membrane ATP synthase is toward matrix. Matrix contains Krebs-cycle enzymes and substrates. The lower inset describes direction, not actual membrane position or scale.'))
# 5. Closed thylakoids distinct from envelope, connecting lamellae schematic omitted explicitly.
s='<ellipse cx="400" cy="260" rx="330" ry="155" fill="#e3eee2" stroke="'+green+'" stroke-width="5"/><ellipse cx="400" cy="260" rx="311" ry="136" fill="#f4f7dd" stroke="'+green+'" stroke-width="4"/>'
for x in [175,445]:
 for y in [212,244,276]:s+=rect(x,y,170,25,'#c7e5c5',green,10)
s+=label(90,88,'Two envelope membranes',158,159)+label(460,172,'Stroma',598,204)+label(93,360,'Thylakoid lumen',212,256)+label(450,363,'Thylakoid membrane',510,301)+text(230,432,'Separate internal membrane system',19)
s+=rect(60,440,680,84,'#eff5f2',ink)+label(80,474,'H+ return: lumen → ATP synthase → stroma')+text(80,505,'Calvin cycle: enzymes and substrates in stroma',21)
fig.append(('Chloroplasts: a separate thylakoid system',s,'Two envelope membranes enclose stroma. Closed thylakoids, drawn as two simplified grana, are separate from the envelope. Their membranes contain photosystems; their small lumens accumulate H+. Return through thylakoid ATP synthase proceeds from lumen toward stroma. The stroma contains Calvin-cycle enzymes and substrates. Stromal lamellae connecting grana are omitted to keep compartment boundaries clear; no scale is implied.'))
# 6. Cross-section topology: pore gap through both membranes.
s=text(70,115,'CYTOPLASM',23)+text(70,310,'NUCLEOPLASM',23,blue)
for y in [165,222]:
 s+=path(f'M55 {y} H340 M420 {y} H720',blue,12)
s+=rect(332,152,16,83,'#f3b977',orange,2)+rect(412,152,16,83,'#f3b977',orange,2)+path('M380 130 V274',ink,3,arrow=True).replace('marker-end=', 'marker-start="url(#arrow)" marker-end=')
s+=label(465,119,'Nuclear pore spans both',420,160)+label(65,204,'Perinuclear space')+text(470,272,'RNA out / proteins in',20)
s+=text(60,376,'Open division: envelope disassembles',23)+arrow(370,391,370,428)+''.join(rect(x,445,56,36,'#e6f1f8',blue,14) for x in [125,240,355,470,585])+text(80,520,'Membrane fragments / ER-associated material; later reassembly',20)
fig.append(('Selective exchange, then access for division',s,'A local section shows two nuclear-envelope membranes separated by perinuclear space. A nuclear pore complex spans a gap through both and regulates RNA export and protein import. In open mitosis or meiosis, envelope breakdown permits spindle access to chromosomes; membrane fragments and ER-associated material later contribute to reassembly. Membranes are thick strokes, each representing a bilayer; pore size and fragmentation are schematic. ER continuity is explained in text but not drawn here.'))
# 7. RER section ribosome on top outside lumen and polysome upper.
s=text(55,120,'FREE POLYSOME IN CYTOSOL',22)+path('M70 170 Q140 152 230 170 T390 170',blue,4)
for x in [130,245,350]:s+=circle(x,168,22)+path(f'M{x} 190 q10 20 22 12 q8 -4 15 12',orange,4)
s+=label(490,168,'mRNA + ribosomes')+text(55,250,'Example: a cytosolic enzyme',21)
s+=rect(65,355,655,125,'#e6f1f8',blue)+label(95,441,'ER lumen')+text(55,320,'CYTOSOL',21)+circle(380,350,28)+path('M335 316 H425',blue,4)+path('M380 375 L380 401 q18 12 29 0 q15 -10 24 14',orange,4)+label(470,338,'ER-bound ribosome',405,350)+label(430,448,'Growing secretory chain',420,411)
s+=text(65,524,'Ribosomes stay cytosolic; the targeted chain enters ER.',21)
fig.append(('Same ribosome machinery, different protein routes',s,'A free polysome consists of several cytosolic ribosomes translating one mRNA, producing separate polypeptide chains. In the lower panel a translating ribosome sits on the cytosolic face of rough ER and the growing targeted polypeptide enters the lumen through membrane machinery. Ribosomes are not inside the ER. The schematic shows location and destination, not molecular structure, a measured chain length or individual membrane lipids.'))
# 8. Vertical stack plus ER/vesicle topology named direction no arrow across cisternae literal.
s=rect(40,190,170,160,'#e6f1f8',blue)+label(64,263,'Rough ER')+circle(90,186,13)+circle(145,186,13)+circle(268,270,24,'#e6f1f8')+arrow(220,270,235,270)+arrow(300,270,345,270)
for x in [365,410,455,500]:s+=rect(x,185,26,170,'#e2f0ed',green,12)
s+=label(365,137,'Golgi cisternae')+text(345,405,'cis → processing → trans',18)+arrow(555,270,591,270)+circle(631,270,30,'#e2f0ed')+label(570,360,'Secretory vesicle',631,305)
s+=text(60,470,'Functional cargo route: ER → Golgi → secretory vesicles',22)+text(60,510,'Then membrane fusion releases lumenal cargo outside the cell.',20)
fig.append(('Process and sort after translation',s,'Secretory cargo enters rough ER, travels in membrane carriers toward the cis region of the Golgi, undergoes processing and sorting across Golgi compartments, and leaves from the trans region in secretory vesicles. A later fusion with plasma membrane releases lumenal cargo. The drawing is a functional route: cisternae and carriers are dynamic, and the image does not prescribe one microscopic mechanism of intra-Golgi transport or exclude recycling traffic.'))
# 9. Inward pit; outside above, cytosol below; coat outside invagination.
s=text(55,120,'OUTSIDE CELL',23)+text(55,405,'CYTOSOL',23)
s+=path('M45 205 H225 Q250 205 250 245 Q250 335 330 335 Q410 335 410 245 Q410 205 435 205 H755',blue,9)
s+=circle(330,250,17,'#ce7570')+text(302,255,'cargo',13)+path('M330 268 V320',orange,5)
# Cytosolic coat follows convex underside and sides, safely outside membrane.
s+=path('M227 249 Q220 357 330 360 Q440 357 433 249',orange,9)+label(495,318,'Clathrin: cytosolic coat',430,334)+label(80,173,'Receptor binds cargo',330,294)
s+=arrow(470,433,560,433)+circle(635,433,55,'#e6f1f8')+circle(635,433,14,'#ce7570')+label(80,474,'Scission → uncoating → delivery')+text(70,522,'External cargo becomes lumenal; the coat never enters the lumen.',20)
fig.append(('A coat on the cytosolic face',s,'The plasma membrane invaginates inward around external cargo bound to a receptor. Clathrin is shown along the cytosolic convex surface of the pit, outside the future lumen; adaptors connect coat to cargo receptors but are not individually resolved. Scission produces a coated vesicle, then the coat is removed before downstream fusion. The final circle shows an uncoated vesicle with lumenal cargo. Other scission and targeting machinery is omitted.'))
lesson=json.loads(Path('src/biology/learning/organelles-compartmentalization/lesson.json').read_text())
for i,(title,body,alt) in enumerate(fig,1):
 # B2.2.3–5 and B2.2.8 were manually redrawn and visually reviewed in
 # October 2026. Never overwrite their SVG or mobile/recall variants with
 # the older draft generator; update the original editable assets directly.
 if i in (3,4,5,8):
  assert (out/f'organelle-{i}.svg').exists(), f'Missing curated SVG: {i}'
  assert (out/f'organelle-{i}-mobile.svg').exists(), f'Missing curated mobile SVG: {i}'
  continue
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-labelledby="title desc"><title id="title">B2.2.{i}: {escape(title)}</title><desc id="desc">{escape(alt)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="{ink}"/></marker></defs><rect width="800" height="560" rx="18" fill="#f7faf6"/><g font-family="Arial, sans-serif">{text(30,45,title,28)}{text(30,75,'Original conceptual schematic · not to scale',16)}{body}</g></svg>'''
 (out/f'organelle-{i}.svg').write_text(svg)
 import re
 recall=re.sub(r'<text[^>]*data-recall-label="true"[^>]*>.*?</text>','',svg)
 (out/f'organelle-{i}-recall.svg').write_text(recall)
 a=lesson['assets'][i-1];a['alt']=alt;a['captionTitle']=title;a['attribution']='Original BioLab schematic, 2026; no publisher figure reproduced';a['permissionEvidence']='Original SVG geometry authored for this redesign. No external images, traces or embedded raster content.'
Path('src/biology/learning/organelles-compartmentalization/lesson.json').write_text(json.dumps(lesson,indent=2,ensure_ascii=False)+'\n')
