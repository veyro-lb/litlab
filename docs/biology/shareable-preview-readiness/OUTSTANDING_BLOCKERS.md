# Remaining Issues and Release Boundaries

## Resolved technical blockers
- A1.2.7 missing registered figure placement — fixed; exact lesson validator passes.
- Consolidation-ledger outdated review count — fixed while enforcing 553 distinct understandings and no false scientific sign-offs.
- False-negative SL and outdated source-title/disclaimer acceptance assertions — repaired with meaningful waits and current verified copy.
- High-resolution TEM could not pan in 320 px dialog — fixed; original prelaunch failure now passes.
- Seven original npm audit advisories — resolved via compatible updates; final tested full/production audits both zero.
- Anonymous Cloudflare preview tested in Chromium, not assumed from an HTTP 200 alone.

## Still outstanding before production / exam-authority claims
1. **Scientific sign-off:** Only **13 of 553** syllabus understandings were individually source-reviewed in this audit cycle; **540 remain** awaiting individual depth review. **No independent scientific sign-off** exists for any understanding. Content should be reviewed in evidence-based batches, not stamped approved in bulk.
2. **Publisher IP:** Hodder/IB reference files, protected diagrams and 18 removed crops cannot be reintroduced to the public build absent explicit redistribution rights. All first-party drawings with pending owner-publication approval wording should be cleared before unrestricted wider use.
3. **Precise Cloudflare revision provenance:** Public functionality passes, but exact Cloudflare worker-deployment-to-source SHA cannot be independently attested from the available public evidence.
4. **Accessibility/manual review:** No complete WCAG audit, real screen-reader assessment, comprehensive manual scientific diagram-label sign-off or native device testing has been performed.
5. **Accounts and real services:** Anonymous routes/activities tested; user-specific authentication, persistence across actual accounts and real student data were intentionally not exercised.
6. **Deployment governance:** Production custom domain, production settings and `main` were not touched. Production approval requires a separate documented release, rights and science-review decision.

## Share decision
**Limited anonymous development demonstration:** technically suitable based on passed CI/browser/remote checks, provided it remains conspicuously labelled draft, student-made, independent and not IB endorsed. **Production launch or approved exam-reference claim:** blocked pending the separate scientific, legal/owner permission and accessibility governance work above. Do not call another branch's or newer commit's CI green until its exact workflow run is successful.
