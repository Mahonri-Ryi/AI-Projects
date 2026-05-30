# MTG Arena — UI controls (Wine / desktop automation)

Critical interaction patterns for bots and Cloud Agents playing on the VM.

## Playing cards from hand

**You must click-and-drag** a card from your hand onto the battlefield (or valid target). A simple click on the card, then click on the board, often **does not** register as casting or playing a land.

### Lands

1. **Press and hold** on the land card in hand (bottom of screen).
2. **Drag** to an empty area on your side of the battlefield.
3. **Release** to play the land.

### Creatures and other permanents

Same as lands: **drag** from hand to an appropriate zone (usually battlefield). For instants/sorceries with targets, drag to the target or follow the game’s target arrows after dragging.

### Combat

- **Attack:** drag attackers toward the opponent / their face, or use the game’s “Attack” phase UI when prompted.
- **Block:** drag blockers onto attackers when blocking.

## Advancing dialogs

- **Space** or **Enter** often advances tutorial text and some prompts.

## Ending your turn

- Use the orange **End Turn** control (bottom-right) when you have no more plays.

## Automation notes

- Wine can desync if clicks are too fast; use ~0.2–0.5s pauses between drag start and release.
- Prefer `pyautogui.drag` (or equivalent) with a visible duration (e.g. `duration=0.4`) over two separate clicks.
- Log each action and capture a screenshot after plays to verify state in the learning program.
