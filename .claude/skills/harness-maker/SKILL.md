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

자동 품질 게이트 — 전략 문서가 아래 조건을 만족하는지 체크:
- 모든 섹션 비어있지 않음
- skills 목록에 harness-maker 포함
- hooks 경로가 commands/agents와 일관됨
실패 시 M4 재실행 (최대 2회). 사용자 개입 없음.

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

### 하네스 종료 판정

M6(audit)과 M8(smoke) 결과를 읽어서 판정:

```
audit = read(M6.json)
smoke = read(M8.json)

if audit.total_score >= config.perfection_threshold and smoke.passed:
    # 하네스 완성 → 프로덕트 파이프라인으로
    proceed_to_product()
else:
    # 다음 세대로
    proceed_to_improvement()
```

### 하네스 개선 루프 (M9+M10)

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

---

## 프로덕트 파이프라인 (M11~M17)

하네스가 완성(63/70+)되면, 그 하네스를 활용하여 실제 프로덕트를 자동 생성한다.

### M11: 기획

```
Agent(hm-planner,
  requirement=<사용자 프로덕트 요구사항>,
  profile=<하네스 프로필>,
  output_path=.checkpoints/product/M11.md
)
```

### M12: 설계

```
Agent(hm-designer,
  prd_path=.checkpoints/product/M11.md,
  profile=<하네스 프로필>,
  review_feedback=null,
  output_path=.checkpoints/product/M12.md
)
```

### 설계 리뷰 (R1~R3) — 병렬

3개 isolated-reviewer를 **동시에** 스폰:

```
Agent(hm-design-reviewer, review_type=architecture,  design_path=M12.md, output_path=.checkpoints/product/R1.json)
Agent(hm-design-reviewer, review_type=feasibility,   design_path=M12.md, output_path=.checkpoints/product/R2.json)
Agent(hm-design-reviewer, review_type=scope,          design_path=M12.md, output_path=.checkpoints/product/R3.json)
```

세 리뷰어 모두 완료 대기. **하나라도 미달이면**:
- 피드백을 취합하여 M12에 `review_feedback`으로 전달
- M12 재설계 (최대 2회)

### M13: 구현

```
Agent(hm-implementer,
  design_path=.checkpoints/product/M12.md,
  profile=<하네스 프로필>,
  target_dir=<product_dir>,
  improvement_feedback=null,
  output_path=.checkpoints/product/M13.json
)
```

### M14: 빌드 검증

빌드 + 테스트 실행. 실패 시 build-error-resolver로 자동 수정.

### 프로덕트 리뷰 (R4~R9) — 병렬

6개 isolated-reviewer를 **동시에** 스폰:

```
Agent(hm-product-reviewer, review_type=qa,          target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R4.json)
Agent(hm-product-reviewer, review_type=security,     target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R5.json)
Agent(hm-product-reviewer, review_type=design,       target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R6.json)
Agent(hm-product-reviewer, review_type=code,         target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R7.json)
Agent(hm-product-reviewer, review_type=performance,  target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R8.json)
Agent(hm-product-reviewer, review_type=threat-lens,  target_dir=..., design_path=M12.md, output_path=.checkpoints/product/R9.json)
```

6개 리뷰어 모두 완료 대기. **하나라도 미달이면**:

### M17: 개선 → M13 재구현 루프

```
미달 리뷰어 피드백 취합 → 개선 계획 생성 → M13 재구현
```

최대 3회 루프. 탈출 조건: 전 리뷰어 통과 또는 사용자 중단.

### M16: 배포

전 리뷰어 통과 후:

```
Agent(hm-deployer,
  target_dir=<product_dir>,
  profile=<하네스 프로필>,
  review_results=[R4~R9 경로],
  output_path=.checkpoints/product/M16.json
)
```

### 최종 리포트

```
# Harness Maker 완료 리포트

## 하네스
- 세대: v3 (65/70)
- 스킬: 12개, 에이전트: 5개

## 프로덕트
- 설계 리뷰 라운드: 1회
- 구현 라운드: 2회
- 리뷰 결과:
  | 리뷰어 | 결과 |
  |--------|------|
  | QA | PASS |
  | 보안 | PASS |
  | 디자인 | PASS |
  | 코드 | PASS (87%) |
  | 퍼포먼스 | PASS |
  | threat-lens | PASS |

## 산출물
- 하네스: <target>/.claude/
- 프로덕트: <product_dir>/
- 테스트: 42개 전수 통과

## 부트스트래핑
이 하네스에서 `/harness-maker`를 실행하면 새로운 파생 하네스를 생성할 수 있습니다.
```

## Error Recovery

- 각 에이전트 실패: 최대 2회 재시도
- 체크포인트에서 복구: 마지막 성공 마일스톤부터 재개
- 리뷰 루프 한도: 설계 2회, 프로덕트 3회
- 전체 파이프라인 실패: 사용자에게 알리고 체크포인트 상태 보고
