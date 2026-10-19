# BioLab Theme C checkpoint 1 — C3.1 Integration of body systems

**Branch base:** `d6f9fd552096edbdaf7096833675963ed016df72` — verified isolated redesign foundation, 17 October 2026.  **Status:** original source-mapped development draft; scientific, educational and accessibility approval pending.

## Authored content

- `src/biology/learning/integration-body-systems/lesson.json`: 23 understanding-level lessons (C3.1.1–C3.1.23), 16 shared / 7 HL, two titled explanatory passages per understanding, original biological examples, misconception repairs, optional explanatory help, 23 selection checks, 23 recall activities, 23 original Paper 1A-style questions and eight structured / data-based written items.
- `public/biology/integration-body-systems/*.svg`: four original labelled explanatory figures (nerve section, spinal withdrawal, cardiovascular feedback and phototropism).
- `docs/biology/theme-c2/c31-coverage.json`: understanding-level mapping with exact source-page pointers, associated questions and illustrations.
- `docs/biology/theme-c2/c31-figure-provenance.json`: original artwork provenance, rights statements and synthetic-data disclosure.
- `docs/biology/theme-c2/c31-registry-proposal.json`: proposed section display titles and availability for the **future** integration owner. This is not a registry modification.
- `scripts/biology/theme-c2/c31-checkpoint.test.mjs`: contract, coverage and negative mutation tests, using a temporary registry-title overlay at runtime.

## Sources and important limits

Primary requirements: *IB Biology Guide*, first assessment 2025, C3.1, guide pp. 75–78 (PDF pp. 81–84). Main educational reference: Clegg, Davis and Talbot, *Biology for the IB Diploma Programme* (Hodder, 3rd ed., 2023), C3.1, pp. 490–516 (PDF pp. 502–528). Public checks: NCBI Bookshelf cardiovascular physiology and melatonin, plus peer-reviewed cytokinin transport reviews (exact URLs in lesson references). Text and drawings are original, not reproduced textbook material.

The original section on C3.1.22 explicitly distinguishes the Guide's useful simplified root-tip cytokinin / shoot-tip auxin directional model from modern evidence for more complex hormone biosynthesis and movement. The worked calculation for C3.1.17 uses explicitly **synthetic** measurements, not a published study. No real photo or dataset is imported.

## Integration ownership

**Do not change these centrally owned files in this branch:** `src/biology/curriculum/registry.json`, `src/biology/learning/catalog.json`, shared React renderers, shared validator, English site or any pre-existing lessons. Consequently this checkpoint is intentionally *not* an accessible registered lesson yet. The integrator must first review the 23 proposed registry titles, set C3.1's lesson ID/availability, and add `"c3-1-integration-body-systems-v1": {"topicId":"C3.1","path":"./integration-body-systems/lesson.json"}` to the catalog, on a separate integration branch.

## Testing and review protocol

Run `node --test scripts/biology/theme-c2/c31-checkpoint.test.mjs` on a checkout of this branch. After integrator registration, run `node scripts/validate-lessons.mjs`, `npm run quality`, `npm run build`, and all established CI/browser suites. Test 320/390/768/1440 px viewport rendering, keyboard navigation, all feedback and SL filtering of C3.1.17–23. The standalone topic tests are structural and cannot establish scientific correctness. Obtain qualified science, IB assessment, editorial and accessibility review of the exact SHA before public release.

## Later checkpoints

C3.2 → C4.1 → C4.2 follow in separate complete commits. This checkpoint does **not** represent the remaining 58 understandings as completed. No deployment or merge is authorized.
