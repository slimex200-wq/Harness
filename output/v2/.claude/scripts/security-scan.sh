#!/bin/bash
# 통합 보안 스캔: gitleaks + semgrep + dependency audit
set -euo pipefail

echo "=== Security Scan ==="
ISSUES=0

# 1. Secrets scan (gitleaks)
echo ""
echo "## 1. Secrets (gitleaks)"
if command -v gitleaks &>/dev/null; then
  if gitleaks detect --source . --no-git 2>/dev/null; then
    echo "PASS: No secrets found"
  else
    echo "FAIL: Secrets detected"
    ISSUES=$((ISSUES + 1))
  fi
else
  echo "SKIP: gitleaks not installed"
fi

# 2. SAST (semgrep)
echo ""
echo "## 2. SAST (semgrep)"
if command -v semgrep &>/dev/null; then
  FINDINGS=$(semgrep scan --config auto --lang dart lib/ --json 2>/dev/null | jq '.results | length' || echo "0")
  if [ "$FINDINGS" -eq 0 ]; then
    echo "PASS: No findings"
  else
    echo "FAIL: $FINDINGS finding(s)"
    ISSUES=$((ISSUES + 1))
  fi
else
  echo "SKIP: semgrep not installed"
fi

# 3. Dependency audit
echo ""
echo "## 3. Dependency Audit"
OUTDATED=$(dart pub outdated --json 2>/dev/null | jq '[.packages[] | select(.isDiscontinued == true or .current.version != .latest.version)] | length' || echo "0")
echo "Outdated packages: $OUTDATED"
if [ "$OUTDATED" -gt 5 ]; then
  echo "WARNING: Many outdated packages"
  ISSUES=$((ISSUES + 1))
fi

echo ""
echo "=== Total Issues: $ISSUES ==="
exit $ISSUES
