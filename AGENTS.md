# AGENTS.md

Guidance for AI agents working in this repository.

## Repository status

This repository is currently a **placeholder**: it contains only `README.md` (“AI-Projects” / random and fun projects). There is no application source, dependency manifest, test suite, or service definitions yet.

When projects are added, document install, lint, test, build, and dev commands here and in per-project READMEs.

## Cursor Cloud specific instructions

- **Update script**: No dependency installation is required until manifests exist (e.g. `package.json`, `pyproject.toml`). The VM update script is a no-op (`true`).
- **Services**: None. No dev servers, databases, or Docker Compose stacks are defined in this repo.
- **Lint / test / build / run**: Not applicable until code and scripts are added. Do not invent commands; follow whatever the repo adds (Makefile, `package.json` scripts, CI config, etc.).
- **Toolchain on the VM**: Git, Node.js (via the environment), Python 3.12, and `make` are available for future projects; install project-specific runtimes (e.g. via `.tool-versions`, `mise`, or `nvm`) when the repo defines them.
- **Git**: Default branch is `main`; remote is `origin` on GitHub (`Mahonri-Ryi/AI-Projects`).
- **Pull requests**: Use branch prefix `cursor/`. PRs from `cursor/*` auto-merge after CI when setup in [docs/AUTO_MERGE.md](docs/AUTO_MERGE.md).
