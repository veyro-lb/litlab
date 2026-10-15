# Biology foundation — Phase 2

## Boundary and routes

`src/main.tsx` keeps the existing React root and shared header. It lazy imports `src/biology/entry.tsx` only on `#biology` or `#biology/...`. The entry mounts a React portal inside an open shadow root: legacy document selectors, text replacement and MutationObservers cannot reach the Biology DOM. The shadow stylesheet is local to that module and inherits LitLab color and font tokens. Biology never enters the imperative special-route registry. Small route guards prevent the English route dock, announcement and automatic guest sign-in prompt appearing on Biology pages. The English-only tutor is scoped out of Biology until reviewed subject content exists. Authentication/session behavior is unchanged. The skip link focuses main content without treating its fragment as a new application route.

Routes: `#biology`, `#biology/theme/A` through `/D`, `#biology/topic/A1.1`. Unknown Biology paths remain in a Biology not-found view. Native anchors preserve direct links, refresh and history. Native radio inputs support keyboard course selection. Route transitions focus the Biology content without scrolling it unexpectedly. Subject selection is a shared React-owned band below the existing header, preserving its available width on English pages.

The only storage written by this milestone is `litlab:biology:preferences:v1` (`SL` or `HL`). No Biology completion, score or cloud synchronization is active. The separate future progress contract is `litlab:biology:progress:v1`. Storage denial leaves selection working in memory.

## Curriculum provenance

Scope documents were supplied in the conversation and read locally. Do not redistribute their full text or PDF assets through the site.

| Source | SHA-256 | Use |
| --- | --- | --- |
| Biology Guide 2025 - English.pdf | `910414afec33a9a3b1cdac92ff0e40b7a7a6e0083291db95a0376c5aee4e5af0` | First assessment 2025 topic placement, statement IDs, SL/HL and page references |
| dp_bio_gui_roadmap_en.pdf | `852cde621a37fceb2a13101e7e4ad2f6b161d4c13c3048b2654800d96c0d6735` | Four themes, four organization levels, 40 topic names and six HL-only topics |

Curriculum version: `ib-biology-fa2025-v1`. The supplied guide has a six-page PDF offset: printed page 34 is PDF page 40. Registry records include both page numbers and literal printed IDs. Four IDs have extra punctuation in the source: `A.2.3.4`, `B.2.1.9`, `C.1.2.17`, `C.2.1.2`. Internal normalized IDs remove that extra dot; no requirement is discarded or invented. Registry total: **553 statements; 337 shared, 216 additional HL**. Statement sequences were checked for duplicates and gaps after normalization.

Six wholly HL topics: A2.1, A2.3, A3.2, B3.3, C2.1, D2.2. SL shows 34 topics. HL shows 40. Within shared topics, statement-level flags control the overview (Water: six shared statements, two additional HL statements).

Registry prose is deliberately limited: names, identifiers and source locators, plus original draft Water summaries. `source-mapped` means checked against the supplied scope document, **not scientifically approved**. No qualified human reviewer has signed off a lesson. The guide itself can contain wording requiring scientific cross-checks; curriculum extraction must never substitute for scientific review.

Skills/NOS flags point to guide passages for a statement; they do not claim complete coverage of the separately described scientific skills framework. Guiding/linking question metadata points back to each topic's guide section; original prompts, detailed skills mappings, scientific references and reviewed explanations are Phase 3 authoring work. No external scientific imagery is shipped in Phase 2, so no unverified licenses or diagrams are presented.

## Validation

Run `npm ci`, `npm run quality`, `npm run build`, `npm audit --omit=dev --audit-level=high`, `node scripts/validate-biology.mjs`, and `node --test scripts/validate-biology.test.mjs`.

The registry validator checks the exact 40-topic roster, 553 numbered references, topic and statement levels, theme/organization consistency, version, source metadata, review status and unsupported lesson references. Its negative tests deliberately damage records to ensure errors are detected. Counts and shared-statement cutoffs are independently recorded from the supplied guide. This is structural/source mapping validation, not independent scientific certification.

The existing `biology-phase16-qa.yml` workflow retains the network-none Docker browser environment, CDP allowlist and production dependency audit. The expanded smoke suite exercises the existing 30 English route renders and interactions, plus Biology search, routing, selection, keyboard behavior, history, desktop/mobile, light/dark and synthetic English progress invariance. No production data or authenticated writes are used. `continue-on-error` collects evidence, and the final workflow gate fails on any unsuccessful or skipped check.

## Lesson design contract

`learning/lesson-contract.ts` defines a single scientific content model for Learn and Revision views, section-level SL/HL scope, claim references, misconceptions, worked examples, recall, diagrams and original practice questions. Every asset requires source, permission evidence, license, attribution, alt text and scientific review. Approval requires named qualified human review and supporting references. No lesson renderer or fake assessment is exposed before content is ready.

Planned interactions must have keyboard equivalents and explanatory feedback. Review scheduling must depend on recorded performance, never invented confidence or completion. An upcoming lesson needs a meaningful graph interpretation or mechanism activity, not decorative clicks. Future label and sequence activities need validated science and accessible alternatives.

## Owner action: main branch protection

The GitHub integration returned 403 when reading branch protection; its active enforcement is **unconfirmed**. No settings were changed.

In GitHub → `veyro-lb/litlab` → Settings → Rules → Rulesets, create or inspect a branch ruleset targeting `main`. Set enforcement to Active. Require a pull request, at least one approving review, dismissal of stale approvals and resolution of review conversations. Require the branch to be up to date, block force pushes and deletion, and avoid an administrative bypass for normal development. Keep deployment behind your existing authorized merge process.

The existing PR workflow is `LitLab CI` with job `build`. Require that check after it appears for a PR. The isolated Biology baseline currently triggers on development-branch pushes only; do not assume it will run on a main-targeted PR or configure an impossible required check. Before release, extend the safe test workflow to `pull_request: branches: [main]`, verify it on the approved PR, then also require its `Checkout, quality, build, audit, isolated browser` job. No PR or production deployment is authorized in this milestone.

## Next milestone: A1.1 Water

1. Agree a small lesson storyboard: prerequisites → polarity/bonding → cohesion/adhesion → solubility → physical properties/habitats; keep the two additional HL statements separate.
2. Map every one of the eight statement IDs, guide guidance, inquiry questions, skills and NOS requirements to original lesson sections. Have an IB Biology teacher confirm the mapping.
3. Cross-check claims with appropriate scientific textbooks/primary academic sources; record claim-specific references and any disagreements. Verify structural notation, hydrogen bonds versus covalent bonds, aquatic property comparisons and the scope of the HL origin-of-water discussion.
4. Select accurate diagrams and relevant authentic images. Record reuse permissions, attributions, alt text and scientific checks before integration. No AI diagram is accepted as verified without review.
5. Implement a shared Learn/Revision content renderer and a small number of useful interactions: label/reason about polarity and bonding; predict and explain cohesion/adhesion; interpret habitat-property comparisons. Add keyboard and nonvisual alternatives.
6. Author original recall and Paper 1A/1B/2-style questions with reviewed marking points and explanations for errors. Do not use protected IB past-paper material.
7. Obtain named, qualified human scientific and assessment review before any approved/verified label. Run student usability sessions on mobile and desktop; use observed understanding and errors to refine explanations. Record feedback without inventing efficacy claims.
8. Only then activate honest local attempt/review progress, verify English invariance and repeat the isolated regression suite. Cloud sync and release remain separately scoped.

Phase 3 has not been started by this foundation.

## Phase 3 Water draft update

A1.1 now links to `a1-1-water-v1` with availability `draft`; the source-mapping review status remains `source-mapped`. The other 39 topics retain strict planned-only validation. Stable nested routes `/learn`, `/revision`, `/practice`, `/sources` preserve the existing overview route. See [Water review packet](WATER_REVIEW_PACKET.md) for scope, reference/asset provenance and release gates. The reviewed-learning content is a source-checked draft, not approved.

The shared renderer consumes `learning/water/lesson.json`; source records and claim mappings live alongside authored content. `content.ts` uses inferred TypeScript data types so new fields remain checked at their actual use sites. Memory-only study state is stored in a module-level map to survive route/subject unmounts; it is cleared on full refresh. No Biology progress or English storage keys are written. `validate-water.mjs` validates the draft contract and rejects unsupported approval metadata.

## Phase 3.1 numbered, reusable draft system

`UnderstandingLabel` reads immutable IDs and original descriptive `studentTitle` values from the existing curriculum registry. Sections retain IDs, not duplicate titles. Overview links, Learn/Revision headings/navigation and practice use the same label component. `?understanding=<ID>` hash parameters support fresh-load section targeting, revision-to-explanation and mapped practice. SL cannot render HL sections or questions, including a direct HL link.

`LessonLoader` loads only registered catalog entries; `lesson-loader.ts` uses Vite lazy imports, emitting individual lesson chunks. `LessonView` receives topic and lesson props, with no Water-specific routes, section IDs or figure captions. Optional mechanism blocks and explorers are content-driven. Memory is keyed by lesson ID and remains ephemeral. `validate-lesson.mjs` checks source-of-truth coverage, titles, levels, activities, questions, evidence, rights fields and named approval; synthetic renderer tests exercise different section counts and an entirely HL topic without public dummy content.

The independent pack was integrated as supplementary research, with its H–O–H angle notation corrected. See [scientific review](WATER_PHASE31_SCIENCE_REVIEW.md) and [production specification](LESSON_PRODUCTION_SPEC.md). Neither technical reuse nor source cross-checking supplies qualified human approval. No new lesson, PR or production integration is authorized here.
