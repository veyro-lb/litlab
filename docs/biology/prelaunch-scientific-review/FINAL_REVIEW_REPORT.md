# BioLab — Independent Prelaunch Scientific and Educational Quality Review

**Review snapshot:** 2026-10-18  
**Repository:** `veyro-lb/litlab`  
**Immutable audit baseline:** `3e07486876700cd35d0931f91a7c11ae82946084` (the latest integration HEAD observed before this review branch was created)  
**Review branch:** `feature/biolab-prelaunch-scientific-review-20261018`  
**Release decision:** **NO-GO until the high-priority assessment issues and independent scientific/visual verification gates are closed.**  
**File ownership:** this review commits **only** under `docs/biology/prelaunch-scientific-review/`. It does not change lessons, questions, SVG/PNG files, UI, PDF figure integration, workflows, or deployment.

## Authority and verification limits

1. **Normative IB syllabus/assessment scope:** *IB Diploma Programme Biology guide*, first assessment 2025, particularly printed pp. 28–33 (science skills), 34–107 (syllabus), 112–113 (external assessment), and 124–125 (command terms).
2. **Detailed teaching reference:** Clegg, Davis and Talbot (2023), *Biology for the IB Diploma Programme*, third edition, Hodder Education. The IB-reviewed status of this **book** is not approval of BioLab itself.
3. The PDF print-page/PDF-page offsets used here are **Guide +6**, **Hodder +12** where verified; never infer individual textual support from a chapter boundary alone.
4. This review independently inspected **actual current repo lesson records and selected priority text, questions and SVG source**, while reusing historical ledgers for discovery. The 553-row ledger is a **complete structured inventory, not 553 independently confirmed scientific passes**. Scientific accuracy is *not* certified for every sentence, mathematical answer, drawing or permissible alternate response. The 2025 Guide determines obligations; extra secondary sources in existing lesson metadata are not described as IB-endorsed authorities.
5. All proposed question replacements are original wording. No official IB exam questions or copyrighted IB/Hodder figures are copied.

## Full course coverage inventory

| Theme | Topics opened | Registered understanding IDs matched to sections | Current practice questions |
|---|---:|---:|---:|
| A — Unity and diversity | 9 | 95 / 95 | 177 |
| B — Form and function | 10 | 123 / 123 | 184 |
| C — Interaction and interdependence | 9 | 164 / 164 | 317 |
| D — Continuity and change | 12 | 171 / 171 | 329 |
| **Total** | **40** | **553 / 553** | **1,007** |

**Checks on all 553:** zero absent sections; zero registry/section SL–HL mismatches; all IDs have a question cross-reference in the current records. The 553 source locator, explanation length, figure/interaction, teaching-block, misconception and question ID fields are in the four `COVERAGE_THEME_*.json` ledgers. In the prior baseline, 997 questions were counted. The ten newly observed Theme B questions explain the entire increase to 1,007. This review reconciled all 25 older proposal records against the new integration baseline: **25/25 replacement records already integrated identically; reapplying them would be wrong**.

**Current assessment inventory:** 535 Paper-1A-style multiple-choice questions, 52 Paper-1B-style data questions, 420 Paper-2-style questions. All 535 choice questions have one coded correct option and all written/structured records have the expected count of marking points in the structural screen; these checks do **not** prove correct answers or mark acceptability. All original question records remain unmodified.

## High-priority scientific/assessment defects

The most concrete **high-severity findings concern biologically incomplete model answers and awardable marking points**—not a demonstrated false statement across the complete lesson prose. They can teach students to omit essential causal steps or falsely suggest a short answer satisfies an IB command term.

| Issue / current question | Understanding | Evidence from current baseline | Required correction | IB Guide / Hodder printed pages |
|---|---|---|---|---|
| SCIREV-Q-002 / `c12-written-9` | C1.2.9 | Key omits explicit lactate formation and regeneration of NAD+ | Explain pyruvate reduction to lactate, NADH oxidation to NAD+, and continued glycolysis | IB 68; Hodder 411–414 |
| SCIREV-Q-003 / `c12-written-11` | C1.2.11 | Two points discuss pyruvate entry and tracer method, not the named link-reaction products | Explain decarboxylation, oxidation/reduction of NAD and acetyl-CoA formation | IB 68; Hodder 415–420 |
| SCIREV-Q-004 / `c12-written-12` | C1.2.12 | Both marks concern initial citrate formation and carbon count; oxidative decarboxylation and yields absent | Credit CO2 release, reduced carriers and ATP equivalent; retain cycle regeneration | IB 68; Hodder 419–421 |
| SCIREV-Q-005 / `c12-written-14` | C1.2.14 | Mark scheme says chain location and response to blocking, without the H+ transfer mechanism | Electron-transfer free energy pumps H+ matrix → intermembrane space, building electrochemical gradient | IB 68; Hodder 421–423 |
| SCIREV-Q-006 / `c12-written-15` | C1.2.15 | Mark scheme says ATP synthase location and H+ direction but omits ADP phosphorylation | Link downhill proton flow through ATP synthase to ATP production from ADP + Pi | IB 69; Hodder 421–423 |
| SCIREV-Q-009 / `d33-written-3` | D3.3.3 | Model answer explains insulin and beta cells only, yet prompt and third point require glucagon and alpha cells | Include alpha-cell glucagon release, target liver response and negative-feedback logic | IB 101; Hodder 762–764 |

The **eleven exact, machine-readable replacement proposals**, including five medium-severity assessment improvements in C1.2, C1.3 and D3.1, are in `PROPOSED_HIGH_PRIORITY_QUESTION_CORRECTIONS.json`. Each includes the entire current question, proposed entire replacement, source lesson blob SHA, question and understanding IDs, severity, evidence, source pages and a fail-closed integration instruction. No assessment data has been patched by this review. A qualified reviewer must check accepted alternative answers and mark allocation.

**The remaining 11 of 17 formulaic C1.2 Paper-2 stems** are marked for command-term and marking review; automatic wording detection is a prioritization signal, not an independently verified error for each item. Other important risk areas—membrane transport, molecular genetics, neural signalling, inheritance, homeostasis and reproduction—remain on the independent full-verification gate even when sampled records appear scientifically consistent.

## Syllabus completeness, provenance and depth

- **No entire officially registered syllabus understanding was found missing** from the current lesson catalog. This does **not** establish that all required fine-grained guidance, experimental procedures, equations, quantitative limitations or examples are present within those explanations.
- **Two verified wrong per-section Guide printed-page locators** were found: B3.2.3 incorrectly points to 59 rather than **58** (`/sections/2/guidePage`), and C2.2.8 incorrectly points to 75 rather than **74** (`/sections/7/guidePage`). Current blob SHA and exact JSON pointers are provided in `SYLLABUS_SOURCE_AND_DEPTH_FINDINGS.json`. Leave actual edits to the integration engineer.
- **58 understandings lack an exact per-section Hodder page field:** C3.2 (18), C4.1 (18), C4.2 (22). Their **lesson-level Hodder chapter references exist**. The source-validation task is to supply verified individual page anchors, not assume content lacks references or invent page numbers.
- Three explanations fall below the 120-word diagnostic: A1.1.7 (116 words), A3.1.9 (118) and A3.1.13 (117). I read these against the relevant Guide expectations (pp. 35, 43 and 44): they adequately cover the scoped concepts and have examples. **No padding is recommended solely to meet an arbitrary word count.**
- Only 52 items are labelled Paper 1B across 40 topics, and 13 topics have none with that label. This is a **data-practice review signal**, *not* proof that those topics fail the curriculum: worked data, practical work, embedded interactives and other paper types may teach the required skills. A manual guide-skills crosswalk remains mandatory.

## Figures and diagrams: current baseline, not historical defects

There are **163 registered lesson figure/image records** in this baseline. The historic visual QA considered 160 at an earlier SHA, so that prior acceptance cannot be carried forward wholesale. Source-only reinspection of the 11 recorded visual issues found:

- **Five source-remediated but not rendered/independently certified:** fish single/double circulation topology and arrows (IVQA-001); flower style callout and anatomy labels (IVQA-002/003); presence of human reproductive anatomy graphics (IVQA-004); and two-vs-three DNA base-pair hydrogen-bond indicators (IVQA-008).
- **One partially remediated:** frontal heart chamber/valve source labels improved; anatomical drawing and spatial callouts require independent rendered inspection (IVQA-005).
- **Two medium concerns still open:** dicot stem/root tissue labels and leaf tissue label association (IVQA-006/007).
- **Two lower-impact source issues remain:** peptide condensation does not draw all reactant-level leaving groups (IVQA-009); DNA figure still exposes the student-facing 'scientific review pending' status text (IVQA-010).
- **One separate browser legibility check remains unverified** (IVQA-011). There are no new real screenshots in this review and no claim that all figures were visually approved.

The exact current asset blob SHAs and dispositions are in `VISUAL_RECHECK.json`. This branch intentionally leaves the ongoing PDF figure and all original SVG/PNG integration untouched.

## Release gates and handoff

**P0 before student release:** (1) inspect and integrate six high-impact answer-key fixes under strict question-object equality and subject-specialist review; (2) obtain a fully independent syllabus-content and entire-bank scientific check of 553 explanations and 1,007 question records; (3) verify complete and scientifically accurate graphics at actual desktop/mobile viewports. Additional P1 tasks include five medium question corrections, the 10 newly added Theme B questions, 58 precise Hodder locators, two wrong Guide page locators, unresolved tissue drawings, practical/data skills, and pinned CI/browser testing. See `PRIORITIZED_CORRECTION_MANIFEST.json` for source IDs, owner, machine pointers and acceptance criteria.

**Actual QA performed in this review:** connected-GitHub current-SHA retrieval and branch creation; fetch and parse all 40 lesson JSONs and registry; cross-check all 553 numbered sections and 1,007 question metadata; inspect selected priority full question objects; compare all 25 historic question replacements for exact equality; inspect 11 known visual issue sources; verify selected Guide/Hodder PDF pages. **Not performed:** npm ci, Node tests, full Vite build, Chromium/Playwright, instrumented mobile screenshots, all-question examiner reading, or independent external scientific approval. The review-branch Actions listing had **zero** runs at the time checked; GitHub combined commit-status list was empty. Neither condition is a passing CI result.

**Decision:** **NO-GO for public release; documentation and prioritized corrections ready for the integration owner.** Completion of a structurally exhaustive review ledger must never be represented as full individual IB examiner or professional scientist certification.
