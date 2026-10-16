#!/usr/bin/env python3
"""Phase-7-only SVG raster and 320px screenshot/contact-sheet checks; does not touch production."""
from pathlib import Path
import json
import cairosvg
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"artifacts"/"phase7-figure-renders"
OUT.mkdir(parents=True,exist_ok=True)
topics={"membranes-transport":17,"organelles-compartmentalization":9}
font=ImageFont.load_default()
manifest=[]
for slug,n in topics.items():
    paths=[]
    for index in range(1,n+1):
        stem=("mechanism-" if slug=="membranes-transport" else "organelle-")+str(index)
        for recall in (False,True):
            name=stem+("-recall" if recall else "")
            source=ROOT/"public"/"biology"/slug/(name+".svg")
            assert source.exists(),source
            svg=source.read_text(encoding="utf8")
            assert "<svg" in svg and "<title" in svg and "viewBox" in svg and "<image " not in svg
            for size in (320,650):
                target=OUT/f"{slug}-{name}-{size}.png"
                cairosvg.svg2png(url=str(source),write_to=str(target),output_width=size)
                with Image.open(target) as im:
                    im.verify()
                with Image.open(target) as im:
                    assert im.width==size and im.height>120 and im.getbbox() is not None
                manifest.append({"svg":str(source.relative_to(ROOT)),"png":str(target.relative_to(ROOT)),"width":size})
            if not recall: paths.append((name,OUT/f"{slug}-{name}-320.png"))
    columns=3
    tile_w=335
    tile_h=243
    rows=(len(paths)+columns-1)//columns
    sheet=Image.new("RGB",(columns*tile_w,rows*tile_h),"#ffffff")
    draw=ImageDraw.Draw(sheet)
    for position,(name,p) in enumerate(paths):
        image=Image.open(p).convert("RGB")
        x=(position%columns)*tile_w+7
        y=(position//columns)*tile_h+8
        sheet.paste(image,(x,y))
        draw.text((x,y+202),name,fill="#1a3347",font=font)
    sheet.save(OUT/f"{slug}-320px-contact-sheet.png")
(OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
assert len(manifest)==104, f"Expected 52 SVG x 2 sizes; got {len(manifest)}"
print(f"PASS: rasterized {len(manifest)//2} Phase 7 labelled/recall SVGs at 320px and 650px; contact sheets saved to {OUT}")
