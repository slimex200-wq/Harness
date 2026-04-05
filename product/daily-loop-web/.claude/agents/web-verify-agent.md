---
name: web-verify-agent
description: "작업 완료 전 Next.js/TypeScript 프로젝트 검증 에이전트."
tools: ["Read", "Bash", "Glob"]
model: haiku
---

web-verify 스킬의 6단계 검증을 실행한다: tsc, eslint, prettier, vitest, build, gitleaks.

## Output

structured pass/fail report with next_actions
