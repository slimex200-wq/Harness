#!/bin/bash
# 환경 감지 스크립트
# 필수 도구와 선택 도구의 존재 여부를 확인한다.
# 실패 시 exit 1, 경고만 있으면 exit 0

set -euo pipefail

ERRORS=0
WARNINGS=0

check_required() {
  local name="$1"
  local cmd="$2"
  if command -v "$cmd" &>/dev/null; then
    local ver
    ver=$($cmd --version 2>/dev/null | head -1 || echo "unknown")
    echo "[OK] $name: $ver"
  else
    echo "[FAIL] $name: not found"
    ERRORS=$((ERRORS + 1))
  fi
}

check_optional() {
  local name="$1"
  local cmd="$2"
  if command -v "$cmd" &>/dev/null; then
    local ver
    ver=$($cmd --version 2>/dev/null | head -1 || echo "unknown")
    echo "[OK] $name: $ver"
  else
    echo "[WARN] $name: not found (optional)"
    WARNINGS=$((WARNINGS + 1))
  fi
}

echo "=== Environment Detection ==="
echo ""

# 필수
check_required "Claude CLI" "claude"
check_required "Node.js" "node"
check_required "npm" "npm"
check_required "jq" "jq"
check_required "git" "git"
check_required "bash" "bash"

# 선택
check_optional "Python" "python3"
check_optional "Flutter" "flutter"
check_optional "Go" "go"
check_optional "gitleaks" "gitleaks"
check_optional "semgrep" "semgrep"

echo ""
echo "=== 결과 ==="
echo "필수: $((6 - ERRORS))/6 통과"
echo "선택: 경고 $WARNINGS건"

if [[ $ERRORS -gt 0 ]]; then
  echo "FAIL: 필수 도구 $ERRORS개 누락"
  exit 1
fi

# 사용 가능한 스택 목록 생성
echo ""
echo "=== 사용 가능 스택 ==="
STACKS=""
if command -v node &>/dev/null; then
  STACKS="$STACKS next.js react typescript"
  echo "- Web: Next.js, React, TypeScript"
fi
if command -v python3 &>/dev/null; then
  STACKS="$STACKS python django flask fastapi"
  echo "- Python: Django, Flask, FastAPI"
fi
if command -v flutter &>/dev/null; then
  STACKS="$STACKS flutter dart"
  echo "- Mobile: Flutter, Dart"
fi
if command -v go &>/dev/null; then
  STACKS="$STACKS go golang"
  echo "- Go: Standard library, Gin, Echo"
fi
if [[ -z "$STACKS" ]]; then
  echo "- 없음 (Node.js 또는 Python 설치 필요)"
fi

echo ""
echo "환경 감지 완료"
exit 0
