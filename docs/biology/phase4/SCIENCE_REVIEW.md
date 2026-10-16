# Phase 4 scientific cross-check — implementation review, not certification

Date: 16 October 2026. Status: source-checked drafts; independent pack comparison incomplete; qualified review unassigned.

## Required independent pack

The separately authored B1.1/B1.2 verification pack was **not supplied** among the three attachments or repository handoffs. It was explicitly requested at the start of Phase 4. The batch author's `PHASE32_SCIENCE_SOURCE_REVIEW.md` is an internal source record and is **not** a substitute for that independent pack. No comparison with unseen findings, agreement with its conclusions, or independent scientific approval is claimed. On receipt, compare each finding against the exact integration SHA and append a disposition ledger; do not replace this report with an unqualified “verified” label.

## Sources actually inspected

- Supplied official IB Biology Guide, first assessment 2025: B1.1 printed 49–50 / PDF 55–56; B1.2 printed 50–52 / PDF 56–58, including guidance and NOS. Sole authority for numbered requirements and SL/HL. Next-batch planning also reads A1.2 printed 35–38 / PDF 41–44 and C1.1 printed 64–66 / PDF 70–72.
- Supplied Hodder, Clegg/Davis/Talbot, Third Edition (2023): full B1.1 printed 181–204 / PDF 193–216 and full B1.2 printed 205–222 / PDF 217–234. Text read throughout; chemical panels additionally rendered at PDF 202, 211, 216 and 226. Full A1.2 printed 14–33 / PDF 26–45 and C1.1 printed 380–404 / PDF 392–416 read for requirements planning. No textbook artwork or source PDFs added to Git.
- [RCSB PDB 3I40](https://www.rcsb.org/structure/3I40), human insulin experimental X-ray entry, primary citation Timofeev et al. (2010), and [PDB-101 insulin](https://pdb101.rcsb.org/motm/14): two mature peptide chains and disulfide stabilization. No images or coordinate files copied.
- [RCSB PDB 1BKV](https://www.rcsb.org/structure/1BKV), Kramer et al. (1999): three-chain collagen-like peptide experimental model. This is not a full collagen fibril. Record added as corroboration, not as the source of traced artwork.
- Reopened [OpenStax Biology 3.3](https://openstax.org/books/biology-2e/pages/3-3-lipids), [3.4](https://openstax.org/books/biology-2e/pages/3-4-proteins) and [Organic Chemistry 26.9](https://openstax.org/books/organic-chemistry/pages/26-9-protein-structure) as publisher-hosted corroboration of component counts, peptide chemistry and folding. Citation is not permission to redistribute their figures.
- NCBI/PubChem direct pages sometimes returned anti-bot/empty responses; these were not represented as full newly inspected structures. Search excerpts concerning glycogen phosphorolysis and the generalized amino-acid model were considered as cautions. No new measured dataset, stereochemical detail or clinical nutrition advice was introduced from snippets.

Source fingerprints (SHA-256):

| Attachment | SHA-256 |
| --- | --- |
| Official guide | `910414afec33a9a3b1cdac92ff0e40b7a7a6e0083291db95a0376c5aee4e5af0` |
| Roadmap | `852cde621a37fceb2a13101e7e4ad2f6b161d4c13c3048b2654800d96c0d6735` |
| Hodder | `31f66df7a23312b1a9d60c6ab70f9073a246bac7d108ef4b2bbd33312f533b78` |

## Findings against developer branch 224c2124…

| Area | Developer version / finding | Integration disposition |
| --- | --- | --- |
| Ribose | External C5 bond attached to ring C3 | Attach to C4, in labelled and recall SVGs. |
| Fructofuranose | Ring atoms labelled C1–C4, duplicating external C1 and leaving C5 absent | Ring atoms C2–C5; exocyclic C1 at C2 and C6 at C5. Both versions retain connectivity. |
| Steroid nucleus | All three six-membered rings in a linear arrangement | Original angular 6–6–6–5 fused-ring framework; no claim of complete substituents, stereochemistry or actual hormone formula. |
| Condensation/hydrolysis | Invalid SVG `fill="Linked molecule"` gives black reactant box; reactant name missing | Valid light fill and explicit linked-molecule reactant label. Generic join/split scheme remains a model. |
| Protein levels | Tertiary cartoon contained two disconnected fragments despite “one chain” caption | One continuous polypeptide path. Quaternary subunits now contact rather than float separately; secondary helix/sheet symbols are separated from the title. |
| Insulin/collagen cartoon | Insulin blob obscured two-chain concept; collagen had three parallel waves without intertwining | Two distinct insulin chains with symbolic interchain links; three phase-shifted collagen paths. Not atomically resolved structures or complete disulfide maps. |
| Starch | “less-branched and branched” components | Explicit unbranched amylose and branched amylopectin, aligned across explanation, claims and teaching blocks. |
| Amino-acid generalization | “Every standard” could overstate conventional NH2 depiction | Say generalized alpha-amino-acid model. Ionization caveat retained. No stereochemical universality claim added. |
| Understanding feedback | Several identical feedback messages discussed a different distinction; e.g. primary-structure/helix distractor discussed quaternary | Seven concept checks and two MCQs receive choice-specific causal feedback. Correct-answer positions and mappings preserved. |
| Hodder disulfides, p. 214 / PDF 226 | Text suggests cysteine–methionine disulfide links | Do not propagate. Official B1.2.9 specifies cysteine pairs; existing lesson already follows it. |
| Hodder diet, pp. 208–209 | Approximate/outdated counts and table | Keep definitions and dietary adequacy explanation; exact named/count requirements are absent from official B1.2.3. |
| Biochemical versus school reaction model | Guide/textbook condensation and hydrolysis models simplify activated biosynthetic pathways; intracellular glycogen breakdown is not uniformly hydrolysis | Preserve required school-level net-reaction scope. Avoid claiming that every cellular polymerization directly eliminates water or all glycogen mobilization uses hydrolysis. No new mechanistic detail assessed. Qualified reviewer should check this boundary. |
| Molecular bonding and membrane/folding text | Ester vs peptide vs glycosidic bonds, cis caveat, amphipathic lipids, backbone secondary H-bonds, cysteine disulfides, reversible denaturation and conjugated/quaternary distinction | Checked and retained. ABO carbohydrate determinants include glycoproteins and glycolipids; no blanket lipid polarity or irreversible-denaturation claim. |

These are integrator findings. The independent pack column remains unavailable, not “no differences”. No teacher, examiner, chemist or rights owner has signed off these edits.

## Figure-by-figure disposition

All 11 original labelled figures and their 11 recall variants were inspected in SVG source; labelled figures were also rendered together for visual inspection. Recall versions share the corrected geometric paths. Water JSON and its scientific assets are byte-for-byte unchanged.

| Figure family | Review focus / limitation |
| --- | --- |
| sugar-rings | Correct ring carbon counts and attachments; omitted OH groups and stereochemistry explicitly stated. Enlargement needed for small labels. |
| condensation | Direction, water consumption/release and reactant visibility; generic blocks are not structural formulae. |
| polysaccharides | Covalent in-chain vs dashed interchain H-bonds; abstract alternating beta symbols are not complete glucose structures. Branch cartoon represents branched storage components, not unbranched amylose. |
| lipids | Three versus two fatty-acid residues, glycerol and phosphate-containing head; component diagram, not atom-resolved ester chemistry. |
| fatty-acids | Single versus double carbon bond, cis packing caveat; schematic chains omit full acid group and stereochemistry. |
| bilayer | Heads face both aqueous phases; tails inward; no direction-of-transport claim. |
| steroid-rings | Angular fused-ring topology and 6/6/6/5 counts; substituents omitted. |
| amino | Central alpha carbon, H, R, amino/carboxyl groups and ionization caveat; generalized model. |
| peptide | Correct C(=O)–NH linkage, both R groups and remaining termini; simplified net reaction. |
| levels | Single connected tertiary chain, contacting quaternary subunits, conceptual secondary patterns. |
| forms | Two insulin chains and three collagen chains; topology cartoon, not molecular geometry/scale. |

`validate-phase4-figures.mjs` has positive and deliberately corrupted negative tests for specific corrected regressions. These are regression guards, not proof that arbitrary molecular artwork is chemically correct.

## Review gates still open

1. Obtain and resolve the missing independent B1.1/B1.2 pack.
2. Named qualified Biology/chemistry review of exact rendered content, all original/recall figures and net-reaction simplifications.
3. Experienced IB assessment review of question wording, remaining weak distractors, every choice explanation, command terms and provisional marking points. Structural answer validation does not establish assessment quality.
4. Rights owner review of curriculum mapping, original artwork and inherited Water image permissions, including commercial/public use. No new blanket license inferred.
5. Screen reader, browser zoom, real touch hardware, cross-browser and observed student comprehension/retention sessions.
