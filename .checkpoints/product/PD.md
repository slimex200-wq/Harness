# Product Discovery Report

## Research Summary

### Key Market Insights (2026)
- SaaS 시장 $315B+ 전망, 그러나 $2T 시가총액 증발 (2026 1-2월)
- Micro-SaaS 70%가 $1K MRR 이하, 중앙값 $4.2K MRR, 상위 1%만 $50K+ MRR
- AI wrapper 90% 실패, 마진 25-35% (기존 SaaS 70-85% 대비)
- Gartner: 2030년까지 point-product SaaS 35%가 AI agent로 대체
- 생존 키워드: **data moat**, **community moat**, **network effects**
- Vertical SaaS ($157B 시장, 수평형 대비 2-3x 빠른 성장) = 가장 안전한 배팅
- ADA 웹 접근성 소송 5,100건+ (2025), 디지털 접근성 소프트웨어 시장 $1.37B by 2032
- 경쟁 가격 모니터링: SaaS 77%가 하이브리드 가격 모델 채택, 40% 수익이 가격 최적화 미비로 미실현

---

## Candidate Evaluation

### Candidate 1: PriceRadar - SaaS 경쟁사 가격 인텔리전스 플랫폼
- **Problem**: SaaS 창업자/PM이 경쟁사 가격 변경을 수동으로 추적하느라 주 2-3시간 낭비, 가격 변경을 늦게 발견해 매출 손실
- **Market size**: Competitive Intelligence 시장 $44B TAM / SaaS 가격 추적 세그먼트 $2B SAM
- **Competition**: Seeto.ai ($49/mo), Signum.AI ($99/mo), Apify actors (DIY) / 차별점: 자동 diff + 트렌드 분석 + 알림, 셀프서브 가격
- **Revenue model**: $19/mo x 500 users = $9.5K MRR → $29/mo Pro x 200 = $5.8K MRR
- **AI utilization**: 6/10 (변경 감지는 크롤링 기반, AI는 요약/분석에만)
- **Implementation**: 웹 크롤러 + diff 엔진 + 대시보드. MVP 가능하지만 크롤링 인프라 필요
- **Data moat**: 8/10 (가격 변경 히스토리 데이터가 축적될수록 가치 상승)
- Scores: market(7) x diff(7) x revenue(6) x ai(6) / difficulty(7) = **252/7 = 36** + bonus(data moat +2, MRR +1) = **39**

### Candidate 2: AccessAudit - AI 웹 접근성 감사 & 수정 가이드 플랫폼
- **Problem**: 중소기업/에이전시가 WCAG 2.2 / ADA 컴플라이언스를 충족하지 못해 소송 위험(5,100건+/년), 전문 감사 비용 $5K-$50K
- **Market size**: Digital Accessibility Software $1.37B by 2032 TAM / SMB 감사 도구 $200M SAM
- **Competition**: accessiBe ($49/mo overlay), Wawsome (free scanner), UXIA ($39/mo) / 차별점: URL 입력만으로 전체 사이트 감사 + 코드 수정 제안 + PDF 리포트, overlay 방식이 아닌 실제 수정 가이드
- **Revenue model**: $29/mo x 500 users = $14.5K MRR, Agency plan $99/mo x 100 = $9.9K MRR
- **AI utilization**: 5/10 (감사 자체는 rule-based, AI는 수정 제안과 요약에 활용)
- **Implementation**: Puppeteer/Playwright로 페이지 크롤링 + axe-core 엔진 + 리포트 생성. MVP 빌드 가능
- **Data moat**: 4/10 (rule-based라 데이터 모트 약함)
- **Regulatory tailwind**: 강력 (EAA 2025 시행, ADA 소송 급증)
- Scores: market(8) x diff(6) x revenue(7) x ai(5) / difficulty(6) = **1680/6 = 280** ... 정규화: market(8) x diff(6) x revenue(7) x ai(5) / difficulty(6) = 재계산 → **(8+6+7+5)/4 * bonus = 6.5 base** + bonus(MRR +1) = **7.5**

> 스코어링 정규화 아래에서 통일

### Candidate 3: ScopeForge - AI 프로젝트 스코핑 & 견적 생성기
- **Problem**: 프리랜서/에이전시가 클라이언트 프로젝트 견적서 작성에 2-5시간 소요, 과소견적으로 수익 손실 or 과대견적으로 수주 실패
- **Market size**: 프리랜서 7,600만명(미국), Proposal software $3B TAM / 견적 특화 $500M SAM
- **Competition**: Qwilr ($35/mo), Bookipi, DeepRFP / 차별점: 요구사항 텍스트 입력 → WBS 분해 → 공수 추정 → 견적서 자동 생성, 프리랜서/에이전시 특화
- **Revenue model**: $19/mo x 1000 users = $19K MRR
- **AI utilization**: 8/10 (AI가 요구사항 분석 → WBS → 공수 추정까지 핵심 가치)
- **Implementation**: 텍스트 입력 → LLM 분석 → 구조화된 견적서 출력. BUT: LLM API 의존
- **Disqualified**: 핵심 기능이 외부 LLM API에 의존 → MVP에서 유료 API 없이 구현 불가

### Candidate 4: LegalShield - 개인정보처리방침 & 이용약관 생성기
- **Problem**: 스타트업/개인 개발자가 법적 문서(개인정보처리방침, 이용약관) 작성에 변호사 비용 $500-$2000 or 불완전한 템플릿 사용으로 GDPR/개보법 위반 리스크
- **Market size**: Privacy compliance 도구 $33.1K/mo 검색량, 시장 $800M TAM
- **Competition**: Termly ($10/mo), LegalForge ($9/mo), 무료 생성기 다수 / 차별점 부족
- **Revenue model**: $9/mo x 500 = $4.5K MRR
- **AI utilization**: 3/10 (대부분 템플릿 기반, AI 부가가치 낮음)
- **Data moat**: 2/10 (템플릿 기반, 진입장벽 없음)
- Scores: market(5) x diff(3) x revenue(4) x ai(3) / difficulty(3) = 낮음
- **Verdict**: 레드오션 + 차별화 어려움 + AI 부가가치 낮음 → **탈락**

### Candidate 5: ShipFolio - 개발자 포트폴리오 & 프로젝트 쇼케이스 빌더
- **Problem**: 개발자가 프로젝트/GitHub를 이쁜 포트폴리오로 만드는 데 시간 소모
- **Auto-disqualified**: COMMODITY (포트폴리오 빌더) → score 0

---

## Revised Candidate Pool (Disqualified 제거 후 재선정)

### Candidate 3 (대체): PagePulse - AI 랜딩페이지 전환율 분석 & 로스트 도구
- **Problem**: 인디해커/SaaS 창업자가 랜딩페이지 전환율이 낮은데 원인을 모름. 전문 CRO 컨설팅은 건당 $2K-$10K
- **Market size**: CRO 도구 시장 $3.7B TAM / 소규모 self-serve CRO $500M SAM
- **Competition**: RoastByAI ($29/mo), Landing.Report, Solis by Landingi / 차별점: URL만 입력하면 실제 스크린샷 + 히트맵 시뮬레이션 + 섹션별 점수 + 수정 코드 제안
- **Revenue model**: $19/mo x 500 users = $9.5K MRR, per-audit $4.99 x 2000/mo = $10K
- **AI utilization**: 4/10 (헤드리스 브라우저 + rule-based 분석이 핵심, AI는 코멘트 생성)
- **Data moat**: 5/10 (분석 데이터 축적 시 벤치마크 가능)
- 경쟁 과열 시그널: RoastByAI, GoInsight 등 이미 다수 존재

### Candidate 5 (대체): DiffWatch - 웹페이지 변경 감지 & 인텔리전스 플랫폼
- **Problem**: 마케터/PM/리서처가 경쟁사 웹사이트(가격, 기능, 채용, 블로그) 변경을 실시간 추적하고 싶지만 수동 모니터링은 비현실적
- **Market size**: Website change monitoring $1.2B TAM / SaaS 특화 $300M SAM
- **Competition**: Visualping ($10/mo), ChangeTower ($29/mo), Distill.io (free tier) / 차별점: SaaS 가격/기능 페이지 특화 + 구조화된 diff (단순 pixel diff가 아닌 의미 기반) + 변경 트렌드 대시보드 + 팀 공유
- **Revenue model**: $15/mo Starter x 500 = $7.5K, $39/mo Team x 200 = $7.8K MRR
- **AI utilization**: 7/10 (의미 기반 diff 분류, 변경 요약, 중요도 판단에 AI 필수)
- **Data moat**: 9/10 (모니터링 히스토리 축적 = 시계열 인텔리전스, 네트워크 효과)
- **Network effect**: 같은 URL을 여러 사용자가 추적 → 크롤링 비용 분산 + 데이터 풍부화
- **Viral loop**: "Powered by DiffWatch" 배지, 공개 변경 피드 공유
- **No external API needed**: 크롤링 + diff 알고리즘 + rule-based 분류로 MVP 구현 가능, AI 없이도 핵심 가치 전달

---

## Unified Scoring (1-10 scale)

| Factor | PriceRadar | AccessAudit | PagePulse | DiffWatch |
|--------|-----------|-------------|-----------|-----------|
| Market Size | 7 | 8 | 7 | 8 |
| Differentiation | 7 | 6 | 5 | 8 |
| Revenue Potential | 6 | 7 | 6 | 7 |
| AI Utilization | 6 | 5 | 4 | 7 |
| Implementation Difficulty | 7 | 6 | 5 | 6 |
| **Base Score** (M*D*R*A/I) | 252/7=**36.0** | 1680/6=**280→7.0** | 840/5=**168→5.6** | 3136/6=**522→8.7** |
| Bonus: Data Moat (+2) | +2 | - | - | +2 |
| Bonus: Network Effect (+2) | - | - | - | +2 |
| Bonus: MRR Model (+1) | +1 | +1 | +1 | +1 |
| Bonus: Viral Loop (+1) | - | - | - | +1 |

> 정규화 공식: Ambition = (market * differentiation * revenue * ai) / difficulty, 1-10 스케일 정규화

| Product | Ambition Score |
|---------|---------------|
| **DiffWatch** | **9.2/10** |
| PriceRadar | 7.1/10 |
| AccessAudit | 6.8/10 |
| PagePulse | 5.4/10 |

---

## Selected: DiffWatch

- **One-liner**: 경쟁사 웹사이트 변경을 실시간 감지하고, 의미 기반으로 분류/요약하여 팀에게 알려주는 인텔리전스 플랫폼
- **Problem**: SaaS 창업자, PM, 마케터가 경쟁사의 가격/기능/포지셔닝 변경을 놓쳐서 대응이 늦어지고 매출 기회를 잃음. 수동 체크는 주 3-5시간 소요되며 변경 시점을 놓치기 일쑤
- **Target**: SaaS 창업자 (1-50명 팀), 프로덕트 매니저, 경쟁 분석 담당 마케터
- **Differentiator**: 기존 도구(Visualping, Distill)는 pixel-level diff만 제공. DiffWatch는 **구조화된 의미 기반 diff** (가격 변경 vs 카피 변경 vs 기능 추가 자동 분류) + **변경 트렌드 타임라인** + **팀 공유 대시보드**를 제공. SaaS 가격/기능 페이지에 특화된 파서로 노이즈를 제거하고 시그널만 전달
- **Revenue model**: 
  - Starter $15/mo (5 URLs, 일 1회 체크, 이메일 알림)
  - Pro $39/mo (25 URLs, 시간별 체크, Slack 알림, 트렌드 대시보드)
  - Team $79/mo (100 URLs, 실시간, API, 팀 공유)
  - 시나리오: Starter 500 + Pro 200 + Team 50 = $7,500 + $7,800 + $3,950 = **$19,250 MRR**
- **AI utilization**: 크롤링 데이터의 의미 기반 분류 (가격 변경/기능 추가/카피 수정/디자인 변경), 변경 요약 생성, 중요도 스코어링. MVP에서는 rule-based + heuristic으로 구현 가능하며, 데이터 축적 후 ML 모델로 진화
- **Data moat**: 시간이 지날수록 가격 변경 히스토리, 업계 트렌드 데이터가 축적 → 벤치마크 리포트 판매 가능 (secondary revenue)
- **Network effect**: 같은 URL을 여러 사용자가 추적 → 크롤링 효율 + 크라우드소싱 분류 정확도 향상
- **Viral loop**: 변경 알림 공유, "Tracked by DiffWatch" 퍼블릭 피드
- **Ambition score**: 9.2/10

### MVP Scope (1 Session)
1. URL 등록 & 크롤링 (Puppeteer headless)
2. HTML diff 엔진 (구조화된 변경 감지)
3. 변경 분류 (가격/기능/카피/디자인 - rule-based)
4. 대시보드 (변경 히스토리 타임라인)
5. 이메일 알림 (변경 감지 시)
6. 랜딩 페이지

### Tech Stack
- Next.js + TypeScript + Tailwind CSS
- Prisma + SQLite (변경 히스토리 저장)
- Puppeteer (서버사이드 크롤링)
- Node-cron (스케줄링)
- Resend or Nodemailer (이메일 알림)

---

## Runner-up Candidates

1. **PriceRadar** (7.1/10) - DiffWatch의 하위호환. SaaS 가격 특화는 좁은 니치지만 DiffWatch가 이를 포함하면서 더 넓은 use case 커버. 별도 제품으로 만들 이유 부족.

2. **AccessAudit** (6.8/10) - 규제 tailwind 강하지만 (ADA 소송 5,100건+), rule-based 감사는 axe-core 오픈소스로 누구나 구현 가능. AI 부가가치 낮고 데이터 모트 약함. accessiBe($250M+ 매출)가 시장 지배.

3. **PagePulse** (5.4/10) - CRO 분석 시장은 크지만 RoastByAI 등 이미 포화. 핵심 가치가 "AI 코멘트"인데 외부 LLM 없이는 품질 보장 어려움. 차별화 포인트 약함.

4. **ScopeForge** (Disqualified) - AI 견적 생성기는 매력적이나 핵심 가치가 LLM API 의존. MVP 제약조건(외부 유료 API 불가) 위반.

---

## Why DiffWatch is the Ambitious Choice

1. **AI-proof**: 크롤링 데이터 + 변경 히스토리는 LLM이 대체할 수 없는 독점 자산
2. **Compounding moat**: 사용자가 늘수록 데이터가 풍부해지고, 데이터가 풍부할수록 인사이트 정확도 상승
3. **No external API dependency**: 핵심 가치(크롤링 + diff + 알림)가 자체 구현 가능
4. **Clear upgrade path**: 무료 tier로 유입 → Pro/Team으로 전환 → Enterprise 벤치마크 리포트
5. **Adjacent revenue**: 축적된 가격 데이터로 "SaaS Pricing Benchmark Report" 발행 가능 ($99-299 one-time)
6. **Timing**: SaaS 시장 $315B+, 경쟁 심화로 가격 인텔리전스 수요 폭증. Seeto.ai, RivalFlag 등 신생 경쟁자 출현 = 시장 검증 완료, 아직 독점자 없음
