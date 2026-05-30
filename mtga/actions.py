"""Desktop actions for MTG Arena (DISPLAY=:1, Wine)."""

from __future__ import annotations

import os
import time
from dataclasses import dataclass
from pathlib import Path

try:
    import pyautogui
except ImportError:
    pyautogui = None  # type: ignore

try:
    import mss
    import mss.tools
except ImportError:
    mss = None  # type: ignore

# Disable pyautogui corner failsafe (can trigger in fullscreen games)
if pyautogui is not None:
    pyautogui.FAILSAFE = False
    pyautogui.PAUSE = 0.15


@dataclass(frozen=True)
class Point:
    x: int
    y: int


def _require_pyautogui() -> None:
    if pyautogui is None:
        raise RuntimeError("Install pyautogui: pip install pyautogui")


def drag_card_to_battlefield(
    hand_xy: Point,
    battlefield_xy: Point,
    *,
    duration: float = 0.45,
    pause_after: float = 0.3,
) -> None:
    """Play a card by dragging from hand position to battlefield position."""
    _require_pyautogui()
    pyautogui.moveTo(hand_xy.x, hand_xy.y)
    pyautogui.mouseDown()
    time.sleep(0.05)
    pyautogui.moveTo(battlefield_xy.x, battlefield_xy.y, duration=duration)
    pyautogui.mouseUp()
    time.sleep(pause_after)


def click_at(xy: Point, *, clicks: int = 1) -> None:
    _require_pyautogui()
    pyautogui.click(xy.x, xy.y, clicks=clicks)


def end_turn_button(button_xy: Point) -> None:
    """Click the End Turn control (coordinates vary by resolution)."""
    click_at(button_xy)


def press_key(key: str) -> None:
    _require_pyautogui()
    pyautogui.press(key)


def screenshot(path: Path | None = None) -> Path:
    """Capture primary monitor to PNG."""
    if mss is None:
        raise RuntimeError("Install mss: pip install mss")
    out = path or Path("/tmp/mtga_screen.png")
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        img = sct.grab(monitor)
        mss.tools.to_png(img.rgb, img.size, output=str(out))
    return out


# Default layout for 1920x1200 (adjust per calibration)
class Layout1920x1200:
    """Approximate zones — recalibrate from screenshots."""

  # First land in hand (tutorial, right side of hand)
    HAND_LAND = Point(960, 1050)
    HAND_CREATURE = Point(1100, 1050)
    BATTLEFIELD_CENTER = Point(960, 650)
    END_TURN = Point(1750, 1080)
