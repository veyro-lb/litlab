# Phase 5 Batch 2 — Verified authoring checkpoint (not completion)

Date: 2026-10-16

## Branch and baseline
- Authorized isolated branch: `feature/biology-phase5-batch2-20261016`
- Base Phase 4 HEAD: `8ae2914fd5293829997842b7491320dc471af1c9`
- The previous three lesson packages, English application, Supabase configuration and release branches were not edited.
- No merge, PR or deployment authorized or performed.

## Source scope (readable supplied materials)
- First-assessment-2025 IB Biology Guide A1.2: printed 35–38 / PDF 41–44.
- First-assessment-2025 IB Biology Guide C1.1: printed 64–66 / PDF 70–72.
- Hodder Biology Third Edition A1.2: printed 14–33 / PDF 26–45.
- Hodder Biology Third Edition C1.1: printed 380–404 / PDF 392–416.
- The IB Guide determines examinable scope; supplementary claims require scientific corroboration.
- A1.2.1–A1.2.10 and C1.1.1–C1.1.10 are shared SL/HL; A1.2.11–A1.2.15 and C1.1.11–C1.1.17 are additional HL.

## Code checkpoint
- `scripts/validate-batch5.mjs` implements topic counts, official ID order,
  registry title/level requirements, coverage, source-page offsets, explanation and
  interaction presence, MCQ structure, written/data task minimums,
  draft review gate, figure/graph provenance, A1.2.13 hands-on molecular-viewing
  requirements and C1.1 mechanism keywords.
- `scripts/validate-batch5.test.mjs` supplies positive and intentionally corrupted
  fixtures for missing software guidance, scope leaks, guide locators,
  MCQ options, false approvals, missing enzyme models and graph provenance.
- Tests have been authored but have not yet been executed in GitHub Actions.
- Attempted A1.2 lesson package generation was intentionally rejected by
  authoring checks for malformed four-option MCQs; no generated lesson
  package was committed and no new catalog entry was made. This prevents
  displaying an incomplete or misleading lesson to students.

## Scientific corrections that must be preserved
- Hodder A1.2 printed p. 25 reverses coding/template nomenclature.
  RNA polymerase reads the DNA template 3′→5′ and synthesizes RNA 5′→3′;
  the coding strand generally matches RNA except T/U.
- Hodder C1.1 printed p. 396 uses endocytosis incorrectly for secretion.
  Secretory vesicles release enzyme cargo by exocytosis.
- H1 is outside the octameric nucleosome histone core (two each of
  H2A, H2B, H3 and H4). A1.2.13 requires actual molecular visualization,
  for example guided RCSB 1KX5 use, not only a static drawing.
- Activation energy changes under catalysis; reactant-to-product energy
  difference and equilibrium do not change merely because enzyme is present.
- Initial reaction rates require an initial gradient or defensible earliest
  interval, not an arbitrary ten-minute average represented as initial rate.

## Required next implementation sequence
1. Correct A1.2 assessment data authoring; validate 15 distinct four-choice
   MCQs with only one defensible answer and causal feedback per distractor.
2. Implement all 15 original learning sections and validate exact guide/Hodder
   locators and claim-level reference IDs.
3. Create and render 8–10 precise original A1.2 figure families, labelled and recall,
   then integrate the opt-in real 3D viewer with an accessible written alternative.
4. Add A1.2 catalog/registry entry only after its complete package passes
   validation and browser interaction checks; then commit this checkpoint.
5. Implement the 17 C1.1 sections, graph-labelled figures, rate-data tasks,
   relevant mechanism interactions and corrected science; checkpoint.
6. Run complete established CI, isolated offline Chromium, English regression,
   scope/deep-link and accessibility checks on final commit.
7. Record separate production/full tooling audits and unresolved B1.1/B1.2
   independent scientific pack; do not claim qualified scientific signoff.

## Explicit status
- A1.2: **not complete**, no registered lesson.
- C1.1: **not started as student-facing content**.
- Code validation scaffolding: **committed**, execution **unverified**.
- Integration to Phase 4: **NO-GO**.
- New draft-batch preparation: **NO-GO** until the two lessons and QA are delivered.
- Public deployment: **NO-GO**; qualified review and rights/accessibility checks outstanding.
