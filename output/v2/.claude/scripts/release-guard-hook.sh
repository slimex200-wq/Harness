#!/bin/bash
# PreToolUse: Verify signing config before release build
set -euo pipefail
if [[ ! -f "android/key.properties" ]]; then
  echo "BLOCKED: android/key.properties not found. Cannot build release."
  exit 1
fi
echo "Signing config found. Release build allowed after user confirmation."
exit 1
