# BioLab — IB source-policy implementation and scientific review status (18 October 2026)

## Decision and source authority

Status: **development-only / no public release approval**. This report records implementation and structural evidence; it is **not** a claim of qualified scientific review or of IB endorsement.

- Official syllabus authority: *International Baccalaureate, Diploma Programme Biology Guide*, first assessment 2025 (published 2023). Authorized IB subject page: https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/ . The full IB publication requires an authorized access route.
- IB-reviewed teaching reference: C. J. Clegg, Andrew Davis and Christopher Talbot, *Biology for the IB Diploma Programme*, Third Edition, Hodder Education, 2023, ISBN 9781398364240. Authorized publisher information: https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition . The "In cooperation with IB" designation refers to IB review of the coursebook, not official syllabus status.
- BioLab is independent; none of its original instructional prose, questions, diagrams or activities are official IB materials.

## Changes implemented

1. Created exactly **two canonical educational-source cards per topic**, using `src/biology/learning/approved-sources.json` and `LessonView.tsx`. The mobile/desktop presentation is in `biology.css`. This replaces unrestricted lesson-reference rendering; internal legacy references are NOT deleted.
2. Moved figure attribution, licences and authorized original-image links into a separate, accessible, collapsed credit panel. No asset files, IDs, deep links, questions, progression data or lesson navigation were deleted or remapped.
3. Inventoried **192** raw legacy/current per-topic source records including one newly added official Water guide reference. The student-facing presentation now contains **80 source cards** (40 topics × two sources). These supersede **106 unique-topic occurrences of non-policy reference records** and **six redundant IB/Hodder records**; these counts represent hidden/replaced student-facing listings, not deletion of review records. Earlier source count was 191 before the Water guide record was added.
4. Preserved a complete inventory of the **106** non-policy references, **104** with original URLs, in `LEGACY_NON_IB_REFERENCES_THEME_[A-D].json`. Examples include OpenStax, NCBI Bookshelf and StemBook, PMC/PubMed articles, NASA, NOAA, RCSB and other external scientific resources. Their retention in private provenance is not permission to use them as teaching-source endorsements; image credits may be legally necessary.
5. Recorded **553** understanding-level review rows in `IB_SOURCE_MATRIX_THEME_[A-D].json`: A=95, B=123, C=164, D=171. All 40 registered topic IDs and original 337 shared / 216 HL-only classifications remain unchanged. Rows distinguish an *authored working title* from verbatim official IB requirements.
6. Rewrote A1.1.7 and A1.1.8 original lesson teaching blocks against the official Water requirements and corresponding Hodder Water chapter, kept feedback/questions, and focused on asteroid-delivery/retention and liquid water/habitable zone. Removed one duplicated A1.1.6 misconception and an optional floating-ice extension. The eight Water official-syllabus requirement summaries were reviewed for topic scope, not certified by a qualified third-party scientist.
7. Added `scripts/biology/ib-source-policy.mjs` with all-course structural source and mapping checks, `ib-source-policy.test.mjs` negative policy tests, `ib-source-browser.mjs` responsive Sources checks and screenshots, and a branch-only GitHub Actions workflow.

## What the 553-row matrix does NOT prove

- **0 of 553 understandings are qualified-expert approved.** Populated sections and passing validators prove neither scientific accuracy nor absence of out-of-syllabus teaching.
- **58 understanding-specific Hodder page locators remain missing** for C3.2 (18), C4.1 (18) and C4.2 (22). Their *chapter* page ranges have been verified from the Hodder contents and recorded without inventing understanding-level locations.
- The initial complete-course scan found **1,348 teaching-block or claim-to-reference provenance mappings** that still mention historically retained external reference IDs. These require targeted per-claim comparison with authorized IB/Hodder educational material before anyone asserts the *entire lesson content* satisfies the strict source policy.
- A detailed reading of the Guide and matching textbook across all 553 understandings, qualified editorial sign-off, verification of data plotted in every visual, and media/image-licensing review remain open.
- Commercial reuse of the official IB publication, curriculum mapping, and third-party publishing may require written authorization under the IB intellectual-property terms printed in the Guide. Hodder material is also copyright protected. A book PDF in project resources is for internal review, not a legitimate public student download.
- The IB Biology Drawings PDF has not been established as officially IB-created or reusable. No drawings from it were copied by this change.
- No external microscopy assets were added or replaced; pre-existing genuine microscopy licences and suitability remain subject to separate rights checks.

## Quality-control commands

Run from the isolated audit branch:

```sh
npm ci
node scripts/validate-biology.mjs
node scripts/validate-lessons.mjs
node scripts/biology/full-course/readiness-audit.mjs
node scripts/biology/ib-source-policy.mjs
node --test scripts/biology/ib-source-policy.test.mjs
npm run quality
npm run build
```

The branch-only workflow `.github/workflows/biolab-ib-source-science-qa.yml` also launches Chromium for all 40 Sources routes at 390 px and 1440 px, captures representative screenshots, and uploads the results to the workflow run. Consult the latest workflow run for actual pass/fail evidence; do not report an unexecuted test as passing.

## Release criteria and next work

Before public release: independently compare every numbered official syllabus statement with the corresponding Hodder section; fill the 58 missing exact page mappings; replace/trim teaching that derives only from non-policy sources while preserving correct material; review all figures/graph values and rights; obtain qualified science and IP clearance; pass full QA and regression checks; and retain the independent publisher disclaimer. **No merge to main or public deployment is authorized by this work.**
