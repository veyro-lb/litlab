# BioLab content and visual continuation — 17 October 2026

This is a **development-branch change record**, not a release or scientific approval. It supplements the preserved `REVIEW_REPORT.md` and exact-commit QA evidence, which continue to describe the earlier candidate. Do not rewrite historical test results or portray them as evidence for this later commit.

## Implemented after the prior review candidate

- Simplified the shared lesson figure component: no visible title, caption paragraph, attribution or external/open/enlarge text below ordinary diagrams. Clicking the illustration enlarges it; accessible image descriptions and a keyboard-operable dialog remain. Withheld figures retain explicit safety/reliability warnings. Scientific figure provenance remains available under Sources.
- Removed the per-figure recall control from directly below figures in normal reading. Revision continues to support recall controls separately.
- Added typed, accessible, responsive inline learning visuals: comparison tables, proportionate numeric bars and causal/process diagrams. Visuals are editorially associated with a specific understanding and reading position, not generated automatically from text.
- Added thirteen editorially selected visuals: nine comparison tables, two numeric charts and two process diagrams. These address water cohesion/adhesion and heat capacity, DNA/RNA, starch/glycogen/cellulose, levels of protein structure, passive/active transport, Golgi-secretory traffic, anabolism/catabolism, morphogen differentiation, stem-cell potency, SA:V cubes, microscopy methods and cell-group comparisons.
- Connected the **existing preserved** A2.2 Cell structure development draft to the course catalog and registry rather than replacing it. The draft contains 14 understandings, 21 questions and 10 recorded assets, including a CC BY 4.0 plant TEM image. Its microscopy review limitations remain explicit.
- Changed visible draft counts to use the registry rather than stale hard-coded numbers.

## Current truthful scope

- Official 2025 course map: **40 topics**, **553 syllabus understandings**.
- Available source-mapped or scientific-review-stage teaching drafts: **9 topics**, **115 understandings** (74 SL+HL shared and 41 additional HL).
- Remaining planned topics: **31**. A draft is not a certified or fully edited lesson.
- Post-change programmatic cross-file audit: all nine catalogs resolve to registered topics; the 115 section IDs and levels align with the registry; all asset IDs and reference IDs resolve within the lessons; 13 new visuals have valid placements, table dimensions and numeric chart metadata.
- **Build, browser/device regression, qualified figure/science review and student comprehension tests have not been rerun for these new commits.** The former exact-commit evidence does not prove this subsequent state passed.

## Editorial rules for the remaining lessons

1. Use the official IB Biology Guide (first assessment 2025) for exact SL/HL scope, understanding number, skills and NOS. Use the Hodder third-edition coursebook as a major explanatory reference, alongside corroborating authoritative scientific sources where necessary. Do not copy textbook prose, diagrams, protected questions or figures into the site.
2. Write **original**, biologically explicit teaching prose under meaningful section titles. Follow cause → mechanism → consequence, give one relevant example and remove decorative filler. The reading itself must not be concealed in question accordions.
3. Use a **comparison table** when students must distinguish multiple similar types; a **chart** only for genuine sourced numbers or a prominently explained calculated/theoretical model; a **flow diagram** for processes and causal pathways; and authentic microscope/photographic evidence for observation-based skills. No unnecessary visual per paragraph.
4. Place each visual at the point of explanation. Make charts have units, assumptions and a zero baseline where appropriate. Keep long alt descriptions and scientific attribution accessible without reinstating footer clutter under every figure.
5. Distinguish conceptual schematic from direct experimental observation; withhold incorrect or insufficiently licensed images. Keep data limitations visible.
6. Provide original diagnostic checks with causal feedback, recall prompts and misconception repair. Retain accurate SL/HL gating and deep links.
7. Every newly exposed topic must pass curriculum/lesson cross-reference validation, strict TypeScript production build, mobile/desktop and keyboard tests, image/asset audit and qualified review before it is described as approved.

## Next content work

1. Finish A2.2's authentic light/electron micrograph exercises: prokaryotic and animal cell panels, organelle-specific recognition, specimen provenance, labelled/unlabelled variants and genuinely calibrated measurement tasks. Its existing cucumber leaf TEM alone is not comprehensive coverage.
2. Complete full chapter-by-chapter editorial comparison of the six earlier drafts that have not received the intensive Water/B2.2 source pass (A1.2, B1.1, B1.2, B2.1, B2.3, C1.1); repair missing visuals, questions and misconceptions rather than adding generic content.
3. Expand the remaining 31 planned topics in bounded syllabus-confirmed batches; preserve the simple course navigation, mark only actually available lessons as available, and keep qualified review separate from machine-validation status.
4. Run the complete isolated build and browser QA suite on the **new exact HEAD** after this batch. Do not merge into main or deploy publicly without the owner's explicit approval.
