"""Beginner / tutorial heuristics for MTG Arena."""

from __future__ import annotations

from enum import Enum, auto

from mtga.actions import Layout1920x1200, Point, drag_card_to_battlefield, end_turn_button, press_key


class TutorialHint(Enum):
    PLAY_LAND = auto()
    CAST_SPELL = auto()
    ATTACK = auto()
    BLOCK = auto()
    END_TURN = auto()
    DISMISS_DIALOG = auto()
    UNKNOWN = auto()


def act_on_hint(hint: TutorialHint, layout: type[Layout1920x1200] = Layout1920x1200) -> str:
    """Execute a single heuristic action. Returns description for logs."""
    if hint == TutorialHint.DISMISS_DIALOG:
        press_key("space")
        return "pressed_space_dialog"

    if hint == TutorialHint.PLAY_LAND:
        drag_card_to_battlefield(layout.HAND_LAND, layout.BATTLEFIELD_CENTER)
        return "drag_land_to_battlefield"

    if hint == TutorialHint.CAST_SPELL:
        drag_card_to_battlefield(layout.HAND_CREATURE, layout.BATTLEFIELD_CENTER)
        return "drag_creature_to_battlefield"

    if hint == TutorialHint.END_TURN:
        end_turn_button(layout.END_TURN)
        return "click_end_turn"

    if hint == TutorialHint.ATTACK:
        # Tutorial often highlights attackers; drag toward top-center (opponent)
        drag_card_to_battlefield(
            layout.HAND_CREATURE,
            Point(layout.BATTLEFIELD_CENTER.x, 350),
            duration=0.5,
        )
        return "drag_attacker_forward"

    return "no_op_unknown_hint"
