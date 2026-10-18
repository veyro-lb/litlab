# BioLab scientific visual assets repair — 18 October 2026

Implementation is on `feature/biolab-scientific-visual-assets-repair-20261018` only. No main merge or public deployment was performed. The starting integration commit was `a03f8f86af7009a529b6aaf8fd7e581a3928de52` on `feature/biolab-ib-final-integration-20261018` (tree `7ab49bb6cef1bd3df441ea2f1ee4a7a0080ea264`).

## Delivered scope and count rules

All 40 lesson JSON files and 553 numbered understandings were inspected against their visual placements and available source material. The baseline has **167 registered figures**. Dispositions are **139 KEEP, 10 IMPROVE, 14 REPLACE, 4 REMOVE**, plus **21 ADD**, giving **184 current registered figures**. Labelled, recall and mobile variants are not separate teaching figures. Two further native comparison tables were added, for independent assortment and observed monthly CO₂. All 337 shared and 216 HL understanding IDs remain intact.

The 21 added figures comprise 14 original structural/process diagrams, six authentic biological photographs, and one original plot of 24 observed NOAA monthly means. There are also 283 native visual/activity records: 172 comparisons/sequences/bar visuals, 75 graph tables, seven optional microscopy cases, 18 staged mechanism challenges, nine organelle activities, one heat model and one external molecular viewer activity. Counts describe the implementation, not an independent IB or biology certification.

[Topic counts](TOPIC_COUNTS.md) reports every topic. Machine-readable records:

- [Baseline inventory](BASELINE_INVENTORY.json): every baseline asset definition and placement, including the subsequently withdrawn crops.
- [Final inventory](FINAL_INVENTORY.json): every current asset definition, action, reason, exact section, numbered understanding, scope and teaching-block placement.
- [Embedded inventory](EMBEDDED_VISUAL_INVENTORY.json): complete native tables, sequences, bars, microscopy and interactive definitions/placements.
- [Understanding coverage](UNDERSTANDING_COVERAGE.json): all 553 IDs, with structural absence of visual support distinguished from an identified essential gap.
- [Physical asset inventory](PHYSICAL_ASSET_INVENTORY.json): 307 local image files, hashes, 297 registered variant paths and ten provenance/other-use files retained. An unregistered file is not automatically unused.
- [Change ledger](CHANGE_LEDGER.json): individual repaired, replaced, removed and added figure decisions.
- [Files changed](FILES_CHANGED.txt).

## Concrete scientific repairs

| Understanding | Problem and implemented solution |
|---|---|
| A1.2.5 | Generic phosphate backbone did not demonstrate RNA polymer structure. Added original labelled ribose/base/phosphate polymer, 5′/3′ ends and phosphodiester links. Retained the broader backbone where appropriate. |
| A2.2 cell types | Restored project prokaryote/eukaryote figures after removing uncleared PDF crops, then rebuilt disconnected panels into spatially coherent labelled cells and matching recall variants. |
| B2.1.13 | Exocytosis panels omitted actual membrane fusion. Added the open fusion state and extracellular cargo release, with correct membrane topology. |
| B3.2.17–18 | Root pressure and phloem were generic descriptions. Added radial ion uptake/water entry and source-to-sink pressure-flow diagrams; transpiration pull remains distinct. |
| C1.2.12 | Krebs figure lacked regeneration and complete accounting. Added oxaloacetate return, two CO₂, three reduced NAD, one reduced FAD and one ATP equivalent per acetyl-CoA. |
| C1.2.13–15 | Mitochondrial chemiosmosis conflated arrows. Separated electrons, proton pumping, ATP-synthase return, oxygen/water and matrix/intermembrane compartments. Attached the figure explicitly to C1.2.13. |
| C1.3 light reactions | Connected PSII → electron carriers → PSI → reduced NADP; distinguished proton movement and stromal ATP production. |
| C1.3 Calvin cycle | Added RuBP regeneration, TP export and carbon accounting: three CO₂, six TP formed, one net TP exported, five TP regenerate three RuBP; nine ATP and six reduced NADP per net TP. |
| C2.2.1, C2.2.11 | Added full neuron anatomy and saltatory conduction, with local current between nodes and regeneration at nodes; no claim that individual ions jump the axon length. |
| C4.2.20 | Two annual means could demonstrate long-term change but not seasonality. Added observed 2024/2025 monthly curves, month-by-month native table, explicit units and snapshot dates. Rechecked every point against NOAA's 9 October 2026 release. |
| D1.1.3, D1.1.8 | Added helicase fork opening and a clearly prokaryotic primase → polymerase III → polymerase I → ligase hand-off, maintaining 5′→3′ synthesis. |
| D1.2.6, .10, .16 | Added spatial translation elongation with A/P/E sites and alternative splicing with exon selection; no intron translation implied. |
| D2.1.9, .11 | Added homologous separation in meiosis I versus sister separation in II, consistent 2n=4 chromosome counts, reciprocal non-sister crossing over, and a separate independent-assortment comparison. |
| D3.2.13 | Added a constructed autosomal recessive pedigree: heterozygous unaffected parents, affected child, carriers, key and independent ¼ recurrence probability. This is teaching data, not a clinical family record. |
| D3.3.8–9 | Added filtration/selective reabsorption and a loop-of-Henle gradient model. Correct ascending Na⁺ export, descending water permeability and distinct collecting duct/ADH effect; functional schematic, not an anatomical scale map. |
| D4.1 selection | Added labelled axes, before/after legend and dashed baseline, plus three stacked mobile panels. Normalized conceptual probability curves stay inside their panels; they are not empirical distributions. |
| A1.2, A3.2, B1.1, D3.3 | Fixed overlapping Hershey–Chase isotope labels, clipped tree outgroup, blanket “starch branched” wording (now amylopectin/glycogen), and clipped negative-feedback state text. |

All newly added diagrams are independently composed project SVGs, with teaching captions, accessible descriptions, explicit limitations and exact placement records. No image generation or publisher art tracing was used. Correct project figures were retained when no concrete scientific or layout defect was found.

## Sources, rights and source conflicts

[External rights ledger](EXTERNAL_RIGHTS_LEDGER.json) records individual creator, source page, terms, applicable grant, modifications, hashes, captions and placements for six new photographs. They show mitochondrial TEM, pancreatic acinar TEM, a colourized neutrophil/MRSA SEM, a dicot leaf section, onion-root mitosis and a Galápagos finch. Source context and limits are preserved: colourized SEM is identified, static images do not prove movement, and the finch is not assigned an unverified species. Full source frames were resized/encoded without cropping, recolouring or invented scale bars. Credits appear in the source details and enlargement dialog.

The 18 integrated PDF crops had provenance but no applicable redistribution grant. Four redundant crop records were removed; 14 figures were restored to original project alternatives. All 18 PNGs were removed from the current `public` tree and active references. Historical provenance remains in `docs/biology/source-figure-credits.json`, explicitly marked withdrawn. Old git history was not rewritten; publishers' pixels are not newly republished in screenshots or this evidence package. The original 18 publisher figures remain unavailable for reuse unless actual permission is supplied, but their teaching purposes have project alternatives.

The earlier Hodder audit branch was examined: its full-book inventory covers 767 unique figures / 768 captions across 40 topics, with 20 priorities. These are source-analysis records, not permission grants. No textbook crops were adopted. Its old 3-ATP-per-NADH table was rejected as outdated; no such yield was introduced.

The supplied official Guide is the syllabus authority; roadmap, textbook and Drawings PDF inform the comparison. The SL nucleic-acids PPTX was readable (24 slides). The cell-division PPTX had a damaged ZIP directory; 62 slides were recovered from local headers. One recovered slide incorrectly says crossing over occurs between nonhomologous chromosomes, while another correctly says non-sister chromatids; the implementation follows homologous chromosomes and non-sister chromatids. The supplied HL nucleic-acids PPTX was unreadable and was not represented as reviewed.

Primary explanatory cross-checks (science consulted, no borrowed artwork):

- [OpenStax, oxidation of pyruvate and citric acid cycle](https://openstax.org/books/biology-2e/pages/7-3-oxidation-of-pyruvate-and-the-citric-acid-cycle)
- [OpenStax, oxidative phosphorylation](https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation)
- [OpenStax, light-dependent reactions](https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis)
- [OpenStax, Calvin cycle](https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules)
- [OpenStax, prokaryotic DNA replication](https://openstax.org/books/biology-2e/pages/14-3-basics-of-dna-replication)
- [NOAA primary monthly observations](https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt); [data citation guidance](https://gml.noaa.gov/ccgg/trends/data.html). [Values and rights record](CO2_DATA_RIGHTS_AND_VALUES.json) preserves the exact selected 24 values and source hash. No publisher-produced NOAA graph was copied.

## Rendering, accessibility and student interactions

The parallel `feature/biolab-figure-layout-refinement-20261018` work was inspected at `105cdd7bc7291c2ddced6c0e7d1cca8afe29fa17`. Its sizing helper, rights-withheld gate, responsive sizing, dialog zoom controls and four unit tests were selectively reconciled with this branch's renderer. Its branch was not reset or merged. This branch additionally fixes photo preview/zoom sizing, source credits, native Escape/focus restoration and truthful recall alt text when no unlabelled variant exists. Do not overwrite the combined renderer with the older layout branch file.

Photo previews are contained, with original aspect ratio and a height cap; enlargement provides 100–400% zoom and reset. Vectors use responsive size classes and dedicated mobile variants where needed. Existing staged questions, recall toggles, heat calculation, organelle controls, microscopy evidence text, graph tables and molecular viewer link are preserved.

The final automated browser suite renders all 40 topics on actual lesson pages at 1440×1000 and 390×1000, decodes every local figure, captures native visuals/activities, checks page overflow, opens each figure dialog, verifies aspect ratio and 150% zoom growth/reset, closes with Escape and checks focus return. It also loads all referenced SVG variants directly and checks text bounds, exercises the heat and concentration calculations, and captures representative SL pages. External network images are deliberately blocked in this suite so it cannot accidentally count an unobserved remote micrograph as visually verified.

Before screenshots use exact baseline SVG bytes in the current renderer, rather than reconstructing the whole historic interface. They cover ten targeted existing original figure IDs after the tree-ID correction. There are no publisher-crop before screenshots. Selected permanent evidence is under [evidence](evidence/); the complete screenshot corpus and machine reports are the workflow artifact linked in QA_RESULTS.md. Browser rendering occurred in GitHub Actions Chromium because local Chromium exits under the workspace sandbox; no deployment is involved.

Internal visual inspection included all initial 176 desktop and 176 mobile registered figures and 246 native desktop captures via contact sheets, followed by direct review of changed/new figures from subsequent runs. Automated rendering and bounding-box checks supplement this; they do not prove biological accuracy by themselves. Scientific verification is the source comparison and explicit checks above, with independent expert sign-off pending.

## Remaining limits and visually underserved understandings

No known broken local registered figure remains after the final recorded checks. That statement does not certify every possible teaching need. There are 239 understandings without a registered or native visual in their own section; the coverage file enumerates them without automatically labelling descriptive statements as missing essential mechanisms.

The following retain a specific practical limitation:

| Understanding | Remaining visual limitation | Current support |
|---|---|---|
| A2.2.2 | Optional onion micrograph depends on the remote host; not loaded in the offline browser suite. | Source/rights attribution, evidence task, conceptual support. |
| A2.2.5 | Bacillus source download returned HTTP 429 during this session; no unverified local copy added. | Original prokaryotic cell drawing plus credited optional bacterial image/fallback. |
| A2.2.10–11 | Optional onion/mitochondrial source-image investigations are still remote and were not exercised online. | Existing project figures; a genuine local mitochondrial TEM is additionally available in B2.2.4. |
| B3.2.9 | Optional authentic stem photograph is remote; host availability not verified by offline rendering. | Original plan drawing, observation task and source/fallback. |
| A1.2.13 | Compulsory hands-on molecular software activity relies on RCSB 1KX5; opening/rotating the external viewer was not tested in this run. | Original nucleosome schematic and accessible explanation; these do not replace hands-on use. |

B3.1.8's optional remote leaf activity has the same host limitation, but this branch supplies a genuine local leaf photograph in that exact section. Independent qualified biology/IB review remains pending across all topics, including numerical interpretation and specimen identification. No unresolved publisher permission is silently treated as granted. There is no request here for someone else to implement the approved local repairs: those are committed; these are explicit external-access and independent-review limits.

## Exact integration handoff

1. Fetch `feature/biolab-scientific-visual-assets-repair-20261018`. The final full remote commit SHA is supplied in the delivery message; tested code and workflow SHA are recorded in QA_RESULTS.md. Documentation cannot contain its own commit hash without changing that hash.
2. Review the diff from `a03f8f86af7009a529b6aaf8fd7e581a3928de52`, inventories, rights ledger and evidence before integrating into the main integration Work branch. Integration has not been performed here.
3. Preserve the combined `ScientificFigure.tsx`, `figure-presentation.ts`, lesson-contract fields and CSS, rather than applying the parallel layout branch wholesale. Reconcile any newer integration changes manually, keeping exact asset placements, original teaching text/questions and the removed PDF crops out of `public`.
4. Run the validation, quality, build, layout unit tests and complete browser workflow described in QA_RESULTS.md on the resulting integration tree. Review desktop/mobile screenshots for any integration-induced layout changes. No public deployment is authorized by this handoff.
