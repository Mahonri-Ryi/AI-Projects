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
