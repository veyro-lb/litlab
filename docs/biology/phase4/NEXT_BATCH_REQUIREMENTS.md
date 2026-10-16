# Proposed next batch — requirements only; implementation NOT authorized

Proposed order: A1.2 Nucleic acids, then C1.1 Enzymes and metabolism. Integrate one topic and validate before the other. Do not start either lesson, create its catalog entry, change planned availability, open a PR or merge without separate owner authorization.

## Scope and workload

| Topic | Shared | Additional HL | Official guide printed / PDF | Full Hodder printed / PDF |
| --- | ---: | ---: | --- | --- |
| A1.2 | 10 | 5 | 35–38 / 41–44 | 14–33 / 26–45 |
| C1.1 | 10 | 7 | 64–66 / 70–72 | 380–404 / 392–416 |
| Total | 20 | 12 | 32 understandings | 45 textbook pages |

Official suggested teaching time is 3 shared + 2 additional HL hours for each topic. This is classroom time, not software production effort. Compared with the 25-understanding B batch, this proposal has 28% more understandings and 12 rather than 7 HL requirements, with substantial graph and molecular-visualization work.

Planning estimate (person-hours, subject to reviewer availability): A1.2 32–46; C1.1 38–54; combined integration/browser/evidence 12–18; independent science/assessment/accessibility review 16–24. Total 98–142 hours. These are workload estimates, not delivery promises. Most uncertainty lies in molecular-viewer integration, reviewed graphs/data, and human review turnaround.

## A1.2 acceptance map

| IDs | Required instructional result |
| --- | --- |
| .1–.2 | DNA in living organisms, RNA-virus caveat; nucleotide components and correct circle/pentagon/rectangle positions. |
| .3–.5 | Covalent sugar–phosphate backbone, named bases, original nucleotide/RNA polymer drawing practice and simplified condensation model. |
| .6–.8 | Antiparallel complementary DNA, DNA/RNA comparison, ribose/deoxyribose sketch, replication/expression through complementarity. Hydrogen-bond counts and helical drawing not promoted to mandatory shared recall. |
| .9–.10 | Sequence diversity and economical information storage; conservation of code as common-ancestry evidence, distinguish sequence from code and avoid absolute universality. |
| .11–.12 HL | Correct 5′/3′ direction in synthesis and reading; purine–pyrimidine pairing preserves helix width. |
| .13 HL | Eight-histone core, linker-DNA/H1 relationship; actual guided use of molecular-visualization software. A static cartoon alone cannot satisfy the application-of-skills requirement. |
| .14–.15 HL | Hershey–Chase design/results/inference and isotope NOS; Chargaff data, tetranucleotide falsification and limits of induction. |

Expected original figures: 8–10 families plus recall variants, including nucleotide connectivity, polymer backbone, paired antiparallel strands, sugars, complementary sequence, purine/pyrimidine width, nucleosome and isotope experiment. Use data-driven sequence/complement prediction and keyboard-accessible modelling before considering a new dependency. Assess a licensed molecular viewer or a clearly signposted RCSB guided task with a complete written alternative; verify exact source/model and licensing, loading/performance, keyboard/touch and offline test treatment. Do not silently embed network resources.

Required assessments: at least 15 original four-choice MCQs with causal per-choice feedback, two or more original written/drawing tasks, and a reviewed data interpretation task based on an appropriately licensed primary dataset or explicitly labelled illustrative data. Do not reproduce Hodder tables/questions or original papers' figures by default.

## C1.1 acceptance map

| IDs | Required instructional result |
| --- | --- |
| .1–.4 | Catalysis, interdependent metabolism, anabolic/catabolic examples and globular active-site structure. Do not claim enzymes change reaction equilibrium or supply net reaction energy. |
| .5–.7 | Both substrate and enzyme change during induced fit; motion/collision and immobilization; active-site chemistry, specificity and denaturation linked to B1.2. |
| .8–.9 | Temperature/pH/substrate curves as models; compare with experimental data; calculate initial reaction rates, correct axes/units/controls and distinguish 1/time proxy from measured rate. |
| .10 | Activation-energy diagrams: lower barrier, unchanged reactant/product energy difference; breaking bonds requires energy, making bonds releases it. |
| .11–.13 HL | Intracellular glycolysis/Krebs versus extracellular gut digestion; metabolic heat; linear glycolysis and cyclical Krebs/Calvin pathways. Avoid adding complete pathway memorization to this topic. |
| .14–.15 HL | Reversible allosteric/non-competitive model versus competitive active-site inhibition; substrate-concentration effects and statin example. Do not claim all allostery is pure non-competitive kinetics. |
| .16–.17 HL | Isoleucine feedback inhibition; irreversible mechanism-based penicillin/transpeptidase interaction and altered-target resistance, distinguished from beta-lactamase. |

Expected original figure families: 8–10 plus recall variants, including induced fit, collision/immobilization, three variable-response curves, time-course tangent/rate, energy profiles, inhibition, pathway feedback and penicillin target. Provide a numerical/table alternative for every graph, conditions and provenance. Any slider-based curve is explicitly a model with defined assumptions, not fabricated experimental measurements. Never infer denaturation solely because reaction rate falls at low temperature.

Required assessments: at least 17 original MCQs, two or more data/rate tasks, one graph explanation and one pathway/inhibition written task. Teacher review should test whether competing interpretations are defensible from the supplied conditions.

## Textbook cautions found while reading both full chapters

- A1.2 printed p. 25/PDF 37 calls the coding strand the transcription template. Future content must distinguish coding from template: template is read 3′→5′, RNA synthesized 5′→3′. Do not copy the reversal. Corroboration: [NCBI, From DNA to RNA](https://www.ncbi.nlm.nih.gov/books/NBK26887/).
- A1.2's nucleosome packaging diagrams are models; H1 is outside the eight-histone core. Distinguish nuclear packaging from blanket claims that bacterial DNA has no associated proteins. Use experimental nucleosome entries such as [RCSB 1KX5](https://www.rcsb.org/structure/1KX5) with precise model scope.
- A1.2's genome table and historical dates need primary verification if reused as claims. Avoid copying potentially erroneous T2 genome-size values. Finite DNA has finite capacity; “limitless” describes possible sequence/length combinations rather than infinite data in a fixed molecule.
- C1.1 printed p. 396/PDF 408 says secreted enzymes leave by endocytosis. Future teaching must use exocytosis. Corroboration: [NCBI, Digestive Enzymes](https://www.ncbi.nlm.nih.gov/books/NBK54127/).
- The C1.1 ten-minute concentration/time example is an average rate unless initial linearity is established; use a genuine initial tangent or clearly defined initial interval. Temperature optima depend on assay conditions and incubation; no universal 37°C rule.
- Separate the guide's simplified non-competitive model from mixed inhibition and the full landscape of allosteric regulation. These caveats require qualified review, not extra required memorization.

## Workflow improvements from Phase 4

1. Freeze exact base SHA and assign the primary integrator ownership of shared files. Content packages propose scoped registry edits rather than carrying copies of the whole registry.
2. Review molecular connectivity/numbering before styling. Provide graph-level bond lists, ring atom counts, chain IDs and reviewer checklists. Add targeted negative guards only for meaningful scientific invariants; passing guards are not certification.
3. Render every labelled and recall asset before integration. Validate SVG color attributes and label bounds; require readable enlargement or a real mobile variant. No imagegen for precise chemical diagrams.
4. Require option-specific causal feedback and credible distractors at first authoring; a nonempty feedback field is insufficient. Preserve balanced answer positions and source-linked provisional written guidance.
5. Use one catalog-driven browser coverage loop for all drafted topics and levels, plus small mechanism-specific checks. Capture every heading/figure, all modes, four widths, themes, keyboard, touch and reduced motion. Keep offline containers and escaped-request failure gates.
6. Export the source/claim ledger and difference register while authoring, then reconcile the separate independent pack against the exact integration SHA before any scientific-completion claim.
7. Keep production and complete tooling audits separate and visible. Schedule dependency maintenance for the known Vite/Wrangler toolchain advisories without disguising a production-only audit as a clean full audit.
8. Put science, assessment, rights, accessibility and observed student tasks into the work estimate. Do not expand draft counts as a substitute for resolving these gates.
