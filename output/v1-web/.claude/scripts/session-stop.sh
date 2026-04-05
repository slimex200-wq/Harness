#!/bin/bash
# SessionStop hook: 현재 세션 상태를 session-state.json에 저장
set -euo pipefail

STATE_FILE=".claude/memory/session-state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 데이터 수집 (경량)
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -10 | jq -R -s 'split("\n") | map(select(length > 0))')
LINT_ISSUES=$(npx eslint . --max-warnings 999 --format compact 2>/dev/null | grep -c "Warning\|Error" || echo "0")

# 커버리지: 마지막 실행 결과에서 읽기
if [ -f "coverage/coverage-summary.json" ]; then
  COVERAGE_PCT=$(jq -r '.total.lines.pct // 0' coverage/coverage-summary.json 2>/dev/null || echo "0")
else
  COVERAGE_PCT="0"
fi

# 빌드 상태: .next 디렉토리 존재 여부
if [ -d ".next" ]; then
  BUILD_STATUS="pass"
else
  BUILD_STATUS="unknown"
fi

CURRENT_SESSION=$(cat <<EOJSON
{
  "timestamp": "$TIMESTAMP",
  "changed_files": $CHANGED_FILES,
  "coverage_pct": ${COVERAGE_PCT:-0},
  "lint_issues": ${LINT_ISSUES:-0},
  "build_status": "$BUILD_STATUS",
  "active_task": "",
  "unfinished": [],
  "agent_runs": []
}
EOJSON
)

if [ -f "$STATE_FILE" ]; then
  UPDATED=$(jq --argjson new "$CURRENT_SESSION" '
    .history = ([.last_session] + .history | .[0:5]) |
    .last_session = $new
  ' "$STATE_FILE")
  echo "$UPDATED" > "$STATE_FILE"
else
  mkdir -p "$(dirname "$STATE_FILE")"
  jq -n --argjson session "$CURRENT_SESSION" '
    { "last_session": $session, "history": [] }
  ' > "$STATE_FILE"
fi
