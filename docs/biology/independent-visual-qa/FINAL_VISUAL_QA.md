# BioLab — Independent Scientific Figure QA

**Status: source-audit complete; full visual acceptance NOT achieved.**  
**Date:** 2026-10-18  
**Pinned integration baseline:** `73f6278c6f8d941f2eeb68b836459efe78572a0b`  
**Independent branch:** `feature/biolab-independent-visual-qa-20261018`  
**Change scope:** only `scripts/biology/independent-visual-qa/` and `docs/biology/independent-visual-qa/`. No lesson, illustration, registry, production, deployment, or workflow code changed.

## 1. Executive result and evidence grades

This is an **independent examination of repository figures**, not an assertion that all figures are scientifically approved.

| Evidence class | Completed | Result / limitation |
| --- | --- | --- |
| Repository provenance | Yes | Verified integration branch HEAD had advanced beyond the supplied `898ba...`; pinned new QA branch to `73f6278...`. |
| Curriculum / asset mapping | Yes, repository source | Inspected all **40 topic lesson JSONs**, comprising **160 registered figure/image records**, and compared their `src`, `mobileSrc`, `recallSrc`, `recallMobileSrc` references to the Git tree. No missing registered paths and no absent/very short alt descriptions observed. |
| SVG bytes / preliminary structural sweep | Yes, repository source | Retrieved actual contents of all **259 SVGs under `public/biology/`**. No absent `<svg>`, `</svg>` or `viewBox` tokens; no obvious `<script>` / `onload` markers in this preliminary sweep. This is **not** a full XML parse or a security certification. |
| Independent biological inspection | Targeted, incomplete | Inspected source text, SVG geometry, drawn components, labels and leaders in more than 20 high-priority files; logged **11 specific, source-grounded defects or review risks**. Some are presentation issues; one is high-impact circulation topology. It would be inaccurate to call all 259 figures individually biologically verified. |
| Registered recall variants | Selected source pairs | Examined examples in water, DNA, membrane, enzymes and gametes. A general parity/structure test is committed but **not executed**. |
| Live BioLab Chromium screenshots at 320, 390, 768, 1024, 1440, 1920 px | **No** | Attempted browser service; it refused to start for insufficient service credit. A separate isolated runtime was rejected with authorization error. **Zero authentic screenshots and zero viewport passes obtained.** |
| Dark mode, light mode, keyboard, enlargement | **No** | Runnable Playwright test code is committed; no execution evidence is claimed. |
| Node regression fixtures / full XML parser | **Not executed** | Tests and full XML parser are committed. Only the narrower repository-source checks above actually ran. |

Do **not** treat the current figures as signed off for launch. Full browser evidence and independent biological sign-off remain release gates.

**Machine evidence:** `EXECUTION_EVIDENCE.json` describes actual checks and environmental blockers. `ISSUES.json` is the machine-readable issue ledger, with per-finding topic and understanding IDs, asset paths, expected corrections, severity, disposition and explicitly null screenshot references.

## 2. Actionable findings, in priority order

### IVQA-001 — HIGH — Fish single circulation is misleading

- **Topic / understanding:** B3.2 Transport · B3.2.14.
- **Asset:** `public/biology/transport/heart-circuits.svg`.
- **Actual defect:** The fish panel names *Heart* and *Gills* without a proper labeled *Body/systemic capillaries* node. SVG paths such as `M150 327 V377 H33 V175 H59` and `M252 298 H329 V175 H253` return from the gill area through directionless connections. The mammalian schematic also has ambiguous extra connectors. There are no arrowheads on the blue circulation paths.
- **Educational impact:** Students may infer that blood returns from fish gills directly to the heart rather than flowing through the systemic capillary bed, undermining the central distinction between single and double circulation.
- **Required fix:** **Withhold/replace** until an original, explicit, directed fish loop reads **heart → gill capillaries → systemic capillaries → heart**. Mammalian double circulation must read **right heart → pulmonary capillaries → left heart → systemic capillaries → right heart**, with each connection and arrow direction checked. The figure is a circulation schematic, not a morphological heart drawing.
- **Evidence:** Authenticated pinned SVG source/path commands; no screenshot.

### IVQA-002 / IVQA-003 / IVQA-011 — MEDIUM — Flower leader, missing structures and 320px risk

- **Topic / understanding:** D3.1 Reproduction · D3.1.9.
- **Asset:** `public/biology/reproduction/d31-flower-structures.svg`.
- **Actual leader defect:** The label leader for *Style* ends at roughly `(590,255)`, while the style's drawn central segment is `M581 225V155` and its lower connection begins `M581 266V330`. The line targets the gap rather than an unbroken style shaft. Connect the style properly to the ovary and re-anchor the leader.
- **Checklist gap:** The drawing includes petals and basal green structures but does not explicitly label **petal, sepal, stamen or carpel**. Add direct, non-crossing callouts for relevant parts and group *anther + filament* under stamen and *stigma + style + ovary* under carpel where pedagogically useful.
- **Mobile risk (not visually reproduced):** The source width is 1160 SVG units, with text as small as 17 units. A simple 320px fit-width projection gives ~4.7px text. This is **only a source-size estimate**, not a browser-measured font. Provide a responsive mobile diagram/key if necessary and verify in real BioLab.
- **Disposition:** Correct; then recheck science and small-screen rendering.

### IVQA-004 — MEDIUM — No registered full human reproductive-anatomy figures

- **Topic / understandings:** D3.1 · D3.1.4 and D3.1.13 (placements require curricular editorial confirmation).
- **Registry/lesson source:** `src/biology/learning/reproduction/lesson.json`.
- **Observed:** The lesson registers only `d31-cycle-feedback`, `d31-fertilization-sequence`, and `d31-flower-structures`. It has no dedicated male-typical or female-typical reproductive anatomy image. This is a **coverage/learning-support gap**, not proof that the present figures are scientifically wrong.
- **Recommended change:** If the relevant teaching explanations require anatomical orientation, commission **original** paired drawings: ovary, oviduct, uterus, endometrium, cervix, vagina, external vulva; and testis, epididymis, vas deferens, seminal vesicle, prostate, urethra, penis/scrotum. Draw correct connections and physical relationships, with inclusive, appropriately qualified anatomy descriptions. Do not trace the handout.
- **Disposition:** Add where needed, after explicit guide-to-understanding check.

### IVQA-005 — MEDIUM — Heart flow-topology diagram is not anatomical

- **Topic / understanding:** B3.2 · B3.2.15.
- **Asset:** `public/biology/transport/heart-frontal.svg`.
- **Actual defect:** The figure describes a frontal mammalian heart but renders the four chambers as detached color-coded rectangles. Although flow topology and left/right orientation are broadly represented, the pulmonary and aortic valves are named in the margin without visible semilunar cusps or anatomical connections.
- **Recommended change:** Either **retitle as a schematic flow network** and add a separate correctly structured frontal anatomy image, or replace with anatomically recognizable atria, ventricles, septum, all four valves, venae cavae, pulmonary trunk/arteries and veins, and aorta. Confirm the left ventricular wall is thicker and that arrow directions pass through the proper valve sequence.

### IVQA-006 — MEDIUM — Dicot tissue locations not identifiable from leaders

- **Topic / understandings:** B3.2 · B3.2.9–B3.2.10.
- **Asset:** `public/biology/transport/dicot-stem-root.svg`.
- **Actual defect:** The stem and root schematics have plausible *ring* and *central star* arrangements but not direct leaders or a matched key for **epidermis, cortex, xylem, phloem, stem pith** or cambium when relevant. The visible captions describe arrangements without mapping the colored regions.
- **Required fix:** Preserve the source geometry if verified, add unambiguous tissue labels. Stem bundles: xylem toward center, phloem toward exterior; root: xylem central, phloem between its arms. Check against verified transverse sections, not this handout alone.

### IVQA-007 — MEDIUM — Leaf plan lacks tissue leader lines

- **Topic / understandings:** B3.1 · B3.1.7–B3.1.8.
- **Asset:** `public/biology/gas-exchange/dicot-leaf.svg`.
- **Actual defect:** Upper epidermis, palisade/spongy mesophyll, lower epidermis and stoma labels form a column at x≈650 onward while diagram extends only to x≈632; there are no leader lines pointing to the tissue targets. Xylem above phloem in the vascular bundle is structurally appropriate.
- **Required fix:** Add straight, non-intersecting leaders or a responsive matched-key system. Recheck 320px and 390px readability. For formal **plan** drawings, avoid adding irrelevant cellular detail merely for decoration.

### IVQA-008 — MEDIUM — DNA base pair contact counts not distinguished

- **Topic / understandings:** A1.2 · A1.2.6 and A1.2.8.
- **Asset:** `public/biology/nucleic-acids/paired.svg` (and the recall counterpart).
- **Observed:** Correct complementary bases and 5′/3′ antiparallel orientation, but all four base pairs have the same long, dashed vertical connector.
- **Potential misunderstanding:** If read as individual hydrogen bonds, the connections imply equivalent A–T and G–C bonding. **A–T has two and G–C three hydrogen-bond contacts**.
- **Required fix:** Use two/three short dashed links, or explicitly say the existing dashed line means generic *pair association*, not the number of hydrogen bonds. Keep 5′ and 3′ direction consistent across labeled and recall variants.

### IVQA-009 — LOW — Peptide reaction does not depict reactants

- **Topic / understanding:** B1.2 · B1.2.2.
- **Asset:** `public/biology/proteins/peptide.svg`.
- **Observed:** The product dipeptide linkage is chemically correct but the reactant side is only text. It does not show loss of **OH** from carboxyl and **H** from amine to form H₂O.
- **Recommended change:** Keep product formula and add a legible two-reactant formula panel, or retitle the visual as a product summary instead of a condensation **reaction** diagram. Independently check nitrogen/carbon valence.

### IVQA-010 — LOW — Internal review-state text shown to learners

- **Topic / understandings:** A1.2 · especially A1.2.2 and A1.2.6.
- **Asset:** `public/biology/nucleic-acids/paired.svg`, plus a set of other nucleic-acid SVGs.
- **Observed:** Footer visibly contains `scientific review pending` in ordinary learner-facing artwork.
- **Recommended change:** Finish genuine science review first; then remove the editorial-status footer from the image and keep status/provenance in the internal QA register. Do not imply completion by merely deleting the text.

Severity and expected action are in `ISSUES.json`. **All 11 issue entries explicitly have `screenshotEvidence: null`**. They are grounded in source contents and geometry, not screenshots or validated browser measurements.

## 3. Targeted check matrix and useful controls

| Domain | Files source-inspected | Result / open question |
| --- | --- | --- |
| Water polarity | `water/bonding.svg` and recall | Solid intramolecular O–H bonds versus intermolecular dashed attraction are differentiated. Continue to validate delta notation and mobile variant rendering. |
| Nucleotide/DNA/RNA | `nucleic-acids/nucleotide.svg`, `paired.svg`, `backbone.svg`; protein synthesis strand schematics | Antiparallel base sequence in the paired SVG is correct; bond-count semantics and pending-review footers require correction. DNA coding/template and mRNA example is internally consistent. |
| Cells and organelles | `cell-structure/a22-prokaryote.svg`, `a22-groups.svg`; recall pairs | Source labels cite Gram-positive boundary, 70S ribosomes, eukaryotic differences; accurate organelle placement needs rendered review and specialist checking. |
| Amino acids / membranes | `proteins/amino.svg`, `peptide.svg`, `carbohydrates-lipids/lipids.svg`, `membranes-transport/mechanism-10.svg` | Generalized amino acid is valence-plausible as an abstract four-substituent model. Phospholipid topology and membrane protein descriptions are plausible; peptide reactant depiction incomplete. |
| Membrane pumps | `sodium-potassium-pump-20261017.svg`, `intestinal-glucose-topology-20261017.svg` | 3 Na⁺ out / 2 K⁺ in per ATP and apical symport versus basolateral pump/GLUT descriptions agree with foundational biology. Visual arrowheads and 320px rendering still pending. |
| Photosynthesis and respiration | `cell-respiration/mitochondrial-chemiosmosis.svg`; additional topic assets included in source sweep | Matrix ↔ intermembrane proton directions are explicitly labeled. Full high-fidelity scientific inspection of every mechanism remains undone. |
| Plant tissue | `gas-exchange/dicot-leaf.svg`, `transport/dicot-stem-root.svg` | General architecture plausible, labels inadequate as exam drawing examples. |
| Reproduction | `reproduction/d31-flower-structures.svg`; lesson asset registry | Concrete style leader error, omitted flower callouts and absence of whole-system reproductive anatomy. |
| Heart / sarcomere | `transport/heart-circuits.svg`, `heart-frontal.svg`, `muscle-motility/sarcomere.svg` | Heart-circuit defect high impact; other heart graphic too abstract as anatomy. Sarcomere source represents conserved actin/myosin lengths and Z disc approximation; live verification open. |
| Graphs and tables | `membranes-transport/transport-pathways-20261017.svg`, `enzymes-metabolism/ph.svg`, `climate-change/d43-sea-ice-2025.svg` | Source labels present; independent axis/data transcription and actual viewport inspections have not been completed. Do not state data verified. |

In particular, the authentic cucumber leaf TEM asset (`public/biology/cell-structure/cucumber-leaf-tem.webp`) has source attribution and alternative text in the lesson but was **not independently checked against its original micrograph**, including panel-specific 500nm scale bars. Do not treat microscopy as signed off.

## 4. Reference handout crosswalk and curriculum normalization

The 10-page *IB Biology Drawings* handout was **visually read as reference**, without copying its images:

1. **Page 1:** continuous crisp outlines, straight leader lines, non-crossing labels, complete names, space/legibility and observation-plan conventions. These are useful style recommendations, not blanket permission to add microscopic cell detail in tissue plans.
2. **Pages 2–3:** hydrogen bonds between water molecules; nucleotide DNA/RNA; double-stranded antiparallel DNA; single-stranded RNA; bacterial cell model. Prioritize partial charges, phosphate/sugar/base orientation, 70S ribosomes, nucleoid versus plasmid.
3. **Pages 4–5:** plant and animal cells and specific organelles. Verify chloroplast thylakoids, mitochondrion cristae, nuclear envelope, ER/Golgi and label endpoints.
4. **Page 6:** generalized amino acid, peptide condensation, amphipathic fluid-mosaic membrane. Verify actual bonds and the orientation of integral/peripheral proteins and surface carbohydrates.
5. **Page 7:** tissue **plan** sections of leaf, stem and root, not arbitrarily cell-resolved drawings. Cross-check xylem/phloem relative locations.
6. **Pages 8–9:** male-typical and female-typical reproductive system exemplars. These are reference-checklist examples; no authorization to republish the watermarked images.
7. **Page 10:** insect-pollinated flower, including stigma/style/ovary/ovule and anther/filament plus petal/sepal.

**Syllabus correction:** The handout's D3.2 labels for reproductive anatomy and flower are inconsistent with the **IB Biology Guide, first assessment 2025**, in which **D3.1 = Reproduction** and **D3.2 = Inheritance**. The current guide is authoritative for topic codes and required understanding scope. The Hodder *Biology for the IB Diploma*, 3rd edition (2023), provides supplementary scientific context, especially A1.2 nucleic acids, A2.2 cells, B1.2 proteins, B2.1 membranes, B3.1/B3.2 gas exchange and transport, and D3.1 reproduction. Neither copyrighted textbook nor watermarked drawings should be traced or reproduced into the website.

## 5. Reproduction and execution instructions

Only new QA files were written. The following scripts are designed to run after cloning the independent branch into an authorized environment:

```bash
git fetch origin
git checkout feature/biolab-independent-visual-qa-20261018
npm ci
node --test scripts/biology/independent-visual-qa/audit.test.mjs
node scripts/biology/independent-visual-qa/audit.mjs
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

In a **separate shell**, with a local Chromium installation and this local preview still serving:

```bash
CHROME_BIN=/usr/bin/chromium \
LITLAB_PREVIEW_URL=http://127.0.0.1:4173/ \
node scripts/biology/independent-visual-qa/browser.mjs
```

`audit.mjs` outputs `SOURCE_AUDIT_EXECUTION.json` with per-asset inventory, syntax errors, source-only small-text warnings and recall geometry checks. Its Python 3 XML parser makes stronger structural assertions than the executed initial 259-SVG token sweep, but the script has not run yet. `browser.mjs` is designed to test **11 high-value figures × 6 widths × 2 themes = 132 browser cases** with actual BioLab lesson routes, inline snapshots, enlarged dialog screenshots at 320/1440px, Enter/Escape and focus restoration. It writes `BROWSER_EXECUTION.json` and real PNGs **only when executed**. Tests are not a substitute for biologist inspection or accessibility testing with assistive technologies. Consult `ISSUES.json` for the remaining full-coverage verification backlog.

### Current blockers

- The accessible local runtime could not resolve GitHub DNS to clone this repository, so the new QA test scripts were **not executed** there.
- Live connected browser automation refused to start for insufficient provider wallet credit.
- A new isolated Vercel sandbox for the repository failed with an authorization **HTTP 403** despite finding a candidate Vercel project. No project was deployed.
- All existing workflows target other named branches; user path restrictions exclude adding/changing `.github/workflows/`. **No CI run for this QA branch was started.**
- **No screenshots or before/after comparisons exist** for this independent session; creating illustrative substitutes would falsely suggest successful real rendering.

## 6. Release gate, disposition and independent handoff

**Required before release:** (1) correct/withhold IVQA-001, (2) correct IVQA-002/003 and preserve accurate labels, (3) decide if the D3.1 anatomy coverage is needed and implement accordingly, (4) run the new Node XML/references/recall tests, (5) run the Chromium evidence suite with all 6 viewport sizes, 2 themes, enlarged dialogs and keyboard, (6) specialist review of every registered original figure (including chemical valence, quantitative graph data, microscopy scales and all recall/mobile variants) with screenshots showing *actual* pre-fix and post-fix UI where there are defects.

**Handoff rule:** The parallel illustration redesign session should consume this ledger and modify illustration/lesson files **on its own branch**, not on the independent QA branch. Every correction must be re-reviewed and tied to a real screenshot and its exact source SHA. **No merge to main and no public deployment were performed.**

**Verdict:** Source-level inventory and a specific defect ledger are available and committed. **Independent browser/scientific visual verification across all figures is outstanding and the acceptance criteria are not yet fully satisfied.**
