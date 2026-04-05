#!/bin/bash
# Harness Maker Headless Runner
# 완전 무인 실행: claude -p 기반
# Usage:
#   run.sh "<자연어 설명>"                    # 새 하네스 생성
#   run.sh --resume <generation>             # 체크포인트에서 재개
#   run.sh "<설명>" --with-product           # 하네스 + 프로덕트

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HARNESS_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG="$HARNESS_ROOT/lib/config.json"
CHECKPOINT_DIR="$HARNESS_ROOT/.checkpoints"

# 환경 감지
echo "=== Harness Maker Headless Runner ==="
echo "환경 감지 중..."
bash "$SCRIPT_DIR/env-detect.sh" || { echo "FATAL: 환경 요구사항 미충족"; exit 1; }

# 인자 파싱
RESUME=""
WITH_PRODUCT=false
INPUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --resume)
      RESUME="$2"
      shift 2
      ;;
    --with-product)
      WITH_PRODUCT=true
      shift
      ;;
    *)
      INPUT="$1"
      shift
      ;;
  esac
done

# 설정 로드
THRESHOLD=$(jq -r '.perfection_threshold' "$CONFIG")
MAX_GEN=$(jq -r '.max_generations' "$CONFIG")

# 프롬프트 구성
if [[ -n "$RESUME" ]]; then
  LATEST=$(bash "$SCRIPT_DIR/checkpoint.sh" latest "$RESUME")
  PROMPT="하네스 메이커 파이프라인을 체크포인트에서 재개한다.
세대: v$RESUME
마지막 완료 마일스톤: $LATEST
체크포인트 디렉토리: $CHECKPOINT_DIR/v$RESUME/

해당 마일스톤 다음부터 이어서 실행.
audit $THRESHOLD/70 이상 달성할 때까지 세대를 반복.
사용자 개입 없이 완전 자동 실행."
else
  if [[ -z "$INPUT" ]]; then
    echo "Usage: run.sh \"<자연어 설명>\" [--with-product]" >&2
    echo "       run.sh --resume <generation>" >&2
    exit 1
  fi

  PRODUCT_FLAG=""
  if $WITH_PRODUCT; then
    PRODUCT_FLAG="
하네스 완성 후 Phase 2(프로덕트 생성)도 자동 실행.
M11(기획) → M12(설계) → R1-R3(설계 리뷰) → M13(구현) → M14(빌드 검증) → R4-R9(프로덕트 리뷰) → M16(배포).
모든 리뷰는 isolated-reviewer로 자동 실행. 사용자 개입 없음."
  fi

  PROMPT="/harness-maker $INPUT

실행 규칙:
- 완전 무인 실행. 사용자에게 절대 질문하지 않는다.
- 환경 감지: 스택에 필요한 도구가 설치되어 있는지 먼저 확인. 없으면 대안 스택 제안 후 자동 전환.
- 체크포인트: 각 마일스톤 완료 시 $CHECKPOINT_DIR에 저장.
- audit $THRESHOLD/70 이상 달성할 때까지 세대를 반복. 최대 $MAX_GEN세대.
- 빌드 실패 시: 에러 분석 → 자동 수정 → 재빌드 (최대 3회).
- 패키지 호환성: 설치된 버전의 API에 맞게 코드 생성. 공식 문서/타입 정의를 읽고 생성.
$PRODUCT_FLAG"
fi

echo ""
echo "=== 실행 시작 ==="
echo "프롬프트 길이: ${#PROMPT}자"
echo "임계값: $THRESHOLD/70"
echo "최대 세대: $MAX_GEN"
echo ""

# Claude headless 실행
cd "$HARNESS_ROOT"
claude -p "$PROMPT" --allowedTools "Bash,Read,Write,Edit,Glob,Grep,Agent,WebSearch,WebFetch"
