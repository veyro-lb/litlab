# Cloudflare Branch-Preview Verification

## Public development URL
**https://feature-biolab-preview-qa-fixes-20261018-litlab.jamesloom18.workers.dev/#biology**

This was provided by the **existing automatic Cloudflare branch-preview infrastructure**, not a new project or production deployment. The host opens without authentication, and browser checks were run without credentials or student accounts. Production LitLab custom domains and `main` were not modified; the consolidated branch remains at `f7adf6be2453cd4f9fc1aad4df76c97a4c2764e1`.

## Observed deployed functionality
Separate real remote Chromium tests on the public `workers.dev` URL passed **12/12**, with **zero page-level JavaScript errors**, including:
1. Anonymous `#biology` landing and independence disclaimer at desktop/mobile.
2. A1.2.7 direct link loads the correct reading content.
3. `a12-sugars` and `a12-dna-rna-comparison` both load as images and appear beside the correct teaching blocks at 1440 and 390 px.
4. MCQ answer submission shows correct feedback.
5. Figure zoom dialog enlarges and closes by Escape.
6. A1.2 practice structured response reveals marking guidance.
7. A1.1, C1.2, C1.3, D1.1 and D2.1 direct Biology lesson routes load.

[Read the remote Chromium results and screenshots](https://github.com/veyro-lb/litlab/actions/runs/39166463849). The source test is `scripts/biology/preview-readiness/deployed-browser.mjs`, and it contains no login automation.

## Exact deployment revision limitation
The public site's behavior proves inclusion of the A1.2.7 two-figure fix, but Cloudflare did not expose an independently verified deployment-to-Git-SHA attestation in the available inspection. **Do not assert that the deployed Workers bundle corresponds byte-for-byte to the latest branch commit.** Require deployment metadata/source-to-build attestation for that precise claim. The latest local built app receives full CI separately.

## Release classification
Status: **shareable, work-in-progress development preview for limited demonstration**, subject to documented source/content rights caveats. **Not** a verified production rollout, independent scientific approval, official IB certification, or endorsement.
