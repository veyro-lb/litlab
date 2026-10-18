# BioLab — figure-layout refinement, 2026-10-18

## Baseline and audit
Integration HEAD: `a03f8f86af7009a529b6aaf8fd7e581a3928de52`. Work is isolated on `feature/biolab-figure-layout-refinement-20261018`. The existing renderer expanded every original SVG or PDF-derived crop to the reading-column width; the modal also forced at least 1200px image width, without user zoom. Redundant figure captions were already screen-reader-only. The editorial structure, SL/HL scope, navigation, assessment, lessons and original artwork remain unchanged.

Representative asset/section inventory inspected in real repository lesson packages: A1.1, A1.2, A2.2, B1.2, B2.1, B3.2, C1.2, C1.3, C2.2, D1.1, D1.2, D2.1, D3.3. Kinds include molecular-model, illustration, diagram, original-svg, original-schematic, schematic and photograph. Tables and authored charts already use native responsive components.

## Rendering specification
- Compact 400px (molecules and simple structures); standard 600px; detailed 800px (replication, meiosis, Krebs, electron transport, translation); wide up to existing 860px content column (graphs, spectra, comparisons).
- Typed per-asset `displaySize` overrides the conservative semantic default. Natural aspect ratio; no crop, fixed image height, forced 1200px minimum or enlarging raster preview beyond intrinsic width.
- Single compact diagrams sit beside an explanation only where a large screen and passage structure allow; mobile stacks in source order.
- Click opens native dialog with focus return, Escape close, +/− zoom from 100% to 400%, Reset and scroll/keyboard panning; modal reads full asset source rather than the small mobile variant.
- Original figure captions remain available to assistive technology without redundant page text. External Wikimedia microscopy photos remain opt-in and credited; their normal display width is restrained.

## Rights
Compared integration `docs/biology/source-figure-credits.json` with the isolated Hodder audit branch `docs/biology/hodder-missing-diagrams/PDF_SOURCE_AND_RIGHTS_LEDGER.json`. Hodder reproduction permission is recorded as NOT_GRANTED_OR_EVIDENCED. No private Hodder art is imported. Existing source-PDF figures carry hashes/pages but not redistribution grants; the renderer withholds these until explicit documented per-asset `publicReproductionRights:'cleared'`. A credit is not permission. **Existing binary images in the baseline public folder may remain directly accessible even when hidden by the app; permission review and removal from distributable artifacts are unresolved release blockers.**

## Verification and pending checks
Added Node tests at `scripts/biology/figure-layout-refinement/figure-presentation.test.mjs` covering sizing, copyright gate, 40-topic asset placement integrity, and responsive CSS invariants. Run with:
`node --experimental-strip-types --test scripts/biology/figure-layout-refinement/figure-presentation.test.mjs`.

Full clean-checkout commands still required: `npm ci`; `node scripts/validate-lessons.mjs`; `node scripts/validate-biology.mjs`; `npm run quality`; `npm run build`. These have **not run** here because the environment has no Git/npm network checkout. Real integrated screenshots are **not available**; no before/after image evidence is fabricated. Browser QA pending at 1440, 834, 390 and 320px, including the 13 named lessons plus additional topics, focus, zoom, mobile panning and graph axis legibility.

Remaining: real app screenshot verification; documented public-image clearance; intrinsic dimensions for reduced layout shift; qualified scientific figure sign-off; review exceptional diagram classes for explicit overrides. No merge, reset, deployment or main-branch changes.
