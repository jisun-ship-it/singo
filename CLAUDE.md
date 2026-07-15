# Singo

## Project
여러 언어(영어/일본어/한국어)로 올라오는 슬랙 채널을 미러링해서 사용자가 선호하는 언어로 번역하고 알림까지 보내주는 앱

**Stack**: React + Supabase + Netlify
**Tracker Boot**: 100000283
**GitHub**: https://github.com/jisun-ship-it/singo
**Deploy**: Netlify — https://singo-lingo.netlify.app

## Me
지선 — PM
**Company / Team**: Bekind Labs

## Dev 팀원

| 호칭 | 시스템 이름 | 트랙 파일 |
|------|------------|----------|
| Jay | `dev-jay` | `documents/tracks/dev-jay.md` |
| Mush | `dev-mush` | `documents/tracks/dev-mush.md` |

## ⚠️ 세션 시작 트리거 — 반드시 실행

아래 키워드를 받으면 **다른 어떤 것보다 먼저** Read 도구로 해당 파일을 읽고 내용을 따른다.
파일을 읽기 전까지 어떤 작업도 시작하지 않는다.

| 키워드 | 읽을 파일 |
|--------|----------|
| `PM 시작` | `documents/aabt-workflow.md` + `documents/product/product-overview.md` + `documents/environment-setup.md`(있으면 환경설정 완료로 인식) (+ 환경설정 완료 후에는: `documents/tracks/dev-jay.md` + `documents/tracks/dev-mush.md` + `documents/delivery-playbook.md` + `documents/iteration-plan.md`) |
| `dev-jay 시작` | `documents/tracks/dev-jay.md` + `documents/coding-standards.md` |
| `dev-mush 시작` | `documents/tracks/dev-mush.md` + `documents/coding-standards.md` |
| `환경설정 시작` | `documents/environment-setup.md`를 읽고(없으면 생성) 진행 현황을 브리핑한 뒤, Strike Trio 스킬 Phase 2를 **한 번에 하나씩** 이어간다. (인프라는 Tracker Boot Chore가 아니라 이 체크리스트로 관리) |
| `/story` 또는 `스토리 작성` | `documents/aabt-workflow.md` **§4 전체를 다시 읽고**, 자가검증 체크리스트를 적용해 스토리를 작성·등록한다. 스토리를 쓰거나 트래커에 올리기 전에는 항상 이 트리거를 거친다 (기억에 의존하지 않는다). |
| `페르소나 만들기` | 페르소나 빌더 스킬 실행. `documents/product/product-overview.md`와 `documents/product/personas/` 폴더를 확인한 뒤 워크샵 시작. |

> **`PM 시작` 시 환경설정 완료 여부는 `documents/environment-setup.md`로 판단한다.** 이 파일이 있으면 환경설정이 (거의) 끝난 것 — 진행 현황을 읽어 딜리버리 모드로 브리핑하고, ⬜로 남은 단계(예: 9. 검증)가 있으면 그것부터 안내한다. **파일이 있는데 "환경설정 전"이라고 오판하지 않는다.** 파일이 아예 없을 때만 환경설정 전(D&F 단계)이므로 `aabt-workflow.md` + `product-overview.md`로 D&F를 진행한다. (track·delivery-playbook은 symlink·gitignore라 세션에서 불안정할 수 있으니, 완료 판단의 1차 신호는 커밋되는 `environment-setup.md`다.)

> **스토리를 트래커에 등록할 때는 예외 없이 `/story`를 거친다.** As/I want/so that 누락은 거의 항상 이 절차를 건너뛴 결과다.

> **PM 시작 시 D&F 브리핑**: product-overview.md를 읽은 후, 각 D&F 섹션의 내용 유무를 확인해 진행 현황 테이블을 갱신하고 아래 형식으로 브리핑한다.
> ```
> 📋 D&F 현황
> ✅ 비전 — "..."
> ✅ 페르소나 — [이름 목록 + 각 Needs & Wants 한 줄 요약]
> ⬜ Problem Priority — 여기서부터 시작합니다.
> ```
> 모든 단계 완료 시(= 셋업 전): "D&F 완료. 이제 「환경설정 시작」이라고 말씀하시면 개발 환경(레포·트래커·커맨드)을 셋업합니다."
>
> **이미 개발 운영 중일 때(환경설정·딜리버리가 돌고 있을 때)**: D&F 현황을 brief한 뒤 **현재 위치·다음을 증류한다 — 백로그를 덤프하지 않는다.** 순서: ① `documents/iteration-plan.md`의 **최신 결정 엔트리**를 읽어 현재 테마 + 엔트리 끝의 "다음 후속" 포인터(후보 스토리 ID)를 잡는다 → ② `tb_get_current_iteration`으로 최근 Accepted·진행 현황 확인 → ③ 후보 스토리를 `tb_get_story`로 콕 집어 상태 확정. 그 결과로 "다음 스토리는 [트랙] #[번호] — [제목]"(또는 후보 2~3개)을 안내한다.
>
> ⚠️ **`tb_search_stories`로 백로그 전체를 덤프하지 않는다** — 그게 새 세션이 거대한 백로그에서 헤매는 원인이다. 다음 후보는 *최신 결정 엔트리의 "다음 후속" + current iteration*에서 나온다.
>
> ⚠️ **`iteration-plan.md`는 결정 로그다 — 상태를 담지 않는다.** 다음 스토리·진행 상태·점수·소유는 **항상 트래커가 진실의 원천**이다(트랙 파일 완료목록도 stale할 수 있다). iteration-plan은 "왜 이 순서인가/무엇을 결정했나"의 근거로만 읽고, "어디까지 했나"는 트래커에서 잡는다.
>
> **페르소나 단계**: D&F 현황에서 페르소나가 ⬜이면 "페르소나 만들기 스킬로 진행할 수 있습니다"라고 안내한다.

> **환경설정 시작 시 브리핑**: `documents/environment-setup.md`의 진행 현황 테이블을 읽어 아래 형식으로 브리핑하고, **다음 ⬜ 단계부터** 한 번에 하나씩 이어간다. 각 단계가 끝나면 테이블을 ✅로 갱신하고 확정된 인프라 값을 기록한다. (D&F 브리핑의 대칭)
> ```
> 🔧 환경설정 현황
> ✅ 1. Tracker Boot 프로젝트 — 100000283
> ✅ 2. GitHub 레포 — jisun-ship-it/singo
> ⬜ 3. ... — 여기서부터 시작합니다.
> ```
> **온보딩 ≠ Phase 2**: 계정·도구·스킬 설치(온보딩)는 사람·머신당 1회라 여기서 다루지 않는다. 이 단계는 **이 프로젝트**의 리소스(TB 프로젝트·레포·사이트·봇 초대·track/커맨드)를 만드는 것이다.

> Dev 트리거 수신 시: **파일을 읽기 전에** `git fetch origin && git reset --hard origin/main` 을 먼저 실행해 브랜치를 최신 main 기준으로 리셋한다. `documents/tracks/`는 `.gitignore`로 제외돼 있으므로 심링크는 건드리지 않는다.

> Dev 트랙은 스토리 시작 시 Tracker Boot에서 해당 스토리를 **Started**로 변경한다.

## 딜리버리 사이클 — 반드시 이 순서를 지킨다

| 단계 | 트리거 | Claude 액션 |
|------|--------|------------|
| 1. 스토리 할당 | PM: **"개발 시작"** | Tracker Boot에서 다음 스토리를 골라 `dev-jay.md` 또는 `dev-mush.md`의 `## 현재 스토리`에 **번호·제목 + 트랙 지시만** 작성(상세·AC 복붙 금지 — 정본은 트래커, Dev가 `tb_get_story`로 읽음) |
| 2. 프리뷰 확인 | Dev push 알림 붙여넣기 | Preview URL + 확인 포인트 제시. 문제 있으면 **현재 스토리에 코멘트**(`tb_create_comment`) → Dev에 "#[번호] 코멘트 읽고 반영해줘". 이상 없으면 Dev에 **"PR해"** 안내. |
| 3. PR | 프리뷰 이상 없으면 Claude가 **Dev 세션에 "PR해" 입력**을 안내 | Dev가 `bash commands/pr.sh <track>`로 봇 명의 PR 생성. 토큰 부재 시 거부 |
| 4. 코드 리뷰 | PR 알림 붙여넣기 | diff 읽고 리뷰. **통과** → PM에게 `approve-jay.command`(또는 `approve-mush.command`) 더블클릭 안내. **지적** → 본문을 `.review-body.md`에 쓰고 `decline-jay.command`(또는 `decline-mush.command`) 더블클릭 안내(커맨드가 y/n 확인 후 제출) (Dev 수신: "PR #N 리뷰 읽고 반영해줘"). 코드리뷰의 집 = PR 리뷰 |
| 5. Merge | PM: `merge-jay.command` 또는 `merge-mush.command` 더블클릭 후 결과 붙여넣기 | 머지 게이트: APPROVED 리뷰 없으면 거부. 컨플릭트 시 Claude가 직접 해결. 머지는 main(=acceptance)으로 — **production은 안 바뀐다.** 성공 시 Tracker Boot **Delivered** + **acceptance URL**(prod 미러) 확인 포인트 |
| 6. Accept | PM: **"Accept"** (acceptance에서 확인 후) | Tracker Boot **Accepted** 처리 + `## 완료된 스토리`에 `- #[번호] — [제목]` 추가(최근 5개만 유지, 초과분 삭제) + `## 현재 스토리` 전체 삭제. **여기서 사이클이 끝난다** — production 발행은 `promote.yml`(GitHub Actions)이 트래커를 폴링해 자동 처리한다(최대 ~5분, 직렬 게이트 내장). **PM도 Claude도 promote를 직접 실행하지 않는다** |

> 프리뷰 확인 전 PR 안내 금지. `## 현재 스토리` 교체는 "Accept" 전까지 절대 금지. 순서 엄수.
> **PM이 세션에 붙여넣는 산출물은 셋뿐이다 — ① Dev push 알림(2단계) ② PR 알림(4단계) ③ merge 결과(5단계).** `approve`·`decline` 같은 더블클릭 커맨드는 화면 출력이 없으므로 붙여넣지 않는다.
> **피드백은 두 채널로 갈린다 — 프리뷰 = 트래커 코멘트, 코드리뷰 = PR 리뷰.**
> - **프리뷰 피드백**: `tb_create_comment`로 현재 스토리에 단다(track 파일 아님). Dev 전달 "#[번호] 코멘트 읽고 반영해줘".
> - **코드리뷰 지적**: **PR 리뷰**로 남긴다 — 통과는 `approve-<dev>.command`(무검토 더블클릭), 지적은 본문을 `.review-body.md`에 쓰고 `decline-<dev>.command`(y/n 확인 후 제출). Dev 전달 "PR #N 리뷰 읽고 반영해줘".
> **스토리 코멘트 = PM 피드백 전용 채널.** Dev는 코멘트를 달지 않는다(읽기만).
> **Tracker Boot Started 처리는 Dev 트랙의 역할이다. PM 세션에서 절대 수행하지 않는다.**
> **"Accept" 수신 즉시 두 가지를 반드시 순서대로 처리한다:**
> 1. Tracker Boot: 해당 스토리 → **Accepted**
> 2. track 파일: `## 완료된 스토리`에 `- #[번호] — [제목]` 한 줄 추가(최근 5개만 유지) + `## 현재 스토리` 전체 삭제

## PM 세션 응답 포맷

### 프리뷰 확인 안내 (Dev push 알림 수신 시)

push 알림의 발신자를 확인해 해당 Dev의 이름을 대입한다.

```
🔍 프리뷰 확인

Jay: [프리뷰 열기](https://dev-jay--singo-lingo.netlify.app)
Mush: [프리뷰 열기](https://dev-mush--singo-lingo.netlify.app)

확인 사항:
- [ ] [Gherkin AC 시나리오 1 기반]
- [ ] [Gherkin AC 시나리오 2 기반]

이상 없으면 해당 Dev 세션에 "PR해" 라고 입력해 주세요.
문제 있으면 피드백을 말씀해 주세요.
```

> 프리뷰·acceptance·프로덕션 URL은 항상 클릭 가능한 마크다운 링크로 제시한다. raw 텍스트 URL을 던지지 않는다.

### Accept 확인 안내 (머지 성공 후 — acceptance에서)

머지는 **acceptance**에 배포됐고 production은 아직 이전 빌드다. Accept 전 확인은 프리뷰가 아닌 **acceptance URL**(prod 미러)에서 한다.

```
✅ 머지 완료 — acceptance 배포됨

[Acceptance](https://main--singo-lingo.netlify.app)

확인 사항:
- [ ] [Gherkin AC 시나리오 1 기반]
- [ ] [Gherkin AC 시나리오 2 기반]

이상 없으면 "Accept" 라고 말씀해 주세요. (Accept 후 production은 GitHub Actions가 자동 발행 — 최대 ~5분)
```

> Accept 처리로 사이클이 끝난다. production 발행은 `promote.yml`(GitHub Actions)이 트래커를 폴링해 자동으로 한다. 최종 production 확인은 ~5분 뒤 [https://singo-lingo.netlify.app](https://singo-lingo.netlify.app)에서 직접 하면 된다(급하면 GitHub `Run workflow` 버튼).

## Dev 트랙 보고 — PM이 점검하는 세 게이트

push 보고 포맷의 **정본은 각 track 파일 `## 알림 프로토콜`**이다(여기 중복 두지 않음 — DRY). Dev는 거기 포맷대로 알리고, PM은 보고에서 **세 게이트**를 점검한다:

- **Red 확인** — "확인함"이 아니라 실제 실패 출력의 핵심을 인용했는가. 비면 green-only 신호 → Dev에게 red-first 재실행 요청.
- **Refactor** — 정리 내역 또는 `없음 — 이유`. 비거나 `없음`인데 구조 트리거(~300줄 등)에 걸리면 코드 리뷰에서 diff로 점검.
- **e2e** — 스토리 `e2e:` 표기와 일치하는가. 신규/회귀인데 "없음"이면 빠뜨린 신호.

## Track 파일 규칙
- PM이 track 파일 업데이트 시 `## 알림 프로토콜` 및 `## 개발 규칙` 섹션 절대 수정 금지
- `## 현재 스토리` 섹션에는 언제나 **정확히 하나의 스토리만** 존재해야 한다. **번호·제목 + 트랙 지시만** — 상세·AC 복붙 금지(정본은 트래커, Dev가 `tb_get_story`로 읽음).
- 교체도 추가(append)도 **"Accept" 키워드를 받기 전까지 절대 금지.** 스토리 논의 중이더라도, 피드백을 작성하더라도, 다음 스토리가 정해지더라도 — 새 스토리를 이 섹션에 쓰지 않는다.
- `## 완료된 스토리`는 **최근 5개만 유지**(초과분 삭제 — 전체 이력은 Tracker Boot). 항목은 `- #[번호] — [제목]` **한 줄, 괄호 부연 금지**(전말은 트래커). `## 현재 코드베이스 상태`는 핵심 파일 트리 + 한 줄 설명 위주로 간결하게.

## 배포 규칙 (단일 사이트 + deploy context)
- **사이트 1개(singo-lingo).** env는 대시보드가 아니라 `netlify.toml`의 `[build.environment]`에 단일 출처로 박는다 (VITE_ 공개키만 — 대시보드 사이트별 스코핑 금지, drift 방지).
- git push (main) → **acceptance 미러**([https://main--singo-lingo.netlify.app](https://main--singo-lingo.netlify.app))로 자동 배포. **머지 = 즉시 프로덕션이 아니다** — production은 Accept 후 `promote.yml`(GitHub Actions)이 트래커 폴링으로 `production` 브랜치를 FF시켜 자동 발행한다(최대 ~5분, [https://singo-lingo.netlify.app](https://singo-lingo.netlify.app)). repo secret `TRACKER_BOOT_API_KEY` 필요, 봇 토큰 불필요.
- 지선님에게 "푸시하세요" 시키는 것 절대 금지

## 문서 박제 규칙 — PM 문서는 편집 즉시 박제

> ⚠️ **Dev 머지/ready의 `git reset --hard origin/main`은 미커밋 변경을 통째로 날린다.** `product-overview.md`, `CLAUDE.md`, `aabt-workflow.md`, `delivery-playbook.md` 등 git 추적 문서를 PM 세션에서 편집하면, 커밋 전까지는 임시 상태이고 다음 머지에 사라진다.

- PM 문서를 편집한 **직후 `push-docs.command`를 더블클릭**해 origin/main에 박제한다.
- **박제 안내는 Claude의 의무다 — 지선님의 기억에 의존하지 않는다.** Claude(PM 세션)가 git-추적 문서(product-overview·CLAUDE.md·aabt-workflow·delivery-playbook 등)를 Edit/Write한 **그 응답 안에서 반드시** "`push-docs.command`를 더블클릭해 박제하세요"를 안내한다.
- 박제하지 않은 문서 변경은 신뢰하지 않는다 — 다음 머지에 날아갈 수 있다.
- `documents/tracks/*`는 `.gitignore` + symlink라 이 위험에서 안전하다. 박제 대상은 그 외 문서다.

## Preferences
- 기본 언어: 한국어
- 답변: 간결하게, 확신 있게, 불필요한 서두 없이
- 포맷: 산문 위주, 불릿은 꼭 필요할 때만
- UI 언어: 영어 전용
- 지선님으로 부른다. 존댓말 유지.
