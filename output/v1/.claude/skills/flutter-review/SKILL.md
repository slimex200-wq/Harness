---
name: flutter-review
description: "Flutter/Dart 코드 리뷰. const constructor, 위젯 분해, Riverpod scoping, 성능 안티패턴 검출."
---

# Flutter Code Review

Flutter/Dart 코드에 특화된 코드 리뷰를 수행한다.

## When to Activate

- 3개+ .dart 파일 변경 후
- PR 리뷰 시
- "/flutter-review" 트리거

## Checklist

1. **const constructor**: 모든 final 필드가 compile-time constant인 위젯에 `const` 적용됐는가
2. **위젯 분해**: `build()` 메서드가 50줄 이하인가. 초과 시 sub-widget 추출
3. **StatelessWidget + setState**: StatelessWidget에서 setState 사용 여부 (금지)
4. **Riverpod scoping**: Provider가 적절한 scope에 정의됐는가. 글로벌 vs 페이지 vs 위젯
5. **Firebase import 경계**: `lib/ui/`에서 Firebase 패키지 직접 import 금지
6. **성능 안티패턴**:
   - `Opacity` 위젯 사용 (→ `AnimatedOpacity` / `FadeTransition`)
   - `ListView` with children (→ `ListView.builder`)
   - 리스트 아이템에 `key` 누락
   - 불필요한 `setState` 호출 범위
7. **dart analyze**: 경고 0건
8. **네이밍**: snake_case 파일명, PascalCase 클래스명, camelCase 변수명

## Output

```
PASS / FAIL
- [위반 항목]: 파일:라인 — 설명 — 수정 제안
```
