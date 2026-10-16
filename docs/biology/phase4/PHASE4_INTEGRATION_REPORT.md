# LitLab Biology — Phase 4 integration report

Prepared 16 October 2026. Development drafts only. No PR, merge, deployment, authentication change or production storage operation.

## 1. Branch and exact revision evidence

Integration branch: `feature/biology-phase4-integration`.

| Checkpoint | Exact SHA |
| --- | --- |
| Verified foundation, also latest at start | `64050774a88878b5910c15c3227345df16c431f0` |
| Read-only Batch 1 handoff | `224c2124141f5b0370007c31ef2bef239c184fb4` |
| Read-only Design Lab handoff | `44be3708c926d150635486f84d8ecbfb85185b1a` |
| B1.1 integrated first, generic + Water + curriculum checks passed | `87acff4482752d634784a5b953bd474d150f42ee` |
| B1.2 integrated second; first combined green CI | `6d9866c78b48499e02f5b3d36985c270b36f90d8` |
| Final tested implementation | `6d34713e036ea71dd32d7def1eb1da619bb9c49c` |
| Main observed at start and safety recheck, untouched | `f05cbe8945fb355e94bccf0c07862c842f742201` |

The final delivery names the subsequent documentation/evidence commit separately. This report cannot contain its own commit hash. GitHub API commits were used because shell push had no credentials; local and remote Git tree hashes were compared to ensure byte-identical content. Existing branch refs remain at the supplied SHAs. No wholesale branch merge or prototype import was performed.

## 2. Integrated counts and official scope

| Topic | Numbered sections | Shared SL+HL | Additional HL | Concept checks | Recall prompts | Practice tasks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A1.1 Water | 8 | 6 | 2 | 8 | 16 | 15 |
| B1.1 Carbohydrates and lipids | 13 | 13 | 0 | 13 | 14 | 15 |
| B1.2 Proteins | 12 | 5 | 7 | 12 | 13 | 15 |
| Total | 33 | 24 | 9 | 33 | 43 | 45 |

The new batch contributes exactly 25 understandings, 25 MCQs and five written/data tasks, 11 original diagram families and 11 recall variants. Across the three topics, practice contains 35 MCQs and 10 written/data tasks. Marks remain provisional; written answers are self-reviewed, never automatically graded. There are two reusable mechanism-sequence activities.

All 25 new IDs and descriptive titles render from the authoritative registry. Learn and Revision headings are asserted against each exact title; SL views reject HL Learn/Revision/Practice targets, including deep links. B1.2.6–B1.2.12 remain additional HL; Water A1.1.7–A1.1.8 remain HL. The complete registry retains 40 topics and 553 understandings, 337 shared / 216 HL. Only the existing B1.1 and B1.2 records changed. Planned A1.2/C1.1 remain planned and unregistered.

All three topics use the same schema, LessonView, StudyQuestion, ScientificFigure, UnderstandingLabel, mechanism component and lazy glob loader. The dashboard/browser regression verifies that it does not request lesson-body chunks. Production output contains three separate lesson chunks.

## 3. Scientific findings and review boundary

Read [SCIENCE_REVIEW.md](./SCIENCE_REVIEW.md) for source fingerprints, exact printed/PDF pages, all figure families, limitations and developer-versus-integrator differences. The supplied guide governs scope; the full Hodder B1.1/B1.2 chapters were read, with chemical panels additionally rendered. Publisher-hosted scientific references and primary RCSB insulin/collagen entries corroborate selected mechanisms and structures. No source PDFs, textbook panels or question banks were copied into the repository.

Corrected: ribose external-carbon attachment; fructose ring numbering; angular steroid nucleus; invalid black hydrolysis SVG fill/missing reactant label; disconnected tertiary-chain cartoon; quaternary contact; insulin/collagen chain cartoons; starch component wording; overgeneralized amino-acid wording; and several misleading choice-feedback messages. Displayed option letters now follow visible order without changing internal answer IDs. Added an actual shared polypeptide example for B1.2.4. Cysteine disulfides, peptide/ester/glycosidic distinctions, backbone hydrogen bonds, cis caveats, ionization, denaturation and membrane-protein scope were checked and retained.

Hodder p. 214's cysteine–methionine disulfide suggestion conflicts with the official cysteine-pair requirement; the lesson already followed the correct guide requirement and was preserved. Source checks are not qualified human approval.

**The separate independent B1.1/B1.2 verification pack was not available. It was requested explicitly at the beginning. Its findings have not been compared. Scientific verification is therefore incomplete.** The batch author's source-review document is not independent certification. No reviewer identity or approval was invented.

[FIGURE_MANIFEST.json](./FIGURE_MANIFEST.json) fingerprints all 48 scientific asset files. Water lesson JSON, figures, photo bytes and provenance are unchanged. Original diagram corrections retain the original authorship/reuse warnings; RCSB is cited without copying its imagery.

## 4. Design decisions

The Design Lab handoff, standalone code and desktop/mobile screenshot galleries were inspected. Changes were reimplemented in the existing React shadow-root system.

| Candidate | Adopted? | Reason |
| --- | --- | --- |
| Compact mobile understanding disclosure; close after selection | Yes | Removes a long 8/13/12-row interruption before reading; retains every ID/title and focuses requested content. Desktop path remains available. |
| Native in-page enlargement with Escape, focus return and scrollable large canvas | Yes | Dense scientific labels need genuine inspection on narrow screens. Raw full-size links and written alternatives remain. |
| Visible close control, bounded dialog and keyboard trap | Yes | Screenshot review identified cramped narrow-modal controls; corrected and checked in browser. |
| Ordered visible answer letters | Yes | Options keep stable internal IDs, while displayed A/B/C/D letters follow the rendered order; eliminates the shuffled-letter answer cue. |
| Responsive long topic headings | Yes | Prevents the Carbohydrates heading from expanding the 320px layout and corrupting touch coordinates. |
| Explicit choice feedback and retry focus | Yes | Repairs mismatched explanations and prevents focus loss when retry removes feedback. |
| 44px controls and clearer written-practice separation | Yes | Improves touch access and distinguishes self-reviewed Paper 1B/2 work. |
| 60–67ch reading width, numbered headings, LitLab green/dark tokens | Retained | Already implemented in the foundation; no replacement was needed. |
| Revision/recall and per-choice disclosure | Retained, validated | Existing functionality already supports retrieval, missed-question review and explanation links. |
| Prototype registry, routes and all-in-one HTML/JS | Rejected | Would duplicate authority and regress React routing, lazy loading and progress isolation. |
| New dashboard system, wholesale hero redesign and palette replacement | Deferred/rejected | Existing search/scope and brand work; cosmetic changes were lower priority than science and integration. |
| Fabricated mastery, efficacy, certification or durable completion | Rejected | No reviewed persistence/event model or student-outcome evidence exists. |

### Actual application screenshots

[Open the portable screenshot gallery](./SCREENSHOTS.html). It contains 15 reduced WebP captures: numbered Learn sections/scientific visuals, desktop lessons, Revision, dark Practice and narrow enlargement for all three topics. These are actual integrated application captures from the successful code run, not the standalone Design Lab. [Preview manifest](./screenshots/manifest.json) records the original/derived fingerprints and dimensions.

The complete exact-SHA QA archive contains **253 PNG captures**, including all 33 numbered sections at 390 and 1440px, four-width revision/practice states, both themes, dialog/touch states and English routes. Download the [original Actions artifact](https://github.com/veyro-lb/litlab/actions/runs/38851752514/artifacts/12024959589) (GitHub retention expires 30 October 2026); a copy is included with the final handoff. ZIP SHA-256: `82f602f34b80d58e44b603caa47e33a004a5ef64b0fce928efc325fff09b8ca7`.

Inspected actual desktop protein teaching/peptide interaction, Water mobile teaching, carbohydrate mobile chemical figure, dark narrow practice and all corrected narrow enlargement frames. The final B1.1 dark 320px capture is **320 × 9599**, rather than the earlier erroneous 371px-wide capture. Every other captured state remains available for reviewer inspection; no claim is made that a person exhaustively audited all 253 images or certified accessibility.


## 5. Complete technical QA and English regression

Exact implementation run: [38851752514 — SUCCESS](https://github.com/veyro-lb/litlab/actions/runs/38851752514), commit `6d34713e036ea71dd32d7def1eb1da619bb9c49c`. Workflow: [Biology Phase 4 Isolated Integration QA](https://github.com/veyro-lb/litlab/actions/workflows/biology-phase4-qa.yml).

| Gate | Result |
| --- | --- |
| Dependency installation; existing site quality | PASS |
| TypeScript + production build | PASS |
| Complete curriculum validation | PASS — 40 topics / 553 understandings |
| Generic lesson mapping/provenance/asset validation | PASS — all 3 packages |
| Water semantic validator and negative tests | PASS — original content preserved |
| B1.1/B1.2 validator and negative tests | PASS — all 25 new IDs; boundaries, sources, practice, mechanisms |
| Reviewed figure regression/negative guards | PASS — ring numbering/attachments, topology, fill, chain continuity |
| Unit, negative and real-renderer assertions | **90/90 PASS** |
| Real offline Chromium interactions | **347/347 PASS** |
| Retained English desktop/mobile renders | **30/30 PASS** |
| External network escape / interception errors | **0 / 0**; 301 requests deliberately blocked |
| Production dependency audit | PASS — zero vulnerabilities |
| Full tooling audit | FAIL — 7 inherited development dependency records; detailed below |

Browser coverage includes SL/HL, numbered headings, direct document navigation/refresh, history and Previous/Next, scoped revision/practice, native keyboard/radio and touch selection, light/dark, reduced motion, 320/390/768/1440 widths, figure load/recall/enlargement/Escape/focus containment/return, incorrect-answer feedback/retry, full mechanism completion/restart and lazy loading.

Selected exact-commit CI history (failed gates were retained and resolved):

| Run | Outcome / finding |
| --- | --- |
| [38849086977](https://github.com/veyro-lb/litlab/actions/runs/38849086977) | Initial combined integration: SUCCESS |
| [38849586307](https://github.com/veyro-lb/litlab/actions/runs/38849586307) | FAIL, 329/330: old touch test targeted a collapsed section |
| [38850191310](https://github.com/veyro-lb/litlab/actions/runs/38850191310) | FAIL, 332/333: cross-topic narrow touch investigation |
| [38850354678](https://github.com/veyro-lb/litlab/actions/runs/38850354678) | FAIL, 335/336: narrow cross-topic touch still unresolved |
| [38850573949](https://github.com/veyro-lb/litlab/actions/runs/38850573949) | FAIL, 332/339: stronger modal keyboard tests exposed focus behavior |
| [38850933294](https://github.com/veyro-lb/litlab/actions/runs/38850933294) | FAIL, 340/347: full mechanism paths passed; focus/touch work remained |
| [38851228743](https://github.com/veyro-lb/litlab/actions/runs/38851228743) | FAIL, 346/347: focus and touch passed; B1.1 narrow modal bounds failed |
| [38851518140](https://github.com/veyro-lb/litlab/actions/runs/38851518140) | Answer-letter correction checkpoint; superseded by the physical-width fix below |
| [38851752514](https://github.com/veyro-lb/litlab/actions/runs/38851752514) | **SUCCESS, 347/347**: physical-width, dialog and touch corrections passed |


Local `npm ci`, existing quality checks, TypeScript compilation and production build passed. All validators and 90 unit/negative/renderer tests passed. The build's existing large-JavaScript-chunk warning remains; Biology lesson bodies are independently lazy-loaded.

The exact protected-file diff from the foundation is empty for Water JSON/assets, Biology progress contracts, English entry/runtime and package manifests. English regressions render the retained 15 route paths at desktop and mobile (30 renders). Synthetic tests preserve all six English progress values, verify return to English and reject fabricated Biology progress. These are isolated regression fixtures, not inspection of actual student accounts.

Browser runtime stays in Docker `--network none`, only loopback, read-only checkout, restricted capabilities and a disposable profile. CDP intercepts external traffic before the app opens, including an explicit external POST probe; any escaped response/interception error fails the run. Dependencies/browser image are fetched before isolation. No real signed-in session, production database, cloud-progress API or student data was accessed.

Test history is retained rather than hidden: the first combined integration run passed. A subsequent expanded run passed 329/330 interactions and failed a test that attempted to touch a now-collapsed section. The harness was updated to exercise the real disclosure path. A later cross-topic tap exposed a genuine long-heading overflow at 320px; some earlier checks compared expanded measurements and missed it. Responsive heading sizing/wrapping and explicit configured-width assertions corrected this gap. Mobile input coordinates were normalized to the visual viewport. Narrow-modal bounds and keyboard focus were investigated from actual screenshots, corrected, and given explicit tests. Complete three-stage mechanism completion/restart is also exercised. No failing test was disabled.

## 6. Dependency audit

- Production dependency audit: **zero vulnerabilities**.
- Complete dependency tree audit: **7 vulnerabilities — 6 high, 1 moderate**, inherited from unchanged foundation manifests. See [DEPENDENCY_AUDIT.json](./DEPENDENCY_AUDIT.json).

| Package | Severity | Reported fix path |
| --- | --- | --- |
| Vite | High | Audit suggests Vite 6.4.4 |
| esbuild | Moderate | Via Vite update |
| Wrangler | High | Audit suggests Wrangler 4.151.0 |
| miniflare, sharp, undici | High | Via Wrangler update |
| source-map-js | High | Audit reports an available fix |

These are seven affected package records, not a claim of seven independently exploitable production defects. No `npm audit fix` or unrelated toolchain change was mixed into lesson integration. Run a separately validated toolchain maintenance change; keep draft QA isolated meanwhile. Do not describe the full audit as clean.

## 7. Separate readiness conclusions

| Dimension | Conclusion | Boundary |
| --- | --- | --- |
| A. Technical integration | **GO — integrated and tested** | Three topics share one isolated branch and architecture; exact-SHA evidence above. |
| B. Scientific review | Incomplete | Source-checked internally with corrections; independent pack missing; named qualified subject/diagram/assessment approvals absent. |
| C. Design quality | No serious readability/reflow/focus defect observed in the final tested states | Automated Chromium and reviewed screenshots cover practical flows. Screen readers, real devices, zoom, cross-browser and student observation remain unperformed. |
| D. Batch scalability | **GO for isolated drafts after separate owner authorization** | Reusable architecture works across three real topics; molecular/graph review and human review capacity are the bottlenecks. |
| E. Publication readiness | **NO-GO** | Scientific, assessment, licensing, accessibility/student and owner release gates remain open; tooling advisories also need maintenance review. |

No automated pass is described as scientific certification or release authorization. No public deployment is approved or performed.

## 8. Next proposed batch and recommended actions

[NEXT_BATCH_REQUIREMENTS.md](./NEXT_BATCH_REQUIREMENTS.md) specifies A1.2 (10 shared + 5 HL) and C1.1 (10 shared + 7 HL), using the full Hodder chapters and official guidance. Combined scope: 32 understandings, with more graph, experiment and molecular-viewer work than the preceding batch. Estimated 98–142 person-hours including review, subject to reviewer availability; classroom suggested hours are separate.

1. Supply the independent B1.1/B1.2 pack and reconcile every finding against the final implementation SHA.
2. Commission named science/chemistry and IB assessment review of the actual rendered drafts, all figures and provisional questions.
3. Resolve rights and accessibility/student observation gates; complete Vite/Wrangler audit remediation in an isolated maintenance change.
4. Authorize the proposed two-topic draft batch separately if desired; do not implement, register, PR, merge or publish it automatically.
5. Keep all work on the integration branch until the owner issues a separate instruction. Main, other development branches and production systems remain untouched.
