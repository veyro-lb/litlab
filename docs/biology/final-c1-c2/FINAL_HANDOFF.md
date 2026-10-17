# BioLab — Final Content Sprint C: scoped handoff

**Date:** 17 October 2026  
**Repository:** `veyro-lb/litlab`  
**Integration base (left untouched):** `feature/biolab-complete-course-integration-20261017`  
**Verified starting SHA:** `2c321ae547baa2a97294728b337a4dfa46e64408`  
**Isolated working branch:** `feature/biolab-final-c1-c2-20261017`  
**Verified pre-handoff content/validator SHA:** `cac92a21451ebbc2ef70fc45f24b4c39cb079689`  
**Final branch SHA:** the commit containing this handoff is the authoritative final branch HEAD; its SHA must be taken from GitHub after this file is committed. A commit cannot accurately embed its own final SHA within a versioned file.

## Decision

**Coherent scoped development batch committed; release / independent-science-approval status: NOT READY.** All 83 numbered understandings are present and received an internal *record-level* editorial/source-mapping review, plus targeted substantive pedagogical fixes. This is not a claim that every scientific sentence was independently checked by a qualified subject expert. No production deployment, merge, registry update, catalog edit, public-site change, or source-branch merge occurred.

## Source use and limits

- Primary requirements: *IB Biology guide, first assessment 2025*, Theme C, understandings C1.1.1–C1.1.17, C1.2.1–C1.2.17, C1.3.1–C1.3.19, C2.1.1–C2.1.14 (entirely HL) and C2.2.1–C2.2.16.
- Teaching comparison: Clegg, Davis and Talbot, *Biology for the IB Diploma Programme*, third edition (Hodder Education, 2023). Relevant chapter printed pages: C1.1 380–404, C1.2 405–424, C1.3 425–449, C2.1 450–466, C2.2 467–489.
- The per-understanding ledger records the official guide identifier and printed/PDF page, the cited Hodder chapter range, the source-reference IDs already associated with its claims, linked questions and artwork, and exactly which type of edit was made. **Inherited per-understanding Hodder page suggestions were not independently page-by-page substantiated and are not asserted as verified evidence.**
- All added questions, dataset values, explanatory feedback and diagrams were newly authored. Tables with invented data explicitly say that they are illustrative, not observed results. They are not past-paper questions.
- The attached IB/Hodder publications are copyrighted. Their use as internal requirements/teaching references does not imply a third-party commercial distribution licence, public-site authorization, or IB endorsement.

## Work by topic

| Topic | Understandings reviewed internally | Assessment questions before → after | Changes |
|---|---:|---:|---|
| C1.1 Enzymes and metabolism | 17 (10 shared, 7 HL) | 21 → 22 | Added a 5-mark hypothetical inhibitor-rate comparison with units, competition-vs-allostery reasoning and a non-causal-inference warning; retained previously detailed mechanism and graph teaching |
| C1.2 Cell respiration | 17 (6 shared, 11 HL) | 34 → 35 | Replaced 17 generic term sets; retitled the 17 second-stage mechanism teaching blocks; clarified 2 worked examples; added a connected glycolysis–link reaction–Krebs–ETC–chemiosmosis figure and a corrected respirometry application item |
| C1.3 Photosynthesis | 19 (8 shared, 11 HL) | 38 → 40 | Replaced 19 generic term sets and retitled mechanism blocks; clarified 5 worked examples; added original chromatography Rf and action-spectrum datasets with marking guidance |
| C2.1 Chemical signalling (HL only) | 14 | 28 → 29 | Replaced all four option-feedback explanations for every in-lesson check and corresponding assessed MCQ (112 feedback records); added a four-receptor causal comparison figure and a cAMP-bypass inference problem |
| C2.2 Neural signalling | 16 (7 shared, 9 HL) | 32 → 33 | Replaced in-lesson and assessment MCQ option feedback (128 feedback records); aligned the illustrative action-potential resting voltage and threshold coordinates; added a voltage-vs-frequency calculation item |

**Totals:** 83 understanding-level sections; **153 → 159** questions, with six additional original applied/data items; 240 option-feedback messages rewritten in C2.1/C2.2; two new original SVG diagrams and one corrected existing SVG graph. All 83 have ledger rows; this **does not** mean full independent scientific accreditation.

### New visual mechanisms

- `public/biology/cell-respiration/respiration-connected-pathways.svg`: shows per-glucose stages, carbon accounting, carrier/ATP outputs, matrix vs intermembrane-space proton pumping and return, and explicitly notes cytosolic NADH shuttles. A process model, not a fixed ATP-yield claim.
- `public/biology/chemical-signalling/receptor-mechanisms.svg`: contrasts acetylcholine-gated cation channels, epinephrine–Gs–cAMP, insulin receptor kinase–GLUT4, and intracellular steroid receptor–transcription mechanisms.
- `public/biology/neural-signalling/action-potential-trace.svg`: rest/threshold markers shifted into closer plotted alignment; labels remain approximate schematic values, not measured voltages.

## Validation evidence and what was NOT run

1. GitHub compare of starting SHA with the working branch *before this handoff*: 14 commits ahead, zero behind; all 10 changed paths inside exactly the permitted five lesson packages, their illustrations, `docs/biology/final-c1-c2/` or `scripts/biology/final-c1-c2/`; zero off-scope paths.
2. **Executed through the authenticated GitHub connector as in-memory assertions against the actual committed JSON/SVG contents:** 83 sections, 159 questions, 664 option-feedback records counted (lesson checks plus assessment options), all expected levels/identifiers, claim-reference/teaching-block text alignment, data-table shapes, markscheme point counts, feedback specificity, one-correct-choice requirements, new figure-file presence and 83 completion-ledger rows. **Result: zero errors in these targeted checks.**
3. Added read-only runnable regression validator: `node scripts/biology/final-c1-c2/validate.mjs`. Its source was inspected, but **it has not been executed in a checked-out Node repository environment**. Automated checking is not a substitute for expert review.
4. **NOT EXECUTED / NOT VERIFIED:** all pre-existing curriculum, source, lesson, assessment and figure test commands; `npm run quality`; `npm run build`; desktop and mobile browser regression suites; rendered SVG label-collision/contrast checks; external link access; professional scientific proofreading. The GitHub connection supports reading/writing commits but does not provide an executable repository shell, and this environment cannot fetch the repository through network DNS. There are no CI status checks reported for the pre-handoff HEAD. Do not mark these tests as passed.
5. When an executable checkout is available, run `node scripts/biology/final-c1-c2/validate.mjs`, `node scripts/validate-biology.mjs`, `node scripts/validate-lessons.mjs`, `node scripts/validate-phase5-figures.mjs`, the available source/phase validators, `npm run quality`, `npm run build` and the existing browser smoke/figure regression commands; preserve the logs and rerun after every fix. This branch should not be considered release-ready before these gates pass.

## Outstanding limitations and exact identifiers

No understanding IDs are absent from the lesson packages or ledger. However, all **83** still await complete line-by-line expert scientific/teaching review and runtime QA, specifically **C1.1.1–C1.1.17, C1.2.1–C1.2.17, C1.3.1–C1.3.19, C2.1.1–C2.1.14, C2.2.1–C2.2.16**. This is an explicit unfinished review gate, not a claim of completion.

Further targeted needs include investigating the guide/Hodder use of *nitrous oxide* against the established nitric-oxide (NO) signalling mechanism (C2.1.4), checking whether photosynthesis CO₂-starvation language conveys the indirect PSII feedback correctly (C1.3.19), checking metabolic diagram carrier-shuttle interpretation (C1.2.13–C1.2.16), and physically inspecting the figures on narrow viewports (C1.2.11, C2.1.7, C2.2.10).

**No qualified third-party expert, IB affiliation/endorsement, publisher permissions review or public deployment is claimed.** Leave integration/main unchanged until an explicit future integration decision.
