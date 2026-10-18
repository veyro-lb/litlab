"""Reconstruct a fully captioned private figure ledger from the owner's local Hodder PDF.
Run privately with: python REGENERATE_FULL_CAPTIONS.py /path/to/Hodder.pdf
Do NOT upload the PDF, extracted figures or resulting protected previews publicly.
"""
import fitz, json, sys, re, pathlib
if len(sys.argv)!=2: raise SystemExit("Usage: python REGENERATE_FULL_CAPTIONS.py /path/to/your-Hodder.pdf")
doc=fitz.open(sys.argv[1])
if len(doc)!=868: raise SystemExit(f"Unexpected PDF page count: {len(doc)}")
records={}
for index,page in enumerate(doc):
    text=page.get_text()
    for match in re.finditer(r'■\s*Figure\s+([A-D][1-4]\.[1-4]\.\d+)\s*([^\n]*)',text):
        figure=match.group(1)
        records.setdefault(figure,{"sourceFigureId":figure,"pdfPage":index+1,"printedPage":index+1-12,"captionLeadAutoExtracted":match.group(2).strip(),"captionVerified":False})
if len(records)!=767: raise SystemExit(f"Unexpected number of numbered figures: {len(records)}")
out=pathlib.Path("HODDER_PRIVATE_FIGURE_CAPTION_LEADS.json")
out.write_text(json.dumps({"warning":"Caption leads are unverified, may be truncated by PDF line wrapping.","figures":list(records.values())},indent=2),encoding="utf-8")
print(f"Saved {len(records)} figure anchor leads privately to {out}")
