# BioLab Themes A & B — Final isolated-branch handoff

**Date:** 2026-10-17  
**Repository:** `veyro-lb/litlab`  
**Source integration branch:** `feature/biolab-complete-course-integration-20261017`  
**Isolated content branch:** `feature/biolab-themes-ab-final-completion-20261017`  
**Exact starting SHA:** `2c321ae547baa2a97294728b337a4dfa46e64408`  
**Exact last teaching-content SHA:** `eed5f0cef947b54812df7b6c9e0930327426d47d`  
**Exact validation-script checkpoint SHA:** `7e25a03859b608c74c5a0038b3e95270c8e0f4b1`  
**Final handoff-commit SHA:** Resolve the live branch ref after this report commit; a self-committing report cannot embed its own Git hash. The final user-facing handoff states that SHA explicitly.

**Disposition: INCOMPLETE — safe isolated progress, not release-ready.** None of the 19 topics is represented as having received independent final certification. The three edited topics are *partially* improved; the remaining 16 topics are not modified in this branch.

## 1. Verifiable coverage and exact remainder

The existing registry and lesson catalog map **19 assigned topics**, **95 Theme A understandings** and **123 Theme B understandings**, for **218 numbered understandings**. In this work, **13** understanding-level items received targeted source-context and content checks tied to real edits; **205** remain pending individual substantive scientific/educational review. This is **not** a claim that only 13 original draft sections exist: all 218 were already mapped in the pre-existing course.

The exact ID-by-ID result is in [UNDERSTANDING_LEDGER.json](./UNDERSTANDING_LEDGER.json). Each record identifies level, evidence checked, correction, visual, question, structural check, outstanding work and independent-review status. Existing source locators for untouched sections are marked as inherited metadata, not newly checked sources.

| Topic | Number of understandings | Targeted reviewed | Remainder |
|---|---:|---:|---:|
| A1.1 Water | 8 | 0 | 8 |
| A1.2 Nucleic acids | 15 | 8 | 7 |
| A2.1 Origins of cells (HL) | 9 | 0 | 9 |
| A2.2 Cell structure | 14 | 2 | 12 |
| A2.3 Viruses (HL) | 6 | 0 | 6 |
| A3.1 Diversity of organisms | 15 | 0 | 15 |
| A3.2 Classification and cladistics (HL) | 9 | 0 | 9 |
| A4.1 Evolution and speciation | 11 | 0 | 11 |
| A4.2 Conservation of biodiversity | 8 | 0 | 8 |
| B1.1 Carbohydrates and lipids | 13 | 0 | 13 |
| B1.2 Proteins | 12 | 0 | 12 |
| B2.1 Membranes and membrane transport | 17 | 3 | 14 |
| B2.2 Organelles and compartmentalization | 9 | 0 | 9 |
| B2.3 Cell specialization | 10 | 0 | 10 |
| B3.1 Gas exchange | 13 | 0 | 13 |
| B3.2 Transport | 18 | 0 | 18 |
| B3.3 Muscle and motility (HL) | 10 | 0 | 10 |
| B4.1 Adaptation to environment | 8 | 0 | 8 |
| B4.2 Ecological niches | 13 | 0 | 13 |
| **Total** | **218** | **13** | **205** |

All original IDs, their SL/HL scope and the course/lesson registries remain unchanged. The source integration branch was rechecked and still pointed to `2c321ae...` when the development diff was inspected. No Theme C or D lesson changed.

## 2. Content implementation and science corrections

### A1.2 Nucleic acids — 8 targeted understandings

- **A1.2.5:** added polymerase-catalyzed 3′-end RNA extension steps with nucleotide triphosphate and pyrophosphate release, explicitly distinguishing that reaction from a simplified condensation drawing.
- **A1.2.6:** explained antiparallel aligned complementary DNA versus the partner rewritten 5′→3′.
- **A1.2.9:** added calculated `4^n` comparisons, explicitly distinguishing finite choices at fixed length from vastly increasing total sequence capacity.
- **A1.2.10:** connected the almost universally conserved codon assignments to common ancestry, without claiming identical genomes or zero exceptions.
- **A1.2.11:** showed why extension occurs at a 3′ hydroxyl and synthesis runs 5′→3′.
- **A1.2.12:** compared correct purine–pyrimidine pairing geometry with mismatched base widths.
- **A1.2.13:** replaced a withheld figure with newly authored conceptual nucleosome SVG. Corrected/clarified ~147 bp wrapped around two each H2A/H2B/H3/H4, H1 associated with linker/entry–exit DNA and *not* part of the core octamer. The separate opt-in RCSB 1KX5 molecular viewer was preserved.
- **A1.2.15:** compared tetranucleotide predictions with the evidence-based Chargaff interpretation without passing invented percentage data off as historical measurement.

**Assessment:** replaced a rote A1.2.13 question with molecular-model reasoning; added two original four-mark HL questions on strand elongation and nucleosome interpretation. Other useful questions were preserved. Original exam-style practice is **not** official IB examination material.

### B2.1 Membranes and membrane transport — 3 targeted understandings

- **B2.1.7:** replaced withheld open-pore-like ATP-pump art with a labelled alternating-access process model.
- **B2.1.15:** replaced withheld pump art with 3 Na⁺ out / 2 K⁺ in per ATP, one net outward positive charge and an explicit distinction between pump contribution and ion-channel-dependent resting potential.
- **B2.1.16:** replaced withheld cotransport art with an apical SGLT / basolateral Na⁺/K⁺-ATPase / basolateral GLUT schematic. Emphasized ATP's *indirect* contribution to SGLT and avoided universal claims about SGLT coupling ratio.

**Assessment:** added two original four-mark HL cause-and-effect questions about ATPase inhibition and loss of ion gradients. Existing questions retained.

### A2.2 Cell structure — 2 targeted understandings

- **A2.2.2:** added a four-stage eyepiece-graticule calibration procedure, a calculated two-objective comparison, and an original five-mark problem (100 µm over 40 or 80 arbitrary ocular divisions, yielding a consistent 30 µm cell size). Numbers are explicitly hypothetical, **not** real micrograph measurements.
- **A2.2.9:** added a four-way comparison of multinucleate aseptate fungal hyphae and skeletal muscle fibres versus anucleate mature mammalian erythrocytes and phloem sieve elements. Added original four-mark biological reasoning about atypical eukaryotic cells.

Pre-existing A2.2 microscopy examples and their limits were deliberately preserved. The existing cited Commons onion-light-microscope work is attributed to Kateryna Kot under CC BY-SA 4.0; the mammalian lung TEM image is attributed to Louisa Howard and marked public domain on its source page. **This limited license-page check does not verify every exact derived image URL, scale-bar assertion, all tissue micrographs or rights for unrelated source figures.** Do not fabricate a scale bar where original calibration evidence is missing.

## 3. Diagram and provenance changes

Four original local SVG figures were added, identified by exact filename and scientific limitations in [FIGURE_PROVENANCE.json](./FIGURE_PROVENANCE.json). These are **labelled models**, not authentic micrographs, third-party images, empirical datasets or atom-resolved structure files. Prior inaccurate image files were left in place as historical assets but are no longer referenced by the edited lessons. New visual `alt` text, semantic figure metadata and drawing limitations are present; keyboard/light–dark/mobile rendering has **not** been independently inspected.

Source material read for targeted edits: the attached official first-assessment-2025 Biology Guide (A1.2 printed pp.35–38; A2.2 printed pp.39–40; B2.1 printed pp.52–54), and relevant chapters of Clegg, Davis and Talbot (2023), *Biology for the IB Diploma Programme*, third edition. Source wording, protected textbook diagrams and official question banks were **not** reproduced. Future public publication requires an independent rights/legal check for use of IB-branded curriculum mapping and other licensed publisher materials; this branch does not grant permission.

## 4. Verification actually performed

**Confirmed through authenticated GitHub reads and connector-side structured checks:** integration starting SHA; separate branch ancestry; the 19 topic / 95 A / 123 B / 218 understanding registry counts; intended lesson-to-registry IDs and SL/HL level for the three edited topics; correct aligned claim/teaching paragraphs; new comparison table dimensions; new visual anchors; one keyed correct option per checked four-choice question; new written marking-point counts equal marks; original IDs retained; the branch diff limited to A/B lesson edits, four local SVGs, dedicated completion documentation and isolated tests. Existing topic/lesson metadata remained intact.

**New reproducible checks authored, NOT executed in Node in this environment:**

```sh
node scripts/biology/themes-ab-final/validate.mjs
node --test scripts/biology/themes-ab-final/negative.test.mjs
```

These test files live under a new exclusive directory, without modifying shared QA ownership files. The negative cases cover dropped understanding, SL/HL leak, wrong answer key, claim mapping drift, ragged visual table and mismatched written marks. They also verify the full 19-topic mapping and local active asset paths on actual checkout.

**Not executed here:** `npm ci`, `npm run quality`, `npm run build`, existing validators, formal Node negative tests, Chromium/Playwright/browser screenshots and 320/390/768/1024/1440/1920 px responsive checks. This environment can edit the connected GitHub repository but cannot clone its Git remote locally. The current A/B branch had **zero workflow runs** visible for the checked commit; historical CI on other SHAs/branches does not prove these edits pass. Do not mark build green.

## 5. Remaining issues and release blockers

1. **205 individual understandings still pending targeted scientific/educational review:** the per-ID remaining scope is the ledger. The 16 untouched topics need systematic work; the three partially edited topics also contain pending sections.
2. **A2.2 microscopy:** verify actual image load, provenance, any purported image-calibration bar and the full observation-based identification/drawing exercise. Never infer measurements from a photo without a verified scale.
3. **B3.1/B3.2:** obtain/verify appropriate rights-cleared stomata, tissues and vascular microscopy; cross-check full transport pathways and heart anatomy.
4. **B3.3/B4.1/B4.2:** scientifically review sarcomere and motor unit geometry, field transects, ecological evidence and prescribed Hominidae comparisons.
5. **Visual access and rights:** inspect all four SVGs for scientific geometry, legibility, dark/light rendering and keyboard enlargement; get explicit publication clearance. Existing reviewed sources are not approval for BioLab itself.
6. **Assessment rigor:** verify all original questions' keys, mark allocation, distractor feedback, quantitative models and SL/HL presentation; calibrate independently with IB subject experts.
7. **Real project verification:** perform clean install, quality, build, topic validators, targeted negative tests, regression smoke and student browser QA. Do not disable existing failing tests.

## 6. Safe selective integration procedure

1. Fetch current integration HEAD again; do **not** reset or force-push that branch. The recorded integration base was `2c321ae...`, which is not promised to remain its current head.
2. Compare current integration changes against this isolated branch for the three exact lesson files: `src/biology/learning/nucleic-acids/lesson.json`, `src/biology/learning/membranes-transport/lesson.json`, `src/biology/learning/cell-structure/lesson.json`. Prefer selective per-understanding field reconciliation when newer concurrent edits touch the same sections.
3. Import the four new SVGs alongside their updated asset references, preserve original identifiers, then selectively accept the original questions and visible `visuals` / `graphTables` additions. Do **not** mix a new asset reference with missing SVG bytes.
4. The content change commits, in order, are `bacf6f02959e81b049fe5fb1608621f5a38b9e91` (A1.2), `1627e2ff358a788050bbac0cd537229008c6accf` (B2.1), `eed5f0cef947b54812df7b6c9e0930327426d47d` (A2.2). The subsequent ledger and QA commits are documentary/test-only. Cherry-pick only after checking conflicts; never blindly overwrite concurrent work.
5. Run `npm ci`, `npm run quality`, `npm run build`, `node scripts/biology/themes-ab-final/validate.mjs`, `node --test scripts/biology/themes-ab-final/negative.test.mjs`, existing lesson/theme/negative validators and browser checks. Get qualified owner sign-off before merging.
6. Keep all work isolated until integration approval. **No merge into `main`, no public deploy, no certification claim.**
