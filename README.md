# LitLab

**Explore. Analyze. Understand.**

LitLab is an independent student-made DP English learning guide created by **Rayan Sayed Ahmad** and **Elena Bizri**. It is designed to help students starting DP English understand how the main parts of the subject connect, learn the basics of analysis, and quickly reach the section they need.

## Main experience

- **Home / LitLab Compass** — an interactive map into the site
- **Start Here** — detailed DP English orientation, analysis vs summary, authorial choices, thesis basics, paragraph thinking, vocabulary, tips, common mistakes and study setup
- **Papers** — one Papers section that lets the student choose Paper 1 or Paper 2
- **IO** — content structure plus a working practice timer
- **Books** — a flexible book-library template ready for class texts
- **Extended Essay** — content structure plus an interactive Research Question Lab
- **Search + Glossary** — fast client-side reference tools
- **Progress** — local “reviewed/ready” progress with no account required
- **Light / dark themes** and responsive mobile layouts

## Content status

The **Start Here** section is intentionally developed now. Detailed Paper 1, Paper 2, IO, EE and Books content will be added after student research and review rather than filled with invented official requirements.

Course-specific facts should be checked against current IB guidance and teacher instructions. LitLab clearly separates student strategies from official information.

## Creators

### Rayan Sayed Ahmad
Website development, UI/UX, interactive experience, technical implementation, Start Here / Overview and content integration.

### Elena Bizri
Research and future content for Papers, IO, Extended Essay and Books, plus proofreading and explanation review.

### Together
Planning, testing, student feedback, improvements and CAS reflection.

## Instagram

DP cohort updates: https://www.instagram.com/rhhs.ibdp.27/

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deploy

**Public host:** Cloudflare Workers at https://litlab.jamesloom18.workers.dev/. Cloudflare is connected to the GitHub repository and has previously published public branch previews. Its existing Worker configuration is `wrangler.jsonc` (name `litlab`, static assets from `dist`, SPA fallback). Do not create a second Worker for BioLab: it is a subject within the existing LitLab application.

Public releases must use an approved, tested `main` commit. Before promotion, the BioLab launch checks validate all 40 lesson routes, static figure placement, the public build's private-file gate and the existing English features. Pushing to `main` is expected to trigger the existing Cloudflare Git integration. The `BioLab Cloudflare Production Verification` workflow independently polls the public Worker for `/biolab-release.json`; a successful merge **does not** itself establish that Cloudflare deployed. If the marker is not live, inspect Cloudflare's connected Git branch, build command (`npm ci && npm run build`), output (`dist`) and Worker (`litlab`) before announcing publication.

The GitHub Pages workflow remains available as a **manual fallback only** and no longer publishes on every `main` push. The Vite base is relative (`./`) so asset URLs continue to work on either host.

**Release restrictions:** report rights permissions as owner-attested unless documents are inspected; visibly credit third-party original figures and maintain the independent, non-IB-endorsed disclaimer. Automated science and accessibility checks are not qualified independent approvals.

## Where to edit content

- `src/content.ts` — navigation, FAQs, tips, glossary, search data and official-source links
- `src/main.tsx` — interactive page structures and tools
- `src/styles.css` — LitLab visual system, animations and responsive design
- `public/favicon.svg` — LitLab favicon

The Papers, IO, Books and EE page structures are intentionally ready for future researched content.

## Academic integrity

LitLab should not host leaked exam papers, unauthorized copyrighted assessment material, full copyrighted books, ready-to-submit essays, complete IO scripts or ready-to-submit Extended Essays. The project is for explanations, original examples, thinking tools, study strategies and student-created guidance.

## Disclaimer

**LitLab is an independent student-made educational resource and is not affiliated with or endorsed by the International Baccalaureate Organization.**
