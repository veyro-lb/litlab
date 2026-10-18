# BioLab authentic microscopy — FINAL HANDOFF

**Date:** 18 October 2026  
**Target branch:** `feature/biolab-authentic-microscopy-20261018`  
**Base HEAD verified before branching:** `73f6278c6f8d941f2eeb68b836459efe78572a0b`  
**Status:** source-backed assets and original exercise instructions **only**; no lesson, renderer, UI, or deployment changes.

## Delivered

- **Four accepted microscopy views spanning two biological specimens:** three distinct fluorescence channels of one human HT29 microscope field and one six-panel cucumber leaf TEM plate. This is **not** seven independent biological samples. All four image views are browser-readable PNG/WebP; the three original HT29 TIFF channel files are also preserved unmodified.
- **Actual images:** `public/biology/authentic-microscopy/` (three source TIFFs, three pixel-preserving grayscale PNGs, and an identical pre-existing licensed cucumber TEM WebP placed in the isolated asset directory).
- **Integration contract:** `docs/biology/authentic-microscopy/manifest.json`, **exercises:** `docs/biology/authentic-microscopy/EXERCISES.md`, **source rights and status:** `docs/biology/authentic-microscopy/SOURCE_AND_RIGHTS.md`, **unacquired candidates:** `docs/biology/authentic-microscopy/RESEARCH_LEDGER.json`, **technical results:** `docs/biology/authentic-microscopy/TECHNICAL_CHECKS.json`.
- **Optional local test:** `python3 scripts/biology/authentic-microscopy/validate_assets.py` from the repository root (standard library; run after checkout).

## Scientific source mapping

Official first-assessment-2025 IB Biology Guide: **A2.2.2** microscope skills, **A2.2.10** identification in authentic light/electron micrographs and **A2.2.11** drawing and annotation from electron micrographs. The cucumber view also adds evidence to B2.2 organelle compartmentalization. The supplied Hodder Third Edition supports the same methods, image limitations and observation skills. Supplied **IB Biology Drawings.pdf** is guidance on drawing conventions, **not a source of real micrographs**.

**HT29:** The CellProfiler `ExampleHuman` README cites Jason Moffat and links Moffat et al. (2006). The accompanying pipeline maps `d0` to DNA/DAPI, `d1` to PH3 (phosphorylated-histone-H3 immunostain) and `d2` to `cellbody` (specific stain not identified). CellProfiler's own examples page describes its human-cell dataset as HT29. The rights discussion identifies **David Root** as copyright holder, and the follow-up README commit adds an explicit **CC0** grant. Do **not** infer a micron-per-pixel scale from the pipeline's generic relative spacing.

**Cucumber:** Previously verified BioLab Phase 9 asset was copied by identical Git blob reference. Vigani et al. (2015), PLOS ONE Fig. 3, publish six panels of `Cucumis sativus` leaf-mesophyll TEM under **CC BY 4.0**, each with an original 500 nm bar. The plate is not a general-purpose TEM atlas; its panels are different treatments/magnifications.

## Actual technical verification

For each source TIFF: original Git blob SHA matched the destination SHA exactly. TIFF headers and image strips were decoded; pixel count was 512×512, grayscale 8-bit, with correct PackBits/uncompressed image reconstruction. Every corresponding PNG was constructed directly from the decoded 8-bit pixel array, with no crop, recolouring or scaling. Blob identities, sizes, compression types and pixel-value extrema are recorded in `TECHNICAL_CHECKS.json`. The cucumber WebP blob matches the previous validated asset exactly; prior pixel identity and original image checks are preserved in `docs/biology/phase9/MICROSCOPY_PROVENANCE.json`.

**Still not proven:** production-browser appearance, a complete independent re-run of the Python validator on a downloaded new-branch checkout, full CI for the site, external specialist review and finished lesson integration. Nothing in this handoff claims those were performed.

## Missing / rejected coverage

The priority topics **B3.1**, **B3.2**, **B3.3**, **B4.1** and **B4.2** have **no newly ingested accepted specimen views**. A2.2 prokaryotes and a broad animal TEM atlas are also missing. `RESEARCH_LEDGER.json` records actual image candidates, their original attribution/licence claims, known limits and why they were **not copied or certified**. No reuse permission is claimed for textbook/IB figure reproductions; those remain excluded. Several candidates have clear public-domain/CC licences but were deferred because the original files could not be acquired, inspected and calibrated within this pass—not because permission was denied. No definitive permission denial was found.

## Safe integration procedure

1. Add a separate opt-in lesson reference to a single `manifest.json` asset ID only after a qualified subject reviewer checks the image, target visibility and licensing language. Keep this stage strictly read-only with respect to existing lessons.
2. Show the source attribution **with each rendered image** (CC0 images still receive scholarly credit); show modality, sample identity, stain/false-colour conditions and relevant limits. Link to the original scientific record.
3. For the three HT29 PNGs, present all channels as aligned but separate grayscale measurements. Do not imply a natural colour or that PH3 alone proves a unique mitotic stage. Physical length measurements remain disabled.
4. For the cucumber plate, retain its six-panel labels, original scale bars, CC BY 4.0 author/DOI credit and separate per-panel measurements. No re-cropping or generated artificial scale bars.
5. Before releasing any other candidate, obtain original bytes, verify species/section/preparation/modality, permission evidence, visible structures and scale, then add a checksum and a genuine observation exercise. If any field fails, keep it research-only.
6. Run the optional validator after checkout; then run repository-specific existing Biology checks and visual QA on desktop/mobile in a **future integration branch**. Do not merge/deploy on this branch.

## Sign-off

Scientific observer / IB examiner: **not assigned**. Copyright counsel: **not assigned**. Product integration / lesson QA: **not performed**. This is usable image evidence with deliberately limited coverage, not a completed Biology content sprint or institutional endorsement.
