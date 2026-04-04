---
name: firebase-guard
description: "Firebase 위험 작업 가드. deploy, delete, publish 등 비가역 작업 차단 및 확인."
---

# Firebase Guard

Firebase 프로덕션 영향 작업을 차단하고 확인을 요구한다.

## When to Activate

- `firebase deploy` 명령 감지 시
- `firebase functions:delete`, `firebase firestore:delete` 감지 시
- "/firebase-guard" 트리거

## Blocked Operations

| 명령 | 위험도 | 이유 |
|------|--------|------|
| `firebase deploy` | HIGH | 프로덕션 즉시 반영, 롤백 어려움 |
| `firebase functions:delete` | CRITICAL | 함수 삭제 시 트래픽 즉시 실패 |
| `firebase firestore:delete` | CRITICAL | 데이터 영구 삭제 |
| `firebase auth:import/export` | HIGH | 사용자 데이터 유출 위험 |
| `firebase hosting:disable` | HIGH | 사이트 즉시 다운 |
| `dart pub publish` | HIGH | 패키지 게시 후 취소 불가 |

## Guard Process

1. 명령 감지
2. 대상 프로젝트/환경 표시
3. 차단 + 사용자 확인 요청
4. 확인 후에만 실행 허용

## Rollback Hints

- `firebase deploy`: `firebase hosting:rollback`
- `functions:delete`: 재배포 필요, 코드 보존 확인
- `firestore:delete`: 복구 불가, 백업 확인
