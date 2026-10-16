# LitLab Biology Phase 8 — content integration handoff

**Branch:** `feature/biology-phase8-batch4-content-20261016`. Started from verified Phase 5 commit `60a15690af6014517edc3482dbc83cdea93726d2`. The referenced [green CI run](https://github.com/veyro-lb/litlab/actions/runs/38869145898) concluded success. No PR, merge or deployment is authorized or performed.

## File-level transfer manifest

- `src/biology/learning/cell-structure/lesson.json` — A2.2, 14 ordered sections (11 shared and 3 HL); 14 four-choice MCQs and 7 written questions.
- `src/biology/learning/cell-specialization/lesson.json` — B2.3, 10 ordered sections (6 shared and 4 HL); 10 four-choice MCQs and 7 written questions.
- `public/biology/cell-structure/` — 9 original labelled diagrams plus 9 recall variants.
- `public/biology/cell-specialization/` — 10 original labelled diagrams plus 10 recall variants.
- `scripts/biology/phase8/validate.mjs` and `negative.test.mjs` — independent tests. Run from repository root with `node scripts/biology/phase8/validate.mjs` then `node scripts/biology/phase8/negative.test.mjs`.
- `docs/biology/phase8/` — this handoff, syllabus/claim ledger, provenance register and QA status.

**No** changes to curriculum registry, lesson catalog, shared renderer, authentication, styles, Supabase, progress tracking, English or other topic packages. Do not cherry-pick an entire branch over Phase 6 or Phase 7 without reviewing the diff; explicitly transfer only the Phase 8 file list.

## Exact proposed registry/catalog integration (DO NOT APPLY AUTOMATICALLY)

After approving scientific/image blockers and only on an integrator-owned branch:

```json
{ "a2-2-cell-structure-v1": {"topicId":"A2.2","path":"./cell-structure/lesson.json"},
  "b2-3-cell-specialization-v1": {"topicId":"B2.3","path":"./cell-specialization/lesson.json"} }
```

For the existing A2.2 and B2.3 entries in `src/biology/curriculum/registry.json`, propose `availability: "draft"`, `lessonId` matching the above names, and `review: "source-mapped"`. Do not use `approved` without a named qualified reviewer. Transfer each original proposed `studentTitle` from `coverage-ledger.md` after ensuring the IDs and guide page metadata exactly match the official registry. Keep `skillsReference` and `nosReference` as specified by the guide.

## Compatibility evidence

- Phase 5 lesson contract uses schemaVersion 1, `Section`, `Question`, `Asset`, `Reference`, `Lesson`, and review enum (`draft`, `source-mapped`, `scientific-review`, `approved`).
- The Phase 6 hardening branch was inspected read-only at `9134a34160a812cfebeeddd50ec805a75d972239`; its lesson contract is identical to Phase 5 at the time checked. No shared contract adaptation currently needed.
- Phase 7 branch was inspected read-only at `b28015f5e61c915081efece3a2dae43a504a4f7c`. Its B2.1/B2.2 subject files were not altered.
- `lesson-loader.ts` imports lazily via `import.meta.glob('./*/lesson.json')`; final activation requires catalog entry and matching registry only after explicit integration approval.
- Shared `ScientificFigure` renders labelled/recall SVGs from `Asset.src/recallSrc`; shared `LessonView` renders explanations, checks, recalls, figures, basic explorer, table and challenge fields without modifying shared code.

## Tests and evidence

- GitHub-connected structural read-back: 24 unique ordered sections (17 shared, 7 HL); 24 original MCQs with 4 choices and exactly one correct; 14 structured responses; all 38 referenced SVG paths exist; zero observed inconsistencies in those read-back checks.
- Committed Node positive/negative tests: source mappings, level/page mappings, section completeness, asset provenance/paths, question feedback, scope and mathematical tables. **The Node test scripts are committed but have not been executed locally or by new GitHub Actions during this session.** Run them in a checked-out Phase 8 or integration branch and attach CI evidence.
- Scientific arithmetic independently checked during content production and in a separate read-back review; derived cube formulas and microscopy conversions are in coverage-ledger.md.
- No app preview screenshots were captured because lessons are intentionally absent from registry/catalog; faking availability to capture screenshots is prohibited.

## Blocking reviews and exact next steps

1. Obtain legitimate licensed authentic light and electron micrographs plus complete per-image provenance to satisfy A2.2.10 and A2.2.11. Source evidence and actual observable structures must be verified by a microscopy educator.
2. Perform named human scientific/curriculum review on all 24 sections, each distractor and structured marking point, and every diagram; record qualifications and dates. Verify assumptions in numeric models.
3. Render and visually inspect 38 SVGs at 320 px and desktop widths, check label clipping/contrast/voice and keyboard access, and capture evidence. The drawings are conceptual, not proportional microscopy plates.
4. On the designated integrator-owned branch: adapt to the then-current Phase 6 contract, run standalone phase8 Node validations and negative tests, add approved assets, register each topic one at a time and run full app test/typecheck/build/visual regression.
5. Review IB and publisher usage rights before public release and obtain any necessary formal licensing; mere textbook ownership is not reproduction permission.

## Gate decisions

- **Content-package transfer: CONDITIONAL GO** for integrating *unpublished development drafts* with the above issues tracked; not a claim of complete micrograph coverage or science sign-off.
- **Public publication: NO-GO** pending authentic microscopy assets, exact image permissions, qualified scientific and curriculum review, executable CI, browser preview and accessibility sign-off.

Both topics remain `planned` in the authoritative registry; this is intentional until a separately authorized integration step.
