# BioLab — Interactive Diagram Recall and Drawing Practice

**Workstream:** Independent drawing practice frontend (2026-10-18)  
**Repository:** `veyro-lb/litlab`  
**Branch:** `feature/biolab-interactive-drawing-practice-20261018`  
**Stable starting point:** UI acceptance branch commit `bb37ae9ffc9c4221ff0a1339b35aab1c326be319`  
**Code tested in Chromium:** `5bd19d5bdbfc8dff0c7f41caaf1c29134bfedcec`  
**Successful workflow:** [BioLab Drawing Practice QA run 39073738007](https://github.com/veyro-lb/litlab/actions/runs/39073738007) (11/11 browser journeys, four screenshots, no browser page errors)

## Scope and result

This is an **optional, functioning frontend activity**, linked via the existing BioLab **Diagrams** resource mode and hash routes `#biology/topic/A1.1/drawing` or `#biology/topic/A1.1/drawing?understanding=A1.1.2`.

Two working study options appear:

1. **Identify & label:** display the verified original **unlabelled** scientific figure; type answers against five feature-specific clues; check actual string-to-feature associations against explicit, limited scientific synonym lists; show item-level feedback; hide/reveal the labelled figure; read biological functions; and start again. The input activity **does not** verify spatial placement of labels.
2. **Draw it yourself:** **Study → Draw → Label → Compare → Self-check**. The original figure is displayed for study and comparison but is hidden during drawing and labelling. Students use paper, compare their own output, then tick label/function and drawing-convention criteria. The interface explicitly says that self-assessment is not externally marked, automated figure recognition, or an IB mark scheme. `Try again` resets relevant fields, reveal states, checklist and exercise step.

Uses the existing `ScientificFigure.tsx` viewer for enlargement and load-error fallbacks and reuses the lesson's `StudyState` updater without a second persistence or grading contract. Teacher explanations and existing lesson diagrams remain clean: the new controls are in the optional Diagrams page, not beneath each textbook diagram.

### Enabled, verified-for-practice figure

| Topic | Exercise | Reused originals | Recall labels | Drawing focus |
|---|---|---|---|---|
| **A1.1.2** (SL + HL) | Water: bonds and partial charges | `/biology/water/bonding.svg` and `/biology/water/bonding-recall.svg` | Oxygen atom, hydrogen atom, polar covalent bond, hydrogen bond, partial charge (δ) | Two bent water molecules; δ− on O and δ+ on H; solid intramolecular covalent O–H versus dashed intermolecular H···O hydrogen bond |

The lesson's asset is original source-checked BioLab artwork with explicit geometry/label evidence and no third-party figure. The eligibility function explicitly checks the topic, the lesson-section/asset relationship, source paths, review status, original-art provenance text, withheld state, and course level. An unavailable/withheld/incorrectly matched diagram is **not** selectable. This is an original teaching visual **not** a scientific certification: an independent qualified specialist review and final publication approval remain outstanding.

### Source review and figure backlog

Reviewed all **10 pages** of the owner-supplied **IB Biology Drawings.pdf** as a study checklist, not as art to reproduce:

- **Page 1:** pencil, clean continuous outlines, straight leader lines, no line crossing, complete rather than abbreviated labels, adequate space and tissue plan diagram conventions.
- **Page 2:** hydrogen bonding, DNA and RNA nucleotides and paired DNA structure.
- **Page 3:** RNA structure and prokaryotic cell.
- **Page 4:** eukaryotic animal cell and organelle conventions.
- **Page 5:** leaf palisade plant cell.
- **Page 6:** general amino acid, peptide-bond condensation, fluid mosaic membrane.
- **Page 7:** dicot leaf, stem and root plan sections; show tissue distribution rather than individual cells.
- **Page 8:** male-typical reproductive structures.
- **Page 9:** female-typical reproductive structures.
- **Page 10:** insect-pollinated flower including stamen/carpel.

Cross-referenced scope against the **official IB Biology Guide (first assessment 2025)** and **Clegg, Davis & Talbot, Biology for the IB Diploma, 3rd edition (2023)**. In the current official roadmap, **D3.1 is Reproduction**, whereas **D3.2 is Inheritance**; the handout's reproductive `D3.2` heading is not used as a current topic code. Different textbooks or handouts do not override the official syllabus. Scientific figures from the handout or Hodder were **not copied, traced or imported**.

The following are **16 explicit blocked follow-on dependencies** in `data.mjs`, not advertised as working activities until original scientifically cross-checked art, an appropriate unlabelled recall partner, attribution/permission, and structure-specific answer mapping are verified:

| Syllabus | Pending originals |
|---|---|
| A1.2 | DNA nucleotide, RNA nucleotide, DNA structure, RNA structure |
| A2.2 | Prokaryotic cell, animal cell, leaf palisade plant cell |
| B1.2 | Generalized amino acid, peptide-bond condensation |
| B2.1 | Fluid mosaic membrane model |
| B3.1 | Dicot leaf transverse plan section |
| B3.2 | Dicot stem and root transverse plan sections |
| D3.1 | Male-typical reproductive system, female-typical reproductive system, insect-pollinated flower |

The repository contains some existing figures/recall SVGs for those topics, but multiple source ledgers mark owner publication clearance or scientific review as pending, and others are conceptual visuals rather than complete anatomy drawings. They are **not** simply enabled to inflate exercise count. The original scientific-illustration team's assets and science registries remain untouched.

## Files added/changed

**New source and styles**

- `src/biology/learning/drawing-practice/DrawingPractice.tsx`
- `src/biology/learning/drawing-practice/data.mjs`
- `src/biology/learning/drawing-practice/data.d.mts`
- `src/biology/learning/drawing-practice/drawing-practice.css`
- `src/biology/learning/drawing-practice/data.test.mjs`

**Navigation/lightweight integration**: `src/biology/routes.ts`, `src/biology/components/ResourceNav.tsx`, `src/biology/learning/LessonView.tsx`, `src/biology/entry.tsx`, `src/biology/components/CurriculumOverview.tsx`, `src/biology/components/BiologyDashboard.tsx`.

**Dedicated acceptance:** `scripts/biology-drawing-browser.mjs`; `.github/workflows/biolab-drawing-practice-qa.yml`; this document.

No modifications to science artwork, authoring lesson JSON, source-policy cleanup, curriculum registry, question banks, auth, or persisted student progress. No new dependencies. No PR merge and no public deployment.

## Test evidence (exact code SHA)

**Real Chromium:** on commit `5bd19d5bdbfc8dff0c7f41caaf1c29134bfedcec`, GitHub Actions run [39073738007](https://github.com/veyro-lb/litlab/actions/runs/39073738007) passed **11/11** cases with **0 browser page errors**:

1. Existing study-mode link navigates to the drawing route.
2. Genuine labelled/unlabelled original SVGs toggle and load.
3. Scientific synonyms are accepted; swapped covalent versus hydrogen-bond terminology is rejected.
4. Study → hide-and-draw → name-only checklist → compare → self-check; restart resets the attempt.
5. Keyboard focus opens the existing figure lightbox; Escape returns focus to the invoking control.
6. Blocked figure dependencies and SL/HL level guards are enforced.
7. Failed recall image loads show a meaningful fallback, checked in a fresh browser context.
8–11. No horizontal overflow and screenshots at **390px light**, **390px dark**, **1440px light** and **1440px dark**.

The workflow also passed `npm ci`, **five new targeted unit/negative tests**, `npm run quality`, `node scripts/validate-biology.mjs`, and `npm run build` (`tsc -b && vite build`). `data.test.mjs` tests no-recall, wrong-source, missing permission, withheld, unreviewed, cross-topic and incorrect-synonym cases. The script writes a machine-readable `report.json`, exact SHA and screenshots to GitHub Actions artifacts under **biolab-drawing-practice-evidence**. These are authentic Chromium captures, not design mocks.

**Existing unrelated failure — disclosed:** `scripts/validate-lesson.test.mjs`, an untouched pre-existing lesson-prose test suite, reported **84/94 passing; 10 failures**, mostly "hidden or missing prose" for C3/C4 and D1/D2 understandings. This test is run and reported in the workflow with `continue-on-error: true` so an unrelated baseline content failure does not obscure this workstream's new build/browser gates. It **must be investigated by the main integration owner before release**. The green drawing workflow does not mean the full repository's historical lesson QA is green.

## Accessibility and student UX

- Native labelled inputs and checkboxes; semantic `<fieldset>`/`<legend>` and ordered workflow steps; button `aria-pressed`; status text for checking and self-assessment.
- Same existing `ScientificFigure` dialog with focus restoration, Escape, enlarge controls and descriptive alt text. Text input exposes precise scientific clues and item-level status. No forced drag-and-drop or pointer-only canvas.
- CSS is loaded into the pre-existing BioLab shadow-root after premium styling; responsive cards and narrow-screen controls use existing colour tokens, with visible keyboard focus in both themes and reduced-motion support.
- 390px and 1440px light/dark captures inspected manually for fit and readability. **No formal manual screen-reader session, axe audit, accessibility certification, or comprehensive browser/device matrix has been completed.** Automated DOM role/keyboard checks are useful but not a substitute.

## Handoff / remaining release gates

Before releasing to students, the integration owner should: (a) confirm an independent subject-specialist review and rights approval for the enabled water figure; (b) resolve the 10 unrelated existing lesson test failures; (c) arrange formal accessibility/manual screen-reader review; (d) decide and coordinate later integration of the minimal navigation changes with concurrent BioLab branches; (e) let the scientific-illustration owner independently supply and verify each missing original labelled/recall drawing pair and its biology-specific labels and functions; (f) test more mobile devices and all final approved exercises.

**The optional activity works for the single evidence-gated original water figure now, but not for the other requested figures.** There are no artificial progress scores, implied computer vision, IB-endorsed grading claims or fake image substitutions.

**Integration policy:** Keep this development branch isolated. Do not merge to `main` or deploy publicly without explicit owner/integration acceptance.
