"""Reconstruct the recorded coursewide crop pass from the owner-supplied PDF.
Run from repo root: python scripts/biology/coursewide-recheck/extract.py /path/to/Hodder.pdf
Source PDFs are never copied into public output.
"""
import argparse, hashlib, json, re
from pathlib import Path
import fitz

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('source_pdf',type=Path)
args=parser.parse_args()
batch='coursewide-recheck-20261020'
folder=Path('docs/biology')/batch
folder.mkdir(parents=True,exist_ok=True)
registry_path=Path('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json')
registry=json.loads(registry_path.read_text())
assert len(registry['figures'])==45,'Run against the verified 45-crop baseline only'
(folder/'BASELINE_45.json').write_text(json.dumps(registry,indent=2)+'\n')
plan=json.loads(Path('scripts/biology/coursewide-recheck/extraction-plan.json').read_text())
source=fitz.open(args.source_pdf)
lessons={}
records=[]
for slug,aid,figure,pdf_page,box,numbers,title,alt in plan:
    path=Path('src/biology/learning')/slug/'lesson.json'
    if slug not in lessons:lessons[slug]=json.loads(path.read_text())
    lesson=lessons[slug];topic=lesson['topicId'];page=source[pdf_page-1]
    assert figure in page.get_text(),figure
    caption=next(b[4] for b in page.get_text('blocks') if re.search(r'■\s*Figure\s+'+re.escape(figure)+r'(?!\d)',b[4]))
    caption=re.sub(r'^.*?Figure\s+'+re.escape(figure)+r'\s*','',caption,flags=re.S).strip().replace('\n',' ')
    previous=next((a for a in lesson['assets'] if a['id']==aid or (aid=='a21-protocell' and a['id']=='fatty-vesicle')),None)
    old_path=previous['src'] if previous else None
    assert not old_path or '/licensed-book-crops/' not in old_path,'Never overwrite an existing original crop'
    source_id='hodder-'+figure.lower().replace('.','')+'-recheck'
    public_path='/biology/licensed-book-crops/'+source_id+'.png'
    pix=page.get_pixmap(matrix=fitz.Matrix(300/72,300/72),clip=fitz.Rect(box),alpha=False)
    output=Path('public')/public_path.lstrip('/');pix.save(str(output))
    credit=f'Biology for the IB Diploma, Third Edition — C. J. Clegg, Andrew Davis and Christopher Talbot; Hodder Education (2023), Figure {figure}, p. {pdf_page-12} (PDF p. {pdf_page}).'
    sections=[s for s in lesson['sections'] if s['understandingIds'][0] in [topic+'.'+str(n) for n in numbers]]
    assert len(sections)==len(numbers),(figure,numbers)
    asset={**(previous or {}),'id':aid,'kind':'diagram','src':public_path,'captionTitle':title,'alt':alt,'attribution':credit,'license':'Owner-authorized textbook reproduction; source credited.','permissionEvidence':registry['ownerPermissionStatement'],'publicReproductionRights':'cleared','referenceIds':previous['referenceIds'] if previous else sections[0]['referenceIds'][:2],'level':'HL' if all(s['level']=='HL' for s in sections) else 'shared','review':'scientific-review','displaySize':'detailed'}
    for key in ['recallSrc','mobileSrc','recallMobileSrc','withheldReason','interpretation','sourceUrl','termsUrl']:asset.pop(key,None)
    if previous:lesson['assets'][lesson['assets'].index(previous)]=asset
    else:lesson['assets'].append(asset)
    for section in lesson['sections']:
        if aid in section['assets'] and section not in sections:section['assets'].remove(aid)
        if 'figurePlacements' in section:section['figurePlacements']=[p for p in section['figurePlacements'] if p['assetId']!=aid]
    placements=[]
    for section in sections:
        if aid not in section['assets']:section['assets'].append(aid)
        after=1 if aid in ['b33-sarcomere-contraction','d33-proximal-reabsorption'] else 0
        section.setdefault('figurePlacements',[]).append(dict(assetId=aid,afterBlock=after))
        placements.append(dict(lessonSectionId=section['id'],understandingId=section['understandingIds'][0],afterBlock=after))
    records.append(dict(assetId=aid,topicId=topic,lessonSlug=slug,sourceBook='Biology for the IB Diploma, Third Edition',authors=['C. J. Clegg','Andrew Davis','Christopher Talbot'],publisher='Hodder Education',edition='Third Edition (2023)',chapter=topic,figureNumber=figure,sourcePdfPage=pdf_page,printedPage=pdf_page-12,cropBoxPdfPoints=box,renderDpi=300,originalCaption=caption,placements=placements,level=asset['level'],purpose=title,sourceFigureId=source_id,source=credit,title=title,understandingId=placements[0]['understandingId'],lessonSectionId=placements[0]['lessonSectionId'],path=public_path,permission='Owner attests to reproduction rights, 2026-10-19; written grant not independently examined.',originalSha256=hashlib.sha256(output.read_bytes()).hexdigest(),replacedRecreatedFigure=old_path,oldAssetPath=old_path,replacedAssetPaths=[old_path] if old_path else [],batch=batch,verification='Direct 300-DPI original PDF clip reconstructed from the source rectangles recorded during the original visual review. No redraw or pixel editing.'))
for slug,ids in [('enzymes-metabolism',['c11-collision']),('transport',['b32-root-pressure-flow']),('origins-cells',['fatty-vesicle'])]:
    lesson=lessons[slug]
    lesson['assets']=[a for a in lesson['assets'] if a['id'] not in ids]
    for section in lesson['sections']:
        section['assets']=[a for a in section['assets'] if a not in ids]
        if 'figurePlacements' in section:section['figurePlacements']=[p for p in section['figurePlacements'] if p['assetId'] not in ids]
for slug,lesson in lessons.items():
    for section in lesson['sections']:
        if 'figurePlacements' in section:
            existing={p['assetId'] for p in section['figurePlacements']}
            for aid in section['assets']:
                if aid not in existing:section['figurePlacements'].append(dict(assetId=aid,afterBlock=len(section['teachingBlocks'])-1))
    (Path('src/biology/learning')/slug/'lesson.json').write_text(json.dumps(lesson,ensure_ascii=False,indent=2)+'\n')
registry['figures']+=records
registry['scope']=f"{len(registry['figures'])} original PDF crops across {len(set(f['topicId'] for f in registry['figures']))} topics; all earlier crops preserved."
registry_path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
(folder/'NEW_FIGURES.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print(f'Integrated {len(records)} original crops across {len(lessons)} lessons')
