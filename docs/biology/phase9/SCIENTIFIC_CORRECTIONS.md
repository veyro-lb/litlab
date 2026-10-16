# Phase 9 source comparison and correction ledger

Agent source comparison is not qualified independent scientific approval. All lessons retain `source-mapped` and `reviewer: null`.

| Understanding / concern | Finding and change | Evidence | Verification |
|---|---|---|---|
| B2.1.11 habitat adaptation | Replaced unspecified cold-adapted organisms with lake sturgeon; explained unsaturated lipid proportions and cold acclimation. Corrected locator to printed 237 / PDF 249. | Supplied Hodder p. 237; Guide p. 53 | Phase 7 and generic validators |
| B2.3.3 page | Source package and validator incorrectly put niches on Guide p. 55. Corrected to 56 / PDF 62; authoritative registry already correct. | Actual supplied Guide PDF 62 | Positive/negative Phase 8 checks; canonical registry digest |
| B2.3.5 dimensions | Added a table distinguishing diameter and length, approximate examples and variation among white blood cells. | Supplied Hodder pp. 261–262 / PDF 273–274 | Table contract and browser reflow |
| B2.3.6 arithmetic | Replaced generic recognition MCQ with a 2 µm cube calculation: 24 µm², 8 µm³, 3 µm⁻¹. All four choices have causal feedback. | Six-face cube geometry; supplied Guide p. 56 | Scientific negative tests; every model-table row checked |
| B2.3.2 visualization | Replaced a static stem-cell icon with division/lineage arrows distinguishing self-renewal from differentiation. | Guide pp. 55–56; Hodder pp. 257–260 | Labelled/recall renders and final browser QA |
| B2.3.9 visualization | Drew cardiac striations, central nucleus and branching; skeletal striations, multiple peripheral nuclei and continuous cell boundary. | Guide p. 56; Hodder pp. 268–270; https://pmc.ncbi.nlm.nih.gov/articles/PMC5056123/ | Labelled/recall renders; final browser QA; human illustration review still pending |
| B2.3.10 visualization | Removed intact oocyte nucleus from original schematic. New secondary oocyte shows metaphase II chromosomes/spindle; sperm includes acrosome, midpiece and flagellum. Explicit independent enlargement, no common size scale. | Hodder pp. 271–272; https://www.ncbi.nlm.nih.gov/books/NBK26843/ | Labelled/recall renders; original lesson's scientifically correct text preserved |
| All 50 new MCQs | Removed regular position cycles with balanced nonsequential ordering. Kept matching Learn/Practice choice meanings and feedback. Replaced 24 generic Phase 8 prompts with biological scenarios. | Original questions; supplied Guide scope | Answer-cycle and paired-feedback negative tests; question interactions |
| Phase 7 test fixture | Negative fixture assumed option index 1 was wrong. After legitimate answer reordering it sometimes did not mutate the input. Now explicitly sets a distractor correct, retaining original correct answer. | Failed preflight run 38951642169, B2.2 fixture | All 21 Phase 7 tests pass locally; final CI required |
| A2.2.10 / .11 microscopy | Added an authentic six-panel cucumber TEM plate, unmodified decoded pixels, CC BY 4.0, original 500 nm bars, source-specific interpretation/drawing activities and marking guidance. | Vigani et al. 2015 Fig. 3, https://doi.org/10.1371/journal.pone.0129141 | Image checksum/pixel identity, provenance and microscopy-negative test; still incomplete overall |
| Mobile lesson headings | Final screenshot review found a lone trailing letter in compartmentalization at 320px. Adjusted the existing Biology-only fluid heading scale; English styles and desktop typography unchanged. | Actual B2.2 320px screenshot | Browser longest-word fit assertion and updated narrow screenshots |
| Phase 8 standalone SVG accessibility | Added missing title/description and accessible SVG role to original assets. | Existing original alt descriptions | XML parsing and actual Chromium raster inspection |

## Mechanisms checked without changing correct existing explanations

- Bilayer head/tail orientation; channels versus ATP pumps; passive aquaporins, impermeant solutes and water potential; extracellular glycans; temperature-dependent cholesterol effects; Na/K 3:2 per ATP; Na-driven glucose uptake with gradient maintenance.
- Matrix/cristae/intermembrane space; stroma/thylakoid lumen; nuclear pores and open/closed division distinction; free versus ER-bound ribosomes; Golgi secretory routing; cytosolic clathrin coat.
- Potency versus division rate; marrow/follicle niches; cube/cuboid units; type I thinness versus type II lamellar bodies and surfactant; cardiac/skeletal distinctions; secondary-oocyte stage.

## Remaining review evidence

No supplied independent B1.1/B1.2 scientific verification pack was available in this conversation or source manifests. Reconciliation remains outstanding. No qualified external IB teacher, microscopy specialist, assessment editor or rights reviewer has signed off these lessons. No IB endorsement or publisher illustration reproduction is claimed. Sources can contain oversimplifications; the original gamete prose correctly avoids the textbook's overly simplified fertilization wording.
