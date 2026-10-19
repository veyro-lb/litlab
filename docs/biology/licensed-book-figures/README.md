# BioLab original textbook screenshot integration

**26 original PDF screenshots are integrated: 14 from Hodder and 12 from IB Biology Drawings, in 39 section placements across 15 topics.** The original 14 screenshot files remain unchanged. The second batch adds 12 actual Hodder figure crops, not redraws, traced SVGs or recreated diagrams.

The project owner confirmed permission for public reproduction on 2026-10-19 and requested visible attribution. Every screenshot displays its source and a readable caption in the lesson, with a full-resolution enlargement dialog. Publishers and creators retain copyright. The permission statement is recorded in the source register.

## New Hodder figures and teaching placements

Book figure numbers are **not** syllabus understanding IDs. The mappings below follow the existing lesson explanations.

| Book figure | Figure | Printed / PDF page | BioLab understandings | Lesson section(s) |
| --- | --- | --- | --- | --- |
| C1.2.9 | Link reaction and Krebs cycle | 419 / 431 | C1.2.12 | c12-12 |
| C1.2.11 | Mitochondrial chemiosmosis | 422 / 434 | C1.2.13–16 | c12-13–16 |
| C1.3.21 | Light-dependent reactions, including chloroplast context | 444 / 456 | C1.3.11–14 | c13-11–14 |
| C1.3.22 | Calvin cycle | 446 / 458 | C1.3.15–17 | c13-15–17 |
| D1.1.7 | Replication origins, fork and enzymes | 612 / 624 | D1.1.7–8 | d11-7–8 |
| D1.2.7 | Ribosome movement, peptide formation and polysomes | 622 / 634 | D1.2.6, D1.2.10 | d12-6, d12-10 |
| D1.2.16 | Translation initiation, elongation and termination | 634 / 646 | D1.2.17 (HL) | d12-17 |
| D2.1.12 | Crossing over / chiasmata | 660 / 672 | D2.1.11 | d21-11, after block 0 |
| D2.1.13 | Independent assortment / random orientation | 661 / 673 | D2.1.11 | d21-11, after block 2 |
| C2.2.13 | Saltatory conduction | 483 / 495 | C2.2.11 | c22-11 |
| B3.2.31 | Pressure-flow transport | 325 / 337 | B3.2.18 | b32-18 |
| D3.3.11 | Loop of Henle | 774 / 786 | D3.3.9 | homeostasis-9 |

Figure C1.2.10 remains excluded because of its outdated ATP-yield issue. No required priority figure is missing. The light-dependent crop already includes the book's chloroplast/thylakoid context; a separate chloroplast crop would be redundant. The optional synapse crop was not added; the existing synapse schematic remains outside this required batch.

## Replacements and existing sources

The new crops replace the main sources for `krebs-cycle`, `mitochondrial-chemiosmosis`, `thylakoid-chemiosmosis`, `calvin-carbon`, `bacterial-replication-enzymes`, `translation-elongation`, `d12-elongation-cycle`, `crossing-over`, `d21-meiotic-variation`, `saltatory-conduction`, `phloem-pressure-flow` and `loop-henle-gradient`. Four additional redundant recreated placements were removed: `d11-orientation`, `d11-enzymes-sequence`, `d12-ribosome-orientation`, and `c22-saltatory-nodes`. Their old files remain in git history/current assets for compatibility; they are not the main teaching figures in those sections. The meiosis-separation overview remains useful in its distinct explanation of chromosome separation.

The preserved first batch covers A1.1.2; A1.2.6, .8; A2.2.5, .6, .8; B1.2.1, .2; B2.1.10; B3.1.7, .8; B3.2.9, .10; D3.1.4, .9. The machine-readable register is authoritative for all placements.

## Reproduce and verify

`FIGURE_SOURCE_REGISTER.json` records exact asset paths, figure numbers, printed/PDF pages, captions, credit strings, owner permission, SHA-256 hashes, lesson sections, every understanding placement, former SVG paths, and crop coordinates in PDF points. The new PNGs were rendered at 216 dpi with PyMuPDF (version recorded in the register), with no pixel editing or relabelling. Whole source pages and uploaded PDFs are not published.

```sh
python scripts/biology/licensed-book-figures/extract.py /path/to/supplied-Hodder.pdf
node scripts/biology/licensed-book-figures/verify.mjs
node scripts/biology/licensed-book-figures/browser.mjs
```

The extraction script can use `--output-root tmp/reproduced` to verify reproducibility without touching public assets. The browser test checks all 26 served PNG hashes and all 39 placements at desktop/mobile widths, with image loading, aspect ratio, caption/credit, detailed zoom/reset/Escape and horizontal overflow checks. It is included in `.github/workflows/biolab-preview-readiness-qa.yml`.

Inline screenshots preserve aspect ratio, use the existing 600/800 px figure widths, and have a 680 px height cap. The enlargement dialog retains full source pixels and supports zoom/pan. No mobile SVG override can replace a registered screenshot.

See `HANDOFF.md` for verification and preview evidence. Work remains on `feature/biolab-original-textbook-crops-20261019`; no merge or production deployment is part of this task.
