#!/usr/bin/env bash
# Superset workspace teardown — runs when a workspace is deleted.
# Stops the dev server that run.sh may have left listening, so no stray
# process survives the worktree being removed.
set -euo pipefail

WORKSPACE="${SUPERSET_WORKSPACE_PATH:-$(pwd)}"
PORT_FILE="$WORKSPACE/.superset/.dev-port"

if [ -f "$PORT_FILE" ]; then
  PORT="$(cat "$PORT_FILE" 2>/dev/null || true)"
  if [ -n "${PORT:-}" ]; then
    PIDS="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$PIDS" ]; then
      echo "Stopping dev server on port $PORT (pids: $PIDS)"
      # shellcheck disable=SC2086
      kill $PIDS 2>/dev/null || true
    fi
  fi
  rm -f "$PORT_FILE"
fi

echo "Teardown complete."
