# MTG Arena bot account

Project email and Wizards account used for automation on the cloud desktop VM.

## Email (committed)

See [`config/mtga-account.email`](../config/mtga-account.email).

## Secrets (not committed)

Copy [`config/mtga-account.env.example`](../config/mtga-account.env.example) to `config/mtga-account.env` locally, or load the same variables from Cursor **Secrets** for Cloud Agents:

| Variable | Purpose |
|----------|---------|
| `MTGA_EMAIL` | Wizards login |
| `MTGA_PASSWORD` | Wizards password |
| `MTGA_DISPLAY_NAME` | In-game display name |
| `MAILTM_ADDRESS` / `MAILTM_PASSWORD` | Optional: receive mail at mail.tm inbox |

On the VM, `config/mtga-account.env` may already exist (gitignored) after setup.

## Registration

- Registered at https://myaccounts.wizards.com/register
- Email verified via link in inbox (mail.tm)
- Log in from MTG Arena (Wine) or the desktop **MTG Arena** launcher

## Launch Arena

On the VM desktop:

```bash
/home/ubuntu/launch-mtga.sh
```
