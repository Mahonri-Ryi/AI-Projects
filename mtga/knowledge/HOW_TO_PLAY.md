# How to play Magic (rules core)

Sources: [Wizards — How to Play](https://magic.wizards.com/en/how-to-play), [MTG Arena Getting Started](https://magic.wizards.com/en/mtgarena/getting-started).

## Goal

Reduce your opponent’s **life total from 20 to 0** (or make them unable to draw a card when required). In Arena tutorials, opponents may start at different life totals.

## Setup

1. Shuffle your **library** (deck), draw **seven** cards (hand).
2. Optional **mulligan**: redraw with one fewer card if the hand is bad.
3. Decide who goes first; **first player skips their first draw step**.

## Zones

| Zone | Meaning |
|------|---------|
| **Hand** | Cards you can play (hidden from opponent). |
| **Battlefield** | Permanents in play (lands, creatures, etc.). |
| **Library** | Your deck, face down. |
| **Graveyard** | Used instants/sorceries and dead permanents. |
| **Stack** | Spells and abilities waiting to resolve (LIFO). |

## Lands vs spells (critical)

- **Lands are not spells.** You do **not** “cast” them.
- **Play a land**: put one land from hand onto the battlefield during a **main phase** when the stack is empty.
- **One land per turn** (unless an effect says otherwise). Tutorial text can be misleading on turn 2 — if a land won’t play, you may already have used your land drop; try a **creature** or **End Turn**.

## Mana

1. **Tap** a land (turn sideways in paper; click/tap in Arena) to add mana to your **mana pool**.
2. Spend mana to **cast spells** (cost shown top-right on the card).
3. **Generic** costs (grey number) can be paid with mana of **any** color.
4. **Colored** symbols (W, U, B, R, G) require that color.
5. Unused mana usually empties at end of step (Arena handles this).

## Casting a spell (non-land)

1. Choose a spell you can afford.
2. Pay mana (Arena auto-taps lands or prompts you).
3. Spell goes on the **stack**; opponent may respond with instants.
4. When it resolves:
   - **Permanent** (creature, artifact, enchantment, planeswalker) → stays on **battlefield**.
   - **Instant / sorcery** → effect happens, card goes to **graveyard**.

## Turn phases (simplified)

| Phase | What you do |
|-------|-------------|
| **Beginning** | Untap permanents → upkeep triggers → **draw** (except first player turn 1). |
| **First main** | Play **one land**, cast sorceries/creatures, etc. |
| **Combat** | Attackers → blockers → damage (see below). |
| **Second main** | Same as first main; **no second land** if you already played one this turn. |
| **End** | “End of turn” effects, cleanup, pass turn. |

## Combat (simplified)

1. **Declare attackers**: tap creatures to attack (unless they have vigilance). Drag attackers toward opponent in Arena.
2. **Declare blockers**: Defender assigns untapped creatures to block.
3. **Damage**: Unblocked attackers hit the player; blocked creatures fight blockers. Damage ≥ **toughness** destroys a creature.

## Reading a card

| Part | Meaning |
|------|---------|
| **Name** | Card name. |
| **Mana cost** (top right) | Cost to cast. |
| **Type line** | e.g. “Creature — Human Soldier”. |
| **Text box** | Rules text and keywords. |
| **Power / toughness** (bottom right on creatures) | Combat stats. |

## Arena UI (automation)

- **Play land / cast permanent from hand**: **click and drag** to battlefield (not click-click).
- **Attack**: drag your creature on the battlefield toward the opponent.
- **Dialogs / tutorial**: Space or click Continue.
- **End Turn**: orange control, bottom-right.

See [MTGA_CONTROLS.md](../../docs/MTGA_CONTROLS.md) and [BEGINNER_RULES.md](BEGINNER_RULES.md).
