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

The repository includes a GitHub Pages workflow in `.github/workflows/deploy.yml`. The Vite base is configured as a relative path so the static build works correctly on Pages.

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
