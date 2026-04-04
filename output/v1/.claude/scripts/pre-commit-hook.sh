#!/bin/bash
# PreCommit: dart format + dart analyze + gitleaks
set -euo pipefail
echo "=== Pre-commit checks ==="

echo "[1/3] dart format --set-exit-if-changed ."
dart format --set-exit-if-changed . || { echo "FAIL: unformatted files."; exit 1; }

echo "[2/3] dart analyze"
dart analyze --fatal-infos || { echo "FAIL: analyze issues."; exit 1; }

echo "[3/3] gitleaks detect"
if command -v gitleaks &>/dev/null; then
  gitleaks detect --source . --no-git -v 2>&1 | tail -5 || { echo "FAIL: secrets detected."; exit 1; }
else
  echo "WARN: gitleaks not installed. Skipping."
fi

echo "=== All pre-commit checks passed ==="
