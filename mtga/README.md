# MTG Arena learning program

Tools and knowledge for an agent to play MTG Arena on the cloud desktop, improve over time, and log experience.

## Controls

See [docs/MTGA_CONTROLS.md](../docs/MTGA_CONTROLS.md). **Cards are played by click-and-drag to the battlefield.**

## Layout

| Path | Purpose |
|------|---------|
| `actions.py` | Screen actions: drag-to-play, end turn, screenshot |
| `heuristics.py` | Simple tutorial / beginner policy |
| `session.py` | Episode logging (state → action → outcome) |
| `knowledge/` | Rules notes and phase reminders |

## Quick start (VM)

```bash
pip install --user pillow mss pyautogui
export DISPLAY=:1
python3 -m mtga.session --screenshot  # test capture
```

## Learning loop (planned)

1. **Observe** — screenshot + optional OCR later  
2. **Decide** — heuristics → later policy / model  
3. **Act** — drag cards, end turn (see `actions.py`)  
4. **Record** — append to `data/sessions/*.jsonl`  
5. **Review** — summarize mistakes, update `knowledge/`
