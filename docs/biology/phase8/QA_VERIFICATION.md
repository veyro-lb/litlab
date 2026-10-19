# Phase 8 independent verification evidence — 2026-10-16

## Starting state and permitted scope

- Phase 5 foundation commit: `60a15690af6014517edc3482dbc83cdea93726d2`.
- Green historical foundation CI: `https://github.com/veyro-lb/litlab/actions/runs/38869145898`, completed with conclusion success for that commit.
- Exclusive Phase 8 development branch: `feature/biology-phase8-batch4-content-20261016`.
- Allowed-only paths: `src/biology/learning/cell-structure/`, `src/biology/learning/cell-specialization/`, `public/biology/cell-structure/`, `public/biology/cell-specialization/`, `docs/biology/phase8/`, `scripts/biology/phase8/`.

## Read-back positive checks (executed using the GitHub connector, after latest lesson enrichments)

| Check | A2.2 | B2.3 |
|---|---|---|
| Ordered IDs / exact scope | A2.2.1–A2.2.14: 11 shared, 3 additional HL | B2.3.1–B2.3.10: 6 shared, 4 additional HL |
| Student-facing explanation words (mean) | ~218 | ~222 |
| Original four-choice MCQs | 14 | 10 |
| Written questions with provisional marking points | 7 | 7 |
| Original vector figure families | 9 | 10 |
| Exact SVG labelled and recall paths | 18 found | 20 found |
| Claim references and source IDs | Valid | Valid |
| Guide/Hodder page offsets | Valid in checked records | Valid in checked records |
| Review states | `source-mapped`, no reviewer | `source-mapped`, no reviewer |

Numerical check: B2.3.6 cube table rows all satisfy `SA = 6L²`, `V = L³`, `SA/V = 6/L` (L in µm, area µm², volume µm³ and ratio µm⁻¹). A2.2.2 worked examples also use consistent units: 60 mm = 60,000 µm; 60,000/30 = ×2000. Surface-area/volume examples make simplified geometric assumptions explicit.

## Connector-side deliberately invalid fixtures: 13 of 13 correctly rejected

The checker was exercised on clones of actual lesson records for: duplicate understanding ID; wrong HL status; wrong guide page; wrong textbook PDF page; multiple correct options; no correct option; missing recall asset; unearned scientific approval; question-level mismatch; inadequate narrative; unknown source reference; duplicated question ID; wrong SA:V value. All were rejected.

**Testing boundary:** The independent repository scripts `scripts/biology/phase8/validate.mjs` and `scripts/biology/phase8/negative.test.mjs` are committed. The connector-based checks reported above are separate in-memory read-back exercises; do not call them an execution of the committed Node scripts. Node/CI execution requires a checked-out working tree and remains **not run** in this session. The source branch is not a registered app lesson.

## SVG static validation

All 38 SVGs are original project-authored schematics with deliberately simplified visual geometry. During a dedicated repair pass, malformed closing elements were fixed. Each SVG's nested XML tag stack was checked for balance before committing the repair. The static review identified title/description wrapping concerns and applied wrapping to longer labels. This is a source-level syntax check, **not** a claimed successful mobile render, 320px readability test, screenshot capture or qualified microscopic illustration review.

Review page: `docs/biology/phase8/preview.html` allows labelled/recall comparison at 320px and full width without altering app routing.

## Outstanding critical gates

1. The project has **no licensed authentic microscopy package** for A2.2.10 and A2.2.11. Original SVG figures do not fulfill light/electron micrograph observation, drawing or source-specific scale evidence. Do not release without acquiring genuine verified microscopy images.
2. No named human IB subject expert or microscopy expert has yet accepted the scientific claims, MCQs, free-response guidance or drawing content.
3. No independent browser accessibility, touch navigation, visual QA, or phone-size screenshots were captured. Zoom facilities in shared code do not prove legibility.
4. No dedicated new GitHub Actions run has validated the Phase 8 branch with full typecheck/build or the added positive/negative test scripts.
5. Review image reuse rights and IB/publisher licensing requirements before public publication.
6. The authoritative registry and catalog intentionally remain unchanged (`availability: planned`).

**Transfer GO/NO-GO:** Conditional GO for transfer of *unpublished source-mapped development drafts* under the integrator's supervision; **NO-GO for publicly launching these lessons**.

## Reproduction commands (integrator-owned branch or checkout)

```bash
node scripts/biology/phase8/validate.mjs
node scripts/biology/phase8/negative.test.mjs
```

Then run the existing project's typecheck/build/full QA and manually examine the figure gallery on real phone and desktop browsers.
