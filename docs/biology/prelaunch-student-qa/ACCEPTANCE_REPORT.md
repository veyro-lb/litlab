# BioLab — prelaunch student acceptance report

**Date:** 2026-10-18  
**Repository:** `veyro-lb/litlab`  
**Integration source baseline tested:** `bc508506186f4246455856fa58361ca601601abb`  
**QA execution commit:** `96b8d18868cf1e642885064974c86c730b072fcb`  
**QA branch:** `feature/biolab-prelaunch-student-qa-20261018`  
**Final successful browser run:** https://github.com/veyro-lb/litlab/actions/runs/39128768834  
**Actual screenshot / JSON artifact:** https://github.com/veyro-lb/litlab/actions/runs/39128768834/artifacts/12137475623

## Verdict

**PASS — automated acceptance suite for the exact snapshot above.** `230 passed / 0 failed / 0 uncaught page errors`. All **40/40 topic routes** and **147 representative understanding states** were exercised. Chromium produced **43 real screenshots**. The previously failing mobile A2.2 multi-panel TEM enlargement test passed after source changes incorporated by the integration team. No unaddressed application-level defect was detected by this automated suite.

**Not a full launch/WCAG sign-off:** manual assistive technology, real device/touch use, complete contrast audit, production authentication, and forthcoming PDF artwork are outside the verified scope. The `DEFECT_HANDOFF.md` file records the historically reproduced severity-P1 defect and its passing regression.

## Exact test environment

- GitHub Actions Ubuntu 22.04 host with Node.js 22; `npm ci`, actual React/Vite `npm run build`, then production `npm run preview -- --host 127.0.0.1 --port 4173`.
- Headless **Chromium / Playwright 1.56.1**, official `mcr.microsoft.com/playwright:v1.56.1-noble` image; `--network none` Docker container with protected read-only code mount and isolated writeable test-artifacts directory.
- Browser requests restricted to localhost, blob and data URLs; third-party requests deliberately blocked. SL/HL and light/dark were configured with localStorage fixtures; this is **not** verification of a signed-in production account or preview gate.
- Exact QA execution SHA includes integration parent `bc508506…`. No source, figure data, artwork or production configuration was edited by this QA effort.

## Student-journey coverage

| User journey | Executed verification | Result |
|---|---|---|
| Open Biology home; navigate A/B/C/D | Render, theme cards, screenshot | PASS |
| Select Standard/Higher Level | Toggle; A2.1 hidden at SL and present at HL | PASS (sampled gating) |
| Search for syllabus topic | Ctrl+K, C3.1 search, result navigation | PASS |
| Navigate every syllabus topic | 40 topic learn routes, heading and first state | PASS 40/40 |
| Open/read understandings | First/middle/last/HL states; all teaching blocks match authored lesson payloads | PASS 147 |
| Inspect scientific image | Images in all A/B/C/D sample topics; load, meaningful alt, click, dialog and Escape | PASS |
| Inspect 320px licensed image | A2.2.10 six-panel TEM, zoom genuinely scrollable (>200px horizontal scroll), keyboard-safe modal | PASS |
| Find exact image source | Licensed A2.2 image original URL, attribution and CC BY terms in Sources | PASS |
| Answer practice questions | A/B/C/D representative items, answer, feedback and explanation details | PASS |
| Use Revision & Flashcards | A/B/C/D takeaways, reveal and next card | PASS |
| Drawing Practice | A1.1 eligible labelled/draw/answer feedback controls | PASS |
| Navigate prev/next/history | A1.1 next, browser Back and topic return | PASS |

## Responsive matrix and screenshots

Tests ran **light and dark** themes at each width: **320, 390, 768, 1024, 1440 and 1920px**. For all 12 combinations, the homepage and long C3.1 explanation rendered without document-level horizontal overflow. D3.2 comparison tables scrolled in a labelled, keyboard-focusable region at 320 and 390px in both themes. Four scientific enlarged-image examples, four practice-feedback examples, sources and drawing were captured. 200% CSS zoom approximation at 1024px showed no document overflow. Reduced-motion mode disabled theme-card transition.

The artifact ZIP holds `qa-artifacts/prelaunch-student-qa/report.json`, install/build/browser logs, SHA record, and **43 PNG screenshots**. See `EVIDENCE_INDEX.md`.

## Accessibility checks (sampled, not compliance certification)

- **Keyboard:** Ctrl+K focuses search; visible keyboard focus is supplied by the search wrapper's `:focus-within` border/glow; Enter opens a sample scientific image dialog; Escape closes it and returns focus to opener. PASS.
- **Headings:** A1.1, B2.1, C3.1 and D3.2 sampled pages each contain one h1 and no recorded skipped h1–h4 heading level. PASS.
- **Alternative descriptions:** eight sampled scientific image elements across those topics have substantive non-empty alt text. PASS.
- **Table:** D3.2 labelled, focusable, horizontally scrollable table region. PASS.
- **Touch-target heuristic:** on the **320px Biology homepage**, 18 visible interactive elements were inventoried; **0 were below 44px in either dimension**. This is a limited heuristic, not a complete WCAG target-size finding.
- **Theme/motion:** both color schemes exercised, reduced-motion transition disabled. PASS.

## Explicit exclusions and follow-up gates

No real NVDA / VoiceOver / TalkBack / Braille run, physical touch device, full WCAG 2.2/axe audit or comprehensive color-contrast check; no real authenticated/personalized production preview, live external pages, complete 553-understanding audit, native browser toolbar zoom/reflow, every available diagram, individual figure-label legibility study, or scientific/legal image clearance. The **upcoming original PDF crops** were not imported by this QA team and were not part of the tested snapshot: repeat mobile label/source-line/zoom checks after that team integrates them.

The 230-pass result applies **only to the pinned integration commit**. Later changes require a fresh build and Chromium rerun before acceptance. No merge into main or deployment occurred.
