# BioLab — Coursewide Editorial Handoff (PARTIAL)

> Status: **31 of 553 syllabus understandings individually revised in this batch. This is NOT a completed 40-topic editorial review.**

## Repository and branch integrity

- Repository: [veyro-lb/litlab](https://github.com/veyro-lb/litlab)
- Base branch: `feature/biolab-all-sprints-integration-20261018`
- Verified starting HEAD: `73f6278c6f8d941f2eeb68b836459efe78572a0b` (the requested previous HEAD remained current)
- Isolated editorial branch: `feature/biolab-coursewide-editorial-clarity-20261018`
- Last inventory checkpoint SHA, before this handoff file: `e97c478d34d2e6c5622dd88514b1217567b5a039`
- To determine the **final HEAD including this handoff commit**, inspect the branch ref; a commit cannot contain its own SHA in its committed contents.
- There was **no deployment, merge into main, reset or branch rewrite**.

## What was implemented

The edited lesson JSON data now improves **31 specific understandings in five topics across all four themes**. The work includes original, syllabus-scoped explanatory paragraphs, replacement of placeholder key terms, concise but meaningful revision summaries, better alternative explanations, meaningful heading revisions and corrections of misleading misconceptions. It deliberately avoids touching diagram registrations, images, questions, curriculum registries, authentication and renderer code.

| Topic | Edited identifiers | Substantive improvement |
| --- | --- | --- |
| A2.1 Origins of cells (HL) | A2.1.3, A2.1.6 | Distinguish prebiotic compartments from heritable lineages and catalytic RNA evidence from historical inference |
| B3.2 Transport | B3.2.7, B3.2.18 | Explain cohesion–tension xylem transport and source–sink phloem pressure flow |
| C2.2 Neural signalling | C2.2.1–C2.2.16 | Replace generic terminology and headings; clarify resting potential, Ca²⁺-triggered exocytosis, propagation, myelin and inhibition |
| D1.1 DNA replication | D1.1.1–D1.1.9 | Replace all placeholder glossary entries; remove repeated mechanism text; improve 5′→3′ synthesis, PCR and bacterial-enzyme explanations |
| D4.1 Natural selection | D4.1.12, D4.1.13 | Explain heritable fitness patterns and distinguish recessive-phenotype assumptions from Hardy–Weinberg worked arithmetic |

## Before-and-after samples

**A2.1.6** (revisionSummary)

- Before: Storage/replication of sequence information and catalysis; rRNA catalyzes peptide-bond formation in ribosomes.
- After: RNA can carry genetic information and, as a ribozyme, catalyse reactions. The RNA-world hypothesis is plausible partly because ribosomal RNA catalyses peptide-bond formation, but early self-replication remains unproven.

**B3.2.18** (revisionSummary)

- Before: Living sieve elements and metabolically active companion cells support pressure-flow translocation.
- After: Companion cells support sugar loading into living sieve tubes. Water enters osmotically at a source, increasing pressure that drives phloem sap by bulk flow toward lower-pressure sinks.

**C2.2.2** (revisionSummary)

- Before: Potassium leak conductance, impermeant intracellular anions and ion gradients help leave the inside negative relative to the outside (often approximately −70 mV in illustrative neurons). Pumps maintain the gradients over time; they do not alone cause every moment of membrane…
- After: Na⁺/K⁺ pump: ATP-driven protein moving 3 Na⁺ out and 2 K⁺ in

**D1.1.8** (terms)

- Before: ["DNA polymerase I: key term in D1.1.8","DNA polymerase III: key term in D1.1.8"]
- After: ["Primase: enzyme making short RNA primers that supply free 3′ ends","DNA polymerase III: main DNA-extending polymerase in the specified bacterial system","DNA polymerase I: bacterial enzyme that removes RNA primers and replaces them with DNA","DNA ligase: enzyme sealing nic…

**D4.1.13** (teachingBlocks[1].explanation)

- Before: If an appropriate fully penetrant recessive phenotype occurs with frequency 0.09, then q²=0.09, q=0.30, p=0.70 and expected heterozygotes are 2pq=0.42 (42%). The square root is nonnegative. This model predicts population proportions only when assumptions are defensible; it d…
- After: A recessive phenotype can estimate q² only if the trait is caused by the relevant fully penetrant recessive genotype and the Hardy–Weinberg model is appropriate. First estimate q² from the phenotype frequency, then take its nonnegative square root to obtain q; p = 1 − q. Dom…


These examples are not a replacement for the `EDITORIAL_REVIEW_LEDGER.json` file, which contains every original value, replacement and source-file SHA needed for field-level integration.

## Coverage and unfinished work

- **40/40 topics** are identified in the existing course catalog and indexed by identifier. Inventory is not the same as a content review.
- **553/553 unique syllabus identifiers** are individually listed in the ledger, with preserved SL/HL level and source page references from lesson metadata.
- **31/553** have a recorded editorial change and individual educational finding.
- **522/553** are explicitly **NOT REVIEWED / pending full review**, including 35 topics without any new prose edit in this batch and incomplete topics A2.1, B3.2 and D4.1.
- Exact outstanding identifiers and their topic, level and textbook/Guide page metadata are in `EDITORIAL_REVIEW_LEDGER.json > understandingReviews`, filtered by status not equal to `edited-and-individually-reviewed`.

### Topic-level progress

| Topic | Understanding edits / total | State |
| --- | ---: | --- |
| A1.1 | 0/8 | Awaiting prose review |
| A1.2 | 0/15 | Awaiting prose review |
| A2.1 | 2/9 | Partial editorial pass |
| A2.2 | 0/14 | Awaiting prose review |
| A2.3 | 0/6 | Awaiting prose review |
| A3.1 | 0/15 | Awaiting prose review |
| A3.2 | 0/9 | Awaiting prose review |
| A4.1 | 0/11 | Awaiting prose review |
| A4.2 | 0/8 | Awaiting prose review |
| B1.1 | 0/13 | Awaiting prose review |
| B1.2 | 0/12 | Awaiting prose review |
| B2.1 | 0/17 | Awaiting prose review |
| B2.2 | 0/9 | Awaiting prose review |
| B2.3 | 0/10 | Awaiting prose review |
| B3.1 | 0/13 | Awaiting prose review |
| B3.2 | 2/18 | Partial editorial pass |
| B3.3 | 0/10 | Awaiting prose review |
| B4.1 | 0/8 | Awaiting prose review |
| B4.2 | 0/13 | Awaiting prose review |
| C1.1 | 0/17 | Awaiting prose review |
| C1.2 | 0/17 | Awaiting prose review |
| C1.3 | 0/19 | Awaiting prose review |
| C2.1 | 0/14 | Awaiting prose review |
| C2.2 | 16/16 | Editorial pass completed; technical QA pending |
| C3.1 | 0/23 | Awaiting prose review |
| C3.2 | 0/18 | Awaiting prose review |
| C4.1 | 0/18 | Awaiting prose review |
| C4.2 | 0/22 | Awaiting prose review |
| D1.1 | 9/9 | Editorial pass completed; technical QA pending |
| D1.2 | 0/19 | Awaiting prose review |
| D1.3 | 0/10 | Awaiting prose review |
| D2.1 | 0/17 | Awaiting prose review |
| D2.2 | 0/11 | Awaiting prose review |
| D2.3 | 0/11 | Awaiting prose review |
| D3.1 | 0/20 | Awaiting prose review |
| D3.2 | 0/21 | Awaiting prose review |
| D3.3 | 0/11 | Awaiting prose review |
| D4.1 | 2/15 | Partial editorial pass |
| D4.2 | 0/15 | Awaiting prose review |
| D4.3 | 0/12 | Awaiting prose review |

## Syllabus and source verification

The official IB Biology Guide (first assessment 2025) was the scope reference. Guide syllabus pages **74–75** cover C2.2, **86** covers D1.1, and **102–103** cover D4.1. The origin-of-cells and plant-transport sections were cross-referenced against their relevant syllabus topics. The **2023 Hodder Biology for the IB Diploma Third Edition** was consulted for mechanistic detail, particularly C2.2 (printed pages 467 onward), D1.1 (printed pages 602 onward), B3.2 (printed page 303 onward) and D4.1 (printed page 779 onward). These are **editorial checks, not an external scientific certification**.

New wording is original, not copied from textbook paragraphs or protected illustrations. The SL/HL levels, references and asset associations in the five revised lesson files were not changed.

## Visual-needs ledger for the diagram team

The JSON ledger lists six recommended figures, notably three labelled qualitative natural-selection curves, Hardy–Weinberg allele/genotype comparison, an action-potential voltage graph, phloem source-to-sink pressure flow, a polar replication-fork diagram and a non-heritable versus inheriting protocell model. These are **requests**, not newly generated assets. Respect the separate diagram team's ownership and do not add generic or decorative figures or source/buttons below normal images.

## Implementation and structural validation performed

The revisions were applied only to the isolated branch, with each original lesson file fetched using its blob SHA before editing. Each file write used GitHub's content SHA precondition. The source and revised JSON objects were checked for the same section counts, identifiers, SL/HL levels, questions, assets, figure placements and learning path. The full combined `section.explanation` string was checked against the ordered `teachingBlocks[].explanation` strings, and the source claim mapping was checked to cover each revised teaching block. The change ledger contains **165 field-level before/after patches** and requires the exact original value as an integration precondition.

GitHub compare showed the branch ahead of the base with only lesson prose files and the editorial ledger before this handoff file. No assets, question banks or registries appear in that diff.

### Tests NOT executed — do not treat as passing

- `npm ci` — not executed, because a full local checkout was unavailable in this GitHub-connector environment.
- `npm run quality` — not executed.
- `npm run build` — not executed.
- Browser/mobile/desktop visual QA — not executed; there is no preview of this development branch available here.
- GitHub status API returned no commit status checks and no associated PR-triggered workflow runs for the last inventory checkpoint; this is **not** evidence of a pass.

## Remaining science and editorial requirements

1. Work systematically through the 522 marked unfinished identifiers, using each official IB syllabus statement and the corresponding Hodder textbook explanation. Prefer mechanistic gaps, ambiguous terminology and misleading examples over cosmetic rewording.
2. For each understanding, record an individual finding; do not mark it completed when it has only been indexed. Remove duplicate filler without erasing necessary causal steps. Check scientific source claims whenever substantive paragraphs change.
3. Run `npm ci`, `npm run quality` and `npm run build`, the existing negative tests and actual browser checks at representative widths. Confirm list markup renders semantically before introducing any Markdown-style bullets.
4. Perform independent scientific review of the edited wording, prioritizing the specific C2.2 action-potential and drug mechanisms and any numeric worked examples. Do not claim independent certification or IB endorsement.
5. Check that assessment items still match the teachings, particularly the 5′→3′ replication questions and Hardy–Weinberg worked example. Make any necessary question-bank changes only through the separately authorized assessment team.

## Conflict-safe integration procedure

1. Identify the live target branch HEAD and inspect intervening commits from diagram, source, assessment and UI teams.
2. For each entry in `fieldLevelPatches`, locate the understanding by stable ID and verify **originalValue** against the current field. If it no longer matches, stop that field and carry out a scientific and editorial three-way merge. The recorded `expectedSourceBlobSha` identifies the original source snapshot; do not use it to force-overwrite newer files.
3. Apply only approved prose, summary, terminology and misconception changes; synchronize teaching blocks, combined explanations and claim strings. Preserve every current asset, figure registration, source-reference ID, question and unrelated metadata.
4. Re-run the full validation and mobile/desktop teaching checks. Revisit visual-needs requests with the scientific diagram team rather than editing its assets.
5. Do not merge into `main` or deploy publicly until separately authorized.
