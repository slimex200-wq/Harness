# Harness Maker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 자연어 입력 하나로 Claude Code 하네스 전체를 자동 생성하고, 생성된 하네스가 다시 새로운 하네스를 만들 수 있는 부트스트래핑 DAG 파이프라인을 구현한다.

**Architecture:** 10개 마일스톤(M1~M10)으로 구성된 DAG 파이프라인. 오케스트레이터 스킬이 각 마일스톤을 서브에이전트로 위임하고, 체크포인트 시스템으로 상태를 관리한다. M2(리서치)와 M5(빌드)는 병렬 실행. 세대 체인으로 완벽(63/70+)까지 반복.

**Tech Stack:** Claude Code Skills/Agents/Commands, JSON 체크포인트, Bash 스크립트(hooks), WebSearch(리서치)

---

## File Structure

```
C:\Users\slime\Harness\
  .claude\
    skills\
      harness-maker\
        SKILL.md                    # 오케스트레이터 스킬 (핵심)
    agents\
      hm-researcher.md              # M2: 리서치 에이전트
      hm-curator.md                 # M3: 큐레이션 에이전트
      hm-strategist.md              # M4: 전략 수립 에이전트
      hm-builder.md                 # M5: 빌드 에이전트
      hm-validator.md               # M6: 검증 에이전트
      hm-smoke-tester.md            # M8: 스모크 테스트 에이전트
      hm-improver.md                # M9+M10: 개선 + 시드 생성 에이전트
    commands\
      harness-maker.md              # /harness-maker 커맨드
  lib\
    checkpoint.sh                   # 체크포인트 저장/로드 유틸리티
    profile-schema.json             # M1 출력 프로필 스키마
    strategy-template.md            # M4 전략 문서 템플릿
    config.json                     # 설정 파라미터 (threshold, max_generations 등)
    audit-adapter.sh                # harness-audit 래퍼 (점수 파싱)
```

**설계 근거:**
- `SKILL.md` 하나가 DAG 오케스트레이션 로직 전담 (진입점)
- 각 마일스톤은 독립 에이전트 — 병렬 실행 가능, 역할 명확
- `lib/`에 공유 유틸리티 — 체크포인트, 스키마, 템플릿
- 커맨드는 스킬 호출의 숏컷

---

### Task 1: 설정 파일 + 프로필 스키마

**Files:**
- Create: `C:\Users\slime\Harness\lib\config.json`
- Create: `C:\Users\slime\Harness\lib\profile-schema.json`

- [ ] **Step 1: config.json 작성**

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

- [ ] **Step 2: profile-schema.json 작성**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["role", "stack", "workflow", "generation"],
  "properties": {
    "role": {
      "type": "string",
      "description": "사용자 역할 (예: backend developer, fullstack engineer)"
    },
    "stack": {
      "type": "array",
      "items": { "type": "string" },
      "description": "기술 스택 (예: [Python, Django, PostgreSQL])"
    },
    "workflow": {
      "type": "array",
      "items": { "type": "string" },
      "description": "선호 워크플로 (예: [TDD, code review, CI/CD])"
    },
    "constraints": {
      "type": "array",
      "items": { "type": "string" },
      "description": "제약 조건 (예: [Windows only, no Docker])"
    },
    "generation": {
      "type": "integer",
      "minimum": 1,
      "description": "세대 번호"
    },
    "parent_audit": {
      "type": ["object", "null"],
      "properties": {
        "total_score": { "type": "integer" },
        "categories": {
          "type": "object",
          "additionalProperties": { "type": "integer" }
        },
        "weak_categories": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "description": "이전 세대 audit 결과 (1세대는 null)"
    },
    "parent_feedback": {
      "type": ["string", "null"],
      "description": "M9에서 생성된 개선 피드백 (1세대는 null)"
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/config.json lib/profile-schema.json
git commit -m "feat: add harness-maker config and profile schema"
```

---

### Task 2: 체크포인트 유틸리티

**Files:**
- Create: `C:\Users\slime\Harness\lib\checkpoint.sh`

- [ ] **Step 1: checkpoint.sh 작성**

```bash
#!/bin/bash
# 체크포인트 저장/로드/확인 유틸리티
# Usage:
#   checkpoint.sh save <generation> <milestone> <data_file>
#   checkpoint.sh load <generation> <milestone>
#   checkpoint.sh exists <generation> <milestone>
#   checkpoint.sh latest <generation>

set -euo pipefail

CHECKPOINT_DIR="${HARNESS_ROOT:-.}/.checkpoints"

cmd="${1:-}"
gen="${2:-}"
milestone="${3:-}"

case "$cmd" in
  save)
    data_file="${4:-}"
    if [[ -z "$gen" || -z "$milestone" || -z "$data_file" ]]; then
      echo "Usage: checkpoint.sh save <generation> <milestone> <data_file>" >&2
      exit 1
    fi
    dir="$CHECKPOINT_DIR/v$gen"
    mkdir -p "$dir"
    cp "$data_file" "$dir/$milestone.json"
    # 메타데이터 추가
    tmp=$(mktemp)
    jq --arg ms "$milestone" \
       --arg gen "$gen" \
       --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg status "completed" \
       '. + {milestone: $ms, generation: ($gen|tonumber), timestamp: $ts, status: $status}' \
       "$dir/$milestone.json" > "$tmp"
    mv "$tmp" "$dir/$milestone.json"
    echo "Checkpoint saved: v$gen/$milestone"
    ;;

  load)
    if [[ -z "$gen" || -z "$milestone" ]]; then
      echo "Usage: checkpoint.sh load <generation> <milestone>" >&2
      exit 1
    fi
    file="$CHECKPOINT_DIR/v$gen/$milestone.json"
    if [[ -f "$file" ]]; then
      cat "$file"
    else
      echo "Checkpoint not found: v$gen/$milestone" >&2
      exit 1
    fi
    ;;

  exists)
    if [[ -z "$gen" || -z "$milestone" ]]; then
      echo "Usage: checkpoint.sh exists <generation> <milestone>" >&2
      exit 1
    fi
    file="$CHECKPOINT_DIR/v$gen/$milestone.json"
    if [[ -f "$file" ]]; then
      echo "true"
    else
      echo "false"
    fi
    ;;

  latest)
    if [[ -z "$gen" ]]; then
      echo "Usage: checkpoint.sh latest <generation>" >&2
      exit 1
    fi
    dir="$CHECKPOINT_DIR/v$gen"
    if [[ -d "$dir" ]]; then
      ls -t "$dir"/*.json 2>/dev/null | head -1 | xargs -r basename | sed 's/.json$//'
    else
      echo "none"
    fi
    ;;

  *)
    echo "Usage: checkpoint.sh {save|load|exists|latest} ..." >&2
    exit 1
    ;;
esac
```

- [ ] **Step 2: 실행 권한 부여 및 jq 의존성 확인**

```bash
chmod +x lib/checkpoint.sh
which jq || echo "WARN: jq not found - install jq for checkpoint metadata"
```

- [ ] **Step 3: Commit**

```bash
git add lib/checkpoint.sh
git commit -m "feat: add checkpoint save/load utility"
```

---

### Task 3: 전략 문서 템플릿

**Files:**
- Create: `C:\Users\slime\Harness\lib\strategy-template.md`

- [ ] **Step 1: strategy-template.md 작성**

```markdown
# Harness Strategy - {{role}} (v{{generation}})

## Profile
- **Role**: {{role}}
- **Stack**: {{stack}}
- **Workflow**: {{workflow}}
- **Constraints**: {{constraints}}

## Previous Generation Feedback
{{parent_feedback}}

---

## CLAUDE.md Rules

### NEVER
{{never_rules}}

### ALWAYS
{{always_rules}}

### Workflow
{{workflow_definition}}

### Agents (Auto-Use)
{{agent_auto_rules}}

---

## settings.json

### Permissions
```json
{
  "allow": [{{allow_list}}],
  "deny": [{{deny_list}}]
}
```

### Hooks
{{hooks_design}}

### Environment
```json
{
  "env": {{{env_vars}}}
}
```

---

## Skills

### ECC Skills (Install)
| Skill | Reason |
|-------|--------|
{{ecc_skills_table}}

### Custom Skills (Generate)
{{custom_skills}}

### Bootstrap
- harness-maker/SKILL.md (자기 복제)

---

## Agents
{{agents_definitions}}

---

## Commands
{{commands_definitions}}

---

## Hooks Scripts
{{hooks_scripts}}

---

## Quality Targets
- audit 목표 점수: {{target_score}}/70
- 필수 카테고리: {{required_categories}}
```

- [ ] **Step 2: Commit**

```bash
git add lib/strategy-template.md
git commit -m "feat: add strategy document template"
```

---

### Task 4: audit-adapter 래퍼

**Files:**
- Create: `C:\Users\slime\Harness\lib\audit-adapter.sh`

- [ ] **Step 1: audit-adapter.sh 작성**

harness-audit 커맨드의 출력을 파싱해서 JSON 점수로 변환하는 래퍼.

```bash
#!/bin/bash
# harness-audit 결과를 JSON으로 변환
# Usage: audit-adapter.sh <target_dir>
# Output: JSON with scores per category

set -euo pipefail

TARGET_DIR="${1:-.}"

# harness-audit는 Claude Code 커맨드이므로
# 실제로는 에이전트가 harness-audit 로직을 직접 실행하고
# 이 스크립트는 결과 파싱만 담당

# 에이전트가 audit 결과를 임시 파일에 저장한 후 이 스크립트로 파싱
AUDIT_RESULT="${2:-/tmp/harness-audit-result.txt}"

if [[ ! -f "$AUDIT_RESULT" ]]; then
  echo '{"error": "audit result file not found", "path": "'"$AUDIT_RESULT"'"}' >&2
  exit 1
fi

# 점수 추출 패턴: "Category: N/10"
python3 -c "
import re, json, sys

text = open('$AUDIT_RESULT').read()
categories = {}
pattern = r'(\w[\w\s]+):\s*(\d+)/10'
for match in re.finditer(pattern, text):
    name = match.group(1).strip()
    score = int(match.group(2))
    categories[name] = score

total = sum(categories.values())
result = {
    'total_score': total,
    'max_score': 70,
    'categories': categories,
    'weak_categories': [k for k, v in categories.items() if v < 9],
    'passed': total >= 63
}
print(json.dumps(result, indent=2))
"
```

- [ ] **Step 2: 실행 권한 부여**

```bash
chmod +x lib/audit-adapter.sh
```

- [ ] **Step 3: Commit**

```bash
git add lib/audit-adapter.sh
git commit -m "feat: add harness-audit adapter for score parsing"
```

---

### Task 5: 리서치 에이전트 (M2)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-researcher.md`

- [ ] **Step 1: hm-researcher.md 작성**

```markdown
---
name: hm-researcher
description: "하네스 메이커 리서치 에이전트. 프로필 기반으로 웹 리서치, ECC 스킬 매칭, 하네스 패턴 수집을 수행한다."
tools: ["Read", "Grep", "Glob", "WebSearch", "WebFetch", "Write"]
model: sonnet
---

You are the harness-maker research agent.

## Mission

주어진 프로필 JSON을 기반으로 세 가지 리서치를 수행하고 결과를 JSON으로 반환한다.

## Input

프롬프트에 아래 정보가 포함됨:
- `profile`: 사용자 프로필 JSON (role, stack, workflow, constraints)
- `research_type`: "web" | "ecc" | "patterns" 중 하나
- `output_path`: 결과를 저장할 파일 경로

## Research Types

### web (M2a)
1. WebSearch로 프로필의 stack 각 항목에 대해 "best practices 2026", "Claude Code harness" 검색
2. 상위 5개 결과에서 핵심 인사이트 추출
3. 결과를 JSON으로 저장:
```json
{
  "type": "web",
  "insights": [
    {"topic": "...", "summary": "...", "source": "...", "relevance": 0.0-1.0}
  ]
}
```

### ecc (M2b)
1. ~/.claude/skills/ 디렉토리에서 사용 가능한 모든 스킬 목록 수집
2. 각 스킬의 SKILL.md 읽어서 description 추출
3. 프로필의 stack과 매칭하여 적합도 점수 계산
4. 결과를 JSON으로 저장:
```json
{
  "type": "ecc",
  "recommended_skills": [
    {"name": "...", "description": "...", "relevance": 0.0-1.0, "reason": "..."}
  ]
}
```

### patterns (M2c)
1. Read로 ~/.claude/skills/agent-harness-construction/SKILL.md 읽기
2. 프로필에 최적인 아키텍처 패턴 결정 (ReAct / Function-calling / Hybrid)
3. 권장 granularity (micro/medium/macro tools) 결정
4. 결과를 JSON으로 저장:
```json
{
  "type": "patterns",
  "architecture": "hybrid",
  "granularity": {"high_risk": "micro", "common": "medium", "batch": "macro"},
  "observation_format": "status+summary+next_actions",
  "error_recovery": "root_cause+retry+stop_condition"
}
```

## Output

결과를 `output_path`에 JSON 파일로 Write 한다.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-researcher.md
git commit -m "feat: add harness-maker researcher agent (M2)"
```

---

### Task 6: 큐레이션 에이전트 (M3)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-curator.md`

- [ ] **Step 1: hm-curator.md 작성**

```markdown
---
name: hm-curator
description: "하네스 메이커 큐레이션 에이전트. 리서치 3개 결과를 통합, 중복 제거, 랭킹하여 최종 인사이트 세트를 생성한다."
tools: ["Read", "Write"]
model: sonnet
---

You are the harness-maker curator agent.

## Mission

M2a(web), M2b(ecc), M2c(patterns) 리서치 결과 3개를 입력받아 통합된 인사이트 세트를 생성한다.

## Input

프롬프트에 아래 정보가 포함됨:
- `profile`: 사용자 프로필 JSON
- `research_paths`: M2a, M2b, M2c 결과 파일 경로 3개
- `output_path`: 큐레이션 결과 저장 경로

## Process

1. 세 리서치 파일을 모두 Read
2. 중복 인사이트 제거 (같은 도구/스킬이 여러 소스에서 언급된 경우 하나로 병합)
3. 프로필과의 관련도 기준으로 랭킹 (상위 15개 선별)
4. 스킬 조합 최적화:
   - skill-router 충돌 체크 (예: tdd + tdd-workflow 동시 선택 방지)
   - 프레임워크 전용 > 언어 전용 > 범용 우선순위 적용
5. 최종 추천 세트 확정

## Output

```json
{
  "ranked_insights": [
    {"rank": 1, "topic": "...", "action": "...", "source": "web|ecc|patterns"}
  ],
  "recommended_skills": {
    "ecc_install": ["skill-name-1", "skill-name-2"],
    "custom_generate": [
      {"name": "...", "purpose": "...", "sketch": "..."}
    ]
  },
  "architecture": {
    "pattern": "hybrid",
    "granularity": {...},
    "observation_format": "...",
    "error_recovery": "..."
  },
  "conflicts_resolved": [
    {"kept": "django-tdd", "dropped": "tdd", "reason": "프레임워크 전용 우선"}
  ]
}
```

결과를 `output_path`에 Write.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-curator.md
git commit -m "feat: add harness-maker curator agent (M3)"
```

---

### Task 7: 전략 수립 에이전트 (M4)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-strategist.md`

- [ ] **Step 1: hm-strategist.md 작성**

```markdown
---
name: hm-strategist
description: "하네스 메이커 전략 수립 에이전트. 큐레이션 결과를 하네스 청사진(전략 문서)으로 변환한다."
tools: ["Read", "Write"]
model: sonnet
---

You are the harness-maker strategist agent.

## Mission

큐레이션 결과를 기반으로 완전한 하네스 전략 문서를 생성한다. 이 문서가 M5(빌드)의 입력이 된다.

## Input

프롬프트에 아래 정보가 포함됨:
- `profile`: 사용자 프로필 JSON
- `curation_path`: M3 큐레이션 결과 파일 경로
- `template_path`: lib/strategy-template.md 경로
- `output_path`: 전략 문서 저장 경로

## Process

1. 큐레이션 결과와 템플릿을 Read
2. 템플릿의 각 섹션을 구체적 내용으로 채움:

### CLAUDE.md Rules 설계
- 프로필의 stack에 맞는 NEVER/ALWAYS 규칙 생성
- 워크플로 정의 (Research → Plan → TDD → Review → Commit 기본, 스택에 맞게 조정)
- 에이전트 자동 사용 규칙

### settings.json 설계
- permissions: stack별 도구 allow/deny 목록
  - Python: ruff, pytest, pip, uv
  - Node: npm, npx, eslint, prettier
  - Go: go test, golangci-lint
  - 공통: git, ls, cat, grep
- hooks: 스택별 자동 포맷터, gitleaks, 피드백 감지
- env: BASH_MAX_OUTPUT_LENGTH, CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY

### Skills 설계
- ECC 설치 목록 (큐레이션의 ecc_install)
- 커스텀 스킬 상세 정의 (name, description, trigger, process)
- harness-maker 스킬 (부트스트래핑용) 반드시 포함

### Agents 설계
- 역할별 에이전트 정의 (name, description, tools, model)
- 스택에 맞는 전문 에이전트 (예: Django면 django-reviewer)

### Commands 설계
- 워크플로 커맨드 (/test, /lint, /build 등)
- harness-maker 커맨드

### Hooks Scripts 설계
- PreToolUse: gitleaks 시크릿 스캔
- PostToolUse(Write|Edit): 자동 포맷 (스택별)
- SessionStart: 컨텍스트 로드
- Stop: 세션 저장
- PreCompact: 보존할 정보 목록

## Output

strategy-template.md의 모든 `{{placeholder}}`를 구체적 내용으로 채운 전략 문서를 `output_path`에 Write.

## Constraints

- 모든 섹션이 채워져야 함. 빈 placeholder 금지.
- 스킬 간 충돌 없어야 함 (skill-router 규칙 준수).
- hooks의 스크립트 경로가 실제 생성될 경로와 일치해야 함.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-strategist.md
git commit -m "feat: add harness-maker strategist agent (M4)"
```

---

### Task 8: 빌드 에이전트 (M5)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-builder.md`

- [ ] **Step 1: hm-builder.md 작성**

```markdown
---
name: hm-builder
description: "하네스 메이커 빌드 에이전트. 전략 문서를 실제 파일들로 변환한다."
tools: ["Read", "Write", "Bash", "Glob", "Grep"]
model: sonnet
---

You are the harness-maker builder agent.

## Mission

전략 문서의 특정 섹션을 실제 파일로 생성한다. 하나의 빌드 타입만 처리한다.

## Input

프롬프트에 아래 정보가 포함됨:
- `strategy_path`: M4 전략 문서 경로
- `build_type`: "claude_md" | "settings" | "skills" | "agents" | "commands_hooks" 중 하나
- `target_dir`: 생성할 하네스의 루트 경로
- `harness_maker_skill_path`: 부트스트래핑용 harness-maker SKILL.md 원본 경로

## Build Types

### claude_md (M5a)
1. 전략 문서에서 CLAUDE.md Rules 섹션 추출
2. `<target_dir>/.claude/CLAUDE.md` 생성
3. NEVER/ALWAYS/Workflow/Agents 섹션 포함

### settings (M5b)
1. 전략 문서에서 settings.json 섹션 추출
2. `<target_dir>/.claude/settings.json` 생성
3. JSON 문법 검증 (jq로 파싱 테스트)

### skills (M5c)
1. ECC 스킬: `~/.claude/skills/<name>/` 에서 복사
   - 대상 스킬이 존재하는지 먼저 확인
   - 없으면 스킵하고 경고 로그
2. 커스텀 스킬: 전략 문서의 정의대로 SKILL.md 생성
3. **harness-maker 스킬 복사** (부트스트래핑):
   - `harness_maker_skill_path`에서 `<target_dir>/.claude/skills/harness-maker/SKILL.md`로 복사
   - 관련 에이전트, 커맨드, lib 파일도 함께 복사

### agents (M5d)
1. 전략 문서에서 Agents 섹션 추출
2. 각 에이전트별 `<target_dir>/.claude/agents/<name>.md` 생성
3. frontmatter: name, description, tools, model

### commands_hooks (M5e)
1. 커맨드: 전략 문서에서 Commands 섹션 → `<target_dir>/.claude/commands/<name>.md`
2. 훅 스크립트: 전략 문서에서 Hooks Scripts 섹션 → `<target_dir>/.claude/scripts/<name>.sh`
3. 훅 스크립트에 실행 권한 부여: `chmod +x`

## Output

생성한 파일 목록을 stdout으로 출력.

## Constraints

- 이미 존재하는 파일은 덮어쓰기 전에 `.bak` 확장자로 백업
- JSON 파일은 생성 후 jq로 문법 검증
- 스크립트 파일은 shebang (`#!/bin/bash`) 포함
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-builder.md
git commit -m "feat: add harness-maker builder agent (M5)"
```

---

### Task 9: 검증 에이전트 (M6)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-validator.md`

- [ ] **Step 1: hm-validator.md 작성**

```markdown
---
name: hm-validator
description: "하네스 메이커 검증 에이전트. 생성된 하네스 파일을 harness-audit 기준으로 검증하고 점수를 산출한다."
tools: ["Read", "Grep", "Glob", "Bash", "Write"]
model: sonnet
---

You are the harness-maker validator agent.

## Mission

생성된 하네스의 품질을 검증하고 audit 점수를 산출한다.

## Input

프롬프트에 아래 정보가 포함됨:
- `target_dir`: 검증할 하네스 경로
- `output_path`: 검증 결과 저장 경로

## Process

### 1. 파일 존재 검증
- `<target_dir>/.claude/CLAUDE.md` 존재 여부
- `<target_dir>/.claude/settings.json` 존재 및 JSON 문법
- `<target_dir>/.claude/skills/` 내 SKILL.md 파일 수
- `<target_dir>/.claude/agents/` 내 .md 파일 수
- `<target_dir>/.claude/commands/` 내 .md 파일 수
- `<target_dir>/.claude/scripts/` 내 스크립트 파일 수

### 2. 참조 무결성 검사
- CLAUDE.md에서 참조하는 에이전트가 agents/에 존재하는지
- settings.json의 hook 스크립트 경로가 scripts/에 존재하는지
- 스킬이 다른 스킬을 참조할 때 해당 스킬이 설치되었는지

### 3. harness-audit 7개 카테고리 점수 산출

각 카테고리를 0~10으로 채점:

**Tool Coverage (도구 커버리지)**:
- permissions.allow에 스택에 맞는 도구가 포함됐는지
- 10점: 스택의 모든 핵심 도구 포함 + deny 목록 적절

**Context Efficiency (컨텍스트 효율)**:
- CLAUDE.md가 800줄 이하인지
- 스킬이 on-demand 로드 방식인지 (인라인 아닌지)
- 10점: 시스템 프롬프트 최소화, 스킬 분리 완벽

**Quality Gates (품질 게이트)**:
- TDD 워크플로 정의됐는지
- 코드 리뷰 에이전트 있는지
- 커밋 전 검증 프로세스 있는지
- 10점: TDD + 리뷰 + 검증 루프 완비

**Memory Persistence (메모리 지속성)**:
- SessionStart/Stop 훅에서 컨텍스트 저장/로드 하는지
- PreCompact 훅에 보존 정보 목록 있는지
- 10점: 세션 간 컨텍스트 완벽 보존

**Eval Coverage (평가 커버리지)**:
- eval-harness 스킬 포함 여부
- 자동 eval 훅 존재 여부
- 10점: eval 정의 + 자동 실행 + 리포팅

**Security Guardrails (보안 가드레일)**:
- gitleaks 훅 존재 여부
- permissions.deny에 위험 명령 차단됐는지
- security-review 에이전트 있는지
- 10점: 시크릿 스캔 + 위험 명령 차단 + 보안 리뷰

**Cost Efficiency (비용 효율)**:
- 에이전트별 model 지정됐는지 (전부 opus 아닌지)
- 병렬 실행 설정 있는지
- 불필요한 도구 중복 없는지
- 10점: 모델 라우팅 최적 + 병렬화 + 도구 최소화

### 4. 결과 JSON 생성

```json
{
  "total_score": 52,
  "max_score": 70,
  "passed": false,
  "categories": {
    "Tool Coverage": 8,
    "Context Efficiency": 7,
    "Quality Gates": 9,
    "Memory Persistence": 6,
    "Eval Coverage": 4,
    "Security Guardrails": 8,
    "Cost Efficiency": 5
  },
  "weak_categories": ["Eval Coverage", "Cost Efficiency", "Memory Persistence"],
  "issues": [
    {"category": "Eval Coverage", "issue": "eval-harness 스킬 미포함", "fix": "skills/eval-harness 추가"}
  ],
  "file_integrity": {
    "total_files": 24,
    "missing_references": 0,
    "json_valid": true
  }
}
```

## Output

결과를 `output_path`에 Write.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-validator.md
git commit -m "feat: add harness-maker validator agent (M6)"
```

---

### Task 10: 스모크 테스트 에이전트 (M8)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-smoke-tester.md`

- [ ] **Step 1: hm-smoke-tester.md 작성**

```markdown
---
name: hm-smoke-tester
description: "하네스 메이커 스모크 테스트 에이전트. 설치된 하네스로 간단한 태스크를 실행하여 동작을 검증한다."
tools: ["Read", "Bash", "Glob", "Write"]
model: sonnet
---

You are the harness-maker smoke tester agent.

## Mission

설치된 하네스가 실제로 동작하는지 검증한다.

## Input

프롬프트에 아래 정보가 포함됨:
- `target_dir`: 설치된 하네스 경로
- `smoke_task`: 실행할 테스트 태스크 (기본: "hello world 함수를 TDD로 작성해")
- `output_path`: 결과 저장 경로

## Tests

### 1. 파일 구조 검증
```bash
# 필수 파일 존재 확인
test -f "<target_dir>/.claude/CLAUDE.md"
test -f "<target_dir>/.claude/settings.json"
test -d "<target_dir>/.claude/skills"
```

### 2. settings.json 유효성
```bash
jq . "<target_dir>/.claude/settings.json" > /dev/null 2>&1
```

### 3. 스킬 로드 가능성 확인
- 각 skills/*/SKILL.md 파일이 유효한 frontmatter를 가지는지 확인
- frontmatter에 name, description 필드 존재 여부

### 4. 에이전트 정의 유효성
- 각 agents/*.md 파일이 유효한 frontmatter를 가지는지 확인
- frontmatter에 name, description, tools 필드 존재 여부

### 5. 훅 스크립트 실행 가능성
```bash
# 각 스크립트에 실행 권한이 있는지
find "<target_dir>/.claude/scripts" -name "*.sh" ! -perm -111
```

### 6. harness-maker 부트스트래핑 검증
- `<target_dir>/.claude/skills/harness-maker/SKILL.md` 존재 여부
- harness-maker 커맨드 존재 여부

## Output

```json
{
  "passed": true,
  "tests": [
    {"name": "file_structure", "passed": true, "details": "..."},
    {"name": "settings_json", "passed": true, "details": "..."},
    {"name": "skills_loadable", "passed": true, "details": "12 skills valid"},
    {"name": "agents_valid", "passed": true, "details": "5 agents valid"},
    {"name": "hooks_executable", "passed": false, "details": "format.sh missing +x"},
    {"name": "bootstrap", "passed": true, "details": "harness-maker skill present"}
  ],
  "summary": "5/6 tests passed"
}
```

결과를 `output_path`에 Write.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-smoke-tester.md
git commit -m "feat: add harness-maker smoke tester agent (M8)"
```

---

### Task 11: 개선 + 시드 생성 에이전트 (M9+M10)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\agents\hm-improver.md`

- [ ] **Step 1: hm-improver.md 작성**

```markdown
---
name: hm-improver
description: "하네스 메이커 개선 에이전트. audit/스모크 결과를 분석하여 다음 세대 시드를 생성한다. M9(개선 분석) + M10(시드 생성) 통합."
tools: ["Read", "Write"]
model: sonnet
---

You are the harness-maker improver agent.

## Mission

현재 세대의 audit 결과와 스모크 테스트 결과를 분석하여 다음 세대의 입력 시드를 생성한다. M9(개선 분석)과 M10(시드 생성)을 하나로 통합.

## Input

프롬프트에 아래 정보가 포함됨:
- `profile`: 현재 세대 프로필 JSON
- `audit_path`: M6 검증 결과 경로
- `smoke_path`: M8 스모크 결과 경로
- `output_path`: 다음 세대 시드 저장 경로

## Process

### M9: 개선 분석

1. audit 결과에서 9점 미만 카테고리 식별
2. 스모크 실패 항목의 원인 분석
3. 각 약점에 대한 구체적 개선 방향 도출:
   - 어떤 스킬을 추가/제거해야 하는지
   - 어떤 훅을 수정해야 하는지
   - 어떤 에이전트를 보강해야 하는지

### M10: 시드 생성

1. 이전 프로필을 기반으로 새 프로필 JSON 생성
2. generation 번호 증가
3. parent_audit에 현재 audit 결과 삽입
4. parent_feedback에 M9 분석 결과를 자연어로 정리

## Output

```json
{
  "role": "backend developer",
  "stack": ["Python", "Django", "PostgreSQL"],
  "workflow": ["TDD", "code review", "CI/CD"],
  "constraints": [],
  "generation": 2,
  "parent_audit": {
    "total_score": 52,
    "categories": {"Tool Coverage": 8, "Eval Coverage": 4, ...},
    "weak_categories": ["Eval Coverage", "Cost Efficiency"]
  },
  "parent_feedback": "이전 세대는 Eval Coverage 4/10, Cost Efficiency 5/10이었다. eval-harness 스킬을 추가하고 eval 자동 실행 훅을 구성하라. 에이전트 model을 sonnet으로 통일하여 비용을 최적화하라. 스모크 테스트에서 format.sh에 실행 권한이 없었으므로 chmod +x를 빌드 단계에서 보장하라."
}
```

결과를 `output_path`에 Write.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/hm-improver.md
git commit -m "feat: add harness-maker improver agent (M9+M10)"
```

---

### Task 12: /harness-maker 커맨드

**Files:**
- Create: `C:\Users\slime\Harness\.claude\commands\harness-maker.md`

- [ ] **Step 1: harness-maker.md 작성**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/harness-maker.md
git commit -m "feat: add /harness-maker command"
```

---

### Task 13: 오케스트레이터 스킬 (핵심)

**Files:**
- Create: `C:\Users\slime\Harness\.claude\skills\harness-maker\SKILL.md`

- [ ] **Step 1: SKILL.md 작성**

```markdown
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
  "files": ["CLAUDE.md", "settings.json", ...],
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

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/harness-maker/SKILL.md
git commit -m "feat: add harness-maker orchestrator skill (core)"
```

---

### Task 14: Git 초기화 + 전체 Commit

**Files:**
- All files created in Tasks 1-13

- [ ] **Step 1: Git 저장소 초기화**

```bash
cd C:\Users\slime\Harness
git init
```

- [ ] **Step 2: .gitignore 작성**

```
.checkpoints/
*.bak.*
/tmp/
```

- [ ] **Step 3: 전체 파일 확인**

```bash
find . -type f | grep -v ".git/" | sort
```

Expected:
```
./.claude/agents/hm-builder.md
./.claude/agents/hm-curator.md
./.claude/agents/hm-improver.md
./.claude/agents/hm-researcher.md
./.claude/agents/hm-smoke-tester.md
./.claude/agents/hm-strategist.md
./.claude/agents/hm-validator.md
./.claude/commands/harness-maker.md
./.claude/skills/harness-maker/SKILL.md
./docs/specs/2026-04-05-harness-maker-design.md
./docs/superpowers/plans/2026-04-05-harness-maker.md
./lib/audit-adapter.sh
./lib/checkpoint.sh
./lib/config.json
./lib/profile-schema.json
./lib/strategy-template.md
```

- [ ] **Step 4: Initial commit**

```bash
git add -A
git commit -m "feat: harness-maker bootstrapping pipeline - initial implementation"
```

---

### Task 15: 통합 스모크 테스트

- [ ] **Step 1: 스킬 로드 확인**

SKILL.md frontmatter가 유효한지 확인:
```bash
head -5 .claude/skills/harness-maker/SKILL.md
```

Expected: `---` 시작 + name, description 필드

- [ ] **Step 2: 에이전트 frontmatter 일괄 확인**

```bash
for f in .claude/agents/hm-*.md; do
  echo "=== $f ==="
  head -6 "$f"
  echo
done
```

Expected: 모든 7개 에이전트에 name, description, tools 필드

- [ ] **Step 3: JSON 파일 문법 확인**

```bash
jq . lib/config.json > /dev/null && echo "config.json: OK"
jq . lib/profile-schema.json > /dev/null && echo "profile-schema.json: OK"
```

Expected: 둘 다 OK

- [ ] **Step 4: checkpoint.sh 동작 확인**

```bash
mkdir -p /tmp/hm-test
echo '{"test": true}' > /tmp/hm-test-data.json
HARNESS_ROOT=/tmp/hm-test bash lib/checkpoint.sh save 1 M1 /tmp/hm-test-data.json
HARNESS_ROOT=/tmp/hm-test bash lib/checkpoint.sh exists 1 M1
HARNESS_ROOT=/tmp/hm-test bash lib/checkpoint.sh load 1 M1
HARNESS_ROOT=/tmp/hm-test bash lib/checkpoint.sh latest 1
rm -rf /tmp/hm-test /tmp/hm-test-data.json
```

Expected:
```
Checkpoint saved: v1/M1
true
{"test": true, "milestone": "M1", "generation": 1, ...}
M1
```

- [ ] **Step 5: 결과 확인 후 Commit (변경 있을 경우)**

```bash
git status
# 변경 없으면 스킵, 있으면:
git add -A
git commit -m "fix: post-smoke-test fixes"
```
