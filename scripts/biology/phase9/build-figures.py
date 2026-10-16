"""Original, reproducible Phase 9 vector repairs; no publisher artwork."""
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[3]

def text(x,y,value,size=24,weight='normal'):
    return f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="#173b54">{escape(value)}</text>'
def line(x1,y1,x2,y2):return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="#476a80" stroke-width="2"/>'
def circle(x,y,r,fill='#cce7ed'):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#326880" stroke-width="3"/>'
def ellipse(x,y,rx,ry,fill='#d3e8e5'):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="#326880" stroke-width="3"/>'
def arrow(x1,y1,x2,y2):
    return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="#326880" stroke-width="4" marker-end="url(#arrow)"/>'
def save(stem,title,geometry,labels,height=790):
    for recall in (False,True):
        head=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">Original conceptual schematic, not a micrograph or measured scale. '+('Numbered callouts support active recall.' if recall else 'Structure labels connect to functions.')+'</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#326880"/></marker></defs>'
        body=f'<rect width="640" height="{height}" fill="#f4f9fc"/>'+text(24,42,title,27,'bold')+geometry
        for i,(x,y,label) in enumerate(labels,1):body+=text(x,y,str(i)+'. '+('Recall this label' if recall else label),22)
        body+=text(24,height-22,'LitLab original · conceptual · not to scale',18)
        (ROOT/'public/biology/cell-specialization'/(stem+('-recall' if recall else '')+'.svg')).write_text(head+body+'</svg>\n')

# A stem-cell division can maintain the pool and supply a differentiating lineage.
g=circle(320,160,44)+circle(320,160,17,'#c6b5d8')+arrow(286,195,160,290)+arrow(354,195,480,290)
g+=circle(150,340,44)+circle(150,340,17,'#c6b5d8')+circle(490,340,44,'#f0dfbd')+arrow(490,388,490,495)
g+=circle(455,550,30,'#cbe4c1')+circle(525,550,30,'#cbe4c1')+arrow(110,310,210,180)
g+=text(24,650,'One possible lineage outcome; niche signals',24)+text(24,687,'can also expand or reduce the stem-cell pool.',24)
save('b23-stem','Stem cells renew and differentiate',g,[(230,95,'Stem cell'),(32,427,'Self-renewal'),(360,427,'Progenitor'),(333,617,'Differentiated cells')])

# Both muscle types contain contractile myofibrils; nuclei belong to cells.
g='<path d="M82 196 H250 L330 130 L350 157 L280 220 L350 283 L330 310 L250 244 H82 Z" fill="#efd3ce" stroke="#326880" stroke-width="3"/>'
for x in range(98,245,18):g+=line(x,199,x,240)
g+=ellipse(185,220,20,12,'#baacd0')+text(24,96,'Cardiac: short, branched cells',24,'bold')
g+=text(24,360,'Branching supports a connected tissue network.',22)
g+='<rect x="60" y="475" width="520" height="100" rx="18" fill="#efd3ce" stroke="#326880" stroke-width="3"/>'
for y in [500,525,550]:g+=line(75,y,565,y)
for x in range(85,560,20):g+=line(x,488,x,563)
for x in [115,265,435]:g+=ellipse(x,484,16,7,'#baacd0')
g+=text(24,435,'Skeletal: long, unbranched fused fibre',24,'bold')+text(24,690,'Both are striated: repeated sarcomeres in myofibrils.',22)
save('b23-muscle','Compare two striated muscle types',g,[(365,218,'Central nucleus'),(70,626,'Many peripheral nuclei'),(70,660,'One continuous cell boundary')])

# A secondary oocyte is arrested in metaphase II, without an intact nucleus.
g=text(24,95,'Sperm: transport a haploid genome',24,'bold')+ellipse(115,205,55,32,'#cce7ed')+ellipse(125,205,30,20,'#baacd0')
g+='<path d="M90 179 Q48 205 90 231" fill="none" stroke="#d9a340" stroke-width="9"/><rect x="172" y="194" width="95" height="23" rx="10" fill="#edc990" stroke="#326880" stroke-width="2"/>'
for x in range(180,260,15):g+=line(x,197,x+8,214)
g+='<path d="M267 205 C350 130 390 280 465 205 S570 185 590 217" fill="none" stroke="#326880" stroke-width="5"/>'
g+=line(73,172,73,135)+line(220,218,220,265)+line(440,216,440,265)
g+=text(24,365,'Secondary oocyte: resources for early development',23,'bold')+circle(190,525,110,'#efdfba')+circle(190,525,122,'none')
for x in [168,190,212]:g+=f'<path d="M{x-5} 515 l10 20 m0 -20 l-10 20" stroke="#79609d" stroke-width="3"/>'
g+=line(135,466,250,466)+line(135,466,190,506)+line(250,466,190,506)+line(135,580,250,580)+line(135,580,190,545)+line(250,580,190,545)
g+=line(300,497,370,475)+line(315,540,370,565)+text(24,700,'Chromosomes are haploid; meiosis II completes after fertilization.',21)
save('b23-gametes','Human gametes: structure and function',g,[(24,128,'Acrosome'),(175,298,'Midpiece'),(414,298,'Flagellum'),(360,455,'Zona pellucida'),(354,603,'Cytoplasm'),(24,665,'Metaphase II chromosomes')])
