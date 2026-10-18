# BioLab exact continuation handoff

Target branch: `feature/biolab-final-consolidation-and-depth-20261018`; never overwrite the active integration branch, deploy, merge to main or reset other branches.

## Checkpoint summary
- Content and visual workstreams reconciled file by file. All eight overlapping lesson files preserve the figure-repair presentation with source-depth content changes and original asset registrations.
- 18 rights-uncleared publisher-origin PDF crops removed from the new public tree, but historical Git objects still exist.
- Source-depth status: 553 total; eight prior source-informed improved, four newly source-checked improved (C1.2.14–C1.2.17), **541 awaiting individual review**; independent science approvals: zero.
- Four new repairs deduplicate proton-gradient, ATP synthase, terminal oxygen and lipid fuel passages; improve structured question wording for C1.2.16–C1.2.17; correct the C1.2.17 Hodder reference to printed p.424 / supplied PDF p.436.
- No claim of completed coursewide scientific review or new-branch full-site browser acceptance.

## Next exact scientific task
Start at **C1.2.7 (HL): NAD as hydrogen/electron carrier and oxidation by loss of hydrogen**. Inspect the exact official Guide text on **PDF page 73**, then locate and independently verify the relevant Hodder passage (chapter C1.2, *not* a guessed exact page). Open `src/biology/learning/cell-respiration/lesson.json`, section `c12-7`; compare explanatory stages, diagrams, misconceptions, recall, 1A questions and Paper 2 answer with the two sources. Mark source-reviewed only after inspecting actual content. Continue C1.2.8 through C1.2.12, then other difficult mechanisms (C1.3, D1.1, D1.2, D2.1, C2.2, B3.2), followed by every remaining syllabus understanding.

For each verified batch: correct only genuine issues; preserve existing diagrams or add minimal original evidence-based visuals; update the 553-row JSON ledger and repair log; rerun schema/scope/figure tests, build and browser QA; create a reviewable commit; document exact next understanding and unresolved issues. Do not silently mark broad inventories as independently reviewed.

## Required evidence before acceptance
Read the new branch's real GitHub Actions result and logs. Run student journeys across all 40 topics at narrow/mobile and desktop widths. Resolve the 58 source locator gaps and all rights questions. Independent qualified scientific review remains an external gate.
