#!/usr/bin/env python3
"""Import original 2025 IB Biology drawings as real PDF image captures, not SVG redraws."""
import re, json, hashlib, urllib.request, tempfile
from pathlib import Path
import fitz

URL="https://www.noteworthyscience.com/_files/ugd/3ccfae_17ce2b231f2b4c6e8597f7dc87cc6ba7.pdf"
ROOT=Path(".")
PREFIX="/biology/ancient-mariner/"
CREDIT="Source: Ancient Mariner"
# (image filename, original 1-indexed PDF page, top, bottom, unique source text)
FIGS=[
("00_drawing_conventions",1,.012,.770,"drawing in ib biology"),
("01_water_molecule_hydrogen_bonding",2,.050,.318,"water molecules with"),
("02_DNA_nucleotide",2,.325,.480,"dna nucleotide"),
("03_RNA_nucleotide",2,.490,.648,"rna nucleotide"),
("04_DNA_antiparallel_pairing",2,.654,.933,"dna structure"),
("05_RNA_polymer",3,.052,.407,"rna structure"),
("06_prokaryotic_cell",3,.018,.410,"prokaryotic cell"),
("07_eukaryotic_animal_cell",4,.048,.687,"animal cell"),
("08_leaf_palisade_plant_cell",5,.048,.723,"leaf palisade plant cell"),
("09_generalized_amino_acid",6,.050,.262,"generalized amino acid"),
("10_peptide_condensation",6,.261,.459,"condensation reaction"),
("11_fluid_mosaic_membrane",6,.465,.801,"fluid mosaic"),
("12_dicot_leaf_transverse_plan",7,.051,.374,"transverse section of a dicotyledonous leaf"),
("13_dicot_stem_transverse_plan",7,.384,.690,"transverse section of a dicotyledonous stem"),
("14_dicot_root_transverse_plan",7,.696,.982,"transverse section of a dicotyledonous root"),
("15_male_reproductive_system",8,.052,.925,"male-typical reproductive system"),
("16_female_reproductive_system",9,.052,.923,"female-typical reproductive system"),
("17_insect_pollinated_flower",10,.052,.554,"insect-pollinated flower")]
SWAP={
"water":{"bonding":"01_water_molecule_hydrogen_bonding"},
"nucleic-acids":{"a12-nucleotide":"02_DNA_nucleotide","a12-paired":"04_DNA_antiparallel_pairing"},
"cell-structure":{"a22-prokaryote":"06_prokaryotic_cell","a22-eukaryote":"07_eukaryotic_animal_cell"},
"proteins":{"b12-amino":"09_generalized_amino_acid","b12-peptide":"10_peptide_condensation"},
"membranes-transport":{"b21-figure-4":"11_fluid_mosaic_membrane"},
"gas-exchange":{"b31-leaf":"12_dicot_leaf_transverse_plan"},
"reproduction":{"d31-flower-structures":"17_insect_pollinated_flower"}}
EXTRA={
"nucleic-acids":[("a12-rna-pdf","03_RNA_nucleotide","a12-2","A1.2.2"),("a12-rna-polymer-pdf","05_RNA_polymer","a12-5","A1.2.5")],
"cell-structure":[("a22-palisade-pdf","08_leaf_palisade_plant_cell","a22-8","A2.2.8"),("a22-drawing-conventions-pdf","00_drawing_conventions","a22-11","A2.2.11")],
"transport":[("b32-stem-pdf","13_dicot_stem_transverse_plan","b32-9","B3.2.9"),("b32-root-pdf","14_dicot_root_transverse_plan","b32-10","B3.2.10")],
"reproduction":[("d31-male-pdf","15_male_reproductive_system","reproduction-4","D3.1.4"),("d31-female-pdf","16_female_reproductive_system","reproduction-4","D3.1.4")]}
def normalized(s):return re.sub("[^a-z0-9]","",s.lower())
def screenshot(doc,fig):
    name,expected,y1,y2,term=fig
    matching=[i for i,page in enumerate(doc) if normalized(term) in normalized(page.get_text())]
    idx=expected-1 if expected-1 in matching else min(matching,key=lambda n:abs(n-(expected-1))) if matching else None
    if idx is None:raise RuntimeError("Missing or ambiguous PDF source drawing: "+name)
    page=doc[idx]
    print(f"Verified source match: {name} on page {idx+1}; all matches {[n+1 for n in matching]}")
    pix=page.get_pixmap(matrix=fitz.Matrix(2.3,2.3),clip=fitz.Rect(0,page.rect.height*y1,page.rect.width,page.rect.height*y2),alpha=False)
    if pix.width<800 or pix.height<150:raise RuntimeError("Bad crop for "+name)
    if name=="06_prokaryotic_cell" and "nucleoid" not in normalized(page.get_textbox(fitz.Rect(0,page.rect.height*y1,page.rect.width,page.rect.height*y2))):raise RuntimeError("Prokaryote crop lacks nucleoid label")
    return pix.tobytes("png"),idx+1
def main(pdf):
    source=fitz.open(pdf)
    if len(source)<10:raise RuntimeError("Expected source has at least 10 pages")
    imgs={k:screenshot(source,fig) for fig in FIGS for k in [fig[0]]}
    if len(imgs)!=18:raise RuntimeError("Expected 18 unique original diagrams")
    lessons={}
    for topic in sorted(set(SWAP)|set(EXTRA)):
        path=ROOT/"src/biology/learning"/topic/"lesson.json"
        lesson=json.loads(path.read_text())
        for id,media in SWAP.get(topic,{}).items():
            matching=[a for a in lesson["assets"] if a["id"]==id]
            if len(matching)!=1:raise RuntimeError("Could not match existing asset: "+id)
            asset=matching[0]
            for property in ("recallSrc","mobileSrc","recallMobileSrc"):asset.pop(property,None)
            asset.update({"src":PREFIX+media+".png","kind":"diagram","attribution":CREDIT,
             "alt":"Original labelled biological drawing from source PDF: "+media.replace("_"," "),
             "license":"External educational illustration; reuse authorized by project owner",
             "permissionEvidence":"Original watermark preserved; project owner approved publication 2026-10-18",
             "sourceUrl":URL,"review":"source-mapped"})
        for id,media,sectionid,uid in EXTRA.get(topic,[]):
            section=[s for s in lesson["sections"] if s["id"]==sectionid and uid in s["understandingIds"]]
            if len(section)!=1:raise RuntimeError("Invalid new placement "+id)
            present=[a for a in lesson["assets"] if a["id"]==id]
            if present:
                if len(present)!=1 or present[0].get("src")!=PREFIX+media+".png" or id not in section[0]["assets"]:
                    raise RuntimeError("Existing PDF asset conflicts with planned placement "+id)
                continue
            refs=section[0].get("referenceIds") or [lesson["references"][0]["id"]]
            lesson["assets"].append({"id":id,"kind":"diagram","src":PREFIX+media+".png",
             "alt":"Original hand-drawn labelled biological illustration: "+media.replace("_"," "),
             "captionTitle":media.replace("_"," "),"attribution":CREDIT,
             "license":"External educational illustration; reuse authorized by project owner",
             "permissionEvidence":"Original watermark preserved; project owner approved publication 2026-10-18",
             "referenceIds":refs,"level":"shared","review":"source-mapped","sourceUrl":URL})
            section[0]["assets"].append(id)
        for a in lesson["assets"]:
            src=a.get("src","")
            if src.startswith(PREFIX) and src[len(PREFIX):-4] not in imgs:raise RuntimeError("Uncreated image reference "+src)
        lessons[path]=json.dumps(lesson,indent=2,ensure_ascii=False)+"\n"
    # All source, image and syllabus validation completed before mutating lessons.
    folder=ROOT/"public/biology/ancient-mariner";folder.mkdir(parents=True,exist_ok=True)
    evidence=[]
    for name,(bytes_,page) in imgs.items():
        (folder/(name+".png")).write_bytes(bytes_)
        evidence.append({"path":PREFIX+name+".png","page":page,"sha256":hashlib.sha256(bytes_).hexdigest()})
    for path,content in lessons.items():path.write_text(content)
    docdir=ROOT/"docs/biology/ancient-mariner";docdir.mkdir(parents=True,exist_ok=True)
    (docdir/"SCREENSHOT_MANIFEST.json").write_text(json.dumps({"credit":CREDIT,"sourcePdf":URL,
      "sourceOriginalWatermark":"Noteworthy Science / Marier","imageCount":len(imgs),
      "lessonFiles":[str(x) for x in lessons],"images":evidence},indent=2)+"\n")
    print("IMPORTED",len(imgs),"unaltered source image screenshots into",len(lessons),"lessons")
if __name__=="__main__":
    with tempfile.TemporaryDirectory() as temp:
        file=Path(temp)/"source.pdf"
        request=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(request,timeout=90) as stream:file.write_bytes(stream.read(20000000))
        if not file.read_bytes().startswith(b"%PDF"):raise RuntimeError("Source did not return a PDF")
        main(file)
