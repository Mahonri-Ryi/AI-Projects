# Sleep Coach — Cursor API key setup (live app)

Sleep Coach on **https://mahonri-ryi.github.io/AI-Projects/baby-sleep/** cannot talk to Cursor directly from your phone browser (security/CORS). You need:

1. A **Cursor Cloud Agents API key** (`crsr_…`)
2. A **one-time proxy** (free Cloudflare Worker) that forwards requests

Your key and chat history stay **on your device**. The proxy does not save keys.

---

## Part 1 — Get the correct Cursor API key

### Use Cloud Agents keys (not Admin keys)

| Key source | Prefix | Works in Sleep Coach? |
|------------|--------|------------------------|
| **Dashboard → API Keys** | `crsr_…` | Yes |
| Team Settings → Admin API Keys | `crsr_…` (admin scope) | Often **no** (401) |
| IDE login / session token | — | No |

### Steps

1. Open **https://cursor.com/dashboard** and sign in.
2. Go to **API Keys** (Cloud Agents section — not “Admin API Keys” under team advanced settings).
3. Click **Create API key** (or similar).
4. Copy the key immediately — it starts with **`crsr_`** and is shown only once.
5. Store it in a password manager; you will paste it into Little Dream on your phone.

### If Test says “Key rejected (401)”

- You may have an **Admin** or **Analytics** key. Create a new key from **Dashboard → API Keys**.
- Check for extra spaces or quotes when pasting.
- Confirm your Cursor plan includes **Cloud Agents** access.

---

## Part 2 — Deploy the proxy (Cloudflare Worker, ~10 minutes)

You only do this once. The same Worker URL can be used on every device.

### 2.1 Create a Cloudflare account

1. Go to **https://dash.cloudflare.com/sign-up** (free tier is enough).
2. Verify your email if prompted.

### 2.2 Create a Worker

1. In the Cloudflare dashboard, open **Workers & Pages**.
2. Click **Create** → **Create Worker**.
3. Name it something like `little-dream-coach` → **Deploy**.
4. On the worker page, click **Edit code** (or **Quick edit**).
5. **Delete** the default script and paste the full contents of this file from the repo:

   `baby-sleep/coach-proxy/worker.js`

6. Click **Save and deploy** (or **Deploy**).

### 2.3 Copy your Worker URL

After deploy, Cloudflare shows a URL like:

`https://little-dream-coach.<your-subdomain>.workers.dev`

Copy that **base URL only** — no path at the end, no `/cursor`.

Example: `https://little-dream-coach.myaccount.workers.dev`

### 2.4 Quick test (optional, on a computer)

Replace `YOUR_KEY` and `YOUR_WORKER_URL`:

```bash
curl -sS -u "YOUR_KEY:" \
  "https://YOUR_WORKER_URL/cursor/v1/me"
```

Or with Bearer:

```bash
curl -sS -H "Authorization: Bearer YOUR_KEY" \
  "https://YOUR_WORKER_URL/cursor/v1/me"
```

You should get JSON back (email or account info), not HTML or 401.

### 2.5 “Missing Authorization” in the Cloudflare preview?

If you click **Visit** or open your Worker URL in a browser, you may see:

```json
{"error":{"message":"Missing Authorization"}}
```

That is **normal**. The browser does not send your Cursor API key. The proxy is working; only the **Little Dream app** (or the `curl` test above) should call it with `Authorization`.

After updating the worker script, visiting the root URL may show a green `ok: true` health message instead.

---

## Part 3 — Configure Little Dream on your phone

### 3.1 Get the latest app build

After the fix PR is merged and GitHub Pages deploys (~2–3 minutes):

1. Open the app: **https://mahonri-ryi.github.io/AI-Projects/baby-sleep/**
2. Go to **Settings** → **Clear cache & reload** (do **not** “clear all site data” unless you want to lose sleep logs).

### 3.2 Coach setup

1. Open the **Coach** tab (bottom navigation).
2. Tap **Setup**.
3. Fill in **in this order**:
   - **Proxy base URL** → your Worker URL from Part 2.3  
     Example: `https://little-dream-coach.myaccount.workers.dev`
   - **Cursor API key** → your `crsr_…` key from Part 1
4. Tap **Test key**.
   - Success: green-style message **Connected: …** (your email or account label).
   - Failure: red error text with a specific reason (not “Connected: Invalid key”).
5. Leave **Cursor model id** as `composer-2` unless Cursor docs list another id for your plan.
6. Keep **Include recent sleep logs** on if you want answers based on your tracked data.

### 3.3 Ask a question

1. Type a question → **Send**.
2. First reply may take **30–90 seconds** (Cursor Cloud Agent run).
3. Follow-ups in the same chat are faster and reuse the same agent thread.

---

## Part 4 — Troubleshooting

| Symptom | What to do |
|---------|------------|
| **“Add proxy URL first”** on Test | Paste Worker URL **before** Test key (required on installed PWA, not in local dev). |
| **“Connected: Invalid key”** (old build) | Clear cache & reload after the fix PR; update fixes misleading text. |
| **Key rejected (401)** | Use Dashboard → **API Keys**, not Admin/team keys. |
| **Could not reach Cursor / network** | Wrong Worker URL, worker not deployed, or typo in URL. |
| **Coach is thinking…** forever | Wait up to ~2 min; try a shorter question; check Cursor dashboard for agent errors or quota. |
| Chat works on laptop `npm run dev` but not phone | Dev uses built-in proxy; phone needs Worker URL in Setup. |

---

## Part 5 — Costs and privacy

- **Billing**: Questions use **your** Cursor account (Cloud Agents usage on your plan).
- **Proxy**: Cloudflare free tier is usually enough for personal/family use.
- **Data**: Sleep logs sent to Cursor only if **Include recent sleep logs** is enabled; otherwise only your question text goes.
- **Not medical advice**: Coach is educational; contact your pediatrician for medical concerns.

---

## Local development (no Worker required)

```bash
cd baby-sleep
npm install
npm run dev
```

Open the local URL, **Coach → Setup**, paste only the `crsr_…` key. Vite proxies `/api/cursor` automatically.

---

## Optional: set a default proxy for all users at build time

If you maintain the GitHub Pages deploy, you can bake in your Worker URL:

```bash
VITE_SLEEP_COACH_PROXY=https://little-dream-coach.myaccount.workers.dev npm run build
```

Users still bring their own `crsr_…` keys; only the proxy URL is pre-filled.
