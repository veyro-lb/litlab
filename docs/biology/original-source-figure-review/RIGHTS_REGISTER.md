# Original textbook figure review — rights-gated source register

Verified starting branch: `feature/biolab-learning-experience-redesign-20261016`; baseline commit `61f5a89833e6a9fcda3c7e27118c3734636d7c79`.

## Security and scope

This repository is **public**. NEVER commit, bundle, copy into `public/`, inline as base64, publish as a pull-request attachment, or deploy original copyrighted book/slide figure files here without documented legal clearance. Private personal possession of a textbook PDF is **not** reproduction permission. Attribution does not alone create a licence.

The private owner-inspection bundle is delivered separately as a **local/offline** ZIP with (a) crops rendered from the supplied originals; (b) a clickable enlargement gallery grouped by syllabus topic/understanding; (c) a manifest CSV and JSON containing exact PDF point bounds, source identifiers, source page number, image hashes, and rights states. **It is not a hosted, authenticated BioLab website**. This GitHub branch intentionally does not contain or serve those image files.

Do not replace any existing scientific figure before a correct counterpart has been visually verified, source rights checked, and a genuine access-control solution tested. Do not label a reconstructed figure or an offline preview as an original hosted textbook placement.

## Current counts (19 October 2026)

- 40 topics in official 2025 syllabus and repository curriculum registry reviewed for figure candidates.
- 9 topics have authored lesson JSON; 31 topics are curriculum-only/planned.
- 58 actual original Hodder textbook PDF figure crops extracted and grouped next to candidate numbered understandings in an **offline-only owner review gallery**.
- 3 direct crops from the separately supplied IB Biology Drawings PDF and 1 original embedded image from A1.2 SL PowerPoint slide 4 also privately reviewed; ownership/licensing unverified, so also **not public**.
- 0 figures approved for public reproduction; 58 Hodder figures awaiting documented permission, 4 supplemental figures awaiting documented permission.
- 0 direct textbook images deployed to BioLab; 0 existing SVG/CSS figures removed.
- All placements and crops remain editorial/scientific review *candidates* rather than qualified approvals. Figures selected for topics without authored lessons are **not** claimed to be inside a live BioLab lesson.

## Source and coordinates

For the table below, source is Clegg, Davis & Talbot, *Biology for the IB Diploma Programme*, Third Edition, Hodder Education (2023). The four values in the last field are the normalized crop rectangle's left, top, right and bottom in units of 1/10000 of the corresponding PDF page. These coordinates are recorded here for traceability **only**. The offline owner manifest contains exact coordinates in PDF points plus image SHA-256s, audit state, original printed/PDF pages and alternative-resource attribution. Printed page differs from PDF page by +12 for this source edition.

All 58 rows: `rights=awaiting_clearance`, `live_site=not_placed`, `private_owner_gallery=provisional`.

```text
Figure | Understanding | printed page | PDF page | x0,y0,x1,y1 in 1/10000 PDF page
A1.1.4|A1.1.3|5|17|700,2400,9200,7600
A1.2.12|A1.2.6|27|39|2200,400,9300,8400
A2.1.3|A2.1.3|37|49|600,2200,3500,4700
A2.2.16|A2.2.5|66|78|1900,700,9300,7600
A2.3.2|A2.3.2|90|102|700,5200,9600,6700
A3.1.2|A3.1.1|103|115|4600,1600,9400,4900
A3.2.2|A3.2.3|128|140|1300,6500,9400,9100
A4.1.1|A4.1.1|139|151|2000,6300,9400,8700
A4.2.1|A4.2.1|157|169|2000,1900,8900,6200
B1.1.16|B1.1.5|192|204|600,4800,4600,7900
B1.2.3|B1.2.2|207|219|1700,2300,9400,4700
B2.1.14|B2.1.10|234|246|1200,5200,9500,9100
B2.2.10|B2.2.8|254|266|2500,4300,9100,7600
B2.3.3|B2.3.4|260|272|1200,2100,9400,4600
B3.1.4|B3.1.4|278|290|1200,700,9600,8300
B3.2.23|B3.2.15|316|328|1200,4800,9400,7400
B3.3.4|B3.3.2|328|340|2600,1000,9100,5300
B4.1.5|B4.1.2|344|356|800,3400,9400,5699
B4.2.1|B4.2.1|364|376|2100,400,9100,4900
C1.1.4|C1.1.4|383|395|3000,3400,9500,6899
C1.2.9|C1.2.12|419|431|2800,400,8900,5600
C1.3.22|C1.3.17|446|458|1100,300,9000,7300
C2.1.2|C2.1.2|452|464|2100,400,9300,6800
C2.2.4|C2.2.3|471|483|2200,5100,9400,8100
C3.1.3|C3.1.3|494|506|1400,1000,7900,5500
C3.2.3|C3.2.3|521|533|2000,1900,9400,7600
C4.1.5|C4.1.4|556|568|2700,650,8900,6370
C4.2.4|C4.2.4|582|594|800,500,9700,6000
D1.1.7|D1.1.7|612|624|2700,4900,9500,9400
D1.2.4|D1.2.5|620|632|1100,400,9400,4100
D1.3.3|D1.3.2|641|653|1800,3800,8400,7200
D2.1.10|D2.1.9|657|669|1400,300,9500,9200
D2.2.2|D2.2.6|673|685|2400,4400,9200,8700
D2.3.2|D2.3.2|682|694|2000,3500,9400,6899
D3.1.3|D3.1.2|695|707|1800,300,9100,3400
D3.2.5|D3.2.5|729|741|1800,400,9500,8100
D3.3.4|D3.3.3|763|775|1600,3700,9500,7800
D4.1.3|D4.1.5|785|797|2400,200,9400,5500
D4.2.2|D4.2.2|800|812|3200,3900,9400,6100
D4.3.1|D4.3.1|821|833|2800,700,9400,4900
C1.2.10|C1.2.13|420|432|2200,4000,9100,7700
C1.2.11|C1.2.15|422|434|2000,500,9300,5500
C1.2.12|C1.2.16|423|435|2600,6400,9300,9400
C1.3.19|C1.3.12|442|454|2300,4400,9200,8400
C1.3.21|C1.3.14|444|456|1300,2700,9400,9200
C1.3.24|C1.3.18|448|460|2200,600,9200,6500
D1.2.16|D1.2.17|634|646|1300,700,9400,8400
D1.2.7|D1.2.10|622|634|2600,5000,9400,9300
D2.1.8|D2.1.7|654|666|1700,2000,9300,8900
D2.1.12|D2.1.11|660|672|800,7100,9600,9400
B2.1.22|B2.1.15|242|254|800,400,9200,4600
B2.1.23|B2.1.16|242|254|1300,5400,9100,8600
C2.2.8|C2.2.6|478|490|700,2800,9400,8600
D1.1.1|D1.1.2|603|615|1200,3000,9200,8000
A1.2.13|A1.2.13|28|40|800,700,9400,3500
B2.2.11|B2.2.9|255|267|2400,400,9200,5900
B3.2.25|B3.2.16|318|330|1100,800,9400,7200
D3.2.13|D3.2.13|741|753|1900,1100,9200,7200
```

## Requirements before website integration

1. Confirm applicable rights per figure: publisher or owner authorization, licence, or documented legally sufficient exception. Figure artwork may have third-party rights.
2. Store all uncleared image binaries only in truly nonpublic storage whose read API requires authorization, with tested access checks; do not assume a hidden URL or robots.txt is access control.
3. Match figures to an already-authored numbered understanding and teaching block; for 31 planned topics, write/verify lessons first.
4. Only display in the legitimate review context with accessible captions, high-resolution zoom, cropped labels intact, and no duplicate neighboring diagrams.
5. Preserve existing diagrams until replacement quality and rights are verified. Publishing state must default to withheld, and no public build should refer to private assets.

This register is a metadata-only development artifact and **does not** prove the image integration is complete.