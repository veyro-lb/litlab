# BioLab IB2025 content review — implemented batches and continuation

Implementation commit: `4b8ab75af67643f30c39124feb0c7853024f8214` on `feature/biolab-ib2025-content-source-cleanup-20261019`.
Baseline checked against remote before editing: `58e52cc482f7e896bd7de3f8c85ccf2dadf8e1ce`.
The subsequent handoff commit changes documentation only; use the latest remote HEAD when continuing.
No main merge, production deployment or protection-setting change was performed. Existing Git integration created preview builds automatically.

## Actual review scope

Five topic-sized batches edit the actual website lessons: C1.2 Cell respiration, C1.3 Photosynthesis, D1.1 DNA replication, D1.2 Protein synthesis, D2.1 Cell and nuclear division.

- **81 understandings compared with the official Guide** for teaching scope and structured written practice; **472 not individually reviewed in this pass**.
- **0 newly completed full source audits**: the required Hodder PDF was unavailable. Do not present these 81 Guide comparisons as completed scientific/source approvals.
- The existing C1.2.1 ATP source-checked edit is preserved byte-for-byte at section-data level. Its previous verification is inherited, not repeated.
- Matrix statuses: 1 inherited source-checked/extra-removed ATP row, 80 needing further source/scientific investigation, 472 not yet individually reviewed.
- Earlier 13-row source-check evidence remains in the historical consolidated ledger and is cross-linked, not relabelled as new work or added to the current count.
- Every original asset record and section/question identifier in the five edited lessons is preserved. The existing source-crop verifier confirms **14 exact screenshot hashes**, placements and attributions.

## Content and assessment changes

| Topic | Explanation characters before | After | Changed question records |
| --- | ---: | ---: | ---: |
| C1.2 | 22,237 | 12,263 | 23 |
| C1.3 | 27,705 | 14,501 | 21 |
| D1.1 | 11,045 | 6,384 | 9 |
| D1.2 | 24,768 | 9,273 | 19 |
| D2.1 | 24,036 | 9,555 | 17 |

These are explanatory-text counts, not claims of educational completeness. `*_CHANGES.json` records every changed section/question field, root citation changes, before/after text and reasons.

Respiration now separates ATP work, hydrolysis and regeneration without three versions of the same explanation. It retains glycolysis accounting, carbon counts, paired redox changes, proton directions, oxygen’s role and practical rates. Respirometry now explicitly names variables affecting rate and distinguishes gas measurements from ATP counts. Generic written prompts and overlapping credit points were replaced with specific taught tasks.

Shared photosynthesis no longer requires photosystem, NADPH or Calvin-cycle mechanisms in model answers. Additional HL retains cyclic/non-cyclic flow, thylakoid orientation, NADP reduction, carbon fixation and RuBP regeneration. Pigment colours, Rf identification, CO₂-consumption rate calculation and provisional/repeatedly tested hypotheses are explicit. FACE remains a required topic; relevant evidence is retained with checked bibliographic details, rather than removing it as a generic tag.

DNA replication now stays within the shared helicase/polymerase scope, preserves PCR and marker-reliability requirements, and keeps directionality, primer handling and polymerase III proofreading in HL. Protein synthesis has distinct RNA roles, clear codon deductions, a concrete sickle-cell substitution, two-stage insulin processing and focused three-point mark schemes. Detailed A/P/E site instruction is assigned to HL; existing shared elongation figures are preserved and their advanced labels are identified as HL extensions.

Cell division now explicitly covers actin/myosin versus vesicle mechanisms, unequal human oogenesis and yeast budding, inheritance of essential organelles, histone-associated condensation, chromosome-versus-DNA counts, reduction and sexual-life-cycle logic. It removes detailed kinase control from the limited cyclin understanding and keeps cell-cycle phase instruction in HL. Three distinct meiosis-variation blocks and all associated visuals remain intact.

## Before/after clarity examples

- C1.2.2 previously explained transport, synthesis and movement, then repeated all three in a third block. It now has two blocks: active transport and synthesis/movement; enzyme coupling and the specified examples remain.
- C1.3.13’s former written answer described excitation and replacement electrons without stating how NADP is reduced. The replacement answer specifies two electrons from PSI and a stromal proton producing NADPH.
- D1.2.15 previously repeated processing across several passages. Two blocks now distinguish intron removal/exon joining from caps/tails and their stabilizing role.
- D2.1.15 previously taught cyclin-dependent kinase mechanisms beyond the Guide’s limitation. Two blocks now explain changing cyclin concentrations and checkpoint thresholds without named cyclins.

## Verified Guide locators

| Topic | Printed Guide pages | PDF pages |
| --- | --- | --- |
| C1.2 | 67–69 | 73–75 |
| C1.3 | 69–72 | 75–78 |
| D1.1 | 86 | 92 |
| D1.2 | 87–88 | 93–94 |
| D2.1 | 90–92 | 96–98 |

The matrix records individual start pages and continuation pages, including guidance on the following page. Official spelling `C.1.2.17` is normalized to existing ID `C1.2.17`; IDs were not changed. Unreviewed titles and pages remain explicitly structural mappings. No new Hodder page verification is claimed: existing locators are retained as inherited and unverified in this pass.

## Source access and unresolved source work

`SOURCE_AVAILABILITY.json` records file sizes, hashes and opening checks. The Guide, roadmap and drawings PDFs open. The SL Nucleic Acids PPTX opens but its slides were not individually audited. Two other PPTX files exist but fail ZIP integrity/opening: `06-A-1.2-HL-Nucleic-Acids.pptx` and `07-1.-D-2.1-SL-Cell-and-nuclear-division.pptx`. The Hodder PDF failed attachment ingestion and is absent. No missing textbook or unreadable slide contents were used.

Re-upload Hodder and the two unreadable presentations. The **58 precise Hodder locator gaps remain unresolved** (C3.2:18, C4.1:18, C4.2:22). No pages were guessed. Exact textbook passage verification, complete distractor/feedback and interaction audits, glossary checks, per-figure scientific review, remaining 472 Guide comparisons and independent qualified review remain open.

## Validation and browser evidence

Passing: all 40 lesson packages; 553 registry IDs (337 shared/216 HL); original 14-crop hash/credit checks; historical depth/consolidation structure; 5 new evidence/scope tests; 16 scientific-figure tests; 4 presentation tests; C1/C2 specialist structure; site quality; production build without publication.

Remaining failing checks are recorded without weakening tests. A detached baseline comparison confirms the same first source-policy blocker, **C4.2.20 observed monthly graph missing**, and the same first D1/D2 blocker, **missing interpretation metadata on bacterial-replication-enzymes**. Their negative suites also fail on baseline. Legacy C1.2 literal-label checks fail against the unchanged chemiosmosis SVG. These failures can hide later issues; they are not a full regression clearance. Historical validators print frozen review counts: use the new matrix for this pass’s counts.

**Chromium QA is blocked, not passed.** Local Chromium exits SIGTRAP before opening a page. The existing automatic branch preview is READY, but its browser route reaches Vercel sign-in; the connected access tool returns 403 for this deployment. No desktop/mobile lesson screenshots, zoom checks or interactions were obtained. Vercel build success is not browser QA. `VALIDATION_RESULTS.json` contains commands, outcomes, logs and blockers.

## Exact continuation

1. Start from the latest remote HEAD of this same branch; preserve all existing lesson edits and 14 original crops. Do not merge into main or deploy to production.
2. Obtain the readable Hodder PDF and two damaged slide uploads. Authorize the existing Vercel project/team connection if its protected preview will be used for QA, or run Chromium locally in a working environment; do not disable protection.
3. Complete the remaining source and assessment/figure checks in these five topics. The matrix deliberately leaves them pending. Use actual textbook passages before changing inherited page locators or claiming source verification.
4. Continue the requested priorities **B3.2 Transport and C2.2 Neural signalling**, then all other topics, in individually examined batches. Do not bulk approve rows based on registry matching.
5. Resolve baseline source-policy and specialist blockers with evidence, without weakening tests. Run `node --test scripts/biology/ib2025-coursewide-review/verify.test.mjs`, all existing validators, quality/build and desktop/mobile Chromium after content changes.
6. Update every changed field’s evidence and actual counts before each commit. Preserve inherited evidence separately and maintain `independentScientificApproval: false` until a qualified reviewer really signs off.
