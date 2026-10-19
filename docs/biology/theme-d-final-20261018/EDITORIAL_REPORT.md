# BioLab — IB Biology Theme D final editorial completion

**Date:** 2026-10-18  
**Base ref:** \`feature/biolab-ib-final-base-20261018\`  
**Verified base commit:** \`73f6278c6f8d941f2eeb68b836459efe78572a0b\`  
**Upstream base advanced to:** `ab5bc2b8ae83f7e3bfedd3e52097ea3daa7a1d3f` (five commits incorporated into isolated Theme D branch after initial editorial start; no merge into main).
**Isolated branch:** \`feature/biolab-ib-theme-d-final-20261018\`  
**Scope:** Theme D lesson JSON; Theme D editorial tests and reports only. No merge or deployment.

## Primary source hierarchy

1. *IB Diploma Programme Biology guide*, published 2023, first assessment 2025, Theme D, syllabus statements D1.1.1–D4.3.12. The official statement and its stated SL/HL limitation govern the lesson scope.
2. C. J. Clegg, Andrew Davis and Christopher Talbot, *Biology for the IB Diploma Programme*, third edition, Hodder Education (2023), Theme D, printed pp. 602–837, for explanatory cross-checking and worked-concept context.
3. First-party original, appropriately qualified examples for student teaching. Any added table is newly authored; textbook figures and examination questions have not been reproduced.

The guide identifies **D2.3 as Water potential, D3.1 as Reproduction and D3.2 as Inheritance**. A separate uploaded drawing handout incorrectly marks human reproduction drawings as D3.2; this label is not used in BioLab's lessons. Theme D: Continuity and change.

## Syllabus coverage and level split

| Topic | Numbered understandings | Shared SL/HL | HL-only | Editorially refined |
|---|---:|---:|---:|---:|
| D1.1 DNA replication | 9 | 5 | 4 | 3 |
| D1.2 Protein synthesis | 19 | 11 | 8 | 3 |
| D1.3 Mutation and gene editing | 10 | 7 | 3 | 3 |
| D2.1 Cell and nuclear division | 17 | 11 | 6 | 3 |
| D2.2 Gene expression | 11 | 0 | 11 | 3 |
| D2.3 Water potential | 11 | 7 | 4 | 3 |
| D3.1 Reproduction | 20 | 12 | 8 | 4 |
| D3.2 Inheritance | 21 | 15 | 6 | 4 |
| D3.3 Homeostasis | 11 | 6 | 5 | 4 |
| D4.1 Natural selection | 15 | 8 | 7 | 4 |
| D4.2 Stability and change | 15 | 11 | 4 | 4 |
| D4.3 Climate change | 12 | 8 | 4 | 5 |
| **Total** | **171** | **101** | **70** | **43** |

The full per-understanding mapping is recorded in [COVERAGE_MATRIX.json](./COVERAGE_MATRIX.json). Each row names the official understanding code, level, linked lesson section, IB guide page, Hodder printed page, sources, explanations, examples, tables and original figure IDs. **Mapped coverage is a traceable editorial result, not independent external scientific certification.**

## Scientific corrections and additions

- **D1.1**: calibrated DNA-profiling match claims; clarified 3′ template-reading / 5′ daughter-strand extension and polymerase chemistry; confined polymerases I and III to the syllabus's bacterial enzyme model.
- **D1.2**: differentiated template DNA, coding DNA and 5′→3′ mRNA codons; separated stop signals from amino acids; explained elongation and pre-mRNA processing as separate steps.
- **D1.3**: separated single-base frameshifts from three-base indels; clarified that Cas9 cutting is not confirmed sequence repair; labelled sequence conservation as comparative evidence that supports testable functional hypotheses.
- **D2.1**: distinguished centromere-counted chromosomes from chromatids and DNA molecules (2n=4 worked model); differentiated homolog segregation in meiosis I from chromatid segregation in meiosis II; qualified what mitotic index does and does not measure.
- **D2.2**: separated genome, transcriptome and proteome; separated somatic epigenetic maintenance from inheritance through gametes; limited causal claims from monozygotic twin comparisons.
- **D2.3**: labelled potato-osmosis percentages as measured vs modelled; qualified isotonic medical examples; verified signed Ψw = Ψs + Ψp arithmetic, water-potential direction and permeability assumptions.
- **D3.1**: added a functional reproductive-anatomy comparison; distinguished ovarian positive from negative feedback; described placental exchange without assuming normal blood-mixing; presented HRT evidence with confounding and treatment-regimen limits.
- **D3.2**: distinguished genotype from phenotype using an original comparison table; clarified ABO codominance; demonstrated linkage and recombination calculations; made chi-squared assumptions and degrees of freedom explicit. Replaced **21** copy-template guiding questions with meaningful concept-specific questions.
- **D3.3**: emphasized closed-loop negative feedback rather than perfect constancy; compared glucagon with insulin responses in an original table; described the two loop-of-Henle limbs and ADH action on aquaporins. Replaced **11** generic guiding questions.
- **D4.1**: explained allele-copy counting; added a conceptual comparison of directional, disruptive and stabilizing selection; separated Hardy–Weinberg predictions from observations and stated assumptions. Replaced **15** generic guiding questions.
- **D4.2**: identified Amazon tipping thresholds as uncertain model outcomes rather than measured universal thresholds; corrected simplistic harvesting inference; distinguished bioaccumulation from biomagnification; avoided describing succession as a deterministic march to forest. Replaced **15** generic guiding questions.
- **D4.3**: separated greenhouse forcing from observations and reference baselines; qualified boreal carbon budget calculations as illustrative; distinguished coastal landfast sea ice from land ice; separated phenological mismatch scenarios from observations and phenotypic plasticity from evolutionary allele-frequency change.

Total **43 numbered sections** received explicit scientific editorial supplements; **62 guiding questions** were made topic-specific; four original comparison tables were added where they reduce ambiguity. Existing source-linked mechanisms, interactions, first-party figures and assessment material were preserved.

## Evidence, models and figures

The original source-supported content remains, including scientific content revisions and Figure assets incorporated from the concurrently advanced base. New numbers are either explicit arithmetic exercises with assumptions (2n=4, Hardy–Weinberg, chi-squared, recombinant frequency, water potential, biomass budget) or clearly labelled illustrative models. Published climatic observational indicators already present in the source lessons have not been silently turned into projections. Newly authored tables use ordinary strings, captions and units; they do not reproduce Hodder figures.

Existing visual assets cover DNA replication, gene expression, cell division, fertilization, flowering plants, glucose / temperature feedback, genetics and ecosystems. All **29** integrated Theme D asset paths resolve. Remaining original visual requests that cannot be fulfilled under exclusive ownership are recorded in [EXTERNAL_ASSET_REQUESTS.md](./EXTERNAL_ASSET_REQUESTS.md).

## Validation and reproducibility

A scoped automated regression file is at \`scripts/biology/theme-d-final-20261018/editorial.test.mjs\`. Run from the repository root:

\`\`\`bash
node --test scripts/biology/theme-d-final-20261018/editorial.test.mjs
\`\`\`

Remote GitHub lesson reads were programmatically checked for the 171 unique codes, 101 shared / 70 HL designations, existing IB/Hodder references, explanations, teaching blocks, worked examples, tables and original asset paths. See [QA_RESULTS.json](./QA_RESULTS.json) for execution scope. The Node test has been **committed**, but not executed in a local checkout in this session; do not interpret remote in-memory checking as a successful local Node, Vite, browser or GitHub Actions run.

## Remaining issues / limits

- Independent subject-matter expert/examiner signoff against every syllabus nuance remains outstanding. Presence of a source locator is not proof that external peer review occurred.
- Do not add or adapt proprietary Hodder diagrams or examination questions. The newer base now includes original male and female human reproductive-anatomy figures (inherited without editing the visual-asset files). The remaining optional asset requests are not implemented here because visual assets are outside exclusive ownership.
- After integrating the updated base, a full end-to-end browser rendering / responsive regression and local \`npm\` verification have not been executed from a checkout in this session. Run the scoped test, project validations and visual QA in a suitable CI environment before integrating any content.
- No global assessment, curriculum registry, Sources UI, other theme or production deployment file was intentionally changed.

**Status:** Isolated editorial implementation and remote structural validation complete; runtime CI, visual acceptance and independent scientific signoff pending.