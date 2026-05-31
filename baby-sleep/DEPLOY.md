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
| 404 on the URL | Confirm step 2–3 above; check that **Actions** last run is green |
| Blank page | Hard refresh; ensure you use the full path `/baby-sleep/` |
| Old version | Wait 2 min after deploy; try private/incognito window |

## Local dev

```bash
cd baby-sleep
npm install
npm run dev
```
