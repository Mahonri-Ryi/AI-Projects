# Auto-merge for Cloud Agent PRs

This repo merges pull requests from branches named `cursor/*` automatically after CI passes.

## One-time setup (repo admin — you)

Do this once in GitHub; the Cursor bot token cannot change these settings.

### 1. Enable auto-merge on the repository

1. Open [AI-Projects → Settings → General](https://github.com/Mahonri-Ryi/AI-Projects/settings).
2. Under **Pull Requests**, check **Allow auto-merge**.
3. Save.

### 2. Branch protection on `main` (recommended)

Open [Settings → Branches](https://github.com/Mahonri-Ryi/AI-Projects/settings/branches) (or **Rules → Rulesets**).

**If you use required status checks**

- Add the **CI** workflow as a required check.
- Auto-merge waits until CI is green.

**If you use required reviews**

- GitHub will not let the same actor approve and merge their own PR.
- Use either:
  - **0 required reviews** for `cursor/*` (simplest), or
  - A second automation that approves as `cursor[bot]` while PRs are opened under **your** GitHub user (Cursor **Private** automation + [Integrations → GitHub](https://cursor.com/dashboard)), or
  - Add **cursor[bot]** or the Cursor GitHub App under **Bypass pull request requirements** for merges only.

**If you want zero friction**

- No required reviews and only the **CI** check (or no checks) — merges happen as soon as auto-merge is enabled and checks pass.

### 3. Merge this workflow once

The first PR that adds `.github/workflows/auto-merge.yml` must be merged manually (or via admin). After that, future `cursor/*` PRs can auto-merge.

## What runs automatically

| Workflow | Role |
|----------|------|
| `ci.yml` | Quick sanity check on every PR |
| `auto-merge.yml` | For `cursor/*` heads: mark PR ready, enable **auto-merge** (squash + delete branch) |

## Cursor agent behavior

- Use branch names like `cursor/<task-name>-f700`.
- Open PRs against `main`; drafts are turned **ready** by the workflow.
- Do not rely on the agent calling `gh pr merge` in the VM — merging is handled by GitHub Actions.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Auto-merge option missing | Turn on **Allow auto-merge** in repo settings |
| PR stays open forever | Required review/check not satisfied — see branch protection |
| Workflow fails with 403 | In **Settings → Actions → General**, set workflow permissions to **Read and write** |
| Same actor blocked | Use Private PR creator + separate approver, or reduce required reviews |
