# Forty-Topic and 553-Understanding Browser QA

## Coverage
The official local `src/biology/curriculum/registry.json` has 40 topics arranged as follows:
- **A — Unity and diversity (9):** A1.1, A1.2, A2.1, A2.2, A2.3, A3.1, A3.2, A4.1, A4.2.
- **B — Form and function (10):** B1.1, B1.2, B2.1, B2.2, B2.3, B3.1, B3.2, B3.3, B4.1, B4.2.
- **C — Interaction and interdependence (9):** C1.1, C1.2, C1.3, C2.1, C2.2, C3.1, C3.2, C4.1, C4.2.
- **D — Continuity and change (12):** D1.1, D1.2, D1.3, D2.1, D2.2, D2.3, D3.1, D3.2, D3.3, D4.1, D4.2, D4.3.

## Executed browser observations
| Test dimension | Actual result |
| --- | --- |
| Desktop ~1440 px direct topic routes and headings | 40/40 visited |
| Tablet ~834 px direct topic routes and headings | 40/40 visited |
| Mobile ~390 px direct topic routes and headings | 40/40 visited |
| 320 px narrow samples | A1.2, B2.1, C1.2, D2.1 passed overflow |
| Numbered-understanding desktop deep links | 553/553 passed reading/teaching/figure placement checks |
| Per-topic SL/HL-filtered navigation | 40/40 passed |
| Full-course original Chromium suite | 68/68 passed |
| Additional multi-viewport/numbered-understanding suite | 717/717 passed |
| Extended prelaunch acceptance (supplemental journeys) | 230/230 passed |

For each numbered understanding, the automated audit checks the selected `data-reading-id`, nonempty teaching body, expected teaching-block count, registered figure count and exact in-block placement. All three primary widths check the lesson route, navigation count and horizontal page overflow. SL runs test visibility and HL-only access separately.

## Public-preview subset
The separate anonymous Cloudflare test (not localhost) passed 12/12 checks at desktop and mobile: BioLab entry, A1.2.7 sugars/comparison graphics and image decode, correct MCQ feedback, zoom dialog, written response marking guidance, and direct links for A1.1, C1.2, C1.3, D1.1, D2.1. The A1.2 test itself supplies the sixth requested representative lesson.

## Evidence and limits
Scripts: `scripts/biology/full-course/full-course-browser.mjs`, `scripts/biology/preview-readiness/browser.mjs`, `scripts/biology-ui-acceptance.mjs`, `scripts/biology/prelaunch-student-qa/browser.mjs`, `scripts/biology/preview-readiness/deployed-browser.mjs`. See their `qa-artifacts` JSON reports and screenshots in CI.

These checks verify actual browser rendering, not every possible state transition of every content block. In particular, automated browser screenshots do not establish that each biological assertion or intricate diagram label is scientifically correct.
