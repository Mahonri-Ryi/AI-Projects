# Deploying Little Dream on GitHub Pages

The live app URL (after setup):

**https://mahonri-ryi.github.io/AI-Projects/baby-sleep/**

## One-time setup (required — fixes 404)

GitHub Pages must be turned on for this repository:

1. Open **https://github.com/Mahonri-Ryi/AI-Projects/settings/pages**
2. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Save if prompted.

Then re-run the deploy workflow:

1. **https://github.com/Mahonri-Ryi/AI-Projects/actions/workflows/deploy-baby-sleep.yml**
2. Click **Run workflow** → **Run workflow**

Wait ~1 minute, then open the app URL above.

## If it still fails

- Confirm the latest **Deploy Little Dream (baby-sleep)** run is green.
- Settings → Pages should show “Your site is live at …”
- Hard-refresh the browser (or try a private window).

## Local preview (production paths)

```bash
cd baby-sleep
GITHUB_PAGES=true npm run build
npx serve dist -l 4173 --single
# Open http://localhost:4173/AI-Projects/baby-sleep/  (use a proxy or vite preview with base)
```

Or: `npm run preview` after setting `base: '/'` temporarily.
