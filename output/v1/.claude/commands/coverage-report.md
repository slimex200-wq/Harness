# Coverage Report

테스트 커버리지 리포트를 생성한다.

## Usage

`/coverage-report`

## Arguments

$ARGUMENTS

## Behavior

```bash
flutter test --coverage && genhtml coverage/lcov.info -o coverage/html && echo "Coverage report: coverage/html/index.html"
```
