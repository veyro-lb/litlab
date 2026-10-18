# Desktop, Tablet, Mobile and Figure Visual Review

Actual Playwright Chromium screenshots were generated on the built BioLab app at approximately 1440, 834 and 390 px, with focused 320 px narrow-screen checks. The original suite also captured 768 px course pages and themes A–D; extended prelaunch covered 320/390/768/1024/1440/1920, light and dark themes, a CSS-based zoom approximation and reduced motion.

## Observed
- Navigation from the main course library through its four themes and into a numbered understanding remained operable across the tested widths.
- Section heading hierarchy and dedicated reading panels were present. Figure placement assertions confirmed that nearby illustrations stay within the teaching passage to which they belong.
- At 1440/834/390 px all 40 topics passed the overflow and lesson navigation checks. At 320 px the representative lessons also passed.
- Structured responses, data tables and their labelled keyboard-scrollable regions were exercised; prelaunch specifically passed 320/390 px horizontal table-scroll tests in light and dark modes.
- The detailed licensed multi-panel TEM initially failed 320 px *enlargement*, despite the small inline image fitting. This was **a real defect**; `ScientificFigure.tsx` was corrected and the formerly failing test now passes, including meaningful horizontal image panning.
- Figure dialogs preserve image aspect ratios and support zoom control, keyboard Escape and return focus as exercised by the acceptance scripts.

## Screenshot / report locations
- `qa-artifacts/full-course/`: course library, four theme lessons, practice UI, mobile 320/390/768.
- `qa-artifacts/preview-readiness/`: A1.2, C1.2, C1.3, D2.1 at desktop/tablet/mobile.
- `qa-artifacts/ui-acceptance/`: 17 workflow screenshots.
- `qa-artifacts/prelaunch-student-qa/`: 43 snapshots including licensed media enlargement and small phones.
- `qa-artifacts/preview-readiness/deployed/`: public-URL A1.2.7 desktop/mobile screenshot evidence.

## Not certified by automated visual QA
A human review of every individual label, phase arrow, graph unit, low-vision interaction and all assistive technologies has *not* been performed. Real iOS/Android hardware, TalkBack, VoiceOver and NVDA must still be checked before any accessibility conformance claim. Automated CSS zoom does not replace native 200% browser zoom testing.
