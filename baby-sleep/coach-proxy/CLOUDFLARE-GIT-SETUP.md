# Cloudflare Worker + GitHub (your situation)

If you created the Worker **“connected to GitHub”**, Cloudflare does **not** use the big “Edit code” button the same way. The script is whatever file is in your repo, and Cloudflare redeploys when you push to `main`.

Cloudflare’s auto-setup often points at the **`baby-sleep` folder as static files** — that is **wrong** for Sleep Coach. You need the small proxy in **`baby-sleep/coach-proxy/`**.

---

## Option A — Fix the Git-connected Worker (keep GitHub)

### 1. Point Cloudflare at the proxy folder

1. Open **https://dash.cloudflare.com** → **Workers & Pages** → click your worker (e.g. `little-dream-coach`).
2. Go to **Settings** → **Build** (or **Builds & deployments**).
3. Set **Root directory** to:

   ```text
   baby-sleep/coach-proxy
   ```

4. **Build command** — leave empty, or use:

   ```text
   npx wrangler deploy
   ```

5. **Deploy command** — if there is a separate field, same as above or leave default.
6. Save. Trigger **Retry deployment** or push a small commit to `main` (see step 2).

### 2. Put the correct script in GitHub

The proxy code is already in the repo:

**File:** `baby-sleep/coach-proxy/worker.js`  
**Config:** `baby-sleep/coach-proxy/wrangler.toml`

To edit the script:

1. On GitHub, open **Mahonri-Ryi/AI-Projects**.
2. Navigate to **`baby-sleep/coach-proxy/worker.js`**.
3. Click the **pencil (Edit)** icon → change the file → **Commit changes** to `main`.
4. Wait 1–2 minutes for Cloudflare to redeploy (check the worker’s **Deployments** tab).

You do **not** need to edit code inside the Cloudflare dashboard when Git is connected.

### 3. Remove wrong root config (if Cloudflare added it)

If you see a **`wrangler.jsonc` at the repo root** (from branch `cloudflare/workers-autoconfig`) with:

```json
"assets": { "directory": "baby-sleep" }
```

that deploys the **website**, not the proxy. Either:

- Delete that root `wrangler.jsonc` and use only `baby-sleep/coach-proxy/wrangler.toml`, **or**
- In Cloudflare Build settings, ensure root directory is **`baby-sleep/coach-proxy`** so the root file is ignored.

### 4. Your Worker URL

Still:

```text
https://little-dream-coach.<something>.workers.dev
```

Use that in the app: **Coach → Setup → Proxy base URL** (no `/cursor` suffix).

---

## Option B — Ignore Git (easiest if you’re stuck)

Create a **second** worker with **no** Git connection:

1. **Workers & Pages** → **Create** → **Create Worker** (not “Pages”, not “Connect Git”).
2. Name it `little-dream-coach-proxy` → **Deploy**.
3. Click **Edit code** or **Quick edit** (this appears when Git is **not** connected).
4. Delete everything in the editor.
5. Copy all of **`baby-sleep/coach-proxy/worker.js`** from GitHub and paste.
6. **Save and deploy**.
7. Use **this** worker’s URL in the app.

You can delete or ignore the broken Git-connected project.

---

## Test the proxy

Replace placeholders and run on a computer:

```bash
curl -sS -u "crsr_YOUR_KEY:" \
  "https://YOUR-WORKER-URL.workers.dev/cursor/v1/me"
```

- **JSON** with account info → proxy works.  
- **HTML** or 404 → still serving static site; fix root directory (Option A) or use Option B.

---

## Then in the app

1. https://mahonri-ryi.github.io/AI-Projects/baby-sleep/
2. **Settings → Clear cache & reload**
3. **Coach → Setup**
4. **Proxy base URL** first → then **Cursor API key** → **Test key**

See also: [SLEEP-COACH-SETUP.md](../SLEEP-COACH-SETUP.md)
