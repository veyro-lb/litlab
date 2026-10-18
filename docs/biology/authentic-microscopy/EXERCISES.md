# Original student observation exercises (not wired into lessons)

## EX-HT29-CHANNELS — A2.2.2 / A2.2.10 (SL/HL)

**Specimen:** human HT29 cell line, three registered image channels from one field. **Modality:** fluorescence light microscopy, displayed as unaltered single-channel grayscale intensity images. The three images are not three specimens.

**Provide all three PNGs together.** DAPI DNA: `cellprofiler-ht29-dapi-dna.png`; PH3: `cellprofiler-ht29-phospho-h3.png`; cellbody: `cellprofiler-ht29-cellbody.png`.

**Prompts:** (1) In the DAPI channel, point to at least two areas of concentrated fluorescence; what labelled target most directly accounts for this signal? (2) Compare the same spatial positions in the DAPI and cell-body channels. Why is it unsafe to call every diffuse bright area a nucleus? (3) The PH3 channel uses an antibody to phosphorylated histone H3. Compare the locations of its most prominent signals with DAPI regions, and propose a *limited* interpretation about cells showing a mitotic marker. (4) List two organelles that you cannot responsibly identify from these particular fluorescence channels. (5) Explain why you must not calculate a nuclear diameter in micrometres from these 512 px images without a calibration.

**Answer guidance:** DAPI binds nuclear DNA, so DAPI-positive regions are consistent with nuclei or chromatin; fluorescence shows labelled molecules, not a direct boundary image. The cell-body channel supports coarse location of cell-associated signal, but its precise staining target is not supplied; do not equate its brightest contour with an independently verified plasma membrane. PH3 immunosignal is associated with phosphorylated histone H3 and mitosis; a bright spot is not on its own sufficient for a specific mitotic stage or a quantitative conclusion without controls and segmentation. Neither mitochondria, Golgi stacks, ER membranes nor molecular-scale histones are resolved. Although pixel count and relative pixel distances are allowed, the pipeline's `Relative pixel spacing 1.0` is **not** a verified physical pixel calibration. No absolute size calculation is permitted.

**Evidence/limits:** The source CellProfiler pipeline maps filename suffixes `d0`→DNA/DAPI, `d1`→PH3 and `d2`→cellbody. No unspecified cell membrane dye, imaging wavelength, numerical magnification, stain colour, or physical scale has been assumed. A diagram student draws from this light microscopy field must not include invisible TEM organelles.

## EX-CUCUMBER-TEM — A2.2.10 / A2.2.11 and B2.2

**Specimen:** cucumber (`Cucumis sativus` cv. Marketer) leaf mesophyll; TEM Figure 3 contains controls (A–C) and Fe-deficient material (D–F). This is a six-panel scientific plate already source-checked in BioLab Phase 9.

**Prompts:** (1) Choose one suitable panel. Identify an organelle containing parallel/stacked internal membrane profiles and justify calling it a chloroplast. (2) In a panel where a mitochondrion and inner-membrane infoldings are visible, distinguish the organelle outline from cristae. (3) Record the **scale bar from the SAME panel**, measure both the chosen organelle profile and its bar on the same rendered copy, and calculate the estimated organelle length in micrometres. (4) Draw a simple two-dimensional biological observation with accurate proportions and labels for only the structures that actually appear. (5) Explain two ways fixation, staining, thin sectioning or a particular section plane can limit anatomical interpretation.

**Answer guidance:** Chloroplasts can be supported by stacks of thylakoid membranes inside larger plastid profiles, where visible; mitochondrial profiles show characteristic cristae within an enclosing membrane system. The figure's source caption states **500 nm per panel bar**, or **0.5 µm**. Estimated feature length = (feature length in pixels / bar length in pixels from that SAME panel) × 0.5 µm. The absolute answer depends on the student's chosen structure and measurements: **do not prefill a fictional number**. TEM is a thin section, not the whole 3D organelle; fixation/staining produce contrast and potential artefacts. Never label an unobserved organelle simply because it is normally present in a plant cell.

**Limits:** Do not use one panel's scale bar for another panel. The six panels are from different treatments and magnifications. Be clear when relating image observation to theoretical transport or respiration.

## Deferred observation activities

B3.1: identify guard cells, stomatal aperture, epidermal cells and transverse-leaf tissues only after a separately verified specimen is ingested.

B3.2: compare stem versus root xylem/phloem topology only after image identity, section plane and staining have been checked. Do not mistake secondary woody Tilia tissues for an ordinary young primary stem bundle.

B3.3 (HL): sarcomere Z-lines, I and A bands require a verified muscle TEM with **per-image** scale checks. No exercise is accepted yet.

B4.1–B4.2: use authentic ecological observations for a specific identification, evidence or niche-investigation question; generic habitat photos are not counted as syllabus coverage.
