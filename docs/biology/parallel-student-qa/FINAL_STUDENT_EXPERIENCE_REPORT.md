# BioLab — Independent Student Experience and Quality Assurance Report

**Audit baseline:** `2c321ae547baa2a97294728b337a4dfa46e64408`  
**Source branch (read only):** `feature/biolab-complete-course-integration-20261017`  
**Isolated QA branch:** `feature/biolab-independent-student-qa-20261017`  
**QA content checkpoint before this report:** `70067825f229b9cd1aa214d0e8dc982b7e156071`  
**Report-bearing branch SHA:** Resolve the authoritative SHA from the above QA branch after the report commit (`git rev-parse HEAD` or GitHub branch view). A commit cannot include its own resulting SHA in its tracked content.  
**Release recommendation:** **NO-GO for scientific/assessment approval**; this QA report is a technical and source-data handoff, not an IB or scientific certification.

## Executive summary and provenance

The source integration branch was verified at the exact baseline SHA above before the new QA branch was created. The existing **BioLab Complete Course Integration Isolated QA** GitHub Actions run [39062991528](https://github.com/veyro-lb/litlab/actions/runs/39062991528) completed **successfully for that baseline SHA**. Its 2026-10-17 job log records successful dependency installation, quality checks, production build, source validators, isolated Chromium smoke checks across 40 desktop lessons, mobile checks at 320/390/768px, practice/sources/flashcards on representative routes and twelve generated screenshots. Its existing additional browser audit reports a keyboard/touch and reflow pass at 320/390/768/1024/1440/1920px and an explicitly labelled 200% reflow check.

Those are **existing CI results, not executions of the independent scripts committed on this QA branch**. See [CI run and artifact](https://github.com/veyro-lb/litlab/actions/runs/39062991528); actual earlier screenshots are stored in the `biolab-course-integration-qa` artifact, not re-authored or represented as new QA evidence.

In this independent session, repository-content inspection was carried out against the pinned baseline for **40 lesson JSON files**, comprising **553 individual lesson sections, 957 assessment questions and 146 declared assets**. The pre-existing code's rendering, routing and study-state behavior was read in detail. Three findings have been entered in [FINDINGS.json](./FINDINGS.json); the new reproducible audit and browser toolkit have been committed. **The new scripts, local build and independent browser sweep have not been executed in this session**, because this execution environment has no network path to clone the GitHub checkout into a runnable local workspace. Existing GitHub CI is evidence for the original baseline only.

## Student journeys and code paths

The application uses the approved **Theme → Topic → Lesson** navigation model. Source paths reviewed include:

- `src/biology/BiologyApp.tsx`, `src/biology/routes.ts`, `src/biology/components/BiologyDashboard.tsx`, `src/biology/components/CurriculumOverview.tsx`, `src/biology/components/TopicOverview.tsx` and `src/biology/curriculum/manifest.ts`: entry, search, level scope, routing and available topic presentation.
- `src/biology/learning/LessonLoader.tsx`, `LessonView.tsx`, `ReadingUnderstanding.tsx`, `LearningVisual.tsx` and `ScientificFigure.tsx`: lesson content, sections, charts, tables, figure enlargement and transitions.
- `src/biology/learning/StudyQuestion.tsx`, `FlashcardStudy.tsx`, `content.ts` and `src/biology/progress/contract.ts`: answer feedback, recall, written self-review, session lifetime and level preferences.

The *existing* CI log documents browser exercise of all 40 direct lesson routes, representative sources/practice/flashcard paths, HL-only exclusion at SL, three small viewports, and image enlargement. It does **not** independently establish conceptual accuracy, assessment quality, actual learning gains, full accessibility, or full page-by-page figure loading for all 553 understandings.

The new `browser.mjs` independently specifies: 40 HL direct lesson routes, search, four theme samples (A1.1, B2.1, C3.1, D3.2) with correct/incorrect responses and detailed option feedback, in-tab answer retention, flashcards, revision, section deep links and refresh, back/forward, modal focus restoration, SL exclusion, an invalid route, width testing at 320/390/768/1024/1440/1920px, and actual screenshot creation. All of these **remain pending execution on the new QA branch**. A 200% CSS zoom reflow simulation is explicitly labelled an approximation, not a native browser zoom compliance result.

## Findings, priorities and exact reproduction

### High — PQA-001: A2.1.2 exam-question stem conflicts with its keyed option

**Location:** `src/biology/learning/origins-cells/lesson.json`, assessment ID `a21-p1a-2`; intended route `#biology/topic/A2.1/practice` in HL mode. The item asks why **cells** are independently living units, but the sole keyed-correct option describes dependence on a **host's metabolic and translational machinery**—characteristic of a virus. This is a source-observed internal contradiction and a **qualified biology/assessment review priority**, not a verdict that the whole topic is incorrect. Reproduce by locating the exact ID and comparing stem, flagged correct option and feedback; then confirm in the disposable preview. **Proposed fix:** review and rewrite the stem/options/explanations as a coherent complete item. Do not simply invert an answer-key boolean without science review.

### Medium — PQA-002: Reused incorrect-answer feedback

**Exact examples:** `a21-p1a-1` (A2.1), `a23-p1a-1` (A2.3), `c22-mcq-1` (C2.2), `c41-mcq-1` (C4.1), `c42-mcq-1` (C4.2), `d11-mcq-1` (D1.1) and `d22-mcq-1` (D2.2). In each cited source item, multiple distinct wrong options carry identical feedback. A full source-data heuristic flagged hundreds of selections for assessment review; this does not invalidate their single correct keys. **Proposed fix:** after instructor review, make explanations diagnostic of the selected misconception rather than repeating one generic correction. `audit.mjs` creates an exact per-question ledger when executed, so the integration engineer can prioritize all affected IDs.

**False-positive control:** `a31-p1a-3` and `a31-c3` in topic A3.1 intentionally differ by capitalization when testing binomial names. A preliminary case-insensitive duplicate test wrongly flagged them; the committed audit checks *exact* option duplicates and explicitly has a negative fixture preserving case distinctions. These A3.1 examples are **not** confirmed duplicate-option defects.

### Medium — PQA-003: Student study state is ephemeral by design

**Locations:** `src/biology/learning/content.ts`, `LessonView.tsx` and `StudyQuestion.tsx`. The `sessions` Map preserves submitted choices, written drafts, reveal state and section position while changing routes within an active tab, but not after refreshing or closing that tab. The UI already warns about this, so it is a **documented experience limitation**, not a secretly regressed persistence feature. Learners may nevertheless expect drafts to survive accidental reloads. **Proposed fix:** product owner to decide whether practice is intentionally temporary; consider explicit session status, export, or opt-in persistent storage following a privacy review. QA must not change the shared student progress implementation while Phase 5 runs.

### Critical, low, and unverified categories

No **critical** defect has been established by this inspection. No additional confirmed **low** defects are asserted without reproductions. Source-code concerns are not converted into confirmed mobile or accessibility failures unless actually observed in a browser. Machine-readable severity, IDs, paths, reproductions and evidence types are recorded in `FINDINGS.json`.

## New automated toolkit and result truthfulness

| File | Intended coverage | Status |
| --- | --- | --- |
| `scripts/biology/parallel-student-qa/audit.mjs` | 40-topic and 553-understanding consistency, SL/HL target mapping, question keys, data and visual structure, declared figures | Committed; **not executed** |
| `scripts/biology/parallel-student-qa/audit.test.mjs` | Negative fixtures for answer keys, exact duplicates, feedback and section/visual mapping | Committed; **not executed** |
| `scripts/biology/parallel-student-qa/browser.mjs` | Real Chromium course, quiz, navigation, figure and six-width screenshot checks | Committed; **not executed** |
| `scripts/biology/parallel-student-qa/README.md` | Reproducible run commands, safety and interpretation | Committed |
| `docs/biology/parallel-student-qa/FINDINGS.json` | Curated source-observed assessment and usability findings | Committed |
| Existing integration CI at the pinned baseline | npm ci, npm run quality, npm run build, existing validators/browser smoke | **PASS**, verified from GitHub Actions logs, only on `2c321ae…` |

No project dependency, shared workflow, deployment, source registry, lesson prose, image, answer bank or progress file was modified. Real screenshots are to be generated by `browser.mjs` into `docs/biology/parallel-student-qa/evidence/` **when the new suite actually runs**. This report does not fabricate screenshot paths or pretend that they already exist.

## Accessibility, responsive design and learning efficiency

The existing renderer provides labelled radio groups, text feedback with live status, answer explanations, keyboard-operable figure buttons, a labelled modal dialog with Escape closure and focus restoration, navigable tables in scroll regions, and a separate SL/HL selector. These are **code-observed capabilities**; existing isolated CI exercised a subset of behaviors, but independent assistive-technology testing remains outstanding. No WCAG conformance claim is made.

The source-based learning-efficiency review suggests retaining the uncluttered reading path, topic search, separate retrieval and practice modes, short labelled sections and contextual comparison/sequence/bars visuals. Assessment feedback should more directly address selected misconceptions (PQA-002). The absence of durable answer drafts after refresh (PQA-003) is a product-policy decision. Long-lesson overflow, diagram legibility at narrow viewports, touch hit area measurements, light/dark color contrast, native 200% zoom, actual screen readers and real student comprehension require new empirical evidence. The new runner collects the browser baseline; an experienced accessibility reviewer and actual IB students must supplement it.

## Next steps and conflict-free handoff

1. On the **isolated QA branch**, obtain a clean checkout and record the actual SHA. Run `npm ci`, `npm run quality`, the pre-existing Biology validators and `npm run build` before running new tests. Run `node --test scripts/biology/parallel-student-qa/audit.test.mjs` and `node scripts/biology/parallel-student-qa/audit.mjs`; examine the generated machine ledger, particularly high-severity structural errors.
2. Start `npm run preview -- --host 127.0.0.1 --port 4173` without external student accounts, then run `CHROME_BIN=/path/to/chromium node scripts/biology/parallel-student-qa/browser.mjs`. Preserve `browser-report.json`, console/runtime findings and actual screenshot images, with the tested SHA. Reproduce problems at the exact route/viewport in the generated report. Verify native 200% browser zoom and actual screen-reader semantics separately.
3. Ask a **qualified IB Biology reviewer** to resolve PQA-001 and evaluate PQA-002 before characterizing the assessment as reliable. Ask a product owner to decide PQA-003. Independent software QA cannot certify scientific accuracy, student engagement or exam markscheme alignment.
4. Hand the toolkit and its evidence to the Phase 5 integration engineer for review **without automatically merging, resetting, cherry-picking or deploying**. Rebase-free integration planning is needed because the Phase 5 branch can advance. Only the dedicated QA scripts/reports are proposed for integration; teaching content remains under Phase 5 ownership.

**Acceptance status:** The isolated branch and reusable checks exist, 40 source lesson files were inspected, and the pinned integration baseline CI success was verified. The **new independent tests, new screenshots, comprehensive accessibility audit and real-student research are outstanding**. The assignment is therefore **partially completed**, not reported as a full QA acceptance.
