# Learning curriculum (read + watch)

Structured path for the MTG Arena agent (and humans) to learn rules before advanced automation.

## Recommended order

1. [HOW_TO_PLAY.md](HOW_TO_PLAY.md) — goals, turn, combat, casting  
2. [MANA_AND_LANDS.md](MANA_AND_LANDS.md) — colors, Plains/Forest/etc., one land per turn  
3. [CARD_TYPES.md](CARD_TYPES.md) — creature vs instant vs land  
4. [FIVE_COLORS.md](FIVE_COLORS.md) — what each color means  
5. [BEGINNER_RULES.md](BEGINNER_RULES.md) — Arena automation priorities  
6. [docs/MTGA_CONTROLS.md](../../docs/MTGA_CONTROLS.md) — drag-to-play  

## Official text

| Resource | URL |
|----------|-----|
| How to Play (Wizards) | https://magic.wizards.com/en/how-to-play |
| MTG Arena — Getting Started | https://magic.wizards.com/en/mtgarena/getting-started |
| Keyword glossary | https://magic.wizards.com/en/keywords |
| Gatherer (card database) | https://gatherer.wizards.com/ |

## Videos (study notes — watch on desktop)

Agents cannot watch video in-session; humans or future transcript tools should use these. Chapters summarize what to extract.

### 1. Start Learning to Play (~6 min)

- **URL**: https://www.youtube.com/watch?v=LC95B2XwweA  
- **Channel**: Magic: The Gathering  
- **Focus**: One core idea — **how to cast a spell** (pay mana from lands).  
- **Takeaway**: Learn casting first; everything else builds on mana and costs.

### 2. How to Play — Magic: The Gathering (~variable)

- **URL**: https://www.youtube.com/watch?v=6AGzsQcLpzA  
- **Focus**: Arena as best way to learn; hands-on tutorials vs paper.  
- **Takeaway**: Same rules in Arena and paper; use Arena tutorial for practice.

### 3. Learn to Play | The Command Zone (~45 min)

- **URL**: https://www.youtube.com/watch?v=pISs64CG6Tg  
- **Chapters** (approximate):  
  - **01:21** — How to cast a spell  
  - **07:04** — Creature combat  
  - **20:03** — Playing the game (turn structure)  
  - **33:31** — Card types  
- **Takeaway**: Full beginner session; map each chapter to our markdown files above.

## In-game (MTG Arena)

| Step | What to do |
|------|------------|
| New player tutorial | Scripted matches (e.g. vs Kylea) — **drag** lands and creatures |
| Color Challenges | Five colors, ~25 games — teaches color identity |
| Codex of the Multiverse | In-client articles; **Replay Tutorial** |
| Skip (optional) | Gear → View Account → **Skip Tutorial** (still grants rewards per Wizards FAQ) |

## Learning program (code) — next steps

| Milestone | Implementation |
|-----------|----------------|
| Know rules | This `knowledge/` folder |
| Observe game | Screenshots + OCR on tutorial banner text |
| Decide | Map banner → `TutorialHint` in `heuristics.py` |
| Act | `drag()` in `actions_x11.py` / `run_tutorial_drags.sh` |
| Improve | Log wins/losses in `data/sessions/*.jsonl`; review mistakes |

## Quiz (self-check)

1. How many lands can you play per turn by default? **One.**  
2. Is a Plains cast as a spell? **No — played as a land.**  
3. What do Islands produce? **Blue (U) mana.**  
4. Where do instants go after resolving? **Graveyard.**  
5. How do you play a card from hand in Arena? **Drag to battlefield (or valid target).**
