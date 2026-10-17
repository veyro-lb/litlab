# BioLab private review candidate — 17 October 2026

This is a review candidate, not a declaration of pedagogical completion. Main is unchanged. No public production deployment or merge is authorized. The owner-private compiled preview is https://biolab-textbook-review-20261017.mrsmrs.chatgpt.site/#biology. The permanent private screenshot gallery is https://biolab-textbook-review-20261017.mrsmrs.chatgpt.site/review-evidence/.

## What students can use

The course library groups the official syllabus into themes A–D. Topic rows expand to understanding rows; an available understanding opens its teaching directly. Planned topics have no pretend lesson links. The resource bar connects Lessons, Practice, Revision, Flashcards and Sources. Flashcards use existing authored retrieval content and do not claim spaced repetition or mastery.

Teaching paragraphs are immediately visible under biology-specific headings. The only expanding navigation is the curriculum/contents hierarchy; explanations have no numbered disclosure steps. Figures sit within the reading, with recall labels, enlarged views and text alternatives. Optional worked examples, investigations, causal feedback, retrieval and misconception repair remain available without blocking reading.

The assistance panel offers authored simpler explanations, examples, definitions and alternative explanations. Its input matches explicit authored concept keywords, including hyphenated terms, and says when no match exists. It makes no AI inference claim. Neither reading position nor attempts are presented as predictive grades or mastery.

## Topic-by-topic scope

| Topic | Understandings: shared / HL | Work in this revision | Remaining educational work |
|---|---:|---|---|
| A1.1 Water | 6 / 2 | Entire relevant Hodder chapter read and compared; original explanatory refinements; eight bespoke help sets; cohesion schematic rebuilt; heat-capacity model added | Owner review; qualified science/assessment review; student comprehension and retention evaluation |
| B2.2 Organelles and compartmentalization | 3 / 6 | Entire relevant Hodder chapter read and compared; mechanisms and prerequisite scaffolding rewritten; nine original schematic/recall pairs and nine investigations | Owner review; qualified science/assessment review; student comprehension and retention evaluation |
| A1.2 Nucleic acids | 10 / 5 | Natural reading, direct navigation, heading edits and transparent support from existing authored content | Full chapter editorial review; stronger bespoke investigations; nucleosome figure replacement; assessment review |
| B1.1 Carbohydrates and lipids | 13 / 0 | Shared reading/navigation/support architecture; prior teaching preserved | Full chapter editorial review; molecular figure and exercise review; student testing |
| B1.2 Proteins | 5 / 7 | Shared reading/navigation/support architecture; prior teaching preserved | Full chapter editorial review; molecular structure/interaction audit; student testing |
| B2.1 Membranes and membrane transport | 10 / 7 | Shared architecture; hydrophilic-head label and peripheral-protein position corrected; three uncertain transport images withheld | Full chapter review; scientifically verified alternating-access pump/cotransport figures; activity/assessment review |
| B2.3 Cell specialization | 6 / 4 | Shared architecture; glossary definitions improved | Full chapter review; structure–function and potency examples/figures; student testing |
| C1.1 Enzymes and metabolism | 10 / 7 | Shared architecture; feedback-inhibition bar corrected; private source locator removed from student prose | Full chapter review; graph/rate/inhibition investigations and figure review |

Total: **101 understandings (63 shared, 38 HL)**. Seventeen received substantive source comparison/editorial work; 84 received the shared layout and limited editorial improvements. None is marked pedagogically complete. A2.2 Cell structure remains planned, outside the eight registered lesson drafts.

The machine-readable [understanding audit](UNDERSTANDING_AUDIT.json) records actual coverage, visible headings, previous deficiencies, student tasks, checked figures, internal claim locators and outstanding work for every understanding. Loading JSON or passing a validator is explicitly not educational approval.

## Primary-source comparison and scientific decisions

Main teaching reference: Clegg, Davis and Talbot, *Biology for the IB Diploma Programme*, Third Edition, Hodder Education, 2023. Scope reference: official *Biology Guide*, first assessment 2025. Student Sources credit these cleanly; precise locators stay in editorial metadata.

**Water:** Read the complete primary chapter (printed 2–13; PDF 14–25) and Guide requirements (printed 34–35). Compared all eight understandings: aqueous medium; polar covalent and hydrogen bonding; cohesion and its consequences; adhesion; solvent roles; physical properties and aquatic life; water delivery/retention; and extraterrestrial water/search for life. Teaching now distinguishes liquid cohesion from a fixed lattice, surface tension from a solid skin, capillarity from the main driver of tall-tree ascent, hydration from chemical reaction, and energy per mass from equal-volume comparisons. Added oxygen-solubility/haemoglobin reasoning, isotope evidence limitations and transit-spectroscopy explanation. Water's density maximum is near 4°C; the textbook's contrary phrasing is not repeated. Delivery evidence is a hypothesis, not proof of an exclusive origin or of life. The heat model explicitly states constant approximate specific heat, equal-mass comparison and excluded processes.

**Organelles:** Read the complete chapter (printed 244–255; PDF 256–267) and Guide requirements (printed 54–55). Compared all nine understandings: compartment benefits and organelle enrichment; nucleus/cytoplasm separation; lysosome acidification; mitochondrion and chloroplast structure–function; nuclear-envelope roles; free versus ER-bound ribosomes; Golgi processing/traffic; and clathrin-mediated endocytosis. Explanation sequence follows these relationships, with four visible mechanism passages per understanding and tailored investigations. Fractionation is presented as enrichment requiring markers, not purification by a single spin; sedimentation is not conflated with equilibrium buoyant density. Thylakoids are a distinct internal membrane system, not folds continuous with the inner envelope. Mitochondrial and chloroplast proton gradients have different compartments and return directions. Endocytosis preserves membrane topology; clathrin coats the cytosolic side.

Corroboration includes NCBI Bookshelf *Molecular Biology of the Cell* chapters on cell fractionation (NBK26936) and organelle bioenergetics (NBK26828), plus the scientific references retained in each lesson. Existing NOAA/NASA authentic-image provenance remains intact. No commercial assessment questions, textbook diagrams or textbook passages were copied.

## Visual audit

[Figure records](FIGURE_AUDIT.json) cover 76 asset records. All original figures were rendered and inspected by the implementing assistant. This is source cross-checking and visual inspection, **not an independent qualified scientist's sign-off**. Nine B2.2 original schematics/recall variants and Water cohesion were rebuilt; all schematics disclose scale/model limits. Browser evidence checks SVG text extents, image loading, recall variants and enlargement controls.

Four images are withheld rather than presented as reliable: A1.2 nucleosome; B2.1 transport figure 7; sodium–potassium pump figure 15; cotransport figure 16. Replacements require clear wrapping/alternating-access topology. The nucleosome's existing external molecular viewer remains an optional resource; the automated offline browser suite does not validate external services.

## Verification evidence

Implementation tested at commit `2435130294ea0fb5ffc024109cf031402cbcdc58`.

- Local TypeScript/Vite build: pass; existing bundle-size advisory remains.
- Site quality: pass across 365 source files.
- Targeted Water/lesson validation tests: 64 pass.
- Full scientific validators and negative tests: pass.
- Isolated browser: **147/147 checks**, **101/101 understanding workflows**, **24 header combinations**, **0 runtime errors**.
- English regression: **30/30 route renders**, **11/11 interactions**, no failures.
- Scientific figure rendering: **182 views**, no clipped text.
- Production dependencies: no vulnerabilities. Full development dependency audit separately reports seven advisories (one moderate, six high); this audit is not represented as passing.
- Raw JSON reports and build/audit logs are preserved in [evidence](evidence/VERIFICATION.json).
- [Actual desktop/mobile library, Water, B2.2, help, header and scientific-figure screenshots](https://github.com/veyro-lb/litlab/actions/runs/39010523724/artifacts/12093200319): pass; browser runtime errors and SVG text overflow lists are both empty.
- [Full QA run](https://github.com/veyro-lb/litlab/actions/runs/39010523713) includes exact starting-commit before screenshots. These are actual browser captures, not rendered mockups.

The browser suite exercises all 101 understanding routes, all authored help controls and matching/fallback, checks and feedback, retrieval, written misconception repair, nine organelle investigations, the heat model, scope filtering, resources and stored attempts. It checks 24 header combinations (six widths × light/dark × guest/synthetic signed-in state), account menu/sign-in dialog, keyboard, touch and 200% reflow equivalent. External requests are blocked; signed-in layout uses a long-name synthetic fixture. This verifies authenticated layout without changing real account data, not a live authentication-provider end-to-end test. Native browser zoom, additional browsers, real-account verification and qualified educational review remain acceptance work.

English regression tests retain the existing English routes and interaction checks. Existing account/authentication/progress implementations are preserved; Biology attempts stay local and do not invent mastery.

## Still outstanding before acceptance

1. Owner review of the actual private learning experience.
2. Full primary-chapter editorial audit of the other six topics, followed by specific expansions where needed.
3. Qualified independent science/diagram/assessment review and replacement of four withheld figures.
4. Student comprehension, accessibility and retention testing; real authenticated provider checks; native 200% zoom and additional browser coverage.
5. A2.2 authentic microscopy teaching/evidence and image-interpretation work. It remains planned.
6. Existing development-tool dependency advisories and bundle size need a separate maintenance change; do not conflate them with a passing production-dependency audit.
