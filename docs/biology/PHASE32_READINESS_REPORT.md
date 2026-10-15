# LitLab Biology — Phase 3.2 First Batch: Scientific Coverage, Interactive Lesson Quality & Development Readiness Report

**Report prepared:** 16 October 2026  
**Repository:** https://github.com/veyro-lb/litlab  
**Branch (isolated; development only):** `feature/biology-phase32-batch-20261016`  
**Verified starting commit:** `64050774a88878b5910c15c3227345df16c431f0` (unchanged Water baseline)  
**Last implementation commit before this report:** `ebea993c6e039ea545e55c71574abf5786733274`  
**Final report-and-test commit:** See this file's Git history and the final handoff response; a commit cannot include its own SHA in its contents.  
**Public release approval:** **NOT GRANTED.** This is a source-checked educational development draft, not an independently reviewed or officially IB-approved resource.

## 1. Execution summary

Implemented the controlled two-topic batch requested by the owner, rather than producing only a roadmap. B1.1 and B1.2 now use the existing versioned lesson schema, curriculum registry, generic React lesson renderer, lazy catalog loading, provenance and review model, and StudyQuestion assessment interfaces. Their original lesson packages include 25 distinct numbered teaching sections with two or more named mechanism/reasoning blocks per understanding; targeted selection checks, recall prompts, misconception repair, worked examples, section sources, Revision Mode, Paper 1A-style multiple choice, and original provisional written practice. B1.2 respects the 5 shared / 7 additional-HL scope boundary. Eleven original SVG scientific schematics have 11 unlabelled active-recall variants. The new generic MechanismSequence component requires a student to make a meaningful prediction before unlocking successive stages; one three-stage activity is used in each topic.

**No deployment, main merge, PR, production Supabase mutation, authentication edit, English lesson edit, or student-progress mutation occurred.** Existing Water scientific content and figures were not rewritten. Shared QA code was extended without changing Water's lesson. The feature branch is isolated from the established primary development branch.

## 2. Original materials, authority and page locators

| Resource | Material consulted | Role |
|---|---|---|
| *IB Biology Guide*, first assessment 2025 | B1.1 printed **49–50** / PDF **55–56**; B1.2 printed **50–52** / PDF **56–58** | Sole authority for numbered requirements, NOS guidance and SL/HL scope |
| Clegg, Davis & Talbot, *Biology for the IB Diploma Programme*, Third Edition (Hodder Education, 2023, ISBN 9781398364240) | B1.1 printed **181–204** / PDF **193–216**; B1.2 printed **205–222** / PDF **217–234** | Major teaching, chemical mechanism, diagram-concept and misconception reference |
| Sirius Revision, B1.1 Carbohydrates (SL/HL) | https://www.youtube.com/watch?v=eV--VWunHUU | Authentic video metadata and limited third-party text located; complete audio/slides **not independently viewed** |
| Sirius Revision, B1.1 Lipids (SL/HL) | https://www.youtube.com/watch?v=-fzIaXjSrNo | Authentic video metadata located; contents beyond accessible summaries **not verified** |
| Sirius Revision, B1.2 Proteins (SL/HL) | https://www.youtube.com/watch?v=7-i-VDkZuQs | Authentic video metadata and partial *secondary* transcript checked; full original audiovisual **not independently viewed** |
| Additional Sirius Revision B1.2 HL | Not independently verified | Explicit coverage gap; no claim of HL video coverage |
| Independent science | OpenStax Biology 2e sections 3.3, 3.4, 5.1; NCBI Bookshelf; NIH MedlinePlus; OpenStax Organic Chemistry 26.9 | Corroboration and discrepancy resolution, not blanket certification |

No copyrighted publisher diagrams, articles, textbook question banks, or original video assets were imported into the repository. The source ledger has section-by-section Hodder page locators, source IDs, explanation mapping, concept checks, misconceptions, optional/supporting scope and review notes: [PHASE32_COVERAGE_LEDGER.md](./PHASE32_COVERAGE_LEDGER.md). See [PHASE32_SCIENCE_SOURCE_REVIEW.md](./PHASE32_SCIENCE_SOURCE_REVIEW.md) for qualifications and discrepancy details.

## 3. Exact coverage and separation

| Topic | Numbered sections | Shared SL+HL | Additional HL | Figure sources | Student-facing activities |
|---|---:|---:|---:|---:|---|
| **B1.1 — Carbohydrates and lipids** | **13** (B1.1.1–B1.1.13) | 13 | 0 | 7 originals + 7 label-recall | 13 concept checks, at least 13 recall prompts, 13 original MCQs, 1 data task, 1 structured reasoning task, 1 three-step mechanism challenge |
| **B1.2 — Proteins** | **12** (B1.2.1–B1.2.12) | 5 | 7 (B1.2.6–B1.2.12) | 4 originals + 4 label-recall | 12 concept checks, at least 12 recall prompts, 12 original MCQs, 3 structured reasoning tasks, 1 three-step mechanism challenge |
| **Combined** | **25** | 18 | 7 | **11 + 11** | **25 MCQs + 5 written/data tasks** |

**B1.1 mapped progression:** B1.1.1 carbon bonding and SI convention; .2 condensation polymers; .3 hydrolysis; .4 monosaccharide rings and glucose function; .5 starch/glycogen storage; .6 cellulose; .7 glycoproteins and ABO; .8 lipid hydrophobicity; .9 triglycerides/phospholipids; .10 saturation and melting; .11 adipose storage/insulation; .12 amphipathic bilayer; .13 fused-ring steroids and membrane passage.

**B1.2 shared:** .1 generalized amino acid; .2 peptide condensation; .3 dietary essential/non-essential; .4 peptide variety; .5 temperature, pH and denaturation. **Additional HL:** .6 R-group chemistry; .7 sequence→fold; .8 helix/sheet secondary structure; .9 tertiary interactions and cysteine disulfides; .10 aqueous versus membrane protein hydrophobic packing; .11 quaternary and conjugated proteins, plus cryo-EM NOS context; .12 insulin/globular versus collagen/fibrous structure–function.

Section titles are original didactic headings in the authoritative curriculum registry, never presented as exact copyrighted IB wording. Shared content remains visible in SL and HL; additional HL is hidden for SL in Learn, Revision, Practice and targeted navigation. Wholly HL-only future-topic behavior retains its previous regression tests.

## 4. Scientific disputes, corrections and content limits

The video-derived secondary protein transcript reverses the customary adult human nine-essential / eleven-nonessential amino-acid counts. These numbers are **not part of the specified B1.2.3 requirement** and were not built into student study material; definitions and vegan-diet considerations are taught instead. Other review cautions include glucose ring-member versus carbon count, alpha- versus beta-glucose linkage and hydrogen bonding, cis/trans fatty-acid geometry, hydrophilic/polar lipids, ABO glycoconjugates, steroid polar substituents, denaturation not automatically cleaving peptide bonds, R-group protonation in ionic bonding, and conjugated protein versus multichain classification.

The official B1.1.1 Nature of Science references **kilo, centi, milli, micro, nano** SI conventions. The official B1.2.11 NOS references **cryo-EM**. Both have original explanation and recall items. Supplementary clarification is kept adjacent to core teaching; optional enrichment must never be misrepresented as examinable. The B1.1 data example is explicitly an **illustrative structural comparison, not measured laboratory data**.

## 5. Original visuals and rights records

B1.1 illustrations: condensation/hydrolysis, storage polysaccharide versus cellulose, glycerol-based triglyceride and phospholipid component counts, bilayer orientation, five- versus six-carbon sugar recognition (including fructose showing that carbon count differs from ring corners), saturated versus cis-unsaturated chains, and the characteristic steroid fused-ring nucleus. B1.2 illustrations: generalized amino acid, peptide-bond condensation, four protein structural levels, and insulin versus collagen conceptual structures. Every figure has authored vector source, source records, attribution, publication-rights warning, caption and descriptive alt text; all diagrams are labelled conceptual where full atomic resolution is omitted. Alternate unlabelled figures support active recall, with full-size links.

**Limitations:** Current figures still require a named qualified chemist/IB Biology diagram reviewer. Original artwork avoids a third-party copyright dependency but does not, by itself, constitute owner commercial/publication approval. A human mobile and assistive-technology review remains required, particularly for densely labelled molecular recognition figures.

## 6. Interaction and instructional design

The generic React renderer and lesson contract were preserved. Two topic packages add original concept checks, active recall, comparison explorers, misconception repair and original assessment. In Phase 3.2 a **generic, separately typed and validated `MechanismSequence` component** was introduced. It requires prediction at each step, supplies feedback for incorrect alternatives, permits retry, advances only after a correct explanation-based selection, and does not invent mastery percentages or cloud completion. It uses native buttons and live status announcements. A condensation→hydrolysis chain challenge serves B1.1 and a carboxyl+amine→peptide bond→water/R group challenge serves B1.2. A negative-test suite rejects malformed mechanisms and duplicate/incorrect answers.

Student-facing content follows a short explanation → diagram → reasoning/action → misconception feedback → recall/practice flow. This is a meaningful improvement over an uninterrupted article; however, the experience has **not** been validated for measured comprehension, retention, student preference or accessibility by real students.

## 7. Assessment and revision

At least one original Paper 1A-style MCQ per understanding (25), each with four answer options and individual corrective feedback. B1.1 also includes a clearly labelled illustrative Paper 1B-style structural comparison and a Paper 2-style storage-versus-cellulose reasoning task. B1.2 adds three Paper 2-style self-reviewed structural/biochemical tasks including peptide drawing, denaturation, and higher-level protein folding. The authored answer keys/marking points are draft guidance, not IB examiner marking or automated grade estimates. Active-recall terms, figure label hiding, and Learn↔Revision↔Practice understanding-ID links are available within the generic renderer. Tab-only answer state remains; no persistence or student cloud tracking was added.

## 8. Validation and screenshot evidence

CI workflow: [Biology Phase 3.2 Isolated Batch QA](https://github.com/veyro-lb/litlab/actions/workflows/biology-phase32-qa.yml). The workflow is triggered only by the isolated feature branch and runs `npm ci`, `npm run quality`, baseline curriculum/Water regressions, generic and new topic validators plus negative tests, `npm run build`, `npm audit --omit=dev --audit-level=high`, and a browser suite inside an **offline Docker container with `--network none`**.

- Initial batch-run [38819460905](https://github.com/veyro-lb/litlab/actions/runs/38819460905): **success**.
- Source-ledger and diagram batch-run [38819688006](https://github.com/veyro-lb/litlab/actions/runs/38819688006): **success**.
- Complete molecular-recognition/NOS run [38820083296](https://github.com/veyro-lb/litlab/actions/runs/38820083296): **success**.
- New mechanism challenge commit run [38820597212](https://github.com/veyro-lb/litlab/actions/runs/38820597212): refer to GitHub for final status, since this report was drafted before it completed.
- The final report-and-browser-extension commit will trigger another exact-SHA run. Its outcome must be checked separately; no unrun code should be called validated.

A downloaded successful QA artifact (run 38819688006) was inspected: **185/185** recorded browser interactions passed, with **zero** failures, **zero** escaped external requests, **zero** interception errors, and 179 deliberately blocked external requests. This includes **50** new B1.1/B1.2 checks spanning SL/HL and widths 320, 390, 768 and 1440, alongside retained Water and English regressions. Browser route report has 30 successful route renders. The verified screenshot package contains `phase32-B1.1-SL-learn-390.png`, `phase32-B1.1-SL-learn-1440.png`, `phase32-B1.2-SL-learn-1440.png`, `phase32-B1.2-HL-learn-390.png`, `phase32-B1.2-HL-structure-390.png` and corresponding additional modes/levels. Initial screenshots of B1.1 mobile, B1.2 SL desktop, and B1.2 HL mobile were personally inspected for layout and content legibility. The final workflow adds captured mechanism-feedback screenshots at 390 and 1440.

**Limitations:** CI is technical/structural evidence. It does not certify every diagram's biochemistry or exam question quality, prove a struggling student can follow every explanation, or replace assistive-technology testing. The initial screenshot inspection suggests some paragraph-heavy sections can still benefit from student-guided simplification.

## 9. Reusable architecture and changed-file overview

Implementation additions: `src/biology/learning/carbohydrates-lipids/lesson.json`, `src/biology/learning/proteins/lesson.json`, `src/biology/learning/MechanismSequence.tsx`, 22 original labelled/recall SVG files under `public/biology/{carbohydrates-lipids,proteins}`, topic-specific validator and negative tests, isolated QA workflow, this report and both source review/coverage documents.

Narrow shared-system changes: `src/biology/curriculum/registry.json` has only B1.1/B1.2 topic records updated (minimal two-record line-preserving diff); `src/biology/learning/catalog.json` adds two lazy-loading entries; `src/biology/learning/lesson-contract.ts` has an optional reusable mechanism type; `src/biology/learning/LessonView.tsx` includes one generic component invocation; `src/biology/biology.css` adds bounded responsive accessible styling; generic validator/testing and isolated browser regression script add challenge checks. No B1.1- or B1.2-specific identifiers were hard-coded into the generic renderer. Original Water lesson JSON and scientific assets did not change.

## 10. Independent approval checklist / release blockers

A named qualified IB Biology/chemistry reviewer must sign off scientific facts, explicit guide scope, chemical SVGs, the treatment of exceptions and the exact rendered revision. An experienced IB examiner/teacher must review 25 MCQs, five written/data tasks, distractors, command terms, expected answer levels and provisional mark points. Rights/IP owner review must address original assets and use of official syllabus mappings, including the IB guide's commercial licensing restrictions. Independent accessibility review must test screen readers, keyboard/focus, touch, reduced motion, 200% zoom, image descriptions and both themes. Students who struggle with chemistry should complete representative lessons while observed; measure understanding and retention, not mere page views. Before any public release, confirm main branch protection, owner publication sign-off and production isolation.

## 11. Separate readiness decisions

| Decision | Result | Reason |
|---|---|---|
| **A. B1.1 complete development draft** | **CONDITIONALLY GO** after latest exact-SHA green CI | All 13 numbered shared understandings, examples, reaction and structure diagrams, original practice, recall, provenance, NOS and self-repair challenge implemented. Qualified review and student usability testing missing. |
| **B. B1.2 complete development draft** | **CONDITIONALLY GO** after latest exact-SHA green CI | All 12 sections incl. correctly gated 7 HL, proteins figures and bond explanation, original practice, recall and mechanism challenge implemented. Qualified review pending. |
| **C. Next isolated development batch** | **GO with controlled scope and integration discipline** | Architecture supports multiple lessons and validations; proceed only after inspecting final CI and using one topic at a time. Do not launch A1.2 or C1.1 without separate instruction. |
| **D. Public release** | **NO-GO** | Outstanding scientific, assessment, rights, accessibility, student learning/outcome and owner deployment approvals. |

This milestone produces functioning development artifacts with bounded source and quality evidence. It **does not** equate automated green checks with a public-ready or scientifically certified educational product.
