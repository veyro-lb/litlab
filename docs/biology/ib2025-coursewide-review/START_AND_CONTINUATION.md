> Latest follow-up: [FOLLOWUP_REPORT.md](FOLLOWUP_REPORT.md). The earlier report below is a historical snapshot; its missing-textbook status, locator gaps and validation failures have been superseded where recorded in the follow-up.

> Current continuation: [REPORT_AND_HANDOFF.md](REPORT_AND_HANDOFF.md). This file preserves the initial ATP review and original plan; use REVIEW_MATRIX.json for the new pass’s counts.

# BioLab — IB Biology 2025 scientific/source/editorial review

## Scope and evidence status
- Based on official user-supplied **Biology Guide, first assessment 2025** (published February 2023), user-supplied **Hodder Biology for the IB Diploma, Third Edition** (Clegg, Davis, Talbot; 2023), and the current BioLab lesson files.
- Working branch: `feature/biolab-ib2025-content-source-cleanup-20261019` based on crop-restoration branch `feature/biolab-original-textbook-crops-20261019` at `268415f2c744699d860976212406142d9c35d658`. Do not merge into main or promote as independently reviewed.
- **553 understanding IDs across 40 topics are structurally mapped, not individually science-verified.** Previous consolidated source-depth evidence records 13 individually source-checked rows (8 earlier revised, 4 additional revised, 1 adequate without rewrite), 540 awaiting. The C1.2.1 edit below is a new independent editorial/source review and does not silently reclassify the previous 553-row ledger.
- **Release requires a separate qualified scientific review.** The supplied IB Guide and textbook are source bases, not an endorsement or certification.

## Source-checked editorial change: C1.2.1 (shared SL/HL)
- IB Guide first assessment 2025: printed syllabus p. 67, PDF p. 73; `C1.2.1—ATP as the molecule that distributes energy within cells`. Explicitly requires ATP full name, nucleotide and suitable energy-currency properties.
- Hodder Clegg/Davis/Talbot Third Edition: printed pp. 405–407 (PDF pp. 417–419), especially ATP as a small, soluble, recycled, universal energy intermediate.
- Source comparison of original C1.2.1 teaching showed three paragraphs repeating adenine/ribose/three phosphates, ATP-to-ADP cycling, and energy coupling, with some explanation spilling into C1.2.2/C1.2.3.
- Applied focused repair: **3 teaching blocks → 2; explanatory characters 1,537 → 730** while preserving nucleotide composition, solubility, universal enzyme utility, rapid recycling and energy coupling. Changed `claimReferences` and block-source links to IB/Hodder only; removed unnecessary *section-specific* OpenStax/NCBI tags but retained global reference records for other understandings. Updated revision summary, prompt/answer, and help text for consistency; preserved student practice choices, worked example, assets, IDs and SL/HL level.
- Scientific review state: **source-based internal editorial pass complete for this one understanding only**; no independent expert approval or broad topic review is claimed.

## Exact continuation process for remaining content
1. Visit every official Guide topic and every numbered understanding; compare exact content statement **and guidance**, required examples, prescribed limitations, skills, NOS and SL/HL classification.
2. Use Hodder sections and page references as the deeper explanation source. Do not broaden requirements because a textbook chapter includes extra research or advanced mechanism content.
3. Audit actual explanation, teachingBlocks, revisionSummary, help, terms, misconception correction, figures, assessment/feedback, flashcards and recall. Remove repetition, vague filler, irrelevant case studies and mismatched source tags **without deleting needed scientific causal steps or assessment skills**.
4. Fix 58 known individual Hodder page-location gaps (C3.2:18, C4.1:18, C4.2:22) by checking actual PDF rather than guessing.
5. Preserve directly extracted user-authorized textbook figure crops, credits and exact byte/hash verification; separately verify scientific correctness and level-specific placement. Avoid indiscriminate visuals.
6. Update independent row-by-row source and editorial review evidence, including original text, exact sources, problem, action, SL/HL, and tested code SHA. Differentiate source-checked adequate / corrected / extra-deleted / needs human sign-off / not-yet-reviewed.
7. Process in topic-sized committed batches, run the branch's full source/lesson/build/browser CI after each relevant batch, and never label unreviewed sections approved. Preserve all current 40 topics and 553 IDs, and do not change main/production.

## Planned batches
1. **Cell respiration C1.2:** next C1.2.2–C1.2.17, especially ATP/ADP overlap, energy accounting, NAD handling, glycolysis, link/Krebs/chemiosmosis, updated yield wording, exceptions and SL/HL.
2. **Photosynthesis C1.3, enzymes C1.1; D1.1, D1.2 and D2.1:** mechanism accuracy; distinguish teaching from recall.
3. **A1/A2 and B1/B2:** molecular diagrams, cell structure, classification and membrane transport; follow exact guide limitations.
4. **B3/B4, C2–C4, D2–D4:** plant/animal systems, signalling, ecology, evolution, physiology, defence; resolve citation page gaps.
5. **Whole-course consistency:** question-paper command terms, required skills and NOS, SL visibility, comparison tables, image rights/attribution, source-order cleanup, glossary and crosslinks.

The former structural count and successful CI are not a scientific audit. Qualified teacher/examiner review remains a distinct independent acceptance gate.
