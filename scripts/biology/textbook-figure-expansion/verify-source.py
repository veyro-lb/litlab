#!/usr/bin/env python3
"""Verify expansion PNG pixels against original PDF clips without writing any files.
Usage: python scripts/biology/textbook-figure-expansion/verify-source.py /path/to/Hodder.pdf
The complete source PDF is never copied into the repository or public build.
"""
import argparse
import hashlib
import json
from pathlib import Path
import fitz

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source_pdf', type=Path)
args = parser.parse_args()
registry = json.loads(Path('docs/biology/licensed-book-figures/FIGURE_SOURCE_REGISTER.json').read_text())
source_hash = hashlib.file_digest(args.source_pdf.open('rb'), 'sha256').hexdigest()
verified = []
with fitz.open(args.source_pdf) as source:
    assert len(source) == 868, 'Expected supplied 868-page Hodder PDF'
    for figure in registry['figures']:
        if figure.get('batch') != 'textbook-figure-expansion':
            continue
        page = source[figure['sourcePdfPage'] - 1]
        assert figure['figureNumber'] in page.get_text(), 'Wrong source page'
        clip = fitz.Rect(figure['cropBoxPdfPoints'])
        assert page.rect.contains(clip), 'Crop outside original page'
        scale = figure['renderDpi'] / 72
        expected = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
        actual = fitz.Pixmap(str(Path('public') / figure['path'].lstrip('/')))
        assert (expected.width, expected.height, expected.n) == (actual.width, actual.height, actual.n)
        assert expected.samples == actual.samples, 'Source pixels differ: ' + figure['figureNumber']
        verified.append(dict(figureNumber=figure['figureNumber'], sourcePdfPage=figure['sourcePdfPage'],
                             width=actual.width, height=actual.height, exactSourcePixels=True))
assert len(verified) == 19
print(json.dumps(dict(sourceSha256=source_hash, renderer=fitz.VersionBind, verified=verified), indent=2))
