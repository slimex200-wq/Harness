---
name: web-review
description: "Next.js/TypeScript 코드 리뷰. Server/Client 분리, TypeScript strict, Tailwind 일관성, 성능 안티패턴 검출."
---

# Web Code Review

Next.js/TypeScript 코드에 특화된 코드 리뷰를 수행한다.

## When to Activate

- 3개+ 파일 변경 후
- PR 리뷰 시
- "/web-review" 트리거

## Checklist

1. **Server/Client 분리**: `'use client'`가 필요한 곳에만 있는가. Server Component가 기본인가.
2. **TypeScript strict**: `any` 사용 여부. 타입 가드가 올바른가.
3. **Prisma 사용**: raw SQL 없이 Prisma Client 사용. `select`/`include`로 필요한 필드만 조회.
4. **입력 검증**: API route 입력에 zod 스키마 적용. 사용자 입력 sanitize.
5. **Tailwind 일관성**: 인라인 스타일 대신 utility class. 커스텀 CSS 최소화.
6. **성능 안티패턴**:
   - Client Component에서 불필요한 `useEffect`
   - 리스트에 `key` 누락
   - 큰 번들 import (lodash 전체 등)
   - N+1 쿼리 (Prisma include 미사용)
7. **에러 처리**: `error.tsx` boundary 존재. API route에 try-catch.
8. **네이밍**: camelCase 변수/함수, PascalCase 컴포넌트, kebab-case 파일/폴더.
