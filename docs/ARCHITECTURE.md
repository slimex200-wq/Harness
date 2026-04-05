# Harness Maker - Architecture & Workflow

## 전체 구조

```
C:\Users\slime\Harness\
│
├── lib/                          ← 공유 유틸리티
│   ├── run.sh                    # headless 진입점 (claude -p)
│   ├── env-detect.sh             # M0: 환경 감지
│   ├── checkpoint.sh             # 체크포인트 CRUD
│   ├── audit-adapter.sh          # audit 결과 JSON 파싱
│   ├── config.json               # 파이프라인 설정
│   ├── profile-schema.json       # M1 출력 스키마
│   └── strategy-template.md      # M4 전략 템플릿
│
├── .claude/                      ← 하네스 메이커 프레임워크
│   ├── skills/harness-maker/     # 핵심 오케스트레이터 (SKILL.md)
│   ├── agents/                   # 13개 전문 에이전트
│   │   ├── hm-researcher.md      #   M2: 리서치 (web/ecc/patterns)
│   │   ├── hm-curator.md         #   M3: 큐레이션
│   │   ├── hm-strategist.md      #   M4: 전략 수립
│   │   ├── hm-builder.md         #   M5: 빌드 (5개 타입)
│   │   ├── hm-validator.md       #   M6: 7카테고리 audit
│   │   ├── hm-smoke-tester.md    #   M8: 스모크 테스트
│   │   ├── hm-improver.md        #   M9+M10: 개선 + 시드 생성
│   │   ├── hm-planner.md         #   M11: PRD 기획
│   │   ├── hm-designer.md        #   M12: 설계
│   │   ├── hm-design-reviewer.md #   R1-R3: 설계 리뷰
│   │   ├── hm-implementer.md     #   M13: 구현
│   │   ├── hm-product-reviewer.md#   R4-R13: 프로덕트 리뷰 (10관점)
│   │   └── hm-deployer.md        #   M16: 배포
│   └── commands/
│       └── harness-maker.md      # /harness-maker 커맨드
│
├── .checkpoints/                 ← 파이프라인 상태 (세대별)
│   ├── v1/                       # Flutter 1세대 (52/70 FAIL)
│   ├── v2/                       # Flutter 2세대 (65/70 PASS)
│   ├── v1-web/                   # Web 1세대 (64/70 PASS, 부트스트래핑)
│   └── product/                  # 프로덕트 파이프라인
│
├── output/                       ← 생성된 하네스
│   ├── v1/     .claude/ (25 files)   # Flutter 하네스 v1
│   ├── v2/     .claude/ (34 files)   # Flutter 하네스 v2
│   └── v1-web/ .claude/ (19 files)   # Web 하네스 v1
│
├── product/                      ← 생성된 프로덕트
│   └── daily-loop-web/           # Next.js 습관 추적 앱
│       ├── .claude/              #   (v1-web 하네스 설치됨)
│       ├── src/                  #   앱 소스코드
│       ├── prisma/               #   DB 스키마 + 마이그레이션
│       └── dev.db                #   SQLite 데이터
│
└── docs/
    ├── specs/                    # 설계 문서
    └── superpowers/plans/        # 구현 계획
```

---

## DAG 파이프라인 워크플로우

```
사용자 입력: "나는 Django 백엔드 개발자야"
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  bash lib/run.sh "나는 Django 백엔드 개발자야"           │
│  → env-detect.sh (M0)                                   │
│  → checkpoint 확인 (재개 가능?)                          │
│  → claude -p (headless 실행)                             │
└─────────────────────────────────────────────────────────┘
     │
     ▼
═══════════════════════════════════════════════════════════
  Phase 1: 하네스 생성 (M0 ~ M10, 63/70+ 될 때까지 반복)
═══════════════════════════════════════════════════════════

  M0 환경 감지
     │  사용 가능 스택 확인
     │  불가능한 스택 → 자동 대안 선택
     ▼
  M1 입력 파싱
     │  자연어 → 프로필 JSON
     │  {role, stack, workflow, constraints, generation}
     ▼
  M2 리서치 ─────────── 병렬 3개 ──────────
     │              │              │
     ▼              ▼              ▼
   M2a            M2b            M2c
   웹 리서치      ECC 스킬       하네스 패턴
   (WebSearch)    카탈로그 매칭    수집
     │              │              │
     └──────────────┴──────────────┘
                    │
                    ▼
  M3 큐레이션
     │  중복 제거 + 랭킹 + 스킬 조합 최적화
     ▼
  M4 전략 수립
     │  하네스 청사진 문서 생성
     │  (CLAUDE.md 규칙, settings, skills, agents, hooks)
     ▼
  M4.5 자동 전략 검증
     │  ✓ 모든 섹션 비어있지 않음
     │  ✓ harness-maker 포함 (부트스트래핑)
     │  ✓ SessionStart/Stop 훅 (memory 교훈)
     │  ✓ Model routing 정책 (cost 교훈)
     │  ✓ Eval rubric (eval 교훈)
     │  실패 → M4 재실행 (최대 2회)
     ▼
  M5 빌드 ──────────── 병렬 5개 ──────────
     │         │         │         │         │
     ▼         ▼         ▼         ▼         ▼
   M5a       M5b       M5c       M5d       M5e
   CLAUDE    settings  skills/   agents/   commands/
   .md       .json     (ECC복사  (frontm-  hooks/
                       +커스텀   atter)    scripts/
                       +maker)
     │         │         │         │         │
     └─────────┴─────────┴─────────┴─────────┘
                         │
                         ▼
  M6 검증 (7-Category Audit)
     │
     │  ┌──────────────────────────────────────┐
     │  │ tool_coverage        /10             │
     │  │ context_efficiency   /10             │
     │  │ quality_gates        /10             │
     │  │ memory_persistence   /10             │
     │  │ eval_coverage        /10             │
     │  │ security_guardrails  /10             │
     │  │ cost_efficiency      /10             │
     │  │ ─────────────────────────            │
     │  │ TOTAL                /70             │
     │  └──────────────────────────────────────┘
     │  issues → M5 해당 타입만 재빌드 (최대 2회)
     ▼
  M7 설치
     │  output/v<N>/.claude/ 에 배치
     │  기존 파일 백업
     ▼
  M8 스모크 테스트
     │  파일 구조 / JSON 유효성 / frontmatter / 참조 무결성
     ▼
  ┌─────────────────────────────────────┐
  │         종료 판정 (자동)              │
  │                                     │
  │  audit ≥ 63 AND smoke PASS?         │
  │     YES ──→ Phase 2로               │
  │     NO  ──→ gen ≥ max_generations?  │
  │                YES ──→ Phase 2로    │
  │                NO  ──→ M9+M10       │
  └─────────────────────────────────────┘
     │ (미달 시)
     ▼
  M9+M10 개선 + 시드 생성
     │  약점 카테고리 분석 → 개선 피드백
     │  다음 세대 프로필 JSON 생성
     │  generation++
     │
     └──→ M1로 복귀 (새 세대)

═══════════════════════════════════════════════════════════
  Phase 2: 프로덕트 생성 (PD → M11 ~ M16)
═══════════════════════════════════════════════════════════

  PD Product Discovery (요구가 모호할 때 자동 실행)
     │  트렌드 리서치 3개 병렬
     │  후보 5개 생성 + 야심도 점수 계산
     │  commodity 자동 탈락 (투두/메모/URL단축기)
     │  AI 활용 제품 우선, 야심도 6+ 필수
     ▼
  M11 기획
     │  PD 결과 또는 구체적 요구사항 → PRD
     ▼
  M12 설계
     │  PRD → 아키텍처/데이터 모델/API/UI 설계
     ▼
  R1-R3 설계 리뷰 ──── 병렬 3개 (isolated-reviewer) ────
     │              │              │
     ▼              ▼              ▼
   R1             R2             R3
   아키텍처       실현 가능성     스코프
   리뷰          리뷰           리뷰
     │              │              │
     └──────────────┴──────────────┘
     │  미달 → M12 재설계 (최대 2회)
     ▼
  M13 구현
     │  writing-plans → subagent-driven-development
     │  하네스의 TDD/리뷰/보안 스킬이 품질 보장
     ▼
  M14 빌드 검증
     │  빌드 + 테스트 + 린트
     │  실패 → build-error-resolver 자동 수정
     ▼
  R4-R9 코드 품질 리뷰 ── 병렬 6개 (isolated-reviewer) ──
     │       │       │       │       │       │
     ▼       ▼       ▼       ▼       ▼       ▼
    R4      R5      R6      R7      R8      R9
    QA      보안    디자인   코드    퍼포    threat
                                    먼스    -lens
     │       │       │       │       │       │
     └───────┴───────┴───────┴───────┴───────┘
     │  미달 → M17(개선) → M13 재구현 (최대 3회)
     │  전수 통과 시 ↓
     ▼
  R10-R13 프로덕션 준비 리뷰 ── 병렬 4개 ──────────
     │           │           │           │
     ▼           ▼           ▼           ▼
    R10         R11         R12         R13
    배포         연동         E2E         운영
    가능성       검증         플로우       준비
    ─────       ─────       ─────       ─────
    배포설정     결제/이메일   앱 실행+     로깅/헬스
    프로덕션DB   크론 실연동   핵심플로우   Rate limit
    env 문서화   stub=FAIL    실제 테스트  에러 추적
     │           │           │           │
     └───────────┴───────────┴───────────┘
     │  미달 → M17(개선) → M13 재구현 (최대 3회)
     │  전수 통과 시 ↓
     ▼
  M16 배포
     │  프로덕션 빌드 + 최종 스모크 + 완료 리포트
     ▼
  ┌─────────────────────────────────────┐
  │            완료                      │
  │                                     │
  │  output/v<N>/.claude/  ← 하네스     │
  │  product/<name>/       ← 프로덕트   │
  │  .checkpoints/         ← 전체 이력  │
  └─────────────────────────────────────┘

---

## 세대 체인 (실제 실행 기록)

```
시드: "Flutter 모바일 앱 개발자"
  │
  ├─→ v1 Flutter (52/70 FAIL)
  │     약점: memory 3, eval 2, cost 7
  │     │
  │     └─→ v2 Flutter (65/70 PASS) ✓
  │           개선: memory 10, eval 9, cost 10
  │           │
  │           └─→ [부트스트래핑] v1-web (64/70 PASS) ✓
  │                 학습 전이: v2의 패턴 자동 적용
  │                 첫 세대에서 바로 통과
  │                 │
  │                 └─→ DailyLoop Web (프로덕트) ✓
  │                       Next.js + Prisma + SQLite
  │                       빌드 PASS, 16/16 테스트
  │
  └─→ [미래] 새 하네스 생성 가능
        bash lib/run.sh "나는 Python 데이터 엔지니어야"
```

---

## 에이전트 구성 (13개)

```
┌─────────────────── Phase 1: 하네스 생성 ───────────────────┐
│                                                            │
│  hm-researcher ─┐                                          │
│  hm-researcher ─┼─→ hm-curator → hm-strategist → hm-builder (x5)
│  hm-researcher ─┘                                          │
│                                                            │
│  hm-validator ─→ 판정 ─→ hm-smoke-tester                   │
│                    │                                       │
│                    └─→ hm-improver (미달 시 → M1 복귀)      │
└────────────────────────────────────────────────────────────┘

┌─────────────────── Phase 2: 프로덕트 생성 ─────────────────┐
│                                                            │
│  hm-planner → hm-designer ─→ hm-design-reviewer (x3)      │
│                                      │                     │
│                    hm-implementer ←──┘                     │
│                         │                                  │
│                    hm-product-reviewer (x6)                │
│                         │                                  │
│                    hm-deployer                             │
└────────────────────────────────────────────────────────────┘
```

---

## 7-Category Audit Rubric

```
┌───────────────────────┬─────┬──────────────────────────────┐
│ 카테고리               │ /10 │ 측정 대상                     │
├───────────────────────┼─────┼──────────────────────────────┤
│ tool_coverage         │ /10 │ allow/deny 명령 범위          │
│ context_efficiency    │ /10 │ CLAUDE.md 간결성 + 스킬 분리  │
│ quality_gates         │ /10 │ TDD + 리뷰 + 검증 파이프라인  │
│ memory_persistence    │ /10 │ SessionStart/Stop + 상태 보존  │
│ eval_coverage         │ /10 │ eval 스킬 + rubric + 회귀감지  │
│ security_guardrails   │ /10 │ deny + guard hooks + SAST     │
│ cost_efficiency       │ /10 │ model routing + haiku 활용률   │
├───────────────────────┼─────┼──────────────────────────────┤
│ TOTAL                 │ /70 │ 통과 기준: 63+ (90%)          │
└───────────────────────┴─────┴──────────────────────────────┘
```

---

## Headless 실행

```bash
# 새 하네스 생성 (완전 무인)
bash lib/run.sh "나는 Django 백엔드 개발자야"

# 하네스 + 프로덕트 생성
bash lib/run.sh "할일 관리 웹 앱 만들어줘" --with-product

# 체크포인트에서 재개
bash lib/run.sh --resume v2

# 실행 흐름:
# run.sh → env-detect.sh → checkpoint 확인 → claude -p (무인)
```

---

## 부트스트래핑 메커니즘

```
생성된 하네스 A
  └── .claude/skills/harness-maker/SKILL.md  ← 자기 자신 포함
         │
         └── /harness-maker "새 스택" → 하네스 B 생성
                └── .claude/skills/harness-maker/SKILL.md
                       │
                       └── /harness-maker "또 다른 스택" → 하네스 C
                              └── ... (무한 자기 복제)

각 자식 하네스는 부모의 audit 결과를 parent_audit으로 물려받아
이전 세대의 약점을 자동으로 보완한다.
```
