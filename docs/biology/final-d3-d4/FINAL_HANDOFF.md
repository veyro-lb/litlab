# BioLab — Final Sprint 9: D3–D4 implementation handoff

**Delivery:** Committed original lesson enhancements on `feature/biolab-final-d3-d4-20261017`. This is **not** a declaration of final scientific/editorial approval or deploy readiness.

## Baseline, branch and ownership

- Repository: https://github.com/veyro-lb/litlab
- Base branch: `feature/biolab-complete-course-integration-20261017`
- Verified source HEAD: `2c321ae547baa2a97294728b337a4dfa46e64408` (inspected before branch creation).
- Isolated sprint branch: `feature/biolab-final-d3-d4-20261017`. The current exact final SHA must be read from that branch **after this handoff commit**.
- Changes are restricted to `src/biology/learning/{reproduction,inheritance,homeostasis,natural-selection,stability-change,climate-change}/lesson.json`, seven immediately associated `public/biology/*` original SVGs, `scripts/biology/final-d3-d4/validate.mjs` and this handoff.
- No changes to the global registry, navigation, shared components, other topics, progress handling, workflow/deployment setup, or main.

## Source hierarchy, verifiable locations and copyright

- **Curriculum scope authority:** International Baccalaureate, *Biology guide*, first assessment 2025, Theme D3.1–D4.3, printed pp. 95–107 / attached PDF pp. 101–113. SL/HL split follows each understanding's official position and checked UNDERSTANDING_MAP scope.
- **Scientific teaching reference:** C. J. Clegg, Andrew Davis and Christopher Talbot, *Biology for the IB Diploma Programme*, third edition, Hodder Education (2023), printed pp. 693–837 / attached PDF pp. 705–849. The chapter-specific ranges are in the table below.
- **Specialist / monitoring references already associated with the lessons:** NASA GISS Global Temperature, https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/ and NASA official 2025 year report https://www.nasa.gov/news-release/nasa-releases-global-temperature-data/ ; NOAA Arctic Report Card 2025 sea ice https://arctic.noaa.gov/report-card/report-card-2025/sea-ice-2025/ ; British Antarctic Survey emperor penguin research https://www.bas.ac.uk/news/loss-of-sea-ice-causes-catastrophic-breeding-failure-for-emperor-penguins/ ; NIDDK diabetes overview https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes . See lesson `references` for supplementary claims.
- In D4.3, NASA's reported **2025 observed annual anomaly +1.19 °C** is relative to **1951–1980**, not 1850–1900. NOAA **2025 Arctic monthly-average extents**: March 14.12 versus **1991–2020 March mean** 15.03 million km²; September 4.75 versus **1991–2020 September mean** 5.58 million km². The measured series is **Arctic extent**, not Antarctic landfast ice. The chart is a comparison of reported observed monthly means and climatology. Other invented values are explicitly instructional illustrations.
- This sprint created its own explanations, numerical cases, question wording and SVG vector work. It did **not** reproduce textbook diagrams, publisher prose verbatim or protected examination papers.

## Implemented changes and assessment QA

- **All 94** original numbered understanding IDs preserved: 62 shared SL/HL and 32 HL-only. All **94** structured-response questions have revised **three content-specific marking points**; nine quantitative/mechanism questions now have focused prompts with fully explicit numerical or causal mark allocations. Existing multiple-choice banks and recall activities are preserved.
- **18 targeted understandings** gained original teaching explanations grounded to the existing topic sources. The new text is repeated consistently in each understanding's explanation, teaching blocks and claim/reference metadata, preserving compatibility with existing QA contract.
- **7 original SVGs**, all registered to directly relevant understandings, each with alt text, caption and attribution. Their topics are fertilization sequence, flower anatomy, monohybrid Punnett grid, insulin/glucagon feedback, mechanism of selection, hypothetical harvest accounting and qualitative carbon pathways.
- Existing twelve SVG figures retained. No decorative figure was added to concepts that already have enough visual support.

| Topic | Understandings | SL + HL | HL only | Assessment questions | Registered figures |
|---|---:|---:|---:|---:|---:|
| D3.1 | 20 | 12 | 8 | 20 | 3 |
| D3.2 | 21 | 15 | 6 | 42 | 4 |
| D3.3 | 11 | 6 | 5 | 22 | 3 |
| D4.1 | 15 | 8 | 7 | 30 | 3 |
| D4.2 | 15 | 11 | 4 | 30 | 3 |
| D4.3 | 12 | 8 | 4 | 24 | 3 |
| **Total** | **94** | **62** | **32** | **168** | **19** |

### Topic-specific science and quantitative refinements

- **D3.1:** Membrane fusion versus first embryonic mitosis, flower organ roles and distinction between pollination and fertilization, functional rather than necessarily circulating progesterone withdrawal during human labour; figures for fertilization and flower anatomy. Menstrual cycle figure preserved.
- **D3.2:** Aa × Aa expected 1:2:1 genotype and 3:1 phenotype; explicit quartile method for 150, 156, 160, 164, 169, 172, 178 cm (IQR 16 cm; fences 132 and 196); unlinked dihybrid expected 90:30:30:10 out of 160; linked cross recombinant frequency (8+9)/100 = 17%; χ² ≈ 0.311, df 3, below 7.815 critical value; one additional original Punnett figure; existing ABO/dihybrid/linkage figures preserved.
- **D3.3:** Paired insulin and glucagon feedback, alpha/beta endocrine cell distinction, pressure filtration versus selective nephron reabsorption, hypothalamus–posterior pituitary–ADH–aquaporin-2 osmoregulatory sequence; original paired glucose diagram.
- **D4.1:** Mutation and recombination as variation sources distinguished from selection; heritable phenotypic fitness and population allele changes; Hardy–Weinberg worked example q² = 0.09 ⇒ q = 0.30, p = 0.70, 2pq = 0.42; original selection causal chain.
- **D4.2:** Illustrative replacement 120 per year, harvesting 80 or 150 produces +40 or −30 per year, with assumptions; nutrient enrichment ⇒ decomposition and increased biochemical oxygen demand ⇒ reduced dissolved oxygen; original hypothetical rate visual.
- **D4.3:** Causal greenhouse explanation distinguishes climate forcing, observed temperature and reference periods; NOAA season-matched sea-ice differences −0.91 and −0.83 million km², rather than misleading cross-season comparisons; forest regrowth versus peatland rewetting and methane trade-offs; new qualitative carbon pathway diagram. Existing sourced Arctic sea-ice chart preserved.

## Verification — results and honest limits

**Executed using GitHub-connected repository reads and programmatic in-memory checks on the isolated branch:** 6/6 lesson packages inspected; 94/94 ordered understanding IDs and SL/HL levels match each topic's UNDERSTANDING_MAP; 94/94 structured-response assessments have three nonempty marking points and mapped level; 74 preserved selection questions have single correct keys; 168/168 total question mappings checked; source IDs and attached assets resolve against each lesson's manifest; 18 additions maintain exact source–teaching block explanation concordance. **0 mismatches were found in this connector-side verification.** These checks inspect repository content but are **not** a local Node or production build run.

A new reusable guard is provided: `node scripts/biology/final-d3-d4/validate.mjs`. It specifies 24 negative controls covering corrupt understanding ID, leaking HL into shared SL, broken source concordance and multiple correct interaction options across 6 lessons. **Its Node execution has not yet been observed, so the result is “not run”, not “passed.”**

**Not executed in this session, because there is no runnable checkout with installed npm dependencies and the existing GitHub Actions workflows do not trigger on this isolated branch:** the six existing topic Node test files, all project-wide validators, `npm run quality`, `npm run build`, production preview, Playwright/browser responsive tests, external visual sign-off and CI proof attached to the final SHA. Treat all of these as outstanding verification blockers, not silent passes.

### Repeatable verification commands (run from an exact SHA checkout)

```bash
git checkout feature/biolab-final-d3-d4-20261017
git rev-parse HEAD
node scripts/biology/final-d3-d4/validate.mjs
node --test src/biology/learning/reproduction/reproduction.test.mjs \
  src/biology/learning/inheritance/inheritance.test.mjs \
  src/biology/learning/homeostasis/homeostasis.test.mjs \
  src/biology/learning/natural-selection/natural-selection.test.mjs \
  src/biology/learning/stability-change/stability-change.test.mjs \
  src/biology/learning/climate-change/climate-change.test.mjs
node scripts/biology/full-course/readiness-audit.mjs
node scripts/validate-biology.mjs
npm ci
npm run quality
npm run build
# Then run the repository's configured browser smoke tests in an isolated preview.
```

## Exact per-understanding review ledger

**Status interpretation:** every listed ID was checked structurally against the official scope map and given a revised written rubric; only rows explicitly marked with a new explanation received a new teaching block. These are not assertions of peer-reviewed scientific certification. The IB guide page is the understanding's existing `guidePage`; Hodder pages denote the topic's chapter span, not a unique citation for that individual statement.

| ID | Audience | Reference location | Actual changes | Visual / question status | Verification |
|---|---|---|---|---|---|
| D3.1.1 | SL + HL | IB p. 95 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.2 | SL + HL | IB p. 95 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.3 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.4 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.5 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 1 questions | Structurally verified; expert review pending |
| D3.1.6 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d31-fertilization-sequence; 1 questions | Structurally verified; expert review pending |
| D3.1.7 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.8 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.9 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d31-flower-structures; 1 questions | Structurally verified; expert review pending |
| D3.1.10 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.11 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.12 | SL + HL | IB p. 96 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.13 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.14 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.15 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.16 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.17 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.18 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.19 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.1.20 | HL only | IB p. 97 (topic 95–97); Hodder 693–724 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 1 questions | Structurally verified; expert review pending |
| D3.2.1 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.2 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.3 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.4 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.5 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d32-monohybrid-grid; 2 questions | Structurally verified; expert review pending |
| D3.2.6 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.7 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.8 | SL + HL | IB p. 98 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.9 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.2.10 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.11 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.12 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.13 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.14 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.15 | SL + HL | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.16 | HL only | IB p. 99 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.17 | HL only | IB p. 100 (topic 98–100); Hodder 725–759 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.2.18 | HL only | IB p. 100 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.2.19 | HL only | IB p. 100 (topic 98–100); Hodder 725–759 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.2.20 | HL only | IB p. 100 (topic 98–100); Hodder 725–759 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.2.21 | HL only | IB p. 100 (topic 98–100); Hodder 725–759 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.1 | SL + HL | IB p. 100 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.2 | SL + HL | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.3.3 | SL + HL | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d33-glucose-feedback; 2 questions | Structurally verified; expert review pending |
| D3.3.4 | SL + HL | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.5 | SL + HL | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.3.6 | SL + HL | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.7 | HL only | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.8 | HL only | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.9 | HL only | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D3.3.10 | HL only | IB p. 101 (topic 100–102); Hodder 760–778 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D3.3.11 | HL only | IB p. 102 (topic 100–102); Hodder 760–778 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.1 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.2 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.3 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.4 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.5 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d41-selection-mechanism; 2 questions | Structurally verified; expert review pending |
| D4.1.6 | SL + HL | IB p. 102 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.7 | SL + HL | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.8 | SL + HL | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.9 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.1.10 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.11 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.12 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.1.13 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.14 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.1.15 | HL only | IB p. 103 (topic 102–103); Hodder 779–797 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.1 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.2 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.3 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.4 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.5 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.6 | SL + HL | IB p. 104 (topic 104–105); Hodder 798–819 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d42-harvest-rates; 2 questions | Structurally verified; expert review pending |
| D4.2.7 | SL + HL | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.8 | SL + HL | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.2.9 | SL + HL | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.10 | SL + HL | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.11 | SL + HL | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.12 | HL only | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.13 | HL only | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.2.14 | HL only | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.2.15 | HL only | IB p. 105 (topic 104–105); Hodder 798–819 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.1 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.2 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.3.3 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.4 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | existing diagrams preserved; 2 questions | Structurally verified; expert review pending |
| D4.3.5 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.6 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.7 | SL + HL | IB p. 106 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.8 | SL + HL | IB p. 107 (topic 106–107); Hodder 820–837 (chapter) | Added original explanatory mechanism / numerical worked example; reconciled with sourced claim blocks | new d43-carbon-pathways; 2 questions | Structurally verified; expert review pending |
| D4.3.9 | HL only | IB p. 107 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.10 | HL only | IB p. 107 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.11 | HL only | IB p. 107 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |
| D4.3.12 | HL only | IB p. 107 (topic 106–107); Hodder 820–837 (chapter) | Retained source-mapped explanation; revised 3-point written marking guidance | no figure added (text/prompt sufficient); 2 questions | Structurally verified; expert review pending |

## Remaining limitations / safe integration

1. Expert science and examiner sign-off outstanding across all 94; in particular validate the chemical–endocrine mechanisms, flower drawing readability, genetically realistic Punnett assumptions and consistency between new marking points and question prompts.
2. Full verified human reproductive system diagrams (male and female anatomy) were **not** added in this sprint; the added figure concerns fertilization stages and labelled flowering-plant structures, not comprehensive human anatomical drawings. Treat the relevant drawing learning objectives as a remaining production task.
3. Qualitative diagrams are conceptual. The D4.2 fish arithmetic, D4.1 population examples and D3.2 modeled ratios are hypothetical and **not** empirical series. Carbon pathways have no axis or measured rates; do not misrepresent as experimental measurements.
4. No independent SVG XML rendering, mobile/browser accessibility checks, full npm quality/build or GitHub Actions run was completed at this final SHA. Create a separately approved QA environment before publishing.
5. Source-scoped patches can be integrated by reviewing the diff from pinned base to the sprint branch, verifying exact path ownership, running all checks, resolving external sign-off and carefully cherry-picking/merging only after approval. Do **not** merge to main, reset other branches or publicly deploy automatically.
6. If a different contributor changes the base branch, compare HEADs and rebase safely in a new controlled integration branch rather than overwriting previous work.

**Handoff generated from the actual six post-edit lesson packages. The final SHA is intentionally not self-referential; read the branch HEAD after this file is committed.**
