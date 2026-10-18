# BioLab — Final IB Biology Examination Assessment Quality Report

**Date:** 2026-10-18 (local; GitHub runner logs UTC)  
**Source branch:** feature/biolab-all-sprints-integration-20261018  
**Verified source SHA:** 73f6278c6f8d941f2eeb68b836459efe78572a0b  
**Independent branch:** feature/biolab-final-assessment-quality-20261018  
**Tested package SHA:** 92b2574f338c9e57090aa7482d77f9c89be74d9b  
**Verified GitHub Actions run:** https://github.com/veyro-lb/litlab/actions/runs/39073299009  
**Result:** SUCCESS, job 117515208973; evidence artifact 12115832719.

## Executive status

**Assessment correction package ready for selective integration. Full scientific/examiner certification of the question bank is NOT complete.** No shared lesson JSON, designs, public deployment or main branch were changed.

## 1. Recomputed full question inventory

The pinned integration SHA contains 40 registered lessons and **997 practice questions**, which differ from the prior QA's historical 957. The 997 comprise **535 multiple-choice** and **462 written or structured** items. Paper-style types: **535 Paper 1A; 52 Paper 1B; 410 Paper 2**. Levels: **598 shared SL/HL and 399 HL-only**. Lesson sections additionally contain **601 embedded interactions** (interactions, predictions and mechanism challenges), not included in the 997. The registry records **553 understandings (337 shared, 216 HL)**.

All 997 practice questions were individually *inventoried and mechanically screened*. Each record, its lesson source blob, question ID, section and understandings, level, marks, paper, source references and detected issues are saved in QUESTION_REVIEW_LEDGER.json. The four chunks preserve batch-level provenance. **Inventory and automated checks do not amount to individual scientific sign-off.**

## 2. Scientific reference basis and examination alignment

Primary source: *IB Biology Guide*, first assessment 2025. Its assessment objectives (printed pp. 22–23) require knowledge, application and evaluation of data and experimental procedures. Its external assessment specifications (printed pp. 112–113) distinguish Paper 1A multiple choice, Paper 1B data-based questions and Paper 2 short, data-based and extended answers; no marks are deducted for wrong Paper 1A answers. HL-only additional content must be excluded for SL learners.

Second source: Clegg, Davis and Talbot (2023), *Biology for the IB Diploma Programme*, third edition (Hodder). Chapters specifically consulted for targeted patches: A2.2 (printed pp. 49–82), C4.1 (548–577), C4.2 (578–601), D1.1 (602–614), D2.2 (670–680), D3.2 (725–759). Exact guide/Hodder locators and source reference IDs are attached to each replacement record. **These chapters were assessed for selected questions, not every page of the 867-page book.** The supplied *IB Biology Drawings* reference informed identification/labelling cautions; final artwork is owned by the visual teams. No official copyrighted past-paper question or official mark scheme was copied.

## 3. Measured review findings

| Indicator | Result and status |
|---|---|
| Practice questions inventoried | 997 / 997 mechanically |
| Practice items with identical wrong-choice feedback | **90 editorial candidates** |
| Practice items with boilerplate wrong-choice feedback | **98 editorial candidates** |
| Unique feedback improvement candidates | **188**, without overlap between these two heuristic sets |
| Initial cross-section / multiple-understanding placement cases | **16**, all valid topic understandings; warnings, not broken IDs |
| Structural errors in the inventory after cross-section triage | **0** by selected checks |
| Image-wording candidates | **3 image revalidations**, plus **2 purely conceptual mentions** |
| Corrected A2.1.2 contradiction | **Fixed** in baseline; exact ID a21-p1a-2 |
| Complete proposed replacement questions | **14**, spanning six lesson files |
| Proposed question changes integrated into shared lessons | **0**, intentionally |
| All 997 answers independently confirmed biologically correct | **Not established** |
| Individual marking points and all dataset calculations independently verified | **Not completed for the full bank** |

The previous QA's 420 medium cases were not 420 verified science errors and were not treated as a current count. The new 188 feedback flags come from more narrowly defined heuristics applied to the 997 practice records. Different mechanisms require diagnostic explanations, but identical feedback is not automatically defective when scientific reasoning is legitimately shared.

The 16 early mapping warnings included multiple valid syllabus understandings anchored to one teaching section (e.g. integrated water properties or comparing two related carbohydrate understandings). They are retained as **placement-review** candidates instead of falsely reported broken syllabus IDs. The executed validator found no missing keys, invalid option cardinality, count-mismatched marking guidance, dataset-column geometry failure or level-scope error across the current source; this is **not proof of accurate science**.

## 4. Original ready-to-integrate changes

The file PROPOSED_QUESTION_PATCHES.json contains **full existing-schema replacementQuestion objects**, not text fragments. Each entry has source lesson, blob SHA, exact question and understanding IDs, originalQuestion snapshot, original issue, answer key or model answer, option-specific explanations, marking points where relevant, level, source evidence and limitations.

| Topic | Target questions and correction |
|---|---|
| D1.1 DNA replication | d11-mcq-1, d11-mcq-2, d11-mcq-3: distinguish replication, translation, helicase, ligase, backbone bonding and semiconservative alternatives |
| D2.2 Gene expression (HL) | d22-mcq-1, d22-mcq-2, d22-mcq-3: transcription versus translation, promoter regulation, mRNA decay and tissue-specific expression |
| C4.1 Populations | c41-mcq-1: population versus species, lake chemistry and numbers of individuals |
| C4.2 Ecosystems | c42-mcq-1, c42-mcq-2, c42-mcq-3: open systems, chemoautotrophic energy and matter/energy transfer |
| D3.2 Inheritance | d32-mcq-1 and d32-mcq-2: meiosis, gamete fusion, Punnett probabilities, breeding controls |
| D3.2 Inheritance | d32-written-2: original five-mark data/application/evaluation practice using **hypothetical** pea offspring counts of 26 TT, 47 Tt and 27 tt; expected F2 ratio 1:2:1 and 50 heterozygotes out of 100; explanation of sampling variation and controlled pollination |
| A2.2 Cell structure | a22-paper2-1: explicitly **hypothetical** microscope measurement, image 84 mm and cell 28 µm gives **3000×**, with separate mark for unit cancellation |

There are **12 selection** and **2 written** replacements. The written inheritance task has five distinct marking points for five marks. The A2.2 item has three separate points for unit conversion, magnification calculation and dimensionless interpretation. All replacement review values use the application's valid **scientific-review** state, *not* the **approved** state. These records are **not yet displayed to learners**.

## 5. Figure and labelling revalidation

No graphics were edited. The following assessment/figure relationships require checking against the final version of the other team's graphics:

- A2.2 a22-paper2-1: section asset **a22-scale** is a conceptual vector, not an authentic photomicrograph. Clarified source numbers are hypothetical, not measured from that illustration.
- A2.2 a22-atypical-reasoning: asset **a22-atypical**. Revalidate which multinucleate and anucleate mature cells are depicted and their correct labels.
- B4.2 b42-12-structured: asset **b42-niches**. Revalidate fundamental-niche and realized-niche regions and the resource-gradient axis.
- D2.1 d21-mcq-8 and C4.2 c42-mcq-17 merely mention a hypothetical micrograph or carbon-cycle diagram; neither is bound to a specific image. **Do not invent asset IDs.**

These exact asset IDs and review notes are in the ledger. No final diagram question is approved solely from prose or an old image.

## 6. Exam skill balance and unfinished scientific review

The bank's **52 Paper-1B-style questions** across 40 lessons are an immediate reason to continue auditing depth of data practice. Priority areas: graph gradients and axes, experimental control and confounders, selection of independent/dependent variables, uncertainty and significant figures, repeatability versus validity, sample-size inference, biological drawing and evidence-versus-inference questions. This does not mean every topic must have the same number of each question type.

Flashcard prompts and answers, misconception corrections, embedded interactions and written schemes were structurally screened; their **complete biological quality has not been individually certified**. The same is true for every real dataset, all numerical model answers and all valid alternative written responses. Scientific approval requires a qualified Biology examiner or teacher to verify these individually against the 2025 guide.

## 7. Checks actually executed

At **92b2574f338c9e57090aa7482d77f9c89be74d9b**, GitHub Actions workflow **39073299009**, job **117515208973**, finished **SUCCESS** with:

1. Exact clean branch/SHA checkout; Node 22; successful npm ci.
2. Existing npm run quality, node scripts/validate-biology.mjs, and node scripts/biology/full-course/readiness-audit.mjs.
3. New negative-test suite: **11 passing, 0 failing**, covering missing/two correct options, duplicates, capitalization distinctions, missing/boilerplate feedback, missing evidence, HL scope leaks, distinct marking points, bad table geometry, broken asset IDs, missing recall answers and misconception corrections.
4. All-topic new assessment validator: **PASS**. Review-only heuristics do not fail the build.
5. Selective patch verification: **14 patches, 14 unique targets, 0 preflight errors**.
6. Actual TypeScript and Vite production build: **PASS**, with non-blocking Vite chunk-size warning.
7. Real network-isolated Chromium assessment run: **9 passing, 0 failing, 0 JavaScript page errors**. Cases covered six existing-question correct/wrong-answer submissions and explanatory feedback; corrected A2.1.2 rendering; D3.2 written self-marking; and SL exclusion of HL-only D2.2.

Evidence artifact **12115832719** contains runner outputs and actual browser evidence. These browser cases ran against the **current unmodified lesson JSON**, not the proposed patch records. Therefore the proposed replacements have passed schema and content preflight, but **must be browser-tested after actual integration**. No real student accounts, external auth, screen-reader certification, all-question browser run or deployment was involved.

## 8. Safe integration instructions

Do **not** merge or bulk-overwrite other teams' working lesson files. Once illustration and integration branches are stabilized:

1. Read the current integration HEAD. Re-run the preflight validator and identify the exact target lesson and stable question ID.
2. Require an exact match between current question content and **originalQuestion**. If the question has changed, stop and re-review that one patch; do not discard the other team's changes. A changed whole-file blob alone is normal after illustration updates.
3. Replace only the selected JSON question object in its questions array with **replacementQuestion**; retain sections, assets, level, reference IDs, option IDs and all other lesson changes.
4. Independently check the scientific claim, possible alternative answers, source location and 2025 SL/HL scope; revalidate any final figure labels. Run the existing validators, new tests and actual browser wrong-answer/right-answer/mark-guidance flows on the integrated version.
5. Require a qualified science/examiner reviewer before setting a question's review status to **approved** or claiming readiness for IB Biology exam certification.

## 9. Final decision

**Technical independent QA package: PASS for selective integration review.**  
**Complete question-bank scientific correctness: NOT VERIFIED.**  
**Publishing/deployment or merging to main: NOT AUTHORIZED by this sprint.**

This branch only adds materials under docs/biology/assessment-quality/, scripts/biology/assessment-quality/ and .github/workflows/biolab-assessment-quality.yml. It has **not** changed lesson JSON, scientific illustrations, website design, the main branch, external services or student data.
