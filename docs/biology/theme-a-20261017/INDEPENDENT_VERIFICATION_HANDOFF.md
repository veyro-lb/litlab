# Theme A independent verification and integration handoff — 2026-10-17

## Branch control
Repository: `veyro-lb/litlab`
Branch: `feature/biolab-complete-theme-a-20261017`
Inspected HEAD: `387428423e567c3cbdfff503fb6e90dc441f52a4`
Branch base / merge ancestor: `2435130294ea0fb5ffc024109cf031402cbcdc58`
Newer green redesign HEAD: `d6f9fd552096edbdaf7096833675963ed016df72`.
Both base and newer redesign HEAD have successful **BioLab Learning Redesign Isolated QA** and **BioLab Private Review Screenshots** GitHub Actions runs. The Theme A branch diverges from the newer redesign branch (8 ahead / 60 behind at inspection). Do **not** rebase, merge, or expose these lessons automatically.

## Observed content coverage
Each row was checked against the committed topic `lesson.json` (not an inferred skeleton). The complete understanding ranges, inclusive, form the ID-level coverage matrix.

| Topic | Understanding IDs | Shared | HL-only | Populated sections | Questions | Original assets |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| A2.1 Origins of cells | A2.1.1–A2.1.9 | 0 | 9 | 9 | 18 | `public/biology/origins-cells/fatty-vesicle.svg` |
| A2.3 Viruses | A2.3.1–A2.3.6 | 0 | 6 | 6 | 12 | `public/biology/viruses/virion-architectures.svg` |
| A3.1 Diversity of organisms | A3.1.1–A3.1.15 | 11 | 4 | 15 | 30 | `public/biology/diversity-organisms/band-pairing.svg` |
| A3.2 Classification and cladistics | A3.2.1–A3.2.9 | 0 | 9 | 9 | 18 | `public/biology/classification-cladistics/vertebrate-tree.svg` |
| A4.1 Evolution and speciation | A4.1.1–A4.1.11 | 7 | 4 | 11 | 22 | `public/biology/evolution-speciation/population-divergence.svg` |
| A4.2 Conservation of biodiversity | A4.2.1–A4.2.8 | 8 | 0 | 8 | 17 | no local artwork listed; data/other resources need visual QA |
| **Total** | **58 IDs** | **26** | **32** | **58** | **117** | **5 SVG assets** |

The six JSON files contain an explanation, guiding question, revision summary and misconception entries in every section based on connector inspection. Scientific accuracy of every paragraph, detailed figure geometry, answer keys, licensed reuse assertions and accessibility remain subject to independent review; presence is not scientific certification.

## Original sources used by topic authors
- Official *Biology guide* (first assessment 2025), printed pages 38–48 for these topics (PDF pages 44–54); topic-specific page mapping is documented in the six existing `docs/biology/theme-a-20261017/A*.md` records.
- Clegg, Davis and Talbot, *Biology for the IB Diploma Programme*, Third Edition (Hodder, 2023): A2.1 printed pp. 34–48; A2.3 pp. 88–101; A3.1 pp. 102–124; A3.2 pp. 125–137; A4.1 pp. 138–155; A4.2 pp. 156–180.
- Underlying publisher figures and questions must not be copied. SVGs are declared original in their respective lesson records; rights claims still require reviewer sign-off.

## File-by-file integration manifest
| Topic | Lesson file | Standalone QA | Topic provenance/limitations |
| --- | --- | --- | --- |
| A2.1 | `src/biology/learning/origins-cells/lesson.json` | `scripts/biology/theme-a/a2-1-qa.mjs` | `docs/biology/theme-a-20261017/A2.1.md` |
| A2.3 | `src/biology/learning/viruses/lesson.json` | `scripts/biology/theme-a/a2-3-qa.mjs` | `docs/biology/theme-a-20261017/A2.3.md` |
| A3.1 | `src/biology/learning/diversity-organisms/lesson.json` | `scripts/biology/theme-a/a3-1-qa.mjs` | `docs/biology/theme-a-20261017/A3.1.md` |
| A3.2 | `src/biology/learning/classification-cladistics/lesson.json` | `scripts/biology/theme-a/a3-2-qa.mjs` | `docs/biology/theme-a-20261017/A3.2.md` |
| A4.1 | `src/biology/learning/evolution-speciation/lesson.json` | `scripts/biology/theme-a/a4-1-qa.mjs` | `docs/biology/theme-a-20261017/A4.1.md` |
| A4.2 | `src/biology/learning/conservation-biodiversity/lesson.json` | `scripts/biology/theme-a/a4-2-qa.mjs` | `docs/biology/theme-a-20261017/A4.2.md` |

## Verification limitations / precise next step
1. Each topic document currently has `undefined` for understanding titles in its mapping bullets. These are **documentation errors**, not evidence that lesson explanation fields are missing. Replace with verified descriptive titles only after reconciling each ID to the exact Guide statement.
2. Confirm all 58 understanding statements, explicit skills/NOS guidance, factual examples, and SL/HL scopes using the official Guide, then check complete relevant Hodder chapters (not just TOC entries).
3. Run each standalone script and record stdout/exit codes, then run the shared validator on a checked-out **isolated** worktree plus visual/render tests. **Not executed in this verification pass**: the available environment has connector access but no local Git checkout/network clone.
4. Commission qualified review: origins of life hypothesis/evidence distinctions; virus topology and genome packaging; chromosome model interpretation; cladogram topology/trait mapping; non-teleological evolution; biodiversity study datasets and conservation case claims; exam key quality.
5. Determine whether the current redesign renderer can consume these six lesson packages without modifying shared code in this branch. Integration must occur separately and must not change planned/public visibility until approved.
6. Verify all asset metadata and any cited external datasets and image rights. Authentic biological photography is not evidenced by the five existing local SVGs.

**Status:** 58/58 understanding sections populated as original draft teaching packages; 0/58 qualified-science/assessment approvals evidenced by this verification; 6 existing topic-specific QA scripts present but not run in this pass. No deployment, main merge, registry/catalog change, or other agent file modification is authorized.
