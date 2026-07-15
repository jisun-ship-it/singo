# Glossary — Singo

프로젝트에서 사용하는 용어 정의. AI 에이전트와 팀 공통 언어.

---

## Product Terms

| Term | Definition |
|------|------------|
| *(프로젝트 고유 용어를 여기에 추가)* | |

---

## Methodology Terms

| Term | Definition |
|------|------------|
| **XP** | Extreme Programming — TDD, 지속적 통합 등의 실천법 묶음 |
| **BDD** | Behavior-Driven Development — Gherkin으로 acceptance criteria 작성, 테스트와 직결 |
| **TDD** | Test-Driven Development — 테스트 먼저(Red) → 구현(Green) → 리팩터링(Refactor) |
| **Gherkin** | BDD 시나리오 작성 언어. Feature / Scenario / Given / When / Then 구조 |
| **Acceptance Criteria (AC)** | 스토리가 완료됐다고 판단하는 조건. Gherkin으로 작성 |
| **Red-Green-Refactor** | TDD 사이클: 실패하는 테스트 작성 → 통과하게 구현 → 코드 개선 |
| **Tracker Boot** | Bekind Labs가 만든 유저스토리 + Gherkin AC 관리 트래커. 핵심 철학은 "쓰는 것만으로 배운다" — 스토리를 쓰는 행위가 "누구를 위해, 무엇을, 왜"를 훈련시키고, Gherkin AC를 쓰는 행위가 완료 기준을 명확히 만든다. |
| **Tobi** | Tracker Boot의 AI 봇. 팀과 제품의 건강을 책임진다. 스토리가 INVEST 기준에 맞는지 검토하고, Gherkin AC 초안 작성을 돕고, 스토리 범위가 너무 크면 분리를 제안하고, 모호한 요구사항을 구체적인 시나리오로 변환한다. |

## Discovery & Framing

| Term | Definition |
|------|------------|
| **비전** | 제품이 존재하는 이유. 한 문장으로 표현. |
| **페르소나** | 제품을 사용하거나 영향을 받는 실제 인물 유형 |
| **Problem 탐색** | 각 페르소나가 겪는 문제를 발산적으로 탐색하는 단계 |
| **Problem Priority** | 탐색된 문제 중 이 제품이 집중할 문제를 결정하는 단계 |
| **밸류프로포지션** | "With [제품], [페르소나]는 [무엇을] 할 수 있다" 형식의 가치 선언 |
| **피처 탐색** | 밸류프로포지션을 실현하기 위한 기능을 발산적으로 탐색하는 단계 |
| **피처 Priority** | MVP에 포함할 피처와 나중으로 미룰 피처를 결정하는 단계 |
| **기술 타당성 검토** | 각 피처가 현재 기술 스택으로 구현 가능한지 확인하는 단계 |
| **와이어프레임** | 화면 흐름과 레이아웃을 시각화하는 단계. 디자인이 아닌 구조 확인 용도 |
| **스토리 맵핑** | 사용자 여정을 축으로 유저스토리를 배치하는 단계 |
| **Tracker Boot 백로그** | 스토리 맵에서 도출한 유저스토리를 Tracker Boot에 등록하는 단계 |
| **IPM** | Iteration Planning Meeting — 이터레이션 스토리 선택 및 트랙 할당 |

## Company Terms

| Term | Definition |
|------|------------|
| **Bekind Labs** | Pivotal Labs의 DNA를 이어받은 소프트웨어 개발사 및 애자일 컨설팅 펌. 코어 밸류: **Do the right thing. Do what works. Always be kind.** 단순한 슬로건이 아니라 일하는 방식 그 자체다. 방법론: Balanced Team, XP, UCD를 기반으로, AI 시대에 맞게 진화시킨 AI-Augmented Balanced Team(AABT)과 Strike Trio의 창시자. |
| **Strike Trio** | PM 한 명과 AI 에이전트 2명(3인조)이 풀 Balanced Team의 방식으로 일하도록 돕는 스킬. 빈 폴더에서 D&F부터 배포까지, AI를 리드하며 고품질 소프트웨어를 지속적으로 만드는 AABT를 실천하기 위한 구체적인 프로세스와 도구의 묶음. |
| **AABT** | AI-Augmented Balanced Team — AI가 팀원으로 참여하는 Balanced Team 변형 |
| **Balanced Team** | PM·디자이너·엔지니어 + 고객이 한 팀으로 움직이는 방식 |
| **HITL** | Human-in-the-Loop — AI 작업에 인간 판단이 개입하는 구조 |
