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

## Integration Test Automation

Firebase 에뮬레이터와 함께 integration test를 실행한다.

```bash
# Firebase 에뮬레이터 + integration test
firebase emulators:exec "flutter test integration_test/ --flavor dev"

# 단독 실행
flutter test integration_test/
```

## Golden Test Workflow

UI 회귀를 스크린샷 비교로 감지한다.

```bash
# 골든 파일 업데이트 (UI 변경 후)
flutter test --update-goldens test/golden/

# 골든 비교 (CI/검증 시)
flutter test test/golden/
```

### Golden Test 작성 예시

```dart
testWidgets('home screen golden', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: HomeScreen()));
  await expectLater(
    find.byType(HomeScreen),
    matchesGoldenFile('goldens/home_screen.png'),
  );
});
```

## Mocking

- `mockito` + `build_runner`로 Mock 생성
- Firebase 서비스는 반드시 Mock (`fake_cloud_firestore`, `firebase_auth_mocks`)
- `ProviderContainer`로 Riverpod provider 오버라이드

## Coverage Gate

`flutter test --coverage` 실행 후 80% 미만이면 실패 처리.
