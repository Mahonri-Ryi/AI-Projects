# Sleep Coach proxy (optional)

Browsers cannot call `api.openai.com` directly (CORS). Sleep Coach uses **your OpenAI API key** on-device and sends requests through a tiny proxy you control.

Cursor API keys (`crsr_…`) are **not** supported for chat — they are for [Cloud Agents](https://cursor.com/docs/cloud-agent/api/endpoints), not parent Q&A.

## Cloudflare Worker (recommended)

1. Create a Worker in the Cloudflare dashboard.
2. Paste `worker.js` from this folder.
3. Deploy and copy the URL (e.g. `https://little-dream-coach.your-subdomain.workers.dev`).
4. In the app: **Coach → Settings → Proxy base URL** → paste that URL (no trailing slash).

The worker forwards to OpenAI and does **not** store your key.

## Local development

`npm run dev` uses Vite’s `/api/coach` proxy automatically — only your OpenAI key is required.

## Build-time default proxy

Set `VITE_SLEEP_COACH_PROXY=https://your-worker.workers.dev` when building if you host a shared proxy for all users (you pay bandwidth; users still bring their own OpenAI keys).
