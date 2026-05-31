# Card types

Every Magic card has a **type line**. How you use the card depends on its type.

## Overview

| Type | Is it a spell when played? | Stays on battlefield? |
|------|---------------------------|---------------------|
| **Land** | No — you *play* it | Yes (permanent) |
| **Creature** | Yes — you *cast* it | Yes |
| **Artifact** | Yes | Yes (usually) |
| **Enchantment** | Yes | Yes (usually) |
| **Planeswalker** | Yes | Yes |
| **Instant** | Yes | No — graveyard after resolving |
| **Sorcery** | Yes | No — graveyard after resolving |

## Land

- Produces **mana** (usually by tapping).
- Not cast; **played** from hand.
- See [MANA_AND_LANDS.md](MANA_AND_LANDS.md).

## Creature

- Has **power** (damage dealt in combat) and **toughness** (damage needed to destroy).
- Can **attack** and **block** when rules allow.
- **Summoning sickness**: can’t attack the turn it enters (unless it has **haste**).
- Keywords examples: flying, vigilance, lifelink, trample (learn via [keyword glossary](https://magic.wizards.com/en/keywords)).

## Instant

- Cast **any time**, even on opponent’s turn — even in response to their spell.
- Goes to graveyard after effect resolves.
- Arena: often shown with a “flash” timing when you can cast.

## Sorcery

- Cast only during **your** main phase when the stack is empty (simplified).
- One-shot effects (damage, draw cards, destroy things).

## Artifact

- Represents items, machines, relics.
- Usually permanents on the battlefield.
- Colorless unless the mana cost includes colored symbols.

## Enchantment

- Magical effects that stick around (Auras attach to creatures; global enchantments affect the board).

## Planeswalker

- Allies you can have on the battlefield with **loyalty counters**.
- Once per turn you may activate **loyalty abilities** (+, −, or static).
- Can be attacked like a player; damage removes loyalty.

## Subtypes

Type line includes subtypes after em dash, e.g.:

- **Creature — Human Soldier**
- **Land — Plains**
- **Instant — Lesson**

Subtypes matter for some rules (“target Goblin”, “Plainswalk”, etc.).

## Permanents vs non-permanents

**Permanents**: land, creature, artifact, enchantment, planeswalker on the battlefield.

**Non-permanents**: instants and sorceries (and cards in other zones).

## What to play first (tutorial heuristic)

1. **Land** (if you haven’t this turn and have one).
2. **Creatures** you can afford (build board).
3. **Combat** when in attack step.
4. **Instants** when they matter (often later).
5. **End turn** when no profitable plays.
