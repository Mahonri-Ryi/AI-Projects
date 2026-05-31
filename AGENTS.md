# AGENTS.md

Guidance for AI agents working in this repository.

## Repository status

| Path | Stack | Commands (from project dir) |
|------|-------|------------------------------|
| `baby-sleep/` | Vite, React, TypeScript, PWA, Vitest | `npm ci`, `npm run dev`, `npm run test:run`, `npm run build`, `npm run lint`, `npm run ci` |

## Cursor Cloud

- **Update script**: Run `npm ci` in `baby-sleep/` when that project changes.
- **Services**: `npm run dev` in `baby-sleep/` (port 5173) for local dev.
- **CI / tests**: `.github/workflows/baby-sleep-ci.yml` runs lint + tests on PRs; deploy workflow runs tests before publishing.
- **Deploy**: `.github/workflows/deploy-baby-sleep.yml` publishes `baby-sleep/dist` to GitHub Pages at `/AI-Projects/baby-sleep/`.
- **Git**: Default branch is `main`; remote is `origin` on GitHub (`Mahonri-Ryi/AI-Projects`).
