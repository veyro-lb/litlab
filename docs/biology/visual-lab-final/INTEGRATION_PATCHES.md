# BioLab Visual Laboratory — narrowly scoped integration patches
**Branch:** `feature/biolab-ib-visual-lab-final-20261018`. The source base already contains lesson registrations for imported D3.1/A2.2 art despite missing physical SVGs; this branch restores those referenced assets **without editing lesson JSON**.

## Existing placements that work through asset-only import
- `D3.1.4`, `src/biology/learning/reproduction/lesson.json`: asset IDs `d31-male-anatomy`, `d31-female-frontal`, `d31-female-sagittal` already appear in section `reproduction-4` and have mobile and recall paths. No lesson JSON change needed.
- `D3.1.9`, same file: `d31-flower-structures` already appears in section `reproduction-9` and has mobile/recall paths. Its corrected SVG replaces existing file while maintaining the same URI.
- `A2.2.8`, `src/biology/learning/cell-structure/lesson.json`: `a22-plant-palisade` already appears in section `a22-8` with all four paths. No content patch required.
- `A1.2.6` and `A1.2.8`, `src/biology/learning/nucleic-acids/lesson.json`: `a12-paired` keeps its existing `src` and `recallSrc` references; direct file replacement fixes the schematic. Preserve the owner's source and review fields until approved.
- `B3.2.14`, `src/biology/learning/transport/lesson.json`: asset `b32-heart-circuits` already points to `/biology/transport/heart-circuits.svg`; file replacement corrects the main labelled illustration. Existing level `HL` remains unchanged.

## Patch for integration engineer (not applied here)
On the existing **`b32-heart-circuits`** object only, after ensuring no parallel modification, add:
```json
{
  "recallSrc": "/biology/transport/heart-circuits-recall.svg",
  "mobileSrc": "/biology/transport/heart-circuits-mobile.svg",
  "recallMobileSrc": "/biology/transport/heart-circuits-mobile-recall.svg",
  "alt": "Directed, qualitative blood-flow comparison: fish heart to gill capillaries to systemic capillaries back to heart; mammalian right heart to lung capillaries to left heart to systemic capillaries back to right heart."
}
```
These are **properties to merge into the existing object**, not a complete object replacement. Do not alter section ordering, explanation, exam questions, level gates or global navigation. Resolve scientific review and responsive checks before treating this addition as approved.

## Authenticated microscopy: opt-in additions, NOT currently placed
1. In `src/biology/learning/cell-structure/lesson.json` at `A2.2.2` and `A2.2.10`, optionally register **three separate** HT29 channel asset records referencing:
`/biology/authentic-microscopy/cellprofiler-ht29-dapi-dna.png`,
`/biology/authentic-microscopy/cellprofiler-ht29-phospho-h3.png`,
`/biology/authentic-microscopy/cellprofiler-ht29-cellbody.png`.
For each include `kind: "photograph"`, `review: "pending-specialist"`, detailed modality, specimen, one-field/three-channel provenance, `CC0` licence and source links, no scale calibration and biologically limited alt text. Do **not** activate until independent specimen/rights/annotation checks are complete.
2. Already in `A2.2.10` and `A2.2.11`, `a22-cucumber-tem` references the same existing validated WebP with PLOS credit. **No duplicate import**. If adding `B2.2` use a new opt-in asset/reference only after specialist review; no blanket six-panel image reuse.
3. Keep the three TIFF originals as immutable scientific source evidence; lesson visitors see only lossless grayscale PNG derivatives. No color fusion or invented scale.
4. For every new asset, adhere to the existing `sections[].assets`/top-level `assets[]` schema and any optional `figurePlacement` conventions. Run the existing BioLab curriculum validator. Do not patch topic JSON in the visual-lab branch.

## Drawing Practice is owned by another team
`src/biology/learning/drawing-practice/` is **not present on this specified final base**. Its latest specialist branch `feature/biolab-interactive-drawing-practice-20261018` has exactly **1 enabled A1.1.2 exercise and 16 blocked candidates**. This branch changes none of its files. The separate original art and tentative feature-answer maps are provided in `DRAWING_ANSWER_MAPS.json` for independent review **only**. Integration engineers must selectively integrate the Drawing Practice frontend and eligibility guards from that branch after resolving concurrent navigation ownership. Do not inflate enabled counts or bypass asset/permission/review conditions.

## No-deployment QA gate
Before approval, run `node --test scripts/biology/visual-lab-final/visual-lab.test.mjs`, existing scientific visual tests, `npm run quality`, `node scripts/validate-biology.mjs`, `npm run build`; then **real Chromium** screenshots for original/new figures at viewport widths **320, 390, 768, 1024, 1440, 1920 px**, light and dark. Inspect arrowheads, word wrapping, exact label positions, screen-reader accessible descriptions, keyboard/zoom, alternative mobile and recall views. Obtain external independent anatomical/biological review and explicit owner publication clearance. Do not merge into main or publicly deploy.
