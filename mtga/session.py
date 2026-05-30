"""Log play sessions for later review and learning."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from mtga.actions import screenshot

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "sessions"


def log_event(
    session_id: str,
    *,
    action: str,
    hint: str | None = None,
    notes: str | None = None,
    screenshot_path: str | None = None,
) -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    log_path = DATA_DIR / f"{session_id}.jsonl"
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "hint": hint,
        "notes": notes,
        "screenshot": screenshot_path,
    }
    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    return log_path


def main() -> None:
    parser = argparse.ArgumentParser(description="MTGA session utilities")
    parser.add_argument("--screenshot", action="store_true", help="Save screenshot to /tmp")
    parser.add_argument("--session", default="default", help="Session id for logs")
    args = parser.parse_args()

    if args.screenshot:
        path = screenshot()
        log_event(args.session, action="screenshot", screenshot_path=str(path))
        print(path)


if __name__ == "__main__":
    main()
