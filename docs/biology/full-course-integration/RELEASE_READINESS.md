# BioLab — Full IB Biology Course Integration and Private Release Readiness

**Audit date:** 17 October 2026  
**Decision:** **NO-GO for a 40-topic release or public publication.**  
**Integration branch:** feature/biolab-complete-course-integration-20261017  
**Pinned green source:** 7492d63cdc1d568e43d57edd5bf539c4317cb96c  
**Evidence:** https://github.com/veyro-lb/litlab/actions/runs/39010840459  
**Scope of this checkpoint:** honest intake, preserved green baseline, cross-file readiness audit, evidence and blocker ledger. It does not claim implementation or verification of missing courses.

## 1. Source branch SHAs and handoff status

| Requested branch | Observed SHA / status | Intake assessment |
|---|---|---|
| Learning redesign | Moving concurrently; observed 50ecbcce39e7487591de2e56b1d4ff6c55504768 after the initial 7010e5c and subsequent bc434f1 commits | Later redesign improvements remain on source. Not yet established as a green integration base. |
| Complete Theme A | 19e5dd48ba99203eaafff5ca54bce59219bb9ec1 | New A2.1 draft observed; only one topic in the observed diff, no complete Theme A handoff. |
| Complete Theme B | Not present in 149-branch inventory | Intake blocked. |
| Complete Theme C1 | Not present in 149-branch inventory | Intake blocked. |
| Complete Theme C2 | Not present in 149-branch inventory | Intake blocked. |
| Complete Theme D1 | d396c6888a078ff28d8a8aae478cd1afcac58f14 | New D1.1 draft observed; only one topic in observed diff, no complete Theme D1 handoff. |
| Complete Theme D2 | Not present in 149-branch inventory | Intake blocked. |

**Concurrent-writing caveat:** Branch heads moved during the preflight. These SHAs are observations, not a claim that newer commits are absent; fetch exact branch heads and tests again immediately before accepting or merging any package. A newly created branch at a prior green commit is not itself a content package.

## 2. Final integration SHA and writes

Created the named integration branch from the latest redesign SHA for which all listed acceptance CI jobs were verified green: 7492d63cdc1d568e43d57edd5bf539c4317cb96c. The final SHA is the GitHub head after committing this report and the isolated integration QA workflow; record it against those Actions results. This report intentionally never claims the original green SHA is the final integration SHA.

Changes on integration branch are confined to release auditing, mapping validator and integration-only CI. No topic was artificially promoted, and no shared app file was overwritten.

## 3. Actual curriculum completion

The official machine-readable course registry contains **40 topics**, **553 numbered understandings**, **337 shared** and **216 additional HL**. These four counts are structural invariants, not teaching-completion metrics.

The pinned green baseline has **8 registered development drafts and 101 source-mapped understandings**: A1.1, A1.2, B1.1, B1.2, B2.1, B2.2, B2.3 and C1.1. That means **63 shared and 38 HL** have draft lessons. None of those 101 is independently certified pedagogically complete.

A later, unverified redesign handoff reports **9 drafts/115 understandings**, including A2.2 Cell structure. Those newer commits must not be silently substituted for the green baseline; A2.2 has unresolved microscopy and biological drawing obligations. The remaining topic-by-topic map and levels are in READINESS_LEDGER.json.

## 4. Unfinished curriculum items

On the pinned branch **32 topics are planned**, not published as full teaching: A2.1, A2.2, A2.3, A3.1, A3.2, A4.1, A4.2, B3.1, B3.2, B3.3, B4.1, B4.2, C1.2, C1.3, C2.1, C2.2, C3.1, C3.2, C4.1, C4.2, D1.1, D1.2, D1.3, D2.1, D2.2, D2.3, D3.1, D3.2, D3.3, D4.1, D4.2 and D4.3. They are not to receive available lesson links before passing all gates. Planned registry entries are not skeleton lessons masquerading as teaching.

## 5. SL and HL

The pinned registry's classification is 337 shared and 216 HL. Among the eight teaching drafts, 63 are shared and 38 additional HL. Existing green browser suites reported coverage of lesson navigation and scope. No test has established correct student workflows across the missing 32 topics. Recheck assessment, flashcards, deep links and SL access for **each** future imported topic.

## 6. Textbook scope and source evidence

Course-scoping authority: IB Biology Guide, first assessment 2025. Principal teaching reference: Clegg, Davis and Talbot, Biology for the IB Diploma Programme, Third Edition, Hodder Education 2023.

The existing historical redesign audit states that all eight Water understandings and nine B2.2 organelle understandings received substantive whole-chapter comparisons (17/101). The remaining 84 received more limited revisions. No equivalently complete, independently verified chapter-level comparison exists across the other planned 32 topics.

The current Theme A development diff introduced A2.1.1–A2.1.9: nine HL-only sections, 18 proposed questions, one schematic and a dedicated validator. Its handoff Markdown contains literal **undefined** fields where understanding titles/page spans should be, so editorial provenance documentation needs correction before acceptance. Theme D1 introduced D1.1.1–D1.1.9: five shared and four HL sections, 18 proposed questions and one SVG. It is marked **source-mapped**, not approved. Both need substantive reading and claim-level scientific and educational review, including figure directionality and clinical/experimental distinctions where applicable. These are **works in progress**, not complete theme handoffs.

A historical Water source comparison identified and corrected the textbook's inaccurate density wording: water is most dense near 4°C, not least dense. Editorial review must use evidence to resolve inaccuracies rather than treating any coursebook as infallible.

## 7. Diagrams and authentic-image review

Existing historical review includes **76 recorded figure assets** and **four withheld** figures: A1.2 nucleosome, B2.1 transport mechanism 7, sodium–potassium pump 15, and cotransport mechanism 16. All require validated replacements before exposure. Historical figure-render evidence covered 182 views with no clipped text in that tested build, not an independent review of molecular correctness. New A2.1 vesicle and D1.1 replication SVGs were not incorporated into the pinned branch and have no independent review approval.

For each newly imported asset, inspect label and connection topology, atom valence, organelle compartment structure, directionality, microscopy authenticity, units, scales, source permission, contrast, mobile legibility, keyboard enlargement and descriptive alt text. Never invent observational data or image permissions.

## 8. Assessment quality and completeness

Existing eight drafts contain original response/check material and a framework for feedback and recall. Automated answer-key and UI checks are not evidence of qualified assessment approval. A2.1 and D1.1 question packages exist only on their author branches in the observed diffs and require full answer-key, distractor, marks and level review before catalog acceptance. Other topics have no accepted assessments. Assessment human gate: **pending**.

## 9. UI/UX experience

The pinned redesign uses Theme → Topic → Understanding, direct teaching links, full visible explanatory paragraphs, supporting figures, optional simplification and working resource navigation for drafted lessons. It is **not** a complete-course experience.

After the pinned green commit, the redesign branch attempted an uncluttered figure presentation, removal of under-figure controls and 13 curated comparison/chart/causal visuals; it also registered an A2.2 draft. These changes have not been imported because later exact-SHA CI runs failed. Some failures are clearly selector/test-contract conflicts after new nested visual sections; others are broken student-task/navigation assertions. Resolve each using real behavior verification, not disabled tests.

## 10. Screenshots

A previous eight-topic candidate includes a historical owner-review screenshot gallery:
https://biolab-textbook-review-20261017.mrsmrs.chatgpt.site/review-evidence/

This gallery is **not evidence of this integration SHA, 40 topics, or the newer redesign**. A new browser inspection could not start because the connected browser service lacked available wallet credit. No authentic screenshots from the integration SHA can therefore be claimed. Exact-SHA desktop and phone screenshots, 200% native zoom, 320/390/768/1024/1440/1920 breakpoints and usable touch/keyboard scenarios remain pending for the new candidate.

## 11. Exact-SHA CI and browser QA

- **7492d63c (pinned baseline): PASS** isolated learning redesign QA, install, quality, build, production audit, browser; Actions https://github.com/veyro-lb/litlab/actions/runs/39010840459
- **2435130 (earlier exact evidence): PASS** 147/147 browser checks, 101/101 understanding workflows, 24 header combinations, 30/30 English route renders and 11/11 English interactions; report retained under docs/biology/textbook-redesign/evidence/VERIFICATION.json. Do not reuse these as proof for subsequent commits.
- **7010e5c (newer redesign): FAIL** quality and browser gates; some scripts assumed Cell structure remained planned, while the evolving app exposed a lesson, and other tests encountered unhandled support data and overly broad selectors. https://github.com/veyro-lb/litlab/actions/runs/39017825191
- **bc9e1f1 (newer redesign): FAIL** quality and browser gates; lesson navigation and section selection assertions failed. https://github.com/veyro-lb/litlab/actions/runs/39018219980
- Later redesigned SHAs and A/D1 branch commits have not been accepted against a full qualified intake gate. The final integration SHA must receive its own Action run before any change in release status.

No failing assertion was disabled in the integration branch.

## 12. English regression

The last complete recorded English regression on earlier exact code passed 30 route renders and 11 interactions. This does not establish live English/authenticated workflows for future merged content. Main is untouched; re-test auth, progress isolation, search, student/tutor header overlap and route back/forward behavior on the eventual final integration commit.

## 13. Accessibility

Previous automated and browser tests included 320, 390, 768, 1024, 1440, 1920px, keyboard and touch and equivalent 200% reflow; native browser 200% zoom was not established. No independently conducted screen reader or assistive technology assessment exists for the complete platform. Approval pending.

## 14. Copyright and figure rights

Hodder (2023) explicitly reserves reproduction rights; the IB guide also specifies rules regarding commercial third-party use, curricular mapping and written licences. Access to PDFs is not a reuse licence. All student content must remain substantially original, and any third-party imagery must have documented permissions and displayed attributions where required. A formal legal/rights review is required before commercial publication. No IB endorsement, publisher authorisation, or blanket right to reproduce the textbook is claimed.

## 15. Independent scientific/educational review

**Pending**. No named qualified science reviewer, assessment reviewer, microscopy specialist or licensing approver has supplied approval evidence for this complete course. Automated validators and editorial self-review cannot be upgraded into such approvals.

## 16. Dependencies

The prior exact-commit report recorded **zero production dependency vulnerabilities**, but **seven development-tool advisories** (one moderate, six high) in the full audit. Latest source changes require a fresh production and full-tree audit. Do not conflate a green production-only audit with a clean dependency tree.

## 17. Working private preview

A historical partial-course HTTPS preview is documented:
https://biolab-textbook-review-20261017.mrsmrs.chatgpt.site/#biology

The service has **not been independently opened and verified during this integration**. It is not a new final integration deployment and should not be represented as a working 40-topic release. No new preview was deployed because the technical acceptance preconditions are unmet.

## 18. Concrete blockers before publication

1. Finish and publish verified per-topic packages on all six Theme A–D branches; four were absent at this checkpoint and two had only a single observed topic file each.
2. Resolve newer redesign source CI failures and merge UI changes on the isolated integration branch only after exact-SHA QA.
3. Verify all 40 real lesson objects, 553 numbered understandings, correct SL/HL boundaries, actual explanatory depth, sources, and useful in-context visuals.
4. Replace withheld scientific figures; verify microscopy, diagram topology, axes/units and all third-party permissions.
5. Run all new lesson/assessment/graph calculations and full cross-course browser, English, accessibility and progress isolation tests.
6. Secure named qualified human science/assessment/educational/rights approvals and obtain actual owner sign-off.
7. Only then create a separate controlled preview and inspect genuine application screenshots at phone and desktop widths.

## 19. Release determination

**NO-GO** for a 40-topic private release candidate, for qualified educational certification and for public publication. The isolated integration branch and its mapping audit exist; source packages are incomplete, newer shared UI changes are unverified, independent approvals are pending and a 40-topic preview has not been produced.

Do not merge main, alter the existing English website, or deploy BioLab publicly without the owner's explicit later approval.
