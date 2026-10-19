# Theme D — post-edit review record (2026-10-18)

Branch: `feature/biolab-ib-theme-d-final-20261018`. This record supplements, rather than replaces, `UNDERSTANDING_DEPTH_LEDGER.json` and `COVERAGE_MATRIX.json`.

## Scope and findings

- Re-read all 171 current understanding sections in the GitHub branch and counted explanation-only words, not term lists, prompts, assets or review questions.
- 171 unique syllabus IDs; 101 shared, 70 HL-only.
- All 171 have at least 150 explanation words; this is a quantitative screen **not** proof of scientific or pedagogical completeness.
- Rewrote D1.1.6 (HL strand polarity, direction, primer dependency) and D2.3.10 (signed Ψw calculation and net water movement) to remove repeated explanations and add clearer worked reasoning. These sections were edited in their own lesson JSON only, without touching figures, assessment interactions, registry or other teams' files.
- Existing 171-row source crosswalk and deeper ledger remain authoritative for the Guide/Hodder locator mapping. A line-by-line independent expert comparison has **not** been completed here. Do not label the sections externally certified.

## Topic counts after edits

| Topic | IDs | Shortest main explanation (words) |
|---|---:|---:|
| D1.1 | 9 | 153 |
| D1.2 | 19 | 156 |
| D1.3 | 10 | 155 |
| D2.1 | 17 | 180 |
| D2.2 | 11 | 183 |
| D2.3 | 11 | 209 |
| D3.1 | 20 | 165 |
| D3.2 | 21 | 159 |
| D3.3 | 11 | 165 |
| D4.1 | 15 | 150 |
| D4.2 | 15 | 150 |
| D4.3 | 12 | 167 |

## Required follow-up

1. Subject-specialist verification against each individual IB Guide statement and its Hodder chapter; prioritize scientific scope and HL restrictions over length. Log confirmed missing concepts explicitly rather than inventing deficiencies from word counts.
2. Local runtime QA: run `node --test scripts/biology/theme-d-final-20261018/*.test.mjs`, the project lesson validators and course checks, then the build and browser script. The available GitHub connector cannot execute local Node/Vite/Playwright commands; **none are represented as passing** here.
3. Preserve visual-lab ownership of SVG/figures, and assessment-team ownership of question patches. Consult `EXTERNAL_ASSET_REQUESTS.md` for pending figure requests.

## Machine-read audit (all 171 IDs)

```json
[
  {
    "id": "D1.1.1",
    "topic": "D1.1",
    "level": "shared",
    "words": 153,
    "sectionId": "d11-1",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.2",
    "topic": "D1.1",
    "level": "shared",
    "words": 161,
    "sectionId": "d11-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.3",
    "topic": "D1.1",
    "level": "shared",
    "words": 162,
    "sectionId": "d11-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.4",
    "topic": "D1.1",
    "level": "shared",
    "words": 199,
    "sectionId": "d11-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.5",
    "topic": "D1.1",
    "level": "shared",
    "words": 220,
    "sectionId": "d11-5",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.6",
    "topic": "D1.1",
    "level": "HL",
    "words": 206,
    "sectionId": "d11-6",
    "blocks": 3,
    "claimReferences": 1,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.7",
    "topic": "D1.1",
    "level": "HL",
    "words": 173,
    "sectionId": "d11-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.8",
    "topic": "D1.1",
    "level": "HL",
    "words": 225,
    "sectionId": "d11-8",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.1.9",
    "topic": "D1.1",
    "level": "HL",
    "words": 173,
    "sectionId": "d11-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.1",
    "topic": "D1.2",
    "level": "shared",
    "words": 231,
    "sectionId": "d12-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.2",
    "topic": "D1.2",
    "level": "shared",
    "words": 210,
    "sectionId": "d12-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.3",
    "topic": "D1.2",
    "level": "shared",
    "words": 206,
    "sectionId": "d12-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.4",
    "topic": "D1.2",
    "level": "shared",
    "words": 217,
    "sectionId": "d12-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.5",
    "topic": "D1.2",
    "level": "shared",
    "words": 215,
    "sectionId": "d12-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.6",
    "topic": "D1.2",
    "level": "shared",
    "words": 197,
    "sectionId": "d12-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.7",
    "topic": "D1.2",
    "level": "shared",
    "words": 178,
    "sectionId": "d12-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.8",
    "topic": "D1.2",
    "level": "shared",
    "words": 218,
    "sectionId": "d12-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.9",
    "topic": "D1.2",
    "level": "shared",
    "words": 169,
    "sectionId": "d12-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.10",
    "topic": "D1.2",
    "level": "shared",
    "words": 174,
    "sectionId": "d12-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.11",
    "topic": "D1.2",
    "level": "shared",
    "words": 209,
    "sectionId": "d12-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.12",
    "topic": "D1.2",
    "level": "HL",
    "words": 184,
    "sectionId": "d12-12",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.13",
    "topic": "D1.2",
    "level": "HL",
    "words": 190,
    "sectionId": "d12-13",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.14",
    "topic": "D1.2",
    "level": "HL",
    "words": 187,
    "sectionId": "d12-14",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.15",
    "topic": "D1.2",
    "level": "HL",
    "words": 156,
    "sectionId": "d12-15",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.16",
    "topic": "D1.2",
    "level": "HL",
    "words": 199,
    "sectionId": "d12-16",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.17",
    "topic": "D1.2",
    "level": "HL",
    "words": 216,
    "sectionId": "d12-17",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.18",
    "topic": "D1.2",
    "level": "HL",
    "words": 196,
    "sectionId": "d12-18",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.2.19",
    "topic": "D1.2",
    "level": "HL",
    "words": 191,
    "sectionId": "d12-19",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.1",
    "topic": "D1.3",
    "level": "shared",
    "words": 155,
    "sectionId": "d13-1",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.2",
    "topic": "D1.3",
    "level": "shared",
    "words": 218,
    "sectionId": "d13-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.3",
    "topic": "D1.3",
    "level": "shared",
    "words": 191,
    "sectionId": "d13-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.4",
    "topic": "D1.3",
    "level": "shared",
    "words": 226,
    "sectionId": "d13-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.5",
    "topic": "D1.3",
    "level": "shared",
    "words": 224,
    "sectionId": "d13-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.6",
    "topic": "D1.3",
    "level": "shared",
    "words": 219,
    "sectionId": "d13-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.7",
    "topic": "D1.3",
    "level": "shared",
    "words": 199,
    "sectionId": "d13-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.8",
    "topic": "D1.3",
    "level": "HL",
    "words": 224,
    "sectionId": "d13-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.9",
    "topic": "D1.3",
    "level": "HL",
    "words": 218,
    "sectionId": "d13-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D1.3.10",
    "topic": "D1.3",
    "level": "HL",
    "words": 163,
    "sectionId": "d13-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.1",
    "topic": "D2.1",
    "level": "shared",
    "words": 216,
    "sectionId": "d21-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.2",
    "topic": "D2.1",
    "level": "shared",
    "words": 201,
    "sectionId": "d21-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.3",
    "topic": "D2.1",
    "level": "shared",
    "words": 202,
    "sectionId": "d21-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.4",
    "topic": "D2.1",
    "level": "shared",
    "words": 198,
    "sectionId": "d21-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.5",
    "topic": "D2.1",
    "level": "shared",
    "words": 180,
    "sectionId": "d21-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.6",
    "topic": "D2.1",
    "level": "shared",
    "words": 185,
    "sectionId": "d21-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.7",
    "topic": "D2.1",
    "level": "shared",
    "words": 210,
    "sectionId": "d21-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.8",
    "topic": "D2.1",
    "level": "shared",
    "words": 224,
    "sectionId": "d21-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.9",
    "topic": "D2.1",
    "level": "shared",
    "words": 186,
    "sectionId": "d21-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.10",
    "topic": "D2.1",
    "level": "shared",
    "words": 212,
    "sectionId": "d21-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.11",
    "topic": "D2.1",
    "level": "shared",
    "words": 186,
    "sectionId": "d21-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.12",
    "topic": "D2.1",
    "level": "HL",
    "words": 199,
    "sectionId": "d21-12",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.13",
    "topic": "D2.1",
    "level": "HL",
    "words": 225,
    "sectionId": "d21-13",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.14",
    "topic": "D2.1",
    "level": "HL",
    "words": 185,
    "sectionId": "d21-14",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.15",
    "topic": "D2.1",
    "level": "HL",
    "words": 213,
    "sectionId": "d21-15",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.16",
    "topic": "D2.1",
    "level": "HL",
    "words": 199,
    "sectionId": "d21-16",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.1.17",
    "topic": "D2.1",
    "level": "HL",
    "words": 207,
    "sectionId": "d21-17",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.1",
    "topic": "D2.2",
    "level": "HL",
    "words": 231,
    "sectionId": "d22-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.2",
    "topic": "D2.2",
    "level": "HL",
    "words": 223,
    "sectionId": "d22-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.3",
    "topic": "D2.2",
    "level": "HL",
    "words": 222,
    "sectionId": "d22-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.4",
    "topic": "D2.2",
    "level": "HL",
    "words": 201,
    "sectionId": "d22-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.5",
    "topic": "D2.2",
    "level": "HL",
    "words": 199,
    "sectionId": "d22-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.6",
    "topic": "D2.2",
    "level": "HL",
    "words": 215,
    "sectionId": "d22-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.7",
    "topic": "D2.2",
    "level": "HL",
    "words": 183,
    "sectionId": "d22-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.8",
    "topic": "D2.2",
    "level": "HL",
    "words": 208,
    "sectionId": "d22-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.9",
    "topic": "D2.2",
    "level": "HL",
    "words": 216,
    "sectionId": "d22-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.10",
    "topic": "D2.2",
    "level": "HL",
    "words": 247,
    "sectionId": "d22-10",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.2.11",
    "topic": "D2.2",
    "level": "HL",
    "words": 212,
    "sectionId": "d22-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.1",
    "topic": "D2.3",
    "level": "shared",
    "words": 218,
    "sectionId": "d23-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.2",
    "topic": "D2.3",
    "level": "shared",
    "words": 232,
    "sectionId": "d23-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.3",
    "topic": "D2.3",
    "level": "shared",
    "words": 212,
    "sectionId": "d23-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.4",
    "topic": "D2.3",
    "level": "shared",
    "words": 295,
    "sectionId": "d23-4",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.5",
    "topic": "D2.3",
    "level": "shared",
    "words": 209,
    "sectionId": "d23-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.6",
    "topic": "D2.3",
    "level": "shared",
    "words": 210,
    "sectionId": "d23-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.7",
    "topic": "D2.3",
    "level": "shared",
    "words": 263,
    "sectionId": "d23-7",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.8",
    "topic": "D2.3",
    "level": "HL",
    "words": 242,
    "sectionId": "d23-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.9",
    "topic": "D2.3",
    "level": "HL",
    "words": 220,
    "sectionId": "d23-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.10",
    "topic": "D2.3",
    "level": "HL",
    "words": 224,
    "sectionId": "d23-10",
    "blocks": 3,
    "claimReferences": 1,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D2.3.11",
    "topic": "D2.3",
    "level": "HL",
    "words": 249,
    "sectionId": "d23-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.1",
    "topic": "D3.1",
    "level": "shared",
    "words": 183,
    "sectionId": "reproduction-1",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.2",
    "topic": "D3.1",
    "level": "shared",
    "words": 165,
    "sectionId": "reproduction-2",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.3",
    "topic": "D3.1",
    "level": "shared",
    "words": 177,
    "sectionId": "reproduction-3",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.4",
    "topic": "D3.1",
    "level": "shared",
    "words": 275,
    "sectionId": "reproduction-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 3,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.5",
    "topic": "D3.1",
    "level": "shared",
    "words": 242,
    "sectionId": "reproduction-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.6",
    "topic": "D3.1",
    "level": "shared",
    "words": 243,
    "sectionId": "reproduction-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.7",
    "topic": "D3.1",
    "level": "shared",
    "words": 182,
    "sectionId": "reproduction-7",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.8",
    "topic": "D3.1",
    "level": "shared",
    "words": 199,
    "sectionId": "reproduction-8",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.9",
    "topic": "D3.1",
    "level": "shared",
    "words": 218,
    "sectionId": "reproduction-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.10",
    "topic": "D3.1",
    "level": "shared",
    "words": 183,
    "sectionId": "reproduction-10",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.11",
    "topic": "D3.1",
    "level": "shared",
    "words": 168,
    "sectionId": "reproduction-11",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.12",
    "topic": "D3.1",
    "level": "shared",
    "words": 187,
    "sectionId": "reproduction-12",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.13",
    "topic": "D3.1",
    "level": "HL",
    "words": 176,
    "sectionId": "reproduction-13",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.14",
    "topic": "D3.1",
    "level": "HL",
    "words": 184,
    "sectionId": "reproduction-14",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.15",
    "topic": "D3.1",
    "level": "HL",
    "words": 177,
    "sectionId": "reproduction-15",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.16",
    "topic": "D3.1",
    "level": "HL",
    "words": 178,
    "sectionId": "reproduction-16",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.17",
    "topic": "D3.1",
    "level": "HL",
    "words": 181,
    "sectionId": "reproduction-17",
    "blocks": 2,
    "claimReferences": 2,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.18",
    "topic": "D3.1",
    "level": "HL",
    "words": 248,
    "sectionId": "reproduction-18",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.19",
    "topic": "D3.1",
    "level": "HL",
    "words": 235,
    "sectionId": "reproduction-19",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.1.20",
    "topic": "D3.1",
    "level": "HL",
    "words": 268,
    "sectionId": "reproduction-20",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.1",
    "topic": "D3.2",
    "level": "shared",
    "words": 190,
    "sectionId": "inheritance-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.2",
    "topic": "D3.2",
    "level": "shared",
    "words": 224,
    "sectionId": "inheritance-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.3",
    "topic": "D3.2",
    "level": "shared",
    "words": 159,
    "sectionId": "inheritance-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.4",
    "topic": "D3.2",
    "level": "shared",
    "words": 177,
    "sectionId": "inheritance-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.5",
    "topic": "D3.2",
    "level": "shared",
    "words": 245,
    "sectionId": "inheritance-5",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.6",
    "topic": "D3.2",
    "level": "shared",
    "words": 184,
    "sectionId": "inheritance-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.7",
    "topic": "D3.2",
    "level": "shared",
    "words": 193,
    "sectionId": "inheritance-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.8",
    "topic": "D3.2",
    "level": "shared",
    "words": 192,
    "sectionId": "inheritance-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.9",
    "topic": "D3.2",
    "level": "shared",
    "words": 238,
    "sectionId": "inheritance-9",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.10",
    "topic": "D3.2",
    "level": "shared",
    "words": 182,
    "sectionId": "inheritance-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.11",
    "topic": "D3.2",
    "level": "shared",
    "words": 213,
    "sectionId": "inheritance-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.12",
    "topic": "D3.2",
    "level": "shared",
    "words": 214,
    "sectionId": "inheritance-12",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.13",
    "topic": "D3.2",
    "level": "shared",
    "words": 217,
    "sectionId": "inheritance-13",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.14",
    "topic": "D3.2",
    "level": "shared",
    "words": 197,
    "sectionId": "inheritance-14",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.15",
    "topic": "D3.2",
    "level": "shared",
    "words": 258,
    "sectionId": "inheritance-15",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.16",
    "topic": "D3.2",
    "level": "HL",
    "words": 197,
    "sectionId": "inheritance-16",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.17",
    "topic": "D3.2",
    "level": "HL",
    "words": 228,
    "sectionId": "inheritance-17",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.18",
    "topic": "D3.2",
    "level": "HL",
    "words": 202,
    "sectionId": "inheritance-18",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.19",
    "topic": "D3.2",
    "level": "HL",
    "words": 200,
    "sectionId": "inheritance-19",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.20",
    "topic": "D3.2",
    "level": "HL",
    "words": 243,
    "sectionId": "inheritance-20",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.2.21",
    "topic": "D3.2",
    "level": "HL",
    "words": 285,
    "sectionId": "inheritance-21",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.1",
    "topic": "D3.3",
    "level": "shared",
    "words": 182,
    "sectionId": "homeostasis-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.2",
    "topic": "D3.3",
    "level": "shared",
    "words": 198,
    "sectionId": "homeostasis-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.3",
    "topic": "D3.3",
    "level": "shared",
    "words": 215,
    "sectionId": "homeostasis-3",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.4",
    "topic": "D3.3",
    "level": "shared",
    "words": 214,
    "sectionId": "homeostasis-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.5",
    "topic": "D3.3",
    "level": "shared",
    "words": 190,
    "sectionId": "homeostasis-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.6",
    "topic": "D3.3",
    "level": "shared",
    "words": 209,
    "sectionId": "homeostasis-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.7",
    "topic": "D3.3",
    "level": "HL",
    "words": 188,
    "sectionId": "homeostasis-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.8",
    "topic": "D3.3",
    "level": "HL",
    "words": 165,
    "sectionId": "homeostasis-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.9",
    "topic": "D3.3",
    "level": "HL",
    "words": 176,
    "sectionId": "homeostasis-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.10",
    "topic": "D3.3",
    "level": "HL",
    "words": 201,
    "sectionId": "homeostasis-10",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D3.3.11",
    "topic": "D3.3",
    "level": "HL",
    "words": 222,
    "sectionId": "homeostasis-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.1",
    "topic": "D4.1",
    "level": "shared",
    "words": 183,
    "sectionId": "natural-selection-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.2",
    "topic": "D4.1",
    "level": "shared",
    "words": 167,
    "sectionId": "natural-selection-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.3",
    "topic": "D4.1",
    "level": "shared",
    "words": 175,
    "sectionId": "natural-selection-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.4",
    "topic": "D4.1",
    "level": "shared",
    "words": 164,
    "sectionId": "natural-selection-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.5",
    "topic": "D4.1",
    "level": "shared",
    "words": 224,
    "sectionId": "natural-selection-5",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.6",
    "topic": "D4.1",
    "level": "shared",
    "words": 161,
    "sectionId": "natural-selection-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.7",
    "topic": "D4.1",
    "level": "shared",
    "words": 242,
    "sectionId": "natural-selection-7",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.8",
    "topic": "D4.1",
    "level": "shared",
    "words": 163,
    "sectionId": "natural-selection-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.9",
    "topic": "D4.1",
    "level": "HL",
    "words": 150,
    "sectionId": "natural-selection-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.10",
    "topic": "D4.1",
    "level": "HL",
    "words": 168,
    "sectionId": "natural-selection-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.11",
    "topic": "D4.1",
    "level": "HL",
    "words": 173,
    "sectionId": "natural-selection-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.12",
    "topic": "D4.1",
    "level": "HL",
    "words": 217,
    "sectionId": "natural-selection-12",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.13",
    "topic": "D4.1",
    "level": "HL",
    "words": 218,
    "sectionId": "natural-selection-13",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.14",
    "topic": "D4.1",
    "level": "HL",
    "words": 213,
    "sectionId": "natural-selection-14",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.1.15",
    "topic": "D4.1",
    "level": "HL",
    "words": 159,
    "sectionId": "natural-selection-15",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.1",
    "topic": "D4.2",
    "level": "shared",
    "words": 163,
    "sectionId": "stability-change-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.2",
    "topic": "D4.2",
    "level": "shared",
    "words": 178,
    "sectionId": "stability-change-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.3",
    "topic": "D4.2",
    "level": "shared",
    "words": 160,
    "sectionId": "stability-change-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.4",
    "topic": "D4.2",
    "level": "shared",
    "words": 188,
    "sectionId": "stability-change-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.5",
    "topic": "D4.2",
    "level": "shared",
    "words": 167,
    "sectionId": "stability-change-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.6",
    "topic": "D4.2",
    "level": "shared",
    "words": 213,
    "sectionId": "stability-change-6",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.7",
    "topic": "D4.2",
    "level": "shared",
    "words": 176,
    "sectionId": "stability-change-7",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.8",
    "topic": "D4.2",
    "level": "shared",
    "words": 213,
    "sectionId": "stability-change-8",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.9",
    "topic": "D4.2",
    "level": "shared",
    "words": 214,
    "sectionId": "stability-change-9",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.10",
    "topic": "D4.2",
    "level": "shared",
    "words": 176,
    "sectionId": "stability-change-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.11",
    "topic": "D4.2",
    "level": "shared",
    "words": 172,
    "sectionId": "stability-change-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.12",
    "topic": "D4.2",
    "level": "HL",
    "words": 172,
    "sectionId": "stability-change-12",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.13",
    "topic": "D4.2",
    "level": "HL",
    "words": 150,
    "sectionId": "stability-change-13",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.14",
    "topic": "D4.2",
    "level": "HL",
    "words": 169,
    "sectionId": "stability-change-14",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.2.15",
    "topic": "D4.2",
    "level": "HL",
    "words": 180,
    "sectionId": "stability-change-15",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.1",
    "topic": "D4.3",
    "level": "shared",
    "words": 191,
    "sectionId": "climate-change-1",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.2",
    "topic": "D4.3",
    "level": "shared",
    "words": 222,
    "sectionId": "climate-change-2",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.3",
    "topic": "D4.3",
    "level": "shared",
    "words": 204,
    "sectionId": "climate-change-3",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.4",
    "topic": "D4.3",
    "level": "shared",
    "words": 177,
    "sectionId": "climate-change-4",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.5",
    "topic": "D4.3",
    "level": "shared",
    "words": 198,
    "sectionId": "climate-change-5",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.6",
    "topic": "D4.3",
    "level": "shared",
    "words": 203,
    "sectionId": "climate-change-6",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.7",
    "topic": "D4.3",
    "level": "shared",
    "words": 271,
    "sectionId": "climate-change-7",
    "blocks": 4,
    "claimReferences": 4,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.8",
    "topic": "D4.3",
    "level": "shared",
    "words": 175,
    "sectionId": "climate-change-8",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 1,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.9",
    "topic": "D4.3",
    "level": "HL",
    "words": 196,
    "sectionId": "climate-change-9",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.10",
    "topic": "D4.3",
    "level": "HL",
    "words": 185,
    "sectionId": "climate-change-10",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.11",
    "topic": "D4.3",
    "level": "HL",
    "words": 193,
    "sectionId": "climate-change-11",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  },
  {
    "id": "D4.3.12",
    "topic": "D4.3",
    "level": "HL",
    "words": 167,
    "sectionId": "climate-change-12",
    "blocks": 3,
    "claimReferences": 3,
    "figures": 0,
    "needsScientificSignoff": true
  }
]
```
