# BioLab recovery and release, 21 October 2026

The former execution workspace stopped responding and was subsequently replaced. Its unpublished local commits, ending at `6845feb`, were not present in the replacement workspace or GitHub. This pass reconstructs the pending changes from the conversation's recorded PDF rectangles, the supplied source files, and the verified remote baseline `99466ec76b194d0727c677b9ae813d64d2b5f6a2` on `feature/biolab-textbook-figure-expansion`. It does not claim recovery of the original commit objects.

The user explicitly authorized publication of the edited code and credited textbook crops to public repository `veyro-lb/litlab`, and deployment to the existing Cloudflare site `https://litlab.jamesloom18.workers.dev`. This supersedes the earlier no-publication/no-deployment state. Preserve main's history and perform no force pushes.

## Reconstructed changes

- 56 original 300-DPI Hodder crops, with exact source-page rectangles, figure numbers, printed/PDF page references, original captions, SHA-256 identities, visible source credits and 62 inline placements. All 45 earlier original crops and provenance records remain intact: 101 originals and 122 placements across 31 topics.
- 46 recreated registrations replaced, plus redundant collision and root-pressure flow schematics removed from lesson registrations. Historical SVG fixtures remain for regression tests. Accurate practice models, numeric charts and comparison tables are retained.
- The 28 enzyme/homeostasis readings have two distinct explanatory passages instead of repeated paragraphs. Required syllabus IDs, levels, examples, assessments, data tables and application skills remain. The invented activation-energy calculation is distinguished from the original textbook graph. Unnecessary kinetic and clinical detail was reduced.
- The LitLab/BioLab switcher shares one style with matching dimensions, 44-pixel minimum touch targets, typography, icon spacing, hover behaviour and selected-state treatment. Removed the separate oversized green BioLab CTA registration from the switcher. Functional accessible names and navigation links are retained.
- Unique release fingerprint `biolab-textbook-navigation-2026-10-21` replaces the stale production marker so an older release cannot satisfy the production verification check.

The extraction plan and script are in `scripts/biology/coursewide-recheck/`. The source PDFs are not copied into the repository or public build. Prior permission statements are preserved. A2.1.9 labels phospholipids, so its protocell model belongs with cellular compartmentalization in A2.1.3, not as a fatty-acid vesicle illustration for A2.1.5. C2.1.10 and B3.3.6 remain rejected because of the previously recorded caption/label and cross-bridge-mechanism concerns.

## Verification

- Production build and site quality pass.
- All 40 lesson packages and 553 mappings pass the generic source, scope and content contracts (337 shared; 216 additional HL). This is technical mapping verification.
- All 101 crop hashes and 122 source placements pass, with all 45 baseline provenance records deeply identical.
- The 56 new PNGs match fresh rendering of their original PDF rectangles pixel for pixel; see `SOURCE_PIXEL_VERIFICATION.json`.
- All 199 registered assets and 251 local files/variants parse or decode; zero missing/broken local image files. See `CURRENT_ASSET_AUDIT.json`.
- All 145 targeted tests pass, including server rendering of the 40 lessons, content/scope contracts and scientific regression checks.
- The public build privacy gate passes, with no source PDFs or private extraction files.
- Responsive checks are prepared in the branch workflow: all 553 readings at 320/1440 pixels; all original crops; new crops at 1440/834/390/320 in both themes; switcher/navigation at four widths in both themes; feedback writes mocked. Record successful CI and live-release evidence before claiming deployment.

## Academic-review boundary

This pass restores the recorded targeted source review and editorial corrections. It is not a new sentence-by-sentence scientific review of every understanding, does not claim every relevant book figure has been integrated, and does not invent qualified scientific approval. The complete course-wide source/depth review remains incomplete. Ninety-eight registered assets are other images or models, many of which are useful and should not be removed indiscriminately.
