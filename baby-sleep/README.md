# Little Dream — Baby Sleep Tracker

A mobile-friendly PWA to log naps and bedtime, with **research-based next-nap and bedtime timing** from your baby’s age.

## Features

- One-tap **nap** and **bedtime** logging
- **Night wake** tracking — log feed/resettle breaks without ending the night (awake timer, total awake tonight, typical resettle time)
- **Next nap window** from age-appropriate wake times (homeostatic sleep pressure + published ranges)
- **Bedtime window** from age guidance plus your logged bedtime history when available
- Optional **browser reminders** before nap and bedtime wind-down (Settings)
- Adjustments when the last nap was unusually short or long
- **Sleepy cues** reminder and links to sources (NSF, Cleveland Clinic, pediatric sleep literature)
- **Share link** so your partner can sync profile and history (no account; data stays in the browser)
- **Add to Home Screen** for a full-screen app on iPhone/Android
- **Sleep Coach** tab — ask sleep questions with your own **Cursor API key** ([setup guide](./SLEEP-COACH-SETUP.md))

## Development

```bash
cd baby-sleep
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview production build locally
```

## Deploy (GitHub Pages)

Pushes to `main` that touch `baby-sleep/` deploy via `.github/workflows/deploy-baby-sleep.yml`.

Live URL: **https://mahonri-ryi.github.io/AI-Projects/baby-sleep/**

**Getting a 404?** GitHub Pages must be enabled once — see [DEPLOY.md](./DEPLOY.md).

## Not medical advice

Guidance is educational and based on published sleep research ranges. Every baby differs — use sleepy cues and your pediatrician for concerns.
