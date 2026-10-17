# Theme D2 — isolated draft checkpoint (17 October 2026)

## Baseline and boundaries

- Repository: veyro-lb/litlab.
- Exclusive author branch: `feature/biolab-complete-theme-d2-20261017`.
- Started from documented green learning foundation commit `7492d63cdc1d568e43d57edd5bf539c4317cb96c`.
- No changes to existing lessons, `src/biology/curriculum/registry.json`, `src/biology/learning/catalog.json`, renderer, main, English or production settings.
- The chosen foundation has the six Theme D2 topics as planned; student-facing title fields in their registry records are absent. The six **topic-local** maps therefore supply proposed student titles without changing the registry.

## Source mapping

Authority: *IB Biology guide, first assessment 2025*; principal explanatory reference: Clegg, Davis and Talbot, *Biology for the IB Diploma Programme*, third edition, Hodder (2023). Matching complete Hodder chapters:

| Topic | Shared | HL | Printed Hodder pages | Teaching status |
| --- | ---: | ---: | --- | --- |
| D3.1 Reproduction | 12 | 8 | 693–724 | First teaching manuscript drafted; review blocked |
| D3.2 Inheritance | 15 | 6 | 725–759 | Only understanding mapping |
| D3.3 Homeostasis | 6 | 5 | 760–778 | Only understanding mapping |
| D4.1 Natural selection | 8 | 7 | 779–797 | Only understanding mapping |
| D4.2 Stability and change | 11 | 4 | 798–819 | Only understanding mapping |
| D4.3 Climate change | 8 | 4 | 820–837 | Only understanding mapping |
| **Total** | **60** | **34** | | **94 mapped, 20 first-pass taught, 74 not taught** |

Each `UNDERSTANDING_MAP.json` has exactly one record per guide understanding with level, proposed descriptive title and guide locators. This is **not** evidence that the full textbook chapters have been exhaustively scientifically checked. The registry currently contains undefined titles for these planned topics; the proposal needs integrator review before adoption.

## D3.1 materials

- `src/biology/learning/reproduction/lesson.json`: first-pass original content for D3.1.1–D3.1.20, 12 shared and 8 HL. Each section has an explanation, example, misconception/correction, explicit source references, one interaction, one retrieval item and one original structured-response item with provisional marking points.
- `src/biology/learning/reproduction/UNDERSTANDING_MAP.json`: local topic-level scope and verification ledger.
- `public/biology/reproduction/d31-cycle-feedback.svg`: original schematic explaining ovarian hormonal sequence, negative and positive feedback. Conceptual figure, not empirical data. The figure is embedded in the lesson with explanatory alt text and rights declaration. **Scientific accuracy and phone rendering have not been independently signed off.**
- `src/biology/learning/reproduction/reproduction.test.mjs`: standalone positive scope and negative mutation tests; not yet run in an installed checkout or CI.

These are drafts, not approved teaching. The manuscript is materially longer than a 20-item placeholder index, but some sections require deeper worked examples, a stronger progression of assessment difficulty and visual teaching. Most explanations use one teaching block, so narrative pacing and actual learner experience need review.

## Scientific/editorial alerts

1. D3.1.19: the guide's simplified language about progesterone falling at childbirth must be reconciled with human functional progesterone withdrawal. The draft explicitly notes this distinction; seek qualified review.
2. D3.1.20: early observational HRT/CHD association and subsequent randomized trial evidence require citation to original trial reports, with population, formulation and timing limitations checked.
3. D3.1.6 and D3.1.15: validate fertilization chromosome behaviour, acrosome and cortical reaction timing from embryology references.
4. D3.1.8: validate double fertilization explanations and plant lineage qualifications.
5. Figures still required: accurate original male/female reproductive anatomy, annotated insect-pollinated flower and gamete/embryo development. Do not substitute generic icons or recreate protected textbook diagrams.
6. Questions: structured response points are provisional; add topic-specific MCQs with four defensible options and causal feedback, numerical or diagram-based tasks where genuinely appropriate. Current selection-check distractors are not all sufficiently diagnostic for summative use.
7. Climate D4.3: **no climate data or graph has been added**. Before building, acquire authoritative observed series, exact units, period, dataset version and license, and clearly distinguish observations from scenarios/projections.

## Checks completed and not completed

**Completed in-memory GitHub-read audit:** six topic-map counts = 94 exactly (60 shared, 34 HL); D3.1 lesson 20 unique mapped sections, 12 shared / 8 HL; 20 question records; claimReference reconstruction matched explanations; every section matched its level.

**Not completed:** running `node --test` inside the repository, `npm ci`, `npm run quality`, `npm run build`, full lesson-schema validation, screenshot/real device inspection, alt-text screen-reader audit, calibrated teacher marking, external rights clearance, science approval, GitHub Actions green CI. Do not represent this checkpoint as green.

## Integration instructions for the sole integrator

1. Recheck this branch's exact HEAD and the green base. Review only the new D3.1 files and local map files; do not overwrite another theme writer's concurrent changes.
2. Run `node --test src/biology/learning/reproduction/reproduction.test.mjs`. Run the repository-wide lesson validator in a separate working checkout using a draft-catalog test harness, not by publishing this unapproved draft.
3. Independently verify all 20 D3.1 statements and supply the missing original biological figures, supported worked questions, visual review and rights evidence.
4. Only after review, propose edits to the central registry and catalog **in the integration branch**. This writer is not authorized to touch those shared files. Do not mark drafts publicly available.
5. For D3.2–D4.3, complete the five content packages individually; create original figures and datasets, source ledgers, question banks and meaningful topic-specific negative tests, and commit each only on completion.
6. Re-run green CI, full student navigation, SL/HL restriction, visual breakpoints and English regression at the exact prospective integration SHA. Qualified human approval and explicit owner release decision remain separate gates.

## Rights

These privately supplied PDFs are references, **not commercial republication licences**. No textbook or IB artwork, long passage or proprietary question was copied into the lesson. Original figure authorship does not automatically certify scientific correctness. Confirm IB and Hodder licensing obligations before commercial use.
