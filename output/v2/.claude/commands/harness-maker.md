# Harness Maker

자연어 입력으로 Claude Code 하네스를 자동 생성하는 부트스트래핑 파이프라인.

## Usage

`/harness-maker <자연어 설명>`

예시:
- `/harness-maker "나는 Django 백엔드 개발자야"`
- `/harness-maker "ML 파이프라인 하네스를 만들어줘"`
- `/harness-maker "이전 하네스에 DevOps 기능 추가"`

## Arguments

$ARGUMENTS

## Behavior

이 커맨드는 `harness-maker` 스킬을 호출한다.
사용자 입력을 M1(입력 파싱)에 전달하고 DAG 파이프라인을 시작한다.

1세대: 전략 검토에서 사용자 확인 요청
2세대+: 완전 자동

종료 조건:
- audit 63/70+ 달성 (완벽한 프로덕트)
- 사용자 명시적 중단
