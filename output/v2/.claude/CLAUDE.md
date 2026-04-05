# Flutter Mobile App Harness

## Default Commands

```bash
# Test
flutter test --coverage

# Lint
dart analyze

# Format
dart format .
```

## Model Routing Policy

| 태스크 유형 | 모델 | 이유 |
|------------|------|------|
| 코드 생성/수정 | sonnet | 정확한 코드 생성 필요 |
| 코드 리뷰/검증 (read-only) | haiku | 체크리스트 기반, 판정만 |
| 아키텍처 분석 (read-only) | haiku | 규칙 매칭, 코드 생성 없음 |
| 보안 스캔 (read-only) | haiku | 패턴 탐지, 코드 생성 없음 |
| 빌드 에러 해결 | sonnet | 코드 수정 + 복잡한 추론 |
| Eval (code/model grader) | haiku | 결정적 스크립트 실행 + 판정 |

## NEVER

- NEVER use `setState` in a `StatelessWidget`. Use `StatefulWidget` or Riverpod providers. **Why:** 컴파일 에러 + 아키텍처 위반.
- NEVER import Firebase packages directly from UI layer (`lib/ui/`). Always go through repository layer (`lib/data/`). **Why:** 레이어드 아키텍처 위반.
- NEVER hardcode Firebase project IDs, API keys, or google-services.json values in source code. Use `--dart-define` or `.env` files. **Why:** 보안 사고.
- NEVER run `firebase deploy` without explicit confirmation. **Why:** 프로덕션 배포는 되돌리기 어려움.
- NEVER commit `pubspec.lock` changes without reviewing dependency diffs. **Why:** 의도치 않은 breaking change 유입.
- NEVER use `Opacity` widget for fade effects. Use `AnimatedOpacity` or `FadeTransition`. **Why:** 매 프레임 saveLayer 호출 -> 성능 저하.
- NEVER create giant `build()` methods (50+ lines). Extract sub-widgets. **Why:** 리빌드 범위 확대 + 가독성 파괴.
- NEVER skip `const` constructor when all fields are final and compile-time constant. **Why:** const 누락은 불필요한 리빌드 유발.
- NEVER use `print()` for logging. Use `debugPrint()` or `logger` package. **Why:** print는 릴리즈 빌드에서도 출력됨.
- NEVER inline `pubspec.lock` content in prompts or context. **Why:** 컨텍스트 예산 낭비.

## ALWAYS

- ALWAYS search pub.dev before implementing custom solutions. **Why:** 바퀴 재발명 방지.
- ALWAYS use `const` constructors wherever possible. **Why:** Flutter 리빌드 최적화의 기본.
- ALWAYS run `dart analyze` with zero warnings before commit. **Why:** 린트 경고 누적은 기술부채.
- ALWAYS run `dart format` on every `.dart` file before commit. **Why:** 일관된 코드 스타일.
- ALWAYS use `ListView.builder` for dynamic lists. **Why:** 메모리 효율 + 16ms 프레임 예산 준수.
- ALWAYS wrap Firebase calls in try-catch with structured error types. **Why:** Firebase 네트워크 에러는 예측 불가.
- ALWAYS follow MVVM + Repository pattern: `lib/ui/` -> `lib/data/` -> `lib/di/`. **Why:** 테스트 용이성 + 관심사 분리.
- ALWAYS use Riverpod for app-wide state management. **Why:** compile-safe, auto-dispose.
- ALWAYS indicate `hot_reload_safe: true|false` when reporting code changes. **Why:** StatefulWidget 상태 변경 등은 hot restart 필요.
- ALWAYS run `/flutter-eval` before declaring work complete. **Why:** eval 없이 완료 선언하면 품질 회귀 감지 불가.

## Session Memory

세션 간 컨텍스트를 `.claude/memory/session-state.json`에 자동 보존한다.
- **SessionStart**: 이전 세션 상태 로드 → 컨텍스트 주입
- **SessionStop**: 현재 세션 상태 저장 (변경 파일, 커버리지, 린트, 미완료 작업)
- `/compact`, `/clear` 후에도 SessionStart가 재실행되어 핵심 컨텍스트 복원

## Workflow

Research (pub.dev, Firebase docs) -> Plan -> TDD (RED -> GREEN -> IMPROVE, 80%+ coverage) -> Code Review -> **Eval** -> Commit

## Agents (Auto-Use)

- Complex feature -> **planner-agent** -> Code written -> **flutter-review-agent**
- Bug fix / new feature -> **flutter-tdd** (skill)
- Architecture decision -> **flutter-arch-agent**
- Build fail -> **build-error-resolver-agent** (flutter clean -> rebuild, max 2 cycles)
- Before commit -> **firebase-security-agent** (Firebase rules, API keys, SAST, dep audit)
- 3+ files changed -> independent **flutter-verify-agent** (implementer != verifier)
