---
name: web-harness-eval
description: "웹 하네스 자체 품질 측정 eval 정의. 7개 카테고리 rubric."
---

# Web Harness Eval Definition

하네스 자체의 품질을 측정하는 eval 정의.

## Harness Audit Rubric (7 x 10 = 70 max)

| 카테고리 | 측정 대상 |
|----------|----------|
| tool_coverage | settings.json allow/deny 명령 범위 |
| context_efficiency | CLAUDE.md 간결성 + 스킬 분리도 |
| quality_gates | TDD 워크플로 + 리뷰 + 검증 파이프라인 |
| memory_persistence | SessionStart/Stop 훅 + 세션 상태 보존 |
| eval_coverage | eval 스킬 + rubric + 회귀 감지 |
| security_guardrails | deny list + guard hooks + SAST + dep audit |
| cost_efficiency | 모델 라우팅 + 에이전트 모델 배정 적정성 |

## Pass Threshold

63/70 (90%)
