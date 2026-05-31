# Beginner rules (for heuristics)

## Turn structure (simplified)

1. **Untap** — ready permanents  
2. **Upkeep** — triggers  
3. **Draw** — draw one (first player skips first draw)  
4. **Main 1** — play lands, cast spells  
5. **Combat** — attackers, blockers, damage  
6. **Main 2** — more spells  
7. **End** — end step, cleanup  

## Arena automation priorities

| Prompt / situation | Action |
|------------------|--------|
| "Play a land" | **Drag** land from hand → battlefield |
| Mana open, creature in hand | **Drag** creature → battlefield |
| Combat step | **Drag** creatures toward opponent; confirm attacks |
| No legal plays | **End Turn** |
| Dialog / story | **Space** |

## One land per turn

Normally one land per turn unless an effect says otherwise (tutorial may bend this).

## Learning improvements (backlog)

- OCR tutorial banner text → map to `TutorialHint`  
- Detect hand vs battlefield card positions from vision  
- Reward: tutorial step advanced, life total changed, game won  
- Replay failed drags with adjusted coordinates  

## Rules reference (full)

See [HOW_TO_PLAY.md](HOW_TO_PLAY.md), [MANA_AND_LANDS.md](MANA_AND_LANDS.md), [CARD_TYPES.md](CARD_TYPES.md), [FIVE_COLORS.md](FIVE_COLORS.md).

## Turn 2 "Play another land" trap

On turn 2 you still get **one land drop for that turn** — not a second land on top of turn 1’s. If Plains won’t drag:

1. You may have already played your land this turn → **drag a creature** instead.  
2. Or press **End Turn**.

## Videos to study

Listed in [LEARNING_CURRICULUM.md](LEARNING_CURRICULUM.md) (Wizards + Command Zone).
