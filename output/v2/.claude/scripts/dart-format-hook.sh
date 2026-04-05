#!/bin/bash
# PostToolUse: Auto dart format on .dart file save
set -euo pipefail
FILEPATH="${CLAUDE_FILE_PATH:-$1}"
if [[ "$FILEPATH" == *.dart ]]; then
  dart format "$FILEPATH" 2>/dev/null || true
fi
