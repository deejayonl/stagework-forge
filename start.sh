#!/usr/bin/env bash
# start.sh — Start stagework (orch auto-detected and started by the BFF server)

set -euo pipefail
cd "$(dirname "$0")"

# The BFF server auto-detects and starts orch on boot.
# Just launch the dev environment.

if [[ "${1:-}" == "--tauri" ]]; then
  exec npm run dev:tauri
else
  exec npm run dev
fi
