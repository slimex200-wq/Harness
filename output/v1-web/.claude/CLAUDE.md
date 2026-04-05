# Next.js + TypeScript Web App Harness

## Default Commands

```bash
# Test
npx vitest run --coverage

# Lint
npx eslint . --fix

# Format
npx prettier --write .

# Build
npm run build
```

## Model Routing Policy

| 태스크 유형 | 모델 | 이유 |
|------------|------|------|
| 코드 생성/수정 | sonnet | 정확한 코드 생성 필요 |
| 코드 리뷰/검증 (read-only) | haiku | 체크리스트 기반, 판정만 |
| 보안 스캔 (read-only) | haiku | 패턴 탐지, 코드 생성 없음 |
| 빌드 에러 해결 | sonnet | 코드 수정 + 복잡한 추론 |
| Eval (code/model grader) | haiku | 결정적 스크립트 실행 + 판정 |

## NEVER

- NEVER use `any` type. Use `unknown` + type guards or proper generics. **Why:** any는 TypeScript를 JavaScript로 되돌림.
- NEVER use `var`. Use `const` by default, `let` only when reassignment needed. **Why:** 불변성 기본 원칙.
- NEVER mutate props or state directly. Use immutable patterns. **Why:** React 렌더링 버그 + 디버깅 지옥.
- NEVER hardcode API keys, database URLs, or secrets in source code. Use `.env.local`. **Why:** git history에 영원히 남음.
- NEVER use `dangerouslySetInnerHTML` without sanitization. **Why:** XSS 공격 벡터.
- NEVER put client-side logic in Server Components. Use `'use client'` directive explicitly. **Why:** Next.js App Router hydration 에러.
- NEVER skip error boundaries for async data fetching. **Why:** unhandled rejection → 흰 화면.
- NEVER use inline styles for layout. Use Tailwind CSS utility classes. **Why:** 일관된 디자인 시스템.
- NEVER use `console.log` in production code. Use structured logging. **Why:** 민감 정보 노출 + 성능.
- NEVER import server-only modules in client components. **Why:** 번들 사이즈 폭증 + 보안.

## ALWAYS

- ALWAYS use TypeScript strict mode (`strict: true` in tsconfig). **Why:** 타입 안전의 기본.
- ALWAYS use Server Components by default. Add `'use client'` only when needed. **Why:** Next.js 성능 최적화.
- ALWAYS validate inputs at API route boundaries with zod. **Why:** 타입 안전 런타임 검증.
- ALWAYS use Prisma for database operations. Never raw SQL. **Why:** 타입 안전 쿼리 + 마이그레이션 관리.
- ALWAYS run `npx eslint . --max-warnings 0` with zero warnings before commit. **Why:** 린트 경고 누적은 기술부채.
- ALWAYS run `npx prettier --check .` before commit. **Why:** 일관된 코드 스타일.
- ALWAYS use `error.tsx` boundaries in route segments. **Why:** 에러 격리 + 사용자 경험.
- ALWAYS use `loading.tsx` for async data fetching. **Why:** 스켈레톤 UI로 체감 속도 향상.
- ALWAYS run `/web-eval` before declaring work complete. **Why:** eval 없이 완료 선언하면 품질 회귀 감지 불가.

## Session Memory

세션 간 컨텍스트를 `.claude/memory/session-state.json`에 자동 보존한다.
- **SessionStart**: 이전 세션 상태 로드 → 컨텍스트 주입
- **SessionStop**: 현재 세션 상태 저장 (변경 파일, 커버리지, 린트, 미완료 작업)

## Workflow

Research (npm registry, docs) -> Plan -> TDD (RED -> GREEN -> IMPROVE, 80%+ coverage) -> Code Review -> **Eval** -> Commit

## Agents (Auto-Use)

- Complex feature -> **planner-agent** -> Code written -> **web-review-agent**
- Bug fix / new feature -> **web-tdd** (skill)
- Build fail -> **build-error-resolver-agent** (max 2 cycles)
- Before commit -> **security-agent** (secrets, XSS, injection, deps)
- 3+ files changed -> independent **web-verify-agent** (implementer != verifier)
