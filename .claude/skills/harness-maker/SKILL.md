---
name: harness-maker
description: "자연어 입력으로 Claude Code 하네스를 자동 생성하는 부트스트래핑 DAG 파이프라인. /harness-maker 또는 '하네스 만들어줘' 시 사용."
---

# Harness Maker

자연어 입력 하나로 Claude Code 하네스 전체를 자동 생성한다.
생성된 하네스에 이 스킬이 포함되어 자기 복제(부트스트래핑)가 가능하다.

## When to Activate

- `/harness-maker` 커맨드 실행
- "하네스 만들어줘", "harness 생성", "하네스 메이커" 등 자연어 트리거

## Configuration

설정 파일: `lib/config.json`
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

## DAG Pipeline

### Phase 1: 입력 (M1)

사용자의 자연어 입력을 프로필 JSON으로 변환한다.

```
Input: "나는 Django 백엔드 개발자야"
Output: {
  "role": "backend developer",
  "stack": ["Python", "Django", "PostgreSQL"],
  "workflow": ["TDD", "code review", "CI/CD"],
  "constraints": [],
  "generation": 1,
  "parent_audit": null,
  "parent_feedback": null
}
```

스택 추론 규칙:
- Django → Python, PostgreSQL (기본 DB)
- React → TypeScript, Node.js
- Spring → Java, Gradle
- Go → Go modules
- 명시되지 않은 워크플로는 기본값: ["TDD", "code review"]

프로필 JSON을 체크포인트로 저장:
```bash
bash lib/checkpoint.sh save <generation> M1 /tmp/hm-profile.json
```

### Phase 2: 리서치 (M2) — 병렬

3개 리서치 에이전트를 **동시에** 스폰한다:

```
Agent(hm-researcher, research_type=web,      output_path=.checkpoints/v<N>/M2a.json)
Agent(hm-researcher, research_type=ecc,      output_path=.checkpoints/v<N>/M2b.json)
Agent(hm-researcher, research_type=patterns,  output_path=.checkpoints/v<N>/M2c.json)
```

세 에이전트 모두 완료될 때까지 대기.
하나가 실패하면 해당 에이전트만 재실행 (최대 2회).

### Phase 3: 큐레이션 (M3)

```
Agent(hm-curator,
  profile=<M1 output>,
  research_paths=[M2a.json, M2b.json, M2c.json],
  output_path=.checkpoints/v<N>/M3.json
)
```

### Phase 4: 전략 수립 (M4)

```
Agent(hm-strategist,
  profile=<M1 output>,
  curation_path=.checkpoints/v<N>/M3.json,
  template_path=lib/strategy-template.md,
  output_path=.checkpoints/v<N>/M4.md
)
```

### Phase 4.5: 사용자 전략 검토

**1세대** (generation이 user_review_generations에 포함):
1. 전략 문서를 사용자에게 출력
2. AskUserQuestion으로 승인/수정 요청
3. 수정 요청 시 피드백을 M4에 전달하여 재생성

**2세대+**:
자동 품질 게이트 — 전략 문서가 아래 조건을 만족하는지 체크:
- 모든 섹션 비어있지 않음
- skills 목록에 harness-maker 포함
- hooks 경로가 commands/agents와 일관됨
실패 시 M4 재실행 (최대 2회).

### Phase 5: 빌드 (M5) — 병렬

대상 디렉토리 생성 후 5개 빌드를 **동시에** 스폰:

```bash
mkdir -p <target_dir>/.claude/{skills,agents,commands,scripts}
```

```
Agent(hm-builder, build_type=claude_md,      target_dir=..., strategy_path=M4.md)
Agent(hm-builder, build_type=settings,       target_dir=..., strategy_path=M4.md)
Agent(hm-builder, build_type=skills,         target_dir=..., strategy_path=M4.md, harness_maker_skill_path=<self>)
Agent(hm-builder, build_type=agents,         target_dir=..., strategy_path=M4.md)
Agent(hm-builder, build_type=commands_hooks,  target_dir=..., strategy_path=M4.md)
```

### Phase 6: 검증 (M6)

```
Agent(hm-validator,
  target_dir=<target>,
  output_path=.checkpoints/v<N>/M6.json
)
```

M6 결과에서 issues가 있으면 해당 M5 빌드 타입만 재실행 (최대 2회).

### Phase 7: 설치 (M7)

install_level에 따라 파일 배치:
- "project": `<cwd>/.claude/`
- "user": `~/.claude/`

기존 파일 백업: `<file>.bak.<timestamp>`

설치 매니페스트 생성:
```json
{
  "generation": 1,
  "installed_at": "2026-04-05T12:00:00Z",
  "files": ["CLAUDE.md", "settings.json"],
  "backup_dir": ".claude/.backup/v1/"
}
```

### Phase 8: 스모크 테스트 (M8)

```
Agent(hm-smoke-tester,
  target_dir=<target>,
  smoke_task=<config.smoke_test_task>,
  output_path=.checkpoints/v<N>/M8.json
)
```

### Phase 9: 종료 판정

M6(audit)과 M8(smoke) 결과를 읽어서 판정:

```
audit = read(M6.json)
smoke = read(M8.json)

if audit.total_score >= config.perfection_threshold and smoke.passed:
    # 완벽한 프로덕트 달성
    print_completion_report()
    exit()
else:
    # 다음 세대로
    proceed_to_improvement()
```

### Phase 10: 개선 + 다음 세대 (M9+M10)

```
Agent(hm-improver,
  profile=<current profile>,
  audit_path=.checkpoints/v<N>/M6.json,
  smoke_path=.checkpoints/v<N>/M8.json,
  output_path=.checkpoints/v<N>/M10-seed.json
)
```

M10 출력(새 시드)을 M1 입력으로 사용하여 **Phase 1로 돌아간다**.
generation 번호를 증가시키고 새 체크포인트 디렉토리 생성.

### Completion Report

모든 세대가 완료되면 최종 리포트 출력:

```
# Harness Maker 완료 리포트

## 세대 히스토리
| 세대 | audit 점수 | 스모크 | 개선 영역 |
|------|-----------|-------|----------|
| v1   | 42/70     | 5/6   | 초기 생성 |
| v2   | 55/70     | 6/6   | Eval, Cost |
| v3   | 65/70     | 6/6   | 완벽 달성 |

## 최종 하네스
- 설치 경로: <target>/.claude/
- 스킬: N개
- 에이전트: N개
- 커맨드: N개
- 훅: N개

## 부트스트래핑
이 하네스에서 `/harness-maker`를 실행하면 새로운 파생 하네스를 생성할 수 있습니다.
```

## Error Recovery

- 각 에이전트 실패: 최대 2회 재시도
- 체크포인트에서 복구: 마지막 성공 마일스톤부터 재개
- 전체 파이프라인 실패: 사용자에게 알리고 체크포인트 상태 보고
