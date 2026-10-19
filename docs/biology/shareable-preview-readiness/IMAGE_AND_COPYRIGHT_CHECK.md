# Scientific Images, Permissions and Public Asset Safety

## Reference/public boundary
The privately supplied International Baccalaureate Biology Guide, Hodder Biology for the IB Diploma (Third Edition), slide decks and handwritten drawing notes are **reference sources, not publicly redistributable site assets**. The completed consolidation removed **18 PDF-derived textbook crops** because public republication permission was not evidenced. The `public/biology/source-pdf-figures` directory remains absent and the strict final-consolidation validator enforces this.

The isolated branch adds a post-build gate, `scripts/biology/preview-readiness/verify-public-build.mjs`, checking the emitted `dist/` for forbidden private/document/key-file extensions and that source PDF figures remain absent. It also confirms expected original SVG and documented authentic photograph asset presence. This automated check complements, but does not replace, manual redistribution-rights review.

## Six authentic photograph records independently cross-checked
The six provenance records in `docs/biology/scientific-visual-assets-repair/EXTERNAL_RIGHTS_LEDGER.json` have creator/hosting source, source licence/terms URL, modification description and review caveat. Their **current Wikimedia Commons licensing pages** were opened and matched:
| Site asset ID | Recorded permission |
| --- | --- |
| mitochondrion-tem | Public domain, author release |
| pancreas-secretory-cell-tem | Public domain, author release |
| neutrophil-mrsa-sem | Public domain, U.S. government work |
| dicot-leaf-light | CC BY-SA 4.0 |
| onion-root-mitosis | CC BY-SA 4.0 |
| galapagos-finch | CC BY-SA 2.0 |

Credit requirements, source links, licence terms and modification disclosures must remain visible where applicable. Scientific photographs are not to be substituted with textbook screen captures.

## Original teaching figures
The repaired A1.2.7 sugar and DNA/RNA comparison figures are registered as **original, source-informed first-party BioLab/LitLab drawings**, not traced Hodder/IB illustrations. Some legacy first-party records still use preliminary permission wording (for example the A1.2 sugars SVG notes owner publication clearance pending). Owner approval and a complete site-wide rights/signature inventory remain prudent before a wider release.

## Scientific accuracy is separate
Rights clearance does not certify electron transfer arrows, scale bars, axes, biological compartment labels, or 553 explanations. The technical preview is a development demonstration; qualified scientific sign-off remains outstanding for the course. No claims of endorsement by the IB should appear.
