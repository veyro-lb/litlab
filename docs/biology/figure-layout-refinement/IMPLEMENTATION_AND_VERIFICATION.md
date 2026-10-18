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

## Completed implementation and verification

- **Verified implementation SHA:** `eb7aaf7c7f3f0e8ed95e928ac88acf006cf55694`.
- **Clean isolated GitHub Actions run:** https://github.com/veyro-lb/litlab/actions/runs/39143178470 — **SUCCESS**. No deployment job runs on this branch.
- `npm ci --no-audit --no-fund`: PASS.
- `node --experimental-strip-types --test scripts/biology/figure-layout-refinement/figure-presentation.test.mjs`: **4 regression tests PASS, 0 FAIL**, including classification, PDF reproduction-rights gating, all 40 lesson-placement references, and modal zoom CSS.
- `node scripts/validate-lessons.mjs`, `node scripts/validate-biology.mjs`, `npm run quality`: PASS.
- `npm run build` on both the refined code and exact pre-change integration commit `a03f8f86af7009a529b6aaf8fd7e581a3928de52`: PASS.
- **Real Chromium previews (built production code, not simulated screenshots):** 13 representative lessons × desktop 1440px, tablet 834px and mobile 390px × original/refined = **78 before-and-after PNG captures, 0 errors**.
- Representative assets: A1.1 cohesion; A1.2 nucleotide; A2.2 cell organization; B1.2 protein levels; B2.1 membrane protein roles; B3.2 heart; C1.2 Krebs cycle; C1.3 thylakoid chemiosmosis; C2.2 action-potential trace; D1.1 replication polarity; D1.2 coding/template strands; D2.1 mitosis; D3.3 feedback.
- Browser assertions: original image decoded; image in viewport; contextual width within cap; diagram zoom produces a genuinely larger rendered image at 150%; zoom reset; native Escape close; focus returns to original image trigger; A1.2 copyrighted PDF-derived illustration withheld pending permission.
- Unmodified evidence/report ZIP artifact: https://github.com/veyro-lb/litlab/actions/runs/39143178470/artifacts/12142512366 (contains `qa-artifacts/figure-layout/report.json`, 78 named PNGs and local preview logs; GitHub artifact access/retention applies).
- An inherited `.bio-app .bio-reading .bio-figure img{max-width:100%}` rule was discovered to cap all modal zoom images. Corrected by a higher-specificity `.bio-app .bio-figure.bio-figure-clean .bio-figure-dialog .bio-figure-zoom img` rule and verified in the passing 78-capture run.
- All work remains on the isolated branch; no merge into main, no public deployment.

## Outstanding release qualifications

1. **Rights:** some pre-existing protected PDF figure binaries are already present under `public/` on the integration baseline. Withholding them in React does not prevent direct URL access or erase historical Git blobs. Legal/owner permission checks and removal or replacement of publicly distributable unauthorized artwork remain essential before a release.
2. **Quality:** this QA sampled 13 topic figures rather than manually inspecting every visual; verify exceptional multi-panel images and narrow 320px screens. Future per-asset `displaySize` overrides can refine atypical illustrations without changing the lesson structure.
3. **Performance:** native intrinsic dimensions/aspect ratio metadata could reduce layout shift for delayed raster image loads.
4. **Scientific sign-off:** no new scientific accuracy certification or publisher/IB endorsement is claimed. Named qualified scientific visual review remains pending.
5. **Publication:** branch green means technical CI passed, not production release approval.
