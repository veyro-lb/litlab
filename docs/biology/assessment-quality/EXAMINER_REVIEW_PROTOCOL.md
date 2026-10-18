# BioLab — Human Biology Examiner Review and Safe Integration Protocol

**Scope:** Original, independently authored *IB Biology–style* practice for the syllabus first assessed in 2025. BioLab's content is **not** an official IB examination, licensed mark scheme, examiner-awarded grade, or endorsement.

## Authoritative references

Use the supplied official IB Biology Guide (first assessment 2025) as the primary standard: assessment objectives, printed pp. 22–23; laboratory, mathematical, processing, uncertainty and graphing skills, pp. 28–33; learning understandings and SL/HL scope, pp. 34–107; Paper 1A, Paper 1B, Paper 2 and internal assessment format, pp. 110–123; command terms, appendix pp. 124–125. Use the supplied Clegg/Davis/Talbot *Biology for the IB Diploma Programme*, third edition (Hodder, 2023) for scientific explanations; never copy its commercial questions. The user-supplied Biology Drawings file provides study illustrations, not official examiner approval.

## Full-bank review requirements

The 997-entry JSON ledger means **997 items structurally inventoried, not 997 scientifically examiner-certified**. A qualified Biology teacher/examiner must examine each candidate and record question ID, named reviewer, relevant qualification, date, decision, rationale, sources and any acceptable alternative responses. Only a human-reviewed decision should lead to a status of approved; a successful CI run does not.

* **Paper 1A reasoning:** Verify one unambiguously best key, distractor plausibility and option-specific feedback that explains the error mechanism rather than repeating a stock sentence. Distinguish genuine concept application from keyword-recognition shortcuts.
* **Paper 1B data:** Verify independently generated or cited values, accuracy of axes, gradients, rates, units, significant figures, numerical uncertainties and error bars. Check raw versus derived quantities, choice of plots, data provenance and whether the table inadvertently gives away the answer. Simulated datasets must be unmistakably labelled hypothetical.
* **Paper 2:** Check the command term and mark allocation, independence of points, coverage of causal mechanisms and alternatives, acceptance of equally valid wording, and a meaningful distinction between inference and evidence. Self-marking guidance is not an examiner-assigned score.
* **Experimental inquiry:** Separate independent, dependent and control variables. Examine control treatments, random versus systematic errors, validity versus reliability, sample size, replicates, selection bias, confounders, ethical constraints and support for causal conclusions.
* **Biological calculations:** Check magnification, mm-to-µm conversions and scale bars, signed water potential, enzyme rates, spirometry, population/allele frequencies, genetics probabilities, percentage changes and ecological data, alongside whether rounding and assumptions are defensible.
* **Diagram and image interpretation:** Verify the *current final image*, label orientation, actual biological specimen and scale, tissue plan versus detailed cell drawings, attribution and permissible use. Specific earlier flags: A2.2 assets `a22-scale`, `a22-atypical`, and B4.2 `b42-niches`.
* **SL/HL:** Match specific guide understandings to the appropriate level, and confirm that the additional HL tasks demand appropriate conceptual depth rather than merely adding obscure vocabulary.

Priority follow-up: the prior mechanical screen identified 90 identical wrong-answer-feedback cases and 98 possible boilerplate cases (188 *editorial review candidates*, not proven science errors), 16 cross-section teaching-placement questions, and 3 image-dependent revalidations. The 52 Paper-1B-style questions deserve special attention for data-processing coverage, but equal counts across topics are not required.

## Fresh-head, fail-closed integration

1. Record the integration branch and fetch its current full commit SHA. The machine-readable `INTEGRATION_COMPARISON_20261018.json` is a timestamped comparison, **not a permanent guarantee**.
2. Find the original question by exact `lessonFile` plus `questionId`. Do **not** wholesale replace a lesson, asset, registry, section or other team's JSON.
3. If the current whole question equals `replacementQuestion`, mark it **already integrated; skip**. If it equals `originalQuestion` and SHA-256 of `JSON.stringify(currentQuestion)` matches `previousContentFingerprint.value`, then the proposal is technically eligible for qualified examiner review. If neither matches, stop that one patch and rebase it manually.
4. Independently check whether the correct alternative and scientifically acceptable synonyms/mark points remain valid against the 2025 Guide and current figures. Authorize only with recorded human review.
5. Apply **one exact question object only** and run `node --test scripts/biology/assessment-quality/audit.test.mjs scripts/biology/assessment-quality/verify-patches.test.mjs`, the whole-course assessment validator, existing Biology validators, `npm run quality`, and `npm run build`. Update fingerprint expectations to account for accepted patches; never disable the guard.
6. Re-test every incorrect and correct selection branch, written marking guidance, SL-only and HL-only routes, and important diagram/data displays in a private browser preview. The existing 22 Chromium checks are representative, not exhaustive; complete WCAG, accessible keyboard/assistive-technology and all-question browser verification remain outstanding.
7. Preserve final reviewer decisions, evidence, provenance and rights. Do not claim official IB certification, fabricate student mastery estimates, or call formative self-review an examiner-awarded grade.

## Concurrent integration status

At comparison SHA `ab5bc2b8ae83f7e3bfedd3e52097ea3daa7a1d3f`, **all 14 inherited replacement objects were already integrated unchanged** by another sprint, whereas **11 newly authored candidates still match their original question objects** and require examiner review. One extra climate change question `d43-written-1` was quarantined in `blockedProposals` following a source mismatch against the pinned assessment baseline; it must not be applied before reconciliation.

All 997 main-bank keys and marking points are **not** individually certified yet. No public deployment or merge is authorized by this isolated assessment sprint.
