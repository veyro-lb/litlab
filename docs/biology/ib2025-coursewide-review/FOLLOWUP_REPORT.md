# BioLab — textbook verification and content follow-up

Current implementation: `4c55784a25dbf1deae342ebc037af685a1de5d75`. A following evidence/CI commit contains this report; start from the latest remote HEAD of `feature/biolab-ib2025-content-source-cleanup-20261019`.
Base checked before editing: `630560f521c333f075a14044fca2d81010df61e3`.
No main merge or production deployment was performed. Existing branch preview automation is separate from a production release.

## Work implemented

- **173 exact Hodder locators checked** against the readable 868-page uploaded PDF. **58 formerly missing locators filled** (C3.2:18, C4.1:18, C4.2:22); **98 existing locators corrected**. The remaining 17 checked locators were already consistent. These are locator checks, not completed scientific approvals.
- Actual textbook pointers updated in all affected lesson sections and inventory rows. Evidence records printed/PDF pagination, headings, source-text hashes, source-file hash and before/after pointers in `TEXTBOOK_LOCATOR_VERIFICATION.json`.
- **B3.2 Transport and C2.2 Neural signalling edited individually against Guide statements/guidance**, with preserved figures, concise causal teaching and targeted recall. Neural written questions now have two distinct marking points that answer the requested mechanism.
- **115 Guide comparisons cumulatively** (34 new this pass), **438 understandings still not individually reviewed**. **0 new completed whole-source audits or independent scientific approvals** are claimed. MCQ feedback, all interactions, all visuals and other source claims still require the recorded individual checks.
- All **14 original textbook crops**, their bytes, credits and placements remain intact. No original crop was redrawn or replaced.

## Educational changes

| Lesson | Explanation characters before | After |
| --- | ---: | ---: |
| B3.2 Transport | 29,511 | 10,766 |
| C2.2 Neural signalling | 21,126 | 10,052 |

Transport retains capillary adaptations, artery/vein micrograph skills, pulse measurement, epidemiological limitations, cohesion–tension, xylem adaptations, root/stem plans, the prescribed tissue-fluid model and lymph, fish/mammal circuits, heart structures, left-heart valve sequence, root pressure and phloem adaptations. Three native visual anchors were moved to the appropriate remaining teaching blocks. Root-pressure mechanisms and original figures were preserved.

Neural signalling now separates ion-gradient maintenance from rapid channel events, includes the required correlation/R² skills, preserves calcium-triggered exocytosis and acetylcholine signalling, and keeps the prescribed hyperpolarizing IPSP model. It retains saltatory conduction, the two chemical examples, summation, pain transduction/perception and emergence. Repeated paragraphs and unnecessary detailed shunting-inhibition instruction were removed. The existing three distinct saltatory-conduction blocks were preserved.

Before/after examples:

- C1.2.2 inherited printed p.406 pointed before the relevant teaching; the actual explanation is on printed p.407 (PDF p.419).
- C1.3.8 inherited printed p.433 pointed before the CO₂ enrichment section; the verified range is printed pp.438–439 (PDF pp.450–451).
- C2.2.8’s old written answer described the falling phase but omitted the sodium-channel mechanism needed for the full process. The new two-point answer explicitly pairs Na⁺ influx/depolarization with Na⁺ inactivation and K⁺ efflux/repolarization.
- C2.2.13’s written practice previously emphasized shunting inhibition beyond the prescribed model. It now tests hyperpolarization and movement away from threshold.

`FOLLOWUP_CHANGES.json` contains every changed section/question field and root asset/reference field across **11 affected lesson packages**, relative to the base commit. Its regression test recomputes the complete field differences; no unrecorded lesson edits are allowed.

## Source issues handled

The rendered Hodder printed p.481 (PDF p.493) contains conflicting explanations of recovery: its paragraph incorrectly suggests that one impulse largely reverses bulk ion distributions and that pumping causes the refractory interval, while its common-mistake box correctly distinguishes K-channel repolarization from pumping. BioLab keeps the channel-based explanation, corroborated by John H. Byrne’s university-authored *Neuroscience Online*, Chapter 2, sections 2.6 and 2.9. Source URL and exact handling are in `TEXTBOOK_SCIENTIFIC_ISSUES.json`.

The rendered diameter unit in Table C2.2.2 (printed p.474/PDF p.486) also needs independent investigation before its numerical data are reused. That table was not adopted as a dataset; no unverified unit correction was invented.

The official Guide, roadmap, drawings PDF and SL Nucleic Acids PPTX are accessible. The Hodder PDF is now accessible. The re-uploaded **HL Nucleic Acids** and **SL Cell and Nuclear Division** PPTX files still fail archive opening and their contents were not used. `SOURCE_AVAILABILITY.json` records the current checks; these two files need readable replacements.

## Validation repairs and results

All **20 command groups run locally pass**, including the production build and public-build private-file gate:

- 40 lessons; 553 IDs; 337 shared/216 additional HL mappings; 173 locator/lesson matches.
- 14 original-crop SHA-256/credit/placement checks.
- Source-policy positive and negative tests: the existing observed CO₂ graph was registered under `keeling-monthly-observed`, while the old checker/browser script used a stale ID. The lookup and source ID now match the actual graph, retaining checks for all 24 monthly points, two series, attribution and seasonal interpretation.
- The CO₂ worked example now distinguishes the observed 2025 seasonal amplitude (6.14 ppm) from the retained historical annual means. No source data points were changed.
- D1/D2 positive and negative gates: six original diagram records regained meaningful interpretation metadata for their accessible captions; no image, source credit or licence was replaced. This does not add visible under-image panels.
- Legacy respiration orientation assertions: the existing SVG now has explicit accessible labels for intermembrane space, proton pumping and proton return; geometry and all textbook crops are unchanged.
- C1/C2, B3/B4, Theme B, scientific-figure, presentation, source-review, evidence and site-quality checks. The combined review suite passes **28 tests**, including 18 negative controls removing required transport content.

An intentional test-contract update is recorded openly: the Oct 18 transport-only four-block/200-word quota and frozen paragraph counts conflicted with the Oct 19 concise-teaching brief. They were replaced for **B3.2 only** by exact prescribed-mechanism/skill checks, 18 deletion controls and a versioned current before/after record. All ID, level, source, figure, reference, visual-anchor and remaining-topic assertions remain. The older 123-row evidence ledger is preserved rather than rewritten as a new source approval.

The non-deployment preview-readiness workflow now invokes the new review/source/specialist checks in addition to its existing build and Chromium stages. Local success does not claim that a remote CI run has already passed.

**Chromium remains blocked, not passed.** The browser binary exits before page creation in this environment. No desktop/mobile lesson screenshots, image-viewer interactions or browser overflow checks were obtained. A build and structural tests do not replace those checks. Full commands/logs are in `FOLLOWUP_VALIDATION_RESULTS.json`.

## Commits and continuation

- `781888dc51f149e4a5e3b08f635376b941e277e0` — fix(biolab): verify 173 textbook locators and repair source and figure validation
- `e134db66a95e5a03bd11adc77f21712483a5d059` — content(biolab): clarify neural signalling and align mechanism marking points
- `4c55784a25dbf1deae342ebc037af685a1de5d75` — content(biolab): streamline transport with explicit syllabus coverage checks

1. Start from the latest remote HEAD of this same branch; preserve the 14 actual crops and all current work. No main merge or production deployment.
2. Run the updated non-deployment CI/browser workflow in an environment where Chromium launches, or restore access to the existing protected Vercel preview without disabling protection.
3. Obtain readable replacements for the two damaged teaching presentations. The Guide and textbook support further work while these supplementary files are unavailable.
4. Complete the remaining question-option/feedback, interaction, figure and individual source-claim audits in the seven Guide-compared topics. Treat the 173 locator checks only as locators.
5. Continue through the remaining **438** understandings topic by topic, with exact passages and guidance, genuine per-field evidence, scoped commits and current count updates. The other **380** textbook locators remain inherited/unverified in this pass.
6. Update matrix/evidence/test counts from actual reviews; maintain `independentScientificApproval: false` until a qualified reviewer really signs off.
