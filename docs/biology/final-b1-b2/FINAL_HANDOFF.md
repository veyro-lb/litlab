# BioLab — Final Completion Sprint 7: B1–B2 handoff

**Date:** 2026-10-17  
**Repository:** `veyro-lb/litlab`  
**Source:** `feature/biolab-themes-ab-final-completion-20261017` at `4cd33a7d54bde055e123bd9052ea59c36aae9232` (verified from live Git ref before branching)  
**Isolated working branch:** `feature/biolab-final-b1-b2-20261017`  
**Disposition:** Substantial internal editorial completion; **not independently certified or release-ready**.

## Scope and delivered changes

Only the five assigned lesson JSON files and their directly associated figure files changed. New QA material is confined to `docs/biology/final-b1-b2/` and `scripts/biology/final-b1-b2/`. No shared React components, registry, Theme A/C/D lessons, Theme B3/B4 lessons, deployment files or workflow settings were edited.

| Topic | Numbered IDs | SL + HL | Additional HL | Practice questions now | Registered figures now |
|---|---:|---:|---:|---:|---:|
| B1.1 | 13 | 13 | 0 | 17 | 7 |
| B1.2 | 12 | 5 | 7 | 17 | 4 |
| B2.1 | 17 | 10 | 7 | 30 | 18 |
| B2.2 | 9 | 3 | 6 | 19 | 9 |
| B2.3 | 10 | 6 | 4 | 19 | 10 |
| **Total** | **61** | **37** | **24** | **102** | **48** |

### Scientific teaching improvements actually implemented

- **All 61 understanding sections:** added a distinct named applied-reasoning block tied to that understanding's IB guidance, supported by its existing source IDs. Appended corresponding `claimReferences` and rebuilt `explanation` so existing content, paragraph structure, and claim provenance are exactly synchronized.
- **B1.1:** carbon valence and SI convention remain in place; new cases distinguish ring size from sugar carbon count, hydrolysis from condensation, branched storage polymers from cellulose, ABO carbohydrate determinants, lipid solubility, cis double-bond packing, triglyceride storage/insulation and steroid ring recognition. Replaced the conceptual triglyceride/phospholipid component visual and its recall variant with a newly authored, explicitly abbreviated structural formula showing glycerol **ester links**, fatty-acyl groups and a **phosphate ester** to the headgroup. Reworded its asset alternative text to match the revised chemical connectivity.
- **B1.2:** added zwitterion-versus-neutral amino acid interpretation, atom-level peptide linkage, diet sufficiency across dietary intake, a worked 20⁴ sequence-space case, denaturation without peptide hydrolysis, backbone C=O···H–N bonding in secondary structures, side-chain ionization and folding context, haemoglobin haem-versus-subunit distinctions, and insulin/collagen structure–function reasoning. Preserved existing amino acid, peptide, levels and protein-form figures.
- **B2.1:** added electrochemical-gradient caveats for channels, water-potential reasoning for aquaporins, separate pathways for GLUT and ATPase, topology-preserving endo/exocytosis, and quantitative sodium–potassium pump reasoning. The **3 Na⁺ out / 2 K⁺ in per ATP**, net outward positive charge, leak-dependent resting voltage, conformational **alternating access** and apical **Na⁺–glucose cotransport** sustained by basolateral ATPase are deliberately retained. Added a new original six-route comparison table rather than replacing the original permeability schematic.
- **B2.2:** added compartment-specific predictions for nuclear processing, phagolysosomes, mitochondrial and thylakoid proton gradients, nucleo-cytoplasmic pore traffic, ribosome destination, Golgi routing, and the **cytosolic** clathrin coat. Preserved all nine existing specialized figures.
- **B2.3:** added distinct cell-fate gradient, stem-cell niche, potency and morphology examples; recalculated 5 µm and 10 µm cube SA:V; separated erythrocyte and nephron membrane adaptations; clarified type I/type II pneumocytes, cardiac/skeletal fibres and the **metaphase-II** secondary oocyte. Preserved 10 original topical figures.

### New original assessment material

Created **11 original structured-response questions** with answer text, explicit marking points and SL/HL alignment, in addition to inherited questions. New question IDs are:

`b11-application-polysaccharide`, `b11-application-lipid`, `b12-application-protein`, `b12-application-structure`, `b21-application-transport`, `b21-application-pump`, `b21-application-cotransport`, `b22-application-vesicle`, `b22-application-chemiosmosis`, `b23-application-ratio`, `b23-application-alveolus`.

**Worked numerical checks:** 25 Na⁺/K⁺-ATPase cycles export 75 Na⁺, import 50 K⁺, use 25 ATP and move 25 elementary positive charges outward. A 5 µm cube has area 150 µm², volume 125 µm³ and SA:V 1.2 µm⁻¹; doubling to 10 µm yields SA:V 0.6 µm⁻¹. A 2×3×5 µm cuboid has area 62 µm², volume 30 µm³ and ratio ≈2.07 µm⁻¹ (all faces exposed).

## Precise primary references and supplementary checks

- International Baccalaureate Organization (2023), *Biology guide*, first assessment 2025: B1.1 printed pp. 49–50 (supplied PDF pp. 55–56); B1.2 pp. 50–52 (PDF 56–58); B2.1 pp. 52–54 (PDF 58–60); B2.2 pp. 54–55 (PDF 60–61); B2.3 pp. 55–56 (PDF 61–62). Per-understanding locators follow in the ledger.
- Clegg, C. J., Davis, A. and Talbot, C. (2023), *Biology for the IB Diploma*, third edition, Hodder Education, ISBN 9781398364240: B1.1 printed pp. 181–204 (supplied PDF 193–216); B1.2 pp. 205–222 (PDF 217–234); B2.1 pp. 223–243 (PDF 235–255); B2.2 pp. 244–255 (PDF 256–267); B2.3 pp. 256–272 (PDF 268–284). Per-section printed textbook page metadata is reproduced below.
- Alberts et al., *Molecular Biology of the Cell*, 4th ed., NCBI Bookshelf, [Carrier Proteins and Active Membrane Transport](https://www.ncbi.nlm.nih.gov/books/NBK26896/): cross-check for Na⁺/K⁺ pump directionality and secondary active cotransport.
- Alberts et al., NCBI Bookshelf, [The Shape and Structure of Proteins](https://www.ncbi.nlm.nih.gov/books/NBK26830/): backbone hydrogen bonds, side-chain stabilization and protein levels.
- Cooper, *The Cell: A Molecular Approach*, NCBI Bookshelf, [The Mechanism of Vesicular Transport](https://www.ncbi.nlm.nih.gov/books/NBK9886/): clathrin/adaptor coats on the cytosolic side of vesicle buds.
- Cooper, NCBI Bookshelf, [The Endoplasmic Reticulum](https://www.ncbi.nlm.nih.gov/books/NBK9889/): protein targeting and preservation of membrane topology.

The supplemental sources are independent corroboration, not permission to copy published figures or questions. The new text, questions and figure geometries were authored for BioLab; existing source material was used to guide scope and check mechanisms.

## Individual numbered-understanding review ledger

Each row records an **actual newly delivered application** plus the original assigned IB and Hodder source locators, count of associated questions and the relevant registered figure filenames. 'SL+HL' designates content taught at both levels; 'HL' designates additional higher-level content. The report does not claim independent peer review.

| Understanding | Level | New application / targeted revision | IB Guide and Hodder printed pages | Questions associated | Figure evidence |
|---|---|---|---|---:|---|
| B1.1.1 | SL+HL | Count carbon bonding positions | p. 49; Hodder pp. 181, 182, 183, 184, 185 | 1 | Text only |
| B1.1.2 | SL+HL | Account for atoms in condensation | p. 49; Hodder pp. 186, 187 | 1 | condensation.svg |
| B1.1.3 | SL+HL | Locate the products of hydrolysis | p. 49; Hodder pp. 186, 187, 188 | 1 | condensation.svg |
| B1.1.4 | SL+HL | Count atoms, not ring corners | p. 49; Hodder pp. 189, 190, 191 | 1 | sugar-rings.svg |
| B1.1.5 | SL+HL | Compare how storage is mobilized | p. 49; Hodder pp. 192, 193 | 3 | polysaccharides.svg |
| B1.1.6 | SL+HL | Explain why cellulose resists tension | p. 49; Hodder pp. 193, 194 | 2 | polysaccharides.svg |
| B1.1.7 | SL+HL | Trace the ABO carbohydrate label | p. 49; Hodder pp. 195, 196 | 1 | Text only |
| B1.1.8 | SL+HL | Predict solubility from molecular regions | p. 49; Hodder pp. 197, 198 | 1 | Text only |
| B1.1.9 | SL+HL | Check the three glycerol positions | p. 50; Hodder pp. 198, 199, 202, 203 | 2 | lipids.svg |
| B1.1.10 | SL+HL | Separate double-bond count from geometry | p. 50; Hodder pp. 199, 200, 201 | 2 | fatty-acids.svg |
| B1.1.11 | SL+HL | Reason about energy and insulation separately | p. 50; Hodder pp. 201, 202 | 2 | Text only |
| B1.1.12 | SL+HL | Choose bilayer orientation | p. 50; Hodder pp. 203 | 1 | bilayer.svg |
| B1.1.13 | SL+HL | Identify the ring nucleus correctly | p. 50; Hodder pp. 204 | 1 | steroid-rings.svg |
| B1.2.1 | SL+HL | Draw a generalized alpha amino acid | p. 50; Hodder pp. 205, 206 | 2 | amino.svg |
| B1.2.2 | SL+HL | Track the peptide bond atoms | p. 51; Hodder pp. 206, 207 | 2 | peptide.svg |
| B1.2.3 | SL+HL | Evaluate protein supply over a diet | p. 51; Hodder pp. 208, 209 | 1 | Text only |
| B1.2.4 | SL+HL | Calculate sequence diversity | p. 51; Hodder pp. 209 | 1 | Text only |
| B1.2.5 | SL+HL | Distinguish denaturation from hydrolysis | p. 51; Hodder pp. 209, 210 | 2 | Text only |
| B1.2.6 | HL | Classify a side chain in its environment | p. 51; Hodder pp. 211 | 1 | Text only |
| B1.2.7 | HL | Predict consequences of a substitution | p. 51; Hodder pp. 212 | 1 | Text only |
| B1.2.8 | HL | Locate hydrogen bonds in a helix | p. 51; Hodder pp. 213, 214 | 1 | levels.svg |
| B1.2.9 | HL | Separate four stabilizing interactions | p. 51; Hodder pp. 214, 215, 216 | 3 | levels.svg |
| B1.2.10 | HL | Predict insertion into a bilayer | p. 51; Hodder pp. 216 | 2 | Text only |
| B1.2.11 | HL | Count chains separately from haem | p. 51; Hodder pp. 217, 218, 219, 220 | 2 | forms.svg |
| B1.2.12 | HL | Compare signal to tensile resistance | p. 52; Hodder pp. 220, 221, 222 | 1 | forms.svg |
| B2.1.1 | SL+HL | Predict where a bilayer forms | p. 52; Hodder pp. 224 | 1 | mechanism-1.svg |
| B2.1.2 | SL+HL | Rank membrane permeability | p. 52; Hodder pp. 224 | 2 | mechanism-2.svg |
| B2.1.3 | SL+HL | Account for random motion at equilibrium | p. 52; Hodder pp. 225 | 2 | mechanism-3.svg |
| B2.1.4 | SL+HL | Distinguish location from function | p. 52; Hodder pp. 226 | 1 | mechanism-4.svg |
| B2.1.5 | SL+HL | Explain aquaporin directionality | p. 52; Hodder pp. 226 | 2 | mechanism-5.svg |
| B2.1.6 | SL+HL | Combine selectivity with electrochemical force | p. 53; Hodder pp. 227 | 1 | mechanism-6.svg |
| B2.1.7 | SL+HL | Identify ATP dependence correctly | p. 53; Hodder pp. 229 | 2 | pump-alternating-access-20261017.svg |
| B2.1.8 | SL+HL | Distinguish selective transport routes | p. 53; Hodder pp. 229 | 2 | mechanism-8.svg, transport-pathways-20261017.svg |
| B2.1.9 | SL+HL | Locate the carbohydrate side | p. 53; Hodder pp. 229 | 1 | mechanism-9.svg |
| B2.1.10 | SL+HL | Draw a complete fluid mosaic | p. 53; Hodder pp. 230 | 2 | mechanism-10.svg |
| B2.1.11 | HL | Predict a cold-adaptation trend | p. 53; Hodder pp. 237 | 1 | mechanism-11.svg |
| B2.1.12 | HL | Locate cholesterol and its temperature effect | p. 53; Hodder pp. 232 | 1 | mechanism-12.svg |
| B2.1.13 | HL | Keep vesicle topology consistent | p. 53; Hodder pp. 233 | 2 | mechanism-13.svg |
| B2.1.14 | HL | Compare two types of gating | p. 53; Hodder pp. 234 | 1 | mechanism-14.svg |
| B2.1.15 | HL | Calculate charge and energetic coupling | p. 53; Hodder pp. 235 | 4 | sodium-potassium-pump-20261017.svg |
| B2.1.16 | HL | Trace glucose across the entire enterocyte | p. 54; Hodder pp. 236 | 4 | intestinal-glucose-topology-20261017.svg |
| B2.1.17 | HL | Explain why adhesion is not fusion | p. 54; Hodder pp. 237 | 1 | mechanism-17.svg |
| B2.2.1 | SL+HL | Use separation rather than membrane alone | p. 54; Hodder pp. 244, 245 | 3 | organelle-1.svg |
| B2.2.2 | SL+HL | Track a transcript before translation | p. 54; Hodder pp. 246, 247 | 2 | organelle-2.svg |
| B2.2.3 | SL+HL | Make an incompatible-reaction prediction | p. 54; Hodder pp. 247, 248 | 2 | organelle-3.svg |
| B2.2.4 | HL | Trace the mitochondrial proton path | p. 54; Hodder pp. 248, 249 | 3 | organelle-4.svg |
| B2.2.5 | HL | Trace the chloroplast proton path | p. 55; Hodder pp. 249, 250, 251 | 2 | organelle-5.svg |
| B2.2.6 | HL | Follow an RNA molecule through a pore | p. 55; Hodder pp. 251, 252, 253 | 1 | organelle-6.svg |
| B2.2.7 | HL | Use a destination to infer ribosome location | p. 55; Hodder pp. 253, 254 | 1 | organelle-7.svg |
| B2.2.8 | HL | Follow one secretory cargo | p. 55; Hodder pp. 254 | 2 | organelle-8.svg |
| B2.2.9 | HL | Keep clathrin outside the vesicle lumen | p. 55; Hodder pp. 255 | 3 | organelle-9.svg |
| B2.3.1 | SL+HL | Predict different fates from one genome | p. 55; Hodder pp. 256 | 2 | b23-gradient.svg |
| B2.3.2 | SL+HL | Distinguish self-renewal from uniform daughters | p. 55; Hodder pp. 257 | 1 | b23-stem.svg |
| B2.3.3 | SL+HL | Compare niche signals | p. 56; Hodder pp. 258 | 1 | b23-niche.svg |
| B2.3.4 | SL+HL | Choose the right potency label | p. 56; Hodder pp. 260 | 2 | b23-potency.svg |
| B2.3.5 | SL+HL | Compare form without memorizing one size | p. 56; Hodder pp. 261 | 1 | b23-sizes.svg |
| B2.3.6 | SL+HL | Check a second scaling calculation | p. 56; Hodder pp. 263 | 4 | b23-cubes.svg |
| B2.3.7 | HL | Relate membrane folds to exchange | p. 56; Hodder pp. 266 | 1 | b23-surface.svg |
| B2.3.8 | HL | Predict effects of lost surfactant | p. 56; Hodder pp. 267 | 3 | b23-alveoli.svg |
| B2.3.9 | HL | Compare nuclei and connection patterns | p. 56; Hodder pp. 268 | 2 | b23-muscle.svg |
| B2.3.10 | HL | Locate the oocyte's actual cell-cycle stage | p. 56; Hodder pp. 271 | 2 | b23-gametes.svg |

## Validation — genuine evidence and limits

**Confirmed by live GitHub-connector JavaScript checks after corrections:**

- 5 lessons / 61 sequential unique understanding IDs; correct **37 shared / 24 HL-only** allocation, based on the official 2025 Guide.
- **102 questions** (61 single-answer selection, 41 structured response) with valid understanding/section links and selection keys. All new written questions have a number of marking points equal to the stated marks.
- **48 registered scientific figures** with resolvable files in the live Git tree (including original figure and recall variants); two lipid SVGs updated and one membrane comparison SVG added.
- **61** added individualized applied-teaching blocks, with **claim/reference/explanation paragraph synchronization** now corrected on every edited understanding.
- A later connector-side replay of the **existing Theme A/B validator's relevant contract logic** exercised **530 assertions with zero errors** for these five packages, including paragraph and claim-reference drift, level mapping, question ownership, in-lesson choice integrity and assessment keys.
- The branch diff was inspected against the exact source SHA; no unauthorized paths were in the teaching-content diff at that checkpoint.
- A dedicated Node verifier was committed at `scripts/biology/final-b1-b2/verify.mjs`, and the *actually executed* connector-side evidence is separately recorded in `QA_EVIDENCE.json`.

**Not run or not certified:** no complete repository checkout was available in this tool environment, so `npm ci`, `npm run quality`, `npm run build`, `node scripts/biology/themes-ab-final/validate.mjs`, `node scripts/biology/final-b1-b2/verify.mjs`, full GitHub Actions workflows and Playwright browser regressions were **not executed** as local/CI processes. The existing workflows target other branch names. Structural checks cannot establish all figure rendering, accessibility, typography, chemical geometry, browser interactions or content correctness. These remain required for release.

## Required next gates before any merge or publication

1. In a real checkout of this exact branch, run `npm ci`, `node scripts/biology/final-b1-b2/verify.mjs`, `node scripts/biology/themes-ab-final/validate.mjs`, full relevant lesson/figure validators, `npm run quality`, and `npm run build`; resolve any actual failures and save logs.
2. Perform browser navigation checks for SL and HL separately across these five lessons: figure loading and responsive sizing, review/recall modes, accessible alt text and focus, answer feedback, written rubric visibility, deep-link ID navigation, and zero repeated visible figure captions/action bars.
3. Subject an independent scientific editor to all diagrams, especially ester/phosphoester valence, cis fatty-acid geometry, ion-channel voltage/gradient directions, Na⁺/K⁺ ATPase, coupled transport, clathrin surface orientation, and meiosis-II gamete labeling. Check for overflow in the new comparison table on mobile.
4. Review the IB's intellectual-property and commercial curriculum-mapping requirements and Hodder reuse permissions before publication; no reproduced textbook figures or questions have intentionally been introduced, but this does not constitute licensing clearance.
5. Keep this sprint on its isolated branch until permitted integrated regression and human editorial review. **No deployment, merge or independent scientific certification was performed.**

