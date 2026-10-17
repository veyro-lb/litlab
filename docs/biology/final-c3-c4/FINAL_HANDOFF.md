# BioLab Sprint 8 — Final C3–C4 handoff

**Date:** 2026-10-17  
**Repository:** https://github.com/veyro-lb/litlab  
**Base:** `feature/biolab-complete-course-integration-20261017` at `2c321ae547baa2a97294728b337a4dfa46e64408` (confirmed immediately before branching)  
**Sprint:** `feature/biolab-final-c3-c4-20261017`  
**Integration and release:** no merge, no public deployment, no central registry or shared components modified.

## What was actually completed

- **81 / 81** mapped syllabus understandings retained in four isolated lesson JSON packages. Each explanation and all 81 multiple-choice answer keys received an internal first-pass content/scope read against the IB guide; this is *not* an independent scientific peer review or the same as deep external verification of every example.
- **158 questions:** 81 one-answer multiple-choice questions with populated option feedback and 77 written/structured questions with populated markschemes. **11 new original mechanism, numerical and reasoning questions** were added on top of 147 pre-existing questions. All answer keys and written mark-point counts received structural review, with targeted detailed scientific edits.
- **28 specific understandings** received explicit written scientific clarifications or changed feedback in Sprint 8. See each row in the ledger below. The remaining 53 were read for a first-pass guide/scope check and carried forward without a new scientific rewrite; they should not be counted as newly independent source-verified.
- **9 new inline learning visualizations** added where useful (process sequences and comparison tables), plus **one original semi-logarithmic model SVG**. Previous C3.2 Phase 5 visual/feedback infrastructure was not removed.

## Topic interventions

- **C3.1** — 23 sections, 34 questions, 6 specifically re-edited understandings. System coordination, spinal circuit, baroreflex, auxin transport, cell-wall acidification and auxin–cytokinin signalling.
- **C3.2** — 18 sections, 38 questions, 6 specifically re-edited understandings. Evidence-limited archaeal claim feedback, HIV transmission, antibiotics, resistance, antigen vaccines and community immunity.
- **C4.1** — 18 sections, 39 questions, 7 specifically re-edited understandings. Random sampling, quadrat extrapolation, Lincoln-index limits, logarithmic axes, chi-squared calculations and chemical competition examples.
- **C4.2** — 22 sections, 47 questions, 9 specifically re-edited understandings. Food-web arrows, historic Silver Springs energy fluxes, energy partitioning, primary production units, carbon-cycle arrows, Mauna Loa trend and element cycling.

**C3.1:** Added an integrated exercise cause–effect sequence, explicit spinal withdrawal topology, sign-correct baroreflex explanation, and HL polar-auxin / acid-growth stages. The 7 additional C3.1 understandings C3.1.17–C3.1.23 remain HL-only. Original diagrams for reflexes, peripheral nerve structure, phototropism and pressure control are preserved.

**C3.2:** Connected the new CDC and WHO evidence to the relevant numbered claims. Preserved all earlier 18 sections, their pre-existing supporting visuals and existing misconception feedback; corrected the answer feedback for C3.2.1 so the explanation actually addresses the evidence-limited archaea claim. Strengthened the distinction between sexual U=U evidence and other HIV exposures, antibacterial targets versus viruses, selection versus purposeful mutation, vaccines and memory, and variable herd-immunity thresholds. Added an antigen-vaccine comparison and two original questions including an explicitly hypothetical COVID-era-style percentage exercise.

**C4.1:** Replaced 18 generic incorrect-option messages in six MCQs with misconception-specific feedback. Added random sampling protocol, worked quadrat density and area extrapolation, the undefined case of a zero recapture count, semi-log interpretation with correctly labelled mathematical model graph, a complete 2×2 chi-squared worked calculation and model-dependent allelopathy examples. All quadrat, Lincoln-index and contingency-table values are constructed teaching examples, not fabricated field measurements. Preserved the existing sigmoid SVG and its constructed values.

**C4.2:** Replaced 24 generic incorrect-option messages in eight MCQs with misconception-specific feedback. Checked the EPA's historical Silver Springs productivity panel values (20,810, 3,368, 383 and 21 kcal m⁻² yr⁻¹) against the actual source illustration. The separate decomposer value **5,060** belongs to a different pathway, **not** a higher-level predator bar. Transfer percentages 16.2%, 11.4% and 5.5% are derived classroom calculations, not separately measured efficiencies. Confirmed NOAA's Scripps-series annual means of **315.98 ppm in 1959** and **377.38 ppm in 2004**; these cannot alone demonstrate the seasonal Keeling oscillation. Explained trophic arrows, carbon-cycle topology, assimilation/heat losses and carbon-based productivity dimensions. Preserved historical source records.

## Scientific sources and provenance

### Attached core references
- **C3.1:** IB guide syllabus C3.1, PDF pp. 82–84; Hodder printed pp. 490–516.
- **C3.2:** IB guide syllabus C3.2, PDF pp. 84–86; Hodder printed pp. 517–547.
- **C4.1:** IB guide syllabus C4.1, PDF pp. 87–89; Hodder printed pp. 548–577.
- **C4.2:** IB guide syllabus C4.2, PDF pp. 89–91; Hodder printed pp. 578–601.

- International Baccalaureate. *Biology guide*, first assessment 2025 (2023). Official teaching requirements, understanding numbering and SL/HL scope. This material and its figures remain copyright IB; no permission for republication is asserted.
- Clegg, Davis and Talbot. *Biology for the IB Diploma Programme*, 3rd edition, Hodder (2023). Consulted as a pedagogical cross-reference, not copied as lesson prose/diagrams. Copyright and publishing permissions are not conferred by local possession of the PDF.

### Public evidence checked
- **US EPA:** *Technical Support Manual: Waterbody Surveys and Assessments for Conducting Use Attainability Analyses*, Figure IV-5-2, after Odum (1957), https://www.epa.gov/sites/default/files/2014-10/documents/uaa-vol123.pdf . The **productivity** pyramid has P=20,810, C1=3,368, C2=383, C3=21, S=5,060 kcal m⁻² yr⁻¹; do not confuse with the separate **standing biomass** panel in kcal m⁻².
- **NOAA Global Monitoring Laboratory, Mauna Loa Observatory Scripps cooperation:** https://gml.noaa.gov/obop/mlo/programs/coop/scripps/co2/co2.html . Historical annual means cited are 1959 and 2004. https://gml.noaa.gov/ccgg/trends/data.html provides downloadable source records; no new unsourced monthly records were constructed.
- **US CDC:** Undetectable = Untransmittable, https://www.cdc.gov/global-hiv-tb/php/our-approach/undetectable-untransmittable.html ; Antibiotic Do's and Don'ts, https://www.cdc.gov/antibiotic-use/about/ .
- **WHO:** disease-specific herd immunity background, https://www.who.int/news-room/questions-and-answers/item/herd-immunity-lockdowns-and-COVID-19 .

Source verification above is a targeted public-source check, not a blanket endorsement or licensing permission.

## Checks performed and evidence

**Executed against current GitHub branch via connected repository reads** (as opposed to tests that would require a local checkout):
1. Traversed all four current lesson JSONs and checked 81 ordered one-to-one section IDs, uniqueness, mapped question IDs, expected HL versus SL boundary and primary lesson asset references: **0 exceptions**.
2. Checked all **158** questions for unique IDs, valid mapped understandings and answer-key or markscheme presence. Confirmed all **81** MCQs have exactly one correct choice and non-empty option feedback. Examined the correct-answer text for all 81 and checked the 77 written questions' mark-point counts against allocated marks: **0 structural exceptions**.
3. Read the source contents of all seven directly referenced SVG scientific figures, including scientific labels and topology: a withdrawal arc with one spinal interneuron; carotid/aortic baroreceptor loop; correctly placed sigmoid model y-coordinates; new semi-log equal doubling intervals with a logarithmic population axis; and five food-to-consumer paths in the meadow food web. **0 checked scientific-geometry/label exceptions**. This goes beyond checking that filenames exist, but does not constitute a pixel-level browser review.
4. Cross-checked the embedded Silver Springs and historic Mauna Loa numerical tables with the cited original public pages. Internal calculations have constructed or derived provenance labels.
5. GitHub compare confirmed only lesson packages, directly associated C4.1 SVG and newly scoped QA files have changed relative to base. No C1/C2, A/B/D, shared components, central registries or deployment config changed.

**Automated validator and negative tests committed, but not executed in a checked-out Node project in this session:**
```sh
node scripts/biology/final-c3-c4/validate-final-sprint.mjs
node --test scripts/biology/final-c3-c4/validate-final-sprint.test.mjs
node scripts/validate-biology.mjs
node --test scripts/validate-biology.test.mjs
npm run quality
npm run build
```
Production browser QA (desktop/mobile lesson navigation, all diagram renders and interactive assessments), full existing curriculum validators, and a production build remain **not run** in this connector-only execution. Do not convert the observed structural checks into a claim of build or browser success. No preview deployment was used.

## Assessment-feedback verification

Forty-two previously generic or repeated incorrect-option feedback messages were revised: 18 in C4.1 and 24 in C4.2. These are targeted corrections for misconceptions in sampling, dispersion, mark–recapture, growth graphs, association, trophic arrows, energy-flow units, heat and carbon cycling. Correct-answer options were not changed. The edits additionally count C4.1.8, C4.2.13 and C4.2.14 as revised understandings in the ledger.

## Individually reviewed understanding ledger

Every row below denotes an internal first-pass read of lesson explanation and the corresponding multiple-choice key and a check of section mapping. **Revised** additionally identifies an explicit Sprint 8 scientific edit/feedback change. **Retained** means no fresh edit justified from that pass; neither label implies independent expert sign-off.

| Understanding | Syllabus level | Questions | Sprint 8 disposition |
|---|---|---:|---|
| C3.1.1 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.1.2 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.1.3 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.4 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.5 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.6 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.7 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.8 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.9 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.1.10 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.11 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.12 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.13 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.14 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C3.1.15 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.1.16 | SL + HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.17 | HL | 2 | Retained after internal first-pass guide/scope review |
| C3.1.18 | HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.19 | HL | 1 | Retained after internal first-pass guide/scope review |
| C3.1.20 | HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.1.21 | HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.1.22 | HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.1.23 | HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.1 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.2.2 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.3 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.4 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.5 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.6 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.7 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.8 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.9 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.10 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.11 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.2.12 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.13 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.2.14 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C3.2.15 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C3.2.16 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.2.17 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C3.2.18 | SL + HL | 3 | Retained after internal first-pass guide/scope review |
| C4.1.1 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.2 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.1.3 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.1.4 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.1.5 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.6 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.7 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.1.8 | SL + HL | 2 | Revised incorrect-option misconception feedback |
| C4.1.9 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.10 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.11 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.12 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.13 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.14 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.15 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.1.16 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.17 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.1.18 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.2.1 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.2 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.3 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.4 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.2.5 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.6 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.7 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.8 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.9 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.10 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.11 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.2.12 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.2.13 | SL + HL | 2 | Revised incorrect-option misconception feedback |
| C4.2.14 | SL + HL | 2 | Revised incorrect-option misconception feedback |
| C4.2.15 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.2.16 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.17 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |
| C4.2.18 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.19 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.20 | SL + HL | 3 | Revised scientific explanation and/or answer feedback |
| C4.2.21 | SL + HL | 2 | Retained after internal first-pass guide/scope review |
| C4.2.22 | SL + HL | 2 | Revised scientific explanation and/or answer feedback |

## Outstanding work and approval boundary

The 53 retained understandings below are **not known to be erroneous**, but they have not each received a fresh in-depth, example-by-example external literature audit in Sprint 8. They are the precise scope to prioritize if a second scientific pass is required:

C3.1.2, C3.1.3, C3.1.4, C3.1.5, C3.1.6, C3.1.7, C3.1.8, C3.1.10, C3.1.11, C3.1.12, C3.1.13, C3.1.15, C3.1.16, C3.1.17, C3.1.18, C3.1.19, C3.1.23, C3.2.2, C3.2.3, C3.2.4, C3.2.5, C3.2.6, C3.2.7, C3.2.8, C3.2.9, C3.2.10, C3.2.12, C3.2.15, C3.2.18, C4.1.1, C4.1.5, C4.1.6, C4.1.9, C4.1.10, C4.1.11, C4.1.12, C4.1.13, C4.1.14, C4.1.16, C4.1.17, C4.2.1, C4.2.2, C4.2.3, C4.2.5, C4.2.6, C4.2.7, C4.2.8, C4.2.9, C4.2.10, C4.2.16, C4.2.18, C4.2.19, C4.2.21

Before treating Sprint 8 as complete/release-ready, run the committed validator and negative tests in a real checkout, run existing validators, quality and production build, and perform actual browser QA of all four lessons including the new semi-log figure. Commission a qualified independent biology/assessment reviewer to approve the scientific explanations, original questions, ecological examples and diagram accuracy. Accessibility and permissions review of externally sourced material also remains separate. The current report records **internal verification only**, not independent expert certification.

**Release state: not merged, not deployed, not independently approved.**
