# BioLab — prelaunch student acceptance report

**Date:** 2026-10-18  
**Repository:** `veyro-lb/litlab`  
**Integration baseline:** `8a3e690f65f09932b05f46cec33581b2930a3db1`  
**Executed QA snapshot:** `b51aa881e3a492cb447842d273def3f55f0248eb`  
**QA branch:** `feature/biolab-prelaunch-student-qa-20261018`  
**Final browser run:** https://github.com/veyro-lb/litlab/actions/runs/39128280928  
**Actual screenshot / JSON artifact:** https://github.com/veyro-lb/litlab/actions/runs/39128280928/artifacts/12136881622

## Acceptance verdict

**NOT ACCEPTED FOR LAUNCH.** There is one confirmed P1 student-facing blocker: on 320px screens the A2.2 licensed six-panel TEM figure opens in the enlargement dialog but remains only 268px wide, preventing inspection of its fine scientific detail. See `DEFECT_HANDOFF.md`. This is a test-discovered defect, not a modification made by QA.

Automated results on the executed integration snapshot: **229 passed, 1 failed, 0 uncaught page errors; 40/40 topic routes; 147 representative understanding states; 43 actual Chromium screenshots.** The CI job correctly reports failure because the confirmed issue remains open.

## Exact execution environment

- GitHub Actions Ubuntu 22.04 host, Node.js 22, `npm ci`, production `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4173`.
- Chromium from the official `mcr.microsoft.com/playwright:v1.56.1-noble` browser image; Playwright 1.56.1; headless browser.
- Browser and preview share a Docker container with `--network none`, read-only source bind mount, dedicated writable QA artifact directory, no external requests or live auth. App requests to localhost and data/blob URLs were permitted.
- Client-side Biology SL/HL and color theme preferences were initialized locally as test fixture. **This does not verify production login or account persistence.**
- Exact QA commit contains the newest integration parent. `git diff <integration baseline> <executed QA> -- src public package.json package-lock.json vite.config.ts wrangler.jsonc` was empty at execution.

## Student journey results

| Student journey | Evidence | Result |
|---|---|---|
| Open Biology homepage, view A/B/C/D themes | Homepage route + screenshot | PASS |
| Select SL and HL | Change level, verify HL-only A2.1 hidden at SL and reappears at HL | PASS (representative gating) |
| Find topics and navigate | Search code C3.1; Ctrl+K focus; click result | PASS |
| Open all 40 topic routes | Every registry topic `#biology/topic/<code>/learn`; first understanding selected | PASS 40/40 |
| Read representative understandings | First, middle, last and HL-only state per topic where present; compare every authored teaching paragraph/block with DOM | PASS 147 states |
| Inspect and enlarge scientific figures | Themes A/B/C/D, load, alt, click, dialog, Escape, focus return | PASS in sampled desktop cases |
| View exact image source and terms | A2.2 Vigani et al. licensed TEM media credits; exact source and CC BY link | PASS |
| Answer practice and read feedback | A/B/C/D representative questions; submit, feedback, per-option explanation | PASS |
| Revision and Flashcards | A/B/C/D takeaways, reveal and next card | PASS |
| Drawing Practice | A1.1 eligible exercise: reveal labels, check labels, draw/self-hide controls | PASS |
| Previous/next understandings and browser history | A1.1 navigation, Back, topic return | PASS |
| Inspect high-resolution TEM on phone | A2.2.10 image dialog at 320px | **FAIL: QA-001** |

## Responsive evidence

| Width | Light | Dark | Tested interactions |
|---|---|---|---|
| 320px | PASS | PASS | Homepage, C3.1 reading, horizontal scrolling of D3.2 comparison table |
| 390px | PASS | PASS | Homepage, C3.1 reading, horizontal scrolling of D3.2 comparison table |
| 768px | PASS | PASS | Homepage, long reading |
| 1024px | PASS | PASS | Homepage, long reading |
| 1440px | PASS | PASS | Homepage, long reading |
| 1920px | PASS | PASS | Homepage, long reading |

Viewport tests assert no document-level horizontal overflow. The comparison table is an independently keyboard-focusable labelled region and was successfully scrolled at 320px and 390px. There are 43 real full-page screenshots in the run artifact including both themes, figure modals, practice, source credits and drawing.

**Exception:** The 320px image enlargement test fails even though the small inline image loads and the page does not overflow. See QA-001.

## Accessibility audit

- Search keyboard shortcut moves focus; intended **parent `:focus-within` ring** is visibly styled in computed CSS. PASS.
- Figure can be activated by Enter; dialog focuses internally; Escape closes it and returns focus to opener. PASS in illustrated A1.1 understanding.
- A1.1, B2.1, C3.1 and D3.2 sampled pages each had exactly one h1 and no skipped heading level among recorded h1–h4. PASS in sampled states.
- Eight sampled inline figure images across those four topics carried nontrivial alt descriptions. PASS in sampled states.
- 18 rendered interactive controls on the 320px homepage were inventoried; **0 measured below the 44×44px heuristic**. This is not proof that all app controls meet WCAG target-size criteria.
- The D3.2 comparison table had an accessible region label and `tabindex=0`. PASS.
- Dark/light modes and `prefers-reduced-motion: reduce` checked. Theme-card transitions were disabled under reduced motion. PASS.
- A 200% **CSS zoom approximation** passed without horizontal document overflow at 1024px. Native browser-toolbar zoom and full WCAG reflow testing were not executed.

### Explicit limits / untested items

No manual NVDA, VoiceOver, TalkBack, Braille, touch-hardware, or real user study; no full axe/WCAG 2.2 conformance evaluation; no complete text/background contrast audit across all routes; no keyboard walk through every control; no physical browser zoom (CSS-only approximation); no external login, protected preview authentication or live third-party resource loading; no exhaustive inspection of all 553 understandings; no scientific accuracy/rights/legal certification. Upcoming original PDF crops were **not imported and were not present in this test snapshot**. Their labels, cropping, source-line overlap and mobile enlargement require a new test after the PDF figure team integrates them.

## Change ownership and integrity

Only isolated QA test infrastructure is added relative to the integration baseline: `scripts/biology/prelaunch-student-qa/browser.mjs` and the QA-specific workflow `.github/workflows/biolab-prelaunch-student-qa.yml`. This report and defect handoff reside under `docs/biology/prelaunch-student-qa/`. No scientific lesson content, image metadata, artwork, production settings, or primary integration workflow has been edited. The QA branch was updated through a non-force merge preserving prior QA history. No merge into main, and no deployment.

## Release gate

The integration team should resolve QA-001 and supply a newer source commit, then rerun the same Chromium acceptance suite against that commit. Re-evaluate new licensed/PDF figure crops, manual screen-reader behavior, physical mobile touch and WCAG contrast/reflow before an accessibility or student-launch sign-off.
