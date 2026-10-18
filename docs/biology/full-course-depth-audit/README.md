# BioLab — Whole-course content-depth audit

**Working branch:** `feature/biolab-full-course-content-depth-audit-20261018`  
**Verified baseline:** `a03f8f86af7009a529b6aaf8fd7e581a3928de52`  
**Audit date:** 2026-10-18  
**Status:** IN PROGRESS — eight source-checked understandings improved; qualified science review pending.

## Scope and interpretation

The course contains **40 topics and 553 numbered syllabus understandings**: Theme A **95**, B **123**, C **164**, D **171**. The six `matrix-*.json` files constitute an understanding-by-understanding structural inventory of the whole course. Every row identifies the actual lesson section, inherited IB and Hodder source locators, SL/HL label, teaching subheadings, registered figures, learning checks and an explicit review status.

**Important distinction:** The structural inventory checks that 553 mapped lesson sections exist and records candidate editorial signals. It does **not** mean that 553 biological explanations have been compared sentence-by-sentence with the IB Guide and Hodder textbook. The preceding coursewide editorial ledger already warned that title inventories are not full reviews. We are preserving that distinction.

The 2025 IB Biology Guide (published in 2023) governs required content and scope; the supplied Hodder Third Edition (2023) supports explanatory detail. The official roadmap defines all 40 topics. Some printed Guide labels contain an extra dot (e.g. `A.2.3.4`, `B.2.1.9`, `C.1.2.17`, `C.2.1.2`); canonical BioLab IDs normalize these typographic variations, and their sections are present.

## Implemented — source-informed teaching batch

| IB understanding | Original teaching deficiency | Implemented correction | Figure |
|---|---|---|---|
| C1.2.13 (HL) | NADH explanation repeated electron-donation claims and lacked a stage-linked figure | Separated NADH origin, oxidation to NAD⁺, stepwise electron transfer, proton pumping and subsequent ATP synthase action without claiming direct NADH-to-ATP conversion | New original `nadh-electron-energy-transfer.svg` |
| A1.2.7 (shared) | DNA–RNA contrast was repeated in several paragraphs without a single concise comparative view | Explicit strands, A/T/G/C versus A/U/G/C, the 2′ H/OH structural difference, mRNA/tRNA/rRNA examples and a short worked identification | New original `dna-rna-comparison.svg` alongside the existing sugar sketch |
| B3.2.17 (HL) | Root-pressure account repeated itself and lacked a causally sequenced figure | Active mineral loading → lower xylem water potential → osmosis → positive pressure, distinguished from transpiration tension | New original `root-pressure-cause-sequence.svg` |
| C1.3.12 (HL) | Repetition and a malformed misconception obscured where H⁺ moves | Distinct stages for pumping, ATP synthase, and cyclic/non-cyclic electron routes; corrected diagnostic misconceptions | Existing thylakoid figure retained |
| C2.2.11 (HL) | Node-to-node propagation explained repeatedly; no attached image at the relevant understanding | Organized myelin → local axoplasmic current → channel-mediated regeneration → relative speed; separated pump from spike mechanism | New original `saltatory-conduction-nodes.svg` |
| D1.1.8 (HL) | Four bacterial replication enzyme roles were repeated; no visual at this understanding | Primer → 5′→3′ extension → RNA replacement → nick ligation, with leading/lagging distinction | New original `replication-enzyme-sequence.svg` |
| D1.2.10 (shared) | Translation elongation did not have a section-attached stepwise process figure | Codon recognition at A → peptide bond and chain transfer → ribosome shifts three bases and tRNAs move through P/E | New original `translation-elongation-cycle.svg` |
| D2.1.11 (shared) | Mechanisms for variation were described but not placed side-by-side visually | Crossing over of non-sister chromatids vs independent orientation of bivalents, plus 2ⁿ whole-chromosome combinations | New original `meiosis-two-variation-mechanisms.svg` |

Other editorial repairs: eleven sentence-length teaching headings in C2.2 were changed to descriptive subsection titles **without deleting the instructional paragraphs**. Two fragmentary misconception prompts in C1.3.2 and C1.3.17 were changed into complete testable misconceptions with scientifically targeted corrections. Those title/prompt corrections alone are not treated as independent source-level verification.

### Source pages actually consulted for this batch

| Understanding | Official Guide, PDF page | Hodder Third Edition, supplied PDF pages |
|---|---:|---|
| C1.2.13 | 74 | 431–433 |
| A1.2.7 | 43 | 33–34 |
| B3.2.17 | 66 | 333–335 |
| C1.3.12 | 77 | approximately 450 (chapter C1.3) |
| C2.2.11 | 81 | 495 |
| D1.1.8 | 92 | 624 |
| D1.2.10 | 94 | 634 |
| D2.1.11 | 97 | 672 |

The supplied A1.2 SL PowerPoint was also available as supplementary structure/diagram guidance. The independent `feature/biolab-hodder-missing-diagrams-20261018` branch was inspected **read-only**, especially its `INTEGRATION_HANDOFF.md`; it was neither merged nor copied. All seven introduced illustrations are original first-party SVGs. **No Hodder figure was traced or republished for these changes.**

## Classification summary

- **COMPLETE AND VERIFIED AGAINST SOURCES:** **0**. No independent qualified biological examiner has approved a section in this audit.
- **IMPROVED — QUALIFIED REVIEW PENDING:** **8**. The actual lesson content was revised with individual Guide/Hodder context checked, but independent science and real-browser QA remain outstanding.
- **NEEDS FURTHER WORK:** **545**. These are mapped in the audit but have not undergone this round's individual source-depth examination. This label is a review-status warning, **not** a claim that all 546 explanations are deficient.

The status covers all **553** official understandings without pretending that presence of a section is proof of adequate teaching depth.

## Candidate deficiencies and future review queue

1. **Scientific completeness:** Review every unverified row against the exact Guide requirement, limitations and relevant textbook explanation. Start with complex mechanisms in C1.2, C1.3, D1.1, D1.2, D2.1, C2.2 and B3.2. Avoid blindly extending already substantial explanations.
2. **Exact source locator gaps:** **58 rows** in C3.2 (18), C4.1 (18) and C4.2 (22) currently lack section-specific Hodder page pointers in their lesson data. Their chapter-level source citations do not establish row-level verification.
3. **Visual placement review:** **362 rows** have no figure attached directly to their teaching section. This is an *editorial triage signal only*; many concepts should remain prose-only. The known higher-priority visual placements not yet resolved include D1.2.6 ribosome components, and D1.2.16 alternative splicing. Check existing BioLab art before drawing.
4. **Visual evidence and licensing:** Existing publisher-origin/source-PDF figure assets should be individually reviewed for applicable redistribution permission, source accuracy, accessible alt text and use at the relevant understanding. Possessing the textbook PDF does not supply public redistribution rights.
5. **Assessment:** Verify each question and option-specific feedback against taught content, confirm examination command-term scope, and ensure the practice does not depend on unprovided explanations.
6. **Student testing:** Check real desktop/mobile rendering, diagrams, contrast, keyboard access, SL/HL navigation, practice, flashcards, recall and progress preservation, plus broken asset links.

## Automated and qualified validation

- Direct GitHub fetches successfully parsed all **40** course lesson JSON files during structural inventory, with **553** corresponding teaching sections. The matrix has **553 unique** understanding IDs.
- The audit has no new title-only pseudo-lessons and keeps existing schema, section IDs, source registrations and student features.
- The new `scripts/biology/validate-full-course-depth-audit.mjs` checks official row counts and mappings, level consistency, registered lesson references and new SVG scaffold/existence **when run in a full repository checkout**.
- `.github/workflows/biolab-full-course-depth-audit.yml` is isolated to this branch and is configured to run the new validator, existing `scripts/validate-lessons.mjs`, site quality and the production build. **It does not deploy.**
- GitHub file API writes and JSON round-trip parsing were successful. **Do not report npm/build, workflow, browser or qualified biology reviews as passing until actual execution evidence exists.**

## Continuation criteria

For each of the remaining 545 rows, read the exact IB heading and prescribed limitations, cross-check the relevant textbook explanation, inspect original lesson words, repair missing causal steps or incorrect vocabulary, decide whether an original visual/comparison actually helps, check both SL/HL exposure, validate question feedback, and update that row's classification only with evidence. Commit independently verifiable topic-sized batches.

**Branch protection:** No merge to main, no write to the integration branch, no public deployment. This remains a scoped, truthful work-in-progress, not a full-course completion certificate.
