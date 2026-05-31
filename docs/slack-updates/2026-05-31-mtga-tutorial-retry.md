# Slack update — MTG Arena tutorial retry (2026-05-31)

**Copy/paste into Slack** (Cloud Agent could not post automatically — no `SLACK_WEBHOOK_URL` on VM).

---

**MTG Arena — tutorial retry**

• **Login:** OK (your session still works)  
• **Section I (Kylea):** Re-entered; **Turn 1** — dragged **Plains** to battlefield successfully  
• **Turn 2:** Stuck again — “Play another land” / **End Turn** / creature drags not registering (Wine UI)  
• **Exit:** Used **Leave Match** → back at **tutorial map** (Section I done, II–V locked)  
• **Replay:** **Play** on menu didn’t start a new match (clicks highlight, no launch)

**What works:** Slow **hand → battlefield** drag on turn 1  
**Blocker:** Wine OLE/COM errors after turn 1; menu **Play** unreliable

**Next options:**  
1. You click **Play** on Section I once on desktop, I continue with drags  
2. **Skip Tutorial** (gear → Account) and move to Color Challenges / Play  
3. Add **`SLACK_WEBHOOK_URL`** Cursor secret so agents can post updates  

Branch: `cursor/mtga-learning-program-f700` — rules docs in `mtga/knowledge/`

---
