#!/bin/bash
# harness-audit 결과를 JSON으로 변환
# Usage: audit-adapter.sh <target_dir>
# Output: JSON with scores per category

set -euo pipefail

TARGET_DIR="${1:-.}"

# harness-audit는 Claude Code 커맨드이므로
# 실제로는 에이전트가 harness-audit 로직을 직접 실행하고
# 이 스크립트는 결과 파싱만 담당

# 에이전트가 audit 결과를 임시 파일에 저장한 후 이 스크립트로 파싱
AUDIT_RESULT="${2:-/tmp/harness-audit-result.txt}"

if [[ ! -f "$AUDIT_RESULT" ]]; then
  echo '{"error": "audit result file not found", "path": "'"$AUDIT_RESULT"'"}' >&2
  exit 1
fi

# 점수 추출 패턴: "Category: N/10"
python3 -c "
import re, json, sys

text = open('$AUDIT_RESULT').read()
categories = {}
pattern = r'(\w[\w\s]+):\s*(\d+)/10'
for match in re.finditer(pattern, text):
    name = match.group(1).strip()
    score = int(match.group(2))
    categories[name] = score

total = sum(categories.values())
result = {
    'total_score': total,
    'max_score': 70,
    'categories': categories,
    'weak_categories': [k for k, v in categories.items() if v < 9],
    'passed': total >= 63
}
print(json.dumps(result, indent=2))
"
