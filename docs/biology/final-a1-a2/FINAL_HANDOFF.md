# BioLab — Final Completion Sprint 6: A1–A2 scoped handoff

**Date:** 2026-10-17  
**Repository:** `veyro-lb/litlab`  
**Verified original source branch:** `feature/biolab-themes-ab-final-completion-20261017`  
**Source HEAD at branch creation:** `4cd33a7d54bde055e123bd9052ea59c36aae9232`  
**Isolated work branch:** `feature/biolab-final-a1-a2-20261017`  
**Last teaching/reference-content commit before this handoff:** `a4a68e97f445a4edc82f55119ca4b51239d9b4a5`  
**Release disposition:** **INCOMPLETE; coherent and committed scoped improvements.** No new independent specialist sign-off and no successful production build are claimed. This report commit changes only documentation; its own SHA must be read from the branch after publication.

## 1. Understanding inventory: exactly 52 existing sections

All identifiers below were inspected for structural mapping to the live registry and corresponding lesson package; this is **not** an assertion that every section passed an independent, line-by-line final scientific peer review.

| Topic | Explicit identifiers | Total | SL/HL scope |
| --- | --- | ---: | --- |
| A1.1 Water | A1.1.1, A1.1.2, A1.1.3, A1.1.4, A1.1.5, A1.1.6, A1.1.7, A1.1.8 | 8 | 1–6 shared; 7–8 HL |
| A1.2 Nucleic acids | A1.2.1, A1.2.2, A1.2.3, A1.2.4, A1.2.5, A1.2.6, A1.2.7, A1.2.8, A1.2.9, A1.2.10, A1.2.11, A1.2.12, A1.2.13, A1.2.14, A1.2.15 | 15 | 1–10 shared; 11–15 HL |
| A2.1 Origins of cells | A2.1.1, A2.1.2, A2.1.3, A2.1.4, A2.1.5, A2.1.6, A2.1.7, A2.1.8, A2.1.9 | 9 | all HL |
| A2.2 Cell structure | A2.2.1, A2.2.2, A2.2.3, A2.2.4, A2.2.5, A2.2.6, A2.2.7, A2.2.8, A2.2.9, A2.2.10, A2.2.11, A2.2.12, A2.2.13, A2.2.14 | 14 | 1–11 shared; 12–14 HL |
| A2.3 Viruses | A2.3.1, A2.3.2, A2.3.3, A2.3.4, A2.3.5, A2.3.6 | 6 | all HL |
| **Total** | | **52** | **27 shared / 25 HL-only** |

The official guide prints `A.2.3.4` for the lysogenic-cycle heading in one place. The repository correctly preserves canonical registry identifier `A2.3.4`; no route, registry or shared architecture was altered.

## 2. Implemented changes and scientific rationale

### A1.1 Water — substantive A1.1.6 assessment correction

The pre-existing `p1b-2` asked for two numerical rises after both samples absorbed 100 J, but supplied no sample mass; its old marking points silently substituted a mass and mixed simplified heat-capacity units. The fixed question explicitly states two 0.010 kg samples at constant pressure, uses `c_water = 4184 J kg⁻¹ K⁻¹` and `c_air = 1007 J kg⁻¹ K⁻¹` at approximately 20 °C, and calculates `ΔT_water = 100/(0.010×4184) = 2.39 K` and `ΔT_air = 100/(0.010×1007) = 9.93 K`. Four independently markable steps distinguish heat storage from heat conduction. One additional four-property comparison table covers density, dynamic viscosity, thermal conductivity and specific heat capacity, with source values, units, ecological implications and a warning not to equate drag with viscosity alone.

Existing water-polarity illustrations, xylem cohesion, adhesion, hydration, aquatic examples, and HL caveats about asteroid delivery and liquid-water habitability were retained. No scientific micrographs, numerical measurements or experimental data were invented.

### A1.2 Nucleic acids — preserved existing improvements

The lesson package was **not overwritten**. The source branch's A1.2.5 activated-triphosphate versus schematic-condensation distinction, A1.2.6 antiparallel strand notation, A1.2.9 sequence-capacity reasoning, A1.2.11 extension at the 3′ end, A1.2.13 histone octamer/H1 separation and molecular viewer, A1.2.14 isotope reasoning and A1.2.15 Chargaff-induction qualification remain present. The new regression test protects the core-versus-linker histone distinction and the authored nucleosome question. These are preservation checks; independent final content/figure certification is not claimed.

### A2.1 Origins of cells — substantive A2.1.1–A2.1.9 practice review

- **A2.1.2 repaired:** the old stem asked *why cells are independently living* while the keyed answer described *why a virus requires a host*; the new stem asks why bacteriophage lambda is **not** self-sustaining and the correct option now explicitly cites host machinery. Three misconceptions have separate, accurate feedback.
- Replaced all 9 A2.1 selection-question distractor explanations with choice-specific diagnostic feedback. Rewrote 8 other vague template selection stems as concrete, testable scientific scenarios.
- Replaced 9 long, copy-like two-mark written answers with **2 independent scoring points each**, on early conditions, autonomy, protocell needs, Miller–Urey, amphiphile vesicles, catalytic RNA, LUCA, dating evidence and hydrothermal-vent inference.
- Added 5 original structured teaching comparisons: bacterium vs lambda, protocell ingredients vs coupled requirements, LUCA vs earliest cells, radiometric/fossil-context dating vs calibrated molecular clocks, and ancient vent evidence vs alternative interpretations.
- Added claim-level independent source evidence to A2.1.9. Dodd et al.'s vent material is described as **putative** ancient microbial evidence; neither unique origins nor a demonstrated fossil of LUCA is claimed.

### A2.2 Cell structure — preserved existing improvements

The existing A2.2.2 graticule calibration example, dual-objective worked problem, A2.2.9 atypical-cell comparisons, established original schematics and provenance-qualified cucumber TEM workflow were not replaced. The preservation regression protects the calibration item. No alleged micrographs or image scales were manufactured; the existing limitations on specimen coverage and authentication remain in place. Separate microscopy-specialist verification of every prescribed micrograph classification and drawing requirement is outstanding.

### A2.3 Viruses — substantive A2.3.1–A2.3.6 practice review

- Replaced all 6 multiple-choice distractor sets with biologically specific explanations.
- Replaced 6 broad two-mark answer paragraphs with concise 2-point mark schemes that can be scored directly.
- Added comparisons for the *alternative* lambda lytic and lysogenic outcomes, the escape/reduction/ancient-replicator hypotheses and their evidence limits, and influenza variation versus HIV mutation, resistance and combination treatment.
- Linked the CDC account of influenza drift and NIH evidence on HIV treatment/drug resistance directly to A2.3.6 teaching paragraphs. Treated convergence and multiple virus origins as hypotheses, not proven universal histories.

**Teaching-experience constraints retained:** no oversized dashboards, no accordion-only lessons, no shared-navigation changes, no unnecessary new figures. Nine original JSON-driven comparison tables were added to existing independently readable sections (1 A1.1, 5 A2.1, 3 A2.3). The existing A1.2/A2.2 visuals were preserved, not duplicated.

## 3. Source register and evidence limitations

1. **IB Biology Guide, first assessment 2025 (syllabus authority):** A1.1 printed pp. 34–35; A1.2 pp. 35–38; A2.1 pp. 38–39; A2.2 pp. 39–41; A2.3 pp. 41–42. Also relevant: Biology skills (microscopy, magnification, scale bars), printed pp. 28–33.
2. **Clegg, Davis & Talbot (2023), *Biology for the IB Diploma Programme*, 3rd ed., Hodder (teaching reference):** A1.1 printed pp. 2–13 (physical-properties Table A1.1.1 on p. 9); A1.2 pp. 14–33; A2.1 pp. 34–48; A2.2 pp. 49–87; A2.3 pp. 88–101. Supplemented by original explanations and examples, without copying copyrighted figures or exam questions.
3. **Dodd et al. (2017), Nature 543:60–64, doi:10.1038/nature21377:** candidate fossils in hydrothermal-vent-related deposits; age/biogenicity interpretations are not an exact observation of LUCA.
4. **CDC (2024), [How flu viruses can change](https://www.cdc.gov/flu/php/viruses/change.html):** mutation-driven antigenic drift is distinct from larger abrupt changes in influenza A.
5. **NIH HIVinfo (reviewed 2026), [HIV drug resistance](https://hivinfo.nih.gov/understanding-hiv/fact-sheets/drug-resistance):** mutations and suppression-related treatment implications.
6. Existing A1.1 lesson references include OpenStax chemistry, physics and biology chapters, NOAA ringed-seal information, and NASA Bennu findings; these pre-existing sources were retained.

Evidence cautions: early-life biogenicity and LUCA timing/environment cannot be treated as settled; asteroidal delivery does not identify the entire terrestrial water inventory; a habitable-zone planet does not prove liquid surface water or life; phage lysogeny is not a stage that must occur in every infection; influenza antigenic drift is not synonymous with reassortment. Figures remain conceptual unless explicitly documented as authentic specimens.

## 4. Figures, assets and scope

- Live package check: **36 references** to existing figure assets; the checked source tree includes the local referenced figure paths; **0 referenced withheld placeholders**.
- New visual structures are embedded JSON comparison tables; **no new raster images, external micrographs or scales** were introduced by this sprint.
- Existing figure provenance is inherited from the source branch, and independent pixel-level/manual scientific figure review **was not performed** during this sprint.
- No changes to `public/`, shared architecture, registry, lesson catalog, routes, Theme B/C/D packages, existing A1.2/A2.2 lessons or deployment configuration.

## 5. Verification evidence and actual limits

### Completed connector-backed, in-memory checks on the isolated branch

| Check | Result |
| --- | --- |
| Five lesson/registry identities; 52 numbered sections; canonical order and SL/HL levels | **PASS** (8+15+9+14+6; 27 shared / 25 HL) |
| Claim paragraph and teaching-block/explanation consistency | **PASS** |
| Local figure references (against original source tree), visual anchors and table rectangularity | **PASS** (36 figure refs; 0 withheld) |
| Topic-question mappings and marks/marking-point lengths | **PASS** (89 questions) |
| Selection question structure and exactly one keyed choice | **PASS** |
| A2.1.2 repaired stem/key semantic regression | **PASS** |
| A1.1.6 dimensional calculation | **PASS** (2.390057… K; 9.930486… K) |
| Three deliberate negative probes (zero correct choices; incorrect HL label; ragged comparison) | **PASS** (all rejected by equivalent checks) |
| Existing source-branch A1.2 nucleosome and A2.2 graticule changes retained | **PASS** (presence check) |

One existing water `p1b-1` is intentionally mapped to two understandings, `A1.1.3` cohesion and `A1.1.4` adhesion. Validity requires its section to match **at least one** mapped understanding, as enforced by the existing validator; a stricter first-ID-only probe would falsely flag it.

### Committed executable tests; **not yet executed**

`scripts/biology/final-a1-a2/verify.test.mjs` contains 8 `node:test` cases covering all 52 identifiers, SL/HL, figure availability, comparison anchors, repaired A2.1.2 key, dimensionally correct A1.1.6 calculations, A1.2/A2.2 preservation and three negative regressions.

**Do not report these as green CI results.** This environment has the authenticated GitHub connector for reading/writing files but cannot resolve `github.com` from the local command runner and therefore cannot check out the repository and run Node/npm on the branch. GitHub Actions had no runs for this isolated branch at the time inspected. Accordingly, the following are **NOT RUN / NOT VERIFIED on this commit**: `npm ci`; `node --test scripts/biology/final-a1-a2/verify.test.mjs`; `node scripts/biology/themes-ab-final/validate.mjs`; `node --test scripts/biology/themes-ab-final/negative.test.mjs`; other existing Biology validators; `npm run quality`; `npm run build`; browser/visual/device/accessibility testing. No production build or deployment success is implied.

Suggested commands to run on an authorized checkout of this exact branch:

```bash
npm ci
node --test scripts/biology/final-a1-a2/verify.test.mjs
node scripts/biology/themes-ab-final/validate.mjs
node --test scripts/biology/themes-ab-final/negative.test.mjs
node scripts/validate-water.mjs
node scripts/validate-lessons.mjs
node scripts/validate-biology.mjs
node scripts/biology/full-course/readiness-audit.mjs
npm run quality
npm run build
```

## 6. What remains before final completion/certification

**Not newly deep-edited during this sprint, despite complete inherited lessons and structural checks:**

- A1.1.1, A1.1.2, A1.1.3, A1.1.4, A1.1.5, A1.1.7, A1.1.8.
- A1.2.1, A1.2.2, A1.2.3, A1.2.4, A1.2.5, A1.2.6, A1.2.7, A1.2.8, A1.2.9, A1.2.10, A1.2.11, A1.2.12, A1.2.13, A1.2.14, A1.2.15 (including 8 source-branch targeted improvements that were preserved).
- A2.2.1, A2.2.2, A2.2.3, A2.2.4, A2.2.5, A2.2.6, A2.2.7, A2.2.8, A2.2.9, A2.2.10, A2.2.11, A2.2.12, A2.2.13, A2.2.14 (including 2 source-branch targeted improvements that were preserved).

A2.1.1–A2.1.9 and A2.3.1–A2.3.6 received targeted assessment/visual review and changes, but **all 52 understandings still lack independent final scientific-editorial sign-off**. The remaining work is: (i) line-by-line scientific/content review of the 36 not newly deep-edited identifiers listed above; (ii) 52-understanding independent specialist approval; (iii) microscopy micrograph/scale provenance and visual-presentation checks; (iv) full Node negative/quality/build and isolated browser tests against the final branch SHA; (v) re-evaluation of any failures and recording of their exact results; and (vi) rights/licensing review before any public use of publisher-derived materials.

This sprint leaves the validated coherent work committed **only** on the specified isolated branch. No merge, production deployment, or main-branch modification was performed.
