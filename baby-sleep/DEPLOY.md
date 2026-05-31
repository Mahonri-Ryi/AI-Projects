# Deploying Little Dream on GitHub Pages (free, public repo)

**Live app URL:** https://mahonri-ryi.github.io/AI-Projects/baby-sleep/

## One-time setup (about 1 minute)

GitHub still needs you to turn Pages on once (free for public repos):

1. Open **https://github.com/Mahonri-Ryi/AI-Projects/settings/pages**
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**
3. **Branch:** `gh-pages` · **Folder:** `/ (root)` · **Save**
4. Wait 1–2 minutes, then open the live URL above

The workflow pushes the built app to the `gh-pages` branch automatically on every push to `main`.

## Re-deploy manually

**Actions** → **Deploy Little Dream (baby-sleep)** → **Run workflow**

Or push any change under `baby-sleep/`.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| **“There isn’t a GitHub Pages site here”** (gray 404) | **Pages is turned off** in repo settings — not a bad deploy. Open [Pages settings](https://github.com/Mahonri-Ryi/AI-Projects/settings/pages), choose **Deploy from a branch**, branch **`gh-pages`**, folder **`/` (root)**, **Save**. Wait 1–2 min. (This can happen if the source was changed to GitHub Actions or None while setting up Cloudflare.) |
| 404 on `/baby-sleep/` only | Confirm step 2–3 above; check that **Actions** → **Deploy Little Dream** last run is green |
| Blank page | Hard refresh; ensure you use the full path `/baby-sleep/` |
| Old version | Wait 2 min after deploy; try private/incognito window |

## Local dev

```bash
cd baby-sleep
npm install
npm run dev
```
