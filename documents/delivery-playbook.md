# 딜리버리 플레이북 — Singo

PM 세션에서 Claude와 함께 스토리를 딜리버리하는 플레이북.

> ⚠️ 이 문서의 Dev 이름 관련 세부 내용은 환경설정(Phase 2) 완료 후 확정됩니다. 지금은 전체 흐름만 참고하세요.

---

## 딜리버리 사이클

IPM이 끝난 후 또는 이전 Accept 완료 후, PM이 **"개발 시작"** 이라고 하면 사이클이 시작된다.

### 1단계 — 스토리 할당

Claude가 Tracker Boot 백로그에서 다음 스토리를 골라 각 Dev 트랙 파일(`dev-jay.md` 또는 `dev-mush.md`)의 `## 현재 스토리`에 **번호·제목 + 트랙 지시만** 쓴다. 상세·AC·Gherkin·TDD를 복붙하지 않는다 — **정본은 트래커이고, Dev는 스토리 시작 시 `tb_get_story`로 상세·AC를 읽는다.**

`commands/ready-jay.command` 또는 `commands/ready-mush.command` 를 더블클릭한다. Claude Code가 실행되면서 자동으로 브랜치를 최신 main 기준으로 리셋하고 `dev-jay 시작`(또는 `dev-mush 시작`) 트리거를 전송한다.

Dev 트랙은 자동으로:
- track 파일을 읽고 스토리를 확인한다
- Tracker Boot에서 해당 스토리를 **Started**로 변경한다
- TDD 사이클 시작 (Red → Green → Refactor → Push)
- Push 전 Tracker Boot에서 해당 스토리를 **Finished**로 변경한다

---

### 2단계 — 프리뷰 확인

Dev 트랙이 push 완료 알림을 보내면, PM이 그 메시지를 PM 세션에 붙여넣는다.

Claude가 프리뷰 URL과 확인 포인트를 제시한다. **URL은 반드시 클릭 가능한 마크다운 링크**(`[프리뷰 열기](https://...)`)로 제시한다 — raw 텍스트로 던지지 않는다. PM이 링크를 눌러 확인한다.

- **문제 있으면** → PM이 피드백을 말한다. Claude가 **`tb_create_comment`로 현재 스토리에 코멘트를 단다**(track 파일 아님). PM이 Dev 세션에 **"#[번호] 코멘트 읽고 반영해줘"** 입력.
- **이상 없으면** → Claude가 **Dev 세션에 "PR해" 입력**을 안내한다.

---

### 3단계 — PR 생성 (봇 명의)

PM이 Dev 세션에 **"PR해"**라고 하면, Dev가 `bash commands/pr.sh jay`(또는 `mush`)를 실행해 **봇 계정 명의로** PR을 연다. PR 결과(번호·URL)를 PM 세션에 붙여넣는다.

---

### 4단계 — 코드 리뷰

Claude가 PR diff를 읽고 코드 리뷰를 수행한다. Claude는 verdict(통과/지적)만 판단한다. **남기는 행위는 인간(PM)이 자기 계정으로** 한다.

- **지적** → Claude가 지적 본문을 `.review-body.md`에 작성하고, PM이 **`decline-jay.command`(또는 `decline-mush.command`)를 더블클릭**한다.
- **통과** → PM이 **`approve-jay.command`(또는 `approve-mush.command`)를 더블클릭**해 승인한다.

---

### 5단계 — Merge

PM이 `merge-jay.command` 또는 `merge-mush.command`를 더블클릭하고 결과를 PM 세션에 붙여넣는다.

- **성공** → 머지는 main(= acceptance)으로 간다 — **production은 안 바뀐다.** Tracker Boot에서 **Delivered**로 변경하고, **acceptance URL**(prod 미러)로 확인 포인트를 제시한다.

---

### 6단계 — Accept (acceptance에서) — 사이클의 끝

이상 없으면 PM이 **"Accept"** 라고 말한다. Claude가 즉시:

1. Tracker Boot에서 해당 스토리를 **Accepted**로 업데이트
2. track 파일 업데이트: `## 완료된 스토리`에 한 줄 추가 + `## 현재 스토리` 전체 삭제

**여기서 사이클이 끝난다.** production 발행은 자동이다 — `promote.yml`(GitHub Actions)이 트래커를 폴링하다 Accepted를 감지해 `production` 브랜치를 FF한다(최대 ~5분).

완료. PM이 **"개발 시작"** 이라고 하면 다음 스토리 사이클이 시작된다.

---

## 예외 — 머지 컨플릭트

Dev A와 Dev B가 같은 파일을 건드렸을 때 발생한다.

**처리**: Claude (PM 세션)가 양쪽 브랜치를 읽고, 두 트랙의 변경 의도를 비교해 직접 해결한다.

---

## PM 세션 관리

| 상황 | 조치 |
|------|------|
| 새 이터레이션 시작 | 새 PM 세션으로 교체 |
| 응답 속도가 눈에 띄게 느려질 때 | 즉시 새 PM 세션으로 교체 |

새 세션 시작 시 **"PM 시작"** 입력 → track 파일과 이 문서를 로드해 컨텍스트 복원.

---

## PM 세션 git 원칙

PM 세션 bash sandbox에는 SSH 키가 없다. 아래 원칙을 반드시 지킨다.

- **파일 수정**: Read / Write / Edit 도구만 사용. bash에서 `git commit` 금지.
- **git push**: PM이 터미널에서 직접 실행.
- **git diff (코드 리뷰)**: 워크트리는 `~/Documents/Claude/Worktrees/retreat-jay`(또는 `retreat-mush`)에 있다 — `git diff origin/main...dev-jay` 실행.
- **track 파일**: 심링크로 관리. git push 불필요.
