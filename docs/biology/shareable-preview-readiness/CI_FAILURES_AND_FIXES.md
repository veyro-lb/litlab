# CI Failures and Repairs

The original [consolidation CI run](https://github.com/veyro-lb/litlab/actions/runs/39160865795) failed at `Invalid in-text figure placement a12-7`, because A1.2.7 registered `a12-sugars` and `a12-dna-rna-comparison` but positioned only the comparison. The source invariant requires a distinct valid placement for each asset. The sugars diagram was placed after block 0, the comparison after block 1. No validator or scientific asset was removed.

After that repair, a second failure surfaced: `540 !== 541` in `validate-final-consolidation.mjs`. The 553-row ledger had an additional valid status, `SOURCE_CHECKED_ADEQUATE_NO_TEACHING_REWRITE`. The assertion now explicitly verifies the correct 540/8/4/1 distribution and zero independent scientific sign-offs.

Further independent QA revealed and corrected:
- **11 SL navigation test failures** caused by checking React route content before the next route fully settled. Explicit asynchronous heading and count assertions now pass without relaxing scope filters.
- **One source citation test** expected an outdated source-title capitalization and older review caveat. It now checks the current actual guide title and explicit non-certification sentence. All 38 integrated tests pass.
- **One actual device defect**, observed in extended prelaunch: licensed `a22-cucumber-tem` displayed at a 268 px-wide viewport without useful scrolling in the enlargement dialog. `ScientificFigure.tsx` now selects a useful raster inspection width, bounded by its natural dimensions, so the image becomes pannable. Extended prelaunch rerun: 230/230 passed.

## Final test commands
```sh
npm ci
node scripts/validate-lessons.mjs
node scripts/validate-biology.mjs
node scripts/biology/validate-full-course-depth-audit.mjs
node scripts/biology/validate-final-consolidation.mjs
node --experimental-strip-types --test scripts/biology/figure-layout-refinement/figure-presentation.test.mjs
node --test scripts/biology/scientific-visual-redesign.test.mjs scripts/biology/scientific-visual-assets-repair/verify.test.mjs
npm run quality
npm run build
node scripts/biology/preview-readiness/verify-public-build.mjs
# With built Vite preview on http://127.0.0.1:4173:
node scripts/biology/full-course/full-course-browser.mjs
node scripts/biology/preview-readiness/browser.mjs
node scripts/biology-ui-acceptance.mjs
node scripts/biology/prelaunch-student-qa/browser.mjs
# With the public preview reachable:
node scripts/biology/preview-readiness/deployed-browser.mjs
```

## Representative workflow evidence
- [68 + 717 browser checks, 0 failures](https://github.com/veyro-lb/litlab/actions/runs/39165522350)
- [230/230 prelaunch and 38/38 integrated acceptance, no errors](https://github.com/veyro-lb/litlab/actions/runs/39166631676)
- [Live deployed Chromium 12/12](https://github.com/veyro-lb/litlab/actions/runs/39166463849)
- [Security compatibility update passed](https://github.com/veyro-lb/litlab/actions/runs/39166025070)

Do not describe a newer commit as CI-passing until its associated GitHub Actions workflow concludes successfully. This set of workflows only validates and builds; **it does not deploy or merge to main**.
