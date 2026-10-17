# BioLab — final B3/B4 content sprint: scoped engineering handoff

**Date:** 2026-10-17  
**Repository:** [veyro-lb/litlab](https://github.com/veyro-lb/litlab)  
**Base branch:** `feature/biolab-themes-ab-final-completion-20261017`  
**Base HEAD verified before branch creation:** `4cd33a7d54bde055e123bd9052ea59c36aae9232`  
**Work branch:** `feature/biolab-final-b3-b4-20261017`  
**Disposition:** **Editorial implementation completed at the achievable source-reviewed development-draft level; NOT independently certified or release-ready.** No merge, protected shared-code change, public deployment or modification of a different Work branch.

## What changed

The five existing lesson packages were **preserved and refined**, rather than recreated. Every one of the **62 numbered understandings** now has three topic-specific reading subsection titles, an additional substantive mechanism/causal explanation, intact source-to-paragraph mappings and original application/retrieval content. All 72 original IB-style questions remain in place. The four topics B3.2, B3.3, B4.1 and B4.2 also had **98 generic distractor statements** replaced with misunderstanding-specific, teachable incorrect options and rationale (in both the lesson choice and the corresponding paper-style MCQ, **196 answer-option instances**). Existing correct keys and constructed quantitative exercises were preserved.

| Topic | SL + HL | HL only | Question items | New comparison visuals | Specific development |
| --- | ---: | ---: | ---: | ---: | --- |
| B3.1 Gas exchange | 10 | 3 | 16 | 3 | Large-exchange-surface mechanism, alveolar gradients, plant diffusion, lung-volume calculations, foetal/adult haemoglobin and Bohr shift; lung/gill, ventilation and Hb comparisons |
| B3.2 Transport | 10 | 8 | 21 | 3 | Capillary exchange, coronary reasoning, vessel histology, xylem tension, root pressure, source–sink phloem, heart/circuits; explicit revised-Starling qualification and new frontal heart SVG |
| B3.3 Muscle and motility | 0 | 10 | 12 | 1 | Actin/myosin, ATP and calcium, motor units, titin, antagonism, joint motion, migration; **corrected actin-length error** in sarcomere figure |
| B4.1 Adaptation to environment | 8 | 0 | 9 | 0 | Abiotic tolerance, field-transect method, coral constraints, biome model limits, desert/forest causal adaptations |
| B4.2 Ecological niches | 13 | 0 | 14 | 2 | Nutritional modes, diet inference, predator–prey adaptations, plant forms, competition, actual versus potential niche; conceptual contrasts |
| **Total** | **41** | **21** | **72** | **9** | **62 numbered lesson sections** |

The original digital-textbook reader is unchanged. Two additional authentic Commons-sourced microscopy observations are now integrated via the existing opt-in `AuthenticMicroscopy` component for B3.1.8 and B3.2.9, with creator and licence links visible to learners; a source-described 0.2 mm scale bar exists for the leaf, while the stem has only nominal 10× magnification. This **does not** certify learner-collected measurements. Nine purposeful comparisons render through the **existing** `visuals` schema at the relevant reading block. They are not decorative overlays or syllabus inventories. The figures continue to use existing asset and placement schema.

### Visuals and scientific corrections

- **B3.3.2:** the inherited desktop sarcomere SVG had drawn different actin filament lengths between relaxed and contracted states. This was corrected: actin and myosin lengths remain constant, overlap changes and the Z-discs move inward. A separate mobile SVG was authored and wired with `mobileSrc`. These are qualitative diagrams, not measurements to scale.
- **B3.2.15:** a new original labelled frontal-plane mammalian-heart diagram traces one-way blood flow via both atria, both ventricles, the four named valves, pulmonary vessels and the aorta; a mobile layout is provided. Anatomical right is explicitly shown on the viewer's left. Specialist anatomy and responsive-render review remain pending.
- **B3.2.11:** preserved the guide's teaching model of capillary pressure filtration and possible venular re-entry, but explicitly qualified claims of universal sustained reabsorption in light of revised-Starling microvascular physiology: Levick & Michel (2010), *Cardiovascular Research* 87:198–210, [PMID 20200043](https://pubmed.ncbi.nlm.nih.gov/20200043/). Lymphatic fluid return is emphasized.
- **B3.1.11–13:** distinguishes HbF's affinity from binding capacity, adult versus foetal globin and high-CO₂ right shifts at matched oxygen partial pressure. The original haemoglobin plots remain identified as constructed Hill-model curves, **not measured blood samples**.
- **B3.2.18, B4.1.6, B4.2.12:** xylem/phloem mechanisms are compared; climate tolerance and niche figures remain explicitly **conceptual models**, not recorded observations.

No images, numerical measurements, field observations or rights licences were fabricated. The two authentic observations are third-party microscope images with their real creators' published CC terms, not student-collected source data. Other observational gaps are documented, **not marked completed**.

### Deliverables

- `src/biology/learning/{gas-exchange,transport,muscle-motility,adaptation-environment,ecological-niches}/lesson.json`: five refined packages.
- `public/biology/muscle-motility/sarcomere.svg`: corrected old art; `sarcomere-mobile.svg`: new responsive composition.
- `public/biology/transport/heart-frontal.svg` and `heart-frontal-mobile.svg`: new original anatomy drawings.
- `docs/biology/final-b3-b4/UNDERSTANDING_LEDGER.json`: **62 separate numbered records** identifying prescribed requirement (paraphrased), scope, Guide/Hodder locators, titles/explanation, scientific correction, visual/assessment changes, real QA state and specialist blockers.
- `docs/biology/final-b3-b4/QA_RESULTS.json`: explicit executed/not-executed matrix and two verified Commons source-licence checks.
- `docs/biology/final-b3-b4/FIGURE_PROVENANCE.md`: figure changes, exact microscope image URLs, creator attribution, CC licence, scale limits and remaining gaps.
- `scripts/biology/final-b3-b4/validate.mjs` and `negative.test.mjs`: native positive gate and seven intentional mutation tests awaiting execution from a checkout.
- This `FINAL_HANDOFF.md`.

## Actual verification — critical distinction

**PASS: source-level remote checks** performed against the **committed GitHub branch content** using GitHub connector reads and JavaScript logic (not a local test runner). Verified 5 topics, 62 exactly ordered/uniquely scoped IDs, 41 shared + 21 HL, 72 answer-key/marking structures, 3 teaching blocks per understanding, explanation↔claim mapping, figure-placement references, all nine comparison tables and **15 fetchable referenced desktop/mobile SVG paths** with SVG/title/description/viewBox signatures; no errors in these checks. Seven distinct intentionally invalid B3.2 mutations were each detected by equivalent in-memory rule checks (**7/7**). The branch-local Node test files were committed, **not executed**.

**NOT RUN:** native `node scripts/biology/theme-b/validate-all.mjs`; `node scripts/biology/themes-ab-final/validate.mjs`; the new native validator and `node --test` negatives; `npm run quality`; TypeScript/Vite production `npm run build`; browser and mobile screenshots, dark-mode/keyboard/zoom checks. A runnable local checkout was unavailable because direct GitHub download/clone could not resolve the network host from the local execution environment. GitHub connector operations can inspect and commit repository content but do not provide a project shell/browser. Existing CI workflows target other branches; no workflow/deployment files were changed under the strict scope. **Do not report a passing production build or browser acceptance on the basis of the source-level audit.**

Next engineer should check out **only** the isolated branch and run:

```bash
npm ci
node scripts/biology/theme-b/validate-all.mjs
node scripts/biology/themes-ab-final/validate.mjs
node scripts/biology/final-b3-b4/validate.mjs
node --test scripts/biology/final-b3-b4/negative.test.mjs
npm run quality
npm run build
```

Then run an isolated **local** preview for 320, 390, 768 and 1440 CSS-pixel viewports. Check the heart and sarcomere art for clipping and visually verify all flow arrows, band geometry, alt text, image zoom, keyboard focus, screen-reader description and figure placement. Repair defects within the assigned topic assets/lesson files or hand back the exact unavoidable shared-code dependency before any out-of-scope change.

## Scientific, observational and publication blockers

| Topic | Outstanding evidence or qualified review |
| --- | --- |
| B3.1 | Verified, rights-cleared low-power dicot leaf microscopy (B3.1.8), real calibrated stomatal density count/leaf casts (B3.1.10), real repeated spirometry where applying observation skills (B3.1.6), specialist validation of alveolus and model Hb curves |
| B3.2 | Authentic artery/vein and root micrographs still needed (B3.2.2, .10); real dicot stem photomicrograph now supplied (.9), but no calibrated dimensional scale or independent species confirmation, source-identified real CHD epidemiological data replacing the synthetic demonstration if empirical claims are intended (.6), physiological sign-off on capillary reabsorption caveat (.11), specialist flow-trace check on new frontal heart (.15) |
| B3.3 | Independent sarcomere filament and motor-unit diagram review (.2, .4), repeated calibrated goniometer or image-analysis data for student observational assessment (.7) |
| B4.1 | Real student-collected natural/semi-natural field transects and abiotic readings (.4), independent climate/biome diagram assessment (.6) |
| B4.2 | Rights-cleared, metadata-backed Hominidae skull/dentition collection (.8), empirical competition evidence if any niche graphic is to be described as observed rather than a theoretical illustration (.12–13) |

Additional required acceptance: science specialist, assessment moderation, SL/HL segregation, source/rights attribution, accessibility, responsive graphics, browser testing and owner approval. No ISBN, source page or declared user-provided PDF constitutes an automatic publication license.

## Scope and safety

This sprint did **not** change central registry, catalogue, shared lesson reader/renderers, shared styles, unrelated lessons, site settings, workflows or another branch. No pull-request merge into `main`; no deployment. If the scope boundary blocks a student-visible change (for example, generic registry-derived outer understanding titles), record it for a later authorized integration sprint rather than overriding the boundary.

**Editorial outcome:** substantial original content refinement across **all 62** mapped B3/B4 sections; **not** 62 independent certified science reviews, and **not** production/browser acceptance.
