# Screenshot restoration handoff

## Revision and scope

Continued remote branch `feature/biolab-original-textbook-crops-20261019` from verified HEAD `268415f2c744699d860976212406142d9c35d658`.

Added 12 original Hodder crops; total **26** integrated screenshots (**14 Hodder / 12 IB Biology Drawings**), **39** placements, **15** topics. All required mechanisms and cycles listed in the task are now actual textbook screenshots. All previous 14 screenshot bytes are preserved. No required priority screenshots remain missing. The optional synapse figure is not included.

Full figure/page/understanding/section mappings and replacements are in `README.md` and `FIGURE_SOURCE_REGISTER.json`.

## Verification

Passed locally:

- 40 lesson packages: mapping, content structure, scope, provenance and asset files.
- Biology registry: 40 topics / 553 understandings / 337 shared and 216 HL.
- Full-course depth structural audit and final-consolidation validation.
- Source register: all 26 SHA-256 hashes; exact placements, credits, required figure inventory, and no stale mobile/recall substitutions.
- Re-extraction of all 12 new crops reproduces their registered hashes exactly.
- 20 figure presentation, visual redesign and scientific-asset regression tests.
- Site quality, TypeScript/Vite build and public-build private-file gate.
- Visual inspection of the 12 rendered source crops: labels, arrows, annotations and complete cycle structures retained.

Local Chromium execution is unavailable in this restricted runtime: the downloaded Playwright Chromium exits with SIGTRAP before opening a page. The branch's existing GitHub preview-readiness workflow runs the full browser suite in its supported Playwright container, including the new crop-specific desktop/mobile checks. Remote workflow/preview results will be recorded after that run.

The pre-existing course-depth audit still reports broader content-review work outside this screenshot task (58 exact Hodder section pointers absent in other topics; 545 entries needing further depth work). Screenshot integration does not imply independent scientific signoff for the full course.

## Preview

The existing Vercel Git integration targets the development project `litlab-biology-phase6-preview-20261016` (`prj_DZO4QeHRXru9z9zjqYR3UGot28eQ`). The parent commit has a READY deployment with `target: null` (preview). The updated branch will use that same preview integration. Production remains untouched.
