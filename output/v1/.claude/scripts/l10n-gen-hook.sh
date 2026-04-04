#!/bin/bash
# PostToolUse: Auto flutter gen-l10n on .arb file change
set -euo pipefail
if command -v flutter &>/dev/null; then
  flutter gen-l10n 2>&1 | tail -3 || true
fi
