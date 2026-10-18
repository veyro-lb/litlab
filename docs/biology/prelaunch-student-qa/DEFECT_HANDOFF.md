# QA-001 — mobile scientific image cannot enlarge

**Severity:** P1 (major student-learning functionality blocker)  
**Status:** Confirmed open  
**Observed on integration baseline:** `8a3e690f65f09932b05f46cec33581b2930a3db1`  
**QA execution:** `b51aa881e3a492cb447842d273def3f55f0248eb`, https://github.com/veyro-lb/litlab/actions/runs/39128280928  
**Owned fix:** Integration / figure-display UI team; QA has intentionally not patched their files.

## Reproduction

1. Run the compiled Vite preview of the integration snapshot in Chromium at a **320px** viewport.
2. Open `#biology/topic/A2.2/learn?understanding=A2.2.10` (also included with `A2.2.11`).
3. Locate `figure.bio-figure[data-asset-id="a22-cucumber-tem"]`: the authentic six-panel cucumber-leaf thin-section TEM from Vigani et al. (2015), source https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0129141.
4. Click the `button.bio-figure-image` to open `dialog.bio-figure-dialog`.
5. In `.bio-figure-zoom`, inspect computed image width and `scrollWidth` relative to `clientWidth`, and attempt horizontal scroll.

### Expected

Dialog shows a meaningfully larger or natural-size image with accessible horizontal and vertical pan/scroll so students can read six-panel labels and scale bars. Close by Escape and restore focus to opener. The source credit must remain accessible without covering image content.

### Actual

Image loads (`naturalWidth=1228`, `naturalHeight=778`) and opens the dialog, but becomes only `268px` wide; zoom container `clientWidth=268`, `scrollWidth=268`. No horizontal scrolling is possible and no actual enlargement occurs. Inline page width and source metadata tests pass. The assertion correctly fails.

```text
FAIL Real licensed multi-panel micrograph fits 320px and enlarges
Large TEM not genuinely enlarged for mobile inspection:
{"client":268,"scroll":268,"imgClientWidth":268,
 "imgNaturalWidth":1228,"imgNaturalHeight":778,
 "imgComputedWidth":"268px","imgMinWidth":"100%"}
```

## Narrow proposed patch (NOT APPLIED)

**Files to review:** `src/biology/biology.css` and, only if necessary, `src/biology/learning/ScientificFigure.tsx`.

A likely CSS cascade/specificity conflict occurs because `.bio-app .bio-reading .bio-figure img { max-width:100% }` (around line 298) applies to **both inline and dialog images**, counteracting the intended `.bio-figure-zoom img { max-width:none; width:auto; min-width:100% }` rule (around line 219). Prefer scoping the responsive `max-width:100%` to the inline figure-button image, *not* its descendant `dialog`, or give the modal zoom image a correctly scoped higher-specificity rule that preserves intrinsic width. Verify resulting computed `max-width`, intrinsic resolution, scrollable area and keyboard access in Chromium. Avoid globally removing all image sizing constraints.

After the UI team applies the patch, rerun the isolated acceptance suite and explicitly verify 320/390/768 widths, a 1228px-wide multi-panel image, smaller single-panel drawings, Escape/focus restoration, light/dark modes, and any forthcoming original PDF crops.

## Evidence

- Final run: https://github.com/veyro-lb/litlab/actions/runs/39128280928
- Artifact with actual `licensed-image-mobile-320.png`, `licensed-image-enlarged-320.png`, JSON and browser log: https://github.com/veyro-lb/litlab/actions/runs/39128280928/artifacts/12136881622
- Test assertion: `scripts/biology/prelaunch-student-qa/browser.mjs`, case `Real licensed multi-panel micrograph fits 320px and enlarges`
- Original image rights/source metadata **passed** separately; this is not a provenance failure.
