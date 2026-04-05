#!/bin/bash
# SessionStart hook: 이전 세션 상태 로드 + 프로젝트 스냅샷
set -euo pipefail

STATE_FILE=".claude/memory/session-state.json"

echo "=== Flutter Session Context ==="

# 1. 이전 세션 상태 로드
if [ -f "$STATE_FILE" ]; then
  LAST_SESSION=$(jq -r '.last_session // empty' "$STATE_FILE" 2>/dev/null)
  if [ -n "$LAST_SESSION" ]; then
    echo ""
    echo "## Previous Session"
    TIMESTAMP=$(echo "$LAST_SESSION" | jq -r '.timestamp // "unknown"')
    ACTIVE_TASK=$(echo "$LAST_SESSION" | jq -r '.active_task // "none"')
    COVERAGE=$(echo "$LAST_SESSION" | jq -r '.coverage_pct // "unknown"')
    LINT_ISSUES=$(echo "$LAST_SESSION" | jq -r '.lint_issues // "unknown"')
    BUILD_STATUS=$(echo "$LAST_SESSION" | jq -r '.build_status // "unknown"')
    echo "- Time: $TIMESTAMP"
    echo "- Active Task: $ACTIVE_TASK"
    echo "- Coverage: ${COVERAGE}%"
    echo "- Lint Issues: $LINT_ISSUES"
    echo "- Build: $BUILD_STATUS"

    # Unfinished items
    UNFINISHED=$(echo "$LAST_SESSION" | jq -r '.unfinished[]? // empty' 2>/dev/null)
    if [ -n "$UNFINISHED" ]; then
      echo "- Unfinished:"
      echo "$UNFINISHED" | while read -r item; do
        echo "  - $item"
      done
    fi

    # Changed files
    CHANGED=$(echo "$LAST_SESSION" | jq -r '.changed_files[]? // empty' 2>/dev/null)
    if [ -n "$CHANGED" ]; then
      echo "- Last Changed Files:"
      echo "$CHANGED" | head -5 | while read -r f; do
        echo "  - $f"
      done
    fi
  fi
fi

# 2. 현재 프로젝트 스냅샷 (간결하게)
echo ""
echo "## Current State"

# dart analyze (경고 수만)
ANALYZE_COUNT=$(dart analyze 2>/dev/null | grep -c "info\|warning\|error" || echo "0")
echo "- Lint issues: $ANALYZE_COUNT"

# git 상태
DIRTY=$(git diff --stat 2>/dev/null | tail -1 || echo "clean")
echo "- Git: $DIRTY"

echo "=== END ==="
