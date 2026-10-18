# BioLab — Full Website Audit

Date: 2026-10-18 (UTC); scope: isolated development-preview repair and acceptance, not a production launch.

## Tested application and evidence
- Repository: `veyro-lb/litlab`. Base consolidated branch: `feature/biolab-final-consolidation-and-depth-20261018` at `f7adf6be2453cd4f9fc1aad4df76c97a4c2764e1`; unchanged by this work.
- Isolated fix branch: `feature/biolab-preview-qa-fixes-20261018`. Local fully passing student/browser suite demonstrated at `a9cf124903c646a10d614496ad3253dcc2e1359d`; the branch also contains subsequent public-distribution checks and documentation.
- Existing whole-course Chromium suite: **68 passed / 0 failed**, 40 topic routes.
- Additional curriculum and three-viewport Chromium suite: **717 passed / 0 failed**; 120 topic-width visits, all 553 numbered understandings on desktop, 40 SL-filter checks, representative 320 px lessons.
- Integrated student acceptance: **38 passed / 0 failed**, no page errors, 17 screenshots.
- Extended prelaunch browser acceptance: **230 passed / 0 failed**, zero page errors, 43 screenshots, 40 topic routes and 147 selected reading states. It includes desktop/mobile, light/dark, keyboard, zoom, data tables, lessons, activities and sources.
- Deployed *public* Cloudflare smoke: **12 passed / 0 failed**, zero page errors, actual A1.2.7 asset placement and decoding, anonymous entry, representative direct lessons and interactions. See `https://github.com/veyro-lb/litlab/actions/runs/39166463849`.

These are test-suite observations, **not** a claim that every diagram, sentence, source, answer, device and accessible workflow received a human expert review.

## Actual repairs
1. A1.2.7's original sugars diagram and DNA/RNA comparison both receive in-text placements after teaching blocks 0 and 1 respectively; neither is discarded.
2. Exact consolidation-ledger status invariant reconciled: 540 awaiting individual review, 8 prior-batch checked, 4 improved checked, 1 source-checked adequate, 0 signed off. The 553-count checks remain strict.
3. SL browser test waits for settled navigation, fixing 11 timing-dependent false failures.
4. Existing source-provenance acceptance asserts the actual current IB course guide title and transparent scientific non-certification notice.
5. Narrow-device raster figure viewer now initializes high-resolution inspection at a pannable size; the 320 px licensed multi-panel TEM regression passes.
6. Compatible Vite/Wrangler/transitive-patch changes brought full npm audit from 7 findings to 0, confirmed by Actions with full quality/build checks.

## Assessment and exclusions
- Home entry, four course themes, levels, direct lessons, revision/flashcards, answer feedback, written-marking guidance, figure enlarge/zoom/Escape, page responsiveness and keyboard operation have been checked by Playwright suites. Anonymous operation was prioritized; no real student account was accessed.
- Source PDFs and uncleared textbook crops are excluded from publicly distributed assets. See the separate copyright record and public-build gate.
- **Preview-ready as a development demonstration** on the basis of current browser tests; **NOT production-approved**, IB-approved, independently scientifically certified or WCAG-certified.
- Exact Cloudflare deployment-to-commit attestation was not available from the public site; successful deployed behavior is confirmed instead.
- Evidence resides in linked GitHub Actions artifacts under `qa-artifacts/full-course`, `qa-artifacts/preview-readiness`, `qa-artifacts/ui-acceptance`, `qa-artifacts/prelaunch-student-qa` and `qa-artifacts/preview-readiness/deployed`.
