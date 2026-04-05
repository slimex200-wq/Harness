---
name: web-tdd
description: "Next.js/TypeScript TDD 워크플로. Vitest 단위/통합, Playwright E2E. 80%+ 커버리지 게이트."
---

# Web TDD

Next.js/TypeScript 프로젝트에서 TDD(RED → GREEN → IMPROVE) 워크플로를 강제한다.

## When to Activate

- 새 기능 구현 시
- 버그 수정 시
- "/web-tdd", "/tdd" 트리거

## Process

### RED: 실패하는 테스트 작성

```typescript
// Vitest 단위 테스트
import { describe, it, expect } from 'vitest';
import { calculateStreak } from '@/lib/streak';

describe('calculateStreak', () => {
  it('returns 0 for no completions', () => {
    expect(calculateStreak([])).toBe(0);
  });
});
```

### GREEN: 테스트 통과하는 최소 코드

### IMPROVE: 리팩토링 + 커버리지 확인

```bash
npx vitest run --coverage
# 80%+ 필수
```

## Test Types

| 유형 | 도구 | 경로 | 용도 |
|------|------|------|------|
| Unit | Vitest | `__tests__/unit/` | 순수 함수, 유틸리티 |
| Integration | Vitest | `__tests__/integration/` | API routes, DB operations |
| Component | Vitest + Testing Library | `__tests__/components/` | React 컴포넌트 |
| E2E | Playwright | `e2e/` | 전체 사용자 플로우 |

## Mocking

- Prisma: `vitest-mock-extended` 또는 in-memory SQLite
- API routes: `next/test-utils` (없으면 직접 handler 호출)
- External services: `msw` (Mock Service Worker)

## Coverage Gate

`npx vitest run --coverage` 실행 후 80% 미만이면 실패 처리.
