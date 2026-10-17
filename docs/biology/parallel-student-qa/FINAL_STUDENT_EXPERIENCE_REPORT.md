# BioLab — Final Independent Student Experience QA Execution Report

**Date:** 2026-10-17  
**Repository:** `veyro-lb/litlab`  
**QA branch only:** `feature/biolab-independent-student-qa-20261017`  
**Original content integration baseline (source reference):** `2c321ae547baa2a97294728b337a4dfa46e64408`  
**QA branch starting HEAD verified through GitHub:** `98ee2a0bcad78d9181c7d18ef4de5cacfd5c44de`  
**Executed code and test SHA:** `71269544c9200316e6c52900e4ae61405717c0af`  
**Successful independent workflow:** [GitHub Actions run 39068267974](https://github.com/veyro-lb/litlab/actions/runs/39068267974)  
**Authentic logs, 19 screenshots and machine findings:** [artifact 12114455877](https://github.com/veyro-lb/litlab/actions/runs/39068267974/artifacts/12114455877)  
**Final branch SHA:** This report is committed after the successful tested SHA. The authoritative later report-containing HEAD is the live GitHub branch ref; a tracked document cannot include its own resulting Git commit SHA. Final commit SHA must be recorded in the handoff message.

## Executive decision

**Technical QA toolkit: READY for isolated integration review. Biology assessment/scientific approval: NO-GO pending qualified review.** The new negative tests, static audit and browser tests have now actually executed on GitHub-hosted Linux at the exact SHA above. The workflow is read-only and does not deploy, merge or modify lessons. Browser, build and structural checks passed; they do not imply the scientific correctness of the 957 questions or the lesson prose.

| Executed gate | Result at tested SHA |
|---|---|
| Exact isolated checkout, lockfile install | PASS |
| Existing quality, Biology validators and negative suites | PASS |
| Production `npm run build` | PASS |
| Independent negative fixtures | PASS — 4/4 |
| Independent 40-topic static audit | PASS — 40 lessons, 553 understandings, 957 questions, 0 high structural findings |
| Independent real Chromium browser suite | PASS — 79/79, 0 failed, 0 page JavaScript runtime exceptions |
| Responsive Chromium width checks | PASS — 320, 390, 768, 1024, 1440 and 1920 CSS pixels |
| Native browser 200% zoom | NOT VERIFIED; separate CSS `zoom:200%` approximation passed |
| Actual screen reader and full WCAG conformance | NOT VERIFIED |
| Qualified IB scientific/answer-key validation | NOT VERIFIED; issue PQA-001 requires correction |

### Reproducible execution and environment

The session first attempted the actual local command:

```bash
git clone --single-branch --branch feature/biolab-independent-student-qa-20261017 --depth 1 https://github.com/veyro-lb/litlab.git biolab-qa-checkout
```

It failed with `Could not resolve host: github.com`. Node v22.16.0, npm 10.9.2 and Git 2.47.3 were available locally. To avoid misreporting an untested local checkout, a dedicated isolated workflow `.github/workflows/biolab-independent-student-qa.yml` was created on the existing QA branch. Real GitHub Actions concluded **success** at run `39068267974`, job `117500346349`, after checking `git rev-parse HEAD == GITHUB_SHA` and a clean checkout.

The GitHub-hosted runner actually executed `npm ci`, `npm run quality`, the existing Biology validator and test commands listed in the committed workflow, `npm run build`, `node --test scripts/biology/parallel-student-qa/audit.test.mjs` and `node scripts/biology/parallel-student-qa/audit.mjs`. Its browser stage ran `npm run preview -- --host 127.0.0.1 --port 4173` followed by `node scripts/biology/parallel-student-qa/browser.mjs`, using Chromium from `mcr.microsoft.com/playwright:v1.56.1-noble`. The container was `--network none`, with loopback only, a disposable runtime, read-only source mount and separate writable artifact directories. No student sign-in or remote service was exercised.

**Full command records:** `.github/workflows/biolab-independent-student-qa.yml` and archived `qa-existing.log`, `qa-build.log`, `qa-negative.log`, `qa-static.log`, `qa-artifacts/parallel-student-qa/browser-console.log` and `qa-checkout.txt` in the linked evidence artifact.

The first newly created workflow at `da36fe8` passed its 73 original browser cases. The expanded run at `4888978` produced 78 passes and one *test locator* failure: a nested Playwright `filter({has: ...})` was incorrectly scoped. That test locator was corrected **without changing application code or weakening the assertion**. The final run at `71269544c9200316e6c52900e4ae61405717c0af` passed all 79 cases and all workflow gates. Earlier failed runs are retained as audit history, not represented as final app regressions.

### Exact static audit results

The independent audit read 40 catalogued lesson JSON files and validated their mapping against 553 syllabus understandings: **337 shared SL/HL and 216 additional HL**. It examined **957 assessment questions**. The resulting `static-audit.json` lists **0 high, 420 medium and 0 low** findings. All 420 medium entries are the `choice-feedback-generic` *editorial heuristic*, not 420 distinct science errors. Structural checks include understanding coverage, level scope, question keys, option ID uniqueness, exact option duplication, feedback presence, written marking guidance, local asset paths, placement and table/chart geometry. Negative fixture tests verified that malformed keys, exact duplicates, generic feedback warnings and coverage/asset/table errors are detected; capitalization-only binomial differences are not falsely called identical.

### Authentic student-experience and browser coverage

The final `browser-report.json` documents **79 passing cases**, including all 40 HL direct lesson routes, the four theme groups, topic search, section deep-link/refresh restoration, back/forward and invalid-route handling, and SL denial of HL-only topics and sections. Four representative lesson journeys (A1.1, B2.1, C3.1 and D3.2) tested correct and incorrect question submission, retry, choice-level explanations, navigation retention, flashcards, revision, figure interaction when a figure was available, and keyboard Escape/focus return. Four additional cases verified written drafts, self-review/marking guidance, in-tab retention and loss after refresh.

For every width **320, 390, 768, 1024, 1440 and 1920px**, Chromium captured the library and a representative long C3.1 lesson and found no document-level horizontal overflow. A CSS 200% reflow approximation at the 1024px viewport passed. **Native browser zoom is a separate unexecuted accessibility requirement.** Screenshots visually confirm real rendering but cannot establish readable text size, color contrast, touch target size or WCAG compliance.

**Authentic screenshots (inside the artifact):** `hl-library-1440.png`; `library-{320,390,768,1024,1440,1920}.png`; `lesson-c3-1-{320,390,768,1024,1440,1920}.png`; `lesson-a1-1-1440.png`; `lesson-b2-1-1440.png`; `lesson-d3-2-1440.png`; `css-zoom-200-1024.png`; and `pqa-001-a2-1-2-keyed-contradiction-1440.png`. All are Playwright captures from the running app, not generated mockups. Machine manifest: `docs/biology/parallel-student-qa/QA_EXECUTION_EVIDENCE.json`.

### Reproduced findings and required handoff

**PQA-001 — HIGH, A2.1.2 question content contradiction; science/assessment owner.** Exact item `a21-p1a-2`, `src/biology/learning/origins-cells/lesson.json`, HL `#biology/topic/A2.1/practice`. The stem asks why cells are independently living units. The keyed choice says they depend on a host's metabolic/translational machinery, followed by virus-like explanatory feedback. In **real Chromium**, selecting this choice was rewarded as correct. This is an internally contradictory assessment item **confirmed as rendered and keyed**; a qualified Biology reviewer must revise stem, options, key and all explanations as one complete item. Do not merely flip a boolean. Screenshot and full reproduced values are in the artifact.

**PQA-002 — MEDIUM, non-diagnostic repeated distractor feedback; assessment authors across topics.** In `a21-p1a-1`, the two different wrong options `2` and `3` were independently selected in Chromium; both returned the same incorrect-answer explanation. The 420-item audit ledger provides exact IDs/locations for triage. Prioritized examples also include `a23-p1a-1`, `c22-mcq-1`, `c41-mcq-1`, `c42-mcq-1`, `d11-mcq-1` and `d22-mcq-1`. Identical feedback can be legitimate; each item needs editorial/scientific review, not bulk automatic rewriting.

**PQA-003 — MEDIUM, expected temporary study-state behavior; product owner.** Written responses in A1.1, B2.1, C3.1 and D3.2 persisted after navigating away and returning in the same browser tab, but were cleared by refresh. The existing UI explicitly warns of this. This is a **reproduced documented design limitation**, not an unannounced persistence regression. Decide whether export or opt-in durable storage is required; do not silently change progress or privacy behavior.

**False-positive guard:** A3.1 `a31-p1a-3` and `a31-c3` deliberately distinguish binomial-name capitalization. They are not duplicate-option findings.

### Console/network observations and accessibility limits

The final browser report contains **0 page-level JavaScript exceptions**, but also **32 console resource errors**. The runner deliberately blocked external requests: **16 to Google Fonts** and **16 to Supabase auth settings**, each logged as `ERR_BLOCKED_BY_CLIENT.Inspector`. Two local favicon requests ended `ERR_ABORTED` during navigation. These do not demonstrate a live production outage. They mean screenshots used fallback typography and no external authentication connectivity was verified. Review before production acceptance.

This suite does **not** verify manual screen-reader output, all keyboard tab sequences, automated contrast ratios, native 200% browser zoom, actual phone devices, logged-in student progress, remotely hosted imagery across every section, scientifically correct diagrams, every individual question in a browser, or real student learning gain. Accessible controls observed in the browser are evidence for the specific paths tested, not a WCAG certificate. Figure checks skip topics with no visible figure; a passing journey for such a topic is not evidence that a figure was enlarged there.

### Integration readiness and preservation

The **independent QA toolkit itself is ready for integration review**, with recorded passing build, structural checks and real browser execution at the tested SHA. The **course is not scientifically or assessment approved** until PQA-001 is resolved by the A2.1 owner and PQA-002 is triaged by the topic/assessment authors. PQA-003 needs a product policy decision, not an undocumented persistence change. Run native browser zoom, manual assistive-technology evaluation and targeted content review before any production release decision.

All new code and documentation remain on `feature/biolab-independent-student-qa-20261017`. No biology lesson file, shared teaching component, main branch, application data, deployment file or live environment was modified. No public deployment or merge was performed.
