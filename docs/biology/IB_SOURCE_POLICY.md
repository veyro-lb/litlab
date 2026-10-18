# BioLab — strict IB educational-source policy

**Scope:** 40-topic BioLab lesson catalog on `feature/biolab-ib-final-base-20261018` (`73f6278c6f8d941f2eeb68b836459efe78572a0b`); audit date 2026-10-18. This branch changes shared Sources rendering only, not editorial lesson content.

## Student-facing educational authorities

1. **International Baccalaureate Organization (2023). _Diploma Programme Biology guide_, first assessment 2025.** Official syllabus and scope/assessment authority. Student link: https://ibo.org/programmes/diploma-programme/curriculum/sciences/biology/ (official subject page; full guide may be restricted to the IB Programme Resource Centre).
2. **C. J. Clegg, Andrew Davis and Christopher Talbot (2023). _Biology for the IB Diploma Programme_, Third Edition. Hodder Education. ISBN 9781398364240.** An independently published coursebook developed and reviewed in cooperation with the IB. **Not an official IB publication.** Publisher listing: https://www.hachettelearning.com/biology/biology-for-the-ib-diploma-third-edition.

These are two distinct authorities, each rendered **exactly once per Sources page**, independently of potentially repeated or mislabelled `lesson.references` entries. They are hardcoded as a typed, canonical whitelist in `src/biology/learning/source-policy.ts`. Never treat raw lesson reference IDs, titles, domains or scope alone as authority approval.

## What belongs where

- **Principal educational sources:** exactly the two entries above. Exclude NCBI Bookshelf, StemBook, PMC/PubMed, generic OpenStax, unrelated research, specialist institutional content and observations from this educational authority list.
- **Media, observation and data credits:** genuine authorship, licences, terms, reuse links and source datasets are retained where used, but separated from principal teaching authorities. An original project drawing is not automatically a CC-licensed third-party figure. NASA/NOAA observations, photographs, micrographs and legitimate scientific corroboration do not imply IB endorsement.
- **Internal evidence:** preserve detailed external references and review metadata in the lesson data for the editorial and scientific review pipeline. The Sources panel must not dump raw `lesson.references`, audit notes, access dates or figure permission metadata.
- **Editorial evidence gaps:** continue to teach scientifically necessary explanations. Do not remove them solely because an external citation is inappropriate; cross-check each flagged claim against the IB guide and Hodder coursebook, and replace only an example or assertion that cannot be supported within the restricted policy. Never invent page locators or substitute a false citation.

## Source-to-understanding editorial ledger

**40 packages inspected; 253 understanding IDs flagged** (A 41, B 58, C 63, D 91). A flag means a claim has an outside-policy reference, including cases with both an approved and supplemental citation. It is a request for editorial verification, **not a finding that the biology is incorrect**. The machine-readable snapshot is `docs/biology/IB_SOURCE_UNDERSTANDING_LEDGER.json`.

- **A1.1:** A1.1.1, A1.1.2, A1.1.3, A1.1.4, A1.1.5, A1.1.6, A1.1.7, A1.1.8
- **A1.2:** A1.2.1, A1.2.2, A1.2.3, A1.2.4, A1.2.5, A1.2.6, A1.2.7, A1.2.8, A1.2.9, A1.2.10, A1.2.11, A1.2.12, A1.2.13
- **A2.1:** A2.1.9
- **A2.2:** A2.2.1, A2.2.2, A2.2.3, A2.2.4, A2.2.5, A2.2.6, A2.2.7, A2.2.8, A2.2.9, A2.2.10, A2.2.11, A2.2.12, A2.2.13, A2.2.14
- **A2.3:** A2.3.6
- **A3.1:** none
- **A3.2:** none
- **A4.1:** none
- **A4.2:** A4.2.3, A4.2.4, A4.2.5, A4.2.8
- **B1.1:** B1.1.4, B1.1.5, B1.1.6, B1.1.7, B1.1.8, B1.1.9, B1.1.10, B1.1.11, B1.1.12, B1.1.13
- **B1.2:** B1.2.1, B1.2.2, B1.2.3, B1.2.4, B1.2.5, B1.2.6, B1.2.7, B1.2.8, B1.2.9, B1.2.10, B1.2.11, B1.2.12
- **B2.1:** B2.1.1, B2.1.2, B2.1.3, B2.1.4, B2.1.5, B2.1.6, B2.1.7, B2.1.8, B2.1.9, B2.1.10, B2.1.11, B2.1.12, B2.1.13, B2.1.14, B2.1.15, B2.1.16, B2.1.17
- **B2.2:** B2.2.1, B2.2.2, B2.2.3, B2.2.4, B2.2.5, B2.2.6, B2.2.7, B2.2.8, B2.2.9
- **B2.3:** B2.3.1, B2.3.2, B2.3.3, B2.3.4, B2.3.5, B2.3.6, B2.3.8, B2.3.9, B2.3.10
- **B3.1:** none
- **B3.2:** B3.2.11
- **B3.3:** none
- **B4.1:** none
- **B4.2:** none
- **C1.1:** C1.1.1, C1.1.2, C1.1.3, C1.1.4, C1.1.5, C1.1.6, C1.1.7, C1.1.8, C1.1.9, C1.1.10, C1.1.11, C1.1.12, C1.1.13, C1.1.14, C1.1.15, C1.1.16, C1.1.17
- **C1.2:** C1.2.1, C1.2.2, C1.2.3, C1.2.4, C1.2.5, C1.2.6, C1.2.7, C1.2.8, C1.2.9, C1.2.10, C1.2.11, C1.2.12, C1.2.13, C1.2.14, C1.2.15, C1.2.16, C1.2.17
- **C1.3:** C1.3.1, C1.3.2, C1.3.3, C1.3.4, C1.3.5, C1.3.6, C1.3.7, C1.3.8, C1.3.9, C1.3.10, C1.3.11, C1.3.12, C1.3.13, C1.3.14, C1.3.15, C1.3.16, C1.3.17, C1.3.18, C1.3.19
- **C2.1:** none
- **C2.2:** none
- **C3.1:** C3.1.11, C3.1.14, C3.1.15, C3.1.22
- **C3.2:** C3.2.11, C3.2.13, C3.2.14, C3.2.17
- **C4.1:** none
- **C4.2:** C4.2.11, C4.2.20
- **D1.1:** D1.1.1, D1.1.2, D1.1.3, D1.1.4, D1.1.5, D1.1.6, D1.1.7, D1.1.8, D1.1.9
- **D1.2:** D1.2.1, D1.2.2, D1.2.3, D1.2.4, D1.2.5, D1.2.6, D1.2.7, D1.2.8, D1.2.9, D1.2.10, D1.2.11, D1.2.12, D1.2.13, D1.2.14, D1.2.15, D1.2.16, D1.2.17, D1.2.18, D1.2.19
- **D1.3:** D1.3.1, D1.3.2, D1.3.3, D1.3.4, D1.3.5, D1.3.6, D1.3.7, D1.3.8, D1.3.9, D1.3.10
- **D2.1:** D2.1.1, D2.1.2, D2.1.3, D2.1.4, D2.1.5, D2.1.6, D2.1.7, D2.1.8, D2.1.9, D2.1.10, D2.1.11, D2.1.12, D2.1.13, D2.1.14, D2.1.15, D2.1.16, D2.1.17
- **D2.2:** D2.2.1, D2.2.2, D2.2.3, D2.2.4, D2.2.5, D2.2.6, D2.2.7, D2.2.8, D2.2.9, D2.2.10, D2.2.11
- **D2.3:** D2.3.1, D2.3.2, D2.3.3, D2.3.4, D2.3.5, D2.3.6, D2.3.7, D2.3.8, D2.3.9, D2.3.10, D2.3.11
- **D3.1:** none
- **D3.2:** D3.2.7, D3.2.9, D3.2.12
- **D3.3:** D3.3.4, D3.3.7, D3.3.8
- **D4.1:** D4.1.8, D4.1.12
- **D4.2:** D4.2.8, D4.2.11
- **D4.3:** D4.3.1, D4.3.4, D4.3.10, D4.3.12

### Targeted editorial checks

- **A1.1.6:** verify the density-of-water statement carefully. The supplied Hodder chapter contains a documented density error; at ordinary pressure pure liquid water is densest near 4°C. Preserve the correct explanation.
- **A1.1.7–A1.1.8, A2.1.9, A2.3.6:** scrutinize specific extra-terrestrial water origins, ancient hydrothermal evidence and modern HIV/influenza examples, rather than implying those specialist reports were approved by the IB.
- **A4.2.3–A4.2.8, C3.2.11–C3.2.17, D1.3.1–D1.3.10:** examine locality-specific conservation studies, modern disease claims and current gene-editing approvals. If not supported by guide/coursebook examples, seek editorial replacement.
- **D4.3.1, D4.3.4, D4.3.10, D4.3.12:** distinguish measured NASA/NOAA data and observational studies from instructional authority. Preserve dataset attribution in media/data credits; replace unsupported specific illustrations if necessary.

## Validation

Run `node --experimental-strip-types --test scripts/biology/source-policy/source-policy.test.mjs` for whitelist, unrelated-link exclusion, credit preservation and responsive CSS structure.
Run `node scripts/biology/source-policy/verify.mjs` to inspect all 40 lesson source mappings and print exact understanding IDs. Use `--json` for machine-readable claim excerpts or `--write` to regenerate the JSON ledger when editorial branches change.
Run existing `node scripts/validate-lessons.mjs`, `node scripts/validate-biology.mjs`, `npm run quality`, and `npm run build` in a clean checked-out repository before accepting a release. Complete real mobile (e.g. 390px) and desktop (e.g. 1440px) browser checks separately; static CSS checks are not substitutes for visual screenshots.

**Publication and IP note:** cite and link the IB guide and independent Hodder coursebook, but do not reproduce their protected text or diagrams wholesale, and do not claim formal endorsement, licensing or certification of BioLab.

## Verification evidence and release gate (2026-10-18)

- **Completed:** inspected all 40 topic `lesson.json` packages without changing them; classified external instructional citations and recorded 253 affected understanding IDs. The full topic-by-topic handoff is in the JSON ledger.
- **Completed:** 16 static architecture and policy assertions against actual files fetched from the isolated GitHub branch passed, including removal of the raw references loop, canonical whitelist links, duplicate IDs, restricted external links, licence separation and mobile CSS selectors.
- **Completed:** two standalone Node 22 source-policy behavior checks on a locally mirrored policy module passed. These cover the fixed two-source educational catalog and SL/HL media-credit behavior. They do **not** replace running the committed repository test suite.
- **Completed (isolated visual previews only):** Chromium tested a faithful standalone HTML preview at 390px and 1440px, with two visible educational cards and no horizontal page overflow. The resulting PNG screenshots are preview artifacts, **not screenshots of the integrated BioLab application**.
- **Not completed:** `npm ci`, the committed source-policy test suite in an actual repository checkout, existing lesson validators, `npm run quality`, `npm run build`, or a 40-route integrated Playwright sweep. The execution environment has no network access for Git checkout; existing GitHub Actions workflows do not trigger on the new isolated branch. **This branch is not production-qualified until these checks pass.**

Do not merge or deploy on the basis of this verification alone.
