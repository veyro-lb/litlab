# Theme C1 / cellular signalling branch — integration handoff

Branch: `feature/biolab-complete-theme-c1-20261017`
Verified redesign baseline: `d6f9fd552096edbdaf7096833675963ed016df72`.
This handoff is **draft production content**, not approval to merge or deploy.

## Coverage verified by live repository consistency inspection

| Topic | Official understandings | SL/HL sections | Assessment items | Original SVG assets |
|---|---:|---|---:|---:|
| C1.2 Cell respiration | 17 | 6 shared + 11 HL | 34 (17 MCQ, 17 structured) | 7 |
| C1.3 Photosynthesis | 19 | Registry-mapped shared/HL | 38 (19 MCQ, 19 structured) | 8 |
| C2.1 Chemical signalling | 14 | 14 HL | 28 (14 MCQ, 14 structured) | 2 |
| C2.2 Neural signalling | 16 | 7 shared + 9 HL | 32 (16 MCQ, 16 structured) | 2 |
| **Total** | **66** | | **132** | **19** |

Each understanding has visible explanation, two teaching blocks, at least one embedded choice check, and active recall. Original tests are in `scripts/biology/theme-c1/c12.test.mjs`, `c13.test.mjs`, `c21.test.mjs`, and `c22.test.mjs`.

The live remote inspection verified every ID is represented exactly once, each MCQ has four options with exactly one marked correct, no scope mismatches, and all four IDs are catalog-registered. This is **structural consistency**, not equivalent to execution of the test suite.

## Files changed by this conversation

- `src/biology/learning/chemical-signalling/lesson.json` and `src/biology/learning/neural-signalling/lesson.json`.
- Topic-scoped original illustrations under `public/biology/chemical-signalling/` and `public/biology/neural-signalling/`.
- Target-topic entries only in `src/biology/curriculum/registry.json` and `src/biology/learning/catalog.json`.
- `scripts/biology/theme-c1/c21.test.mjs` and `c22.test.mjs`.
- `docs/biology/theme-c1/C21_COVERAGE.json`, `C22_COVERAGE.json`, and `C21_C22_SOURCES_AND_RIGHTS.json`.

C1.2 and C1.3 work pre-existed on this branch when resumed and was preserved intact.

## Evidence and open gates

Official understanding scope: IB Biology Guide, first assessment 2025, printed C1.2 pp. 67–69, C1.3 relevant chapter, C2.1 pp. 72–73, and C2.2 pp. 73–75. The supplied Hodder 3rd edition was the primary teaching reference; signalling locations are printed pp. 450–466 and 467–489, respectively. No publisher image/question was intentionally copied into the topic-specific assets.

**Unverified execution:** Live GitHub Actions lookup returned zero workflow runs for this branch. The connected GitHub interface cannot execute `npm ci`, `npm run quality`, `npm run build`, Node standalone tests, or browser screenshot tests. Do not claim they passed.

**Qualified reviews still required:** subject-specialist review of exact figures and mechanisms (membrane sidedness, synaptic ion flow, kinetics and phase labels); IB/Hodder usage and commercial licensing review; classroom pedagogy, distractor quality and structured-response markscheme calibration; keyboard/mobile and accessibility review; English-site and shared-interface regression; integration QA.

**Science/wording checkpoints:** C2.1 Guide uses the wording “nitrous oxide” for a neurotransmitter; the correct gaseous neurotransmitter is nitric oxide (NO), which should be retained after specialist confirmation. C2.2 neonicotinoids commonly act as nicotinic receptor agonists disrupting signalling, not simply through passive receptor blockade. Voltage chart is **schematic**, not measured laboratory data. A qualified reviewer should verify representative membrane voltage labels and timing before student release.

No PR, merge, deployment or unrelated topic modifications were requested or performed.
