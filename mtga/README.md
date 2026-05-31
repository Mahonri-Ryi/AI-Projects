# MTG Arena learning program

Tools and knowledge for an agent to play MTG Arena on the cloud desktop, improve over time, and log experience.

## Controls

See [docs/MTGA_CONTROLS.md](../docs/MTGA_CONTROLS.md). **Cards are played by click-and-drag to the battlefield.**

## Knowledge base (read first)

| Doc | Topic |
|-----|--------|
| [knowledge/LEARNING_CURRICULUM.md](knowledge/LEARNING_CURRICULUM.md) | Reading order, official links, YouTube study list |
| [knowledge/HOW_TO_PLAY.md](knowledge/HOW_TO_PLAY.md) | Goals, turns, combat, casting |
| [knowledge/MANA_AND_LANDS.md](knowledge/MANA_AND_LANDS.md) | Five colors, basic lands, mana costs |
| [knowledge/CARD_TYPES.md](knowledge/CARD_TYPES.md) | Creature, instant, sorcery, etc. |
| [knowledge/FIVE_COLORS.md](knowledge/FIVE_COLORS.md) | Color pie and play styles |
| [knowledge/BEGINNER_RULES.md](knowledge/BEGINNER_RULES.md) | Automation cheat sheet |

## Code layout

| Path | Purpose |
|------|---------|
| `actions.py` | pyautogui drag, screenshot |
| `actions_x11.py` | xdotool drag (VM) |
| `heuristics.py` | Tutorial hints → actions |
| `session.py` | JSONL episode logging |
| `run_tutorial_drags.sh` | Batch xdotool tutorial driver |

## Quick start (VM)

```bash
pip install --user -r ../requirements-mtga.txt
sudo apt install -y python3-tk xdotool scrot
export DISPLAY=:1
PYTHONPATH=/workspace python3 -m mtga.session --screenshot
```

## Learning loop

1. **Study** — `knowledge/` docs + videos in LEARNING_CURRICULUM  
2. **Observe** — screenshot (+ OCR later)  
3. **Decide** — heuristics / future policy  
4. **Act** — drag to play; end turn  
5. **Record** — `data/sessions/*.jsonl`  
6. **Review** — update knowledge from mistakes  
