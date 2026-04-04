---
name: flutter-tdd
description: "Flutter-specific TDD 워크플로. Widget test, unit test, integration_test, golden test 지원. 80%+ 커버리지 게이트."
---

# Flutter TDD

Flutter 프로젝트에서 TDD(RED → GREEN → IMPROVE) 워크플로를 강제한다.

## When to Activate

- 새 기능 구현 시
- 버그 수정 시
- "flutter tdd", "테스트 먼저", "/flutter-tdd" 트리거

## Process

### RED: 실패하는 테스트 작성

테스트 유형 선택:
- **Widget Test**: UI 컴포넌트 (`test/widget/`)
  ```dart
  testWidgets('shows title', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: MyWidget()));
    expect(find.text('Title'), findsOneWidget);
  });
  ```
- **Unit Test**: 비즈니스 로직, Repository, ViewModel (`test/unit/`)
  ```dart
  test('returns user list', () async {
    final repo = UserRepository(mockFirestore);
    final users = await repo.getAll();
    expect(users, isNotEmpty);
  });
  ```
- **Integration Test**: E2E 플로우 (`integration_test/`)
- **Golden Test**: 스크린샷 비교 (`test/golden/`)

### GREEN: 테스트 통과하는 최소 코드 작성

- 하드코딩도 허용 (최소 구현)
- MVVM + Repository 패턴 준수

### IMPROVE: 리팩토링 + 커버리지 확인

```bash
flutter test --coverage
# 80%+ 필수
```

## Mocking

- `mockito` + `build_runner`로 Mock 생성
- Firebase 서비스는 반드시 Mock (`fake_cloud_firestore`, `firebase_auth_mocks`)
- `ProviderContainer`로 Riverpod provider 오버라이드

## Coverage Gate

`flutter test --coverage` 실행 후 80% 미만이면 실패 처리.
