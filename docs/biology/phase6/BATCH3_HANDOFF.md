# LitLab Biology — Batch 3 Implementation Handoff (conditional)

Prepared 16 October 2026 during Phase 6. **No future topic has been registered or implemented.**

## Recommended scope and decision

Implement **B2.1 Membranes and membrane transport** and **B2.2 Organelles and compartmentalization** together **only after the Phase 6 five-lesson baseline has an exact-HEAD green CI run and is marked GO for draft development**. The pair directly builds on the existing B1.1 phospholipids and B1.2 protein structure/function, uses common cellular diagrams and test components, and comprises 26 numbered understandings, rather than the 36 of C1.2/C1.3. A manageable two-topic batch is preferable to introducing a separate cellular energetics pipeline at the same time.

| Topic | Correct official ID range | Shared SL+HL | Additional HL | Official guide printed / PDF | Hodder 3rd ed. printed / PDF |
| --- | --- | ---: | ---: | --- | --- |
| B2.1 Membranes and membrane transport | B2.1.1–B2.1.17 | 10 | 7 | 52–54 / 58–60 | 223–243 / 235–255 |
| B2.2 Organelles and compartmentalization | B2.2.1–B2.2.9 | 3 | 6 | 54–55 / 60–61 | 244–255 / 256–267 |
| **Total** | **26 IDs** | **13** | **13** | | |

Alternative deferred pair: C1.2 Cell respiration (17 = 6 shared + 11 HL, Hodder pp. 405–424) and C1.3 Photosynthesis (19 = 8 shared + 11 HL, Hodder pp. 425–449). Together require 36 understandings, numerous linked electron/energy transport figures, redox terminology and deeper HL mechanism review. The existing C1.1 concepts provide prerequisites, but this is a larger, higher-risk single batch.

## Copy-pastable implementation instructions

> You are the sole next-batch development engineer for LitLab Biology. **Do not start until Phase 6's final SHA is explicitly verified against a successful GitHub Actions run.** Create a NEW, independently owned `feature/biology-batch3-cell-membranes-YYYYMMDD` branch from that exact green Phase 6 HEAD. Never modify, rebase or reset Phase 6, Phase 5, Phase 4, foundation, earlier branches, or `main`. No PR, merge, deployment, infrastructure setting, account migration or student-storage mutation.
>
> Implement only B2.1.1–B2.1.17 and B2.2.1–B2.2.9, preserving all existing five lessons and the canonical 40-topic/553-understanding curriculum registry. Maintain the existing React/TypeScript, isolated Shadow DOM, shared `LessonView` and numbered title authority in the registry. Package lessons in versioned per-topic JSON, add lazy-loader catalog entries **only when content passes validation**, and retain source-checked scientific drafts with `reviewer: null`. HL gating must apply to Learn, Revision, Practice, references and direct links. Verify correctly handling B2.2's small 3-understanding shared section and 6-understanding HL portion.
>
> Use the **official first-assessment-2025 IB Biology Guide** as the authority: B2.1 printed 52–54/PDF 58–60 and B2.2 printed 54–55/PDF 60–61. Use **Hodder Biology for the IB Diploma Third Edition**: B2.1 printed pp. 223–243/PDF 235–255; B2.2 pp. 244–255/PDF 256–267. Review independent NCBI, university, peer-reviewed and RCSB scientific references for diagrams/mechanisms and record exact source locators; **do not reproduce copyrighted publisher illustrations or assessment questions**. Normalize the guide's anomalously punctuated `B.2.1.9` to existing syllabus ID `B2.1.9`.
>
> For each of 26 understandings author a concise student-guiding question, concept → causal mechanism → consequence explanation, accurately scoped SL/HL material, section-numbered headings, original labelled and recall diagrams (when scientifically valuable), misconception corrections, a unique meaningful concept check with causal feedback, active recall, transferable application and revision summary. Provide original MCQs and appropriate written/data-response questions with human-review-only marking guidance; never fabricate official marks or learner mastery. Include quantitative modelling only with correct axes/units, assumptions, source/provenance, calculations and table equivalents.
>
> Audit original asset pairs and diagrams for **phospholipid amphipathic molecular orientation, bilayer fluidity, cholesterol/glyco surface orientation, channel and carrier selectivity, facilitated diffusion, osmosis and aquaporin pathways, ATP hydrolysis-coupled pumps, sodium–glucose cotransport, diffusion against/with gradients, bulk endocytosis and exocytosis where required**, organelle membrane number and morphology, nuclear envelope/pore, mitochondrial cristae, thylakoid/stroma distinctions, rough ER versus free ribosomes, Golgi trafficking, vesicle coat topology, and compartment functions. Make all diagrams original, clearly captioned, accessible and explicitly schematic where not atomically resolved. Add predictive mechanism activities only if they improve understanding and cannot be represented well with existing generic components.
>
> Run `npm ci`, TypeScript/build, site quality, complete curriculum and all seven lesson validators, negative scientific/editorial and figure tests, asset provenance, lazy routing/deep-link scopes, Learn/Revision/Practice interactions, keyboard/figure/dialog focus, opt-in RCSB fallback where still relevant, English route and six progress-state isolation checks. Use the existing offline Chromium harness with `--network none`, verify no external request escapes interception, run 320/390/768/1440 light/dark and genuine touch/reduced-motion/zoom tests. Capture **actual integrated seven-lesson app screenshots**, including multiple difficult cellular diagrams and both SL/HL. Run production-only and full-tree dependency audits separately. Do not disable failed assertions to get CI green. Report the exact branch/commit and successful exact-head Actions run plus outstanding human scientific/diagram/editorial/rights/accessibility/student review gates.
>
> **Stop after these two topics.** Do not register or implement C1.2 or C1.3 as part of Batch 3.

## Risk and acceptance checklist

- Every official ID has exactly one correct registry heading and a matching lesson section, all 26 assigned to the correct SL/HL level.
- Every scientific image's connectivity, labels, scale disclaimer, orientation and rights have been checked **visually** as well as by automated SVG validation.
- An undergraduate-level transport mechanism explanation can be followed stepwise without rote reliance on an external video; no inappropriate university-level details are imposed on SL.
- English, authentication and existing progress/storage contract are unchanged.
- CI is green at the exact final implementation SHA, with audited browser evidence, while every lesson remains a **draft** pending qualified publication reviews.
