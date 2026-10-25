#!/usr/bin/env bash
# Superset workspace setup — runs once when a new workspace (worktree) is created.
# Goal: a fresh worktree comes up with deps installed and env present, no manual steps.
set -euo pipefail

# The Next.js app lives in prototype/. Resolve it inside the current workspace.
WORKSPACE="${SUPERSET_WORKSPACE_PATH:-$(pwd)}"
APP_DIR="$WORKSPACE/prototype"
cd "$APP_DIR"

# 1. Install dependencies deterministically from the committed lockfile.
#    npm ci is fast and reproducible; fall back to npm install if no lockfile.
if [ -f package-lock.json ]; then
  echo "Installing dependencies with npm ci..."
  npm ci
else
  echo "No lockfile found; installing with npm install..."
  npm install
fi

# 2. Copy gitignored env files from the main checkout (they are never committed,
#    so new worktrees would otherwise start without them).
if [ -n "${SUPERSET_ROOT_PATH:-}" ]; then
  for f in .env .env.local .env.development.local; do
    src="$SUPERSET_ROOT_PATH/prototype/$f"
    if [ -f "$src" ] && [ ! -f "$APP_DIR/$f" ]; then
      cp "$src" "$APP_DIR/$f"
      echo "Copied prototype/$f from the main checkout."
    fi
  done
else
  echo "SUPERSET_ROOT_PATH not set; skipping env copy."
fi

echo "Setup complete."
