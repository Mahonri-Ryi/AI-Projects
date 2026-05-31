# Sleep Coach proxy (required for live app)

Browsers block direct calls to `api.cursor.com` and `api.openai.com` (CORS). Sleep Coach sends your **API key from the phone** through a tiny proxy you deploy.

## Cursor API key (recommended)

1. Create a key at [cursor.com/dashboard](https://cursor.com/dashboard) → **API Keys** (`crsr_…`).
2. Deploy this Worker (Cloudflare dashboard → paste `worker.js`).
3. In the app: **Coach → Setup** → paste key + Worker URL (e.g. `https://little-dream-coach.you.workers.dev`).

The worker forwards `/cursor/*` to Cursor and does **not** store keys.

## OpenAI (optional)

Same worker forwards non-`/cursor` paths to OpenAI if you switch Provider to OpenAI and use an `sk-…` key.

## Local development

`npm run dev` proxies automatically:

- `/api/cursor` → Cursor API  
- `/api/coach` → OpenAI API  

Only your API key is required in Setup.

## Build-time default proxy

`VITE_SLEEP_COACH_PROXY=https://your-worker.workers.dev` when building the PWA.
