# Strike Trio Workflow — 팀 운영 플레이북

*Bekind Labs 표준 · Strike Trio*  
*Last updated: 2026-07-01*

---

## Strike Trio

PM 한 명과 AI 에이전트 2명(3인조)이 풀 Balanced Team의 방식으로 일하도록 돕는 스킬. AI를 리드하며 지속적으로 고품질의 소프트웨어를 만드는 AABT를 실천하기 위한 구체적인 프로세스와 도구의 묶음이다.

---

## 이 문서의 목적

Strike Trio 방식으로 프로덕트를 만들 때 따르는 표준 워크플로우. 비전 수립부터 배포까지 모든 단계와 팀 운영 방식을 정의한다. 새 프로젝트를 시작하거나 새 세션을 열 때 이 문서를 읽으면 전체 그림이 보인다.

---

## 1. 팀 구조

### 역할

| 역할 | 담당 | 설명 |
|------|------|------|
| **PM** | 인간 | 제품 방향 결정, 스토리 작성, Accept 판단, 트랙 간 중계 |
| **Dev A** | AI 에이전트 (Claude) | 독립적 영역 전담 개발 |
| **Dev B** | AI 에이전트 (Claude) | 독립적 영역 전담 개발 |

AABT에는 QA 역할이 없다. TDD(유닛 테스트)와 PM Accept가 품질을 보장한다. QA 레인의 부재 자체가 방법론의 메시지다.

### 세션 구조

각 역할은 별도의 Claude 세션에서 운영된다.

- **PM 세션**: Discovery & Framing 전 과정, IPM, 스토리 관리, 프리뷰 확인, 코드 리뷰, Merge 승인
- **Dev A 세션**: `CLAUDE.md`의 `dev-[dev-a-name] 시작` 트리거 → `documents/tracks/dev-[dev-a-name].md`를 읽고 시작
- **Dev B 세션**: `CLAUDE.md`의 `dev-[dev-b-name] 시작` 트리거 → `documents/tracks/dev-[dev-b-name].md`를 읽고 시작

> **규칙**: 각 Dev 세션은 개발 전담. 아키텍처 결정·우선순위 변경이 필요하면 PM에게 물어볼 것.

---

## 2. Discovery & Framing

개발 시작 전 제품의 방향을 정의하는 단계. PM 세션에서 수행.

### 단계 순서

```
비전
  └─ 페르소나
      └─ Problem 탐색
          └─ Problem Priority
              └─ 밸류프로포지션
                  └─ 피처 탐색
                      └─ 피처 Priority
                          └─ 기술 타당성 검토
                              └─ 와이어프레임
                                  └─ 스토리 맵핑
                                      └─ Tracker Boot 백로그

```

### 각 단계 설명

**비전**  
제품이 존재하는 이유. 한 문장으로 표현할 수 있어야 한다.

**페르소나**  
실제로 이 제품을 사용하거나 영향을 받는 사람. 구체적인 대표 인물을 설정한다. "불특정 다수"는 페르소나가 아니다.

> 💡 PM 세션에서 "페르소나 만들기"라고 하면 페르소나 빌더 스킬이 실행됩니다. 결과는 `documents/product/personas/[이름]-draft.md`에 저장되고, 확인 후 product-overview.md에 머지할 수 있습니다.

**Problem 탐색**  
각 페르소나가 겪는 문제를 발산적으로 탐색한다. 솔루션을 생각하기 전에 문제를 충분히 이해한다.

**Problem Priority**  
탐색된 문제 중 이 제품이 집중할 문제를 결정한다. 모든 문제를 풀 수 없다.

**밸류프로포지션**  
형식: `With [제품명], [페르소나]는 [무엇을] 할 수 있다.`  
각 페르소나별로 하나씩 작성.

**피처 탐색**  
밸류프로포지션을 실현하기 위해 필요한 기능을 발산적으로 탐색한다.

**피처 Priority**  
MVP에 포함할 피처와 나중으로 미룰 피처를 결정한다.

**기술 타당성 검토**  
각 피처가 현재 기술 스택과 데이터 소스로 구현 가능한지 확인한다. 불가능하거나 대안이 필요한 항목을 미리 파악한다.

**와이어프레임**  
화면 흐름과 레이아웃을 시각화한다. 디자인이 아니라 구조를 확인하는 용도.

**스토리 맵핑**  
사용자 여정(Activity)을 축으로 유저스토리를 배치한다. 이터레이션 범위를 결정하는 기준이 된다.

**Tracker Boot 백로그**  
스토리 맵에서 도출한 유저스토리를 Tracker Boot에 등록한다. 각 스토리에 Gherkin acceptance criteria 작성 필수.

### D&F 문서 업데이트 규칙

각 단계가 완료될 때마다 Claude가 즉시 아래 두 가지를 수행한다.

1. `documents/product/product-overview.md`의 해당 섹션에 결과를 기록한다.
2. 같은 파일 상단의 **D&F 진행 현황** 테이블에서 해당 단계를 ✅로 갱신하고, 핵심 내용 컬럼을 채운다.

| 단계 | 핵심 내용 컬럼에 기록할 것 |
|------|--------------------------|
| 비전 | 비전 한 문장 |
| 페르소나 | 페르소나 이름 목록 + 각 Needs & Wants 한 줄 요약 |
| Problem 탐색 | 탐색된 문제 수 |
| Problem Priority | 집중하기로 결정한 문제 한 줄 |
| 밸류프로포지션 | VP 한 줄 (페르소나별) |
| 피처 탐색 | 탐색된 피처 수 |
| 피처 Priority | MVP 피처 수 |
| 기술 타당성 검토 | 이슈 항목 수 (없으면 "이슈 없음") |
| 와이어프레임 | 완료 |
| 스토리 맵핑 | 완료 |
| Tracker Boot 백로그 | 등록된 스토리 수 |

---

## 3. Tracker Boot & IPM

### Tracker Boot

Bekind Labs가 만든 유저스토리 + Gherkin AC 관리 트래커. Pivotal Tracker DNA를 이어받아 Strike Trio에 최적화돼 있다. → [trackerboot.com](https://trackerboot.com)

- **스토리 상태 흐름**: Unstarted → Started → Finished → Delivered → Accepted
- **Chore 상태 흐름**: Unstarted → Started → Accepted

### Tobi

Tracker Boot의 AI 봇. IPM 전 스토리 정제에 활약하지만, 언제든 무엇이든 물어볼 수 있다.

🎵 [Tobi Song](https://youtu.be/Vt9iQPDV_iQ?si=qOTtOfwyi4fNg_rB)

### D&F 이후 → 개발 시작 전 흐름

```
스토리 맵핑 완료
  └─ Tracker Boot에 유저스토리 등록
      └─ IPM — 이터레이션 스토리 선택 + 트랙 할당
          └─ 트랙 할당 — PM이 각 Dev 트랙 파일에 스토리 작성
              └─ "개발 시작" → 인프라 셋업 Chore → 개발 시작
```


---

## 4. 유저스토리 작성 표준

### 스토리 형식

**세 파트가 모두 있어야 유효한 스토리다. 하나라도 빠지면 스토리가 아니라 태스크다.**

```
As a [페르소나],
I want to [행동],
so that [가치].
```

각 파트가 하는 역할:

- **As a [페르소나]** — 누구를 위한 스토리인지 명시한다. "사용자"는 페르소나가 아니다. 구체적인 역할이나 이름을 쓴다. 이 파트가 없으면 누구를 위한 기능인지 알 수 없다.
- **I want to [행동]** — 페르소나가 하고 싶은 것. 구현 방법이 아니라 사용자 행동을 쓴다. "버튼을 추가한다"가 아니라 "예약을 수정한다".
- **so that [가치]** — 이 기능이 왜 필요한지. 이 파트가 없으면 기능 요청이 비즈니스 가치와 단절된다. 우선순위 판단도 불가능해진다.

**나쁜 예 (태스크)**
```
로그인 버튼 추가
사용자가 로그인할 수 있게 OAuth를 연동한다
```

**좋은 예 (스토리)**
```
As a 게스트,
I want to log in with my email,
so that I can access my reservation history.
```

### INVEST 기준

좋은 스토리는 아래 기준을 충족한다.

- **I**ndependent — 다른 스토리와 독립적으로 구현 가능
- **N**egotiable — 방법은 협의 가능, 가치는 고정
- **V**aluable — 페르소나에게 명확한 가치 전달
- **E**stimable — 개발자가 크기를 가늠할 수 있음
- **S**mall — 한 이터레이션 안에 완료 가능
- **T**estable — 완료 조건이 명확함

### Gherkin Acceptance Criteria

스토리마다 Gherkin 시나리오로 AC를 작성한다. 스토리가 완료됐다고 판단하는 기준.

```gherkin
Feature: [기능명]

  Scenario: [정상 케이스]
    Given [사전 조건]
    When [사용자 행동 — 하나만]
    Then [눈에 보이는 결과]

  Scenario: [예외 케이스]
    Given [사전 조건]
    When [사용자 행동]
    Then [기대 결과]
```

**작성 원칙**: Given은 시스템 상태, When은 단일 행동, Then은 눈에 보이는 결과. 구현 방법이 아닌 행동과 결과로 작성.

### 스토리 타입

| 타입 | 설명 | Tracker Boot 상태 흐름 |
|------|------|----------------------|
| Feature | 새 기능 | Unstarted → Started → Finished → Delivered → Accepted |
| Bug | 버그 수정 | Unstarted → Started → Finished → Delivered → Accepted |
| Chore | 기술 작업 (설정, 리팩터 등) | Unstarted → Started → Accepted |

### 스토리 작성 절차 — `/story`

> **스토리를 쓰거나 트래커에 등록하기 직전에는 반드시 이 절차를 거친다.** D&F가 끝나기까지, 또는 개발 도중에는 위 작성 규칙이 컨텍스트에서 멀어져 잊히기 쉽다. 그러니 스토리를 쓸 때마다 이 섹션(§4 전체)을 **다시 읽고** 아래 체크리스트를 적용한다. 기억에 의존하지 않는다.

**1. 초안 작성** — As a / I want to / so that 세 파트로 쓴다.

**2. 자가검증 체크리스트** — 등록 전 스스로 확인한다. 하나라도 미충족이면 고친 뒤 등록한다.
- [ ] **As a [페르소나]** — 구체적 페르소나인가? ("사용자"는 페르소나가 아니다)
- [ ] **I want to [행동]** — 구현 방법이 아니라 사용자 행동인가?
- [ ] **so that [가치]** — 비즈니스 가치가 명시됐는가?
- [ ] **INVEST** — 특히 **S**mall(한 이터레이션 안에 완료)·**T**estable(Gherkin AC로 표현 가능)?
- [ ] **Gherkin AC** — 최소 1개 시나리오를 작성했는가?
- [ ] **e2e 판단** — `product-overview.md`의 **Critical Paths** 목록과 이 스토리를 대조한다. "이 스토리가 어떤 critical path를 **새로 잇거나 그 동작을 바꾸는가?**" 판단 결과를 스토리의 `e2e:` 필드에 표기하고, **근거와 함께 PM에게 제안해 확인받는다.** (자세한 규칙 ↓)

**e2e 판단 — 위임 구조**: 스토리는 PM이 직접 쓰지 않고 Claude가 쓴다. 그러니 e2e 여부도 Claude가 정하되, **추론이 아니라 대조로** 정한다 — Critical Paths 목록이 그 기준점이다(없으면 판단 근거가 없어 항상 "안 함"으로 흐른다). Claude는 대조 결과를 세 값 중 하나로 **제안**하고 근거를 보인다. PM이 확인·수정한다(HITL).

> **애매할 때의 안전판은 "e2e 쪽으로 기우는 것"이 아니라 "PM에게 묻는 것"이다.** 과잉 처방(애매하면 무조건 e2e)은 우리가 탈출한 "죽은 필수 조항"을 다시 부른다. 그러니 Claude는 단독으로 e2e를 늘리지 말고, 판단이 안 서면 PM 확인을 받는다.
- `e2e: 신규 — [경로]` — 이 스토리가 critical path를 **처음 끝-끝 잇는다.** Dev가 그 경로 e2e를 red-first로 작성.
- `e2e: 회귀 — [경로]` — 기존 critical path의 동작을 **건드린다.** push 전 기존 e2e 스위트 통과 확인(새로 안 씀).
- `e2e: 없음 — [이유]` — 어떤 critical path도 안 지난다(순수 로직·격리 UI 등). 유닛만.

**3. 트래커 등록** — `tb_create_story`로 **Pre-IPM**에 등록한다. Why(설명) 섹션에 세 파트를 그대로 넣는다. 자가검증을 통과한 스토리만 올린다.

**4. 토비 리뷰** — 토비는 *교정*이 아니라 *검증* 역할이다. 자가검증을 통과한 스토리만 올라오므로 토비가 같은 지적(As/I want/so that 누락 등)을 반복할 일이 줄어든다.

#### 초안 → 등록 → 리뷰 플로우 (스토리맵핑 이후)

스토리맵핑에서 도출한 스토리는 한꺼번에 토비에게 떠넘기지 않는다. 단위가 부정확하면 토비 리뷰 부담만 커진다.

1. 도출한 스토리를 **초안**으로 작성하고 자가검증을 거친다.
2. **Pre-IPM**에 등록하고 토비 리뷰를 받는다.
3. 토비 지적은 PM 트랙으로 가져와 논의 → 수정 확정 → 토비에 재전달.
4. Pre-IPM이 끝나면 **IPM**에서 하나씩 Estimate하고 백로그로 옮긴다.

---

## 5. 개발 사이클 — TDD Red-Green-Refactor

### 순서 엄수

```
1. Gherkin AC 확인 (PM이 작성, Dev가 숙지)
2. 테스트 작성 → 구현 없이 npm test 실행 → 올바른 이유로 실패하는지 확인 (Red)
3. 최소한의 코드로 테스트 통과 (Green)
4. 코드 정리 (Refactor)
5. 다음 시나리오로
```

스토리 하나씩 진행. 동시에 여러 스토리 Started 금지.

### Red는 올바른 이유로 실패해야 한다

2단계의 Red를 건너뛰지 않는다. 테스트와 구현을 같이 써놓고 그제서야 실행하는 green-only는 "테스트에 이빨이 있다"는 증명을 통째로 건너뛴다 — "통과"가 공허해진다. AABT엔 QA 레인이 없어 품질이 TDD + PM Accept 두 다리로 서므로, 이빨이 증명 안 된 테스트는 품질의 한 다리를 비검증 상태로 둔다.

- 구현 **전에** 테스트를 돌려 실패를 확인한다.
- 그 실패는 **assertion이 검사하는 동작 때문**이어야 한다. 구현이 비어서 뜬 빨강(= "아직 구현 안 됨")은 이빨 증명이 아니다.
- 구현 없이 첫 실행부터 통과하면 그 테스트는 의심 대상이다 — 코드가 아니라 테스트를 고친다.
- AI에게 이 빨강은 타이핑·사고 비용이 없어 거의 공짜다. 건너뛸 이유가 없다.

세부 기준은 `documents/coding-standards.md`의 "Why Red matters" 참조.

### Refactor를 건너뛰지 않는다 — `Refactor 한 줄` 게이트

Red 생략(green-only)과 짝이 되는 누수가 **Refactor 생략(green-stop)**이다. AI는 "테스트 통과 = 완료"로 보고 Green에서 멈추기 쉽다. Red 확인이 빨강을 가시화하듯, Refactor도 매 사이클 가시화해 건너뛰기를 드러낸다.

- **push 보고에 `Refactor 한 줄`을 싣는다.** 이번 사이클에 무엇을 정리했나(이름·추출·중복 제거·파일 분해 등). 손댈 게 없었으면 `없음 — [이유]`. 비어 있으면 green-stop을 정직하게 드러내는 신호 → PM이 구조 점검을 요청한다.
- **단, 보고 줄은 약한 장치다.** "X를 추출했다"는 적기 쉽고 실제 구조 품질은 그 줄로 증명되지 않는다(Red 확인이 실패 메시지를 인용해 날조 비용이 있던 것과 다르다). 그러니 **진짜 검증은 PM 코드 리뷰(딜리버리 4단계)에서 diff를 보는 것**이다 — 보고는 의식하게 하고, 코드 리뷰가 실제로 잡는다. 둘이 짝이다.
- **`없음`도 정당한 답이다.** 깨끗한 코드를 억지로 건드리게 만드는 게 목적이 아니다(과잉 처방 경계). 다만 ~300줄을 넘긴 컴포넌트 등 coding-standards의 구조 트리거에 걸리면 "없음"은 성립하지 않는다.

세부 기준은 `documents/coding-standards.md`의 "Green is not the end of the cycle" 참조.

### 커밋 메시지 컨벤션

TDD 사이클과 Mitte!Beat 시각화를 위해 아래 프리픽스를 반드시 사용한다.

```
test:     테스트 코드 작성 (Red)
feat:     새 기능 구현 (Green)
fix:      버그 수정 (Green)
refactor: 코드 정리 (Refactor)
chore:    설정, 빌드, 인프라
```

**커밋 형식**: `[타입]: [설명] (#[스토리번호])`  
예시: `feat: update calendar event on guest edit (#200023982)`

### 테스트 — 유닛과 e2e의 시점·조건이 다르다

**품질은 세 다리로 선다 — 유닛 TDD + 코드 리뷰 + PM Accept.** e2e는 이 셋 위에 얹는 **가장 얇은 층**이다(대부분의 스토리는 AC를 유닛에서 검증한다). e2e를 많이 쌓으면 느리고 깨지기 쉬운 "아이스크림콘 안티패턴"으로 뒤집힌다 — 테스트 트로피/피라미드가 권하는 비율은 유닛 多 · e2e 少다. (근거: Google "Just Say No to More End-to-End Tests", Martin Fowler test pyramid, Kent C. Dodds testing trophy, DHH.)

**유닛 테스트** (`{{UNIT_RUNNER}}`, 예: Vitest/Jest/pytest): TDD Red-Green-Refactor 사이클. **모든 커밋 전** 전체 통과 확인 — 무조건, 빠르다.

**e2e 테스트** (`{{E2E_TOOL}}`, 예: Playwright/Cypress/Cucumber): 사용자 여정이 끝-끝 실제로 작동하는지 검증(라우팅·실 DB·브라우저·realtime 등 유닛이 못 보는 통합 지점). 느리므로 매 커밋이 아니라 **push 직전 1회**, 그리고 **모든 스토리가 아니라 critical path를 건드리는 스토리에서만** 돈다.

> **글루 레이어 여부는 테넌트가 저울질할 트레이드오프다 — 방법론이 처방하지 않는다.** Cucumber처럼 Gherkin↔코드 글루를 까는 길과 글루 없이 `{{E2E_TOOL}}`를 단독으로 쓰는 길은 각각 값과 비용이 있다. 한쪽은 **DRY** — AC의 정본은 Tracker Boot 스토리인데 글루를 깔면 Gherkin이 코드에도 중복된다. 다른 쪽은 **실행 가능한 living spec** — 시나리오가 코드와 직결돼 살아 움직이고, BDD가 방법론의 표준 언어라는 점과도 정합한다(Cucumber는 Gherkin의 네이티브 실행기다). e2e가 소수인 프로젝트엔 글루 없는 단독이 가벼운 경우가 많지만, 이는 **상황 판단**이지 규칙이 아니다. 도구도 글루 여부도 테넌트가 고른다 — 스킬은 `{{E2E_TOOL}}` 플레이스홀더로 그 선택을 보장할 뿐, 어느 도구로도 몰지 않는다.

- **시점**: push 전(원격으로 내보내기 직전). 커밋이 아니다 — 커밋은 잦은 로컬 체크포인트라 느린 e2e에 안 맞는다.
- **조건**: 스토리의 `e2e:` 표기를 따른다. `신규`면 그 경로 e2e를 red-first로 작성, `회귀`면 기존 스위트 통과 확인, `없음`이면 안 돌린다.
- **단위**: 스토리당이 아니라 **critical path당 1개.** 새 경로를 잇는 스토리에서만 작성하고, 그 경로를 건드리는 후속 스토리는 기존 e2e가 회귀 가드.
- **판단 기준**: `product-overview.md`의 Critical Paths 목록(§4 e2e 판단 참조).
- **배포 후 레그**: 자동 e2e는 **push 전까지만**이다. 배포 후 검증은 자동 e2e가 아니라 **PM Accept**(머지 후 프로덕션 URL 수동 확인, 딜리버리 6단계)가 담당한다. 즉 "자동 e2e = push 전 / 배포 후 = PM Accept" — 둘은 다른 레그다.
- **신규 e2e인데 인프라가 없으면**: 기능 스토리에 e2e 인프라 셋업까지 욱여넣지 않는다. 인프라(+첫 스모크)는 **별도 Chore로 분리**해 기능 스토리 비대화를 막는다.

> **개발 중 되먹임**: Dev가 작업하다 "e2e 없음으로 표기됐는데 실제로는 critical path를 건드리더라"를 발견하면, **PM에게 알린다.** PM은 (1) 스토리의 `e2e:` 표기를 고치고, (2) 그게 **새 critical path 발견**이면 `product-overview.md`의 Critical Paths 목록도 갱신한 뒤 `push-docs.command`로 박제한다. 스토리 필드만 고치고 마스터 목록을 안 키우면 다음 스토리에서 같은 누락이 반복된다.

---

## 6. 프로젝트 폴더 구조 표준

```
[project-name]/
  CLAUDE.md                        ← 세션 시작 트리거 포함
  documents/
    aabt-workflow.md               ← 이 파일
    delivery-playbook.md           ← 딜리버리 사이클
    coding-standards.md            ← 코딩 표준
    glossary.md                    ← 프로젝트 용어 정의
    iteration-plan.md              ← 결정 로그
    product/
      product-overview.md          ← 비전·페르소나·VP·Critical Paths
    tracks/
      dev-[dev-a-name].md          ← Dev A 지시 (PM 작성, symlink)
      dev-[dev-b-name].md          ← Dev B 지시 (PM 작성, symlink)
  src/                             ← 소스코드
  tests/
    unit/
    e2e/
  commands/
    ready-[dev-a-name].command     ← Dev 세션 시작 (트랙별)
    ready-[dev-b-name].command
    pr.sh                          ← 봇 명의 PR 생성
    approve-[dev].command / decline-[dev].command  ← 코드리뷰 게이트
    merge-[dev].command            ← approve 게이트 포함 머지
    push-docs.command              ← PM 문서 박제
  .github/workflows/
    promote.yml                    ← Accept 후 production 자동 발행
```

---

*이 문서는 Bekind Labs AABT 방법론의 운영 표준입니다. 프로젝트마다 필요에 따라 확장하되, 핵심 원칙(TDD, PM Accept, 트랙 독립성)은 유지합니다.*
