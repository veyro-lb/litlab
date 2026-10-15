# Repeatable Biology draft-production specification — schema v1

This is a handoff contract for isolated **drafts**, not permission to edit the integration branch or publish. One primary integrator owns `feature/biology-foundation`. Other conversations return patches/content bundles against an identified commit; they do not push to that branch. No new topic is implemented by this specification itself.

## Inputs and immutable mapping

Require the user-supplied official first-assessment-2025 Biology Guide, roadmap, relevant current textbook pages, source-specific independent research and exact integration commit. Inspect current files before changing them. Read applicable AGENTS.md instructions. Curriculum scope and SL/HL come from `curriculum/registry.json`; do not create a second registry. Record supplied source fingerprints, printed/PDF pages and curriculum version `ib-biology-fa2025-v1`.

Every understanding has its immutable guide ID and an original `studentTitle` in the registry. Titles are descriptive teaching labels, not claimed verbatim official wording. The lesson does **not** duplicate these titles. A section maps to one or more understanding IDs exactly once across the topic; all required IDs must be covered. Level is shared unless mapped IDs include HL. Entirely HL topics must be blocked in SL. Preserve printed-code variants already retained in the registry.

## Author a content package

Use `learning/lesson-contract.ts`, `scripts/validate-lesson.mjs` and the Water JSON as structural examples. Do not copy Water’s scientific text as filler.

1. Create `learning/<slug>/lesson.json`, `schemaVersion:1`, unique lesson ID, topic ID, curriculum version, introduction, objectives, prerequisites, learning path and summary.
2. For every numbered understanding provide a concrete guiding question, original progressive explanation, terminology, mechanism, worked biological example, misconception/correction, concise aligned revision summary and claim-specific source IDs. One paragraph per claim record; `claimReferences` reconstructs the explanation exactly. Optional `teachingBlocks` break up complex mechanisms but must reconstruct the same explanation. No word-count-only acceptance.
3. Keep obligatory scope and enrichment distinct. Optional enrichment is labeled in both explanation and retrieval. Review uncertainty explicitly. Cross-topic links are contextual; do not invent completed lessons.
4. References need stable IDs, titles, optional HTTPS URL, exact locator, access date and shared/HL scope. Textbooks can be cited without public PDF links. Section textbook locators record both printed and PDF pages. Independently corroborate surprising claims; record disagreements rather than copying an authority’s error.
5. Assets go under `/biology/<slug>/`. Each needs stable ID, kind, original source/permission record, literal attribution, license/reuse basis, alt text, caption title, source IDs, level and review state. No textbook, IB, stock or OpenStax artwork is imported merely because a source is readable. Review current terms, derivative and commercial context, and third-party exceptions. Retain exact original file URL and file fingerprint. Photographs require source, original URL and terms URL. Original SVGs need scientific design notes and reviewer checklist. No generated scientific raster may be called verified without review.
6. Diagram labels must remain legible on mobile. Use original `mobileSrc` / `recallMobileSrc` when a desktop panel cannot shrink safely. Source-linked written equivalents, solid/dashed bond conventions, captions and full-size links remain available. No color-only meaning. Avoid drag-only activities. The optional data-driven explorer supports a small choice → explanatory-text interaction; genuinely different scientific interactions require a bounded reusable component and new accessibility tests.
7. Provide at least one explanatory selection check and retrieval activity per understanding; choose activity counts for the topic’s complexity. Reuse choice/retry, reveal-answer, written-draft/self-review, data-table and label-recall components. New interaction kinds must have schema, renderer and negative validation changes together.
8. Original question bank: each question identifies all relevant understanding IDs, primary explanation section, level, source IDs, format and provisional marks. MCQs have four plausible choices, exactly one defensible answer and explanation for **every** choice. Written tasks need model answer/marking points and no automatic mark. Tables require conditions, units and source or explicit illustrative status. Calibrate difficulty and command terms through an experienced teacher. Do not reproduce protected question banks.
9. Review state: `scientific-review` with reviewer null for source-checked drafts; preserve uncertainty and human gates. Named approval needs the reviewer’s real name, qualifications, date and evidence for the exact version. Approval data alone does not authorize release.

## Validation and integration handoff

Return a package containing JSON, proposed registry student titles (only the target topic), assets, claim/coverage ledger, provenance/rights records, question review table, human-review checklist and a patch based on the exact starting SHA. Include all remaining issues and failed checks. Do not edit shared renderer, routing, CI, main, authentication, backend or English storage from an independent content conversation.

Primary integrator:

1. Recheck remote HEAD and patch base; resolve differences without overwriting other work.
2. Add the exact lesson entry to `learning/catalog.json`, set its existing registry topic to draft and attach lesson ID. The catalog maps IDs to loadable files, not a duplicate curriculum. The Vite glob emits lazy lesson chunks. Planned topics remain unavailable until intentionally registered.
3. Run `validateLesson(content, registryTopic)` for every catalog entry. Check file existence, scoped assets and source records. Keep topic-specific semantic validators for hard scientific invariants; generic structure validation cannot certify accuracy.
4. Run `npm ci`, `npm run quality`, `npm run build`, production dependency audit, curriculum tests, generic contract/renderer tests and topic-specific positive/negative tests. Check bundle outputs: initial English and dashboard must not import all lesson bodies.
5. Run the established GitHub offline-container browser suite, with external interception and zero escaped requests. Keep all 30 English renders and synthetic progress invariance checks. Add catalog-driven section-count/title/scope assertions rather than copying a complete suite per topic. Topic-specific interactions still need specific tests.
6. Inspect actual desktop 1440, tablet 768, mobile 390 and narrow 320 screenshots; all numbered sections, figures, feedback, modes and source views. Test direct/refresh links, history, Previous/Next, targeted revision/practice, keyboard/touch, light/dark and reduced motion. Do not disable failing tests.
7. Hand off exact commit, changed files, green run, screenshots, open questions and independent qualified-review packet. Teacher/science/assessment and real student tests remain separate release gates.

## Release boundary

This specification authorizes no PR, merge, production deployment, cloud write, authentication change or student-progress migration. Before public release: qualified review of exact content/diagrams/questions, rights-owner clearance, accessibility/student observation, current branch protection and main-targeted Biology CI verification, and explicit owner release approval. Current draft memory is per tab, not durable progress or mastery.

## First batch recommendation

Start with **two topics**: B1.1 Carbohydrates and lipids (13 shared) and B1.2 Proteins (5 shared + 7 additional HL). Total: 25 understandings, versus 57 for the proposed four-topic batch. Their shared molecular vocabulary and structural visual conventions give a bounded test of reuse. Carbohydrate linkages, lipid structure, amino acids, peptide bonds and protein structure still need separately reviewed vector diagrams; Water graphics cannot substitute for them.

Next, assess A1.2 Nucleic acids (10 shared + 5 HL) and C1.1 Enzymes and metabolism (10 shared + 7 HL). C1.1 benefits from protein foundations and needs kinetic/energy graphs and careful distinction between models and data. A1.2 needs nucleotide, strand/orientation and structural representations. Do not initiate either batch automatically. Integrate one topic at a time even when source drafting occurs in a batch; run the full gate on the combined exact commit.
