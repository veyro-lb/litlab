# BioLab — independent course-wide teaching completeness audit

**Audit input (immutable):** `feature/biolab-ib-final-base-20261018` at `ab5bc2b8ae83f7e3bfedd3e52097ea3daa7a1d3f`.

**Audit branch:** `feature/biolab-independent-teaching-completeness-audit-20261018`.

**Nature of work:** 553-row evidence-led teaching-completeness **triage**, 15 targeted Guide-to-visible-Learn checks, with selected Hodder chapter context, structural regression tests. **This is not a 553-item independent scientific sign-off.** No Theme A–D `lesson.json` files were changed, no branch was merged, and nothing was deployed.

## Exact contents of the handoff

- `UNDERSTANDING_AUDIT_553.json` — machine-readable indexed review record for **every** syllabus ID, ordered by official ID, with current primary Learn coverage, SL/HL scope, lesson and section locators, candidate concept terms, visuals/calculations, claimed references, assessment mappings, architectural observations, possible gaps, priority, assigned repair team and unequivocally false `scientificApproval` on every row.
- `GUIDE_SCOPE_INDEX.json` — 553 official title/level/page locators and candidate source-concept keywords. **Limitation:** the keywords combine title and previously drafted curriculum summaries; they do **not** constitute a verified, exhaustive clause-by-clause transcription or paraphrase of every IB guidance note. An editor must read the attached original Guide for every statement, including diagrams, application of skills, prescribed examples, and NOS notes.
- `QUALITATIVE_SPOT_CHECKS.json` — 15 original-prose evaluations of selected Guide obligations against actual on-screen teaching; Hodder chapter pages were sampled for selected topics, but complete independent textbook-depth verification is pending, differentiating already-present teaching from genuine editorial deficiencies.
- Four `LEDGER_PART_*.json` shards — independently inspectable 10-topic batches that generated the combined inventory.
- `scripts/biology/teaching-completeness/validate.mjs` and `validate.test.mjs` — non-destructive contract, scope, figure-placement, citation reference, duplicate paragraph and rendering checks with negative fixtures.
- `.github/workflows/biolab-independent-teaching-completeness.yml` — independent check of 553 unique records, validator/tests, npm quality and production build. Running the build is not a deployment.

## Baseline quantitative evidence (not grading thresholds)

The visible main Learn explanation uses `teachingBlocks` when present, otherwise `explanation`. Optional help, retrieval, correction feedback and revision summaries **do not count** as primary teaching. Counts use a Unicode-aware lexical tokenizer and are only ranking signals.

| Theme | Understandings | Main text below 100 words | Main text below 150 words |
|---|---:|---:|---:|
| A — Unity and diversity | 95 | 0 | 36 |
| B — Form and function | 123 | 0 | 58 |
| C — Interaction and interdependence | 164 | 53 | 124 |
| D — Continuity and change | 171 | 39 | 153 |
| **Total** | **553** | **92** | **371** |

The historical 373-below-150 signal is not carried forward unchanged: this is a fresh count on pinned `ab5bc2b` using this auditor's tokenizer. The 92-below-100 signal and Theme C/D split happened to match. **Do not turn either cutoff into a course completeness gate.**

**Automated primary-reading structure on this snapshot:** 0 missing teaching-block arrays; 0 empty primary explanations; 0 exact repeated paragraphs inside a section; 0 mismatched declared SL/HL section metadata; 0 missing assessment mappings; 0 differing legacy `explanation` / rendered block text strings. **113** candidate keyword-screening mismatches and **19** candidate figure-support flags require review, not assumed remediation or failure. Numbers do **not** prove accuracy, complete causal explanations or source fidelity.

## Ranked repair queue, differentiated by evidence

### P0 — concrete instructional/presentation defect

**C2.2.12: chemicals and synaptic transmission — Theme C1–2 editors.** The second teaching-block heading is an overly long sentence that partially repeats its paragraph and distorts the reading hierarchy. Replace the heading with a short contrast such as *Receptor disruption versus transmitter reuptake*. Preserve the existing distinction between neonicotinoid action at insect nicotinic receptors and cocaine's inhibition of monoamine reuptake. The content addresses both Guide-prescribed substances; this is principally a confirmed editorial defect, not a proven scientific omission.

**C2.2.3: propagation of nerve impulses — Theme C1–2 editors.** Consecutive passages repeat the description of membrane ion movement and regenerative propagation without clearly progressing the student's reasoning. Ask whether the second block should instead explain the cause-and-effect connection from a locally depolarized segment to threshold in the next segment. Cross-check with adjacent C2.2.8–C2.2.9, where channel phases and propagation receive their own teaching, to avoid unnecessary duplication.

### P1 — high-priority learner-level and visual verification

**C1.3.10: the photosystem pigment array — Theme C1–2 editors.** The prose explains antenna pigments, excitation transfer and reaction-centre charge separation but has no visual assigned to this understanding. A small original topology-aware schematic with distinct arrows for excitation energy and electron movement is a defensible candidate, subject to the original Guide and Hodder mechanism, scientific annotation review and accessible rendering. Avoid fabricated wavelengths or energy datasets.

**C2.1.9, C2.1.10 and C2.1.14 — Theme C1–2 editors.** The first targeted comparisons show that a membrane receptor/G protein relay, an epinephrine–cAMP pathway and opposite feedback examples are already present. In particular C2.1.10 has an associated figure. Do not inflate any of these on word count alone. Verify pathway sequence, figure labels and basic novice comprehension; only repair a demonstrable missing link.

**C2.2.8 and C2.2.10 — Theme C1–2 editors.** The sodium/potassium threshold mechanism and oscilloscope trace interpretation are described, with a registered action-potential visual and spike-count table in C2.2.10. Test actual render placement, axes, units, course scope and threshold/channel causality. Do not automatically request another figure where the existing one already teaches the required idea.

**D3.1.2 — Theme D3–4 editors.** The main text already connects meiosis, new allele combinations, haploid gametes, fertilization and restored diploidy. Consider an original `2n → n → 2n` diagram only if necessary for learner comprehension. Do not mark a short but complete account deficient.

### P2 — verify complexity without unnecessary elaboration

**D3.1.5, D3.1.15 and D4.1.14 — Theme D3–4 editors.** Spot checks found the prescribed ovarian/uterine hormone and feedback sequence, the distinction between sperm penetration and the cortical block to polyspermy, and the Hardy–Weinberg equilibrium conditions already in primary teaching. Verify the registered menstrual-cycle figure and the exact guide scope; avoid duplicating the separate Hardy–Weinberg calculation requirement in D4.1.13.

**D4.3.11 — Theme D3–4 editors.** The climate-related spruce bark beetle example is present, including a named species and a biologically conditional generation-time explanation. Any numerical temperature-versus-voltinism graph requires real empirical values or an explicitly identified model and provenance. Adding an ungrounded trend chart would make the lesson worse.

**C4.2 energy/matter and D4.1 natural selection — their respective Theme C3–4 and Theme D3–4 editors.** These contain substantial numbers of compact explanations. Prioritize scientific, graphical and application-of-skills comparison in the Guide and Hodder chapter; a flagged count alone does not establish what must be added. In D4.1 distinguish the separate requirements for selection types, prescribed studies, Hardy–Weinberg calculations and equilibrium conditions.

## Mandatory source-based repair protocol for *each* of the 553 records

1. Read the entire official IB Guide numbered statement **plus guidance**, applicable diagrams, mandatory examples, skills references and SL/HL qualifications. Translate each independent obligation into an original-prose, explicit `requiredConcepts` checklist. The current keyword index is not sufficient for acceptance.
2. Read and independently verify the corresponding explanation in the IB-reviewed Hodder Third Edition, noting expected mechanism stages and important explanatory distinctions. Do not copy protected passages or visuals into BioLab.
3. Inspect **the actual student-visible main Learn blocks** (not only citation labels, helper panels, end summaries, worked examples or MCQ feedback). For each obligation record `present`, `partially_present`, `missing` or `not_applicable`, with a quoted *repository-owned* excerpt or section locator.
4. Explain specific missing causal or structural stages, terminology, examples, calculation/data interpretation, labelled diagrams, limitations or misuse of SL/HL scope. Do not add optional enrichment as if compulsory. Validate any modelled plot's inputs, units, provenance and scientific interpretation.
5. Check `explanation` fallback parity with updated `teachingBlocks`, references, visuals, `revisionSummary`, support, worked example and assessment feedback. A future source update can create drift; the validator warns on legacy divergence.
6. A named science/assessment reviewer must independently read and sign off each repaired passage. Automated tests, citations, source mappings and good-looking visuals do not represent scientific, copyright, accessibility or learner comprehension approval.

## Architecture and regression decisions

The current student Learn component renders `teachingBlocks` first and falls back to splitting `explanation`. The checks reject missing/empty teaching blocks, empty legacy explanations, exact repeated paragraphs, section scope mismatches, invalid visuals or table dimensions, missing figure assets, invalid cross-section assessment mappings and nonexistent claim reference IDs. The check also emits editorial warnings for stale/different legacy text and long explanation-like headings. This is **not** a semantic contradiction detector: reviewers still have to read prose and reconcile the evidence.

No fixed minimum teaching-word count is enforced; concise mechanisms, factual definitions and longer multistage topics require different instructional treatment.

## Integration handoff / release gates

**Responsible repair teams:** Theme A1–2, A3–4, B1–2, B3–4, C1–2, C3–4, D1–2 and D3–4 teaching editors. Their assigned lesson JSON remains untouched in this independent branch. The independent Teaching Completeness QA team maintains evidence and reruns regressions. The final integrator should cherry-pick or copy **audit, tests and documentation only**, after comparing the audit's base SHA against the eventual content-integration HEAD. Remap and regenerate each row after the theme editor commits; do not silently treat an earlier finding as current or overwrite content changes.

**Blocking before any 'complete' label:** (a) 553 detailed official-guidance clause checklists, (b) actual source comparison and item-by-item evidence, (c) qualified scientific/assessment review and exact SL/HL scope, (d) visual accuracy/provenance/rights/accessibility, (e) first-time student usability or comprehension validation, and (f) clean regression/quality/build on the integrated HEAD.

**Never equate this passing audit to scientific approval, IB endorsement or release readiness.** Production deployment and merge were intentionally not performed.
