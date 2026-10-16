# Phase 7 — Scoped content-transfer instructions

**Owner:** `feature/biology-phase7-batch3-content-20261016`. **Exact verified baseline:** `8ae2914fd5293829997842b7491320dc471af1c9`. Last checked Phase 6 HEAD: `9134a34160a812cfebeeddd50ec805a75d972239` (read-only).

## Transfer only these new files
- `src/biology/learning/membranes-transport/lesson.json`
- `src/biology/learning/organelles-compartmentalization/lesson.json`
- `public/biology/membranes-transport/*.svg` (34 original SVG files)
- `public/biology/organelles-compartmentalization/*.svg` (18 original SVG files)
- Optional docs: `docs/biology/phase7/`
- Optional CI: `scripts/validate-phase7-batch3.mjs`, `scripts/validate-phase7-batch3.test.mjs`

## Proposed shared modifications: NOT MADE
The already existing B2.1 and B2.2 topic records need the fields `lessonId`, `studentTitle`, and approved registry states. `docs/biology/phase7/registry-proposal.json` holds the exact two complete candidate topic records for the integrator to compare and adapt, not blindly replace. `docs/biology/phase7/catalog-proposal.json` proposes only two new catalog records for later adoption. Do not apply until application and scientific review allow safe draft routing.

## Phase 6 read-only compatibility observation
Phase 6 added optional `molecularViewer` and `graphTables` fields to `lesson-contract.ts`. These do not invalidate the existing Phase 7 section shapes. Phase 6 added extra generic validator guards for those optional fields and registered A1.2/C1.1, but has not registered B2.1 or B2.2 at the checked commit. Re-run latest checks at actual integration time because the Phase 6 branch is mutable.

## Acceptance sequence
1. Selectively transfer only the new content and SVG paths; do not merge branch wholesale.
2. Run `node scripts/validate-phase7-batch3.mjs` and `node --test scripts/validate-phase7-batch3.test.mjs`.
3. Compare B2.1/B2.2 proposed records against latest live registry without replacing A1.2/C1.1 work.
4. Integrator performs necessary registry/catalog changes, then runs `node scripts/validate-lessons.mjs`, existing Phase 6 test suite and `npm run build`.
5. Preview both levels and understanding deep-links; check 320px, desktop, light/dark, keyboard/screen readers and actual figure labels.
6. Complete subject-specialist and owner review before student/public release.

No merge, deployment, PR or live registry change was carried out by Phase 7.
