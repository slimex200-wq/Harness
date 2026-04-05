# Flutter Harness Eval Definition

하네스 자체의 품질을 측정하는 eval 정의. M6 validator와 동일한 7개 카테고리 rubric 사용.

## Harness Audit Rubric (7 categories x 10 points = 70 max)

| 카테고리 | 측정 대상 | 채점 기준 |
|----------|----------|----------|
| tool_coverage | settings.json allow/deny 명령 범위 | 핵심 명령 커버율 |
| context_efficiency | CLAUDE.md 간결성 + 스킬 분리도 | 줄 수, 중복 여부 |
| quality_gates | TDD 워크플로 + 리뷰 + 검증 파이프라인 | 게이트 완성도 |
| memory_persistence | SessionStart/Stop 훅 + 세션 상태 보존 | 훅 존재 + 스키마 완성도 |
| eval_coverage | eval 스킬 + rubric + 회귀 감지 | eval 프레임워크 완성도 |
| security_guardrails | deny list + guard hooks + SAST + dep audit | 보안 레이어 수 |
| cost_efficiency | 모델 라우팅 + 에이전트 모델 배정 적정성 | haiku 활용률 |

## Pass Threshold

63/70 (90%)

## Usage

이 rubric은 harness-maker M6 단계에서 자동 참조된다.
`/flutter-eval`은 프로젝트 코드 품질용이고, 이 문서는 하네스 자체 품질용이다.
