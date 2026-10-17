# BioLab — Master Integration Report

**Date:** 2026-10-18  
**Repository:** `veyro-lb/litlab`  
**Protected baseline branch:** `feature/biolab-complete-course-integration-20261017`  
**Exact baseline SHA:** `2c321ae547baa2a97294728b337a4dfa46e64408`  
**Integration-only branch:** `feature/biolab-all-sprints-integration-20261018`  
**Integrated code snapshot before this report:** `868dded7c46ed22d5810cd9c32d331f7c22f1d47`  
**Final HEAD:** Resolve the live SHA of `feature/biolab-all-sprints-integration-20261018` after the report is committed; a tracked report cannot embed its own commit SHA.

## Release decision

**NO-GO for public release.** All eleven specialist content, QA and interface branches have been incorporated and the application compiles in isolated CI. Independent qualified scientific approval, textbook/IB licensing or redistribution authorization, full assistive-technology accessibility review, and a separately scoped IB-only source policy review have not been demonstrated. Do not merge, deploy or claim certification.

## Source-branch exact SHA matrix

| Scope | Branch | Inspected source HEAD |
| --- | --- | --- |
| Themes A/B foundation | `feature/biolab-themes-ab-final-completion-20261017` | `4cd33a7d54bde055e123bd9052ea59c36aae9232` |
| A1–A2 | `feature/biolab-final-a1-a2-20261017` | `81b8bc1fd9831b81aa1d72a72ebb1fe1fa6e79bb` |
| A3–A4 | `feature/biolab-final-a3-a4-20261017` | `25221e0d18a2ee152602233974ce58559c0665fd` |
| B1–B2 | `feature/biolab-final-b1-b2-20261017` | `b98cd602af93f70467fdbb6184c1d10d09527034` |
| B3–B4 | `feature/biolab-final-b3-b4-20261017` | `108bd0cdd784a3d61f2c0b7e68e8574c98a559c6` |
| C1–C2 | `feature/biolab-final-c1-c2-20261017` | `c6d7707901b6d8ad71bee5d87b7c7bd4d1b15cb5` |
| C3–C4 | `feature/biolab-final-c3-c4-20261017` | `cade061c3c580e0121b4f04b4ef389831f8185d5` |
| D1–D2 | `feature/biolab-final-d1-d2-20261017` | `8b75783c7eeee6666cb4a5dfd31ec7bcbb6a35aa` |
| D3–D4 | `feature/biolab-final-d3-d4-20261017` | `3a1c584f77a0076afa29f73440f4876468e2afb3` |
| Independent QA | `feature/biolab-independent-student-qa-20261017` | `fc6abad987ee20014cd70b52030a8d1d5c4356f2` |
| Premium interface | `feature/biolab-premium-student-interface-20261017` | `5cf7c97399f181250f80aadaae3f1ae6c7d2bf93` |

Note: the premium source branch's code implementation was `27588488d0a4c38b4a9c932b736235906f293d6a`. The later source HEAD `5cf7c97399f181250f80aadaae3f1ae6c7d2bf93` added only `docs/biology/premium-student-interface/FINAL_DESIGN_HANDOFF.md`; this document is carried into the combined branch without overwriting newer application code. Other source HEADs were rechecked and matched their initial inspections.

## Integration strategy and commits

The new branch was created from the exact baseline commit; original `main`, the baseline, and all specialist branches were left unchanged. Real changed Git blob entries were imported atop the current integration tree, committed in coherent topic checkpoints. The A/B foundation was applied before topic-specific A/B changes. For the A and B specialist branches that descended from the A/B source, only the diff **after** the foundation was applied, preventing older common files from replacing newer verified work.

| Stage | Integration commit |
| --- | --- |
| A/B foundation | `9166aa17d15d927558a167955efa45cd8c8fa7e4` |
| A1–A2 | `e147a7e2e9e85696e5bdef2a036908ed20a6a20c` |
| A3–A4 | `317366e68d59d38af3cf26711b4f6ba7f46bfbd7` |
| B1–B2 | `0ca34d57ec7c686126931cc5a648b72da5cd98d6` |
| B3–B4 | `409e87275e3301a614656b8b252e1dfcafbf8ab8` |
| C1–C2 | `a1d80f257fa3cdf26184049f285a384b17711a1e` |
| C3–C4 | `b9bec537c78fe51b3f6d6d44a6b80774a6d1bc7d` |
| D1–D2 | `7cea4d2cef0ab697b8437a62e4f50f83adec120b` |
| D3–D4 | `ab4cacfe7e52d740dee98243ecc0b1984c3d534d` |
| Independent QA toolkit | `0dd219876128797203fea3d161fa190613fd223b` |
| Premium interface | `ce3a1b53b0f3653eecf4e0f7f681c4b342744ebc` |

Follow-on integration fixes were committed only to `feature/biolab-all-sprints-integration-20261018`. They reconcile new original assessment provenance, source-claim teaching text, accurate source metadata, replacement-artwork checks, and earlier test fixtures that assumed now-obsolete question counts or single-paragraph explanations. All changed tests retain positive and negative validation requirements; they do not disable gates.

## Complete changed-file inventory at integrated code snapshot

Diff: `2c321ae547baa2a97294728b337a4dfa46e64408...868dded7c46ed22d5810cd9c32d331f7c22f1d47`. 130 changed tracked paths before the later premium handoff and this report. The `registry.json` and `catalog.json` were preserved byte-for-byte from the baseline.

### Lessons (40)

- `src/biology/learning/adaptation-environment/lesson.json`
- `src/biology/learning/carbohydrates-lipids/lesson.json`
- `src/biology/learning/cell-nuclear-division/lesson.json`
- `src/biology/learning/cell-respiration/lesson.json`
- `src/biology/learning/cell-specialization/lesson.json`
- `src/biology/learning/cell-structure/lesson.json`
- `src/biology/learning/chemical-signalling/lesson.json`
- `src/biology/learning/classification-cladistics/lesson.json`
- `src/biology/learning/climate-change/lesson.json`
- `src/biology/learning/conservation-biodiversity/lesson.json`
- `src/biology/learning/defence-against-disease/lesson.json`
- `src/biology/learning/diversity-organisms/lesson.json`
- `src/biology/learning/dna-replication/lesson.json`
- `src/biology/learning/ecological-niches/lesson.json`
- `src/biology/learning/enzymes-metabolism/lesson.json`
- `src/biology/learning/evolution-speciation/lesson.json`
- `src/biology/learning/gas-exchange/lesson.json`
- `src/biology/learning/gene-expression/lesson.json`
- `src/biology/learning/homeostasis/lesson.json`
- `src/biology/learning/inheritance/lesson.json`
- `src/biology/learning/integration-body-systems/lesson.json`
- `src/biology/learning/membranes-transport/lesson.json`
- `src/biology/learning/muscle-motility/lesson.json`
- `src/biology/learning/mutation-gene-editing/lesson.json`
- `src/biology/learning/natural-selection/lesson.json`
- `src/biology/learning/neural-signalling/lesson.json`
- `src/biology/learning/nucleic-acids/lesson.json`
- `src/biology/learning/organelles-compartmentalization/lesson.json`
- `src/biology/learning/origins-cells/lesson.json`
- `src/biology/learning/photosynthesis/lesson.json`
- `src/biology/learning/populations-communities/lesson.json`
- `src/biology/learning/protein-synthesis/lesson.json`
- `src/biology/learning/proteins/lesson.json`
- `src/biology/learning/reproduction/lesson.json`
- `src/biology/learning/stability-change/lesson.json`
- `src/biology/learning/transfers-energy-matter/lesson.json`
- `src/biology/learning/transport/lesson.json`
- `src/biology/learning/viruses/lesson.json`
- `src/biology/learning/water-potential/lesson.json`
- `src/biology/learning/water/lesson.json`

### Artwork (24)

- `public/biology/carbohydrates-lipids/lipids-recall.svg`
- `public/biology/carbohydrates-lipids/lipids.svg`
- `public/biology/cell-nuclear-division/mitosis-stages-2n4.svg`
- `public/biology/cell-respiration/respiration-connected-pathways.svg`
- `public/biology/chemical-signalling/receptor-mechanisms.svg`
- `public/biology/climate-change/d43-carbon-pathways.svg`
- `public/biology/homeostasis/d33-glucose-feedback.svg`
- `public/biology/inheritance/d32-monohybrid-grid.svg`
- `public/biology/membranes-transport/intestinal-glucose-topology-20261017.svg`
- `public/biology/membranes-transport/pump-alternating-access-20261017.svg`
- `public/biology/membranes-transport/sodium-potassium-pump-20261017.svg`
- `public/biology/membranes-transport/transport-pathways-20261017.svg`
- `public/biology/muscle-motility/sarcomere-mobile.svg`
- `public/biology/muscle-motility/sarcomere.svg`
- `public/biology/natural-selection/d41-selection-mechanism.svg`
- `public/biology/neural-signalling/action-potential-trace.svg`
- `public/biology/nucleic-acids/nucleosome-topology-20261017.svg`
- `public/biology/populations-communities/exponential-semilog.svg`
- `public/biology/protein-synthesis/translation-codon-anticodon.svg`
- `public/biology/reproduction/d31-fertilization-sequence.svg`
- `public/biology/reproduction/d31-flower-structures.svg`
- `public/biology/stability-change/d42-harvest-rates.svg`
- `public/biology/transport/heart-frontal-mobile.svg`
- `public/biology/transport/heart-frontal.svg`

### Ui (11)

- `src/biology/BiologyApp.tsx`
- `src/biology/components/BiologyDashboard.tsx`
- `src/biology/components/CurriculumOverview.tsx`
- `src/biology/components/ResourceNav.tsx`
- `src/biology/components/TopicOverview.tsx`
- `src/biology/entry.tsx`
- `src/biology/learning/gene-expression/lesson.test.mjs`
- `src/biology/learning/mutation-gene-editing/lesson.test.mjs`
- `src/biology/learning/protein-synthesis/lesson.test.mjs`
- `src/biology/learning/water-potential/lesson.test.mjs`
- `src/biology/premium-student-interface.css`

### Checks (31)

- `scripts/biology-premium-interface-smoke.mjs`
- `scripts/biology/final-a1-a2/verify.test.mjs`
- `scripts/biology/final-a3-a4/validate.mjs`
- `scripts/biology/final-a3-a4/validate.test.mjs`
- `scripts/biology/final-b1-b2/verify.mjs`
- `scripts/biology/final-b3-b4/negative.test.mjs`
- `scripts/biology/final-b3-b4/validate.mjs`
- `scripts/biology/final-c1-c2/validate.mjs`
- `scripts/biology/final-c3-c4/validate-final-sprint.mjs`
- `scripts/biology/final-c3-c4/validate-final-sprint.test.mjs`
- `scripts/biology/final-d1-d2/negative.test.mjs`
- `scripts/biology/final-d1-d2/verify.mjs`
- `scripts/biology/final-d3-d4/validate.mjs`
- `scripts/biology/parallel-student-qa/README.md`
- `scripts/biology/parallel-student-qa/audit.mjs`
- `scripts/biology/parallel-student-qa/audit.test.mjs`
- `scripts/biology/parallel-student-qa/browser.mjs`
- `scripts/biology/theme-a/a3-2-qa.mjs`
- `scripts/biology/theme-c1/c12.test.mjs`
- `scripts/biology/theme-c1/c13.test.mjs`
- `scripts/biology/theme-c1/c21.test.mjs`
- `scripts/biology/theme-c1/c22.test.mjs`
- `scripts/biology/themes-ab-final/negative.test.mjs`
- `scripts/biology/themes-ab-final/validate.mjs`
- `scripts/validate-batch5.mjs`
- `scripts/validate-batch5.test.mjs`
- `scripts/validate-lesson.test.mjs`
- `scripts/validate-phase5-figures.mjs`
- `scripts/validate-phase5-figures.test.mjs`
- `scripts/validate-phase7-batch3.mjs`
- `scripts/validate-phase7-batch3.test.mjs`

### Docs (21)

- `docs/biology/final-a1-a2/FINAL_HANDOFF.md`
- `docs/biology/final-a3-a4/FINAL_HANDOFF.md`
- `docs/biology/final-b1-b2/FINAL_HANDOFF.md`
- `docs/biology/final-b1-b2/QA_EVIDENCE.json`
- `docs/biology/final-b3-b4/FIGURE_PROVENANCE.md`
- `docs/biology/final-b3-b4/FINAL_HANDOFF.md`
- `docs/biology/final-b3-b4/QA_RESULTS.json`
- `docs/biology/final-b3-b4/UNDERSTANDING_LEDGER.json`
- `docs/biology/final-c1-c2/COMPLETION_LEDGER.json`
- `docs/biology/final-c1-c2/FINAL_HANDOFF.md`
- `docs/biology/final-c3-c4/FINAL_HANDOFF.md`
- `docs/biology/final-c3-c4/INTERNAL_QA_EVIDENCE.json`
- `docs/biology/final-d1-d2/FINAL_HANDOFF.md`
- `docs/biology/final-d3-d4/FINAL_HANDOFF.md`
- `docs/biology/parallel-student-qa/COURSE_SOURCE_SCAN.json`
- `docs/biology/parallel-student-qa/FINAL_STUDENT_EXPERIENCE_REPORT.md`
- `docs/biology/parallel-student-qa/FINDINGS.json`
- `docs/biology/parallel-student-qa/QA_EXECUTION_EVIDENCE.json`
- `docs/biology/themes-ab-final-completion/FIGURE_PROVENANCE.json`
- `docs/biology/themes-ab-final-completion/FINAL_HANDOFF.md`
- `docs/biology/themes-ab-final-completion/UNDERSTANDING_LEDGER.json`

### Ci (3)

- `.github/workflows/biolab-independent-student-qa.yml`
- `.github/workflows/biolab-master-integration-qa.yml`
- `.github/workflows/biolab-premium-interface-qa.yml`

## Verified course identity and assessment coverage

Read the actual integrated `src/biology/curriculum/registry.json` and `src/biology/learning/catalog.json`: 40 / 40 topics, 553 / 553 distinct numbered understandings, exactly 337 shared SL/HL and 216 additional HL, 40 registered lesson packages, no duplicate IDs and no orphan catalog keys. The generic validator also passed for all 40 lesson packages on the integration branch. Scope boundaries and question mappings are exercised by the source and imported negative validators.

The corrected A2.1.2 item `a21-p1a-2` is included: it asks why bacteriophage lambda is not a self-sustaining living cell, keys dependence on a host's machinery, and supplies differentiated feedback. The dedicated A1–A2 negative keyed-answer test is included in combined CI.

## Conflict resolution and non-regressions

- **A/B overlap:** applied the foundation first and then descendant topic diffs rather than overwriting entire historical branch trees. B2.1 keeps the latest revised membrane transport, 3 Na+ / 2 K+ pump explanation, transport comparison visual and separately authored artwork.
- **Original versus reviewed figures:** the old B2.1 phase-7 checks assumed every image has a recall paired file; modern replacement single-frame artwork is now exact-path allowlisted with legacy recall pairs and invalid-path negative tests preserved.
- **A1.2 nucleosome replacement:** original figure safety/structural tests were updated to inspect the new reviewed diagram; histone counts, H1 outside octamer and SVG-safety invariants remain asserted.
- **C1–C2 newer questions:** six original items now retain provenance `original:true`; previous quantitative counts were reconciled with the real new question IDs and scope.
- **C3–C4 and D1–D2 source mappings:** 97 teaching-section source claim records were synchronized to their corresponding already-authored teaching paragraphs after verifying matching existing reference IDs; no scientific teaching text was rewritten for this repair. C3.2 CDC/WHO reference records received missing metadata.
- **A2.1.2 specialist test:** corrected an impossible self-comparison of first-option feedback; now requires nonempty distinct explanations for all answer options.
- **Multi-paragraph renderer test:** now checks that every paragraph of the taught explanation is present, rather than incorrectly expecting a multi-paragraph block inside one HTML paragraph.
- **Source provenance and release:** no file from an obsolete historical snapshot replaced a newer integrated one; no qualified scientific certification was invented and no main branch, public deployment or student account data was changed.

## CI and test evidence

Isolated non-deploying GitHub Actions workflow: `.github/workflows/biolab-master-integration-qa.yml`.

- **npm ci:** PASS on new integration branch.
- **npm run quality:** PASS on new integration branch.
- **All existing curriculum, diagram, source, assessment, negative and per-topic validators:** PASS at `868dded7c46ed22d5810cd9c32d331f7c22f1d47` (CI run below).
- **All newly imported specialist validators and independent QA static and negative checks:** PASS at `868dded7c46ed22d5810cd9c32d331f7c22f1d47`.
- **npm run build:** PASS at `868dded7c46ed22d5810cd9c32d331f7c22f1d47` using Node 22 / GitHub-hosted Linux.
- **Original baseline build for before/after comparison:** PASS.
- **Cross-course Chromium and premium-responsive browser suites:** underway in the isolated network-disabled GitHub Actions container at the time of this first report write; do not claim pass before inspecting the run and artifact.

Evidence run: https://github.com/veyro-lb/litlab/actions/runs/39071364133 (code SHA `868dded7c46ed22d5810cd9c32d331f7c22f1d47`). The CI workflow captures real logs and screenshot evidence, and it **fails closed** if any required check fails, including a skipped browser gate.

The independent QA branch's previously completed 79/79 Chromium checks and the premium branch's 20/20 screenshots and checks apply only to their respective isolated source snapshots. They are historical reference evidence, not test results for the new integrated application.

## Pending independent checks and limitations

1. A suitably qualified IB Biology reviewer must independently verify accuracy, coverage, misconceptions, mark schemes and all answer keys. Automated validators check structure/known constraints, not scientific truth.
2. **D4.3 Climate change** retains specialist NASA/NOAA research references. Keep them for scientific accuracy during integration and mark for the separate IB-only-source review; do not silently rewrite or delete legitimate evidence.
3. The IB Biology Guide and Hodder 3rd-edition teaching textbook have explicit intellectual-property restrictions. Source comparison and internal referencing do not authorize publication/reproduction of protected material, nor imply IB endorsement.
4. Full accessible-technology audit including actual screen-reader operation and browser native 200% zoom, rigorous WCAG review, and owner-directed protected preview remain outstanding.
5. Any browser regression or workflow infrastructure issue uncovered in the current run must be tracked and resolved before an engineering-ready decision. A passing build is not a release approval.

**Integration is real and committed, but production release is explicitly prohibited without later signoff.**
