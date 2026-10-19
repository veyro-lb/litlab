# BioLab original textbook figure expansion — batch report

PR: https://github.com/veyro-lb/litlab/pull/141

Branch: `feature/biolab-textbook-figure-expansion`. Base: `2024b5970a7b9be03dd28413b38b50cdd1cc6fca` (remote main verified before starting). No merge or deployment performed.

## Outcome

19 new original Hodder screenshot crops at 300 DPI, 21 inline placements across five topics. 18 recreated SVG asset registrations replaced. One redundant DNA/RNA comparison removed while its accessible comparison table remains. The course now contains 45 registered original crops across 16 topics, with 60 placements (33 Hodder / 12 Drawings). This is a substantial verified-source batch; the full course-wide replacement programme is not complete.

## A. Original-source review

Original Hodder pages visually inspected: PDF 28, 30, 31, 39, 40, 241, 243, 251, 254, 257, 259, 260, 261, 262, 264, 265, 266, 267, 616, 624, 628, 631, 641, 643, 645, 646. Printed folios were read directly from the page renderings. The PDF and printed page references below were recorded individually; matching offsets are observations, not an extraction assumption.

Chapters: A1.2 nucleic acids; B2.1 membranes and transport; B2.2 organelles; D1.1 replication; D1.2 protein synthesis. Captions and surrounding explanations were read. The official supplied Biology Guide was checked at PDF pages 42–43, 59–61 and 92–94 for exact understanding IDs and SL/HL boundaries. The supplied Drawings PDF was text-indexed across pages 1–10; its existing authentic images are preserved. No new Drawings crop is claimed.

33 candidates recorded; 19 extracted and integrated. Selection prioritized complete structure/function labels, a direct match to the taught understanding, and a useful improvement over the previous schematic. Optional/rejected candidates remain explicitly marked in CANDIDATE_REGISTER.json.

Rejected source issues: D1.2.1 labels T in the pool of free transcription nucleotides; D1.2.12 depicts reordered exons. Those PNG experiments remain outside the repository and are not deployed. D1.2.14 contains overgeneralized tRNA wording; A1.2.13 includes a 30-nm fibre model beyond the requested nucleosome scope. Existing accurate figures remain. Previously excluded C1.2.10 was not reintroduced.

## B. New original screenshots

All figures are from Biology for the IB Diploma, Third Edition, C. J. Clegg, Andrew Davis and Christopher Talbot, Hodder Education (2023). PNG directory: `public/biology/licensed-book-crops/`.

| Topic | Understanding(s) | Book figure | Printed / PDF page | New PNG asset | Purpose |
|---|---|---|---|---|---|
| A1.2 | A1.2.2 | A1.2.1 | 16 / 28 | hodder-a121-expansion.png | The components of nucleotides |
| A1.2 | A1.2.5 | A1.2.3 | 18 / 30 | hodder-a123-expansion.png | An RNA polymer |
| A1.2 | A1.2.3, A1.2.11 | A1.2.5 | 18 / 30 | hodder-a125-expansion.png | RNA is formed by the condensation of nucleotide monomers |
| A1.2 | A1.2.7 | A1.2.4 | 18 / 30 | hodder-a124-expansion.png | The numbering of carbon atoms in ribose and deoxyribose (in their straight chain (linear) and cyclic forms) |
| B2.1 | B2.1.6 | B2.1.8 | 229 / 241 | hodder-b218-expansion.png | Channel proteins in the plasma membrane for transport of metabolites or water |
| B2.1 | B2.1.7 | B2.1.11 | 231 / 243 | hodder-b2111-expansion.png | Active transport of a single substance |
| B2.1 | B2.1.13 | B2.1.19 | 239 / 251 | hodder-b2119-expansion.png | Transport by endocytosis (taking matter into cells) and exocytosis (matter moving out from cells via vesicles) |
| B2.1 | B2.1.16 | B2.1.23 | 242 / 254 | hodder-b2123-expansion.png | Epithelial cell with sodium-dependent glucose transporter |
| B2.2 | B2.2.1 | B2.2.1 | 245 / 257 | hodder-b221-expansion.png | Principle of centrifugation applied to a cell homogenate (cells with broken plasma membranes but intact organelles) |
| B2.2 | B2.2.2 | B2.2.2 | 247 / 259 | hodder-b222-expansion.png | Transport across the nuclear membrane |
| B2.2 | B2.2.3 | B2.2.3 | 248 / 260 | hodder-b223-expansion.png | The process of phagocytosis |
| B2.2 | B2.2.4 | B2.2.4 | 249 / 261 | hodder-b224-expansion.png | Electron micrograph of a mitochondrion, with an interpretive drawing |
| B2.2 | B2.2.5 | B2.2.5 | 250 / 262 | hodder-b225-expansion.png | The ultrastructure of a chloroplast |
| B2.2 | B2.2.6 | B2.2.6 | 252 / 264 | hodder-b226-expansion.png | Diagram showing the nuclear membrane and its connection to the ER |
| B2.2 | B2.2.6 | B2.2.7 | 252 / 264 | hodder-b227-expansion.png | Breakdown of the nuclear membrane during mitosis in an animal cell |
| B2.2 | B2.2.7, B2.2.8 | B2.2.10 | 254 / 266 | hodder-b2210-expansion.png | Flow of membrane and proteins from the endoplasmic reticulum through the Golgi to the plasma membrane |
| B2.2 | B2.2.9 | B2.2.11 | 255 / 267 | hodder-b2211-expansion.png | Endocytosis mediated by clathrin |
| D1.1 | D1.1.3 | D1.1.2 | 604 / 616 | hodder-d112-expansion.png | DNA replication |
| D1.2 | D1.2.7 | D1.2.3 | 619 / 631 | hodder-d123-expansion.png | An amino acid is linked to a specific tRNA |

## C. Replacements and placement

| Understanding | Previous rendering | Original replacement | Old lesson rendering removed? |
|---|---|---|---|
| A1.2.2 | nucleotide.svg | A1.2.1 | Yes; no old responsive/recall substitute |
| A1.2.5 | rna-polymer.svg | A1.2.3 | Yes; no old responsive/recall substitute |
| A1.2.3, A1.2.11 | backbone.svg | A1.2.5 | Yes; no old responsive/recall substitute |
| A1.2.7 | sugars.svg | A1.2.4 | Yes; no old responsive/recall substitute |
| B2.1.6 | mechanism-6.svg | B2.1.8 | Yes; no old responsive/recall substitute |
| B2.1.7 | pump-alternating-access-20261017.svg | B2.1.11 | Yes; no old responsive/recall substitute |
| B2.1.13 | mechanism-13.svg | B2.1.19 | Yes; no old responsive/recall substitute |
| B2.1.16 | intestinal-glucose-topology-20261017.svg | B2.1.23 | Yes; no old responsive/recall substitute |
| B2.2.1 | organelle-1.svg | B2.2.1 | Yes; no old responsive/recall substitute |
| B2.2.2 | organelle-2.svg | B2.2.2 | Yes; no old responsive/recall substitute |
| B2.2.3 | organelle-3.svg | B2.2.3 | Yes; no old responsive/recall substitute |
| B2.2.4 | organelle-4.svg | B2.2.4 | Yes; no old responsive/recall substitute |
| B2.2.5 | organelle-5.svg | B2.2.5 | Yes; no old responsive/recall substitute |
| B2.2.6 | organelle-6.svg | B2.2.6 | Yes; no old responsive/recall substitute |
| B2.2.6 | organelle-6.svg | B2.2.7 | Yes; no old responsive/recall substitute |
| B2.2.7, B2.2.8 | organelle-8.svg, organelle-7.svg | B2.2.10 | Yes; no old responsive/recall substitute |
| B2.2.9 | organelle-9.svg | B2.2.11 | Yes; no old responsive/recall substitute |
| D1.1.3 | helicase-opening.svg | D1.1.2 | Yes; no old responsive/recall substitute |

B2.2.6 now uses separate source crops for envelope structure and breakdown, placed after the corresponding explanations. B2.2.7 and B2.2.8 share one ER–Golgi source crop in their separate understandings; they do not repeat it within the same reading. D1.2.7 adds a tRNA attachment/anticodon figure, while the original translation screenshots remain in D1.2.6, D1.2.10 and D1.2.17. The explanatory addition distinguishes the amino-acid attachment site from the anticodon.

Replaced SVG files remain as historical regression fixtures where older scripts reference them. Their lesson registrations/references have been removed or redirected to authentic PNGs. Comparison tables, numeric charts, text prediction activities, controls, molecular-viewer links and authentic microscopy remain. The audited current components did not contain a separate anatomical CSS renderer; the targeted recreated assets were SVGs.

## D. Preservation

All original 26 PNG SHA-256 checksums match. All original 26 source-register records are byte-for-byte equivalent as parsed JSON to the starting main records, including original credits and the 39 placements. No original screenshot placement was removed. No original PNG was overwritten or recropped. No source PDFs or private extraction files were committed.

New source provenance records include source title/edition/authors/publisher, chapter, figure number, original caption, printed and PDF page, crop rectangle in PDF points, 300-DPI render resolution, SHA-256, exact understanding/section/block placement, prior asset relationships, and the existing owner-attested rights statement. Formal permission documents were not independently reviewed.

## E. Scientific and technical verification

- PASS: original source-page and final crop visual review; corrected stray text and clipped labels before integration.
- PASS: 19/19 PNGs match a fresh PyMuPDF rendering of the recorded original PDF rectangle pixel for pixel. See SOURCE_PIXEL_VERIFICATION.json (source PDF hash and renderer version included).
- PASS: npm ci; npm run quality; production npm run build; public build privacy/rights gate (425 files, zero prohibited files). Existing large-JavaScript-chunk advisories remain.
- PASS: curriculum registry (40 topics / 553 understandings), all 40 lesson packages, full-course technical mapping audit, all 45 crop SHA-256 identities and 60 registered placements.
- PASS: 118 targeted Node tests covering lesson rendering, curriculum/lesson contracts and figure provenance regressions.
- Broad legacy sweep: 253/261 pass, eight fail. A clean baseline worktree at starting main gives 251/261 pass, 10 fail. Each remaining failing test also fails on baseline. No claim of an entirely green historical test suite is made.
- Local browser QA BLOCKED: Chromium crashes at launch with SIGTRAP in this execution environment. No local responsive/zoom/focus success is claimed.
- GitHub browser QA: pending at report preparation. Isolated workflow tests all 45 crops on desktop/mobile, every new placement at 1440/834/390/320 widths in light/dark mode, source attribution, aspect ratio, overflow, zoom/pan/reset, Escape/focus return and subject navigation/feedback. Reports and screenshots are uploaded as workflow artifacts.

Remaining broad-suite failure names: Phase 3.2 mapped drafts satisfy bounded contract; B2.1 positive structural mapping; B2.2 positive structural mapping; B2.1 pump science: three Na+ exported and two K+ imported per ATP; all 23 retained recall pairs and 4 reviewed single-frame replacements exist; complete source-checked draft passes; external asset safety and nonpublished status; biology-critical template, transcript and codon invariants.

## F. Handoff and remaining work

Remote commits: `1229950f50799e7d4defa67565b11ed9d4c2bc7b` (research/audit), `920ffe8f7c6451f83c46bd09ad22a8629d587e13` (extraction/integration), `4275a00b71e5472245363115ddbed919c7bccd77` (verification and isolated CI). The connector-created commits have different IDs from equivalent local commits; their file trees were compared and match.

No public preview was deployed. Draft PR remains the review surface. Do not merge/deploy until browser evidence is passing and reviewed; no qualified scientific approval is invented.

Remaining work: finish original-source comparison for the REVIEW assets in VISUAL_AUDIT.json, especially enzymes, neural signalling/synapses, mitosis, kidney regulation, gas exchange, plant transport and reproduction/inheritance. The audit inventories all 191 original registered assets, but only selected candidates received complete original-page visual comparison in this batch. Preserve the working original respiration, photosynthesis, meiosis, saltatory conduction and nephron crops while expanding.
