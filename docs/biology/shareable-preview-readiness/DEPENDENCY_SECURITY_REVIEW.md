# Dependency Security Review

## Before remediation
A fresh npm audit against the original locked dependency tree reported **7 advisories (6 high, 1 moderate)**:
| Affected package | Severity | Category |
| --- | --- | --- |
| vite | High | Direct development/build tool |
| wrangler | High | Direct development/deployment tool |
| miniflare | High | Transitive development tooling |
| sharp | High | Transitive development tooling |
| source-map-js | High | Transitive package |
| undici | High | Transitive development tooling |
| esbuild | Moderate | Transitive development/build tooling |

`npm audit --omit=dev` on that tree already reported **0 production-dependency vulnerabilities**. This distinguishes installed dev/build dependencies from the browser's runtime dependency set; it does **not**, by itself, prove every vulnerable code path unreachable.

## Safely applied patch-level updates
- `vite`: pinned from 6.0.7 to **6.4.4** (within v6; no major upgrade).
- `wrangler`: pinned to **4.151.1** (within v4; no major upgrade).
- `source-map-js`: transitive patch update (1.2.2 in tested proposal).
- Corresponding `package-lock.json` transitive versions were resolved by npm, not fabricated.

The changes were tested in a disposable Actions runner with `npm ci`, all curriculum/figure validators, `npm run quality` and `npm run build`, then committed only to the isolated QA branch by the security workflow. No `npm audit fix --force` and no production deployment were used.

**After remediation:** saved `npm audit --json` metadata shows **0 critical, 0 high, 0 moderate, 0 low**, total 0. The production-only audit also shows total 0. See [successful compatible security-update workflow](https://github.com/veyro-lb/litlab/actions/runs/39166025070) and artifact `biolab-verified-compatible-dependency-upgrade`.

## Residual exposure
No advisories are reported by npm at the tested lockfile state, but future package advisories, unseen vulnerable functionality, and infrastructure-specific configuration risks remain possible. Continue routine dependency audits, review Cloudflare deployment permissions/configuration without exposing values, and maintain a separated production release process.
