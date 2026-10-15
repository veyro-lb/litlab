# LitLab Biology — independent UX/UI Design Lab

**NON-PRODUCTION, ISOLATED PROTOTYPE.** No student account, score, progress, authentication, server, English page, production component, or application route is changed.

## Open the prototype

Open [`standalone.html`](standalone.html) in a local browser. This complete HTML file contains its own CSS and JavaScript, requires no external dependencies, and has no network requests. For editable development, run a local static server in this folder and open `index.html` (which uses `styles.css` and `app.js`). Both versions implement the same interface.

The prototype includes: curriculum dashboard with the 40 IB Biology topic names and honest planned/draft statuses, SL/HL switching, theme filter and search; A1.1 Water syllabus overview with A1.1.1–A1.1.8 and HL-only distinctions; interactive A1.1.2/A1.1.3 lesson samples, mobile section navigation, original molecule schematic with charge-label recall and enlargement; revision retrieval; Paper 1A, 1B, Paper 2-format original practice with immediate explanations and written self-review; and light/dark display.

**Prototype scope:** A1.1.2 and A1.1.3 are illustrative UX samples, *not* complete or human-approved lessons. Non-sample syllabus rows intentionally show an honest placeholder rather than fabricated material. All content is original, paraphrased scientific explanation; official guide, textbook pages and copyrighted figures are not embedded.

## Run offline browser tests

```
python test_prototype.py
```

The test uses a locally installed Playwright Chromium browser with the HTML, CSS and JavaScript injected into `about:blank` because the sandboxed Chromium policy blocks navigation to local URLs. This does **not** test a deployed website. See `test-results.json` for assertions and `screenshots/` for viewport captures. Tested layouts: 1440, 768, 390 and 320 px. Two self-contained reduced-size image galleries are included: `screenshots-desktop.html` and `screenshots-mobile.html`. Full original PNG captures are in `screenshots/`.

## Design and integration documentation

See [`HANDOFF.md`](HANDOFF.md) for current source inspection, visual system, user flows, accessibility findings, exact production component mapping, priorities, test evidence and integration boundaries.

**Branch:** `feature/biology-design-lab`, forked from foundation commit `64050774a88878b5910c15c3227345df16c431f0`. The only authorized repository additions are under `docs/biology/design-lab/`. The integrator must review and cherry-pick or translate proposals explicitly; no automatic merge, pull request or deployment is authorized.