# AGENTS.md

Guidance for AI agents working in this repository.

## Repository status

| Path | Stack | Commands (from project dir) |
|------|-------|------------------------------|
| `baby-sleep/` | Vite, React, TypeScript, PWA | `npm ci`, `npm run dev`, `npm run build`, `npm run lint` |

## Cursor Cloud

- **Update script**: Run `npm ci` in `baby-sleep/` when that project changes.
- **Services**: `npm run dev` in `baby-sleep/` (port 5173) for local dev.
- **Deploy**: GitHub Actions workflow `.github/workflows/deploy-baby-sleep.yml` publishes `baby-sleep/dist` to GitHub Pages at `/AI-Projects/baby-sleep/`.
- **Git**: Default branch is `main`; remote is `origin` on GitHub (`Mahonri-Ryi/AI-Projects`).
