#!/bin/zsh
# Weekly Postiz top-up: book every built comic that isn't booked yet, split
# across the two lanes (tiktok+instagram, tiktok-2) so each TikTok account gets
# different comics. The lane with fewer upcoming posts gets the odd one.
# Commits only postiz-ledger.json afterwards.
#
# Runs from launchd (~/Library/LaunchAgents/app.gainframe.postiz-weekly.plist).
# Safe to run by hand: ./weekly_postiz.sh          (books for real)
#                      ./weekly_postiz.sh --dry-run
# (A dry run shows the same comics on both lanes because nothing is written to
# the ledger between the two lanes; a real run gives lane 2 the next comics.)
set -u
setopt pipefail
PIPELINE_DIR=${0:A:h}
REPO=${PIPELINE_DIR:h:h:h:h:h}
PY=${POSTIZ_PYTHON:-python3}
P=$PIPELINE_DIR/schedule_postiz.py
LEDGER=${POSTIZ_LEDGER:-$PIPELINE_DIR/postiz-ledger.json}
COMMIT=--commit
[[ ${1:-} == --dry-run ]] && COMMIT=

notify() { osascript -e "display notification \"$1\" with title \"GainFrame comics\"" 2>/dev/null; }

echo "=== $(date '+%Y-%m-%d %H:%M') weekly Postiz top-up"
ready=$($PY $P queue | head -1 | awk '{print $1}')
if [[ ! $ready == <-> ]]; then
  echo "queue failed: $ready"; notify "Weekly booking failed: queue error. See the log."; exit 1
fi
if (( ready == 0 )); then
  echo "Nothing new to book."; notify "No new comics to book this week."; exit 0
fi

# Upcoming posts per lane, from the ledger.
read lane1_q lane2_q < <($PY - "$LEDGER" <<'EOF'
import json, sys, datetime as dt
now = dt.datetime.now(dt.timezone.utc)
n = {"tiktok": 0, "tiktok-2": 0}
for e in json.load(open(sys.argv[1]))["posts"].values():
    if e.get("status") == "scheduled" and dt.datetime.fromisoformat(e["scheduled_for"].replace("Z", "+00:00")) > now:
        for lane in n:
            if lane in e.get("channels", {}):
                n[lane] += 1
print(n["tiktok"], n["tiktok-2"])
EOF
)
half=$(( ready / 2 ))
lane1=$half lane2=$half
if (( ready % 2 )); then
  if (( lane1_q <= lane2_q )); then (( lane1++ )); else (( lane2++ )); fi
fi
echo "$ready ready; lane 1 gets $lane1 (has $lane1_q queued), lane 2 gets $lane2 (has $lane2_q queued)"

failed=0
if (( lane1 > 0 )); then
  $PY $P schedule --next $lane1 --channels tiktok,instagram $COMMIT | grep -v "^  uploaded " || failed=1
fi
if (( lane2 > 0 )); then
  $PY $P schedule --next $lane2 --channels tiktok-2 $COMMIT | grep -v "^  uploaded " || failed=1
fi
[[ -z $COMMIT ]] && exit 0

if ! git -C "$REPO" diff --quiet -- "$LEDGER"; then
  git -C "$REPO" commit -q -m "Book $ready comics in Postiz (weekly top-up)" -- "$LEDGER" \
    && { git -C "$REPO" push -q origin HEAD 2>&1 || echo "push failed; ledger committed locally"; }
fi

if (( failed )); then
  notify "Weekly booking hit an error. See ~/Library/Logs/gainframe-postiz-weekly.log"; exit 1
fi
notify "Booked $ready new comics in Postiz."
