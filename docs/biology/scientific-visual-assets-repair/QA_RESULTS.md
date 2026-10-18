# Verification and evidence

The workflow uses a local Vite preview in a GitHub Actions runner. It does not deploy the site. The final delivery message identifies the documentation/handoff commit; code and browser evidence are pinned here separately.

## Local and CI checks

- `node scripts/validate-lessons.mjs`: all 40 packages pass mapping, content, scope, provenance and local asset checks.
- `node scripts/validate-biology.mjs`: 40 topics, 553 IDs, 337 shared / 216 HL pass.
- `node --test scripts/biology/scientific-visual-redesign.test.mjs scripts/biology/scientific-visual-assets-repair/verify.test.mjs`: 16 pass, including negative tests for absent rights, missing placement, broken variants and altered CO₂ data.
- `node --experimental-strip-types --test scripts/biology/figure-layout-refinement/figure-presentation.test.mjs`: four pass, including PDF provenance versus reuse permission.
- `npm run quality`: 373 source files pass.
- `npm run build`: TypeScript and Vite pass. Existing bundle-size advisory remains; it is not a build error.

Complete browser reproduction:

```sh
npx playwright install --with-deps chromium
npm run preview -- --host 127.0.0.1 --port 4173
# In another shell, after the preview is ready:
node scripts/biology/scientific-visual-assets-repair/browser.mjs before
node scripts/biology/scientific-visual-assets-repair/browser.mjs after
```

The workflow `.github/workflows/biolab-scientific-visual-assets-repair.yml` installs dependencies, runs all validation above and captures the actual pages. The script preserves screenshot/report files under `qa-artifacts/scientific-visual-assets-repair/`; CI artifacts expire after 14 days, so selected permanent screenshots and reports are committed in this directory.

## Review history and bounds of the evidence

The initial successful full browser run was [39142828135](https://github.com/veyro-lb/litlab/actions/runs/39142828135) at `926ba3fe3a7d90d765bbf098bec5383b5c6a52df`: 176 registered figures in both widths, 924 after PNG captures, 996 result records and zero issues. All 176 desktop and 176 mobile figure images plus 246 native desktop visual captures were visually inspected via contact sheets. This inspection found specific isotope/tree/feedback layout issues repaired in later commits.

A subsequent run exposed a test-only shadow-DOM focus assertion defect; it was replaced with Playwright's shadow-aware focus assertion. Run [39145306590](https://github.com/veyro-lb/litlab/actions/runs/39145306590) at `2dc5e3720a96caf458f4a11bdbef2bdda4a6cae1` passed after combining layout/zoom changes. Run 39145751084 failed the organelle control test because updating study state lost the control's focus between separate keyboard operations; the suite now directs each keyboard action to the control itself, matching how a user reselects it. No interaction was deleted to obtain a pass.

Before/after permanent screenshot pairs show Krebs and thylakoid figures at both widths. “Before” means baseline original SVG bytes rendered with the current component. It does not mean the whole original interface, and does not reproduce removed publisher crops. Final new-asset screenshots and machine reports are identified below once the final render completes.

External micrograph requests and the RCSB molecular viewer were not exercised by the offline suite. Existing opt-in source/fallback interactions remain; the six new local photographs are decoded and rendered without relying on a remote image host. A successful browser run verifies rendering and behavior, not independent scientific certification.

## Final verified code run

[Run 39146594375](https://github.com/veyro-lb/litlab/actions/runs/39146594375) **passed** at code commit `2afc9f62d26ef136e169dc2a88cb65be4f0ac5de`, tree `e7034cb3242e5ac9ea9304d39351c978ad72faf9`. [Full artifact](https://github.com/veyro-lb/litlab/actions/runs/39146594375/artifacts/12143078363) is 37,047,833 bytes, SHA-256 `b2769fc66e8d7614bff91a2cdd19cc1431632e1c1b68db7d167acca33dd22dd4`.

- 40 topics; all 184 registered assets at both 1440 and 390 px.
- 1,020 result records; 368 figure dialog/aspect/zoom/Escape/focus checks.
- 544 native visual/activity captures across both widths; four representative SL captures.
- 288 referenced SVG variants rendered directly; **zero text bounds outside the viewBox**.
- **Zero reported issues**, with heat and concentration control assertions passing.
- Before phase: 36 result records, representing nine targeted figures at both widths. A final audit-script-only correction changes the tree figure's lookup ID to `vertebrate-tree`, so subsequent runs also capture that tenth before figure. It does not change student-facing code.

The committed reports preserve the full measurements. Final screenshot inspection additionally covers the new neuron, pedigree, renal filtration and CO₂ figures at both widths, plus selection/zoom. The final handoff commit adds documentation/evidence and that before-only ID correction; the student-facing source and asset tree is identical to the passing code run.
