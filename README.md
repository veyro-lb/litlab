# Northstar English

**Find your way through DP English.** A polished, student-made companion for students beginning DP English.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Edit content

Academic content is deliberately separate from the interface in `src/content.ts`. Each guide has a `status` (`verified`, `demo`, or `coming`) and an array of sections. Add or replace sections there without redesigning the app. Glossary terms and rotating tips live in the same file.

To add a work, add another guide-style object or extend the data model in `src/content.ts`; the interface maps content data into cards and guide pages automatically.

## Brand changes

Site colors and typography are CSS variables at the top of `src/styles.css`. The reusable logo is in `src/main.tsx`; the favicon is `public/favicon.svg`.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes every push to `main`. In repository **Settings → Pages**, set the source to **GitHub Actions**.

## Cloudflare

The repository includes an assets-only Worker configuration in `wrangler.jsonc`. After authenticating Wrangler, deploy with:

```bash
npm run deploy
```

Use `npm run deploy:dry` to validate the Cloudflare bundle without publishing.

## Feedback

The current release does not collect personal information or send form data. Connect a future feedback button to a school-approved form or serverless endpoint and document what data is collected before enabling it.

## Current content status

- **Start Here:** developed student guidance; should still be reviewed before publication.
- **Paper 1 and Books & Works:** clearly labeled demonstration content.
- **Paper 2, Individual Oral, and Extended Essay:** complete layouts with honest coming-soon states.
- No invented assessment requirements are presented as official facts.

Northstar English is independent and student-made. It is not affiliated with, endorsed by, or an official resource of the International Baccalaureate Organization.
