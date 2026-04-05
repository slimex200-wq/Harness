---
name: web-verify
description: "Next.js/TypeScript 프로젝트 pre-completion 검증. lint, format, test, build, security 통과 확인."
---

# Web Verify

작업 완료 선언 전 프로젝트 전체 검증을 수행한다.

## When to Activate

- 작업 완료 직전
- "/web-verify", "/verify" 트리거

## Verification Steps

```bash
# 1. TypeScript 타입 체크
npx tsc --noEmit
# Expected: 0 errors

# 2. Lint
npx eslint . --max-warnings 0
# Expected: 0 warnings

# 3. Format
npx prettier --check .
# Expected: 0 changes needed

# 4. Test + Coverage
npx vitest run --coverage
# Expected: 80%+ coverage

# 5. Build
npm run build
# Expected: success

# 6. Secret scan
gitleaks detect --source . --no-git
# Expected: 0 leaks
```

## Pass/Fail

모든 단계 통과 시 PASS. 하나라도 실패 시 FAIL + 실패 단계 + 수정 방법 출력.
