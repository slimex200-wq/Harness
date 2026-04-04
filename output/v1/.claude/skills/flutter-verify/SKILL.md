---
name: flutter-verify
description: "Flutter 프로젝트 pre-completion 검증. dart analyze, format, test coverage, build 통과 확인."
---

# Flutter Verify

작업 완료 선언 전 Flutter 프로젝트 전체 검증을 수행한다.

## When to Activate

- 작업 완료 직전
- "/flutter-verify", "/verify" 트리거

## Verification Steps

```bash
# 1. Lint
dart analyze --fatal-infos
# Expected: 0 issues

# 2. Format
dart format --set-exit-if-changed .
# Expected: 0 changes needed

# 3. Test + Coverage
flutter test --coverage
# Expected: 80%+ coverage

# 4. Build (debug)
flutter build windows --debug  # or apk/web
# Expected: success

# 5. Secret scan
gitleaks detect --source . --no-git
# Expected: 0 leaks
```

## Pass/Fail

모든 단계 통과 시 PASS. 하나라도 실패 시 FAIL + 실패 단계 + 수정 방법 출력.

## Output

```json
{
  "passed": true,
  "steps": [
    {"name": "dart_analyze", "passed": true},
    {"name": "dart_format", "passed": true},
    {"name": "flutter_test", "passed": true, "coverage": 87.3},
    {"name": "flutter_build", "passed": true},
    {"name": "gitleaks", "passed": true}
  ]
}
```
