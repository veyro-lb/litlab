# B3/B4 figure and microscopy provenance register

**Work branch:** `feature/biolab-final-b3-b4-20261017`  
**Scope:** Figures and observation materials used by the five assigned Biology packages only.

## Newly authored or corrected local scientific diagrams

| Understanding | Asset | Editorial status |
| --- | --- | --- |
| B3.3.2 | `public/biology/muscle-motility/sarcomere.svg` | **Corrected** original relaxed/contracted depiction to maintain constant thin actin and thick myosin lengths, increase overlap and decrease Z-disc spacing; qualitative schematic, no claimed measured biological scale |
| B3.3.2 | `public/biology/muscle-motility/sarcomere-mobile.svg` | Newly authored narrow-viewport variant; model geometry explicitly not to scale |
| B3.2.15 | `public/biology/transport/heart-frontal.svg` | Newly authored conceptual frontal-plane heart pathway: oxygenation, atria/ventricles, AV/semilunar valves, pulmonary vessels, aorta, septum |
| B3.2.15 | `public/biology/transport/heart-frontal-mobile.svg` | Newly authored narrow-viewport heart flow diagram, with arterial/venous labels and directional arrows |

Rights claim: these four vector asset files were authored in BioLab from SVG paths/shapes; none are scans or traced textbook assets. Anatomy and mobile rendering require independent qualified sign-off. The existing gas-exchange, vessel, motor-unit and ecology figures were retained and were not recategorized as genuine observations.

Nine additional embedded comparison tables use the project's pre-existing `LearningVisual` structure in the lessons. They are sourced *conceptual comparisons*, not numerical experiments or new measured datasets.

## Authenticated external photomicrographs added to the existing microscopy activity

| Understanding | Specimen / observation use | Creator and licence | Exact asset and source | Scale evidence |
| --- | --- | --- | --- | --- |
| B3.1.8 | An unlabelled transverse section of an unidentified dicot leaf; student draws epidermis, mesophyll and central vascular region from visible tissue, without inferring unresolvable cell details | Jon Houseman (2014); Commons source credits Jon Houseman and Matthew Ford; **CC BY-SA 4.0**, with colour/brightness retouch disclosed | [Original-file description](https://commons.wikimedia.org/wiki/File:Dicot_leaf.jpg); [original image](https://upload.wikimedia.org/wikipedia/commons/7/7b/Dicot_leaf.jpg); [licence](https://creativecommons.org/licenses/by-sa/4.0/) | Visible black source scale bar stated as **0.2 mm** by creator; on-image scale remains subject to image render and calibration handling |
| B3.2.9 | Low-power transverse section of a dicot stem; student locates epidermis, cortex, ring of vascular bundles, xylem versus phloem orientation and central pith | Eugeenia Wen (2019); **CC BY 4.0** | [Original-file description](https://commons.wikimedia.org/wiki/File:Stem_of_Dicotyledon_C.S.png); [original image](https://upload.wikimedia.org/wikipedia/commons/7/7d/Stem_of_Dicotyledon_C.S.png); [licence](https://creativecommons.org/licenses/by/4.0/) | Source states **10× magnification** but does not supply a calibrated scale bar; **do not infer specimen distances from screen pixels or nominal magnification** |

Metadata and source-file links were independently looked up in Wikimedia Commons on 2026-10-18. Images are opened only on student request by the **existing** `AuthenticMicroscopy` component. Original images remain on Wikimedia hosting; no copies were reuploaded or hidden in source-code assets. Image creators, Commons source page, and licence terms are visible in the student activity; no endorsement is implied.

### Remaining authentic-evidence gaps

These two images improve observation literacy but do **not** substitute for learner-collected slides or measurements and do not close all observational criteria:

- B3.1.10 still requires independently calibrated real stomatal leaf casts, repeated stomatal counts and representative sampling (existing numerical table is constructed).
- B3.2.2 (artery/vein histology) and B3.2.10 (dicot root) still need checked authentic comparative photomicrographs with adequate annotation, specimen provenance and scale interpretations.
- B3.2.9's existing true micrograph is **qualitative only**; nominal optical magnification cannot create a verifiable length scale.
- B3.3.7 real goniometer data, B4.1.4 learner-collected transects, and B4.2.8 authenticated Hominidae skull observations remain outstanding.
- Human anatomy/figure review, Wikimedia hotlink loading in production, mobile width, contrast and keyboard checks remain unrun in a browser.

The guiding rule is to distinguish three evidence classes: **true sourced observations** (these two Commons files), **newly drawn explanatory schematics** (local SVGs), and **constructed calculation/data exercises** (explicitly marked hypothetical). Neither a sketch nor synthetic count should ever be described as collected microscopy evidence.
