# BioLab — Final Content Sprint A3/A4 Handoff

**Date:** 2026-10-17  
**Repository:** [veyro-lb/litlab](https://github.com/veyro-lb/litlab)  
**Source branch:** `feature/biolab-themes-ab-final-completion-20261017`  
**Verified source HEAD before branching:** `4cd33a7d54bde055e123bd9052ea59c36aae9232`  
**Working branch:** `feature/biolab-final-a3-a4-20261017`  
**Status:** four lesson-package content edits committed; scientific-editorial review is **not** certified, production CI and browser verification still outstanding.

## Implementation and scoped file manifest

The source branch was checked before branching and has not been edited. This sprint changed only:

- `src/biology/learning/diversity-organisms/lesson.json` — A3.1: 15 new original precision/evidence paragraphs and 15 rewritten two-mark assessments; commit `2c4156fde96c64a1ac0bf3b89d705b32c87a4c03`.
- `src/biology/learning/classification-cladistics/lesson.json` — A3.2: nine new paragraphs, nine rewritten two-mark assessments and one original constructed-sequence 3-mark Paper 1B task; commit `9b71c3a3de2e9c823ea9f4b94523974e2096e48e`.
- `src/biology/learning/evolution-speciation/lesson.json` — A4.1: 11 new mechanism/evidence qualifications and 11 two-mark assessments; commit `6c8c6941ce7ca7ed10a45432ddecde2c09495284`.
- `src/biology/learning/conservation-biodiversity/lesson.json` — A4.2: eight new evidence/decision paragraphs and eight two-mark assessments; commit `0fec4e3fdcc619cb4311b8456d2a4139acbfcce5`.
- `scripts/biology/final-a3-a4/validate.mjs` — new reproducible positive content audit.
- `scripts/biology/final-a3-a4/validate.test.mjs` — negative regression test cases.
- `docs/biology/final-a3-a4/FINAL_HANDOFF.md` — this handoff.

No shared rendering, registries, other lesson packages, accounts, deployment workflow, source branch, or main branch were changed. No publication or deployment was made.

## Understood and inspected — full 43-ID editorial ledger

The table specifies the **additional fourth authored teaching block** per existing numbered understanding; each row also received an individually targeted original two-mark Paper 2 prompt and two explicit, one-mark marking points. The Guide and Hodder printed-page references refer to inspected topic scope; the lesson records contain the finer `guidePage`, `pdfPage`, and `textbook.printedPages` fields. Changes do not replace previously good explanatory sections, misconceptions, diagrams or questions.

| Understanding | Scope | Guide p. | Hodder p. | New focused explanation | Assessment revision |
|---|---|---:|---:|---|---|
| A3.1.1 | shared | 42 | 102 | Phenotypes reflect several causes | A researcher samples 20 sunlit leaves from one tree and concludes all leaves of that species are large. Identify one sampling flaw and one reason phenotype does not directly reveal genotype. |
| A3.1.2 | shared | 42 | 104 | Choosing diagnostic characters | Two butterflies differ in colour but have the same stable structural characters. Why is colour alone insufficient evidence for two species? Give one additional comparison. |
| A3.1.3 | shared | 42 | 105 | Nomenclature is not evolutionary proof | Correct the form 'homo Sapiens' and state what each word indicates. |
| A3.1.4 | shared | 43 | 106 | Species boundaries can be tested | Two populations occasionally produce fertile hybrids but normally breed separately. State the limitation of treating one hybrid as decisive and identify another relevant observation. |
| A3.1.5 | shared | 43 | 108 | Speciation has an interval of uncertainty | A pair of isolated populations now differs in song but still produces fertile offspring. Explain why a species designation may remain uncertain. |
| A3.1.6 | shared | 43 | 110 | A chromosome count is not a species key | Why would a biologist not identify an unknown organism to species using only its diploid chromosome count? Give one relevant human–chimpanzee comparison. |
| A3.1.7 | shared | 43 | 111 | Fusion evidence beyond counts | An investigator finds 46 chromosomes in humans and 48 in chimpanzees. Name two additional observations that specifically test a chromosome-fusion hypothesis. |
| A3.1.8 | shared | 43 | 114 | Distinguish genomes from phenotypes | Two members of a species differ at one DNA base but show the same measured trait. Explain why this does not contradict genomic variation. |
| A3.1.9 | shared | 43 | 115 | Genome size and gene number diverge | A flowering plant has more nuclear DNA than a mammal. Explain why it cannot be concluded that the plant is more complex. |
| A3.1.10 | shared | 43 | 116 | Reproducible genome comparisons | A student mixes 'assembled Mb' from one species with '2C picograms' from another in a genome-size plot. Identify two problems to resolve first. |
| A3.1.11 | shared | 43 | 120 | Sequencing is not interpretation | A clinic offers a whole-genome report claiming every future disease can be predicted. Give two reasons to reject this claim. |
| A3.1.12 | HL | 44 | 121 | Why bacterial gene exchange matters | Explain why a fertility test cannot classify an asexually dividing bacterium, and name one alternative type of evidence. |
| A3.1.13 | HL | 44 | 122 | Mechanism of hybrid infertility | Two related plant species have different chromosome complements. Predict one possible meiosis problem in their hybrid and state one qualification. |
| A3.1.14 | HL | 44 | 123 | A key must work on real specimens | A couplet reads 'plant is attractive' versus 'plant is unattractive'. Explain why it fails and propose a measurable replacement. |
| A3.1.15 | HL | 44 | 124 | eDNA detection versus abundance | Fish DNA is detected in a downstream stream sample. Give one supported conclusion and one unsupported conclusion. |
| A3.2.1 | HL | 44 | 125 | A classification is a testable working model | A newly described insect resembles two families. State one reason to classify it provisionally and one kind of evidence that could refine the decision. |
| A3.2.2 | HL | 44 | 126 | Why fixed ranks are imperfect | A student argues that all genera represent equal evolutionary divergence. Explain why this is not warranted and identify a more ancestry-based representation. |
| A3.2.3 | HL | 44 | 128 | Test predictions derived from a clade | Two unrelated aquatic mammals have similar body shapes. Why does shape alone not make them a clade, and what evidence would be stronger? |
| A3.2.4 | HL | 45 | 129 | Monophyly can be checked at each node | On a rooted tree a node has descendants A, B and C. Can a group containing A and B but excluding C be that node's complete clade? Explain. |
| A3.2.5 | HL | 45 | 131 | A clock needs two lineage rates | For an explicitly hypothetical clock, two lineages differ at 0.006 substitutions/site and each accrues 0.001 substitutions/site per million years. Estimate split time and state a limitation. |
| A3.2.6 | HL | 45 | 132 | A shared substitution is conditional evidence | In the explicitly constructed four-taxon alignment, which pair shares position-3 G, and why is that single character insufficient to prove the branching order? |
| A3.2.7 | HL | 45 | 134 | Tree geometry does not establish age | The frog and mouse tips are rotated around their shared node. What changes about their relationship, and what does that node represent? |
| A3.2.8 | HL | 45 | 135 | Convergence can falsify a traditional group | A DNA tree places two visually similar plants in distant clades. State one evolutionary explanation for similarity and one implication for their traditional classification. |
| A3.2.9 | HL | 45 | 136 | The three-domain model has a scope | Why did rRNA sequencing separate Archaea from Bacteria despite similar prokaryotic morphology? Give one qualification. |
| A4.1.1 | shared | 46 | 138 | Evolution and within-lifetime change | A drought favours plants carrying heritable deep-root variants. Identify what must be measured across generations to establish evolution and why short-term wilting is not sufficient. |
| A4.1.2 | shared | 46 | 140 | Compare homologous sites rather than any sequence | A student compares two short DNA sequences and claims an exact split date. Identify one supported evolutionary inference and one missing requirement. |
| A4.1.3 | shared | 46 | 142 | Artificial selection reveals inheritance | Two crop lines are selected for seed size. State what would support genetic evolutionary change rather than a fertilizer effect. |
| A4.1.4 | shared | 46 | 144 | Pentadactyl homology is a structural hypothesis | Explain why a bat wing and whale flipper are homologous forelimbs even though they perform different functions. |
| A4.1.5 | shared | 46 | 145 | Distinguish analogy from an inherited feature | Bird and butterfly wings both permit flight. Explain why they are an example of analogy at the wing level. |
| A4.1.6 | shared | 46 | 147 | A species count changes by two opposing processes | A lineage changes in average body size but never splits. Has speciation occurred? Explain one condition that would establish speciation. |
| A4.1.7 | shared | 46 | 149 | A geographic barrier is not a complete explanation | Bonobos occur south of the Congo River and common chimpanzees largely north. Give one hypothesis the river supports and one reason this does not prove the whole speciation mechanism. |
| A4.1.8 | HL | 46 | 151 | Identify isolation without a physical barrier | Two insect groups occupy the same woodland but breed on different host plants and mate only on those plants. Name the possible speciation mode and mechanism. |
| A4.1.9 | HL | 47 | 152 | Divergence into vacant niches has limits | A lake contains several closely related fish with different feeding structures. State two types of evidence needed before calling this adaptive radiation. |
| A4.1.10 | HL | 47 | 153 | Distinguish isolation before and after fertilization | Classify mating-song differences and a sterile mule as two kinds of reproductive barrier and explain each. |
| A4.1.11 | HL | 47 | 154 | Why chromosome doubling can restore pairing | A sterile diploid plant hybrid undergoes chromosome doubling. Explain how fertility might improve and why a new isolated lineage may result. |
| A4.2.1 | shared | 47 | 156 | Define the measured component first | A restored wetland records more plant species but fewer genetic variants in its rare reed population. Explain why one overall biodiversity verdict is insufficient. |
| A4.2.2 | shared | 47 | 158 | Evidence from fossils is a sample, not a census | Two fossil intervals yield different species counts. Give one reason this cannot by itself establish that biological diversity was lower in the smaller sample. |
| A4.2.3 | shared | 47 | 161 | Separate historical observation from inferred driver | A local biodiversity report says Syrian brown bears no longer occur in Lebanon. Contrast the status with the Caribbean monk seal and state one evidential limitation. |
| A4.2.4 | shared | 48 | 165 | Habitat quality is not a simple forest-versus-farm binary | Compare a selectively logged dipterocarp forest with a forest converted to oil-palm monoculture. Give one ecological consequence and one monitoring requirement. |
| A4.2.5 | shared | 48 | 168 | Sampling effort and index denominators | The 2024 Living Planet Index reports 73% average decline among monitored wildlife populations. State the measured quantity and reject one incorrect interpretation. |
| A4.2.6 | shared | 48 | 170 | Threats interact through pathways | An imported pest spreads after a road fragments a forest. Identify two distinct anthropogenic drivers and explain one interaction. |
| A4.2.7 | shared | 48 | 175 | Match interventions to the threat | An endangered plant loses its native pollinator and habitat. Explain why seed banking alone is insufficient and name an additional intervention. |
| A4.2.8 | shared | 48 | 178 | Prioritization is a defensible choice, not certainty | Two equally threatened species differ in evolutionary distinctiveness. Predict the EDGE preference and state why a manager might choose a different action. |

## Evidence, scientific caveats and copyright

1. **Syllabus authority:** supplied *IB Biology Guide* (first assessment 2025), especially PDF pp. 48–54 (printed pp. 42–48), cross-checked against the supplied one-page IB roadmap. A3.2 is HL-only; A3.1.12–15 and A4.1.8–11 are HL extensions; A4.2 has no HL extension. The Guide's explicitly directed skills were kept visible: karyogram matching and chromosome-2 evidence, dichotomous key and eDNA, aligned sequences and tree interpretation, repeat biodiversity monitoring and case studies.
2. **Textbook cross-reference:** Clegg, Davis and Talbot, *Biology for the IB Diploma Programme*, third edition (2023): A3.1 pp. 102–124 (PDF 114–136), A3.2 pp. 125–137 (PDF 137–149), A4.1 pp. 138–155 (PDF 150–167), A4.2 pp. 156–180 (PDF 168–192). Relevant chapter sections and representative mechanisms/cases were consulted; this does **not** imply independent line-by-line fact-checking of the whole book.
3. **Primary case/data evidence:** pre-existing A4.2 reference ledger includes Holdaway et al. (2014) on moa loss, NOAA historical review of the Caribbean monk seal, the CBD Lebanon report for local brown-bear extirpation, research on Bornean degraded forest, work on Akkar coastal dunes, WWF's 2024 Living Planet Report and ZSL's EDGE methodology. The pre-existing case citations were retained, not represented as newly field-verified. WWF's 2024 monitored-population decline and the ZSL EDGE method were additionally checked against publisher/organization materials. Historical 2024 measures are explicitly dated, not described as 2026 measurements.
4. **Original scientific material:** all added prose and question stems were newly authored. No IB/Hodder questions, images or text diagrams were reproduced. The three already present lesson SVGs (`band-pairing.svg`, `vertebrate-tree.svg`, `population-divergence.svg`) were retained after metadata and label checks. Existing comparison and process figures were retained because additional generic illustrations would not improve the explanations; no fabricated observational charts were introduced.
5. **Limits of inference:** chromosome-2 fusion needs telomere/centromere and sequence evidence, not just chromosome counts; tree nodes are hypotheses, and tip geometry does not date divergence; the Congo River example is not a proven sole mechanism; 2024 LPI percentages are not percentages of species extinct; EDGE does not replace ethical/local decision-making; genome-size charts require actual accession-linked database records. The newly introduced alignment and molecular-clock values are explicitly constructed classroom models.
6. **Rights:** IB/Hodder material was used as a source for original independent explanation, not licensed for reproduction. Both publications retain publisher rights. Whether BioLab's broader commercial syllabus mapping requires an IB license must be reviewed separately; do not imply IB or publisher endorsement.

## Validation performed and reproducibility

**Executed on live connected-GitHub lesson contents (2026-10-17):** JSON parsing and a programmatic integrity audit of all four saved files: **43/43** section identifiers unique and ordered, **26 shared + 17 HL**, **88** question mappings (43 Paper 1A, 43 Paper 2, two Paper 1B), exactly one correct answer and nonempty feedback for each Paper 1A selection, question-mark/rubric consistency, source references, asset paths against the Git tree, internal lesson paragraph/source-map consistency, comparison table shapes and visual anchor indices. The live-file integrity audit reported **PASS / 0 findings**. Seven deliberate mutation checks (wrong HL, duplicate ID, unmapped source paragraph, bad mark total, ragged comparison, data falsely presented as observed, non-existent SVG) were detected as expected.

**Verified model arithmetic:** hypothetical A3.2 clock at pairwise distance 0.006 and rate 0.001 substitutions/site/million years in each lineage gives `0.006/(2 × 0.001) = 3` million years, conditional on the simplified equal-rate assumption. A4.2.5 hypothetical survey sums `10+10+10=30` and `28+1+1=30`; both have richness 3, but the latter has lower evenness. The toy nucleotide alignment position 3 is C in shark/fish and G in frog/mouse; it cannot prove the true vertebrate species tree.

**Not executed:** `npm ci`, `npm run quality`, `npm run build`, `node scripts/validate-lessons.mjs`, `node scripts/biology/themes-ab-final/validate.mjs`, the newly committed Node test runner, and an actual branch-specific browser run. The local environment has no GitHub network route for a full checkout; the connected GitHub API can inspect and commit files but does not provide a Node build runtime. Existing GitHub Action workflows are scoped to other named branches, and no CI/workflow configuration was changed due to strict scope. Prior branch screenshots do not establish results for this branch.

**Reproduction once the branch is checked out into a standard Node 22 environment:**

```bash
npm ci
node scripts/biology/final-a3-a4/validate.mjs
node --test scripts/biology/final-a3-a4/validate.test.mjs
node scripts/biology/themes-ab-final/validate.mjs
node scripts/validate-lessons.mjs
npm run quality
npm run build
```

For browser acceptance, inspect A3.1, A3.2 (HL only), A4.1 and A4.2 on desktop and mobile with real DOM screenshots, focus/keyboard navigation, overflow checks, diagram `alt` and SVG `title/desc`, question feedback, and screenshots of the constructed-data disclaimers. Re-run tests before integration if the baseline branch changes.

## Unresolved issues and release gate

- Qualified IB Biology educator/examiner must independently review scientific nuances, the 88 answer keys, syllabus skills and case-study primary sources. `review.status` correctly remains `scientific-review`, **not** `approved`.
- A real licensed/appropriately attributed chromosome micrograph or karyogram, accession-linked multi-taxon genome records and actual local field specimens/survey observations would improve the directed skills. Conceptual SVGs, proposed key and hypothetical counts are clearly labelled and not substitutes for field evidence.
- Browser/mobile/accessibility regressions and the site quality/production build remain **unverified** until an authorized CI/checkout runtime executes the listed checks.
- Confirm commercial intellectual-property permissions independently, particularly IB syllabus-platform licensing. The absence of copied diagrams does not establish a broad permission or affiliation.

**Integration decision:** valuable committed teaching and assessment improvements, **not** independently certified or release-ready. Retain this isolated branch pending the explicit QA and editorial gates; do not merge or deploy.
