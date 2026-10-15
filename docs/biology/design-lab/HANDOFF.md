# LitLab Biology — Independent UX/UI Design Lab & Prototype Handoff

**Status:** standalone interactive prototypes delivered; production integration **not** performed.  
**Repository:** `veyro-lb/litlab`  
**Read-only baseline inspected:** `feature/biology-foundation` at `64050774a88878b5910c15c3227345df16c431f0` (2026-10-16 checkpoint).  
**Isolated design branch:** `feature/biology-design-lab`, created directly from the baseline.  
**Final branch SHA:** see GitHub branch head / final delivery response; this document is packaged before its final metadata-only commit.  
**Permitted repository scope:** `docs/biology/design-lab/` only. No deployment, PR, merge, or changes to the live React application.

## 1. Existing implementation inspected

Reviewed the foundation docs (`docs/biology/FOUNDATION.md`, `LESSON_PRODUCTION_SPEC.md`) and current React architecture in `src/main.tsx`, `src/biology/entry.tsx`, `src/biology/BiologyApp.tsx`, `src/biology/biology.css`, `src/biology/learning/LessonView.tsx`, `StudyQuestion.tsx`, `ScientificFigure.tsx`, `UnderstandingLabel.tsx`, `src/biology/curriculum/manifest.ts`, and the existing HTML shell. Source comparison used GitHub at the exact baseline; no production checkout or remote production account was used.

**Visual baseline:** native LitLab green (`#287868` / dark `#83ceba`), light surfaces, unobtrusive dark theme, modest borders, conservative typography, Georgia italics for editorial emphasis, semantic native inputs, and consistent numbered syllabus understandings. Biology is mounted inside a React shadow root under the existing LitLab header. The live renderer already has four modes, registered lesson loading, source-review notices, and scoped SL/HL navigation. It is a working system to refine—not a blank redesign.

**Current UX opportunities inferred from source (not a live-site screenshot audit):** (a) on small screens, the numbered navigation may occupy many rows before the explanation; (b) top hero and draft banner are long relative to mobile reading space; (c) question feedback benefits from explicit distractor comparisons and return-to-explanation affordances; (d) figures need explicit recall/legend/zoom states and stable mobile label sizes; (e) learning and revision benefit from more distinct visual weight; (f) desktop content should retain long-reading line lengths near 60–67 characters. The existing code already implements several of these partially, so integration should be targeted, not wholesale replacement.

**Inspection limitation:** unable to run the full current application and English routes from the remote private repository in this isolated environment; no current-production screenshots, logged-in states, or external links were verified. The prototype itself was rendered and tested locally.

## 2. Design principles and tokens

- Keep the LitLab identity: **green for Biology study actions**, themes differentiated by restrained secondary accents; avoid an unrelated brand or busy decorative backgrounds.
- Typography: system sans for academic reading and UI; serif italic only as a brief editorial accent. Base reading text **16px, line-height 1.8–1.9**, recommended reading width **62–67ch**. Topic headings 2.2–3.25rem responsive, section headings 1.8–2.2rem; labels 11–13px with contrast verified.
- Layout: global max-width **1230px**, lesson content at most **788px** within a two-column **245px sticky navigation / fluid reading column**. Consistent 8/12/16/24/32px spacing; cards for choices and discrete tasks, paragraphs for the central explanation.
- Color/light: background `#f7f8fa`, paper `#fff`, ink `#1e2934`, muted `#586675`, lines `#d9e2e4`, green `#287868`, primary `#1e6559`, focus violet `#7256d8`.
- Color/dark: background `#121d24`, paper `#1c2a32`, ink `#edf3f3`, muted `#b9c8ca`, green `#94dec4`, primary `#ace8d1`, focus violet `#b5a2ff`.
- Color is never the only correctness signal; feedback includes a text judgement and a causal explanation. Warnings have textual misconception/correction, not orange alone. Native radio/fieldset/legend/summary/buttons preserve assistive-technology affordances.
- Breakpoints: 1000px compaction; 760px collapses the full lesson sidebar into a labelled `Sections` control; 500px adopts a single-column reading and directory layout; 350px reduces header and control density further. Target at least **44px** major interactive controls.
- Contrast spot checks (WCAG ratios, algorithmic): light ink/paper 14.77:1, light muted/paper 5.88:1, light Biology green/paper 5.28:1, dark ink/paper 13.12:1, dark muted/paper 8.54:1, dark green/paper 9.47:1. These are token-pair checks, not an automated WCAG audit of every final UI state.
- Respect reduced motion. Do not invent learning performance scores, completion bars, spaced repetition models, certifications, or unavailable lessons.

## 3. Working prototype contents

| Screen/interaction | User goal | Location in prototype |
|---|---|---|
| Biology dashboard | Find a topic by theme/code, see honest availability, choose SL/HL | `standalone.html#dashboard` |
| A1.1 overview | Scan exact A1.1.1–A1.1.8 identifiers, scope and sample entry points | `standalone.html#topic` |
| A1.1.2 learn sample | Read mechanism, compare intra/intermolecular forces and original scientific diagram | `standalone.html#lesson/2` |
| A1.1.3 learn sample | Distinguish cohesion, adhesion and surface tension | `standalone.html#lesson/3` |
| Mobile lesson navigation | Toggle the full numbered list; focus and select by native button | Within `#lesson/2`, ≤760px |
| Revision | Recall short cues, terminology and reveal response before practice | `standalone.html#revision` |
| Paper 1A/1B/2 practice | Choose an answer / interpret tabulated data / compare written answer with guidance | `standalone.html#practice` |
| Light/dark | Toggle independent appearance, including all figures/controls | Header button |

`index.html`, `styles.css`, and `app.js` are editable equivalents of the self-contained HTML. They do not import React or mutate production files. The topic directory covers 40 IB topic names, with six entirely HL topics hidden in SL (34 in SL, 40 in HL). Only A1.1 carries `source-checked draft` status in the prototype; B1.1/B1.2 remain `planned` because independent drafts are not the same as integrated public availability. All UI state is ephemeral and in-memory.

### Science and provenance scope

The official IB Biology Guide, first assessment 2025, is the curriculum and SL/HL scope authority (syllabus roadmap printed p. 25/PDF p. 31; A1.1 understandings in the guide). Hodder's *Biology for the IB Diploma*, 3rd ed. (Clegg, Davis, Talbot, 2023), chapter A1.1, pp. 2–10 / PDF pp. 14–22, informed the textbook cross-check. The original model schematic (solid O–H bonds within H₂O and dashed intermolecular hydrogen bond) is newly authored in SVG, not copied from either publication. Values in the illustrative water/air practice table are rounded, not measured by LitLab. **No claim is made that IB, Hodder or a qualified human reviewer certified the prototype.** A qualified science reviewer must check the SVG, explanatory precision and every assessment answer before integration.

## 4. Browser and visual verification

**Test method:** locally installed Chromium via Playwright, headless; source injected into `about:blank` to work within managed sandbox navigation restrictions. The same stand-alone single-file artifact was smoke-tested separately after bundling. Browser script `test_prototype.py`; machine-readable evidence `test-results.json`.

**Validated (76/76 passing after resolving 4 initial issues):** dashboard render, no page-level overflow at **1440/768/390/320**, eight ID rows, lesson figure/understanding labels, desktop and mobile section navigation, revision answer reveal, incorrect-answer explanation, Try Again clearing answer, Paper 1B data table, Paper 2 written-response/guidance reveal without auto-marking, diagram label recall, modal open/Escape close, theme toggle, dark overflow, no JavaScript errors, 34 SL / 40 HL topics, topic search, full HL scope and blocking an HL-only deep link from SL scope, zero external resource dependencies. A timing assumption in the initial harness was corrected; an actual HL deep-link fallback issue was corrected in prototype routing. Tests run against the standalone prototype **only**.

Representative full-page screenshots in `screenshots/`:

- `desktop-dashboard-light.png`, `desktop-topic-light.png`, `desktop-lesson-light.png`, `desktop-revision-light.png`, `desktop-practice-light.png`
- `tablet-dashboard-light.png`, `tablet-lesson-light.png`
- `phone-dashboard-light.png`, `phone-topic-light.png`, `phone-lesson-light.png`, `phone-navigation-open.png`, `phone-revision-light.png`, `phone-practice-light.png`, `phone-lesson-dark.png`
- `narrow-dashboard-light.png`, `narrow-lesson-light.png`, `narrow-navigation-open.png`, `narrow-lesson-dark.png`
- `desktop-lesson-dark.png`; light/dark token styling shares one DOM and no layout-specific CSS forks.

**Critical qualification:** screenshot inspection was performed for the desktop/phone lesson and desktop dashboard. No automated axe/WCAG certification, screen-reader manual pass, cross-browser Safari/Firefox pass, browser 200%/400% zoom pass, actual student comprehension study, or real site regression claim is made. Treat these as release gates.

## 5. Figure and interactive content specification

Scientific figures should use one framed component: figure number/clear subject in heading, original graphic or licensed source, distinct solid/dashed conventions and legend, explanatory caption, textual long description/alt, optional label-hiding recall mode, full-size control, explicit `not to scale` when appropriate, reviewer/source/rights metadata. Enlarge using a dialog with escape, focus trapping and focus return; ensure it remains readable at 320px or provide source-linked mobile diagram variants. Distinguish authentic photographs from models; do not produce convincing-but-unverified AI-generated molecular geometry. Prefer SVG diagrams vetted for atom charges, chemistry and bond symbols. For graphs/data, provide table alternatives, units and the status of illustrative versus observational data. Avoid copying book images or proprietary examination questions.

## 6. Revision and assessment UX

Revision: preserve full numbered scope; display small retrieval cues, terms, misconceptions and reveal controls. Link directly to the corresponding Learn understanding and relevant practice. Never show fabricated mastery percentages or an algorithmic spaced-repetition schedule without genuine attempt events and a reviewed data contract.

Practice: clearly separate Paper 1A single-best-choice, Paper 1B data interpretation and Paper 2 written explanation. Associate each question with a syllabus ID, show selection/try-again feedback, compare all distractors, support keyboard, include legible captioned tables and units, and allow written draft + user-triggered marking point reveal. Never auto-award marks for unassessed written prose. `Review missed questions` is based on actual in-session selection state only, not a persistent skill estimate. The prototype implements these behaviors with its own in-memory UI, not production progress.

## 7. Prioritized integration checklist (no modifications performed)

| Priority | Existing production file | Proposed improvement | Complexity | Test and risk |
|---|---|---|---|---|
| **P0** | `src/biology/learning/LessonView.tsx` + `biology.css` | Improve small-screen understanding navigation with an explicit compact `Sections` disclosure and focus management, rather than displaying the entire grid before every lesson. Preserve native ID text and deep links. | Medium | At 320/390/768, keyboard focus, SL/HL scope, direct refresh navigation and screen readers. Do not regress existing focus/scroll behavior. |
| **P0** | `src/biology/learning/ScientificFigure.tsx` + `biology.css` | Verify figure text remains readable on narrow screens and at zoom, with truly usable enlargement and detailed written alternative. | Medium | Check each figure at 320px and 200/400% text zoom; avoid clipped labels, lost description and modal trapping. |
| **P0** | `src/biology/learning/StudyQuestion.tsx` + `biology.css` | Ensure choices/feedback/retry preserve focus and accessible status. Explicitly separate incomplete, incorrect and correct states. | Small–Medium | Keyboard, VoiceOver/NVDA, no color-only feedback; avoid announcing overly long feedback on every change. |
| **P1** | `src/biology/components/BiologyDashboard.tsx`, `CurriculumOverview.tsx` | Tighten dashboard topic discovery: theme filter/search density, explicit planned/draft label, accessible active filter and honest 34/40 scopes. | Medium | 40-topic scalability, search on mobile, SL exclusions, no false completion. Do not diverge from registry. |
| **P1** | `src/biology/components/TopicOverview.tsx`, `UnderstandingLabel.tsx` | Strengthen ID/title hierarchy and group entry points; explain SL/HL and source-checked draft clearly. | Small | Ensure the registry is the sole source of descriptive titles; never reconstruct from display copy. |
| **P1** | `src/biology/learning/LessonView.tsx` | Consolidate hero/draft disclaimer and guide students from mechanism to diagram, worked application, recall and next section without excessive decorative cards. | Medium | Reading flow, focus on section change, 60–67ch width, student usability test. |
| **P1** | `src/biology/learning/StudyQuestion.tsx` | Enhance distractor explanations and Paper 1B/2 question format switching and explicit self-review patterns. | Medium | Required source IDs, original content and teacher review; no automatic marking. |
| **P1** | `src/biology/learning/ScientificFigure.tsx` | Standardize attribution, legend, original/recall image swap and source status. | Medium | Copyright/permissions, scientific validation, alt text and mobile assets. |
| **P2** | `src/biology/biology.css` | Refine spacing, type and focus/hover state tokens, keeping the existing LitLab brand. | Small | Visual regression light/dark, contrast audit and reduced-motion check. |

These are candidate improvements only. P0 indicates usability/accessibility risk to investigate, not an established production WCAG failure; no live site audit has been run.

## 8. Safe adoption procedure

1. Main integrator re-reads **latest** `feature/biology-foundation` HEAD and checks the current component names. This design branch is stale by design relative to concurrent content and science work.
2. Inspect the self-contained prototype and browser/screenshots. Review the P0 differences against what the current implementation already provides; discard duplicate changes.
3. Approve a narrow change set by component. Implement through the existing shadow DOM/token system, **not** by importing the prototype script or building a parallel app/registry.
4. Use source-of-truth curriculum registry IDs and real lesson JSON. Protect progress contract, English app, auth, and SL/HL filtering. Migrate no student data.
5. Run unit/contract validators, `npm ci`, `npm run quality`, `npm run build`, topic science negative tests, isolated English/biology browser CI, mobile and dark screenshots, accessibility and teacher/student review.
6. Obtain source/rights, qualified science, assessment, accessibility and owner approvals before any draft becomes public. A branch merge/PR/deployment requires new explicit authorization from the owner.

## 9. Risk register and known limitations

- **Concurrency:** foundation and independent content branch evolve separately. Do not force-update/cherry-pick blindly or overwrite their lessons.
- **Brand/theming:** production CSS uses an open shadow-root style string and inherited tokens. Prototype variables are demonstration tokens; direct CSS copy could conflict with live theme inheritance and route dock.
- **Routing/progress:** prototype hash routes, in-memory answer state and non-production topic directory must never replace production `#biology` routing, lesson-loader, registry, or storage contracts.
- **Legal/science:** guide/textbook are study references only. No logos, publisher diagrams, past papers or unlicensed photographs are included. All newly authored science examples still require independent human review.
- **Test boundary:** isolated local browser is not a complete code integration regression; no real authenticated session, multi-browser accessibility test, or production deployment was tested.
- **Performance:** standalone single-file HTML intentionally duplicates all styles/content in one page for portable review; production should retain existing lazy React imports and curriculum JSON, not ship this file as a student feature.

## 10. Outcome

The prototypes are demonstrable, responsive and interaction-tested; the design vocabulary is reusable across different diagrams, contexts and 40 topics. They are **ready for targeted integration review**, but **not** ready for direct production adoption or scientific/student efficacy claims. The main development branch remains untouched.