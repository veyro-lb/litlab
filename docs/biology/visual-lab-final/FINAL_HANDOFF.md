# BioLab Final Scientific Visual Laboratory — integration handoff
**Date:** 2026-10-18
**Repository:** https://github.com/veyro-lb/litlab
**Base:** `feature/biolab-ib-final-base-20261018` @ `73f6278c6f8d941f2eeb68b836459efe78572a0b`
**Only output branch:** `feature/biolab-ib-visual-lab-final-20261018`
**Final SHA:** resolve branch HEAD (this document is included in the final commit).
**Deployment, merge into main, shared lesson/navigation edits:** NONE.

## Verified specialist branch histories
- Scientific visual artwork source `9bd8a38672b1a5bf610d9b224c7363131ab255ed`. Final commit has GitHub Actions success run **39073731102** (upstream only; captured genuine screenshots at widths 320/390/768/1024/1440/1920, some dark/modal/recall scenarios), artifact **12116057853**. The artwork branch's five subjects each include labelled/recall and mobile variants. Its prior 159 KEEP classifications are **provisional**, not individual scientific approvals.
- Authentic microscopy source `6c5ed5adb835f4f1c76c97816d6e26b738c694f7`; accepted source views **four** from **two biological specimens**, not seven independent samples.
- Independent visual QA source `244ea03b2c511e240a676da8a02b3d541f437b72`; **11** issues: **1 high / 8 medium / 2 low**. Source review was not complete browser or expert sign-off.
- Drawing Practice source `eb11dfdea1135950a3555dafa73688e141a58021`: **1 working A1.1.2 water exercise; 16 blocked candidate activities**. Upstream Chromium run 39073973417 success at older drawing commit `d13825d65d437aa289121654fcf4c4b233d3456b`, not this output branch.
- The specified base already contains `D3.1.4`, `D3.1.9`, and `A2.2.8` figure JSON references but lacks the corresponding final artwork file set. The interactive drawing frontend is not present on the specified base; this work does not independently integrate it.

## Actual assets delivered
- **20 byte-identical original specialist scientific SVGs:** five subjects × labelled/recall/mobile/mobile-recall, including a **corrected existing flower** file. Includes male reproductive system, female frontal, female sagittal, insect-pollinated flower, palisade plant cell. No duplicate redraw of those already corrected.
- **6 original-source microscopy files:** three TIFFs and three grayscale PNGs of a **single HT29 field** (DNA/DAPI, phospho-histone H3, cell body). Source blobs remain unchanged; accepted view count is **three**, not three independent biological specimens. Existing cucumber TEM WebP stays unchanged and is **not duplicated**.
- **4 independently generated original circulatory SVGs** (desktop labelled, desktop recall, mobile labelled, mobile recall) with explicit `data-from`, `data-to`, `marker-end`; fish heart → gill capillaries → systemic capillaries → heart; mammal right heart → lungs → left heart → systemic capillaries → right heart. This directly repairs high severity **IVQA-001** source topology. The original generator and deterministic source tests are in `scripts/biology/visual-lab-final/`.
- **2 surgically corrected original DNA pairing SVGs** (`paired.svg`, `paired-recall.svg`), depicting two A–T and three G–C bonding contacts, addressing **IVQA-008**. Unrelated nucleic-acid artwork and reviews preserved.

## Scientific and copyright policy
The syllabus-first crosswalk uses **IB Biology Guide, first assessment 2025**; current reproduction topic is **D3.1**, not D3.2, despite the teaching handout's old drawing headings. **Hodder Third Edition** is supporting biological context; neither its images nor the IB guide or watermarked drawing handout were copied.

**HT29:** CellProfiler `ExampleHuman` image CC0 expressly recorded in its README, with provider Jason Moffat, owner evidence described in rights handoff, and published source Moffat et al. (2006). No micron-per-pixel scale and no artificial fluorescence colours. **Cucumber:** Vigani et al., *PLOS ONE* (2015) Fig. 3 under CC BY 4.0; each of the six panels has its own 500 nm bar. All external scientific media must carry visible attribution, licence link, modality and sample limitations. See `RIGHTS_AND_PROVENANCE.md`.

No unsupported quantitative charts, empirical measurements, specimen images, cloned text illustrations, certification or IB endorsement were invented.

## Deliverables and exact file contracts
- `PLACEMENT_AND_ACTIVATION.json`: immutable Git blob SHAs and source branches, nine figure bundles, exact understanding placements, existing lesson wiring, review gates and the unchanged 16 drawing blockers.
- `DRAWING_ANSWER_MAPS.json`: six source-mapped, feature/function-specific answer maps for highest-priority activities and circulation recall. They are **not enabled exercises** and cannot be treated as independently marked IB rubrics.
- `QA_ISSUE_TRIAGE.json`: all **11** original independent findings, corrected/mitigated/open states and remaining specific actions.
- `MISSING_IMAGE_LEDGER.json`: **8** unmet evidence-driven microscopy or data-visual requirements; unverified external images not imported.
- `RIGHTS_AND_PROVENANCE.md`: author, source, reuse licence and measurement limitations, original artwork protection.
- `INTEGRATION_PATCHES.md`: exact IDs and narrowly scoped changes for the main integration engineer; no editing other teams' lesson JSON here.
- `TEST_EVIDENCE.json`: true source-only checks and inherited upstream CI vs explicitly **not-run** current-branch QA.

## Executed tests versus unavailable tests
**Executed with GitHub connected-source checks:** six modified original SVGs have declared SVG root/viewBox, no embedded script-like tokens; four circulation variants each show **3 fish arrows + 4 mammalian arrows** with no fish gill→heart bypass; two DNA SVGs each contain **2 A–T pairs, 2 G–C pairs, 10 contact strokes total**. All 20 artwork imports and six HT29 files share exact source Git blob SHA values. This is **source verification**, not human biological review. The named `node --test` test script is committed but **not executed on this output branch**.

**Not executed here:** live checkout `npm ci`, `npm run quality`, full `npm run build`, original-image XML parser, and Chromium screenshots for the newly generated circulation / revised paired-DNA assets at 320, 390, 768, 1024, 1440, 1920 px; independent biological and legal sign-off. The local runtime could not clone GitHub due to DNS restrictions; the new branch has no GitHub Actions run. Upstream 39073731102 evidence is real, but it is **not** a test pass for this new branch's circulation paths.

## Remaining release blockers
1. A qualified biologist must verify fish/mammal flow topology, revised base-pair depiction and every imported anatomical/plant figure. Document reviewer, timestamp, exact SHA and outstanding exceptions before changing review status.
2. Independently review source issue IVQA-005 heart valve/topology naming, IVQA-006 stem/root leaders, IVQA-007 leaf tissue leader/readability, IVQA-009 peptide chemistry reactant depiction, and IVQA-010 production footer only after approval. Inspect all other 164/230 referenced figure/visual entries separately; their presence is not review.
3. Run committed node tests and applicable old BioLab QA, quality, build. Collect **current-branch genuine browser screenshots** for new and imported art in six widths, light/dark, labelled/recall, modal and keyboard/zoom. Repair overflow or unreadable text.
4. Integrate approved media into appropriate lesson UI only after editorial owner applies the narrowly scoped patches. HT29 source photos are **not wired** by this branch; no scale measurements. Keep Drawing Practice candidate guards blocked until sign-off, and integrate its frontend separately from the specialist branch.
5. Obtain project-owner commercial artwork-rights clearance, external image attribution acceptance and specialist sign-off. **No merge, public deployment or invented certification** until all gates pass.

**Disposition:** substantive source-corrected scientific visuals and rights-backed authentic microscopy are committed on the isolated branch, with transparent scientific/publication gates. The entire 2025 Biology course is **not** visually certified or production approved.
