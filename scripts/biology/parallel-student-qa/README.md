# BioLab independent student QA toolkit

Scope: first-assessment-2025 Biology, 40 registered topics and 553 syllabus understandings. Designed to run on an isolated QA branch without modifying teaching content, shared React components, progress state, deployment settings or the Phase 5 integration branch.

## Run the structural and assessment audit

From the repository root on Node 22:

```bash
node --test scripts/biology/parallel-student-qa/audit.test.mjs
node scripts/biology/parallel-student-qa/audit.mjs
```

The second command reads actual `src/biology/curriculum/registry.json`, `src/biology/learning/catalog.json` and all lesson JSON files. It writes `qa-artifacts/parallel-student-qa/static-audit.json`. High-severity *structural* issues give a nonzero exit code; advisory assessment-quality flags remain visible as medium warnings. It checks course counts, mapping, SL/HL scope, answer keys, exact duplicate answers, unique question IDs, feedback presence, written marking guidance, table structure, bar-chart values, figure placements and local image paths.

A question testing capitalization is **not** considered a duplicate just because two choices differ only in letter case. Generic identical distractor feedback is a review flag, not proof of a science error. Numerical validity, scientific accuracy, licensing, and the quality of distractors require specialist review.

## Run real browser journeys in an isolated local preview

```bash
npm ci
npm run quality
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In a second terminal:
CHROME_BIN=/path/to/chromium node scripts/biology/parallel-student-qa/browser.mjs
```

The browser command requires Playwright already present in `package.json`. Set `LITLAB_PREVIEW_URL` only for an intentionally local preview. It checks 40 HL lesson routes, 4 theme-level practice/revision/flashcard workflows, SL scope exclusion, searches, diagram enlargement with keyboard dismissal, route restoration, browser back/forward, unknown routes and horizontal overflow at **320, 390, 768, 1024, 1440 and 1920px**. The script gathers real Chromium screenshots and a JSON result at `docs/biology/parallel-student-qa/evidence/`.

The browser runner deliberately blocks external requests. Never point it at a production URL carrying student sessions. Use a disposable test profile and build, not student accounts. Browser-side reload behavior is documented in the report rather than misrepresented as permanent progress. Its CSS 200% zoom check is **not a substitute for native browser zoom**. Accessibility checks are limited to testable semantics, keyboard behavior and focus restoration; actual screen-reader evaluation remains necessary.

## Handoff and interpretation

- Start from the verified starting SHA recorded in `FINAL_STUDENT_EXPERIENCE_REPORT.md`. Tests should always record the exact SHA actually checked; results cannot be assumed to carry forward to later Phase 5 commits.
- `docs/biology/parallel-student-qa/FINDINGS.json` is a curated prioritization of source-observed issues. The generated static audit contains the exhaustive current automated findings with exact identifiers.
- Browser screenshots are created only when the runner actually executes against the app. The scripts never generate mock or illustrative screenshots.
- Do not merge QA work into Phase 5 without the integration engineer's review. The toolkit requires no new npm dependencies or shared configuration changes.
