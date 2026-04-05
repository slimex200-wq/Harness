---
name: web-eval
description: "Next.js/TypeScript 프로젝트 eval 프레임워크. 7개 카테고리 rubric으로 코드 품질을 정량 평가."
model: haiku
---

# Web Eval

Next.js/TypeScript 프로젝트의 코드 품질을 7개 카테고리 rubric으로 정량 평가한다.

## When to Activate

- `/web-eval`, `/eval` 커맨드 실행
- "eval 실행", "품질 체크" 자연어 트리거
- 작업 완료 선언 전

## Rubric (7 Categories, 70 max)

### Code Graders (결정적, 자동)

| # | 카테고리 | 측정 방법 | 채점 |
|---|----------|----------|------|
| 1 | `lint_compliance` | `npx eslint . --max-warnings 0` | 0 warnings=10, 1개당 -1 (min 0) |
| 2 | `test_coverage` | `npx vitest run --coverage` | 90%+=10, 80%+=8, 70%+=6, <70%=4 |
| 3 | `build_health` | `npm run build` | pass=10, fail=0 |
| 4 | `security_posture` | `gitleaks detect` + eslint-plugin-security | 0 findings=10, finding당 -3 (min 0) |

### Model Graders (LLM 판정, haiku)

| # | 카테고리 | 판정 기준 | 채점 |
|---|----------|----------|------|
| 5 | `arch_compliance` | Server/Client Component 분리, App Router 규칙, API route 구조 | 위반 0=10, 위반당 -2 |
| 6 | `code_quality` | TypeScript strict 준수, naming, DRY, Tailwind 사용 일관성 | 0-10 종합 판정 |
| 7 | `session_efficiency` | 빌드 사이클 수, 불필요한 파일 변경, 에이전트 재실행 | 0-10 종합 판정 |

## Process

1. Code graders 4개 순차 실행
2. Model graders 3개 실행
3. 총점 계산 + breakdown
4. `.claude/evals/web-harness.log`에 append
5. Baseline 대비 회귀 체크

## Pass Criteria

- 총점 56/70 이상 (80%)
- 개별 카테고리 4/10 이상
- 회귀 0건
