#!/bin/bash
# SessionStop hook: 현재 세션 상태를 session-state.json에 저장
set -euo pipefail

STATE_FILE=".claude/memory/session-state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 데이터 수집 (경량 — timeout 안전)
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -10 | jq -R -s 'split("\n") | map(select(length > 0))')
LINT_ISSUES=$(dart analyze 2>/dev/null | grep -c "info\|warning\|error" || echo "0")

# 커버리지: 마지막 실행 결과 캐시에서 읽기 (flutter test 재실행 대신)
if [ -f "coverage/lcov.info" ]; then
  TOTAL_LINES=$(grep -c "DA:" coverage/lcov.info 2>/dev/null || echo "0")
  HIT_LINES=$(grep "DA:" coverage/lcov.info 2>/dev/null | grep -c ",\([1-9]\)" || echo "0")
  if [ "$TOTAL_LINES" -gt 0 ]; then
    COVERAGE_PCT=$(echo "scale=1; $HIT_LINES * 100 / $TOTAL_LINES" | bc 2>/dev/null || echo "0")
  else
    COVERAGE_PCT="0"
  fi
else
  COVERAGE_PCT="0"
fi

# 빌드 상태: 마지막 빌드 디렉토리 존재 여부로 판단 (빌드 재실행 대신)
if [ -d "build/windows" ] || [ -d "build/app" ]; then
  BUILD_STATUS="pass"
else
  BUILD_STATUS="unknown"
fi

# 현재 세션 상태 생성
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

# 기존 상태 파일 업데이트
if [ -f "$STATE_FILE" ]; then
  # 이전 last_session을 history에 추가 (최대 5개 유지)
  UPDATED=$(jq --argjson new "$CURRENT_SESSION" '
    .history = ([.last_session] + .history | .[0:5]) |
    .last_session = $new
  ' "$STATE_FILE")
  echo "$UPDATED" > "$STATE_FILE"
else
  # 새 파일 생성
  mkdir -p "$(dirname "$STATE_FILE")"
  jq -n --argjson session "$CURRENT_SESSION" '
    { "last_session": $session, "history": [] }
  ' > "$STATE_FILE"
fi
