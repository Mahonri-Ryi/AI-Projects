# Sleep Coach proxy (required for live app)

**Full step-by-step guide:** [../SLEEP-COACH-SETUP.md](../SLEEP-COACH-SETUP.md)

Browsers block direct calls to `api.cursor.com` (CORS). The installed PWA must use this Worker.

## Quick start

1. **API key:** [cursor.com/dashboard](https://cursor.com/dashboard) → **API Keys** → create → copy `crsr_…` (Cloud Agents key, not Admin API key).
2. **Deploy:** Cloudflare → Workers & Pages → Create Worker → paste `worker.js` from this folder → Deploy.
3. **App:** Coach → Setup → **Proxy URL first** (`https://your-worker.workers.dev`) → **Cursor API key** → **Test key** → should show **Connected: …**

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
