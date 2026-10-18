# QA-001 — scientific image enlargement on mobile

**Priority:** P1 when originally observed; **status: RESOLVED IN TESTED INTEGRATION BASELINE**  
**Failed baseline:** `8a3e690f65f09932b05f46cec33581b2930a3db1`, QA run https://github.com/veyro-lb/litlab/actions/runs/39128280928  
**Passing integration baseline:** `bc508506186f4246455856fa58361ca601601abb`, QA run https://github.com/veyro-lb/litlab/actions/runs/39128768834

## Historical defect and reproduction

1. In Chromium at viewport width 320px, open `#biology/topic/A2.2/learn?understanding=A2.2.10` (same image is also linked from A2.2.11).
2. Activate `figure.bio-figure[data-asset-id="a22-cucumber-tem"] button.bio-figure-image`.
3. In `dialog.bio-figure-dialog .bio-figure-zoom`, inspect computed image width and scroll width; attempt horizontal scrolling.

Original observation: the authentic six-panel cucumber-leaf TEM image loaded at intrinsic **1228 × 778px** but the dialog displayed it at only **268px** with `clientWidth=scrollWidth=268`. This prevented students from enlarging the panel labels and individual 500nm scale bars. The full-size scientific evidence is from Vigani et al., *PLOS ONE* (2015): https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0129141. Its exact attribution and license links were correctly presented in Sources even when zoom failed.

**Root-cause area:** `src/biology/biology.css`, interaction between `.bio-app .bio-reading .bio-figure img { max-width:100% }` and `.bio-figure-zoom img` sizing. Component owner: `src/biology/learning/ScientificFigure.tsx`. QA deliberately did not modify either file.

## Retest / resolution

After ten integration commits culminating in `bc508506…`, the same genuine compiled-app Chromium test **passed**:
- Inline image loads, natural size remains **1228 × 778px**.
- Activating modal exposes a scrollable zoom area with `scrollWidth > clientWidth + 200px`.
- Programmatic horizontal scroll reached `scrollLeft > 200px`; the full multi-panel image can be inspected.
- Other figure keyboard activation and Escape/focus-restoration assertions pass.

**Status for this exact tested baseline: resolved / regression passed.** If a subsequent CSS change reintroduces failure, scope constrained image-width rules only to inline figures rather than modal descendants; do not alter scientific image data or rights metadata in QA.

## Evidence and owners

Failed run: https://github.com/veyro-lb/litlab/actions/runs/39128280928  
Passed run: https://github.com/veyro-lb/litlab/actions/runs/39128768834  
Passed run screenshot/JSON artifact: https://github.com/veyro-lb/litlab/actions/runs/39128768834/artifacts/12137475623  
Test: `scripts/biology/prelaunch-student-qa/browser.mjs`, `Real licensed multi-panel micrograph fits 320px and enlarges`.

**Remaining dependencies, not confirmed bugs:** manual screen-reader and full WCAG evaluation; real account login and preview authentication; original PDF figure crops have not yet been added/tested. The PDF figure team owns artwork. Any new figures require fresh responsive verification.
