# BioLab — Final IB Biology Assessment and Learning Quality Report

**Date:** 2026-10-18
**Repository:** `veyro-lb/litlab`
**Isolated development branch:** `feature/biolab-ib-assessment-final-20261018`
**Pinned assessment source SHA:** `73f6278c6f8d941f2eeb68b836459efe78572a0b`
**Subsequently advanced comparison-base SHA:** `ab5bc2b8ae83f7e3bfedd3e52097ea3daa7a1d3f`
**No merge / no deployment / no theme-specific lesson JSON edits by this branch.**

## Decision

**PASS — assessment engineering, structural audit, fingerprint safety, representative browser tests and production build.**
**NOT CERTIFIED — comprehensive scientific correctness, full examiner scoring and user learning-outcome validity.**
All assessment items are original **BioLab practice inspired by the IB Biology syllabus**, not official IB examination material or endorsed/approved questions.

## Full-course audit

The prior audit inventoried and mechanically examined all **997 original main practice questions** across **40 registered topics**: **535 Paper 1A-style multiple-choice**, **52 Paper 1B-style data/short-answer**, **410 Paper 2-style structured and extended**, with **598 shared SL/HL** and **399 additional-HL** questions. The 601 embedded interactions are counted separately. Topic registry: 553 individual understandings (337 shared, 216 HL).

The preserved `QUESTION_REVIEW_LEDGER.json` maintains each question's topic, ID, understanding mapping, paper, level, mark count, source-lesson fingerprint, scientific review status and editorial flags. Full inventory does **not** imply complete independent biological verification. Earlier editorial heuristics found 90 items with identical wrong-choice feedback, 98 possible boilerplate feedback items (188 candidates, **not 188 proven errors**), 16 cross-section-linked understanding cases for placement review, and 3 figure revalidations.

## Verified original assessment improvements

The `PROPOSED_QUESTION_PATCHES.json` document contains **25 fingerprint-validated, full-object correction proposals**: the prior 14 scientifically edited corrections plus **11 new reasoning and data improvements**, spanning A3.2 cladistics (HL transfer, convergent traits and taxonomy), C4.1 population growth and arithmetic, C4.2 decomposer substrate/chemoautotrophy, B4.1 simulated transect/light gradient (graph axes, confounders, replication), and B3.1 vital capacity (removed an answer-leaking table row). Question-by-question correct and incorrect explanations, precise written marking points and explicitly hypothetical datasets are included.

Each record has original ID, exact prior question object, SHA-256 of `JSON.stringify(originalQuestion)`, source lesson blob SHA, proposed replacement and answer key, reasoning, source references, assessment-skill tags, limitations and **pending-qualified-examiner-review** status. Replacements never claim official approval.

One additional 3-mark carbon-rate/uncertainty proposal `d43-written-1` was detected as mismatching the pinned original and **quarantined**, rather than forcing a stale update. It remains in `blockedProposals` for scientific reconciliation, not in the active 25.

## Important comparison with ongoing integration

At comparison base `ab5bc2b8ae83f7e3bfedd3e52097ea3daa7a1d3f`, exact question-object comparisons showed:

- **14 prior proposed corrections already integrated** into that separate moving base with the *same full replacement objects*; do not reapply.
- **11 new proposals** still match their previous question objects exactly; they remain candidates for qualified examiner review and safe single-question integration.
- **0 unresolved divergent current-base question objects** across the 25 active proposals in that specific snapshot; **1 separately blocked draft**.
- No edits whatsoever to another team's lesson JSON from this assessment branch.

Per-question statuses and exact source fingerprints are in `INTEGRATION_COMPARISON_20261018.json`. This snapshot may become stale when editorial teams commit more changes. Always re-fetch and recheck before applying anything.

## Verification results and screenshots

GitHub Actions **successful run [39110937813](https://github.com/veyro-lb/litlab/actions/runs/39110937813)** checked out `be05c6c8d2518782e3db2c2cfac3a7b69e49f101` and successfully executed:

1. Clean isolated checkout; Node 22 `npm ci`.
2. Existing `npm run quality`, Biology validators and full-course readiness audit.
3. **19/19** structural and fingerprint negative-test cases.
4. Complete original coursewide assessment validation with no detected structural errors.
5. **25/25** proposal old-question fingerprints matched, zero preflight errors.
6. TypeScript and Vite **production build PASS** (non-blocking large-chunk warning).
7. Independent candidate-only build in a **disposable /tmp checkout**, where 25 proposed objects were applied to 9 lesson files **only in that disposable copy**, with zero committed lesson edits.
8. Network-isolated Chromium: **9/9** current baseline checks and **13/13** candidate-preview checks, zero page errors. The candidate tests covered all incorrect alternative feedback and correct choices for seven selected MCQs, four written-response rubrics, and SL/HL gating.

Five screenshots are preserved in the [assessment-quality evidence artifact](https://github.com/veyro-lb/litlab/actions/runs/39110937813/artifacts/12130477324): `baseline-a21-question.png`, `candidate-hl-distractor.png`, `candidate-hl-correct.png`, `candidate-spirometry-marking.png`, and `candidate-transect-marking.png`, plus audit JSON, preflight, browser results and runner logs. A later documentation/CI-hardening commit will have its own workflow run; use its latest successful result as the final commit gate.

The 22 browser cases are representative, **not** all 997 full-path UI cases. No external access, live student data, deployment, or licensed official past-paper content was involved.

## Scientific standards and human remaining work

The supplied *IB Biology Guide, first assessment 2025* is the assessment authority (assessment objectives printed pp. 22–23, skills pp. 28–33, syllabus pp. 34–107, external assessment pp. 110–113, command terms appendix). The IB-reviewed Hodder third edition supplies scientific teaching background, and the Biology Drawings PDF informs only contextual drawing checks.

`EXAMINER_REVIEW_PROTOCOL.md` defines examiner approval criteria for original keys and distractors, acceptable alternatives, written mark schemes, causal conclusions, rates and uncertainties, sample size and experimental controls, chart axes, magnification and genetic calculations, diagram labels and licenses, and appropriate SL/HL challenge. Qualified reviewer name/credentials/date and per-item sign-off remain required before any "approved" claim. Self-review cannot be translated into examiner-assigned grades or unsupported student mastery estimates.

**Handoff:** Technically suitable for selective, fingerprint-guarded integration **after** accepted scientific review. No merge to main and no public deployment authorized by this branch.
