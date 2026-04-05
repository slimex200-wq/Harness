---
name: flutter-eval
description: "Flutter 프로젝트 eval 프레임워크. 7개 카테고리 rubric으로 코드 품질을 정량 평가. /flutter-eval 또는 /eval 트리거."
model: haiku
---

# Flutter Eval

Flutter 프로젝트의 코드 품질을 7개 카테고리 rubric으로 정량 평가한다.

## When to Activate

- `/flutter-eval`, `/eval` 커맨드 실행
- "eval 실행", "품질 체크", "점수 확인" 자연어 트리거
- 작업 완료 선언 전 (CLAUDE.md Workflow의 Eval 단계)

## Rubric (7 Categories, 70 max)

### Code Graders (결정적, 자동)

| # | 카테고리 | 측정 방법 | 채점 |
|---|----------|----------|------|
| 1 | `lint_compliance` | `dart analyze --fatal-infos` | 0 issues=10, 1개당 -1 (min 0) |
| 2 | `test_coverage` | `flutter test --coverage` | 90%+=10, 80%+=8, 70%+=6, <70%=4 |
| 3 | `build_health` | `flutter build windows --debug` | pass=10, fail=0 |
| 4 | `security_posture` | `gitleaks detect` + `semgrep scan` | 0 findings=10, finding당 -3 (min 0) |

### Model Graders (LLM 판정, haiku)

| # | 카테고리 | 판정 기준 | 채점 |
|---|----------|----------|------|
| 5 | `arch_compliance` | Firebase import가 UI layer에 없는지, MVVM+Repository 패턴 준수 | 위반 0=10, 위반당 -2 |
| 6 | `code_quality` | const 사용률, 위젯 분해(build 50줄 이하), 네이밍 규칙 | 0-10 종합 판정 |
| 7 | `session_efficiency` | 빌드 사이클 수, 에이전트 재실행 횟수, 불필요한 파일 변경 | 0-10 종합 판정 |

## Process

1. Code graders 4개를 순차 실행 (각 명령 실행 → 결과 파싱 → 점수)
2. Model graders 3개를 실행 (변경된 .dart 파일 read → 규칙 기반 판정)
3. 총점 계산 + 카테고리별 breakdown
4. `.claude/evals/flutter-harness.log`에 결과 append
5. Baseline 대비 회귀 체크 (카테고리 점수가 이전보다 하락하면 경고)

## Output Format

```json
{
  "total_score": 62,
  "max_score": 70,
  "passed": false,
  "pass_threshold": 56,
  "categories": {
    "lint_compliance": { "score": 10, "max": 10, "grader": "code" },
    "test_coverage": { "score": 8, "max": 10, "grader": "code", "detail": "coverage: 83.2%" },
    "build_health": { "score": 10, "max": 10, "grader": "code" },
    "security_posture": { "score": 10, "max": 10, "grader": "code" },
    "arch_compliance": { "score": 8, "max": 10, "grader": "model", "violations": [] },
    "code_quality": { "score": 9, "max": 10, "grader": "model" },
    "session_efficiency": { "score": 7, "max": 10, "grader": "model" }
  },
  "regressions": [],
  "recommendations": [],
  "timestamp": "2026-04-05T12:00:00Z"
}
```

## Regression Detection

1. `.claude/evals/flutter-harness.log`에서 이전 결과 로드
2. 카테고리별 점수 비교
3. 2점 이상 하락한 카테고리를 `regressions`에 기록
4. 회귀 발견 시 경고 + 원인 분석

## Pass Criteria

- 총점 56/70 이상 (80%)
- 개별 카테고리 4/10 이상 (최소 기준)
- 회귀 0건

## Baseline Management

- `.claude/evals/baseline.json`: 초기 baseline
- 매 eval 실행 시 `.claude/evals/flutter-harness.log`에 append
- 히스토리에서 추이 확인 가능
