# Little Dream — Baby Sleep Tracker

A mobile-friendly PWA to log naps and bedtime, with **research-based next-nap timing** from your baby’s age.

## Features

- One-tap **nap** and **bedtime** logging
- **Next nap window** from age-appropriate wake times (homeostatic sleep pressure + published ranges)
- Adjustments when the last nap was unusually short or long
- **Sleepy cues** reminder and links to sources (NSF, Cleveland Clinic, pediatric sleep literature)
- **Share link** so your partner can sync profile and history (no account; data stays in the browser)
- **Add to Home Screen** for a full-screen app on iPhone/Android

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

Live URL (after merge): `https://mahonri-ryi.github.io/AI-Projects/baby-sleep/`

## Not medical advice

Guidance is educational and based on published sleep research ranges. Every baby differs — use sleepy cues and your pediatrician for concerns.
