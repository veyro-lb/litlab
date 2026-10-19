#!/usr/bin/env python3
"""Reproduce the second-batch Hodder crops from the owner-supplied PDF.
Usage: python scripts/biology/licensed-book-figures/extract.py /path/to/Hodder.pdf
Requires PyMuPDF. Never copies the source PDF into the public tree.
"""
import argparse
import hashlib
import json
from pathlib import Path
import fitz

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source_pdf', type=Path)
parser.add_argument('--output-root', type=Path, default=Path('public'))
args = parser.parse_args()
register = json.loads(Path('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json').read_text())
with fitz.open(args.source_pdf) as source:
    assert len(source) == 868, 'Expected supplied Hodder Third Edition PDF (868 pages)'
    for figure in register['figures']:
        if 'cropBoxPdfPoints' not in figure:
            continue  # First-batch source pixels remain unchanged.
        page = source[figure['sourcePdfPage'] - 1]
        assert figure['figureNumber'] in page.get_text(), 'Wrong source page'
        scale = figure['renderDpi'] / 72
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale),
                              clip=fitz.Rect(figure['cropBoxPdfPoints']), alpha=False)
        output = args.output_root / figure['path'].lstrip('/')
        output.parent.mkdir(parents=True, exist_ok=True)
        pix.save(str(output))
        digest = hashlib.sha256(output.read_bytes()).hexdigest()
        assert digest == figure['originalSha256'], f'Unexpected pixels for {figure["figureNumber"]}; check renderer version'
        print(f'{figure["figureNumber"]}: {pix.width} x {pix.height}, SHA-256 verified')
