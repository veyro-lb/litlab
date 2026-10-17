# Theme B — five portable Biology development lessons

**Development branch:** `feature/biolab-complete-theme-b-20261017`  
**Foundation:** `0dbe2a0719f24c1ac86297248114c412429ecdc0` (the exact commit supplied by the owner; passed the pre-existing foundation workflow).  
**Source status:** All five numbered topics authored and pushed; none approved or deployed. Qualified professional scientific, figure, assessment, rights and student review remain pending.

## Authored packages and five ordered checkpoints

| Topic | Shared SL+HL | HL only | Questions | SVGs | Topic checkpoint |
|---|---:|---:|---:|---:|---|
| B3.1 | 10 | 3 | 16 (13 MCQ + 3 written) | 3 | `c4982420c230644be14f23b03cb10d9e7744e7d2` |
| B3.2 | 10 | 8 | 21 (18 MCQ + 3 written) | 3 | `d5450b351f0328ace51677571015a6580812eb96` |
| B3.3 | 0 | 10 | 12 (10 MCQ + 2 written) | 2 | `3b9ad7daf5fd9349a84c641dd7d5d1f6a6e7c759` |
| B4.1 | 8 | 0 | 9 (8 MCQ + 1 written) | 2 | `82335c5ce384e17c4bf78206b42d6232e0eb2fef` |
| B4.2 | 13 | 0 | 14 (13 MCQ + 1 written) | 2 | `7fc4a989ff71f5097c653a365441f0af4feb5ad1` |
| **Total** | **41** | **21** | **72** | **12** | — |

## File-level imports

**B3.1:** `src/biology/learning/gas-exchange/lesson.json`, `docs/biology/theme-b/B3.1-manifest.json`, `docs/biology/theme-b/B3.1-FIGURES.md`, `scripts/biology/theme-b/validate-b31.mjs`, and assets below `public/biology/gas-exchange/`.

**B3.2:** `src/biology/learning/transport/lesson.json`, `docs/biology/theme-b/B3.2-manifest.json`, `docs/biology/theme-b/B3.2-FIGURES.md`, `scripts/biology/theme-b/validate-b32.mjs`, and assets below `public/biology/transport/`.

**B3.3:** `src/biology/learning/muscle-motility/lesson.json`, `docs/biology/theme-b/B3.3-manifest.json`, `docs/biology/theme-b/B3.3-FIGURES.md`, `scripts/biology/theme-b/validate-b33.mjs`, and assets below `public/biology/muscle-motility/`.

**B4.1:** `src/biology/learning/adaptation-environment/lesson.json`, `docs/biology/theme-b/B4.1-manifest.json`, `docs/biology/theme-b/B4.1-FIGURES.md`, `scripts/biology/theme-b/validate-b41.mjs`, and assets below `public/biology/adaptation-environment/`.

**B4.2:** `src/biology/learning/ecological-niches/lesson.json`, `docs/biology/theme-b/B4.2-manifest.json`, `docs/biology/theme-b/B4.2-FIGURES.md`, `scripts/biology/theme-b/validate-b42.mjs`, and assets below `public/biology/ecological-niches/`.

Shared handoff: `docs/biology/theme-b/INTEGRATION_HANDOFF.md`, `SOURCE_LEDGER.json`, `QA_EVIDENCE.json`, `scripts/biology/theme-b/validate-all.mjs`.

## Compatibility and release boundaries

- All original explanations are visible via existing `ReadingUnderstanding` teaching blocks; main paragraphs do **not** depend on disclosure panels. Tests use the frozen `lesson-contract.ts`. Visuals use existing `assets`, `figurePlacements` and `graphTables`; no new renderer primitives were introduced.
- Planned topics have no `lessonId` or `studentTitle` in the live registry. The five topic manifests contain proposed *original* descriptive titles. **Only the integration engineer** may update `src/biology/curriculum/registry.json` and `src/biology/learning/catalog.json` after checking the exact integration base and achieving green full application tests. Do not register unfinished or still-withheld skills as approved.
- All figures are original authored schematics with explicit permission evidence; no IB/Hodder textbook figures are included. Illustrative physiological, stomatal and ecology data are plainly labeled modelled/synthetic, never field measurements.
- The exact shared generic `validateLesson` was executed against each remote lesson with an ephemeral registry projection (no live registry edits). All returned zero errors. Mutations of duplicate coverage, multiple correct answers and wrong scope were rejected for each of five topics (15 negative rejections). Remote figure SVG markup was checked for balanced elements, title, description and viewbox.
- The committed Node-compatible standalone scripts are provided, but **native Node execution, npm CI/build, actual browser figure rendering, mobile keyboard QA and human expert review have NOT been completed on this isolated branch**. GitHub Actions has no current run for the new content branch.
- Original figure evidence is available in each `-FIGURES.md`. There is no trustworthy claim of screenshots: browser capture was blocked by the optional external browser service's lack of credits. A qualified reviewer should inspect all 12 rendered figures before integration.

## Specific scientific/pedagogical blockers

1. **B3.1.8/B3.1.10:** Authentic calibrated dicot-leaf sections/micrographs and counted stomatal leaf casts, including observed field area, repeats and uncertainty. The existing schematic and numerical examples are instruction, not real microscopy or field evidence.
2. **B3.2.2/B3.2.9/B3.2.10:** Rights-cleared actual vessel/stem/root microscopy; **B3.2.15** needs a labelled frontal-plane mammalian heart drawing and a tested flow tracer. **B3.2.6** needs a properly cited epidemiological dataset (current table is synthetic). **B3.2.11** requires a subject expert to reconcile simplified IB capillary venous reabsorption with revised Starling/lymphatic physiology.
3. **B3.3.2/B3.3.4:** Qualified review of original sarcomere and motor-unit diagrams; **B3.3.7:** real goniometer/calibrated-image data and protocol.
4. **B4.1.4:** Actual student-collected transects from a natural/semi-natural habitat; **B4.1.6:** climate-biome diagram scientifically checked for broad non-exclusive region boundaries and axes.
5. **B4.2.8:** Genuine source-identified rights-cleared Hominidae skull collections or models for comparative dentition observation. **B4.2.12:** niche-width SVG is an explanatory model, not recorded competition data.

## Integration checklist

Run `node scripts/biology/theme-b/validate-all.mjs` and existing lesson/curriculum/negative validators from a clean checkout. Review SVG rendering on 320, 390, 768 and 1440 px; keyboard, labels, screen reader captions, contrast, dark mode and 200% zoom. Audit every answer key and physiological unit; verify each local Hodder page locator against the specific claim. Resolve the above observation gaps with authentic data/assets under suitable rights. Then, and only then, register the five draft lessons in the live catalog/registry on the integration branch, run typecheck/build/quality/English regressions, carry out independent qualified science and teaching review, and seek owner approval. Do not merge into main or deploy.

**Status language:** 'Five implemented, portable development drafts with 62 authored understandings and 72 original questions' is supportable; '62 scientifically approved textbook-complete understandings' is not.
