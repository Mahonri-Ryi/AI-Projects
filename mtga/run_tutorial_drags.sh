#!/usr/bin/env bash
# Drive MTG Arena tutorial via xdotool (drag-to-play). Run on VM with DISPLAY=:1.
set -euo pipefail
export DISPLAY="${DISPLAY:-:1}"

WIN=$(xdotool search --name 'MTGA' 2>/dev/null | head -1)
if [[ -z "$WIN" ]]; then
  echo "MTGA window not found" >&2
  exit 1
fi

xdotool windowactivate --sync "$WIN"
sleep 1

advance_dialog() {
  xdotool key space
  sleep 0.8
  xdotool key Return
  sleep 0.5
  xdotool click 1  # click center after move
  xdotool mousemove --sync 960 600
  xdotool click 1
  sleep 0.6
}

drag() {
  local sx=$1 sy=$2 ex=$3 ey=$4
  xdotool mousemove --sync "$sx" "$sy"
  sleep 0.25
  xdotool mousedown 1
  sleep 0.1
  xdotool mousemove --sync "$ex" "$ey"
  sleep 0.55
  xdotool mouseup 1
  sleep 1.0
}

end_turn() {
  xdotool mousemove --sync 1720 1100
  sleep 0.15
  xdotool click 1
  sleep 1.5
}

echo "Advancing dialogs..."
for _ in $(seq 1 12); do advance_dialog; done

echo "Dragging lands and creatures (1920x1200)..."
# Hand row ~y=1020; battlefield ~y=550-650
drag 720 1020 850 620
drag 960 1020 960 580
drag 1200 1020 1050 620
drag 960 1020 920 500
end_turn

drag 800 1020 880 600
drag 1100 1020 1000 580
end_turn

# Combat: drag toward opponent (top)
drag 960 700 960 280
end_turn

echo "Done. Screenshot: /tmp/mtga_tutorial_run.png"
scrot -u /tmp/mtga_tutorial_run.png 2>/dev/null || true
