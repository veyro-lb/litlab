# Official IB Biology understanding titles — final verification report

Date: 2026-10-18
Parent: `73f6278c6f8d941f2eeb68b836459efe78572a0b` (`feature/biolab-all-sprints-integration-20261018`)
Task branch: `feature/biolab-official-understanding-titles-20261018`

## Source-mapping method
Primary source: uploaded *Biology Guide 2025 - English.pdf*, first assessment 2025, printed syllabus pages 34–107 (PDF pages 40–113). All 553 official numbered content-heading lines were extracted from the uploaded PDF and matched by canonical understanding ID. The four source typography variants (A.2.3.4, B.2.1.9, C.1.2.17, C.2.1.2) were normalized **only for matching**; unchanged printed IDs remain stored in the registry.

## Results
- Themes: A, B, C and D.
- Topics checked: **40 of 40**.
- Understanding IDs and official source headings checked: **553 of 553**, with no missing or duplicate IDs.
- Titles updated: **550**.
- Existing titles kept unchanged: **3** (A1.1.1, A2.2.14, D4.2.15).
- Official headings reproduced exactly as student titles: **518**.
- Unusually long headings carefully abbreviated in student titles: **35**. Original Guide heading retained in `TITLE_CROSSWALK.json`.
- SL/HL levels verified against official HL-only topic scope and additional-HL boundaries: **553 of 553** (216 HL-specific, 337 shared).
- Printed Guide and PDF page references verified for every entry.
- Non-`studentTitle` registry fields changed: **0**. The registry text was edited solely at existing `studentTitle` string values.

## Before and after

| Code | Previous title | New title | Official printed page |
| --- | --- | --- | --- |
| A4.2.1 | Biodiversity has three connected levels | Biodiversity as the variety of life in all its forms, levels and combinations | 47 |
| A4.2.3 | Human-driven extinctions across three cases | Causes of anthropogenic species extinction | 47 |
| A4.2.5 | Measure the biodiversity crisis without confusing metrics | Evidence for a biodiversity crisis | 48 |
| A4.2.7 | Combine in situ, restoration and ex situ conservation | Need for several approaches to conservation of biodiversity | 48 |
| A4.2.8 | EDGE prioritizes threatened evolutionary history | Evolutionarily distinct and globally endangered species in the EDGE of Existence programme | 48 |
| A1.2.6 | Antiparallel double-stranded DNA | DNA double helix: antiparallel strands and hydrogen-bonded complementary base pairs | 36 |
| C1.3.7 | Test limiting factors experimentally | Experimental variation of carbon dioxide, light and temperature to test photosynthesis limiting factors | 70 |
| D4.1.11 | Selection changes allele frequencies | Allele-frequency changes through natural selection on heritable traits | 103 |

## Existing display architecture
Reviewed `UnderstandingRows.tsx`, `UnderstandingLabel.tsx`, `schema.ts`, and relevant Biology CSS. The understanding rows and labels already reference the registry's canonical `studentTitle`; list links and SL/HL indicators are unchanged. The existing CSS supports line wrapping and narrow-screen layout. No TSX, CSS, route or lesson file changes were made.

## Checks performed
**Passed (registry/source level):** 553 unique Guide matches, 40 intact topics, matching existing source page references, 553 SL/HL comparisons, preserved registry ordering, exact preservation of every non-title property, valid JSON after string-only substitution, canonical title consistency, and A4.2 heading spot checks.

**Not executed:** `npm ci`, `npm run quality`, `npm run build`, curriculum validator commands, browser tests, live deep-link clicks, mobile/desktop visual review, and application screenshots. These cannot be asserted as passed in this repository-connector-only editing environment. No screenshots were fabricated.

## Required integration gate
1. Check out `feature/biolab-official-understanding-titles-20261018` (do not alter main) and confirm commit ancestry.
2. Run `npm ci`, `npm run quality`, `npm run build` and the repository's curriculum/registry validators and Playwright/browser checks.
3. Test A4.2 and an SL plus HL lesson for each theme, checking topic lists, lesson sidebar, current-understanding headings, deep links, long-title wrapping and status indicators on mobile and desktop.
4. Capture actual application screenshots and add testing evidence to the handoff.
5. Review all 35 shortened titles against the crosswalk and obtain any necessary IB licensing/rights clearance before republishing a substantial collection of official Guide headings.
6. Integrate only after resolving concurrent work conflicts and runtime tests; do not deploy, merge to main or overwrite current work automatically.
