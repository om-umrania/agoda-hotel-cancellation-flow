#!/usr/bin/env bash
# Superset "Run" command — launches the Next.js dev server.
# Picks a free port so parallel workspaces don't collide on 3000.
set -euo pipefail

WORKSPACE="${SUPERSET_WORKSPACE_PATH:-$(pwd)}"
APP_DIR="$WORKSPACE/prototype"
cd "$APP_DIR"

# Honour an explicit PORT if the user set one; otherwise find the first free
# port in 3000-3100. Each parallel workspace lands on its own port this way.
PORT="${PORT:-}"
if [ -z "$PORT" ]; then
  for candidate in $(seq 3000 3100); do
    if ! lsof -iTCP:"$candidate" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
      PORT="$candidate"
      break
    fi
  done
fi
PORT="${PORT:-3000}"

# Record the chosen port so teardown can stop this server if it is still up.
mkdir -p "$WORKSPACE/.superset"
echo "$PORT" > "$WORKSPACE/.superset/.dev-port"

echo "Starting Next.js dev server on http://localhost:$PORT"
exec npm run dev -- --port "$PORT"
