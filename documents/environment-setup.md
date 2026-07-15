# Singo — 환경설정 현황

*Last updated: 2026-07-15*

---

## 진행 현황

| # | 단계 | 상태 | 확정값 |
|---|------|------|--------|
| 1 | Tracker Boot 프로젝트 | ✅ | 100000283 |
| 2 | GitHub 레포 | ✅ | https://github.com/jisun-ship-it/singo |
| 3 | Netlify 사이트 | ✅ | https://singo-lingo.netlify.app |
| 4 | Slack 봇 설정 | ✅ | 앱 생성 + Bot Token 발급 완료 (.env 저장) |
| 5 | Dev 이름 확정 | ✅ | Dev A = jay, Dev B = mush |
| 6 | Track 파일 생성 | ✅ | dev-jay.md, dev-mush.md |
| 7 | Commands 생성 | ✅ | ready/pr/approve/decline/merge/push-docs + promote.yml |
| 8 | CLAUDE.md 업데이트 | ✅ | Dev 이름·인프라 값 반영 완료 |
| 9 | 검증 | ✅ | ready-jay.command 더블클릭 → Dev 세션 정상 기동 확인 |

---

## 확정된 인프라 값

| 항목 | 값 |
|------|----|
| Tracker Boot | 100000283 |
| GitHub 레포 | https://github.com/jisun-ship-it/singo |
| Netlify 사이트 | https://singo-lingo.netlify.app (production 브랜치 배포 = 프로덕션, main 브랜치 배포 = acceptance: https://main--singo-lingo.netlify.app) |
| Slack Bot Token | — |
| Dev A 이름 | jay |
| Dev B 이름 | mush |

---

## 단계별 상세

### 1. Tracker Boot ✅
프로젝트 번호: 100000283

### 2. GitHub 레포 ✅
- 레포 이름 결정 (제안: `singo`)
- 공개/비공개 여부
- 생성 후 URL 기록

### 3. Netlify 사이트 ✅
- GitHub 레포 연결 완료 (singo-lingo 프로젝트)
- Production URL: https://singo-lingo.netlify.app
- Acceptance URL(main 브랜치 미러): https://main--singo-lingo.netlify.app
- Branch to deploy: production ✅

### 4. Slack 봇 설정 ✅
- Slack App 생성 완료 (api.slack.com, From scratch)
- Bot Token Scopes: channels:history, channels:read, chat:write, im:write
- Bot User OAuth Token 발급 → 로컬 `.env`의 `SLACK_BOT_TOKEN`에 저장 (git-ignored)
- ⚠️ Events API(웹훅 URL) 설정은 보류 — 실제 엔드포인트가 있어야 검증 가능하므로 첫 스토리(#200028978 Slack 연결 & 채널 선택) 개발 시 Dev가 이어서 처리

### 5. Dev 이름 확정 ✅
- Dev A 이름: jay
- Dev B 이름: mush
- track 파일 및 command 파일 이름에 사용됨

### 6. Track 파일 생성 ✅
- `documents/tracks/dev-jay.md`
- `documents/tracks/dev-mush.md`

### 7. Commands 생성 ✅
- `commands/ready-jay.command`, `commands/ready-mush.command`
- `commands/pr.sh`, `commands/pr-title.mjs`
- `commands/approve-jay.command` / `commands/decline-jay.command`
- `commands/approve-mush.command` / `commands/decline-mush.command`
- `commands/merge-jay.command`, `commands/merge-mush.command`
- `commands/ready-guard.mjs`, `commands/_emit-pm-beat.sh`, `commands/promote-target.mjs`
- `commands/push-docs.command`
- `.github/workflows/promote.yml`
- ⚠️ 남은 작업: 로컬에서 `chmod +x commands/*.command commands/*.sh` 실행 + GitHub repo secret `TRACKER_BOOT_API_KEY` 등록 + 커밋/푸시

### 8. CLAUDE.md 업데이트 ✅
- Dev 이름(jay, mush) 반영, `dev-jay 시작` / `dev-mush 시작` 트리거 추가
- GitHub / Deploy URL 기록 완료
- delivery-playbook.md, iteration-plan.md도 함께 갱신

### 9. 검증 ✅
- ready-jay.command 더블클릭 → 워크트리 생성, origin/main 리셋, Dev 세션 기동 확인
- TB API 연결 확인 (tb_get_projects 정상 응답, Singo #100000283 확인)
- push-docs.command·TB repo secret 등록 완료
