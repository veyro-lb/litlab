# BioLab consolidated technical validation

**Branch:** `feature/biolab-final-consolidation-and-depth-20261018`.

## Validations configured (not yet claimed as passing)
1. `npm ci`
2. `node scripts/validate-lessons.mjs`
3. `node scripts/validate-biology.mjs`
4. `node scripts/biology/validate-full-course-depth-audit.mjs`
5. `node scripts/biology/validate-final-consolidation.mjs`
6. `node --experimental-strip-types --test scripts/biology/figure-layout-refinement/figure-presentation.test.mjs`
7. `node --test scripts/biology/scientific-visual-redesign.test.mjs scripts/biology/scientific-visual-assets-repair/verify.test.mjs`
8. `npm run quality`
9. `npm run build`
10. Playwright Chromium browser QA of the combined branch.

A branch-specific GitHub Actions workflow runs these checks without deploying; status must be read from the actual workflow run. It is insufficient that the workflow exists.

## Evidence already obtained during integration, not a substitute for CI
- Remote ref heads verified against the supplied SHAs; 146 unique changed paths categorized.
- An isolated branch was created from the verified integration commit. No parent branch has been reset.
- Three-way merges for eight overlapping lesson files detected no unreconciled scalar conflicts and checked all section asset IDs against the registered lesson asset objects.
- 18 source-PDF crop files were deleted from the staged public tree; all eight reconciled lesson JSONs were examined for prohibited crop paths.
- 553 syllabus understandings appear uniquely in the consolidated status ledger; 12 are source-informed improved, 541 await individual source review.
- Four HL respiration understandings checked against their supplied Guide and Hodder source pages; individual code-path/browser evidence remains pending.

**Qualified scientific approval, independent copyright review and completed browser QA are NOT established by these structural checks.**

## Performed direct GitHub-branch static verification (post-commit)

Three disjoint batches fetched and parsed every committed lesson JSON from this isolated branch. **40/40 topic files and 553/553 numbered understandings inspected; zero errors detected** in: section-to-official-ID mapping, SL/HL level fields, lesson reference-ID registration, section figure IDs, `figurePlacements` range/asset relationships, section counts and active lesson references to the 18 deleted PDF-crop paths. Batch totals were 14 topics/177 understandings, 14/199 and 12/177. This is a source-file static check performed through the connected GitHub file API, **not** a local `npm run quality`, build, CI workflow or browser run. The Rights/HTML/actual image-load and scientific assertions remain pending as described above.
