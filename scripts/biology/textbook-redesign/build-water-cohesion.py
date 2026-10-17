from pathlib import Path
import json,re
ns='http://www.w3.org/2000/svg'
def text(x,y,t,size=22,recall=True):return f'<text x="{x}" y="{y}" font-size="{size}"'+(' data-recall-label="true"' if recall else '')+'>'+t+'</text>'
def arrow(x,y,x2,y2):return f'<path d="M{x} {y} L{x2} {y2}" fill="none" stroke="#287868" stroke-width="4" marker-end="url(#tip)"/>'
def draw(mobile=False):
 w,h=(450,860) if mobile else (900,560)
 s=f'<svg xmlns="{ns}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">Cohesion: a continuous column and a deformable interface</title><desc id="desc">Original not-to-scale xylem and water-strider schematic. Evaporation generates xylem tension; cohesion helps transmit the pull along a continuous liquid column. Water-repellent legs deform an air-water interface supported by surface tension. No individual molecule count, measured force or anatomical scale is represented.</desc><defs><marker id="tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#287868"/></marker></defs><rect width="100%" height="100%" fill="#f1f7f6"/><g font-family="Arial,sans-serif" fill="#203a39">'
 s+=text(25,38,'Two effects of cohesion' if mobile else 'A pull through water; support at a surface',23,False)
 if mobile:
  s+=text(25,83,'In a xylem vessel',23)+f'<path d="M120 135 V365 M190 135 V365" fill="none" stroke="#456f68" stroke-width="7"/><path d="M124 136 H186 V365 H124 Z" fill="#a8d6df"/>'+arrow(155,311,155,176)
  s+=f'<path d="M123 135 Q80 83 152 105 Q206 85 190 135" fill="#bdddc9" stroke="#456f68" stroke-width="3"/>'+arrow(154,104,154,66)
  for y,t in [(157,'Evaporation'),(184,'at leaves'),(246,'Tension is'),(273,'transmitted'),(300,'through the'),(327,'liquid column')]:s+=text(222,y,t,18)
  s+=text(25,405,'Root water replaces water lost at the leaf.',18)+text(25,458,'At a water–air interface',23)
  s+=f'<path d="M25 657 Q65 650 94 658 Q117 685 143 658 Q213 647 286 658 Q309 685 335 658 Q375 650 425 657 L425 740 H25 Z" fill="#b5dce4" stroke="#287868" stroke-width="3"/><ellipse cx="215" cy="548" rx="39" ry="14" fill="#56685c"/><path d="M185 551 L117 656 M245 551 L309 656 M199 542 L174 510 M228 542 L254 510" fill="none" stroke="#456f68" stroke-width="4"/>'
  s+=text(25,590,'Air',18)+text(25,724,'Water',18)+text(25,783,'Water-repellent legs depress the interface.',18)+text(25,815,'Surface tension supports a small insect.',18)
 else:
  s+=text(30,92,'Xylem: evaporation generates tension',22)+f'<path d="M150 160 V432 M228 160 V432" fill="none" stroke="#456f68" stroke-width="8"/><path d="M154 160 H224 V432 H154 Z" fill="#a8d6df"/>'+arrow(189,385,189,205)
  s+=f'<path d="M154 160 Q94 92 188 119 Q267 91 224 160" fill="#bdddc9" stroke="#456f68" stroke-width="3"/>'+arrow(188,118,188,68)
  s+=text(265,220,'Cohesion helps',20)+text(265,250,'maintain a',20)+text(265,280,'continuous',20)+text(265,310,'water column.',20)+text(38,478,'Water moves from roots toward leaves.',20)
  s+=text(480,92,'Surface tension: a small habitat',22)
  s+=f'<path d="M475 345 Q508 336 540 345 Q563 371 586 345 Q652 334 718 345 Q741 371 764 345 Q818 337 870 345 L870 438 H475 Z" fill="#b5dce4" stroke="#287868" stroke-width="3"/><ellipse cx="653" cy="211" rx="42" ry="15" fill="#56685c"/><path d="M616 216 L563 344 M687 216 L741 344 M637 202 L607 166 M672 202 L701 166" fill="none" stroke="#456f68" stroke-width="4"/>'
  s+=text(485,286,'Air',18)+text(485,415,'Water',18)+text(480,479,'Water-repellent legs deform the interface.',19)
 s+=text(25,h-14,'Conceptual section · not to scale · no fixed lattice or solid surface skin',14,False)+'</g></svg>'
 return s
out=Path('public/biology/water')
for mobile in [False,True]:
 s=draw(mobile);name='cohesion'+('-mobile' if mobile else '')
 (out/(name+'.svg')).write_text(s)
 recall=re.sub('<text[^>]*data-recall-label="true"[^>]*>.*?</text>','',s)
 # Existing paths use cohesion-recall-mobile rather than cohesion-mobile-recall.
 (out/('cohesion-recall'+('-mobile' if mobile else '')+'.svg')).write_text(recall)
p=Path('src/biology/learning/water/lesson.json');l=json.loads(p.read_text());a=next(a for a in l['assets'] if a['id']=='cohesion');a['alt']='In the left panel, evaporation from a leaf generates tension transmitted down a continuous liquid xylem column. The arrow shows water flow upward from roots toward leaves; cohesion helps maintain continuity. In the right panel, water-repellent insect legs depress the water–air interface, where surface tension can support a small insect. The surface is not a solid skin. Original schematic, not to scale; no fixed molecular lattice or measured forces are depicted.';a['interpretation']='Trace water flow toward the leaf, then distinguish the pull in xylem from support at the water–air interface. Both involve cohesive interactions, but only the insect example depends on an exposed surface.'
for asset in l['assets']:
 if asset['id']=='bonding':asset['interpretation']='Find one solid O–H bond and one dashed H···O attraction. Explain why they join different combinations of atoms and molecules.'
 if asset['id']=='hydration':asset['interpretation']='Identify the water atom closest to Na+ and the atoms closest to Cl−. Use partial charges to explain both orientations.'
p.write_text(json.dumps(l,indent=2,ensure_ascii=False)+'\n')
