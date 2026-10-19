# BioLab file-level integration and conflict matrix

Integration base: `a03f8f86af7009a529b6aaf8fd7e581a3928de52`. Destination: `feature/biolab-final-consolidation-and-depth-20261018`. Verified remote heads: depth `81a9ece5203b9a12cb89808cab338b7c4ceb449a`, visual `e8549a64c333654a3a1b00f727f83e05d043f771`, layout `105cdd7bc7291c2ddced6c0e7d1cca8afe29fa17`.

## Conflict resolution

- **Eight overlapping lesson JSONs**: `cell-nuclear-division`, `cell-respiration`, `dna-replication`, `neural-signalling`, `nucleic-acids`, `photosynthesis`, `protein-synthesis`, `transport`. Three-way comparison uses the common integration baseline; preserve visual branch figure placements, original diagrams and asset replacement, then copy depth branch's teaching changes and additive original diagram registrations. Asset lists are merged by stable asset ID; withdrawn PDF crop paths are not restored.
- **Renderer/shared schema**: adopt the visual-repair version of `ScientificFigure.tsx`, `figure-presentation.ts`, `lesson-contract.ts` and `biology.css`. The visual branch had selectively incorporated the layout branch's accessible sizing and zoom work; do not revert it.
- **Copyright**: remove exactly 18 `public/biology/source-pdf-figures/*.png` files. Attribution/source records are retained but public reuse is not presumed. Do not include source crops from the read-only Hodder audit.
- **Source-depth**: preserve all eight prior source-informed teaching updates and seven original figures. Independently review four additional HL respiration understandings C1.2.14–C1.2.17; keep 541 remaining reviews explicitly open.
- **Only-layout support**: include its browser script, workflow and QA report for historical evidence, but the new consolidated workflow is the relevant new-branch acceptance gate.

## File-level reconciliation (146 unique touched paths)

| Repository file | Workstream(s) | Integration action |
| --- | --- | --- |
| `.github/workflows/biolab-figure-layout-qa.yml` | layout | TAKE FIGURE-LAYOUT SUPPORT FILE |
| `.github/workflows/biolab-full-course-depth-audit.yml` | depth | TAKE DEPTH AUDIT |
| `.github/workflows/biolab-scientific-visual-assets-repair.yml` | visual | TAKE VISUAL REPAIR |
| `.gitignore` | visual | TAKE VISUAL REPAIR |
| `docs/biology/figure-layout-refinement/IMPLEMENTATION_AND_VERIFICATION.md` | layout | TAKE FIGURE-LAYOUT SUPPORT FILE |
| `docs/biology/full-course-depth-audit/PRELIMINARY_STATIC_RESULTS.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/README.md` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-A.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-B-molecules-cells.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-B-organisms-ecosystems.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-C.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-D-molecules-cells.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/full-course-depth-audit/matrix-D-organisms-ecosystems.json` | depth | TAKE DEPTH AUDIT |
| `docs/biology/scientific-visual-assets-repair/BASELINE_INVENTORY.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/CHANGE_LEDGER.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/CO2_DATA_RIGHTS_AND_VALUES.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/EMBEDDED_VISUAL_INVENTORY.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/EXTERNAL_RIGHTS_LEDGER.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/FILES_CHANGED.txt` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/FINAL_INVENTORY.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/PHYSICAL_ASSET_INVENTORY.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/QA_RESULTS.md` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/README.md` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/TOPIC_COUNTS.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/TOPIC_COUNTS.md` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/UNDERSTANDING_COVERAGE.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/README.md` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/after-C1.2.12-krebs-cycle-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/after-C1.2.12-krebs-cycle-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/after-C1.3.11-thylakoid-chemiosmosis-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/after-C1.3.11-thylakoid-chemiosmosis-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/before-C1.2.12-krebs-cycle-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/before-C1.2.12-krebs-cycle-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/before-C1.3.11-thylakoid-chemiosmosis-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/before-C1.3.11-thylakoid-chemiosmosis-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-C2.2.1-neuron-structure-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-C2.2.1-neuron-structure-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-C4.2.20-keeling-monthly-observed-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-C4.2.20-keeling-monthly-observed-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-D3.2.13-autosomal-recessive-pedigree-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-D3.2.13-autosomal-recessive-pedigree-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-D3.3.8-filtration-reabsorption-1440.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-D3.3.8-filtration-reabsorption-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-after-report.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-svg-bounds.json` | visual | TAKE VISUAL REPAIR |
| `docs/biology/scientific-visual-assets-repair/evidence/final-zoom-krebs-390.png` | visual | TAKE VISUAL REPAIR |
| `docs/biology/source-figure-credits.json` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/dicot-leaf-light-original.jpg` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/dicot-leaf-light.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/galapagos-finch.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/mitochondrion-tem-original.jpg` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/mitochondrion-tem.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/neutrophil-mrsa-sem-original.jpg` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/neutrophil-mrsa-sem.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/onion-root-mitosis.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/pancreas-secretory-cell-tem-original.jpg` | visual | TAKE VISUAL REPAIR |
| `public/biology/authentic/pancreas-secretory-cell-tem.webp` | visual | TAKE VISUAL REPAIR |
| `public/biology/carbohydrates-lipids/polysaccharides.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-nuclear-division/crossing-over.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-nuclear-division/meiosis-separation.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-nuclear-division/meiosis-two-variation-mechanisms.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/cell-respiration/krebs-cycle.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-respiration/mitochondrial-chemiosmosis.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-respiration/nadh-electron-energy-transfer.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/cell-structure/a22-eukaryote-recall.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-structure/a22-eukaryote.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-structure/a22-prokaryote-recall.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/cell-structure/a22-prokaryote.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/classification-cladistics/vertebrate-tree.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/dna-replication/bacterial-replication-enzymes.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/dna-replication/helicase-opening.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/dna-replication/replication-enzyme-sequence.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/homeostasis/d33-negative-feedback.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/homeostasis/filtration-reabsorption.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/homeostasis/loop-henle-gradient.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/inheritance/autosomal-recessive-pedigree.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/membranes-transport/mechanism-13-recall.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/membranes-transport/mechanism-13.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/natural-selection/d41-selection-patterns-mobile.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/natural-selection/d41-selection-patterns.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/neural-signalling/neuron-structure.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/neural-signalling/saltatory-conduction-nodes.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/neural-signalling/saltatory-conduction.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/nucleic-acids/dna-rna-comparison.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/nucleic-acids/hershey-recall.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/nucleic-acids/hershey.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/nucleic-acids/rna-polymer.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/photosynthesis/calvin-carbon.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/photosynthesis/thylakoid-chemiosmosis.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/protein-synthesis/alternative-splicing.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/protein-synthesis/translation-elongation-cycle.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/protein-synthesis/translation-elongation.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/source-pdf-figures/a11-water-bonds.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/a12-paired.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/a12-rna-polymer.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/a22-eukaryote.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/a22-plant-palisade.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/a22-prokaryote.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b12-amino-acid.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b12-peptide-bond.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b21-figure-10.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b31-leaf-plan.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b32-root-plan.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/b32-stem-plan.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/d31-female-frontal.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/d31-female-sagittal.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/d31-flower-structures.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/d31-male-anatomy.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/hodder-d31-female.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/source-pdf-figures/hodder-d31-male.png` | visual | DELETE (rights-withdrawn) |
| `public/biology/transfers-energy-matter/keeling-monthly-2024-2025-mobile.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/transfers-energy-matter/keeling-monthly-2024-2025.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/transport/phloem-pressure-flow.svg` | visual | TAKE VISUAL REPAIR |
| `public/biology/transport/root-pressure-cause-sequence.svg` | depth | TAKE DEPTH AUDIT |
| `public/biology/transport/root-pressure.svg` | visual | TAKE VISUAL REPAIR |
| `scripts/biology/figure-layout-refinement/browser.mjs` | layout | TAKE FIGURE-LAYOUT SUPPORT FILE |
| `scripts/biology/figure-layout-refinement/figure-presentation.test.mjs` | visual+layout | TAKE VISUAL REPAIR |
| `scripts/biology/scientific-visual-assets-repair/browser.mjs` | visual | TAKE VISUAL REPAIR |
| `scripts/biology/scientific-visual-assets-repair/build-figures.py` | visual | TAKE VISUAL REPAIR |
| `scripts/biology/scientific-visual-assets-repair/verify.test.mjs` | visual | TAKE VISUAL REPAIR |
| `scripts/biology/scientific-visual-redesign.test.mjs` | visual | TAKE VISUAL REPAIR |
| `scripts/biology/validate-full-course-depth-audit.mjs` | depth | TAKE DEPTH AUDIT |
| `src/biology/biology.css` | visual+layout | TAKE VISUAL REPAIR |
| `src/biology/learning/ScientificFigure.tsx` | visual+layout | TAKE VISUAL REPAIR |
| `src/biology/learning/cell-nuclear-division/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/cell-respiration/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/cell-structure/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/defence-against-disease/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/dna-replication/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/figure-presentation.ts` | visual+layout | TAKE VISUAL REPAIR |
| `src/biology/learning/gas-exchange/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/homeostasis/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/inheritance/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/lesson-contract.ts` | visual+layout | TAKE VISUAL REPAIR |
| `src/biology/learning/membranes-transport/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/natural-selection/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/neural-signalling/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/nucleic-acids/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/organelles-compartmentalization/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/photosynthesis/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/protein-synthesis/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/proteins/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/reproduction/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/transfers-energy-matter/lesson.json` | visual | TAKE VISUAL REPAIR |
| `src/biology/learning/transport/lesson.json` | depth+visual | FIELD-LEVEL THREE-WAY MERGE (visual base + depth teaching, union original assets) |
| `src/biology/learning/water/lesson.json` | visual | TAKE VISUAL REPAIR |

## Qualifications

`docs/biology/full-course-depth-audit/matrix-*.json` are historical structural snapshots, not complete scientific approval. `COMPLETE_UNDERSTANDING_VERIFICATION.json` is the live consolidation status ledger. Assets, types, questions, student progress, recall, flashcards, drawing interactions, navigation and SL/HL gating must pass the new-branch validators and browser tests before a release. No merge into main or public deployment is authorized.
