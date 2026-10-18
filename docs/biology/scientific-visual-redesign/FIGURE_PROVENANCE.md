# BioLab scientific visual redesign — figures and provenance

## Scope, source hierarchy and rights

All new and replaced figures in this batch use independently authored BioLab SVG paths. The supplied 10-page **IB Biology Drawings.pdf** was consulted for the checklist of named structures and drawing conventions only. None of its watermarked third-party drawings were traced, copied, extracted, cropped, watermarks removed, or republished. The *Biology guide, first assessment 2025* controls the syllabus mapping and scope; Hodder's *Biology for the IB Diploma*, Third Edition (2023), serves as a secondary conceptual reference. Neither the guide nor the textbook grants republication rights in their drawings. Copyright and commercial-reuse permission for any **pre-existing** photographs, textbook figures or external micrographs remain separate outstanding checks.

### Independently authored figures

| Teaching understanding | Original labelled asset | Coordinated recall + mobile versions | Scientific scope |
| --- | --- | --- | --- |
| D3.1.4 | `public/biology/reproduction/d31-male-anatomy.svg` | `d31-male-anatomy-recall.svg`, `d31-male-anatomy-mobile.svg`, `d31-male-anatomy-mobile-recall.svg` | Testis, epididymis, vas deferens, seminal vesicle, prostate, urethra, erectile tissue, scrotum, penis (handout p.8) |
| D3.1.4 | `public/biology/reproduction/d31-female-frontal.svg` | matching `-recall`, `-mobile`, `-mobile-recall` SVGs | Paired ovaries and oviducts, uterus, endometrium, cervix, vagina (p.9) |
| D3.1.4 | `public/biology/reproduction/d31-female-sagittal.svg` | matching `-recall`, `-mobile`, `-mobile-recall` SVGs | Difference between cervix, vagina and external vulva (p.9) |
| D3.1.9 | `public/biology/reproduction/d31-flower-structures.svg` **replacement** | matching `-recall`, `-mobile`, `-mobile-recall` SVGs | Stamen (anther + filament); carpel (stigma + style + ovary and ovules); sepals and petals (p.10) |
| A2.2.8 | `public/biology/cell-structure/a22-plant-palisade.svg` | matching `-recall`, `-mobile`, `-mobile-recall` SVGs | Cell wall and plasma membrane, large central sap vacuole, chloroplasts, nucleus, mitochondria, ER, Golgi, ribosomes (p.5) |

**Visual source creation:** All 19 new SVG files and the replacement flower SVG were written as original paths and text within the project. They are diagrammatic teaching schematics, not microscopy or empirically observed cross-sections; no measurement scale bar or authentic photo is asserted. The source metadata identifies original project artwork, and student alt text describes schematic content. The project owner should confirm ownership and any commissioning/editorial licence before commercial republication.

**Important syllabus correction:** Pages 8–10 of the supplied drawing handout use D3.2. The official current Biology guide and project curriculum identify **D3.1 Reproduction** for male and female anatomy and insect-pollinated flowers. The figures were placed in D3.1.4 and D3.1.9, not D3.2 Inheritance.

## Source-level visual corrections after screenshot inspection

- Fixed the female-frontal *endometrium* callout, previously too close to the right ovary and visually misleading.
- Moved the flower *carpel* callout from the stem to the central reproductive column (including the mobile numbered learning diagram); adjusted *style* callout routing.
- Removed a pair of visually misleading, disconnected bladder/rectum context shapes from the simplified female sagittal cutaway (desktop, mobile and recall equivalents). This figure deliberately communicates reproductive tract anatomy, **not** adjacent non-reproductive organs.
- Earlier responsive and recall validator failures were corrected in the test harness (awaited image loading, transformed-coordinate bounds, precise screenshot locator). A successful CI build and screenshot run at commit `5f4e0fb87bbca72a08e2f645a3cfd79d15e9a14c` established rendering of the original batch. The later source corrections and palisade browser checks require a fresh green commit-specific run.

## Verification classification

**Implemented:** source assets and lesson-JSON placements; source-scoped metadata and regression tests; structural 40-topic inventory and IB handout crosswalk.

**Not yet approved:** detailed third-party subject-expert anatomical review, molecule-level chemical bond sign-off, exhaustive 40-topic rendered browser audit, permissions on all pre-existing external photos, and independent pedagogical field testing. Do not confuse an SVG validation or successful build with scientific certification.

## Browser evidence

The branch-only GitHub Actions workflow `.github/workflows/biolab-scientific-visual-redesign.yml` runs source tests, quality, production build, and Playwright screenshots at 320, 390, 768, 1024, 1440 and 1920 px. It saves private, authentic browser-rendered screenshots and structured logs as a run artifact without deploying the site. Refer to the exact final handoff for latest CI run ID and outcome.

## Safe integration

Do not merge this whole branch indiscriminately: another source-policy workstream may own newer lesson corrections. Apply the 20 final SVG source paths, exact D3.1/A2.2 JSON *asset and figurePlacement* diffs, QA scripts/workflow and this documentation selectively, while comparing current target refs. Run the targeted Node tests, `npm run quality`, `npm run build`, and responsive browser QA again **after** integration. Keep the original unresolved expert review statuses unchanged until a qualified reviewer signs them off.
