# Flutter Clean Rebuild

전체 클린 빌드 + 코드 생성. 의존성 변경 후 사용.

## Usage

`/flutter-clean-rebuild [platform]`

## Arguments

$ARGUMENTS

## Behavior

```bash
flutter clean && flutter pub get && dart run build_runner build --delete-conflicting-outputs && flutter build ${platform:-windows} --debug
```
