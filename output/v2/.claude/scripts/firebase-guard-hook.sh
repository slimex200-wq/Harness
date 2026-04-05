#!/bin/bash
# PreToolUse: Block firebase deploy without explicit confirmation
set -euo pipefail
echo "BLOCKED: firebase deploy requires explicit user confirmation."
echo "Target project: $(firebase use 2>/dev/null || echo 'unknown')"
echo "To proceed, user must confirm in chat."
exit 1
