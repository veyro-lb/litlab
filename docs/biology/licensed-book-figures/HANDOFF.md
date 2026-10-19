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

Local Chromium execution is unavailable in this restricted runtime: the downloaded Playwright Chromium exits with SIGTRAP before opening a page. The branch's existing GitHub preview-readiness workflow runs the full browser suite in its supported Playwright container, including the new crop-specific desktop/mobile checks. The full supported-container workflow passed at integration commit `fc16dd553365f6b635b32d2cb762fad8fb186c08`: https://github.com/veyro-lb/litlab/actions/runs/39211233564.

Results: 78/78 screenshot-placement checks (39 placements at 1440 and 390 px), all 26 served screenshot hashes, 717 preview-readiness checks including all 553 understandings, 68 full-course checks, 38 UI-acceptance checks, and 230 prelaunch-student checks. Zero page errors were reported. The workflow retains the source figures and rendered browser screenshots as evidence. A live public-preview run of the same screenshot checks is now included in this workflow as well.

The pre-existing course-depth audit still reports broader content-review work outside this screenshot task (58 exact Hodder section pointers absent in other topics; 545 entries needing further depth work). Screenshot integration does not imply independent scientific signoff for the full course.

## Preview

The existing Vercel Git integration targets the development project `litlab-biology-phase6-preview-20261016` (`prj_DZO4QeHRXru9z9zjqYR3UGot28eQ`). The parent commit has a READY deployment with `target: null` (preview). The updated branch will use that same preview integration. Production remains untouched.

## Verified public branch preview

https://feature-biolab-original-textbook-crops-20261019-litlab.jamesloom18.workers.dev/#biology/topic/C1.2/learn?understanding=C1.2.12

The existing automatic Cloudflare branch preview serves the restored figures without authentication. Live browser inspection confirmed the original Krebs image in C1.2.12, its visible book/figure/page credit and caption, and the working enlargement dialog at 150% zoom. The served Krebs PNG SHA-256 matches the source register. Select HL to view the additional higher-level mechanisms.

Vercel also reports a READY preview for the exact integration commit, deployment `dpl_FPmmSHecT56eNExipWGazV7BjyVA`, with target null (preview). The Vercel URL requires sign-in and the connector could not generate a bypass link; the public Cloudflare branch URL above is the shareable deliverable. Production and main were not changed.
