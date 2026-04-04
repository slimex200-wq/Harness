# Harness Maker - 부트스트래핑 하네스 생성기

> 하네스를 만드는 하네스. 자연어 입력 하나로 Claude Code 하네스 전체를 자동 생성하고, 생성된 하네스가 다시 새로운 하네스를 만들 수 있는 자기 복제 구조.

## 설계 원칙

1. **사용자는 병목**: 초기 자연어 입력 + 1세대 전략 검토만 사용자 개입. 나머지 전부 자동.
2. **부트스트래핑**: 모든 생성된 하네스에 harness-maker 스킬이 내장됨. 자식이 자식을 낳음.
3. **DAG 파이프라인**: 각 단계가 마일스톤. 체크포인트 복구 가능. 병렬 실행 가능한 단계는 병렬.
4. **세대 체인**: 완성된 하네스가 다음 하네스의 시드. 경험과 audit 결과가 세대 간 전달.
5. **완벽까지 반복**: 사용자 중단 또는 audit 63/70+ 달성 시 종료.

---

## DAG 구조

### 마일스톤 정의

```
M1(입력 파싱)
  │
  ├──→ M2a(웹 리서치)          ──┐
  ├──→ M2b(ECC 카탈로그 분석)   ──┤ 병렬
  └──→ M2c(하네스 패턴 수집)    ──┘
                │
          M3(큐레이션)
                │
          M4(전략 수립)
                │
      [사용자 전략 검토]  ← 1세대만. 2세대+는 자동.
                │
  ├──→ M5a(CLAUDE.md)          ──┐
  ├──→ M5b(settings.json)       ──┤
  ├──→ M5c(skills/)             ──┤ 병렬
  ├──→ M5d(agents/)             ──┤
  └──→ M5e(commands/ + hooks/)  ──┘
                │
          M6(검증)
                │
          M7(설치)
                │
          M8(스모크 테스트)
                │
        종료 판정 ──→ 통과 → 완료 리포트
                │
              미달
                │
          M9(개선 분석)
                │
          M10(다음 세대 시드 생성)
                │
                └──→ M1' (새 세대 시작)
```

### 세대 체인 흐름

```
시드(사용자 입력)
  → v1 하네스 (전략 검토: 사용자)
    → v2 하네스 (자동)
      → v3 하네스 (자동)
        → ... 완벽 달성 또는 사용자 중단
```

---

## 마일스톤 상세

### M1: 입력 파싱

- **입력**: 자연어 문자열 (예: "나는 Django 백엔드 개발자야")
- **처리**: LLM이 구조화된 프로필 JSON으로 변환
- **출력**:
  ```json
  {
    "role": "backend developer",
    "stack": ["Python", "Django", "PostgreSQL"],
    "workflow": ["TDD", "code review", "CI/CD"],
    "constraints": [],
    "generation": 1,
    "parent_audit": null,
    "parent_feedback": null
  }
  ```
- **2세대+ 입력**: 이전 세대의 프로필 + audit 결과 + M9 피드백이 추가됨
- **실패 시**: 사용자에게 재입력 요청
- **체크포인트**: `.checkpoints/M1.json`

### M2: 리서치 (병렬 3개)

#### M2a: 웹 리서치
- **입력**: 프로필 JSON
- **처리**: WebSearch로 해당 스택의 최신 도구, 베스트 프랙티스, 트렌드 조사
- **출력**: 리서치 결과 문서 (최대 10개 인사이트)

#### M2b: ECC 스킬 카탈로그 분석
- **입력**: 프로필 JSON의 stack 필드
- **처리**: 설치 가능한 ECC 스킬 목록에서 스택에 맞는 스킬 매칭
- **출력**: 추천 스킬 목록 + 각 스킬의 적합도 점수

#### M2c: 기존 하네스 패턴 수집
- **입력**: 프로필 JSON
- **처리**: agent-harness-construction 스킬의 원칙 기반으로 최적 패턴 설계
- **출력**: 하네스 아키텍처 패턴 추천 (ReAct/Function-calling/Hybrid)

- **실패 시**: 실패한 리서치만 개별 재실행
- **체크포인트**: `.checkpoints/M2a.json`, `.checkpoints/M2b.json`, `.checkpoints/M2c.json`

### M3: 큐레이션

- **입력**: M2a + M2b + M2c 결과 3개
- **처리**:
  1. 중복 제거
  2. 프로필과의 관련도 기준 랭킹
  3. 상위 인사이트 선별
  4. 스킬 조합 최적화 (충돌하는 스킬 제거)
- **출력**: 랭킹된 인사이트 목록 + 추천 스킬 최종 세트
- **실패 시**: M2부터 재실행
- **체크포인트**: `.checkpoints/M3.json`

### M4: 전략 수립

- **입력**: M3 큐레이션 결과
- **처리**: 하네스 청사진 문서 생성
  - CLAUDE.md에 들어갈 규칙들
  - settings.json 구성 (permissions, hooks, env)
  - 포함할 스킬 목록 + 커스텀 스킬 정의
  - 에이전트 정의 (역할, 도구, 모델)
  - 커맨드 정의
  - 훅 설계 (PreToolUse, PostToolUse, SessionStart, Stop)
- **출력**: 전략 문서 (Markdown)
- **실패 시**: M3부터 재실행
- **체크포인트**: `.checkpoints/M4.json`

### 사용자 전략 검토

- **1세대**: 전략 문서를 사용자에게 출력. 승인/수정 대기.
- **2세대+**: 자동 품질 게이트. 전략 문서의 completeness 체크:
  - 모든 필수 섹션 존재 여부
  - 스킬 간 충돌 없음
  - hooks 설계가 settings.json과 일관됨
- **수정 요청 시**: M4 재실행 (수정 피드백 반영)

### M5: 빌드 (병렬 5개)

#### M5a: CLAUDE.md 생성
- 전략 문서의 규칙 섹션 → CLAUDE.md로 변환
- NEVER/ALWAYS 규칙, 워크플로, 에이전트 자동 사용 규칙 포함

#### M5b: settings.json 생성
- permissions (allow/deny 목록)
- hooks (PreToolUse, PostToolUse, SessionStart, Stop, PreCompact)
- env 변수
- 플러그인 설정

#### M5c: skills/ 생성
- ECC에서 선택한 스킬 복사
- 커스텀 스킬 SKILL.md 생성
- **harness-maker 스킬 자체를 포함** (부트스트래핑 핵심)

#### M5d: agents/ 생성
- 전략에 정의된 에이전트별 .md 파일 생성
- 각 에이전트: name, description, tools, model 정의

#### M5e: commands/ + hooks/ 생성
- 슬래시 커맨드 .md 파일 생성
- 훅 스크립트 (.sh, .py) 생성

- **실패 시**: 실패한 빌드만 개별 재생성
- **체크포인트**: `.checkpoints/M5a.json` ~ `.checkpoints/M5e.json`

### M6: 검증

- **입력**: M5에서 생성된 전체 파일
- **처리**:
  1. `harness-audit` 실행 → 7개 카테고리 점수
  2. 파일 간 참조 무결성 검사 (스킬이 참조하는 에이전트가 존재하는지 등)
  3. settings.json 문법 검증
  4. hooks 스크립트 실행 가능 여부 확인
- **출력**: audit 점수 + 이슈 목록
- **실패 시**: 이슈 목록을 M5 해당 빌드에 전달하여 재생성
- **체크포인트**: `.checkpoints/M6.json`

### M7: 설치

- **입력**: 검증 통과한 파일들
- **처리**:
  1. 대상 경로에 파일 배치 (프로젝트 .claude/ 또는 사용자 ~/.claude/)
  2. 기존 파일 백업 (있을 경우)
  3. 설치 매니페스트 생성
- **출력**: 설치 완료 상태 + 설치된 파일 목록
- **실패 시**: 백업에서 복원 후 재설치
- **체크포인트**: `.checkpoints/M7.json`

### M8: 스모크 테스트

- **입력**: 설치된 하네스
- **처리**: 서브에이전트를 스폰하여 설치된 하네스 경로에서 테스트 태스크 실행
  1. `claude -p` (headless) 로 새 세션을 생성, 설치된 하네스 디렉토리를 CWD로 지정
  2. 테스트 태스크 실행 (예: "hello world 함수를 TDD로 작성해")
  3. 결과 파싱: 스킬 로드 여부, 훅 동작 여부, 에이전트 호출 가능 여부
  4. 생성된 테스트 파일/코드 정리
- **출력**: 테스트 결과 (pass/fail + 세부 로그)
- **체크포인트**: `.checkpoints/M8.json`

### 종료 판정

**완벽한 프로덕트 판정 기준** (설정 가능):
- audit 전 카테고리 9/10 이상 (총 63/70+, 기본값)
- 스모크 테스트 100% 통과
- 파일 간 누락된 참조 없음

**종료 조건** (OR):
1. 완벽 판정 기준 달성
2. 사용자가 명시적으로 중단

### M9: 개선 분석 (종료 미달 시)

- **입력**: M6 audit 결과 + M8 스모크 결과
- **처리**:
  1. 점수가 낮은 카테고리 식별
  2. 스모크 실패 원인 분석
  3. 개선 방향 자연어로 정리
- **출력**: 개선 피드백 문서
- **체크포인트**: `.checkpoints/M9.json`

### M10: 다음 세대 시드 생성

- **입력**: 현재 하네스 프로필 + M9 피드백
- **처리**:
  1. 이전 세대의 경험 요약
  2. 부족한 영역 명시
  3. 새 세대용 자연어 시드 생성
    - 예: "이전 Django 하네스는 Eval Coverage가 4/10이었다. eval-harness 스킬을 강화하고, 자동 eval 파이프라인 훅을 추가한 하네스를 만들어라"
- **출력**: 다음 세대 M1 입력용 시드 JSON
- **이후**: M1으로 돌아가 새 세대 시작

---

## 체크포인트 시스템

### 저장 위치
```
C:\Users\slime\Harness\
  .checkpoints\
    v1\
      M1.json
      M2a.json, M2b.json, M2c.json
      M3.json
      M4.json
      M5a.json ~ M5e.json
      M6.json
      M7.json
      M8.json
      M9.json
      M10.json
    v2\
      ...
```

### 체크포인트 구조
```json
{
  "milestone": "M1",
  "generation": 1,
  "status": "completed",
  "timestamp": "2026-04-05T12:00:00Z",
  "input_hash": "sha256:...",
  "output": { ... },
  "duration_ms": 3200
}
```

### 복구 정책
- 파이프라인 재실행 시 마지막 성공 체크포인트부터 재개
- 체크포인트의 input_hash가 현재 입력과 다르면 해당 단계부터 재실행
- 수동 재실행: 특정 마일스톤만 지정하여 재실행 가능

---

## 부트스트래핑 메커니즘

### 자기 복제 규칙

M5c에서 skills/를 생성할 때, **harness-maker 스킬 자체**를 반드시 포함:

```
생성되는 하네스/
  .claude/
    skills/
      harness-maker/
        SKILL.md          ← 이 파이프라인 자체의 스킬 정의
      django-tdd/
        SKILL.md
      ...
    agents/
      harness-maker-orchestrator.md
    commands/
      harness-maker.md    ← /harness-maker 커맨드
```

### 세대 간 컨텍스트 전달

```json
{
  "generation": 2,
  "parent": {
    "generation": 1,
    "profile": { "role": "backend developer", "stack": ["Django"] },
    "audit_score": 52,
    "weak_categories": ["Eval Coverage", "Cost Efficiency"],
    "smoke_failures": ["hook script not executable on Windows"]
  },
  "seed": "Django 하네스 v1은 Eval Coverage 4/10, Cost Efficiency 5/10이었다. eval-harness 통합과 cost-aware-llm-pipeline 스킬을 추가하고, Windows 호환성을 개선한 하네스를 만들어라"
}
```

---

## 출력물 구조

### 생성되는 하네스 디렉토리

```
<target>/
  .claude/
    CLAUDE.md                     # 프로젝트 규칙
    settings.json                 # 권한, 훅, 환경변수
    skills/
      harness-maker/SKILL.md      # 자기 복제용 (부트스트랩)
      <stack-specific>/SKILL.md   # 스택별 스킬들
      ...
    agents/
      <role>.md                   # 역할별 에이전트
      ...
    commands/
      harness-maker.md            # /harness-maker 커맨드
      <workflow>.md               # 워크플로 커맨드들
      ...
    scripts/
      <hook-scripts>              # 훅 스크립트들
```

### 최종 리포트

```markdown
# Harness Maker 완료 리포트

## 세대 히스토리
| 세대 | audit 점수 | 개선 영역 | 소요 시간 |
|------|-----------|----------|----------|
| v1   | 42/70     | 초기 생성 | 5m 32s   |
| v2   | 55/70     | Eval, Cost | 3m 18s  |
| v3   | 65/70     | Security, Memory | 2m 45s |

## 최종 하네스
- audit 점수: 65/70
- 스킬: 12개 (커스텀 3, ECC 9)
- 에이전트: 5개
- 커맨드: 8개
- 훅: 4개

## 설치 경로
- C:\Users\slime\<project>\.claude\
```

---

## 설정 가능 파라미터

```json
{
  "perfection_threshold": 63,
  "max_generations": 10,
  "smoke_test_task": "hello world 함수를 TDD로 작성해",
  "user_review_generations": [1],
  "install_level": "project",
  "parallel_research": true,
  "parallel_build": true,
  "checkpoint_dir": ".checkpoints"
}
```

---

## 실행 방법

```
/harness-maker "나는 Django 백엔드 개발자야"
```

또는 생성된 하네스 안에서:

```
/harness-maker "ML 파이프라인도 추가해줘"
```
