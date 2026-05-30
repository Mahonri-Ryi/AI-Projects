"""X11 actions via xdotool (works without tkinter)."""

from __future__ import annotations

import subprocess
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class Point:
    x: int
    y: int


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=False, env={**subprocess.os.environ, "DISPLAY": ":1"})


def drag(hand: Point, target: Point, *, duration_ms: int = 400) -> None:
    _run(["xdotool", "mousemove", str(hand.x), str(hand.y)])
    time.sleep(0.15)
    _run(["xdotool", "mousedown", "1"])
    time.sleep(0.05)
    _run(["xdotool", "mousemove", "--sync", str(target.x), str(target.y)])
    time.sleep(duration_ms / 1000.0)
    _run(["xdotool", "mouseup", "1"])
    time.sleep(0.25)


def click(xy: Point) -> None:
    _run(["xdotool", "mousemove", str(xy.x), str(xy.y)])
    time.sleep(0.1)
    _run(["xdotool", "click", "1"])


def key(key: str) -> None:
    _run(["xdotool", "key", key])
